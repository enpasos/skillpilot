# SPDX-License-Identifier: Apache-2.0
"""Prepare exact genuine reviewed Basis2 inputs; no active writes or new reviews."""
import copy, hashlib, json, shutil, subprocess
from pathlib import Path
from datetime import datetime, timezone
import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
AUTHOR = BASE / 'biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2'
NATIVE_A = BASE / 'biologie-stoffwechsel-two-basic-source-native-independent-a-20261008-v2'
NATIVE_B = BASE / 'biologie-stoffwechsel-two-basic-native-independent-b-20261008-v1'
VA = BASE / 'biologie-stoffwechsel-two-basic-images-independent-a-20261008-v2'
VB = BASE / 'biologie-stoffwechsel-two-basic-visualization-independent-b-20261008-v1'
IDS = ['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1']
WORD = '576d59e2-397a-5654-b853-7c0c4870fbd3'
def read(p): return json.loads(Path(p).read_text())
def rows(p): return [json.loads(l) for l in Path(p).read_text().splitlines() if l]
def bind(p):
    p=Path(p); return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def verify(b):
    p=ROOT/b['path']; actual=bind(p)
    assert actual['sha256']==b['sha256'].removeprefix('sha256:') and actual['bytes']==b['bytes'],p
    return p
def put(p,v):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def copy_exact(a,b):
    b=Path(b);b.parent.mkdir(parents=True,exist_ok=True);assert not b.exists(),b
    shutil.copyfile(a,b); assert Path(a).read_bytes()==b.read_bytes()

assert (OWN/'native-d-two-basic/resolution-index.json').is_file()
assert (OWN/'native-d-existing576-context/resolution-index.json').is_file()
readiness=read(OWN/'pending/original-seal-verification.actual.json')
assert readiness['allOriginalSealsConfirmedByRoot'] and not readiness['unresolvedAdoptionBlockingFindings']
guard=read(OWN/'pending/current244-live-preservation-and-two-new-guard.actual.json')
before={}
for label, ref in guard['immutableBeforeInputs'].items():
    current=verify(ref['liveOriginal']); assert current.read_bytes()==verify(ref['immutableBeforeCopy']).read_bytes()
    dest=OWN/'before'/(label+'.exact'+('.jsonl' if label.endswith('Rows') else '.json'))
    copy_exact(current,dest); before[label]=dict(active=bind(current),snapshot=bind(dest))

entry=read(AUTHOR/'neutral-final-primary-refined-basis2.author.entry.json')
canon=read(ROOT/entry['currentCanonicalPath']); old=read(ROOT/before['canonical']['active']['path'])
ob={g['id']:g for g in old['goals']}; nb={g['id']:g for g in canon['goals']}
assert len(ob)==476 and len(nb)==478 and set(nb)-set(ob)==set(IDS)
changed=[i for i in ob if ob[i]!=nb[i]]
assert changed==[guard['oneParentContainsWeightDelta']]
parent=changed[0]
assert {k:v for k,v in ob[parent].items() if k not in ['contains','weight']}=={k:v for k,v in nb[parent].items() if k not in ['contains','weight']}
assert set(nb[parent]['contains'])-set(ob[parent]['contains'])==set(IDS)
assert ob[WORD]==nb[WORD]
copy_exact(ROOT/entry['currentCanonicalPath'],OWN/'candidate/canonical478.exact-reviewed.future-active.json')
kinds=read(ROOT/entry['currentKindsPath'])
kinds['sourceLandscapePath']=before['canonical']['active']['path']
put(OWN/'candidate/semantic-kinds478.exact-reviewed.future-active.json',kinds)

ar=rows(NATIVE_A/'P2.current-native.independent-a.review.jsonl')
br=rows(NATIVE_B/'P2-whole-current.actual-independent-b.records.jsonl')
original=rows(ROOT/read(ROOT/entry['positiveConfigPath'])['reviewPath'])
assert {r['goalId'] for r in ar}=={r['goalId'] for r in br}=={r['goalId'] for r in original}==set(IDS)
pschema=read(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
for i in IDS:
    a=next(r for r in ar if r['goalId']==i);b=next(r for r in br if r['goalId']==i);o=next(r for r in original if r['goalId']==i)
    for r in [a,b]:
        jsonschema.Draft202012Validator(pschema).validate(r)
        assert (r['status'],r['reviewAuthority'],r['evidenceLevel'],r['maximumClaimScope'],r['reviewRunIds'])==('needs_human_review','ai_candidate','E1','G1',[])
        assert r['profile']==o['profile']
    for k in ['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint']:
        assert a[k]==b[k]==o[k],(i,k)
positive=OWN/'positive/P2.exact-genuine-independent-a.review.jsonl'
copy_exact(NATIVE_A/'P2.current-native.independent-a.review.jsonl',positive)
pcfg=read(ROOT/entry['positiveConfigPath'])
pcfg.update(reviewId=ar[0]['reviewId'],landscapePath=before['canonical']['active']['path'],semanticKindLedgerPath=before['kinds']['active']['path'],reviewPath=str(positive.relative_to(ROOT)))
pcfg['scope']['label']='Two genuine independent current native whole P profiles; E1/G1 machine candidates'
put(OWN/'positive/P2.future-active.config.json',pcfg)

am_adoption=[]
for kind,label,record in [('A','atomicityConfig','A2-new-two.actual-independent-b.records.jsonl'),('M','memoryConfig','M2-new-two.actual-independent-b.records.jsonl')]:
    cfg=read(ROOT/before[label]['active']['path']); old_rows=ROOT/cfg['reviewPath']; genuine=rows(NATIVE_B/record)
    assert {r['goalId'] for r in genuine}==set(IDS)
    assert not set(IDS)&{r['goalId'] for r in rows(old_rows)}
    adopted=[]
    for r in genuine:
        t=copy.deepcopy(r); t['reviewId']=cfg['reviewId']
        assert {k:v for k,v in t.items() if k!='reviewId'}=={k:v for k,v in r.items() if k!='reviewId'}
        adopted.append(t)
    dest=OWN/'atomicity-memory'/f'{kind}394.old392-exact-plus-genuine-b2.adopted.jsonl';dest.parent.mkdir(exist_ok=True)
    assert old_rows.read_bytes().endswith(b'\n') and not dest.exists()
    dest.write_bytes(old_rows.read_bytes()+(''.join(json.dumps(t,ensure_ascii=False)+'\n' for t in adopted)).encode())
    assert dest.read_bytes().startswith(old_rows.read_bytes()) and len(rows(dest))==394
    cfg['reviewPath']=str(dest.relative_to(ROOT));put(OWN/'atomicity-memory'/f'{kind}394.future-active.config.json',cfg)
    am_adoption.append(dict(kind=kind,originalIndependentRows=bind(NATIVE_B/record),adoptedRows=bind(dest),onlyNew2ReviewIdChangedToExistingFullScope=True,old392BytePrefixExact=True,scientificJudgmentFingerprintReasonReviewerAndTimestampExact=True))

vas=read(VA/'two-basic-images.independent-a.first.verdicts.json'); vbs=read(VB/'actual-two-images.visualization-b.first-verdict.json')
images=read(AUTHOR/'neutral-two-basic.actual-images.author.entry.json')['images']
qa=read(ROOT/before['qa']['active']['path']);candidate=read(ROOT/entry['currentQaPath'])
oldqa={r['goalId']:r for r in qa['records']}; paired=[]; installs=[]
assert len(oldqa)==392
for i in IDS:
    a=next(r for r in vas['records'] if r['goalId']==i);b=next(r for r in vbs['decisions'] if r['goalId']==i);im=next(r for r in images if r['goalId']==i)
    assert a['verdict']=='APPROVE_AI_VISUAL_GATE_EXACT_CURRENT_RASTER' and not a['blockingFindings']
    assert b['decision']=='KEEP' and b['actualOriginalAnd360And680Viewed'] and not vbs['blockingFindings']
    png=verify(im); assert a['asset']['sha256']==im['sha256']==b['viewedInputs'][0]['sha256']
    row=copy.deepcopy(next(r for r in candidate['records'] if r['goalId']==i))
    row['publicAssetPath']='app/public'+row['imageUrl']
    row['canonicalAssetPath']=f'curricula/DE/Gymnasium/visualizations/biologie/{i}/{i}.png'
    row.update(aiApproved='yes',aiApprovedAssetSha256=row['assetSha256'],aiReviewedAt=max(vas['createdAtUtc'],vbs['createdAtUtc']),aiReviewer='Two genuine separately sealed independent current original/360/680 raster reviewers; technical adoption',aiNotes='Exact original PNG and caption/alt accepted by genuine blind V-A and V-B; see '+str((OWN/'checks/paired-original-V2.technical.json').relative_to(ROOT))+'. Native whole D/P2 separately KEEP; source roles only bounded, four original operator holds retained; no human approval or trial.')
    assert row['humanApproved']=='no' and row['assetSha256']=='sha256:'+im['sha256']
    qa['records'].append(row)
    paired.append(dict(goalId=i,actualRaster=bind(png),genuineA=bind(VA/'two-basic-images.independent-a.first.verdicts.json'),genuineB=bind(VB/'actual-two-images.visualization-b.first-verdict.json'),generationIsApproval=False))
    canonical_dir=f'curricula/DE/Gymnasium/visualizations/biologie/{i}'
    for source,target in [(png,canonical_dir+f'/{i}.png'),(png,row['publicAssetPath']),(ROOT/im['promptPath'],canonical_dir+'/prompt.de.md'),(ROOT/im['reconstructionPromptPath'],canonical_dir+'/image-reconstruction-prompt.de.md'),(ROOT/im['provenancePath'],canonical_dir+'/actual-generation.provenance.json')]:
        assert not (ROOT/target).exists(),target
        installs.append(dict(source=bind(source),destination=target,mustNotExist=True))
assert len(qa['records'])==394 and all(next(r for r in qa['records'] if r['goalId']==i)==r for i,r in oldqa.items())
put(OWN/'candidate/visualization-QA394.old392-exact-plus-reviewed2.future-active.json',qa)
put(OWN/'checks/paired-original-V2.technical.json',dict(pairedCurrentRasterCount=2,rows=paired,all392HumanAndMachineRowsExact=True,activeWrites=0,newScientificReviewByIntegrator=False,humanApproval=False))

source=read(ROOT/before['sourceInputs']['active']['path']); src_candidate=read(ROOT/entry['finalSourceAtlasConfigPath']);src_after=copy.deepcopy(source)
src_after['mappingPaths']=src_candidate['mappingPaths'];src_after['expectedCurricularAtomicGoalCount']=394
mapping_deltas=[dict(ordinal=i+1,before=bind(ROOT/a),after=bind(ROOT/b)) for i,(a,b) in enumerate(zip(source['mappingPaths'],src_after['mappingPaths'])) if a!=b]
assert len(mapping_deltas)==8
source_diff=read(verify(entry['finalSourceDiff']));assert source_diff['actualFinalChangedDutyCount']==9 and source_diff['actualFinalNewEdgeCount']==10
assert source_diff['allFourOriginalOperatorHoldsRetained'] and source_diff['whole20OriginalDutiesAnd268PartnersRetainedInBoundOriginalInputs']
for delta in mapping_deltas:
    b=read(ROOT/delta['before']['path']);a=read(ROOT/delta['after']['path'])
    assert all(a[k]==v for k,v in b.items() if k not in ['decisions','mappings'])
    bm={r['sourceGoalId']:r for r in b['decisions']};am={r['sourceGoalId']:r for r in a['decisions']};assert set(bm)==set(am)
    changed_duties={i for i in bm if bm[i]!=am[i]}
    expected={e['sourceGoalId'] for e in source_diff['actualFinalNewEdges'] if e['mappingPath']==delta['after']['path']}
    assert changed_duties==expected,(delta['ordinal'],changed_duties,expected)
    for i in changed_duties:
        additions=set(am[i]['canonicalGoalIds'])-set(bm[i]['canonicalGoalIds']);assert additions and additions<=set(IDS)
        assert not set(bm[i]['canonicalGoalIds'])-set(am[i]['canonicalGoalIds'])
    assert all(m in a['mappings'] for m in b['mappings'])
    extra=[m for m in a['mappings'] if m not in b['mappings']];assert len(extra)==sum(e['mappingPath']==delta['after']['path'] for e in source_diff['actualFinalNewEdges'])
    assert all(m['canonicalGoalId'] in IDS and m['matchType']=='partial' for m in extra)
put(OWN/'candidate/source-atlas394.eight-mapping-pointers.future-active.json',src_after)

reg=read(ROOT/before['registry']['active']['path']);sub=next(s for s in reg['subjects'] if s['subject']=='biologie')
old_sub=copy.deepcopy(sub)
for p in sub['resolutionIndexPaths']:
    assert not set(IDS)&{r['goalId'] for r in read(ROOT/p)['resolutions']}
for p in sub['positiveEvidenceConfigPaths']:
    assert not set(IDS)&{r['goalId'] for r in rows(ROOT/read(ROOT/p)['reviewPath'])}
for path in [OWN/'native-d-two-basic/resolution-index.json',OWN/'native-d-existing576-context/resolution-index.json']:
    sub['resolutionIndexPaths'].append(str(path.relative_to(ROOT)))
sub['resolutionSupersessions'].append(dict(goalId=WORD,supersededIndexPath=guard['existingWordOriginalDIndexPreserveImmutable'],replacementIndexPath=str((OWN/'native-d-existing576-context/resolution-index.json').relative_to(ROOT))))
sub['positiveEvidenceConfigPaths'].append(str((OWN/'positive/P2.future-active.config.json').relative_to(ROOT)))
# Preserve the established active config paths, installing only their new reviewPath
# bindings later. This keeps ordinary full-scope defaults and CI aligned as well.
assert sub['semanticAtomicityConfigPath']==before['atomicityConfig']['active']['path']
assert sub['memoryReviewConfigPath']==before['memoryConfig']['active']['path']
assert [s for s in reg['subjects'] if s['subject']!='biologie']==[s for s in read(ROOT/before['registry']['active']['path'])['subjects'] if s['subject']!='biologie']
put(OWN/'candidate/central-registry394.reviewed-two-and-word-supersession.future-active.json',reg)
put(OWN/'checks/exact-current-preservation-and-adoption.technical.json',dict(observedAtUtc=datetime.now(timezone.utc).isoformat(),actualHead=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),allNineCurrentBeforeInputsExactToHistoricalCurrent244Guard=True,old476CanonExceptOneParentContainsWeightExact=True,new2WholeGoalBodiesExactToActuallyReviewedFinalNative=True,existingWordWholeTextAndAllValidPExact=True,current392WholeQARowsAndAllHumanFieldsExact=True,old392AtomicityMemoryRowBytesExact=True,originalP2ProfileBodiesAndAllFourDEENCasesExact=True,AMAdoption=am_adoption,boundedSourceDuties=9,newPartialPartnerRows=10,mappingPointerChanges=mapping_deltas,whole20Duties268OriginalPartnersAndFourOperatorHoldsRetained=True,wordContextSupersessionUsesGenuineTwoCurrentReviews=True,protectedOtherSubjectsRegistryExact=True,allExistingPositiveConfigPathsExact=True,activeWrites=0,currentStrictComplete=244,currentDenominator=392,proposedStrictComplete=246,proposedDenominator=394,predictedNewScientificClosures=IDS,restoredExistingBindingGoalIds=[WORD],strictGainClaimed=0,humanApproval=False,humanTrial=False))
files={k:bind(OWN/v) for k,v in dict(canonical='candidate/canonical478.exact-reviewed.future-active.json',kinds='candidate/semantic-kinds478.exact-reviewed.future-active.json',qa='candidate/visualization-QA394.old392-exact-plus-reviewed2.future-active.json',registry='candidate/central-registry394.reviewed-two-and-word-supersession.future-active.json',sourceInputs='candidate/source-atlas394.eight-mapping-pointers.future-active.json',atomicityConfig='atomicity-memory/A394.future-active.config.json',memoryConfig='atomicity-memory/M394.future-active.config.json').items()}
put(OWN/'reviewed-basis2-current-adoption.guard.json',dict(schemaVersion=1,expectedHead=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),currentStrictComplete=244,currentDenominator=392,newGoalIds=IDS,contextSupersessionGoalId=WORD,before=before,candidate=files,imageInstalls=installs,originalReadinessReceipt=bind(OWN/'pending/original-seal-verification.actual.json'),technicalEvidence=bind(OWN/'checks/exact-current-preservation-and-adoption.technical.json'),activeWrites=0,humanApproval=False,humanTrial=False))
print(json.dumps(dict(P2='genuine exact A/B PASS',V2='genuine paired current PNG PASS',old392QA='EXACT',old392AM='EXACT BYTE PREFIX',sourceDuties=9,sourcePartialEdges=10,sourceMappingPointers=8,newCurrentScienceClosuresClaimed=0,proposedStrict='246/394',activeWrites=0)))
