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
    console.log('Liste de tous les Pokémons:', response.data)
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémons:', error)
  }
}
