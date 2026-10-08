# SPDX-License-Identifier: Apache-2.0
"""Bind completed scientific judgments; does not perform or claim new reviews."""
import copy
import hashlib
import json
import shutil
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
A = BASE / 'biologie-upper-sixteen-whole-independent-a-resumed-v1'
B = BASE / 'biologie-upper-sixteen-whole-independent-b-resumed-v1'
NATIVE = BASE / 'biologie-upper-communication-evaluation-sixteen-native-author-technical-resumed-v1'

def read(path):
    return json.loads(path.read_text())

def rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line]

def binding(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

def verify(value):
    path = ROOT / value['path']
    assert binding(path)['sha256'] == 'sha256:' + value['sha256'].removeprefix('sha256:'), path
    if 'bytes' in value:
        assert path.stat().st_size == value['bytes'], path
    return path

def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

seals = [A / 'independent-a.first-verdict.freeze.json',
         A / 'citation-one-targeted-followup-v2/P1.independent-a.first-targeted-verdict.freeze.json',
         A / 'citation-one-targeted-followup-v2/P15-plus-P1.record-output.freeze.json',
         B / 'whole-sixteen.independent-b.first.freeze.json',
         B / 'targeted-citation-followup-v2/P1-targeted.first.freeze.json',
         B / 'independent-b.completed.final.freeze.json']
seal_receipts = []
for path in seals:
    seal = read(path)
    files = seal.get('actualFiles', seal.get('artifacts', seal.get('files')))
    assert isinstance(files, list) and files, path
    for value in files:
        verify(value)
    seal_receipts.append({'seal': binding(path), 'verifiedFiles': len(files)})

native_entry = read(NATIVE / 'neutral-sixteen-native-independent-review.entry.json')
ids = native_entry['selectedWholeGoalIds'] if 'selectedWholeGoalIds' in native_entry else [r['goalId'] for r in native_entry['rasterBindings']]
assert len(ids) == len(set(ids)) == 16
a15_path = A / 'citation-one-targeted-followup-v2/P15.independent-a.unchanged-first-review.materialized.jsonl'
a1_path = A / 'citation-one-targeted-followup-v2/P1.independent-a.corrected-targeted-followup.jsonl'
b16_path = B / 'P16.current.actual-independent-b.review.jsonl'
am = {r['goalId']: r for r in rows(a15_path) + rows(a1_path)}
bm = {r['goalId']: r for r in rows(b16_path)}
original = {r['goalId']: r for r in rows(ROOT / native_entry['positiveRecordPath'])}
corrected = rows(BASE / 'biologie-upper-citation-one-targeted-material-correction-author-root-v2/P1.actual-corrected-whole-material.author-candidate.review.jsonl')[0]
original[corrected['goalId']] = corrected
assert set(am) == set(bm) == set(original) == set(ids)
schema = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
paired = []
for gid in ids:
    for record in (am[gid], bm[gid]):
        schema.validate(record)
        assert record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate'
        assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
        assert record['dissent'] == []
    for field in ('goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint', 'profile'):
        assert am[gid][field] == bm[gid][field] == original[gid][field], (gid, field)
    paired.append({'goalId': gid, 'profileFingerprint': bm[gid]['profileFingerprint'],
                   'independentARecordSource': binding(a1_path if gid == corrected['goalId'] else a15_path),
                   'independentBRecordSource': binding(b16_path),
                   'completeBilingualCases': len(bm[gid]['profile']['applicationCaseBriefs']),
                   'targetedMaterialCorrection': gid == corrected['goalId'], 'humanApproval': False})

visual_a_path = A / 'whole-native-DPV.actual-observations.first.json'
visual_b_path = B / 'V16.actual-independent-b.machine-decisions.json'
va = {r['goalId']: r for r in read(visual_a_path)['observations']}
vb = {r['goalId']: r for r in read(visual_b_path)['entries']}
rasters = {r['goalId']: r for r in native_entry['rasterBindings']}
assert set(va) == set(vb) == set(rasters) == set(ids)
visual_pairs = []
for gid in ids:
    raster = rasters[gid]['actualOriginalImage']
    verify(raster)
    assert va[gid]['imageDecision'] == vb[gid]['decision'] == 'KEEP'
    assert va[gid]['actualOriginalFullAnd360And680Inspected'] and vb[gid]['actualOriginalAnd360And680Viewed']
    assert va[gid]['imageBinding']['sha256'].removeprefix('sha256:') == vb[gid]['assetSha256'] == raster['sha256'].removeprefix('sha256:')
    assert vb[gid]['goalFingerprint'] == bm[gid]['goalFingerprint']
    visual_pairs.append({'goalId': gid, 'actualRaster': raster, 'decision': 'KEEP',
                         'independentAObservations': binding(visual_a_path),
                         'independentBObservations': binding(visual_b_path),
                         'originalAnd360And680ActuallyViewedByBoth': True, 'humanApproval': False})

positive = OWN / 'positive/P16.exact-current-independent-b.review.jsonl'
positive.parent.mkdir(parents=True, exist_ok=True)
assert not positive.exists()
shutil.copyfile(b16_path, positive)
config = read(B / 'P16.current.actual-independent-b.inactive.config.json')
config.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
              semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
              reviewPath=str(positive.relative_to(ROOT)))
config['scope']['label'] = '16 paired current whole machine profiles; 15 first reviews retained, citation material corrected and independently resolved'
for manifest in config['reviewRunManifestPaths']:
    assert (ROOT / manifest).is_file()
jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')).validate(config)
put(OWN / 'positive/current-sixteen.future-active.config.json', config)

qa = read(ROOT / native_entry['candidateVisualizationQAPath'])
before_qa = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
before_rows = {r['goalId']: r for r in before_qa['records']}
patch = []
for row in qa['records']:
    gid = row['goalId']
    if gid not in ids:
        assert row == before_rows[gid], gid
        continue
    assert {k: v for k, v in row.items() if k.startswith('human')} == {k: v for k, v in before_rows[gid].items() if k.startswith('human')}
    assert row['assetSha256'].removeprefix('sha256:') == rasters[gid]['actualOriginalImage']['sha256'].removeprefix('sha256:')
    row['canonicalAssetPath'] = f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png'
    row.update(aiApproved='yes', aiApprovedAssetSha256=row['assetSha256'], aiReviewedAt=vb[gid]['aiReviewedAt'],
               aiReviewer='Two genuine independent whole native D/P and actual original/360/680 image reviewers; technical pairing only',
               aiNotes=vb[gid]['aiNotes'] + ' Independent A: ' + va[gid]['imageObservationsDe'] + ' Paired evidence: ' + str((OWN / 'checks/current-sixteen-PV-pair.actual.json').relative_to(ROOT)))
    patch.append(row)
assert len(patch) == 16
put(OWN / 'candidate/visualization-qa.sixteen-reviewed-rows.future-active.patch.json', {'schemaVersion': 1, 'role': 'Reviewed selected rows only; merge into current QA and preserve other records', 'records': patch})
put(OWN / 'checks/current-sixteen-PV-pair.actual.json', {
    'schemaVersion': 1, 'role': 'Technical adoption of actual independently sealed scientific reviews; no new review inferred from hashes',
    'originalAndTargetedSealsVerified': seal_receipts, 'pairedWholeProfiles': paired, 'pairedActualRasters': visual_pairs,
    'citationFindingsResolvedByBothActualTargetedReviews': True, 'otherFifteenWholeProfilesAndFirstReviewsReused': True,
    'ordinaryPositiveRunManifestsRetained': config['reviewRunManifestPaths'],
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'pairedWholeCurrentP': 16, 'pairedActualV': 16, 'resolvedCitationGoal': 1, 'activeWrites': 0, 'strictGain': 0}))
