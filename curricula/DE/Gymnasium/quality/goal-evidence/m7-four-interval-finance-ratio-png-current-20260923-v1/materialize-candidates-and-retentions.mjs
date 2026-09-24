import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-four-interval-finance-ratio-png-current-20260923-v1'
const reviewId = 'canonical-math-p-v2-m7-four-interval-finance-ratio-png-current-20260923-v1'
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(repositoryRoot, path)
const sources = {
  q3: {
    config: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-stochastics-next12-p-20260923-v1/text-only-ten.retained-before-four-comic-png-20260923-v1.config.json',
    configSha: '8e66de081be162c3f33b3535e011ca18ac85fe460242aefb62acd79c7e8c7e0c',
    review: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-stochastics-next12-p-20260923-v1/text-only-ten.retained-before-four-comic-png-20260923-v1.review.jsonl',
    reviewSha: '96d11d34801316d298a575542886d8c860a25f35c075a87fb56aa3d7b5bf9082',
    moved: ['4d906967-9f4b-5dc8-af7a-d403b95d61f5', '5c9ac68c-3928-518c-bbe0-e044667035a6'],
    retained: 'retained-q3-seven',
    expectedCount: 9,
  },
  q4: {
    config: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-process-next12-p-20260923-v1/text-only-three.config.json',
    configSha: 'e750d5510b48d5132e664f8f7ace046fc6f3b50584d82c53c858e51473b323c6',
    review: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q4-process-next12-p-20260923-v1/text-only-three.review.jsonl',
    reviewSha: '182ae6ea1823060234cb12a56015a4cc75c98dc431cb989ebfb55238fac45808',
    moved: ['5d9c156b-e5a4-5e91-9da3-22e858eb1f8e'],
    retained: 'retained-q4-two',
    expectedCount: 3,
  },
  b029: {
    config: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-029-j8-interest-spreadsheet-parameters-current-v1.config.json',
    configSha: '27fc5197b9134d5e6463c6d65365b6266359fc0e8572d2d1115625f3f27a4640',
    review: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-029-j8-interest-spreadsheet-parameters-current-v1.review.jsonl',
    reviewSha: '1f8bc43224adf0dab585074c777833a351ad0bc34e2e186a7f4ca80c55b3b12d',
    moved: ['fc34449a-fbf4-574c-884f-ecdf48b42d2e'],
    retained: 'retained-b029-two',
    expectedCount: 3,
  },
}

const expectedProfiles = {
  '4d906967-9f4b-5dc8-af7a-d403b95d61f5': 'sha256:23bf3b99d620b4025f013548186a98ea537c76f78a5fecb1ca7b9f33819855d6',
  '5c9ac68c-3928-518c-bbe0-e044667035a6': 'sha256:90898479e6727af5c9602ffca6b10adf8bbda489568eb2bb1207fb943995fbd3',
  'fc34449a-fbf4-574c-884f-ecdf48b42d2e': 'sha256:60b2da3f7ab52242e158d9822b4d1ed772949770aa3cbe57dc965c74f922c8bd',
  '5d9c156b-e5a4-5e91-9da3-22e858eb1f8e': 'sha256:fd3250a9ef2c7dd7026004062cfcc1d0b6437b70be3f0a11e54cf535506947c3',
}
const expectedImages = {
  '4d906967-9f4b-5dc8-af7a-d403b95d61f5': '03d3076175b836975fb9739553fd8628154895322fbfd521ec899c8533edd5df',
  '5c9ac68c-3928-518c-bbe0-e044667035a6': '08326e4e189cf65f7d7ec89bcfb8e7e6a5ea7802782de79fe3c507a7d687f3ea',
  'fc34449a-fbf4-574c-884f-ecdf48b42d2e': 'd48610f7051322a1a8b37eae595fcfd79c6001f0774f35a1f81d83ea00c54c8e',
  '5d9c156b-e5a4-5e91-9da3-22e858eb1f8e': '369fc89bc95f686974e72bf41761631bd7a35b7b9e397d2ba0b6d7bccb526fa5',
}
const reasons = {
  '4d906967-9f4b-5dc8-af7a-d403b95d61f5': 'DE: Aktuelles Ziel und PNG erneut fachlich geprüft: Die Skizze zeigt bei bekanntem p und festem n ein allgemeines Vorhersageintervall für die künftige relative Häufigkeit ohne Zahlen. Die unveränderten zwei Fälle verlangen dagegen eigene Intervall- und Kontextdeutungen bei p = 0,6, n = 100 beziehungsweise p = 0,2, n = 50; der häufige Fehlschluss einer garantierten künftigen Häufigkeit wird geprüft. EN: Rechecked the current goal and PNG: it illustrates a generic prediction interval for a future relative frequency given known p and fixed n, without numbers. The two unchanged cases independently require interval and context interpretations at p = 0.6, n = 100 and p = 0.2, n = 50, including rejection of a guaranteed future frequency.',
  '5c9ac68c-3928-518c-bbe0-e044667035a6': 'DE: Aktuelles Ziel und PNG erneut fachlich geprüft: Das Bild geht von einer beobachteten Stichprobe zur Schätzung des unbekannten Anteils p über, ohne Zahlenbeispiel. Die unveränderten Fälle nutzen neue Stichproben 48/100 und 12/40 mit gegebenen Intervallen und prüfen die Bedeutung langfristiger Überdeckung statt einer Wahrscheinlichkeit für den festen unbekannten Parameter. EN: Rechecked the current goal and PNG: it moves from an observed sample to estimating an unknown proportion p, without a numeric case. The unchanged cases use fresh samples 48/100 and 12/40 with supplied intervals and test long-run coverage rather than a probability for the fixed unknown parameter.',
  'fc34449a-fbf4-574c-884f-ecdf48b42d2e': 'DE: Aktuelles Ziel und PNG erneut fachlich geprüft: Das Bild illustriert 100 € bei 10 % Zins bis zur 120-€-Schwelle im zweiten Zeitraum. Das unveränderte Profil verlangt eigenständige Tabellenentscheidungen für 1.000 € bei 5 % und einen andersartigen Tilgungsfall mit 3.000 € Schuld und monatlicher Zahlung; die Lösungen sind nicht aus dem Bild ablesbar. EN: Rechecked the current goal and PNG: the image illustrates €100 at 10% reaching a €120 threshold in period two. The unchanged profile requires independent spreadsheet decisions for €1,000 at 5% and a structurally different €3,000 debt-repayment case with monthly payment; neither result can be read from the image.',
  '5d9c156b-e5a4-5e91-9da3-22e858eb1f8e': 'DE: Aktuelles Ziel und PNG erneut fachlich geprüft: Die räumliche Skizze zeigt nur das Teilungsverhältnis 2:3 beziehungsweise t = 2/5. Die unveränderten Fälle verlangen das selbstständige Bestimmen und Begründen des Verhältnisses eines gegebenen Teilpunkts mit t = 1/3 sowie den Richtungsvergleich bei räumlich schräg liegenden Punkten mit t = 1/4 und 3/4; kein Ergebnis lässt sich aus dem Bild kopieren. EN: Rechecked the current goal and PNG: the spatial sketch shows only the 2:3 ratio, or t = 2/5. The unchanged cases require independently finding and explaining the ratio for a given division point at t = 1/3 and comparing the direction of oblique spatial points at t = 1/4 and 3/4; no answer can be copied from the image.',
}

const pinnedRead = async (path, digest) => {
  const bytes = await readFile(at(path))
  if (sha256(bytes) !== digest) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const destination = at(path)
  await mkdir(dirname(destination), { recursive: true })
  try {
    await writeFile(destination, bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    const existing = await readFile(destination)
    if (!existing.equals(bytes)) throw new Error(`Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha256(bytes)}`)
}
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const landscape = JSON.parse(await readFile(at('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8'))
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
for (const [goalId, expectedSha] of Object.entries(expectedImages)) {
  const visualizationLinks = goals.get(goalId)?.resourceLinks?.filter(({ type }) => type === 'goal-visualization') ?? []
  if (visualizationLinks.length !== 1) throw new Error(`${goalId}: expected exactly one active visualization`)
  const link = visualizationLinks[0]
  if (link.url !== `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`) throw new Error(`${goalId}: unexpected visualization URL`)
  const actualSha = sha256(await readFile(at(`app/public${link.url}`)))
  if (actualSha !== expectedSha) throw new Error(`${goalId}: image SHA changed: ${actualSha}`)
}

const movedRecords = new Map()
for (const [sourceName, source] of Object.entries(sources)) {
  const config = JSON.parse(await pinnedRead(source.config, source.configSha))
  const reviewBytes = await pinnedRead(source.review, source.reviewSha)
  const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
  const records = lines.map((line) => JSON.parse(line))
  if (records.length !== source.expectedCount || config.scope.goalIds.length !== records.length) throw new Error(`${sourceName}: source count changed`)
  if (!records.every((record, index) => record.goalId === config.scope.goalIds[index] && record.reviewId === config.reviewId)) {
    throw new Error(`${sourceName}: source record identity/order changed`)
  }
  if (!source.moved.every((id) => config.scope.goalIds.includes(id))) throw new Error(`${sourceName}: moved goal missing`)
  for (const record of records) {
    if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate') {
      throw new Error(`${record.goalId}: source approval status changed`)
    }
    if (source.moved.includes(record.goalId)) {
      if (record.profileFingerprint !== expectedProfiles[record.goalId]) throw new Error(`${record.goalId}: source profile changed`)
      movedRecords.set(record.goalId, record)
    }
  }
  const retainedLines = lines.filter((line, index) => !source.moved.includes(records[index].goalId))
  const retainedIds = config.scope.goalIds.filter((id) => !source.moved.includes(id))
  const retainedConfig = {
    ...config,
    reviewPath: `${packagePath}/${source.retained}.review.jsonl`,
    scope: {
      label: `${retainedIds.length} unchanged AI-candidate records retained byte-for-byte from pinned ${sourceName} source after image-bound goal split`,
      goalIds: retainedIds,
    },
  }
  await put(`${packagePath}/${source.retained}.config.json`, jsonBytes(retainedConfig))
  await put(`${packagePath}/${source.retained}.review.jsonl`, Buffer.from(`${retainedLines.join('\n')}\n`))
}

const orderedIds = [
  '4d906967-9f4b-5dc8-af7a-d403b95d61f5',
  '5c9ac68c-3928-518c-bbe0-e044667035a6',
  'fc34449a-fbf4-574c-884f-ecdf48b42d2e',
  '5d9c156b-e5a4-5e91-9da3-22e858eb1f8e',
]
if (movedRecords.size !== orderedIds.length || !orderedIds.every((id) => movedRecords.has(id))) {
  throw new Error('Moved record set is incomplete')
}
const q3Config = JSON.parse(await pinnedRead(sources.q3.config, sources.q3.configSha))
const config = {
  ...q3Config,
  reviewId,
  reviewPath: `${packagePath}/positive-evidence.review.jsonl`,
  reviewedResourceTypes: ['goal-visualization'],
  scope: {
    label: 'Four current Math P-v2 AI candidates bound to exact-current interval, finance and spatial-ratio PNGs',
    goalIds: orderedIds,
  },
}
const candidates = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-23T22:02:00Z',
  reviewer: 'Codex AI candidate author /root/q3_lk_scope_audit (exact model identifier unavailable)',
  goals: orderedIds.map((goalId) => {
    const prior = movedRecords.get(goalId)
    return {
      goalId,
      reason: reasons[goalId],
      evidenceLevel: prior.evidenceLevel,
      maximumClaimScope: prior.maximumClaimScope,
      dissent: prior.dissent,
      profile: prior.profile,
    }
  }),
}
await put(`${packagePath}/positive-evidence.config.json`, jsonBytes(config))
await put(`${packagePath}/positive-evidence.candidates.json`, jsonBytes(candidates))
