<!-- MatchLobby.vue -->
<template>
  <div class="lobby">
    <!-- Header -->
    <header class="lobby__header">
      <div class="lobby__title">
        <h1>{{ tournamentName }}</h1>
        <span class="lobby__subtitle">Single game lobby</span>
      </div>

      <div class="lobby__timer" :class="{ 'lobby__timer--started': remainingSeconds <= 0 }">
        <span class="lobby__timer-label">
          {{ remainingSeconds > 0 ? 'Starts in:' : 'In progress' }}
        </span>
        <span class="lobby__timer-value">
          {{ formattedRemaining }}
        </span>
      </div>
    </header>

    <!-- Teams -->
    <section class="lobby__body">
      <!-- Left team -->
      <div class="team">
        <h2 class="team__name">Team A</h2>
        <ul class="team__slots">
          <li
            v-for="slot in teams[0].slots"
            :key="`A-${slot.role}`"
            class="slot"
            :class="{ 'slot--filled': !!slot.displayName }"
          >
            <div class="slot__avatar"></div>
            <div class="slot__info">
              <div class="slot__name">
                {{ slot.displayName || 'Waiting for player…' }}
              </div>
              <div class="slot__role">{{ roleLabel(slot.role) }}</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Right team -->
      <div class="team">
        <h2 class="team__name">Team B</h2>
        <ul class="team__slots">
          <li
            v-for="slot in teams[1].slots"
            :key="`B-${slot.role}`"
            class="slot"
            :class="{ 'slot--filled': !!slot.displayName }"
          >
            <div class="slot__avatar"></div>
            <div class="slot__info">
              <div class="slot__name">
                {{ slot.displayName || 'Waiting for player…' }}
              </div>
              <div class="slot__role">{{ roleLabel(slot.role) }}</div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Queue buttons -->
    <footer class="lobby__footer">
      <div class="queue-buttons">
        <button
          v-for="role in roles"
          :key="role.key"
          class="queue-buttons__btn"
          :disabled="!canQueueFor(role.key)"
          @click="queueForRole(role.key)"
        >
          Queue for {{ role.label }}
        </button>
      </div>

      <p class="lobby__status" v-if="statusMessage">
        {{ statusMessage }}
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

type RoleKey = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

interface Slot {
  role: RoleKey;
  displayName: string | null;
}

interface Team {
  name: string;
  slots: Slot[];
}

const props = defineProps<{
  tournamentName: string;
  /** ISO string or anything new Date() accepts */
  startsAt: string;
  /** The name of the currently logged-in user (to be queued into slots). */
  currentUserName: string;
}>();

const roles: { key: RoleKey; label: string }[] = [
  { key: 'TOP',     label: 'Top' },
  { key: 'JUNGLE',  label: 'Jungle' },
  { key: 'MID',     label: 'Mid' },
  { key: 'ADC',     label: 'ADC' },
  { key: 'SUPPORT', label: 'Support' }
];

const createEmptyTeam = (name: string): Team => ({
  name,
  slots: roles.map((r) => ({
    role: r.key,
    displayName: null
  }))
});

const teams = reactive<Team[]>([
  createEmptyTeam('Team A'),
  createEmptyTeam('Team B')
]);

/**
 * Track where this user is currently assigned.
 * (In real app you’d get this from your backend / socket events.)
 */
const userAssignment = ref<{ teamIndex: number; slotIndex: number } | null>(
  null
);

const statusMessage = ref<string | null>(null);

/* --- Countdown timer --- */

const remainingSeconds = ref(0);
let timerId: number | null = null;

const updateRemaining = () => {
  const now = Date.now();
  const start = new Date(props.startsAt).getTime();
  const diffMs = Math.max(0, Math.floor((start - now) / 1000));
  remainingSeconds.value = diffMs;
};

const formattedRemaining = computed(() => {
  const s = remainingSeconds.value;
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

onMounted(() => {
  updateRemaining();
  timerId = window.setInterval(updateRemaining, 1000);
});

onBeforeUnmount(() => {
  if (timerId !== null) {
    clearInterval(timerId);
  }
});

/* --- Queue logic --- */

const roleLabel = (role: RoleKey) =>
  roles.find((r) => r.key === role)?.label ?? role;

const canQueueFor = (role: RoleKey): boolean => {
  if (userAssignment.value) {
    // Already queued somewhere, keep it simple for now.
    return false;
  }

  // Is there at least one free slot with this role?
  return teams.some((team) =>
    team.slots.some((slot) => slot.role === role && !slot.displayName)
  );
};

const queueForRole = (role: RoleKey) => {
  statusMessage.value = null;

  if (userAssignment.value) {
    statusMessage.value = 'You are already queued for a role.';
    return;
  }

  // Fill first available slot on Team A, then Team B.
  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const team = teams[teamIndex];
    const slotIndex = team.slots.findIndex(
      (slot) => slot.role === role && !slot.displayName
    );

    if (slotIndex !== -1) {
      team.slots[slotIndex].displayName = props.currentUserName;
      userAssignment.value = { teamIndex, slotIndex };
      statusMessage.value = `Queued as ${roleLabel(role)} on ${team.name}.`;
      return;
    }
  }

  statusMessage.value = `${roleLabel(role)} is full.`;
};
</script>

<style scoped>
.lobby {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 1.5rem 2rem 2rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
  background: #0b1220;
  color: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lobby__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
  padding-bottom: 0.75rem;
}

.lobby__title h1 {
  margin: 0;
  font-size: 1.6rem;
  letter-spacing: 0.03em;
}

.lobby__subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
}

.lobby__timer {
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid #f97316;
  background: rgba(248, 113, 113, 0.08);
  text-align: right;
  min-width: 160px;
}

.lobby__timer--started {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}

.lobby__timer-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #f97316;
}

.lobby__timer--started .lobby__timer-label {
  color: #22c55e;
}

.lobby__timer-value {
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
}

.lobby__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.team__name {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #e5e7eb;
}

.team__slots {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slot {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px dashed rgba(148, 163, 184, 0.5);
}

.slot--filled {
  border-style: solid;
  border-color: #38bdf8;
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.95));
}

.slot__avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid rgba(148, 163, 184, 0.7);
}

.slot--filled .slot__avatar {
  border-color: #38bdf8;
}

.slot__info {
  display: flex;
  flex-direction: column;
}

.slot__name {
  font-size: 0.95rem;
}

.slot__role {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.lobby__footer {
  border-top: 1px solid rgba(148, 163, 184, 0.4);
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.queue-buttons {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.5rem;
}

.queue-buttons__btn {
  padding: 0.6rem 0.75rem;
  border-radius: 999px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(to right, #0ea5e9, #6366f1);
  color: #f9fafb;
  white-space: nowrap;
}

.queue-buttons__btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  background: #4b5563;
}

.lobby__status {
  font-size: 0.85rem;
  color: #c4b5fd;
}

/* Simple responsiveness */
@media (max-width: 900px) {
  .lobby {
    padding: 1.25rem;
  }

  .lobby__body {
    grid-template-columns: 1fr;
  }

  .queue-buttons {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}
</style>
