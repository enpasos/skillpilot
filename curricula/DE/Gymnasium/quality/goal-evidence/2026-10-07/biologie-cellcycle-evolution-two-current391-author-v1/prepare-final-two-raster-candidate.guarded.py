"""Build an inactive current whole landscape using only an explicit frozen raster handoff.

Usage: python this-file.py repo-relative-selected-image-manifest.json
No canonical, registry, ledger, public, backend, or historical file is written.
"""
from pathlib import Path
import copy
import hashlib
import json
import os
import shutil
import struct
import sys

D=Path(__file__).resolve().parent
R=D.parents[6]
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,x):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def under_repo(p):
    p=p.resolve(strict=True)
    assert p.is_relative_to(R),str(p)
    return p

assert len(sys.argv)==2,'One explicit selected-image manifest required'
manifest_path=under_repo(R/sys.argv[1])
manifest=read(manifest_path)
images=manifest['images']
assert len(images)==2
selected=read(D/'current-two-whole-DEEN-goals.exact.json')['goals']
ids=[g['id']for g in selected]
assert len({i['goalId']for i in images})==2 and set(ids)=={i['goalId']for i in images}
image_by_id={i['goalId']:i for i in images}
source=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-11675-terminal-route-reviewed-integration-root-20261007-v1/candidate/canonical.future-active.json'
assert sha(source)=='c6f4ca7d5b8ba2bd48acd85d635aed29505a5691e4b62a713c5bec8cf7675ac8'
assert sha(manifest_path)=='7bc7fd01d524fb4508bc488fb5c5961d4e3c8b684c192198aa0aaa972de45cd5'
current=read(source)
whole_count=len(current['goals'])
current_kinds=read(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-11675-terminal-route-reviewed-integration-root-20261007-v1/candidate/semantic-kinds.future-active.json')
assert current_kinds['counts']['total']==whole_count
assert current_kinds['counts']['curricularAtomic']==391
by={g['id']:g for g in current['goals']}
assert all(by[g['id']]==g for g in selected),'Selected science/context drift: require targeted author refresh'
candidate=copy.deepcopy(current)
candidate_by={g['id']:g for g in candidate['goals']}
qa=read(R/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
source_qa=copy.deepcopy(qa)
write(D/'candidate/visualization-qa.before-two-links.exact.json',source_qa)
qa_by={q['goalId']:q for q in qa['records']}
rows=[]
for gid in ids:
    image=image_by_id[gid]
    src=under_repo(R/image['path'])
    expected=image['sha256'].removeprefix('sha256:')
    assert expected==sha(src)
    raw=src.read_bytes(); assert raw[:8]==b'\x89PNG\r\n\x1a\n'
    width,height=struct.unpack('>II',raw[16:24]);assert width>=1200 and height>=650
    assert abs(width/height-16/9)<0.06,'Nonstandard ratio requires an actual separately reviewed format decision'
    dst=D/'selected-images'/f'{gid}.png';dst.parent.mkdir(parents=True,exist_ok=True)
    assert not dst.exists();shutil.copyfile(src,dst)
    g=candidate_by[gid]
    assert not any(l.get('type')=='goal-visualization'for l in g.get('resourceLinks',[])),'KEEP boundary: existing image appeared'
    url=f'/assets/goal-visualizations/biologie/{gid}/{gid}.png'
    alt=image.get('altDe') or f'Comicartige Illustration zum Lernziel {g["title"]}.'
    link={'type':'goal-visualization','resourceType':'image','role':'primary','skillpilotId':gid,
          'title':'Visualisierung: '+g['title'],'url':url,'provider':image['provider'],
          'description':alt,'altText':alt,'lang':'de','license':'CC-BY-4.0','reviewStatus':'pilot'}
    g['resourceLinks']=g.get('resourceLinks',[])+[link]
    q=qa_by[gid]
    assert q['visualizationState']=='missing'
    q.update(visualizationState='available',missingReason='',imageUrl=url,
        publicAssetPath=str(dst.relative_to(R)),canonicalAssetPath=str(dst.relative_to(R)),
        assetSha256='sha256:'+expected,umlautsCorrectChatGpt='no',contentApprovedChatGpt='no',
        chatGptReviewedAt=None,chatGptReviewer='',
        chatGptNotes='Author raster input only; actual independent current image and page reviews pending.')
    # Published path aliases are inactive and portable; every target is a committable PNG.
    # Alias and selected PNG both stay inside the renderer's actual public root.
    alias=D/url.lstrip('/')
    alias.parent.mkdir(parents=True,exist_ok=True)
    assert not alias.exists() and not alias.is_symlink()
    alias.symlink_to(os.path.relpath(dst,alias.parent));assert alias.resolve(strict=True)==dst
    rows.append({'goalId':gid,'changedFields':['resourceLinks'],'oldValue':by[gid].get('resourceLinks'),
                 'newValue':g['resourceLinks'],'sourceRasterPath':str(src.relative_to(R)),
                 'selectedRasterPath':str(dst.relative_to(R)),'sha256':expected,
                 'width':width,'height':height,'promptPath':image.get('promptPath'),
                 'authorCandidateOnly':True,'actualIndependentImageApproval':False})
for gid,g in by.items():
    cg=candidate_by[gid]
    if gid not in ids:assert cg==g
    else:
        og=copy.deepcopy(g);ng=copy.deepcopy(cg);og.pop('resourceLinks',None);ng.pop('resourceLinks',None);assert og==ng
assert len(candidate['goals'])==whole_count
assert all(qa_by[q['goalId']]==q for q in source_qa['records']if q['goalId']not in ids)
write(D/'candidate/canonical.current474-two-new-raster-author.json',candidate)
write(D/'candidate/visualization-qa.current391-two-raster-author.json',qa)
write(D/'candidate/semantic-kinds.current-source.exact.json',current_kinds)
write(D/'candidate/two-image-only-field-patches.guarded-plan.json',{
    'role':'inactive-author-candidate-not-scientific-approval','sourceLandscapePath':str(source.relative_to(R)),
    'actualSourceLandscapeSha256':sha(source),'selectedManifestPath':str(manifest_path.relative_to(R)),
    'selectedManifestSha256':sha(manifest_path),'wholeCanonicalCount':whole_count,'curricularAtomicCount':391,
    'exactOtherWholeGoals':whole_count-2,'goalTextChanges':0,'prerequisiteChanges':0,'applicabilityChanges':0,
    'mappingChanges':0,'rows':rows,'activeWrites':False,'strictGainClaimed':0})
print(json.dumps({'candidateWholeGoals':whole_count,'newInactivePNGs':2,'unchangedWholeGoals':whole_count-2,'scientificTextChanges':0,'activeWrites':0},indent=2))
