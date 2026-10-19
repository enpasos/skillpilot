// Apache-2.0. Technical scope, provenance and fingerprint checks, no scientific rereview.
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
const R=fileURLToPath(new URL('../../../../../../../',import.meta.url)),O=fileURLToPath(new URL('./',import.meta.url))
const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics}=await import(R+'app/scripts/positiveGoalEvidenceProfileModel.ts')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),hash=(s:string|Buffer)=>'sha256:'+createHash('sha256').update(s).digest('hex')
const selected=read(R+'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current454-joint-integration-candidate-technical-20261018-v2/LATEST.selected-candidate-state.pending.json')
const canonical=read(R+selected.landscapePath),byId=new Map(canonical.goals.map((g:any)=>[g.id,g])),ledger=read(R+selected.semanticKindLedgerPath),kind=new Map(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const selection=read(O+'SELECTION.exact454-P-owners-and423-byte-exact-retentions.json'),owner=new Map<string,string>(),status:Record<string,number>={},authority:Record<string,number>={},errors:any[]=[],configRows:any[]=[]
for(const path of selection.selectedFutureConfigPaths){
 const config=read(R+path),records=readFileSync(R+config.reviewPath,'utf8').split(/\r?\n/).filter(s=>s.trim()).map(s=>JSON.parse(s)),scope=new Set<string>(config.scope.goalIds),criteria=hash(readFileSync(R+config.reviewCriteriaPath)),ids=new Set<string>()
 for(const record of records){
  const id=record.goalId,goal:any=byId.get(id),digests:Record<string,string>={}
  if(owner.has(id))errors.push({goalId:id,error:'duplicate owner',first:owner.get(id),second:path})
  owner.set(id,path);ids.add(id)
  if(!scope.has(id))errors.push({goalId:id,error:'outside-scope row',path})
  if(record.reviewId!==config.reviewId||record.reviewCriteriaFingerprint!==criteria)errors.push({goalId:id,error:'owner/criteria mismatch',path})
  if(config.reviewedResourceTypes.includes('goal-visualization'))for(const link of goal?.resourceLinks??[])if(link.type==='goal-visualization')digests[link.url]=hash(readFileSync(R+'app/public/'+link.url.substring(1)))
  if(record.goalFingerprint!==fingerprintGoalForPositiveEvidence(goal,kind.get(id)))errors.push({goalId:id,error:'goal fingerprint',path})
  if(record.profileFingerprint!==fingerprintPositiveGoalEvidenceProfile(record.profile))errors.push({goalId:id,error:'profile fingerprint',path})
  if(record.reviewInputFingerprint!==fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,digests,kind.get(id)))errors.push({goalId:id,error:'resource/input fingerprint',path})
  for(const error of validatePositiveGoalEvidenceRecordSemantics(record,goal,digests,kind.get(id)))errors.push({goalId:id,error,path})
  status[record.status]=(status[record.status]??0)+1;authority[record.reviewAuthority]=(authority[record.reviewAuthority]??0)+1
 }
 for(const id of scope)if(!ids.has(id))errors.push({goalId:id,error:'missing configured row',path})
 configRows.push({path,records:records.length,scopeCount:scope.size,exactScopeRecordSet:ids.size===scope.size&&[...ids].every(id=>scope.has(id))})
}
const ordinary=ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId)
if(ordinary.length!==454||owner.size!==454||ordinary.some((id:string)=>!owner.has(id)))errors.push({error:'ordinary454coverage'})
console.log(JSON.stringify({role:'All454 owner/scope/payload consistency only, no repeated scientific P or full quality pipeline',selectedConfigCount:selection.selectedFutureConfigPaths.length,ordinaryOwnerCount:owner.size,statusCounts:status,authorityCounts:authority,resourceDigestsReadFromActualPublicBytes:true,productionFunctionsUnchanged:true,configRows,errorCount:errors.length,errors},null,2))
if(errors.length)process.exitCode=1
