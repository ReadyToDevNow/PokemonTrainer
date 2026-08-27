<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAllPokemonsFull } from '@/services/apiService'
import pokeballIcon from '@/assets/pokeball.png'

const pokemons = ref([])
const loading = ref(true)
const error = ref(null)

const phase = ref('setup') // setup | center
const centerName = ref('')
const healedCount = ref(0)
const earnings = ref(0)
const log = ref([])

const queue = ref([])
const healing = ref(false)
const healProgress = ref(0)
let healTimer = null

const SHOP_ITEMS = [
  { id: 'potion', name: 'Potion', icon: '💊', price: 30, description: 'Soigne légèrement un Pokémon.' },
  { id: 'super-potion', name: 'Super Potion', icon: '🧴', price: 70, description: 'Soigne efficacement un Pokémon.' },
  { id: 'hyper-potion', name: 'Hyper Potion', icon: '🧪', price: 150, description: 'Soigne un Pokémon en grande quantité.' },
  { id: 'antidote', name: 'Antidote', icon: '🧫', price: 25, description: 'Guérit un Pokémon empoisonné.' },
  { id: 'poke-ball', name: 'Poké Ball', ball: 'red', price: 50, description: 'Permet de capturer un Pokémon sauvage.' },
  { id: 'super-ball', name: 'Super Ball', ball: 'blue', price: 100, description: 'Une Ball plus efficace que la Poké Ball.' },
  { id: 'rappel', name: 'Rappel', icon: '💉', price: 40, description: 'Réanime un Pokémon K.O. avec la moitié de ses PV.' },
  { id: 'bonbon-rare', name: 'Bonbon Rare', icon: '🍬', price: 300, description: 'Fait gagner un niveau instantanément.' },
]

const showShop = ref(false)
const inventory = reactive({})

onMounted(async () => {
  try {
    const data = await getAllPokemonsFull()
    pokemons.value = data.filter((pokemon) => pokemon.stats && pokemon.types?.length)
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
})

function pushLog(message) {
  log.value = [...log.value, message].slice(-5)
}

function randomPatient() {
  const pokemon = pokemons.value[Math.floor(Math.random() * pokemons.value.length)]
  const maxHp = pokemon.stats.hp
  const ratio = 0.15 + Math.random() * 0.5
  return {
    id: `${pokemon.pokedex_id}-${Date.now()}-${Math.random()}`,
    pokemon,
    hp: Math.max(1, Math.round(maxHp * ratio)),
    maxHp,
  }
}

function fillQueue() {
  while (queue.value.length < 4) {
    queue.value.push(randomPatient())
  }
}

function openCenter() {
  if (!centerName.value.trim()) centerName.value = 'Bourg-Palette'
  queue.value = []
  healedCount.value = 0
  earnings.value = 0
  log.value = []
  Object.keys(inventory).forEach((key) => delete inventory[key])
  fillQueue()
  pushLog(`Bienvenue au Centre Pokémon de ${centerName.value} !`)
  phase.value = 'center'
}

function buyItem(item) {
  if (earnings.value < item.price) return
  earnings.value -= item.price
  inventory[item.id] = (inventory[item.id] || 0) + 1
  pushLog(`Tu as acheté ${item.name} pour ${item.price} ₽.`)
}

const currentPatient = computed(() => queue.value[0] || null)
const waitingPatients = computed(() => queue.value.slice(1))

const hpPercent = computed(() =>
  currentPatient.value ? Math.round((currentPatient.value.hp / currentPatient.value.maxHp) * 100) : 0,
)

function startHeal() {
  if (healing.value || !currentPatient.value) return
  healing.value = true
  healProgress.value = 0
  pushLog(`Tu places ${currentPatient.value.pokemon.name.fr} sur la machine de soins...`)

  healTimer = setInterval(() => {
    healProgress.value += 4
    if (healProgress.value >= 100) {
      clearInterval(healTimer)
      completeHeal()
    }
  }, 100)
}

function completeHeal() {
  const patient = currentPatient.value
  patient.hp = patient.maxHp
  const reward = Math.round(20 + patient.maxHp / 4)
  healedCount.value += 1
  earnings.value += reward
  pushLog(`${patient.pokemon.name.fr} est en pleine forme ! (+${reward} PokéDollars)`)

  setTimeout(() => {
    queue.value.shift()
    fillQueue()
    healing.value = false
    healProgress.value = 0
  }, 900)
}

function closeCenter() {
  if (healTimer) clearInterval(healTimer)
  healing.value = false
  healProgress.value = 0
  phase.value = 'setup'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-rose-50 p-4">
    <div v-if="loading" class="text-xl font-bold text-slate-700">Préparation du centre…</div>
    <div v-else-if="error" class="text-xl font-bold text-slate-700">
      Impossible de charger les Pokémons.
    </div>

    <!-- ===== Écran de création du centre ===== -->
    <div v-else-if="phase === 'setup'" class="setup-box">
      <img :src="pokeballIcon" alt="" class="setup-icon" />
      <h1 class="text-2xl font-bold text-center mb-2">Deviens Infirmière Joëlle</h1>
      <p class="text-center text-slate-500 mb-4">
        Crée ton propre Centre Pokémon et soigne les Pokémon blessés qui s'y présentent.
      </p>
      <label class="setup-label" for="center-name">Nom de ta ville</label>
      <input
        id="center-name"
        v-model="centerName"
        type="text"
        placeholder="Bourg-Palette"
        class="setup-input"
        @keyup.enter="openCenter"
      />
      <button class="setup-btn" @click="openCenter">Ouvrir le Centre Pokémon</button>
    </div>

    <!-- ===== Écran du centre ===== -->
    <div v-else class="center-box">
      <div class="center-header">
        <div>
          <h1 class="text-xl font-bold">Centre Pokémon de {{ centerName }}</h1>
          <p class="text-sm text-slate-500">Infirmière Joëlle à votre service</p>
        </div>
        <div class="header-actions">
          <button class="shop-toggle-btn" @click="showShop = !showShop">
            {{ showShop ? 'Retour au centre' : 'Boutique' }}
          </button>
          <button class="close-btn" @click="closeCenter">Fermer le centre</button>
        </div>
      </div>

      <div class="stats-row">
        <span>Pokémon soignés : <strong>{{ healedCount }}</strong></span>
        <span>Gains : <strong>{{ earnings }} ₽</strong></span>
      </div>

      <!-- ===== Boutique ===== -->
      <div v-if="showShop" class="shop-panel">
        <h2 class="shop-title">Boutique du Centre Pokémon</h2>
        <div class="shop-grid">
          <div v-for="item in SHOP_ITEMS" :key="item.id" class="shop-card">
            <span
              v-if="item.ball"
              class="pokeball-icon"
              :class="`pokeball-icon--${item.ball}`"
            >
              <span class="pokeball-band"></span>
              <span class="pokeball-button"></span>
            </span>
            <span v-else class="shop-icon">{{ item.icon }}</span>
            <span class="shop-name">{{ item.name }}</span>
            <span class="shop-description">{{ item.description }}</span>
            <span class="shop-owned" v-if="inventory[item.id]">Possédé : {{ inventory[item.id] }}</span>
            <button
              class="shop-buy-btn"
              :disabled="earnings < item.price"
              @click="buyItem(item)"
            >
              Acheter — {{ item.price }} ₽
            </button>
          </div>
        </div>
      </div>

      <div v-else class="machine-area">
        <div v-if="currentPatient" class="patient-card">
          <span class="patient-name">{{ currentPatient.pokemon.name.fr }}</span>
          <div class="hp-track">
            <div class="hp-fill" :style="{ width: hpPercent + '%' }"></div>
          </div>
          <span class="hp-value">{{ currentPatient.hp }} / {{ currentPatient.maxHp }} PV</span>
          <img
            :src="currentPatient.pokemon.sprites.regular"
            :alt="currentPatient.pokemon.name.fr"
            class="patient-sprite"
            :class="{ 'is-healing': healing }"
          />

          <div class="heal-track">
            <div class="heal-fill" :style="{ width: healProgress + '%' }"></div>
          </div>

          <button class="heal-btn" :disabled="healing || currentPatient.hp >= currentPatient.maxHp" @click="startHeal">
            {{ healing ? 'Soins en cours...' : 'Placer sur la machine de soins' }}
          </button>
        </div>
        <p v-else class="empty-message">Aucun Pokémon en salle de soins pour le moment.</p>
      </div>

      <div v-if="!showShop" class="waiting-room">
        <h2 class="waiting-title">Salle d'attente</h2>
        <div class="waiting-list">
          <div v-for="patient in waitingPatients" :key="patient.id" class="waiting-card">
            <img :src="patient.pokemon.sprites.regular" :alt="patient.pokemon.name.fr" class="waiting-sprite" />
            <span class="waiting-name">{{ patient.pokemon.name.fr }}</span>
            <div class="hp-track hp-track--small">
              <div
                class="hp-fill"
                :style="{ width: Math.round((patient.hp / patient.maxHp) * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="log-box">
        <p v-for="(line, i) in log" :key="i">{{ line }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-box,
.center-box {
  width: 100%;
  max-width: 640px;
  background: white;
  border: 4px solid #fecdd3;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.setup-icon {
  width: 56px;
  height: 56px;
  display: block;
  margin: 0 auto 12px;
}

.setup-label {
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
  color: #64748b;
  margin-bottom: 4px;
}

.setup-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #fecdd3;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.setup-input:focus {
  outline: none;
  border-color: #fb7185;
}

.setup-btn {
  width: 100%;
  background: #f43f5e;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
}

.setup-btn:hover {
  background: #e11d48;
}

.center-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.shop-toggle-btn {
  background: #38bdf8;
  border: none;
  color: white;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.shop-toggle-btn:hover {
  background: #0ea5e9;
}

.close-btn {
  background: transparent;
  border: 2px solid #fecdd3;
  color: #f43f5e;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.close-btn:hover {
  background: #fff1f2;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  background: #fff1f2;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #881337;
  margin-bottom: 16px;
}

.machine-area {
  background: #fef2f2;
  border: 2px dashed #fecdd3;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  color: #94a3b8;
  font-size: 0.9rem;
}

.patient-card {
  width: 100%;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.patient-name {
  font-weight: bold;
  color: #1f2937;
}

.hp-track {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.hp-track--small {
  height: 5px;
}

.hp-fill {
  height: 100%;
  background: #4ade80;
  transition: width 0.4s;
}

.hp-value {
  font-size: 0.7rem;
  color: #64748b;
}

.patient-sprite {
  width: 90px;
  height: 90px;
  image-rendering: pixelated;
  margin: 4px 0;
}

.patient-sprite.is-healing {
  animation: heal-glow 0.8s ease-in-out infinite;
}

@keyframes heal-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 0 rgba(74, 222, 128, 0));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(74, 222, 128, 0.9));
  }
}

.heal-track {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.heal-fill {
  height: 100%;
  background: #38bdf8;
  transition: width 0.1s linear;
}

.heal-btn {
  margin-top: 8px;
  background: #f43f5e;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
}

.heal-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.heal-btn:not(:disabled):hover {
  background: #e11d48;
}

.waiting-room {
  margin-bottom: 16px;
}

.waiting-title {
  font-size: 0.85rem;
  font-weight: bold;
  color: #881337;
  margin-bottom: 8px;
}

.waiting-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.waiting-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff1f2;
  border-radius: 8px;
  padding: 6px 10px;
  width: 84px;
}

.waiting-sprite {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

.waiting-name {
  font-size: 0.65rem;
  font-weight: bold;
  color: #1f2937;
  margin: 2px 0 4px;
  text-align: center;
}

.log-box {
  background: #1f2937;
  color: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  min-height: 80px;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
}

.shop-panel {
  background: #fef2f2;
  border: 2px dashed #fecdd3;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.shop-title {
  font-size: 0.95rem;
  font-weight: bold;
  color: #881337;
  margin-bottom: 12px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.shop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border: 2px solid #fecdd3;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
}

.shop-icon {
  font-size: 1.8rem;
  margin-bottom: 4px;
}

.pokeball-icon {
  position: relative;
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #1f2937;
  background: #f43f5e;
  overflow: hidden;
  margin-bottom: 4px;
}

.pokeball-icon--blue {
  background: #38bdf8;
}

.pokeball-icon::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: white;
}

.pokeball-band {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 4px;
  background: #1f2937;
  transform: translateY(-50%);
  z-index: 2;
}

.pokeball-button {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid #1f2937;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.shop-name {
  font-weight: bold;
  font-size: 0.85rem;
  color: #1f2937;
}

.shop-description {
  font-size: 0.65rem;
  color: #64748b;
  margin: 4px 0;
  min-height: 28px;
}

.shop-owned {
  font-size: 0.65rem;
  color: #0ea5e9;
  font-weight: bold;
  margin-bottom: 4px;
}

.shop-buy-btn {
  width: 100%;
  background: #f43f5e;
  color: white;
  font-weight: bold;
  font-size: 0.75rem;
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
}

.shop-buy-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.shop-buy-btn:not(:disabled):hover {
  background: #e11d48;
}
</style>
