// SPDX-License-Identifier: Apache-2.0
// Bounded current-input verification; scientific judgments are recorded separately.
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = process.cwd()
const output = dirname(fileURLToPath(import.meta.url))
const author = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-current391-author-v1')
const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const batch = await readJson(resolve(author, 'native20.neutral.batch.config.json'))
const { loadGoalBookBuildInputs } = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const current = await loadGoalBookBuildInputs(batch.baseGoalBookConfigPath, root)
const selected = new Set<string>(batch.goalIds)
const pages = current.model.pages.filter((page: { goalId: string }) => selected.has(page.goalId))
if (pages.length !== 20 || new Set(pages.map((page: { goalId: string }) => page.goalId)).size !== 20) {
  throw new Error('The twenty exact current whole targets must occur once each')
}
const whole = await readJson(resolve(author, 'current20-whole-DEEN-goals.actual.json'))
const byId = new Map(whole.goals.map((goal: { id: string }) => [goal.id, goal]))
for (const page of pages) {
  const goal: any = byId.get(page.goalId)
  if (page.title !== goal.title || page.description !== goal.description || page.visualization !== null) {
    throw new Error(`${page.goalId}: current text/preimage changed`)
  }
}
const paths = new Set<string>([
  batch.baseGoalBookConfigPath,
  current.config.landscapePath,
  current.config.compositionViewManifestPath,
  current.config.semanticKindLedgerPath,
  current.config.goalVisualizationQaPath,
  current.model.source.navigationViewPath,
  current.model.source.durationModelPolicyPath,
  ...current.model.source.compositionViewSources.map((source: { path: string }) => source.path),
  'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_BIOLOGIE_SEKI_G9.source-extraction.json',
  'curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_BIOLOGIE.de.json.snapshot',
  'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_biology_lower_secondary_source_extraction_to_canonical_biology.review.json',
])
const files = []
for (const path of [...paths].sort()) {
  const bytes = await readFile(resolve(root, path))
  files.push({ path, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length })
}
await writeFile(resolve(output, 'current-twenty-native-contexts.independent-b.snapshot.json'), JSON.stringify({
  artifactKind: 'independent-b-current-native-twenty-context-preimage',
  recordedAt: new Date().toISOString(),
  role: 'current text/context binding verification; not final native D or V approval',
  fullCurrentAtlasCount: current.model.pages.length,
  currentModelDigest: current.model.digest,
  source: current.model.source,
  pages,
  nativeFinalImageDescriptionCampaignPrepared: false,
  humanApproval: false,
  strictClosuresClaimed: 0,
}, null, 2) + '\n', { flag: 'wx' })
await writeFile(resolve(output, 'current-input-bindings.independent-b.actual.json'), JSON.stringify({
  artifactKind: 'independent-b-current-source-and-context-input-bindings',
  recordedAt: new Date().toISOString(),
  files,
  selectedGoalIds: [...selected],
  currentTwentyPagesPath: relative(root, resolve(output, 'current-twenty-native-contexts.independent-b.snapshot.json')),
  humanApproval: false,
  strictClosuresClaimed: 0,
}, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ currentSelectedWholeGoals: pages.length, currentAtlasGoals: current.model.pages.length, textPreimageExact: true, currentInputFilesBound: files.length, nativeDComplete: false, VComplete: false }))
