import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'

const root = resolve(import.meta.dirname, '../..')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const sourcePath = 'curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/m7-route-repair-20260929-v1/tasks.md'
const q2PracticeId = '14b19ee4-364e-50bd-b6a3-499471356ef3'
const areaId = '98dcf9bd-d119-5eb1-835c-7d719f67b485'
const rootId = 'c01b1ce9-a667-4a46-b251-ec33ae602b15'
const write = process.argv.includes('--write')
assert(process.argv.slice(2).every((arg) => arg === '--write'), 'Only --write is supported')
const read = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const serialize = (value) => JSON.stringify(value, null, 2) + '\n'
const source = readFileSync(resolve(root, sourcePath), 'utf8')
const sourceHash = createHash('sha256').update(source).digest('hex')
const stableId = (key) => {
  const hex = createHash('sha1').update('DE-GYM-CANONICAL-MATH:canonical_math_sek2_q2_m7_route_' + key.replaceAll('-', '_')).digest('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}
const section = (key, part) => {
  const block = source.split(`## ${key}\n`)[1]?.split('\n## ')[0]
  assert(block, `Missing assessment section ${key}`)
  const text = part === 'task'
    ? block.split('### Aufgabe\n')[1]?.split('\n### Lösung')[0]
    : block.split('### Lösung\n')[1]
  assert(text?.trim(), `Missing ${part} for ${key}`)
  return text.trim()
}

// Separate terminals follow distinct GK/LK and jurisdiction visibility sets.
// Each direct prerequisite is also specifically assessed by the scored task.
const specs = [
  { key: 'spat-volume', title: 'Spatprodukt, Orientierung und Tetraedervolumen prüfen', courses: ['GK', 'LK'], goals: ['944dd479', 'a594dec0'], points: [4, 4, 4], strands: ['L3'], area: 'Geometry' },
  { key: 'round-solids', title: 'Zylinder-, Kegel- und Kugelvolumen vergleichen', courses: ['GK', 'LK'], goals: ['c71ae268', 'e8237315', '2f2c9f1a'], points: [4, 4, 4], strands: ['L3'], area: 'Geometry' },
  { key: 'volume-derivation-lk', title: 'Pyramidenvolumen aus Querschnitten herleiten (LK)', courses: ['LK'], goals: ['e9181209'], points: [12], strands: ['L3'], area: 'Geometry' },
  { key: 'dot-projection', title: 'Skalarprodukt über eine orthogonale Projektion erklären', courses: ['GK', 'LK'], goals: ['3016ec37'], points: [4, 6], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'linear-projection', title: 'Orthogonale Projektion als lineare Abbildung prüfen', courses: ['GK', 'LK'], goals: ['ed5d869b'], points: [4, 6], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'vector-relations', title: 'Vektorabhängigkeit und Kollinearität begründen', courses: ['GK', 'LK'], goals: ['6fc9246a', '54cfe5ce'], points: [6, 4, 4], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'plane-coordinates', title: 'Eine Koordinatenebene räumlich beschreiben', courses: ['GK', 'LK'], goals: ['06de364f'], points: [5, 7], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'line-plane-intersection', title: 'Geradenschnitt mit einer Ebene deuten', courses: ['LK'], goals: ['baf7276f'], points: [6, 4], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'skew-lines-distance', title: 'Abstand windschiefer Geraden bestimmen', courses: ['LK'], goals: ['509ae03b'], points: [4, 6], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'parallel-planes-distance', title: 'Gerade–Ebene- und Ebene–Ebene-Abstände bestimmen', courses: ['GK', 'LK'], goals: ['8eb14d81'], points: [5, 5], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'geometry-software', title: 'Quader mit Geometriesoftware aus zwei Ansichten prüfen', courses: ['GK', 'LK'], goals: ['eb6bfdd9'], points: [4, 6], strands: ['L3'], area: 'LinearAlgebra' },
  { key: 'figure-properties', title: 'Figureneigenschaften mit Winkeln und Ähnlichkeit begründen', courses: ['GK', 'LK'], goals: ['ef1524f1'], points: [4, 5, 3], strands: ['L3'], area: 'Geometry' },
]
const descriptions = {
  'spat-volume': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe das Spatprodukt aus selbst gewählten Kantenvektoren berechnen, sein Vorzeichen deuten und daraus Spat- und Tetraedervolumen begründen.',
  'round-solids': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe Radien und Höhen aus Koordinaten erschließen, die Volumina von Zylinder, Kegel und Kugel bestimmen und die Drittel- bzw. Kubikfaktoren erklären.',
  'volume-derivation-lk': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe die Pyramidenvolumenformel aus ähnlichen Parallelquerschnitten mit einem Integral herleiten und den Drittelfaktor geometrisch deuten.',
  'dot-projection': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe eine orthogonale Vektorprojektion bestimmen und damit die geometrische Bedeutung des Skalarprodukts erklären.',
  'linear-projection': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe eine orthogonale Projektion in Ebenenanteil und senkrechten Rest zerlegen und die Linearität der Zuordnung begründen.',
  'vector-relations': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe lineare Abhängigkeit und Kollinearität rechnerisch sowie geometrisch beurteilen und den Nullvektor richtig einordnen.',
  'plane-coordinates': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe Achsenschnittpunkte, Normalenrichtung und Punktlage aus einer Koordinatenebene zu einer räumlichen Deutung verbinden.',
  'line-plane-intersection': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe den Schnittpunkt einer Geraden mit einer Ebene berechnen, prüfen und geometrisch deuten.',
  'skew-lines-distance': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe den Abstand windschiefer Geraden durch ein analytisches Minimum bestimmen und geometrisch deuten.',
  'parallel-planes-distance': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe Gerade–Ebene- und Ebene–Ebene-Abstände bestimmen und die senkrechte Minimalverbindung begründen.',
  'geometry-software': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe einen Quader in Geometriesoftware darstellen, zwei Ansichten abgeben und Koordinaten und Ausdehnungen darin prüfen.',
  'figure-properties': 'Die lernende Person kann in einer Q2-Prüfungsaufgabe Rechtecks- und Ähnlichkeitseigenschaften anhand von Seiten-, Winkel- und Abbildungsargumenten begründen.',
}
const stepLabels = {
  'spat-volume': ['Kantenvektoren gewählt und Spatprodukt berechnet', 'Vorzeichenwechsel und Volumenbetrag erklärt', 'Spat- und Tetraedervolumen samt Sechstelfaktor begründet'],
  'round-solids': ['Zylindervolumen aus Radius und Höhe erschlossen', 'Kegelvolumen und Drittelvergleich begründet', 'Kugelvolumina und kubischen Radiusfaktor erklärt'],
  'volume-derivation-lk': ['Ähnlichkeit, Querschnittsfläche und Integral bis zur Pyramidenformel hergeleitet'],
  'dot-projection': ['Projektionsvektor und senkrechten Rest bestimmt', 'Skalarprodukt über gerichtete Projektionslänge erklärt'],
  'linear-projection': ['Ebenenanteil und senkrechten Rest angegeben', 'Additivität, Homogenität, Bild und Kern der Projektion begründet'],
  'vector-relations': ['Lineare Abhängigkeit und Unabhängigkeit rechnerisch und geometrisch begründet', 'Kollinearität und Richtung von Nichtnullvektoren geprüft', 'Nullvektor ohne eigene Richtung korrekt eingeordnet'],
  'plane-coordinates': ['Achsenschnittpunkte und Normalenrichtung bestimmt', 'Punktlage geprüft und räumliche Ebene begründet beschrieben'],
  'line-plane-intersection': ['Schnittpunkt berechnet und in beiden Gleichungen geprüft', 'Eindeutigkeit geometrisch begründet und Parameter gedeutet'],
  'skew-lines-distance': ['Windschiefe Lagebeziehung begründet', 'Minimalabstand und nächste Punkte analytisch und geometrisch bestimmt'],
  'parallel-planes-distance': ['Gerade–Ebene-Abstand mit Minimalität bestimmt', 'Ebene–Ebene-Abstand mit Normalenrichtung und Minimalität bestimmt'],
  'geometry-software': ['Softwaremodell und Koordinatenprüfung als Artefakt vorgelegt', 'Zwei Ansichten eingereicht und sichtbare Ausdehnungen begründet'],
  'figure-properties': ['Rechteck- und Nichtquadrat-Eigenschaft begründet', 'Ähnlichkeit und Nichtkongruenz anhand konkreter Abbildung geprüft', 'Ungültigen Viereck-Kongruenzschluss mit Gegenbeispiel widerlegt'],
}

const canonical = read(canonicalPath)
const semantic = read(semanticPath)
const byId = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const semanticById = new Map(semantic.decisions.map((decision) => [decision.goalId, decision]))
assert(byId.size === canonical.goals.length, 'Duplicate canonical goal ID')
assert(semanticById.size === semantic.decisions.length, 'Duplicate semantic-kind decision ID')
const q2Practice = byId.get(q2PracticeId)
assert(q2Practice?.title === 'Übungen Q2', 'Unexpected Q2 practice cluster')
assert(byId.get(areaId)?.contains?.includes(q2PracticeId), 'Q2 cluster is outside expected area')
assert(byId.get(rootId)?.contains?.includes(areaId), 'Q2 area is outside expected root')
const resolveGoal = (prefix) => {
  const matches = canonical.goals.filter((goal) => goal.id.startsWith(prefix))
  assert(matches.length === 1, `Goal prefix ${prefix} is missing or ambiguous`)
  return matches[0]
}
const createdIds = []
const revisedIds = []

for (const spec of specs) {
  const id = stableId(spec.key)
  const covered = spec.goals.map(resolveGoal)
  assert(covered.every((goal) => goal.type === 'atomic' && !goal.examData), `Invalid covered goal for ${spec.key}`)
  assert(covered.every((goal) => spec.courses.some((course) => goal.tags?.includes(course)) || goal.tags?.includes('canonical')), `Course mismatch ${spec.key}`)
  const jurisdictions = covered[0].applicability.jurisdiction.filter((jurisdiction) => covered.every((goal) => goal.applicability.jurisdiction.includes(jurisdiction)))
  assert(jurisdictions.length > 0, `No common jurisdiction ${spec.key}`)
  const maxPoints = spec.points.reduce((sum, points) => sum + points, 0)
  const taskContent = section(spec.key, 'task')
  const solutionContent = section(spec.key, 'solution')
  const sectionHash = createHash('sha256').update(`${taskContent}\n### Lösung\n${solutionContent}`).digest('hex')
  const titleEn = {
    'spat-volume': 'Assess scalar triple product, orientation and tetrahedron volume',
    'round-solids': 'Compare cylinder, cone and sphere volumes',
    'volume-derivation-lk': 'Derive pyramid volume from cross sections (advanced course)',
    'dot-projection': 'Explain the dot product through orthogonal projection',
    'linear-projection': 'Check orthogonal projection as a linear mapping',
    'vector-relations': 'Justify vector dependence and collinearity',
    'plane-coordinates': 'Describe a coordinate plane spatially',
    'line-plane-intersection': 'Interpret a line–plane intersection',
    'skew-lines-distance': 'Determine the distance of skew lines',
    'parallel-planes-distance': 'Determine line–plane and plane–plane distances',
    'geometry-software': 'Check a cuboid with geometry software from two views',
    'figure-properties': 'Justify figure properties through angles and similarity',
  }[spec.key]
  const newGoal = {
    id,
    shortKey: `canonical_math_sek2_q2_m7_route_${spec.key.replaceAll('-', '_')}`,
    title: spec.title,
    titleEn,
    description: descriptions[spec.key],
    descriptionEn: `The learner can independently ${titleEn[0].toLowerCase()}${titleEn.slice(1)} in a Q2 assessment and justify the results.`,
    core: spec.courses.includes('GK'),
    weight: 1,
    tags: [...spec.courses, 'Practice', 'Assessment', 'ExamTask', 'canonical', 'phase:Q2'],
    applicability: { jurisdiction: jurisdictions },
    extendedData: { applicabilityFromRequires: true, applicabilityMappingInheritance: 'boundary' },
    sourceRef: sourcePath,
    dimensionTags: { framework: 'canonical-gymnasium-math', demandLevel: 'AB3', processCompetencies: ['K2.3', 'K3.3'], guidingIdeas: spec.strands, phase: 'Q2', area: spec.area, topicCode: `CANONICAL.MATH.SEK2.Q2.PRACTICE.${spec.key.toUpperCase().replaceAll('-', '_')}` },
    requires: covered.map((goal) => goal.id),
    contains: [],
    examples: [],
    resourceLinks: [],
    examData: {
      reviewStatus: 'released',
      reviewNote: `Machine-only focused content and calculation review, 2026-09-29; source section SHA-256 ${sectionHash}. All scored parts are required because the backend currently enforces only total points; no human review, learner trial or publication claimed.`,
      coveredGoalIds: covered.map((goal) => goal.id),
      coveredStrands: spec.strands,
      demandLevels: ['AB1', 'AB2', 'AB3'],
      sourceArtifactPath: sourcePath,
      taskContent,
      solutionContent,
      scoring: { maxPoints, passingPoints: maxPoints, steps: spec.points.map((points, index) => ({ id: `q2_m7_${spec.key.replaceAll('-', '_')}_${index + 1}`, points, description: stepLabels[spec.key][index] })) },
    },
    phase: 'Q2',
    type: 'atomic',
    nodeKind: 'exam',
  }
  const existing = byId.get(id)
  if (existing) {
    assert(q2Practice.contains.includes(id), `Missing Q2 membership for ${spec.key}`)
    const decision = semanticById.get(id)
    assert(decision?.semanticKind === 'practiceAssessment', `Missing practice semantic kind for ${spec.key}`)
    const goalDiffers = JSON.stringify(existing) !== JSON.stringify(newGoal)
    const decisionDiffers = decision.decisionBasis !== 'reviewed-current-pilot-practice-assessment'
      || decision.sourceFingerprint !== fingerprintSemanticKindSourceGoal(newGoal)
    if (write && (goalDiffers || decisionDiffers)) {
      canonical.goals[canonical.goals.indexOf(existing)] = newGoal
      byId.set(id, newGoal)
      decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(newGoal)
      decision.decisionBasis = 'reviewed-current-pilot-practice-assessment'
      revisedIds.push(id)
    } else {
      assert.deepEqual(existing, newGoal, `Current assessment differs from reviewed source: ${spec.key}`)
    }
    continue
  }
  assert(!semanticById.has(id), `Semantic decision already exists for new assessment ${spec.key}`)
  assert(!q2Practice.contains.includes(id), `Q2 cluster already contains new assessment ${spec.key}`)
  canonical.goals.push(newGoal)
  q2Practice.contains.push(id)
  semantic.decisions.push({ goalId: id, sourceFingerprint: fingerprintSemanticKindSourceGoal(newGoal), semanticKind: 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-practice-assessment' })
  byId.set(id, newGoal)
  createdIds.push(id)
}

if (createdIds.length > 0) {
  for (const id of [q2PracticeId, areaId, rootId]) {
    const goal = byId.get(id)
    goal.weight += createdIds.length
    const decision = semanticById.get(id)
    assert(decision, `Missing semantic decision for ancestor ${id}`)
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
  semantic.counts.practiceAssessment += createdIds.length
  semantic.counts.total += createdIds.length
  semantic.decisions.sort((a, b) => a.goalId.localeCompare(b.goalId))
}

assert(semantic.counts.curricularAtomic === 807, 'Curricular denominator changed')
assert(semantic.counts.total === canonical.goals.length, 'Semantic ledger count differs from graph')
assert(q2Practice.contains.length === q2Practice.weight, 'Q2 practice weight differs from child count')
for (const spec of specs) {
  const id = stableId(spec.key)
  const goal = byId.get(id)
  const semanticDecision = semantic.decisions.find((decision) => decision.goalId === id)
  assert(semanticDecision?.sourceFingerprint === fingerprintSemanticKindSourceGoal(goal), `Stale semantic binding ${spec.key}`)
  assert(goal.requires.every((requiredId) => goal.examData.coveredGoalIds.includes(requiredId)), `Unexamined direct prerequisite ${spec.key}`)
  assert(goal.examData.scoring.steps.reduce((sum, step) => sum + step.points, 0) === goal.examData.scoring.maxPoints, `Point mismatch ${spec.key}`)
}
if (write && (createdIds.length > 0 || revisedIds.length > 0)) {
  writeFileSync(resolve(root, canonicalPath), serialize(canonical))
  writeFileSync(resolve(root, semanticPath), serialize(semantic))
}
console.log(JSON.stringify({ status: write ? 'written' : 'checked', sourceHash, assessmentCount: specs.length, createdCount: createdIds.length, revisedCount: revisedIds.length, changedGoalIds: [...createdIds, ...revisedIds], curricularAtomic: semantic.counts.curricularAtomic, practiceAssessment: semantic.counts.practiceAssessment }))
