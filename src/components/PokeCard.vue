<template>
  <div>
    <h2 class="text-4xl font-bold flex flex-col justify-center items-center mt-12 mb-12">
      Jouez maintenant
    </h2>
    <input
      v-model="userInput"
      type="text"
      placeholder="Entrez le nom d'un Pokémon"
      @keyup.enter="checkPokemon"
      class="mb-8 p-4 border rounded w-60"
    />

    <button @click="checkPokemon" class="mb-4 p-4 bg-blue-500 text-white rounded">Vérifier</button>
    <button @click="resetGrid">Réinitialiser la grille</button>
    <div class="grid-container">
      <div
        v-for="(pokemon, index) in pokemons"
        :key="index"
        class="flex flex-col pokemon-cell rounded"
      >
        <img
          :src="pokemon.sprites.regular"
          :alt="`Sprite de ${pokemon.name.fr}`"
          v-if="pokemon.show"
          class="pokemon-image"
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

const resetGrid = () => {
  pokemons.value.forEach((pokemon) => {
    pokemon.show = false
  })
  userInput.value = ''
}
</script>
<style scoped>
.pokemon-cell {
  width: 112px;
  height: 112px;
  justify-content: center;
  align-items: center;
  border: 1px solid rgb(230, 17, 201);
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
