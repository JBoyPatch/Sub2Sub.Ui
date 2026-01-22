<template>
  <div class="create-lobby-page">
    <h2>Create Lobby</h2>

    <div v-if="!userStore.isAdmin" class="not-authorized">
      You are not authorized to create lobbies.
    </div>

    <form v-else @submit.prevent="onSubmit" class="create-form">
      <label>
        <span class="label-text">Tournament Name</span>
        <input v-model="tournamentName" required />
      </label>

      <label>
        <span class="label-text">Starts At</span>
        <input v-model="startsAtIso" type="datetime-local" required />
      </label>

      <div class="actions">
        <button type="submit" class="primary-btn" :disabled="loading">Create</button>
        <button type="button" class="ghost-link" @click="onCancel">Cancel</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { createLobby } from '../api/lobbyApi';

const router = useRouter();
const userStore = useUserStore();

const tournamentName = ref('');
const startsAtIso = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const onCancel = () => router.push('/');

const onSubmit = async () => {
  error.value = null;
  loading.value = true;
  try {
    const payload = { tournamentName: tournamentName.value, startsAtIso: startsAtIso.value };
    const res = await createLobby(payload);
    // navigate to lobby page if created
    const id = res?.lobbyId || res?.id;
    if (id) router.push({ path: '/lobby', query: { lobbyId: id } });
    else router.push('/');
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-lobby-page { max-width: 720px; margin: 2rem auto; color: #eaf2ff; }
.create-form { display:flex; flex-direction:column; gap:0.75rem; }
.label-text { display:block; font-size:0.85rem; color:#9fb4d8; margin-bottom:0.25rem; }
.actions { display:flex; gap:0.6rem; margin-top:0.6rem; }
.error { color: #ffb4b4; }
.not-authorized { padding:1rem; background: rgba(255,255,255,0.02); border-radius:8px; }
</style>
