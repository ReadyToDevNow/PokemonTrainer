import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import PokeGame from '@/components/PokeGame.vue'
import PokeCard from '@/components/PokeCard.vue'
import NewPokedex from '@/components/NewPokedex.vue'
import RolePlay from '@/components/RolePlay.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/game',
      name: 'game',
      component: PokeGame,
    },
    {
      path: '/card',
      name: 'card',
      component: PokeCard,
    },
    {
      path: '/new-pokedex',
      name: 'new-pokedex',
      component: NewPokedex,
    },
    {
      path: '/jeu-de-role',
      name: 'jeu-de-role',
      component: RolePlay,
    },
    /* {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    }, */
  ],
})

export default router
