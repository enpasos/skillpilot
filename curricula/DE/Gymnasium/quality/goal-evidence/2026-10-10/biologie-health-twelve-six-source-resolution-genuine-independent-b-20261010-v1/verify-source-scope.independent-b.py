#!/usr/bin/env python3
"""Independent bounded SOURCE comparison. Writes only this new review namespace."""
from pathlib import Path
from collections import Counter
import hashlib
import json
import subprocess
from functools import lru_cache
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
AUTHOR = BASE / 'biologie-health-twelve-six-source-bindings-resolution-author-successor-20261010-v2'
BEFORE = BASE / 'biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1'
USED = {}

def binding(path):
    path = Path(path)
    if not path.is_absolute():
        path = ROOT / path
    raw = path.read_bytes()
    result = {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
    USED[result['path']] = result
    return result

@lru_cache(maxsize=None)
def read(path):
    binding(path)
    return json.loads(Path(path).read_text())

def write(name, data):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    json.loads(path.read_text())
    return binding(path)

def canon(x):
    return json.dumps(x, sort_keys=True, ensure_ascii=False)

def expanded(receipt):
    result = []
    for scope in receipt['scopes']:
        for index in scope['witnessGroupRefs']:
            group = dict(receipt['witnessGroups'][index])
            mapping = receipt['inputBindings'][group.pop('mappingInput')]
            extraction = receipt['inputBindings'][group.pop('extractionInput')]
            # Preserve source and mapping identity while allowing changed carrier paths.
            mapping_object = read(ROOT / mapping['path'])
            extraction_object = read(ROOT / extraction['path'])
            mapping_id = {k: mapping_object[k] for k in ['reviewId','sourceLandscapeId','targetLandscapeId','jurisdiction'] if k in mapping_object}
            extraction_id = {k: extraction_object[k] for k in ['extractionId','sourceLandscapeId','jurisdiction','stage'] if k in extraction_object}
            if 'fallbackViewInput' in group:
                group['fallbackViewPath'] = receipt['inputBindings'][group.pop('fallbackViewInput')]['path']
            goals = group.pop('goalIds')
            for gid in goals:
                result.append({'scope': {k: scope[k] for k in ['key', 'viewId', 'jurisdiction', 'stage', 'durationModel', 'courseProfile']}, 'mappingReviewId': mapping_id, 'extractionId': extraction_id, 'goalId': gid, **group})
    return Counter(canon(x) for x in result)

entry_path = AUTHOR / 'neutral-six-source-bindings-resolution-author.entry.json'
freeze_path = AUTHOR / 'FINAL.six-source-bindings-neutral-author.freeze.json'
assert binding(entry_path)['sha256'] == 'sha256:9c73c22459e7e133cf0d9ba6062031e99b62951bfbf159d7069edf6977879503'
assert binding(freeze_path)['sha256'] == 'sha256:9bfdec655e740a0318ab65a892095e3f1e459582e3bea35c065421a2fbce9958'
entry = read(entry_path)
freeze = read(freeze_path)
input_failures = []
for item in freeze['ownBindings'] + freeze['externalBindings']:
    actual = binding(item['path'])
    if actual != item:
        input_failures.append({'expected': item, 'actual': actual})
assert not input_failures, input_failures

neutral = read(AUTHOR / 'sources/six-whole-source-goals-all-current-partners-and-decisions.neutral.json')
deltas = read(AUTHOR / 'sources/six-unsupported-mapping-records.actual-author-deltas.json')
witnesses = read(AUTHOR / 'sources/whole-current-direct-witnesses-and-actual-primaries.neutral.json')
config = read(AUTHOR / 'sources/current394-six-resolution.normal.config.json')
canonical = read(ROOT / config['landscapePath'])
goals = {g['id']: g for g in canonical['goals']}
all_partner_ids = set()
for row in neutral['records']:
    extraction = read(ROOT / row['afterExtraction']['path'])
    source = next(g for g in extraction['sourceGoals'] if g['id'] == row['sourceGoalId'])
    assert source == row['wholeAfterSourceGoal']
    for key in ['wholeCurrentBeforeCanonicalPartners', 'wholeCurrentAfterCanonicalPartners']:
        for goal in row[key]:
            assert goals[goal['id']] == goal, goal['id']
            all_partner_ids.add(goal['id'])

removed_expected = Counter(canon(d['beforeMappingRecord']) for d in deltas['removedUnsupportedMappingRecords'])
removed_actual = Counter()
pair_results = []
changed = {r['index']: r for r in deltas['wholeChangedMappingPairs']}
for i, pair in enumerate(witnesses['whole31PairBindings']):
    after_binding = pair['mapping']
    before_binding = changed[i]['beforeMapping'] if i in changed else after_binding
    before = read(ROOT / before_binding['path'])
    after = read(ROOT / after_binding['path'])
    bmaps = Counter(canon(m) for m in before['mappings'])
    amaps = Counter(canon(m) for m in after['mappings'])
    assert not (amaps - bmaps), i
    removed = bmaps - amaps
    removed_actual.update(removed)
    before_extract = read(ROOT / (changed[i]['beforeExtraction']['path'] if i in changed else pair['extraction']['path']))
    after_extract = read(ROOT / pair['extraction']['path'])
    assert [g['id'] for g in before_extract['sourceGoals']] == [g['id'] for g in after_extract['sourceGoals']]
    selected = {d['sourceGoalId'] for d in deltas['removedUnsupportedMappingRecords']}
    assert [d for d in before['decisions'] if d.get('sourceGoalId', d.get('id')) not in selected] == [d for d in after['decisions'] if d.get('sourceGoalId', d.get('id')) not in selected], i
    pair_results.append({'index': i, 'jurisdiction': pair['jurisdiction'], 'beforeMapping': before_binding, 'afterMapping': after_binding, 'beforeCount': len(before['mappings']), 'afterCount': len(after['mappings']), 'removedRecords': [json.loads(k) for k in removed.elements()], 'allOtherMappingRecordsExact': True, 'sourceGoalIdSetAndOrderExact': True})
assert removed_actual == removed_expected
assert len(pair_results) == 31
assert sum(bool(r['removedRecords']) for r in pair_results) == 3

page_check = read(AUTHOR / 'checks/current394-whole-native-pages-source-only-context.actual.json')
oldmodel = read(ROOT / page_check['before']['path'])
newmodel = read(ROOT / page_check['after']['path'])
bp = {p['goalId']: p for p in oldmodel['pages']}
ap = {p['goalId']: p for p in newmodel['pages']}
assert list(bp) == list(ap) and len(bp) == 394
changed_pages = []
for gid in bp:
    assert bp[gid]['goalFingerprint'] == ap[gid]['goalFingerprint']
    if bp[gid] != ap[gid]:
        fields = [k for k in bp[gid] if bp[gid][k] != ap[gid][k]]
        assert fields == ['applicability', 'pageFingerprint'], (gid, fields)
        assert [a for a in bp[gid]['applicability'] if a['jurisdiction'] != 'DE-HH'] == ap[gid]['applicability']
        changed_pages.append({'goalId': gid, 'changedFields': fields, 'beforeApplicability': bp[gid]['applicability'], 'afterApplicability': ap[gid]['applicability'], 'wholeBeforePage': bp[gid], 'wholeAfterPage': ap[gid]})
assert {p['goalId'] for p in changed_pages} == {'0e1065b9-9d1d-5299-b900-32c74d352e56', 'a6f57e17-9f0c-5327-91bc-c6f31ff375a2'}
contexts = read(AUTHOR / 'native/whole-affected-current-page-and-cluster-contexts.neutral.json')
for row in contexts['records']:
    assert row['wholeBeforeNativePage'] == bp[row['goalId']]
    assert row['wholeAfterNativePage'] == ap[row['goalId']]
    if row['protectedCurrent353Goal']:
        assert bp[row['goalId']] == ap[row['goalId']]

br = read(BEFORE / 'sources/normal-output/source-projection.receipt.json')
ar = read(AUTHOR / 'sources/normal-output/source-projection.receipt.json')
bc, ac = expanded(br), expanded(ar)
assert not (ac-bc)
lost = [json.loads(k) for k in (bc-ac).elements()]
assert sum(bc.values()) == 3294 and sum(ac.values()) == 3286
assert len(lost) == 8
scope_delta = []
for bscope, ascope in zip(br['scopes'], ar['scopes']):
    assert bscope['key'] == ascope['key']
    if bscope['goalIds'] != ascope['goalIds']:
        assert bscope['key'] == 'DE-HH/SekI/'
        assert set(bscope['goalIds']) - set(ascope['goalIds']) == {p['goalId'] for p in changed_pages}
        assert not set(ascope['goalIds']) - set(bscope['goalIds'])
        scope_delta.append({'key': bscope['key'], 'beforeCount': len(bscope['goalIds']), 'afterCount': len(ascope['goalIds']), 'removedGoalIds': sorted(set(bscope['goalIds'])-set(ascope['goalIds']))})
assert len(ar['scopes']) == 24 and len(scope_delta) == 1
hb = read(ROOT / neutral['records'][0]['afterMapping']['path'])
hb037 = next(d for d in hb['decisions'] if d.get('sourceGoalId') == neutral['records'][0]['sourceGoalId'])
assert hb037['decision'] == hb037['status'] == 'needs_canonical_goal' and hb037['canonicalGoalIds'] == []

primary_manifest = read(AUTHOR / 'primary/eight-whole-primary-pages-current-author.actual.json')
primary_results = []
for item in primary_manifest['records']:
    pdf = ROOT / item['wholeOriginalPdf']['path']
    page = str(item['physicalPageOneBased'])
    with fitz.open(pdf) as document:
        pdf_page = document[int(page)-1]
        actual = pdf_page.get_text().encode()
        original_raster = Image.open(ROOT / item['wholeRaster']['path']).convert('RGB')
        pix = pdf_page.get_pixmap(matrix=fitz.Matrix(96/72,96/72), alpha=False)
        actual_raster = Image.frombytes('RGB', (pix.width,pix.height), pix.samples)
        assert actual_raster.size == original_raster.size and actual_raster.tobytes() == original_raster.tobytes()
    assert actual == (ROOT / item['wholeText']['path']).read_bytes()
    primary_results.append({k:item[k] for k in ['sourceDocumentKey','physicalPageOneBased','wholeOriginalPdf','wholeText','wholeRaster']})

restriction_path = ROOT / 'curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_9_Einschraenkungen_2022.pdf'
restriction_binding = binding(restriction_path)
restriction_rasters = []
with fitz.open(restriction_path) as document:
    for index in range(3):
        raster_path = OWN / 'primary' / f'HB-2022-restriction.physical-{index+1:03}.actual.png'
        raster_path.parent.mkdir(parents=True,exist_ok=True)
        document[index].get_pixmap(matrix=fitz.Matrix(96/72,96/72), alpha=False).save(raster_path)
        restriction_rasters.append(binding(raster_path))

result = {'schemaVersion': 1, 'reviewer': 'genuine-independent-b', 'scope': 'Bounded six-record SOURCE removal; structural equality is not human approval or new D/P/A/M/V review', 'pinnedEntry': binding(entry_path), 'pinnedAuthorFreeze': binding(freeze_path), 'verifiedAuthorFreezeBindingCount': len(freeze['ownBindings']) + len(freeze['externalBindings']), 'wholePairs': pair_results, 'removedRecordCount': sum(removed_actual.values()), 'sixNeutralSourceObjectsMatchActualExtractions': True, 'wholeCanonicalPartnerCount': len(all_partner_ids), 'wholeCanonicalPartnersMatchActualCurrentLandscape': True, 'complete394PageGoalIdSetAndOrderExact': True, 'exactWholePageCount': len(bp)-len(changed_pages), 'all394GoalContentFingerprintsExact': True, 'changedWholePages': changed_pages, 'affected16ContextsVerified': len(contexts['records']), 'protectedAffectedContextPagesExact': sum(r['protectedCurrent353Goal'] for r in contexts['records']), 'receiptWitnessCountBefore': sum(bc.values()), 'receiptWitnessCountAfter': sum(ac.values()), 'removedReceiptWitnesses': lost, 'removedDirectReceiptCount': sum(x['coverage']=='direct' for x in lost), 'removedInheritedReceiptCount': sum(x['coverage']!='direct' for x in lost), 'allOtherWitnessSemanticsExact': True, 'scopeMembershipChanges': scope_delta, 'wholePrimaryPagesActualPdfTextAndRasterPixelsExact': primary_results, 'HB2022RestrictionActualPdf':restriction_binding, 'HB2022RestrictionBiologyRasters':restriction_rasters, 'HB037Decision': hb037['decision'], 'HB037CanonicalGoalIds': hb037['canonicalGoalIds'], 'sourceMappingCompletionClaimed': False, 'strictGain': 0, 'humanApproved': 0, 'humanTrial': False, 'activeWrites': []}
write('checks/own-six-source-pairs-receipt-and-whole-page.actual.json', result)
write('inputs/own-actual-used-bindings.json', {'schemaVersion':1, 'role':'Byte checks of sealed neutral input closure; earlier evaluative review contents were not read', 'records': list(USED.values()), 'humanApproved':0, 'strictGain':0})
print(json.dumps({'success':True,'pairs':len(pair_results),'removedMappings':sum(removed_actual.values()),'wholeCanonicalPartners':len(all_partner_ids),'wholePagesExact':len(bp)-len(changed_pages),'changedPages':len(changed_pages),'receiptWitnesses':[sum(bc.values()),sum(ac.values())],'primaryPages':len(primary_results)},ensure_ascii=False))
