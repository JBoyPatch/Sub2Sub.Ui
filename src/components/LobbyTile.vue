<template>
  <article class="lobby-tile">
    <header class="lobby-tile__header">
      <div class="lobby-tile__badge">
        <span class="badge-tier">{{ queueTier }}</span>
        <span class="badge-status" :class="statusClass">
          {{ status }}
        </span>
      </div>

      <h3 class="lobby-tile__title">
        {{ title }}
        <span class="lobby-tile__id">— {{ lobbyId }}</span>
      </h3>
    </header>

    <p class="lobby-tile__meta">
      {{ apiUrl }}
    </p>

    <footer class="lobby-tile__actions">
      <button class="primary-btn" @click="$emit('open')">
        Open Lobby
      </button>

      <a
        class="ghost-link"
        :href="apiUrl"
        target="_blank"
        rel="noreferrer"
      >
        Open API
      </a>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  lobbyId: string;
  apiUrl: string;
  queueTier?: string;
  status?: string;
}>();

defineEmits<{
  (e: 'open'): void;
}>();

const statusClass = computed(() => {
  const value = (props.status || '').toLowerCase();
  if (value.includes('live') || value.includes('active')) return 'badge-status--live';
  if (value.includes('full')) return 'badge-status--full';
  if (value.includes('pending') || value.includes('waiting')) return 'badge-status--pending';
  return 'badge-status--default';
});

const queueTier = computed(() => props.queueTier || 'Unranked');
const status = computed(() => props.status || 'Live');
</script>

<style scoped>
.lobby-tile {
  position: relative;
  padding: 1rem 1rem 0.9rem;
  border-radius: 18px;
  max-width: 20rem;
  background:
    radial-gradient(circle at top left, rgba(39, 92, 160, 0.55), transparent 55%),
    radial-gradient(circle at bottom right, rgba(8, 24, 56, 0.9), rgba(4, 10, 24, 0.98));
  box-shadow:
    0 18px 35px rgba(0, 0, 0, 0.9),
    0 0 0 1px rgba(20, 40, 70, 0.85);
  color: #eaf2ff;
  overflow: hidden;
}

.lobby-tile::before {
  /* subtle glowing border */
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 17px;
  border: 1px solid rgba(246, 210, 128, 0.18);
  pointer-events: none;
}

.lobby-tile__header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
}

.lobby-tile__badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.badge-tier {
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  background: radial-gradient(circle at top, #f7d68c, #b97334);
  color: #140d07;
  box-shadow: 0 0 10px rgba(248, 211, 140, 0.7);
}

.badge-status {
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(132, 182, 247, 0.6);
  background: rgba(4, 16, 40, 0.9);
  color: #c5d7ff;
}

.badge-status--live {
  border-color: rgba(0, 210, 255, 0.8);
  color: #9bf6ff;
}

.badge-status--pending {
  border-color: rgba(246, 210, 128, 0.85);
  color: #ffe7b8;
}

.badge-status--full {
  border-color: rgba(255, 108, 108, 0.8);
  color: #ffd0d0;
}

.lobby-tile__title {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.85);
}

.lobby-tile__id {
  font-weight: 500;
  font-size: 0.8rem;
  color: #9fb4d8;
}

.lobby-tile__meta {
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: #9fb4d8;
  word-break: break-all;
  line-height: 1.4;
}

.lobby-tile__actions {
  margin-top: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* gold primary button (aligned with logout & login) */
.primary-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  border: 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #0b1324;
  background: radial-gradient(circle at top, #ffe6aa, #f3b654);
  box-shadow:
    0 0 8px rgba(250, 213, 120, 0.75),
    0 6px 14px rgba(0, 0, 0, 0.7);
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease,
    filter 0.08s ease;
}

.primary-btn:hover {
  filter: brightness(1.07);
  transform: translateY(-1px);
  box-shadow:
    0 0 12px rgba(246, 208, 125, 0.95),
    0 8px 18px rgba(0, 0, 0, 0.75);
}

.primary-btn:active {
  transform: translateY(1px);
  box-shadow:
    0 0 6px rgba(246, 208, 125, 0.7),
    0 3px 8px rgba(0, 0, 0, 0.65);
}

.ghost-link {
  padding: 0.4rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(146, 178, 224, 0.6);
  background: rgba(2, 12, 32, 0.6);
  color: #a8c2ff;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    transform 0.08s ease;
}

.ghost-link:hover {
  background: radial-gradient(circle at top, rgba(30, 98, 190, 0.9), rgba(7, 18, 41, 0.98));
  border-color: rgba(37, 177, 255, 0.88);
  box-shadow:
    0 0 10px rgba(37, 177, 255, 0.7),
    0 0 18px rgba(3, 11, 28, 0.9);
  transform: translateY(-1px);
}
</style>
