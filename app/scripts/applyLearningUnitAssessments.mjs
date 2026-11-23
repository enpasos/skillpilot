// SPDX-License-Identifier: Apache-2.0
// Places the assessments of learning units in a canonical landscape and binds their reviewed
// coverage (unit validity rule R2).
//
// Each assessment text lives in a source file. This tool derives everything else from it and
// from the unit declarations below: the assessment goal with its ID, its place in a practice
// cluster, the semantic-kind decision, and the unit with its ownership and coverage reviews.
// An assessment that a unit no longer owns keeps its ID and stays in the catalog.
//
// Usage (from app/): node --import tsx scripts/applyLearningUnitAssessments.mjs [--write]
// Without --write the tool checks that the committed files equal what it would write.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import { assessmentReviewRevisions } from './lib/learningUnitContracts.ts'
import { assertLearningUnitAssessmentReview, readLearningUnitAssessmentSource } from './lib/learningUnitAssessmentSource.ts'

const root = resolve(import.meta.dirname, '../..')
const assessments = 'curricula/DE/Gymnasium/assessments'
const reviews = 'curricula/DE/Gymnasium/quality/learning-units'
const hesseChildReview = 'docs/concept/skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/unabhaengiges-fachreview.md'
const machineReview = (date, hash, reviewPath, scoring) => {
  const scoringNote = scoring.passingPoints < scoring.maxPoints
    ? 'The rubric describes how each part earns points. The backend enforces the reviewed total passing score.'
    : 'Every rubric step is required because the backend enforces only total points; the grading note inside the sample solution says what costs no points.'
  return `Machine-only content, calculation and unit coverage review, ${date}; source section SHA-256 ${hash}. ${scoringNote} Review record: ${reviewPath}. No human review, learner trial or publication claimed.`
}

// One entry per canonical landscape. A unit lists its own ordinary goals and its assessments; an
// assessment names its source section, the goals it requires directly and the goals it covers.
// Process competencies and guiding ideas come from the covered goals unless the assessment states them.
const landscapes = [{
  canonicalPath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticPath: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  idNamespace: 'DE-GYM-CANONICAL-MATH',
  framework: 'canonical-gymnasium-math',
  curricularAtomicCount: 807,
  units: [{
    id: 'math-dot-product-projection',
    revision: '2026-11-13-v2',
    label: 'Skalarprodukt über orthogonale Projektion deuten',
    labelEn: 'Interpreting the dot product through orthogonal projection',
    promise: 'Ich kann einen Vektor orthogonal auf die Richtung eines anderen Vektors projizieren und damit die Definition des Skalarprodukts geometrisch veranschaulichen und fachsprachlich erläutern. So wird aus einer Rechenvorschrift eine anschauliche Größe, auf die Projektionen als lineare Abbildungen aufbauen.',
    promiseEn: 'I can project a vector orthogonally onto the direction of another vector and use this to illustrate the definition of the dot product geometrically and explain it in mathematical language. This turns a calculation rule into a quantity with a geometric meaning, on which projections as linear maps build.',
    ownGoalIds: ['3016ec37-1c2e-47db-83f5-e767923bc97e'],
    reviewPath: `${reviews}/math-dot-product-projection-2026-11-13.md`,
    reviewDate: '2026-11-13',
    sourcePath: `${assessments}/mathematik/sekii/q2/dot-projection-signed-20261113-v1/tasks.md`,
    assessments: [{
      sectionKey: 'dot-projection-signed',
      shortKey: 'canonical_math_sek2_q2_unit_dot_projection_signed',
      stepIdPrefix: 'q2_unit_dot_projection_signed',
      title: 'Skalarprodukt über die orthogonale Projektion begründen',
      titleEn: 'Justify the dot product through orthogonal projection',
      description: 'Die lernende Person kann in einer Q2-Prüfungsaufgabe die orthogonale Projektion eines Vektors auf eine beliebige Richtung bestimmen, daraus die geometrische Bedeutung des Skalarprodukts einschließlich seines Vorzeichens herleiten und fachsprachlich begründen.',
      descriptionEn: 'The learner can, in a Q2 assessment, determine the orthogonal projection of a vector onto an arbitrary direction, derive from it the geometric meaning of the dot product including its sign, and justify it in mathematical language.',
      tags: ['GK', 'LK', 'Practice', 'Assessment', 'ExamTask', 'canonical', 'phase:Q2'],
      phase: 'Q2',
      area: 'LinearAlgebra',
      topicCode: 'CANONICAL.MATH.SEK2.Q2.UNIT.DOT_PROJECTION_SIGNED',
      practiceClusterId: '14b19ee4-364e-50bd-b6a3-499471356ef3',
      requires: ['3016ec37-1c2e-47db-83f5-e767923bc97e'],
      coveredGoalIds: ['3016ec37-1c2e-47db-83f5-e767923bc97e'],
    }],
  }, {
    id: 'math-natural-numbers',
    revision: '2026-11-20-v2',
    label: 'Natürliche Zahlen verstehen und darstellen',
    labelEn: 'Understanding and representing natural numbers',
    promise: 'Ich kann natürliche Zahlen in Ziffern und Worten schreiben, am Zahlenstrahl verorten, vergleichen und sinnvoll runden. Ich kann erklären, wie das Stellenwertsystem aufgebaut ist, und begründen, warum es keine größte natürliche Zahl gibt. So kann ich große Zahlen aus Tabellen und Texten sicher einordnen; darauf bauen das Rechnen mit natürlichen Zahlen, die ganzen Zahlen und die Brüche auf.',
    promiseEn: 'I can write natural numbers in digits and in words, locate them on the number line, compare them and round them sensibly. I can explain how the place-value system is built and justify why there is no largest natural number. This lets me judge large numbers from tables and texts with confidence; calculating with natural numbers, the integers and fractions build on it.',
    ownGoalIds: ['cf474eab-1379-4877-907e-58b0892ce734', '9ef6c4fa-b97a-5d7a-86c1-96690f02d916', '624764d6-becd-5f9b-ada3-0d4f9d143073',
      'fe07241a-b779-5f35-a82d-7aa51ae74f42', '1a25ef44-f310-4c23-9ba8-44baec60d3b0'],
    reviewPath: `${reviews}/math-natural-numbers-2026-11-20-v2.md`,
    reviewDate: '2026-11-20',
    reviewFormat: 'source-bindings-v2',
    assessments: [{
      sectionKey: 'natural-numbers-order',
      sourcePath: `${assessments}/mathematik/seki/j5/natural-numbers-order-20261120-v2/tasks.md`,
      shortKey: 'canonical_math_sek1_j5_unit_natural_numbers_order',
      stepIdPrefix: 'j5_unit_natural_numbers_order',
      title: 'Natürliche Zahlen darstellen, am Zahlenstrahl verorten und ordnen',
      titleEn: 'Represent natural numbers, locate them on the number line and order them',
      description: 'Die lernende Person kann in einer Prüfungsaufgabe der Jahrgangsstufe 5 natürliche Zahlen in Ziffern und Worten darstellen, begründet vergleichen und ordnen sowie ihre Lage am Zahlenstrahl aus der Skalierung bestimmen und begründen.',
      descriptionEn: 'The learner can, in a grade 5 assessment, represent natural numbers in digits and in words, compare and order them with reasons, and determine and justify their position on the number line from its scale.',
      tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'phase:SekI', 'ExamTask'],
      phase: 'J5',
      area: 'Arithmetic',
      topicCode: 'CANONICAL.MATH.SEK1.J5.UNIT.NATURAL_NUMBERS_ORDER',
      practiceClusterId: '81c8da58-9258-488e-9ab8-48500ab31652',
      requires: ['9ef6c4fa-b97a-5d7a-86c1-96690f02d916'],
      coveredGoalIds: ['cf474eab-1379-4877-907e-58b0892ce734', '9ef6c4fa-b97a-5d7a-86c1-96690f02d916'],
    }, {
      sectionKey: 'natural-numbers-place-value',
      sourcePath: `${assessments}/mathematik/seki/j5/natural-numbers-place-value-20261120-v2/tasks.md`,
      shortKey: 'canonical_math_sek1_j5_unit_natural_numbers_place_value',
      stepIdPrefix: 'j5_unit_natural_numbers_place_value',
      title: 'Stellenwertsystem erklären, runden und Unbegrenztheit begründen',
      titleEn: 'Explain the place-value system, round, and justify that the natural numbers are unbounded',
      description: 'Die lernende Person kann in einer Prüfungsaufgabe der Jahrgangsstufe 5 natürliche Zahlen in Stellenwerte zerlegen, das Dezimalsystem mit einem gegebenen anderen Stellenwertsystem vergleichen, Zahlen sachgerecht runden und die Näherung deuten sowie mit dem Nachfolgerprinzip begründen, dass es keine größte natürliche Zahl gibt.',
      descriptionEn: 'The learner can, in a grade 5 assessment, decompose natural numbers into place values, compare the decimal system with a given other place-value system, round numbers to suit the context and interpret the approximation, and justify with the successor principle that there is no largest natural number.',
      tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical', 'phase:SekI', 'ExamTask'],
      phase: 'J5',
      area: 'Arithmetic',
      topicCode: 'CANONICAL.MATH.SEK1.J5.UNIT.NATURAL_NUMBERS_PLACE_VALUE',
      practiceClusterId: '81c8da58-9258-488e-9ab8-48500ab31652',
      requires: ['fe07241a-b779-5f35-a82d-7aa51ae74f42', '1a25ef44-f310-4c23-9ba8-44baec60d3b0'],
      coveredGoalIds: ['624764d6-becd-5f9b-ada3-0d4f9d143073', 'fe07241a-b779-5f35-a82d-7aa51ae74f42', '1a25ef44-f310-4c23-9ba8-44baec60d3b0'],
    }],
  }],
}, {
  canonicalPath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticPath: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  idNamespace: 'DE-GYM-CANONICAL-PHYSICS',
  framework: 'canonical-gymnasium-physics',
  // Three reviewed semiconductor atoms and four K3/K6 ordinary goals are current.
  curricularAtomicCount: 490,
  // Physics cluster weights are authored workload weights, not counts of atomic descendants,
  // and Physics marks an assessment by its exam data alone; the projection adds the node kind.
  countedClusterWeights: false,
  examNodeKind: false,
  units: [{
    id: 'physics-constant-acceleration',
    // E.1 cut accepted by the Product Owner on 23 Nov 2026: this unit is child unit 2,
    // "Freier Fall schwerer Kugeln". The vertical-throw assessments credit the narrowed
    // modelling goal and close child unit 3, so they and that goal left the unit. The new
    // goals of child unit 2 join it once a reviewed own assessment covers them (R2).
    revision: '2026-11-23-v4',
    label: 'Freier Fall schwerer Kugeln',
    labelEn: 'Free fall of heavy balls',
    promise: 'Ich kann den freien Fall einer schweren Kugel messen und als gleichmäßig beschleunigte Bewegung beschreiben: Ich halte Fallhöhe und Fallzeit in einem Messprotokoll fest, stelle die Bewegung im t-v-Diagramm dar, bestimme die Beschleunigung und stelle Zeit-Ort- und Zeit-Geschwindigkeits-Gesetz auf. Ich gebe an, wie genau meine Messwerte sind. Darauf bauen der Fall leichter Körper, Würfe in zwei Dimensionen, Kräfte und Energie auf.',
    promiseEn: 'I can measure the free fall of a heavy ball and describe it as uniformly accelerated motion: I record drop height and fall time in a measurement log, represent the motion in a time-velocity graph, determine the acceleration and set up the time-position and time-velocity laws. I state how precise my measurements are. The fall of light bodies, projectile motion in two dimensions, forces and energy build on it.',
    ownGoalIds: ['e4b38061-1f28-43ad-8371-a3e7c0e81856'],
    ownOrientationGoalIds: ['b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e'],
    reviewPath: `${reviews}/physics-constant-acceleration-2026-11-15-v2.md`,
    reviewDate: '2026-11-15',
    assessments: [{
      // This full, independently content-reviewed current assessment already
      // exists in the K3/K6 stream. Bind its exact task/rubric; never regenerate
      // its content from a second copy or transfer a historical learner result.
      existingGoalId: 'a8dc0290-9f80-5763-8943-e16b8d2aa860',
      coveredGoalIds: ['e4b38061-1f28-43ad-8371-a3e7c0e81856'],
      taskRevision: 'sha256:8a5ccaa3f596ace70e6a4dad6f644a2ddaa046be5f2c598a012a1ff40d9b17ef',
      rubricRevision: 'sha256:62bf8143588daa963566318ada486cc4a189906d6a6b92d2e428ec8fe5383163',
    }, {
      existingGoalId: 'f13ca187-b680-5f47-b4ad-76bd474bd8a2',
      coveredGoalIds: ['e4b38061-1f28-43ad-8371-a3e7c0e81856'],
      reviewPath: hesseChildReview,
      taskRevision: 'sha256:e0c8168fd6d8a86ce63012d2bd1241f3a790e39bbbffea6710d7c137c8d24cdd',
      rubricRevision: 'sha256:88da8d12bcb9f7c8cd3761730755307ba6e8a0a0405cb9a522bf5338d9be715f',
    }],
  }],
}]

const write = process.argv.includes('--write')
assert(process.argv.slice(2).every((arg) => arg === '--write'), 'Only --write is supported')
const readText = (path) => readFileSync(resolve(root, path), 'utf8')
const serialize = (value) => JSON.stringify(value, null, 2) + '\n'
const sortedUnion = (lists) => [...new Set(lists.flat())].sort()

const report = []
for (const landscape of landscapes) {
  const canonical = JSON.parse(readText(landscape.canonicalPath))
  const semantic = JSON.parse(readText(landscape.semanticPath))
  const before = { canonical: serialize(canonical), semantic: serialize(semantic) }
  const byId = new Map(canonical.goals.map((goal) => [goal.id, goal]))
  const decisionById = new Map(semantic.decisions.map((decision) => [decision.goalId, decision]))
  assert(byId.size === canonical.goals.length && decisionById.size === semantic.decisions.length, 'Duplicate goal or decision ID')
  const parents = new Map()
  for (const goal of canonical.goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), goal.id])
  const ancestorsOf = (id, found = new Set()) => {
    for (const parent of parents.get(id) ?? []) if (!found.has(parent)) { found.add(parent); ancestorsOf(parent, found) }
    return found
  }
  const ordinary = (id) => {
    const goal = byId.get(id)
    assert(goal?.type === 'atomic' && !goal.examData, `Unexpected ordinary goal ${id}`)
    return goal
  }
  const touchedAncestors = new Set()

  for (const unit of landscape.units) {
    if (unit.reviewFormat !== undefined) assert.equal(unit.reviewFormat, 'source-bindings-v2', `${unit.id}: unknown review format`)
    assert(existsSync(resolve(root, unit.reviewPath)), `Missing review record ${unit.reviewPath}`)
    unit.ownGoalIds.forEach(ordinary)
    const coverageReviews = []
    const assessmentIds = []
    for (const declared of unit.assessments) {
      if (declared.existingGoalId) {
        const assessment = byId.get(declared.existingGoalId)
        assert(assessment?.examData && assessment.type === 'atomic', `${unit.id}: missing existing assessment ${declared.existingGoalId}`)
        assert(assessment.examData.reviewStatus === 'released', `${unit.id}: existing assessment is not released`)
        assert.deepEqual(assessmentReviewRevisions(assessment), {
          taskRevision: declared.taskRevision, rubricRevision: declared.rubricRevision,
        }, `${unit.id}: existing assessment differs from its exact reviewed task/rubric`)
        assert(declared.coveredGoalIds.every((id) => unit.ownGoalIds.includes(id)
          && assessment.examData.coveredGoalIds.includes(id)), `${unit.id}: invalid existing assessment coverage`)
        declared.coveredGoalIds.forEach(ordinary)
        const reference = declared.reviewPath ?? unit.reviewPath
        assert(existsSync(resolve(root, reference)), `Missing review record ${reference}`)
        coverageReviews.push({ assessmentGoalId: assessment.id, goalIds: declared.coveredGoalIds,
          reference, ...assessmentReviewRevisions(assessment) })
        assessmentIds.push(assessment.id)
        report.push({ unitId: unit.id, unitRevision: unit.revision, assessmentId: assessment.id,
          retainedExistingAssessment: true, maxPoints: assessment.examData.scoring.maxPoints,
          passingPoints: assessment.examData.scoring.passingPoints, ...coverageReviews.at(-1) })
        continue
      }
      const hex = createHash('sha1').update(`${landscape.idNamespace}:${declared.shortKey}`).digest('hex')
      const assessmentId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
      const sourcePath = declared.sourcePath ?? unit.sourcePath
      const source = readText(sourcePath)
      const { taskContent, solutionContent, scoring, sectionHash } = readLearningUnitAssessmentSource(source, sourcePath, declared)
      const required = declared.requires.map(ordinary), covered = declared.coveredGoalIds.map(ordinary)
      assert(declared.coveredGoalIds.every((id) => unit.ownGoalIds.includes(id)), `${declared.sectionKey}: covers a goal the unit does not own`)
      const cluster = byId.get(declared.practiceClusterId)
      assert(cluster?.type === 'cluster', `${declared.sectionKey}: unexpected practice cluster`)
      const strands = declared.guidingIdeas ?? sortedUnion(covered.map((goal) => goal.dimensionTags.guidingIdeas))
      const assessment = {
        id: assessmentId,
        shortKey: declared.shortKey,
        title: declared.title,
        titleEn: declared.titleEn,
        description: declared.description,
        descriptionEn: declared.descriptionEn,
        core: true,
        weight: 1,
        tags: declared.tags,
        applicability: { jurisdiction: sortedUnion(required.map((goal) => goal.applicability.jurisdiction)) },
        extendedData: { applicabilityFromRequires: true, applicabilityMappingInheritance: 'boundary' },
        sourceRef: sourcePath,
        dimensionTags: {
          framework: landscape.framework, demandLevel: 'AB3',
          processCompetencies: declared.processCompetencies ?? sortedUnion(covered.map((goal) => goal.dimensionTags.processCompetencies)),
          guidingIdeas: strands,
          phase: declared.phase, area: declared.area, topicCode: declared.topicCode,
        },
        requires: declared.requires,
        contains: [],
        examples: [],
        resourceLinks: [],
        examData: {
          reviewStatus: 'released',
          reviewNote: machineReview(unit.reviewDate, sectionHash, unit.reviewPath, scoring),
          coveredGoalIds: declared.coveredGoalIds,
          coveredStrands: strands,
          demandLevels: ['AB1', 'AB2', 'AB3'],
          sourceArtifactPath: sourcePath,
          taskContent,
          solutionContent,
          scoring,
        },
        phase: declared.phase,
        type: 'atomic',
        ...(landscape.examNodeKind === false ? {} : { nodeKind: 'exam' }),
      }
      const revisions = assessmentReviewRevisions(assessment)
      if (unit.reviewFormat === 'source-bindings-v2') assertLearningUnitAssessmentReview(readText(unit.reviewPath), assessmentId, source, revisions)

      // Catalog: the assessment goal, its cluster membership and the weights of its ancestors.
      const ancestors = [declared.practiceClusterId, ...ancestorsOf(declared.practiceClusterId)]
      const existing = byId.get(assessmentId)
      if (existing) canonical.goals[canonical.goals.indexOf(existing)] = assessment
      else {
        canonical.goals.push(assessment)
        cluster.contains.push(assessmentId)
        if (landscape.countedClusterWeights !== false) for (const id of ancestors) byId.get(id).weight += 1
      }
      byId.set(assessmentId, assessment)
      assert(cluster.contains.includes(assessmentId), `${declared.sectionKey}: not a member of its practice cluster`)
      // A practice cluster applies wherever one of its assessments does; the compiler derives the same union.
      const clusterJurisdictions = cluster.applicability?.jurisdiction
      if (clusterJurisdictions && assessment.applicability.jurisdiction.some((value) => !clusterJurisdictions.includes(value)))
        cluster.applicability.jurisdiction = sortedUnion([clusterJurisdictions, assessment.applicability.jurisdiction])
      ancestors.forEach((id) => touchedAncestors.add(id))

      // Semantic-kind ledger: one decision for the assessment.
      const decision = { goalId: assessmentId, sourceFingerprint: fingerprintSemanticKindSourceGoal(assessment),
        semanticKind: 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-practice-assessment' }
      if (decisionById.has(assessmentId)) Object.assign(decisionById.get(assessmentId), decision)
      else {
        semantic.decisions.push(decision)
        decisionById.set(assessmentId, decision)
        semantic.counts.practiceAssessment += 1
        semantic.counts.total += 1
      }
      coverageReviews.push({ assessmentGoalId: assessmentId, goalIds: declared.coveredGoalIds, reference: unit.reviewPath,
        ...revisions })
      assessmentIds.push(assessmentId)
      report.push({ unitId: unit.id, unitRevision: unit.revision, assessmentId, sourceSectionSha256: sectionHash,
        maxPoints: scoring.maxPoints, passingPoints: scoring.passingPoints, steps: scoring.steps.length, ...coverageReviews.at(-1) })
    }
    const uncovered = unit.ownGoalIds.filter((id) => !coverageReviews.some((review) => review.goalIds.includes(id)))
    assert.deepEqual(uncovered, [], `Unit ${unit.id}: own goals without a reviewed assessment`)

    // Learning unit: it owns its goals and assessments, and carries the reviewed coverage.
    const declaration = { id: unit.id, kind: 'learningUnit', label: unit.label, labelEn: unit.labelEn, promise: unit.promise,
      promiseEn: unit.promiseEn, revision: unit.revision, coverageReviews }
    const at = canonical.programUnits.findIndex((entry) => entry.id === unit.id)
    if (at >= 0) canonical.programUnits[at] = declaration
    else canonical.programUnits.push(declaration)
    const own = [...unit.ownGoalIds, ...assessmentIds, ...(unit.ownOrientationGoalIds ?? [])]
      .map((goalId) => ({ goalId, unitId: unit.id, relation: 'own' }))
    const first = canonical.goalPlacements.findIndex((entry) => entry.unitId === unit.id)
    canonical.goalPlacements = canonical.goalPlacements.filter((entry) => entry.unitId !== unit.id)
    canonical.goalPlacements.splice(first >= 0 ? first : canonical.goalPlacements.length, 0, ...own)
  }

  // Preserve the existing ledger order, also used by the subject generators.
  // Only new or changed assessment decisions and their ancestors are authored here.
  // Ancestors of a placed assessment get their current fingerprint.
  for (const id of touchedAncestors) {
    const ancestor = decisionById.get(id)
    assert(ancestor, `Missing semantic decision for ancestor ${id}`)
    ancestor.sourceFingerprint = fingerprintSemanticKindSourceGoal(byId.get(id))
  }
  assert(semantic.counts.curricularAtomic === landscape.curricularAtomicCount, 'Curricular denominator changed')
  assert(semantic.counts.total === canonical.goals.length, 'Semantic ledger count differs from the catalog')

  const after = { canonical: serialize(canonical), semantic: serialize(semantic) }
  const changed = after.canonical !== before.canonical || after.semantic !== before.semantic
  if (write && changed) {
    writeFileSync(resolve(root, landscape.canonicalPath), after.canonical)
    writeFileSync(resolve(root, landscape.semanticPath), after.semantic)
  } else {
    assert(!changed, `${landscape.canonicalPath} or its semantic ledger differs from the assessment sources; run with --write`)
  }
  report.push({ landscape: landscape.canonicalPath, status: write && changed ? 'written' : 'checked' })
}
console.log(JSON.stringify(report, null, 2))
