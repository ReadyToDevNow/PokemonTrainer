<script setup>
// import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="bg-amber-600/30">
    <header>
      <div class="bg-amber-600/10">
        <nav>
          <router-link to="/home">Accueil</router-link> |
          <router-link to="/pokédex">Pokédex</router-link> |
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<style scoped></style>
