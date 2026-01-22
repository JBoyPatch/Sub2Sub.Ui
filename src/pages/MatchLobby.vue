<template>
  <div class="lobby">
    <!-- Header -->
    <header class="lobby__header">
    <div class="lobby__title">
      <img
        v-if="divisionIcon"
        :src="divisionIcon"
        alt="division badge"
        class="division-icon"
      />
      <div class="lobby__title-text">
        <h1>{{ tournamentName }}</h1>
        <span class="lobby__subtitle">Single game lobby</span>
      </div>
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
            <div class="slot__avatar">
              <img
                v-if="slot.avatarUrl"
                :src="slot.avatarUrl"
                alt="avatar"
                class="slot__avatar-img"
              />
            </div>
            <div class="slot__info">
              <div class="slot__name">
                {{ slot.displayName || 'Waiting for player…' }}
              </div>
              <div class="slot__role">{{ roleLabel(slot.role) }}</div>
            </div>
            <div class="slot__bid">
              <div class="slot__bid-label">Current Bid</div>
              <div class="slot__bid-value">{{ teamTopBids[0][slot.role] }} Credits</div>

              <!-- Winner float animation -->
              <div
                v-if="winnerRoleByTeam[0] === slot.role"
                class="slot__winner-float"
              >
                Winner!!!
              </div>
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
             <div class="slot__avatar">
              <img
                v-if="slot.avatarUrl"
                :src="slot.avatarUrl"
                alt="avatar"
                class="slot__avatar-img"
              />
            </div>
            <div class="slot__info">
              <div class="slot__name">
                {{ slot.displayName || 'Waiting for player…' }}
              </div>
              <div class="slot__role">{{ roleLabel(slot.role) }}</div>
            </div>
            <div class="slot__bid">
              <div class="slot__bid-label">Current Bid</div>
              <div class="slot__bid-value">{{ teamTopBids[1][slot.role] }} Credits</div>

              <!-- Winner float animation -->
              <div
                v-if="winnerRoleByTeam[1] === slot.role"
                class="slot__winner-float"
              >
                Winner!!!
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Queue buttons -->
    <footer class="lobby__footer">
      <div class="team-selector">
       <button
         class="team-selector__btn"
         :class="{ 'team-selector__btn--active': selectedTeamIndex === 0 }"
         @click="selectedTeamIndex = 0"
       >
         Team A
       </button>
       <button
         class="team-selector__btn"
         :class="{ 'team-selector__btn--active': selectedTeamIndex === 1 }"
         @click="selectedTeamIndex = 1"
       >
         Team B
       </button>
      </div>
      <div class="queue-buttons">
        <button
          v-for="role in roles"
          :key="role.key"
          class="queue-buttons__btn"
          :disabled="!canQueueFor(role.key)"
          @click="onClickQueueForRole(role.key)"
        >
          Queue for {{ role.label }}
        </button>
      </div>

      <p class="lobby__status" v-if="statusMessage">
        {{ statusMessage }}
      </p>
    </footer>
  </div>
  <BidPopup
    :open="bidPopupOpen"
    :role-name="bidPopupRoleName"
    :queue-position="bidPopupQueuePosition"
    :current-top-bid="bidPopupTopBid"
    @submit="handleBidSubmit"
    @cancel="handleBidCancel"
  />
  <MatchResultPopup
    :open="resultPopupOpen"
    :did-win="resultDidWin"
    :won-role-name="resultWonRoleName || ''"
    :match-code="resultMatchCode || ''"
    @close="handleResultClose"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import BidPopup from '../BidPopup.vue';
import MatchResultPopup from '../MatchResultPopup.vue';
import { useUserStore } from '../stores/userStore';
import { getLobby, placeBid } from '../api/lobbyApi';

const userStore = useUserStore();
userStore.hydrateFromStorage();

type RoleKey = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

interface Slot {
  role: RoleKey;
  displayName: string | null;
  avatarUrl?: string | null;
}

interface Team {
  name: string;
  slots: Slot[];
}

const winnerRoleByTeam = reactive<(RoleKey | null)[]>([null, null]);
const selectedTeamIndex = ref<0 | 1>(0);   // which team user is bidding on
const bidPopupTeamIndex = ref<0 | 1>(0);   // which team the current popup is for
const canQueueFor = (_role: RoleKey): boolean => !userAssignment.value;

// Lobby header 
const lobbyId = import.meta.env.VITE_LOBBY_ID as string; // @TODO temp until lobbies are started by admin
const lobbyTournamentName = ref<string>('Bronze War');
const lobbyStartsAtIso = ref<string>(new Date(Date.now() + 3 * 60 * 1000).toISOString());
const tournamentName = computed(() => lobbyTournamentName.value);

// Polling state
let lobbyPollId: number | null = null;
const isSyncing = ref(false);

const divisionIcon = computed(() => {
  const name = tournamentName.value.toLowerCase();

  if (name.includes('bronze')) {
    return new URL('@/assets/divisions/bronze.png', import.meta.url).href;
  }
  if (name.includes('silver')) {
    return new URL('@/assets/divisions/silver.png', import.meta.url).href;
  }
  if (name.includes('iron')) {
    return new URL('@/assets/divisions/iron.png', import.meta.url).href;
  }

  return null;
});

// Track where this user is currently assigned.
const userAssignment = ref<{ teamIndex: number; slotIndex: number } | null>(
  null
);

const statusMessage = ref<string | null>(null);

const roles: { key: RoleKey; label: string }[] = [
  { key: 'TOP',     label: 'Top' },
  { key: 'JUNGLE',  label: 'Jungle' },
  { key: 'MID',     label: 'Mid' },
  { key: 'ADC',     label: 'ADC' },
  { key: 'SUPPORT', label: 'Support' }
];

const teamTopBids = reactive<Record<RoleKey, number>[]>([
  { TOP: 0, JUNGLE: 0, MID: 0, ADC: 0, SUPPORT: 0 }, 
  { TOP: 0,  JUNGLE: 0, MID: 0, ADC: 0, SUPPORT: 0 },
]);

const createEmptyTeam = (name: string): Team => ({
  name,
  slots: roles.map((r) => ({
    role: r.key,
    displayName: null,
    avatarUrl: null
  }))
});

const teams = reactive<Team[]>([
  createEmptyTeam('Team A'),
  createEmptyTeam('Team B')
]);


/* --- API LobbyDto → local UI state --- */

const roleLabel = (role: RoleKey) =>
  roles.find((r) => r.key === role)?.label ?? role;

type LobbyDto = {
  lobbyId: string;
  tournamentName: string;
  startsAtIso: string;
  teams: { name: string; slots: { role: RoleKey; displayName: string | null; avatarUrl: string | null; topBidCredits: number }[] }[];
};

const applyLobbyDto = (dto: LobbyDto) => {
  lobbyTournamentName.value = dto.tournamentName;
  lobbyStartsAtIso.value = dto.startsAtIso;

  dto.teams.forEach((t, teamIndex) => {
    if (!teams[teamIndex]) return;

    teams[teamIndex].name = t.name;

    t.slots.forEach((s) => {
      const slot = teams[teamIndex].slots.find(x => x.role === s.role);
      if (!slot) return;

      slot.displayName = s.displayName;
      slot.avatarUrl = s.avatarUrl;

      teamTopBids[teamIndex][s.role] = s.topBidCredits;
    });
  });

  // Recompute "assignment" from server state so sessions stay consistent
  const myTeamIndex = teams.findIndex(team =>
    team.slots.some(slot => slot.displayName === userStore.displayName)
  );

  if (myTeamIndex >= 0) {
    const slotIndex = teams[myTeamIndex].slots.findIndex(slot => slot.displayName === userStore.displayName);
    userAssignment.value = slotIndex >= 0 ? { teamIndex: myTeamIndex, slotIndex } : null;
  } else {
    userAssignment.value = null;
  }
};

/* --- Refresh + Polling logic --- */

const getUserQuery = () => ({
  userId: userStore.user?.id ?? 'dev-user',  // safe fallback
  displayName: userStore.displayName,
  avatarUrl: userStore.avatarUrl,
});

// Temp until web socket integration 
const refreshLobby = async () => {
  try {
    isSyncing.value = true;
    const dto = await getLobby(lobbyId, getUserQuery());
    applyLobbyDto(dto);
    statusMessage.value = null;
  } catch (e: any) {
    statusMessage.value = e?.message ?? 'Failed to sync lobby';
  } finally {
    isSyncing.value = false;
  }
};

const startLobbyPolling = () => {
  if (lobbyPollId) return;
  lobbyPollId = window.setInterval(() => {
    if (document.visibilityState === 'visible') refreshLobby();
  }, 2000); // 1000–2000ms is ideal for dev
};

const stopLobbyPolling = () => {
  if (lobbyPollId) window.clearInterval(lobbyPollId);
  lobbyPollId = null;
};

onMounted(async () => {
  await refreshLobby();   // initial load from API
  startLobbyPolling();    // keep in sync

  updateRemaining();
  timerId = window.setInterval(updateRemaining, 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshLobby();
  });
});

onBeforeUnmount(() => {
  stopLobbyPolling();
  if (timerId !== null) clearInterval(timerId);
});



/* --- Bid Popup logic --- */

const bidPopupOpen = ref(false);
const bidPopupRoleName = ref<string>('Top');
const bidPopupQueuePosition = ref<number>(3);
const bidPopupTopBid = ref<number | null>(5);

const onClickQueueForRole = (role: RoleKey) => {
  bidPopupTeamIndex.value = selectedTeamIndex.value;
  bidPopupRoleName.value = roleLabel(role);
  bidPopupQueuePosition.value = 3;
  bidPopupTopBid.value = teamTopBids[bidPopupTeamIndex.value][role];
  bidPopupOpen.value = true;
};

const handleBidSubmit = async (amount: number) => {
  const roleKey = roles.find(r => r.label === bidPopupRoleName.value)?.key;
  if (!roleKey) return;

  const teamIndex = bidPopupTeamIndex.value;
  try {
    const res = await placeBid(
      lobbyId,
      { teamIndex, role: roleKey, amount },
      getUserQuery()
    );

    // If you became top bidder, show the animation (per team)
    if (res?.didBecomeTopBidder) {
      winnerRoleByTeam[teamIndex] = roleKey;
      window.setTimeout(() => {
        if (winnerRoleByTeam[teamIndex] === roleKey) {
          winnerRoleByTeam[teamIndex] = null;
        }
      }, 1200);
    }

    // Always refresh after bid so UI updates immediately
    await refreshLobby();
  } catch (e: any) {
    statusMessage.value = e?.message ?? 'Bid failed';
  }

  bidPopupOpen.value = false;
};

const handleBidCancel = () => {
  bidPopupOpen.value = false;
};

/** --- Result Popup Logic --- */

const resultPopupOpen = ref(false);
const resultDidWin = ref(false);
const resultWonRoleName = ref<string | null>(null);
const resultMatchCode = ref<string | null>(null);
const hasShownResultPopup = ref(false);

const showResultPopupForCurrentUser = () => {
  hasShownResultPopup.value = true;

  if (userAssignment.value) {
    // Demo logic: if you were assigned a slot, you "won"
    const { teamIndex, slotIndex } = userAssignment.value;
    const role = teams[teamIndex].slots[slotIndex].role;

    resultDidWin.value = true;
    resultWonRoleName.value = roleLabel(role);

    // Demo match code – later replace with API response
    resultMatchCode.value = 'DEMO-ABCD-1234';
  } else {
    // You didn't win any role
    resultDidWin.value = false;
    resultWonRoleName.value = null;
    resultMatchCode.value = null;
  }

  resultPopupOpen.value = true;
};

const handleResultClose = () => {
  resultPopupOpen.value = false;
};


/* --- Countdown timer --- */

const remainingSeconds = ref(0);
let timerId: number | null = null;

const updateRemaining = () => {
  const now = Date.now();
  const start = new Date(lobbyStartsAtIso.value).getTime();
  const diffMs = Math.max(0, Math.floor((start - now) / 1000));

  const previous = remainingSeconds.value;
  remainingSeconds.value = diffMs;

  if (diffMs === 0 && previous > 0 && !hasShownResultPopup.value) {
    // Timer just finished – call API later, for now show popup
    showResultPopupForCurrentUser();
  }
};

const formattedRemaining = computed(() => {
  const s = remainingSeconds.value;
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

</script>

<style scoped>
/* Overall lobby frame – dark, blue-tinted, LoL-like shell */
.lobby {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 1.5rem 2rem 2rem;
  border-radius: 10px;
  border: 1px solid #243851;
  box-shadow:
    0 0 0 1px rgba(12, 20, 32, 0.9),
    0 18px 35px rgba(0, 0, 0, 0.75);
  background:
    radial-gradient(circle at top left, #1b3358 0, #050812 55%, #02040a 100%);
  color: #f5f7ff;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* Header bar mimicking LoL panel header */
.lobby__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  margin: 0 -0.75rem;
  border-radius: 6px;
  background: linear-gradient(to bottom, #1e3148, #071321);
  box-shadow:
    inset 0 1px 0 rgba(214, 234, 255, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.7);
  border: 1px solid #304766;
}

.lobby__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.division-icon {
  width: 76px;
  height: 76px;
  object-fit: contain;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.25))
          drop-shadow(0 0 12px rgba(255, 120, 0, 0.3));
}

.lobby__title-text h1 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lobby__subtitle {
  font-size: 0.8rem;
  color: #9fb4d8;
}

/* Timer panel – styled like a small right-hand info box */
.lobby__timer {
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  min-width: 170px;
  text-align: right;
  background: linear-gradient(to bottom, #18253a, #090f1b);
  border: 1px solid #50678b;
  box-shadow: inset 0 1px 0 rgba(205, 220, 248, 0.2);
}

.lobby__timer--started {
  border-color: #4caf50;
  box-shadow:
    inset 0 0 6px rgba(76, 175, 80, 0.4),
    0 0 8px rgba(76, 175, 80, 0.35);
}

.lobby__timer-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #ffb547;
}

.lobby__timer--started .lobby__timer-label {
  color: #7fed7f;
}

.lobby__timer-value {
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  color: #f5f7ff;
}

/* Teams layout */
.lobby__body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

/* Side title */
.team__name {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #c0d0f4;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.9);
}

/* Slot list panel */
.team__slots {
  list-style: none;
  margin: 0;
  padding: 0.35rem;
  border-radius: 6px;
  border: 1px solid #283a54;
  background: linear-gradient(to bottom, #111b2b, #050913);
  box-shadow: inset 0 1px 0 rgba(214, 234, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* Each player row */
.slot {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.55rem;
  border-radius: 4px;
  background: linear-gradient(to right, #111827, #060a13);
  border: 1px solid #1f3145;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.75);
  min-height: 52px;
}

.slot--filled {
  border-color: #3ca9ff;
  background: linear-gradient(to right, #16253a, #071529);
  box-shadow:
    0 0 6px rgba(43, 134, 255, 0.55),
    inset 0 0 2px rgba(0, 0, 0, 0.9);
}

/* Square-ish avatar mimicking small icons */
.slot__avatar {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #50678b;
  background: radial-gradient(circle at 30% 25%, #202e47, #05070c);
}

.slot__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.slot--filled .slot__avatar {
  border-color: #3ca9ff;
}

/* Name + role text */
.slot__info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.slot__name {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f5f7ff;
}

.slot__role {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #9fb4d8;
}

.slot__left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.slot__bid {
  margin-left: auto;
  text-align: right;
  font-size: 0.78rem;
  position: relative;
}

@keyframes winnerFloat {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-18px);
  }
}

.slot__winner-float {
  position: absolute;
  right: 0.4rem;
  top: -0.4rem;
  font-size: 1rem;
  font-weight: 700;
  color: #22c55e;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.9);
  pointer-events: none;
  animation: winnerFloat 1.2s ease-out forwards;
}

.slot__bid-label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #9fb4d8;
}

.slot__bid-value {
  font-size: 0.86rem;
  font-weight: 600;
  color: #22c55e;
}

/* Footer bar */
.lobby__footer {
  border-top: 1px solid #283a54;
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Queue buttons styled like LoL blue buttons */
.queue-buttons {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.5rem;
}

.queue-buttons__btn {
  padding: 0.55rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #1b3b64;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  background:
    linear-gradient(to bottom, #3f7ac4, #21426f);
  color: #e5f0ff;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.9);
  box-shadow:
    0 2px 0 #132844,
    0 4px 8px rgba(0, 0, 0, 0.7);
  transition:
    transform 0.05s ease-out,
    box-shadow 0.05s ease-out,
    filter 0.1s ease-out;
}

.queue-buttons__btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 3px 0 #132844,
    0 6px 12px rgba(0, 0, 0, 0.85);
  filter: brightness(1.1);
}

.queue-buttons__btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow:
    0 1px 0 #0a1525,
    0 3px 6px rgba(0, 0, 0, 0.9);
}

.queue-buttons__btn:disabled {
  cursor: not-allowed;
  background: linear-gradient(to bottom, #3c4558, #222733);
  border-color: #343a49;
  box-shadow: none;
  opacity: 0.7;
}

/* Status line (like a subtle system message above chat) */
.lobby__status {
  font-size: 0.8rem;
  color: #d6e2ff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

.team-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.team-selector__btn {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid #1b3b64;
  background: linear-gradient(to bottom, #243b63, #151f35);
  color: #dbeafe;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  opacity: 0.7;
}

.team-selector__btn--active {
  opacity: 1;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.8);
  border-color: #3b82f6;
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
