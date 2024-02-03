const fastify = require("fastify")({ logger: true });
const axios = require("axios");
const fs = require("fs");
const yaml = require("js-yaml");

const config = yaml.load(fs.readFileSync("./config.yml", "utf8"));

fastify.register(require("@fastify/cors"), { origin: true });
fastify.register(require("@fastify/websocket"));

let nodesData = {};
const nodeUpdateInterval = config.refreshInterval || 10000; // Added to config.yml

async function fetchDataForNode(name, baseUrl) {
  try {
    const [version, peerCountResponse, peers, identityResponse, syncInfo] = await Promise.all([
      axios.get(`${baseUrl}/eth/v1/node/version`),
      axios.get(`${baseUrl}/eth/v1/node/peer_count`),
      axios.get(`${baseUrl}/eth/v1/node/peers`),
      axios.get(`${baseUrl}/eth/v1/node/identity`),
      axios.get(`${baseUrl}/eth/v1/node/syncing`),
    ]);

    let inbound = 0, outbound = 0, peersIDs = peers.data.data.filter(peer => peer.state == "connected").map(peer => {
      peer.direction == "inbound" ? inbound++ : outbound++;
      return peer.peer_id;
    });

    return {
      name,
      url: baseUrl,
      updated: true,
      version: version.data.data.version,
      peerCount: peerCountResponse.data.data.connected,
      peersIDs,
      inbound,
      outbound,
      peerID: identityResponse.data.data.peer_id,
      headSlot: syncInfo.data.data.head_slot,
      isSyncing: syncInfo.data.data.is_syncing,
      isOptimistic: syncInfo.data.data.is_optimistic,
      elOffline: syncInfo.data.data.el_offline,
    };
  } catch (error) {
    console.error(`Error fetching data from ${name} at ${baseUrl}:`, error);
    return {
      name,
      url: baseUrl,
      updated: false,
      error: "Error fetching data",
    };
  }
}

async function sendData(connection, includeData = true) {
  const updates = Object.entries(config.nodes).map(async ([name, baseUrl]) => {
    if (includeData || !nodesData[name]) {
      const data = await fetchDataForNode(name, baseUrl);
      nodesData[name] = { type: "data", data };
      connection.socket.send(JSON.stringify(nodesData[name]));
    } else if (nodesData[name]) {
      connection.socket.send(JSON.stringify(nodesData[name]));
    }
  });

  await Promise.all(updates);
}

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    connection.socket.on("message", async (message) => {
      const messageStr = message.toString();
      if (messageStr === "start") {
        await sendData(connection, false);
        await sendData(connection, true);
        const intervalId = setInterval(() => sendData(connection, true), nodeUpdateInterval);

        connection.socket.on("close", () => clearInterval(intervalId));
      }
    });
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 8080, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
