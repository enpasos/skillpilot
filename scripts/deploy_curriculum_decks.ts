import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const SOURCE_DIR = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/memory-decks')
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'app/public/data'),
  path.join(ROOT_DIR, 'backend/src/main/resources/static/data'),
]

const MATH_DECK_FILES = [
  'de_gymnasium_math_flashcards_functions_basics.de.json',
  'de_gymnasium_math_flashcards_functions_basics.en.json',
  'de_gymnasium_math_flashcards_analysis_core.de.json',
  'de_gymnasium_math_flashcards_analysis_core.en.json',
  'de_gymnasium_math_flashcards_linalg_core.de.json',
  'de_gymnasium_math_flashcards_linalg_core.en.json',
  'de_gymnasium_math_flashcards_stochastics_core.de.json',
  'de_gymnasium_math_flashcards_stochastics_core.en.json',
  'de_gymnasium_math_flashcards_complex_parameter.de.json',
  'de_gymnasium_math_flashcards_complex_parameter.en.json',
]

const PHYSICS_DECK_FILES = [
  'de_gymnasium_physics_flashcards_mechanics_ephase.de.json',
  'de_gymnasium_physics_flashcards_mechanics_ephase.en.json',
  'de_gymnasium_physics_flashcards_fields_q1.de.json',
  'de_gymnasium_physics_flashcards_waves_q2.de.json',
  'de_gymnasium_physics_flashcards_quantum_q3.de.json',
  'de_gymnasium_physics_flashcards_structure_q4.de.json',
]

const CHEMISTRY_DECK_FILES = [
  'de_gymnasium_chemistry_flashcards_basics_seki.de.json',
  'de_gymnasium_chemistry_flashcards_bonding_structure.de.json',
  'de_gymnasium_chemistry_flashcards_organic_q1.de.json',
  'de_gymnasium_chemistry_flashcards_natural_q2.de.json',
  'de_gymnasium_chemistry_flashcards_equilibria_q3.de.json',
  'de_gymnasium_chemistry_flashcards_energy_q4.de.json',
]

const CURRICULUM_DECK_FILES = [
  ...MATH_DECK_FILES,
  ...PHYSICS_DECK_FILES,
  ...CHEMISTRY_DECK_FILES,
]

const LEGACY_CURRICULUM_DECK_FILES = [
  'hes_math_flashcards_e_phase_deck.json',
  'hes_math_flashcards_e_phase_deck_en.json',
  'hes_math_flashcards_q1_deck.json',
  'hes_math_flashcards_q1_deck_en.json',
  'hes_math_flashcards_q2_deck.json',
  'hes_math_flashcards_q2_deck_en.json',
  'hes_math_flashcards_q3_deck.json',
  'hes_math_flashcards_q3_deck_en.json',
  'hes_math_flashcards_q4_deck.json',
  'hes_math_flashcards_q4_deck_en.json',
  'hes_physic_flashcards_e_phase_deck.de.json',
  'hes_physic_flashcards_e_phase_deck.en.json',
  'hes_physic_flashcards_q1_deck.de.json',
  'hes_physic_flashcards_q2_deck.de.json',
  'hes_physic_flashcards_q3_deck.de.json',
  'hes_physic_flashcards_q4_deck.de.json',
  'he_physics_flashcards_e_phase_deck.de.json',
  'he_physics_flashcards_e_phase_deck.en.json',
  'he_physics_flashcards_q1_deck.de.json',
  'he_physics_flashcards_q2_deck.de.json',
  'he_physics_flashcards_q3_deck.de.json',
  'he_physics_flashcards_q4_deck.de.json',
  'he_chem_flashcards_basics_seki_deck.de.json',
  'he_chem_flashcards_bonding_structure_deck.de.json',
  'he_chem_flashcards_organic_q1_deck.de.json',
  'he_chem_flashcards_natural_q2_deck.de.json',
  'he_chem_flashcards_equilibria_q3_deck.de.json',
  'he_chem_flashcards_energy_q4_deck.de.json',
]

function deployDecks() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`)
    process.exit(1)
  }

  for (const targetDir of TARGET_DIRS) {
    fs.mkdirSync(targetDir, { recursive: true })
    LEGACY_CURRICULUM_DECK_FILES.forEach((fileName) => {
      const legacyPath = path.join(targetDir, fileName)
      if (fs.existsSync(legacyPath)) {
        fs.rmSync(legacyPath)
      }
    })
  }

  let copied = 0
  for (const fileName of CURRICULUM_DECK_FILES) {
    const sourcePath = path.join(SOURCE_DIR, fileName)

    if (!fs.existsSync(sourcePath)) {
      console.error(`Missing source deck file: ${sourcePath}`)
      process.exit(1)
    }

    for (const targetDir of TARGET_DIRS) {
      const targetPath = path.join(targetDir, fileName)
      fs.copyFileSync(sourcePath, targetPath)
      copied++
    }
  }

  console.log(
    `Deployed ${copied} curriculum deck copy operations to ${TARGET_DIRS.join(', ')}`,
  )
}

deployDecks()
