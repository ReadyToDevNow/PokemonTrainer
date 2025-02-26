<template>
  <span class="mb-4 p-4 ml-2 bg-amber-500 text-white rounded"> {{ count }} / 151 Pokémons</span>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
function updateCount(newCount) {
  count.value = newCount
}
defineExpose({ updateCount })
</script>

<style></style>
