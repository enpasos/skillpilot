// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const local=(p:string)=>read(relative(root,join(here,p)))
const sha=(b:any)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const binding=(p:string)=>({path:relative(root,resolve(root,p)),sha256:sha(readFileSync(resolve(root,p)))})
const write=(p:string,v:any)=>{mkdirSync(dirname(join(here,p)),{recursive:true});writeFileSync(join(here,p),JSON.stringify(v,null,2)+'\n')}
const canonTools=await import(pathToFileURL(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const viewTools=await import(pathToFileURL(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const bookTools=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href)
const pTools=await import(pathToFileURL(join(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const guard=local('declared-current-input-bindings.actual.json')
for(const b of guard.inputBindings)assert.equal(binding(b.path).sha256,'sha256:'+b.sha256,'Actual prior/current input drift: '+b.path)
const delta=local('current-whole-split-and-prerequisite-deltas.inactive.json')
const current=read(delta.landscapeBinding.path),prospective=structuredClone(current)
const byCurrent=new Map(current.goals.map((g:any)=>[g.id,g]))
const parent=delta.wholeCurrentParent.id,childIds=delta.childCandidates.map((g:any)=>g.id)
assert.deepEqual(byCurrent.get(parent),delta.wholeCurrentParent)
prospective.goals[prospective.goals.findIndex((g:any)=>g.id===parent)]=delta.parentAfterCandidate
prospective.goals.push(...delta.childCandidates)
for(const d of delta.incomingRequiresDeltas){
  assert.deepEqual(byCurrent.get(d.goalId),d.wholeGoalBefore)
  prospective.goals[prospective.goals.findIndex((g:any)=>g.id===d.goalId)]=d.wholeGoalAfterCandidate
}
const byFuture=new Map(prospective.goals.map((g:any)=>[g.id,g]))
for(const edge of ['contains','requires']){
  const done=new Set<string>(),active=new Set<string>()
  const visit=(id:string)=>{assert.ok(!active.has(id),'Cycle '+edge+': '+id);if(done.has(id))return
    const goal:any=byFuture.get(id);assert.ok(goal,'Missing '+edge+' reference '+id);active.add(id)
    for(const p of goal[edge]??[])visit(p);active.delete(id);done.add(id)}
  for(const id of byFuture.keys())visit(id as string)
}
const beforeNorm=canonTools.normalizeCanonicalLandscape(current),afterNorm=canonTools.normalizeCanonicalLandscape(prospective)
const beforeErrors=canonTools.validateCanonicalLandscape(beforeNorm).filter((x:any)=>x.severity==='error')
const afterErrors=canonTools.validateCanonicalLandscape(afterNorm).filter((x:any)=>x.severity==='error')
assert.deepEqual(afterErrors,beforeErrors,'New canonical error introduced')
write('native/current482.inert.landscape.json',prospective)
const oldDir='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-8ceb-split-scope-preservation-candidate-v1'
const previousViews=read(oldDir+'/placements-and-views.delta.candidate.json')
const beforeBy=new Map(beforeNorm.goals.map((g:any)=>[g.id,g])),afterBy=new Map(afterNorm.goals.map((g:any)=>[g.id,g]))
const get=(o:any,p:string)=>p.slice(1).split('/').reduce((v:any,k:string)=>v[k.replaceAll('~1','/').replaceAll('~0','~')],o)
const put=(o:any,p:string,v:any)=>{const parts=p.slice(1).split('/').map(k=>k.replaceAll('~1','/').replaceAll('~0','~'));const last=parts.pop()!;parts.reduce((v:any,k:string)=>v[k],o)[last]=v}
const viewEffects=[],actualBindings=[];let replacements=0,affected=0
for(const file of readdirSync(join(root,'curricula/DE/Gymnasium/composition-views/chemie')).filter((x:string)=>x.endsWith('.view.json')).sort()){
  const path='curricula/DE/Gymnasium/composition-views/chemie/'+file,rawBefore=read(path),rawAfter=structuredClone(rawBefore)
  const beforeView=viewTools.normalizeCompositionView(rawBefore)
  const beforeRoles=viewTools.collectCompositionProjectionRoleGoalIds(beforeView.rootNodes,beforeBy)
  if(!beforeRoles.targetGoalIds.has(parent))continue
  affected++;actualBindings.push(binding(path))
  for(const d of previousViews.authoredGoalEntryDeltas.filter((d:any)=>d.path===path)){
    assert.deepEqual(get(rawBefore,d.pointer),d.nodeBefore,'Stale existing view node '+path)
    put(rawAfter,d.pointer,d.nodeAfterCandidate);replacements++
  }
  const afterView=viewTools.normalizeCompositionView(rawAfter)
  const afterRoles=viewTools.collectCompositionProjectionRoleGoalIds(afterView.rootNodes,afterBy)
  const bc=viewTools.compileCompositionView(beforeView,beforeNorm),ac=viewTools.compileCompositionView(afterView,afterNorm)
  assert.deepEqual(ac.findings.filter((x:any)=>x.severity==='error'),bc.findings.filter((x:any)=>x.severity==='error'))
  for(const id of beforeRoles.targetGoalIds)assert.ok(afterRoles.targetGoalIds.has(id),path+': missing old target '+id)
  assert.deepEqual([...afterRoles.targetGoalIds].filter((id:any)=>!beforeRoles.targetGoalIds.has(id)).sort(),[...childIds].sort())
  const ba=[...beforeRoles.targetGoalIds].filter((id:any)=>!(beforeBy.get(id) as any)?.contains?.length)
  const aa=[...afterRoles.targetGoalIds].filter((id:any)=>!(afterBy.get(id) as any)?.contains?.length)
  assert.equal(aa.length,ba.length+1)
  viewEffects.push({viewBinding:binding(path),scope:rawBefore.scope,oldTargetsPreserved:true,
    currentAtomicTargets:ba.length,inertAtomicTargets:aa.length,exactChildTargets:childIds,
    sourceScopeScientificApproval:false})
}
assert.equal(replacements,26)
write('native/actual-affected-author-view-preservation.check.json',{schemaVersion:1,role:'current affected native compiler check, not source-scope approval',affectedViews:affected,directNodesReplaced:replacements,viewEffects,actualBindings,
  countrySourceScopeHolds:'The retained all-state author targets are not independently proven mandatory source requirements. The v1 scoped holds remain.',activeWrites:false})

const registry=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const chem=registry.subjects.find((x:any)=>x.subject==='chemie')
const kinds=structuredClone(read(chem.semanticKindLedgerPath)),kindBy=new Map(kinds.decisions.map((d:any)=>[d.goalId,d]))
const kindChanges=[]
for(const goal of prospective.goals){
  const fp=bookTools.fingerprintSemanticKindSourceGoal(goal),old:any=kindBy.get(goal.id)
  if(old&&old.sourceFingerprint===fp)continue
  const kind=goal.id===parent?'curricularArea':childIds.includes(goal.id)?'curricularAtomic':old?.semanticKind
  assert.ok(kind,'Unknown kind '+goal.id)
  // The loader has no candidate status. Use its unchanged closed kind contract
  // only inside this inert prospective model. The independent approval boundary
  // is recorded separately; this is never written to the active ledger.
  const candidate={goalId:goal.id,sourceFingerprint:fp,semanticKind:kind,decisionStatus:'authoritative',
    decisionBasis:goal.id===parent?'reviewed-current-structural-split-curricular-area':
      childIds.includes(goal.id)?'reviewed-current-structural-split-curricular-atomic':old.decisionBasis}
  if(old)kinds.decisions[kinds.decisions.findIndex((x:any)=>x.goalId===goal.id)]=candidate
  else kinds.decisions.push(candidate)
  kindChanges.push({goalId:goal.id,oldDecision:old??null,inertDecision:candidate,scientificApproval:false})
}
kinds.ledgerId='chemie-b011-current482-inert-kind-loader-input-not-approval'
kinds.sourceLandscapePath=relative(root,join(here,'native/current482.inert.landscape.json'))
kinds.counts={...kinds.counts,curricularAtomic:379,curricularArea:62,total:482}
write('native/current482.inert.semantic-kinds.json',kinds)
write('native/inert-loader-kind-decisions-and-science-limits.json',{schemaVersion:1,role:'loader-required test classifications, not an active A/semantic approval',entries:kindChanges,
  machineAtomicityApprovals:0,activeLedgerWrites:false,
  memoryProposal:'Reuse prior justified no_memory_needed author candidates: all fractions/model data supplied; understanding of mechanisms is assessed. Independent memory decisions remain pending; no cards are created or removed.',
  childVisualizations:'No actual child images or V approvals created; old parent image remains unchanged. New child native pages can lack visualizations.',
  humanApproval:false,humanTrial:false})

const pure='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-current480-atomic-prerequisite-remediation-author-v7/candidate/baseline-native-book.config.json'
const config=read(pure);config.bookId='chemie-b011-current482-inert-review-universe'
config.landscapePath=relative(root,join(here,'native/current482.inert.landscape.json'))
config.semanticKindLedgerPath=relative(root,join(here,'native/current482.inert.semantic-kinds.json'))
config.outputPath=relative(root,join(here,'native/inert-book-model.json'))
write('native/inactive-book.config.json',config)
const baseline=await bookTools.loadGoalBookBuildInputs(pure,root)
const future=await bookTools.loadGoalBookBuildInputs(relative(root,join(here,'native/inactive-book.config.json')),root)
assert.equal(baseline.model.pages.length,378);assert.equal(future.model.pages.length,379)
const ids=new Set([parent,...childIds,...delta.incomingRequiresDeltas.map((x:any)=>x.goalId),...delta.wholeCurrentParent.requires])
const pageDeltas=[]
// Page numbers also occur inside prerequisite links. Ignore only these exact
// position fields recursively; retain actual IDs, titles, relations and content.
const withoutPosition=(v:any):any=>Array.isArray(v)?v.map(withoutPosition):v&&typeof v==='object'?
  Object.fromEntries(Object.entries(v).filter(([k])=>!['pageNumber','navigationOrder','treeOrder'].includes(k)).map(([k,x])=>[k,withoutPosition(x)])):v
const pageBody=(p:any)=>{const body=withoutPosition(p);for(const k of ['goalFingerprint','pageFingerprint'])delete body[k];return body}
for(const p of baseline.model.pages){
  const next=future.model.pages.find((q:any)=>q.goalId===p.goalId)
  if(!next){assert.equal(p.goalId,parent);continue}
  if(p.goalFingerprint!==next.goalFingerprint||p.pageFingerprint!==next.pageFingerprint)pageDeltas.push({goalId:p.goalId,
    currentGoalFingerprint:p.goalFingerprint,inertGoalFingerprint:next.goalFingerprint,
    currentPageFingerprint:p.pageFingerprint,inertPageFingerprint:next.pageFingerprint,
    identicalWholeRawGoal:JSON.stringify(byCurrent.get(p.goalId))===JSON.stringify(byFuture.get(p.goalId)),
    identicalWholeVisiblePageBodyExceptPosition:JSON.stringify(pageBody(p))===JSON.stringify(pageBody(next)),
    changeType:JSON.stringify(pageBody(p))===JSON.stringify(pageBody(next))?'binding_only_book_position':'actual_dependency_reverse_or_content_input',
    scientificClosure:false,reason:'Actual changed contexts need targeted rechecks; exactly unchanged whole page bodies need no repeated science review. New position hashes alone are not scientific QA.'})
}
const actualContextDeltas=pageDeltas.filter((x:any)=>!x.identicalWholeVisiblePageBodyExceptPosition)
const strictCurrent=new Set(read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-twelve-reviewed-active-integration-root-v1/active-after-twelve-central.actual.json').subjects.find((s:any)=>s.subject==='chemie').strictCompleteGoalIds)
const protectedContexts=actualContextDeltas.filter((x:any)=>strictCurrent.has(x.goalId))
for(const id of strictCurrent){const b:any=byCurrent.get(id),a:any=byFuture.get(id);for(const k of ['title','titleEn','description','descriptionEn'])assert.deepEqual(a[k],b[k],'Protected strict text changed: '+id)}
write('native/current-and-inert-whole-selected-pages-and-contexts.raw.json',{schemaVersion:1,role:'native whole page/context inputs, not a D review',currentPureUniverse:378,inertPureUniverse:379,
  interpretation:'Pure whole-review universe only; no publication, HTML/PDF or assertion of identical national atlas navigation.',
  currentWholeSelectedPages:baseline.model.pages.filter((x:any)=>ids.has(x.goalId)),inertWholeSelectedPages:future.model.pages.filter((x:any)=>ids.has(x.goalId)),actualNativePageDeltas:pageDeltas,
  bindingOnlyPagePositionChanges:pageDeltas.length-actualContextDeltas.length,actualContextChangeGoalIds:actualContextDeltas.map((x:any)=>x.goalId),
  protectedCurrentStrictTextGoalsExactlyKept:strictCurrent.size,protectedGoalContextChangeIds:protectedContexts.map((x:any)=>x.goalId),
  limitation:'Exact unaffected science evidence is kept. A future actual context review/rebinding is still required for listed protected contexts; position-only hash changes do not count as new science.'})

const cases=local('four-whole-material-cases.de-en.author-candidate.json')
const criteria='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'
const criteriaFingerprint=binding(criteria).sha256
const reviewId='chemie-b011-two-whole-positive-author-candidates-20261007-v2'
const records=cases.entries.map((entry:any)=>{
  const goal=byFuture.get(entry.goalId),profile=entry.wholePositiveProfile
  return {$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,
    reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaFingerprint,
    landscapeId:current.landscapeId,goalId:entry.goalId,
    goalFingerprint:pTools.fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
    reviewInputFingerprint:pTools.fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,{},'curricularAtomic'),
    profileFingerprint:pTools.fingerprintPositiveGoalEvidenceProfile(profile),status:'needs_human_review',reviewAuthority:'ai_candidate',
    reviewedAt:new Date().toISOString(),reviewer:'chemistry_open_packets author; independent source/D/P/A/M/V pending',
    reason:'Two concrete whole model cases per unchanged prior proposed child; completed supplied material is scientific author work, not merely refreshed hashes. Six bounded original operators can be independently checked, four true source rows and other regional scopes remain held. No active child, actual child image/V approval or learner performance.',
    evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:['BB/BE optional/school-form source scope unresolved.','HE whole gasoline-boiling-analysis/formation/economic/environment source residual unresolved.','NI whole economic judgment remains separate and held.','Unproved additional regional scopes from the existing v1 plan remain held.'],profile}
})
writeFileSync(join(here,'native/positive-two.inactive.records.jsonl'),records.map((x:any)=>JSON.stringify(x)).join('\n')+'\n')
write('native/positive-two.inactive.config.json',{$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,
  reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:current.landscapeId,
  landscapePath:config.landscapePath,semanticKindLedgerPath:config.semanticKindLedgerPath,reviewCriteriaPath:criteria,
  reviewPath:relative(root,join(here,'native/positive-two.inactive.records.jsonl')),reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,
  scope:{label:'Inert two-child whole science author input; source holds and V pending; not active or independently approved',goalIds:childIds}})
for(const b of guard.inputBindings)assert.equal(binding(b.path).sha256,'sha256:'+b.sha256,'Drift while materializing: '+b.path)
write('native/affected-native-structural-and-current-input-preservation.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),
  actualCurrentInputBindingsMatched:guard.inputBindings.length,beforeCanonicalErrors:beforeErrors.length,afterCanonicalErrors:afterErrors.length,
  prospectiveDagChecks:['requires','contains'],affectedAuthorViews:affected,directNodeChanges:replacements,
  nativeCurrentWholePages:378,nativeInertWholePages:379,newWholeCaseBodies:4,newInertPRecords:2,
  noNewImages:true,scientificApprovals:0,activeBindingRestorations:0,strictNetIncrease:0,activeWrites:false,
  meaning:'These are real native schema/graph/view/page inputs and checks. They do not close scientific, source, image or human gates.'})
console.log(JSON.stringify({currentWhole:480,inertWhole:482,nativeCurrentPages:378,nativeInertPages:379,affectedViews:affected,
  changedDirectNodes:replacements,nativeAffectedPageInputs:pageDeltas.length,wholeNewCaseBodies:4,authorPRecords:2,scientificApprovals:0,strictNetGain:0,activeWrites:false}))
