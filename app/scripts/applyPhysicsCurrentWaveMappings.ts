import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-26'
const reviewer = 'codex-ai-synthesis-2026-08-26'
const marker = 'AI-Synthese-Physik-Adjudikation 2026-08-26'
const canonicalPhysicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

const ids = {
  volumeParent: '7c996528-5fae-5353-b8fb-d59382e225c6',
  regularVolume: 'f827b00f-af7f-52de-84aa-2a2bbaa035bd',
  displacementVolume: 'f92b5b8a-327f-50d2-8313-6a142399ebf0',
  reflectionParent: 'cca06d84-28fe-4b80-9bcd-968dda026e0e',
  reflectionLaw: '3c8e5510-a12d-5770-8a01-e5fe741b259c',
  planeMirrorImage: 'b57427c9-1af5-5daa-8c65-b84a4cc20785',
  celestialParent: '1fede37b-6554-5dd3-93d9-08ed1fd09c91',
  lunarPhases: '33e3417c-e062-5f4a-8df9-3195dca50089',
  eclipses: 'f0046ae8-cbfc-526b-8414-04e3595b6075',
  thermometer: '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
  thermalExpansion: 'b60f63b6-e70b-5557-9f54-86d42fa80325',
  legacyUmbrella: 'e41356c1-968b-435a-af25-b663f080ae5a',
} as const

const paths = {
  bw: 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  by: 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',
  he: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  heLegacy: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_physics_lower_secondary_to_canonical_physics.json',
  sl: 'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  sn: 'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  st: 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  th: 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  surrogate: 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
} as const

interface AddedMapping {
  canonicalGoalId: string
  matchType: 'exact' | 'partial'
}

interface Route {
  sourceGoalId: string
  removeTargetIds: string[]
  add: AddedMapping[]
  rationale: string
}

const routesByPath = new Map<string, Route[]>([
  [
    paths.bw,
    [
      {
        sourceGoalId: 'bw-phys-seki-3-2-2-b06-a01-5770e8b7',
        removeTargetIds: [ids.celestialParent],
        add: [
          { canonicalGoalId: ids.lunarPhases, matchType: 'partial' },
          { canonicalGoalId: ids.eclipses, matchType: 'partial' },
        ],
        rationale: `${marker}: Der amtliche BW-Text nennt Mondphasen sowie Sonnen- und Mondfinsternisse gemeinsam. Er belegt beide getrennten kanonischen Ziele, ist gegenüber jedem Einzelziel aber ein breiter kombinierter Source-Block; beide Kanten bleiben daher partial.`,
      },
      {
        sourceGoalId: 'bw-phys-seki-3-2-2-b08-a01-6390a088',
        removeTargetIds: [ids.reflectionParent],
        add: [
          { canonicalGoalId: ids.reflectionLaw, matchType: 'partial' },
          { canonicalGoalId: ids.planeMirrorImage, matchType: 'partial' },
        ],
        rationale: `${marker}: Der amtliche BW-Text führt Reflexionsgesetz und Spiegelbild gemeinsam auf. Er stützt beide getrennten Ziele, spezifiziert aber weder die vollständige experimentelle Unsicherheitsauswertung noch sämtliche Erklärschritte zum virtuellen Bild; beide Zuordnungen sind partial.`,
      },
    ],
  ],
  [
    paths.by,
    [
      {
        sourceGoalId: 'f0da0513-86f0-5e4c-9674-161d630f6598',
        removeTargetIds: [ids.reflectionParent],
        add: [{ canonicalGoalId: ids.planeMirrorImage, matchType: 'partial' }],
        rationale: `${marker}: Der BY-Text fordert Vermutungen und Erklärungen zu Spiegelbildern und stützt damit das Modellieren des virtuellen Bildes teilweise. Er fordert keine experimentelle Prüfung des Reflexionsgesetzes; deshalb wird dieses Kind ausdrücklich nicht zugeordnet.`,
      },
      {
        sourceGoalId: '9e35926a-0175-522c-8b80-f2cfc94edb07',
        removeTargetIds: [ids.reflectionParent],
        add: [{ canonicalGoalId: ids.planeMirrorImage, matchType: 'partial' }],
        rationale: `${marker}: Der BY-Text nutzt Lichtausbreitung und Reflexionsgesetz zur Erklärung der Spiegelbildentstehung und stützt das Strahlenmodell-Ziel teilweise. Die Anwendung eines Gesetzes ist kein Beleg für dessen experimentelle Prüfung.`,
      },
    ],
  ],
  [
    paths.he,
    [
      {
        sourceGoalId: 'he-phys-seki-7-1-b03-a01-85d6be44',
        removeTargetIds: [ids.reflectionParent],
        add: [{ canonicalGoalId: ids.planeMirrorImage, matchType: 'exact' }],
        rationale: `${marker}: Der amtliche HE-Block nennt Bildentstehung am ebenen Spiegel, virtuelles Bild, Bildkonstruktion und Umkehrbarkeit des Lichtwegs ausdrücklich und belegt damit das kanonische Spiegelbild-Ziel exact. Er ist kein Beleg für eine experimentelle Prüfung des Reflexionsgesetzes.`,
      },
    ],
  ],
  [
    paths.sl,
    [
      {
        sourceGoalId: 'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-002-ab9d7888',
        removeTargetIds: [],
        add: [{ canonicalGoalId: ids.thermometer, matchType: 'partial' }],
        rationale: `${marker}: Das amtliche SL-Ziel verlangt ausdrücklich, Temperaturen zu messen und das Ergebnis als Bestwert mit Messunsicherheit anzugeben. Es belegt die kanonische Temperaturmesskompetenz teilweise; Auswahl nach Messbereich/Auflösung, thermischer Kontakt und Stabilisierung sind nicht vollständig ausformuliert.`,
      },
      {
        sourceGoalId: 'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-007-1ecc7d85',
        removeTargetIds: [],
        add: [{ canonicalGoalId: ids.thermalExpansion, matchType: 'partial' }],
        rationale: `${marker}: Das amtliche SL-Ziel nennt das gleiche Ausdehnungsverhalten aller Gase ausdrücklich und belegt damit den gasförmigen Teil der kanonischen thermischen Ausdehnung; feste und flüssige Stoffe sowie starre Begrenzungen sind in diesem Source-Ziel nicht vollständig enthalten.`,
      },
      {
        sourceGoalId: 'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-008-f8abcc56',
        removeTargetIds: [ids.legacyUmbrella],
        add: [{ canonicalGoalId: ids.thermalExpansion, matchType: 'partial' }],
        rationale: `${marker}: Der amtliche SL-Versuch untersucht den Zusammenhang zwischen Volumen und Temperatur einer eingeschlossenen Gasmenge bei konstantem Druck und belegt damit die thermische Volumenänderung von Gasen teilweise. Die kanonischen Festkörper- und Flüssigkeitsanteile werden dadurch nicht allein belegt.`,
      },
    ],
  ],
  [
    paths.sn,
    [
      {
        sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb2-008-01-fdd7881a',
        removeTargetIds: [ids.volumeParent],
        add: [{ canonicalGoalId: ids.regularVolume, matchType: 'partial' }],
        rationale: `${marker}: Der amtliche SN-Text belegt physikalische Größen, Längenmessung und Volumeneinheiten als Grundlage der geometrischen Volumenbestimmung, nennt aber nicht alle Mess-, Geometrie- und Plausibilisierungsschritte; die Zuordnung ist partial.`,
      },
      {
        sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb2-008-02-76a5526e',
        removeTargetIds: [ids.volumeParent],
        add: [{ canonicalGoalId: ids.displacementVolume, matchType: 'exact' }],
        rationale: `${marker}: Das amtliche Schülerexperiment fordert die Volumenbestimmung unregelmäßiger fester Körper mit der Differenzmethode und belegt die kanonische Flüssigkeitsverdrängungs-Kompetenz exact.`,
      },
      {
        sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb1-002-09-a162008f',
        removeTargetIds: [ids.celestialParent],
        add: [
          { canonicalGoalId: ids.lunarPhases, matchType: 'partial' },
          { canonicalGoalId: ids.eclipses, matchType: 'partial' },
        ],
        rationale: `${marker}: Der kombinierte SN-Text stützt Mondphasen und Finsternisse, formuliert aber nicht alle getrennten Ableitungs-, Schattenraum- und Fehlvorstellungsanforderungen; beide Kanten sind partial.`,
      },
      {
        sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb1-003-01-5d404ab8',
        removeTargetIds: [ids.reflectionParent],
        add: [{ canonicalGoalId: ids.planeMirrorImage, matchType: 'partial' }],
        rationale: `${marker}: Der SN-Text zu Beobachtungen und Spiegelbildern stützt die Konstruktion und Erklärung des virtuellen Bildes teilweise, fordert aber nicht die vollständige kanonische Erklärung einschließlich fehlender Auffangbarkeit auf einem Schirm.`,
      },
      {
        sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb1-003-02-9b11e256',
        removeTargetIds: [ids.reflectionParent],
        add: [{ canonicalGoalId: ids.reflectionLaw, matchType: 'partial' }],
        rationale: `${marker}: Das amtliche SN-Schülerexperiment behandelt das Reflexionsgesetz und seine Gleichungsform. Die kanonische zusätzliche Auswertung von Abweichungen als Messunsicherheit ist nicht vollständig ausformuliert; die Kante bleibt partial.`,
      },
    ],
  ],
  [
    paths.st,
    [
      {
        sourceGoalId: 'st-phys-seki-st-schuljahrgang-6-temperatur-und-warme-069-ab69d8cb',
        removeTargetIds: [],
        add: [{ canonicalGoalId: ids.thermalExpansion, matchType: 'partial' }],
        rationale: `${marker}: Das amtliche ST-Ziel verlangt, Längen- und Volumenänderungen von Stoffen bei Temperaturänderung mit dem Teilchenmodell zu erklären. Es belegt die kanonische thermische Ausdehnung teilweise; die getrennte Vollständigkeit für feste, flüssige und gasförmige Stoffe sowie starre Begrenzungen ist nicht ausdrücklich ausformuliert.`,
      },
      {
        sourceGoalId: 'st-phys-seki-st-schuljahrgang-6-temperatur-und-warme-075-d1ddbde4',
        removeTargetIds: [],
        add: [{ canonicalGoalId: ids.thermometer, matchType: 'partial' }],
        rationale: `${marker}: Das amtliche ST-Ziel verlangt, Experimente zur Temperaturmessung nach Anleitung durchzuführen und auszuwerten. Es belegt die kanonische Messhandlung teilweise; die eigenständige Gerätewahl nach Messbereich und Auflösung ist hier nicht vollständig enthalten.`,
      },
      {
        sourceGoalId: 'st-phys-seki-st-schuljahrgang-6-temperatur-und-warme-077-c0f852da',
        removeTargetIds: [],
        add: [{ canonicalGoalId: ids.thermometer, matchType: 'partial' }],
        rationale: `${marker}: Das amtliche ST-Ziel fordert ausdrücklich, Thermometer geeignet auszuwählen sowie sach- und sicherheitsgerecht zu verwenden. Es belegt Gerätewahl und Handhabung der kanonischen Temperaturmesskompetenz teilweise; stabiles Ablesen mit Einheit ist in diesem Source-Ziel nicht vollständig ausformuliert.`,
      },
      {
        sourceGoalId: 'st-phys-seki-st-schuljahrgang-6-strahlenoptik-033-4dd77f01',
        removeTargetIds: [ids.celestialParent],
        add: [{ canonicalGoalId: ids.eclipses, matchType: 'partial' }],
        rationale: `${marker}: Der amtliche ST-Wissensbestand nennt Kern- und Halbschatten sowie Sonnen- und Mondfinsternis, formuliert aber nicht die vollständige beobachterbezogene Herleitung des kanonischen Ziels; die Zuordnung ist partial.`,
      },
      {
        sourceGoalId: 'st-phys-seki-st-schuljahrgang-6-strahlenoptik-039-98f1fe21',
        removeTargetIds: [ids.reflectionParent],
        add: [{ canonicalGoalId: ids.reflectionLaw, matchType: 'partial' }],
        rationale: `${marker}: Das verbindliche ST-Schülerexperiment nennt das Reflexionsgesetz ausdrücklich, aber nicht die vollständige Winkelmessung zum Lot und Unsicherheitsbeurteilung des kanonischen Ziels; die Kante ist partial.`,
      },
    ],
  ],
  [
    paths.th,
    [
      {
        sourceGoalId: 'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-073-7755ee22',
        removeTargetIds: [],
        add: [{ canonicalGoalId: ids.thermalExpansion, matchType: 'partial' }],
        rationale: `${marker}: Das amtliche TH-Ziel verlangt, temperaturabhängige Volumenänderungen von Körpern an praktischen Beispielen zu beschreiben und zu erklären. Es belegt die kanonische thermische Ausdehnung teilweise; die vollständige getrennte Behandlung aller drei Aggregatzustände und starrer Begrenzungen ist nicht ausdrücklich enthalten.`,
      },
      {
        sourceGoalId: 'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-097-eb809dc0',
        removeTargetIds: [ids.celestialParent],
        add: [{ canonicalGoalId: ids.eclipses, matchType: 'exact' }],
        rationale: `${marker}: Der amtliche TH-Text verlangt die Erklärung von Sonnen- und Mondfinsternissen über die jeweilige Anordnung und entstehende Schattenbereiche und belegt damit das getrennte kanonische Finsternis-Ziel exact.`,
      },
      {
        sourceGoalId: 'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-100-755d7bf9',
        removeTargetIds: [ids.reflectionParent],
        add: [{ canonicalGoalId: ids.reflectionLaw, matchType: 'exact' }],
        rationale: `${marker}: Das amtliche TH-Ziel verlangt ausdrücklich, die Gültigkeit des Reflexionsgesetzes experimentell zu bestätigen, und belegt damit das getrennte experimentelle kanonische Ziel exact.`,
      },
    ],
  ],
])

const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as JsonRecord

const writeJson = (path: string, value: unknown): void => {
  writeFileSync(resolve(repoRoot, path), `${JSON.stringify(value, null, 2)}\n`)
}

const unique = <T>(values: T[]): T[] => [...new Set(values)]

function applyRoute(document: JsonRecord, route: Route): void {
  const mappings = document.mappings as JsonRecord[]
  if (!Array.isArray(mappings)) throw new Error('Review document has no mappings array')
  const sourceMappings = mappings.filter((mapping) => mapping.legacyGoalId === route.sourceGoalId)
  if (sourceMappings.length === 0) throw new Error(`Missing source mappings for ${route.sourceGoalId}`)
  const removeTargetIds = new Set(route.removeTargetIds)
  const addTargetIds = new Set(route.add.map((mapping) => mapping.canonicalGoalId))
  const retained = sourceMappings.filter(
    (mapping) => !removeTargetIds.has(mapping.canonicalGoalId) && !addTargetIds.has(mapping.canonicalGoalId),
  )
  const desired = [
    ...retained,
    ...route.add.map((mapping) => ({
      legacyGoalId: route.sourceGoalId,
      canonicalGoalId: mapping.canonicalGoalId,
      matchType: mapping.matchType,
      reviewDecisionId: route.sourceGoalId,
    })),
  ]
  const rebuilt: JsonRecord[] = []
  let emitted = false
  for (const mapping of mappings) {
    if (mapping.legacyGoalId !== route.sourceGoalId) {
      rebuilt.push(mapping)
      continue
    }
    if (!emitted) {
      rebuilt.push(...desired)
      emitted = true
    }
  }
  document.mappings = rebuilt

  const decision = (document.decisions as JsonRecord[]).find(
    (candidate) => candidate.sourceGoalId === route.sourceGoalId,
  )
  if (!decision) throw new Error(`Missing mapping decision ${route.sourceGoalId}`)
  decision.canonicalGoalIds = unique([
    ...(decision.canonicalGoalIds as string[]).filter(
      (goalId) => !removeTargetIds.has(goalId) && !addTargetIds.has(goalId),
    ),
    ...route.add.map((mapping) => mapping.canonicalGoalId),
  ])
  decision.rationale = route.rationale
  decision.reviewedAt = reviewedAt
  decision.reviewer = reviewer
}

const outputs = new Map<string, JsonRecord>()
for (const [path, routes] of routesByPath) {
  const document = readJson(path)
  for (const route of routes) applyRoute(document, route)
  outputs.set(path, document)
}

const heLegacy = readJson(paths.heLegacy)
const legacyReflection = (heLegacy.mappings as JsonRecord[]).find(
  (mapping) =>
    mapping.legacyGoalId === '10109c2a-788e-4969-9476-82d7cdd06f8f'
    && mapping.canonicalGoalId === ids.reflectionParent,
)
const alreadyRebound = (heLegacy.mappings as JsonRecord[]).find(
  (mapping) =>
    mapping.legacyGoalId === '10109c2a-788e-4969-9476-82d7cdd06f8f'
    && mapping.canonicalGoalId === ids.planeMirrorImage,
)
if (!legacyReflection && !alreadyRebound) throw new Error('Missing HE legacy reflection mapping')
if (legacyReflection) {
  legacyReflection.canonicalGoalId = ids.planeMirrorImage
  legacyReflection.matchType = 'exact'
}
outputs.set(paths.heLegacy, heLegacy)

const staleAtomicParentTargets = new Set([ids.volumeParent, ids.reflectionParent, ids.celestialParent])
for (const [path, document] of outputs) {
  if (path === paths.heLegacy) continue
  const forbidden = (document.mappings as JsonRecord[]).filter((mapping) => {
    if (!staleAtomicParentTargets.has(mapping.canonicalGoalId)) return false
    // Broad HE/MV-style volume sources remain honestly attached to the now-structural
    // parent; only the two specifically adjudicated SN volume rows must move to children.
    return !(
      mapping.canonicalGoalId === ids.volumeParent
      && !String(mapping.legacyGoalId).startsWith('sn-phys-seki-sn-klassenstufe-6-lb2-008-')
    )
  })
  if (forbidden.length > 0) {
    throw new Error(`Stale split-parent source mappings in ${path}: ${JSON.stringify(forbidden)}`)
  }
}

const surrogateRegistry = readJson(paths.surrogate)
const surrogateEntries = surrogateRegistry.entries as JsonRecord[]
if (!Array.isArray(surrogateEntries)) throw new Error('Surrogate evidence registry has no entries array')
const reflectionLawSurrogate = {
  landscapeId: canonicalPhysicsLandscapeId,
  goalId: ids.reflectionLaw,
  jurisdiction: 'DE-BY',
  evidenceType: 'requires-closure',
  requiredByGoalId: ids.planeMirrorImage,
  status: 'accepted',
  rationale: 'Bayern Physik: Das learner-facing Ziel „Spiegelbilder am ebenen Spiegel mit dem Strahlenmodell erklären“ macht „Reflexionsgesetz experimentell prüfen“ als kanonische prerequisite-only-Brücke sichtbar. Akzeptiert als didaktische requires-closure-Brücke, nicht als Behauptung, der bayerische Quelltext fordere die experimentelle Gesetzesprüfung selbst.',
}
const existingSurrogateIndex = surrogateEntries.findIndex(
  (entry) =>
    entry.landscapeId === canonicalPhysicsLandscapeId
    && entry.goalId === ids.reflectionLaw
    && entry.jurisdiction === 'DE-BY',
)
if (existingSurrogateIndex >= 0) surrogateEntries[existingSurrogateIndex] = reflectionLawSurrogate
else surrogateEntries.push(reflectionLawSurrogate)
outputs.set(paths.surrogate, surrogateRegistry)

if (writeMode) {
  for (const [path, document] of outputs) writeJson(path, document)
}

console.log(
  `CHECK apply_physics_current_wave_mappings ${writeMode ? 'WRITE' : 'PASS'} reviewedSources=${[...routesByPath.values()].flat().length} legacyRebind=1`,
)
