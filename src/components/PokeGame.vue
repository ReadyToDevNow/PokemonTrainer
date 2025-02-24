<script>
import { getAllPokemons } from '@/services/apiService'

export default {
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
  <span>{{ getAllPokemons }}</span>
</template>

<style></style>
