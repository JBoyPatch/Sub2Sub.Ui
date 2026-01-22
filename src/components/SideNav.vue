<template>
  <nav class="side-nav">
    <div class="side-nav__title">Navigation</div>
    <ul>
      <li>
        <button class="nav-btn" @click="$router.push('/')">Home</button>
      </li>
      <li>
        <button class="nav-btn" @click="$router.push('/profile')">My Profile</button>
      </li>
      <li>
        <button class="nav-btn" @click="$router.push('/stats')">War Stats</button>
      </li>
      <li>
        <button class="nav-btn" @click="$router.push('/leaders')">Leaderboards</button>
      </li>
      <li v-if="userStore.isAdmin">
        <button class="nav-btn nav-btn--highlight" @click="$router.push('/create-lobby')">Create Lobby</button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/userStore';
// Simple left-side navigation
const userStore = useUserStore();
</script>

<style scoped>
.side-nav {
  position: fixed;
  top: 64px; /* below header */
  left: 0;
  bottom: 0;
  width: 230px;
  padding: 1.1rem 1rem;
  z-index: 20;
  background:
    radial-gradient(circle at top, rgba(30, 78, 135, 0.6), transparent 55%),
    linear-gradient(180deg, rgba(6, 11, 24, 0.98), rgba(3, 7, 16, 0.98));
  border-right: 1px solid rgba(20, 40, 70, 0.9);
  box-shadow: 10px 0 26px rgba(0, 0, 0, 0.8);
}

.side-nav__title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9fb4d8;
  margin-bottom: 0.75rem;
}

.side-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nav-btn {
  position: relative;
  width: 100%;
  text-align: left;
  padding: 0.55rem 0.8rem 0.55rem 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(138, 176, 228, 0.18);
  background: linear-gradient(135deg, rgba(10, 19, 38, 0.95), rgba(7, 14, 28, 0.95));
  color: #dfefff;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.86rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  overflow: hidden;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.08s ease,
    border-color 0.15s ease;
}

.nav-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12%;
  bottom: 12%;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(246, 210, 128, 0.0),
    rgba(246, 210, 128, 0.9),
    rgba(34, 183, 255, 0.9),
    rgba(34, 183, 255, 0.0)
  );
  opacity: 0;
  transition: opacity 0.15s ease;
}

.nav-btn:hover {
  background: radial-gradient(circle at top left, rgba(36, 101, 182, 0.8), rgba(9, 18, 37, 0.98));
  border-color: rgba(246, 210, 128, 0.65);
  box-shadow:
    0 0 12px rgba(20, 125, 225, 0.6),
    0 0 18px rgba(5, 13, 28, 0.9);
  transform: translateY(-1px);
}

.nav-btn:hover::before {
  opacity: 1;
}

/* optional "active" style if you add a class later */
.nav-btn.is-active {
  background: radial-gradient(circle at left, rgba(36, 101, 182, 0.9), rgba(9, 18, 37, 1));
  border-color: rgba(246, 210, 128, 0.9);
  box-shadow:
    0 0 14px rgba(246, 210, 128, 0.65),
    0 0 20px rgba(6, 20, 45, 0.95);
}

.nav-btn.is-active::before {
  opacity: 1;
}
</style>
