<template>
  <div class="home-page">
    <div class="home-page__video">
      <iframe
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Sub Wars Trailer"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>

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

.home-page__video {
  width: 100%;
  overflow: hidden;
}

.home-page__video iframe {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  height: 360px;
  border: 0;
  display: block;
  margin-bottom: 2rem;
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

@media (max-width: 700px) {
  .home-page__video iframe { height: 220px; }
}
</style>
