#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Normal, byte-exact helpers execute in a temporary root; only own author package is exported."""
import hashlib, json, os, shutil
from pathlib import Path
R=Path.cwd();P=Path(__file__).resolve().parent
C=R/'tmp/medical10-current397-v2-normal-private-capsule'
BASE=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-combined-Bio3-targeted-author-successor-20261011-v6'
def load(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
linked=[]
def mat(path,expected=None,override=None):
    rel=Path(path);assert not rel.is_absolute() and '..' not in rel.parts
    alternatives=[override] if override else [R/rel]
    alternatives += [R/'tmp/m7-resumption-20261011/bio8-current366-author-rebase/normal-private-capsule'/rel]
    source=next((s for s in alternatives if s and s.is_file() and (expected is None or sha(s)==expected)),None)
    assert source,(path,expected)
    target=C/rel;target.parent.mkdir(parents=True,exist_ok=True)
    # Copy own changing author inputs; read-only existing bytes may use regular hardlink aliases.
    if source.is_relative_to(P):
        if target.exists() and sha(target)!=sha(source):target.unlink()
        if not target.exists():shutil.copy2(source,target)
    elif not target.exists():os.link(source,target)
    else:assert sha(target)==sha(source)
    linked.append({'normalPath':str(rel),'originalRegularFile':str(source.relative_to(R)),'sha256':sha(source),'bytes':source.stat().st_size})
    return target

for f in (R/'app/scripts').iterdir():
    if f.is_file() and f.suffix in ['.ts','.mjs','.js','.json']:
        # Copies, never edits of normal source helpers.
        dst=C/'app/scripts'/f.name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dst)
for dirname in ['app/src','contracts/goal-book','contracts/goal-evidence','contracts/goal-description-review','contracts/curriculum-package','contracts/curriculum-quality']:
    src=R/dirname
    if src.exists():shutil.copytree(src,C/dirname,dirs_exist_ok=True)
mat('app/package.json');mat('app/tsconfig.json')
if not (C/'app/node_modules').exists():os.symlink(R/'app/node_modules',C/'app/node_modules',target_is_directory=True)
mat('docs/landscape-runtime.schema.json')

ids=load(P/'FIRST.actual-neutral-medical10-continuation-author-inputs.json')['goalIds']
cfg=load(P/'native/whole397-medical10.normal.config.json')
atlas=load(P/'sources/normal397-medical10.author.inputs.json')
atlas.update({'outputDirectory':'app/scripts/config/goal-books/inactive/medical10-current397-v2/source-views',
              'manifestPath':'app/scripts/config/goal-books/inactive/medical10-current397-v2/atlas.sources.json',
              'navigationViewPath':'app/scripts/config/goal-books/inactive/medical10-current397-v2/navigation.view.json'})
put(P/'sources/normal397-medical10.author.inputs.json',atlas)
for key in ['landscapePath','semanticKindLedgerPath','goalVisualizationQaPath']:mat(cfg[key])
for path in cfg['evidenceReviewPaths']:
    if Path(path).name!='P10-medical.author-pending.review.jsonl':mat(path)
qa=load(R/cfg['goalVisualizationQaPath'])
for q in qa['records']:
    if q['visualizationState']!='available':continue
    gid=q['goalId']
    for key in ['publicAssetPath','canonicalAssetPath']:
        path=q[key]
        override=P/'portable'/path if gid in ids else None
        if not override and not (R/path).is_file():
            candidate=BASE/'native/portable-current397-native19/bundle/asset-copies'/(gid+'.png')
            if candidate.is_file():override=candidate
        if not override and (R/path).is_file() and sha(R/path)!=q['assetSha256']:
            candidate=BASE/'native/portable-current397-native19/bundle/asset-copies'/(gid+'.png')
            if candidate.is_file():override=candidate
        mat(path,q['assetSha256'],override)
mat(atlas['durationModelPolicyPath'])
for path in atlas['mappingPaths']:
    mat(path);m=load(R/path);mat(m['sourceExtractionPath']);ex=load(R/m['sourceExtractionPath'])
    def official(v):
        if isinstance(v,dict):
            if isinstance(v.get('path'),str) and v.get('official') is True:mat(v['path'],v.get('sha256'))
            for x in v.values():official(x)
        elif isinstance(v,list):
            for x in v:official(x)
    official(ex)
for snapshot in atlas.get('sourceDocumentSnapshots',[]):mat(snapshot['path'],snapshot['sha256'])

for path in ['curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
             'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md']:
    mat(path)
criteria=BASE/'positive/P10.current397.author-pending.config.json'
pc=load(criteria)
pc.update({'reviewId':'biologie-medical-ethics-ten-current397-author-20261011-v2','landscapePath':cfg['landscapePath'],
           'semanticKindLedgerPath':cfg['semanticKindLedgerPath'],'reviewPath':str((P/'positive/P10-medical.author-pending.review.jsonl').relative_to(R)),
           'reviewRunManifestPaths':[],'scope':{'label':'Ten complete medical/ethical author products; independent D/P/A/M/V still pending','goalIds':ids},'requireApproved':False})
put(P/'positive/P10-medical.author-pending.config.json',pc);mat(pc['reviewCriteriaPath'])
for name in ['native/whole397-medical10.normal.config.json','sources/normal397-medical10.author.inputs.json','positive/P10-medical.author-pending.config.json','profiles/ten-complete-positive-candidates.author.json']:
    mat(str((P/name).relative_to(R)))
put(P/'checks/private-normal-capsule.exact-input-aliases.actual.json',{'role':'technical execution aliases only; no scientific review',
    'temporaryRoot':str(C.relative_to(R)),'regularFileInputs':linked,'dependenciesOnlyNodeModulesSymlink':True,
    'curriculaSymlinks':0,'activeWrites':False,'sourceHelpersModified':False})
print(json.dumps({'regularInputs':len(linked),'availableRasterBindings':sum(q['visualizationState']=='available' for q in qa['records']),'sourcePairs':len(atlas['mappingPaths']),'activeWrites':False}))
