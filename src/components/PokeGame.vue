<script>
import { getAllPokemons } from '@/services/apiService'

export default {
  name: 'PokemonList',
  data() {
    return {
      allpokemons: [],
    }
  },
  async created() {
    this.allpokemons = await getAllPokemons()
  },
}
</script>

<template>
  <div>PokeGame</div>
  <div>{{ allpokemons }}</div>
</template>

<style></style>
