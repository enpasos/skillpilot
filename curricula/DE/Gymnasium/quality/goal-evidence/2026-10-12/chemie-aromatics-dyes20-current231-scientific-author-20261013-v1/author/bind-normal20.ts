// Apache-2.0. Scoped author binding audit; no scientific approval or active writes.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-aromatics-dyes20-current231-scientific-author-20261013-v1';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const write=(p:string,x:any)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const norm=(x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim();
async function main(){
 const startedAtUTC=new Date().toISOString(),mod=await import(pathToFileURL(resolve('app/scripts/goalEvidenceProfileModel.ts')).href);
 const base=read(O+'/author/current20.base-goal-tuples.json'),ids=base.goalIds,can=read(base.canonicalBinding.path);
 if(hash(base.canonicalBinding.path)!==base.canonicalBinding.sha256)throw new Error('Current canonical CAS changed');
 const raw=(p:string)=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean);
 const P=raw(O+'/author/P20.normal-v2.author-candidates.jsonl').map(JSON.parse),Mraw=raw(O+'/author/current20.memory.raw-exact-retained.jsonl'),mcbind=read(O+'/author/current20.memory-retention.bindings.json'),mc=read(mcbind.inputConfig.path),actualM=new Map(raw(mc.reviewPath).map(l=>[JSON.parse(l).goalId,l]));
 const fp=(g:any,ruleVersion:string)=>'sha256:'+createHash('sha256').update(mod.stableGoalEvidenceJson({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)})).digest('hex');
 const allCases=read(O+'/author/whole40.expanded-cases.author.json'),am=read(O+'/author/whole20.atomicity-memory-source-boundaries.author.json'),a:any[]=[],joins:any[]=[],errors:string[]=[];
 for(const id of ids){
  const g=can.goals.find((g:any)=>g.id===id),old=base.goals.find((g:any)=>g.id===id);
  if(JSON.stringify(g)!==JSON.stringify(old))errors.push(id+': whole goal changed');
  const r=P.find((r:any)=>r.goalId===id),c=allCases.cases.filter((c:any)=>c.goalId===id),mline=Mraw.find(l=>JSON.parse(l).goalId===id),m=JSON.parse(mline!);
  if(actualM.get(id)!==mline||m.fingerprint!==fp(g,mc.ruleVersion))errors.push(id+': current raw M or fingerprint changed');
  if(m.status!=='no_memory_needed')errors.push(id+': unexpected current memory status');
  if(c.length!==2||r.status!=='needs_human_review'||r.reviewAuthority!=='ai_candidate'||r.evidenceLevel!=='E1'||r.maximumClaimScope!=='G1')errors.push(id+': candidate boundary');
  const b=r.profile.applicationCaseBriefs;
  for(const x of c){const brief=b.find((b:any)=>b.id===x.caseId);if(!brief)throw new Error('Missing case brief '+x.caseId);
   for(const lang of ['De','En']){if(brief['taskDemand'+lang]!==x['data'+lang]+'\n'+x['task'+lang]||brief['expectedPerformance'+lang]!==x['modelAnswer'+lang])errors.push(x.caseId+': incomplete body/brief parity');}
   for(const cr of x.rubric){for(const lang of ['De','En']){const sp=cr['taskSpan'+lang];if(x['task'+lang].slice(sp.start,sp.end)!==cr['taskClause'+lang])errors.push(cr.criterionId+': wrong demand span');}if(cr.creditBasis==='observed-practical-execution-required'&&!x.practicalExecutionRequired)errors.push(cr.criterionId+': missing practical boundary');}
  }
  a.push({schemaVersion:1,reviewId:'chemie-aromatics20-author-atomicity-candidates-20261013-v1',ruleVersion:'semantic-atomicity-v1',landscapeId:can.landscapeId,goalId:id,fingerprint:fp(g,'semantic-atomicity-v1'),status:'needs_developer_review',semanticAtomic:null,reviewedAt:startedAtUTC,reviewer:'Codex scientific author; no independent judgment',reason:'Author rationale only: '+am.records.find((r:any)=>r.goalId===id).atomicityCandidate.reasonDe});
  joins.push({goalId:id,goalFingerprint:r.goalFingerprint,profileFingerprint:r.profileFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,wholeGoalTupleUnchanged:true,caseIds:c.map((c:any)=>c.caseId),currentMrawExact:true,currentMstatus:m.status,assetBindings:(g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>({path:'app/public'+l.url,sha256:hash('app/public'+l.url)}))});
 }
 const cards=raw(mc.cardReviewPath).map(JSON.parse),relevantCards=cards.filter((r:any)=>(r.originGoalIds??[]).some((id:string)=>ids.includes(id)));
 if(relevantCards.some((c:any)=>c.status==='kept'))errors.push('Unexpected kept card from current no_memory_needed20');
 writeFileSync(O+'/author/A20.normal-author-candidates.jsonl',a.map(r=>JSON.stringify(r)).join('\n')+'\n');
 write(O+'/configs/A20.author.inactive.config.json',{schemaVersion:1,reviewId:a[0].reviewId,ruleVersion:'semantic-atomicity-v1',landscapeId:can.landscapeId,landscapePath:base.canonicalBinding.path,reviewPath:O+'/author/A20.normal-author-candidates.jsonl',scope:{label:'Author pending20; no independent atomicity approvals',leafGoalIds:ids}});
 const scopedM={...mc,reviewPath:O+'/author/current20.memory.raw-exact-retained.jsonl',scope:{label:'Current M20 exact retention; no new memory votes',leafGoalIds:ids},reportPath:O+'/checks/M20.scoped.report.md'};
 scopedM.cardReviewPath=O+'/author/current20.memory.no-relevant-cards.review.jsonl';
 writeFileSync(scopedM.cardReviewPath,'');
 write(O+'/configs/M20.exact-retention.inactive.config.json',scopedM);
 write(O+'/author/current20.actual-card-origin-and-visibility-retention.json',{schemaVersion:1,currentMrawExact:true,noMemoryNeeded20:20,memoryRequired:0,newMemoryVotes:0,actualCardOriginRowsRead:cards.length,relevantCardOriginRows:relevantCards,retainedCardReviewBinding:{path:mc.cardReviewPath,sha256:hash(mc.cardReviewPath)},visibilityScopes:mc.visibilityScopes.map((s:any)=>({...s,sha256:hash(s.viewPath),requiredMemoryObligationFromThisScope:0})),scientificBoundary:'All current M20 are no_memory_needed. No card/deck or memory visibility obligation is created or removed; zero matching current kept origins was actually checked.'});
 write(O+'/author/exact20-profile-case-resource-memory-joins.actual.json',{schemaVersion:1,goalIds:ids,joins,newScience:0});
 write(O+'/author/scoped-normal-currentM-case-join-check.actual.json',{schemaVersion:1,startedAtUTC,completedAtUTC:new Date().toISOString(),counts:{P20:20,A20Pending:20,fullCases:40,criteria:allCases.cases.reduce((n:number,c:any)=>n+c.rubric.length,0),M20exact:20,currentMemoryRequired:0,newIndependentReviews:0},errors,passed:errors.length===0,currentCanonicalSHA256:hash(base.canonicalBinding.path),newScience:0});
 console.log(JSON.stringify({errors,passed:errors.length===0,P20:20,A20Pending:20,M20exact:20,newScience:0}));
 if(errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
