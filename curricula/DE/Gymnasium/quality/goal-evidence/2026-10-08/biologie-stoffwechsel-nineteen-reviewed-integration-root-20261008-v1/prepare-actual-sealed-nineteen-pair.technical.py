# SPDX-License-Identifier: Apache-2.0
"""Verify original independent native first seals and preserve mutable before-inputs."""
import hashlib, json, shutil, sys
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path.cwd(); OWN=Path(__file__).resolve().parent
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p): return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def read(p): return json.loads(Path(p).read_text())
def verify(v):
    p=ROOT/v['path']
    assert p.is_file() and sha(p)==v['sha256'].removeprefix('sha256:') and p.stat().st_size==v['bytes'],p
    return p
def put(p,v):
    p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def all_bindings(v):
    if isinstance(v,dict):
        if {'path','sha256','bytes'}<=v.keys(): yield v
        for x in v.values(): yield from all_bindings(x)
    elif isinstance(v,list):
        for x in v: yield from all_bindings(x)
assert len(sys.argv)==3,'Provide actual independent A and B entry paths after both first seals'
entries=[read(ROOT/p) for p in sys.argv[1:]]
seals={};mutable={};results=[]
for name,e in zip(['a','b'],entries):
    seal_path=ROOT/e['firstSealPath'];seal=read(seal_path)
    verified={}
    for b in all_bindings(seal): verify(b);verified[b['path']]=b
    assert verified
    summary=e.get('summary',e)
    assert summary['Dkeep']==19 and summary['nativeBlockingFindings'] in (0,[])
    assert not e['peerNativeDPReadBeforeFirstSeal']
    seals[name]=dict(seal=bind(seal_path),verifiedOriginalFiles=list(verified.values()))
    results.append(e['resultsDirectory'])
    for p,b in verified.items():
        if p.startswith(('curricula/DE/Gymnasium/canonical/','curricula/DE/Gymnasium/quality/goal-visualization-qa/')):
            mutable[p]=b
assert results[0]!=results[1]
snapshots=[]
for n,(p,b) in enumerate(sorted(mutable.items())):
    target=OWN/'before'/f'independent-native-original-mutable-input-{n:02}.exact.json'
    target.parent.mkdir(parents=True,exist_ok=True);assert not target.exists();shutil.copyfile(verify(b),target)
    snapshots.append(dict(originalPath=p,originalBinding=b,immutableHistoricalCopy=bind(target),reason='Original exact before-input at first independent seal; active path will later change through reviewed integration. Original seal is retained unchanged.'))
put(OWN/'pending/original-seal-verification.actual.json',dict(observedAt=datetime.now(timezone.utc).isoformat(),seals=seals,bothActualIndependentNativeFirstSealsVerified=True,originalMutableBeforeInputsPreserved=snapshots,resultsDirectories=results,activeWrites=0,newScientificReviewByIntegrator=False,humanApproval=False))
print(json.dumps(dict(actualIndependentNativePair='PASS',seals=2,immutableMutableBeforeCopies=len(snapshots),newScientificReviewByIntegrator=False,activeWrites=0)))
