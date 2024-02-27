import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import PropertyRoutes from '../domain/Property/routes';
import DashboardRoutes from '../domain/Dashboard/routes';
Vue.use(VueRouter)

const routes = [
  {
    path: '/index.html',
    name: 'home',
    alias: '/',
    component: Home,
    meta: {
      requiresAuth: true,
    },
  }
].concat(PropertyRoutes, DashboardRoutes
);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
})

router.beforeEach((to, from, next) => {
  const currentUser = router.app.$store.getters.current_user;
  /**
   * TODO: Implement route middleware here
   */
  next();
})


export default router;
