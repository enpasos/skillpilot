"""Integrate only actual independent material decisions into an inert frame."""
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file() and (p/'curricula').is_dir())
OUT=Path(__file__).resolve().parent
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR=BASE/'wirtschaft-E-forty-nine-coherent-terminal-material-author-v1'
OWN=BASE/'wirtschaft-nine-E40-whole-materials-independent-root-v1'
FOREIGN=BASE/'wirtschaft-four-E40-environment-finance-production-team-independent-whole-material-review-v1'
DELTA=BASE/'wirtschaft-two-E40-finance-project-independent-bounded-liability-and-mandatory-execution-delta-review-v1'
RECEIPTS=[
    (OWN/'actual-independent-first-care-education-roles-whole-five-goal-material-KEEP.receipt.json','1b7eab60c3c1f64ccfaea7ec74501093aae9442ba8642efdf9c4877dbc7f2f4c'),
    (OWN/'actual-independent-four-whole-E-materials-nineteen-contracts-and-resolved-language-finding-KEEP.receipt.json','a92ce6ec67ae6993dab5e45a94ad379b29ebe133d0fe72593c72c0a4200d07a2'),
    (FOREIGN/'actual-final-independent-four-E40-whole-materials-two-KEEP-two-REVISE-and-actual-artefact-counterexamples.receipt.json','6634390641418a9a9957196cb054b6a770e384cc3ed12d158afe69d536cfc2c4'),
    (DELTA/'actual-final-independent-two-E40-liability-and-whole-execution-cap14-successors-KEEP.receipt.json','fffdc65c57486ac30b2a6d570f90a6c4d9c8b1675082171019c2391e49a24d32')]
RELEASE_FILES=[OWN/'whole-first-care-education-roles-material-reviewed-machine-released.inert.candidate.json',
               OWN/'whole-four-independently-reviewed-E-youth-participation-digital-market-materials.only-machine-status-released.json',
               FOREIGN/'whole-four-current-materials.only-two-independent-machine-material-statuses-released.inert.json',
               DELTA/'whole-two-current-successors.only-independent-machine-material-status-released.inert.json']
ORIGINAL=AUTHOR/'whole-nine-coherent-E40-materials.DRAFT-terminal-goals.candidate.json'
FRAME=AUTHOR/'whole-inert-CAN416-only-nine-E40-DRAFT-and-existing-E-navigation.candidate.json'
SEM=AUTHOR/'candidate-semantic416.only-Root-nine-kind-and-one-nav-input-binding.closed-count-successor-v3.inert.json'
CONFIG=AUTHOR/'book-config.current311-nine-E40-DRAFT-and-frozen-P311624.closed-count-successor-v3.inert.json'
ISOLATE=AUTHOR/'actual-E40-only-own-native-isolate-and-frozen-V17-baseline.receipt.json'
INPUTS=[p for p,_ in RECEIPTS]+RELEASE_FILES+[ORIGINAL,FRAME,SEM,CONFIG,ISOLATE,ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']


def bind(p):
    raw=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)),'sha256':sha256(raw).hexdigest(),'bytes':len(raw)}


def write(name,data):
    p=OUT/name
    assert not p.exists(),'Preserve historical inputs/output; make successor.'
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    json.loads(p.read_text())
    return bind(p)


guards=[bind(p) for p in INPUTS]
for p,expected in RECEIPTS:assert bind(p)['sha256']==expected
assert bind(ORIGINAL)['sha256']=='8e799cd2f995b8cca2c56b1f4317f0945a5670e78f943220c055be8f43102858'
accepted={}
for p in RELEASE_FILES:
    data=json.loads(p.read_text());data=[data] if isinstance(data,dict) else data
    for g in data:
        if g['examData']['reviewStatus']=='released':
            assert g['id'] not in accepted
            accepted[g['id']]=g
originals=json.loads(ORIGINAL.read_text())
assert len(accepted)==9 and set(accepted)=={g['id'] for g in originals}
coverage=[target for g in accepted.values() for target in g['examData']['coveredGoalIds']]
assert len(coverage)==len(set(coverage))==40
assert all(g['requires']==g['examData']['coveredGoalIds'] for g in accepted.values())
assert all(g['examData']['reviewStatus']=='draft' for g in originals)
original_index={g['id']:g for g in originals}
material_deltas=[]
for target,g in accepted.items():
    old=original_index[target]
    assert {k:v for k,v in old.items() if k!='examData'}=={k:v for k,v in g.items() if k!='examData'}
    assert old['examData']['scoring']['maxPoints']==g['examData']['scoring']['maxPoints']
    assert old['examData']['scoring']['passingPoints']==g['examData']['scoring']['passingPoints']
    assert [(s['id'],s['points']) for s in old['examData']['scoring']['steps']]==[(s['id'],s['points']) for s in g['examData']['scoring']['steps']]
    changed=[k for k in old['examData'] if old['examData'][k]!=g['examData'][k]]
    material_deltas.append({'goalId':target,'changedExamFields':changed,'sameOuterGoalAndRequires':True,'sameMaximumPassingAndPartialPoints':True})
frame=json.loads(FRAME.read_text());previous=deepcopy(frame)
frame['goals']=[deepcopy(accepted.get(g['id'],g)) for g in frame['goals']]
after={g['id']:g for g in frame['goals']}
assert len(frame['goals'])==416
assert all(after[g['id']]==g for g in previous['goals'] if g['id'] not in accepted)
assert sum(g['id'] not in accepted for g in previous['goals'])==407
assert len([g for g in frame['goals'] if g.get('examData')])==56
assert all(after[g['id']]['examData']==g['examData'] for g in previous['goals'] if g.get('examData') and g['id'] not in accepted)
released_binding=write('whole-nine-E40-materials.actual-independent-reviewed-machine-release.candidate.json',[accepted[g['id']] for g in originals])
frame_binding=write('whole-CAN416-nine-reviewed-E40-materials.current-root-inert-integration.json',frame)
config=json.loads(CONFIG.read_text())
rel=str(OUT.relative_to(ROOT))
config['semanticKindLedgerPath']=rel+'/semantic416.only-nine-actual-reviewed-material-input-bindings.inert.json'
config['outputPath']=rel+'/whole-current311-after-nine-reviewed-E40-materials.native-book-model.json'
config_binding=write('book-config.current311-nine-reviewed-E40-materials.frozen-P311624.inert.json',config)

# The execution capsule remains outside curricula. Clone the previous proven
# frozen native input environment; replace only our Economics candidate input.
old_iso=Path(json.loads(ISOLATE.read_text())['physicalIsolate'])
assert old_iso.is_dir()
new_iso=Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-nine-reviewed-E40-native-'))/'repo'
shutil.copytree(old_iso,new_iso,symlinks=True)
target=new_iso/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
assert not target.is_symlink()
target.write_bytes((ROOT/frame_binding['path']).read_bytes())
for input_path in [ROOT/config_binding['path']]:
    dest=new_iso/input_path.relative_to(ROOT)
    dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.is_symlink():dest.unlink()
    dest.write_bytes(input_path.read_bytes())
assert guards==[bind(p) for p in INPUTS]
ignored=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in INPUTS],cwd=ROOT,capture_output=True,text=True)
assert ignored.returncode in [0,1] and not ignored.stdout.strip()
write('actual-nine-accepted-materials-current-inert-assembly-and-input-exactness.receipt.json',{
    'schemaVersion':1,'createdAt':datetime.now(timezone.utc).isoformat(),'integrator':'/root',
    'independentReviewReceipts':[bind(p) for p,_ in RECEIPTS],'wholeInputs':guards,
    'actualNineAcceptedMaterialBodies':released_binding,'actualCurrentInertCAN416':frame_binding,'actualNativeBookConfig':config_binding,
    'individualActualMaterialDeltas':material_deltas,'acceptedWholeMaterials':9,'coveredUniqueCurrentGoals':40,
    'other407WholeGoalsExact':True,'all47OldWholeExamDataExact':True,'originalNineDRAFTRemainExact':True,
    'wholeOriginalThresholdsAndPartialPointsExact':True,'machineReleaseNotHumanRelease':True,
    'physicalExecutionCapsule':str(new_iso),'nativeExecutionMetadataOnlyNotRequiredCommittableEvidence':True,
    'semanticBindingsNext':'Native fingerprint helper will update only9practiceAssessment input fingerprints after actual independent content review; no new kind decision or hash-only subject approval.',
    'newWholeCourseOrSource125OrDescriptionApproval':False,'humanReview':'pending','learnerTrial':'not performed',
    'liveWrites':False,'strictBefore':{'closed':300,'total':311},'strictAfter':{'closed':300,'total':311},
    'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0})
print(json.dumps({'physicalExecutionCapsule':str(new_iso),'acceptedMaterials':9,'coveredGoals':40,'frame':frame_binding,'strictNetGain':0},ensure_ascii=False))
