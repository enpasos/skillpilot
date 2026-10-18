// Apache-2.0. Local technical orchestration only; no review records or approvals are generated.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE=dirname(fileURLToPath(import.meta.url));
let ROOT=HERE;while(true){try{await access(join(ROOT,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'));break;}catch{const up=dirname(ROOT);if(up===ROOT)throw Error('Repository root not found');ROOT=up;}}
const sha=b=>createHash('sha256').update(b).digest('hex');
const args=process.argv.slice(2),execute=args.includes('--execute'),allowPDF=args.includes('--allow-bounded-pdf');
const value=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1];};
const phase=value('--phase')??'plan';
const allowed=new Set(['--help','--execute','--allow-bounded-pdf','--phase','--final-plan']);
for(let i=0;i<args.length;i++){if(!allowed.has(args[i]))throw Error('Unknown argument '+args[i]);if(['--phase','--final-plan'].includes(args[i]))i++;}
const help=()=>console.log(`Usage: node --import ./app/node_modules/tsx/dist/loader.mjs ${relative(ROOT,fileURLToPath(import.meta.url))} --final-plan <root-final-pins.json> --phase <plan|prepare|validate-rounds|finalize|ownership-plan> [--execute] [--allow-bounded-pdf]\nWithout --execute: validation and command preview only. No final inputs/pages/records are generated.\nprepare calls unchanged stock prepare/check and necessarily renders bounded <=20-goal PDFs; it additionally requires --allow-bounded-pdf.\nvalidate-rounds/finalize require actual new final-input reviewer records/runs and independently sealed truthful reviewer receipts.\nownership-plan emits an additive terminal-owner/supersession proposal only; it never writes the normal registry.`);
if(args.includes('--help')||!value('--final-plan')){if(execute&&!value('--final-plan'))throw Error('--execute requires an exact final plan');help();}
else{
 const repoPath=p=>{if(typeof p!=='string'||!p)throw Error('Missing repository path');const q=resolve(ROOT,p),r=relative(ROOT,q);if(!r||r==='..'||r.startsWith('..'+sep))throw Error('Path escapes repository: '+p);return q;};
 const json=async p=>JSON.parse(await readFile(repoPath(p),'utf8'));
 const assert=(v,m)=>{if(!v)throw Error(m);};
 const checkedPin=async p=>{assert(p&&typeof p.path==='string'&&/^[a-f0-9]{64}$/.test(p.sha256),'Expected exact SHA256 file pin');const b=await readFile(repoPath(p.path));assert(sha(b)===p.sha256,'Input drift: '+p.path);if(p.bytes!==undefined)assert(b.length===p.bytes,'Size drift: '+p.path);return b;};
 const pin=async p=>{const b=await readFile(repoPath(p));return{path:p,sha256:sha(b),bytes:b.length};};
 const spec=await json(value('--final-plan'));
 assert(spec.finalScopeApplied===true,'Final source/scope integration has not been explicitly completed. No current context may be materialized.');
 assert(spec.subject==='chemie','Chemistry-only adapter');
 for(const k of ['canonical','semanticKinds','normalRegistry','finalScopeReceipt','finalApplicabilityMeasurement','existingD65Science','existingD65ScienceSeal'])await checkedPin(spec[k]);
 assert(spec.canonical.path==='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','Use final normal Chemistry canonical');
 for(const p of spec.additionalInputGuards??[])await checkedPin(p);
 const stockPins=JSON.parse(await readFile(join(HERE,'PROVENANCE.unexecuted-stock-native-D-adapter.json'),'utf8')).stockSources;
 for(const p of stockPins)await checkedPin(p);
 const c=await json(spec.canonical.path),sem=await json(spec.semanticKinds.path),reg=await json(spec.normalRegistry.path),chem=reg.subjects.find(s=>s.subject==='chemie');
 assert(chem?.landscapePath===spec.canonical.path&&chem.semanticKindLedgerPath===spec.semanticKinds.path,'Final registry canonical/SEM selection mismatch');
 const ordinary=new Set(sem.decisions.filter(d=>d.semanticKind==='curricularAtomic'&&d.decisionStatus==='authoritative').map(d=>d.goalId));
 assert(Array.isArray(spec.goalIds)&&spec.goalIds.length>0&&new Set(spec.goalIds).size===spec.goalIds.length&&spec.goalIds.every(g=>ordinary.has(g)),'Final measured roster must be unique current ordinary goals');
 assert(Array.isArray(spec.batches)&&spec.batches.length>0,'Supply exact final batch config pins');
 const batches=[];
 for(const b of spec.batches){await checkedPin(b.config);const cfg=await json(b.config.path);assert(cfg.subject==='chemie'&&cfg.subjectLabel==='Chemie'&&cfg.goalIds.length>=1&&cfg.goalIds.length<=20,'Only bounded Chemistry batches are allowed');const base=await json(cfg.baseGoalBookConfigPath);assert(base.landscapePath===spec.canonical.path&&base.semanticKindLedgerPath===spec.semanticKinds.path,'Batch base must use exact final canonical and SEM');await checkedPin(b.baseGoalBookConfig);assert(b.baseGoalBookConfig.path===cfg.baseGoalBookConfigPath,'Base config pin mismatch');assert(base.publicationMode==='review','Native context requires review-mode input');assert(cfg.outputDirectory.startsWith(spec.outputRoot+'/'),'Batch output must stay under own final-evidence root');batches.push({spec:b,cfg});}
 const roster=batches.flatMap(b=>b.cfg.goalIds);assert(roster.length===spec.goalIds.length&&new Set(roster).size===roster.length&&spec.goalIds.every(g=>roster.includes(g)),'Batch scopes must partition final measured roster exactly');
 const out=repoPath(spec.outputRoot);assert(relative(ROOT,out).startsWith('curricula/DE/Gymnasium/quality/goal-evidence/'),'Own evidence output root required');
 const script=n=>join(ROOT,'app/scripts',n),loader=join(ROOT,'app/node_modules/tsx/dist/loader.mjs');
 const commands=[];const add=(name,file,argv)=>commands.push({name,argv:[process.execPath,'--import',loader,script(file),...argv]});
 if(phase==='plan'||phase==='prepare')for(const[i,b]of batches.entries()){add(`batch${i+1}-prepare`,'materializeGoalDescriptionRolloutBatch.ts',['prepare','--config',b.spec.config.path]);add(`batch${i+1}-check`,'materializeGoalDescriptionRolloutBatch.ts',['check','--config',b.spec.config.path]);}
 else if(phase==='validate-rounds'||phase==='finalize')for(const[i,b]of batches.entries()){
  assert(Array.isArray(b.spec.finalReviewerReceipts)&&b.spec.finalReviewerReceipts.length===2,'Two real final-input reviewer receipts required');
  const receipts=[];for(const p of b.spec.finalReviewerReceipts){await checkedPin(p);const r=await json(p.path);assert(r.reviewMode==='stock_blind_final_input_first_pass'&&r.finalInputActuallyRead===true&&r.peerResultsReadBeforeOwnSeal===false,'Truthful stock-native reviewer declaration missing; informed historic followups cannot be relabelled blind');await checkedPin(r.nativeRun);await checkedPin(r.nativeRecords);const run=await json(r.nativeRun.path);assert(run.blindToOtherRuns===true&&run.status==='completed','Actual independently completed native run required');receipts.push(r);}
  assert(receipts[0].reviewerId!==receipts[1].reviewerId,'Distinct reviewer receipts required');
  add(`batch${i+1}-dual-summary`,'materializeGoalDescriptionRolloutBatch.ts',['summarize','--config',b.spec.config.path,'--write']);
  if(phase==='finalize'){await checkedPin(b.spec.synthesisAuthoring);add(`batch${i+1}-synthesis-manifest`,'materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',b.spec.config.path,'--authoring',b.spec.synthesisAuthoring.path,'--write']);const manifest=join(b.cfg.outputDirectory,'synthesis-decisions.json');add(`batch${i+1}-resolutions`,'materializeGoalDescriptionRolloutResolutions.ts',['--config',b.spec.config.path,'--synthesis-manifest',manifest,'--write']);add(`batch${i+1}-index`,'materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',b.spec.config.path,'--write']);add(`batch${i+1}-index-check`,'materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',b.spec.config.path]);}
 }
 else assert(phase==='ownership-plan','Unknown phase');
 if(!execute){console.log(JSON.stringify({executed:false,phase,goalCount:roster.length,batches:batches.length,commands,pdfNote:'prepare is intentionally not executed; its stock path requires bounded PDFs and --allow-bounded-pdf',nativeScienceVotesCreated:0},null,2));}
 else{
  assert(phase!=='plan','Choose an explicit execution phase');if(phase==='prepare')assert(allowPDF,'Stock prepare requires bounded PDF rendering. This preparation task has not authorized or performed it; invoke later only with --allow-bounded-pdf on final inputs.');
  await mkdir(out,{recursive:true});
  for(const command of commands){for(const k of ['canonical','semanticKinds','normalRegistry'])await checkedPin(spec[k]);const start=new Date().toISOString();let stdout='',stderr='';const code=await new Promise((yes,no)=>{const p=spawn(command.argv[0],command.argv.slice(1),{cwd:ROOT,env:{...process.env,TSX_DISABLE_CACHE:'1',NO_COLOR:'1'},stdio:['ignore','pipe','pipe']});p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr+=b);p.on('error',no);p.on('close',yes);});const prefix=join(out,`${phase}.${command.name}`);await writeFile(prefix+'.stdout.txt',stdout,{flag:'wx'});await writeFile(prefix+'.stderr.txt',stderr,{flag:'wx'});await writeFile(prefix+'.execution.json',JSON.stringify({argv:command.argv,cwd:ROOT,startedAt:start,completedAt:new Date().toISOString(),exitCode:code},null,2)+'\n',{flag:'wx'});assert(code===0,'Stock command failed: '+command.name);}
  if(phase==='ownership-plan'){
   const stock=await import(pathToFileURL(script('reportDeepUnderstandingRollout.ts')).href),indices=await Promise.all(chem.resolutionIndexPaths.map(async path=>({path,index:await json(path)})));
   const retire=stock.validateResolutionSemanticRetirements({config:chem,landscape:c,semanticKindLedger:sem,indices,scopeIssues:[]});assert(retire.issues.length===0,'Existing semantic retirements invalid');const oldChains=stock.buildResolutionSupersessionChains(chem.resolutionSupersessions??[],chem.resolutionIndexPaths,ordinary,retire);assert(oldChains.issues.length===0,'Existing historical ownership chains invalid');
   const additions=[],edges=[],owners=[];const native=await import(pathToFileURL(script('materializeGoalDescriptionRolloutBatch.ts')).href);
   for(const b of batches){await native.materializeGoalDescriptionRolloutBatchResolutionIndex(b.spec.config.path,false);const ip=join(b.cfg.outputDirectory,'resolution-index.json'),idx=await json(ip);const errors=stock.validateStandaloneResolutionIndexStructure(idx,ordinary);assert(errors.length===0,'New standalone index structure invalid');assert(idx.resolutions.length===b.cfg.goalIds.length&&idx.resolutions.every(r=>r.strictDescriptionComplete===true),'New current D index not complete');additions.push(ip);
    for(const g of b.cfg.goalIds){const chain=oldChains.chains.find(c=>c.goalId===g),claims=indices.filter(i=>i.index.resolutions?.some(r=>r.goalId===g));const tip=chain?.indexPaths.at(-1)??(claims.length===1?claims[0].path:null);assert(tip||claims.length===0,'Historical claim has no unique terminal owner');if(tip)edges.push({goalId:g,supersededIndexPath:tip,replacementIndexPath:ip});owners.push({goalId:g,oldTerminalOwner:tip,newStandaloneIndex:ip,newIndex:await pin(ip)});}
   }
   const allPaths=[...chem.resolutionIndexPaths,...additions],allEdges=[...(chem.resolutionSupersessions??[]),...edges];assert(new Set(allPaths).size===allPaths.length,'Duplicate new index');const checked=stock.buildResolutionSupersessionChains(allEdges,allPaths,ordinary,retire);assert(checked.issues.length===0,'Proposed supersession chain branches/cycles');await writeFile(join(out,'PLAN.current-record-owners-and-additive-supersessions.json'),JSON.stringify({normalRegistryWritten:false,oldHistoryMustStayRegistered:true,resolutionIndexPathAdditions:additions,supersessionReplacementDeltas:edges,recordOwners:owners,stockChainIssues:checked.issues},null,2)+'\n',{flag:'wx'});
  }
  for(const k of ['canonical','semanticKinds','normalRegistry'])await checkedPin(spec[k]);console.log(JSON.stringify({executed:true,phase,goalCount:roster.length,normalRegistryChanged:false,newReviewerRecordsCreated:false,newScienceVotes:0}));
 }
}
