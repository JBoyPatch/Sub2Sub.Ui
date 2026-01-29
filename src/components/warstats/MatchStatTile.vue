<template>
  <article class="match-tile">
    <!-- Top badges (like BRONZE / LIVE) -->
    <div class="match-tile__badges">
      <span class="badge badge--tier">{{ match.tierLabel }}</span>
      <span class="badge" :class="match.result === 'WIN' ? 'badge--win' : 'badge--loss'">
        {{ match.result }}
      </span>
      <span v-if="match.isRanked" class="badge badge--muted">RANKED</span>
      <span v-else class="badge badge--muted">CUSTOM</span>
    </div>

    <!-- Title -->
    <div class="match-tile__title">
      <div class="match-tile__title-main">
        {{ match.queueLabel }} — <span class="mono">{{ shortMatchId }}</span>
      </div>
      <div class="match-tile__title-sub">
        {{ match.patch }} · {{ formatDate(match.playedAt) }} · {{ formatDuration(match.durationSec) }}
      </div>
    </div>

    <!-- “Meta url” area like lobbies shows URL — here show compact match meta lines -->
    <div class="match-tile__meta">
      <div class="meta-line">
        <span class="meta-k">Champion</span>
        <span class="meta-v">
          {{ match.championName }}
          <span class="mono">#{{ match.championId }}</span>
        </span>
      </div>
      <div class="meta-line">
        <span class="meta-k">Role</span>
        <span class="meta-v mono">{{ match.role }}</span>
      </div>
      <div class="meta-line">
        <span class="meta-k">K / D / A</span>
        <span class="meta-v mono">
          {{ match.kills }}/{{ match.deaths }}/{{ match.assists }}
          <span class="muted">·</span>
          <span class="muted">{{ kdaText }}</span>
        </span>
      </div>
    </div>

    <!-- Bubble stat chips (most popular stats) -->
    <div class="match-tile__stats">
      <StatChip icon="⚔️" label="DMG" :value="fmt(match.damageToChamps)" />
      <StatChip icon="🛡️" label="DT" :value="fmt(match.damageTaken)" />
      <StatChip icon="💰" label="GOLD" :value="fmt(match.goldEarned)" />
      <StatChip icon="🌾" label="CS" :value="String(match.cs)" />
      <StatChip icon="👁️" label="VISION" :value="String(match.visionScore)" />
      <StatChip icon="🎯" label="KP" :value="kpText" />
      <StatChip icon="🏰" label="TOWERS" :value="String(match.towers)" />
      <StatChip icon="🐉" label="DRAG" :value="String(match.dragons)" />
    </div>

    <!-- Items row (placeholders, you’ll swap icons later) -->
    <div class="match-tile__items">
      <div class="items-label">Items</div>
      <div class="items-row">
        <div v-for="(it, idx) in match.items" :key="idx" class="item-slot" :title="it.name ?? `Item ${it.itemId}`">
          <span class="item-icon">{{ it.icon ?? '🧩' }}</span>
        </div>
      </div>
    </div>

    <!-- Actions like OPEN LOBBY / OPEN API -->
    <div class="match-tile__actions">
      <button class="btn btn--primary" @click="$emit('open', match.matchId)">
        VIEW MATCH
      </button>

      <button class="btn btn--secondary" @click="$emit('details', match.matchId)">
        DETAILS
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';

export type MatchResult = 'WIN' | 'LOSS';

export interface MatchItem {
  itemId: number;
  name?: string;
  icon?: string;
}

export interface PlayerMatchSummary {
  matchId: string;
  tierLabel: string;
  queueLabel: string;
  result: MatchResult;
  isRanked: boolean;
  patch: string;
  playedAt: string;
  durationSec: number;

  championName: string;
  championId: number;
  role: string;

  kills: number;
  deaths: number;
  assists: number;

  cs: number;
  goldEarned: number;
  damageToChamps: number;
  damageTaken: number;
  visionScore: number;

  teamKills: number;
  killParticipation: number;
  towers: number;
  dragons: number;

  items: MatchItem[];
}

const props = defineProps<{
  match: PlayerMatchSummary;
}>();

defineEmits<{
  (e: 'open', matchId: string): void;
  (e: 'details', matchId: string): void;
}>();

const shortMatchId = computed(() => {
  const s = props.match.matchId ?? '';
  return s.length > 10 ? s.slice(-10) : s;
});

const kdaText = computed(() => {
  const { kills, assists, deaths } = props.match;
  const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
  return `${kda.toFixed(2)} KDA`;
});

const kpText = computed(() => `${Math.round(props.match.killParticipation * 100)}%`);

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
}

function fmt(n: number | undefined) {
  if (n === undefined || n === null) return '-';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const StatChip = defineComponent({
  name: 'StatChip',
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'stat-chip' }, [
        h('div', { class: 'stat-chip__icon' }, props.icon),
        h('div', { class: 'stat-chip__text' }, [
          h('div', { class: 'stat-chip__label' }, props.label),
          h('div', { class: 'stat-chip__value mono' }, props.value),
        ]),
      ]);
  },
});
</script>

<style scoped>
/* ===== Match Tile (mirrors your lobby tile vibe) ===== */
.match-tile {
  position: relative;
  border-radius: 18px;
  padding: 14px 14px 12px;
  color: #e9f2ff;

  background:
    radial-gradient(140% 120% at 30% 10%, rgba(40, 120, 255, 0.22), transparent 55%),
    radial-gradient(120% 90% at 85% 0%, rgba(255, 205, 90, 0.18), transparent 55%),
    linear-gradient(180deg, rgba(10, 26, 48, 0.95), rgba(6, 16, 32, 0.94));

  border: 1px solid rgba(120, 180, 255, 0.22);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.match-tile::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px rgba(60, 140, 255, 0.12);
}

.match-tile__badges {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  background: rgba(10, 35, 70, 0.7);
  border: 1px solid rgba(90, 160, 255, 0.28);
  color: #cfe6ff;
}

.badge--tier {
  background: linear-gradient(180deg, rgba(255, 205, 90, 0.85), rgba(170, 120, 20, 0.75));
  border: 1px solid rgba(255, 230, 170, 0.35);
  color: #0b1020;
  font-weight: 700;
}

.badge--win {
  background: rgba(40, 190, 120, 0.15);
  border-color: rgba(40, 190, 120, 0.35);
  color: #bff6dd;
}
.badge--loss {
  background: rgba(255, 90, 90, 0.14);
  border-color: rgba(255, 120, 120, 0.35);
  color: #ffd1d1;
}
.badge--muted {
  opacity: 0.85;
}

.match-tile__title {
  margin-bottom: 10px;
}

.match-tile__title-main {
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.match-tile__title-sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(210, 232, 255, 0.75);
}

.match-tile__meta {
  margin-top: 8px;
  padding: 10px 10px;
  border-radius: 14px;
  background: rgba(5, 14, 30, 0.55);
  border: 1px solid rgba(120, 180, 255, 0.15);
}

.meta-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  line-height: 1.35;
  padding: 3px 0;
}
.meta-k {
  color: rgba(210, 232, 255, 0.7);
}
.meta-v {
  color: rgba(235, 246, 255, 0.95);
  text-align: right;
}

.match-tile__stats {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.stat-chip {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  border-radius: 999px;

  background:
    radial-gradient(120% 120% at 30% 30%, rgba(30, 120, 255, 0.22), transparent 60%),
    rgba(6, 18, 38, 0.68);

  border: 1px solid rgba(110, 180, 255, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.stat-chip__icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;

  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(120, 180, 255, 0.16);
}

.stat-chip__label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(210, 232, 255, 0.75);
}
.stat-chip__value {
  font-size: 13px;
  font-weight: 700;
  color: rgba(240, 248, 255, 0.96);
}

.match-tile__items {
  margin-top: 12px;
  padding: 10px 10px;
  border-radius: 14px;
  background: rgba(5, 14, 30, 0.55);
  border: 1px solid rgba(120, 180, 255, 0.15);
}

.items-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(210, 232, 255, 0.75);
  margin-bottom: 8px;
}

.items-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.item-slot {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;

  background:
    radial-gradient(120% 120% at 30% 30%, rgba(255, 205, 90, 0.15), transparent 60%),
    rgba(10, 26, 48, 0.62);

  border: 1px solid rgba(120, 180, 255, 0.18);
}
.item-icon {
  font-size: 16px;
}

.match-tile__actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.btn {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  height: 34px;
  padding: 0 14px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 12px;
}

.btn--primary {
  flex: 1;
  background: linear-gradient(180deg, rgba(255, 205, 90, 0.95), rgba(200, 145, 30, 0.92));
  color: #0b1020;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
}

.btn--secondary {
  background: rgba(10, 35, 70, 0.55);
  border: 1px solid rgba(90, 160, 255, 0.28);
  color: rgba(230, 245, 255, 0.95);
}

.btn:active {
  transform: translateY(1px);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.muted {
  opacity: 0.75;
}
</style>
