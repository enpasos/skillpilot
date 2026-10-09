import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const own = dirname(fileURLToPath(import.meta.url))
let root = own
while (!existsSync(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts'))) {
  const parent = dirname(root)
  if (parent === root) throw new Error('Repository source not found')
  root = parent
}
const author = resolve(own, '../chemie-b008-MV-kp-kc-derivation-source-placement-author-root-v2')
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const bind = (path: string) => {
  const bytes = readFileSync(path)
  return { path: relative(root, path), sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, bytes: bytes.length }
}
const sourceAPI: any = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const viewAPI: any = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const canonicalAPI: any = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const kindAPI: any = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const canonicalPath = resolve(author, 'canonical504-one-KpKc-derived-MV-LK.inactive.json')
const canonical = load(canonicalPath)
const goalId = 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4'
const goal = canonical.goals.find((value: any) => value.id === goalId)
const sourcePath = resolve(author, 'MV-one-clause-current-printed23.inactive-source-extraction.json')
const source = load(sourcePath)
const sourceGoal = source.sourceGoals.find((value: any) => value.id === 'mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-009-dc7fb7b0')
const passage = source.passages.find((value: any) => value.id === sourceGoal.passageId)
const levels = [sourceGoal, passage, source.sourceDocument, source]
const stage = sourceAPI.sourceAtlasFacet(levels, 'stage')
const course = sourceAPI.sourceAtlasFacet(levels, 'courseProfile')
assert.deepEqual(stage, ['SekII'])
assert.deepEqual(course, ['LK'])
const viewPath = resolve(author, 'one-MV-LK-Qualifikationsphase11-12.inactive-unregistered.view.json')
const view = viewAPI.normalizeCompositionView(load(viewPath))
const normal = canonicalAPI.normalizeCanonicalLandscape(canonical)
const compiled = viewAPI.compileCompositionView(view, normal)
const errors = compiled.findings.filter((value: any) => value.severity === 'error')
assert.deepEqual(errors, [])
const roles = viewAPI.collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(normal.goals.map((value: any) => [value.id, value])))
assert.deepEqual([...roles.targetGoalIds], [goalId])
const kindPath = resolve(author, 'kinds395-one-current-goal.technical-candidate.json')
const technical = load(kindPath).decisions.find((value: any) => value.goalId === goalId)
const computedKindFingerprint = kindAPI.fingerprintSemanticKindSourceGoal(goal)
assert.equal(computedKindFingerprint, technical.sourceFingerprint)
const jpg = goal.resourceLinks.find((link: any) => link.type === 'goal-visualization' && link.role === 'primary')
const imagePath = resolve(root, 'app/public', jpg.url.replace(/^\//, ''))
const firstPath = resolve(own, 'one-derived-MV-KpKc-science-source-P-kind-AM.actual-FIRST.independent-A.verdict.json')
const outputPath = resolve(own, 'one-actual-MV-LK-facet-closed-view-kind-and-retained-JPEG.after-FIRST.independent-A.json')
assert.equal(existsSync(outputPath), false)
const receipt = {
  schemaVersion: 1, role: 'Actual normal technical facet/compiler/semantic-kind binding check after own independent FIRST; no whole atlas or native approval',
  actualExecutedAt: new Date().toISOString(), actualScienceFirst: bind(firstPath),
  actualInputs: [bind(canonicalPath), bind(sourcePath), bind(viewPath), bind(kindPath)],
  actualNormalValidatorCode: [bind(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts')), bind(resolve(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')), bind(resolve(root, 'app/scripts/goalBookModel.ts'))],
  actualSourceStage: stage, actualSourceCourse: course, actualSourceSpan: sourceGoal.sourceSpan,
  actualScope: view.scope, actualTargetGoalIds: [...roles.targetGoalIds], compilerFindings: compiled.findings, errors,
  actualKindSourceFingerprintComputed: computedKindFingerprint, exactNormalTechnicalKindBinding: true,
  kindScienceFromOwnWholeGoalFIRST: true, other394KindJudgmentsReapproved: false,
  existingActualPrimaryJPEG: bind(imagePath), existingWholeResourceLink: jpg,
  selectedCurrentImagePixelsSeenThisReview: false, newPixelViewsClaimed: 0,
  existingImageRetainedWithoutNewProduction: true, currentImageVApproved: false,
  actualSourceBlock: 'gray LK additional block, right Hinweise column, physical27/printed23',
  wholeSourceAndMVCurrentCourseApproved: false, normalFull395AtlasRunClaimed: false,
  wholeMixedPassage22AnchorAndRawSourceSpan22Preserved: true, viewNotRegistered: true,
  unrelatedSourceRoutesApproved: false, expected395Reduced: false,
  humanApproval: false, humanTrial: false, activeWrites: [], strictGain: 0,
}
writeFileSync(outputPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ receipt: bind(outputPath), actualStage: stage, actualCourse: course, compilerErrors: errors, targetGoalIds: [...roles.targetGoalIds] }, null, 2))
