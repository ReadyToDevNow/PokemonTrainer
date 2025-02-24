<script>
import { getFirstGeneration } from '@/services/apiService'
import { ref, onMounted } from 'vue'

/* export default {
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
} */

export default {
  name: 'PokemonList',
  setup() {
    const pokemons = ref([])

    onMounted(async () => {
      try {
        const data = await getFirstGeneration()
        pokemons.value = data
      } catch (error) {
        console.error('Erreur lors de la récupération des Pokémons:', error)
      }
    })

    return {
      pokemons,
    }
  },
}
</script>

<template>
  <h2 class="text-4xl font-bold flex flex-col justify-center items-center">Liste des Pokémons</h2>
  <ul class="">
    <li v-for="pokemon in pokemons" :key="pokemon.pokedex_id">
      <img :src="pokemon.sprites.regular" :alt="`Sprite de ${pokemon.name.fr}`" />
      {{ pokemon.name.fr }}
    </li>
  </ul>
</template>

<style></style>
