<script setup>
import { ref, onMounted, computed } from 'vue'
import { getFirstGeneration } from '@/services/apiService'
import PokeCounter from './PokeCounter.vue'
import { useTimer } from './PokeTimer.js'

const userInput = ref('')
const pokemons = ref([])
const { time, startTimer, resetTimer } = useTimer()
const pokemonCounter = ref(null)

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
    if (pokemonCounter.value) {
      pokemonCounter.value.updateCount(pokemons.value.filter((p) => p.show).length)
    }
    //Start timer when the first pokemon is found
    if (pokemons.value.filter((p) => p.show).length === 1) {
      startTimer()
    }
  } else {
    alert("Ce Pokémon n'existe pas ou n'est pas dans la première génération.")
  }
}

const resetGrid = () => {
  pokemons.value.forEach((pokemon) => {
    pokemon.show = false // reset l'affichage des pokémons
  })
  userInput.value = '' // reset input area
  pokemonCounter.value.updateCount(0) // reset counter
  resetTimer()
}

const formattedTime = computed(() => {
  const minutes = Math.floor(time.value / 60)
  const seconds = time.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})
</script>
<template>
  <div>
    <h2 class="text-4xl font-bold flex flex-col justify-center items-center mt-12 mb-12">
      Jouez maintenant
    </h2>
    <div class="flex flex-col justify-center items-center">
      <div>
        <input
          v-model="userInput"
          type="text"
          placeholder="Entrez le nom d'un Pokémon"
          @keyup.enter="checkPokemon"
          class="mb-8 p-4 border rounded w-60"
        />

        <button @click="checkPokemon" class="mb-4 p-4 ml-2 bg-blue-500 text-white rounded">
          Vérifier
        </button>

        <button @click="resetGrid" class="mb-4 p-4 bg-red-500 text-white shadow-amber rounded ml-2">
          Réinitialiser la grille
        </button>

        <button class="timer mb-4 p-4 bg-green-800 text-white shadow-amber rounded ml-2">
          Temps écoulé : {{ formattedTime }}
        </button>

        <PokeCounter ref="pokemonCounter" />
      </div>
    </div>
    <div class="grid-container">
      <div
        v-for="(pokemon, index) in pokemons"
        :key="index"
        class="flex flex-col pokemon-cell rounded mb-4"
      >
        <img
          :src="pokemon.sprites.regular"
          :alt="`Sprite de ${pokemon.name.fr}`"
          v-if="pokemon.show"
          class="pokemon-image"
        />
        <span v-else class="text-xl font-bold"><img src="@/assets/pokeball.png" alt="" /></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-cell {
  width: 112px;
  height: 112px;
  justify-content: center;
  align-items: center;
}
.pokemon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(10, 2fr);
  gap: 10px;
  padding: 10px;
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1 / 1; /* Pour garder les cellules carrées */
}

/*Responsive grid */
@media (max-width: 1280px) {
  .grid-container {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 1080px) {
  .grid-container {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 560px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Media query pour les petits écrans (mobiles) */
@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Media query pour les très petits écrans */
@media (max-width: 320px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
