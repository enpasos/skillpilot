# SPDX-License-Identifier: Apache-2.0
# Read-only base reconstruction / ignored normal capsule preparation only.
import pathlib,json,hashlib,shutil,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot');W=R/'tmp/m7-resumption-20261010/biologie-stoffwechsel-eight-native-technical';C=pathlib.Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip());CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';expected='e6660bb00510aa381e1aa18e264ee4e4d0073c36b740f3a0314dd4f8914f6453'
def read(p):return json.loads((R/p).read_text())
def ref(p):b=(R/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
assert ref(CAN)['sha256']=='sha256:'+expected
A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1/current335-exact-strict-ID-gain-and-protected-subjects.actual.json';authority=read(A);s=next(s for s in authority['subjects'] if s['subject']=='biologie');ids=s['strictCompleteGoalIds'];assert len(ids)==335
at='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json';atlas=read(at);assert len(atlas['mappingPaths'])==31
refs=[]
for p in [CAN,atlas['semanticKindLedgerPath'],'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',atlas['durationModelPolicyPath'],*atlas['mappingPaths'],*[read(m)['sourceExtractionPath'] for m in atlas['mappingPaths']]]:
 refs.append(ref(p));dest=C/p;dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists() or dest.read_bytes()!=(R/p).read_bytes():shutil.copyfile(R/p,dest)
reg=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');bio=next(s for s in reg['subjects'] if s['subject']=='biologie');P=[]
for cp in bio['positiveEvidenceConfigPaths']:
 cfg=read(cp);P.append(cfg['reviewPath']);dest=C/cfg['reviewPath'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/cfg['reviewPath'],dest);refs.extend([ref(cp),ref(cfg['reviewPath'])])
assert len(P)==len(set(P));out={'schemaVersion':1,'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Ignored technical base input preparation only; B final science/raster still pending','current479Canonical':ref(CAN),'actual335Authority':ref(A),'protected335Ids':ids,'whole31SourcePairs':True,'whole24SourceScopesRetain':True,'ordinaryExistingPPaths':P,'actualSelectedInputRefs':refs,'capsuleExecutionPath':str(C),'activeWrites':[],'scienceOrRasterApprovalClaim':False};(W/'actual-current335-selective-base-preparation.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'capsule':str(C),'currentWholeGoals':479,'protectedStrictIds':335,'sourcePairs':31,'existingPConfigs':len(P),'newScienceAdoption':False,'activeWrites':[]}))
