<template>
  <div class="timer">
    <p>Temps écoulé : {{ formattedTime }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const elapsedTime = ref(0)
const isRunning = ref(false)
let timer = null

// Fonction pour formater le temps en minutes et secondes
const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Calculer le temps formaté
const formattedTime = computed(() => formatTime(elapsedTime.value))

// Fonction pour démarrer le timer
const startTimer = () => {
  if (!isRunning.value) {
    isRunning.value = true
    timer = setInterval(() => {
      elapsedTime.value++
    }, 1000)
  }
}

// Arrêter le timer lorsque le composant est détruit
onUnmounted(() => {
  clearInterval(timer)
})

// Exposer la fonction pour démarrer le timer
defineExpose({ startTimer })
</script>

<style scoped>
.timer {
  text-align: center;
  margin-top: 20px;
}
</style>
