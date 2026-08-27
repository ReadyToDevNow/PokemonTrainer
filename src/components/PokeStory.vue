<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAllPokemonsFull } from '@/services/apiService'

function spriteUrl(pokedexId) {
  return `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokedexId}/regular.png`
}

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

// Arbre narratif : chaque nœud a un texte, une image et des choix.
// Un choix mène soit directement à un autre nœud (`next`), soit déclenche
// un combat (`battle`) dont l'issue détermine la suite de l'histoire.
const STORY = {
  start: {
    image: 25,
    text: "Tu es un jeune dresseur qui vient de recevoir son premier partenaire : un Pikachu curieux et plein d'énergie. Une aventure t'attend...",
    choices: [
      { label: 'Explorer la forêt', next: 'forestEntry' },
      { label: 'Rendre visite au Professeur Chen', next: 'labEntry' },
    ],
  },
  forestEntry: {
    image: 10,
    text: 'Dans la forêt, un Chenipan sauvage te barre la route, visiblement sur ses gardes.',
    choices: [
      { label: 'Combattre', battle: { enemyId: 10, onWin: 'forestFight', onLose: 'forestFlee' } },
      { label: 'Essayer de le calmer', next: 'forestBefriend' },
    ],
  },
  forestFight: {
    image: 25,
    text: "Le Chenipan est vaincu et détale aussitôt. En continuant ton chemin, tu trouves une Pierre Feu brillante au sol.",
    choices: [
      { label: 'Continuer vers la grotte', next: 'caveEntry' },
      { label: 'Retourner au village montrer ta trouvaille', next: 'villageReturn' },
    ],
  },
  forestFlee: {
    image: 10,
    text: 'Le combat tourne mal : ton équipe est épuisée. Tu bats en retraite prudemment vers le village pour la soigner.',
    choices: [{ label: 'Retourner au village', next: 'villageReturn' }],
  },
  forestBefriend: {
    image: 10,
    text: "Tu partages une baie avec le Chenipan. Rassuré, il te suit un moment avant de filer dans les buissons, laissant derrière lui une Cocoon vide en guise de porte-bonheur.",
    choices: [
      { label: 'Continuer vers la grotte', next: 'caveEntry' },
      { label: 'Retourner au village', next: 'villageReturn' },
    ],
  },
  labEntry: {
    image: 7,
    text: "Le Professeur Chen t'accueille chaleureusement et te propose de choisir un second partenaire pour t'accompagner.",
    choices: [
      { label: 'Choisir Salamèche', next: 'labFire', partner: 4 },
      { label: 'Choisir Carapuce', next: 'labWater', partner: 7 },
      { label: 'Refuser poliment et partir explorer', next: 'forestEntry' },
    ],
  },
  labFire: {
    image: 4,
    text: 'Salamèche rejoint ton équipe ! Sa flamme brûle déjà avec détermination.',
    choices: [
      { label: 'Se diriger vers la grotte', next: 'caveEntry' },
      { label: 'Retourner au village', next: 'villageReturn' },
    ],
  },
  labWater: {
    image: 7,
    text: 'Carapuce rejoint ton équipe, prêt à te protéger dans les moments difficiles.',
    choices: [
      { label: 'Se diriger vers la grotte', next: 'caveEntry' },
      { label: 'Retourner au village', next: 'villageReturn' },
    ],
  },
  caveEntry: {
    image: 74,
    text: "Une grotte sombre s'ouvre devant toi. Des bruits étranges résonnent tout au fond...",
    choices: [
      { label: 'Avancer courageusement', next: 'caveBoss' },
      { label: 'Faire demi-tour, trop risqué', next: 'villageReturn' },
    ],
  },
  caveBoss: {
    image: 150,
    text: 'Au fond de la grotte, un Mewtwo légendaire fixe silencieusement ton équipe.',
    choices: [
      { label: 'Le défier', battle: { enemyId: 150, onWin: 'endingChampion', onLose: 'endingDefeat' } },
      { label: 'Rester immobile, impressionné', next: 'endingMystic' },
    ],
  },
  villageReturn: {
    image: 25,
    text: 'Tu rentres au village. Ton équipe grandit, et ta réputation avec elle.',
    choices: [{ label: "Poursuivre l'histoire", next: 'endingFriend' }],
  },

  // Fins
  endingChampion: {
    image: 150,
    text: "Le combat est titanesque ! Après un échange d'attaques mémorable, Mewtwo reconnaît ta bravoure et s'efface, te laissant un badge légendaire. Tu es désormais le Dresseur qui a bravé un légendaire.",
    ending: true,
  },
  endingDefeat: {
    image: 150,
    text: 'Malgré tout ton courage, Mewtwo est trop puissant. Il te laisse partir, impressionné par ta détermination malgré la défaite. Tu reviendras plus fort.',
    ending: true,
  },
  endingMystic: {
    image: 150,
    text: "Mewtwo lit dans tes pensées et t'offre sa confiance silencieuse, sans un mot. Une aventure mystique s'achève ici, mais son regard restera gravé dans ta mémoire.",
    ending: true,
  },
  endingFriend: {
    image: 25,
    text: "Ton lien avec ton équipe se renforce un peu plus chaque jour. Une belle histoire d'amitié se termine ici... pour l'instant.",
    ending: true,
  },
}

const pokemons = ref([])
const loading = ref(true)
const error = ref(null)

const phase = ref('story') // story | battle
const currentId = ref('start')
const partnerId = ref(25)
const currentNode = computed(() => STORY[currentId.value])

const battle = reactive({
  player: { base: null, hp: 0, maxHp: 0 },
  enemy: { base: null, hp: 0, maxHp: 0 },
  onWin: null,
  onLose: null,
  log: [],
  turnLock: false,
})
const attackAnim = reactive({ player: false, enemy: false })
const hitAnim = reactive({ player: false, enemy: false })
const damagePopup = reactive({ player: null, enemy: null })
let popupSeq = 0

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

const STAT_LABELS = {
  hp: 'PV',
  atk: 'Attaque',
  def: 'Défense',
  spe_atk: 'Atq. Spé.',
  spe_def: 'Déf. Spé.',
  vit: 'Vitesse',
}

function typeColor(typeName) {
  return TYPE_COLORS[typeName] || '#68A090'
}

function statPercent(value) {
  return Math.min(100, Math.round((value / 255) * 100))
}

function pushBattleLog(message) {
  battle.log = [...battle.log, message].slice(-5)
}

function movesFor(pokemon) {
  const [type1, type2] = pokemon.types.map((type) => type.name)
  const blueprints = [
    { name: `Attaque ${type1}`, type: type1, statKey: 'atk', ratio: 0.55 },
    { name: `Onde ${type1}`, type: type1, statKey: 'spe_atk', ratio: 0.55 },
    { name: `Frappe ${type2 || 'Normal'}`, type: type2 || 'Normal', statKey: 'atk', ratio: 0.5 },
    { name: 'Charge', type: 'Normal', statKey: 'atk', ratio: 0.4 },
  ]
  return blueprints.map((move) => ({
    name: move.name,
    type: move.type,
    power: Math.round(pokemon.stats[move.statKey] * move.ratio),
  }))
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

function computeDamage(move, defender) {
  const mitigated = move.power - defender.stats.def * 0.25
  const multiplier = effectiveness(
    move.type,
    defender.types.map((type) => type.name),
  )
  const variance = 0.85 + Math.random() * 0.3
  const dmg = Math.max(multiplier === 0 ? 0 : 1, Math.round(mitigated * multiplier * variance))
  return { dmg, multiplier }
}

function effectivenessMessage(multiplier) {
  if (multiplier === 0) return "Ça n'affecte pas l'adversaire..."
  if (multiplier >= 2) return "C'est super efficace !"
  if (multiplier <= 0.5) return "Ce n'est pas très efficace..."
  return ''
}

function playAttackAnim(side) {
  attackAnim[side] = true
  setTimeout(() => {
    attackAnim[side] = false
  }, 350)
}

function playHitAnim(side, dmg) {
  hitAnim[side] = true
  const id = ++popupSeq
  damagePopup[side] = { amount: dmg, id }
  setTimeout(() => {
    hitAnim[side] = false
  }, 400)
  setTimeout(() => {
    if (damagePopup[side]?.id === id) damagePopup[side] = null
  }, 800)
}

function startBattle(enemyId, onWin, onLose) {
  const partner = pokemons.value.find((pokemon) => pokemon.pokedex_id === partnerId.value)
  const foe = pokemons.value.find((pokemon) => pokemon.pokedex_id === enemyId)

  battle.player.base = partner
  battle.player.maxHp = partner.stats.hp
  battle.player.hp = battle.player.maxHp
  battle.enemy.base = foe
  battle.enemy.maxHp = foe.stats.hp
  battle.enemy.hp = battle.enemy.maxHp
  battle.onWin = onWin
  battle.onLose = onLose
  battle.log = [`Un ${foe.name.fr} sauvage surgit face à ${partner.name.fr} !`]
  battle.turnLock = false
  phase.value = 'battle'
}

function playerAttack(move) {
  if (battle.turnLock || phase.value !== 'battle') return
  battle.turnLock = true

  playAttackAnim('player')
  setTimeout(() => {
    const { dmg, multiplier } = computeDamage(move, battle.enemy.base)
    battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg)
    playHitAnim('enemy', dmg)
    pushBattleLog(`${battle.player.base.name.fr} utilise ${move.name} ! (${dmg} dégâts)`)
    const effectMsg = effectivenessMessage(multiplier)
    if (effectMsg) pushBattleLog(effectMsg)

    if (battle.enemy.hp <= 0) {
      setTimeout(() => resolveBattle(true), 600)
      return
    }
    setTimeout(() => enemyTurn(), 700)
  }, 350)
}

function enemyTurn() {
  playAttackAnim('enemy')
  setTimeout(() => {
    const moves = movesFor(battle.enemy.base)
    const move = moves[Math.floor(Math.random() * moves.length)]
    const { dmg, multiplier } = computeDamage(move, battle.player.base)
    battle.player.hp = Math.max(0, battle.player.hp - dmg)
    playHitAnim('player', dmg)
    pushBattleLog(`${battle.enemy.base.name.fr} utilise ${move.name} ! (${dmg} dégâts)`)
    const effectMsg = effectivenessMessage(multiplier)
    if (effectMsg) pushBattleLog(effectMsg)

    if (battle.player.hp <= 0) {
      setTimeout(() => resolveBattle(false), 600)
      return
    }
    battle.turnLock = false
  }, 350)
}

function resolveBattle(won) {
  currentId.value = won ? battle.onWin : battle.onLose
  phase.value = 'story'
}

const playerPokemon = computed(() =>
  pokemons.value.find((pokemon) => pokemon.pokedex_id === partnerId.value),
)
const battleMoves = computed(() => (battle.player.base ? movesFor(battle.player.base) : []))
const playerHpPercent = computed(() =>
  battle.player.maxHp ? Math.max(0, Math.round((battle.player.hp / battle.player.maxHp) * 100)) : 0,
)
const enemyHpPercent = computed(() =>
  battle.enemy.maxHp ? Math.max(0, Math.round((battle.enemy.hp / battle.enemy.maxHp) * 100)) : 0,
)

function handleChoice(choice) {
  if (choice.partner) partnerId.value = choice.partner
  if (choice.battle) {
    startBattle(choice.battle.enemyId, choice.battle.onWin, choice.battle.onLose)
  } else {
    currentId.value = choice.next
  }
}

function restart() {
  phase.value = 'story'
  currentId.value = 'start'
  partnerId.value = 25
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-800 p-4 text-white">
    <div v-if="loading" class="text-xl font-bold">Préparation de l'aventure…</div>
    <div v-else-if="error" class="text-xl font-bold">Impossible de charger les Pokémons.</div>

    <!-- ===== Mise en page : contenu principal + carte du Pokémon toujours visible ===== -->
    <div v-else class="page-layout">
    <!-- ===== Écran de récit ===== -->
    <div v-if="phase === 'story'" class="story-box">
      <h1 class="text-2xl font-bold text-center mb-4">Poke Story</h1>

      <div class="story-sprite-frame">
        <img :src="spriteUrl(currentNode.image)" alt="" class="story-sprite" />
      </div>

      <p class="story-text">{{ currentNode.text }}</p>

      <div v-if="!currentNode.ending" class="choices-col">
        <button
          v-for="choice in currentNode.choices"
          :key="choice.label"
          class="choice-btn"
          @click="handleChoice(choice)"
        >
          {{ choice.label }}
        </button>
      </div>

      <div v-else class="choices-col">
        <p class="ending-tag">— Fin de l'histoire —</p>
        <button class="choice-btn choice-btn--restart" @click="restart">
          Recommencer l'aventure
        </button>
      </div>
    </div>

    <!-- ===== Écran de combat ===== -->
    <div v-else class="battle-scene">
      <div class="fighters-row">
        <div
          class="fighter-card"
          :class="{ 'is-attacking': attackAnim.enemy, 'is-hit': hitAnim.enemy }"
        >
          <span class="fighter-name">{{ battle.enemy.base.name.fr }}</span>
          <div class="hp-track">
            <div class="hp-fill" :style="{ width: enemyHpPercent + '%' }"></div>
          </div>
          <span class="hp-value">{{ battle.enemy.hp }} / {{ battle.enemy.maxHp }} PV</span>
          <img
            :src="battle.enemy.base.sprites.regular"
            :alt="battle.enemy.base.name.fr"
            class="fighter-sprite"
            :class="{ 'is-flashing': hitAnim.enemy }"
          />
          <Transition name="popup">
            <span v-if="damagePopup.enemy" :key="damagePopup.enemy.id" class="damage-popup">
              -{{ damagePopup.enemy.amount }}
            </span>
          </Transition>
        </div>

        <div
          class="fighter-card fighter-card--player"
          :class="{ 'is-attacking': attackAnim.player, 'is-hit': hitAnim.player }"
        >
          <span class="fighter-name">{{ battle.player.base.name.fr }}</span>
          <div class="hp-track">
            <div class="hp-fill" :style="{ width: playerHpPercent + '%' }"></div>
          </div>
          <span class="hp-value">{{ battle.player.hp }} / {{ battle.player.maxHp }} PV</span>
          <img
            :src="battle.player.base.sprites.regular"
            :alt="battle.player.base.name.fr"
            class="fighter-sprite fighter-sprite--player"
            :class="{ 'is-flashing': hitAnim.player }"
          />
          <Transition name="popup">
            <span v-if="damagePopup.player" :key="damagePopup.player.id" class="damage-popup">
              -{{ damagePopup.player.amount }}
            </span>
          </Transition>
        </div>
      </div>

      <div class="log-box">
        <p v-for="(line, i) in battle.log" :key="i">{{ line }}</p>
      </div>

      <div class="moves-row">
        <button
          v-for="move in battleMoves"
          :key="move.name"
          class="move-btn"
          :style="{ borderColor: typeColor(move.type) }"
          :disabled="battle.turnLock"
          @click="playerAttack(move)"
        >
          <span class="move-name">{{ move.name }}</span>
          <span class="move-meta">
            <span class="type-pill" :style="{ backgroundColor: typeColor(move.type) }">
              {{ move.type }}
            </span>
            <span class="move-power">Puissance {{ move.power }}</span>
          </span>
        </button>
      </div>
    </div>

    <!-- ===== Carte de caractéristiques du Pokémon du joueur (toujours visible) ===== -->
    <div v-if="playerPokemon" class="stat-card">
      <div class="stat-card-header">
        <span class="dex-number">N°{{ String(playerPokemon.pokedex_id).padStart(3, '0') }}</span>
        <span class="dex-name">{{ playerPokemon.name.fr }}</span>
      </div>

      <img
        :src="playerPokemon.sprites.regular"
        :alt="playerPokemon.name.fr"
        class="stat-card-sprite"
      />

      <div class="types-row">
        <span
          v-for="type in playerPokemon.types"
          :key="type.name"
          class="type-badge"
          :style="{ backgroundColor: typeColor(type.name) }"
        >
          <img :src="type.image" alt="" class="type-icon" />
          {{ type.name }}
        </span>
      </div>

      <div class="info-grid">
        <div><span class="info-label">Catégorie</span>{{ playerPokemon.category }}</div>
        <div><span class="info-label">Taille</span>{{ playerPokemon.height }}</div>
        <div><span class="info-label">Poids</span>{{ playerPokemon.weight }}</div>
        <div>
          <span class="info-label">Capture</span>{{ playerPokemon.catch_rate ?? '—' }}
        </div>
      </div>

      <div class="stats-block">
        <div v-for="(value, key) in playerPokemon.stats" :key="key" class="stat-row">
          <span class="stat-label">{{ STAT_LABELS[key] }}</span>
          <span class="stat-value">{{ value }}</span>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" :style="{ width: statPercent(value) + '%' }"></div>
          </div>
        </div>
      </div>

      <div v-if="playerPokemon.talents?.length" class="talents-row">
        <span class="info-label">Talents</span>
        <span
          v-for="talent in playerPokemon.talents"
          :key="talent.name"
          class="talent-chip"
          :class="{ 'talent-hidden': talent.tc }"
        >
          {{ talent.name }}<span v-if="talent.tc"> (caché)</span>
        </span>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}

.story-box {
  width: 100%;
  max-width: 520px;
  background: #0f172a;
  border: 4px solid #334155;
  border-radius: 16px;
  padding: 20px;
}

.story-sprite-frame {
  display: flex;
  justify-content: center;
  background: repeating-linear-gradient(
    to bottom,
    #1e293b,
    #1e293b 3px,
    #172033 3px,
    #172033 6px
  );
  border: 2px solid #334155;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.story-sprite {
  width: 120px;
  height: 120px;
  object-fit: contain;
  image-rendering: pixelated;
}

.story-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #e2e8f0;
  margin-bottom: 18px;
  min-height: 90px;
}

.choices-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-btn {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  color: white;
  font-weight: bold;
  text-align: left;
  cursor: pointer;
}

.choice-btn:hover {
  background: #334155;
  border-color: #64748b;
}

.choice-btn--restart {
  background: #4ade80;
  color: #0f172a;
  text-align: center;
}

.choice-btn--restart:hover {
  background: #22c55e;
}

.ending-tag {
  text-align: center;
  color: #ffe14d;
  font-weight: bold;
  margin-bottom: 4px;
}

/* ===== Combat ===== */
.battle-scene {
  width: 100%;
  max-width: 640px;
  background: #0f172a;
  border: 4px solid #334155;
  border-radius: 16px;
  padding: 16px;
}

.fighters-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.fighter-card {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1e293b;
  border-radius: 10px;
  padding: 10px;
  overflow: hidden;
}

.fighter-card.is-attacking {
  animation: card-attack 0.35s ease;
}

.fighter-card.is-hit {
  animation: card-hit 0.4s ease;
}

@keyframes card-attack {
  0% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-10px) scale(1.05);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes card-hit {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-6px);
  }
  80% {
    transform: translateX(6px);
  }
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
  margin-bottom: 4px;
}

.hp-fill {
  height: 100%;
  background: #4ade80;
  transition: width 0.4s;
}

.hp-value {
  font-size: 0.7rem;
  color: #cbd5e1;
  margin-bottom: 6px;
}

.fighter-sprite {
  width: 80px;
  height: 80px;
  image-rendering: pixelated;
}

.fighter-sprite--player {
  transform: scaleX(-1);
}

.fighter-sprite.is-flashing {
  animation: sprite-flash 0.4s ease;
}

@keyframes sprite-flash {
  0%,
  100% {
    filter: none;
  }
  50% {
    filter: brightness(2.4) saturate(0) drop-shadow(0 0 6px #ff4d4d);
  }
}

.damage-popup {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  font-size: 1.1rem;
  color: #fca5a5;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

.popup-enter-active {
  transition: all 0.8s ease-out;
}

.popup-enter-from {
  opacity: 1;
  transform: translate(-50%, 0);
}

.popup-enter-to {
  opacity: 0;
  transform: translate(-50%, -30px);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #1e293b;
  border: 2px solid;
  border-radius: 8px;
  padding: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.move-name {
  font-size: 0.9rem;
}

.move-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.move-power {
  font-size: 0.7rem;
  font-weight: normal;
  color: #cbd5e1;
}

.type-pill {
  font-size: 0.65rem;
  font-weight: bold;
  color: white;
  padding: 1px 8px;
  border-radius: 8px;
}

.move-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.move-btn:not(:disabled):hover {
  background: #334155;
}

/* ===== Carte de caractéristiques ===== */
.stat-card {
  width: 100%;
  max-width: 280px;
  background: #cfe8c9;
  border: 6px solid #2f2f2f;
  border-radius: 12px;
  padding: 12px;
  color: #1f1f1f;
  font-family: 'Courier New', monospace;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  background: #2f2f2f;
  color: #cfe8c9;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.stat-card-sprite {
  display: block;
  width: 110px;
  height: 110px;
  object-fit: contain;
  margin: 0 auto 8px;
  image-rendering: pixelated;
}

.types-row {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 8px;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
}

.type-icon {
  width: 14px;
  height: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  font-size: 0.75rem;
  margin-bottom: 8px;
}

.info-label {
  display: block;
  font-size: 0.65rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #3a5c34;
}

.stats-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 8px;
}

.stat-row {
  display: grid;
  grid-template-columns: 60px 24px 1fr;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
}

.stat-bar-track {
  background: #2f2f2f;
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
}

.stat-bar-fill {
  background: #d4302f;
  height: 100%;
}

.talents-row {
  font-size: 0.7rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.talent-chip {
  background: #2f2f2f;
  color: #cfe8c9;
  border-radius: 8px;
  padding: 1px 6px;
}

.talent-hidden {
  background: #705898;
}
</style>
