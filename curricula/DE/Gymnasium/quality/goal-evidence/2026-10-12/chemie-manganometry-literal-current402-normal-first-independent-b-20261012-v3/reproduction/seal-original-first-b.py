from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[8];OWN=Path(__file__).resolve().parent.parent;REL=OWN.relative_to(ROOT)
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-manganometry-current402-literal-source-scope-author-root-20261012-v3'
def read(p):return json.loads(Path(p).read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def write(p,o):
 p=OWN/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'bytes':len(b),'sha256':sha(b)}
assert not (OWN/'ORIGINAL.first-pass-judgment-seal.json').exists()
checks=read(OWN/'checks/schema-format-portability-and-author97.actual.json');assert not checks['errors'] and not any(checks['normalExitCodes'])
freeze=AUTHOR/'FINAL.source-author-successor.freeze.json';assert sha(freeze.read_bytes())=='sha256:941edc50f2a4beb1707d9c0bb44ed786bdd1f74fd7b0b78b3e592eb99570a6b3'
assert len(read(freeze)['files'])==97
for f in read(freeze)['files']:assert sha((ROOT/f['path']).read_bytes())==f['sha256']
for p in OWN.rglob('*'):
 if p.suffix=='.json':read(p)
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
q=subprocess.run(['git','check-ignore','--stdin'],cwd=ROOT,input=''.join(p.relative_to(ROOT).as_posix()+'\n' for p in OWN.rglob('*') if p.is_file()),text=True,capture_output=True)
assert not q.stdout.strip(),q.stdout
write('checks/final-committable-format.actual.json',{'allWrittenJsonJsonlParsed':True,'ignoredOwnedPaths':[],'gitCheckIgnoreExitCode':q.returncode,'author97Unchanged':True,'noOwnedSymlinks':not any(p.is_symlink() for p in OWN.rglob('*'))})
neutral=AUTHOR/'FINAL.neutral-literal-source-successor-review-input.json';n=read(neutral);external=[neutral,freeze]
for k in ['currentWholeCanonicalPath','wholeBilingualCasesAndRubricsPath','allActualRawSourceRoutesPath','normalOriginalSourcesPath','retainedUnprovenOccupationalComponentPath']:external.append(ROOT/n[k])
external.append(AUTHOR/'sources/NI-three-exact-source-target-corrections.inactive.review.json')
external.append(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-manganometry-current402-P-A-author-root-20261012-v1/assets/2fdd759f-8349-5f7e-b29a-6ac7fb0299f9/2fdd759f-8349-5f7e-b29a-6ac7fb0299f9.png')
c=read(OWN/'round-b/description-review-campaign.json');b=c['batches'][0]
write('FINAL.original-first-independent-b.manifest.json',{'schemaVersion':1,'role':'sealed_original_first_current_tuple_independent_B_method_and_literal_source_review','goalId':n['goalId'],'packagePath':REL.as_posix(),'campaignId':c['campaignId'],'roundId':c['roundId'],'independenceGroupId':c['independenceGroupId'],'reviewPass':'first_pass','exactPreparedCampaignUnchanged':True,'recordsPath':(REL/'round-b/results'/f"{b['batchId']}.records.jsonl").as_posix(),'runPath':(REL/'round-b/results'/f"{b['batchId']}.run.json").as_posix(),'D':'KEEP','P':'pass_whole_current_method_contract_E1G1_candidate','A':'atomic','M':'no_memory_needed','V':'KEEP_same_corrected_endpoint_PNG','allThreeWholeBilingualMethodsRawDataAndPracticalRubricsRead':True,'sixRawSourcesAndFullPassagesRead':True,'NI011HiddenDisplayDedupExpanded':True,'sourceThreeWrongExtraTargetRemovals':'pass_bounded','normal32MapIndependentRawRoutesBefore':9,'normal32MapIndependentRawRoutesAfter':6,'NI012OriginalClauseAnd1dfMappingRetained':True,'NI012WholeOccupationalComponentApproved':False,'BYC11OtherMethodsOrFullUnionApproved':False,'wholeBroadSourceUnionApproved':False,'currentCurricularDenominator':402,'denominatorShrunk':False,'limitedExposureDisclosure':'Mandatory root P/QA metadata and author mapping rationale summaries referring to prior findings were seen and excluded; original/current M1 A/B judgment contents were not read.','normalDPAMExitCodes':[0,0,0,0],'schemaValidatedRecords':checks['schemaValidatedRecords'],'curriculum_symlink_errors':checks['curriculum_symlink_errors'],'author97Seal':bind(freeze),'author97Unchanged':True,'activeIntegration':False,'strictGain':0,'humanApproval':False,'humanTrial':False,'actualLearnerOrExperimentPerformance':False,'requiredInputBindings':[bind(p) for p in sorted(set(external))]})
rows=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('ORIGINAL.first-pass-judgment-seal.json',{'schemaVersion':1,'role':'immutable_original_first_current_tuple_independent_B_before_peer_review','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'reviewPass':'first_pass','campaignUnchanged':True,'priorOrCurrentM1PeerJudgmentContentsRead':False,'visibleRootAuthorMetadataSummariesDisclosedAndExcluded':True,'author97Unchanged':True,'fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'rows':rows,'manifestSha256':sha((OWN/'FINAL.original-first-independent-b.manifest.json').read_bytes())})
print('Manifest',sha((OWN/'FINAL.original-first-independent-b.manifest.json').read_bytes()));print('Seal',sha((OWN/'ORIGINAL.first-pass-judgment-seal.json').read_bytes()),'files',len(rows))
