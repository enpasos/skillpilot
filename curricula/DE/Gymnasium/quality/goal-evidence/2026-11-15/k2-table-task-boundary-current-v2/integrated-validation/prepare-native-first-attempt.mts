import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal,stableGoalBookJson} from '../../app/scripts/goalBookModel.ts'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile} from '../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=process.cwd(),tmp='tmp/pr157-phase-guard-ci-repair-20261115',base='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2'
const prior='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-elementary-representations-current-v1'
const dbase='curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-11-15/k2-table-task-boundary-current-v2'
const bookpath='app/scripts/config/goal-books/de-gym-math-table-task-boundary-current-20261115-v2.json'
const rd=(p:string)=>readFileSync(resolve(root,p)),js=(p:string)=>JSON.parse(String(rd(p))),sha=(v:Buffer|string)=>'sha256:'+createHash('sha256').update(v).digest('hex')
const put=(p:string,v:unknown)=>{mkdirSync(dirname(resolve(root,p)),{recursive:true});writeFileSync(resolve(root,p),JSON.stringify(v,null,2)+'\n')}
const fid='f39c49c7-003b-471a-a33e-6cfea1d7b7b1',tid='54ce7136-5bdd-5d36-b0a5-f9a781bff82a'
const review=base+'/root-current-content-review.md',reviewSha=sha(rd(review))
if(!String(rd(review)).includes('Accept the unchanged full P'))throw Error('Actual root P decision missing')
const landscape=js('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
for(const e of js(tmp+'/author/candidate-payload.json').edits)if(stableGoalBookJson(by.get(e.goalId))!==stableGoalBookJson(e.after))throw Error('Candidate drift')
const ledgerPath='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',ledger=js(ledgerPath),semantic=[]
for(const id of [fid,tid]){const r=ledger.decisions.find((r:any)=>r.goalId===id);const before=structuredClone(r);if(r.semanticKind!==(id===fid?'curricularAtomic':'practiceAssessment'))throw Error('Semantic kind mismatch');r.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(id));semantic.push({goalId:id,before,after:structuredClone(r),actualDecision:review})}
put(ledgerPath,ledger)
const oldconfig=js(prior+'/current-f39c49c7.config.json'),old=js(oldconfig.reviewPath),g=by.get(fid)
const criteria=sha(rd(oldconfig.reviewCriteriaPath));if(criteria!==old.reviewCriteriaFingerprint)throw Error('Criteria drift')
const resources:Record<string,string>={};for(const r of g.resourceLinks??[])if(r.type==='goal-visualization')resources[r.url]=sha(rd('app/public'+r.url))
const record=structuredClone(old);record.reviewId='canonical-math-k2-table-task-boundary-current-f39-20261115-v2'
record.goalFingerprint=fingerprintGoalForPositiveEvidence(g,'curricularAtomic');record.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(record.profile)
record.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(g,criteria,resources,'curricularAtomic')
if(record.goalFingerprint!==old.goalFingerprint||record.profileFingerprint!==old.profileFingerprint||record.reviewInputFingerprint===old.reviewInputFingerprint)throw Error('Unexpected P binding delta')
record.reviewedAt=new Date().toISOString();record.reviewer='root-actual-table-task-boundary-content-review-20261115'
record.reason='Actual root reading of complete DE/EN goal, unchanged full P, both cases and original image, and complete DE/EN Task54/rubric: '+review+' ('+reviewSha+'). Generic table organisation does not require full rational-number-line ordering; the stronger J6 task retains exactly its prior transitive preparation through a direct requirement. Exact full P remains unchanged. Actual AI content review only, no human approval, learner trial or native D dual-round claim.'
record.status='needs_human_review';record.reviewAuthority='ai_candidate';record.reviewRunIds=[];record.dissent=[]
const ppath=base+'/current-f39c49c7.review.jsonl',cpath=base+'/current-f39c49c7.config.json'
writeFileSync(resolve(root,ppath),JSON.stringify(record)+'\n')
put(cpath,{...oldconfig,reviewId:record.reviewId,reviewPath:ppath,reviewRunManifestPaths:[],scope:{label:'Current full table competency with numeric readiness at the stronger assessment boundary',goalIds:[fid]}})
const deepPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',deep=js(deepPath),math=deep.subjects.find((s:any)=>s.subject==='mathematik')
if(math.positiveEvidenceConfigPaths.filter((p:string)=>p===prior+'/current-f39c49c7.config.json').length!==1)throw Error('Expected exactly one old active P source')
math.positiveEvidenceConfigPaths=math.positiveEvidenceConfigPaths.map((p:string)=>p===prior+'/current-f39c49c7.config.json'?cpath:p);put(deepPath,deep)
const book=js('app/scripts/config/goal-books/de-gym-math-elementary-current-20261115-v1.json')
book.bookId='de-gym-math-table-task-boundary-current-20261115-v2';book.title='Tabellenkompetenz und rationale Vorbereitung: aktuelle vollständige Seiten';book.outputPath='tmp/goal-books/'+book.bookId+'.book-model.json'
book.evidenceReviewPaths=book.evidenceReviewPaths.map((p:string)=>p===oldconfig.reviewPath?ppath:p)
book.evidenceReviewPaths.push('curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-units-source-bound-p-20260924-v1/retained-batch-002-unaffected-21.review.jsonl')
// Keep the existing native subject-book policy: 20 subject documents. The
// overview is a cross-subject navigation root, not an ordinary book source.
// Complete G17 and the author W audit separately include all 21 catalog roots.
if(book.externalLandscapePaths.length!==19)throw Error('Subject inventory drift')
put(bookpath,book)
const batch=js(tmp+'/author/native-D-two-affected-pages.config.json');batch.baseGoalBookConfigPath=bookpath;batch.outputDirectory=dbase;put(dbase+'.config.json',batch)
put(base+'/native-preparation.actual.json',{preparedAt:new Date().toISOString(),actualRootReview:review,rootReviewSha256:reviewSha,semanticDecisions:semantic,oldPositiveConfig:prior+'/current-f39c49c7.config.json',newPositiveConfig:cpath,oldPositiveRecord:old,newPositiveRecord:record,resourceDigests:resources,fullProfileUnchanged:true,f6PositiveRecordUnchanged:true,bookConfig:bookpath,DConfig:dbase+'.config.json',DActivated:false,wholeCatalogRootsSeparatelyAudited:21,subjectBookDocuments:20})
console.log(JSON.stringify({semanticIds:semantic.map(x=>x.goalId),newPositiveConfig:cpath,DConfig:dbase+'.config.json',DActivated:false}))
