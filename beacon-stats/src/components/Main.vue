
<template>
  <v-theme-provider theme="dark" with-background class="pa-10 h-screen">
    <v-card title="Beacon Stats" subtitle="Endurance Devnet">
    </v-card>

    <br>

    <v-table theme="dark">
      <thead>
        <tr>
          <th class="text-left" v-for="header in headers" :key="header.value">{{ header.title }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.identifier" :class="{ 'updated-item': item.updated }">
          <td>{{ item.identifier }}</td>
          <td>{{ item.url }}</td>
          <td>{{ item.peers }}</td>
        </tr>

      </tbody>
    </v-table>

    <br>

    <v-progress-linear :model-value="progress"></v-progress-linear>

  </v-theme-provider>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const headers = ref([]);
    const items = ref([]);

    const progress = ref(0);
    let intervalId = null;

    function resetProgress() {
      progress.value = 0;
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(() => {
        if (progress.value < 100) {
          progress.value += 10;
        } else {
          clearInterval(intervalId);
        }
      }, 1000);
    }

    let ws;
    onMounted(() => {
      ws = new WebSocket(`ws://${process.env.VITE_IP_ADDRESS}:8080/ws`);

      ws.onopen = () => {
        ws.send('start');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'headers') {
          headers.value = message.data;
          resetProgress()
        } else if (message.type === 'data') {
          const newData = message.data;
          const index = items.value.findIndex(item => item.identifier === newData.identifier);

          if (index !== -1) {
            items.value[index] = { ...newData, updated: true };
            setTimeout(() => {
              items.value[index].updated = false;
            }, 500);
          } else {
            items.value.push({ ...newData, updated: true });
          }

          resetProgress();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    });

    return {
      headers,
      items,
      progress
    };
  },
}
</script>

<style>
.updated-item {
  transition: background-color 0.5s ease;
  color: yellow;
}
</style>
