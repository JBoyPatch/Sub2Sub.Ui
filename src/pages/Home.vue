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
        v-for="lobby in lobbies"
        :key="lobby.lobbyId"
        :title="lobby.tournamentName"
        :lobby-id="lobby.lobbyId"
        :api-url="`https://uuzjaspetg.execute-api.us-east-1.amazonaws.com/$default/lobbies/${lobby.lobbyId}`"
        :queue-tier="lobby.tournamentName.split(' ')[0]"
        :status="'Live'"
        @open="() => openLobby(lobby.lobbyId)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import LobbyTile from '../components/LobbyTile.vue';
import { getLobbies } from '../api/lobbyApi';

const router = useRouter();
const lobbies = ref<any[]>([]);

const openLobby = (id?: string) => {
  if (id) router.push({ path: '/lobby', query: { lobbyId: id } });
  else router.push('/lobby');
};

onMounted(async () => {
  lobbies.value = await getLobbies();
});
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
