import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://tyradex.vercel.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Récupérer la liste de tout les Pokemons
/*export async function getAllPokemons() {
  try {
    const response = await apiClient.get('/pokemon')
    console.log('Liste de tous les Pokémons:', response.data)
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémons:', error)
  }
}
  */

/*export async function getAllPokemons() {
  try {
    const response = await apiClient.get('/pokemon')
    console.log('Liste de tous les Pokémons:', response.data)
    const informations = response.data.map((info) => {
      const names = info.name.value
      return { names }
    })
    return informations.names
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémons:', error)
    return []
  }
}*/

export async function getAllPokemons() {
  try {
    const response = await apiClient.get('/pokemon')
    const pokemons = response.data
    const names = pokemons.map((pokemon) => pokemon.name.fr)
    console.log('Noms des Pokémons :', names)
    return { names }
  } catch (error) {
    console.error('Erreur lors de la récupération des noms des Pokémons:', error)
    return []
  }
}
