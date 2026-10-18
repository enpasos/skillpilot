import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

const R = process.cwd()
const O = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1'
const T = `${O}/benzene-phase-Q1-native-adapter-v1`
const B = `${O}/benzene-phase-Q1-independent-b-v1`
const AUTHOR = `${O}/benzene-phase-Q1-author-proposal-v1/AUTHOR.one-benzene-compatibility-phase.pending.json`
const PLAN = `${T}/PLAN.C1-SEM1-A1-M1-P1.PENDING-root-integration.json`
if (existsSync(PLAN)) throw new Error('Additive candidate plan exists; do not overwrite')
const now = new Date().toISOString()
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (s: string | Buffer) => `sha256:${createHash('sha256').update(s).digest('hex')}`
const pin = (p: string) => ({ path: p, sha256: hash(readFileSync(p)), bytes: readFileSync(p).length })
const write = (p: string, v: unknown) => {
  if (existsSync(p)) throw new Error(`Refuse overwrite ${p}`)
  writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`)
}
const lines = (p: string) => readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean)
const writeLines = (p: string, raw: string[]) => {
  if (existsSync(p)) throw new Error(`Refuse overwrite ${p}`)
  writeFileSync(p, `${raw.join('\n')}\n`)
}
const require = createRequire(resolve(R, 'app/package.json'))
const ts = require('typescript')
const exactStock = (p: string, names: string[]) => {
  const src = readFileSync(p, 'utf8')
  const ast = ts.createSourceFile(p, src, ts.ScriptTarget.Latest, true)
  const declarations = names.map(n => {
    const node = ast.statements.find((x: any) => ts.isFunctionDeclaration(x) && x.name?.text === n)
    if (!node) throw new Error(`Missing actual stock declaration ${n}`)
    return node.getText(ast)
  })
  const code = ts.transpileModule(`${declarations.join('\n')}\nmodule.exports={${names.join(',')}};`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const context = { module: { exports: {} }, createHash }
  vm.runInNewContext(code, context)
  return { functions: context.module.exports as any, source: pin(p),
    exactDeclarations: declarations.map((text, i) => ({ name: names[i], sha256: hash(text) })) }
}
const A = exactStock('app/scripts/semanticAtomicityReview.ts', ['normalizeText', 'stableJson', 'getSemanticPayload', 'fingerprintGoal'])
const M = exactStock('app/scripts/memoryCardReview.ts', ['normalizeText', 'stableJson', 'fingerprintGoal'])
const semStock = await import(pathToFileURL(resolve(R, 'app/scripts/goalBookModel.ts')).href)
const pStock = await import(pathToFileURL(resolve(R, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const pWriter = await import(pathToFileURL(resolve(R, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const pReview = await import(pathToFileURL(resolve(R, 'app/scripts/positiveGoalEvidenceReview.ts')).href)
const stable = (x: unknown) => semStock.stableGoalBookJson(x)
const author = read(AUTHOR)
const sciencePath = `${B}/FIRST.independent-benzene-Q1-phase-science.json`
const science = read(sciencePath)
if (science.decision !== 'ACCEPT_EXACT_PHASE_SUCCESSOR_WITH_COURSE_BOUNDARIES') throw new Error('No own bounded science anchor')
const cPath = author.canonicalInput.path
if (pin(cPath).sha256 !== `sha256:${author.canonicalInput.sha256}`) throw new Error('Normal canonical drift')
const C = read(cPath)
const goalId = author.goalId
const goalIndex = C.goals.findIndex((g: any) => g.id === goalId)
if (stable(C.goals[goalIndex]) !== stable(author.wholeGoalBefore)) throw new Error('Whole goal guard')
const nextGoal = structuredClone(C.goals[goalIndex])
nextGoal.dimensionTags.phase = 'Q1'
if (stable(nextGoal) !== stable(author.wholeGoalCandidate)) throw new Error('Candidate differs from exact author field')
const nextC = structuredClone(C)
nextC.goals[goalIndex] = nextGoal
const candidateC = `${T}/C654.exact-one-phase-candidate.json.snapshot`
write(candidateC, nextC)

const centralPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const central = read(centralPath)
const chem = central.subjects.find((s: any) => s.subject === 'chemie')
const normalSEMPath = chem.semanticKindLedgerPath
const SEM = read(normalSEMPath)
const nextSEM = structuredClone(SEM)
const semIndex = SEM.decisions.findIndex((d: any) => d.goalId === goalId)
const oldKind = SEM.decisions[semIndex]
if (oldKind.semanticKind !== 'curricularAtomic' || oldKind.sourceFingerprint !== semStock.fingerprintSemanticKindSourceGoal(C.goals[goalIndex])) throw new Error('Current SEM guard')
nextSEM.decisions[semIndex].sourceFingerprint = semStock.fingerprintSemanticKindSourceGoal(nextGoal)
// This validation copy points to its actual candidate C. Normal integration keeps normal sourceLandscapePath.
nextSEM.sourceLandscapePath = candidateC
const candidateSEM = `${T}/SEM654.validation-copy-one-current-source-binding.json`
write(candidateSEM, nextSEM)
write(`${T}/SEM1.normal-source-decision.patch.json`, {
  normalSemanticPath: normalSEMPath, pointer: `/decisions/${semIndex}`,
  before: oldKind, after: nextSEM.decisions[semIndex],
  preserveEveryOtherDecisionAndNormalSourceLandscapePath: true,
})

const owner = (paths: string[]) => {
  const matches = paths.flatMap(configPath => {
    const config = read(configPath)
    const raw = lines(config.reviewPath)
    const index = raw.findIndex(x => JSON.parse(x).goalId === goalId)
    return index < 0 ? [] : [{ configPath, config, raw, index, row: JSON.parse(raw[index]) }]
  })
  if (matches.length !== 1) throw new Error('Expected one exact current owner')
  return matches[0]
}
const ao = owner(chem.semanticAtomicityConfigPaths)
const po = owner(chem.positiveEvidenceConfigPaths)
const mc = read(chem.memoryReviewConfigPath)
const mraw = lines(mc.reviewPath)
const mi = mraw.findIndex(x => JSON.parse(x).goalId === goalId)
const mo = JSON.parse(mraw[mi])
if (ao.row.fingerprint !== A.functions.fingerprintGoal(C.goals[goalIndex], ao.config.ruleVersion)
  || mo.fingerprint !== M.functions.fingerprintGoal(C.goals[goalIndex], mc.ruleVersion)) throw new Error('Old A/M owner FP guard')

const rationale = `Targeted actual phase science: ${sciencePath}; ${science.atomicityDecision.rationale}`
const aRow = { ...ao.row, fingerprint: A.functions.fingerprintGoal(nextGoal, ao.config.ruleVersion),
  reviewedAt: now, reviewer: 'Codex B informed bounded phase reviewer; technical current-input candidate, no human approval', reason: rationale }
const aRecord = `${T}/A1.current-phase.machine-candidate.review.jsonl`
writeLines(aRecord, [JSON.stringify(aRow)])
const aResidual = `${T}/A-owner.exact-residual.review.jsonl`
writeLines(aResidual, ao.raw.filter((_, i) => i !== ao.index))
const aResidualCfg = structuredClone(ao.config)
aResidualCfg.reviewPath = aResidual
aResidualCfg.scope.leafGoalIds = ao.config.scope.leafGoalIds.filter((id: string) => id !== goalId)
const aResidualCfgPath = `${T}/A-owner.exact-residual.normal-address.config.json`
write(aResidualCfgPath, aResidualCfg)
const aCfg = structuredClone(ao.config)
aCfg.reviewPath = aRecord
aCfg.scope = { label: 'One exact phase successor with explicit whole-goal atomicity science; no new content or human approval', leafGoalIds: [goalId] }
const aNormalCfg = `${T}/A1.normal-address.PENDING-install.config.json`
write(aNormalCfg, aCfg)
const aValidationCfg = `${T}/A1.validation-candidate.config.json`
write(aValidationCfg, { ...aCfg, landscapePath: candidateC })

const pResidual = `${T}/P-owner.exact-residual.review.jsonl`
writeLines(pResidual, po.raw.filter((_, i) => i !== po.index))
const pResidualCfg = structuredClone(po.config)
pResidualCfg.reviewPath = pResidual
pResidualCfg.scope.goalIds = po.config.scope.goalIds.filter((id: string) => id !== goalId)
const pResidualCfgPath = `${T}/P-owner.exact-residual.normal-address.config.json`
write(pResidualCfgPath, pResidualCfg)
const pRecord = `${T}/P1.current-phase.machine-candidate.review.jsonl`
const pCfg = structuredClone(po.config)
pCfg.reviewPath = pRecord
pCfg.scope = { label: 'One phase successor; whole profile unchanged, actual targeted compatibility science; no final D/human approval', goalIds: [goalId] }
const pNormalCfg = `${T}/P1.normal-address.PENDING-install.config.json`
write(pNormalCfg, pCfg)
const pValidationCfg = `${T}/P1.validation-candidate.config.json`
const pv = { ...pCfg, landscapePath: candidateC, semanticKindLedgerPath: candidateSEM }
write(pValidationCfg, pv)
const candidateSet = {
  schemaVersion: 1 as const, authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
  reviewId: po.config.reviewId, reviewedAt: now,
  reviewer: 'Codex B bounded phase science and additive stock serialization; no human review',
  goals: [{ goalId, reason: `Whole profile remains suitable at earliest supported LK Q1: ${sciencePath}; ${science.wholeGoalAndPAtQ1.rationale}`,
    evidenceLevel: po.row.evidenceLevel, maximumClaimScope: po.row.maximumClaimScope,
    dissent: [...po.row.dissent, 'Purpose-bound Q1 phase successor, pending paired root integration; final native D1 and actual learner/human performance remain open.'],
    profile: po.row.profile }],
}
write(`${T}/P1.actual-whole-profile-candidate-set.json`, candidateSet)
const builtP = await pWriter.buildPositiveGoalEvidenceCandidateRecords({ config: pv, candidateSet })
if (builtP.length !== 1 || stable(builtP[0].profile) !== stable(po.row.profile)
  || builtP[0].profileFingerprint !== po.row.profileFingerprint
  || builtP[0].reviewId !== po.row.reviewId
  || builtP[0].evidenceLevel !== po.row.evidenceLevel
  || builtP[0].maximumClaimScope !== po.row.maximumClaimScope
  || builtP[0].reviewAuthority !== 'ai_candidate' || builtP[0].status !== 'needs_human_review') throw new Error('P preservation failed')
writeLines(pRecord, builtP.map((r: any) => JSON.stringify(r)))
const pResult = pReview.reviewPositiveGoalEvidenceConfig(pValidationCfg)
if (pResult.errors.length) throw new Error(JSON.stringify(pResult.errors))

const newM = { ...mo, fingerprint: M.functions.fingerprintGoal(nextGoal, mc.ruleVersion),
  reviewedAt: now, reviewer: 'Codex B actual bounded whole-goal phase-memory review; AI only', reason: `${science.memoryDecision.rationale} Source: ${sciencePath}` }
const mFile = `${T}/M442.exact441-plus-one-phase-successor.review.jsonl`
writeLines(mFile, mraw.map((s, i) => i === mi ? JSON.stringify(newM) : s))
const mCfg = { ...mc, reviewPath: mFile, reportPath: `${T}/M442.PENDING-normal-after-phase.stock-report.md` }
const mNormalCfg = `${T}/M442.normal-address.PENDING-install.config.json`
write(mNormalCfg, mCfg)
write(`${T}/M1.actual-current-phase-record.json`, newM)
if (newM.status !== mo.status || newM.memoryUseful !== mo.memoryUseful) throw new Error('M classification changed')

const stockFP = {
  A: { before: ao.row.fingerprint, after: aRow.fingerprint },
  M: { before: mo.fingerprint, after: newM.fingerprint },
  P: { goalBefore: po.row.goalFingerprint, goalAfter: builtP[0].goalFingerprint,
    inputBefore: po.row.reviewInputFingerprint, inputAfter: builtP[0].reviewInputFingerprint,
    wholeProfileBeforeAndAfter: po.row.profileFingerprint },
  SEM: { before: oldKind.sourceFingerprint, after: nextSEM.decisions[semIndex].sourceFingerprint },
}
const preserved = {
  AResidualOriginalLinesExact: lines(aResidual).every((s: string, i: number) => s === ao.raw.filter((_, j) => j !== ao.index)[i]),
  PResidualOriginalLinesExact: lines(pResidual).every((s: string, i: number) => s === po.raw.filter((_, j) => j !== po.index)[i]),
  other441MLinesExact: lines(mFile).every((s: string, i: number) => i === mi || s === mraw[i]),
  allOther653WholeGoalsExact: nextC.goals.every((g: any, i: number) => i === goalIndex || stable(g) === stable(C.goals[i])),
  allOther653SemanticDecisionsExact: nextSEM.decisions.every((d: any, i: number) => i === semIndex || stable(d) === stable(SEM.decisions[i])),
  wholePBodyAndEvidenceScopeExact: true, cardMemoryScopeSourceViewsImagesAndAllEdgesUnchanged: true,
}
if (Object.values(preserved).some(x => !x)) throw new Error('Preservation check failed')
const resourceDigests = Object.fromEntries(nextGoal.resourceLinks.filter((x: any) => x.type === 'goal-visualization').map((x: any) => [x.url, hash(readFileSync(`app/public${x.url}`))]))
const plan = {
  artifactType: 'Additive purpose-bound C1/SEM1/A1/M1/P1 technical candidate plan; normal apply and native D remain pending',
  atUTC: now, goalId, authorProposal: pin(AUTHOR), independentBScience: pin(sciencePath), independentBSeal: pin(`${B}/SEAL.independent-FIRST.json`),
  pairedScienceStatus: 'This adapter binds actual sealed B science and the author proposal. Root must bind the separately independent other review before normal application. No current peer judgment was read by this adapter author.',
  inputNormalCanonical: pin(cPath), inputNormalSemanticKinds: pin(normalSEMPath), inputActualRegistry: pin(centralPath),
  canonicalCandidate: pin(candidateC), exactOnlyField: author.oneExactPatch,
  semanticCandidateForValidation: pin(candidateSEM), semanticNormalDecisionPatch: pin(`${T}/SEM1.normal-source-decision.patch.json`),
  A: { oldConfig: pin(ao.configPath), oldNativeFile: pin(ao.config.reviewPath), oldOwnerRows: ao.raw.length,
    exactResidual: pin(aResidual), residualRows: ao.raw.length - 1, exactResidualConfig: pin(aResidualCfgPath),
    newOneRecord: pin(aRecord), newNormalConfig: pin(aNormalCfg), candidateValidationConfig: pin(aValidationCfg),
    keptReviewId: ao.config.reviewId, keptRuleVersion: ao.config.ruleVersion },
  P: { oldConfig: pin(po.configPath), oldNativeFile: pin(po.config.reviewPath), oldOwnerRows: po.raw.length,
    exactResidual: pin(pResidual), residualRows: po.raw.length - 1, exactResidualConfig: pin(pResidualCfgPath),
    newOneRecord: pin(pRecord), newNormalConfig: pin(pNormalCfg), candidateValidationConfig: pin(pValidationCfg),
    keptReviewId: po.config.reviewId, keptCriteriaPath: po.config.reviewCriteriaPath,
    keptCriteriaFingerprint: po.row.reviewCriteriaFingerprint, keptEvidenceLevel: po.row.evidenceLevel,
    keptMaximumClaimScope: po.row.maximumClaimScope, exactFullProfileFingerprint: po.row.profileFingerprint,
    actualStockBuilder: 'buildPositiveGoalEvidenceCandidateRecords', actualStockPValidation: { errors: pResult.errors, counts: pResult.counts } },
  M: { oldConfig: pin(chem.memoryReviewConfigPath), oldNativeFile: pin(mc.reviewPath),
    full442OneRowSuccessor: pin(mFile), newNormalConfig: pin(mNormalCfg), exactOneRecord: pin(`${T}/M1.actual-current-phase-record.json`),
    unchangedCardReviewPath: mc.cardReviewPath, unchangedVisibilityScopes: mc.visibilityScopes.length,
    status: newM.status, memoryUseful: newM.memoryUseful, other441RowsByteExact: true },
  stockFP, actualUnchangedAssetDigests: resourceDigests, preserved,
  intendedRegistryFieldPatches: {
    semanticAtomicityConfigPaths: { replaceExactOldOwnerPath: ao.configPath, withResidualConfig: aResidualCfgPath, appendOne: aNormalCfg,
      expectedBeforeCount: chem.semanticAtomicityConfigPaths.length, expectedAfterCount: chem.semanticAtomicityConfigPaths.length + 1 },
    positiveEvidenceConfigPaths: { replaceExactOldOwnerPath: po.configPath, withResidualConfig: pResidualCfgPath, appendOne: pNormalCfg,
      expectedBeforeCount: chem.positiveEvidenceConfigPaths.length, expectedAfterCount: chem.positiveEvidenceConfigPaths.length + 1 },
    memoryReviewConfigPath: { expectedBefore: chem.memoryReviewConfigPath, after: mNormalCfg },
    integrationMechanism: 'Guard each exact affected field/old owner membership and apply only these field patches. Retain concurrent independent D163 registration and every unrelated subject field; this package supplies no stale whole-registry replacement.',
  },
  stockFunctionSources: { A: A.source, AExactDeclarations: A.exactDeclarations, M: M.source, MExactDeclarations: M.exactDeclarations,
    PBuilder: pin('app/scripts/materializePositiveGoalEvidenceCandidates.ts'), PModel: pin('app/scripts/positiveGoalEvidenceProfileModel.ts'), SEM: pin('app/scripts/goalBookModel.ts') },
  boundaries: { normalFilesWritten: 0, oldOwnerFilesChanged: 0, oldNativeReviewRecordsRewritten: 0,
    finalDOrD163RecordsGeneratedOrRehashed: 0, finalD1Approval: false, finalDImpactCountAssumed: false,
    HumanApproval: false, HumanTrial: false, M7Claim: false, publicationOrLearnerPerformance: false },
}
write(PLAN, plan)
console.log(JSON.stringify({ plan: pin(PLAN), stockFP, residuals: { A: ao.raw.length - 1, P: po.raw.length - 1 }, pValidation: pResult.counts }))
