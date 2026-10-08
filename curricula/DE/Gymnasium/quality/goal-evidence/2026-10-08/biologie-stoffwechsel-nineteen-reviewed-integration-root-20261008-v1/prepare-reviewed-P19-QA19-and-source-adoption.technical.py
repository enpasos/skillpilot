# SPDX-License-Identifier: Apache-2.0
"""Adopt genuine sealed native P/V judgments and their exact operative sources."""
import copy, hashlib, json, shutil, sys
from pathlib import Path
from datetime import datetime, timezone
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent
AUTHOR=BASE/'biologie-stoffwechsel-nineteen-native-technical-20261008-v1'
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p): return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def verify(v):
    p=ROOT/v['path'];assert sha(p)==v['sha256'].removeprefix('sha256:') and p.stat().st_size==v['bytes'],p
    return p
def put(p,v):
    p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def rows(p): return [json.loads(line) for line in p.read_text().splitlines()]
assert len(sys.argv)==3
A,B=[read(ROOT/p) for p in sys.argv[1:]]
pair=read(OWN/'pending/original-seal-verification.actual.json')
for side in pair['seals'].values():
    verify(side['seal'])
    for b in side['verifiedOriginalFiles']: verify(b)
entry=read(AUTHOR/'neutral-current-nineteen-native.technical.entry.json');ids=entry['selectedGoalIds'];assert len(ids)==19
assert (OWN/'native-d-nineteen-current/resolution-index.json').is_file()
visual=read(OWN/'checks/actual-current-nineteen-paired-visual-approvals.technical.json')
assert visual['pairedCurrentRasterCount']==19 and {r['goalId'] for r in visual['rows']}==set(ids)
for r in visual['rows']: verify(r['actualRaster'])
arows=rows(ROOT/A['positiveReviewPath']);brows=rows(ROOT/B['positiveReviewPath'])
am={r['goalId']:r for r in arows};bm={r['goalId']:r for r in brows}
author_rows=rows(AUTHOR/'positive/P19.current-raster.author.review.jsonl');original={r['goalId']:r for r in author_rows}
assert set(am)==set(bm)==set(original)==set(ids)
schema=read(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
for i in ids:
    for r in [am[i],bm[i]]:
        jsonschema.Draft202012Validator(schema).validate(r)
        assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate'
        assert r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[]
        assert r['profile']==original[i]['profile']
    for k in ['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint']:
        assert am[i][k]==bm[i][k]==original[i][k],(i,k)
positive=OWN/'positive/P19.exact-independent-a-native.review.jsonl';positive.parent.mkdir(parents=True,exist_ok=True)
assert not positive.exists();shutil.copyfile(ROOT/A['positiveReviewPath'],positive)
pcfg=read(ROOT/entry['positiveConfigPath'])
pcfg.update(reviewId=arows[0]['reviewId'],landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',reviewPath=str(positive.relative_to(ROOT)))
pcfg['scope']['label']='19 genuine independently reviewed current native PNG/page/profile bindings; machine E1/G1 candidates'
assert pcfg['reviewRunManifestPaths']==[] and pcfg['reviewedResourceTypes']==['goal-visualization'] and not pcfg['requireApproved']
jsonschema.Draft202012Validator(read(ROOT/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')).validate(pcfg)
put(OWN/'positive/current-nineteen.future-active.config.json',pcfg)
qa=read(AUTHOR/'candidate/visualization-qa.current392.nineteen-unapproved.inactive.json')
before=read(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
ob={r['goalId']:r for r in before['records']};assert len(ob)==len(qa['records'])==392
for r in qa['records']:
    old=ob[r['goalId']]
    assert {k:v for k,v in old.items() if k.startswith('human')}=={k:v for k,v in r.items() if k.startswith('human')}
    if r['goalId'] not in ids: assert r==old;continue
    pair_r=next(v for v in visual['rows'] if v['goalId']==r['goalId'])
    assert r['assetSha256']==('sha256:'+pair_r['actualRaster']['sha256'].removeprefix('sha256:'))
    r.update(aiApproved='yes',aiApprovedAssetSha256=r['assetSha256'],aiReviewedAt=max(am[r['goalId']]['reviewedAt'],bm[r['goalId']]['reviewedAt']),aiReviewer='Two genuine blind independent native D/P and actual original/360/680 raster reviewers; technical adoption only',aiNotes='Exact current PNG approved in two separately sealed actual science and visual reviews; native D/P19 independently KEEP. See '+str((OWN/'checks/actual-current-nineteen-paired-visual-approvals.technical.json').relative_to(ROOT))+'. Whole regional/operator duties and excluded five source holds remain; no human approval.')
put(OWN/'candidate/visualization-qa.current392.paired-nineteen.future-active.json',qa)
active_source=ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
source_before=read(active_source);source_after=copy.deepcopy(source_before)
inactive=read(ROOT/'app/scripts/config/goal-books/inactive/biologie-stoffwechsel-nineteen-native-20261008-v1/atlas.inputs.json')
deltas=[(a,b) for a,b in zip(source_before['mappingPaths'],inactive['mappingPaths']) if a!=b]
assert len(deltas)==1 and len(source_before['mappingPaths'])==len(inactive['mappingPaths'])
source_after['mappingPaths']=inactive['mappingPaths']
assert all(source_after[k]==source_before[k] for k in source_before if k!='mappingPaths')
put(OWN/'candidate/atlas.inputs.reviewed-source19.future-active.json',source_after)
for name,path in [('canonical','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),('qa','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'),('registry','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),('sourceInputs',str(active_source)),('kinds','curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')]:
    p=ROOT/path;dest=OWN/'before'/f'{name}.exact.json';dest.parent.mkdir(exist_ok=True)
    assert not dest.exists();shutil.copyfile(p,dest)
    if name=='canonical':canonical_binding=bind(p)
    if name=='qa':qa_binding=bind(p)
    if name=='registry':registry_binding=bind(p)
    if name=='sourceInputs':source_binding=bind(p)
candidate=read(ROOT/entry['currentCandidateCanonicalPath']);canon_before=read(ROOT/canonical_binding['path'])
old={g['id']:g for g in canon_before['goals']};new={g['id']:g for g in candidate['goals']}
assert len(old)==len(new)==476 and set(old)==set(new)
assert {i for i in old if old[i]!=new[i]}==set(ids)
for i in ids: assert {k:v for k,v in old[i].items() if k!='resourceLinks'}=={k:v for k,v in new[i].items() if k!='resourceLinks'}
reg=read(ROOT/registry_binding['path']);sub=next(s for s in reg['subjects'] if s['subject']=='biologie')
for p in sub['resolutionIndexPaths']: assert not set(ids)&{r['goalId'] for r in read(ROOT/p)['resolutions']}
for p in sub['positiveEvidenceConfigPaths']: assert not set(ids)&{r['goalId'] for r in rows(ROOT/read(ROOT/p)['reviewPath'])}
put(OWN/'reviewed-nineteen-current-adoption.guard.json',dict(preparedAt=datetime.now(timezone.utc).isoformat(),goalIds=ids,beforeCanonical=canonical_binding,beforeQA=qa_binding,beforeRegistry=registry_binding,beforeSourceInputs=source_binding,candidateCanonical=bind(ROOT/entry['currentCandidateCanonicalPath']),candidateQA=bind(OWN/'candidate/visualization-qa.current392.paired-nineteen.future-active.json'),candidateSourceInputs=bind(OWN/'candidate/atlas.inputs.reviewed-source19.future-active.json'),Dindex=bind(OWN/'native-d-nineteen-current/resolution-index.json'),Pconfig=bind(OWN/'positive/current-nineteen.future-active.config.json'),exactIndependentAProfiles=bind(positive),actualIndependentBProfiles=bind(ROOT/B['positiveReviewPath']),sourceMappingSwap=deltas,other457Canonical373QARowsExact=True,all392HumanFieldsExact=True,all19WholeProfilesExact=True,sourceWholeAndFiveExcludedHoldsRetained=True,activeWrites=0,strictGain=0,humanApproval=False,humanTrial=False))
print(json.dumps(dict(genuineP19ExactAandB='PASS',genuineV19ExactPaired='PASS',sourceMappingPointerSwap=1,other457Goals373QARowsExact=True,humanFields392Exact=True,activeWrites=0)))
