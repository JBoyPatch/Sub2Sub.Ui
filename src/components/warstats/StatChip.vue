<template>
  <div class="stat-chip">
    <div class="stat-chip__icon">{{ icon }}</div>
    <div class="stat-chip__text">
      <div class="stat-chip__label">{{ label }}</div>
      <div class="stat-chip__value mono">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string;
  label: string;
  value: string;
}>()
</script>

<style scoped>
.stat-chip {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  border-radius: 999px;
  background: rgba(6, 18, 38, 0.68);
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
</style>
