import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import MatchLobby from '../pages/MatchLobby.vue';
import Login from '../pages/Login.vue';
import { useUserStore } from '../stores/userStore';

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'MatchLobby', component: MatchLobby },
  { path: '/login', name: 'Login', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global auth guard: redirect to /login if not authenticated
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();

  const userStore = useUserStore();
  // hydrate from storage in case page reload occurred
  userStore.hydrateFromStorage();

  if (userStore.isLoggedIn) return next();

  return next({ path: '/login' });
});

export default router;
