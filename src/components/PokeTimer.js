import { ref, onUnmounted } from 'vue'

export function useTimer(initialValue = 0) {
  const time = ref(initialValue)
  let timer = null

  const startTimer = () => {
    if (!timer) {
      timer = setInterval(() => {
        time.value++
      }, 1000)
    }
  }

  const resetTimer = () => {
    clearInterval(timer)
    timer = null
    time.value = 0
  }

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  return {
    time,
    startTimer,
    resetTimer,
  }
}
