<template>
  <div class="link-riot">
    <h3>Linked Riot Account</h3>

    <!-- If a profile exists and the form is hidden, render compact tile -->
    <div v-if="profile && !showForm" class="profile-tile">
      <div class="tile-left">
        <img v-if="profile.riotProfileIconId && !avatarBroken" :src="avatarSrc" alt="avatar" class="avatar" @error="onAvatarError" />
        <div v-else class="avatar-fallback">{{ avatarInitials(profile) }}</div>
      </div>
      <div class="tile-main">
        <div class="tile-title">{{ profile.riotGameName }}#{{ profile.riotTagline }}</div>
        <div class="tile-sub">Level: {{ profile.riotSummonerLevel ?? '—' }} • Summoner ID: {{ profile.riotSummonerId ?? '—' }}</div>
        <div class="tile-sub">PUUID: {{ shortened(profile.riotPuuid) }}</div>
      </div>
      <div class="tile-actions">
        <button @click="openForm">Link Account</button>
        <button class="secondary" @click="refreshProfile">Refresh</button>
      </div>
    </div>

    <!-- Show form when no profile or when user wants to edit/link -->
    <div v-else>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="successMessage" class="success">{{ successMessage }}</div>

      <div class="form-row">
        <label>Game Name</label>
        <input v-model="gameName" placeholder="Username" />
      </div>

      <div class="form-row">
        <label>Tagline / Region</label>
        <input v-model="tagLine" placeholder="NA1" />
      </div>

      <div class="form-row">
        <label>Test Riot Token (optional)</label>
        <input v-model="testToken" placeholder="Only for local testing" />
      </div>

      <div class="actions">
        <button :disabled="loading" @click="linkAccount">Link Riot Account</button>
        <span v-if="loading">Linking...</span>
      </div>

      <div v-if="profile" class="profile">
        <h4>Riot Profile</h4>
        <div><strong>Name:</strong> {{ profile.riotGameName }}#{{ profile.riotTagline }}</div>
        <div><strong>PUUID:</strong> {{ shortened(profile.riotPuuid) }}</div>
        <div v-if="profile.riotSummonerId"><strong>Summoner ID:</strong> {{ profile.riotSummonerId }}</div>
        <div v-if="profile.riotSummonerLevel !== null"><strong>Level:</strong> {{ profile.riotSummonerLevel }}</div>
        <div v-if="profile.riotProfileIconId !== null"><strong>Icon ID:</strong> {{ profile.riotProfileIconId }}</div>
        <div><strong>Last Sync:</strong> {{ formatEpoch(profile.lastRiotProfileSyncAtEpoch) }}</div>

        <div class="sync-actions">
          <button :disabled="loadingSync" @click="syncAll">Sync All</button>
          <button :disabled="loadingSync" @click="syncRanked">Sync Ranked</button>
          <button :disabled="loadingSync" @click="syncMatches">Sync Matches</button>
          <button :disabled="loadingSync" @click="syncMastery">Sync Mastery</button>
          <button :disabled="loadingSync" @click="refreshProfile">Refresh & Close</button>
          <span v-if="loadingSync">Syncing...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{ userId: string }>()
const emit = defineEmits<{
  (e: 'linked', profile: any): void
}>()

const gameName = ref('')
const tagLine = ref('')
const testToken = ref('')

const loading = ref(false)
const loadingSync = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const profile = ref<any | null>(null)
const showForm = ref(true)

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (testToken.value) h['X-Riot-Token'] = testToken.value
  return h
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch (e) { data = { message: text || res.statusText } }
  if (!res.ok) {
    const msg = data && data.message ? data.message : (res.statusText || 'Request failed')
    throw new Error(msg)
  }
  return data as T
}

// Normalize API base:
// - In dev, use the local proxy path so requests go through Vite: '/api/$default'
// - In prod, use the configured VITE_API_BASE_URL but strip any trailing slash to avoid double-slashes
const rawEnv = (import.meta as any).env || {}
const apiBase = rawEnv.DEV
  ? '/api/$default'
  : ((rawEnv.VITE_API_BASE_URL as string) || (rawEnv.VITE_API_BASE as string) || '')?.replace(/\/$/, '')
const dragonVersion = (import.meta as any).env?.VITE_DRAGON_VERSION || '13.6.1'
const dragonBase = `https://ddragon.leagueoflegends.com/cdn/${dragonVersion}`

function avatarUrl(iconId: number | string) {
  return `${dragonBase}/img/profileicon/${iconId}.png`
}

const avatarBroken = ref(false)
const avatarSrc = ref('')

function onAvatarError() {
  avatarBroken.value = true
}

function avatarInitials(p: any) {
  const name = p?.riotGameName ?? ''
  if (!name) return '—'
  return name.slice(0,2).toUpperCase()
}

// update avatarSrc when profile changes
watch(profile, (p) => {
  avatarBroken.value = false
  if (p && p.riotProfileIconId) avatarSrc.value = avatarUrl(p.riotProfileIconId)
  else avatarSrc.value = ''
}, { immediate: true })

async function linkAccount() {
  error.value = null
  successMessage.value = null
  if (!gameName.value.trim() || !tagLine.value.trim()) {
    error.value = 'Please provide both Game Name and Tagline.'
    return
  }
  loading.value = true
  try {
    const payload = { gameName: gameName.value.trim(), tagLine: tagLine.value.trim().toLowerCase() }
    const url = `${apiBase}/users/${encodeURIComponent(props.userId)}/riot/link`
    console.debug('[LinkRiotAccount] POST', url, payload)
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    })
    const data = await handleResponse<any>(res)
    profile.value = data
    successMessage.value = 'Linked successfully.'
    emit('linked', profile.value)
    // hide form and show compact tile after linking
    showForm.value = false
  } catch (e: any) {
    console.error('[LinkRiotAccount] linkAccount error', e)
    error.value = e?.message || 'Failed to link Riot account.'
  } finally {
    loading.value = false
  }
}

async function refreshProfile() {
  if (!props.userId) return
  loadingSync.value = true
  error.value = null
  try {
    const url = `${apiBase}/users/${encodeURIComponent(props.userId)}/riot/profile`
    console.debug('[LinkRiotAccount] GET', url)
    const res = await fetch(url, { headers: headers() })
    const data = await handleResponse<any>(res)
    profile.value = data
    successMessage.value = 'Profile refreshed.'
  } catch (e: any) {
    error.value = e?.message || 'Failed to refresh profile.'
  } finally {
    loadingSync.value = false
  }
}

async function doPost(path: string, successText = 'Sync complete') {
  loadingSync.value = true
  error.value = null
  try {
    const url = `${apiBase}/users/${encodeURIComponent(props.userId)}/riot/${path}`
    console.debug('[LinkRiotAccount] POST', url)
    const res = await fetch(url, { method: 'POST', headers: headers() })
    await handleResponse<any>(res)
    successMessage.value = successText
  } catch (e: any) {
    error.value = e?.message || 'Sync failed.'
  } finally {
    loadingSync.value = false
  }
}

// fetch profile on mount and whenever userId becomes available/changes
watch(() => props.userId, (v) => {
  if (v) refreshProfile()
}, { immediate: true })

// when profile changes, hide the form if profile exists, otherwise show form
watch(profile, (p) => {
  showForm.value = !p
  // if profile populated, prefill inputs for convenience
  if (p) {
    gameName.value = p.riotGameName ?? gameName.value
    tagLine.value = p.riotTagline ?? tagLine.value
  }
}, { immediate: true })

function openForm() {
  showForm.value = true
}

function syncAll() { return doPost('sync', 'Sync all complete') }
function syncRanked() { return doPost('sync-ranked', 'Sync ranked complete') }
function syncMatches() { return doPost('sync-matches', 'Sync matches complete') }
function syncMastery() { return doPost('sync-mastery', 'Sync mastery complete') }

function shortened(s: string | null | undefined) {
  if (!s) return ''
  return s.length > 12 ? s.slice(0, 8) + '…' + s.slice(-4) : s
}

function formatEpoch(epoch: number | null | undefined) {
  if (!epoch) return 'never'
  try { return new Date(epoch).toLocaleString() } catch { return String(epoch) }
}

// expose for parent access
defineExpose({ profile })
</script>

<style scoped>
/* Dark League-like launcher theme */
.link-riot {
  max-width: 640px;
  background: linear-gradient(180deg, #0b1220 0%, #0f1724 60%);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 6px 18px rgba(2,6,23,0.6);
  padding: 18px;
  border-radius: 10px;
  color: #e6eef8;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}
.link-riot h3 {
  margin: 0 0 12px 0;
  color: #ffd27a;
  text-shadow: 0 1px 0 rgba(0,0,0,0.6);
}
.form-row { margin-bottom: 12px; display:flex; flex-direction:column }
.form-row label { font-size: 12px; color: rgba(230,238,248,0.7); margin-bottom:6px }
.form-row input {
  padding: 10px 12px;
  font-size: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  color: #e6eef8;
  border-radius: 6px;
  outline: none;
}
.form-row input::placeholder { color: rgba(230,238,248,0.35) }
.actions { margin: 12px 0; display:flex; align-items:center; gap:12px }
button {
  background: linear-gradient(180deg,#ffcc66,#ffb84d);
  color: #1a1a1a;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(255,184,77,0.12);
}
button[disabled] { opacity: 0.6; cursor: not-allowed }
.actions span { color: rgba(230,238,248,0.7); font-size: 13px }
.sync-actions { margin-top: 14px; display:flex; gap:8px; flex-wrap:wrap }
.sync-actions button { background: linear-gradient(180deg,#2b5a7a,#1f3a52); color: #e6eef8; padding:6px 10px; border-radius:6px; font-weight:600 }
.sync-actions span { color: rgba(230,238,248,0.7); font-size:13px }
.error { color: #ff6b6b; margin-top:8px; background: rgba(255,107,107,0.06); padding:6px 8px; border-radius:6px }
.success { color: #9be08a; margin-top:8px; background: rgba(155,224,138,0.04); padding:6px 8px; border-radius:6px }
.profile {
  margin-top: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.03);
}
.profile h4 { margin: 0 0 8px 0; color: #ffd27a }
.profile div { margin: 4px 0; color: rgba(230,238,248,0.9) }

/* compact tile */
.profile-tile { display:flex; align-items:center; gap:12px; padding:10px; border-radius:8px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03) }
.tile-left { width:64px; height:64px; display:flex; align-items:center; justify-content:center }
.avatar { width:64px; height:64px; border-radius:8px; object-fit:cover; border:1px solid rgba(255,255,255,0.04); box-shadow: 0 4px 12px rgba(0,0,0,0.6) }
.avatar-fallback { width:64px; height:64px; border-radius:8px; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg,#1b3358,#0b1220); color:#ffd27a; font-weight:700; font-size:20px; border:1px solid rgba(255,255,255,0.04) }
.tile-main { flex:1 }
.tile-title { font-size:16px; font-weight:700; color:#ffd27a }
.tile-sub { font-size:13px; color: rgba(230,238,248,0.78); margin-top:4px }
.tile-actions { display:flex; gap:8px }
.tile-actions .secondary { background: linear-gradient(180deg,#0f394f,#0c2b3c); color:#e6eef8 }

/* small screens */
@media (max-width: 480px) {
  .link-riot { padding: 12px }
  .form-row input { padding: 8px }
  button { padding: 8px 10px }
}
</style>
