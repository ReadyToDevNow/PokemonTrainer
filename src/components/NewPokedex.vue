<script setup>
import { ref, computed, onMounted } from 'vue'
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

const STAT_LABELS = {
  hp: 'PV',
  atk: 'Attaque',
  def: 'Défense',
  spe_atk: 'Atq. Spé.',
  spe_def: 'Déf. Spé.',
  vit: 'Vitesse',
}

const pokemons = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedId = ref(1)
const showShiny = ref(false)

onMounted(async () => {
  try {
    const data = await getFirstGeneration()
    pokemons.value = data
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
})

const filteredPokemons = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return pokemons.value
  return pokemons.value.filter(
    (pokemon) =>
      pokemon.name.fr.toLowerCase().includes(query) ||
      String(pokemon.pokedex_id).includes(query),
  )
})

const selectedPokemon = computed(() =>
  pokemons.value.find((pokemon) => pokemon.pokedex_id === selectedId.value),
)

function selectPokemon(id) {
  selectedId.value = id
  showShiny.value = false
}

function typeColor(typeName) {
  return TYPE_COLORS[typeName] || '#68A090'
}

function statPercent(value) {
  return Math.min(100, Math.round((value / 255) * 100))
}

function padId(id) {
  return String(id).padStart(3, '0')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-800 p-4">
    <div v-if="loading" class="text-white text-xl font-bold">Chargement du Pokédex…</div>
    <div v-else-if="error" class="text-white text-xl font-bold">
      Impossible de charger le Pokédex.
    </div>

    <div v-else class="pokedex">
      <!-- ===== Left half: screen unit ===== -->
      <div class="pokedex-left">
        <div class="top-bar">
          <div class="lens-outer">
            <div class="lens-inner"></div>
          </div>
          <div class="small-lights">
            <span class="light light-red"></span>
            <span class="light light-yellow"></span>
            <span class="light light-green"></span>
          </div>
        </div>

        <div class="main-screen" v-if="selectedPokemon">
          <div class="screen-header">
            <span class="dex-number">N°{{ padId(selectedPokemon.pokedex_id) }}</span>
            <span class="dex-name">{{ selectedPokemon.name.fr }}</span>
          </div>

          <div class="sprite-frame">
            <img
              :src="showShiny ? selectedPokemon.sprites.shiny : selectedPokemon.sprites.regular"
              :alt="`Sprite de ${selectedPokemon.name.fr}`"
              class="sprite-img"
            />
          </div>

          <button
            v-if="selectedPokemon.sprites.shiny"
            class="shiny-toggle"
            @click="showShiny = !showShiny"
          >
            {{ showShiny ? '★ Normal' : '☆ Shiny' }}
          </button>

          <div class="types-row">
            <span
              v-for="type in selectedPokemon.types"
              :key="type.name"
              class="type-badge"
              :style="{ backgroundColor: typeColor(type.name) }"
            >
              <img :src="type.image" alt="" class="type-icon" />
              {{ type.name }}
            </span>
          </div>

          <div class="info-grid">
            <div><span class="info-label">Catégorie</span>{{ selectedPokemon.category }}</div>
            <div><span class="info-label">Taille</span>{{ selectedPokemon.height }}</div>
            <div><span class="info-label">Poids</span>{{ selectedPokemon.weight }}</div>
            <div>
              <span class="info-label">Capture</span>{{ selectedPokemon.catch_rate ?? '—' }}
            </div>
          </div>

          <div class="stats-block">
            <div
              v-for="(value, key) in selectedPokemon.stats"
              :key="key"
              class="stat-row"
            >
              <span class="stat-label">{{ STAT_LABELS[key] }}</span>
              <span class="stat-value">{{ value }}</span>
              <div class="stat-bar-track">
                <div
                  class="stat-bar-fill"
                  :style="{ width: statPercent(value) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div v-if="selectedPokemon.talents?.length" class="talents-row">
            <span class="info-label">Talents</span>
            <span
              v-for="talent in selectedPokemon.talents"
              :key="talent.name"
              class="talent-chip"
              :class="{ 'talent-hidden': talent.tc }"
            >
              {{ talent.name }}<span v-if="talent.tc"> (caché)</span>
            </span>
          </div>

          <div v-if="selectedPokemon.evolution?.next?.length" class="evolution-row">
            <span class="info-label">Évolue vers</span>
            <button
              v-for="evo in selectedPokemon.evolution.next"
              :key="evo.pokedex_id"
              class="evo-chip"
              @click="selectPokemon(evo.pokedex_id)"
            >
              {{ evo.name }} ({{ evo.condition }})
            </button>
          </div>
        </div>

        <div class="controls-row">
          <div class="dpad">
            <div class="dpad-up"></div>
            <div class="dpad-left"></div>
            <div class="dpad-center"></div>
            <div class="dpad-right"></div>
            <div class="dpad-down"></div>
          </div>
          <div class="round-buttons">
            <span class="round-btn btn-b">B</span>
            <span class="round-btn btn-a">A</span>
          </div>
        </div>
      </div>

      <!-- ===== Right half: pokemon list ===== -->
      <div class="pokedex-right">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un Pokémon..."
            class="search-input"
          />
        </div>

        <ul class="pokemon-list">
          <li
            v-for="pokemon in filteredPokemons"
            :key="pokemon.pokedex_id"
            class="pokemon-list-item"
            :class="{ active: pokemon.pokedex_id === selectedId }"
            @click="selectPokemon(pokemon.pokedex_id)"
          >
            <img :src="pokemon.sprites.regular" :alt="pokemon.name.fr" class="list-sprite" />
            <span class="list-id">N°{{ padId(pokemon.pokedex_id) }}</span>
            <span class="list-name">{{ pokemon.name.fr }}</span>
            <span class="list-types">
              <img
                v-for="type in pokemon.types"
                :key="type.name"
                :src="type.image"
                :alt="type.name"
                class="list-type-icon"
              />
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokedex {
  display: flex;
  flex-wrap: wrap;
  background: #cc0000;
  border: 6px solid #7a0000;
  border-radius: 24px;
  box-shadow:
    0 0 0 4px #e83d3d inset,
    0 20px 40px rgba(0, 0, 0, 0.5);
  max-width: 920px;
  width: 100%;
  padding: 16px;
  gap: 16px;
  font-family: 'Courier New', monospace;
}

.pokedex-left,
.pokedex-right {
  background: #b30000;
  border-radius: 16px;
  padding: 12px;
  flex: 1 1 380px;
  border: 3px solid #7a0000;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.lens-outer {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff 0%, #7fd3ff 25%, #1a6fd0 60%, #0d3b73 100%);
  border: 3px solid #eef;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
}

.small-lights {
  display: flex;
  gap: 8px;
}

.light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.3);
}
.light-red {
  background: #ff4d4d;
}
.light-yellow {
  background: #ffe14d;
}
.light-green {
  background: #4dff77;
}

.main-screen {
  background: #cfe8c9;
  border: 6px solid #2f2f2f;
  border-radius: 8px;
  padding: 10px;
  height: 480px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.screen-header {
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

.sprite-frame {
  background: repeating-linear-gradient(
    to bottom,
    #d9edd2,
    #d9edd2 3px,
    #cfe8c9 3px,
    #cfe8c9 6px
  );
  border: 2px solid #2f2f2f;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
  image-rendering: pixelated;
}

.sprite-img {
  width: 110px;
  height: 110px;
  object-fit: contain;
}

.shiny-toggle {
  display: block;
  margin: 6px auto;
  background: #2f2f2f;
  color: #ffe14d;
  border: none;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 0.75rem;
  cursor: pointer;
}

.types-row {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 8px 0;
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
  color: #1f1f1f;
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
  color: #1f1f1f;
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

.talents-row,
.evolution-row {
  font-size: 0.7rem;
  color: #1f1f1f;
  margin-bottom: 6px;
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

.evo-chip {
  background: #ffe14d;
  border: none;
  border-radius: 8px;
  padding: 2px 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.7rem;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding: 0 8px;
}

.dpad {
  display: grid;
  grid-template-columns: 24px 24px 24px;
  grid-template-rows: 24px 24px 24px;
  grid-template-areas:
    '. up .'
    'left center right'
    '. down .';
}
.dpad-up {
  grid-area: up;
  background: #2f2f2f;
}
.dpad-left {
  grid-area: left;
  background: #2f2f2f;
}
.dpad-center {
  grid-area: center;
  background: #2f2f2f;
}
.dpad-right {
  grid-area: right;
  background: #2f2f2f;
}
.dpad-down {
  grid-area: down;
  background: #2f2f2f;
}

.round-buttons {
  display: flex;
  gap: 10px;
}

.round-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2f2f2f;
  color: #ffe14d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
}

.search-bar {
  margin-bottom: 8px;
}

.search-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 2px solid #2f2f2f;
  background: #ffe14d;
  font-family: inherit;
  font-size: 0.85rem;
}

.search-input::placeholder {
  color: #6b5a00;
}

.pokemon-list {
  background: #cfe8c9;
  border: 6px solid #2f2f2f;
  border-radius: 8px;
  list-style: none;
  padding: 6px;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}

.pokemon-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
}

.pokemon-list-item:hover {
  background: rgba(0, 0, 0, 0.08);
}

.pokemon-list-item.active {
  background: #2f2f2f;
  color: #cfe8c9;
}

.list-sprite {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.list-id {
  font-size: 0.7rem;
  width: 42px;
  flex-shrink: 0;
}

.list-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: bold;
}

.list-types {
  display: flex;
  gap: 2px;
}

.list-type-icon {
  width: 16px;
  height: 16px;
}
</style>
