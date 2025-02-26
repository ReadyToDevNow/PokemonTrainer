<script setup>
// import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="bg-amber-600/30">
    <header>
      <div class="bg-amber-600/10">
        <nav>
          <router-link to="/">Accueil</router-link> |
          <router-link to="/game">Pokédex</router-link> |
          <router-link to="card">Cartes</router-link>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<style scoped></style>
