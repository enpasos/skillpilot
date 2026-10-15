// SPDX-License-Identifier: Apache-2.0
// Pure technical preparation. Historical D results are deliberately not loaded.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let repo = own
while (!existsSync(resolve(repo, 'AGENTS.md'))) repo = dirname(repo)
const read = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
const plan = read(resolve(own, 'checks/INPUTS.final-stable-native24.technical.json'))
if (plan.finalInputsExplicitlyReleased !== true) throw new Error('Final inputs have not been released')
const host = resolve(repo, plan.executionHost)
const mod = (n: string) => import(pathToFileURL(resolve(host, 'app/scripts', n + '.ts')).href)
const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile } = await mod('positiveGoalEvidenceProfileModel')
const { loadGoalBookBuildInputs, writeGoalBookModel, stableGoalBookJson } = await mod('goalBookModel')
const { buildGoalDescriptionCanonicalContext } = await mod('validateGoalDescriptionReviewCampaign')
const { fingerprintGoalDescriptionReviewContext } = await mod('validateGoalDescriptionDualRoundResolution')
const sha = (bytes: string | Buffer) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const put = (p: string, value: unknown) => {
  if (existsSync(p)) throw new Error('Refusing overwrite: ' + p)
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
}
const canonical = read(plan.canonical.path)
const byId = new Map(canonical.goals.map((g: any) => [g.id, g]))
const criteria = sha(readFileSync(resolve(repo, plan.positiveCriteria.path)))
const assets = new Map(plan.assets.map((a: any) => [a.goalId, a]))
const profiles = plan.profileSelection.map((selection: any) => {
  const content = readFileSync(resolve(repo, selection.container.path), 'utf8')
  const records = selection.container.path.endsWith('.jsonl')
    ? content.trim().split('\n').map(line => JSON.parse(line)) : JSON.parse(content).profiles
  const source = records.find((r: any) => r.goalId === selection.goalId)
  if (!source) throw new Error('Missing whole profile ' + selection.goalId)
  const goal: any = byId.get(selection.goalId)
  const profile = structuredClone(source.profile)
  if (sha(stableGoalBookJson(profile)) !== selection.wholeProfileObjectSha256) {
    throw new Error('Whole profile differs: ' + selection.goalId)
  }
  const digests: Record<string, string> = {}
  for (const link of goal.resourceLinks ?? []) if (link.type === 'goal-visualization') {
    const a: any = assets.get(goal.id)
    if (!a || 'app/public' + link.url !== a.normalPublicDestination) throw new Error('Missing asset ' + goal.id)
    digests[link.url] = a.physicalRepositorySource.sha256
  }
  return {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',
    schemaVersion: 2, reviewId: 'chemie-bcp-native24-raw-e0g0-technical-20261015-v1',
    goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteria, landscapeId: canonical.landscapeId, goalId: goal.id,
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, digests, 'curricularAtomic'),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profile), status: 'needs_human_review',
    reviewAuthority: 'ai_candidate', reviewedAt: plan.technicalInputBoundAtUTC,
    reviewer: 'Technical raw input binding only; no independent scientific vote',
    reason: 'Exact whole author profile body bound as E0/G0 to the final current goal and actual image bytes for Native input. Existing positive scientific records and their original resource scopes remain unchanged.',
    evidenceLevel: 'E0', maximumClaimScope: 'G0', reviewRunIds: [], dissent: [], profile,
  }
})
if (profiles.length !== 15 || new Set(profiles.map((r: any) => r.goalId)).size !== 15) throw new Error('Expected exact15 raw bodies')
const rawPath = resolve(own, 'profiles/fifteen-whole-author-bodies.raw-E0G0.actual-resources.technical.jsonl')
if (existsSync(rawPath)) throw new Error('Raw input already exists')
writeFileSync(rawPath, profiles.map((p: any) => JSON.stringify(p) + '\n').join(''), { flag: 'wx' })
const loaded = await loadGoalBookBuildInputs(plan.fullBaseConfigPath, host)
const model = loaded.model
if (model.pages.length !== 426 || new Set(model.pages.map((p: any) => p.goalId)).size !== 426) throw new Error('Expected full426 once')
await writeGoalBookModel(model, resolve(own, 'full426/book-model.json'))
const selected = new Set(plan.selectedGoalIds)
const orderedGoalIds = model.pages.filter((p: any) => selected.has(p.goalId)).map((p: any) => p.goalId)
if (orderedGoalIds.length !== 24) throw new Error('Expected bounded24')
const config = read(plan.nativeConfigDraftPath)
config.goalIds = orderedGoalIds
put(resolve(repo, plan.nativeConfigPath), config)
const profilesById = new Map(profiles.map((p: any) => [p.goalId, p]))
put(resolve(own, 'checks/FULL426.exact-selected24-page-and-canonical-contexts.actual.json'), {
  schemaVersion: 1, role: 'Actual stock full426 selected page and canonical contexts; no scientific review',
  modelDigest: model.digest, denominator: 426, selectedGoalIds: orderedGoalIds,
  rows: model.pages.filter((p: any) => selected.has(p.goalId)).map((page: any) => {
    const goal: any = byId.get(page.goalId)
    const row = { goalId: page.goalId, goalFingerprint: page.goalFingerprint, pageFingerprint: page.pageFingerprint,
      currentTitleDe: goal.title, currentTitleEn: goal.titleEn,
      currentDescriptionDe: goal.description, currentDescriptionEn: goal.descriptionEn,
      canonicalContext: buildGoalDescriptionCanonicalContext(goal),
      reviewContext: { page, evidenceProfile: profilesById.get(goal.id) ?? null } }
    return { ...row, actualStockContextFingerprint: fingerprintGoalDescriptionReviewContext(row) }
  }),
  fullModelLoadsByThisScript: 1, rendererRuns: 0, newScientificVotes: 0, oldDRewrites: 0,
})
const openContextGoalId = '11bea4c6-7b8a-47e0-8293-2eb1ce34cf66'
put(resolve(own, 'checks/OPEN11bea.actual-full426-context-only.not-selected-not-reviewed.json'), {
  role: 'Unresolved external neighbour context from the same actual full426 model; outside Native24 and D24 closure',
  goalId: openContextGoalId, modelDigest: model.digest,
  page: model.pages.find((p: any) => p.goalId === openContextGoalId),
  canonicalContext: buildGoalDescriptionCanonicalContext(byId.get(openContextGoalId)),
  selectedForNative: false, newDVote: false, closureGranted: false,
})
console.log(JSON.stringify({ fullPages: 426, selectedPages: 24, rawProfiles: profiles.length, modelDigest: model.digest, rendererRuns: 0 }))
