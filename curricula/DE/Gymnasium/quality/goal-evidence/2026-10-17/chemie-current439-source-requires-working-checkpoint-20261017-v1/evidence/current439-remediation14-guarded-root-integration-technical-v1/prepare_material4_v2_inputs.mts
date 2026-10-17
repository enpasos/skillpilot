import { readFile,writeFile,mkdir,realpath } from 'node:fs/promises'
import { dirname,resolve,relative,sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape,buildCanonicalGraphIndex } from './capsule/app/src/utils/authoring/canonicalAuthoring.ts'
import { fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics } from './capsule/app/scripts/positiveGoalEvidenceProfileModel.ts'
import { parseGoalBookEvidenceReviewRecord } from './capsule/app/scripts/goalBookEvidenceReviewLoader.ts'
const O=dirname(fileURLToPath(import.meta.url)),B=resolve(O,'..'),K=resolve(O,'capsule')
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const pin=async(p:string)=>{const b=await readFile(p);return {path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const authorRoot=resolve(B,'chemie-targeted-material-assessment-boundaries-author-successor-v2')
const selectorPath=resolve(authorRoot,'SELECTOR.four-goal-bounded-material-author-successor-v2.sealed.json')
if((await pin(selectorPath)).sha256!=='4eaffef35629f576b37a4a2056ba7d076473e278f4427c60a1221d243ae5d815')throw new Error('v2 selector pin mismatch')
const author=await read(selectorPath),guardPins:any[]=[await pin(selectorPath)]
for(const item of author.artifacts){const actual=await pin(item.path);if(actual.sha256!==item.sha256||actual.bytes!==item.bytes)throw new Error('Author pin mismatch '+item.path);guardPins.push(actual)}
const pLane=await read(resolve(O,'CHECK.actual-current439-P-stock-configs.json'));if(pLane.recordCount!==439||pLane.duplicateOwnerCount!==0)throw new Error('K P integration not checked')
const oldPlan=await read(resolve(B,'current439-remediation14-author-assembly-technical-v1/PLAN.author14.exact-prospective-change-map.json'))
const oldBind=await read(resolve(B,'current439-remediation14-author-assembly-technical-v1/CHECK.actual-author14-stock-fingerprints-and-exact-profile-retention.json'))
const F=resolve(B,'current439-remediation14-author-assembly-technical-v1/capsule')
const oldPPath=oldBind.P439.path,canonicalPath=resolve(K,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const QAPath=resolve(K,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
for(const path of [oldPPath,canonicalPath,oldBind.SEM650.path,QAPath])guardPins.push(await pin(path))
const Q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v2-targeted-preparation-technical-v1',R=resolve(K,Q)
await mkdir(R);if(!(await realpath(R)).startsWith((await realpath(K))+sep))throw new Error('Unsafe new private path')
const put=async(path:string,raw:Uint8Array|string)=>{await mkdir(dirname(path),{recursive:true});if(!(await realpath(dirname(path))).startsWith((await realpath(K))+sep)&&!path.startsWith(O+sep))throw new Error('Unsafe write');await writeFile(path,raw,{flag:'wx'});return pin(path)}
const json=async(path:string,obj:any)=>put(path,JSON.stringify(obj,null,2)+'\n')
const materialPins:any[]=[]
for(const item of author.artifacts){
 const rel=relative(authorRoot,item.path)
 if(rel.startsWith('materials'+sep)||rel.startsWith('candidate'+sep)&&rel.endsWith('FOUR.complete-profile-bodies.material-assignment.author-v2.json')){
  const dest=resolve(R,'author-v2',rel);materialPins.push({source:item,privateCopy:await put(dest,await readFile(item.path))})
 }
}
const profiles=await read(author.profileBodies.path),profileById=new Map(profiles.profiles.map((r:any)=>[r.goalId,r.profile]))
const canon=await read(canonicalPath),goalById=buildCanonicalGraphIndex(normalizeCanonicalLandscape(canon)).goalById
const sem=await read(oldBind.SEM650.path),kinds=new Map(sem.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const qa=await read(QAPath),qaById=new Map(qa.records.map((r:any)=>[r.goalId,r]))
const oldText=await readFile(oldPPath,'utf8'),oldLines=oldText.split(/(?<=\n)/u).filter(s=>s.trim()),outLines:string[]=[],changes:any[]=[]
const at=new Date().toISOString(),target28='28c90c6a-3020-5c51-ac40-d802f3f12d2d'
for(const line of oldLines){const record=JSON.parse(line),fresh=profileById.get(record.goalId)
 if(!fresh){outLines.push(line);continue}
 if(record.goalId!==target28){if(JSON.stringify(record.profile)!==JSON.stringify(fresh))throw new Error('Unexpected new non28 profile body');outLines.push(line);continue}
 const old=structuredClone(record);record.profile=fresh
 Object.assign(record,{reviewId:'chemie-material4-v2-28c-technical-author-20261017-v1',reviewedAt:at,reviewer:'Codex technical author assembly; independent current material4 review pending',reason:'Author-only current material-assignment successor copied from the exact sealed v2 whole profile. No independent science review or attainment is certified; the frozen R14 record remains unchanged.',reviewRunIds:[],dissent:[],profileFingerprint:fingerprintPositiveGoalEvidenceProfile(record.profile)})
 const q:any=qaById.get(record.goalId),errors=validatePositiveGoalEvidenceRecordSemantics(record,goalById.get(record.goalId) as any,{[q.imageUrl]:q.assetSha256},kinds.get(record.goalId) as string)
 if(errors.length)throw new Error(errors.join('|'));parseGoalBookEvidenceReviewRecord(record,'v2 author28c')
 for(const key of ['status','reviewAuthority','evidenceLevel','maximumClaimScope','goalFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint'])if(record[key]!==old[key])throw new Error('Unallowed P binding/status change '+key)
 changes.push({goalId:record.goalId,beforeProfileFingerprint:old.profileFingerprint,authorV2ProfileFingerprint:record.profileFingerprint,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,changedEnvelopeFields:Object.keys(record).filter(k=>JSON.stringify(record[k])!==JSON.stringify(old[k]))})
 outLines.push(JSON.stringify(record)+'\n')
}
if(changes.length!==1)throw new Error('Expected only28c current profile change')
const PRel=Q+'/P439.material4-v2-only28c-author-profile-current.aggregate.jsonl';const PPin=await put(resolve(K,PRel),outLines.join(''))
if(oldLines.filter((s,i)=>s!==outLines[i]).length!==1)throw new Error('Other438 whole record lines changed')
const oldBase=await read(resolve(K,oldPlan.draftBaseConfigRelativePath)),base={...oldBase,bookId:'chemie-current439-material4-v2-author-input-base-20261017-v1',title:'Chemie – aktueller Autorenstand für vier begrenzte Materialzuordnungen',goalVisualizationQaPath:'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',evidenceReviewPaths:[PRel],outputPath:Q+'/book-model.full439.material4-v2.input-reference.json'}
const baseRel=Q+'/base.full439.material4-v2.author-input.config.json';await json(resolve(K,baseRel),base)
const order=new Map(oldPlan.goalIds.map((g:string,i:number)=>[g,i])),ids=[...author.goalIds].sort((a,b)=>(order.get(a) as number)-(order.get(b) as number))
const config={...(await read(resolve(K,oldPlan.draftBatchConfigRelativePath))),batchId:'chemie-current439-material4-v2-targeted-20261017-v1',bookId:'chemie-current439-material4-v2-targeted-20261017-v1',title:'Chemie – vier aktuelle Material- und Zuordnungskandidaten v2',baseGoalBookConfigPath:baseRel,goalIds:ids,outputDirectory:Q+'/native4'}
const configRel=Q+'/material4-v2.batch.config.json';const configPin=await json(resolve(K,configRel),config)
for(const expected of guardPins){const actual=await pin(expected.path);if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('Source changed '+expected.path)}
const output={role:'Four-goal author v2 current input preparation; original R14 and prospective central P14 remain untouched',atUTC:at,capsule:K,reviewRootRelativePath:Q,nativeRoot:resolve(K,config.outputDirectory),configRelativePath:configRel,baseConfigRelativePath:baseRel,goalIds:ids,P439V2:PPin,frozenP439V1:await pin(oldPPath),sourceCanonical:await pin(canonicalPath),sourceSEM650:await pin(oldBind.SEM650.path),sourceQA:await pin(QAPath),profileChanges:changes,other438WholeLinesExact:true,threeOtherProfileAndRecordBodiesExact:true,operativeV2MaterialPins:materialPins,sourceGuards:guardPins,authorSelectorForTechnicalBinding:await pin(selectorPath),oldV1MaterialsOperative:false,humanApproval:false,newScienceDecisions:false,centralOrLedgerChanged:false}
await writeFile(resolve(O,'PREPARATION.current4-v2-inputs.json'),JSON.stringify(output,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({configRelativePath:configRel,configPin,goalIds:ids,P439V2:PPin,profileChanges:changes,other438WholeLinesExact:true}))
