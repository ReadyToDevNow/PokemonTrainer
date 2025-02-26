<template>
  <div>
    <h2 class="text-4xl font-bold flex flex-col justify-center items-center">Jeu Pokémon</h2>
    <input
      v-model="userInput"
      type="text"
      placeholder="Entrez le nom d'un Pokémon"
      @keyup.enter="checkPokemon"
      class="mb-4 p-2 border border-gray-300 rounded"
    />
    <button @click="checkPokemon" class="mb-4 p-2 bg-blue-500 text-white rounded">Vérifier</button>
    <div class="grid grid-cols-12 gap-4">
      <div v-for="(pokemon, index) in pokemons" :key="index" class="flex flex-col items-center">
        <img
          :src="pokemon.sprites.regular"
          :alt="`Sprite de ${pokemon.name.fr}`"
          v-if="pokemon.show"
        />
        <span v-else class="text-xl font-bold">?</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFirstGeneration } from '@/services/apiService'

const userInput = ref('')
const pokemons = ref([])

onMounted(async () => {
  try {
    const data = await getFirstGeneration()
    pokemons.value = data.map((pokemon) => ({
      ...pokemon,
      show: false,
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémons:', error)
  }
})

const checkPokemon = async () => {
  const input = userInput.value.trim().toLowerCase()
  const foundPokemon = pokemons.value.find((pokemon) => pokemon.name.fr.toLowerCase() === input)

  if (foundPokemon) {
    foundPokemon.show = true
    userInput.value = '' // Réinitialiser l'input
  } else {
    alert("Ce Pokémon n'existe pas ou n'est pas dans la première génération.")
  }
}
</script>
