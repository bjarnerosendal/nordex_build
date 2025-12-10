import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // Lazy loading the About page
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/content/:id',
    name: 'contentPage',
    component: () => import('../views/ContentPage.vue'),
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top when navigating
    return { top: 0 };
  }
});

export default router;
