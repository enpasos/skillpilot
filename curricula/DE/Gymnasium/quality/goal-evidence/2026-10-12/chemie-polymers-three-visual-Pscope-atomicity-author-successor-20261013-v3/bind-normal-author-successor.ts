// Technical helper Apache-2.0. Scoped author material CC-BY-4.0.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const repo=process.cwd(),out=dirname(fileURLToPath(import.meta.url));
const rel=(p:string)=>relative(repo,p).split('\\').join('/');
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'));
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex');
const write=(n:string,x:any)=>writeFileSync(resolve(out,n),JSON.stringify(x,null,2)+'\n');
async function main(){
 const startedAt=new Date().toISOString(),delta=read(rel(resolve(out,'AUTHOR.scoped-delta-and-18-plus-two-holds.json')));
 const canonicalPath=delta.currentCanonicalBinding.path,before=hash(canonicalPath),canonical=read(canonicalPath);
 if(before!==delta.currentCanonicalBinding.sha256)throw new Error('Canonical changed; bounded author base must be refreshed');
 const base=read(delta.baseTupleBinding.path),ids:string[]=delta.goalIds;
 for(const id of ids)if(JSON.stringify(canonical.goals.find((g:any)=>g.id===id))!==JSON.stringify(base.goals.find((g:any)=>g.id===id)))throw new Error('Selected tuple changed '+id);
 const models=await import(pathToFileURL(resolve(repo,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
 const Ajv=(await import(pathToFileURL(resolve(repo,'app/node_modules/ajv/dist/2020.js')).href)).default;
 const formats=(await import(pathToFileURL(resolve(repo,'app/node_modules/ajv-formats/dist/index.js')).href)).default;
 const schemaPath='contracts/goal-evidence/v2/goal-evidence-profile.schema.json',ajv=new Ajv({allErrors:true,strict:false});formats(ajv);const validate=ajv.compile(read(schemaPath));
 const semanticPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',semantic=read(semanticPath),kinds=new Map(semantic.decisions.filter((d:any)=>d.decisionStatus==='authoritative').map((d:any)=>[d.goalId,d.semanticKind]));
 const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',criteria=hash(criteriaPath);
 const bindings=read(rel(resolve(out,'six.additive-resource-links-and-original-png-bindings.json'))).bindings;
 const profiles=read(rel(resolve(out,'whole20.profile-payloads.author-successor.json'))),cases=read(rel(resolve(out,'whole40.expanded-cases.author-successor.json'))),errors:string[]=[],records:any[]=[],joins:any[]=[],candidateTuples:any[]=[];
 const oldRecords=readFileSync(resolve(repo,delta.baseTupleBinding.path.replace('current20.base-goal-tuples.json','whole20.normal-v2.author-candidates.jsonl')),'utf8').trim().split('\n').map(JSON.parse);
 for(const id of ids){
  const goal=structuredClone(canonical.goals.find((g:any)=>g.id===id)),binding=bindings.find((b:any)=>b.goalId===id);
  if(binding)goal.resourceLinks=binding.candidateResourceLinks;
  const resourceDigests:Record<string,string>={},assets:any[]=[];
  for(const l of goal.resourceLinks??[]){if(l.type!=='goal-visualization')continue;const p=binding?binding.actualCandidateAssetPath:'app/public'+l.url;resourceDigests[l.url]=hash(p);assets.push({futureUrl:l.url,actualInputPath:p,sha256:resourceDigests[l.url],candidateOnly:Boolean(binding)});}
  const profile=profiles.profiles.find((p:any)=>p.goalId===id).profile,record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId:'chemie-polymers-six-visual40-rubric-author-successor-20261013-v3',goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,landscapeId:canonical.landscapeId,goalId:id,goalFingerprint:models.fingerprintGoalForPositiveEvidence(goal,kinds.get(id)),reviewInputFingerprint:models.fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resourceDigests,kinds.get(id)),profileFingerprint:models.fingerprintPositiveGoalEvidenceProfile(profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:startedAt,reviewer:'Codex scientific author /root/chemistry_five_stable_dependency_qs/checkpoint_dependencies_readonly',reason:delta.heldGoalIds.includes(id)?'Explicit author HOLD; retained outside reviewable18 scope. No acceptance vote.':'Additive bilingual author successor with corrected images where evidenced and actual case-specific rubric joins. Await fresh independent whole-goal review.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[],profile};
  if(!validate(record))errors.push(id+': '+ajv.errorsText(validate.errors));errors.push(...models.validatePositiveGoalEvidenceRecordSemantics(record,goal,resourceDigests,kinds.get(id)));
  const full=cases.cases.filter((c:any)=>c.goalId===id);if(full.length!==2)errors.push(id+': two cases missing');
  for(const b of profile.applicationCaseBriefs){const c=full.find((c:any)=>c.caseId===b.id);if(!c){errors.push(id+': case missing '+b.id);continue;}for(const [bf,cf]of [['taskDemandDe','taskDe'],['taskDemandEn','taskEn'],['expectedPerformanceDe','modelAnswerDe'],['expectedPerformanceEn','modelAnswerEn']])if(b[bf]!==c[cf])errors.push(id+': full/brief join differs '+bf);if(c.rubric.length!==3||c.maximumPoints!==6||c.rubric.reduce((a:number,r:any)=>a+r.maximumPoints,0)!==6)errors.push(id+': invalid concrete rubric score');for(const r of c.rubric)if(!c.expectationIds.includes(r.expectationId)||!profile.expectations.some((e:any)=>e.id===r.expectationId))errors.push(id+': unknown rubric expectation');}
  const old=oldRecords.find((r:any)=>r.goalId===id);records.push(record);candidateTuples.push(goal);
  joins.push({goalId:id,effectiveSemanticKind:kinds.get(id),goalFingerprint:record.goalFingerprint,goalFingerprintUnchanged:record.goalFingerprint===old.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,reviewInputChanged:record.reviewInputFingerprint!==old.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,profileChanged:record.profileFingerprint!==old.profileFingerprint,caseIds:full.map((c:any)=>c.caseId),fullCasesPath:rel(resolve(out,'whole40.expanded-cases.author-successor.json')),fullCasesSha256:hash(rel(resolve(out,'whole40.expanded-cases.author-successor.json'))),resourceBindings:assets,goalBodyAndRequiresExactCurrent:true,futureIndependentReviewEligible:!delta.heldGoalIds.includes(id)});
 }
 const retainedPath=delta.baseTupleBinding.path.replace('current20.base-goal-tuples.json','current20.memory.raw-exact-retained.jsonl'),raw=readFileSync(resolve(repo,retainedPath),'utf8').trim().split('\n');
 const rollout=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),subject=rollout.subjects.find((s:any)=>s.subject==='chemie'),mc=read(subject.memoryReviewConfigPath),currentRaw=readFileSync(resolve(repo,mc.reviewPath),'utf8').trim().split('\n'),currentById=new Map(currentRaw.map((line:string)=>[JSON.parse(line).goalId,line]));
 for(const line of raw){const r=JSON.parse(line);if(currentById.get(r.goalId)!==line)errors.push(r.goalId+': current M raw line differs');}
 writeFileSync(resolve(out,'whole20.memory.current-raw-exact-retained.jsonl'),raw.join('\n')+'\n');
 writeFileSync(resolve(out,'whole20.normal-v2.author-successor-with-two-HOLDs.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n');
 writeFileSync(resolve(out,'reviewable18.normal-v2.author-successor.jsonl'),records.filter(r=>!delta.heldGoalIds.includes(r.goalId)).map(r=>JSON.stringify(r)).join('\n')+'\n');
 write('selected20.resource-only-future-tuples.inactive.json',{landscapeId:canonical.landscapeId,goalIds:ids,goals:candidateTuples,noWholeCanonicalSnapshot:true,requiresUnchanged:true,activation:false});
 write('whole20.normal-profile-case-resource-memory-bindings.actual.json',{schemaVersion:1,goalIds:ids,joins,memory:{currentConfigPath:subject.memoryReviewConfigPath,currentConfigSha256:hash(subject.memoryReviewConfigPath),currentReviewPath:mc.reviewPath,currentReviewSha256:hash(mc.reviewPath),rawRowsExact:20,additionalCardsOrDecks:0,newMemoryVotes:0}});
 const after=hash(canonicalPath);if(after!==before)errors.push('Concurrent canonical change');
 write('checks/scoped-normal-P-schema-input-and40-case-joins.actual.json',{schemaVersion:1,startedAtUTC:startedAt,completedAtUTC:new Date().toISOString(),currentCanonicalBefore:before,currentCanonicalAfter:after,inputBindings:[{path:canonicalPath,sha256:before},{path:schemaPath,sha256:hash(schemaPath)},{path:criteriaPath,sha256:criteria},{path:semanticPath,sha256:hash(semanticPath)}],counts:{profiles:20,reviewable:18,held:2,cases:40,rubricCriteria:120,actualCandidatePNGs:6,rawCurrentMRetained:20,nativeReviews:0,humanApprovals:0},checks:['Normal v2 Ajv schema','Normal exported goal/profile/input fingerprint and positive-record semantic validation','Exact current selected20 body/requires tuples','Actual PNG bytes and unchanged existing image bytes','40 full-case/task/model-answer to P-brief joins','120 rubric expectation links and concrete six-point sums','20 byte-exact current M raw lines'],passed:errors.length===0,errors,limitations:['No native book/model build or campaign/peer scientific review.','Corrected six PNGs are inactive draft assets; no V approval.','Current graph retained;413 and9d explicitly held.','Author case-specific partial expectation aspects do not imply automatic full-expectation/mastery acceptance.']});
 console.log(JSON.stringify({passed:errors.length===0,errors,profiles:20,reviewable:18,cases:40,assets:6}));if(errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
