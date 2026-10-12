"""Freeze this original successor once, after actual normal validation."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,subprocess

ROOT=Path(__file__).resolve().parents[8]
OWN=Path(__file__).resolve().parent.parent
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
A3=BASE/'chemie-q3-thirteen-current402-four-images-author-20261012-v3'
B2=BASE/'chemie-q3-thirteen-current402-independent-b-20261012-v2'
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,o):
 p=OWN/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix(),'bytes':len(b),'sha256':sha(b)}
assert not (OWN/'ORIGINAL.successor-judgment-seal.json').exists(),'Original seal is immutable; use a successor.'
for label in ['D13-normal-results','P13-normal-current','A3-normal-current','M3-normal-current']:
 assert read(OWN/'checks'/f'{label}.terminal.actual.json')['exitCode']==0,label
assert not read(OWN/'checks/schema-format-portability-freeze.actual.json')['errors']
assert not read(OWN/'checks/original-and-complete-seals.actual.json')['errors']
m=read(A3/'FINAL.neutral-input-manifest.json')
external=[A3/'FINAL.neutral-input-manifest.json',A3/'independent-QA-plan.neutral.json',A3/'author-package.freeze.json',A3/'committable-package.freeze.json',B2/'ORIGINAL.judgment-seal.json',B2/'FINAL.independent-b.manifest.json']
for key in ['wholeNeutralJoinPath','preciseNeutralDeltaPath','whole402PageModelPath','whole28CasesPath','wholeSourceDutyContextPath','currentSourcePayloadIndexPath','currentSourcePayloadDeltasPath','sourceComponentSiblingReconciliationPath','scope13NativeModelPath','nativeHtmlPath','nativePdfPath','affectedSixNativeModelPath','affectedSixNativeHtmlPath','affectedSixNativePdfPath','assessmentGraphBindingsPath','assessmentSheetsHtmlPath','assessmentSheetsPdfPath','actualPixelCaptureReceiptPath','actualAssessmentCaptureReceiptPath']:
 external.append(ROOT/m[key])
join=read(ROOT/m['wholeNeutralJoinPath'])
for t in join['selected13WholeTuples']:external.append(ROOT/t['imageKeepBinding']['currentActualAssetPath'])
for p in (A3/'positive/assessment-graphs').glob('*.png'):external.append(p)
capture_paths=list((A3/'native/actual-views').glob('*.png'))
write('visualization/exact-actual-view-bindings.original-b.json',{'role':'actual_views_inspected_by_independent_B_not_hash_only_review','actualNativeAnd360680CapturePaths':[bind(p) for p in sorted(capture_paths)],'allListedActualViewsInspected':True,'authorOpinionsUsedAsVotes':False,'humanApproval':False})
external.extend(capture_paths)
own_paths=sorted(p for p in OWN.rglob('*') if p.is_file())
q=subprocess.run(['git','check-ignore','--stdin'],cwd=ROOT,input=''.join(p.relative_to(ROOT).as_posix()+'\n' for p in own_paths),text=True,capture_output=True)
assert q.returncode in [0,1]
assert not q.stdout.strip(),f'Owned review inputs unexpectedly ignored: {q.stdout}'
write('checks/normal-committable-owned-files.actual.json',{'ownedFilesChecked':len(own_paths),'ignoredOwnedPaths':[],'curriculumSymlinks':[],'checkCommand':['git','check-ignore','--stdin'],'checkExitCode':q.returncode,'authorCompleteInputsBoundToOrdinary139FileSeal':True})
s=read(OWN/'sources/per-goal-bounded-contributions-and-remaining-holds.original-b.json')
write('FINAL.targeted-independent-b.manifest.json',{'schemaVersion':1,'role':'sealed_original_blind_targeted_independent_B_successor_not_active_integration','packagePath':OWN.relative_to(ROOT).as_posix(),'ownOriginalV2Seal':bind(B2/'ORIGINAL.judgment-seal.json'),'authorV3OriginalSeal':bind(A3/'author-package.freeze.json'),'authorV3CompleteCommittableSeal':bind(A3/'committable-package.freeze.json'),'noCurrentSuccessorAOrRootOrHistoricalPeerJudgmentReadBeforeSeal':True,'wholeCurrentDenominator':402,'strictBaselineOnly':212,'strictGain':0,'goalIds':[t['goalId'] for t in join['selected13WholeTuples']],'D13':'KEEP current normal fingerprints; original own description judgment retained after explicit context comparison','P13':'13 bounded current-goal scientific passes; E1/G1 candidates','V13':'five actual new PNGs pass; eight exact good original assets retained','A3':'exact original own atomic judgments retained, current normal check passed','M3':'exact original own no_memory_needed judgments retained, current normal check passed','retainedUnchangedWholeScientificCaseBodies':25,'changedWholeScientificCases':['q3-18-a','q3-18-b','q3-09-c-qualitative-contribution'],'eligibleBoundedScientificClosureGoalIds':s['eligibleBoundedScientificGoalIds'],'remainingGoalBoundSourceOrSelectionHolds':s['remainingGoalBoundHolds'],'broaderSourceOperatorHolds':['NI corrosion/iron-ion detection and corrosion-protection experiment rows005/006','SN LK local-cell/corrosion experiment row070-07','TH pupil corrosion experiment with Fe2+/OH- detection row118; gas-detection580b is not an ion-detection owner'],'fullSourceUnionApproved':False,'source381AtlasAnd497UnresolvedNotClearance':True,'humanLaboratoryTrialIsNotMachineM7Prerequisite':True,'actualExperimentPerformance':False,'actualLearnerPerformance':False,'humanApproval':False,'humanTrial':False,'activeIntegration':False,'allNormalTargetedChecksExitZero':True,'ownSchemaRecordsValidated':28,'allWrittenJsonJsonlParsed':True,'curriculum_symlink_errors':[],'ownedRegularPortableInputBindings':[bind(p) for p in sorted(set(external))]})
for p in OWN.rglob('*'):
 if p.suffix=='.json':read(p)
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
rows=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('ORIGINAL.successor-judgment-seal.json',{'schemaVersion':1,'role':'immutable_original_blind_targeted_independent_B_successor_judgment_seal_before_peer_review','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'ownOriginalV2Preserved':True,'authorOriginalAndCompleteV3Unchanged':True,'noCurrentSuccessorAOrRootJudgmentReadBeforeSeal':True,'noHistoricalPeerVerdictContentsRead':True,'authorOpinionsNotVotes':True,'fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'rows':rows,'manifestSha256':sha((OWN/'FINAL.targeted-independent-b.manifest.json').read_bytes())})
print('Manifest',sha((OWN/'FINAL.targeted-independent-b.manifest.json').read_bytes()))
print('Seal',sha((OWN/'ORIGINAL.successor-judgment-seal.json').read_bytes()),'files',len(rows))
