# SPDX-License-Identifier: Apache-2.0
"""Apply independently evidenced locator findings to a new immutable candidate."""
from pathlib import Path
import copy
import datetime
import hashlib
import json
import sys

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-eighteen-operative-sources-author-20261008-v2'
A = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-eighteen-operative-sources-independent-a-20261008-v2'
B = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-eighteen-operative-sources-independent-b-20261008-v2'
def read(p): return json.loads(p.read_text())
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write(name, x):
    p = OUT / name
    with p.open('x') as f: f.write(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
    return p
aseal=A/'independent-a.operative-source-v2.first-judgment.freeze.json'
bseal=B/'eighteen-operative-source-independent-b.first-judgment.freeze.json'
assert bind(aseal)['sha256']=='f847b32592c89259170c38fc3f7e6a71e27642543ba217b3c6c4e37b075a7b7f'
assert bind(bseal)['sha256']=='cbaae9dbf684fa0d007eaaff6ca84a572f625dd4984b91236cddb1f36c404ac7'
entrypath=AUTHOR/'neutral-operative-eighteen-source-review.portable.final.entry.json'
entry=read(entrypath)
originalpath=ROOT/entry['mappingReviewCandidatePath']
original=read(originalpath)
new=copy.deepcopy(original)
apath=A/'minimal27-decision-field-remediation-values.for-author-v3.actual.json'
bpath=B/'first-eighteen-operative-source-judgment.independent-b.json'
areq=read(apath);breq=read(bpath)
by_b={r['canonicalGoalId']:r for r in breq['decisions']}
expath=ROOT/entry['sourceExtractionCandidatePath'];ex=read(expath)
source={r['id']:r for r in ex['sourceGoals']}
assert len(ex['sourceGoals'])==144 and len(areq['patches'])==27
selected=set(entry['scopeGoalIds']);selectedsource=set()
for r in areq['all18DecisionsBound']:
    s=source[r['sourceGoalId']];br=by_b[r['goalId']]
    assert r['requiredDecisionTopicCode']==br['requiredDecisionTopicCode']==s['topicCode']
    assert r['requiredDecisionSourceSpan']==br['requiredDecisionSourceSpan']==s['sourceSpan']
    selectedsource.add(s['id'])
assert len(selectedsource)==18
for p in areq['patches']:
    parts=p['jsonPointer'].split('/')
    assert len(parts)==4 and parts[1]=='decisions' and parts[3] in ['topicCode','sourceSpan']
    row=new['decisions'][int(parts[2])]
    assert row['sourceGoalId']==p['sourceGoalId'] and p['canonicalGoalId'] in row['canonicalGoalIds']
    assert row[p['field']]==p['before']
    assert p['requiredAfter']==source[row['sourceGoalId']][p['field']]
    row[p['field']]=p['requiredAfter']
assert len(new['decisions'])==144 and new['mappings']==original['mappings']
assert all(a==b for a,b in zip(original['decisions'],new['decisions']) if a['sourceGoalId'] not in selectedsource)
assert sum(a==b for a,b in zip(original['decisions'],new['decisions']) if a['sourceGoalId'] not in selectedsource)==126
assert sum(a['topicCode']!=b['topicCode'] for a,b in zip(original['decisions'],new['decisions']))==9
assert sum(a['sourceSpan']!=b['sourceSpan'] for a,b in zip(original['decisions'],new['decisions']))==18
new['reviewId']='hessen-biology-upper-secondary-evolution18-reviewed-locator-candidate-20261008-v3'
mp=write('hessen_biology_upper_secondary.evolution18-decision-locators.author-20261008-v3.review.json',new)
delta=write('exact27-operative-decision-locator-corrections.author.json',{'schemaVersion':1,'role':'New author candidate implementing actual sealed independent A/B findings; not independent source approval','recordedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceV2ExtractionUnchanged':bind(expath),'sourceV2MappingHistoryUnchanged':bind(originalpath),'independentFirstSeals':[bind(aseal),bind(bseal)],'independentlySeenRequiredValues':[bind(apath),bind(bpath)],'patches':areq['patches'],'changedTopicCodes':9,'changedSourceSpans':18,'other126DecisionsExact':True,'all158MappingEdgesExact':True,'all144SourceRowsAndExtractionIdExact':True,'collectionVersionIdChangeOnlyAdditionalMetadataChange':True,'whole18Science36CasesRetained':True,'activeWrites':False,'sourceApproved':False,'humanApproval':False})
ne=copy.deepcopy(entry)
ne['role']='Source v3 AUTHOR candidate: only27 independently evidenced operative Decision locator corrections; both genuine follow-up decisions still required'
ne['mappingReviewCandidatePath']=str(mp.relative_to(ROOT))
ne['sourceV2BeforeMappingPath']=str(originalpath.relative_to(ROOT))
ne['sourceV3DecisionDeltaPath']=str(delta.relative_to(ROOT))
ne['sourceApproved']=False
ne['sourceV2FirstVerdictsHoldActualIncorrectLocatorFields']=True
ne['sourceRowsAndWholeCasesUnchanged']=True
ne['newSourceOnlyReviewRequired']=True
np=write('neutral-eighteen-source-v3-locator-review.entry.json',ne)
write('current392-live-source-consumer-rebase-observation.author.json',{'role':'Current active structure observation, never a stale whole391 replacement','currentCanonical':bind(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),'currentWholeGoalCount':476,'latestActualStrictReport':bind(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-split-reviewed-active-integration-root-v1/affected-check-central.stdout.actual.txt'),'only18SourceDecisionLocatorsCandidate':True,'activeWrites':False})
print(json.dumps({'candidateMapping':str(mp.relative_to(ROOT)),'entry':str(np.relative_to(ROOT)),'mappingSha256':bind(mp)['sha256'],'minimalRealFieldCorrections':27,'independentFollowupPending':True}))
