<template>
  <section class="total-war-stats" aria-label="Total War Stats">
    <!-- Header -->
    <header class="tws-header">
      <div class="tws-wing tws-wing--left" aria-hidden="true">
        <span class="tws-wing__cap"></span>
        <span class="tws-wing__bar"></span>
        <span class="tws-wing__bar tws-wing__bar--thin"></span>
      </div>

      <div class="tws-title">
        <div class="tws-title__kicker">SUB WARS</div>
        <h3 class="tws-title__text">
          <span class="tws-title__icon" aria-hidden="true">⚜️</span>
          Total War Stats
          <span class="tws-title__icon" aria-hidden="true">⚜️</span>
        </h3>
      </div>

      <div class="tws-wing tws-wing--right" aria-hidden="true">
        <span class="tws-wing__bar"></span>
        <span class="tws-wing__bar tws-wing__bar--thin"></span>
        <span class="tws-wing__cap"></span>
      </div>
    </header>

    <div class="tws-sub-row">
      <div class="tws-title__sub">
        <span class="pill pill--soft">Matches</span>
        <span class="pill mono">{{ fmt(totals.matches) }}</span>
        <span class="dot" aria-hidden="true"></span>
        <span class="pill pill--soft">K/D/A</span>
        <span class="pill mono">{{ fmt(totals.kills) }}/{{ fmt(totals.deaths) }}/{{ fmt(totals.assists) }}</span>
      </div>
    </div>

    <!-- Chips -->
    <div class="stats-row">
      <StatChip icon="🎮" label="MATCHES" :value="fmt(totals.matches)" />
      <StatChip icon="🎯" label="KILLS" :value="fmt(totals.kills)" />
      <StatChip icon="💀" label="DEATHS" :value="fmt(totals.deaths)" />
      <StatChip icon="🤝" label="ASSISTS" :value="fmt(totals.assists)" />
      <StatChip icon="🌾" label="CS" :value="fmt(totals.cs)" />
      <StatChip icon="💰" label="GOLD" :value="fmt(totals.gold)" />
      <StatChip icon="⚔️" label="DMG" :value="fmt(totals.damage)" />
      <StatChip icon="👁️" label="VISION" :value="fmt(totals.vision)" />
      <StatChip icon="🏰" label="TOWERS" :value="fmt(totals.towers)" />
      <StatChip icon="🐉" label="DRAGONS" :value="fmt(totals.dragons)" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatChip from '@/components/warstats/StatChip.vue'

const props = defineProps<{ matches: any[] }>()

const totals = computed(() => {
  const base = {
    matches: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    gold: 0,
    damage: 0,
    vision: 0,
    towers: 0,
    dragons: 0,
  }

  if (!props.matches || !props.matches.length) return base

  return props.matches.reduce((acc, m) => {
    acc.matches += 1
    acc.kills += Number(m.kills || 0)
    acc.deaths += Number(m.deaths || 0)
    acc.assists += Number(m.assists || 0)
    acc.cs += Number(m.cs || 0)
    acc.gold += Number(m.goldEarned || 0)
    acc.damage += Number(m.damageToChamps || 0)
    acc.vision += Number(m.visionScore || 0)
    acc.towers += Number(m.towers || 0)
    acc.dragons += Number(m.dragons || 0)
    return acc
  }, base)
})

function fmt(v: number | string) {
  const n = Number(v || 0)
  return n.toLocaleString()
}
</script>

<style scoped>
/* =========================================================
   Total War Stats (centered + darker plate + shiny borders)
   ========================================================= */

.total-war-stats {
  width: min(760px, 92%);
  margin: 14px auto 18px;
  padding: 18px 18px 20px;
  border-radius: 20px;
  position: relative;
  color: #eaf3ff;

  /* Darker "silver plate" (less white, more steel) */
  background:
    radial-gradient(140% 100% at 50% 0%, rgba(255, 255, 255, 0.20), rgba(255, 255, 255, 0) 55%),
    radial-gradient(130% 110% at 20% 25%, rgba(255, 210, 110, 0.16), transparent 60%),
    radial-gradient(130% 110% at 80% 25%, rgba(70, 140, 255, 0.10), transparent 60%),
    linear-gradient(
      180deg,
      rgba(33, 44, 57, 0.95) 0%,
      rgba(26, 36, 48, 0.96) 35%,
      rgba(20, 28, 39, 0.97) 70%,
      rgba(16, 22, 31, 0.98) 100%
    );

  /* Shiny gold border */
  border: 1px solid rgba(225, 186, 92, 0.72);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    inset 0 0 0 1px rgba(25, 35, 48, 0.55);
}

/* Inner shiny rim + subtle texture */
.total-war-stats::before {
  content: "";
  position: absolute;
  inset: 9px;
  border-radius: 16px;
  pointer-events: none;

  background:
    radial-gradient(120% 120% at 50% 0%, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.0) 70%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 40%),
    linear-gradient(315deg, rgba(255, 255, 255, 0.035), transparent 40%);

  /* shiny inner gold line */
  box-shadow:
    inset 0 0 0 1px rgba(225, 186, 92, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Top highlight stroke (subtle) */
.total-war-stats::after {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  top: 10px;
  height: 6px;
  border-radius: 999px;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(255,255,255,0.20), rgba(255,255,255,0.03));
  opacity: 0.9;
}

/* =========================================================
   Header: force centered alignment visually
   ========================================================= */

.tws-header {
  position: relative;
  z-index: 1;

  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  grid-auto-rows: auto;
  align-items: center;
  gap: 12px;

  /* This keeps the title dead-center even if wings differ */
  justify-items: center;

  margin-bottom: 6px;
}

.tws-title {
  text-align: center;
  padding: 10px 14px 12px;
  border-radius: 16px;

  background:
    radial-gradient(120% 120% at 50% 0%, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.0) 70%),
    rgba(10, 16, 24, 0.35);

  border: 1px solid rgba(225, 186, 92, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.tws-title__kicker {
  font-size: 10px;
  letter-spacing: 0.30em;
  text-transform: uppercase;
  color: rgba(210, 232, 255, 0.75);
  font-weight: 800;
  margin-bottom: 2px;
}

.tws-title__text {
  margin: 0;
  font-size: 16px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(240, 248, 255, 0.96);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.tws-title__icon {
  font-size: 14px;
  opacity: 0.95;
  filter:
    drop-shadow(0 1px 0 rgba(255,255,255,0.10))
    drop-shadow(0 0 10px rgba(255, 210, 120, 0.20));
}

.tws-title__sub {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tws-sub-row {
  display:flex;
  justify-content:center;
  margin-bottom: 12px;
  z-index:1;
}

/* Wings */
.tws-wing {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  opacity: 0.95;
}
.tws-wing--left {
  justify-content: flex-end;
}
.tws-wing--right {
  justify-content: flex-start;
}

.tws-wing__cap {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(255, 220, 140, 0.95), rgba(170, 120, 30, 0.9));
  border: 1px solid rgba(120, 85, 20, 0.38);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.20),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.tws-wing__bar {
  height: 2px;
  width: min(210px, 22vw);
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(225, 186, 92, 0.0),
    rgba(225, 186, 92, 0.70),
    rgba(225, 186, 92, 0.0)
  );
  filter: drop-shadow(0 0 10px rgba(225, 186, 92, 0.12));
}

.tws-wing__bar--thin {
  height: 1px;
  opacity: 0.6;
  width: min(160px, 18vw);
}

/* Pills */
.pill {
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;

  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(225, 186, 92, 0.14);
  color: rgba(230, 245, 255, 0.92);
}

.pill--soft {
  background: rgba(255, 255, 255, 0.035);
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(230, 245, 255, 0.35);
}

/* Chips row: centered always */
.stats-row {
  position: relative;
  z-index: 1;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  gap: 12px 12px;
  padding-top: 6px;
}

/* Utility */
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* Responsive */
@media (max-width: 820px) {
  .total-war-stats {
    width: min(720px, 94%);
    padding: 16px 14px 18px;
  }

  .tws-wing__bar {
    width: min(150px, 18vw);
  }
  .tws-wing__bar--thin {
    width: min(120px, 14vw);
  }

  .tws-title__text {
    font-size: 15px;
    letter-spacing: 0.10em;
  }
}

@media (max-width: 560px) {
  .tws-header {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .tws-wing {
    display: none;
  }
}
</style>
