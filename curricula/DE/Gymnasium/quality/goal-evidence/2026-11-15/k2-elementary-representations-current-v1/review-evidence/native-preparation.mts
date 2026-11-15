// SPDX-License-Identifier: Apache-2.0
// Materialize actual independently reviewed current content, never D decisions.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,copyFileSync,existsSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal,stableGoalBookJson} from '../../app/scripts/goalBookModel.ts'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile} from '../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const tmp=dirname(fileURLToPath(import.meta.url)),root=resolve(tmp,'../..')
const NORMAL='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-elementary-representations-current-v1'
const EVIDENCE=NORMAL+'/review-evidence',CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const LEDGER='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const DEEP='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const BOOK='app/scripts/config/goal-books/de-gym-math-elementary-current-20261115-v1.json'
const DBASE='curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-11-15/k2-elementary-representations-current-v1'
const DBATCH=DBASE+'.config.json'
const raw=(p:string)=>readFileSync(resolve(root,p))
const json=(p:string)=>JSON.parse(String(raw(p)))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const dump=(p:string,v:unknown)=>{const a=resolve(root,p);mkdirSync(dirname(a),{recursive:true});writeFileSync(a,JSON.stringify(v,null,2)+'\n')}
const equal=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const payload=JSON.parse(readFileSync(resolve(tmp,'candidate-payload.json'),'utf8'))
const candidate=JSON.parse(readFileSync(resolve(tmp,'candidate-manifest.actual.json'),'utf8'))
const review=JSON.parse(readFileSync(resolve(tmp,'independent-final-review/review-manifest.actual.json'),'utf8'))
const approval=JSON.parse(readFileSync(resolve(tmp,'independent-final-review/decision.actual.json'),'utf8'))
const candidateSha=sha(readFileSync(resolve(tmp,'candidate-manifest.actual.json')))
if(approval.decision!=='approve_content'||approval.blockingFindings.length||approval.sealedCandidateManifestSha256!==candidateSha)throw Error('Missing exact independent content approval')
const sources:any[]=[]
const preserve=(source:string,dest:string,expected?:string)=>{const bytes=readFileSync(source);if(expected&&sha(bytes)!==expected)throw Error('Sealed input drift: '+source);const absolute=resolve(root,dest);mkdirSync(dirname(absolute),{recursive:true});if(existsSync(absolute)&&!readFileSync(absolute).equals(bytes))throw Error('Immutable destination differs: '+dest);copyFileSync(source,absolute);sources.push({originalLocator:relative(root,source),retainedPath:dest,sha256:sha(bytes),bytes:bytes.length})}
for(const f of candidate.files)preserve(resolve(tmp,f.path),EVIDENCE+'/candidate/'+f.path,f.sha256)
preserve(resolve(tmp,'candidate-manifest.actual.json'),EVIDENCE+'/candidate/candidate-manifest.actual.json',candidateSha)
for(const f of review.reviewFiles)preserve(resolve(tmp,'independent-final-review',f.path),EVIDENCE+'/independent-content-review/'+f.path,f.sha256)
preserve(resolve(tmp,'independent-final-review/review-manifest.actual.json'),EVIDENCE+'/independent-content-review/review-manifest.actual.json')
preserve(fileURLToPath(import.meta.url),EVIDENCE+'/native-preparation.mts')
dump(NORMAL+'/source-locator-map.actual.json',{contract:'exact-original-locator-to-committable-evidence-v1',candidateManifestSha256:candidateSha,independentApprovalPath:EVIDENCE+'/independent-content-review/decision.actual.json',candidateFiles:candidate.files.length,reviewFiles:review.reviewFiles.length,files:sources,meaning:'Byte-exact original candidate and independent review retention. Source locators are historical provenance; retained paths are current repository evidence. No run/model/result claim is synthesized.'})
const landscape=json(CANON),by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const beforeRelease=structuredClone(landscape)
for(const e of payload.ordinaryGoalEdits)if(!equal(by.get(e.goalId),e.after))throw Error('Current reviewed ordinary goal differs: '+e.goalId)
for(const e of payload.parentEdits)if(!equal(by.get(e.after.id),e.after))throw Error('Current reviewed parent differs')
const contentApproval=EVIDENCE+'/independent-content-review/review.md'
const releaseRows=[]
for(const proposed of payload.newAssessments){const g=by.get(proposed.id);if(!equal(g,proposed))throw Error('New exam no longer exact candidate '+proposed.id)
 const before=structuredClone(g);g.examData.reviewStatus='released';g.examData.reviewNote='Released for curriculum assessment use after genuine independent current-content review on 2026-11-15 by /root/elementary_diagram_content_review (requested GPT 6.1 Sol Ultra; deployment not independently attested). Exact candidate manifest '+candidateSha+'; approval and 34 explicit answer-counterexample judgments: '+contentApproval+'. The native task/solution/scoring/coverage content is unchanged. AI content review, not human approval, learner trial, native D dual-review, production deployment or learner-result transfer.'
 const allowed=structuredClone(g);allowed.examData.reviewStatus=before.examData.reviewStatus;allowed.examData.reviewNote=before.examData.reviewNote;if(!equal(allowed,before))throw Error('Non-metadata release change')
 releaseRows.push({goalId:g.id,changedFields:['examData.reviewStatus','examData.reviewNote'],before,after:structuredClone(g),contentApproval})
}
dump(CANON,landscape)
const kinds=json(LEDGER),decisions=new Map<string,any>(kinds.decisions.map((x:any)=>[x.goalId,x]));const semanticRows=[]
const semanticIds=[...payload.ordinaryGoalEdits.map((x:any)=>x.goalId),...payload.parentEdits.map((x:any)=>x.after.id),...payload.newAssessments.map((x:any)=>x.id)]
for(const id of semanticIds){const goal=by.get(id),before=decisions.has(id)?structuredClone(decisions.get(id)):null
 const ordinary=payload.ordinaryGoalEdits.some((x:any)=>x.goalId===id),isParent=payload.parentEdits.some((x:any)=>x.after.id===id)
 const kind=ordinary?'curricularAtomic':'practiceAssessment'
 if(before&&before.semanticKind!==kind)throw Error('Unexpected previous kind '+id)
 const after={goalId:id,sourceFingerprint:fingerprintSemanticKindSourceGoal(goal),semanticKind:kind,decisionStatus:'authoritative',decisionBasis:ordinary?'reviewed-current-semantic-recheck-curricular-atomic':isParent?'individually-reviewed-route-assessment-follow-up-2026-08-16':'reviewed-current-pilot-practice-assessment'}
 if(before)Object.assign(decisions.get(id),after);else{kinds.decisions.push(after);decisions.set(id,after)}
 semanticRows.push({goalId:id,before,after,classificationReason:ordinary?'Unchanged complete assessable content competence; reviewed rational readiness prerequisites change its input without changing its semantic kind.':isParent?'Existing exam aggregation folder remains a practiceAssessment structure; only three actual reviewed examination children are appended.':'Terminal independent task with complete localized materials/solution/analytic rubric and exact one-target coverage, not a new ordinary competence.',contentReview:contentApproval})
}
kinds.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId,'en'))
for(const key of Object.keys(kinds.counts))kinds.counts[key]=key==='total'?kinds.decisions.length:kinds.decisions.filter((x:any)=>x.semanticKind===key).length
if(kinds.counts.curricularAtomic!==807||semanticRows.length!==8)throw Error('Unexpected semantic scope')
dump(LEDGER,kinds)
const originals=JSON.parse(readFileSync(resolve(tmp,'current-four-positive-profiles.actual.json'),'utf8'))
const now='2026-11-15T08:17:17Z',pConfigs:string[]=[],pReviews:string[]=[],pRows:any[]=[]
for(const x of originals){const current=by.get(x.record.goalId),prefix=current.id.slice(0,8),cfg=json(x.configPath),original=x.record
 const criteriaSha=sha(raw(cfg.reviewCriteriaPath));if(criteriaSha!==original.reviewCriteriaFingerprint)throw Error('Criteria changed')
 const resourceDigests:Record<string,string>={};for(const r of current.resourceLinks??[])if(r.type==='goal-visualization')resourceDigests[r.url]=sha(raw('app/public'+r.url))
 const record=structuredClone(original),reviewId='canonical-math-k2-elementary-current-'+prefix+'-20261115-v1'
 record.reviewId=reviewId;record.goalFingerprint=fingerprintGoalForPositiveEvidence(current,'curricularAtomic');if(record.goalFingerprint!==original.goalFingerprint)throw Error('Semantic P goal meaning changed '+prefix)
 record.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(current,criteriaSha,resourceDigests,'curricularAtomic')
 record.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(record.profile);if(record.profileFingerprint!==original.profileFingerprint)throw Error('Unchanged profile fingerprint differs')
 if(record.reviewInputFingerprint===original.reviewInputFingerprint)throw Error('Current P input must actually change')
 record.status='needs_human_review';record.reviewAuthority='ai_candidate';record.reviewedAt=now;record.reviewer='native-materializer-after-independent-elementary-content-review-20261115'
 record.reason='Complete unchanged bilingual expectations, transfer requirements, variation axes and application cases independently reviewed against the actual new prerequisite context by /root/elementary_diagram_content_review; exact current rationale and 34 explicit answer judgments retained at '+contentApproval+'. This materializer records that actual AI content decision with native current fingerprints and exact existing image digests; it does not claim a human approval or an independent native D review. Full candidate '+candidateSha+'.'
 record.reviewRunIds=[];record.dissent=[]
 const path=NORMAL+'/current-'+prefix+'.review.jsonl',cp=NORMAL+'/current-'+prefix+'.config.json'
 mkdirSync(dirname(resolve(root,path)),{recursive:true});writeFileSync(resolve(root,path),JSON.stringify(record)+'\n')
 const config={...cfg,reviewId,reviewPath:path,reviewRunManifestPaths:[],scope:{label:'Actual independently content-reviewed K2 elementary current prerequisite context, '+prefix,goalIds:[current.id]}}
 dump(cp,config);pConfigs.push(cp);pReviews.push(path)
 pRows.push({goalId:current.id,originalConfig:x.configPath,originalRecord:original,currentConfig:cp,currentRecord:record,resourceDigests,unchangedProfile:true,independentContentApproval:contentApproval})
}
const deep=json(DEEP),math=deep.subjects.find((x:any)=>x.subject==='mathematik'),scopeIds=new Set(originals.map((x:any)=>x.record.goalId)),retained=[]
const activeBefore=[...math.positiveEvidenceConfigPaths]
const currentReplacements=new Map<string,string>()
for(const source of [...new Set(originals.map((x:any)=>x.configPath))] as string[]){const cfg=json(source);const remaining=cfg.scope.goalIds.filter((i:string)=>!scopeIds.has(i))
 const sourceLines=String(raw(cfg.reviewPath)).split(/\r?\n/).filter(x=>x.trim());const remainingLines=sourceLines.filter(line=>!scopeIds.has(JSON.parse(line).goalId));if(remainingLines.length!==remaining.length)throw Error('Retained subset mismatch')
 const stem=source.includes('image-bound-six')?'image-bound-four-retained':'remainder-two-retained',cp=NORMAL+'/retained/'+stem+'.config.json',rp=NORMAL+'/retained/'+stem+'.review.jsonl'
 const subset={...cfg,reviewPath:rp,scope:{label:'Exact unchanged retained records from '+source+'; excludes only the reviewed four elementary K2 current inputs.',goalIds:remaining}}
 dump(cp,subset);mkdirSync(dirname(resolve(root,rp)),{recursive:true});writeFileSync(resolve(root,rp),remainingLines.join('\n')+'\n');currentReplacements.set(source,cp)
 retained.push({originalConfig:source,originalConfigSha256:sha(raw(source)),originalReview:cfg.reviewPath,originalReviewSha256:sha(raw(cfg.reviewPath)),retainedConfig:cp,retainedReview:rp,retainedGoalIds:remaining,recordsByteExact:remainingLines.every(line=>sourceLines.includes(line))})
}
math.positiveEvidenceConfigPaths=math.positiveEvidenceConfigPaths.map((p:string)=>currentReplacements.get(p)??p).concat(pConfigs)
const activeGoals=math.positiveEvidenceConfigPaths.flatMap((p:string)=>json(p).scope.goalIds);for(const id of scopeIds)if(activeGoals.filter((x:string)=>x===id).length!==1)throw Error('P active duplicate/missing '+id)
dump(DEEP,deep)
const book=json('app/scripts/config/goal-books/de-gym-math-national-atlas.json');book.bookId='de-gym-math-elementary-current-20261115-v1';book.title='Mathematik: vollständiger aktueller Atlas mit vier überprüften elementaren P-Profilen';book.evidenceReviewPaths=pReviews;book.outputPath='tmp/goal-books/de-gym-math-elementary-current-20261115-v1.book-model.json'
book.externalLandscapePaths=readdirSync(resolve(root,'curricula/DE/Gymnasium/canonical')).filter(n=>n.endsWith('.de.json')&&!n.includes('_MATHEMATIK.')).sort().map(n=>'curricula/DE/Gymnasium/canonical/'+n)
if(book.externalLandscapePaths.length!==20)throw Error('D base must have full21 current canonical context')
dump(BOOK,book)
const base=json('curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-11-13/late-function-class-prerequisite-current-v1.config.json')
const batch={...base,baseGoalBookConfigPath:BOOK,batchId:'mathematik-k2-elementary-representations-current-20261115-v1',bookId:'de-gym-math-k2-elementary-representations-current-20261115-v1',title:'Mathematik: Elementare Tabellen- und Diagrammziele mit gesichertem aktuellen Wissenskontext',goalIds:payload.ordinaryGoalEdits.map((x:any)=>x.goalId),outputDirectory:DBASE}
dump(DBATCH,batch)
dump(NORMAL+'/native-current-decisions.actual.json',{status:'independent-content-approved-native-current-bindings-and-D-preparation-only',reviewedAt:now,independentReviewer:approval.reviewer,independentApproval:EVIDENCE+'/independent-content-review/decision.actual.json',candidateManifestSha256:candidateSha,releaseRows,semanticRows,positiveEvidenceRows:pRows,retainedSubsets:retained,activePConfigsBefore:activeBefore,activePConfigsAfter:math.positiveEvidenceConfigPaths,bookConfig:BOOK,nativeDBatchConfig:DBATCH,nativeDActivated:false,ordinaryDPAComplete:false,scopeBoundary:'No D record authored; A/M/V bytes, full profile content, V9, source inputs and old task/result objects unchanged. Root must conduct genuine fresh blind native D dual review and final routes/status/floors/native CI.'})
const preserved=json('tmp/elementary-diagram-delivery-20261115/retained-evidence-pins.actual.json');for(const [p,digest] of Object.entries(preserved))if(sha(raw(p))!==digest)throw Error('Immutable source/V9 drift '+p)
const oldTask=beforeRelease.goals.find((g:any)=>g.id.startsWith('47c515c9'));if(!equal(oldTask,landscape.goals.find((g:any)=>g.id===oldTask.id)))throw Error('Old Task6 modified')
console.log(JSON.stringify({retainedCandidateFiles:candidate.files.length,retainedIndependentFiles:review.reviewFiles.length,semanticDecisions:semanticRows.length,releasedAssessments:releaseRows.length,currentPRecords:pRows.length,retainedPRecords:retained.map(x=>x.retainedGoalIds.length),PProfilesUnchanged:true,currentPConfigPaths:pConfigs,currentPReviewPaths:pReviews,customBookConfig:BOOK,currentCanonicalContextCount:book.externalLandscapePaths.length+1,nativeDBatchConfig:DBATCH,DActivated:false},null,2))
