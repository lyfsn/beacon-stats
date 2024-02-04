<template>
  <v-theme-provider theme="dark" with-background class="pa-10">
    <v-card title="Beacon Stats" subtitle="Endurance Devnet"></v-card>
    <br>
    <v-table theme="dark" density="compact" class="data-table">
      <thead>
        <tr>
          <th class="text-left" v-for="header in headers" :key="header.value">{{ header.title }}</th>
          <th>Data Update</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.name"
          :class="{ 'updated-item': item.updated, 'warn-row': checkWarnRow(item), 'missing-data': checkMissingData(item) }">
          <td v-for="header in headers" :key="header.value"
            :class="{ 'warn-value': !checkMissingData(item) && item[header.value] !== false && ['isSyncing', 'isOptimistic', 'elOffline'].includes(header.value) }">
            {{ item[header.value] }}</td>
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
      { title: "Name", value: "name" },
      { title: "URL", value: "url" },
      { title: "Version", value: "version" },
      { title: "Peer ID", value: "peerID" },
      { title: "Peers Count", value: "peerCount" },
      { title: "Inbound", value: "inbound" },
      { title: "Outbound", value: "outbound" },
      { title: "Head Slot", value: "headSlot" },
      { title: "Syncing", value: "isSyncing" },
      { title: "Optimistic", value: "isOptimistic" },
      { title: "El Offline", value: "elOffline" },
    ]);
    const items = ref([]);

    let ws;
    onMounted(() => {
      ws = new WebSocket(`ws://${import.meta.env.VITE_IP_ADDRESS}:8080/ws`);

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
            let totalDuration = 10000;
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

    return {
      headers,
      items,
      checkWarnRow,
      checkMissingData,
    };
  },
}
</script>

<style>
.updated-item {
  transition: background-color 0.5s ease;
  color: yellow;
}

.data-table th,
.data-table td {
  font-size: 12px;
}

/* Apply the border only when warn-value is true and not overridden by missing-data */
.warn-value:not(.missing-data) {
  color: red !important; 
  border: 1px dashed red; 
  border-radius: 5px;
}

/* Define the warn-row text color, modified to be more fitting for the dark theme */
.warn-row td:not(.missing-data) {
  color: #73e673; /* Adjusted green for better visibility */
}

/* Define the missing-data text color */
.missing-data td {
  color: #add8e6; /* Adjusted blue for better visibility */
}


</style>
