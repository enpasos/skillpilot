// SPDX-License-Identifier: Apache-2.0
// Informed technical preparation; no new scientific vote or active mutation.
import {readFile,writeFile,mkdir,symlink,stat} from 'node:fs/promises';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname,join,relative,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {buildGoalBookModel,writeGoalBookModel,fingerprintSemanticKindSourceGoal,stableGoalBookJson} from '../../../../../../../../app/scripts/goalBookModel';
import {buildGoalBookSourceAtlasInputs,checkGoalBookSourceAtlasInputs,compactGoalBookSourceAtlasReceipt} from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs';
import {normalizeCanonicalLandscape} from '../../../../../../../../app/src/utils/authoring/canonicalAuthoring';
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel';
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../../../../../../app/node_modules/ajv-formats/dist/index.js';
const r=resolve('.'),d='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12',bp=`${d}/chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6`,b=resolve(bp),n=resolve(d,'chemie-q2-naturstoffe-current402-author-20261012-v2'),s=resolve(d,'chemie-q2-naturstoffe-source4-MM-targeted-remediation-author-20261012-v3'),cap=resolve('tmp/chemie-current407-root-v3-normal-capsule');
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'));const rows=async(p:string)=>(await readFile(p,'utf8')).trim().split('\n').map(JSON.parse);const sh=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex');
const write=async(p:string,x:any)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(x,null,2)+'\n')};const rel=(p:string)=>relative(r,p);
const cpath=`${bp}/candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json`,land=await read(resolve(cpath)),gm=new Map(land.goals.map((g:any)=>[g.id,g]));
const kinds=await read(join(n,'candidate/semantic407.inactive-model-input.json'));const kindDeltas=[];
for(const z of kinds.decisions){const f=fingerprintSemanticKindSourceGoal(gm.get(z.goalId) as any);if(f!==z.sourceFingerprint)kindDeltas.push({goalId:z.goalId,old:z.sourceFingerprint,current:f,classificationUnchanged:z.semanticKind});z.sourceFingerprint=f;}
kinds.sourceLandscapePath=cpath;kinds.ledgerId='chemie-current407-combined-pending-root-source6-v3';await write(join(b,'candidate/semantic407.current-normal-input.json'),kinds);
if(kinds.decisions.filter((x:any)=>x.semanticKind==='curricularAtomic').length!==407)throw Error('407 atom classifications expected');
const liveLand=await read(resolve('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')),liveG=new Map(liveLand.goals.map((g:any)=>[g.id,g])),oldQA=await read(join(n,'candidate/visualization-QA.actual-unapproved-candidates.json')),liveQA=await read(resolve('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'));
const oq=new Map(oldQA.records.map((x:any)=>[x.goalId,x])),lq=new Map(liveQA.records.map((x:any)=>[x.goalId,x]));
const n2AssetTuples=new Map((await read(join(n,'neutral/actual26-image-input-tuples.json'))).records.map((x:any)=>[x.goalId,x]));
const qa=structuredClone(oldQA),assetDigests:any={},assetTuples:any[]=[],m1='2fdd759f-8349-5f7e-b29a-6ac7fb0299f9',ee='ee359c2e-e339-5b56-bceb-cc7517b36bf2';
const activeFive=new Set(['014e6d85-eecf-5228-9031-52a39981cd0d','127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a','197bc2c5-835e-59e7-9263-5684e89799cc','7b477c2b-0919-5d70-810b-188a88c55ffc',m1]);
const selectedP=await rows(join(b,'positive/P37.current-whole-retained-and-targeted.pending.review.jsonl')),extraP=await rows(join(b,'positive/P2.current-M1-and-3fb7-retained.exact.jsonl'));
for(const goal of land.goals){const link=goal.resourceLinks?.find((l:any)=>l.type==='goal-visualization');if(!link)continue;
 let path=resolve('app/public',link.url.slice(1)),basis='actual-current-public',q:any=lq.get(goal.id);
 if(!activeFive.has(goal.id)&&oq.has(goal.id)){
  const np=join(n,'native-public',link.url.slice(1));if(existsSync(np)){path=np;basis='sealed-N2-exact-resource';q=oq.get(goal.id);}
  const tuple:any=n2AssetTuples.get(goal.id);if(tuple&&tuple.url===link.url){path=resolve(tuple.assetPath);basis='sealed-N2-authored-exact-resource-tuple';q=oq.get(goal.id);}
 }
 if(goal.id===ee){path=resolve(d,'chemie-q2-ammonium-ee359-phone-legibility-author-root-20261012-v4/ee359c2e-e339-5b56-bceb-cc7517b36bf2.png');basis='root-actual-ee4-author-resource';q=oq.get(goal.id);}
 if(!q)throw Error('Missing QA record '+goal.id);
 const bytes=await readFile(path),dig=sh(bytes);
 if(goal.id===ee&&!dig.startsWith('sha256:5c1e74bc'))throw Error('Wrong ee4 bytes');
 if(goal.id!==ee&&q.assetSha256!==dig)throw Error(`QA/actual asset mismatch ${goal.id}:${q.assetSha256}/${dig}`);
 const row:any=qa.records.find((x:any)=>x.goalId===goal.id);Object.assign(row,structuredClone(q),{title:goal.title,description:goal.description,landscapePath:cpath,imageUrl:link.url,assetSha256:dig});
 if(goal.id===ee)Object.assign(row,{aiApproved:'no',aiApprovedAssetSha256:'',contentApprovedChatGpt:'no',aiReviewedAt:null,aiReviewer:'',aiNotes:'Actual root ee4 resource tuple, scientific verdict not adopted by technical preparer; exact new combined review pending.'});
 assetDigests[link.url]=dig;
 const dest=resolve(cap,'app/public',link.url.slice(1));await mkdir(dirname(dest),{recursive:true});if(!existsSync(dest))await symlink(path,dest);else if(sh(await readFile(dest))!==dig)throw Error('Existing capsule asset differs '+goal.id);
 assetTuples.push({goalId:goal.id,url:link.url,path:rel(path),sha256:dig,bytes:bytes.length,basis,generatedByThisPreparer:false});
}
await write(join(b,'candidate/visualization-QA.current-exact-assets.pending.json'),qa);await write(join(b,'inputs/all-current-candidate-image-tuples.json'),{records:assetTuples,activeM1Retained:true,newImageGeneration:0});
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const v=ajv.compile(await read(resolve('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')));const pChecks=[];
for(const p of [...selectedP,...extraP]){const g:any=gm.get(p.goalId),dig:any={};for(const l of g.resourceLinks??[])if(l.type==='goal-visualization')dig[l.url]=assetDigests[l.url];if(!v(p))throw Error(ajv.errorsText(v.errors));const err=validatePositiveGoalEvidenceRecordSemantics(p,g,dig,'curricularAtomic');if(err.length)throw Error(err.join('\n'));pChecks.push({goalId:p.goalId,goalFingerprint:p.goalFingerprint,reviewInputFingerprint:p.reviewInputFingerprint,profileFingerprint:p.profileFingerprint,allExpectedDigestsMatch:true});}
await write(join(b,'checks/P37-plus-current-M1-3fb.normal-schema-and-binding.actual.json'),{normalSchemaRecords:pChecks.length,P37:37,exactCurrentAdditional:2,errors:[],records:pChecks,noNewScientificVotes:true});

// Memory uses actual current402 bodies and the exact authored nine N2 child
// bodies. Only explicit S6 successors replace affected necessity rationale.
const deep=await read(resolve('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')),subject=deep.subjects.find((x:any)=>x.subject==='chemie'),memCfg=await read(resolve(subject.memoryReviewConfigPath));
const currentM=await rows(resolve(memCfg.reviewPath)),n2M=await rows(join(n,'memory/current407.author.necessity.jsonl')),s6M=await rows(join(s,'memory/current407.inactive.author.necessity.jsonl'));
const mm=new Map([...n2M,...currentM].map(x=>[x.goalId,x])),s6changed=new Set((await read(join(s,'memory/exact-necessity-fingerprint-deltas.json'))).records.map((x:any)=>x.goalId));for(const x of s6M)if(s6changed.has(x.goalId))mm.set(x.goalId,x);
const normalize=(x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim();const stable=(x:any):string=>Array.isArray(x)?`[${x.map(stable).join(',')}]`:x&&typeof x==='object'?`{${Object.entries(x).sort(([a],[c])=>a.localeCompare(c)).map(([k,v])=>`${JSON.stringify(k)}:${stable(v)}`).join(',')}}`:JSON.stringify(x);
const memoryFP=(g:any,rv:string)=>sh(stable({ruleVersion:rv,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)}));
const memory=[],memDeltas=[];for(const z of kinds.decisions.filter((x:any)=>x.semanticKind==='curricularAtomic')){const old:any=mm.get(z.goalId);if(!old)throw Error('Missing memory decision '+z.goalId);const x=structuredClone(old),f=memoryFP(gm.get(z.goalId),x.ruleVersion);if(f!==x.fingerprint){memDeltas.push({goalId:x.goalId,before:x.fingerprint,current:f,bodiesRetainedExceptFingerprint:true});x.fingerprint=f;}memory.push(x);}
await mkdir(join(b,'memory'),{recursive:true});await writeFile(join(b,'memory/current407.actual-current-plus-N2-source6.pending.jsonl'),memory.map(x=>JSON.stringify(x)).join('\n')+'\n');
const cards=await rows(resolve(memCfg.cardReviewPath)),n2Cards=await rows(join(n,'memory/current75.author.cards.jsonl'));for(const c of cards){const newer=n2Cards.find(x=>x.cardId===c.cardId&&x.deckId===c.deckId);if(newer?.originGoalIds?.includes('e9d34f34-2a43-5cc7-bcca-1d08e057531d'))Object.assign(c,newer);}
if(cards.length!==75)throw Error('75 cards required');await writeFile(join(b,'memory/current75.actual-plus-exact-N2-origin-retarget.jsonl'),cards.map(x=>JSON.stringify(x)).join('\n')+'\n');
for(const g of land.goals){for(const key of ['vocabularySource','vocabularySourceEn']){const url=g.extendedData?.[key];if(!url||!url.startsWith('/data/'))continue;let src=resolve('app/public',url.slice(1));if(basename(src)==='de_gymnasium_chemistry_flashcards_natural_q2.de.json')src=join(n,'memory/de_gymnasium_chemistry_flashcards_natural_q2.de.json');const dest=resolve(cap,'app/public',url.slice(1));await mkdir(dirname(dest),{recursive:true});if(!existsSync(dest))await symlink(src,dest);}}

// Generate/book-local-check once in the outside-curricula capsule. Copy the
// source views byte-exact; retarget only manifest locators for the owned copy.
const sourceCfg=await read(join(b,'inputs/current-source-atlas.input-config.exact.json'));sourceCfg.landscapePath=cpath;sourceCfg.semanticKindLedgerPath=`${bp}/candidate/semantic407.current-normal-input.json`;
sourceCfg.mappingPaths=sourceCfg.mappingPaths.map((p:string)=>p.includes('/DE-BW/upper-secondary/')?`${bp}/sources/BW126.whole-original-clauses-plus-bounded-two-components.inactive.review.json`:p.includes('/DE-HE/upper-secondary/')?`${bp}/sources/HE.whole-clauses-AA-TLC-owner-and-MM-context.inactive.review.json`:p);
if(!sourceCfg.mappingPaths.some((x:string)=>x.includes('m7-manganometry-three-route-corrections-20261012-v1')))throw Error('Current NI M1 map must be retained');
const bookLocal='app/scripts/config/goal-books/inactive/chemie-current407-root-v3-combined-source6';sourceCfg.outputDirectory=`${bookLocal}/source-views`;sourceCfg.manifestPath=`${bookLocal}/atlas.sources.json`;sourceCfg.navigationViewPath=`${bookLocal}/navigation.view.json`;sourceCfg.expectedCurricularAtomicGoalCount=387;
await write(join(b,'atlas/normal-source-inputs.capsule.config.json'),sourceCfg);await write(resolve(cap,`${bookLocal}/atlas.inputs.json`),sourceCfg);
const result=buildGoalBookSourceAtlasInputs(sourceCfg,cap);for(const [path,text] of Object.entries(result.outputs)){await mkdir(dirname(resolve(cap,path)),{recursive:true});await writeFile(resolve(cap,path),text);}
checkGoalBookSourceAtlasInputs(`${bookLocal}/atlas.inputs.json`,cap);
const outputMap:any={};for(const path of Object.keys(result.outputs)){const sub=path.slice(bookLocal.length+1),dest=join(b,'atlas/generated-normal-original',sub);await mkdir(dirname(dest),{recursive:true});await writeFile(dest,result.outputs[path]);outputMap[path]=rel(dest);}
const manifest=JSON.parse(result.outputs[sourceCfg.manifestPath]),navigation=JSON.parse(result.outputs[sourceCfg.navigationViewPath]);
const retargetManifest={...manifest,sourcePaths:manifest.sourcePaths.map((p:string)=>outputMap[p]),navigationViewPath:outputMap[sourceCfg.navigationViewPath]};await write(join(b,'atlas/atlas.sources.owned-locators.json'),retargetManifest);
await write(join(b,'atlas/full-expanded-normal-receipt.actual.json'),result.receipt);
await write(join(b,'checks/normal-current-source-atlas.actual.json'),{counts:result.receipt.counts,sourceGenerator:'unmodified buildGoalBookSourceAtlasInputs and checkGoalBookSourceAtlasInputs',exactGeneratedViewsRetained:true,manifestRetargetOnlyLocators:true,outputAliases:outputMap,currentNIMapRetained:sourceCfg.mappingPaths.find((x:string)=>x.includes('/DE-NI/upper-secondary/')),fullCanonicalCount:407,sourceCoverageNotWholeApproval:true,omittedGoals:result.receipt.omittedGoals,errors:[],newScientificVotes:0});

// Fresh memory source/navigation views carry exactly the already authored
// memory-support references; no source applicability is inferred from them.
const n2MemCfg=await read(join(n,'memory/config.author.inactive.json')),vis=[];
for(let i=0;i<n2MemCfg.visibilityScopes.length;i++){const src=n2MemCfg.visibilityScopes[i];let view=await read(resolve(src.viewPath));
 if(src.label.includes('National current source')){view=structuredClone(navigation);const existing=await read(resolve(src.viewPath));const supports:any[]=[];const walk=(nodes:any[])=>{for(const x of nodes??[]){if(x.kind==='structure'&&String(x.id).includes('memory-support'))supports.push(structuredClone(x));else walk(x.children)}};walk(existing.rootNodes);view.rootNodes[0].children.push(...supports);}
 const vp=join(b,`memory/visibility-${String(i+1).padStart(2,'0')}.current.view.json`);await write(vp,view);vis.push({label:src.label,viewPath:rel(vp)});
}
const newMemCfg={...n2MemCfg,landscapePath:cpath,reviewPath:`${bp}/memory/current407.actual-current-plus-N2-source6.pending.jsonl`,cardReviewPath:`${bp}/memory/current75.actual-plus-exact-N2-origin-retarget.jsonl`,visibilityScopes:vis,reportPath:`${bp}/checks/M407.normal-current.actual.md`};await write(join(b,'memory/M407.current-normal.inactive.config.json'),newMemCfg);
await write(join(b,'checks/memory-and-semantic-actual-binding-deltas.json'),{kindDeltas,memoryDeltas:memDeltas,memoryRows:memory.length,cards:cards.length,visibilityScopes:vis.length,newCards:0,newScientificVotes:0});

// Full 407 review model is distinct from the honestly bounded source-union
// model. This preserves exact comparison against the old canonical review.
const oldCfg=await read(join(n,'native/full407.actual.config.json')),cfg={...oldCfg,bookId:'chemie-current407-combined-targeted-v3',landscapePath:cpath,semanticKindLedgerPath:`${bp}/candidate/semantic407.current-normal-input.json`,goalVisualizationQaPath:`${bp}/candidate/visualization-QA.current-exact-assets.pending.json`,evidenceReviewPaths:[`${bp}/positive/P37.current-whole-retained-and-targeted.pending.review.jsonl`,`${bp}/positive/P2.current-M1-and-3fb7-retained.exact.jsonl`],outputPath:`${bp}/native/full407.current.actual.book-model.json`};
const view=await read(resolve(cfg.compositionViewPath)),texts=await Promise.all(cfg.evidenceReviewPaths.map((p:string)=>readFile(resolve(p),'utf8')));
const model=buildGoalBookModel({landscape:land,compositionView:view,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:cfg.evidenceReviewPaths.map((path:string,i:number)=>({path,text:texts[i]})),config:cfg});if(model.pages.length!==407)throw Error('Full canonical review expected407');await write(join(b,'native/full407.current.actual.config.json'),cfg);await writeGoalBookModel(model,resolve(cfg.outputPath));
const atlasCfg={...cfg,bookId:'chemie-current407-source387-v3',compositionViewPath:undefined,compositionViewManifestPath:`${bp}/atlas/atlas.sources.owned-locators.json`,outputPath:`${bp}/atlas/source387.actual.book-model.json`};
const sm=buildGoalBookModel({landscape:land,compositionViewManifest:retargetManifest,compositionViewSources:retargetManifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(readFileSync(resolve(path),'utf8'))})),navigationView:navigation,durationModelPolicy:await read(resolve(retargetManifest.durationModelPolicyPath)),semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:cfg.evidenceReviewPaths.map((path:string,i:number)=>({path,text:texts[i]})),config:atlasCfg});await write(join(b,'atlas/source387.actual.config.json'),atlasCfg);await writeGoalBookModel(sm,resolve(atlasCfg.outputPath));

// Source views are compiled through the normal API. Direct and ancestor
// prerequisites are reported with scope membership, never relaxed for a count.
const canonical=normalizeCanonicalLandscape(land),parents=new Map<string,string[]>();for(const g of land.goals)for(const child of g.contains??[])parents.set(child,[...(parents.get(child)??[]),g.id]);
const effective=(id:string,visiting=new Set<string>()):Set<string>=>{if(visiting.has(id))throw Error('requires inheritance cycle');visiting.add(id);const g:any=gm.get(id),out=new Set<string>(g.requires??[]);for(const parent of parents.get(id)??[])for(const q of effective(parent,new Set(visiting)))if(q!==id)out.add(q);return out;};
const scoped=[];for(const x of result.receipt.scopes){const path=outputMap[x.path],view=await read(resolve(path)),compiled=compileCompositionView(normalizeCompositionView(view),canonical),err=compiled.findings.filter(x=>x.severity==='error');if(err.length)throw Error(JSON.stringify(err));const target=new Set(x.goalIds);scoped.push({key:x.key,path,targetCount:x.goalIds.length,affectedTargets:[...selectedP.map(x=>x.goalId),'3fb7dea4-f832-5e23-b518-68b13a655b92'].filter(id=>target.has(id)).map(id=>({goalId:id,directRequires:(gm.get(id) as any).requires??[],effectiveRequires:[...effective(id)],inheritedRequires:[...effective(id)].filter(q=>!((gm.get(id) as any).requires??[]).includes(q)),missingPrerequisitesFromTargetView:[...effective(id)].filter(q=>!target.has(q)),sourceWitnesses:x.witnesses.filter(w=>w.goalId===id)})),errors:[]});}
await write(join(b,'checks/compiled48-source-scopes-and-affected-inherited-prerequisites.actual.json'),{scopes:scoped,canonicalReviewCount:model.pages.length,sourceUnionReviewCount:sm.pages.length,inheritedRequirementsNeverDropped:true,sourceScopeFromPhase:false,compiledErrors:[],readinessScientificReviewPending:true});
console.log(JSON.stringify({P37:37,currentAdditional:2,fullReviewPages:model.pages.length,sourceAtlas:result.receipt.counts,memoryRows:memory.length,memoryCards:cards.length,sourceScopeCompileErrors:0,newScientificVotes:0}));
