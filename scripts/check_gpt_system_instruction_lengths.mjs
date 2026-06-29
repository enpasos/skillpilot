import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const maxChars = 8000
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const files = [
  'ai/openai custom gpt/system_instructions.de.md',
  'ai/openai custom gpt/system_instructions.en.md',
]

const failures = []
for (const file of files) {
  const text = fs.readFileSync(path.join(repoRoot, file), 'utf8')
  const chars = [...text].length
  if (chars > maxChars) {
    failures.push(`${file}: ${chars} chars, max ${maxChars}`)
  } else {
    console.log(`${file}: ${chars}/${maxChars} chars`)
  }
}

if (failures.length > 0) {
  console.error('GPT system instruction length check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}
