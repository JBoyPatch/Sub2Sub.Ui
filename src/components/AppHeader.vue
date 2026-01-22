<template>
  <header class="app-header">
    <div class="app-header__left">
      <img src="@/assets/pngsubwars-logo.png" alt="logo" class="auth-logo-small" />
      <router-link to="/" class="app-header__brand">
        SUB WARS
        <span class="app-header__brand-sub">Lobby Based Tournement Matchmaking</span>
      </router-link>
    </div>

    <div class="app-header__right">
      <div class="user-pill">
        <img
          v-if="userStore.avatarUrl"
          :src="userStore.avatarUrl"
          alt="avatar"
          class="avatar"
        />

        <div class="user-info">
          <div class="user-name">{{ userStore.displayName }}</div>
          <div class="user-credits">{{ userStore.credits }} Credits</div>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">Log out</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-header {
  position: fixed;
  inset: 0 0 auto 0;
  height: 64px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 40;
  color: #eaf2ff;

  background:
    radial-gradient(circle at top, rgba(33, 92, 175, 0.6), transparent 55%),
    linear-gradient(90deg, rgba(6, 12, 26, 0.98), rgba(4, 9, 20, 0.98));
  box-shadow:
    0 10px 30px rgba(1, 3, 10, 0.9),
    inset 0 -1px 0 rgba(20, 40, 70, 0.9);
  border-bottom: 1px solid rgba(246, 210, 128, 0.12);
}

.app-header::after {
  content: '';
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(246, 210, 128, 0.95),
    rgba(37, 177, 255, 0.95),
    transparent
  );
  pointer-events: none;
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-header__brand {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #fdf6e3;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.82rem;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.85);
}

.app-header__brand-sub {
  font-weight: 500;
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #9fb4d8;
}

.auth-logo-small {
  width: 48px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(0, 196, 255, 0.6));
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: radial-gradient(circle at top, rgba(35, 88, 150, 0.7), rgba(9, 18, 37, 0.95));
  box-shadow: 0 0 10px rgba(0, 134, 214, 0.45);
  border: 1px solid rgba(134, 182, 247, 0.35);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
}

.user-info {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  text-align: left;
}

.user-name {
  font-weight: 700;
}

.user-credits {
  font-size: 0.72rem;
  color: #f7d993;
}

/* Gold primary button similar to login */
.logout-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  border: 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0b1324;
  background: radial-gradient(circle at top, #ffe6aa, #f3b654);
  box-shadow:
    0 0 8px rgba(250, 213, 120, 0.75),
    0 5px 12px rgba(0, 0, 0, 0.7);
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease,
    filter 0.08s ease;
}

.logout-btn:hover {
  filter: brightness(1.07);
  transform: translateY(-1px);
  box-shadow:
    0 0 12px rgba(246, 208, 125, 0.95),
    0 7px 16px rgba(0, 0, 0, 0.75);
}

.logout-btn:active {
  transform: translateY(1px);
  box-shadow:
    0 0 6px rgba(246, 208, 125, 0.7),
    0 3px 8px rgba(0, 0, 0, 0.65);
}
</style>
