"""Validate unchanged normal first-pass campaign, exact copies, then seal once."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,importlib.util,json,subprocess
import jsonschema
ROOT=Path(__file__).resolve().parents[8];OWN=Path(__file__).resolve().parent.parent;REL=OWN.relative_to(ROOT)
def read(p):return json.loads(Path(p).read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def write(p,o):
 p=OWN/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'bytes':len(b),'sha256':sha(b)}
assert not (OWN/'ORIGINAL.first-pass-judgment-seal.json').exists()
args=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(REL/'round-b/review-bundle-manifest.json'),'--input',str(REL/'round-b/description-review-input.json'),'--campaign',str(REL/'round-b/description-review-campaign.json'),'--batches-dir',str(REL/'round-b/batches'),'--results-dir',str(REL/'round-b/results')]
started=datetime.now(timezone.utc).isoformat();r=subprocess.run(args,cwd=ROOT,capture_output=True,text=True)
(OWN/'checks/normal-unchanged-first-pass-results.stdout.actual.txt').write_text(r.stdout);(OWN/'checks/normal-unchanged-first-pass-results.stderr.actual.txt').write_text(r.stderr)
write('checks/normal-unchanged-first-pass-results.terminal.actual.json',{'command':args,'exitCode':r.returncode,'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat()});print(r.returncode,r.stdout,r.stderr)
assert r.returncode==0
campaign=read(OWN/'round-b/description-review-campaign.json');batch=campaign['batches'][0];results=OWN/'round-b/results'
errors=[];count=0
for p,sp in [(results/(batch['batchId']+'.records.jsonl'),OWN/'round-b/contracts/goal-description-review-record.schema.json'),(results/(batch['batchId']+'.run.json'),OWN/'bundle/contracts/goal-evidence-ai-run-manifest.schema.json')]:
 validator=jsonschema.Draft202012Validator(read(sp),format_checker=jsonschema.FormatChecker());rows=[json.loads(x) for x in p.read_text().splitlines()] if p.suffix=='.jsonl' else [read(p)]
 for row in rows:count+=1;errors.extend(e.message for e in validator.iter_errors(row))
copy=read(OWN/'checks/exact-prepared-input-copy.actual.json');changed=[]
for x in copy['rows']:
 if sha((ROOT/x['originalPath']).read_bytes())!=x['sha256'] or (ROOT/x['originalPath']).read_bytes()!=(ROOT/x['ownExactCopyPath']).read_bytes():changed.append(x['originalPath'])
assert not changed
spec=importlib.util.spec_from_file_location('validate_schemas',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);symlinks=m.curriculum_symlink_errors(ROOT);errors.extend(symlinks)
for p in OWN.rglob('*'):
 if p.is_symlink():errors.append('Owned symlink '+str(p))
 if p.suffix=='.json':read(p)
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
q=subprocess.run(['git','check-ignore','--stdin'],cwd=ROOT,input=''.join(p.relative_to(ROOT).as_posix()+'\n' for p in OWN.rglob('*') if p.is_file()),text=True,capture_output=True)
if q.stdout.strip():errors.append('Ignored owned input '+q.stdout)
write('checks/schema-format-portability-exact-copy.actual.json',{'schemaValidatedRecords':count,'errors':errors,'allWrittenJsonJsonlParsed':True,'preparedOriginalFilesChanged':changed,'exactPreparedCopyCount':len(copy['rows']),'reviewPass':campaign['reviewPass'],'campaignUnchanged':True,'curriculum_symlink_errors':symlinks,'ignoredOwnedFiles':q.stdout.splitlines(),'gitCheckIgnoreExitCode':q.returncode})
assert not errors,errors
neutral=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-four-final-resource-metadata-current402-root-preparation-20261012-v2/FINAL.neutral-final-metadata-current402-four-input.json'
fullneutral=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-four-joint-current402-root-integration-preparation-20261012-v1/FINAL.neutral-current402-selected-four-review-input.json'
external=[neutral,fullneutral,ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v1/cases/whole31.DEEN.cases-and-current-context.author.json',ROOT/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',ROOT/'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_natural_q2.de.json']
native=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-four-current402-normal-integration-root-20261012-v3/native-D4'
external.extend(native/f for f in ['bundle/manifest.json','bundle/book-model.json','bundle/book.html','bundle/book.pdf','round-b/description-review-campaign.json','round-b/description-review-input.json','round-b/contracts/goal-description-review-record.schema.json','round-b/batches/'+batch['batchId']+'.input.jsonl'])
for g in read(fullneutral)['goals']:external.append(ROOT/g['originalActualAssetAndDeviceBindings']['actualOwnNativeImage']['path'])
source=read(OWN/'sources/current-four-raw32-mapped-clauses.actual.json')
for b in source['mappingAndExtractionBindings']:
 assert sha((ROOT/b['path']).read_bytes())==b['sha256'];assert sha((ROOT/b['sourceExtractionPath']).read_bytes())==b['sourceExtractionSha256']
write('FINAL.original-first-independent-b.manifest.json',{'schemaVersion':1,'role':'original_current_tuple_normal_first_pass_independent_B_not_followup_conversion','packagePath':REL.as_posix(),'goalIds':batch['goalIds'],'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'reviewPass':'first_pass','independenceGroupId':campaign['independenceGroupId'],'copiedCampaignAndInputsExact':True,'recordsPath':(REL/'round-b/results'/f"{batch['batchId']}.records.jsonl").as_posix(),'runPath':(REL/'round-b/results'/f"{batch['batchId']}.run.json").as_posix(),'DKeep':4,'DReviseSplitOrBlock':0,'boundedWholeCurrentPAndVPass':4,'sourceRawDirectRowsRead':105,'normalMappingFilesExpanded':32,'inheritedBroadRowRead':1,'fullBroadSourceUnionApproved':False,'limitedExposureDisclosure':'Root P-record reason in required input mentions prior confirmation. Seen and excluded from scientific reasoning; no prior FINAL4/N31 or current A judgment contents consulted.','normalValidationExitCode':0,'schemaValidatedRecords':count,'curriculum_symlink_errors':symlinks,'activeIntegration':False,'strictGain':0,'humanApproval':False,'humanTrial':False,'actualLearnerOrExperimentPerformance':False,'E1G1CandidateOnly':True,'externalRequiredInputBindings':[bind(p) for p in sorted(set(external))]})
rows=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('ORIGINAL.first-pass-judgment-seal.json',{'schemaVersion':1,'role':'immutable_original_normal_first_pass_independent_B_current_four_judgment_seal_before_peer_review','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'reviewPass':'first_pass','noPriorFINAL4N31OrCurrentAJudgmentContentsRead':True,'rootPReasonExposureDisclosedAndExcluded':True,'campaignUnchanged':True,'fileCount':len(rows),'totalBytes':sum(x['bytes'] for x in rows),'rows':rows,'manifestSha256':sha((OWN/'FINAL.original-first-independent-b.manifest.json').read_bytes())})
print('Manifest',sha((OWN/'FINAL.original-first-independent-b.manifest.json').read_bytes()));print('Seal',sha((OWN/'ORIGINAL.first-pass-judgment-seal.json').read_bytes()),'files',len(rows))
