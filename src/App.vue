<template>
  <AppHeader v-if="showShell" />
  <div class="app-shell">
    <SideNav v-if="showShell" />
    <main :class="['app-content', { 'app-content--with-shell': showShell }]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import SideNav from './components/SideNav.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useUserStore } from './stores/userStore';

const route = useRoute();
const userStore = useUserStore();

const showShell = computed(() => {
  // Only show header/side nav when authenticated
  return userStore.isLoggedIn;
});
</script>

<style scoped>


.app-shell { display: block; }
.app-content { margin-left: 0; padding: 0; max-width: none; width: 100%; margin-top: 0; }
.app-content--with-shell { margin-left: 260px; margin-top: 80px; padding: 1.75rem; max-width: 1200px; margin-right: auto; }

/* ensure top spacing to account for header height when shell is visible */
main.app-content.app-content--with-shell { padding-top: 1rem; }

@media (max-width: 900px) {
  .app-content { margin-left: 0; padding: 1rem; }
  .side-nav { display: none; }
}
</style>

