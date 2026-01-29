import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import MatchLobby from '../pages/MatchLobby.vue';
import Login from '../pages/Login.vue';
import Home from '../pages/Home.vue';
import Profile from '../pages/Profile.vue';
import Stats from '../pages/Stats.vue';
import Leaders from '../pages/Leaders.vue';
import CreateLobby from '../pages/CreateLobby.vue';
import WarStatsPage from '../pages/WarStatsPage.vue';
import { useUserStore } from '../stores/userStore';

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: Home },
  { path: '/lobby', name: 'MatchLobby', component: MatchLobby },
  { path: '/war-stats', name: 'WarStats', component: WarStatsPage },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/stats', name: 'Stats', component: Stats },
  { path: '/leaders', name: 'Leaders', component: Leaders },
  { path: '/create-lobby', name: 'CreateLobby', component: CreateLobby },
  { path: '/login', name: 'Login', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global auth guard: redirect to /login if not authenticated
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  // hydrate from storage in case page reload occurred
  userStore.hydrateFromStorage();

  // If navigating to login but already authenticated, send to home
  if (to.path === '/login' && userStore.isLoggedIn) return next({ path: '/' });

  // Allow access to login when not authenticated
  if (to.path === '/login') return next();

  // All other pages require auth
  if (userStore.isLoggedIn) return next();

  return next({ path: '/login' });
});

export default router;
