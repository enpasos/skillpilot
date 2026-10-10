# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.parent / 'biologie-q1-eight-title-methyl-current-native-technical-author-successor-v2'
OLD_AUTHOR = OWN.parent / 'biologie-q1-eight-current-v3-raster-native-technical-author-candidate-v1'
E = json.loads((AUTHOR / 'neutral-eight-title-methyl-current-native.independent-review.entry.json').read_text())
OLD_E = json.loads((OLD_AUTHOR / 'neutral-eight-current-v3-raster-native.independent-review.entry.json').read_text())
N = E['neutralWholeFirstInputs']
O = OLD_E['neutralWholeFirstInputs']
def load(binding): return json.loads((ROOT / binding['path']).read_text())
def sha(path): return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()
def rows(binding): return [json.loads(line) for line in (ROOT / binding['path']).read_text().splitlines() if line]

after = load(N['whole479CurrentGoalBodiesWithTwoTitleFieldsAndEightRasterLinks'])
before = json.loads((ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json').read_text())
ag, bg = ({g['id']: g for g in x['goals']} for x in (after, before))
assert len(ag) == len(bg) == 479 and set(ag) == set(bg)
changed = [i for i in ag if ag[i] != bg[i]]
assert set(changed) == set(E['priorityGoalIds'])
deltas = []
for i in changed:
    fields = sorted(k for k in set(ag[i]) | set(bg[i]) if ag[i].get(k) != bg[i].get(k))
    assert fields == (['resourceLinks', 'title', 'titleEn'] if i.startswith('3312b2bb') else ['resourceLinks'])
    assert {k: v for k, v in ag[i].items() if k not in fields} == {k: v for k, v in bg[i].items() if k not in fields}
    deltas.append({'goalId': i, 'actualChangedFields': fields})
bm, am = (load(N[k]) for k in ['whole394BeforeModel', 'whole394CurrentModel'])
bp, ap = ({p['goalId']: p for p in model['pages']} for model in (bm, am))
assert len(bp) == len(ap) == 394 and set(bp) == set(ap)
changed_pages = [i for i in ap if bp[i] != ap[i]]
assert set(changed_pages) == set(E['priorityGoalIds'])
protection = json.loads((AUTHOR / 'inputs/protected-all-five-baseline-current-and-strict-ID-sets.exact.json').read_text())
protected = next(s for s in protection['subjects'] if s['subject'] == 'biologie')['strictCompleteGoalIds']
assert len(protected) == 315
assert all(ag[i] == bg[i] and ap[i] == bp[i] for i in protected)

# Exact whole unchanged materials/source frame: reuse genuine historical
# judgments, never pretend hashes are a new scientific review.
old_material = O['wholeTwelveCurrentV3ScientificMaterialsAndCases']
assert (ROOT / old_material['path']).read_bytes() == (ROOT / N['wholeTwelveCurrentV3ScientificMaterialsAndCases']['path']).read_bytes()
assert (ROOT / O['whole16SourceDuties113PartnerEdges41PartnerBodies']['path']).read_bytes() == (
    ROOT / N['whole16SourceDuties113PartnerEdges41OriginalPartnerBodies']['path']).read_bytes()
assert (ROOT / O['fourDeferredUnchangedWholeV3PRecords']['path']).read_bytes() == (
    ROOT / N['fourDeferredUnchangedWholeV3PRecords']['path']).read_bytes()
original = {p['goalId']: p for p in rows(N['wholeTwelveCurrentV3OriginalPProfiles'])}
current = rows(N['normalCurrentEightPRecords'])
assert len(current) == 8 and {p['goalId'] for p in current} == set(E['priorityGoalIds'])
for p in current:
    assert p['profile'] == original[p['goalId']]['profile']
    assert p['status'] == 'needs_human_review' and p['reviewAuthority'] == 'ai_candidate'
    assert p['evidenceLevel'] == 'E1' and p['maximumClaimScope'] == 'G1' and p['reviewRunIds'] == []
source = load(N['whole16SourceDuties113PartnerEdges41OriginalPartnerBodies'])
assert len(source) == 16
edges = sum(len(s['allOriginalPartnerRows']) for s in source)
partners = {g['id']: g for s in source for g in s['wholeCurrentCanonicalPartners']}
assert edges == 113 and len(partners) == 41

old_goals = {g['id']: g for g in load(O['whole479GoalBodiesWithOnlyEightNewRasterLinks'])['goals']}
old_semantic_keys = ['title', 'titleEn', 'description', 'descriptionEn', 'shortKey', 'dimensionTags', 'nodeKind']
unchanged_seven = [i for i in E['priorityGoalIds'] if not i.startswith('3312b2bb')]
assert all(all(old_goals[i].get(k) == ag[i].get(k) for k in old_semantic_keys) for i in unchanged_seven)
assert all(p['goalId'] != '2d451684-6e53-565e-a987-f362da919d2c' for p in am['pages'])
model52 = ap['52ecc72a-a65b-53a0-851e-86defe769fa7']
assert any(x.get('goalId') == '3312b2bb-bc90-5c0f-a859-4b4f9b8ff117'
           and x.get('title') == ag['3312b2bb-bc90-5c0f-a859-4b4f9b8ff117']['title']
           for x in model52['reverseRequires'])

receipt = {
    'schemaVersion': 1, 'checkedAt': datetime.now(timezone.utc).isoformat(),
    'actualWhole479GoalDeltas': deltas, 'whole471OtherGoalBodiesExact': True,
    'whole394CurrentGoalIdsExact': True, 'actualWhole394PageDeltaUnion': changed_pages,
    'whole315ProtectedBodiesAndWholePagesExact': True, 'whole386OtherPagesExact': True,
    'unchangedSevenCurrentSemanticBodiesExact': unchanged_seven,
    'wholeTwelveScientificMaterialsExactSHA256': sha(ROOT / N['wholeTwelveCurrentV3ScientificMaterialsAndCases']['path']),
    'wholeEightCurrentProfilesAreExactlyUnchangedScientificProfiles': True,
    'fourDeferredWholeRecordsExactAndNotApproved': True, 'wholeSourceDuties': 16,
    'wholeOriginalPartnerEdges': 113, 'wholeOriginalPartnerBodies': 41,
    'wholeSourceFrameExact': True, 'current52eccReverse3312TitleActuallyUpdated': True,
    'orientation2d451ExcludedFromOrdinaryPages': True,
    'sourceOperatorHoldNotResolvedByByteEquality': True,
    'historicalGenuineCaseJudgmentsReusedWithActualEqualityProof': True,
    'currentNativePagesActuallySeenSeparately': True, 'newCurricularAtomicGoals': 0,
    'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
}
(OWN / 'current-whole-input-preservation.independent.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'whole479': 'PASS', 'actualPageDeltaUnion': len(changed_pages), 'protected315': 'EXACT',
                  'wholeSource': [16,113,41], 'currentEightScientificProfileValues': 'EXACT',
                  'unchangedSevenSemantics': 'EXACT', 'sourceHoldResolved': False}))
