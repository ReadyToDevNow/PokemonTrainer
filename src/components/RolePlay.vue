<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getFirstGeneration } from '@/services/apiService'

const TYPE_COLORS = {
  Normal: '#A8A878',
  Feu: '#F08030',
  Eau: '#6890F0',
  Plante: '#78C850',
  Électrik: '#F8D030',
  Glace: '#98D8D8',
  Combat: '#C03028',
  Poison: '#A040A0',
  Sol: '#E0C068',
  Vol: '#A890F0',
  Psy: '#F85888',
  Insecte: '#A8B820',
  Roche: '#B8A038',
  Spectre: '#705898',
  Dragon: '#7038F8',
  Ténèbres: '#705848',
  Acier: '#B8B8D0',
  Fée: '#EE99AC',
}

// Chaîne des types simplifiée (attaquant -> défenseurs)
const TYPE_CHART = {
  Normal: { weak: ['Roche', 'Acier'], immune: ['Spectre'] },
  Feu: { strong: ['Plante', 'Glace', 'Insecte', 'Acier'], weak: ['Feu', 'Eau', 'Roche', 'Dragon'] },
  Eau: { strong: ['Feu', 'Sol', 'Roche'], weak: ['Eau', 'Plante', 'Dragon'] },
  Électrik: { strong: ['Eau', 'Vol'], weak: ['Électrik', 'Plante', 'Dragon'], immune: ['Sol'] },
  Plante: {
    strong: ['Eau', 'Sol', 'Roche'],
    weak: ['Feu', 'Plante', 'Poison', 'Vol', 'Insecte', 'Dragon', 'Acier'],
  },
  Glace: { strong: ['Plante', 'Sol', 'Vol', 'Dragon'], weak: ['Feu', 'Eau', 'Glace', 'Acier'] },
  Combat: {
    strong: ['Normal', 'Glace', 'Roche', 'Ténèbres', 'Acier'],
    weak: ['Poison', 'Vol', 'Psy', 'Insecte', 'Fée'],
    immune: ['Spectre'],
  },
  Poison: {
    strong: ['Plante', 'Fée'],
    weak: ['Poison', 'Sol', 'Roche', 'Spectre'],
    immune: ['Acier'],
  },
  Sol: {
    strong: ['Feu', 'Électrik', 'Poison', 'Roche', 'Acier'],
    weak: ['Plante', 'Insecte'],
    immune: ['Vol'],
  },
  Vol: { strong: ['Plante', 'Combat', 'Insecte'], weak: ['Électrik', 'Roche', 'Acier'] },
  Psy: { strong: ['Combat', 'Poison'], weak: ['Psy', 'Acier'], immune: ['Ténèbres'] },
  Insecte: {
    strong: ['Plante', 'Psy', 'Ténèbres'],
    weak: ['Feu', 'Combat', 'Poison', 'Vol', 'Spectre', 'Acier', 'Fée'],
  },
  Roche: { strong: ['Feu', 'Glace', 'Vol', 'Insecte'], weak: ['Combat', 'Sol', 'Acier'] },
  Spectre: { strong: ['Psy', 'Spectre'], weak: ['Ténèbres'], immune: ['Normal'] },
  Dragon: { strong: ['Dragon'], weak: ['Acier'], immune: ['Fée'] },
  Ténèbres: { strong: ['Psy', 'Spectre'], weak: ['Combat', 'Ténèbres', 'Fée'] },
  Acier: { strong: ['Glace', 'Roche', 'Fée'], weak: ['Feu', 'Eau', 'Électrik', 'Acier'] },
  Fée: { strong: ['Combat', 'Dragon', 'Ténèbres'], weak: ['Feu', 'Poison', 'Acier'] },
}

const STARTER_IDS = [1, 4, 7, 25, 133]

const pokemons = ref([])
const loading = ref(true)
const error = ref(null)

const phase = ref('select') // select | battle | victory | defeat
const player = reactive({ base: null, hp: 0, maxHp: 0 })
const enemy = reactive({ base: null, hp: 0, maxHp: 0 })
const score = ref(0)
const log = ref([])
const turnLock = ref(false)

onMounted(async () => {
  try {
    pokemons.value = await getFirstGeneration()
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
})

const starters = computed(() =>
  pokemons.value.filter((pokemon) => STARTER_IDS.includes(pokemon.pokedex_id)),
)

function typeColor(typeName) {
  return TYPE_COLORS[typeName] || '#68A090'
}

function pushLog(message) {
  log.value = [...log.value, message].slice(-5)
}

function movesFor(pokemon) {
  const moves = pokemon.types.map((type) => ({
    name: `Attaque ${type.name}`,
    type: type.name,
  }))
  moves.push({ name: 'Charge', type: 'Normal' })
  return moves
}

function effectiveness(moveType, defenderTypes) {
  const rules = TYPE_CHART[moveType]
  if (!rules) return 1
  let multiplier = 1
  for (const defType of defenderTypes) {
    if (rules.immune?.includes(defType)) multiplier *= 0
    else if (rules.strong?.includes(defType)) multiplier *= 2
    else if (rules.weak?.includes(defType)) multiplier *= 0.5
  }
  return multiplier
}

function computeDamage(attacker, move, defender) {
  const base = move.type === 'Normal' ? attacker.stats.atk * 0.4 : attacker.stats.atk * 0.55
  const mitigated = base - defender.stats.def * 0.25
  const multiplier = effectiveness(
    move.type,
    defender.types.map((type) => type.name),
  )
  const variance = 0.85 + Math.random() * 0.3
  const dmg = Math.max(multiplier === 0 ? 0 : 1, Math.round(mitigated * multiplier * variance))
  return { dmg, multiplier }
}

function pickEnemy() {
  const candidates = pokemons.value.filter(
    (pokemon) => pokemon.pokedex_id !== player.base.pokedex_id,
  )
  const chosen = candidates[Math.floor(Math.random() * candidates.length)]
  const boost = 1 + score.value * 0.08
  enemy.base = chosen
  enemy.maxHp = Math.round(chosen.stats.hp * boost)
  enemy.hp = enemy.maxHp
  pushLog(`Un ${chosen.name.fr} sauvage apparaît !`)
}

function startGame(pokemon) {
  player.base = pokemon
  player.maxHp = pokemon.stats.hp
  player.hp = player.maxHp
  score.value = 0
  log.value = []
  pickEnemy()
  phase.value = 'battle'
}

function effectivenessMessage(multiplier) {
  if (multiplier === 0) return "Ça n'affecte pas l'adversaire..."
  if (multiplier >= 2) return "C'est super efficace !"
  if (multiplier <= 0.5) return "Ce n'est pas très efficace..."
  return ''
}

function playerAttack(move) {
  if (turnLock.value || phase.value !== 'battle') return
  turnLock.value = true

  const { dmg, multiplier } = computeDamage(player.base, move, enemy.base)
  enemy.hp = Math.max(0, enemy.hp - dmg)
  pushLog(`${player.base.name.fr} utilise ${move.name} ! (${dmg} dégâts)`)
  const effectMsg = effectivenessMessage(multiplier)
  if (effectMsg) pushLog(effectMsg)

  if (enemy.hp <= 0) {
    setTimeout(victory, 500)
    return
  }

  setTimeout(() => enemyTurn(), 700)
}

function enemyTurn() {
  const moves = movesFor(enemy.base)
  const move = moves[Math.floor(Math.random() * moves.length)]
  const { dmg, multiplier } = computeDamage(enemy.base, move, player.base)
  player.hp = Math.max(0, player.hp - dmg)
  pushLog(`${enemy.base.name.fr} utilise ${move.name} ! (${dmg} dégâts)`)
  const effectMsg = effectivenessMessage(multiplier)
  if (effectMsg) pushLog(effectMsg)

  if (player.hp <= 0) {
    setTimeout(defeat, 500)
    return
  }
  turnLock.value = false
}

function victory() {
  pushLog(`${enemy.base.name.fr} est vaincu !`)
  score.value += 1
  phase.value = 'victory'
  turnLock.value = false
}

function defeat() {
  pushLog(`${player.base.name.fr} est K.O. ...`)
  phase.value = 'defeat'
  turnLock.value = false
}

function nextBattle() {
  player.hp = Math.min(player.maxHp, player.hp + Math.round(player.maxHp * 0.3))
  pickEnemy()
  phase.value = 'battle'
}

function restart() {
  phase.value = 'select'
  player.base = null
  enemy.base = null
  score.value = 0
  log.value = []
}

const playerMoves = computed(() => (player.base ? movesFor(player.base) : []))
const playerHpPercent = computed(() =>
  player.maxHp ? Math.max(0, Math.round((player.hp / player.maxHp) * 100)) : 0,
)
const enemyHpPercent = computed(() =>
  enemy.maxHp ? Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100)) : 0,
)
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-800 p-4 text-white">
    <div v-if="loading" class="text-xl font-bold">Préparation de l'aventure…</div>
    <div v-else-if="error" class="text-xl font-bold">Impossible de charger les Pokémons.</div>

    <!-- ===== Écran de sélection ===== -->
    <div v-else-if="phase === 'select'" class="w-full max-w-2xl">
      <h1 class="text-3xl font-bold text-center mb-2">Jeu de rôle Pokémon</h1>
      <p class="text-center text-slate-300 mb-6">Choisis ton partenaire pour partir à l'aventure</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <button
          v-for="pokemon in starters"
          :key="pokemon.pokedex_id"
          class="starter-card"
          @click="startGame(pokemon)"
        >
          <img :src="pokemon.sprites.regular" :alt="pokemon.name.fr" class="starter-sprite" />
          <span class="font-bold">{{ pokemon.name.fr }}</span>
          <span class="flex gap-1 mt-1">
            <span
              v-for="type in pokemon.types"
              :key="type.name"
              class="type-pill"
              :style="{ backgroundColor: typeColor(type.name) }"
            >
              {{ type.name }}
            </span>
          </span>
        </button>
      </div>
    </div>

    <!-- ===== Écran de combat ===== -->
    <div v-else class="battle-scene">
      <div class="score-row">Score : {{ score }}</div>

      <div class="fighters-row">
        <div class="fighter-card">
          <span class="fighter-name">{{ enemy.base.name.fr }}</span>
          <div class="hp-track">
            <div class="hp-fill" :style="{ width: enemyHpPercent + '%' }"></div>
          </div>
          <img :src="enemy.base.sprites.regular" :alt="enemy.base.name.fr" class="fighter-sprite" />
        </div>

        <div class="fighter-card fighter-card--player">
          <span class="fighter-name">{{ player.base.name.fr }}</span>
          <div class="hp-track">
            <div class="hp-fill" :style="{ width: playerHpPercent + '%' }"></div>
          </div>
          <img
            :src="player.base.sprites.regular"
            :alt="player.base.name.fr"
            class="fighter-sprite fighter-sprite--player"
          />
        </div>
      </div>

      <div class="log-box">
        <p v-for="(line, i) in log" :key="i">{{ line }}</p>
      </div>

      <div v-if="phase === 'battle'" class="moves-row">
        <button
          v-for="move in playerMoves"
          :key="move.name"
          class="move-btn"
          :style="{ borderColor: typeColor(move.type) }"
          :disabled="turnLock"
          @click="playerAttack(move)"
        >
          {{ move.name }}
        </button>
      </div>

      <div v-else-if="phase === 'victory'" class="end-row">
        <p class="text-xl font-bold mb-3">Victoire !</p>
        <button class="action-btn" @click="nextBattle">Combat suivant</button>
        <button class="action-btn action-btn--ghost" @click="restart">Abandonner</button>
      </div>

      <div v-else-if="phase === 'defeat'" class="end-row">
        <p class="text-xl font-bold mb-3">Défaite... Score final : {{ score }}</p>
        <button class="action-btn" @click="restart">Recommencer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.starter-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.15s;
}
.starter-card:hover {
  transform: translateY(-4px);
  border-color: #64748b;
}
.starter-sprite {
  width: 72px;
  height: 72px;
  image-rendering: pixelated;
}
.type-pill {
  font-size: 0.65rem;
  font-weight: bold;
  color: white;
  padding: 1px 8px;
  border-radius: 8px;
}

.battle-scene {
  width: 100%;
  max-width: 640px;
  background: #0f172a;
  border: 4px solid #334155;
  border-radius: 16px;
  padding: 16px;
}

.score-row {
  text-align: right;
  font-weight: bold;
  margin-bottom: 8px;
  color: #ffe14d;
}

.fighters-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.fighter-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1e293b;
  border-radius: 10px;
  padding: 10px;
}

.fighter-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.hp-track {
  width: 100%;
  height: 8px;
  background: #334155;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.hp-fill {
  height: 100%;
  background: #4ade80;
  transition: width 0.4s;
}

.fighter-sprite {
  width: 80px;
  height: 80px;
  image-rendering: pixelated;
}

.fighter-sprite--player {
  transform: scaleX(-1);
}

.log-box {
  background: #020617;
  border-radius: 8px;
  padding: 10px;
  min-height: 96px;
  font-size: 0.85rem;
  color: #cbd5e1;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
}

.moves-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.move-btn {
  background: #1e293b;
  border: 2px solid;
  border-radius: 8px;
  padding: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.move-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.move-btn:not(:disabled):hover {
  background: #334155;
}

.end-row {
  text-align: center;
}

.action-btn {
  background: #4ade80;
  color: #0f172a;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  margin: 0 6px;
  cursor: pointer;
}

.action-btn--ghost {
  background: transparent;
  color: #cbd5e1;
  border: 2px solid #334155;
}
</style>
