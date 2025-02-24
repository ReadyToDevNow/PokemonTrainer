import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://tyradex.vercel.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Récupérer la liste de tout les Pokemons

export async function getAllPokemons() {
  try {
    const response = await apiClient.get('/pokemon')
    const pokemons = response.data
    const names = pokemons.map((pokemon) => pokemon.name.fr)
    console.log('Noms des Pokémons :', names)
    return { names }
  } catch (error) {
    console.error('Erreur lors de la récupération des noms des Pokemons:', error)
    return []
  }
}

export async function getFirstGeneration() {
  try {
    const response = await apiClient.get('/gen/1')
    const pokemons = response.data
    const names = pokemons.map((pokemon) => pokemon.name.fr)
    const images = pokemons.map((pokemon) => pokemon.sprites.regular)
    console.log('Noms des pokémons :', names)
    return { names, images }
  } catch (error) {
    console.error('Erreur lors de la récupération des noms des Pokemons:', error)
    return []
  }
}
