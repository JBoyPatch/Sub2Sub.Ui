<template>
  <div class="page-placeholder">
    <h2>My Profile</h2>

    <div v-if="!userId">
      <p>Please sign in to link your Riot account.</p>
    </div>

    <div v-else>
      <LinkRiotAccount :userId="userId" @linked="onLinked" />

      <div v-if="riotProfile" class="linked-notice">
        <h3>Linked Riot Account Saved</h3>
        <p>{{ riotProfile.riotGameName }}#{{ riotProfile.riotTagline }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LinkRiotAccount from '../components/LinkRiotAccount.vue'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()
const userId = computed(() => userStore.user?.id ?? '')

const riotProfile = ref<any | null>(null)

function onLinked(profile: any) {
  riotProfile.value = profile
}
</script>

<style scoped>
.page-placeholder { max-width: 900px; margin: 2rem auto; }
.linked-notice { margin-top: 12px; background:#f6ffef; padding:8px; border:1px solid #d4f5c4 }
</style>
