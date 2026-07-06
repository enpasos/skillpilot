import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'

type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_configured'
type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7'
type PilotLane =
  | 'hard-recall-seed'
  | 'limited-glossary'
  | 'understanding-first'
  | 'not-a-memory-card'
  | 'needs-subject-review'

interface RuleResult {
  id: string
  status: RuleStatus
  summary?: string
  metrics?: Record<string, number>
}

interface CurriculumStatus {
  subject?: string
  title: string
  maturity: MaturityLevel
  path: string
  rules: RuleResult[]
}

interface StatusDocument {
  generatedAt: string
  curricula: CurriculumStatus[]
}

interface Args {
  statusPath: string
  subject: string
  outputPath?: string
}

interface PilotDecision {
  lane: PilotLane
  rationale: string
  cardFocus: string
}

interface CandidateRow {
  goal: LearningGoal
  decision: PilotDecision
  fingerprint: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultStatusPath = 'docs/qa-ci/status/curriculum-quality-status.json'
const defaultSubject = 'Biologie'

const memoryCandidatePatterns: RegExp[] = [
  /begriff/i,
  /definition/i,
  /definier/i,
  /benenn/i,
  /nenn/i,
  /formel/i,
  /notation/i,
  /merk/i,
  /regel/i,
  /symbol/i,
  /fachbegriff/i,
  /vokab/i,
  /grammatik/i,
  /deklination/i,
  /konjugation/i,
  /tempus/i,
  /kasus/i,
  /operator/i,
  /kennzeichen/i,
  /merkmale/i,
  /ordnung/i,
  /gesetz/i,
]

const biologyPilotDecisions: Record<string, PilotDecision> = {
  '55bdfb1d-5c14-5b1c-bc8e-4ab428ef59ba': {
    lane: 'hard-recall-seed',
    rationale: 'Die Kennzeichen von Lebewesen sind ein kompakter Abrufbestand; Anwendungen bleiben Verstehensarbeit.',
    cardFocus: 'Kennzeichen von Lebewesen als kurze Liste mit je einem Prüfbeispiel.',
  },
  'e0d04e58-1591-5230-bfa6-5c685b56d25b': {
    lane: 'hard-recall-seed',
    rationale: 'Zellbestandteile und Grundfunktionen müssen präzise benannt werden können.',
    cardFocus: 'Pflanzenzelle: Zellwand, Zellmembran, Zellkern, Chloroplast, Vakuole, Cytoplasma.',
  },
  '11e90f71-a9a4-5a57-b619-ad5d81e81f96': {
    lane: 'hard-recall-seed',
    rationale: 'Organisationsstufen und Kennzeichen des Lebens sind abrufpflichtige Grundbegriffe.',
    cardFocus: 'Organisationsebenen und Kennzeichen des Lebens knapp abfragen.',
  },
  '01819a6c-f965-5b33-8c4e-07affb3c659f': {
    lane: 'limited-glossary',
    rationale: 'Kompetitive und allosterische Hemmung sind Merkelemente; Bewertung und Beispiele sind keine Kartenleistung.',
    cardFocus: 'Nur Begriffspaare und minimale Unterscheidung, keine Fallbewertung.',
  },
  '96001dbf-ef37-584a-98f0-d5351d9cdeaf': {
    lane: 'not-a-memory-card',
    rationale: 'Gesetzgebung und Beteiligung sind Kontext- und Urteilswissen; ein Kartenknoten würde Verständnis ersetzen.',
    cardFocus: 'Keine Karte; ggf. Material-/Diskussionsaufgabe.',
  },
  'e566ae2f-1294-55c0-ba4c-6aeb4954118c': {
    lane: 'hard-recall-seed',
    rationale: 'Die RGT-Regel ist eine knappe Regelstruktur, die korrekt abrufbar sein muss.',
    cardFocus: 'RGT-Regel und typische Temperatur-Verdopplungs-/Verdreifachungsaussage.',
  },
  '4f631f78-e13a-58e5-9092-f4db0b8d377a': {
    lane: 'limited-glossary',
    rationale: 'Hebb-Regel kann kurz memoriert werden; Netzwerkanwendung und Grenzen bleiben Verständnis.',
    cardFocus: 'Hebb-Regel als Leitsatz, ohne Anwendungsfälle als Karten zu codieren.',
  },
  '39ba4385-0144-5e20-ba11-e3714756583b': {
    lane: 'understanding-first',
    rationale: 'Lebensmittelverderb wird durch Erklärungsketten gelernt; nur einzelne Hygiene-Regeln wären Kartenkandidaten.',
    cardFocus: 'Vorerst keine Deckpflicht; mögliche spätere Mini-Karten nur für harte Hygieneregeln.',
  },
  '5f39afac-897c-5ed3-95b5-89ccf66b2532': {
    lane: 'understanding-first',
    rationale: 'Artenvielfalt und Artensterben verlangen Einordnung und Beispiele, nicht primär Abruf.',
    cardFocus: 'Keine eigenständigen Karten vor Fachreview.',
  },
  'bdbb1a13-f448-5536-86ab-894805e2f6be': {
    lane: 'limited-glossary',
    rationale: 'Organ-Funktions-Zuordnungen können punktuell Karten rechtfertigen; das Lernziel insgesamt bleibt Strukturverständnis.',
    cardFocus: 'Nur wenige zentrale Organ-Funktions-Zuordnungen, falls fachlich nötig.',
  },
  'ac69483b-6a77-573d-a7c0-add32bb867e2': {
    lane: 'understanding-first',
    rationale: 'Angepasstheit ist Deutungsleistung; Merkmalslisten allein wären fachlich schwach.',
    cardFocus: 'Keine Karte ohne konkretes Quell- oder Aufgabenmotiv.',
  },
  'be06115e-96e8-537e-b18a-313056e6cbe8': {
    lane: 'hard-recall-seed',
    rationale: 'Blütenbestandteile und Funktionen sind klassische, kompakte Abrufelemente.',
    cardFocus: 'Blütenbestandteile und jeweilige Funktion in der Fortpflanzung.',
  },
  '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd': {
    lane: 'understanding-first',
    rationale: 'Bestimmungsmerkmale müssen an Material geübt werden; reine Namenslisten sind nicht ausreichend.',
    cardFocus: 'Keine Karte; eher Bestimmungsübung.',
  },
  '91f62a7b-3b6a-5918-94ca-3f345f1f6584': {
    lane: 'limited-glossary',
    rationale: 'Einzelne Begriffe können abrufrelevant sein; das Thema ist sensibel und darf nicht auf Karten reduziert werden.',
    cardFocus: 'Nur neutrale anatomische Begriffe, falls überhaupt.',
  },
  '848334f3-c719-55d9-b5f4-42836e0d876a': {
    lane: 'understanding-first',
    rationale: 'Schwangerschaft und Geburt sind Prozessverständnis mit Risiken; kein Standard-Memory-Knoten.',
    cardFocus: 'Keine Karte ohne eng begrenzte Fachentscheidung.',
  },
  '7eeb9de9-9a8e-5932-8f60-183367c87d09': {
    lane: 'understanding-first',
    rationale: 'Angepasstheit verlangt biologisches Deuten statt isolierten Faktenabruf.',
    cardFocus: 'Keine eigenständigen Karten.',
  },
  'cd1fa548-9b27-54df-89be-6a6ee3629eb9': {
    lane: 'understanding-first',
    rationale: 'Gefährdung und Schutz sind kausale Begründungsleistungen.',
    cardFocus: 'Keine Karte; ggf. Fallanalyse.',
  },
  '480146f6-4749-52e3-a5e5-d08629e0c38f': {
    lane: 'hard-recall-seed',
    rationale: 'Blutbestandteile und Kerneigenschaften sind kompakte, fachsprachliche Abrufelemente.',
    cardFocus: 'Erythrozyten, Leukozyten, Thrombozyten, Plasma mit Hauptfunktion.',
  },
  '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8': {
    lane: 'not-a-memory-card',
    rationale: 'Empfängnisregelung und Elternschaft sind Bewertungs- und Verantwortungsfragen, nicht Kartenstoff.',
    cardFocus: 'Keine Karte; fachlich und pädagogisch besser als Beratung-/Urteilsaufgabe.',
  },
  'f7fd8d03-aea2-530a-a384-0f63d270f5f6': {
    lane: 'understanding-first',
    rationale: 'Regelkreise müssen modelliert und interpretiert werden; Begriffe allein reichen nicht.',
    cardFocus: 'Vorerst keine Karte; ggf. später nur Basisterme wie Rezeptor, Regelgröße, Stellgröße.',
  },
  'b8fc739d-f5de-5f83-92fe-28dc6597add5': {
    lane: 'limited-glossary',
    rationale: 'Dominant/rezessiv und Genotyp/Phänotyp sind abrufrelevant; Erbganganalyse bleibt Übung.',
    cardFocus: 'Grundbegriffe zu einfachen Erbgängen, keine Kreuzungsschemata als reine Karte.',
  },
  '8be0001b-4fe0-5ea1-9d61-b3c4bbb16660': {
    lane: 'understanding-first',
    rationale: 'Stammbaumdeutung ist Analyse; Merken allein trägt das Lernziel nicht.',
    cardFocus: 'Keine Deckpflicht; ggf. Begriffe über allgemeinen Genetik-Deck abdecken.',
  },
  '74740709-fc77-5a54-88a6-bb14c3777941': {
    lane: 'hard-recall-seed',
    rationale: 'Karyogramm, Chromosomensatz und numerische Aberrationen enthalten harte Benennungen.',
    cardFocus: 'Karyogramm-Begriffe, Chromosomensatz, Trisomie 21 als Beispiel.',
  },
  '1b7f08a1-33df-5779-af66-430c91d699b7': {
    lane: 'limited-glossary',
    rationale: 'Gentechnik enthält Fachbegriffe; Methodenverständnis darf aber nicht als Vokabelliste enden.',
    cardFocus: 'Nur Basisbegriffe wie Gen, Vektor, PCR, Restriktionsenzym nach Fachreview.',
  },
  '5c7f0085-7ca8-5a67-bc87-57319acec749': {
    lane: 'understanding-first',
    rationale: 'Systematische Einordnung des Menschen ist Merkmals- und Evidenzarbeit.',
    cardFocus: 'Keine eigenständige Karte; ggf. Taxonomiestufen nur in allgemeinem Glossar.',
  },
  '430b2b73-641a-5122-bb6d-162b0d1eaf2d': {
    lane: 'not-a-memory-card',
    rationale: 'Rekonstruktion biologischer und kultureller Evolution ist Quellen- und Hypothesenarbeit.',
    cardFocus: 'Keine Karte.',
  },
  'e1ce88af-3cb7-599a-8a27-fd2ea2f6d492': {
    lane: 'understanding-first',
    rationale: 'Vergleich von Bewegungsapparaten ist Struktur-Funktions-Verständnis.',
    cardFocus: 'Keine Karte ohne sehr engen Begriffsfokus.',
  },
  '47391e58-6937-5a47-bef0-19c6fcd27b4b': {
    lane: 'understanding-first',
    rationale: 'Fortpflanzungsvergleich ist Konzept- und Vergleichsarbeit.',
    cardFocus: 'Keine Karte.',
  },
  'fcc20f50-8eb3-5d6c-b37f-5be13c7d314e': {
    lane: 'understanding-first',
    rationale: 'Individualentwicklung muss verglichen und eingeordnet werden.',
    cardFocus: 'Keine Karte.',
  },
  'd74b252b-217f-563c-8263-8062a1442d2e': {
    lane: 'understanding-first',
    rationale: 'Nervensystemvergleich ist Struktur-Funktions-Verständnis.',
    cardFocus: 'Keine Karte.',
  },
  'c05e217f-33fc-5a11-ba75-1397fad3ae0a': {
    lane: 'understanding-first',
    rationale: 'Hormonregulation und Stressfolgen verlangen Prozessmodellierung.',
    cardFocus: 'Keine Deckpflicht; Basisterme nur bei späterem Glossarentscheid.',
  },
  '5f01403c-6560-5515-aa76-03860aa52315': {
    lane: 'understanding-first',
    rationale: 'Proteinaufgaben und Genwirkketten sind kausale Modellierung, nicht bloßer Abruf.',
    cardFocus: 'Keine Karte außer eng begrenzten Molekularbegriffen nach Review.',
  },
  'd42c8cf0-9225-5f05-816a-914fc3caa116': {
    lane: 'understanding-first',
    rationale: 'Mono- und dihybride Erbgänge werden durch Schemata und Übung gemeistert.',
    cardFocus: 'Keine reine Merkkarte; Fachreview kann nur Grundbegriffe separat markieren.',
  },
  'ab489050-c165-5901-b420-bfeb33511eb5': {
    lane: 'not-a-memory-card',
    rationale: 'Wissenswandel ist historisch-wissenschaftliche Erklärung, kein Abrufziel.',
    cardFocus: 'Keine Karte.',
  },
  '0db20819-ee94-54c6-8ecb-aff8c9b7419e': {
    lane: 'understanding-first',
    rationale: 'Bestimmen von Arten ist Material- und Methodenpraxis.',
    cardFocus: 'Keine Karte; Bestimmungshilfen statt SRS.',
  },
  '1e78d6eb-1f49-59c1-9617-6ea445d3fe65': {
    lane: 'understanding-first',
    rationale: 'Synthetische Evolutionstheorie wird angewendet; einzelne Faktoren können später Glossarstoff sein.',
    cardFocus: 'Keine Deckpflicht; nur Evolutionsfaktoren als mögliches Glossar nach Review.',
  },
  '18b3540e-4379-5d13-b3ec-dc7fe21c5e6a': {
    lane: 'understanding-first',
    rationale: 'Proteinaufgaben und Genwirkketten sind kausale Modellierung.',
    cardFocus: 'Keine Karte außer eng begrenzten Molekularbegriffen nach Review.',
  },
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    statusPath: defaultStatusPath,
    subject: defaultSubject,
  }

  argv.forEach((arg) => {
    if (arg.startsWith('--status=')) {
      args.statusPath = arg.slice('--status='.length)
    } else if (arg.startsWith('--subject=')) {
      args.subject = arg.slice('--subject='.length)
    } else if (arg.startsWith('--output=')) {
      args.outputPath = arg.slice('--output='.length)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  })

  return args
}

function readJson<T>(repoPath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, repoPath), 'utf8')) as T
}

function isAtomicGoal(goal: LearningGoal): boolean {
  return !Array.isArray(goal.contains) || goal.contains.length === 0
}

function isMemoryGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  return goal.nodeKind === 'memory'
    || tags.includes('memorization')
    || tags.some((tag) => tag.startsWith('srs-deck:'))
}

function isReviewRelevantGoal(goal: LearningGoal): boolean {
  const tags = new Set(goal.tags ?? [])
  if (tags.has('Practice') || tags.has('Assessment')) return false
  if (tags.has('Motivation') || tags.has('Orientation')) return false
  if (isMemoryGoal(goal)) return false
  if ((goal as { examData?: unknown }).examData) return false
  return true
}

function goalText(goal: LearningGoal): string {
  return [
    goal.title,
    (goal as { titleEn?: string }).titleEn,
    goal.description,
    (goal as { descriptionEn?: string }).descriptionEn,
  ].filter(Boolean).join(' ')
}

function isHeuristicMemoryCandidate(goal: LearningGoal): boolean {
  const text = goalText(goal)
  return memoryCandidatePatterns.some((pattern) => pattern.test(text))
}

function fingerprintGoal(goal: LearningGoal): string {
  const payload = {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    tags: goal.tags ?? [],
    courseLevel: goal.courseLevel ?? null,
    themenfeld: goal.themenfeld ?? null,
    requires: goal.requires ?? [],
  }
  return `sha256:${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}`
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function markdownCell(value: string | number): string {
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>')
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>): string[] {
  return [
    `| ${headers.map(markdownCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`),
  ]
}

function pushGeneratedMarkdownNotice(lines: string[], statusPath: string): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/reportMemoryCardPilotDossier.ts`')
  lines.push('> Regenerate with: `cd app && npm run quality:memory-card-review:pilot-dossier`')
  lines.push('> Source of truth: `app/scripts/reportMemoryCardPilotDossier.ts`')
  lines.push(`> Source of truth: \`${statusPath}\``)
  lines.push('')
}

function laneLabel(lane: PilotLane): string {
  switch (lane) {
    case 'hard-recall-seed':
      return 'Memory-Seed'
    case 'limited-glossary':
      return 'Begrenztes Glossar'
    case 'understanding-first':
      return 'Verstehen zuerst'
    case 'not-a-memory-card':
      return 'Keine Karte'
    case 'needs-subject-review':
      return 'Fachreview offen'
  }
}

function laneOrder(lane: PilotLane): number {
  switch (lane) {
    case 'hard-recall-seed':
      return 1
    case 'limited-glossary':
      return 2
    case 'understanding-first':
      return 3
    case 'not-a-memory-card':
      return 4
    case 'needs-subject-review':
      return 5
  }
}

function stageFor(goal: LearningGoal): string {
  const tags = goal.tags ?? []
  if (tags.includes('SekI')) return 'Sek I'
  if (tags.includes('SekII')) return 'Sek II'
  return 'nicht markiert'
}

function decisionFor(subject: string, goal: LearningGoal): PilotDecision {
  if (subject === 'Biologie') {
    return biologyPilotDecisions[goal.id] ?? {
      lane: 'needs-subject-review',
      rationale: 'Neuer oder veränderter Kandidat; bitte fachlich prüfen und die Pilotentscheidung ergänzen.',
      cardFocus: 'Noch nicht entschieden.',
    }
  }

  return {
    lane: 'needs-subject-review',
    rationale: 'Für dieses Fach ist noch keine fachspezifische Pilot-Triage hinterlegt.',
    cardFocus: 'Fachspezifische Entscheidung ergänzen.',
  }
}

function findCurriculum(status: StatusDocument, subject: string): CurriculumStatus {
  const normalizedSubject = subject.toLowerCase()
  const curriculum = status.curricula.find((candidate) =>
    candidate.subject?.toLowerCase() === normalizedSubject
    || candidate.title.toLowerCase().startsWith(normalizedSubject),
  )
  if (!curriculum) {
    throw new Error(`No curriculum status found for subject ${subject}`)
  }
  return curriculum
}

function cqr302Status(curriculum: CurriculumStatus): RuleResult | undefined {
  return curriculum.rules.find((rule) => rule.id === 'CQR-302')
}

function renderCandidateSection(title: string, rows: CandidateRow[]): string[] {
  const lines: string[] = []
  lines.push(`## ${title}`)
  lines.push('')
  if (rows.length === 0) {
    lines.push('Keine Kandidaten in dieser Spur.')
    lines.push('')
    return lines
  }
  lines.push(...markdownTable(
    ['Stufe', 'Goal ID', 'Titel', 'Fingerprint', 'Begründung', 'Kartenfokus'],
    rows.map(({ goal, decision, fingerprint }) => [
      stageFor(goal),
      goal.id,
      goal.title,
      fingerprint.slice(0, 19),
      decision.rationale,
      decision.cardFocus,
    ]),
  ))
  lines.push('')
  return lines
}

function renderReport(args: Args, status: StatusDocument, curriculum: CurriculumStatus, landscape: LearningLandscape): string {
  const reviewGoals = landscape.goals.filter((goal) => isAtomicGoal(goal) && isReviewRelevantGoal(goal))
  const heuristicCandidates = reviewGoals
    .filter(isHeuristicMemoryCandidate)
    .map((goal) => ({
      goal,
      decision: decisionFor(args.subject, goal),
      fingerprint: fingerprintGoal(goal),
    }))
    .sort((left, right) =>
      laneOrder(left.decision.lane) - laneOrder(right.decision.lane)
      || stageFor(left.goal).localeCompare(stageFor(right.goal), 'de')
      || left.goal.title.localeCompare(right.goal.title, 'de'),
    )

  const byLane = new Map<PilotLane, CandidateRow[]>()
  heuristicCandidates.forEach((candidate) => {
    const laneRows = byLane.get(candidate.decision.lane) ?? []
    laneRows.push(candidate)
    byLane.set(candidate.decision.lane, laneRows)
  })

  const rule = cqr302Status(curriculum)
  const lines: string[] = []
  lines.push(`# Memory-Card-Pilotdossier: ${args.subject}`)
  lines.push('')
  pushGeneratedMarkdownNotice(lines, args.statusPath)
  lines.push(`Erzeugt aus \`${args.statusPath}\`; Status-Snapshot erzeugt am ${status.generatedAt}.`)
  lines.push('')
  lines.push('Dieses Dossier ist ein reproduzierbares semantisches Vorbereitungsartefakt. Es ist keine `CQR-302`-Konfiguration, kein Entscheidungsledger und kein `M6`-Anspruch.')
  lines.push('')
  lines.push('## Umfang')
  lines.push('')
  lines.push(...markdownTable(
    ['Feld', 'Wert'],
    [
      ['Curriculum', curriculum.title],
      ['Fach', curriculum.subject ?? args.subject],
      ['Landschaftspfad', curriculum.path],
      ['Reifegrad im Snapshot', curriculum.maturity],
      ['CQR-302-Status im Snapshot', rule?.status ?? 'missing'],
      ['Alle Ziele', landscape.goals.length],
      ['Normale atomare Review-Ziele', reviewGoals.length],
      ['Heuristische Memory-Kandidaten', heuristicCandidates.length],
      ['Nicht durch Memory-Heuristik markiert', reviewGoals.length - heuristicCandidates.length],
    ],
  ))
  lines.push('')
  lines.push(`Die ${reviewGoals.length - heuristicCandidates.length} nicht markierten Ziele werden durch dieses Dossier nicht fachlich als \`no_memory_needed\` entschieden. Das Dossier reduziert nur die erste manuelle Prüfmenge; ein enforcebarer \`CQR-302\`-Ledger muss den vollständigen Review-Scope separat abdecken.`)
  lines.push('')
  lines.push('## Entscheidungsregeln')
  lines.push('')
  lines.push('- Memory-Lernen bleibt die Ausnahme; Verstehen, Modellieren, Erklären, Vergleichen, Beurteilen und Anwenden bleiben normale Lernarbeit.')
  lines.push('- `Memory-Seed` heißt: wahrscheinlich ein kleines Deck wert, weil der Inhalt kompakt, präzise und ohne Hilfe abrufbar sein muss.')
  lines.push('- `Begrenztes Glossar` heißt: einzelne Begriffe können Karten rechtfertigen; das Ziel selbst muss weiter durch Verstehen und Übung gelernt werden.')
  lines.push('- `Verstehen zuerst` heißt: keinen Memory-Knoten anlegen, solange kein kleiner harter Abrufbestand isoliert wurde.')
  lines.push('- `Keine Karte` heißt: eine eigenständige Lernkarte wäre für dieses Lernziel semantisch irreführend.')
  lines.push('')
  lines.push('## Triage-Zusammenfassung')
  lines.push('')
  const laneRows: Array<Array<string | number>> = [
    'hard-recall-seed',
    'limited-glossary',
    'understanding-first',
    'not-a-memory-card',
    'needs-subject-review',
  ].map((lane) => {
    const typedLane = lane as PilotLane
    return [laneLabel(typedLane), byLane.get(typedLane)?.length ?? 0]
  })
  lines.push(...markdownTable(['Spur', 'Kandidaten'], laneRows))
  lines.push('')
  lines.push(...renderCandidateSection('Memory-Seed-Kandidaten', byLane.get('hard-recall-seed') ?? []))
  lines.push(...renderCandidateSection('Begrenzte Glossarkandidaten', byLane.get('limited-glossary') ?? []))
  lines.push(...renderCandidateSection('Verstehen-zuerst-Kandidaten', byLane.get('understanding-first') ?? []))
  lines.push(...renderCandidateSection('Abgelehnte eigenständige Memory-Kandidaten', byLane.get('not-a-memory-card') ?? []))
  lines.push(...renderCandidateSection('Offene Fachreview-Kandidaten', byLane.get('needs-subject-review') ?? []))
  lines.push('## Nächster Implementierungsschritt')
  lines.push('')
  lines.push('1. Fachreview für `Memory-Seed` und `Begrenztes Glossar` durchführen; alles andere bleibt ohne Memory-Pflicht.')
  lines.push('2. Nur bestätigte Memory-Seed-Ziele bekommen einen DE-level Memory-Knoten und ein kleines Deck mit Karten, die exakt auf `originGoalIds` zurückführen.')
  lines.push('3. Erst danach `CQR-302`-Config und Ledger für Biologie anlegen, damit CI nicht mit einer unfertigen Entscheidungsliste belastet wird.')
  lines.push('')
  return `${lines.join('\n')}\n`
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const status = readJson<StatusDocument>(args.statusPath)
  const curriculum = findCurriculum(status, args.subject)
  const landscape = readJson<LearningLandscape>(curriculum.path)
  const outputRepoPath = args.outputPath ?? `docs/qa-ci/status/memory-card-pilot-${slugify(args.subject)}.md`
  const outputPath = resolve(repoRoot, outputRepoPath)
  const outputDir = dirname(outputPath)
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  writeFileSync(outputPath, renderReport(args, status, curriculum, landscape), 'utf8')
  console.log(`Wrote ${outputRepoPath}`)
}

main()
