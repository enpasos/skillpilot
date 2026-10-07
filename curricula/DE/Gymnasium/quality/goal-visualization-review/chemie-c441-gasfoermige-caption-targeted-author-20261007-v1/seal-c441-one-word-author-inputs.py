#!/usr/bin/env python3
"""Freeze only this new inert author package and actual referenced inputs."""
from pathlib import Path
import datetime,hashlib,json,re
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[5];external=set()
reconciliation=json.loads((OUT/'actual-post-read-root-canonical-delta-and-exact-retained-input-reconciliation.author.json').read_text())
oldBinding=reconciliation['historicalExpectedInputPathAndBytes'];retainedBinding=reconciliation['actualExactRetainedInputUsedForFreeze']
def bind(p):
    d=p.read_bytes();return {'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
def scan(x):
    if isinstance(x,dict):
        if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str):
            inputPath=x['path']
            if inputPath==oldBinding['path'] and x['sha256'].removeprefix('sha256:')==oldBinding['sha256']:
                inputPath=retainedBinding['path']
            p=Path(inputPath);p=p if p.is_absolute() else ROOT/p
            if p.is_file():
                assert bind(p)['sha256']==x['sha256'].removeprefix('sha256:'),str(p)
                if not p.is_relative_to(OUT):external.add(p)
        if isinstance(x.get('actualOutputHint'),str):
            m=re.search(r'as (\/\S+\.png) by default',x['actualOutputHint'])
            if m:external.add(Path(m.group(1)))
        for v in x.values():scan(v)
    elif isinstance(x,list):
        for v in x:scan(v)
for p in sorted(OUT.rglob('*.json')):scan(json.loads(p.read_text()))
external.add(Path('/home/enpasos/.codex/skills/.system/imagegen/SKILL.md'));external.add(Path('/home/enpasos/.codex/skills/.system/imagegen/references/prompting.md'))
freeze=OUT/'c441-gasfoermige-one-word-native-author-v1.final.freeze.json';assert not freeze.exists();files=[bind(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
obj={'documentType':'immutable c441 one-word caption correction original-raster author review-input freeze','role':'image author; no independent V/D/P or active integration','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownArtifactDirectory':str(OUT.relative_to(ROOT)),'ownFiles':files,'actualExternalInputs':[bind(p) for p in sorted(external)],'goalId':'c441d9e8-d9d9-5e55-a189-a37345541321','actualBuiltinCalls':1,'nativePrepareBeforeGenerationExit0':1,'nativeDryRunExit0':1,'inertNativeImportExit0':1,'inertExactSourcePublicBackendCopies':3,'actualWidthsSeen':[360,680],'oldThreeOriginalCopiesRetained':True,'wholeCurrentGoalProfileCasesContextsUnmodified':True,'whole479CanonicalObjectsExactAfterInertImport':True,'explicitPostReadRootCanonicalWithdrawalReconciliation':bind(OUT/'actual-post-read-root-canonical-delta-and-exact-retained-input-reconciliation.author.json'),'newVisualApprovalPending':True,'targetedCurrentDPageAndPImageBindingPending':True,'activeWrites':False,'humanApproval':False,'humanTrial':False,'newStrictCompletion':0}
freeze.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
for p in OUT.rglob('*'):
    if p.is_file():p.chmod(0o444)
for p in sorted([p for p in OUT.rglob('*') if p.is_dir()],key=lambda p:len(p.parts),reverse=True):p.chmod(0o555)
OUT.chmod(0o555);print(json.dumps({'freeze':str(freeze.relative_to(ROOT)),'sha256':bind(freeze)['sha256'],'ownFiles':len(files),'actualExternalInputs':len(external),'activeWrites':False,'newStrictCompletion':0}))
