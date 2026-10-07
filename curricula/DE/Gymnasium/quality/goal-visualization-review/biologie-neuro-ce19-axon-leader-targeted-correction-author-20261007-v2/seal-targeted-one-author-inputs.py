#!/usr/bin/env python3
"""Seal only the new targeted author candidate and actual read inputs."""
from pathlib import Path
import datetime,hashlib,json,re
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[5];external=set()
def bind(p):
    d=p.read_bytes();return {'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
def scan(x):
    if isinstance(x,dict):
        if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str):
            p=Path(x['path']);p=p if p.is_absolute() else ROOT/p
            if p.is_file() and not p.is_relative_to(OUT):
                assert bind(p)['sha256']==x['sha256'].removeprefix('sha256:'),str(p);external.add(p)
        if isinstance(x.get('actualOutputHint'),str):
            m=re.search(r'as (\/\S+\.png) by default',x['actualOutputHint'])
            if m:external.add(Path(m.group(1)))
        for v in x.values():scan(v)
    elif isinstance(x,list):
        for v in x:scan(v)
for p in sorted(OUT.rglob('*.json')):scan(json.loads(p.read_text()))
for name in ['AGENTS.md','LICENSING.md','docs/concept/skill-graph/atomic-goal-visualizations.md','app/src/components/GoalCard.tsx','scripts/prepare_goal_visualization.mjs','scripts/import_goal_visualization.mjs','scripts/goal_visualization_common.mjs']:external.add(ROOT/name)
external.add(Path('/home/enpasos/.codex/skills/.system/imagegen/SKILL.md'))
freeze=OUT/'targeted-ce19-axon-leader-original-raster-native-routed.author-v2.final.freeze.json';assert not freeze.exists()
files=[bind(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
obj={'documentType':'immutable one targeted label-anchor raster author review-input freeze','role':'image author; no independent V or operative installation','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownArtifactDirectory':str(OUT.relative_to(ROOT)),'ownFiles':files,'actualExternalInputs':[bind(p) for p in sorted(external)],'selectedCandidateCount':1,'actualBuiltinCalls':2,'nativePrepareBeforeBothEdits':True,'nativePrepareExit0':2,'nativeImportDryRunExit0':1,'actualWidthsSeen':[360,680],'allOriginalAttemptsRetained':True,'wholeGoalAndMaterialsUnmodified':True,'historicalSevenOwnFilesActualExact':177,'allSourceHoldsPreserved':True,'independentVisualApproval':False,'humanApproval':False,'activeWrites':False,'newStrictCompletion':0}
freeze.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
for p in OUT.rglob('*'):
    if p.is_file():p.chmod(0o444)
for p in sorted([p for p in OUT.rglob('*') if p.is_dir()],key=lambda p:len(p.parts),reverse=True):p.chmod(0o555)
OUT.chmod(0o555);print(json.dumps({'freeze':str(freeze.relative_to(ROOT)),'sha256':bind(freeze)['sha256'],'ownFiles':len(files),'actualExternalInputs':len(external),'newStrictCompletion':0}))
