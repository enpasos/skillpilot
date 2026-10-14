// SPDX-License-Identifier: Apache-2.0
// Exact revision/unchanged-content proofs and negative integrity probes only.
import {readFileSync,writeFileSync}from 'node:fs'
import {createHash}from 'node:crypto'
import Ajv2020 from '../../../app/node_modules/ajv/dist/2020.js'
const R='tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v2'
const V1='tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
const P='tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const fileSha=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const stable=(v:any):string=>Array.isArray(v)?`[${v.map(stable).join(',')}]`:v&&typeof v==='object'?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`:JSON.stringify(v)
const fp=(v:any)=>`sha256:${createHash('sha256').update(stable(v)).digest('hex')}`
const eq=(a:any,b:any,msg:string)=>{if(fp(a)!==fp(b))throw new Error(msg)}
const original=read(`${V1}/semantic-role-ownership-scope.author-ledger.final.json`)
const peer=read(`${P}/semantic-owner-scope.independent-review-v1.json`)
const vm=read(`${V1}/manifest.json`),pm=read(`${P}/manifest.independent-review-v1.json`)
if(fileSha(`${V1}/manifest.json`)!=='sha256:0e8c9b53b86cb3b1a184f14276e187f7d36e3ec850814e2df68dbf15273efec4')throw new Error('V1 author manifest changed')
if(fileSha(`${P}/manifest.independent-review-v1.json`)!=='sha256:de7f25457d57654cc8480eba70e3afe5367d4548835c36e477a249696d8bca1a')throw new Error('V1 peer manifest changed')
const allOld=new Map<string,string>([...vm.sealedArtifacts,...vm.frozenInputFiles,...pm.artifacts].map((x:any)=>[x.path,x.sha256]))
for(const [p,h]of allOld)if(fileSha(p)!==h)throw new Error(`Old sealed/frozen input changed ${p}`)
const originalBy=new Map(original.entries.map((e:any)=>[e.goalId,e]))
const peerBy=new Map(peer.entries.map((e:any)=>[e.goalId,e]))
const expected40=new Set(peer.entries.filter((e:any)=>e.candidateClassificationGate==='needs_revision').map((e:any)=>e.goalId))
const mathPath=`${R}/math-21-response.author.json`,physicsPath=`${R}/physics-40-response.author.json`
const responses=new Map<string,{path:string,case:any}>([...read(mathPath).entries.map((e:any)=>[e.goalId,{path:mathPath,case:e}]),...read(physicsPath).entries.map((e:any)=>[e.goalId,{path:physicsPath,case:e}])])
const regPath=`${R}/forty-cases.author-response.register.json`,unchangedPath=`${R}/unchanged499.preservation-witness.json`
const register=read(regPath),unchanged=read(unchangedPath)
const ledgerPath=`${R}/semantic-role-ownership-scope.author-ledger.v2.json`,schemaPath=`${R}/author-ledger.v2.schema.json`
const ledger=read(ledgerPath),schemaCheck=new Ajv2020({allErrors:true,strict:false}).compile(read(schemaPath))
const sourceDocs=new Map(original.entries.map((e:any)=>[e.sourcePath,read(e.sourcePath)]))
const protectedFields=['goalId','sourcePath','sourceIndex','sourceFileSha256','fullGoalSha256','fullDescriptionSha256','originalTitle','originalDescription','originalDescriptionEn','technicalLeafObserved','contextPath','contextFileSha256','contextRecordSha256','selectedOccurrenceKey','selectedOccurrenceSha256','inventoryAuthoritativeOwner','definitionStatus','actualOwnerOccurrences','currentDirectRequiresObserved','currentDirectContainsObserved','currentEffectivePrerequisitesObserved','currentEffectivePrerequisiteSetSha256','currentEffectiveOriginsSha256','fullOriginPathWitnessPath','fullOriginPathWitnessSha256','fullOriginPathRecordSha256','literalScopeContext','authorCompatibilitySegmentKey','authoredSourceState','stageApplicability','englishDescriptionFieldPresent','activeRegistryWritten','requiresApprovalMade','authoritativeOwnerChosen','nativeM7Status']
function check(candidate:any){
 if(!schemaCheck(candidate))throw new Error(`Schema violation ${JSON.stringify(schemaCheck.errors?.[0])}`)
 if(new Set(candidate.entries.map((e:any)=>e.goalId)).size!==539)throw new Error('539 stable-ID coverage')
 if(candidate.exactV1AuthorManifest.sha256!==fileSha(candidate.exactV1AuthorManifest.path)||candidate.exactV1IndependentReviewManifest.sha256!==fileSha(candidate.exactV1IndependentReviewManifest.path))throw new Error('Exact previous manifest binding')
 let revised=0,untouched=0,leaves=0
 for(const e of candidate.entries){
  const old:any=originalBy.get(e.goalId);if(!old)throw new Error('Unrecognized source stable ID')
  for(const field of protectedFields)eq(e[field],old[field],`Protected source/scope/owner/requires changed ${e.goalId}.${field}`)
  const doc:any=sourceDocs.get(e.sourcePath);const g=doc.goals[e.sourceIndex]
  if(g?.id!==e.goalId||fp(g)!==e.fullGoalSha256||fileSha(e.sourcePath)!==e.sourceFileSha256)throw new Error('Actual complete current definition binding')
  if(!g.contains?.length)leaves++
  const bound=responses.get(e.goalId)
  if(!bound){eq(e,old,'One of unchanged 499 entries was silently revised');untouched++;continue}
  if(!expected40.has(e.goalId))throw new Error('Unrequested revision')
  revised++;const c=bound.case;const isMath=e.sourcePath.endsWith('Mathematik.json');const p:any=peerBy.get(e.goalId)
  eq(c.fullCurrentGoal,g,'Response does not bind full current source goal')
  eq(isMath?c.exactV1AuthorEntry:c.exactV1AuthorLedgerEntry,old,'Wrong old author entry')
  eq(isMath?c.exactV1PeerFinding:c.exactIndependentV1PeerEntry,p,'Peer critique rebound')
  if(e.authorInputPath!==bound.path||e.authorInputSha256!==fileSha(bound.path)||e.authorInputEntrySha256!==fp(c))throw new Error('New individual author response binding')
  eq(e.actualSubject,isMath?c.newActualSubject:c.actualSubject,'Actual-subject response silently changed')
  eq(e.semanticRoleAuthorCandidate,isMath?c.newSemanticRole:c.semanticRoleAuthorCandidate,'Individual role response silently changed')
  eq(e.individualContentReason,c.individualContentReason,'Individual reason response silently changed')
  const v=e.v2ResponseOnExactPeerFinding
  if(!v||v.responseInputPath!==bound.path||v.responseCaseSha256PythonCodePoint!==fp(c)||v.v1AuthorEntrySha256PythonCodePoint!==fp(old)||v.v1PeerEntrySha256PythonCodePoint!==fp(p))throw new Error('40 exact case response omission/binding')
  eq(v.exactPeerRationale,p.individualScientificRationale,'Peer rationale lost')
  eq(v.individualAuthorResponse,isMath?c.responseToExactPeerFinding:c.individualPeerResponse,'Bounded exact finding answer lost')
  eq(v.retainedLearnerEvidenceAuthorNotes,isMath?c.retainedLearnerEvidence:c.learnerPhysicsEvidenceRequiredAuthorNotes,'Actual learner evidence narrowed')
  eq(v.remainingOpenBoundariesAuthorNotes,isMath?c.remainingOpenBoundaries:c.remainingGranularityOrContentBoundsAuthorNotes,'Known open boundaries dropped')
  for(const k of ['mandatorySplitApproved','nativeAtomicityApproved','requiresApproved','sourceApproved','scopeApproved','ownerChosen','independentV2ReviewCompleted'])if(v[k]!==false)throw new Error(`Approval invented ${k}`)
  const actualBlocker=isMath?(e.sourceIndex===305?'Cramer singular-system cardinality is not determined by determinant alone.':[109,141,214,324].includes(e.sourceIndex)?'Original mathematical notation/domain/regularity needs precision.':null):c.specificContentBlocker
  eq(v.specificContentBlocker,actualBlocker,'Concrete precision/model blocker dropped')
  if(actualBlocker&&!e.blockers.some((b:any)=>b.kind==='concrete_content_precision_or_model_gap'&&b.detail===actualBlocker))throw new Error('Concrete content blocker hidden')
  if(/\\u[0-9a-f]{4}/i.test(e.individualContentReason))throw new Error('Literal Unicode escapes')
 }
 if(revised!==40||untouched!==499||leaves!==428)throw new Error('Revision/unchanged/leaf coverage')
 if(!candidate.liveAdoptionBoundary.all539RemainInert||candidate.liveAdoptionBoundary.publishedOrActivated)throw new Error('Runtime identity blocker bypassed')
 const formula=candidate.entries.find((e:any)=>e.goalId==='43e2025f-f393-5a41-aa42-ecb3b6ca35b8')
 if(formula.semanticRoleAuthorCandidate!=='admin_content_fragment'||!formula.originalDescription.includes('der Form , und sowie'))throw new Error('Source recovery pretends active goal repaired')
 return true
}
check(ledger)
if(register.entries.length!==40||unchanged.entries.length!==499)throw new Error('Witness/register coverage')
for(const r of register.entries){const e=ledger.entries.find((e:any)=>e.goalId===r.goalId);if(!expected40.has(r.goalId)||r.exactFinalV2EntrySha256PythonCodePoint!==fp(e)||r.exactPeerFindingSha256PythonCodePoint!==fp(peerBy.get(r.goalId)))throw new Error('40 register hash mismatch')}
for(const u of unchanged.entries){const e=ledger.entries.find((e:any)=>e.goalId===u.goalId);if(expected40.has(u.goalId)||u.exactOriginalEntrySha256PythonCodePoint!==fp(originalBy.get(u.goalId))||u.exactV2EntrySha256PythonCodePoint!==fp(e))throw new Error('499 witness hash mismatch')}
for(const [oldName,newName]of [['compatibility-segments.author-candidate.json','preserved.compatibility-segments.v1.json'],['literal-program-segments.author-context.json','preserved.literal-program-segments.v1.json']])if(fileSha(`${V1}/${oldName}`)!==fileSha(`${R}/${newName}`))throw new Error('Literal 21/101 scope contexts changed')
const probes:any[]=[]
const caseAt=(x:any,path:string,index:number)=>x.entries.find((e:any)=>e.sourcePath.endsWith(path)&&e.sourceIndex===index)
function rejects(name:string,mutate:(x:any)=>void){const x=structuredClone(ledger);mutate(x);let reason='';try{check(x)}catch(e){reason=String(e)}if(!reason)throw new Error(`Unsafe mutation accepted ${name}`);probes.push({name,expected:'reject',actual:'reject',actualRejection:reason})}
rejects('omitted source entry',x=>x.entries.pop())
rejects('duplicate stable ID replacing distinct goal',x=>x.entries[2]=structuredClone(x.entries[0]))
rejects('silent revision of accepted unchanged row',x=>caseAt(x,'Mathematik.json',5).individualContentReason='Rewritten without exact peer finding')
rejects('selected owner for shared motivator',x=>x.entries.find((e:any)=>e.goalId==='eb9048a4-9cb9-5aaf-8a91-aeba08e05b0c').inventoryAuthoritativeOwner='new-owner')
rejects('added Math edge',x=>caseAt(x,'Physik.json',12).currentDirectRequiresObserved.push('new-math-edge'))
rejects('one of 40 exact peer answers omitted',x=>delete caseAt(x,'Mathematik.json',305).v2ResponseOnExactPeerFinding)
rejects('blanket narrow upgrade of open cases',x=>x.entries.forEach((e:any)=>{if(expected40.has(e.goalId))e.semanticRoleAuthorCandidate='assessable_narrow_atomic_candidate'}))
rejects('momentary-speed evidence dropped',x=>caseAt(x,'Physik.json',4).v2ResponseOnExactPeerFinding.retainedLearnerEvidenceAuthorNotes.pop())
rejects('known time-model blocker dropped',x=>caseAt(x,'Physik.json',143).v2ResponseOnExactPeerFinding.specificContentBlocker=null)
rejects('Cramer source precision blocker hidden',x=>caseAt(x,'Mathematik.json',305).blockers=caseAt(x,'Mathematik.json',305).blockers.filter((b:any)=>b.kind!=='concrete_content_precision_or_model_gap'))
rejects('recovered source formula silently inserted into local goal',x=>caseAt(x,'Mathematik.json',249).originalDescription='Now complete three recovered integral forms')
rejects('source recovery treated as native atomicity',x=>caseAt(x,'Mathematik.json',305).v2ResponseOnExactPeerFinding.nativeAtomicityApproved=true)
rejects('old peer approval transferred to new v2 input',x=>caseAt(x,'Physik.json',19).v2ResponseOnExactPeerFinding.independentV2ReviewCompleted=true)
rejects('child author portrayed as independent reviewer',x=>x.authorContributors[2].independenceClaim=true)
rejects('runtime collision block bypassed',x=>x.liveAdoptionBoundary.all539RemainInert=false)
rejects('scope profile silently broadened',x=>caseAt(x,'Mathematik.json',98).literalScopeContext[0].profileAbbreviationsLiteral=['ABU','T'])
const receipt={schemaVersion:2,status:'completed_v2_schema_exact_binding_coverage_and_negative_integrity_validation_no_content_approval',recordedAt:new Date().toISOString(),ledgerPath,ledgerSha256:fileSha(ledgerPath),schemaPath,schemaSha256:fileSha(schemaPath),all539DefinitionsAndPreservedFactsChecked:true,exact40PeerResponsesChecked:true,exact499UnchangedEntriesChecked:true,technicalLeafCount:428,originalV1AuthorArtifactsChecked:vm.sealedArtifacts.length,original558FrozenInputsChecked:vm.frozenInputFiles.length,originalV1IndependentArtifactsChecked:pm.artifacts.length,literal21And101ContextsByteIdentical:true,negativeIntegrityProbes:probes,meaningfulAnalyticalContentProbeReceiptPath:`${R}/content-precision-probes.receipt.json`,meaningfulAnalyticalContentProbeReceiptSha256:fileSha(`${R}/content-precision-probes.receipt.json`),differentIdentityV2ContentReview:'pending',nativeRequiresOwnerSourceScopeApprovals:0,activeGraphChanges:0,license:'Apache-2.0'}
if(process.argv.includes('--write-receipt'))writeFileSync(`${R}/schema-hash-coverage-negative-validation.v2.receipt.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({ledgerSha256:receipt.ledgerSha256,goals:539,exactRevisions:40,unchanged:499,negativeProbes:probes.length,all558FrozenInputsUnchanged:true}))
