<template>
  <div class="war-stats-page">
    <header class="page-header">
      <h2>WAR STATS</h2>
      <p class="subtitle">
        Your performance by match. (DB-backed later — using a placeholder model for now.)
      </p>
    </header>

    <div class="tiles">
      <MatchStatTile
        v-for="m in matches"
        :key="m.matchId"
        :match="m"
        @open="onOpen"
        @details="onDetails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MatchStatTile, { type PlayerMatchSummary } from '@/components/warstats/MatchStatTile.vue';

const matches: PlayerMatchSummary[] = [
  {
    matchId: 'NA1_1234567890123',
    tierLabel: 'BRONZE',
    queueLabel: 'BRONZE WAR',
    result: 'WIN',
    isRanked: false,
    patch: '14.2',
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    durationSec: 1865,
    championName: 'Ahri',
    championId: 103,
    role: 'MID',
    kills: 12,
    deaths: 3,
    assists: 9,
    cs: 218,
    goldEarned: 14250,
    damageToChamps: 35640,
    damageTaken: 18420,
    visionScore: 28,
    teamKills: 38,
    killParticipation: 0.55,
    towers: 3,
    dragons: 2,
    items: [
      { itemId: 6655, icon: '🧩' },
      { itemId: 3020, icon: '🧩' },
      { itemId: 3165, icon: '🧩' },
      { itemId: 4645, icon: '🧩' },
      { itemId: 3157, icon: '🧩' },
      { itemId: 3364, icon: '🧩' },
      { itemId: 0, icon: '🧩' },
    ],
  },
  {
    matchId: 'NA1_9999912345678',
    tierLabel: 'BRONZE',
    queueLabel: 'BRONZE WAR',
    result: 'LOSS',
    isRanked: false,
    patch: '14.2',
    playedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    durationSec: 2150,
    championName: 'Jinx',
    championId: 222,
    role: 'BOT',
    kills: 7,
    deaths: 7,
    assists: 6,
    cs: 264,
    goldEarned: 15110,
    damageToChamps: 30120,
    damageTaken: 22110,
    visionScore: 14,
    teamKills: 26,
    killParticipation: 0.5,
    towers: 1,
    dragons: 1,
    items: [
      { itemId: 3031, icon: '🧩' },
      { itemId: 3094, icon: '🧩' },
      { itemId: 3006, icon: '🧩' },
      { itemId: 3085, icon: '🧩' },
      { itemId: 3036, icon: '🧩' },
      { itemId: 3363, icon: '🧩' },
      { itemId: 0, icon: '🧩' },
    ],
  },
];

function onOpen(matchId: string) {
  console.log('open match', matchId);
}

function onDetails(matchId: string) {
  console.log('details', matchId);
}
</script>

<style scoped>
.war-stats-page {
  padding: 22px 24px;
  max-width: 1180px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(235, 246, 255, 0.96);
}

.subtitle {
  margin: 6px 0 18px;
  color: rgba(210, 232, 255, 0.75);
  font-size: 13px;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 1250px) {
  .tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 980px) {
  .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .tiles { grid-template-columns: 1fr; }
}
</style>
