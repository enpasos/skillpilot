import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape } from '../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../app/src/utils/authoring/compositionViewAuthoring'
const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '../../..')
const digest = (b: string | Buffer) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const bytes = (p: string) => readFileSync(resolve(root,p))
const json = (p: string) => JSON.parse(bytes(p).toString('utf8'))
const priorPath = 'tmp/cross-subject-requires/physics-view-closure-support-author-v2/independent-scope-and-test-review-20261013-v1.json'
assert.equal(digest(bytes(priorPath)), 'sha256:165e082252d81bfa1a717bfc4b4c9de9169556e9484c7a19a0af7e8c9d0557af')
const prior = json(priorPath)
for (const x of prior.protectedInputs) assert.equal(digest(bytes(x.path)), x.actualSha256)
for (const x of prior.checks) assert.equal(digest(bytes(x.path)), x.actualCurrentSha256)
const testPath = 'app/scripts/testPhysicsGoalBookInputs.ts', source = bytes(testPath).toString('utf8')
const start = source.indexOf('  visibleGoalIds.forEach((goalId) => {', source.indexOf('allPhysicsViewPaths.forEach'))
const end = source.indexOf('  assert.equal(',start)
assert(start > 0 && end > start)
const guard = source.slice(start,end)
assert(guard.includes('semanticGoalById.has(goalId)'))
assert.equal(digest(source.slice(0,start)+source.slice(end)), prior.actualTestInput.sha256, 'More than the single reviewed assertion block changed')
const runGuard = new Function('visibleGoalIds', 'assert', 'semanticGoalById', 'view', guard)
const rawP = json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const kinds = new Map(json('curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json').decisions.map((x:any)=>[x.goalId,x.semanticKind]))
const normalized = normalizeCanonicalLandscape(rawP)
const physics = {...normalized,goals:normalized.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))}
const math = normalizeCanonicalLandscape(json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))
const universe = {landscapeId:'independent-guard-canonical-universe',title:'Independent guard review',goals:[...physics.goals,...math.goals]}
const all = new Map(universe.goals.map(g=>[g.id,g])), pg = new Map(physics.goals.map(g=>[g.id,g]))
const landscapes = new Map([[physics.landscapeId,physics],[math.landscapeId,math]])
const path = 'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json'
const current = normalizeCompositionView(json(path)), angle = '2331caf2-ccb2-5492-9fc6-48763b848bae'
const promoted = structuredClone(current), n:any = promoted.rootNodes.find((x:any)=>x.kind!=='structure'&&x.goalId===angle)
assert(n);n.projectionRole='target'
const doubled = structuredClone(current);doubled.rootNodes.push({kind:'goalEntry',goalId:angle,projectionRole:'target'} as any)
const controls = [current,promoted,doubled].map((view,index)=>{
  const c = compileCompositionView(view,physics,universe,landscapes)
  const errors=c.findings.filter(f=>f.severity==='error');assert.deepEqual(errors,[])
  const visible = new Set<string>()
  const visit=(n:any)=>{if(n.sourceGoalId)visible.add(n.sourceGoalId);n.children.forEach(visit)}
  c.compiledRootNodes.forEach(visit)
  const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,all)
  let rejection:string|null=null
  try{runGuard(visible,assert,pg,view)}catch(e){rejection=String(e)}
  if(index===0){assert.equal(rejection,null);assert(!visible.has(angle));assert(roles.prerequisiteOnlyGoalIds.has(angle))}
  else{assert(rejection?.includes(angle));assert(visible.has(angle));assert(roles.targetGoalIds.has(angle))}
  return {case:index===0?'actual_prerequisiteOnly_passes':index===1?'replace_role_with_target_rejected':'keep_prerequisiteOnly_plus_equal_specificity_target_rejected',viewId:view.viewId,angleVisible:visible.has(angle),effectiveAngleRole:roles.targetGoalIds.has(angle)?'target':'prerequisiteOnly',compilerErrors:errors,actualExtractedGuardPassed:rejection===null,rejection}
})
const logPath='tmp/cross-subject-requires/physics-input-first10-target-promotion-guard.log'
const log=bytes(logPath).toString('utf8');assert(log.includes('Physics goal-book inputs verified: 764 semantic-kind decisions; 478 curricular atoms in 64 state views; 16 reviewed duration decisions.'))
const receipt={schemaVersion:1,completedAt:new Date().toISOString(),reviewer:{agentCanonicalName:'/root/requires_canonical_review',model:'GPT-6.1 Sol',reasoningEffort:'Ultra',role:'independent_reviewer',authority:'ai_candidate',sourceCodeAuthor:'Root'},decision:'approved_exact_new_visible_physics_owner_guard',priorReceipt:{path:priorPath,sha256:digest(bytes(priorPath)),unchanged:true},newTest:{path:testPath,sha256:digest(bytes(testPath)),exactGuardBlockSha256:digest(guard),actualGuardBlock:guard,onlyDeltaFromPriorTest:'This exact block insertion; removing it reconstructs the prior bound full test SHA.'},unmodifiedSourceContext:{protectedInputCount:prior.protectedInputs.length,allProtectedHashesMatch:true,all69ActualViewHashesMatch:true},nativeCompilerControls:controls,rootFocusedRunObserved:{logPath,logSha256:digest(bytes(logPath)),successLine:'Physics goal-book inputs verified: 764 semantic-kind decisions; 478 curricular atoms in 64 state views; 16 reviewed duration decisions.',reviewerDidNotRerunFocusedOrFullCI:true},rationale:'The assertion tests each compiled visible source goal against canonical Physics ownership after role precedence has been resolved. Therefore an extra equal-specificity target reference cannot hide behind the still-present prerequisiteOnly root. Legitimate Mathematics support remains invisible and available; its own Mathematics view and learner scope are unaffected.',limits:['No scientific prerequisite re-review, source/QA/goal/role mutation or new learner progress claim.','Prior scope/view receipt remains exact history; this additive receipt approves only the new guard and its tested native-compiler counterexamples.','Global composition, DAG, M7 and full CI remain Root evidence.']}
const output=resolve(here,'independent-target-promotion-guard-review-20261013-v2.json')
writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({output,sha256:digest(readFileSync(output)),testSha256:receipt.newTest.sha256,controls},null,2))
