import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import MatchLobby from '../pages/MatchLobby.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'MatchLobby', component: MatchLobby }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
