<script setup>
import { ref, computed } from 'vue'

function spriteUrl(pokedexId) {
  return `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokedexId}/regular.png`
}

// Arbre narratif : chaque nœud a un texte, une image et des choix menant à d'autres nœuds.
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
      { label: 'Combattre', next: 'forestFight' },
      { label: 'Essayer de le calmer', next: 'forestBefriend' },
    ],
  },
  forestFight: {
    image: 25,
    text: "Pikachu utilise Éclair ! Le Chenipan détale aussitôt. En continuant ton chemin, tu trouves une Pierre Feu brillante au sol.",
    choices: [
      { label: 'Continuer vers la grotte', next: 'caveEntry' },
      { label: 'Retourner au village montrer ta trouvaille', next: 'villageReturn' },
    ],
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
    text: 'Le Professeur Chen t\'accueille chaleureusement et te propose de choisir un second partenaire pour t\'accompagner.',
    choices: [
      { label: 'Choisir Salamèche', next: 'labFire' },
      { label: 'Choisir Carapuce', next: 'labWater' },
      { label: "Refuser poliment et partir explorer", next: 'forestEntry' },
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
      { label: 'Le défier', next: 'endingChampion' },
      { label: "Rester immobile, impressionné", next: 'endingMystic' },
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

const currentId = ref('start')
const currentNode = computed(() => STORY[currentId.value])

function choose(next) {
  currentId.value = next
}

function restart() {
  currentId.value = 'start'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-800 p-4 text-white">
    <div class="story-box">
      <h1 class="text-2xl font-bold text-center mb-4">Poke Story</h1>

      <div class="story-sprite-frame">
        <img :src="spriteUrl(currentNode.image)" alt="" class="story-sprite" />
      </div>

      <p class="story-text">{{ currentNode.text }}</p>

      <div v-if="!currentNode.ending" class="choices-col">
        <button
          v-for="choice in currentNode.choices"
          :key="choice.next"
          class="choice-btn"
          @click="choose(choice.next)"
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
  </div>
</template>

<style scoped>
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
</style>
