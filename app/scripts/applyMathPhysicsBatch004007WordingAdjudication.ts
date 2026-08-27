import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, any>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-27'
const subjectArgument = process.argv.find((argument) => argument.startsWith('--subject='))

const subjects = {
  mathematik: {
    canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
    atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
    memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
    reviewer: 'codex-math-batch-004-wording-adjudication-2026-08-27',
  },
  physik: {
    canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
    atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
    memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
    reviewer: 'codex-physics-batch-007-wording-adjudication-2026-08-27',
  },
} as const

const revisions: Record<string, {
  subject: keyof typeof subjects
  titleEn?: string
  previousDescription?: string
  previousDescriptionEn?: string
  revalidationOwner?: 'structural-split'
  sourceRef?: string
  description: string
  descriptionEn: string
  atomicityReason: string
  memoryReason: string
  promptFiles: string[]
}> = {
  '3d49cd27-3a84-50eb-ac35-f0b0bee80df2': {
    subject: 'mathematik',
    description: 'Die lernende Person kann in einfachen Situationen mithilfe geeigneter Darstellungen erläutern, wie sich Umfang, Flächeninhalt oder Volumen verändern, wenn die betreffenden Längen in vorgegebener Weise verändert werden.',
    descriptionEn: 'The learner can use suitable representations in simple situations to explain how perimeter, area, or volume changes when the relevant lengths are changed in a specified way.',
    atomicityReason: 'Die Beschreibung fordert eine zusammenhängende Skalierungskompetenz: Änderungen geometrischer Längen werden in geeigneten Darstellungen mit den daraus folgenden Änderungen von Umfang, Fläche oder Volumen verknüpft und erläutert.',
    memoryReason: 'Die Beziehungen zwischen Längenänderung, Umfang, Fläche und Volumen müssen an wechselnden Darstellungen erklärt und übertragen werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md', 'image-reconstruction-prompt.de.md'],
  },
  'bd8fd6d5-7155-45a5-96f0-008a4e9acb3a': {
    subject: 'mathematik',
    description: 'Die lernende Person kann einfache Zinsprobleme in vertrauten Sachzusammenhängen als Prozentrechnung darstellen und lösen sowie die Ergebnisse nachvollziehbar im Kontext deuten.',
    descriptionEn: 'The learner can represent and solve simple interest problems in familiar contexts as percentage calculations and interpret the results clearly in context.',
    atomicityReason: 'Prozentmodell aufstellen, ein einfaches Zinsproblem lösen und das Ergebnis im selben Sachzusammenhang deuten sind Phasen einer einzelnen Modellierungskompetenz zur einfachen Zinsrechnung.',
    memoryReason: 'Einfache Zinsprobleme werden über Prozentverständnis, Modellierung, Berechnung und Kontextdeutung gelernt; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md', 'image-reconstruction-prompt.de.md'],
  },
  '7dea79d2-67f2-4d92-b6cc-ad1b953dca3d': {
    subject: 'mathematik',
    titleEn: 'Characterize Functions as Relations with Exactly One Output for Each Input',
    description: 'Die lernende Person kann Funktionen als Zuordnungen charakterisieren, bei denen jedem zulässigen Eingabewert genau ein Ausgabewert zugeordnet ist, und sie anhand dieser Eigenschaft von allgemeineren Zuordnungen abgrenzen.',
    descriptionEn: 'The learner can characterize functions as relations in which each admissible input is assigned exactly one output and distinguish them from more general relations using this property.',
    atomicityReason: 'Eine Zuordnung anhand der Eigenschaft genau eines Ausgabewerts je zulässigem Eingabewert als Funktion zu charakterisieren oder abzugrenzen ist eine einzelne begriffliche Kompetenz.',
    memoryReason: 'Der Funktionsbegriff muss an neuen Zuordnungen erkannt, begründet und von Nicht-Funktionen abgegrenzt werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md', 'image-reconstruction-prompt.de.md'],
  },
  'f3167cab-bb23-4bb9-8a27-22e3c5015d44': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann proportionale Funktionen in Tabellen und als Ursprungsgeraden in Graphen darstellen und deuten sowie beide Darstellungsformen passend aufeinander beziehen.',
    previousDescriptionEn: 'The learner can represent and interpret proportional functions in tables and as lines through the origin in graphs, and relate the two representations appropriately.',
    description: 'Die lernende Person kann proportionale Funktionen in Tabellen und als Ursprungsgeraden in Graphen darstellen und deuten und dabei erläutern, dass bei Eingabewerten ungleich null der konstante Quotient aus Ausgabe- und Eingabewert der Steigung der Geraden entspricht.',
    descriptionEn: 'The learner can represent and interpret proportional functions in tables and as lines through the origin in graphs and explain that, for nonzero inputs, the constant ratio of output to input corresponds to the slope of the line.',
    atomicityReason: 'Tabelle und Ursprungsgerade sind zwei Darstellungen derselben proportionalen Funktion; Darstellen, Deuten und Zuordnen bilden daher eine zusammenhängende Darstellungswechsel-Kompetenz.',
    memoryReason: 'Proportionalität und Ursprungsgerade müssen an wechselnden Tabellen und Graphen erkannt, dargestellt und gedeutet werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  'cc60f759-1168-5fc0-8ff5-5f7a2533e61c': {
    subject: 'mathematik',
    previousDescription: 'Die lernende Person kann lineare Gleichungen durch äquivalente Umformungen auf Formen wie 0 = 0, 0 = c oder x = a zurückführen, daraus keine, genau eine oder unendlich viele Lösungen folgern und die Lösungsmenge begründen.',
    previousDescriptionEn: 'The learner can transform linear equations equivalently into forms such as 0 = 0, 0 = c, or x = a; infer whether there are no solutions, exactly one solution, or infinitely many solutions; and justify the solution set.',
    description: 'Die lernende Person kann lineare Gleichungen durch äquivalente Umformungen auf 0 = 0, auf 0 = c mit c ≠ 0 oder auf x = a zurückführen, daraus jeweils unendlich viele, keine oder genau eine Lösung folgern und die Lösungsmenge begründen.',
    descriptionEn: 'The learner can transform linear equations equivalently into 0 = 0, 0 = c with c ≠ 0, or x = a; infer respectively infinitely many solutions, no solution, or exactly one solution; and justify the solution set.',
    atomicityReason: 'Das Zurückführen einer linearen Gleichung auf eine charakteristische Endform und das daraus begründete Klassifizieren ihrer Lösungsmenge sind eine zusammenhängende Untersuchungs-Kompetenz.',
    memoryReason: 'Die Lösungsvielfalt muss aus äquivalenten Umformungen und Endformen begründet werden; isoliertes Auswendiglernen ist dafür nicht erforderlich.',
    revalidationOwner: 'structural-split',
    promptFiles: ['prompt.de.md'],
  },
  '10aad90e-a1db-42b6-8d1e-1d856e14b47d': {
    subject: 'physik',
    previousDescription: 'Die lernende Person kann Ton, Geräusch, Lautstärke und Tonhöhe unterscheiden und in einfachen Darstellungen fachlich beschreiben.',
    previousDescriptionEn: 'The learner can distinguish tone, noise, loudness, and pitch and appropriately describe them in simple representations.',
    description: 'Die lernende Person kann Töne von Geräuschen anhand einfacher Schwingungsdarstellungen unterscheiden sowie Tonhöhe und Lautstärke als verschiedene Merkmale beschreiben und mit Frequenz beziehungsweise – unter vergleichbaren Bedingungen – Amplitude in Beziehung setzen.',
    descriptionEn: 'The learner can distinguish tones from noises using simple oscillation representations, describe pitch and loudness as distinct features, and relate them to frequency and, under comparable conditions, amplitude, respectively.',
    sourceRef: 'Hessen Lehrplan Physik Gymnasium G9, Inhaltsfeld 8.3b: „Charakterisierung von Schall: Ton, Geräusch, Lärm, Knall, Klang, Lautstärke, Tonhöhe“.',
    atomicityReason: 'Ton gegenüber Geräusch sowie Tonhöhe gegenüber Lautstärke anhand derselben einfachen Schwingungsdarstellung fachlich zu unterscheiden und auf Frequenz beziehungsweise Amplitude zu beziehen, ist eine zusammenhängende Charakterisierungskompetenz.',
    memoryReason: 'Die Unterscheidungen müssen an wechselnden Schwingungsdarstellungen erkannt, begründet und übertragen werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  'e62e48bc-2387-4b2b-8d6f-7a06c8e7580e': {
    subject: 'physik',
    previousDescription: 'Die lernende Person kann Schallphänomene an Musikinstrumenten beschreiben und einfache Klanggestaltung fachlich erklären.',
    previousDescriptionEn: 'The learner can describe sound phenomena in musical instruments and appropriately explain simple sound shaping.',
    description: 'Die lernende Person kann an einfachen Bauprinzipien von Musikinstrumenten erklären, wie schwingende Saiten, Membranen oder Luftsäulen Schall erzeugen und wie Änderungen am schwingenden System, an der Anregung oder an einem Resonanzkörper Tonhöhe, Lautstärke oder Klangfarbe beeinflussen.',
    descriptionEn: 'The learner can use simple design principles of musical instruments to explain how vibrating strings, membranes, or air columns produce sound and how changes to the oscillating system, its excitation, or a resonating body affect pitch, loudness, or timbre.',
    sourceRef: 'Hessen Lehrplan Physik Gymnasium G9, Inhaltsfeld 8.3b: „Musik und Musikinstrumente: Klang, Klangfarbe, einfache Bauprinzipien“.',
    atomicityReason: 'Schallerzeugung und gezielte Klangänderung werden an einfachen Bauprinzipien als eine Ursache-Wirkungs-Kette vom schwingenden System beziehungsweise seiner Anregung oder Kopplung zur hörbaren Eigenschaft erklärt.',
    memoryReason: 'Die Wirkung von Bauprinzip, Anregung und Resonanz muss an verschiedenen Instrumenten kausal erklärt und übertragen werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  'c1006f55-0406-48cc-92d4-0d8345897cf4': {
    subject: 'physik',
    description: 'Die lernende Person kann Schallquellen und Schallempfänger an Beispielen nach ihrer Funktion unterscheiden und erklären, wie eine schwingende Quelle Schall erzeugt und ankommender Schall am Empfänger eine mechanische Reaktion oder ein weiterverarbeitbares Signal hervorruft.',
    descriptionEn: 'The learner can distinguish sound sources from sound receivers in examples by their function and explain how a vibrating source produces sound and how incoming sound produces a mechanical response or a signal that can be processed further at the receiver.',
    atomicityReason: 'Quelle und Empfänger werden als komplementäre Rollen desselben Schallübertragungsvorgangs unterschieden und funktional erklärt; dies ist eine einzelne, klar prüfbare Akustikkompetenz.',
    memoryReason: 'Schallquelle und Schallempfänger müssen in wechselnden Beispielen funktional unterschieden und erklärt werden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  '078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5': {
    subject: 'physik',
    description: 'Die lernende Person kann im vereinfachten Strahlenmodell die Wirkung von Konvex- und Konkavlinsen mithilfe von Brennpunkten und Brennweite beschreiben, einfache Bildkonstruktionen durchführen und daraus Bildlage, Bildorientierung, Bildgröße und die reelle oder virtuelle Bildart qualitativ deuten.',
    descriptionEn: 'The learner can use the simplified ray model, focal points, and focal length to describe the effects of convex and concave lenses, carry out simple image constructions, and qualitatively interpret image position, orientation, size, and whether the image is real or virtual.',
    atomicityReason: 'Linsenwirkung beschreiben, ein Strahlenbild konstruieren und dessen Bildmerkmale deuten sind aufeinander bezogene Phasen derselben qualitativen Linsenabbildungs-Kompetenz.',
    memoryReason: 'Linsenabbildungen werden durch Strahlenmodell, Konstruktion und Deutung wechselnder Gegenstands- und Linsenlagen verstanden; ein separates Memory-Deck ist dafür nicht erforderlich.',
    promptFiles: ['prompt.de.md'],
  },
  '2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c': {
    subject: 'physik',
    description: 'Die lernende Person kann qualitativ erklären, wie das Außenohr Schall zum Trommelfell leitet, Trommelfell und Gehörknöchelchen die mechanische Schwingung auf das Innenohr übertragen und Sinneszellen in der Cochlea die mechanische Anregung in Nervensignale umwandeln.',
    descriptionEn: 'The learner can qualitatively explain how the outer ear directs sound to the eardrum, how the eardrum and ossicles transmit the mechanical vibration to the inner ear, and how sensory cells in the cochlea convert the mechanical stimulation into nerve signals.',
    atomicityReason: 'Der funktionale Hörweg und die mechanisch-neuronale Signalumwandlung im Innenohr bilden einen zusammenhängenden, eigenständig erklär- und prüfbaren Vorgang.',
    memoryReason: 'Das Ziel verlangt eine kausale Erklärung des Hörwegs und der Signalumwandlung; isoliertes Faktenabfragen würde das geforderte Verständnis nicht angemessen aufbauen.',
    promptFiles: ['prompt.de.md'],
  },
  'da0837c7-95a7-5a6a-81db-f33cb7f42d85': {
    subject: 'physik',
    description: 'Die lernende Person kann in konkreten Lärmsituationen die Gefährdung des Gehörs aus dem Zusammenwirken von Schallpegel und Einwirkdauer beurteilen sowie die Wirksamkeit von Schutzmaßnahmen und mögliche Folgen begründen.',
    descriptionEn: 'The learner can assess the risk to hearing in specific noise situations from the combined effects of sound level and exposure duration and justify the effectiveness of protective measures and possible consequences.',
    atomicityReason: 'Schallpegel, Einwirkdauer, Schutzwirkung und mögliche Folgen sind die notwendigen Kriterien derselben fachlichen Beurteilung einer konkreten Lärmsituation.',
    memoryReason: 'Das Ziel wird durch kriteriengeleitete Urteile in wechselnden Situationen aufgebaut; eine einzelne Grenzwertkarte würde das Zusammenwirken von Pegel, Dauer und Schutzwirkung unzulässig verkürzen.',
    promptFiles: ['prompt.de.md'],
  },
}

const abs = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(abs(path), 'utf8'))
const readJsonl = (path: string): JsonRecord[] => readFileSync(abs(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line))
const writeJson = (path: string, value: unknown): void => writeFileSync(abs(path), `${JSON.stringify(value, null, 2)}\n`)
const writeJsonl = (path: string, values: JsonRecord[]): void => writeFileSync(abs(path), `${values.map((value) => JSON.stringify(value)).join('\n')}\n`)
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord).sort(([a], [b]) => a.localeCompare(b)).map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value)
}
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => `sha256:${createHash('sha256').update(stableJson({
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
})).digest('hex')}`

const outputs = new Map<string, string>()
const subjectFilter = subjectArgument?.slice('--subject='.length) as keyof typeof subjects | undefined
if (subjectFilter && !(subjectFilter in subjects)) {
  throw new Error(`Unknown subject filter: ${subjectFilter}`)
}

for (const [subject, paths] of Object.entries(subjects) as [keyof typeof subjects, typeof subjects[keyof typeof subjects]][]) {
  if (subjectFilter && subject !== subjectFilter) continue
  const landscape = readJson(paths.canonical)
  const goals = new Map((landscape.goals as JsonRecord[]).map((goal) => [goal.id as string, goal]))
  const subjectRevisions = Object.entries(revisions).filter(([, revision]) => revision.subject === subject)
  const reviewLaneRevisions = subjectRevisions.filter(([, revision]) => revision.revalidationOwner !== 'structural-split')

  for (const [goalId, revision] of subjectRevisions) {
    const goal = goals.get(goalId)
    if (!goal) throw new Error(`Missing ${subject} goal ${goalId}`)
    const matchesCurrent = goal.description === revision.description && goal.descriptionEn === revision.descriptionEn
    const matchesPrevious = revision.previousDescription !== undefined
      && revision.previousDescriptionEn !== undefined
      && goal.description === revision.previousDescription
      && goal.descriptionEn === revision.previousDescriptionEn
    if (!matchesCurrent && !matchesPrevious) {
      throw new Error(`Canonical bilingual revision does not match adjudication for ${goalId}`)
    }
    if (revision.titleEn && goal.titleEn !== revision.titleEn) {
      throw new Error(`Canonical English title does not match adjudication for ${goalId}`)
    }
    goal.description = revision.description
    goal.descriptionEn = revision.descriptionEn
    if (revision.sourceRef) {
      if (goal.sourceRef !== undefined && goal.sourceRef !== revision.sourceRef) {
        throw new Error(`Canonical sourceRef does not match adjudication for ${goalId}`)
      }
      goal.sourceRef = revision.sourceRef
    }
  }
  outputs.set(paths.canonical, `${JSON.stringify(landscape, null, 2)}\n`)

  const semanticKinds = readJson(paths.semanticKinds)
  for (const [goalId] of reviewLaneRevisions) {
    const decision = (semanticKinds.decisions as JsonRecord[]).find((entry) => entry.goalId === goalId)
    const goal = goals.get(goalId)!
    if (!decision || decision.semanticKind !== 'curricularAtomic' || decision.decisionStatus !== 'authoritative') {
      throw new Error(`Missing authoritative curricularAtomic decision for ${goalId}`)
    }
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
  outputs.set(paths.semanticKinds, `${JSON.stringify(semanticKinds, null, 2)}\n`)

  for (const [ledgerPath, ruleVersion] of [[paths.atomicity, 'semantic-atomicity-v1'], [paths.memory, 'memory-card-review-v1']] as const) {
    const records = readJsonl(ledgerPath)
    for (const [goalId, revision] of reviewLaneRevisions) {
      const record = records.find((entry) => entry.goalId === goalId)
      const goal = goals.get(goalId)!
      if (!record) throw new Error(`Missing ${ruleVersion} record for ${goalId}`)
      record.fingerprint = reviewFingerprint(goal, ruleVersion)
      record.reviewedAt = reviewedAt
      record.reviewer = paths.reviewer
      if (ruleVersion === 'semantic-atomicity-v1') {
        Object.assign(record, {
          status: 'atomic',
          semanticAtomic: true,
          reason: revision.atomicityReason,
          suggestedSplit: [],
        })
      } else {
        Object.assign(record, {
          status: 'no_memory_needed',
          memoryUseful: false,
          reason: revision.memoryReason,
        })
        delete record.memoryGoalIds
        delete record.deckIds
      }
    }
    outputs.set(ledgerPath, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
  }

  for (const [goalId, revision] of subjectRevisions) {
    const goal = goals.get(goalId)!
    for (const fileName of revision.promptFiles) {
      const promptPath = `curricula/DE/Gymnasium/visualizations/${subject}/${goalId}/${fileName}`
      let bytes = readFileSync(abs(promptPath), 'utf8')
      const lines = bytes.split(/\r?\n/u).filter((line) => line.startsWith('- Beschreibung: ') || line.startsWith('Beschreibung: '))
      if (lines.length === 0) throw new Error(`No description binding found in ${promptPath}`)
      for (const line of lines) {
        bytes = bytes.replace(line, `${line.startsWith('- ') ? '- ' : ''}Beschreibung: ${goal.description}`)
      }
      outputs.set(promptPath, bytes)
    }
  }
}

for (const [path, bytes] of outputs) {
  if (writeMode) writeFileSync(abs(path), bytes)
  else if (readFileSync(abs(path), 'utf8') !== bytes) throw new Error(`Adjudication drift in ${path}`)
}

const selectedRevisionCount = Object.values(revisions).filter((revision) => !subjectFilter || revision.subject === subjectFilter).length
console.log(`CHECK apply_math_physics_batch_004_007_wording_adjudication ${writeMode ? 'WRITE' : 'PASS'} goals=${selectedRevisionCount} files=${outputs.size}`)
