import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync, execFileSync } from 'node:child_process';

const R = process.cwd();
const P = await import(resolve(R, 'app/scripts/positiveGoalEvidenceProfileModel.ts'));
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-seven-P-metadata-consumer-bindings-versus-Book15-PNG-bindings-independent-a-ADDENDUM-INERT-v1';
const O = resolve(R, own);
const rootOut = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-first-M7-D9-and14-qualified-integration-root-v1';
const guards = new Map<string,string>();
const sha = (bytes: Buffer|string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const read = (p: string) => { const b = readFileSync(resolve(R,p)); guards.set(p,sha(b)); return b.toString(); };
const json = (p:string) => JSON.parse(read(p));
const assert = (ok:any, m:string) => { if(!ok) throw new Error(m); };
const write = (name:string, raw:string) => {const p=join(O,name);assert(!existsSync(p),'Refuse overwrite '+p);writeFileSync(p,raw);return own+'/'+name;};
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const r08=json(rootOut+'/08-actual-P15-QA346-book-pointer-activation.receipt.json');
const current=json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');
const goals=new Map(current.goals.map((g:any)=>[g.id,g]));
const registry=json('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');
const economics=registry.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften');
const sem=json(economics.semanticKindLedgerPath); const kinds=new Map(sem.decisions.map((d:any)=>[d.goalId,d.semanticKind]));
for(const path of ['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/goalBookModel.ts'])read(path);
const commands:any[]=[]; const bindings:any[]=[]; const metadataVariants=new Map<string,string>(); const candidateConfigs:any[]=[];
for(const index of [44,45]) {
  const state=r08.sixAffectedPositiveConfigs.find((x:any)=>x.active.includes('/'+index+'.'));
  assert(state,'Missing Root config '+index);
  const cfg=json(state.active); assert(cfg.reviewedResourceTypes.length===0,'No consumer scope expansion permitted');
  const body=read(cfg.reviewPath);const oldcfg=json(state.original);const oldBody=read(oldcfg.reviewPath);
  const oldById=new Map(oldBody.split('\n').filter(Boolean).map(l=>{const v=JSON.parse(l);return[v.goalId,v];}));
  const lines=body.split('\n').map((line:string)=>{
    if(!line.trim())return line;
    const record=JSON.parse(line); const goal:any=goals.get(record.goalId);const kind:any=kinds.get(record.goalId);
    const expected=P.fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,{},kind);
    assert(record.reviewInputFingerprint!==expected,'Expected distinct configured digest-null consumer '+record.goalId);
    assert(line.split(record.reviewInputFingerprint).length===2,'Ambiguous raw replacement');
    const next=line.replace(record.reviewInputFingerprint,expected); const parsed=JSON.parse(next);
    assert(P.validatePositiveGoalEvidenceRecordSemantics(parsed,goal,{},kind).length===0,'Metadata-only native semantics');
    const original:any=oldById.get(record.goalId);
    assert(original.reviewInputFingerprint!==expected,'Pre-import original unexpectedly current');
    bindings.push({goalId:record.goalId,configIndex:index,preImportFingerprint:original.reviewInputFingerprint,
      currentBookPNGAssetFingerprint:record.reviewInputFingerprint,configuredPMetadataDigestNullFingerprint:expected,
      wholeProfileStatusReviewerTimesHumanMetadataExact:true,configuredReviewedResourceTypes:[],newResourceScope:false});
    metadataVariants.set(record.goalId,next);return next;
  });
  const review=write(index+'.only-current-resource-metadata-null-digest-seven-scope.INERT.jsonl',lines.join('\n'));
  const nextConfig=write(index+'.only-reviewPath-current-null-digest-metadata.INERT.config.json',JSON.stringify({...cfg,reviewPath:review},null,2)+'\n');
  candidateConfigs.push({index,original:state.original,previousActive:state.active,candidate:nextConfig,reviewPath:review,
    allowedConfigDelta:['reviewPath'],reviewedResourceTypesUnchanged:[],recordCount:cfg.scope.goalIds.length});
}
assert(bindings.length===7,'Wrong bounded current metadata scope');
// Optional aggregate for callers of the configured P contract. The BOOK continues
// to use its separately qualified PNG-digest-bound current whole346 source.
const bookWhole=read(r08.activeWholePositive.path);
const configuredWhole=bookWhole.split('\n').map((line:string)=>line.trim()?metadataVariants.get(JSON.parse(line).goalId)??line:line).join('\n');
const configuredAggregate=write('whole346.configured-P8-PNG-plus7-metadata-null-digest.INERT.jsonl',configuredWhole);
assert(bookWhole.split('\n').filter(Boolean).length===346,'Current Book whole346 source required');
const invoke = (name:string,path:string,expectedExit:number) => {
  const argv=['app/node_modules/tsx/dist/cli.mjs','app/scripts/positiveGoalEvidenceReview.ts','--config='+path,'--mode=check'];
  const startedAt=new Date().toISOString();const r=spawnSync(process.execPath,argv,{cwd:R,encoding:'utf8'});
  const raw=(r.stdout??'')+(r.stderr??'');const output=write(name+'.raw.txt',raw);
  assert(r.status===expectedExit,'Unexpected CLI exit '+name+' '+r.status+' '+raw);
  commands.push({name,argv:[process.execPath,...argv],startedAt,completedAt:new Date().toISOString(),exitCode:r.status,output,
    rawSha256:sha(raw),expectation:expectedExit===0?'PASS-current-configured-metadata-consumer':'FAIL-original-seven-pre-import-link-bindings'});
};
for(const c of candidateConfigs)invoke('01-'+c.index+'-original-preimport-current-negative',c.original,1);
for(const c of candidateConfigs)invoke('02-'+c.index+'-configured-current-metadata-null-digest-positive',c.candidate,0);
const end=[...guards].map(([path,before])=>({path,beforeSha256:before,endSha256:sha(readFileSync(resolve(R,path)))}));
assert(end.every(x=>x.beforeSha256===x.endSha256),'Input changed during native consumer probe');
assert(head===execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),'HEAD changed');
write('actual-native-seven-P-metadata-consumer-and-two-positive-two-negative-CLI.READONLY.json',JSON.stringify({
  status:'QUALIFIED-INERT-seven-native-P-metadata-followers-separate-current-Book15-PNG-binding',actualUTC:new Date().toISOString(),head,
  rootPreviousTwoImageDigestConfigFailures:'Actual Root44/45 CLI logs preserve seven stale errors; prior general function simulation did not use each config reviewedResourceTypes.',
  incorrectProposedOriginalRestore:'Never materialized or activated. Original old P records ALSO fail current CLI because new resource links bind even when digests={}.',
  nativeContract:'goalEvidenceReviewInputPayload always binds resource role/url/altText/reviewStatus; reviewedResourceTypes=[] only excludes PNG file digests. Book always injects actual QA asset SHA.',
  individualBindings:bindings,candidateConfigs,configuredPAggregate:configuredAggregate,
  BookExisting15PNGWholeSourceUnchanged:r08.activeWholePositive,
  prior14RealIndependentImageViewsRetained:true,all346ScientificBodiesStatusHumanTimesUnchanged:true,
  nativeCommands:commands,inputEndGuards:end,activeWrites:0,newDOrPScience:false,newImageScience:false,humanApproval:false,M7Claim:false,
},null,2)+'\n');
console.log(JSON.stringify({candidateConfigs: candidateConfigs.map(x=>x.candidate),nativePass:2,nativeExpectedFail:2,sevenMetadataFollowers:bindings.length,Book15SourceUntouched:true,guards:end.length}));
