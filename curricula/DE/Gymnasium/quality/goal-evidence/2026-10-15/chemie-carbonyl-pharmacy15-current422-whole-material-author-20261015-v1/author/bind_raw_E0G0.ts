/** Technical serialization only. Material-science FIRST is immutable and predates this module. */
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {pathToFileURL} from 'node:url'
async function main(){
 const own=resolve(dirname(process.argv[1]),'..');const repo=process.cwd();
 const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'));
 const ownRead=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'));
 const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex');
 const firstPath=resolve(own,'FIRST.author15.material-science.original.json');
 if(digest(firstPath)!=='sha256:c5ad6d1941f54e98aeafcfe974be1eb761b7ea5c03ae972d853dd52cd097dc56')throw Error('FIRST changed');
 const context=ownRead('inputs/WHOLE.current15-and-prerequisite-parent-context.deduplicated.json');
 const canonical=read(context.canonical.path);
 if(digest(context.canonical.path)!==context.canonical.sha256)throw Error('Canonical CAS mismatch');
 const semanticPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1/candidate/semantic560.three-description-source-bindings.json';
 if(digest(semanticPath)!=='sha256:3fd88d8d1e7414fe655972247451fe03cc81bc207f5e391e6e17f74c407fab8c')throw Error('Semantic CAS mismatch');
 const semantic=new Map(read(semanticPath).decisions.filter((d:any)=>d.decisionStatus==='authoritative').map((d:any)=>[d.goalId,d.semanticKind]));
 const goals=new Map(canonical.goals.map((g:any)=>[g.id,g]));
 const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md';
 const criteriaFingerprint=digest(criteriaPath);
 const expectedCriteria='sha256:4ed61d2a8c7eb84dd13315427d46989b4750f58620481e19023b145935025835';
 if(criteriaFingerprint!==expectedCriteria)throw Error('Unexpected production criteria');
 const model=await import(pathToFileURL(resolve(repo,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
 const payloads=ownRead('materials/whole15.current422.profile-payloads.author.json');
 const assets=ownRead('inputs/ASSETS.current15.exact-existing-physical-body-bindings.json').assets;
 const reviewId='chemie-carbonyl-pharmacy15-current422-whole-author-20261015-v1';
 const pathRecord=resolve(own,'author/P15.normal-v2.raw-E0G0.author-inputs.jsonl');
 const checkOnly=process.argv.includes('--check');
 const prior=checkOnly?readFileSync(pathRecord,'utf8').trim().split('\n').map(s=>JSON.parse(s)):[];
 const records:any[]=[];const checks:any[]=[];
 for(const {goalId,profile} of payloads.profiles){
  const goal:any=goals.get(goalId);const kind:any=semantic.get(goalId);
  if(kind!=='curricularAtomic')throw Error('Unexpected semantic kind '+goalId+': '+kind);
  const aset=assets.filter((a:any)=>a.goalId===goalId);if(aset.length!==1)throw Error('Asset cardinality');
  const a=aset[0];const aPath=a.physicalRepositorySource.path;
  if(digest(aPath)!==a.physicalRepositorySource.sha256)throw Error('Asset CAS '+goalId);
  const resourceDigests:Record<string,string>={};
  for(const link of goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization')){
   if('app/public'+link.url!==a.normalPublicDestination)throw Error('Physical resource URL mapping '+goalId);
   resourceDigests[link.url]=digest(aPath);
  }
  const record=checkOnly?prior.find(r=>r.goalId===goalId):{
   $schema:model.POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:2,reviewId,
   goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaFingerprint,
   landscapeId:canonical.landscapeId,goalId,
   goalFingerprint:model.fingerprintGoalForPositiveEvidence(goal,kind),
   reviewInputFingerprint:model.fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resourceDigests,kind),
   profileFingerprint:model.fingerprintPositiveGoalEvidenceProfile(profile),
   status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),
   reviewer:'Informed author; current complete material preparation; NOT an independent D/P/A/M/V reviewer',
   reason:'Raw E0/G0 author input: 15 whole current goals, complete bilingual cases and source/course boundaries read and prepared. No P approval, independent gate vote, human approval, trial, active write or new strict completion. Two variants are options, not a mastery task quota. Actual practical criteria require later observed authorized performance.',
   evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],dissent:[],profile
  };
  const errors=model.validatePositiveGoalEvidenceRecordSemantics(record,goal,resourceDigests,kind);
  if(JSON.stringify(record.profile)!==JSON.stringify(profile))errors.push('Normal record differs from complete author payload');
  if(record.reviewAuthority!=='ai_candidate'||record.status!=='needs_human_review'||record.evidenceLevel!=='E0'||record.maximumClaimScope!=='G0'||record.reviewRunIds.length)errors.push('Untruthful author boundary');
  if(errors.length)throw Error(JSON.stringify({goalId,errors}));
  records.push(record);checks.push({goalId,effectiveSemanticKind:kind,currentResourceDigests:resourceDigests,stockSemanticErrors:errors});
 }
 if(records.length!==15||new Set(records.map(r=>r.goalId)).size!==15)throw Error('15 scoped records required');
 if(!checkOnly){
  writeFileSync(pathRecord,records.map(r=>JSON.stringify(r)).join('\n')+'\n');
  const cfg={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:canonical.landscapeId,landscapePath:context.canonical.path,semanticKindLedgerPath:semanticPath,reviewCriteriaPath:criteriaPath,reviewPath:relative(repo,pathRecord),reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Inactive raw E0/G0 Carbonyl/pharmacy15 author profiles; no independent or human gate approval',goalIds:context.goalIds}};
  writeFileSync(resolve(own,'author/P15.current422.raw-author.inactive.config.json'),JSON.stringify(cfg,null,2)+'\n');
 }
 const result={schemaVersion:1,role:'Unchanged production fingerprint/semantic helper check; technical raw author serialization only',checkOnly,recordCount:records.length,criteriaFingerprint,stockHelper:'app/scripts/positiveGoalEvidenceProfileModel.ts',records:checks,errors:[],newIndependentVotes:0,newPApproval:0,newStrictCompletions:0};
 if(!checkOnly)writeFileSync(resolve(own,'checks/P15.stock-helper.raw-author.actual.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e);process.exit(1)})
