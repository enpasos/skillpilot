// SPDX-License-Identifier: Apache-2.0
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {buildGoalBookModel,writeGoalBookModel,fingerprintSemanticKindSourceGoal} from '../../../../../../../../app/scripts/goalBookModel';
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch';
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../../app/scripts/goalBookRenderer';
import {buildGoalBookReviewBundle} from '../../../../../../../../app/scripts/exportGoalBookReviewBundle';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel';
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../../../../../../app/node_modules/ajv-formats/dist/index.js';

const root=resolve('.'),bp='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-source4-MM-targeted-remediation-author-20261012-v3',b=resolve(bp),old=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2');
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const write=async(p:string,x:any)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(x,null,2)+'\n')};
const sha=(x:Buffer|string)=>`sha256:${createHash('sha256').update(x).digest('hex')}`;
const land=await read(join(b,'candidate/canonical532.current407.source4-MM.inactive.json')),gm=new Map(land.goals.map((g:any)=>[g.id,g]));
const kinds=await read(join(old,'candidate/semantic407.inactive-model-input.json'));
const semanticDeltas=[];
for(const d of kinds.decisions){const f=fingerprintSemanticKindSourceGoal(gm.get(d.goalId) as any);if(d.sourceFingerprint!==f){semanticDeltas.push({goalId:d.goalId,before:d.sourceFingerprint,after:f,semanticKindUnchanged:d.semanticKind});d.sourceFingerprint=f;}}
kinds.sourceLandscapePath=`${bp}/candidate/canonical532.current407.source4-MM.inactive.json`;kinds.ledgerId='chemie-source4-MM-inactive407-normal-model-input';
await write(join(b,'candidate/semantic407.inactive-normal-model-input.json'),kinds);
await write(join(b,'checks/semantic407.binding-deltas.actual.json'),{deltas:semanticDeltas,countedAtomic:kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').length,noNewIds:true,semanticDecisionsNotIndependentApproval:true});
const qa=await read(join(old,'candidate/visualization-QA.actual-unapproved-candidates.json'));
const assets:any={};for(const row of qa.records)if(row.visualizationState==='available')assets[row.imageUrl]=row.assetSha256;
const pfile=await read(join(b,'positive/P6.unbound.author-records.json')),bound=[],tuples=[];
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const schema=await read(resolve('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));const validate=ajv.compile(schema);
for(const r of pfile.records){
  const g:any=gm.get(r.goalId),digests:any={};
  for(const l of g.resourceLinks??[]){if(l.type!=='goal-visualization')continue;
    let p=resolve(old,'native-public',l.url.slice(1));try{await readFile(p)}catch{p=resolve(root,'app/public',l.url.slice(1));}
    const bytes=await readFile(p),digest=sha(bytes);if(assets[l.url]!==digest)throw Error(`exact old image differs:${g.id}`);
    digests[l.url]=digest;tuples.push({goalId:g.id,url:l.url,assetPath:p.slice(root.length+1),sha256:digest,bytes:bytes.length,changedRaster:false});
  }
  r.goalFingerprint=fingerprintGoalForPositiveEvidence(g,'curricularAtomic');r.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,digests,'curricularAtomic');r.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(r.profile);
  if(!validate(r))throw Error(ajv.errorsText(validate.errors,{separator:'; '}));
  const errors=validatePositiveGoalEvidenceRecordSemantics(r,g,digests,'curricularAtomic');if(errors.length)throw Error(errors.join('\n'));bound.push(r);
}
await writeFile(join(b,'positive/P6.actual-bound.ai-candidate.review.jsonl'),bound.map(r=>JSON.stringify(r)).join('\n')+'\n');
await write(join(b,'neutral/retained6.exact-image-tuples.json'),{records:tuples,newImages:0,scientificReviewPending:true});
const cfg=await read(join(old,'native/full407.actual.config.json'));Object.assign(cfg,{bookId:'chemie-source4-MM-current407-v3',title:'Chemie – gezielte Quellen- und Scope-Prüfung',landscapePath:kinds.sourceLandscapePath,semanticKindLedgerPath:`${bp}/candidate/semantic407.inactive-normal-model-input.json`,evidenceReviewPaths:[`${bp}/positive/P6.actual-bound.ai-candidate.review.jsonl`],outputPath:`${bp}/native/current407.actual.book-model.json`});
await write(join(b,'native/current407.actual.config.json'),cfg);
const view=await read(resolve(cfg.compositionViewPath));
const model=buildGoalBookModel({landscape:land,compositionView:view,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:assets,evidenceReviewSources:[{path:cfg.evidenceReviewPaths[0],text:bound.map(r=>JSON.stringify(r)).join('\n')+'\n'}],config:cfg});
if(model.pages.length!==407)throw Error(`407 expected:${model.pages.length}`);
await writeGoalBookModel(model,resolve(cfg.outputPath));
const selected=new Set(bound.map(r=>r.goalId)),order=model.pages.filter(p=>selected.has(p.goalId)).map(p=>p.goalId);
if(order.length!==6)throw Error('6 targeted pages expected');
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:order,bookId:'chemie-source4-MM-targeted6-v3',title:'Chemie – gezieltes Prüfmaterial'});
const pub=join(b,'native-public');for(const t of tuples){const dest=resolve(pub,t.url.slice(1));await mkdir(dirname(dest),{recursive:true});await copyFile(resolve(t.assetPath),dest);if(sha(await readFile(dest))!==t.sha256)throw Error('image copy CAS');}
const mp=join(b,'native/targeted6.book-model.json'),hp=join(b,'native/targeted6.book.html'),pp=join(b,'native/targeted6.book.pdf');
await writeGoalBookModel(subset,mp);
const opts={feedbackBaseUrl:'https://skillpilot.com/api/goal-feedback',publicRoot:pub,printDerivativeProfile:'bounded-atlas' as const};
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,hp,opts),`${hp}.render-manifest.json`);
await writeGoalBookRenderManifest(await writeGoalBookPdf(subset,pp,opts),`${pp}.render-manifest.json`);
const bd=join(b,'native/bundle'),v1=old.replace(/-v2$/,'-v1');
const bundle=await buildGoalBookReviewBundle(subset,{modelPath:mp,pdfPath:pp,pdfRenderManifestPath:`${pp}.render-manifest.json`,htmlPath:hp,htmlRenderManifestPath:`${hp}.render-manifest.json`,outputDirectory:bd,promptPath:join(v1,'review/goal-description-understanding-evidence-review-v2.md'),criteriaPath:join(v1,'review/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'),goalIds:[]});
for(const f of bundle.files){const dest=join(bd,f.relativePath);await mkdir(dirname(dest),{recursive:true});await writeFile(dest,f.content);}await write(join(bd,'manifest.json'),bundle.manifest);
await write(join(b,'checks/normal-P6-schema-semantics-and-native-model.actual.json'),{checkedAtUTC:new Date().toISOString(),schema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',validatedPRecords:bound.length,errors:[],status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',normalProductionPureAPIs:true,normalFullModelPages:model.pages.length,targetedNativePages:subset.pages.length,targetedGoalOrder:order,rasterCount:tuples.length,newRasterCount:0,independentApprovalCount:0,humanApprovalCount:0,humanTrials:0,grantsCentralM7Progress:false,activeWrites:false});
console.log(JSON.stringify({normalSchemaRecords:bound.length,fullModelPages:model.pages.length,targetedNativePages:subset.pages.length,newImages:0,allNormalErrors:0}));
