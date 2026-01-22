<template>
  <div class="auth-page">
    <!-- floating glows -->
    <div class="auth-glow glow-1"></div>
    <div class="auth-glow glow-2"></div>

    <div class="auth-frame">
      <div class="auth-card">
        <header class="auth-header">
          <img
            class="auth-logo"
            src="@/assets/pngsubwars-logo.png"
            alt="Sub Wars"
          />
          <p class="tagline">Assemble your squad. Queue for glory.</p>
        </header>

        <div class="divider"></div>

        <h1 class="auth-title">Welcome, challenger</h1>
        <p class="muted">
          Sign in or create an account to join the lobby.
        </p>

        <div class="tabs">
          <button
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >
            Login
          </button>
          <button
            :class="{ active: mode === 'signup' }"
            @click="mode = 'signup'"
          >
            Sign up
          </button>
        </div>

        <form @submit.prevent="onSubmit" class="auth-form">
          <label>
            <span class="label-text">Username</span>
            <input
              v-model="username"
              required
              placeholder="Summoner name"
            />
          </label>

          <label v-if="mode === 'signup'">
            <span class="label-text">Email</span>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
            />
          </label>

          <label v-if="mode === 'signup'">
            <span class="label-text">Avatar URL (optional)</span>
            <input
              v-model="avatarUrl"
              placeholder="https://..."
            />
          </label>

          <label>
            <span class="label-text">Password</span>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
            />
          </label>

          <div class="actions">
            <button
              type="submit"
              :disabled="loading"
              class="primary-btn"
            >
              {{ loading ? 'Please wait…' : (mode === 'login' ? 'Enter War' : 'Create account') }}
            </button>
          </div>

          <p v-if="error" class="error">
            {{ error }}
          </p>
        </form>

        <p class="small muted footer-note">
          Local/dev auth placeholder — hook this into your backend later.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { signup as apiSignup, login as apiLogin, hashPassword } from '../api/authApi';

const router = useRouter();
const userStore = useUserStore();

const mode = ref<'login' | 'signup'>('login');
const username = ref('');
const avatarUrl = ref('');
const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

const onSubmit = async () => {
  error.value = null;
  loading.value = true;
  try {
    const pwHash = await hashPassword(password.value || '');

    if (mode.value === 'signup') {
      const res = await apiSignup(username.value, email.value || null, pwHash);
      if (!res.ok) throw new Error(res.message || 'Signup failed');

      const token = res.accessToken || (res as any).token || `token-${Date.now()}`;
      userStore.setUser({
        user: {
          id: `api-${username.value}`,
          username: res.username,
          avatarUrl: (res.avatarUrl ?? avatarUrl.value) || null,
          credits: res.credits ?? 0
        },
        accessToken: token
      });

      router.push({ path: '/' });
      return;
    }

    const res = await apiLogin(username.value, pwHash);
    if (!res.ok) throw new Error(res.message || 'Login failed');

    const token = res.accessToken || (res as any).token || `token-${Date.now()}`;
    userStore.setUser({
      user: {
        id: `api-${username.value}`,
        username: res.username,
        avatarUrl: (res.avatarUrl ?? avatarUrl.value) || null,
        credits: res.credits ?? 0
      },
      accessToken: token
    });

    router.push({ path: '/' });
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(circle at top, #1a3a5f 0, #050814 55%, #01030a 100%);
  color: #eaf2ff;
  overflow: hidden;
}

/* soft animated glows */
.auth-glow {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.35;
  pointer-events: none;
  mix-blend-mode: screen;
  animation: float 18s ease-in-out infinite alternate;
}

.glow-1 {
  top: -120px;
  left: -80px;
  background: radial-gradient(circle, #18b2ff 0, transparent 60%);
}

.glow-2 {
  bottom: -160px;
  right: -120px;
  background: radial-gradient(circle, #f6b75a 0, transparent 60%);
  animation-delay: 5s;
}

@keyframes float {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(20px, -30px, 0);
  }
}

.auth-frame {
  position: relative;
  z-index: 1;
  padding: 2px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(250, 210, 120, 0.9), rgba(34, 183, 255, 0.8));
  box-shadow:
    0 0 25px rgba(0, 0, 0, 0.9),
    0 0 40px rgba(10, 130, 200, 0.5);
}

.auth-card {
  width: 420px;
  max-width: 100%;
  padding: 1.75rem 2rem 1.5rem;
  border-radius: 22px;
  background:
    radial-gradient(circle at top, rgba(34, 73, 122, 0.5), transparent 50%),
    linear-gradient(180deg, rgba(10, 18, 32, 0.96), rgba(4, 8, 17, 0.98));
  box-shadow: inset 0 0 0 1px rgba(13, 35, 60, 0.9);
}

/* header / logo */
.auth-header {
  text-align: center;
  margin-bottom: 0.75rem;
}

.auth-logo {
  max-width: 260px;
  width: 80%;
  height: auto;
  display: block;
  margin: 0 auto 0.5rem;
}

.tagline {
  font-size: 0.9rem;
  color: #a8c2ff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* decorative divider */
.divider {
  height: 1px;
  margin: 0.5rem auto 1rem;
  max-width: 320px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(244, 215, 136, 0.9),
    rgba(34, 167, 255, 0.9),
    transparent
  );
  box-shadow: 0 0 6px rgba(0, 200, 255, 0.5);
}

.auth-title {
  margin: 0 0 0 4rem;
  font-size: 1.35rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.muted {
  color: #9fb4d8;
}

.small {
  font-size: 0.85rem;
}

.footer-note {
  margin-top: 0.75rem;
  text-align: center;
}

/* tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin: 0.85rem 0 0.75rem;
}

.tabs button {
  flex: 1;
  padding: 0.55rem 0.75rem;
  border-radius: 999px;
  background: rgba(8, 17, 32, 0.7);
  color: #c1d3ff;
  border: 1px solid rgba(154, 186, 231, 0.28);
  cursor: pointer;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    transform 0.08s ease;
}

.tabs button.active {
  background: radial-gradient(circle at top, #2c71d9, #17407d);
  border-color: rgba(246, 206, 120, 0.85);
  box-shadow:
    0 0 10px rgba(0, 186, 255, 0.5),
    0 0 20px rgba(8, 36, 82, 0.8);
  color: #fdf7e5;
  transform: translateY(-1px);
}

/* form */
.auth-form {
  margin-top: 0.25rem;
}

.auth-form label {
  display: block;
  margin: 0.55rem 0;
}

.label-text {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.85rem;
  color: #b4c8ea;
}

input {
  width: 100%;
  padding: 0.55rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(150, 184, 230, 0.35);
  background: rgba(0, 8, 20, 0.75);
  color: inherit;
  font-size: 0.95rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

input::placeholder {
  color: rgba(158, 184, 222, 0.55);
}

input:focus {
  border-color: rgba(42, 196, 255, 0.9);
  box-shadow:
    0 0 0 1px rgba(25, 124, 214, 0.85),
    0 0 12px rgba(0, 191, 255, 0.55);
  background: rgba(1, 16, 39, 0.95);
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  border: 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b1324;
  background: radial-gradient(circle at top, #ffe6aa, #f3b654);
  box-shadow:
    0 0 10px rgba(250, 213, 120, 0.75),
    0 8px 18px rgba(0, 0, 0, 0.6);
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease,
    filter 0.08s ease,
    background 0.15s ease;
}

.primary-btn:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow:
    0 0 14px rgba(246, 208, 125, 0.9),
    0 10px 20px rgba(0, 0, 0, 0.7);
}

.primary-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow:
    0 0 6px rgba(246, 208, 125, 0.75),
    0 4px 10px rgba(0, 0, 0, 0.6);
}

.primary-btn:disabled {
  cursor: default;
  opacity: 0.6;
  box-shadow: 0 0 0 transparent;
}

/* error */
.error {
  margin-top: 0.75rem;
  color: #ffb3b3;
  font-size: 0.9rem;
}
</style>
