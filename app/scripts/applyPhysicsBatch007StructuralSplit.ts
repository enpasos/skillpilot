import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  heMapping: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  bwMapping: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  byMapping: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  surrogateEvidence: 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
  atlasSources: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  canonicalProvenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
} as const

const ids = {
  subjectRoot: 'bf980fff-b62b-4ea4-a20d-31681a7ad785',
  acoustics: '41fd5575-b1a6-40e7-8ea2-66b75a597a79',
  soundPropagation: '3c82510a-1f12-4eaa-81c2-8599437a5b85',
  soundCharacterization: '10aad90e-a1db-42b6-8d1e-1d856e14b47d',
  retainedHearingNoise: '3e33813d-db75-4571-8345-3845b02b956d',
  hearingProcess: '2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c',
  noiseExposure: 'da0837c7-95a7-5a6a-81db-f33cb7f42d85',
  quantitativeHearingRisks: '8ac61062-f63e-5935-96ae-84014906c368',
  bwSoundAssessment: '00e2ddfe-18c1-57a4-86ad-ee467a1a3d61',
  compatibilityCapstone: '3631c8f7-ff48-57ff-b7ee-8397ff1d166a',
} as const

const childSpecs = [
  {
    id: ids.hearingProcess,
    shortKey: 'canonical_physics_sek1_explain_hearing_process_in_ear',
    title: 'Hörvorgang im Ohr qualitativ erklären',
    titleEn: 'Explain hearing in the ear qualitatively',
    description:
      'Die lernende Person kann qualitativ erklären, wie das Außenohr Schall zum Trommelfell leitet, Trommelfell und Gehörknöchelchen die mechanische Schwingung auf das Innenohr übertragen und Sinneszellen in der Cochlea die mechanische Anregung in Nervensignale umwandeln.',
    descriptionEn:
      'The learner can qualitatively explain how the outer ear directs sound to the eardrum, how the eardrum and ossicles transmit the mechanical vibration to the inner ear, and how sensory cells in the cochlea convert the mechanical stimulation into nerve signals.',
    requires: [ids.soundPropagation],
    demandLevel: 'AB2',
    processCompetencies: ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'],
    guidingIdeas: ['LI_WELLEN', 'LI_MATERIE'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ACOUSTICS.HEARING.PROCESS',
    assetAltText:
      'Ein vereinfachtes Funktionsschema zeigt den Weg des Schalls von Ohrmuschel und Gehörgang über Trommelfell und Gehörknöchelchen zur Cochlea; dort wechselt die Darstellung von mechanischer Schwingung zu Nervensignalen in Richtung Gehirn.',
    assetSha256: 'sha256:e70560f6c90f5be6febbcd96122dbb7321ed20a8d87aefebc33d01ec9c5a7d70',
    qaNotes:
      'Hashgebundene Sichtprüfung des dritten gezielten Nano-Banana-Versuchs in Originalauflösung: Außen-, Mittel- und Innenohr sind genau einmal und in richtiger Reihenfolge gegliedert. Der Weg führt von Schallwelle, Ohrmuschel und Gehörgang über Trommelfell und verbundene Gehörknöchelchen zur Cochlea; Sinneszellen liegen dort, das Nervensignal zeigt erst anschließend zum Gehirn.',
    atomicityReason:
      'Der funktionale Hörweg und die dabei stattfindende Signalumwandlung bilden einen zusammenhängenden, eigenständig erklär- und prüfbaren physikalisch-biologischen Vorgang.',
    memoryReason:
      'Das Ziel verlangt eine kausale Erklärung des Hörwegs und der Signalumwandlung; isoliertes Faktenabfragen würde das geforderte Verständnis nicht angemessen aufbauen.',
  },
  {
    id: ids.noiseExposure,
    shortKey: 'canonical_physics_sek1_assess_hearing_noise_exposure',
    title: 'Lärmbelastung des Gehörs beurteilen',
    titleEn: 'Assess noise exposure of hearing',
    description:
      'Die lernende Person kann in konkreten Lärmsituationen die Gefährdung des Gehörs aus dem Zusammenwirken von Schallpegel und Einwirkdauer beurteilen sowie die Wirksamkeit von Schutzmaßnahmen und mögliche Folgen begründen.',
    descriptionEn:
      'The learner can assess the risk to hearing in specific noise situations from the combined effects of sound level and exposure duration and justify the effectiveness of protective measures and possible consequences.',
    requires: [ids.soundCharacterization, ids.hearingProcess],
    demandLevel: 'AB3',
    processCompetencies: ['PK5_BEWERTEN'],
    guidingIdeas: ['LI_WELLEN', 'LI_TECHNIK'],
    topicCode: 'CANONICAL.PHYSICS.SEK1.ACOUSTICS.HEARING.NOISE_EXPOSURE',
    assetAltText:
      'Eine Bewertungsmatrix stellt Schallpegel und Einwirkdauer als gemeinsam wirksame Größen gegenüber und zeigt an demselben Konzertbeispiel, wie geringerer Pegel, kürzere Dauer, größerer Abstand und Gehörschutz die Belastung vermindern.',
    assetSha256: 'sha256:c0e459788233bd571e762a4ebbb395d9ee806e591973210c03719762aa759b39',
    qaNotes:
      'Hashgebundene Sichtprüfung des Nano-Banana-JPG in Originalauflösung: Die qualitative Matrix stellt Schallpegel und Einwirkdauer als gemeinsam wirksame Größen dar, ohne eine starre Grenzwerttabelle zu behaupten. Das begründete Urteil berücksichtigt mögliche Folgen und leitet vier unterscheidbare Schutzhebel ab: Pegel senken, Dauer verkürzen, Abstand erhöhen und Gehörschutz verwenden.',
    atomicityReason:
      'Schallpegel, Einwirkdauer, Schutzwirkung und mögliche Folgen sind die notwendigen Kriterien derselben fachlichen Beurteilung einer konkreten Lärmsituation.',
    memoryReason:
      'Das Ziel wird durch kriteriengeleitete Urteile in wechselnden Situationen aufgebaut; eine einzelne Grenzwertkarte würde das Zusammenwirken von Pegel, Dauer und Schutzwirkung unzulässig verkürzen.',
  },
] as const

const viewPaths = [
  'curricula/DE/Gymnasium/composition-views/physik/de-bw-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-bw-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-sekii-lk.view.json',
] as const

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(resolve(repoRoot, path), 'utf8')
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)

const writeJsonl = (path: string, records: JsonRecord[]): void => {
  writeFileSync(resolve(repoRoot, path), `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
}

const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const digest = (value: unknown): string =>
  `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`

const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => digest({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase),
  area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
})

const replaceExactlyOnce = (values: string[], oldId: string, replacementIds: string[], label: string): string[] => {
  const occurrences = values.filter((value) => value === oldId).length
  if (occurrences === 0 && replacementIds.every((id) => values.includes(id))) return values
  if (occurrences !== 1) throw new Error(`${label}: expected one ${oldId}, found ${occurrences}`)
  return values.flatMap((value) => value === oldId ? replacementIds : [value])
}

const removeSplitReference = (values: string[], label: string): string[] => {
  const splitIds = new Set([ids.retainedHearingNoise, ids.hearingProcess, ids.noiseExposure])
  const present = values.filter((value) => splitIds.has(value))
  const validBefore = stableJson(present) === stableJson([ids.retainedHearingNoise])
  const validIntermediate = stableJson(present) === stableJson([ids.hearingProcess, ids.noiseExposure])
  const validAfter = present.length === 0
  if (!validBefore && !validIntermediate && !validAfter) {
    throw new Error(`${label}: unexpected compatibility-only split references ${present.join(',')}`)
  }
  return values.filter((value) => !splitIds.has(value))
}

function resourceLink(spec: typeof childSpecs[number]): JsonRecord {
  return {
    type: 'goal-visualization',
    resourceType: 'image',
    role: 'primary',
    skillpilotId: spec.id,
    title: `Visualisierung: ${spec.title}`,
    url: `/assets/goal-visualizations/physik/${spec.id}/${spec.id}.jpg`,
    provider: 'Google Gemini / Nano Banana Pro',
    description: `Visualisierung zum Lernziel: ${spec.title}.`,
    altText: spec.assetAltText,
    lang: 'de',
    license: 'AI-generated, SkillPilot-curated',
    reviewStatus: 'pilot',
  }
}

function buildCanonical(): JsonRecord {
  const landscape = readJson(paths.canonical)
  const goals = landscape.goals as JsonRecord[]
  const byId = new Map(goals.map((goal) => [goal.id, goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical goal IDs')

  const retained = byId.get(ids.retainedHearingNoise)
  if (!retained) throw new Error('Missing retained hearing/noise goal')
  const before = retained.type === 'atomic' && (retained.contains ?? []).length === 0
  const after = retained.type === 'cluster'
    && stableJson(retained.contains) === stableJson(childSpecs.map((spec) => spec.id))
  if (!before && !after) throw new Error('Retained hearing/noise goal is neither exact before nor exact after state')
  retained.type = 'cluster'
  retained.weight = 2
  retained.contains = childSpecs.map((spec) => spec.id)
  retained.requires = []
  // The broad Nano Banana illustration remains useful as a cluster overview.
  // Splitting the assessable goals must not discard an already reviewed image.
  retained.resourceLinks = [{
    type: 'goal-visualization',
    resourceType: 'image',
    role: 'primary',
    skillpilotId: ids.retainedHearingNoise,
    title: 'Visualisierung: Hören, Ohr und Lärmbelastung einordnen',
    url: `/assets/goal-visualizations/physik/${ids.retainedHearingNoise}/${ids.retainedHearingNoise}.jpg`,
    provider: 'Google Gemini / Nano Banana Pro',
    description: 'Visualisierung zum Lernziel: Hören, Ohr und Lärmbelastung einordnen.',
    altText: 'Didaktische Visualisierung zum Lernziel "Hören, Ohr und Lärmbelastung einordnen". Die lernende Person kann den Aufbau des Ohrs qualitativ erläutern und Auswirkungen von Lärm fachlich beurteilen.',
    lang: 'de',
    license: 'AI-generated, SkillPilot-curated',
    reviewStatus: 'pilot',
  }]
  delete retained.semanticAtomic

  for (const spec of childSpecs) {
    const expected: JsonRecord = {
      id: spec.id,
      shortKey: spec.shortKey,
      title: spec.title,
      titleEn: spec.titleEn,
      description: spec.description,
      descriptionEn: spec.descriptionEn,
      weight: 1,
      tags: structuredClone(retained.tags),
      contains: [],
      requires: [...spec.requires],
      dimensionTags: {
        framework: 'canonical-gymnasium-physics',
        demandLevel: spec.demandLevel,
        processCompetencies: [...spec.processCompetencies],
        guidingIdeas: [...spec.guidingIdeas],
        phase: 'GLOBAL',
        area: 'Akustik',
        topicCode: spec.topicCode,
      },
      applicability: structuredClone(retained.applicability),
      type: 'atomic',
      semanticAtomic: true,
      resourceLinks: [resourceLink(spec)],
    }
    const existing = byId.get(spec.id)
    const existingWithoutVisualization = existing ? { ...existing, resourceLinks: [] } : null
    const expectedWithoutVisualization = { ...expected, resourceLinks: [] }
    if (existing && stableJson(existingWithoutVisualization) !== stableJson(expectedWithoutVisualization)) {
      throw new Error(`Existing child ${spec.id} differs from the reviewed specification`)
    }
    if (existing) Object.assign(existing, expected)
    byId.set(spec.id, existing ?? expected)
  }

  for (const spec of childSpecs) {
    const existingIndex = goals.findIndex((goal) => goal.id === spec.id)
    if (existingIndex >= 0) goals.splice(existingIndex, 1)
  }
  const retainedIndex = goals.findIndex((goal) => goal.id === ids.retainedHearingNoise)
  goals.splice(retainedIndex + 1, 0, ...childSpecs.map((spec) => byId.get(spec.id)!))

  const quantitative = byId.get(ids.quantitativeHearingRisks)!
  quantitative.requires = replaceExactlyOnce(
    quantitative.requires,
    ids.retainedHearingNoise,
    [ids.noiseExposure],
    `${ids.quantitativeHearingRisks}.requires`,
  )

  const bwSoundAssessment = byId.get(ids.bwSoundAssessment)
  if (!bwSoundAssessment) throw new Error(`Missing assessment ${ids.bwSoundAssessment}`)
  bwSoundAssessment.description =
    'Die lernende Person kann Schallquelle und -empfänger beschreiben, Tonhöhe, Lautstärke und Geräusch unterscheiden, Schallgeschwindigkeiten datenbasiert vergleichen, den Hörvorgang qualitativ erklären und eine Lärmbelastung für das Ohr beurteilen.'
  bwSoundAssessment.descriptionEn =
    'The learner can describe sound sources and receivers, distinguish pitch, loudness, and noise, compare sound speeds from data, explain hearing qualitatively, and assess a noise exposure for the ear.'
  bwSoundAssessment.requires = replaceExactlyOnce(
    bwSoundAssessment.requires,
    ids.retainedHearingNoise,
    [ids.hearingProcess, ids.noiseExposure],
    `${ids.bwSoundAssessment}.requires`,
  )
  bwSoundAssessment.examData.coveredGoalIds = replaceExactlyOnce(
    bwSoundAssessment.examData.coveredGoalIds,
    ids.retainedHearingNoise,
    [ids.hearingProcess, ids.noiseExposure],
    `${ids.bwSoundAssessment}.examData.coveredGoalIds`,
  )
  const oldTaskStep =
    '4. Beschreiben Sie den Weg des Schalls durch Außenohr, Mittelohr und Innenohr und beurteilen Sie die Belastung von 94 dB über 60 min. Leiten Sie zwei konkrete Schutzmaßnahmen ab. (5 BE)'
  const newTaskStep =
    '4. Erklären Sie den Weg des Schalls durch Außenohr, Mittelohr und Innenohr einschließlich der Umwandlung der mechanischen Anregung in Nervensignale. Beurteilen Sie die Belastung von 94 dB über 60 min und leiten Sie zwei konkrete Schutzmaßnahmen ab. (5 BE)'
  if (bwSoundAssessment.examData.taskContent.includes(oldTaskStep)) {
    bwSoundAssessment.examData.taskContent = bwSoundAssessment.examData.taskContent.replace(oldTaskStep, newTaskStep)
  } else if (!bwSoundAssessment.examData.taskContent.includes(newTaskStep)) {
    throw new Error('BW sound assessment task step 4 is neither exact before nor exact after state')
  }

  const compatibilityCapstone = byId.get(ids.compatibilityCapstone)
  if (!compatibilityCapstone) throw new Error(`Missing assessment ${ids.compatibilityCapstone}`)
  compatibilityCapstone.requires = removeSplitReference(
    compatibilityCapstone.requires,
    `${ids.compatibilityCapstone}.requires`,
  )
  compatibilityCapstone.examData.coveredGoalIds = removeSplitReference(
    compatibilityCapstone.examData.coveredGoalIds,
    `${ids.compatibilityCapstone}.examData.coveredGoalIds`,
  )

  const steps = bwSoundAssessment.examData.scoring.steps as JsonRecord[]
  const oldStep = steps.find((step) => step.id === 'sound_hearing_4')
  const alreadySplit = steps.some((step) => step.id === 'sound_hearing_4a')
    && steps.some((step) => step.id === 'sound_hearing_4b')
  if (oldStep) {
    const index = steps.indexOf(oldStep)
    steps.splice(index, 1,
      { id: 'sound_hearing_4a', points: 2, description: 'Hörweg und Umwandlung in Nervensignale qualitativ erklärt' },
      { id: 'sound_hearing_4b', points: 3, description: 'Lärmbelastung mit Pegel und Dauer beurteilt sowie Schutzmaßnahmen abgeleitet' },
    )
  } else if (!alreadySplit) {
    throw new Error('BW sound assessment has neither original nor split scoring evidence')
  }
  const scoringSum = steps.reduce((sum, step) => sum + Number(step.points), 0)
  if (scoringSum !== bwSoundAssessment.examData.scoring.maxPoints) {
    throw new Error(`BW sound assessment scoring sum ${scoringSum} does not match maxPoints`)
  }

  for (const goal of goals) {
    if ((goal.requires ?? []).includes(ids.retainedHearingNoise)) {
      throw new Error(`Unadjudicated requires reference ${goal.id} -> retained split cluster`)
    }
    if ((goal.examData?.coveredGoalIds ?? []).includes(ids.retainedHearingNoise)) {
      throw new Error(`Unadjudicated coveredGoalIds reference ${goal.id} -> retained split cluster`)
    }
  }

  const parentsByChild = new Map<string, string[]>()
  for (const goal of goals) {
    for (const childId of goal.contains ?? []) {
      parentsByChild.set(childId, [...(parentsByChild.get(childId) ?? []), goal.id])
    }
  }
  const affected = new Set<string>([ids.retainedHearingNoise])
  const queue = [...(parentsByChild.get(ids.retainedHearingNoise) ?? [])]
  while (queue.length > 0) {
    const id = queue.shift()!
    if (affected.has(id)) continue
    affected.add(id)
    queue.push(...(parentsByChild.get(id) ?? []))
  }
  affected.delete(ids.subjectRoot)
  const atomicDescendants = (rootId: string): Set<string> => {
    const result = new Set<string>()
    const visiting = new Set<string>()
    const visit = (goalId: string): void => {
      if (visiting.has(goalId)) throw new Error(`Contains cycle at ${goalId}`)
      const goal = byId.get(goalId)
      if (!goal) throw new Error(`Missing contains target ${goalId}`)
      if ((goal.contains ?? []).length === 0) {
        result.add(goalId)
        return
      }
      visiting.add(goalId)
      for (const childId of goal.contains) visit(childId)
      visiting.delete(goalId)
    }
    visit(rootId)
    return result
  }
  for (const id of affected) byId.get(id)!.weight = atomicDescendants(id).size
  byId.get(ids.subjectRoot)!.weight = 1.2

  landscape.goals = goals
  return landscape
}

function buildSemanticKinds(landscape: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [decision.goalId, decision]))
  for (const goalId of [ids.retainedHearingNoise, ...childSpecs.map((spec) => spec.id)]) {
    const goal = goalById.get(goalId)!
    decisions.set(goalId, {
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
      semanticKind: goalId === ids.retainedHearingNoise ? 'curricularArea' : 'curricularAtomic',
      decisionStatus: 'authoritative',
      decisionBasis: goalId === ids.retainedHearingNoise
        ? 'reviewed-current-structural-split-curricular-area'
        : 'reviewed-current-structural-split-curricular-atomic',
    })
  }
  for (const goalId of [ids.quantitativeHearingRisks, ids.bwSoundAssessment, ids.compatibilityCapstone]) {
    const goal = goalById.get(goalId)
    const decision = decisions.get(goalId)
    if (!goal || !decision) throw new Error(`Missing fingerprint-only semantic-kind binding ${goalId}`)
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
  ledger.decisions = [...decisions.values()].sort((left, right) => left.goalId.localeCompare(right.goalId))
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions) counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  const order = ['curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure', 'memory', 'runtimeSupport', 'orientation']
  ledger.counts = Object.fromEntries(order.filter((key) => counts[key] !== undefined).map((key) => [key, counts[key]]))
  ledger.counts.total = ledger.decisions.length
  return ledger
}

function replaceLeafReviewRecords(landscape: JsonRecord, path: string, ruleVersion: string): JsonRecord[] {
  const records = readJsonl(path)
  const goalById = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id, goal]))
  const replacements = childSpecs.map((spec) => {
    const base = {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion,
      landscapeId: landscape.landscapeId,
      goalId: spec.id,
      fingerprint: reviewFingerprint(goalById.get(spec.id)!, ruleVersion),
      reviewedAt: '2026-08-27',
      reviewer: 'codex-ai-synthesis-2026-08-27',
    }
    return ruleVersion === 'semantic-atomicity-v1'
      ? { ...base, status: 'atomic', semanticAtomic: true, reason: spec.atomicityReason, suggestedSplit: [] }
      : { ...base, status: 'no_memory_needed', memoryUseful: false, reason: spec.memoryReason }
  })
  const result: JsonRecord[] = []
  let inserted = false
  for (const record of records) {
    if (record.goalId === ids.retainedHearingNoise) {
      if (!inserted) result.push(...replacements)
      inserted = true
      continue
    }
    if (childSpecs.some((spec) => spec.id === record.goalId)) continue
    result.push(record)
  }
  if (!inserted) result.push(...replacements)
  return result
}

function buildVisualizationQa(): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  qa.records = (qa.records as JsonRecord[]).filter((record) => record.goalId !== ids.retainedHearingNoise)
  const recordById = new Map((qa.records as JsonRecord[]).map((record) => [record.goalId, record]))
  for (const spec of childSpecs) {
    const record = recordById.get(spec.id)
    if (!record) continue
    if (record.assetSha256 !== spec.assetSha256) {
      throw new Error(`Visualization asset hash drift for ${spec.id}: ${record.assetSha256}`)
    }
    Object.assign(record, {
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      chatGptReviewedAt: '2026-08-27T05:25:00Z',
      chatGptReviewer: 'codex-nano-banana-policy-rework-2026-08-27',
      chatGptNotes: spec.qaNotes,
      humanReviewedAt: null,
      humanReviewer: '',
      aiApproved: 'yes',
      aiApprovedAssetSha256: spec.assetSha256,
      aiReviewedAt: '2026-08-27T05:25:00Z',
      aiReviewer: 'codex-nano-banana-policy-rework-2026-08-27',
      aiNotes: spec.qaNotes,
    })
  }
  return qa
}

type MappingRebind = {
  sourceGoalId: string
  targetGoalId: string
  matchType: 'exact' | 'partial'
  rationale?: string
}

function buildMapping(path: string, rebinds: MappingRebind[]): JsonRecord {
  const review = readJson(path)
  for (const rebind of rebinds) {
    const mappings = (review.mappings as JsonRecord[]).filter(
      (mapping) => mapping.legacyGoalId === rebind.sourceGoalId,
    )
    const oldMappings = mappings.filter(
      (mapping) => mapping.canonicalGoalId === ids.retainedHearingNoise,
    )
    const newMappings = mappings.filter(
      (mapping) => mapping.canonicalGoalId === rebind.targetGoalId,
    )
    if (oldMappings.length === 1) {
      oldMappings[0].canonicalGoalId = rebind.targetGoalId
      oldMappings[0].matchType = rebind.matchType
    } else if (oldMappings.length !== 0 || newMappings.length !== 1) {
      throw new Error(`${path}: unexpected mapping state for ${rebind.sourceGoalId}`)
    } else {
      newMappings[0].matchType = rebind.matchType
    }

    const decision = (review.decisions as JsonRecord[]).find(
      (candidate) => candidate.sourceGoalId === rebind.sourceGoalId,
    )
    if (!decision) throw new Error(`${path}: missing decision ${rebind.sourceGoalId}`)
    const oldCount = (decision.canonicalGoalIds as string[])
      .filter((goalId) => goalId === ids.retainedHearingNoise).length
    if (oldCount === 1) {
      decision.canonicalGoalIds = (decision.canonicalGoalIds as string[])
        .map((goalId) => goalId === ids.retainedHearingNoise ? rebind.targetGoalId : goalId)
    } else if (oldCount !== 0 || !(decision.canonicalGoalIds as string[]).includes(rebind.targetGoalId)) {
      throw new Error(`${path}: unexpected decision state for ${rebind.sourceGoalId}`)
    }
    if (rebind.rationale) decision.rationale = rebind.rationale
    decision.reviewedAt = '2026-08-27'
    decision.reviewer = 'codex-physics-batch-007-split-synthesis'
  }
  const staleMappings = (review.mappings as JsonRecord[])
    .filter((mapping) => mapping.canonicalGoalId === ids.retainedHearingNoise)
  const staleDecisions = (review.decisions as JsonRecord[])
    .filter((decision) => (decision.canonicalGoalIds as string[]).includes(ids.retainedHearingNoise))
  if (staleMappings.length !== 0 || staleDecisions.length !== 0) {
    throw new Error(`${path}: retained split-cluster mappings remain after adjudication`)
  }
  return review
}

function buildSurrogateEvidence(): JsonRecord {
  const registry = readJson(paths.surrogateEvidence)
  const desired = ['DE-BW', 'DE-BY'].map((jurisdiction) => ({
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    goalId: ids.hearingProcess,
    jurisdiction,
    evidenceType: 'requires-closure',
    requiredByGoalId: ids.noiseExposure,
    status: 'accepted',
    rationale:
      `${jurisdiction} Physik: Das learner-facing Ziel „Lärmbelastung des Gehörs beurteilen“ macht „Hörvorgang im Ohr qualitativ erklären“ als kanonische prerequisite-only-Brücke sichtbar. Akzeptiert als didaktische requires-closure-Brücke, nicht als Behauptung, die BW-/BY-Lärmquelle fordere den Hörweg selbst.`,
  }))
  for (const entry of desired) {
    const matches = (registry.entries as JsonRecord[]).filter((candidate) =>
      candidate.landscapeId === entry.landscapeId
      && candidate.goalId === entry.goalId
      && candidate.jurisdiction === entry.jurisdiction
      && candidate.evidenceType === entry.evidenceType
      && candidate.requiredByGoalId === entry.requiredByGoalId)
    if (matches.length > 1) throw new Error(`Duplicate surrogate evidence for ${entry.jurisdiction}`)
    if (matches.length === 0) (registry.entries as JsonRecord[]).push(entry)
    else Object.assign(matches[0], entry)
  }
  return registry
}

function buildCanonicalProvenance(): JsonRecord {
  const registry = readJson(paths.canonicalProvenance)
  const landscape = (registry.landscapes as JsonRecord[]).find(
    (candidate) => candidate.landscapeId === '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
  )
  if (!landscape || !landscape.goalProvenance) throw new Error('Missing canonical Physics provenance registry')
  const desired: Record<string, JsonRecord> = {
    [ids.hearingProcess]: {
      sourceLandscapeId: '996d097a-cac2-4b5f-979a-b3a0b9803265',
      sourceGoalId: 'he-phys-seki-8-3b-b04-a01-e2f70ffd',
    },
    [ids.noiseExposure]: {
      sourceLandscapeId: '3f58b4cf-2b02-4ae0-bb0f-8d8ab6d7f4f1',
      sourceGoalId: 'bw-phys-seki-3-2-2-b03-a01-e612f467',
      additionalSourceLandscapeIds: [
        '996d097a-cac2-4b5f-979a-b3a0b9803265',
        '42c2f7e3-91b4-5de8-bef0-d563440e9d52',
      ],
    },
  }
  for (const [goalId, provenance] of Object.entries(desired)) {
    const existing = landscape.goalProvenance[goalId]
    if (existing && stableJson(existing) !== stableJson(provenance)) {
      throw new Error(`Conflicting canonical provenance for ${goalId}`)
    }
    landscape.goalProvenance[goalId] = provenance
  }
  return registry
}

function replaceDirectGoalEntry(value: unknown): { value: unknown; count: number } {
  if (Array.isArray(value)) {
    let count = 0
    const hasPrerequisite = value.some((entry) => entry
      && typeof entry === 'object'
      && (entry as JsonRecord).kind === 'goalEntry'
      && (entry as JsonRecord).goalId === ids.hearingProcess)
    const items = value.flatMap((entry) => {
      if (entry && typeof entry === 'object' && (entry as JsonRecord).kind === 'goalEntry') {
        const record = entry as JsonRecord
        if (record.goalId === ids.retainedHearingNoise || (record.goalId === ids.noiseExposure && !hasPrerequisite)) {
          count += 1
          const { displayLabel: _displayLabel, ...base } = record
          const target = { ...record, goalId: ids.noiseExposure }
          return [
            { ...base, goalId: ids.hearingProcess, projectionRole: 'prerequisiteOnly' },
            target,
          ]
        }
      }
      const transformed = replaceDirectGoalEntry(entry)
      count += transformed.count
      return [transformed.value]
    })
    return { value: items, count }
  }
  if (!value || typeof value !== 'object') return { value, count: 0 }
  const record = value as JsonRecord
  let count = 0
  const entries = Object.entries(record).map(([key, nested]) => {
    const transformed = replaceDirectGoalEntry(nested)
    count += transformed.count
    return [key, transformed.value]
  })
  return { value: Object.fromEntries(entries), count }
}

const canonical = buildCanonical()
const semanticKinds = buildSemanticKinds(canonical)
const atomicity = replaceLeafReviewRecords(canonical, paths.atomicity, 'semantic-atomicity-v1')
const memory = replaceLeafReviewRecords(canonical, paths.memory, 'memory-card-review-v1')
const visualizationQa = buildVisualizationQa()
const heMapping = buildMapping(paths.heMapping, [
  {
    sourceGoalId: 'he-phys-seki-8-3b-b04-a01-e2f70ffd',
    targetGoalId: ids.hearingProcess,
    matchType: 'partial',
    rationale:
      'Das kanonische Ziel deckt Aufbau, funktionalen Hörweg und Signalumwandlung im menschlichen Ohr ab; der zusätzliche amtliche Vergleich der Hörbereiche von Menschen und Tieren bleibt als Source-Coverage-Lücke sichtbar.',
  },
  {
    sourceGoalId: 'he-phys-seki-8-3b-b05-a01-9a90dc2f',
    targetGoalId: ids.noiseExposure,
    matchType: 'partial',
    rationale:
      'Das kanonische Ziel deckt die Beurteilung von Lärmbelastung und personenbezogene Schutzmaßnahmen ab; Echo, Nachhall sowie baulicher Schallschutz an Häusern und Verkehrswegen bleiben zusätzliche Source-Aspekte.',
  },
])
const bwMapping = buildMapping(paths.bwMapping, [
  {
    sourceGoalId: 'bw-phys-seki-3-2-2-b03-a01-e612f467',
    targetGoalId: ids.noiseExposure,
    matchType: 'exact',
  },
])
const byMapping = buildMapping(paths.byMapping, [
  {
    sourceGoalId: '98c500b8-214d-5d1d-92f7-ac746953021d',
    targetGoalId: ids.noiseExposure,
    matchType: 'partial',
  },
])
const surrogateEvidence = buildSurrogateEvidence()
const canonicalProvenance = buildCanonicalProvenance()
const atlasSources = readJson(paths.atlasSources)
if (![438, 439].includes(atlasSources.expectedCurricularAtomicGoalCount)) {
  throw new Error(`Unexpected Physics atlas denominator ${atlasSources.expectedCurricularAtomicGoalCount}`)
}
atlasSources.expectedCurricularAtomicGoalCount = 439
const views = new Map<string, JsonRecord>()
for (const path of viewPaths) {
  const original = readJson(path)
  const transformed = replaceDirectGoalEntry(original)
  if (transformed.count === 0) {
    const serialized = stableJson(original)
    if (!serialized.includes(ids.hearingProcess) || !serialized.includes(ids.noiseExposure)) {
      throw new Error(`${path}: missing complete after-state split references`)
    }
  } else if (transformed.count !== 1) {
    throw new Error(`${path}: expected exactly one direct split reference, found ${transformed.count}`)
  }
  views.set(path, transformed.value as JsonRecord)
}

if (writeMode) {
  writeJson(paths.canonical, canonical)
  writeJson(paths.semanticKinds, semanticKinds)
  writeJsonl(paths.atomicity, atomicity)
  writeJsonl(paths.memory, memory)
  writeJson(paths.visualizationQa, visualizationQa)
  writeJson(paths.heMapping, heMapping)
  writeJson(paths.bwMapping, bwMapping)
  writeJson(paths.byMapping, byMapping)
  writeJson(paths.surrogateEvidence, surrogateEvidence)
  writeJson(paths.canonicalProvenance, canonicalProvenance)
  writeJson(paths.atlasSources, atlasSources)
  for (const [path, view] of views) writeJson(path, view)
}

console.log(
  `CHECK apply_physics_batch_007_structural_split ${writeMode ? 'WRITE' : 'PASS'} `
  + `retainedClusters=1 children=2 views=${views.size} curricularAtomic=${semanticKinds.counts.curricularAtomic}`,
)
