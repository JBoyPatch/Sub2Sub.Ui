<template>
  <div class="home-page">
    <header class="home-page__header">
      <h2>Active Lobbies</h2>
      <p class="home-page__subtitle">
        Live Sub Wars rooms you can join right now.
      </p>
    </header>

    <div class="tiles">
      <LobbyTile
        title="Bronze War"
        lobby-id="lobby123"
        :api-url="lobbyUrl"
        queue-tier="Bronze"
        status="Live"
        @open="openLobby"
      />
      <!-- later: v-for="lobby in lobbies" :key="lobby.id" ... -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import LobbyTile from '../components/LobbyTile.vue';

const router = useRouter();
const lobbyUrl =
  'https://uuzjaspetg.execute-api.us-east-1.amazonaws.com/$default/lobbies/lobby123';

const openLobby = () => {
  router.push('/lobby');
};
</script>

<style scoped>
.home-page {
  max-width: 1100px;
  margin: 1rem auto;
  padding: 1.5rem 1.25rem 2rem;
  color: #eaf2ff;
}

.home-page__header {
  margin-bottom: 1rem;
}

.home-page__header h2 {
  margin: 0;
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 800;
}

.home-page__subtitle {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: #9fb4d8;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.1rem;
}
</style>
