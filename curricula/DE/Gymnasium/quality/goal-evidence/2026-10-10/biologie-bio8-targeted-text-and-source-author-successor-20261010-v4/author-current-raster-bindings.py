# SPDX-License-Identifier: Apache-2.0
"""Bind actual current rasters; distinguish hash notation from byte drift."""
import hashlib,json,pathlib
R=pathlib.Path(__file__).resolve().parents[7]
P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-targeted-text-and-source-author-successor-20261010-v4')
O=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3')
def read(p):return json.loads((R/p).read_text())
def ref(p):
    b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def digest(s):return s.removeprefix('sha256:')
def put(p,x):
    f=R/P/p;assert not f.exists(),p
    f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
q=read(P/'candidate/QA396.author-pending.json')
m=read(P/'native/whole396.normal-model.actual.json')
rows=[]
for row in q['records']:
    if row['visualizationState']!='available':continue
    r=ref(pathlib.Path(row['canonicalAssetPath']))
    assert digest(r['sha256'])==digest(row['assetSha256']),row['goalId']
    page=next(x for x in m['pages']if x['goalId']==row['goalId'])
    assert digest(page['visualization']['originalDigest'])==digest(r['sha256']),row['goalId']
    rows.append({'goalId':row['goalId'],'actualOperativeRaster':r,'currentQADigest':row['assetSha256'],
        'normalWholePageDigest':page['visualization']['originalDigest'],
        'preservedAIApprovedDigest':row.get('aiApprovedAssetSha256'),
        'newIndependentVisualJudgment':False})
assert len(rows)==363,len(rows)
put('checks/all363-current-operative-raster-bindings.actual.json',{'role':'technical_exact_binding_only',
    'currentQA':ref(P/'candidate/QA396.author-pending.json'),'currentNormalWholeModel':ref(P/'native/whole396.normal-model.actual.json'),
    'actualAvailableRasters':len(rows),'mismatches':[],'actualCurrentRasterBindings':rows,
    'scientificMeaning':'Actual bytes and technical bindings match. This technical check creates no independent visual judgment and does not turn pending QA into approval.',
    'newIndependentVisualJudgments':0,'humanApproval':0})
gid='2ae2da43-73d5-578f-84f4-be0585a7d8f9'
owner=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-2ae2-current-applicability-native-independent-b-v1/one-current-applicability-native.independent-b.science-FIRST.verdict.json')
historical_path='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-2ae2-applicability-current-native-preparation-root-v1/assets/goal-visualizations/biologie/'+gid+'/'+gid+'.png'
found=[]
def walk(x):
    if isinstance(x,dict):
        if x.get('path')==historical_path and 'sha256'in x and 'bytes'in x:found.append(x)
        for v in x.values():walk(v)
    elif isinstance(x,list):
        for v in x:walk(v)
walk(read(owner));assert found
oldref=found[0];actual_old=ref(pathlib.Path(historical_path))
assert digest(oldref['sha256'])==digest(actual_old['sha256'])and oldref['bytes']==actual_old['bytes']
current=next(x for x in rows if x['goalId']==gid)
assert digest(current['actualOperativeRaster']['sha256'])==digest(actual_old['sha256'])
oq=next(x for x in read(O/'candidate/QA396.final-fossil-image-pending.json')['records']if x['goalId']==gid)
cq=next(x for x in q['records']if x['goalId']==gid)
assert cq==oq
put('checks/2ae2-historical-reference-and-current-operative-raster.actual.json',{
    'finding':'Initial recursive closure comparison treated bare hexadecimal and sha256-prefixed digest strings as different references.',
    'historicalAuditOwner':ref(owner),'historicalReferenceExactlyAsRecorded':oldref,'historicalReferencedActualBytes':actual_old,
    'historicalHashNotation':'bare hexadecimal','currentHashNotation':'sha256-prefixed hexadecimal',
    'actualByteMismatch':False,'currentOperativeRasterBinding':current,'currentQARowExactToPreviousAuthorCandidate':True,
    'currentQAApprovedDigestMatchesCurrentRaster':digest(cq['aiApprovedAssetSha256'])==digest(current['actualOperativeRaster']['sha256']),
    'currentWholePageBound':True,'historicalBytesModified':[],'currentRasterOmitted':False,
    'newIndependentVisualJudgment':False,'remainingTargetedVisualHoldFromThisCheck':False,
    'scope':'Retained existing machine visual evidence for the identical current raster. This is a technical normalization correction, not a new visual/scientific approval.'})
print(json.dumps({'currentRastersVerified':len(rows),'current2ae2ActualSHA256':current['actualOperativeRaster']['sha256'],'historical2ae2ActualByteMismatch':False,'newIndependentVisualJudgments':0}))
