import { defineStore } from 'pinia';

export interface UserProfile {
  id: string;              // internal ID from your API
  username: string;
  avatarUrl: string | null;
  credits: number;
}

interface UserState {
  user: UserProfile | null;
  accessToken: string | null; // from your auth backend later
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    accessToken: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!state.accessToken,
    displayName: (state) => state.user?.username ?? 'OptimalLulz',
    avatarUrl: (state) =>
      state.user?.avatarUrl ??
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNnrlK75zGyzudA9TsQPHt5Tuz07UP9gbhYg&s', // @todo temp fallback add missing icon locally
    credits: (state) => state.user?.credits ?? 0,
  },

  actions: {
    // Call this after your Twitch + backend login flow succeeds
    setUser(payload: { user: UserProfile; accessToken: string }) {
      this.user = payload.user;
      this.accessToken = payload.accessToken;
    },

    updateCredits(newAmount: number) {
      if (!this.user) return;
      this.user.credits = newAmount;
    },

    logout() {
      this.user = null;
      this.accessToken = null;
    },

    // Restore from localStorage on app start (dev convenience)
    hydrateFromStorage() {
      // No-op placeholder — persistence removed. Implement session restore via API when ready.
      return;
    },
  },
});
