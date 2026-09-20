import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '../../../../../..')
const batchDir = import.meta.dirname
const manifestPath = path.join(batchDir, 'manifest.json')
const canonicalPath = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
)
const sourceRoot = path.join(repoRoot, 'curricula/DE/Gymnasium/visualizations/physik')
const publicRoot = path.join(repoRoot, 'app/public/assets/goal-visualizations/physik')
const backendRoot = path.join(
  repoRoot,
  'backend/src/main/resources/static/assets/goal-visualizations/physik',
)

const sha256 = filePath => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'))
const goals = new Map(canonical.goals.map(goal => [goal.id, goal]))

assert.equal(manifest.entries.length, 16, 'Expected exactly 16 reviewed candidates')
assert.equal(manifest.integrationStatus, 'not_integrated')

const imported = []

for (const entry of manifest.entries) {
  const goal = goals.get(entry.goalId)
  assert(goal, `Missing canonical goal ${entry.goalId}`)
  assert.equal(goal.title, entry.title, `Title drift for ${entry.goalId}`)

  const candidatePath = path.join(repoRoot, entry.candidatePath)
  const promptPath = path.join(repoRoot, entry.selectedPromptPath)
  assert.equal(sha256(candidatePath), entry.assetSha256, `Candidate hash drift for ${entry.goalId}`)
  assert(fs.statSync(promptPath).isFile(), `Missing selected prompt for ${entry.goalId}`)

  const priorVisualizations = (goal.resourceLinks ?? []).filter(
    link => link.type === 'goal-visualization' && link.role === 'primary' && (link.lang ?? 'de') === 'de',
  )
  assert.equal(priorVisualizations.length, 0, `Primary visualization already exists for ${entry.goalId}`)

  const assetName = `${entry.goalId}.png`
  const assetUrl = `/assets/goal-visualizations/physik/${entry.goalId}/${assetName}`
  const sourceDir = path.join(sourceRoot, entry.goalId)
  const publicDir = path.join(publicRoot, entry.goalId)
  const backendDir = path.join(backendRoot, entry.goalId)
  for (const directory of [sourceDir, publicDir, backendDir]) fs.mkdirSync(directory, { recursive: true })

  const sourceAsset = path.join(sourceDir, assetName)
  const publicAsset = path.join(publicDir, assetName)
  const backendAsset = path.join(backendDir, assetName)
  fs.copyFileSync(candidatePath, sourceAsset)
  fs.copyFileSync(candidatePath, publicAsset)
  fs.copyFileSync(candidatePath, backendAsset)
  fs.copyFileSync(promptPath, path.join(sourceDir, 'prompt.de.md'))

  for (const importedAsset of [sourceAsset, publicAsset, backendAsset]) {
    assert.equal(sha256(importedAsset), entry.assetSha256, `Imported hash mismatch: ${importedAsset}`)
  }

  const visualization = {
    type: 'goal-visualization',
    resourceType: 'image',
    role: 'primary',
    skillpilotId: entry.goalId,
    title: `Visualisierung: ${goal.title}`,
    url: assetUrl,
    provider: 'OpenAI / ChatGPT-Codex image generation',
    description: `Visualisierung zum Lernziel: ${goal.title}.`,
    altText: entry.altTextDE,
    lang: 'de',
    license: 'AI-generated, SkillPilot-curated',
    reviewStatus: 'pilot',
  }
  goal.resourceLinks = [visualization, ...(goal.resourceLinks ?? [])]

  imported.push({
    goalId: entry.goalId,
    assetUrl,
    assetSha256: entry.assetSha256,
    provider: visualization.provider,
    selectedPromptPath: entry.selectedPromptPath,
    canonicalPromptPath: path.relative(repoRoot, path.join(sourceDir, 'prompt.de.md')),
    altTextDE: entry.altTextDE,
    description: visualization.description,
    reviewStatus: visualization.reviewStatus,
  })
}

fs.writeFileSync(canonicalPath, `${JSON.stringify(canonical, null, 2)}\n`)

manifest.integrationStatus = 'canonical_and_runtime_asset_triplets_imported'
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

const receipt = {
  schemaVersion: 1,
  batchId: manifest.batchId,
  importedAt: new Date().toISOString(),
  canonicalPath: path.relative(repoRoot, canonicalPath),
  imported,
  excludedMutations: ['central QA registry', 'in-flight ledger'],
}
fs.writeFileSync(path.join(batchDir, 'import-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)

console.log(`Imported ${imported.length} reviewed PNG candidates with verified asset triplets.`)
