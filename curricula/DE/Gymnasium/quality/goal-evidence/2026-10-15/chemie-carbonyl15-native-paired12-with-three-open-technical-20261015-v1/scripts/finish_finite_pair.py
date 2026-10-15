# SPDX-License-Identifier: Apache-2.0
"""Seal actual normal paired outputs; this integrator creates no scientific votes."""
import datetime
import hashlib
import json
import os
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
E = OWN.parent
seal = OWN/'FILES.finite-paired12-technical.seal.json'
assert not seal.exists()
def load(p): return json.loads(Path(p).read_text())
def bind(p):
    p=Path(p);b=p.read_bytes()
    return {'path':str(p.relative_to(REPO) if p.is_absolute() else p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def exact(b):
    assert bind(REPO/b['path']) == b
def write(p,v):
    assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
idx=load(OWN/'native15/resolution-index.json')
assert len(idx['resolutions'])==12 and len(idx['deferredGoalIds'])==3
assert all(r['strictDescriptionComplete'] and r['decision']=='keep_current' for r in idx['resolutions'])
transport=load(OWN/'checks/TRANSPORT.exact-native-and-original-rounds.json')
for r in transport['originalResults']:
    exact(r['original']);exact(r['copy']);assert r['original']['sha256']==r['copy']['sha256']
for r in idx['resolutions']:
    p=OWN/'native15'/r['resolutionPath'];assert bind(p)['sha256']==r['resolutionDigest']
sources={
    'originalASelector':E/'chemie-carbonyl15-current422-native-fresh-independent-a-20261015-v1/HANDOFF.finite-independent-D-native15.json',
    'originalASeal':E/'chemie-carbonyl15-current422-native-fresh-independent-a-20261015-v1/FILES.finite-independent-D-native15.seal.json',
    'originalBSelector':E/'chemie-carbonyl15-current422-native-fresh-independent-b-20261015-v1/SELECTOR.independent-native-b.json',
    'originalBSeal':E/'chemie-carbonyl15-current422-native-fresh-independent-b-20261015-v1/FILES.finite-review.seal.json',
}
for k,p in sources.items():
    if k.endswith('Seal'):
        data=load(p)
        for r in data.get('files',data.get('members',[])):
            r=r.copy()
            if not r['path'].startswith('curricula/'): r['path']=str(p.parent.relative_to(REPO)/r['path'])
            exact(r)
commands=[OWN/'checks'/f'{name}.command.actual.json' for name in (
    'native-check','native-summarize','native-synthesis-attempt2','native-resolutions-attempt2','native-finalize-attempt2','native-final-check-attempt2')]
assert all(load(p)['exitCode']==0 for p in commands)
assert load(OWN/'checks/native-synthesis.command.actual.json')['exitCode']==1
links=[]
for base,ds,fs in os.walk(OWN,followlinks=False):
    for name in ds+fs:
        p=Path(base)/name
        if p.is_symlink():
            target=os.readlink(p);assert not os.path.isabs(target) and p.resolve().is_relative_to(REPO)
            links.append({'path':str(p.relative_to(REPO)),'target':target})
assert len(links)==1
readme='''# Carbonyl15: normal paired description result

The exact original independent A/B rounds both yield 12 KEEP, 2 REVISE and 1 source/scope BLOCK. The unchanged native pipeline produces exactly 12 keep_current description resolutions and explicitly defers the other three goals. No scientific vote is created by technical pairing; no strict count or M7 clearance follows from this D-only result.

The first synthesis attempt rejected a 4076-character combined Grignard summary against the stock 4000-character limit. The failed authoring input and actual outputs remain intact. A separately named bounded successor summarizes that one rationale without changing either original vote or full reason. Only the remaining four stock steps were resumed, all with exit 0. The successful initial check and summarize were not repeated.

The native bundle is a relative repository directory link to the exact earlier physical bundle. The portable check-only rebuild helper reads sealed repository sources and creates a fresh ignored tmp host; it does not render, copy a repository, or depend on an older tmp host. Preserve the original bundle HTML/PDF when committing. Human release, practice and trial gates are unchanged.
'''
(OWN/'README.finite-original-pair.md').write_text(readme)
selection={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role':'Finite technical pairing of exact genuine independent original D15 rounds; no new scientific review',
    'inputs':{k:bind(p) for k,p in sources.items()},
    'normalResolutionIndex':bind(OWN/'native15/resolution-index.json'),
    'normalPairedConfig':bind(OWN/'config/native15.original-context-paired12.config.json'),
    'exactOriginalRoundTransport':bind(OWN/'checks/TRANSPORT.exact-native-and-original-rounds.json'),
    'successfulActualCommands':[bind(p) for p in commands],
    'retainedOriginalFailure':bind(OWN/'checks/native-synthesis.command.actual.json'),
    'boundedAuthoringSuccessor':bind(OWN/'checks/BOUNDED.synthesis-authoring-v2.actual.json'),
    'portableHostMap':bind(OWN/'checks/REBUILD.portable-check-only.physical-source-alias-map.json'),
    'portableRebuildScript':bind(OWN/'scripts/rebuild_portable_check_host.py'),
    'resolvedGoalIds':[r['goalId'] for r in idx['resolutions']],
    'deferredGoalIds':idx['deferredGoalIds'],'relativeDirectoryLinks':links,
    'newScientificVotes':0,'strictCountClaimed':False,'activeIntegration':False,'M7Grant':False,'HumanApproval':False}
selector=OWN/'SELECTION.finite-original-D15-paired12.json';write(selector,selection)
files=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and not p.is_symlink() and p!=seal]
write(seal,{'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role':selection['role'],'files':files,'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files),
    'selector':bind(selector),'resolvedDescriptions':12,'deferredDescriptions':3,'newScientificVotes':0,
    'directoryLinks':links,'M7Grant':False,'HumanApproval':False})
for r in files:exact(r)
print(json.dumps({'selector':bind(selector),'seal':bind(seal),'fileCount':len(files),'resolvedDescriptions':12,'deferredDescriptions':3},indent=2))
