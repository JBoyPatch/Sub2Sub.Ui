<template>
  <div class="war-stats-page">
    <header class="page-header">
      <h2>WAR STATS</h2>
      <p class="subtitle">
        Your performance by match. (DB-backed later — using a placeholder model for now.)
      </p>
    </header>

    <!-- Total stats row (single row above the stat chips) -->
    <TotalWarStats :matches="matches" />

    <!-- Scrollable tiles row with arrows -->
    <div class="tiles-wrapper">
      <button class="scroll-btn left" @click="scrollLeft" aria-label="Scroll left">◀</button>
      <div class="tiles-row" ref="tilesRow">
        <div
          v-for="m in matches"
          :key="m.matchId"
          class="tile-item"
        >
          <MatchStatTile
            :match="m"
            @open="onOpen"
            @details="onDetails"
          />
        </div>

        <!-- 3 placeholder stat chips -->
        <div class="tile-item placeholder-chip" v-for="n in 3" :key="'ph-'+n">
          <div class="ph-inner">Placeholder</div>
        </div>
      </div>
      <button class="scroll-btn right" @click="scrollRight" aria-label="Scroll right">▶</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MatchStatTile, { type PlayerMatchSummary } from '@/components/warstats/MatchStatTile.vue'
import TotalWarStats from '@/pages/TotalWarStats.vue'

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

const tilesRow = ref<HTMLElement | null>(null)
function scrollLeft() {
  const el = tilesRow.value
  if (!el) return
  el.scrollBy({ left: -Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
}
function scrollRight() {
  const el = tilesRow.value
  if (!el) return
  el.scrollBy({ left: Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
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

/* new scrollable layout */
.tiles-wrapper {
  display:flex;
  align-items:center;
  gap:12px;
  margin-top: 6px;
}
.scroll-btn {
  background: linear-gradient(180deg,#2b5a7a,#1f3a52);
  color: #e6eef8;
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight:700;
}
.tiles-row {
  display:flex;
  gap:18px;
  overflow-x:auto;
  padding:6px;
  scroll-behavior:smooth;
  -webkit-overflow-scrolling: touch;
  flex:1;
  align-items: stretch;
}
.tiles-row::-webkit-scrollbar { height:8px }
.tiles-row::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius:4px }

.tile-item {
  min-width: 260px;
  flex: 0 0 auto;
}

/* placeholder chip styling */
.placeholder-chip {
  display:flex;
  align-items:center;
  justify-content:center;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius:8px;
  padding:14px;
  border:1px solid rgba(255,255,255,0.03);
  color: rgba(230,238,248,0.9);
}
.placeholder-chip .ph-inner { opacity:0.6; font-weight:700 }

/* responsive adjustments */
@media (max-width: 980px) {
  .tile-item { min-width: 300px }
}
@media (max-width: 640px) {
  .tile-item { min-width: 85%; }
}

/* keep legacy grid rules out by not using .tiles here */
</style>