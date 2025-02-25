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
        console.log('Pokemon first generation', data)
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
  <ul class="flex flex-col justify-center items-center">
    <li v-for="pokemon in pokemons" :key="pokemon.pokedex_id">
      <img :src="pokemon.sprites.regular" :alt="`Sprite de ${pokemon.name.fr}`" />
      <span class="text-xl font-bold flex flex-col items-center">
        {{ pokemon.name.fr }} pokemon de type :
        <span v-if="pokemon.types && pokemon.types.length > 0">
          {{ pokemon.types[0].name }}
          <span v-if="pokemon.types && pokemon.types.length > 1">
            et {{ pokemon.types[1].name }}
          </span>
          <!-- Gère l'affichage lorsque le pokemon n'a pas de second type-->
          <span v-else></span>
        </span>
      </span>
    </li>
  </ul>
</template>

<style></style>
