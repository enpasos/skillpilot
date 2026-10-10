# SPDX-License-Identifier: Apache-2.0
"""Additive exact public-input copies and a fresh normal tmp execution capsule."""
from pathlib import Path
import datetime, hashlib, json, shutil

R = Path('/home/enpasos/projects/skillpilot')
P = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1')
O = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
S = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-reviewed-active-integration-technical-v1')
D = R/P
T = R/'tmp/m7-resumption-20261010/chemistry-b008-protected-twelve-native-author'
C = T/'isolated-normal-capsule'
assert not (D/'author.final.freeze.json').exists()
assert not C.exists(), 'Fresh own capsule required'

def ref(p):
    b=(R/p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}

def put(p,x):
    f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True)
    f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

copies=[]
def cp(src,dst):
    a=R/src;b=R/P/dst
    assert a.is_file() and not a.is_symlink()
    b.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(a,b)
    assert ref(src)['sha256']==ref(P/dst)['sha256']
    copies.append({'wholeOriginal':ref(src),'wholeExactOwnCopy':ref(P/dst)})

for filename,expected in [('neutral-whole26-current-material-P-and-native20-plus6.independent-review.entry.json','9fedcdb8a08899c1fefb1ec64c92a0faba9c6e60c0d61da72102b994a9eb6118'),('author.final.freeze.json','a13f27f126b32805967d97d0825577b9b3d171e21dfb3376f2b474c4f97f4f45')]:
    assert ref(O/filename)['sha256']=='sha256:'+expected
    cp(O/filename,Path('inputs/P26-freeze')/filename)

for name in ['before-whole-normal-book-model.actual.json','after-whole-normal-book-model.actual.json']:
    cp(O/'native'/name,Path('inputs/frozen-whole-models')/name)
for name in ['current-whole-active-canonical.exact.json','current-whole-active-semantic-kinds.exact.json','current-whole-active-QA.exact.json','protected-prior177-current-and-strict-ID-sets.exact.json']:
    cp(O/'inputs'/name,Path('inputs/active-basis')/name)
for name in ['current-whole511-398-B008.inactive.json','current511.semantic-kinds.inactive.json','current-whole-QA.native-unapproved.inactive.json']:
    cp(O/'candidate'/name,Path('inputs/candidate')/name)
for sub in ['protected','source']:
    for f in sorted((R/O/sub).rglob('*')):
        if f.is_file():cp(f.relative_to(R),Path('inputs')/sub/f.relative_to(R/O/sub))
for name in ['whole-original1646-B008-source-duty-inventory.exact.json','whole-original-source-partner-AM-frame.exact.json','whole-source-model-v3-RP-v4-conservative-pair.exact.json','whole35-source-view-conservative-pair.exact.json']:
    cp(O/'inputs'/name,Path('inputs/source-boundaries')/name)
for name in ['normal-current398-whole-source-atlas-candidate.actual.json','actual-normal-source-union-before-unchanged-failing-count-assertion.observed.json']:
    cp(O/'checks'/name,Path('inputs/source-boundaries')/name)
strictpath=S/'stable-current487-checkpoint/stable-current487-BW3-exact-strict-ID-sets-and-terminal-checks.actual.json'
assert ref(strictpath)['sha256']=='sha256:0a55b8627908b98667c9043dfe3c81aa8af785b9f4f6f11b55c655597f72416e'
cp(strictpath,Path('inputs/active-basis/current487-exact-strict180-ID-sets-and-terminal-checks.exact.json'))
cp(S/'checks/current487-BW3-central-five-gate-current-check.stdout.actual.txt',Path('inputs/active-basis/current487-central-exit0.stdout.exact.txt'))

protected=json.loads((R/O/'protected/whole12-current-goal-page-context-source-image-and-prior-D-P-bindings.actual.json').read_text())
before=json.loads((R/O/'native/before-whole-normal-book-model.actual.json').read_text())
after=json.loads((R/O/'native/after-whole-normal-book-model.actual.json').read_text())
strict=json.loads((R/strictpath).read_text());chem=next(x for x in strict['subjects']if x['subject']=='chemie')
assert len(chem['strictCompleteGoalIds'])==180 and len(chem['currentGoalIds'])==381
metadata={'ordinal','navigationOrder','treeOrder','pageNumber','pageFingerprint'}
def context(v):
    if isinstance(v,list):return [context(x) for x in v]
    if isinstance(v,dict):return {k:context(x)for k,x in v.items()if k not in metadata}
    return v
afterpages={x['goalId']:x for x in after['pages']};currentstrict=set(chem['strictCompleteGoalIds'])
deltas=[]
basegoals={x['id']:x for x in json.loads((R/O/'inputs/current-whole-active-canonical.exact.json').read_text())['goals']}
newgoals={x['id']:x for x in json.loads((R/O/'candidate/current-whole511-398-B008.inactive.json').read_text())['goals']}
for b in before['pages']:
    gid=b['goalId'];a=afterpages.get(gid)
    if gid in currentstrict and a and context(b)!=context(a):
        goal_fields=[k for k in basegoals[gid].keys()|newgoals[gid].keys()if basegoals[gid].get(k)!=newgoals[gid].get(k)]
        assert not set(goal_fields)-{'requires'}, 'Protected text, image and source bodies must remain exact'
        deltas.append({'goalId':gid,'wholeExactCurrentGoalBody':basegoals[gid],'wholeInactiveCandidateGoalBody':newgoals[gid],'actualChangedWholeGoalFields':goal_fields,'wholeBeforePage':b,'wholeInactiveAfterPage':a,'actualChangedSubstantiveFields':[k for k in set(b)|set(a) if k not in metadata and context(b.get(k))!=context(a.get(k))]})
ids=[x['goalId']for x in deltas]
assert len(ids)==12 and set(ids)=={x['goalId']for x in protected['rows']}
put(Path('checks/actual-full381-to398-protected180-context-deltas.json'),{'schemaVersion':1,'role':'Actual whole-model technical delta; twelve unchanged scientific text/image/source bodies, five real requires changes, no scientific verdict','wholeBeforePageCount':len(before['pages']),'wholeAfterPageCount':len(after['pages']),'protectedStrict180Ids':chem['strictCompleteGoalIds'],'current381Ids':chem['currentGoalIds'],'actualDeltaGoalIds':ids,'actualDeltaCount':len(ids),'metadataExcluded':sorted(metadata),'rows':deltas,'strictGain':0,'activeWrites':[],'humanApproval':False})

p_records=[]
for i,item in enumerate(protected['wholeCurrentBoundedPInputs'],1):
    cfg=json.loads((R/item['wholeActiveConfigOriginalBinding']['path']).read_text())
    own=next(x['wholeExactCopy']['path']for x in item['wholeExactOrdinaryConfigRecordsAndCriteria']if x['original']['path']==cfg['reviewPath'])
    # Exactly copied historical records are loaded through the ordinary P loader.
    p_records.append(str(P/'inputs/protected'/Path(own).relative_to(O/'protected')))
    original=(R/cfg['reviewPath']).read_bytes()
    assert (R/p_records[-1]).read_bytes()==original
put(Path('inputs/protected12-P-body-and-profile-bindings.actual.json'),{'schemaVersion':1,'wholeOriginalOrdinaryPInputs':protected['wholeCurrentBoundedPInputs'],'normalExactCopyRecordPaths':p_records,'allWholeOriginalBodiesUnmodified':True,'newScientificPApprovals':0})

rasters=[]
for delta in deltas:
    gid=delta['goalId'];v=delta['wholeInactiveAfterPage']['visualization'];url=v['url'];canonical=Path('curricula/DE/Gymnasium/visualizations/chemie')/gid/Path(url).name;public=Path('app/public')/url.lstrip('/')
    assert ref(canonical)['sha256']==ref(public)['sha256']==v['originalDigest']
    for f in sorted((R/canonical.parent).iterdir()):
        if f.is_file():cp(f.relative_to(R),Path('assets/canonical/chemie')/gid/f.name)
    cp(public,Path('assets/public')/url.lstrip('/'))
    rasters.append({'goalId':gid,'wholeSelectedVisualization':v,'canonicalOriginal':ref(canonical),'publicOriginal':ref(public),'wholeExactCanonicalCopy':ref(P/'assets/canonical/chemie'/gid/Path(url).name),'wholeExactPublicCopy':ref(P/'assets/public'/url.lstrip('/')),'pixelChanges':0,'newVisualApproval':False})
put(Path('assets/protected12-exact-current-raster-bindings.actual.json'),{'schemaVersion':1,'rows':rasters,'exactRasterCount':12,'newImages':0,'pixelChanges':0,'formatConversions':0,'independentVisualApproval':False})

for stage in ['before','after']:
    cfg=json.loads((R/O/f'native/{stage}-whole-normal-book.config.json').read_text())
    cfg['evidenceReviewPaths']+=p_records
    cfg['outputPath']=str(P/f'native/{stage}-whole-with-current-protected-P-model.actual.json')
    put(Path(f'native/{stage}-whole-normal-book.config.json'),cfg)
ordered=[x['goalId']for x in after['pages']if x['goalId']in ids]
put(Path('native/current-12.normal-rollout.batch.config.json'),{'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-b008-protected-twelve-current-native-20261010-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-b008-protected-twelve-current-native-20261010-v1','title':'Chemie – zwölf aktuelle geschützte Kontextbindungen','baseGoalBookConfigPath':str(P/'native/after-whole-normal-book.config.json'),'goalIds':ordered,'outputDirectory':str(P/'native/current-12'),'feedbackBaseUrl':'https://skillpilot.com/feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','publicRoot':'app/public','printDerivativeProfile':'standard'})
put(Path('checks/all-exact-input-copies.actual.json'),{'schemaVersion':1,'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeExactFileCopies':copies,'sourceAtlasCurrentCandidateStatus':'HOLD:355/398;24 new children and19 old omissions;496 unresolved retained','originalDirectPartnerEdgesPreserved':1180,'source19CourseHoldsPreserved':True,'actualCurrentStrictCount':180,'actualCurrentCurricularAtomicCount':381,'inactiveCandidateCurricularAtomicCount':398,'scientificApprovals':0,'activeWrites':[],'strictGain':0,'humanApproval':False})

C.mkdir(parents=True)
for folder in ['app/scripts','app/src','contracts']:
    shutil.copytree(R/folder,C/folder,ignore=shutil.ignore_patterns('node_modules','.git'))
# Only actual ordinary model dependencies, copied verbatim at their normal paths.
paths=set()
for stage in ['before','after']:
    cfg=json.loads((R/P/f'native/{stage}-whole-normal-book.config.json').read_text())
    paths.update(cfg[k]for k in ['landscapePath','compositionViewPath','semanticKindLedgerPath','goalVisualizationQaPath'])
    paths.update(cfg['evidenceReviewPaths'])
for f in paths:
    if f.startswith(str(P)+'/'):continue
    dest=C/f;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/f,dest)
for f in (R/'curricula/DE/Gymnasium/quality/goal-evidence/prompts').iterdir():
    if f.is_file():
        dest=C/f.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest)
shutil.copytree(D,C/P)
shutil.copytree(R/'app/public/assets/goal-visualizations/chemie',C/'app/public/assets/goal-visualizations/chemie',dirs_exist_ok=True)
candidate_rasters=json.loads((R/O/'assets/whole26-exact-current-raster-origin-and-binding-map.json').read_text())['rows']
for row in candidate_rasters:
    dest=C/'app/public'/row['selectedResourceLink']['url'].lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(R/row['wholeExactSelectedRaster']['ownExactCopy']['path'],dest)
for row in rasters:
    url=row['wholeSelectedVisualization']['url'];dest=C/'app/public'/url.lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/row['wholeExactPublicCopy']['path'],dest)
    source=R/row['canonicalOriginal']['path'];dest=C/row['canonicalOriginal']['path'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
(C/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
(T/'capsule.actual.path.txt').write_text(str(C)+'\n')
print(json.dumps({'actualProtectedContextDeltaGoalIds':ids,'actualProtectedContextDeltaCount':12,'currentStrictCount':180,'nativeScopeCount':12,'wholePRecordInputs':len(p_records),'actualWholeExactRasterCopies':12,'activeWrites':0,'strictGain':0}))
