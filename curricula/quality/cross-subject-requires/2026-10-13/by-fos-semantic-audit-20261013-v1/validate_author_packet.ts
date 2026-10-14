// SPDX-License-Identifier: Apache-2.0
// Integrity/schema probes; no semantic judgment or native-M7 test.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import Ajv2020 from '../../../app/node_modules/ajv/dist/2020.js'
import { fingerprint, fileFingerprint } from '../../../app/scripts/lib/crossSubjectRequiresInventory'
const R='tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const eq=(a:unknown,b:unknown,msg:string)=>{if(fingerprint(a)!==fingerprint(b))throw new Error(msg)}
// Author-entry binding explicitly uses Python code-point key order. The repo
// fingerprint uses localeCompare, whose readMode/readerAgentIdentity order differs.
const authorStableJson=(v:any):string=>Array.isArray(v)?`[${v.map(authorStableJson).join(',')}]`:v&&typeof v==='object'?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${authorStableJson(v[k])}`).join(',')}}`:JSON.stringify(v)
const authorEntryFingerprint=(v:any)=>`sha256:${createHash('sha256').update(authorStableJson(v)).digest('hex')}`
const context=read(`${R}/full-read-ownership-scope.context.exact.json`)
const origins=read(`${R}/current-effective-requires.full-origin-paths.json`)
const schemaPath=`${R}/author-ledger.schema.json`
const ledgerPath=`${R}/semantic-role-ownership-scope.author-ledger.final.json`
const ajv=new Ajv2020({allErrors:true,strict:false})
const schemaCheck=ajv.compile(read(schemaPath))
const ledger=read(ledgerPath)
const byGoal=new Map(context.records.map((r:any)=>[r.goalId,r]))
const byOrigin=new Map(origins.records.map((r:any)=>[r.goalId,r]))
const sourceDocs=new Map(context.configuredFamily.paths.map((p:string)=>[p,read(p)]))
const authorCache=new Map<string,any>()
const author=(p:string)=>{if(!authorCache.has(p))authorCache.set(p,read(p));return authorCache.get(p)}
const amendment=read(`${R}/root-role.author-amendment.json`)
const allFrozen=new Map<string,string>([...context.frozenInputs,...origins.frozenInputFiles].map((x:any)=>[x.path,x.sha256]))
for(const [path,hash]of allFrozen)if(fileFingerprint(path)!==hash)throw new Error(`Changed frozen input ${path}`)
for(const node of origins.pathNodes)for(const occ of node.actualOccurrences){
 if(fileFingerprint(occ.path)!==occ.fileSha256)throw new Error(`Changed origin file ${occ.path}`)
 const actual=read(occ.path).goals.find((g:any)=>node.key.endsWith(`:${g.id}`))
 eq(actual,occ.fullGoal,`Origin payload mismatch ${node.key}`)
 if(fingerprint(actual)!==occ.fullGoalSha256)throw new Error(`Origin hash ${node.key}`)
}
const nodes=new Map<string,any>(origins.pathNodes.map((n:any)=>[n.key,n]))
let checkedPaths=0
for(const row of origins.records)for(const op of row.effectiveOriginContainsPaths){
 for(const path of op.containsInheritancePaths){
  if(path[0]!==op.origin.declaredByKey || path.at(-1)!==row.selectedOccurrenceKey)throw new Error('Origin endpoints')
  for(let i=0;i<path.length-1;i++){
   const n=nodes.get(path[i]);const target=path[i+1].split(':').at(-1)
   if(!n.actualOccurrences.some((o:any)=>(o.fullGoal.contains??[]).some((r:string)=>r.split(':').at(-1)===target)))throw new Error('Unwitnessed contains step')
  }
  checkedPaths++
 }
 const n=nodes.get(op.origin.declaredByKey)
 if(!n.actualOccurrences.some((o:any)=>(o.fullGoal.requires??[]).includes(op.origin.reference)))throw new Error('Unwitnessed requires origin')
}
function check(candidate:any){
 if(!schemaCheck(candidate))throw new Error(`Schema: ${ajv.errorsText(schemaCheck.errors)}`)
 if(new Set(candidate.entries.map((e:any)=>e.goalId)).size!==539)throw new Error('Stable-ID coverage')
 if(candidate.exactInventorySha256!==fileFingerprint(candidate.exactInventoryPath))throw new Error('Inventory binding')
 let leaves=0
 for(const e of candidate.entries){
  const row:any=byGoal.get(e.goalId);if(!row)throw new Error('Foreign goal in ledger')
  const doc:any=sourceDocs.get(e.sourcePath);const g=doc.goals[e.sourceIndex]
  if(g?.id!==e.goalId)throw new Error('Index/definition binding')
  if(fileFingerprint(e.sourcePath)!==e.sourceFileSha256 || fingerprint(g)!==e.fullGoalSha256)throw new Error('Original full definition changed')
  eq(e.originalDescription,g.description??null,'DE full text');eq(e.originalDescriptionEn,g.descriptionEn??null,'EN full text')
  if(e.fullDescriptionSha256!==fingerprint({description:g.description??null,descriptionEn:g.descriptionEn??null}))throw new Error('Description-pair hash')
  if(e.contextRecordSha256!==fingerprint(row)||e.selectedOccurrenceSha256!==fingerprint(row.selectedOccurrence))throw new Error('Occurrence/context binding')
  eq(e.inventoryAuthoritativeOwner,row.inventoryAuthoritativeOwner,'Owner silently chosen')
  if(e.actualOwnerOccurrences.length!==row.allActualActiveOccurrences.length)throw new Error('Owner occurrence omitted')
  for(const o of e.actualOwnerOccurrences){const x=row.allActualActiveOccurrences.find((v:any)=>v.inventoryOccurrence.path===o.path);if(!x||o.fileSha256!==x.pathFileSha256||o.goalDefinitionSha256!==x.actualGoalSha256)throw new Error('Owner occurrence binding')}
  eq(e.currentDirectRequiresObserved,g.requires??[],'Direct requires modified')
  eq(e.currentDirectContainsObserved,g.contains??[],'Direct contains modified')
  eq(e.currentEffectivePrerequisitesObserved,row.currentEffectivePrerequisites,'Effective prereq changed')
  eq(e.authoredSourceState,row.sourceState,'Source evidence invented or dropped')
  if(e.fullOriginPathRecordSha256!==fingerprint(byOrigin.get(e.goalId)))throw new Error('Full origin paths binding')
  if(fileFingerprint(e.authorInputPath)!==e.authorInputSha256)throw new Error('Author input changed')
  const a=author(e.authorInputPath).entries[e.sourceIndex]
  if(a.goalId!==e.goalId||e.authorInputEntrySha256!==authorEntryFingerprint(a))throw new Error(`Individual author judgment not bound ${e.goalId}`)
  if(a.actualSubject!==e.actualSubject)throw new Error('Subject silently substituted')
  const role=e.goalId===amendment.goalId?amendment.newAuthorRole:a.semanticRole
  const reason=e.goalId===amendment.goalId?amendment.reason:(a.classificationReason??a.reason)
  if(e.semanticRoleAuthorCandidate!==role||e.individualContentReason!==reason)throw new Error('Individual role/reason silently substituted')
  if(/\\u[0-9a-f]{4}/i.test(e.individualContentReason))throw new Error('Literal escaped user text')
  const leaf=!(g.contains??[]).length;if(leaf!==e.technicalLeafObserved)throw new Error('Technical leaf/semantics conflated');if(leaf)leaves++
 }
 if(leaves!==428)throw new Error('Leaf coverage')
 return true
}
check(ledger)
const probes:any[]=[]
function rejects(name:string,mutate:(x:any)=>void){const x=structuredClone(ledger);mutate(x);let error='';try{check(x)}catch(e){error=String(e)}if(!error)throw new Error(`Unsafe mutation accepted: ${name}`);probes.push({name,expected:'reject',actual:'reject',evidence:error})}
rejects('missing stable goal cannot masquerade as complete read',x=>x.entries.pop())
rejects('duplicate stable goal cannot cover omitted content',x=>x.entries[1]=structuredClone(x.entries[0]))
rejects('shared motivator cannot silently select an owner',x=>x.entries.find((e:any)=>e.goalId==='eb9048a4-9cb9-5aaf-8a91-aeba08e05b0c').inventoryAuthoritativeOwner='chosen-by-author')
rejects('missing integral payload cannot be reconstructed invisibly',x=>x.entries.find((e:any)=>e.sourcePath.endsWith('Mathematik.json')&&e.sourceIndex===249).originalDescription='Integrate standard reciprocal and exponential functions.')
rejects('generic scraper base cannot become per-goal source',x=>x.entries[5].authoredSourceState.authoredSourceRef={url:'https://www.lehrplanplus.bayern.de/'})
rejects('broad arithmetic cannot silently become narrow Math atom',x=>x.entries.find((e:any)=>e.sourcePath.endsWith('Mathematik.json')&&e.sourceIndex===5).semanticRoleAuthorCandidate='assessable_narrow_atomic_candidate')
rejects('observed direct requires cannot gain a Math dependency',x=>x.entries.find((e:any)=>e.sourcePath.endsWith('Physik.json')&&e.sourceIndex===2).currentDirectRequiresObserved.push('fake-math-prerequisite'))
rejects('child author cannot be called independent reviewer',x=>x.authorContributors[1].independenceClaim=true)
rejects('native approval cannot be manufactured by inventory',x=>x.entries[3].nativeM7Status='approved')
const receipt={schemaVersion:1,status:'completed_read_only_integrity_and_schema_validation_no_semantic_approval',createdAt:new Date().toISOString(),ledgerPath,ledgerSha256:fileFingerprint(ledgerPath),schemaPath,schemaSha256:fileFingerprint(schemaPath),goalDefinitionsChecked:539,technicalLeavesChecked:428,frozenInputFilesChecked:allFrozen.size,fullContainsOriginPathsChecked:checkedPaths,negativeIntegrityProbes:probes,positiveChecks:['Full 539-goal definition/DE+existing EN/occurrence hash binding','Full current repository graph effective-prerequisite replay captured separately','All current origin paths have actual declared requires and contains-step witnesses','All actual stable-ID occurrences retained; no authoritative owner selected','All individual parent/child AUTHOR judgments preserved with bounded root amendment','Full raw original source and old author inputs unchanged'],semanticApprovalClaimed:false,nativeM7Claimed:false,license:'Apache-2.0',frozenInputs:[...allFrozen].sort().map(([path,sha256])=>({path,sha256}))}
if(process.argv.includes('--write-receipt'))writeFileSync(`${R}/schema-hash-integrity-validation.receipt.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({goals:539,leaves:428,paths:checkedPaths,frozenInputs:allFrozen.size,negativeProbes:probes.length,ledgerSha256:receipt.ledgerSha256}))
