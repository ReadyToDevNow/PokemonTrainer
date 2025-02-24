<script setup>
// import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <header>
      <div>
        <nav>
          <router-link to="/home">Accueil</router-link> |
          <router-link to="/game">Jeu</router-link> |
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<style scoped></style>
