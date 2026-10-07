#!/usr/bin/env python3
"""Freeze this isolated retained subset, leaving historical and active inputs unchanged."""
from pathlib import Path
import datetime,hashlib,json
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[6];external=set()
def bind(p):
    d=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
def scan(x):
    if isinstance(x,dict):
        if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str):
            p=ROOT/x['path']
            if p.is_file():
                assert bind(p)['sha256']==x['sha256'].removeprefix('sha256:'),str(p)
                if not p.is_relative_to(OUT):external.add(p)
        for v in x.values():scan(v)
    elif isinstance(x,list):
        for v in x:scan(v)
for p in sorted(OUT.glob('*.json')):scan(json.loads(p.read_text()))
for name in ['app/scripts/goalEvidenceProfile.ts','app/scripts/goalEvidenceAiRunManifest.ts','app/scripts/goalBookModel.ts','app/scripts/positiveGoalEvidenceReview.ts','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v2/goal-evidence-profile.schema.json']:
    p=ROOT/name
    if p.is_file():external.add(p)
freeze=OUT/'exact-retained23-positive-native-technical-v1.final.freeze.json';assert not freeze.exists();files=[bind(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
obj={'documentType':'immutable technical retained P23 exact subset/config freeze','role':'technical integrator; no additional independent science review','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownArtifactDirectory':str(OUT.relative_to(ROOT)),'ownFiles':files,'actualExternalInputs':[bind(p) for p in sorted(external)],'retainedRecords':23,'onlyExcludedGoalId':'c441d9e8-d9d9-5e55-a189-a37345541321','whole23OriginalLinesProfilesDatesReviewersRunRefsExact':True,'original24ConfigRecordsAndRunUnchanged':True,'nativeProductionCheckExit0':True,'nativeConfiguredGoals':23,'nativeApproved':0,'nativeNeedsHumanReview':23,'nativeRejected':0,'nativeBlockingIssues':0,'newReviewRunWritten':False,'newP1Written':False,'newScience':False,'activeWrites':False,'humanApproval':False,'newStrictCompletion':0}
freeze.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
for p in OUT.rglob('*'):
    if p.is_file():p.chmod(0o444)
for p in sorted([p for p in OUT.rglob('*') if p.is_dir()],key=lambda p:len(p.parts),reverse=True):p.chmod(0o555)
OUT.chmod(0o555);print(json.dumps({'freeze':str(freeze.relative_to(ROOT)),'sha256':bind(freeze)['sha256'],'ownFiles':len(files),'externalInputs':len(external),'native':'PASS23/needsHuman23/approved0/errors0','activeWrites':False}))
