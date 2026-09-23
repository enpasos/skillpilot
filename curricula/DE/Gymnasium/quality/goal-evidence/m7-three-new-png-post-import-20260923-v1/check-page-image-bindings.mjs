import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const receipt = JSON.parse(readFileSync(new URL('./page-image-bindings.json', import.meta.url)))
const book = JSON.parse(readFileSync(resolve(root, receipt.bookModelPath)))
const landscape = JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')))
if (book.digest !== receipt.bookModelDigest) throw new Error('Book model digest changed')
for (const expected of receipt.pages) {
  const page = book.pages.find(item => item.goalId === expected.goalId)
  const goal = landscape.goals.find(item => item.id === expected.goalId)
  const link = goal?.resourceLinks?.find(item => item.type === 'goal-visualization' && item.role === 'primary')
  if (!page || !goal || !link) throw new Error(`Missing current page, goal or visualization ${expected.goalId}`)
  if (page.pageNumber !== expected.pageNumber || page.pageFingerprint !== expected.pageFingerprint) throw new Error(`Page binding changed ${expected.goalId}`)
  if (page.title !== goal.title || page.description !== goal.description) throw new Error(`Goal text/page mismatch ${expected.goalId}`)
  if (page.visualization?.url !== link.url || page.visualization.altText !== link.altText) throw new Error(`Image/page mismatch ${expected.goalId}`)
  const asset = readFileSync(resolve(root, 'app/public', link.url.slice(1)))
  const digest = `sha256:${createHash('sha256').update(asset).digest('hex')}`
  if (digest !== expected.imageSha256 || page.visualization.originalDigest !== digest) throw new Error(`Image bytes/page mismatch ${expected.goalId}`)
  if (page.visualization.approvedForPublication !== false || page.visualization.qaStatus !== 'review_candidate') throw new Error(`Unexpected page approval status ${expected.goalId}`)
}
process.stdout.write(`Checked ${receipt.pages.length} current candidate GoalBook page/image bindings; no D or V approval inferred.\n`)
