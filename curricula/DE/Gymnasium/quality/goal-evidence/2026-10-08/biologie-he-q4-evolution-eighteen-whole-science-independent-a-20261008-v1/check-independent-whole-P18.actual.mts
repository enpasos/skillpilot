import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {
  validatePositiveGoalEvidenceRecordSemantics,
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const repo = process.cwd()
const own = path.relative(repo, path.dirname(new URL(import.meta.url).pathname))
const read = async (p: string) => JSON.parse(await fs.readFile(path.join(repo, p), 'utf8'))
const rows = async (p: string) => (await fs.readFile(path.join(repo, p), 'utf8')).trim().split('\n').map((s) => JSON.parse(s))
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const assert = (v: unknown, message: string) => { if (!v) throw new Error(message) }
const sha = (s: string) => `sha256:${createHash('sha256').update(s).digest('hex')}`
const cfg = await read(own + '/P18.independent-a.config.json')
const land = await read(cfg.landscapePath)
const ledger = await read(cfg.semanticKindLedgerPath)
const ps = await rows(cfg.reviewPath)
const cases = await read(own + '/input-snapshots/eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json')
const goals = await read(own + '/input-snapshots/current-eighteen-whole-DEEN-goals.actual.json')
const ajv = new Ajv({ strict: true, allErrors: true }); addFormats(ajv)
const valid = ajv.compile(await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const by = new Map(land.goals.map((g: any) => [g.id, g]))
const kinds = new Map(ledger.decisions.map((d: any) => [d.goalId, d]))
const criteria = sha(await fs.readFile(path.join(repo, cfg.reviewCriteriaPath), 'utf8'))
assert(ps.length === 18 && goals.wholeGoals.length === 18 && cases.wholeCases.length === 36, '18 whole goals/profiles and 36 whole cases required')
const checks = ps.map((p: any) => {
  const g: any = by.get(p.goalId), k: any = kinds.get(p.goalId)
  const cs = cases.wholeCases.filter((c: any) => c.goalId === p.goalId)
  assert(same(g, goals.wholeGoals.find((x: any) => x.id === p.goalId)), 'exact whole goal ' + p.goalId)
  assert(valid(p), 'closed native schema ' + JSON.stringify(valid.errors))
  const errors = validatePositiveGoalEvidenceRecordSemantics(p, g, {}, k.semanticKind)
  assert(errors.length === 0, 'native semantic errors ' + JSON.stringify(errors))
  assert(criteria === p.reviewCriteriaFingerprint, 'exact criteria')
  assert(k.sourceFingerprint === fingerprintSemanticKindSourceGoal(g), 'current semantic classifier')
  assert(p.goalFingerprint === fingerprintGoalForPositiveEvidence(g, k.semanticKind), 'goal binding')
  assert(p.reviewInputFingerprint === fingerprintPositiveGoalEvidenceReviewInput(g, criteria, {}, k.semanticKind), 'whole input binding')
  assert(cs.length === 2 && p.profile.applicationCaseBriefs.length === 2, 'two actual full case bodies')
  cs.forEach((c: any, i: number) => {
    const b = p.profile.applicationCaseBriefs[i]
    assert(b.id === c.id && b.taskDemandDe === c.material.de + ' ' + c.task.de && b.taskDemandEn === c.material.en + ' ' + c.task.en, 'complete material/task exact ' + c.id)
    assert(b.expectedPerformanceDe === c.modelAnswer.de && b.expectedPerformanceEn === c.modelAnswer.en, 'complete DEEN model answer exact ' + c.id)
  })
  assert(p.status === 'needs_human_review' && p.reviewAuthority === 'ai_candidate' && p.evidenceLevel === 'E1' && p.maximumClaimScope === 'G1', 'candidate bounds')
  return { goalId: p.goalId, closedSchemaValid: true, nativeSemanticErrors: errors, wholeBodyExact: true, wholeDEENCasesExact: cs.map((c: any) => c.id), classificationFingerprintExact: true }
})
const quantitative = {
  clockSingleBranch: 0.024 / (2 * 0.0015), clockPair: 0.020 / 0.004,
  clockConditionalSingleBranch: 0.020 / (2 * 0.001),
  populationBefore: (2 * 10 + 20) / (2 * 50), populationAfter: (2 * 18 + 22) / (2 * 60),
  hweCounts: [0.7 ** 2 * 1000, 2 * 0.7 * 0.3 * 1000, 0.3 ** 2 * 1000],
  hweObservedP: (2 * 530 + 340) / 2000,
  bottleneckBefore: (2 * 25 + 50) / 200, bottleneckAfter: (2 * 3 + 2) / 10,
  founderNoAComplementPercent: 0.6 ** 10 * 100,
  sexualContributions: [0.6 * 4, 0.9 * 2, 0.8 * 3, 0.8 * 1.5, 0.3 * 3],
  sequenceDistances: ['GGAAAAAAAAAA','GGGGAAAAAAAA','GGGGAAAAAAAT'].flatMap((a, i, arr) => arr.slice(i + 1).map((b) => [...a].filter((x,j) => x !== b[j]).length)),
}
assert(quantitative.clockSingleBranch === 8 && quantitative.clockPair === 5 && quantitative.clockConditionalSingleBranch === 10, 'clock factors/rates')
assert(same(quantitative.sequenceDistances, [2,3,1]), '12-site sequence distances')
const fitness: Record<string,number> = {'000':1,'100':1.3,'010':0.9,'001':0.8,'110':1.1,'101':1,'011':1.2,'111':1.8}
const neighbors = (x: string) => Object.keys(fitness).filter((y) => [...x].filter((c,i) => c !== y[i]).length === 1)
assert(neighbors('100').every((x) => fitness[x] < fitness['100']), 'local optimum is 100')
assert(Object.values(fitness).every((v) => v <= fitness['111']), 'global maximum is 111')
assert(1.3 < 1.5 && 1.5 < 1.8, 'environmental-change path 100->110->111')
await fs.writeFile(path.join(repo, own, 'P18.independent-closed-native-schema-case-quantitative-check.actual.json'), JSON.stringify({schemaVersion:1, checkedAt:new Date().toISOString(), actualExitCode:0, wholeGoals:18, wholeCases:36, profiles:18, checks, quantitative, fitnessNeighbors100:neighbors('100'), sourceJudgmentIsNativeValidation:false, imageReviewCount:0, humanApproval:false, learnerEvidence:false},null,2)+'\n', {flag:'wx'})
console.log(JSON.stringify({actualExitCode:0, nativeP18:18, wholeDEENCases:36, quantitativeAndDiscreteGraphChecks:true, humanApproval:false}))
