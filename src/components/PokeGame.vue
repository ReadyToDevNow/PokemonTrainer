<script setup>
import { getFirstGeneration } from '@/services/apiService'
import { ref, onMounted, computed } from 'vue'

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

const pokemons = ref([])
const searchQuery = ref('')

onMounted(async () => {
  try {
    const data = await getFirstGeneration()
    pokemons.value = data
    console.log('Pokemon first generation', data)
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémons:', error)
  }
})

// Recherche par nom uniquement
const filteredPokemons = computed(() => {
  return pokemons.value.filter((pokemon) =>
    pokemon.name.fr.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})
</script>

<template>
  <div class="">
    <h2 class="text-4xl font-bold flex flex-col justify-center items-center mb-4">Pokédex</h2>

    <ul class="flex flex-col justify-center items-center">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un Pokémon"
        class="bg-amber-100 hover:bg-amber-100/60 mb-4 p-2 border-2 border-amber-300/40 rounded"
      />
      <li
        class="bg-amber-100 mb-8 pb-8"
        v-for="pokemon in filteredPokemons"
        :key="pokemon.pokedex_id"
      >
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
  </div>
</template>

<style></style>
