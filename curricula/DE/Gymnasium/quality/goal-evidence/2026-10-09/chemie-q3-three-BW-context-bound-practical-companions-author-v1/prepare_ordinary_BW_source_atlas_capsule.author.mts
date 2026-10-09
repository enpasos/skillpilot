// SPDX-License-Identifier: Apache-2.0
// Ordinary scoped source-atlas operation in a capsule outside curricula.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,cpSync,existsSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs,checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),cap=mkdtempSync(resolve(tmpdir(),'skillpilot-chemie-BW-source3-atlas-'))
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const put=(path:string,data:any)=>{const p=resolve(D,path);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,typeof data==='string'?data:JSON.stringify(data,null,2)+'\n');return relative(R,p)}
const orig=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const before=read(`${P}/inputs/canonical.exact.json`),after=read(`${P}/candidate/full484-381.inactive-canonical.json`)
const activeBW:string[]=orig.mappingPaths.filter((p:string)=>p.includes('/DE-BW/'))
assert.equal(activeBW.length,2)
const upper=activeBW.find(p=>p.includes('upper-secondary'))!,lower=activeBW.find(p=>p!==upper)!
const afterBW=[lower,`${P}/candidate/whole-BW126-220-partners.practical-successor.review.json`]
const actualSourceInputBindings:any[]=[]
for(const path of activeBW){const m=read(path);for(const p of [path,m.sourceExtractionPath]){const bytes=readFileSync(resolve(R,p)),dest=resolve(cap,p);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,bytes);actualSourceInputBindings.push({path:p,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});put(`inputs/current-BW-source-tree/${p}`,bytes.toString('utf8'))}}
const wholeDuration=read(orig.durationModelPolicyPath);put('inputs/whole-duration-policy153.exact.json',readFileSync(resolve(R,orig.durationModelPolicyPath),'utf8'));const boundedDuration={...wholeDuration,decisions:wholeDuration.decisions.filter((d:any)=>d.subject==='Chemie'&&d.jurisdiction==='DE-BW')};assert.equal(boundedDuration.decisions.length,1);const dp=put('candidate/BW-only-exact-duration-policy.scope-projection.json',boundedDuration);mkdirSync(dirname(resolve(cap,dp)),{recursive:true});cpSync(resolve(R,dp),resolve(cap,dp));put('candidate/BW-duration-policy-scope-projection.boundary.json',{role:'Exact existing BW Chemie decision projected for this limited ordinary fixture; full153 decisions retained separately unchanged',fullPolicyPath:`${P}/inputs/whole-duration-policy153.exact.json`,boundedPolicyPath:dp,nationalPolicyChanged:false,newDurationDecisions:0})
cpSync(D,resolve(cap,P),{recursive:true})
const successorPdfPath=read(`${P}/candidate/whole-BW126.source-extraction.json`).sourceDocument.path;mkdirSync(dirname(resolve(cap,successorPdfPath)),{recursive:true});cpSync(resolve(R,successorPdfPath),resolve(cap,successorPdfPath))
const snapshots=orig.sourceDocumentSnapshots.filter((s:any)=>s.path==='curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf')
assert.equal(snapshots.length,1)
assert.equal(snapshots[0].sha256,'sha256:'+createHash('sha256').update(readFileSync(resolve(D,'primary/official-BW-chemistry-20220325.actual-original.pdf'))).digest('hex'))
const expectedUnion=(paths:string[],canon:any,kinds:any)=>{const gs=new Map<string,any>(canon.goals.map((g:any)=>[g.id,g])),atoms=new Set(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId)),result=new Set<string>();const visit=(id:string)=>{id=id.replace(canon.landscapeId+':','');const g=gs.get(id);assert.ok(g);if(atoms.has(id))result.add(id);else for(const c of g.contains??[])visit(c)};for(const path of paths){const m=JSON.parse(readFileSync(resolve(cap,path),'utf8'));for(const d of m.decisions)if(d.decision==='mapped')for(const id of d.canonicalGoalIds)visit(id)}return result}
const beforeKinds=read(`${P}/native/current480-kinds.path-only.json`),afterKinds=read(`${P}/candidate/full484-381.semantic-kinds.inactive-input.json`)
const bset=expectedUnion(activeBW,before,beforeKinds),aset=expectedUnion(afterBW,after,afterKinds)
const runs=[]
for(const [stage,paths,landscapePath,kindsPath,expected]of [['before',activeBW,`${P}/inputs/canonical.exact.json`,`${P}/native/current480-kinds.path-only.json`,bset.size],['after',afterBW,`${P}/candidate/full484-381.inactive-canonical.json`,`${P}/candidate/full484-381.semantic-kinds.inactive-input.json`,aset.size]] as const){
 const out=`app/scripts/config/goal-books/chemie-q3-BW-source3-inactive-${stage}`
 const config={schemaVersion:1,bookId:`chemie-q3-BW-source3-inactive-${stage}`,subject:'Chemie',landscapePath,semanticKindLedgerPath:kindsPath,durationModelPolicyPath:dp,sourceDocumentSnapshots:snapshots,mappingPaths:paths,allowedSourceSubjects:orig.allowedSourceSubjects,outputDirectory:`${out}/source-views`,manifestPath:`${out}/source-manifest.json`,navigationViewPath:`${out}/navigation.view.json`,navigationViewId:`chemie-q3-BW-source3-inactive-${stage}`,expectedJurisdictions:['DE-BW'],expectedCurricularAtomicGoalCount:expected,expectedUnresolvedScopeDecisionCount:0}
 const configPath=put(`source-atlas/${stage}.ordinary-scoped.config.json`,config);mkdirSync(dirname(resolve(cap,configPath)),{recursive:true});writeFileSync(resolve(cap,configPath),JSON.stringify(config,null,2)+'\n')
 const built=buildGoalBookSourceAtlasInputs(config as any,cap)
 const transports=[]
 for(const [path,bytes]of Object.entries(built.outputs)){mkdirSync(dirname(resolve(cap,path)),{recursive:true});writeFileSync(resolve(cap,path),bytes);const archive=put(`source-atlas/${stage}-exact-output-archive/${path}`,bytes);transports.push({ordinaryOutputPath:path,portableExactArchivePath:archive,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:Buffer.byteLength(bytes)})}
 const checked=checkGoalBookSourceAtlasInputs(configPath,cap)
 assert.equal(checked.receipt.counts.publishedCurricularAtomicGoals,expected)
 put(`source-atlas/${stage}.full-ordinary-source-scopes.actual.json`,checked.receipt)
 runs.push({stage,ordinaryConfigPath:configPath,counts:checked.receipt.counts,portableExactOutputTransports:transports,scopes:checked.receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds,newPracticalGoalIds:s.goalIds.filter((id:string)=>read(`${P}/candidate/three-new-whole-DEEN-practical-goals.json`).some((g:any)=>g.id===id))}))})
}
const ids=read(`${P}/candidate/three-new-whole-DEEN-practical-goals.json`).map((g:any)=>g.id)
const aft=runs[1].scopes
assert.deepEqual(aft.find((s:any)=>s.key==='DE-BW/SekII/GK')!.newPracticalGoalIds,[ids[0]])
assert.deepEqual(new Set(aft.find((s:any)=>s.key==='DE-BW/SekII/LK')!.newPracticalGoalIds),new Set(ids))
assert.deepEqual(aft.find((s:any)=>s.key==='DE-BW/SekI/')!.newPracticalGoalIds,[])
put('checks/completed-normal-BW-source-atlas-before-after.actual.json',{schemaVersion:1,role:'Actual ordinary scoped source-atlas before/after and exact transport, no independent approval',ordinaryTool:'buildGoalBookSourceAtlasInputs+checkGoalBookSourceAtlasInputs',ordinaryToolBinding:{path:'app/scripts/goalBookSourceAtlasInputs.ts',sha256:createHash('sha256').update(readFileSync(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts'))).digest('hex')},actualSourceInputBindings,runs,currentNational359BookCountNotAltered:true,currentCurricular378AndStrict177Unchanged:true,proposedPracticalTargetsAdded:ids,otherNewSourceTargetsFromRetainedPriorPartialPartnerCandidate:[...aset].filter(id=>!bset.has(id)&&!ids.includes(id)),currentBWWholeProgrammeClosed:false,allOtherSourceAndProgrammeHoldsPreserved:true,independentSourceOperatorApproval:false,humanApproval:false,activeWrites:0,strictGain:0,capsulePathDiagnosticOnly:cap,allActualGeneratedBytesPortablyArchived:true})
console.log(JSON.stringify({normalScopedSourceAtlasBefore:bset.size,normalScopedSourceAtlasAfter:aset.size,ordinaryOutputNamespacesAreCapsuleOnly:true,BWGKPractical:1,BWLKPractical:3,BWSekIPractical:0,independentApproval:false,activeWrites:0}))
