<template>
  <span> {{ count }} / 151 Pokémons</span>
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
