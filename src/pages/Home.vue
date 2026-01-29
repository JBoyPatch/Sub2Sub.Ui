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
        :api-url="`${apiBase}/lobbies/${lobby.lobbyId}`"
        :queue-tier="lobby.tournamentName.split(' ')[0]"
        :status="lobby.status || lobbyStatus(lobby)"
        :is-active="lobby.isActive || lobbyIsActive(lobby)"
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

const rawEnv = (import.meta as any).env || {}
const apiBase = rawEnv.DEV
  ? '/api/$default'
  : ((rawEnv.VITE_API_BASE_URL as string) || (rawEnv.VITE_API_BASE as string) || '')?.replace(/\/$/, '')

const router = useRouter();
const lobbies = ref<any[]>([]);

function lobbyIsActive(lobby: any) {
  try {
    const now = Date.now();
    // prefer explicit end time
    if (lobby.endsAtIso) {
      const rem = new Date(lobby.endsAtIso).getTime() - now
      return rem > 0
    }
    // prefer timeLeft fields if provided by API
    if (lobby.timeLeftMs != null) return Number(lobby.timeLeftMs) > 0
    if (lobby.timeLeftSec != null) return Number(lobby.timeLeftSec) * 1000 > 0
    // try to compute from startsAt + duration
    if (lobby.startsAtIso) {
      const startMs = new Date(lobby.startsAtIso).getTime()
      if (lobby.durationMs != null) return startMs + Number(lobby.durationMs) - now > 0
      if (lobby.durationSec != null) return startMs + Number(lobby.durationSec) * 1000 - now > 0
      // if started in the past but no end info, consider it ended
      return startMs > now
    }
    return false
  } catch (e) {
    return false
  }
}

function lobbyStatus(lobby: any) {
  return lobbyIsActive(lobby) ? 'Live' : 'Ended';
}

const openLobby = (id?: string) => {
  if (id) router.push({ path: '/lobby', query: { lobbyId: id } });
  else router.push('/lobby');
};

onMounted(async () => {
  const data = await getLobbies();
  const processed = (data || []).map((l: any) => ({
    ...l,
    isActive: lobbyIsActive(l),
    status: lobbyStatus(l),
  }));
  // sort active (true) first
  processed.sort((a: any, b: any) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));
  lobbies.value = processed;
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
