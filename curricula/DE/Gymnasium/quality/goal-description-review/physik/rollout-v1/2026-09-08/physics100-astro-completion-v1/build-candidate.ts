/** Read-only builder. Only stdout is emitted. No canonical/registry/asset writes. */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { buildViewCandidates } from './base-view-candidates.ts'
import { ids, assessmentIds, newAssessments, packagePath } from './assessment-drafts.mjs'

const old = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/physics100-split-implementation-v1/'
const pause = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/physics-paused-split-deferral-20260907-v1/'
const oldAssessments = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/physics100-assessment-debt-proposals-v1/'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const kindPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const clone = (v: any) => structuredClone(v)
const same = (a: any,b: any) => JSON.stringify(a) === JSON.stringify(b)
const sha = (s: any) => 'sha256:' + createHash('sha256').update(typeof s === 'string' || Buffer.isBuffer(s) ? s : JSON.stringify(s)).digest('hex')
const assert = (v: any, message: string) => { if (!v) throw Error(message) }
const encode = (v: any) => JSON.stringify(v,null,2)+'\n'
const state = (v: any) => v === undefined ? {state:'missing'} : {state:'value',value:clone(v)}
function keyOf(v: any) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  if (v.id) return {id:v.id}
  if (v.goalId) return {goalId:v.goalId}
  if (v.sourceGoalId) return {sourceGoalId:v.sourceGoalId}
  if (v.legacyGoalId && v.canonicalGoalId) return {legacyGoalId:v.legacyGoalId,canonicalGoalId:v.canonicalGoalId}
  return null
}
function diffJson(file: string, before: any, after: any, path: any[] = [], ops: any[] = []) {
  if (same(before,after)) return ops
  const add = (b: any,a: any, extra={}) => ops.push({file,path:clone(path),before:state(b),after:state(a),beforeStateSha256:sha(state(b)),afterStateSha256:sha(state(a)),...extra})
  if (Array.isArray(before) && Array.isArray(after) && [...before,...after].length && [...before,...after].every(x=>keyOf(x))) {
    const keysB=before.map(keyOf),keysA=after.map(keyOf)
    if(new Set(keysB.map(x=>JSON.stringify(x))).size!==before.length || new Set(keysA.map(x=>JSON.stringify(x))).size!==after.length){add(before,after);return ops}
    for (const item of before) { const key=keyOf(item), next=after.find(x=>same(keyOf(x),key)); diffJson(file,item,next,[...path,key],ops) }
    for (let i=0;i<after.length;i++) if(!before.some(x=>same(keyOf(x),keyOf(after[i])))) {
      const nextExisting=after.slice(i+1).find(x=>before.some(b=>same(keyOf(b),keyOf(x))))
      ops.push({file,path:[...path,keyOf(after[i])],before:state(undefined),after:state(after[i]),beforeStateSha256:sha(state(undefined)),afterStateSha256:sha(state(after[i])),insertBefore:nextExisting?keyOf(nextExisting):null})
    }
    return ops
  }
  if(before && after && !Array.isArray(before) && !Array.isArray(after) && typeof before==='object' && typeof after==='object') {
    for(const k of new Set([...Object.keys(before),...Object.keys(after)]))diffJson(file,before[k],after[k],[...path,k],ops)
  } else add(before,after)
  return ops
}
export function applyOperations(doc: any, operations: any[]) {
  for(const op of operations){
    let obj=doc;for(const part of op.path.slice(0,-1))obj=typeof part==='object'?obj.find((x:any)=>Object.entries(part).every(([k,v])=>x[k]===v)):obj[part]
    assert(obj,'Operation parent missing: '+JSON.stringify(op.path))
    const last=op.path.at(-1), index=typeof last==='object'?obj.findIndex((x:any)=>Object.entries(last).every(([k,v])=>x[k]===v)):last
    const actual=typeof last==='object'&&index<0?undefined:obj[index]
    assert(same(state(actual),op.before),'Exact field lease failed: '+op.file+' '+JSON.stringify(op.path))
    if(op.after.state==='missing'){if(Array.isArray(obj))obj.splice(index,1);else delete obj[index]}
    else if(typeof last==='object'&&index<0){const i=op.insertBefore?obj.findIndex((x:any)=>Object.entries(op.insertBefore).every(([k,v])=>x[k]===v)):-1;obj.splice(i<0?obj.length:i,0,clone(op.after.value))}
    else obj[index]=clone(op.after.value)
  }
  return doc
}

export async function buildCandidate(root=process.cwd()) {
  const read=(p:string)=>readFileSync(resolve(root,p),'utf8'),json=(p:string)=>JSON.parse(read(p))
  const originals=new Map<string,string|null>(), outputs=new Map<string,string>(),reconciliation:any[]=[]
  const put=(p:string,s:string)=>{if(!originals.has(p))originals.set(p,existsSync(resolve(root,p))?read(p):null);outputs.set(p,s)}
  const historicalPaths=[old+'authoring-input.json',old+'source-decisions.json',old+'view-field-leases.json',old+'individual-am-judgments.json',pause+'PAUSED_DEFERRED.receipt.json',pause+'nine-current-goals.json.snapshot']
  const history=historicalPaths.map(path=>({path,sha256:sha(read(path))}))
  const authoring=json(old+'authoring-input.json'), archive=json(pause+'nine-current-goals.json.snapshot'),pauseReceipt=json(pause+'PAUSED_DEFERRED.receipt.json')
  const sources=json(old+'source-decisions.json')
  const before=json(canonicalPath), after=clone(before), byId=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
  for(const ch of authoring.clusterChanges){const g=byId.get(ch.goalId);for(const [k,v]of Object.entries(ch.fieldLeases))assert(same(g[k],v),'Frozen cluster lease '+g.id+'.'+k);Object.assign(g,clone(ch.after))}
  for(const ch of authoring.edgeChanges){const g=byId.get(ch.goalId);assert(same(g.requires,ch.before),'Frozen edge lease '+g.id);g.requires=clone(ch.after)}
  const assetArchive='curricula/DE/Gymnasium/quality/goal-visualization-review/physik-20260907-deferred-split-assets'
  const assets:any[]=[]
  authoring.newGoals=authoring.newGoals.map((prior:any)=>{
    const g=clone(archive.goals.find((g:any)=>g.id===prior.id));assert(g&&!byId.has(g.id),'Archived new atom identity/absence '+prior.id)
    for(const k of Object.keys(prior))if(k!=='resourceLinks')assert(same(g[k],prior[k]),'Archived semantic divergence '+g.id+'.'+k)
    assert(pauseReceipt.B040.archivedGoals.some((x:any)=>same(x,g)),'Pause/archive object mismatch '+g.id)
    for(const link of g.resourceLinks??[]){const filename=link.url.split('/').at(-1),p=assetArchive+'/'+g.id+'/'+filename;assert(existsSync(resolve(root,p)),'Missing archived image '+p);assets.push({goalId:g.id,resourceLink:link,archivedPath:p,sha256:sha(readFileSync(resolve(root,p))),reconstructionPromptPath:assetArchive+'/'+g.id+'/image-reconstruction-prompt.de.md',adoption:'reuse exact archived bytes; no new approval; Root importer required'})}
    if(g.id===ids.S){reconciliation.push({goalId:g.id,field:'requires',historical:[],candidate:[ids.motivation],reason:'Existing genuine physics orientation explicitly mentions why stars shine; this is an interest-first entry, not a content mastery shortcut. G and downstream solar goals gain their direct motivation path through S.'});g.requires=[ids.motivation]}
    byId.set(g.id,g);after.goals.push(g);return g
  })
  const splitOnly=clone(after)
  const nativeKinds=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
  const ledgerNative=await import(pathToFileURL(resolve(root,old+'ledger-candidate.ts')).href)
  const judgments=json(old+'individual-am-judgments.json')
  // The seven individual archived judgments concern unchanged atomic meanings.
  // Reuse their actual review timestamp; this is not a new review or approval.
  const ledger=ledgerNative.buildLedgerCandidates({root,beforeLandscape:before,afterLandscape:splitOnly,authoring,reviewedAt:judgments.reviewedAt,judgments:judgments.decisions})
  for(const f of ledger.files)put(f.path,f.after)
  const oldDrafts=json(oldAssessments+'authoring-input.json')
  const draft335=clone(oldDrafts.drafts.find((x:any)=>x.goalId.startsWith('335a')))
  const g335=byId.get(draft335.goalId);for(const [k,v]of Object.entries(draft335))if(k!=='goalId')g335[k]=clone(v)
  g335.examData.sourceArtifactPath=packagePath+'/assessments/335a.md'
  // Written task genuinely includes LK luminosity/uncertainty analysis. No GK promotion.
  g335.applicability={jurisdiction:['DE-HE','DE-BW','DE-BY','DE-RP']}
  g335.extendedData={...g335.extendedData,applicabilityMappingInheritance:'boundary'}
  const oldIds=authoring.clusterChanges.map((x:any)=>x.goalId),g4=byId.get('4a58df57-f791-502f-8b8d-9ba155e46035')
  const old4=clone(g4)
  for(const key of ['requires','coveredGoalIds']){const obj=key==='requires'?g4:g4.examData;assert(oldIds.every((id:string)=>obj[key].includes(id)),'All three historical 4a58 astro claims must exist');obj[key]=obj[key].filter((id:string)=>!oldIds.includes(id))}
  reconciliation.push({goalId:g4.id,decision:'Root explicitly authorized narrow removal of exactly three converted astro claims; other current claims preserved, not reviewed or newly endorsed',removedIds:oldIds,remainingClaims:g4.examData.coveredGoalIds,originalTaskSha256:sha(old4.examData.taskContent),preservedTaskSha256:sha(g4.examData.taskContent)})
  for(const task of newAssessments){const g=clone(task);if(['S','G'].some(k=>assessmentIds[k]===g.id))g.tags.push('SekI');assert(!byId.has(g.id),'New task collision');after.goals.push(g);byId.set(g.id,g)}
  const sekI=byId.get('21ab0854-4d67-5233-9495-ae208e152a3c'),q4=byId.get('85bbad98-2f48-5d64-85c4-ab6cf67f24c2')
  sekI.contains.push(assessmentIds.S,assessmentIds.G);q4.contains.push(...['T','DM','DE','U'].map(k=>assessmentIds[k]))
  const kDoc=JSON.parse(outputs.get(kindPath)!),kMap=new Map(kDoc.decisions.map((d:any)=>[d.goalId,d]))
  for(const g of after.goals){const prior:any=kMap.get(g.id);if(!prior){assert(newAssessments.some((x:any)=>x.id===g.id),'Unclassified goal');kMap.set(g.id,{goalId:g.id,semanticKind:'practiceAssessment',sourceFingerprint:nativeKinds.fingerprintSemanticKindSourceGoal(g),decisionStatus:'authoritative',decisionBasis:'explicit-examData-and-practice-assessment-tags; proposed-not-applied'})}else if(prior.sourceFingerprint!==nativeKinds.fingerprintSemanticKindSourceGoal(g)){kMap.set(g.id,{...prior,sourceFingerprint:nativeKinds.fingerprintSemanticKindSourceGoal(g)})}}
  kDoc.decisions=[...kMap.values()].sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId));for(const k of Object.keys(kDoc.counts))kDoc.counts[k]=k==='total'?kDoc.decisions.length:kDoc.decisions.filter((d:any)=>d.semanticKind===k).length
  put(kindPath,encode(kDoc));put(canonicalPath,encode(after))
  // Frozen source-row leases are checked independently of other concurrent mapping rows.
  const overlay=await import(pathToFileURL(resolve(root,old+'generator-overlay-candidate.ts')).href)
  for(const path of new Set<string>(sources.records.map((r:any)=>r.mappingPath))){const doc=json(path),next=clone(doc);for(const r of sources.records.filter((r:any)=>r.mappingPath===path)){
    assert(sha(json(r.sourcePath).sourceGoals.find((g:any)=>g.id===r.sourceGoalId))===r.sourceGoalDigest,'Frozen source goal lease '+r.sourceGoalId)
    assert(same(doc.decisions.find((x:any)=>x.sourceGoalId===r.sourceGoalId),r.beforeDecision),'Frozen source decision lease '+r.sourceGoalId)
    assert(same(doc.mappings.filter((x:any)=>x.legacyGoalId===r.sourceGoalId),r.beforeMappings),'Frozen mappings lease '+r.sourceGoalId)
  }overlay.applyPhysicsB040AstroSplitMappings(next.decisions,next.mappings);put(path,encode(next))}
  const rpPath='curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json',rp=json(rpPath)
  for(const r of sources.records.filter((r:any)=>r.mappingPath.includes('/DE-RP/'))){const rows=rp.mappings.filter((m:any)=>m.legacyGoalId===r.sourceGoalId);assert(same(rows.map((m:any)=>m.canonicalGoalId),r.beforeMappings.map((m:any)=>m.canonicalGoalId)),'RP compatibility source-ID lease');const i=rp.mappings.findIndex((m:any)=>m.legacyGoalId===r.sourceGoalId);rp.mappings=rp.mappings.filter((m:any)=>m.legacyGoalId!==r.sourceGoalId);rp.mappings.splice(i,0,...r.afterCanonicalGoalIds.map((id:string)=>({legacyGoalId:r.sourceGoalId,canonicalGoalId:id,matchType:'partial'})))}put(rpPath,encode(rp))
  for(const path of [authoring.memoryDeck.path,authoring.memoryDeck.runtimePath,authoring.memoryDeck.backendRuntimePath]){const doc=json(path);const i=doc.cards.findIndex((x:any)=>x.id===authoring.memoryCard.cardId);assert(i>=0&&same(doc.cards[i],authoring.memoryCard.before),'Frozen exact c15 card lease');doc.cards.splice(i,1);put(path,encode(doc))}
  const externalGoals=readdirSync(resolve(root,'curricula/DE/Gymnasium/canonical')).filter(p=>p.endsWith('.json')&&!p.includes('CANONICAL_PHYSIK.')).flatMap(p=>json('curricula/DE/Gymnasium/canonical/'+p).goals??[])
  // Base scopes are old reviewed source choices. Additional task/stage edits are separate, explicit operations.
  const baseViews=await buildViewCandidates({root,beforeLandscape:before,afterLandscape:splitOnly,externalGoals})
  const comp=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
  const allGoals=new Map([...externalGoals,...after.goals].map((g:any)=>[g.id,g]))
  const viewProof:any[]=[]
  for(const f of baseViews.files){const view=JSON.parse(f.after),jur=view.scope.jurisdiction??'DE',course=view.scope.courseProfile,stage=view.scope.stage
    const walk=(nodes:any[],fn:any,anc:any[]=[])=>nodes.forEach(n=>{fn(n,anc);walk(n.children??[],fn,[...anc,n])})
    const structures:any[]=[];walk(view.rootNodes,(n:any)=>{if(n.kind==='structure')structures.push(n)})
    const sekii=structures.find(n=>/^physics-sekii/.test(n.id)),seki=structures.find(n=>n.id==='physics-seki'),rootNode=view.rootNodes.find((n:any)=>n.kind==='structure')
    // Only the newly introduced B040 prerequisites move; unrelated root support stays unchanged.
    if(sekii&&rootNode!==sekii){const moving=rootNode.children.filter((n:any)=>[ids.S,ids.G,ids.B].includes(n.goalId)&&n.projectionRole==='prerequisiteOnly');rootNode.children=rootNode.children.filter((n:any)=>!moving.includes(n));sekii.children.push(...moving)}
    const roles=()=>comp.collectCompositionProjectionRoleGoalIds(view.rootNodes,allGoals)
    const remove335=(nodes:any[]):any[]=>nodes.filter(n=>n.goalId!==g335.id).map(n=>n.children?{...n,children:remove335(n.children)}:n)
    if(course==='GK'||(jur!=='DE'&&!g335.applicability.jurisdiction.includes(jur)))view.rootNodes=remove335(view.rootNodes)
    // Re-find after any filtered tree copy.
    const find=(id:string)=>{let got:any;walk(view.rootNodes,(n:any)=>{if(n.id===id)got=n});return got}
    const stage2=sekii?find(sekii.id):rootNode,stage1=seki?find(seki.id):null
    const addTask=(anchor:any,key:string)=>{if(!anchor)return;const current=roles();if(current.targetGoalIds.has(assessmentIds[key]))return;anchor.children.push({kind:'goalEntry',goalId:assessmentIds[key]})}
    if(stage1&&jur==='DE-SL'){const local=find('physics-b040-source-local-astronomy');addTask(local??stage1,'S');addTask(local??stage1,'G')}
    if(stage1&&jur==='DE-SN'){const local=find('physics-b040-source-local-astronomy');addTask(local??stage1,'S')}
    for(const key of ['T','DM','DE','U'])if(roles().targetGoalIds.has(ids[key])){
      const anchor=jur==='DE-TH'&&key==='T'?find('physics-e-phase'):structures.find(n=>n.id==='physics-q4')?find('physics-q4'):stage2
      addTask(anchor,key)
    }
    const compiled=comp.compileCompositionView(comp.normalizeCompositionView(view),after,{...after,goals:[...allGoals.values()]})
    assert(!compiled.findings.some((x:any)=>x.severity==='error'),'New view error '+f.path+' '+JSON.stringify(compiled.findings))
    const role=roles();viewProof.push({path:f.path,scope:view.scope,newAtomTargets:Object.values(ids).filter(id=>id!==ids.motivation&&role.targetGoalIds.has(id)),newAssessmentTargets:Object.values(assessmentIds).filter(id=>role.targetGoalIds.has(id)),nativeErrors:compiled.findings.filter((x:any)=>x.severity==='error'),newRootPrerequisiteLeakage:(view.rootNodes[0]?.children??[]).filter((n:any)=>[ids.S,ids.G,ids.B].includes(n.goalId)&&n.projectionRole==='prerequisiteOnly'&&stage==='CrossStage')})
    put(f.path,encode(view))
  }
  const atlas='app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',at=json(atlas),oldK=json(kindPath)
  assert(at.expectedCurricularAtomicGoalCount===oldK.counts.curricularAtomic,'Current atlas/K count lease');at.expectedCurricularAtomicGoalCount=kDoc.counts.curricularAtomic;put(atlas,encode(at))
  // Source-only generator hooks: each insertion is uniquely anchored and preserves concurrent text.
  const overlayPath='app/scripts/lib/physicsB040AstroSplitMappings.ts';assert(!existsSync(resolve(root,overlayPath)),'B040 overlay already active');put(overlayPath,read(old+'generator-overlay-candidate.ts'))
  const anchors:any={He:'  const mappedSourceGoalIds = new Set(mappings.map',By:'  mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })',Bw:'  const reviewedSourceGoalIds = new Set(decisions.map',Rp:'const coveredSourceGoalCount = decisions.filter',Hh:'const review = {',Sl:'  const uniqueTargetIds = [...new Set(mappings.map',Sn:'  const uniqueTargetIds = [...new Set(mappings.map',Th:'  const uniqueTargetIds = [...new Set(mappings.map'}
  const generatorSplices:any[]=[]
  for(const [stateName,anchor]of Object.entries<string>(anchors)){const path='app/scripts/generate'+stateName+'PhysicsSourceExtraction.ts',text=read(path);assert(!text.includes('applyPhysicsB040AstroSplitMappings')&&text.split(anchor).length===2,'Unique source hook '+path);const imp="import { applyPhysicsB040AstroSplitMappings } from './lib/physicsB040AstroSplitMappings'\n",call=(anchor.startsWith('  ')?'  ':'')+'applyPhysicsB040AstroSplitMappings(decisions, mappings)\n';put(path,imp+text.replace(anchor,call+anchor));generatorSplices.push({file:path,type:'anchored-text-splice',before:anchor,after:call+anchor,prepend:imp,beforeFileSha256:sha(text)})}
  const operations:any[]=[]
  for(const [path,next]of outputs){const prev=originals.get(path);if(prev===next)continue;if(path.endsWith('.json')||path.endsWith('.view.json'))diffJson(path,prev===null?undefined:JSON.parse(prev!),JSON.parse(next),[],operations);else if(path.endsWith('.jsonl')){
    // JSONL row leases preserve all other review bytes; Root must serialize the row delta, never refresh unrelated decisions.
    const b=prev!.trim().split('\n').map(JSON.parse),a=next.trim().split('\n').map(JSON.parse);diffJson(path,b,a,[],operations)
  }}
  const dag:any={};for(const field of ['requires','contains']){const seen=new Set(),active=new Set();const visit=(id:string)=>{assert(!active.has(id),field+' cycle '+id);if(seen.has(id))return;active.add(id);for(const c of allGoals.get(id)?.[field]??[]){const short=c.includes(':')?c.split(':').at(-1):c;assert(allGoals.has(short),'Missing reference '+short);visit(short)}active.delete(id);seen.add(id)};for(const g of after.goals)visit(g.id);dag[field]={cycles:0,missing:0}}
  for(const p of history)assert(sha(read(p.path))===p.sha256,'Historical artifact changed during build '+p.path)
  for(const [path,prev]of originals)assert(prev===null?!existsSync(resolve(root,path)):read(path)===prev,'Concurrent drift; rerun bounded builder '+path)
  const files=[...outputs].filter(([path,text])=>originals.get(path)!==text).map(([path,after])=>({path,before:originals.get(path)??null,after}))
  return {files,plan:{schemaVersion:1,status:'AI_CANDIDATE_NOT_APPLIED_NEEDS_CONTENT_AND_SCOPE_COUNTERREVIEW',createdAt:new Date().toISOString(),model:'unknown',historicalBindings:history,leaseContract:'Exact missing/value field state, ID-keyed rows; scalar relation lists are exact whole-field leases. Whole-file hashes are diagnostic only. No automatic rebasing of old leases.',operations,generatorSplices,newTextFiles:[{file:overlayPath,before:state(undefined),after:state(outputs.get(overlayPath))}],reconciliation:[...reconciliation,...baseViews.receipt.reconciliation],counts:{beforeGoals:before.goals.length,afterGoals:after.goals.length,beforeAtoms:oldK.counts.curricularAtomic,afterAtoms:kDoc.counts.curricularAtomic,newAtoms:7,convertedParents:3,newAssessmentTasks:6},assets,viewProof,dag,ledgerReceipt:ledger.receipt,assessmentClaims:{newTasks:newAssessments.map((g:any)=>({id:g.id,covered:g.requires,points:g.examData.scoring.maxPoints})),g335:{id:g335.id,covered:g335.requires},g4:{id:g4.id,removed:oldIds,preservedUnreviewedClaims:g4.examData.coveredGoalIds}},fileDigests:files.map(f=>({path:f.path,before:f.before===null?null:sha(f.before),after:sha(f.after)})),notPerformed:['operative writes','D/P review or registration','asset movement/import','new image approval','whole Q4 assessment review','post-apply M6 claim']},landscape:after,assessment335:g335}
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname)buildCandidate().then(result=>console.log(JSON.stringify(process.argv.includes('--plan-only')?result.plan:result))).catch(e=>{console.error(e.stack);process.exitCode=1})
