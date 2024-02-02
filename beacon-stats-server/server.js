const fastify = require("fastify")({ logger: true });
const axios = require("axios");
const { nodes } = require("./config.js");

fastify.register(require("@fastify/cors"), { origin: true });
fastify.register(require("@fastify/websocket"));

async function sendHeaders(connection) {
  const headers = [
    { title: "Identifier", value: "identifier" },
    { title: "URL", value: "url" },
    { title: "Peers Count", value: "peers" },
  ];
  connection.socket.send(JSON.stringify({ type: "headers", data: headers }));
}

async function sendData(connection, includePeers = true) {
  for (const [name, baseUrl] of Object.entries(nodes)) {
    let data = {
      type: "data",
      data: {
        identifier: name,
        url: baseUrl,
        updated: true,
      },
    };
    if (includePeers) {
      try {
        const response = await axios.get(`${baseUrl}/eth/v1/node/peer_count`);
        data.data.peers = response.data.data.connected || "No data";
      } catch (error) {
        console.error(`Error fetching peers from ${name}:`, error);
        data.data.peers = "Error fetching data";
      }
    }
    connection.socket.send(JSON.stringify(data));
  }
}

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    connection.socket.on("message", async (message) => {
      const messageStr = message.toString();
      if (messageStr === "start") {
        await sendHeaders(connection);
        await sendData(connection, false);
        await sendData(connection, true);
        const intervalId = setInterval(() => sendData(connection, true), 10000);

        connection.socket.on("close", () => clearInterval(intervalId));
      }
    });
  });
});

const start = async () => {
  try {
    await fastify.listen({
      port: 8080,
      listenTextResolver: (address) => `Server is listening at ${address}`,
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
