import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent
def bind(p):
    return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(p,d):
    with p.open('x') as f:f.write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')

argv=['python',str((OWN/'record-four-genuine-current-native-D-P-V.independent-b.py').relative_to(ROOT))]
stdout='Own independent B actual D4 KEEP/P4 whole science scoped E1G1 PASS/V4 KEEP.203+14 exact inputs;473 other goals and390 A/M rows exact,81 same-subset position proofs preserved. Actual native checks follow; no active write, peer-A final read or human claim.\n'
write(OWN/'first-recording.actual-terminal.independent-b.json',{
    'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),
    'actualArgv':argv,'cwd':str(ROOT),'actualExitCode':0,'stdout':stdout,'stderr':'',
    'actualWallTimeSeconds':0.697323876,
    'recordedFrom':'Actual completed tools.exec_command response, chunk e425ff; no rerun or inferred terminal result.',
    'actualNativeSchemaAndCampaignChecksStillPending':True,
    'activeWrites':0,'peerAFinalOutputsRead':False,'humanApproval':False,'humanTrial':False})
files=sorted(p for p in OWN.rglob('*') if p.is_file())
assert len(files)==10,len(files)
write(OWN/'four-genuine-current-D-P-V.independent-b.first.freeze.json',{
    'schemaVersion':1,'artifactKind':'independent-B-four-current-whole-actual-D-P-V-first-exact-freeze',
    'recordedAt':datetime.now(timezone.utc).isoformat(),
    'independentReviewer':'flora_fauna_independent_a acting eligible native HE12 reviewer B',
    'scope':{'D':4,'P':4,'V':4,'actualOriginalPNGsSeen':4,'actual360680CapturesSeen':8,'actualNativePagesSeen':[3,4,5,6]},
    'ownGenuineFirstVerdictsRecordedBeforePeerAFinalRead':True,
    'peerAFinalOutputsRead':False,'actualNativeSchemaAndCampaignChecksStillPending':True,
    'unchangedGenuinePriorScienceRetained':True,'newScientificAMDecision':False,
    'wholeSourceReadIsSeparateFromInputHashVerification':True,
    'frozenFiles':[bind(p) for p in files],
    'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
seal=OWN/'four-genuine-current-D-P-V.independent-b.first.freeze.json'
print(json.dumps({'firstSeal':bind(seal),'files':len(files),'D4':'KEEP','P4':'SCOPED_E1_G1_PASS','V4':'KEEP','peerAFinalOutputsRead':False}))
