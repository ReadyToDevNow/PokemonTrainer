<script>
import { getAllPokemons, getFirstGeneration } from '@/services/apiService'

export default {
  name: 'PokemonList',
  data() {
    return {
      allpokemons: [],
      firstgeneration: [],
    }
  },
  async created() {
    this.allpokemons = await getAllPokemons()
    this.firstgeneration = await getFirstGeneration()
  },
}
</script>

<template>
  <h2>Liste des Pokémons</h2>
  <ul>
    <li>{{ firstgeneration }}</li>
  </ul>
  <div>
    <img src="" alt="" />
  </div>
</template>

<style></style>
