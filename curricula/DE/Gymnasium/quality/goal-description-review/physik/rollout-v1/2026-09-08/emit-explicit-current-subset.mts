// Mechanical materialization only: all decisions/rationales are explicitly authored.
// Preserve full sealed campaigns; never convert a split/revise/block to KEEP.
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, relative, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const loadModule = (p: string) => import(pathToFileURL(resolve(root, p)).href)
const { materializeGoalDescriptionRolloutBatchDualSummary } = await loadModule('app/scripts/materializeGoalDescriptionRolloutBatch.ts')
const { buildGoalDescriptionDualRoundResolution, extractGoalDescriptionDualRoundResolutionSource, validateGoalDescriptionDualRoundResolution } = await loadModule('app/scripts/validateGoalDescriptionDualRoundResolution.ts')
const configPath = process.argv[2]
if (!configPath) throw Error('Pass the exact prepared batch config path')
const dual = await materializeGoalDescriptionRolloutBatchDualSummary(configPath, false)
const dir = dual.prepared.outputDirectory
const authoringPath = join(dir, 'synthesis-current-subset.json')
const spec = JSON.parse(fs.readFileSync(authoringPath, 'utf8'))
if (spec.schemaVersion !== 1 || spec.authority !== 'ai_synthesis') throw Error('Explicit AI synthesis required')
const configured = new Set(dual.prepared.manifest.goalIds)
const authored = [...spec.decisions, ...spec.excluded].map(x => x.goalId)
if (new Set(authored).size !== authored.length || authored.length !== configured.size || authored.some(id => !configured.has(id))) throw Error('Explicit decisions/exclusions must partition the full immutable campaign')
const sha = (v: string | Buffer) => 'sha256:' + createHash('sha256').update(v).digest('hex')
const bytes = (v: unknown) => JSON.stringify(v, null, 2) + '\n'
const landscapeBytes = fs.readFileSync(dual.prepared.manifest.source.landscapePath)
const landscape = JSON.parse(landscapeBytes.toString())
const kinds = JSON.parse(fs.readFileSync('curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json', 'utf8'))
const actualGoalIds = new Set(landscape.goals.map(g => g.id))
const denominator = kinds.decisions.filter(d => actualGoalIds.has(d.goalId) && d.semanticKind === 'curricularAtomic').length
const artifacts: Array<{path: string; text: string}> = []
const resolutions = []
const checkedAt = new Date().toISOString()
for (const decision of spec.decisions) {
  if (!['first', 'second'].includes(decision.evidenceRound) || !decision.rationaleDe?.trim() || !decision.rationaleEn?.trim()) throw Error('Missing individual bilingual synthesis: ' + decision.goalId)
  const first = extractGoalDescriptionDualRoundResolutionSource({artifacts: dual.first, goalId: decision.goalId, label: 'First'})
  const second = extractGoalDescriptionDualRoundResolutionSource({artifacts: dual.second, goalId: decision.goalId, label: 'Second'})
  if (first.errors.length || second.errors.length || first.source?.decision !== 'keep' || second.source?.decision !== 'keep') throw Error('Two exact independent KEEP sources required: ' + decision.goalId)
  const selected = decision.evidenceRound === 'first' ? first.source : second.source
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: dual.prepared.manifest.batchId + '-current-subset-' + decision.goalId,
    goalId: decision.goalId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current',
    synthesis: {
      synthesisId: dual.prepared.manifest.batchId + '-explicit-synthesis-' + decision.goalId,
      authority: 'ai_synthesis', synthesizedBy: spec.synthesizedBy, synthesizedAt: checkedAt,
      rationaleDe: decision.rationaleDe, rationaleEn: decision.rationaleEn,
      understandingEvidence: selected.record.understandingEvidence,
      dissent: [{
        dissentId: 'evidence-selection-' + decision.goalId, source: 'both',
        textDe: 'Beide unabhängigen Urteile sind KEEP; ihre unterschiedlichen Evidenzformulierungen und Begründungen bleiben unverändert erhalten. Die individuelle Synthese wählt die Evidenz der ' + (decision.evidenceRound === 'first' ? 'ersten' : 'zweiten') + ' Runde.',
        textEn: 'Both independent decisions are KEEP; their differing evidence formulations and rationales remain unchanged in the original records. The individual synthesis selects the ' + (decision.evidenceRound === 'first' ? 'first' : 'second') + ' round evidence.',
        disposition: decision.evidenceRound === 'first' ? 'accepted_first' : 'accepted_second',
      }], humanAttestation: null,
    },
    dualSummaryBytes: dual.bytes, currentInput: dual.first.input,
    firstSource: first.source, secondSource: second.source,
  })
  const result = await validateGoalDescriptionDualRoundResolution({resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, landscape, first: dual.first, second: dual.second})
  if (result.errors.length || !result.strictDescriptionComplete) throw Error(decision.goalId + ': ' + result.errors.join(' | '))
  const text = bytes(resolution)
  const resolutionPath = 'resolutions-current-subset/' + decision.goalId + '.resolution.json'
  artifacts.push({path: join(dir, resolutionPath), text})
  resolutions.push({goalId: decision.goalId, titleDe: resolution.goal.finalText.titleDe, groupId: dual.prepared.manifest.batchId, decision: resolution.decision, resolutionPath, resolutionDigest: sha(text), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true})
}
const index = {
  schemaVersion: 1, artifactSetId: dual.prepared.manifest.batchId + '-explicit-current-subset-v1',
  subject: 'Physik', semanticKind: 'curricularAtomic', strictDescriptionReviewCompleteCount: resolutions.length,
  curriculumAtomicDenominator: denominator, descriptionReviewPercentage: Math.round(resolutions.length / denominator * 1000) / 10,
  groups: [{groupId: dual.prepared.manifest.batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: sha(dual.bytes), campaignGoalCount: dual.summary.goalCount, resolvedGoalCount: resolutions.length}],
  resolutions,
}
artifacts.push({path: join(dir, 'resolution-index.current-subset-v1.json'), text: bytes(index)})
artifacts.push({path: join(dir, 'current-subset-materialization.receipt.json'), text: bytes({schemaVersion: 1, authority: 'ai_synthesis', checkedAt, configPath, authoringDigest: sha(fs.readFileSync(authoringPath)), canonicalSnapshotDigest: sha(landscapeBytes), currentAtomicDenominatorSnapshot: denominator, unchangedFullCampaignGoalCount: dual.summary.goalCount, nativeValidatedResolutions: resolutions.map(r=>r.goalId), excluded: spec.excluded, limits: 'Individual native resolution validation; no human approval, no new blind reviews, no claim of all-five-gate completion or final CI. Whole campaigns and non-KEEP findings are preserved.'})})
for (const a of artifacts) if (fs.existsSync(a.path)) throw Error('Immutable output already exists; do not overwrite: ' + a.path)
process.stdout.write('*** Begin Patch\n')
for (const a of artifacts) process.stdout.write('*** Add File: ' + relative(root, a.path) + '\n' + a.text.trimEnd().split('\n').map(l=>'+'+l).join('\n') + '\n')
process.stdout.write('*** End Patch\n')
