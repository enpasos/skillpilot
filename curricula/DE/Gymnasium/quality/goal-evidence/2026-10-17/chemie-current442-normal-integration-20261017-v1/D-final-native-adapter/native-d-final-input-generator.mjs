// Apache-2.0. Generate bounded batch configs from a genuinely final pinned GOAL_IDS file.
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve,relative,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
const HERE=dirname(fileURLToPath(import.meta.url));let ROOT=HERE;
while(true){try{await access(join(ROOT,'app/scripts/goalBookModel.ts'));break;}catch{const p=dirname(ROOT);if(p===ROOT)throw Error('Repository not found');ROOT=p;}}
const argv=process.argv.slice(2),execute=argv.includes('--execute'),ix=argv.indexOf('--final-plan'),file=ix<0?null:argv[ix+1];
for(let i=0;i<argv.length;i++){if(!['--help','--execute','--final-plan'].includes(argv[i]))throw Error('Unknown argument '+argv[i]);if(argv[i]==='--final-plan')i++;}
if(argv.includes('--help')||!file){if(execute&&!file)throw Error('--execute requires --final-plan');console.log(`Usage: node --import ./app/node_modules/tsx/dist/loader.mjs ${relative(ROOT,fileURLToPath(import.meta.url))} --final-plan <root-final-generator-plan.json> [--execute]\nRequires finalScopeApplied:true, exact final canonical/SEM/registry/apply/measurement/science pins, baseGoalBookConfig and goalIdsFile.\nWithout --execute: pin/scope preflight only. With --execute: one stock in-memory full ordinary base model, prerequisite-safe <=20-goal subset checks and new batch configs. No HTML/PDF, campaign, native record, registry or historical file write.`);}
else{
 const assert=(c,m)=>{if(!c)throw Error(m);},sha=b=>createHash('sha256').update(b).digest('hex');
 const path=p=>{assert(typeof p==='string'&&p,'Missing path');const q=resolve(ROOT,p),r=relative(ROOT,q);assert(r&&r!=='..'&&!r.startsWith('..'+sep),'Path escapes repository');return q;};
 const load=async p=>JSON.parse(await readFile(path(p),'utf8'));
 const pin=async p=>{const b=await readFile(path(p));return{path:p,sha256:sha(b),bytes:b.length};};
 const check=async p=>{assert(p&&/^[a-f0-9]{64}$/.test(p.sha256),'Exact final SHA pin required');const actual=await pin(p.path);assert(actual.sha256===p.sha256&&(p.bytes===undefined||actual.bytes===p.bytes),'Input drift '+p.path);return actual;};
 const spec=await load(file);assert(spec.subject==='chemie'&&spec.finalScopeApplied===true,'Final Chemistry scope/applicability integration is still pending');
 const mandatory=['canonical','semanticKinds','normalRegistry','finalScopeReceipt','finalApplicabilityMeasurement','existingD65Science','existingD65ScienceSeal','baseGoalBookConfig','goalIdsFile'];
 for(const k of mandatory)await check(spec[k]);for(const p of spec.additionalInputGuards??[])await check(p);
 const originalNote=JSON.parse(await readFile(join(HERE,'PROVENANCE.unexecuted-stock-native-D-adapter.json'),'utf8'));for(const p of originalNote.stockSources)await check(p);
 const c=await load(spec.canonical.path),sem=await load(spec.semanticKinds.path),registry=await load(spec.normalRegistry.path),chem=registry.subjects.find(s=>s.subject==='chemie'),baseCfg=await load(spec.baseGoalBookConfig.path);
 assert(chem?.landscapePath===spec.canonical.path&&chem.semanticKindLedgerPath===spec.semanticKinds.path,'Final normal canonical/SEM mismatch');
 assert(baseCfg.landscapePath===spec.canonical.path&&baseCfg.semanticKindLedgerPath===spec.semanticKinds.path&&baseCfg.publicationMode==='review','Full base must bind final canonical/SEM in review mode');
 assert(Array.isArray(baseCfg.evidenceReviewPaths)&&baseCfg.evidenceReviewPaths.length>0,'Complete current P selection must be explicitly bound in the base config');
 const requiredPPaths=[];for(const p of chem.positiveEvidenceConfigPaths){const cfg=await load(p);requiredPPaths.push(cfg.reviewPath);}
 const expectedP=[...new Set(requiredPPaths)].sort(),boundP=[...new Set(baseCfg.evidenceReviewPaths)].sort();
 const rowsByGoal=async paths=>{const m=new Map();for(const p of paths){for(const l of (await readFile(path(p),'utf8')).split(/\r?\n/)){if(!l.trim())continue;const r=JSON.parse(l);assert(!m.has(r.goalId)||isDeepStrictEqual(m.get(r.goalId),r),'Conflicting whole P records for '+r.goalId);m.set(r.goalId,r);}}return m;};
 const selectedP=await rowsByGoal(expectedP),baseP=await rowsByGoal(boundP);assert(selectedP.size===baseP.size&&[...selectedP].every(([g,r])=>isDeepStrictEqual(r,baseP.get(g))),'Full base must bind exactly the actual current whole native P records; equivalent combined JSONL is allowed');
 const parsed=await load(spec.goalIdsFile.path),ids=Array.isArray(parsed)?parsed:parsed.goalIds,ordinary=new Set(sem.decisions.filter(d=>d.semanticKind==='curricularAtomic'&&d.decisionStatus==='authoritative').map(d=>d.goalId));
 assert(Array.isArray(ids)&&ids.length>0&&new Set(ids).size===ids.length&&ids.every(g=>ordinary.has(g)),'GOAL_IDS must contain unique actual current ordinary IDs');
 assert(typeof spec.outputRoot==='string'&&spec.outputRoot.startsWith('curricula/DE/Gymnasium/quality/goal-evidence/'),'Own evidence outputRoot required');
 if(!execute)console.log(JSON.stringify({executed:false,finalGoalIdsFile:spec.goalIdsFile,finiteGoalCount:ids.length,ordinaryDenominator:ordinary.size,boundedGroups:Math.ceil(ids.length/20),wholePReviewPaths:boundP.length,hardcoded65:false,renderInvocations:0},null,2));
 else{
  const stock=await import(pathToFileURL(join(ROOT,'app/scripts/goalBookModel.ts')).href),subset=await import(pathToFileURL(join(ROOT,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href);
  const loaded=await stock.loadGoalBookBuildInputs(spec.baseGoalBookConfig.path),pages=new Map(loaded.model.pages.map(p=>[p.goalId,p]));assert(pages.size===ordinary.size&&[...ordinary].every(g=>pages.has(g)),'Stock full base must cover exact current ordinary denominator');
  const selected=new Set(ids),done=new Set(),ordered=[];
  while(done.size<ids.length){const eligible=ids.filter(g=>!done.has(g)&&pages.get(g).requires.every(r=>!selected.has(r.goalId)||done.has(r.goalId))).sort((a,b)=>pages.get(a).navigationOrder-pages.get(b).navigationOrder||a.localeCompare(b));assert(eligible.length>0,'Selected prerequisite ordering has no safe frontier');const g=eligible[0];done.add(g);ordered.push(g);}
  const out=path(spec.outputRoot);await mkdir(out,{recursive:true});const configs=[],guards=[...mandatory.map(k=>spec[k]),...(spec.additionalInputGuards??[])],subsetChecks=[];
  for(let i=0;i<ordered.length;i+=20){const n=String(i/20+1).padStart(3,'0'),group=ordered.slice(i,i+20),batchId=`chemie-final-current-context-d-${n}-v1`,bookId=`chemie-final-context-d-${n}`,outputDirectory=spec.outputRoot+'/batch-'+n;
   const model=subset.buildGoalDescriptionRolloutSubsetModel({baseModel:loaded.model,goalIds:group,bookId,title:'Chemie: endgültiger aktueller D-Kontext'});assert(model.pages.length===group.length,'Bounded stock subset scope mismatch');
   const cfg={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId,subject:'chemie',subjectLabel:'Chemie',bookId,title:'Chemie: endgültiger aktueller D-Kontext',baseGoalBookConfigPath:spec.baseGoalBookConfig.path,goalIds:group,outputDirectory,feedbackBaseUrl:'https://skillpilot.com/api/goal-feedback',promptPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',criteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',publicRoot:'app/public',printDerivativeProfile:'bounded-atlas'};
   const cp=spec.outputRoot+'/batch-'+n+'.config.json';await writeFile(path(cp),JSON.stringify(cfg,null,2)+'\n',{flag:'wx'});await subset.loadGoalDescriptionRolloutBatchConfig(cp);
   configs.push({config:await pin(cp),baseGoalBookConfig:spec.baseGoalBookConfig,finalReviewerReceipts:[],synthesisAuthoring:null});subsetChecks.push({goalIds:group,stockSubsetDigest:model.digest,pages:model.pages.length});
  }
  for(const p of guards)await check(p);
  const final={...spec,goalIds:ordered,batches:configs,additionalInputGuards:[...(spec.additionalInputGuards??[]),spec.goalIdsFile]};await writeFile(join(out,'FINAL-INPUTS.actual.staged.json'),JSON.stringify(final,null,2)+'\n',{flag:'wx'});
  await writeFile(join(out,'RECEIPT.final-goal-ids-to-bounded-stock-configs.actual.json'),JSON.stringify({actualFinalGoalIdsFile:spec.goalIdsFile,finalMeasurement:spec.finalApplicabilityMeasurement,goalCount:ids.length,ordinaryDenominator:ordinary.size,groups:configs.length,stockFullBaseDigest:loaded.model.digest,subsetChecks,configs,HTMLOrPDFRendered:0,campaignsOrReviewsCreated:0,normalRegistryOrHistoricalFilesWritten:0,reviewMode:'input-generation-only; actual new-round peer blindness must be declared by real reviewers; no eternal total-blindness claim'},null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({generatedGroups:configs.length,actualGoalCount:ids.length,stagePlan:spec.outputRoot+'/FINAL-INPUTS.actual.staged.json',renderInvocations:0,newScienceVotes:0}));
 }
}
