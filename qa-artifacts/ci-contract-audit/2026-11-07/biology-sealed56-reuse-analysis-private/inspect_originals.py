#!/usr/bin/env python3
"""Read-only finite original-content analysis; writes only this new private packet.

No Git, native qualifier, validator, image review, SourceA probe, or active writes.
Existing census locators are discovery aids; original decisions and seals are read.
"""
import collections
import datetime
import hashlib
import json
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
OWNER = '08a43a1b-d97e-522c-9dfa-c950a493364e'
OLD_COMMIT = '6fe35a6b0fa807e5a97475b34f3715dc16a89c00'
EVIDENCE = 'curricula/DE/Gymnasium/quality/goal-evidence/'
VISUAL = 'curricula/DE/Gymnasium/quality/goal-visualization-review/'
captured = {}


def pin(path, expected=None):
    path = str(path)
    data = (ROOT / path).read_bytes()
    actual = hashlib.sha256(data).hexdigest()
    if expected is not None:
        assert actual == expected.removeprefix('sha256:'), path
    captured[path] = {'path': path, 'sha256': actual, 'bytes': len(data)}
    return captured[path]


def read(path, expected=None):
    pin(path, expected)
    def unique(pairs):
        result = {}
        for k, v in pairs:
            assert k not in result, (path, k)
            result[k] = v
        return result
    return json.loads((ROOT / path).read_bytes(), object_pairs_hook=unique)


def bound(ref):
    result = pin(ref['path'], ref['sha256'])
    if 'bytes' in ref:
        assert ref['bytes'] == result['bytes'], ref['path']
    return result


def one(rows, key, value):
    found = [r for r in rows if r.get(key) == value]
    assert len(found) == 1, (key, value, len(found))
    return found[0]


def png(ref):
    bound(ref)
    raw = (ROOT / ref['path']).read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n' and raw[12:16] == b'IHDR'
    return list(struct.unpack('>II', raw[16:24]))


source = read(SOURCE, '9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79')
ledger = read(QA, 'fc5540c93a737e722bc40e61e0802766fa90c309747b8753fe444cfd45ae1dcf')
current = {g['id']: g for g in source['goals']}
qa = {r['goalId']: r for r in ledger['records']}
assert source['landscapeId'] == OWNER and source['subject'] == 'Biologie'

census_files = [
    '/dev/shm/skillpilot-v-biology-human-flora-he7-original-families/family-census.json',
    '/dev/shm/skillpilot-v-biology-he18-ecology20-original-families/family-census.json',
]
census_rows = [r for p in census_files for r in read(p)['rows']]
specs = [
    ('human20', 'biology-human20-original-sealed-native-context', 20,
     EVIDENCE + '2026-10-07/biologie-human20-final-raster-native-independent-a-20261007-v1/',
     'first-final-D-P-V20.independent-a.freeze.json', 'exactAuthorInputSeal',
     'candidate/canonical.current474-twenty-new-raster-author.json',
     'native-raster-candidate/twenty/book-model.json'),
    ('flora19', 'biology-flora20-original-sealed-native-context', 19,
     EVIDENCE + '2026-10-08/biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1/',
     'first-final-D-P-V20.independent-a.freeze.json', 'exactAuthorInputSeal',
     'candidate/canonical.current474-twenty-new-raster-author.json',
     'native-raster-candidate/twenty/book-model.json'),
    ('he17', 'biology-he18-original-whole-input-and-first-verdict-seal', 17,
     EVIDENCE + '2026-10-08/biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1/',
     'first-final-D-P-V18.independent-a.exact.freeze.json', 'authorInput',
     'candidate/canonical.current474-eighteen-new-raster-author.json',
     'native-raster-candidate/eighteen/book-model.json'),
]
families = []
selected = []
excluded = []
for name, family, expected_count, review_dir, seal_name, author_key, candidate_suffix, model_suffix in specs:
    rows = [r for r in census_rows if r['family'] == family]
    review_ref = rows[0]['originalReview']
    review = read(review_ref['path'], review_ref['sha256'])
    seal = read(review_dir + seal_name)
    frozen = seal['frozenFiles']
    bound(one(frozen, 'path', review_ref['path']))
    author_ref = seal[author_key]
    author = read(author_ref['path'], author_ref['sha256'])
    files = author.get('files', author.get('frozenFiles'))
    candidate_ref = [r for r in files if r['path'].endswith(candidate_suffix)]
    model_ref = [r for r in files if r['path'].endswith(model_suffix)]
    assert len(candidate_ref) == len(model_ref) == 1
    candidate_ref, model_ref = candidate_ref[0], model_ref[0]
    candidate = read(candidate_ref['path'], candidate_ref['sha256'])
    model = read(model_ref['path'], model_ref['sha256'])
    assert candidate['landscapeId'] == model['book']['landscapeId'] == OWNER
    old_goals = {g['id']: g for g in candidate['goals']}
    assert review['schemaVersion'] == 1 and review['actualAgent']
    assert datetime.datetime.fromisoformat(review['recordedAt'])
    assert review['hold'] == review['reject'] == 0 and review['findings'] == []
    assert review['humanApproval'] is review['humanTrial'] is False
    assert len(review['records']) == len(rows)
    ids = []
    for row in rows:
        gid = row['goalId']
        verdict = one(review['records'], 'goalId', gid)
        assert verdict['machineCandidateDecision'] == 'KEEP'
        assert verdict['scientificAndVisualVerdict'] == 'PASS'
        assert verdict['substantiveActualObservationsDe'] and verdict['nativePageObservation']
        assert verdict['humanApproval'] is verdict['deviceAcceptanceClaim'] is False
        assert verdict['imageAndAltCorrespond'] is True
        asset = verdict['actualObservedFullRaster']
        native_size = png(asset)
        widths = verdict['actualObservedChromiumCaptures']
        assert len(widths) == 2 and [png(v)[0] for v in widths] == [360, 680]
        page_ref = verdict['actualObservedNativePdfPage']
        page_capture = page_ref.get('capture', page_ref)
        png(page_capture)
        pdf_ref = page_ref.get('actualPdf')
        if pdf_ref is None:
            pdf_refs = [r for r in files if r['path'].endswith('native-raster-candidate/eighteen/bundle/book.pdf')]
            assert len(pdf_refs) == 1
            pdf_ref = pdf_refs[0]
        bound(pdf_ref)
        page = one(model['pages'], 'goalId', gid)
        old = old_goals[gid]
        assert page['title'] == old['title'] and page['description'] == old['description']
        assert page['visualization']['originalDigest'] == 'sha256:' + asset['sha256']
        resource = one(old['resourceLinks'], 'type', 'goal-visualization')
        assert page['visualization']['altText'] == resource['altText']
        assert resource['role'] == 'primary' and resource['skillpilotId'] == gid
        assert page_ref['physicalPage'] == page['pageNumber'] + 2
        for dep in row['originalContextChain']:
            bound(dep)
        # Preserve independently copied wording where the census originally located it.
        assert all(old[k] == v for k, v in row['originalContext'].items())
        diffs = [k for k in set(old) | set(current[gid]) if old.get(k) != current[gid].get(k)]
        current_hashes = [pin(qa[gid][k]) for k in ['publicAssetPath', 'canonicalAssetPath']]
        selected_now = row['status'] == 'matching-original-context-closed-adapter-pending'
        if not selected_now:
            excluded.append({'family': name, 'goalId': gid, 'censusStatus': row['status'],
                'currentGoalDifferentFields': sorted(diffs), 'originalAsset': asset,
                'currentAsset': current_hashes[0], 'originalContext': row['originalContext'],
                'currentContext': row['currentContext']})
            continue
        assert old == current[gid], (name, gid, diffs)
        assert all(v['sha256'] == asset['sha256'] for v in current_hashes)
        assert qa[gid]['landscapeId'] == OWNER and qa[gid]['subject'] == 'biologie'
        assert qa[gid]['imageUrl'] == resource['url']
        assert qa[gid]['publicAssetPath'] == 'app/public' + resource['url']
        assert qa[gid]['canonicalAssetPath'] == 'curricula/DE/Gymnasium/visualizations/' + resource['url'].split('/assets/goal-visualizations/', 1)[1]
        ids.append(gid)
        selected.append({'family': name, 'goalId': gid, 'originalReview': review_ref,
            'originalInput': captured[review_dir + seal_name], 'wholeGoalInput': candidate_ref,
            'ownerSource': row['ownerSource'], 'reviewedAsset': asset,
            'nativeSize': native_size, 'chromium360680': widths, 'nativePage': page_capture,
            'originalPdf': pdf_ref, 'originalBookModel': model_ref,
            'context': {'landscapeId': OWNER, 'goalId': gid, 'subject': 'biologie',
                **{k: old[k] for k in ['title','description','titleEn','descriptionEn']},
                'demandLevel': old['dimensionTags']['demandLevel'], 'assetSha256': 'sha256:' + asset['sha256']},
            'originalReviewer': review['actualAgent'], 'originalRecordedAt': review['recordedAt'],
            'originalDecision': verdict['machineCandidateDecision'],
            'originalReason': verdict['substantiveActualObservationsDe'],
            'originalFullRasterReviewBasis': verdict.get('fullRasterReviewBasis', 'actual full original; original actualReadCounts fullSelectedRaster=20'),
            'originalNativePageObservation': verdict['nativePageObservation'],
            'currentWholeGoalEqualsOriginalCandidate': True,
            'currentAssetBindings': current_hashes})
    assert len(ids) == expected_count
    followup_path = review_dir + ('completed-native-D18-P18-V18.independent-a.final.freeze.json'
        if name == 'he17' else 'completed-native-D20-P20.independent-a.final.freeze.json')
    followup = read(followup_path)
    families.append({'family': name, 'censusFamily': family, 'selectedCount': len(ids), 'goalIds': ids,
        'review': review_ref, 'reviewSeal': captured[review_dir + seal_name], 'authorSeal': author_ref,
        'wholeGoalInput': candidate_ref, 'bookModel': model_ref,
        'actualReadCounts': review['actualReadCounts'], 'originalReviewer': review['actualAgent'],
        'originalRecordedAt': review['recordedAt'], 'reviewArtifactKind': review['artifactKind'],
        'separateOriginalDPFollowup': {'artifact': captured[followup_path],
            'reportedStatements': {k: v for k, v in followup.items() if k in [
                'D20NativeCheck', 'P20InactiveNativeSchemaAndSemantics', 'ordinaryP20PublicCli',
                'V20ActualRasterPageVerdict', 'D18NativeCampaignResults',
                'P18NativeClosedSchemaAndSemantics', 'ordinaryPublicP18CLI', 'V18']}}})

# Flora's nine retained full-original sightings and one corrected historical HOLD.
flora_dir = specs[1][3]
resolution_path = flora_dir + 'ordinal1-first-image-HOLD-targeted-resolution.independent-a.actual.json'
flora_seal = read(flora_dir + specs[1][4])
bound(one(flora_seal['frozenFiles'], 'path', resolution_path))
resolution = read(resolution_path)
first_seal = read(resolution['originalFirstSeal']['path'], resolution['originalFirstSeal']['sha256'])
portable = read(resolution['originalPortableFollowupSeal']['path'], resolution['originalPortableFollowupSeal']['sha256'])
prior_ref = [r for r in portable['frozenOutputs'] if r['path'].endswith('first-ten-original-raster.independent-a.verdicts.json')]
assert len(prior_ref) == 1
prior_ref = prior_ref[0]
prior = read(prior_ref['path'], prior_ref['sha256'])
retained = [r for r in selected if r['family'] == 'flora19' and r['originalFullRasterReviewBasis'].startswith('retained')]
assert len(retained) == 9
for row in retained:
    original = one(prior['reviews'], 'goalId', row['goalId'])
    assert original['decisionForOriginalRasterOnly'] == 'KEEP'
    assert original['actualOriginalImage'] == row['reviewedAsset']
    assert prior['reviewer'] == row['originalReviewer']
    assert datetime.datetime.fromisoformat(prior['recordedAt']) < datetime.datetime.fromisoformat(row['originalRecordedAt'])
    row['retainedOriginalRasterDecision'] = {'review': prior_ref,
        'reviewer': prior['reviewer'], 'recordedAt': prior['recordedAt'],
        'decision': original['decisionForOriginalRasterOnly'], 'originalMobileNativeStillPending': True,
        'laterActualMobileNativeDecision': row['originalReview']}
held = one(prior['reviews'], 'goalId', '5f39afac-897c-5ed3-95b5-89ccf66b2532')
assert held['decisionForOriginalRasterOnly'] == 'HOLD' and resolution['historicalHoldUnchanged'] is True
bound(held['actualOriginalImage'])

assert len(selected) == len({r['goalId'] for r in selected}) == 56
assert len(excluded) == 2
for path in [
    'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
    'contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json',
    'app/scripts/goalVisualizationReviewedContext.ts', 'app/scripts/lib/qualifiedVisualizationContextAuthority.ts',
    'app/scripts/lib/goalVisualizationEconomicsQ3Contexts.ts', 'app/scripts/lib/goalVisualizationEconomicsQ2MonetarySocialContexts.ts',
    'contracts/goal-visualization-context/v1/qualification.schema.json',
]:
    pin(path)
result = {'kind': 'private-finite-biology-original-content-reuse-analysis-not-qualification',
    'analyzedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reportedWorkspaceHeadNotGitReverified': '96b770b2', 'historicalCensusOriginalCommitNotGitReauthenticated': OLD_COMMIT,
    'currentBindings': {p: captured[p] for p in [SOURCE, QA]},
    'families': families, 'selectedRows': selected, 'excludedRows': excluded,
    'floraPriorReview': prior_ref, 'floraHistoricalHoldResolution': captured[resolution_path],
    'readAndHashedArtifacts': list(captured.values()),
    'verifiedFacts': {'selectedOriginalRows': 56, 'exactWholeCurrentGoalObjects': 56,
        'exactCurrentPrimaryAssets': 112, 'actualHistoricChromiumWidths': 112,
        'historicNativePageCaptures': 56, 'floraRetainedPriorOriginalSightings': 9},
    'boundaries': {'activeWrites': 0, 'gitCommands': 0, 'nativeQualificationRuns': 0,
        'sourceAProbes': 0, 'newVisualReviews': 0, 'nativeReceiptsIssued': 0,
        'newHumanApproval': False, 'currentNativePageAcceptance': False,
        'ciOrMaturityPass': False,
        'authenticationStillRequired': 'Existing raw-object authenticated evidence reader must authenticate originalCommit/path/OID before future qualification; this read-only analysis checks working-copy bytes and original embedded seals only.'}}
target = OUT / 'analysis.json'
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'output': str(target.relative_to(ROOT)), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
    'bytes': target.stat().st_size, 'families': {f['family']: f['selectedCount'] for f in families},
    'verifiedFacts': result['verifiedFacts'], 'readAndHashedArtifacts': len(captured)}, ensure_ascii=False))
