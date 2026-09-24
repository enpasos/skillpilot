import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
} from '../../../../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { loadGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import { validateGoalDescriptionReviewDualRound } from '../../../../../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound'

const here = dirname(fileURLToPath(import.meta.url))
const batch = resolve(here, '../..')
const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8')) as Record<string, any>
const readRound = async (name: 'round-a' | 'round-b') => {
  const directory = resolve(batch, name)
  const campaign = await readJson(resolve(directory, 'description-review-campaign.json'))
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: resolve(directory, 'batches'),
    resultsDirectory: resolve(directory, 'results'),
  })
  if (loaded.errors.length) throw new Error(`${name}: ${loaded.errors.join('; ')}`)
  return {
    artifacts: {
      bundle: await readJson(resolve(directory, 'review-bundle-manifest.json')),
      input: await readJson(resolve(directory, 'description-review-input.json')),
      campaign,
      resultPairs: loaded.resultPairs,
    },
  }
}

const [first, second] = await Promise.all([readRound('round-a'), readRound('round-b')])
const checked = await validateGoalDescriptionReviewDualRound({
  first: first.artifacts,
  second: second.artifacts,
  diversityPolicy: 'require_distinct_provider_or_model',
})
if (checked.errors.length) throw new Error(checked.errors.join('\n'))
const summaryBytes = Buffer.from(`${JSON.stringify(checked.summary, null, 2)}\n`)
const summaryPath = resolve(batch, 'dual-summary.current-20260924.json')
await writeFile(summaryPath, summaryBytes)

const goalId = '66f432e9-22d3-51a9-8787-35f91db30616'
const firstSource = extractGoalDescriptionDualRoundResolutionSource({
  artifacts: first.artifacts,
  goalId,
  label: 'first',
})
const secondSource = extractGoalDescriptionDualRoundResolutionSource({
  artifacts: second.artifacts,
  goalId,
  label: 'second',
})
if (firstSource.errors.length || !firstSource.source) throw new Error(firstSource.errors.join('; '))
if (secondSource.errors.length || !secondSource.source) throw new Error(secondSource.errors.join('; '))
const synthesisArtifact = await readJson(resolve(here, '../candidate-synthesis.json'))
const goalSynthesis = synthesisArtifact.goals.find((goal: Record<string, any>) => goal.goalId === goalId)
if (!goalSynthesis) throw new Error(`Synthesis missing ${goalId}`)
const input = first.artifacts.input
const resolution = buildGoalDescriptionDualRoundResolution({
  resolutionId: 'm7-q3-stochastics-open-five-resolution-66f432e9-20260924-v1',
  goalId,
  effectiveSemanticKind: 'curricularAtomic',
  decision: 'keep_current',
  dualSummaryBytes: summaryBytes,
  currentInput: input,
  firstSource: firstSource.source,
  secondSource: secondSource.source,
  synthesis: {
    synthesisId: 'm7-q3-stochastics-open-five-synthesis-66f432e9-20260924-v1',
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex AI synthesis',
    synthesizedAt: '2026-09-24T09:00:00.000Z',
    rationaleDe: 'Beide aktuellen, unabhängig gebundenen Runden entscheiden keep. Die Beschreibungsreviews verbinden die Modellierung geeigneter Situationen, die Auswertung typischer Histogrammeigenschaften und die begründete Prüfung der Modelleignung als eine kohärente kontextbezogene Kompetenz; die unveränderte Formulierung bildet alle drei Aspekte knapp und verständlich ab. Das aktuelle Hessische Kerncurriculum Mathematik 2024 führt in Q3.2 auf S. 47 bei Bernoulli-Ketten ausdrücklich Modellierungsgrenzen und bei binomialverteilten Zufallsgrößen die Analyse von Histogrammen hinsichtlich ihrer Eigenschaften auf. Das stützt den genannten Sachumfang in dieser hessischen Quelle. Dieser Quellenbeleg begründet weder bundesweite Quellenabdeckung noch eine Änderung der bestehenden überregionalen Anwendbarkeit oder des partiellen Bremen-Quellenwegs. Die aktuelle semantische Atomaritätsentscheidung lautet atomic; die bestehenden, unveränderten Evidence-, Memory- und Bild-QA-Bindungen werden nicht neu freigegeben.',
    rationaleEn: 'Both current, independently bound rounds decide keep. The description reviews connect modeling suitable situations, interpreting characteristic histogram properties, and justifying model fit as one coherent contextual competence; the unchanged wording states all three aspects concisely and clearly. In Q3.2 on p. 47, the current 2024 Hessian Mathematics curriculum explicitly lists modeling limits for Bernoulli chains and analysis of histograms for binomial random variables. This supports the stated content within that Hessian source. This source evidence does not establish nationwide source coverage or change the existing nationwide applicability or partial Bremen source route. The current semantic atomicity decision is atomic; the existing unchanged evidence, memory, and visualization-QA bindings are reused, not newly approved.',
    understandingEvidence: goalSynthesis.positiveUnderstandingEvidence,
    dissent: [{
      dissentId: 'm7-q3-stochastics-open-five-dissent-66f432e9-20260924-v1',
      source: 'both',
      textDe: 'Beide Runden entscheiden keep und beschreiben denselben zusammenhängenden Kompetenzkern; ihre Evidence setzt leicht unterschiedliche Akzente bei Parameterdeutung, Histogramm und verletzten Modellannahmen. Die Synthese verbindet diese Aspekte.',
      textEn: 'Both rounds decide keep and describe the same coherent competency; their evidence gives slightly different emphasis to parameter interpretation, histograms, and violated model assumptions. The synthesis combines these aspects.',
      disposition: 'merged',
    }],
    humanAttestation: null,
  },
})

const resolutionsDirectory = resolve(batch, 'resolutions')
await mkdir(resolutionsDirectory, { recursive: true })
const resolutionPath = resolve(resolutionsDirectory, '66f432e9-22d3-51a9-8787-35f91db30616.resolution.json')
await writeFile(resolutionPath, `${JSON.stringify(resolution, null, 2)}\n`)
console.log(JSON.stringify({
  resolutionPath,
  summaryPath,
  goalId,
  status: resolution.status,
  decision: resolution.decision,
  goalFingerprint: resolution.goal.goalFingerprint,
  pageFingerprint: resolution.goal.pageFingerprint,
  goalReviewContextFingerprint: resolution.goal.goalReviewContextFingerprint,
}, null, 2))
