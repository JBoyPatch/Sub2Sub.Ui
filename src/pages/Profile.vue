<template>
  <div class="page-placeholder">
    <h2>My Profile</h2>


    <div v-if="!userId">
      <p>Please sign in to view your profile or link your Riot account.</p>
    </div>

    <div v-else>
      <div class="top-row">
        <div class="profile-left">
          <div class="user-info-card" v-if="userInfo || userStore.user">
            <div class="avatar-row">
              <img v-if="userStore.avatarUrl" :src="userStore.avatarUrl" alt="avatar" class="avatar-large" @error="avatarBroken = true" />
              <div v-else class="avatar-fallback-lg">{{ initials }}</div>
            </div>
            <div class="user-row"><strong>Username:</strong> {{ displayUsername }}</div>
            <div class="user-row"><strong>Credits:</strong> {{ displayCredits }}</div>

            <label class="label-text">Avatar URL</label>
            <input v-model="avatarEdit" placeholder="https://..." />
            <div class="user-actions">
              <button @click="saveAvatarUrl" :disabled="savingAvatar">Save Avatar</button>
              <button class="secondary" @click="refreshFull" :disabled="loading">Refresh Full Profile</button>
            </div>
          </div>

          <LinkRiotAccount :userId="userId" @linked="onLinked" ref="linkComp" />
        </div>

        <div class="user-card" v-if="userInfo || userStore.user">
          <h3>Account</h3>
          <div class="user-row"><strong>Username:</strong> {{ displayUsername }}</div>
          <div class="user-row"><strong>Credits:</strong> {{ displayCredits }}</div>
          <div class="user-actions">
            <button @click="refreshFull" :disabled="loading">Refresh Full Profile</button>
            <button class="secondary" @click="triggerSync" :disabled="loadingSync">Sync Riot Data</button>
          </div>
          <div v-if="loading" class="meta">Loading...</div>
        </div>
      </div>

      <div class="sections">
        <div v-if="fetchError" class="error">{{ fetchError }}</div>
        <section v-if="profileFull?.riotProfile" class="section">
          <h3>Riot Profile</h3>
          <div class="section-card">
            <div class="rp-row"><strong>Name:</strong> {{ profileFull.riotProfile.riotGameName }}#{{ profileFull.riotProfile.riotTagline }}</div>
            <div class="rp-row"><strong>Level:</strong> {{ profileFull.riotProfile.riotSummonerLevel ?? '—' }}</div>
            <div class="rp-row"><strong>Summoner ID:</strong> {{ profileFull.riotProfile.riotSummonerId ?? '—' }}</div>
            <div class="rp-row"><strong>Last Sync:</strong> {{ formatEpoch(profileFull.riotProfile.lastRiotProfileSyncAtEpoch) }}</div>
          </div>
          <div v-if="profileFull?.riotProfile && (!profileFull?.ranked || !profileFull.ranked.length) && !profileFull.riotProfile.riotSummonerId" class="notice">
            Ranked data requires Riot account verification — re-link if missing.
          </div>
        </section>

        <section v-if="profileFull?.ranked?.length" class="section">
          <h3>Ranked</h3>
          <div class="section-card">
            <div v-for="r in profileFull.ranked" :key="r.queueType" class="rank-row">
              <div class="rank-title">{{ r.queueType }}</div>
              <div class="rank-sub">{{ r.tier }} {{ r.rank }} • {{ r.leaguePoints }} LP • {{ r.wins }}W/{{ r.losses }}L</div>
            </div>
          </div>
        </section>

        <section v-if="profileFull?.mastery?.length" class="section">
          <h3>Top Mastery</h3>
          <div class="section-card mastery-grid">
            <div v-for="m in profileFull.mastery" :key="m.championId" class="mastery-card">
              <div class="mastery-champ">{{ m.championName ?? m.championId }}</div>
              <div class="mastery-points">{{ m.championPoints }}</div>
              <div class="mastery-level">Lvl {{ m.championLevel }}</div>
            </div>
          </div>
        </section>

        <section v-if="profileFull?.matches?.length" class="section">
          <h3>Recent Matches</h3>
          <div class="section-card matches-list">
            <div v-for="mm in profileFull.matches" :key="mm.matchId" class="match-row">
              <div class="match-left">
                <div class="match-champ">{{ mm.championName }} ({{ mm.championId }})</div>
                <div class="match-queue">Queue: {{ mm.queueId }}</div>
              </div>
              <div class="match-stats">K/D/A: {{ mm.kills }}/{{ mm.deaths }}/{{ mm.assists }} • CS: {{ mm.creepScore }} • Gold: {{ mm.goldEarned }}</div>
              <div class="match-result">{{ mm.win ? 'Win' : 'Loss' }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import LinkRiotAccount from '../components/LinkRiotAccount.vue'
import { useUserStore } from '../stores/userStore'
import usersApi from '../api/usersApi'

const userStore = useUserStore()
const userId = computed(() => userStore.user?.id ?? '')

const profileFull = ref<any | null>(null)
const userInfo = ref<any | null>(null)
const loading = ref(false)
const loadingSync = ref(false)
const linkComp = ref<any | null>(null)
const fetchError = ref<string | null>(null)
const avatarEdit = ref('')
const savingAvatar = ref(false)
const avatarBroken = ref(false)

const initials = computed(() => {
  const name = userInfo.value?.username || userStore.user?.username || ''
  if (!name) return ''
  const parts = name.split(/\s+/)
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
})

const displayUsername = computed(() => userInfo.value?.username ?? userStore.user?.username ?? '')
const displayCredits = computed(() => (userInfo.value?.credits ?? userStore.user?.credits ?? '—'))

function formatEpoch(epoch: number | null | undefined) {
  if (!epoch) return 'never'
  try { return new Date(epoch).toLocaleString() } catch { return String(epoch) }
}

async function fetchFull(uId?: string) {
  if (!uId) return
  loading.value = true
  try {
    fetchError.value = null
    const data = await usersApi.getProfileFull(uId, { matches: 10, mastery: 5 })
    profileFull.value = data
    userInfo.value = data?.user ?? null
    // if LinkRiotAccount child exists, give it the profile object for its internal state
    if (linkComp.value && data?.riotProfile) linkComp.value.profile = data.riotProfile
    // initialize avatar edit field from store or fetched user
    avatarEdit.value = userInfo.value?.avatarUrl ?? userStore.user?.avatarUrl ?? ''
  } catch (e: any) {
    console.error('fetchFull error', e)
    fetchError.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

async function refreshFull() { return fetchFull(userId.value) }

async function triggerSync() {
  if (!userId.value) return
  loadingSync.value = true
  try {
    // trigger server sync, then poll reads until data appears (2s interval, up to 3 attempts)
    await usersApi.postSync(userId.value)
    // poll helper
    const maxAttempts = 3
    const delayMs = 2000
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, delayMs))
      try {
        // prefer profile-full to get all pieces at once
        const data = await usersApi.getProfileFull(userId.value, { matches: 10, mastery: 5 })
        // if matches or ranked or mastery present, consider success
        const hasMatches = data?.matches && data.matches.length
        const hasRanked = data?.ranked && data.ranked.length
        const hasMastery = data?.mastery && data.mastery.length
        if (hasMatches || hasRanked || hasMastery) {
          profileFull.value = data
          userInfo.value = data?.user ?? userInfo.value
          if (linkComp.value && data?.riotProfile) linkComp.value.profile = data.riotProfile
          break
        }
        // last attempt, still update profileFull with whatever we have
        if (attempt === maxAttempts - 1) {
          profileFull.value = data
        }
      } catch (e: any) {
        // surface fetch errors to UI but continue polling unless it's a fatal server error
        fetchError.value = e?.message ?? String(e)
        if (e?.status && e.status >= 500) {
          // server error — stop polling
          break
        }
      }
    }
  } catch (e: any) {
    console.error('triggerSync', e)
    // handle ApiError shapes from usersApi
    if (e?.status && e.status >= 400 && e.status < 500) fetchError.value = e.message || 'Request failed'
    else if (e?.message === 'Request timed out') fetchError.value = 'Request timed out'
    else fetchError.value = 'Server error — try again later'
  } finally {
    loadingSync.value = false
  }
}

function onLinked(profile: any) {
  // update local riot profile display and re-fetch full object
  profileFull.value = profileFull.value ?? {}
  profileFull.value.riotProfile = profile
}

watch(userId, (v) => {
  if (v) fetchFull(v)
}, { immediate: true })

onMounted(() => {
  // initialize avatar edit from store if profile fetch not yet available
  avatarEdit.value = userInfo.value?.avatarUrl ?? userStore.user?.avatarUrl ?? ''
  if (userId.value) fetchFull(userId.value)
})

async function saveAvatarUrl() {
  if (!userStore.user) return
  savingAvatar.value = true
  const val = (avatarEdit.value || '').trim() || null
  try {
    // persist to backend first; avoid UI flicker by keeping previous avatar until confirmed
    await usersApi.updateUser(userStore.user.id, { avatarUrl: val }, userStore.accessToken ?? undefined)
    // on success, update local store and profile data
    userStore.setAvatarUrl(val)
    if (userInfo.value) userInfo.value.avatarUrl = val
    if (profileFull.value && profileFull.value.user) profileFull.value.user.avatarUrl = val
  } catch (e: any) {
    // surface error to UI; do not modify local avatar state
    fetchError.value = e?.message ?? String(e)
  } finally {
    savingAvatar.value = false
  }
}
</script>

<style scoped>
.page-placeholder { max-width: 1000px; margin: 2rem auto; }
.top-row { display:flex; gap:18px; align-items:flex-start; }
.profile-left { display:flex; flex-direction:column; gap:12px }
.user-info-card { background: linear-gradient(180deg,#071020,#0b1220); padding:16px; border-radius:12px; color:#e6eef8; border:1px solid rgba(255,255,255,0.04); width:340px; box-shadow: 0 6px 18px rgba(0,0,0,0.6); }
.user-info-card .avatar-row { display:flex; align-items:center; gap:12px; margin-bottom:12px }
.avatar-large { width:88px; height:88px; border-radius:10px; object-fit:cover; border:1px solid rgba(255,255,255,0.04); box-shadow: 0 6px 18px rgba(0,0,0,0.6) }
.avatar-fallback-lg { width:88px; height:88px; border-radius:10px; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg,#1b3358,#0b1220); color:#ffd27a; font-weight:700; font-size:22px; border:1px solid rgba(255,255,255,0.04) }
.user-card { background: linear-gradient(180deg,#071020,#0b1220); padding:14px; border-radius:10px; color:#e6eef8; border:1px solid rgba(255,255,255,0.03); width:320px }
.user-card h3 { margin:0 0 8px 0; color:#ffd27a }
.user-row { margin:6px 0 }
.user-actions { margin-top:12px; display:flex; gap:8px }
button { background: linear-gradient(180deg,#ffcc66,#ffb84d); color: #1a1a1a; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer }
button.secondary { background: linear-gradient(180deg,#0f394f,#0c2b3c); color:#e6eef8 }

/* input styling consistent with app */
.user-info-card .label-text { display:block; margin:6px 0 6px; color:#b4c8ea; font-size:0.88rem }
.user-info-card input { width:100%; padding:0.5rem 0.6rem; border-radius:8px; border:1px solid rgba(150,184,230,0.12); background: rgba(0,8,20,0.6); color:inherit; font-size:0.95rem; outline:none }
.user-info-card input:focus { border-color: rgba(42,196,255,0.9); box-shadow: 0 0 0 2px rgba(25,124,214,0.12) }

/* layout tweaks */
.user-info-card .meta-note { font-size:0.85rem; color:rgba(230,238,248,0.65); margin-top:8px }

@media (max-width: 720px) {
  .top-row { flex-direction:column }
  .user-card { width:100% }
  .user-info-card { width:100% }
  .avatar-large, .avatar-fallback-lg { width:72px; height:72px }
}
.sections { margin-top:18px; display:flex; flex-direction:column; gap:12px }
.section h3 { margin:0 0 8px 0; color:#ffd27a }
.section-card { padding:12px; border-radius:8px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03); color:#e6eef8 }
.rank-row { margin:6px 0 }
.mastery-grid { display:flex; gap:8px; flex-wrap:wrap }
.mastery-card { width:120px; padding:8px; background: rgba(255,255,255,0.02); border-radius:6px; text-align:center }
.matches-list .match-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.03) }
.match-left { display:flex; flex-direction:column }
.match-champ { font-weight:700 }
.meta { margin-top:8px; color: rgba(230,238,248,0.7) }

.error { color: #ff6b6b; margin-top:8px; background: rgba(255,107,107,0.04); padding:8px; border-radius:6px }
.notice { color: #ffd27a; margin-top:8px; background: rgba(255,210,122,0.03); padding:8px; border-radius:6px }

@media (max-width: 720px) {
  .top-row { flex-direction:column }
  .user-card { width:100% }
}
</style>
