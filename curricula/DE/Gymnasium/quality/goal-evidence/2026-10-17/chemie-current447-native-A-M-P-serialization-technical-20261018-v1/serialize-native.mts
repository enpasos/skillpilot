// Apache-2.0. Inactive technical serialization from actual sealed science; no new review votes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js';
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js';
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js';
import {buildPositiveGoalEvidenceCandidateRecords} from '/home/enpasos/projects/skillpilot/app/scripts/materializePositiveGoalEvidenceCandidates.ts';
import {reviewPositiveGoalEvidenceConfig} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts';
import {fingerprintSemanticKindSourceGoal} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts';
const ROOT='/home/enpasos/projects/skillpilot';process.chdir(ROOT);
const OUT=path.dirname(fileURLToPath(import.meta.url));
const N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17';
const O=N+'/chemie-current442-normal-integration-20261017-v1';
const INPUT=N+'/chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1';
const rel=(p:string)=>path.relative(ROOT,p).split(path.sep).join('/');
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const text=(p:string)=>fs.readFileSync(p,'utf8');
const sha=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
const pin=(p:string)=>{const b=fs.readFileSync(p);return{path:rel(path.resolve(p)),sha256:sha(b),bytes:b.length};};
const json=(name:string,v:any)=>{const p=path.join(OUT,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');return rel(p);};
const jsonl=(name:string,raw:string[])=>{const p=path.join(OUT,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,raw.join(''));return rel(p);};
const lines=(p:string)=>text(p).split(/(?<=\n)/u).filter(x=>x.trim()).map(raw=>({raw:raw.endsWith('\n')?raw:raw+'\n',record:JSON.parse(raw)}));
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,z])=>JSON.stringify(k)+':'+stable(z)).join(',')+'}':JSON.stringify(v);
const equal=(a:any,b:any)=>stable(a)===stable(b);
const objectSHA=(v:any)=>sha(stable(v));
const assert=(condition:any,message:string)=>{if(!condition)throw Error(message);};
const observedInputs=new Map<string,any>();
const guardPin=(p:any)=>{const actual=pin(p.path);assert(actual.sha256===p.sha256&&actual.bytes===p.bytes,'Input pin drift: '+p.path);observedInputs.set(actual.path,actual);};
const observe=(p:string)=>{const x=pin(p);observedInputs.set(x.path,x);return x;};
const expectedTransport={canonical:'770668995884eb5c5dafe264a3d9d63b95fd40fd826f1790a8e3e606eb917691',profiles:'74a578049dffd175aaab8e45a6aeb94c6dc594e7449283fafcd7be6337bada57',semantic:'f3aa9c11d40f14b846cb98fd942c6eab406a1be2d060a2a3101a3e0d53424faa'};
const cInput=INPUT+'/C659.447ordinary-68memory.two-author-candidates.INACTIVE.json';
const pInput=INPUT+'/P447.complete-selected-whole-profiles.INACTIVE.jsonl';
const semInput=INPUT+'/SEM659.current654-classes-plus-five-author-assumptions.INACTIVE-TRANSPORT.json';
for(const [p,hash] of [[cInput,expectedTransport.canonical],[pInput,expectedTransport.profiles],[semInput,expectedTransport.semantic]])assert(observe(p).sha256===hash,'Exact final transport changed: '+p);
const baselineCanonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const baselineSnapshot=rel(OUT)+'/BASELINE.C654.original-native-input.byte-exact.json';
assert(observe(baselineSnapshot).sha256==='1334c2f7e637c23737c32fffcda9adc9273b83e0d61f536c2e6b404699eee262','Archived actual baseline C drift');
const registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const reg=read(registryPath);observe(registryPath);const subject=reg.subjects.find((x:any)=>x.subject==='chemie');assert(subject,'Chemistry registry subject missing');
const baseline=read(baselineSnapshot),c=read(cInput),sem=read(semInput);
const oldGoals=new Map(baseline.goals.map((g:any)=>[g.id,g]));const goals=new Map(c.goals.map((g:any)=>[g.id,g]));
const newIds=c.goals.filter((g:any)=>!oldGoals.has(g.id)).map((g:any)=>g.id);assert(newIds.length===5,'Expected five new goals');
const vInput=O+'/V10-current-corrected-goal-image-author-input.json';assert(observe(vInput).sha256==='fd9f6cf54a8078f0df80d0412eaaff708483f5017caaee27f11993133e8f00b0','V10 exact link transport drift');
for(const r of read(vInput).records.slice(0,5)){assert(newIds.includes(r.goalId),'Unexpected new image goal');(goals.get(r.goalId) as any).resourceLinks=structuredClone(r.candidateWholeGoal.resourceLinks);}
const cPath=json('C659.with-exact-five-pilot-links.INACTIVE.json',c);
const sciencePaths={
 P5A:N+'/chemie-current442-five-P-scope-operator-remediation-independent-a-20261018-v1/REVIEW.P5-informed-author-proposal.independent-a.json',
 P5B:N+'/chemie-current442-five-P-scope-operator-remediation-independent-b-20261018-v1/REVIEW.informed-P5.independent-b.json',
 D5A:N+'/chemie-current442-five-description-two-duty-split-independent-a-20261018-v1/REVIEW.five-D-two-duty.informed-independent-a.json',
 D5B:N+'/chemie-current442-five-description-two-duty-split-independent-b-20261018-v1/REVIEW.informed-five-description-two-duty.independent-b.json',
 PhaseA:O+'/benzene-phase-Q1-independent-a-v1/REVIEW.one-benzene-Q1-phase.informed-author-proposal.json',
 PhaseB:O+'/benzene-phase-Q1-independent-b-v1/FIRST.independent-benzene-Q1-phase-science.json',
};
const science:any={};for(const [k,p] of Object.entries(sciencePaths)){observe(p);science[k]=read(p);}
const sealPaths=[
 N+'/chemie-current442-five-P-scope-operator-remediation-independent-a-20261018-v1/SEAL.P5-informed-independent-a.json',
 N+'/chemie-current442-five-P-scope-operator-remediation-independent-b-20261018-v1/SEAL.informed-P5.independent-b.json',
 N+'/chemie-current442-five-description-two-duty-split-independent-a-20261018-v1/SEAL.five-D-two-duty.informed-independent-a.json',
 N+'/chemie-current442-five-description-two-duty-split-independent-b-20261018-v1/SEAL.informed-five-description-two-duty.independent-b.json',
 O+'/benzene-phase-Q1-independent-a-v1/SEAL.independent-informed-author-proposal.json',
 O+'/benzene-phase-Q1-independent-b-v1/SEAL.independent-FIRST.json'];
for(const p of sealPaths){observe(p);const s=read(p);const visit=(v:any)=>{if(v&&typeof v==='object'){if(v.path&&v.sha256&&v.bytes&&Object.values(sciencePaths).includes(v.path.replace(ROOT+'/','')))guardPin({...v,path:v.path.replace(ROOT+'/','')});for(const z of Object.values(v))visit(z);}};visit(s);}
const bindings:any={};
const select=(key:string,field:string,id:string)=>{const arr=science[key][field];const i=arr.findIndex((r:any)=>r.goalId===id);assert(i>=0,'Missing actual science '+key+' '+id);return{review:pin((sciencePaths as any)[key]),pointer:'/'+field+'/'+i,wholeJudgmentSHA256:objectSHA(arr[i]),judgment:arr[i]};};
const pair=(id:string,lane:string)=>{
 if(id===science.PhaseA.goalId)return[{review:pin(sciencePaths.PhaseA),pointer:'',wholeJudgmentSHA256:objectSHA(science.PhaseA),judgment:science.PhaseA},{review:pin(sciencePaths.PhaseB),pointer:'',wholeJudgmentSHA256:objectSHA(science.PhaseB),judgment:science.PhaseB}];
 if(science.D5A.existingGoalReviews.some((r:any)=>r.goalId===id))return[select('D5A','existingGoalReviews',id),select('D5B','existingGoalFindings',id)];
 if(science.D5A.newNarrowGoalReviews.some((r:any)=>r.goalId===id))return[select('D5A','newNarrowGoalReviews',id),select('D5B','newGoalFindings',id)];
 if(science.P5A.newNarrowGoalAPMReviews.some((r:any)=>r.goalId===id))return[select('P5A','newNarrowGoalAPMReviews',id),select('P5B','newGoalAndProfileFindings',id)];
 assert(lane==='P','No actual A/M science for '+id);return[select('P5A','existingWholePReviews',id),select('P5B','existingPFindings',id)];
};
const rationale=(r:any,lane:string)=>lane==='A'?(r.atomicityRationaleDe??r.atomicityRecommendation??r.atomicityCandidateRecommendation??r.atomicity?.rationaleDe??r.atomicityDecision?.rationale??r.positiveFindingDe??r.rationaleDe):lane==='M'?(r.memoryRationaleDe??r.memoryRecommendation??r.memoryCandidateRecommendation??r.memory?.rationaleDe??r.memoryDecision?.rationale??r.memory??r.rationaleDe):(r.rationaleDe??r.positiveFindingDe??r.scientificRationaleDe??r.positiveEvidence?.rationaleDe??r.rationale??r.decision);
const bind=(id:string,lane:string)=>{const p=pair(id,lane);bindings[id]??={};bindings[id][lane]=p;return p;};
const technicalReason=(id:string,lane:string)=>{const p=bind(id,lane);return 'Technical native serialization from two actually sealed informed scientific judgments; no new reviewer vote. '+p.map((b:any,i:number)=>String.fromCharCode(65+i)+': '+String(rationale(b.judgment,lane))).join(' | ')+' Exact source pins and pointers: PROVENANCE.actual-paired-science.json#/'+id+'/'+lane+'.';};
const extractStock=(sourcePath:string,names:string[],name:string)=>{observe(sourcePath);const source=text(sourcePath);const ast=ts.createSourceFile(sourcePath,source,ts.ScriptTarget.Latest,true);const declarations=ast.statements.filter((n:any)=>ts.isFunctionDeclaration(n)&&names.includes(n.name?.text??''));assert(declarations.length===names.length,'Missing exact stock functions');const snippet=declarations.map((n:any)=>n.getText(ast)).join('\n\n');json(name+'.ast-input.json',{source:pin(sourcePath),functionNames:names,exactDeclarationSHA256:sha(snippet)});fs.writeFileSync(path.join(OUT,name+'.stock-functions.ts'),snippet+'\n');const js=ts.transpileModule(snippet,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;return new Function('createHash',js+'\nreturn fingerprintGoal;')(createHash) as (g:any,v:string)=>string;};
const aFP=extractStock('app/scripts/semanticAtomicityReview.ts',['normalizeText','stableJson','getSemanticPayload','fingerprintGoal'],'A');
const mFP=extractStock('app/scripts/memoryCardReview.ts',['normalizeText','stableJson','fingerprintGoal'],'M');
const existingChanged=c.goals.filter((g:any)=>oldGoals.has(g.id)&&aFP(g,'semantic-atomicity-v1')!==aFP(oldGoals.get(g.id),'semantic-atomicity-v1')).map((g:any)=>g.id);
assert(existingChanged.length===6,'Expected six actual A/M semantic changes');const changed=new Set([...existingChanged,...newIds]);
for(const id of newIds){bind(id,'A');bind(id,'M');const row=sem.decisions.find((r:any)=>r.goalId===id);assert(row.semanticKind==='curricularAtomic'&&row.decisionStatus==='author_candidate','Unexpected author semantic row');row.decisionStatus='authoritative';row.decisionBasis='reviewed-current-post-split-curricular-atomic';}
sem.sourceLandscapePath=cPath;for(const row of sem.decisions)row.sourceFingerprint=fingerprintSemanticKindSourceGoal(goals.get(row.goalId) as any);
const semPath=json('SEM659.five-actual-paired-classifications.INACTIVE.json',sem);
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const validSEM=ajv.compile(read('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'));assert(validSEM(sem),'Native SEM schema: '+ajv.errorsText(validSEM.errors));
const ordinary=new Set(sem.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId));assert(ordinary.size===447,'Not447 curricular atoms');
const at=new Date().toISOString();const reviewer='codex-technical-native-serialization-from-actual-paired-informed-science';
const ARecords=new Map<string,any>();const aRetained:any[]=[];const aCandidateConfigs:string[]=[];const aRegistryAfter:string[]=[];const aDeltas:any[]=[];
for(const [index,configPath] of subject.semanticAtomicityConfigPaths.entries()){
 observe(configPath);const cfg=read(configPath);observe(cfg.reviewPath);const input=lines(cfg.reviewPath);const kept=input.filter(({record:r})=>!changed.has(r.goalId));for(const v of input){assert(!ARecords.has(v.record.goalId),'Duplicate existing A owner '+v.record.goalId);ARecords.set(v.record.goalId,{...v,configPath,cfg});}
 const needsResidual=kept.length!==input.length;
 if(!kept.length){aDeltas.push({before:configPath,after:null,removed:input.map(v=>v.record.goalId)});continue;}
 let nativeConfig=configPath;
 if(needsResidual){const rp=jsonl('A/residual/A'+String(index+1).padStart(3,'0')+'.review.jsonl',kept.map(v=>v.raw));const rc={...cfg,reviewPath:rp,scope:{label:cfg.scope.label,leafGoalIds:kept.map(v=>v.record.goalId)}};nativeConfig=json('A/residual/A'+String(index+1).padStart(3,'0')+'.config.json',rc);aDeltas.push({before:configPath,after:nativeConfig,removed:input.filter(v=>changed.has(v.record.goalId)).map(v=>v.record.goalId),retainedLinesByteExact:true,reviewId:cfg.reviewId,ruleVersion:cfg.ruleVersion});}
 aRegistryAfter.push(nativeConfig);
 const vcfg={...read(nativeConfig),landscapePath:cPath,scope:{label:cfg.scope.label,leafGoalIds:kept.map(v=>v.record.goalId)}};
 aCandidateConfigs.push(json('A/validation/A'+String(index+1).padStart(3,'0')+'.config.json',vcfg));
 aRetained.push(...kept.map(v=>({...v,configPath:nativeConfig})));
}
assert(ARecords.size===442,'Current A ownership not442');
for(const [id,v] of ARecords)assert(v.record.fingerprint===aFP(oldGoals.get(id),v.cfg.ruleVersion),'Baseline A stale '+id);
const aId='canonical-chemistry-current447-eleven-paired-informed-atomicity-native-20261018-v1';
const aNew=[...existingChanged,...newIds].map(id=>({schemaVersion:1,reviewId:aId,ruleVersion:'semantic-atomicity-v1',landscapeId:c.landscapeId,goalId:id,fingerprint:aFP(goals.get(id),'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reviewedAt:at,reviewer,reason:technicalReason(id,'A'),scientificDecisionSources:bindings[id].A.map(({judgment,...v}:any)=>v),technicalSerializationOnly:true}));
const aNewPath=jsonl('A/A11.actual-paired-native.review.jsonl',aNew.map(r=>JSON.stringify(r)+'\n'));
const aNewConfig={schemaVersion:1,reviewId:aId,ruleVersion:'semantic-atomicity-v1',landscapeId:c.landscapeId,landscapePath:baselineCanonical,reviewPath:aNewPath,scope:{label:'Exactly six changed current ordinary goals and five new goals, from two actual sealed informed judgments; technical native serialization only',leafGoalIds:aNew.map(r=>r.goalId)}};
const aNewCfgPath=json('A/A11.actual-paired-native.config.json',aNewConfig);aRegistryAfter.push(aNewCfgPath);aCandidateConfigs.push(json('A/validation/A11.actual-paired-native.config.json',{...aNewConfig,landscapePath:cPath}));
const aFinal=new Map([...aRetained.map(v=>[v.record.goalId,v.raw] as const),...aNew.map(v=>[v.goalId,JSON.stringify(v)+'\n'] as const)]);assert(aFinal.size===447,'A aggregate not447');const aAggregate=jsonl('A447.mixed-original-identities.native.review.jsonl',c.goals.filter((g:any)=>ordinary.has(g.id)).map((g:any)=>aFinal.get(g.id)!));
for(const v of aRetained)assert(v.record.fingerprint===aFP(goals.get(v.record.goalId),v.cfg?.ruleVersion??v.record.ruleVersion),'Retained A changed '+v.record.goalId);
const mCfg=read(subject.memoryReviewConfigPath);observe(subject.memoryReviewConfigPath);observe(mCfg.reviewPath);observe(mCfg.cardReviewPath);const mRows=lines(mCfg.reviewPath);assert(mRows.length===442,'M baseline not442');
const mById=new Map(mRows.map(v=>[v.record.goalId,v]));for(const v of mRows)assert(v.record.fingerprint===mFP(oldGoals.get(v.record.goalId),mCfg.ruleVersion),'Baseline M stale '+v.record.goalId);
const mChangedExisting=mRows.filter(v=>v.record.fingerprint!==mFP(goals.get(v.record.goalId),mCfg.ruleVersion)).map(v=>v.record.goalId);assert(equal([...mChangedExisting].sort(),[...existingChanged].sort()),'A/M actual affected IDs differ');
const mFinal=new Map<string,string>();let mExact=0;
for(const v of mRows){const id=v.record.goalId;if(!changed.has(id)){mFinal.set(id,v.raw);mExact++;continue;}const r={...v.record,fingerprint:mFP(goals.get(id),mCfg.ruleVersion),reviewedAt:at,reviewer,reason:technicalReason(id,'M'),currentPairedScientificDecisionSources:bindings[id].M.map(({judgment,...z}:any)=>z),technicalSerializationOnly:true};
 if(['72236f2c-771e-4ab6-933a-e549ee49d15b','0959eef2-3c7d-5b33-a109-ddf332a5dbd9'].includes(id)){assert(r.status==='memory_required'&&r.memoryUseful===true,'Do not drop actual memory need '+id);assert(equal(r.memoryGoalIds,v.record.memoryGoalIds)&&equal(r.deckIds,v.record.deckIds),'Memory references changed');}else assert(r.status==='no_memory_needed','Unexpected old M verdict '+id);
 mFinal.set(id,JSON.stringify(r)+'\n');}
for(const id of newIds){const r={schemaVersion:1,reviewId:mCfg.reviewId,ruleVersion:mCfg.ruleVersion,landscapeId:c.landscapeId,goalId:id,fingerprint:mFP(goals.get(id),mCfg.ruleVersion),status:'no_memory_needed',memoryUseful:false,memoryGoalIds:[],deckIds:[],reviewedAt:at,reviewer,reason:technicalReason(id,'M'),scientificDecisionSources:bindings[id].M.map(({judgment,...z}:any)=>z),technicalSerializationOnly:true};mFinal.set(id,JSON.stringify(r)+'\n');}
assert(mExact===436&&mFinal.size===447,'M retention/count mismatch');const mPath=jsonl('M447.full-original-memory-refs.native.review.jsonl',c.goals.filter((g:any)=>ordinary.has(g.id)).map((g:any)=>mFinal.get(g.id)!));
const parented=new Set(c.goals.flatMap((g:any)=>g.contains??[]));const roots=[...mCfg.scope.rootGoalIds,...newIds.filter(id=>!parented.has(id))];
const mNormalCfg=json('M447.fullscope.normal-installation.config.json',{...mCfg,reviewPath:mPath,reportPath:rel(OUT)+'/M447.stock-report.md',scope:{...mCfg.scope,rootGoalIds:roots}});
const mValidateCfg=json('M447.fullscope.inactive-validation.config.json',{...read(mNormalCfg),landscapePath:cPath});
const pRows=lines(pInput).map(v=>v.record);assert(pRows.length===447,'P input not447');const pBasePath=O+'/P442.review.jsonl';observe(pBasePath);const pBase=new Map(lines(pBasePath).map(v=>[v.record.goalId,v]));assert(pBase.size===442,'P baseline not442');
const correctionArg=process.argv.slice(2).find(v=>v.startsWith('--operative-transfer-brief-correction='));
let operativeBriefCorrection:any=null;
if(correctionArg){
 assert(process.argv.includes('--root-authorized-operative-transfer-briefs'),'Explicit Root correction instruction must precede this option');
 const correctionPath=correctionArg.slice('--operative-transfer-brief-correction='.length);assert(observe(correctionPath).sha256==='4461710537615396d8fe7711f72d0ca265063ccbe725390668bd96b8bf954fab','Exact Root author correction drift');const correction=read(correctionPath);
 assert(correction.records.length===2,'Only two finite operative-transfer expositions permitted');
 for(const fix of correction.records){
  const row=pRows.find(v=>v.goalId===fix.goalId);assert(row?.newGoal,'Correction may only affect the two new goals');
  assert(objectSHA(row.profile)===fix.beforeProfileObjectSHA256,'Correction profile input drift '+fix.goalId);
  guardPin(fix.operativeMaterialSource);const material=read(fix.operativeMaterialSource.path);const after=fix.wholeProposedProfile;
  assert(after.applicationCaseBriefs.length===2&&equal(after.applicationCaseBriefs[0],row.profile.applicationCaseBriefs[0]),'First whole brief must remain exact');
  assert(equal({...after,applicationCaseBriefs:row.profile.applicationCaseBriefs},row.profile),'Only one brief may be appended');
  const b=after.applicationCaseBriefs[1];
  assert(b.taskDemandDe===material.freshTransfer.task.de&&b.taskDemandEn===material.freshTransfer.task.en&&b.expectedPerformanceDe===material.freshTransfer.expected.de&&b.expectedPerformanceEn===material.freshTransfer.expected.en,'Added brief differs from actually reviewed operative fresh transfer');
  assert(equal(b,fix.addedBriefExact),'Added brief must equal the exact Root author object');
  assert(objectSHA(after)===fix.afterProfileObjectSHA256,'Corrected whole profile hash drift');row.profile=after;row.wholeProfileSHA256=fix.afterProfileObjectSHA256;row.operativeFreshTransferExposition=pin(correctionPath);
  bindings[fix.goalId]??={};bindings[fix.goalId].PAuthorCorrection={reviewAuthority:'author_candidate',input:pin(correctionPath),pointer:'/records/'+correction.records.indexOf(fix)+'/wholeProposedProfile',wholeProfileObjectSHA256:fix.afterProfileObjectSHA256,independentCurrentP2ApprovalClaimed:false,underlyingWholeOperativeMaterialAlreadyScientificallyReviewed:true,authorUnderstandingFocusIsNotANewIndependentJudgment:true};
 }
 operativeBriefCorrection={input:pin(correctionPath),rootExplicitAuthorizationFlag:true,rootAuthorCorrectionWithIndependentP2ReviewPending:true,newTaskOrMaterialAdded:false,newReviewerVotesCreated:false,firstWholeBriefAndEveryOtherProfileFieldPreserved:true};
 jsonl('P447.exact-writer-input.with-authorized-operative-transfer-expositions.jsonl',pRows.map(r=>JSON.stringify(r)+'\n'));
}
const pChanged=new Set<string>();for(const r of pRows){if(!pBase.has(r.goalId)||!equal(r.profile,pBase.get(r.goalId).record.profile)||changed.has(r.goalId))pChanged.add(r.goalId);}
assert(pChanged.size===17,'Expected actual17P rewrites including5new');assert(pRows.filter(r=>pBase.has(r.goalId)&&equal(r.profile,pBase.get(r.goalId).record.profile)).length===434,'434 unchanged profile bodies not conserved');
const pFinal=new Map<string,string>();const pValidationConfigs:string[]=[];const pRegistryAfter:string[]=[];const pDeltas:any[]=[];let pExact=0;const resources:any[]=[];
for(const [i,configPath] of subject.positiveEvidenceConfigPaths.entries()){
 observe(configPath);const cfg=read(configPath);observe(cfg.reviewPath);observe(cfg.reviewCriteriaPath);const kept=cfg.scope.goalIds.filter((id:string)=>!pChanged.has(id));
 if(!kept.length){pDeltas.push({before:configPath,after:null,removed:cfg.scope.goalIds});continue;}
 const keptRecords=kept.map((id:string)=>{const v=pBase.get(id);assert(v,'Baseline P missing '+id);assert(v.record.reviewId===cfg.reviewId,'P owner identity mismatch '+id);return v;});
 const first=keptRecords[0].record;assert(keptRecords.every((v:any)=>v.record.reviewedAt===first.reviewedAt&&v.record.reviewer===first.reviewer),'Mixed namespace candidate metadata');
 const newCfg={...cfg,landscapePath:cPath,semanticKindLedgerPath:semPath,scope:{...cfg.scope,goalIds:kept}};
 const generated=await buildPositiveGoalEvidenceCandidateRecords({config:newCfg,candidateSet:{schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId:cfg.reviewId,reviewedAt:first.reviewedAt,reviewer:first.reviewer,goals:keptRecords.map((v:any)=>({goalId:v.record.goalId,reason:v.record.reason,evidenceLevel:v.record.evidenceLevel,maximumClaimScope:v.record.maximumClaimScope,dissent:v.record.dissent,profile:v.record.profile}))}} as any);
 generated.forEach((r:any,index:number)=>{const v=keptRecords[index];assert(equal(r,v.record),'Stock builder changes a supposedly retained P '+r.goalId);assert(!pFinal.has(r.goalId),'Duplicate P owner '+r.goalId);pFinal.set(r.goalId,v.raw);pExact++;});
 let target=configPath;let recordPath=cfg.reviewPath;
 if(kept.length!==cfg.scope.goalIds.length){recordPath=jsonl('P/residual/P'+String(i+1).padStart(3,'0')+'.review.jsonl',keptRecords.map((v:any)=>v.raw));target=json('P/residual/P'+String(i+1).padStart(3,'0')+'.config.json',{...cfg,reviewPath:recordPath,scope:{...cfg.scope,goalIds:kept}});pDeltas.push({before:configPath,after:target,removed:cfg.scope.goalIds.filter((id:string)=>pChanged.has(id)),retainedLinesByteExact:true,reviewId:cfg.reviewId});}
 pRegistryAfter.push(target);pValidationConfigs.push(json('P/validation/P'+String(i+1).padStart(3,'0')+'.config.json',{...newCfg,reviewPath:recordPath}));
}
const pNewId='canonical-chemistry-current447-seventeen-paired-informed-positive-native-20261018-v1';
const pSelected=pRows.filter(r=>pChanged.has(r.goalId));
const pNewConfig:any={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:pNewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:c.landscapeId,landscapePath:cPath,semanticKindLedgerPath:semPath,reviewCriteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath:rel(OUT)+'/P/P17.actual-paired-native.review.jsonl',reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Exactly twelve existing P/body/input successors plus five new complete profiles, actual paired informed science; no new D/native reviewer runs',goalIds:pSelected.map(r=>r.goalId)}};
observe(pNewConfig.reviewCriteriaPath);
const pCandidates={schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId:pNewId,reviewedAt:at,reviewer,goals:pSelected.map(r=>{const old=pBase.get(r.goalId)?.record;const prior=technicalReason(r.goalId,'P');const reason=r.operativeFreshTransferExposition?('E0/G0 technical candidate from explicit Root AUTHOR correction '+r.operativeFreshTransferExposition.path+'. The original brief and all other profile fields remain exact; the second task/expected response expose the already operative changed-condition material verbatim. Prior sealed A/B judgments concern the whole operative material and predecessor profile. Independent acceptance of this exact two-brief successor is pending and is not invented. No new task quota or repeated-answer double counting. Full actual source pins/pointers: PROVENANCE.actual-paired-science.json /goals/'+r.goalId+'/PAuthorCorrection.'):prior.slice(0,1650)+' Full paired source pins/pointers: PROVENANCE.actual-paired-science.json /goals/'+r.goalId+'/P.';return{goalId:r.goalId,reason,evidenceLevel:old?.evidenceLevel??'E0',maximumClaimScope:old?.maximumClaimScope??'G0',dissent:old?.dissent??[],profile:r.profile};})};
json('P/P17.actual-paired-native.candidates.json',pCandidates);const pNew=await buildPositiveGoalEvidenceCandidateRecords({config:pNewConfig,candidateSet:pCandidates} as any);jsonl('P/P17.actual-paired-native.review.jsonl',pNew.map(r=>JSON.stringify(r)+'\n'));pNew.forEach(r=>{assert(!pFinal.has(r.goalId),'Duplicate P17 '+r.goalId);pFinal.set(r.goalId,JSON.stringify(r)+'\n');});
const pValidationNew=json('P/validation/P17.actual-paired-native.config.json',pNewConfig);pValidationConfigs.push(pValidationNew);
const pNormalNew=json('P/P17.actual-paired-native.normal-installation.config.json',{...pNewConfig,landscapePath:baselineCanonical,semanticKindLedgerPath:subject.semanticKindLedgerPath});pRegistryAfter.push(pNormalNew);
assert(pFinal.size===447&&pExact===430,'P exact retained/aggregate mismatch');const pPath=jsonl('P447.complete-stock-native.review.jsonl',pRows.map(r=>pFinal.get(r.goalId)!));
for(const g of c.goals.filter((g:any)=>ordinary.has(g.id)))for(const l of g.resourceLinks??[])if(l.type==='goal-visualization'){const file='app/public'+l.url;observe(file);resources.push({goalId:g.id,url:l.url,digest:'sha256:'+pin(file).sha256,bytes:pin(file).bytes});}
const pChecks=pValidationConfigs.map(cp=>{const r=reviewPositiveGoalEvidenceConfig(cp);return{config:cp,count:r.records.length,errors:r.errors,counts:r.counts};});assert(pChecks.every(v=>v.errors.length===0),'P stock config validation failed');
json('PROVENANCE.actual-paired-science.json',{artifactType:'Technical pointer/pin transport of actual prior informed judgments; not new reviewer votes',goals:bindings,seals:sealPaths.map(pin),SEMClassificationBoundary:'Only five ordinary curricularAtomic classifications from accepted whole narrow goal/A/P/M candidates are serialized; all654 old semantic classifications remain exact. No D, V, human or M7 approval is inferred.'});
const plan={artifactType:'Inactive native A/M/P447 technical serialization; no normal writes',atUTC:at,inputPins:[...observedInputs.values()],inputCanonical:pin(cInput),inputSemantic:pin(semInput),inputProfiles:pin(pInput),operativeBriefCorrection,validationCanonical:pin(cPath),validationSemantic:pin(semPath),newFiveExactLinkInput:pin(vInput),nativeOutputs:{A:pin(aAggregate),M:pin(mPath),P:pin(pPath)},actualFingerprintChangedExistingIds:existingChanged,newGoalIds:newIds,actualPRewrittenIds:[...pChanged],A:{retainedRawRows:436,newOrReboundRows:11,afterNormalConfigPaths:aRegistryAfter,validationConfigPaths:aCandidateConfigs,ownerDeltas:aDeltas},M:{retainedRawRows:mExact,newOrReboundRows:11,normalInstallationConfig:mNormalCfg,inactiveValidationConfig:mValidateCfg,requiredMemoryReferencesPreservedFor:['72236f2c-771e-4ab6-933a-e549ee49d15b','0959eef2-3c7d-5b33-a109-ddf332a5dbd9'],allCardsAndDecksUnchanged:true,rootGoalIds:roots},P:{retainedRawRows:pExact,unchangedWholeProfileBodies:434,rewrittenExisting:12,newRows:5,afterNormalConfigPaths:pRegistryAfter,validationConfigPaths:pValidationConfigs,ownerDeltas:pDeltas,stockBuilderExecutedForAll447:true,newFiveEvidenceLevel:'E0',newFiveMaximumClaimScope:'G0',oldEvidenceLevelsAndMaximumClaimScopesPreserved:true,stockValidation:pChecks,resourceDigests:resources},SEM:{nativeSchemaErrors:[],allSourceFingerprintsCheckedWithStockFunction:true,authoritativeRows:659,newClassificationsActuallySupportedByPairedWholeGoalScience:true,reviewedOnlyInactiveCopy:true},limits:['No normal C/SEM/registry writes.','Exact722 final native D remains a separate gate; actual atomicity/memory model findings are bound, no new D votes are manufactured.','Five new pilot primary links are exact transport inputs and are not V approval.','Before normal installation, use guarded replay against final C/SEM and actual public resource digests; unexpected fingerprint/resource drift must stop.','Scope/AP metadata changes outside stock A/M/P payloads may be compared separately; no applicability/build/M7/human completion is claimed.'],scientificReviewsPerformedByThisSerializer:0,nativeDRunsCreated:0,humanApproval:false,M7Claim:false};
json('PLAN.native-A-M-P447.INACTIVE.json',plan);json('CHECK.P447.stock-validation-all-owner-scopes.json',pChecks);
for(const p of observedInputs.values())guardPin(p);
console.log(JSON.stringify({A:447,AoldExact:436,AnewOrRebound:11,M:447,MoldExact:436,P:447,PoldExact:430,PbodyExact:434,stockPValidatedConfigs:pChecks.length,actualChangedIds:existingChanged,output:rel(OUT)},null,2));
