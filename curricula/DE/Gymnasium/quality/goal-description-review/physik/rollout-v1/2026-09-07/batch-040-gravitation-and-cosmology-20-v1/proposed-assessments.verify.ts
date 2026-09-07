import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { findExamMarkdownTableIssues } from '../../../../../../../../../app/scripts/lib/examMarkdownValidation'
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/'
const proposalPath = base + 'proposed-assessments.authoring.json'
const proposalBytes = readFileSync(proposalPath), proposal = JSON.parse(proposalBytes.toString())
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const close = (a: number, b: number, relative = 1e-12) => assert.ok(Math.abs(a - b) <= relative * Math.max(Math.abs(a), Math.abs(b), 1e-20), a + ' != ' + b)
assert.equal(proposal.exams.length, 2)
assert.equal(proposal.status, 'authoring_proposal_not_applied')
const scoreResults: any[] = []
for (const exam of proposal.exams) {
  const patch = exam.proposedGoalPatch, data = patch.examData
  assert.equal(data.reviewStatus, 'needs_review'); assert.deepEqual(patch.requires, data.coveredGoalIds)
  assert.equal(new Set(patch.requires).size, 3); assert.deepEqual(patch.applicability.jurisdiction, ['DE-HE'])
  assert.equal(data.scoring.maxPoints, 30); assert.equal(data.scoring.passingPoints, 18)
  assert.equal(data.scoring.steps.reduce((sum: number, step: any) => sum + step.points, 0), 30)
  assert.equal(exam.tasks.reduce((sum: number, task: any) => sum + task.points, 0), 30)
  assert.equal(new Set(data.scoring.steps.map((step: any) => step.id)).size, data.scoring.steps.length)
  assert.deepEqual(data.scoring.steps, exam.rubric.map((r: any) => ({ id: r.id, points: r.points, description: r.descriptionDe })))
  for (const field of ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn']) {
    assert.ok(data[field].length > 500)
    assert.deepEqual(findExamMarkdownTableIssues(data[field]), [], field)
  }
  for (const coverage of exam.coverage) {
    assert.ok(coverage.goal.tags.includes('GK')); assert.ok(coverage.goal.applicability.jurisdiction.includes('DE-HE'))
    assert.deepEqual(coverage.tasks, exam.tasks.filter((task: any) => task.assessedGoalId === coverage.goal.id).map((task: any) => task.id))
    assert.equal(coverage.points, exam.rubric.filter((r: any) => r.goalId === coverage.goal.id).reduce((sum: number, r: any) => sum + r.points, 0))
    assert.equal(exam.tasks.filter((t: any) => t.assessedGoalId === coverage.goal.id).reduce((sum: number, t: any) => sum + t.points, 0), coverage.points)
  }
  scoreResults.push({ goalId: exam.goalId, total: 30, pass: 18, goalPoints: exam.coverage.map((item: any) => ({ goalId: item.goal.id, points: item.points })), demandPoints: ['AB1', 'AB2', 'AB3'].map(level => ({ level, points: exam.rubric.filter((r: any) => r.demandLevel === level).reduce((sum: number, r: any) => sum + r.points, 0) })) })
}
for (const lang of ['de', 'en']) assert.deepEqual(findExamMarkdownTableIssues(readFileSync(base + 'proposed-assessments.' + lang + '.md', 'utf8')), [])
const a = proposal.exams[0], b = proposal.exams[1]
const aMaterial = a.materials[0].contentEn
const planetAxis = Number(aMaterial.match(/\| P \|[^\n]*?\| (\d+\.\d+) AU \|/)[1])
const cometAxis = Number(aMaterial.match(/\| K \|[^\n]*?\| (\d+\.\d+) AU \|/)[1])
const earthAxis = Number(aMaterial.match(/a_E=(\d+\.\d+) AU/)[1])
const earthPeriod = Number(aMaterial.match(/T_E=(\d+\.\d+) year/)[1])
const planetPeriod = earthPeriod * (planetAxis / earthAxis) ** 1.5
const cometPeriod = earthPeriod * (cometAxis / earthAxis) ** 1.5
close(planetPeriod, 8); close(cometPeriod, 27)
close(planetPeriod ** 2 / planetAxis ** 3, earthPeriod ** 2 / earthAxis ** 3)
close(cometPeriod ** 2 / cometAxis ** 3, earthPeriod ** 2 / earthAxis ** 3)
assert.ok(a.tasks[1].solutionEn.includes('8.00 years') && a.tasks[1].solutionEn.includes('27.0 years'))
const accelerationMaterial = a.materials[1].contentEn
const accelerations = ['N', 'C', 'F'].map(position => Number(accelerationMaterial.match(new RegExp('\\| ' + position + ' \\| (\\d+\\.\\d+) · 10\\^−5'))[1]) * 1e-5)
const differences = [accelerations[0] - accelerations[1], accelerations[2] - accelerations[1]]
close(differences[0], 1.1e-6); close(differences[1], -1.1e-6)
assert.ok(accelerations.every(value => value > 0)); assert.ok(accelerations[0] > accelerations[1] && accelerations[1] > accelerations[2])
const moonGM = 4.90e12, centerDistance = 3.84e8, earthRadius = 6.37e6
const plausible = [centerDistance - earthRadius, centerDistance, centerDistance + earthRadius].map(r => moonGM / r ** 2)
for (let i = 0; i < 3; i++) close(accelerations[i], plausible[i], .01)
const spectralMaterial = b.materials[1].contentEn
const rows = ['Rest', 'A', 'B', 'C'].map(label => { const match = spectralMaterial.match(new RegExp('\\| ' + label + ' \\| (\\d+) \\| (\\d+) \\|')); assert.ok(match); return [Number(match[1]), Number(match[2])] })
const factors = rows.slice(1).map(row => { const f1 = row[0] / rows[0][0], f2 = row[1] / rows[0][1]; close(f1, f2); return f1 })
assert.deepEqual(factors, [1.01, 1.03, 1.06]); assert.ok(factors.every(factor => factor > 1))
assert.ok(b.tasks[1].solutionEn.includes('most strongly for C'))
const age = Number(b.materials[2].contentEn.match(/about (\d+\.\d+) billion years/)[1])
const radius = Number(b.materials[2].contentEn.match(/approximately (\d+) billion light-years/)[1])
close(age, 13.8); close(radius, 46); close(2 * radius, 92); close(radius / age, 10 / 3)
assert.ok(b.tasks[2].solutionEn.includes('3.33') && b.tasks[2].solutionEn.includes('92 billion light-years'))
const route = JSON.parse(readFileSync(base + 'proposed-assessments.route-diff.json', 'utf8'))
for (const exam of proposal.exams) {
  const entry = route.targetAssessmentBeforeAfter.find((row: any) => row.goalId === exam.goalId)
  assert.deepEqual(entry.proposedRequires, exam.proposedGoalPatch.requires)
  assert.deepEqual(entry.proposedCoveredGoalIds, exam.proposedGoalPatch.examData.coveredGoalIds)
}
const report = {
  schemaVersion: 1, artifactType: 'physics-b040-proposed-assessments-author-checks-v1', observedAt: new Date().toISOString(),
  authority: { provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', status: 'author_side_checks_not_human_release', actualLearnerTrial: false },
  proposalBinding: { path: proposalPath, sha256: sha(proposalBytes) },
  scopeAndRaster: scoreResults,
  mathematicalChecks: [
    { taskId: 'A1', status: 'checked', method: 'Individually read structure, roles, bounded example and model caveat in both languages. Orbit focus is fully scored only under Kepler, avoiding duplicated focus points.' },
    { taskId: 'A2', status: 'pass', inputExtractedFromActualEnglishMaterial: { earthAxisAU: earthAxis, earthPeriodYears: earthPeriod, planetAxisAU: planetAxis, cometAxisAU: cometAxis }, computedPeriodYears: [planetPeriod, cometPeriod], method: 'Both Kepler-ratio equations recalculated; T²/a³ equality checked; length ratio dimensionless, period retains years. Equal-area speed reasoning and same-central-mass condition individually checked in DE/EN. No energy/angular-momentum derivation added.' },
    { taskId: 'A3', status: 'pass', inputAccelerations: accelerations, relativeAccelerations: differences, unit: 'm/s²', independentPlausibilityModel: { moonGM, centerDistance, earthRadius, predictedAccelerations: plausible, tolerance: 'within 1%; synthetic rounded values, not a precision ephemeris' }, method: 'Actual table numbers read and subtracted. All absolute attractions remain toward Moon, while relative far-side acceleration points away from center. Sun/Moon tidal gradients, not absolute attractions, reinforce or partly counteract. Two local-coast model limits individually reviewed.' },
    { taskId: 'B1', status: 'checked', method: 'Hierarchy and contrasting galaxy versus stellar-system meanings independently assessed. Andromeda is not nested in the Milky Way. No galaxy-group, telescope-selection or mass/luminosity-unit competence claimed.' },
    { taskId: 'B2', status: 'pass', inputSpectralRowsNm: rows, commonStretchFactors: factors, method: 'Both line ratios coincide per synthetic spectrum and increase from A through C. Computing these ratios here is an author consistency check, not a required learner z calculation. Thermal CMB at approximately 2.725 K, early hot/dense phase, expansion/cooling, and limited evidential claim checked bilingually against cited NASA science. Not an all-galaxies/local-Doppler or central-explosion claim.' },
    { taskId: 'B3', status: 'pass', input: { ageBillionYears: age, presentObservableRadiusBillionLightYears: radius }, results: { diameterBillionLightYears: 2 * radius, staticLightTravelProductBillionLightYears: age, dimensionlessComparison: radius / age }, method: 'Arithmetic recomputed from actual material. Time, length and present model distance distinguished; supplied radius is not derived from c times age. Observable region not identified with total extent. No Hubble-age or expansion-equation procedure required.' },
  ],
  bilingualReview: 'Every DE/EN material, demand, expected solution and rubric item authored and checked for the same quantities, domains, direction, conditions and scope. No model or human diversity claim.',
  nativeReadOnlyChecks: { examMarkdownTables: 'pass for all four native exam content fields and both compiled documents', requiresEqualsCoveredGoalIds: 'pass, exactly three per exam', profileTags: 'all six current/proposed assessed goals include GK; no LK-only target is silently assessed', sourceApplicability: 'HE supported by every assessed goal; broader visibility is held for later review', routeAuditCoverageEquality: 'pass' },
  limits: ['Sixty minutes per assessment is a workload estimate, not learner-calibrated timing.', '18/30 is the retained proposal threshold, not an official grading rule and not automatic mastery of every listed goal.', 'The native aggregate M6/CQR status is not regenerated or claimed green. Structural route losses in the separate counterfactual remain adoption blockers.', 'The existing 47 other assessment texts are inventory, not freshly approved here; only the seven Q4 and two specifically relevant Q3 texts were read in full for the described semantic boundary.'],
}
const reportBytes = JSON.stringify(report, null, 2) + '\n'
if (!process.argv.includes('--emit')) { process.stdout.write(JSON.stringify({ status: 'pass', observedAt: report.observedAt, proposalSha256: sha(proposalBytes), scoreResults, checkedTasks: 6, nativeTableIssues: 0 }, null, 2)); process.exit(0) }
const outputPath = base + 'proposed-assessments.author-check.json'; assert.equal(existsSync(outputPath), false)
assert.deepEqual(readFileSync(proposalPath), proposalBytes)
const patch = '*** Begin Patch\n*** Add File: ' + outputPath + '\n' + reportBytes.trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
process.stdout.write(JSON.stringify({ patch, summary: { status: 'pass', observedAt: report.observedAt, sha256: sha(reportBytes), checkedTasks: 6 } }))
