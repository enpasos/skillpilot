import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

const SOURCE_DIR = path.join(
  ROOT_DIR,
  'curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json',
)
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'app/public/data'),
  path.join(ROOT_DIR, 'backend/src/main/resources/static/data'),
]

const PHYSICS_DECK_FILES = [
  'hes_physic_flashcards_e_phase_deck.de.json',
  'hes_physic_flashcards_e_phase_deck.en.json',
  'hes_physic_flashcards_q1_deck.de.json',
  'hes_physic_flashcards_q2_deck.de.json',
  'hes_physic_flashcards_q3_deck.de.json',
  'hes_physic_flashcards_q4_deck.de.json',
]

function deployDecks() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`)
    process.exit(1)
  }

  for (const targetDir of TARGET_DIRS) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  let copied = 0
  for (const fileName of PHYSICS_DECK_FILES) {
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
    `Deployed ${copied} physics deck copy operations to ${TARGET_DIRS.join(', ')}`,
  )
}

deployDecks()
