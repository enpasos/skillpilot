# SPDX-License-Identifier: Apache-2.0
"""Integrate genuine three native reviews; retain all untouched goals and human fields."""
import copy, hashlib, json, shutil
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p): return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def verify(b):
    p=ROOT/b['path'];assert p.is_file() and sha(p)==b['sha256'].removeprefix('sha256:') and p.stat().st_size==b['bytes'],p
    return p
def put(p,v):
    p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
g=read(OWN/'reviewed-three-current-adoption.guard.json');ids=g['goalIds'];assert len(ids)==3
pair=read(OWN/'pending/original-seal-verification.actual.json')
for side in pair['seals'].values():
    verify(side['seal'])
    for b in side['verifiedOriginalFiles']:verify(b)
for b in pair['originalMutableBeforeInputsPreserved']:verify(b['originalBinding']);verify(b['immutableHistoricalCopy'])
paths={k:verify(g[k]) for k in ['beforeCanonical','beforeQA','beforeRegistry','beforeSourceInputs','candidateCanonical','candidateQA','candidateSourceInputs','Dindex','Pconfig','exactIndependentAProfiles','actualIndependentBProfiles']}
d=read(OWN/'checks/genuine-three-native-D-direct-existing-contracts.actual.json')
assert len(d['D'])==1 and len(d['D'][0]['resolutions'])==3
assert all(r['nativeLowerDescriptionComplete'] and not r['errors'] for r in d['D'][0]['resolutions'])
oldcanon,newcanon=map(read,[paths['beforeCanonical'],paths['candidateCanonical']])
old={x['id']:x for x in oldcanon['goals']};new={x['id']:x for x in newcanon['goals']}
assert len(old)==len(new)==476 and set(old)==set(new)
assert {i for i in old if old[i]!=new[i]}==set(ids)
for i in ids:assert {k:v for k,v in old[i].items() if k!='resourceLinks'}=={k:v for k,v in new[i].items() if k!='resourceLinks'}
oldqa,newqa=map(read,[paths['beforeQA'],paths['candidateQA']]);ob={r['goalId']:r for r in oldqa['records']};nb={r['goalId']:r for r in newqa['records']}
assert len(ob)==len(nb)==392 and set(ob)==set(nb)
for i in ob:
    if i not in ids:assert ob[i]==nb[i]
    assert {k:v for k,v in ob[i].items() if k.startswith('human')}=={k:v for k,v in nb[i].items() if k.startswith('human')}
    if i in ids:assert ob[i]['visualizationState']=='missing' and nb[i]['aiApproved']=='yes' and nb[i]['aiApprovedAssetSha256']==nb[i]['assetSha256']
visual=read(OWN/'checks/actual-current-three-paired-visual-approvals.technical.json')
assert visual['pairedCurrentRasterCount']==3
imageentrypath=BASE/'biologie-stoffwechsel-first-three-images-author-20261008-v1/three-images.current-author.neutral.entry.json'
changedentrypath=BASE/'biologie-stoffwechsel-third-antenna-targeted-image-author-20261008-v3/neutral-changed-third-antenna-v3.author.entry.json'
imageentry=read(imageentrypath);changedentry=read(changedentrypath)
image_rows={r['goalId']:r for r in imageentry['images']}
for r in changedentry['images']:image_rows[r['goalId']]=r
assert set(image_rows)==set(ids)
roots=[ROOT/'curricula/DE/Gymnasium/visualizations/biologie',ROOT/'app/public/assets/goal-visualizations/biologie',ROOT/'backend/src/main/resources/static/assets/goal-visualizations/biologie']
ops=[]
for i in ids:
    r=image_rows[i];p=ROOT/r['assetPath'];assert sha(p)==r['sha256'] and p.stat().st_size==r['bytes']
    vp=next(v for v in visual['rows'] if v['goalId']==i);assert sha(verify(vp['actualRaster']))==sha(p) and verify(vp['actualRaster']).stat().st_size==p.stat().st_size
    with Image.open(p) as im:
        assert im.format=='PNG' and im.size==(r['dimensions']['width'],r['dimensions']['height'])
        assert abs(im.width/im.height-16/9)<0.015
    prompt=ROOT/r.get('originalPromptPath',r['promptPath']);recon=ROOT/r['reconstructionPromptPath'];assert prompt.is_file() and recon.is_file()
    for root in roots:assert not (root/i/f'{i}.png').exists()
    for f in ['prompt.de.md','image-reconstruction-prompt.de.md','provenance.json']:assert not (roots[0]/i/f).exists()
    ops.append(dict(goalId=i,source=bind(p),prompt=bind(prompt),reconstruction=bind(recon),authorRow=r,pairedVisualApproval=vp))
reg_before=read(paths['beforeRegistry']);reg=copy.deepcopy(reg_before)
sub=next(s for s in reg['subjects'] if s['subject']=='biologie')
for key,value in [('resolutionIndexPaths',str(paths['Dindex'].relative_to(ROOT))),('positiveEvidenceConfigPaths',str(paths['Pconfig'].relative_to(ROOT)))]:
    assert value not in sub[key];sub[key].append(value)
for a,b in zip(reg_before['subjects'],reg['subjects']):
    if a['subject']!='biologie':assert a==b
before_src,after_src=map(read,[paths['beforeSourceInputs'],paths['candidateSourceInputs']])
assert sum(a!=b for a,b in zip(before_src['mappingPaths'],after_src['mappingPaths']))==9
assert {k:v for k,v in before_src.items() if k!='mappingPaths'}=={k:v for k,v in after_src.items() if k!='mappingPaths'}
source_pair=read(OWN/'checks/actual-current-three-paired-source-projection-approvals.technical.json')
assert source_pair['pairedWholeDecisionRemediations']==15 and source_pair['removedMisplacedTargetEdges']==20
assert source_pair['pairedChangedWholePages']==3 and source_pair['pendingRealCompanions']==2 and source_pair['originalWholeOperatorHolds']==4
assert not source_pair['wholeRegionalDutyApproval']
protected=[ROOT/'app/scripts/config/curriculum-maturity-floor-policy.json',ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',ROOT/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json']
for subject in ['MATHEMATIK','PHYSIK','CHEMIE']:protected.append(ROOT/f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json')
for subject in ['mathematik','physik','chemie']:protected.append(ROOT/f'curricula/DE/Gymnasium/quality/goal-visualization-qa/{subject}.qa.json')
protected_bindings=[bind(p) for p in protected]
put(OWN/'reviewed-three-pre-apply-guard.actual.json',dict(observedAt=datetime.now(timezone.utc).isoformat(),adoptionGuard=bind(OWN/'reviewed-three-current-adoption.guard.json'),verifiedOriginalSeals=pair['seals'],originalBeforeInputHistoricalCopies=pair['originalMutableBeforeInputsPreserved'],genuineNativeD3=bind(OWN/'checks/genuine-three-native-D-direct-existing-contracts.actual.json'),genuineP3=bind(paths['exactIndependentAProfiles']),genuineV3=bind(OWN/'checks/actual-current-three-paired-visual-approvals.technical.json'),protectedFiles=protected_bindings,imageOperations=ops,other473Goals389QARowsExact=True,all392HumanFieldsExact=True,newAorMJudgments=False,allSourceWholeHoldsRetained=True,activeWritesBeforeGuard=0,humanApproval=False,humanTrial=False))

for op in ops:
    i=op['goalId'];r=op['authorRow']
    for root in roots:
        dest=root/i/f'{i}.png';dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(verify(op['source']),dest)
    shutil.copyfile(verify(op['prompt']),roots[0]/i/'prompt.de.md')
    shutil.copyfile(verify(op['reconstruction']),roots[0]/i/'image-reconstruction-prompt.de.md')
    put(roots[0]/i/'provenance.json',dict(schemaVersion=1,provider=r['provider'],model=r['providerModel'],actualAsset=bind(roots[0]/i/f'{i}.png'),originalAuthorEntry=bind(changedentrypath if i==changedentry['goalIds'][0] else imageentrypath),originalAuthorRow=r,actualGenerationPrompt=op['prompt'],actualRasterDerivedReconstructionPrompt=op['reconstruction'],pairedIndependentActualVisualEvidence=bind(OWN/'checks/actual-current-three-paired-visual-approvals.technical.json'),formatDecision=f"PNG{r['dimensions']['width']}x{r['dimensions']['height']} near16:9; actual original,360px and680px reviews separately sealed",license='CC-BY-4.0',machineVisualApproval=True,generationIsApproval=False,humanApproval=False))
shutil.copyfile(paths['candidateCanonical'],paths['beforeCanonical'])
shutil.copyfile(paths['candidateQA'],paths['beforeQA'])
shutil.copyfile(paths['candidateSourceInputs'],paths['beforeSourceInputs'])
paths['beforeRegistry'].write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n')
for b in protected_bindings:verify(b)
for op in ops:
    for root in roots:assert sha(root/op['goalId']/f"{op['goalId']}.png")==op['source']['sha256']
put(OWN/'genuine-three-applied-central-pending.actual.json',dict(appliedAt=datetime.now(timezone.utc).isoformat(),goalIds=ids,canonical=bind(paths['beforeCanonical']),qa=bind(paths['beforeQA']),registry=bind(paths['beforeRegistry']),sourceInputs=bind(paths['beforeSourceInputs']),actualInstalledPNGs=3,allThreeCopiesExact=True,other473Goals389QARowsAnd392HumanFieldsExact=True,A392M392ExistingValidDecisionsRetained=True,sourceWholeHoldsRetained=True,affectedChecks='pending',central='pending',strictGainClaimed=0,humanApproval=False,humanTrial=False))
print(json.dumps(dict(guardedApply='PASS',threeNewPNGImages=3,threeExactCopiesEach=True,other473Goals389QARows392HumanFieldsExact=True,strictGain=0,central='pending')))
