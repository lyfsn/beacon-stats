<template>
  <v-theme-provider theme="dark" with-background class="pa-10" id="inspire">
    <v-card title="Beacon Stats" subtitle="Endurance Devnet"></v-card>
    <br>
    <v-table theme="dark" density="compact" class="data-table">
      <thead>
        <tr>
          <th class="text-left" v-for="header in headers" :key="header.value" :style="{ width: header.width }">
            {{ header.title }}
          </th>
          <th>Latest Update</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items  " :key="item.name"
          :class="{ 'updated-item': item.updated, 'warn-row': checkWarnRow(item), 'missing-data': checkMissingData(item) }">
          <td v-for="header in headers  " :key="header.value" :class="{
            'warn-value': !checkMissingData(item) &&
              item[header.value] !== false &&
              ['isSyncing', 'isOptimistic', 'elOffline'].includes(header.value),
            'state-sync-value': header.value == 'oldestBlockSlot' && item[header.value] != 0 && item[header.value] != undefined
          }">
            {{ header.value === 'peerID' ? simplifyPeerID(item[header.value]) : item[header.value] }}
          </td>
          <td>
            <v-progress-linear :model-value="item.progress" reverse></v-progress-linear>
          </td>
        </tr>
      </tbody>
    </v-table>
    <br>
  </v-theme-provider>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const headers = ref([
      { title: "Name", value: "name", width: "200px" },
      { title: "URL", value: "url" },
      { title: "Version", value: "version", width: "300px" },
      { title: "Peer ID", value: "peerID", },
      { title: "Peers Count", value: "peerCount" },
      { title: "Inbound", value: "inbound" },
      { title: "Outbound", value: "outbound" },
      { title: "Head Slot", value: "headSlot" },
      { title: "Syncing", value: "isSyncing" },
      { title: "Optimistic", value: "isOptimistic" },
      { title: "El Offline", value: "elOffline" },
      { title: "Oldest Block Slot", value: "oldestBlockSlot" },
      { title: "State Lower Limit", value: "stateLowerLimit" },
    ]);
    const items = ref([]);

    let ws;
    onMounted(() => {
      ws = new WebSocket(`ws://${import.meta.env.VITE_IP_ADDRESS}:8050/ws`);

      ws.onopen = () => {
        ws.send('start');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'data') {
          const newData = { ...message.data, progress: 100 };
          const index = items.value.findIndex(item => item.name === newData.name);

          if (index !== -1) {
            items.value[index] = { ...newData, updated: true };
            setTimeout(() => {
              if (items.value[index]) {
                items.value[index].updated = false;
              }
            }, 500);

            let progressInterval = 1000;
            let totalDuration = 15000;
            let decrement = 100 / (totalDuration / progressInterval);

            let progressTimer = setInterval(() => {
              if (items.value[index].progress > 0) {
                items.value[index].progress -= decrement;
              } else {
                clearInterval(progressTimer);
                items.value[index].progress = 0;
              }
            }, progressInterval);
          } else {
            items.value.push({ ...newData, updated: false });
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    });

    const checkWarnRow = (item) => {
      return Object.keys(item).some(key => item[key] !== false && ['isSyncing', 'isOptimistic', 'elOffline'].includes(key));
    };

    const checkMissingData = (item) => {
      return headers.value.some(header => !['name', 'url'].includes(header.value) && item[header.value] === undefined);
    };

    const simplifyPeerID = (peerID) => {
      if (peerID && peerID.length > 8) {
        return `${peerID.substr(0, 4)}...${peerID.substr(-4)}`;
      }
      return peerID;
    }

    return {
      headers,
      items,
      checkWarnRow,
      checkMissingData,
      simplifyPeerID
    };
  },

}
</script>

<style>
#inspire {
  height: 100%;
}

.updated-item {
  transition: background-color 0.5s ease;
  color: yellow;
}

.data-table th,
.data-table td {
  font-size: 12px;
}

.warn-value:not(.missing-data) {
  color: red !important;
  border: 2px solid red;
  border-radius: 5px;
}

.warn-value {
  border-style: solid !important;
  border-width: 2px !important;
  border-color: green !important;
}

.warn-row td:not(.missing-data) {
  color: #73e673;
}

.missing-data td {
  color: #add8e6;
}

.state-sync-value {
  border-style: solid !important;
  border-width: 2px !important;
  border-color: gray !important;
}
</style>
