"""Create only inert exact BW paragraph-page and proven V2 URL candidates.

No native book build, source coverage decision, review record, or active write.
"""
from pathlib import Path
import copy
import datetime
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
SOURCE_ID = 'bw-chem-seki-3-2-1-2-b03-a01-1f9ce38a'
BEFORE_REF = 'Bildungsplan 2016 Gymnasium Chemie Baden-Wuerttemberg, 3.2.1.2 (3), S. 15.'
AFTER_REF = BEFORE_REF.replace('S. 15.', 'S. 16.')
V2_URL = 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
ROLE = 'Codex direct author preparation; targeted BW locator and actual identical-source URL correction; not independent scientific review'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def write(name, value):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return path

inputs = []
def bind(path):
    path = Path(path)
    data = path.read_bytes()
    row = {'path': str(path.relative_to(ROOT)), 'sha256': digest(data), 'bytes': len(data)}
    if row not in inputs:
        inputs.append(row)
    return row

def read(relative):
    path = ROOT / relative
    bind(path)
    return json.loads(path.read_text())

def preserve(relative, destination):
    src = ROOT / relative
    bind(src)
    dst = OWN / destination
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(src.read_bytes())

def deltas(before, after, pointer=''):
    if type(before) is not type(after):
        return [{'pointer': pointer, 'before': before, 'after': after}]
    if isinstance(before, dict):
        assert before.keys() == after.keys(), pointer
        return sum((deltas(before[k], after[k], pointer + '/' + k) for k in before), [])
    if isinstance(before, list):
        assert len(before) == len(after), pointer
        return sum((deltas(a, b, pointer + '/' + str(i)) for i, (a, b) in enumerate(zip(before, after))), [])
    return [] if before == after else [{'pointer': pointer, 'before': before, 'after': after}]

live = json.loads((OWN / 'sources/current-official-v2-url-access.actual.json').read_text())
assert live['sameBytesAsRetainedV2PDF'] is True
assert live['sha256'] == '3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62'
assert live['finalUrl'] == V2_URL
pdf_path = 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf'
bind(ROOT / pdf_path)
assert (ROOT / pdf_path).read_bytes() == (OWN / 'sources/BW-official-live-v2.actual.pdf').read_bytes()
info = subprocess.run(['pdfinfo', str(OWN / 'sources/BW-official-live-v2.actual.pdf')], check=True, capture_output=True, text=True).stdout
assert 'Pages:           52' in info
(OWN / 'sources/BW-live-v2.pdfinfo.actual.txt').write_text(info)

all_deltas = []
source_candidates = []
lower_path = 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json'
upper_path = 'curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json'
for relative, lane in [(lower_path, 'SekI'), (upper_path, 'SekII-URL-only')]:
    before = read(relative)
    preserve(relative, f'inputs-original/BW-{lane}.source-extraction.original.json')
    after = copy.deepcopy(before)
    after['sourceDocument']['url'] = V2_URL
    if lane == 'SekI':
        record = next(g for g in after['sourceGoals'] if g['id'] == SOURCE_ID)
        assert record['sourceRef'] == BEFORE_REF
        record['sourceRef'] = AFTER_REF
    changes = deltas(before, after)
    assert len(changes) == (2 if lane == 'SekI' else 1)
    candidate = f'raw-candidates/BW-{lane}.source-extraction.author-candidate.json'
    write(candidate, after)
    all_deltas.append({'baselineInput': relative, 'candidate': candidate, 'lane': lane, 'changes': changes})
    source_candidates.append({'lane': lane, 'sourceGoalCount': len(before['sourceGoals']), 'passagesWholeExactlyUnchanged': before['passages'] == after['passages'], 'changedSourceGoalIds': [SOURCE_ID] if lane == 'SekI' else [], 'sourceDocumentOnlyURLChanged': {**before['sourceDocument'], 'url': V2_URL} == after['sourceDocument'], 'sourceTextsOperatorsSpansStageCourseAndIDsExactlyUnchanged': all({**a, 'sourceRef': b['sourceRef']} == b for a, b in zip(before['sourceGoals'], after['sourceGoals']))})

v4 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-one-inherited-prerequisite-targeted-author-v4/qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.one-inherited-prerequisite.author-candidate.json'
active = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical_rows = []
affected = []
for relative, lane in [(v4, 'B007-v4-base'), (active, 'current-active-base-alternative')]:
    before = read(relative)
    preserve(relative, f'inputs-original/chemie-{lane}.canonical.original.json')
    after = copy.deepcopy(before)
    changed = []
    for goal in after['goals']:
        provenance = goal.get('extendedData', {}).get('provenance', {})
        if provenance.get('sourceGoalId') == SOURCE_ID:
            assert provenance['sourceRef'] == BEFORE_REF
            provenance['sourceRef'] = AFTER_REF
            changed.append(goal['id'])
    changes = deltas(before, after)
    assert len(changed) == len(changes) == 5
    assert all(r['pointer'].endswith('/extendedData/provenance/sourceRef') for r in changes)
    candidate = f'raw-candidates/chemie-{lane}.canonical.author-candidate.json'
    write(candidate, after)
    all_deltas.append({'baselineInput': relative, 'candidate': candidate, 'lane': lane, 'changes': changes})
    canonical_rows.append({'lane': lane, 'wholeGoalCount': len(before['goals']), 'changedGoalIds': changed, 'wholeGoalExactCount': len(before['goals']) - 5, 'onlySourceRefChangedForFiveGoals': True, 'allGoalTextsTranslationsRequiresContainsCourseTagsResourceLinksAndVisualBindingsExactlyUnchanged': True})
    if lane == 'B007-v4-base':
        for a, b in zip(before['goals'], after['goals']):
            if a['id'] in changed:
                affected.append({'goalId': a['id'], 'title': a['title'], 'beforeWholeGoal': a, 'afterWholeGoal': b})

mapping_inputs = []
mapping_rows = []
mapping_decisions = []
for filename in ['bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json', 'bw_chemistry_lower_secondary_to_canonical_chemistry.json']:
    relative = 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/' + filename
    data = read(relative)
    preserve(relative, 'inputs-original/' + filename)
    rows = [{'pointer': f'/mappings/{i}', 'wholeUnchangedRow': row} for i, row in enumerate(data['mappings']) if row['legacyGoalId'] == SOURCE_ID]
    assert len(rows) == 3
    mapping_inputs.append({'path': relative, 'threeExactRows': rows, 'candidateMappingWrites': 0})
    if 'decisions' in data:
        mapping_rows = rows
        mapping_decisions = [r for r in data['decisions'] if r.get('sourceGoalId') == SOURCE_ID]

v1_relative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-three-safety-solutions-source-boundary-author-v1/three-current-goals-and-source-inputs.actual.json'
v1 = read(v1_relative)
matched = v1['currentSourceBindingRows']
assert len(matched) == 413
assert len({row['sourceGoalId'] for row in matched}) == 403
original_three = v1['originalGoalIds']
protected_relative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-one-inherited-prerequisite-targeted-author-v4/one-containing-edge-and-all112-effective-bindings.author-candidate.actual.json'
protected_data = read(protected_relative)
protected_ids = {r['goalId'] for r in protected_data['protectedBindings']}
protected_changed = sorted(protected_ids.intersection({r['goalId'] for r in affected}))
assert len(protected_ids) == 112 and len(protected_changed) == 4

placements_relative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-preparation-author-v3/seven-source-placement-intents-and-national-holds.author-candidate.json'
placements = read(placements_relative)
views_relative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-preparation-author-v3/actual-affected-existing-source-view-reference-and-placement-holds.json'
views = read(views_relative)
assert len(views['affectedViews']) == 40
source_view_binding = next(v for v in views['affectedViews'] if v['scope']['jurisdiction'] == 'DE-BW' and v['scope']['stage'] == 'SekI')
for row in [views['sourceManifestBinding'], source_view_binding['sourceViewBinding']]:
    bind(ROOT / row['path'])
    assert digest((ROOT / row['path']).read_bytes()) == row['sha256']
ledger_relative = 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'
ledger = read(ledger_relative)
batch_configs = [r for r in ledger['activeBatchConfigPaths'] if 'batch-007-' in r]
assert len(batch_configs) == 1
preserve(ledger_relative, 'inputs-original/in-flight-work-ledger.original.json')
batch = read(batch_configs[0])
assert set(batch['goalIds']) == set(original_three)
preserve(batch_configs[0], 'inputs-original/B007-current-three.config.original.json')

raster_bindings = []
for row in affected:
    for link in row['beforeWholeGoal'].get('resourceLinks', []):
        if link.get('resourceType') == 'image' and link['url'].startswith('/assets/'):
            candidates = [ROOT / 'app/public' / link['url'].lstrip('/'), ROOT / 'backend/src/main/resources/static' / link['url'].lstrip('/')]
            records = [bind(p) for p in candidates if p.is_file()]
            assert len(records) == 2
            assert records[0]['sha256'] == records[1]['sha256']
            raster_bindings.append({'goalId': row['goalId'], 'unchangedResourceLink': link, 'actualExistingRasterCopies': records, 'newImageOrScienceReview': False})

historical_freezes = []
for lane in ['chemie-b007-three-safety-solutions-source-boundary-author-v1', 'chemie-b007-seven-routines-four-material-corrections-author-v2', 'chemie-b007-seven-native-source-preparation-author-v3', 'chemie-b007-one-inherited-prerequisite-targeted-author-v4']:
    for path in sorted((BASE / lane).glob('*.freeze.json')):
        historical_freezes.append(bind(path))

write('exact-before-after-fields.raw-author-candidate.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'role': ROLE, 'sourceGoalId': SOURCE_ID, 'actualHeadingLocatorRetained': {'physicalPDFPage1Based': 17, 'printedPage': 15, 'section': '3.2.1.2'}, 'actualParagraphLocator': {'physicalPDFPage1Based': 18, 'zeroBasedRasterPageIndex': 17, 'printedPage': 16, 'paragraph': '3.2.1.2 (3)'}, 'fieldGroups': all_deltas, 'canonicalAlternativeIsNotMergedWithV4': True})
write('actual-target-source-binding-reach-and-preserved-holds.author-candidate.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'role': ROLE, 'actualSourceScope': {'jurisdiction': 'DE-BW', 'schoolForm': 'Gymnasium', 'stage': 'SekI', 'gradesAsPrinted': '8/9/10', 'courseLevel': 'unspecified'}, 'originalInFlightB007GoalIds': original_three, 'threeMappedTargetsAreNotThreeSourceParagraphs': mapping_inputs, 'originalMappingDecisionsRemainExactHistoricalStatus': mapping_decisions, 'sourceCandidates': source_candidates, 'canonicalCandidates': canonical_rows, 'fiveAffectedCanonicalWholeBeforeAfter': affected, 'protected112AgainstOwnV4Base': {'wholeExact': 108, 'fourOnlySourceRefChangedGoalIds': protected_changed, 'all112DidacticTextGraphResourceLinkDataExactAgainstV4': True, 'priorV4PrerequisiteProposalsRetainedAndNotReapproved': True}, 'existingActualRasterBindings': raster_bindings, 'paragraphReachParaphrased': ['Model-based description of states of matter, dissolution, diffusion and Brownian motion, in the printed classes8/9/10 section.', 'The paragraph does not itself prescribe quantitative saturation, concentration, mass fractions, volume fractions, every solvent/substance preparation case, or the complete seven new routines.'], 'remainingHolds': {'nationalSourceObligations': 403, 'originalMatchedRows': 413, 'historicalRowAndDecisionStatusesNotReapproved': True, 'affectedExistingSourceViews': 40, 'existingBWViewTwoCPV009AndFacetSelectionHold': source_view_binding, 'sevenHESourcePlacementIntentsRetainedNotBWInferred': placements['placements'], 'niQualitativeOnlyHold': placements['niQualitativeWitnessRetainedAsSeparateHold'], 'quantitativeHEFacetFacultativeRemains': True, 'sourceOperatorChildAndLandesscopeDecisions': 'HOLD; precise citation and version routing do not decide component mappings or blanket child expansion.', 'unprotectedDirectPrerequisiteConsumers': protected_data['remainingUnprotectedDirectBroadConsumers'], 'twoNewIndependentSourceAudits': 'PENDING on these exact new candidates and official page rasters', 'gateRebindingOrBookRebuild': 'Not performed; Root must determine actual current integration bindings separately.'}, 'sourceHoldsCleared': 0, 'strictCompletionsAdded': 0, 'nationalSupersetApproval': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'newBuildsOrGlobalRuns': 0})
write('actual-primary-source-paragraph-and-version-evidence.author.json', {'schemaVersion': 1, 'role': ROLE, 'actualRetainedAndDownloadedV2PDF': {'retainedInput': pdf_path, 'actualOfficialVersion': '25. März 2022', 'actualPages': 52, 'sha256': live['sha256'], 'bytes': live['bytes'], 'officialIndexURL': live['discoveredOnOfficialV2Page'], 'officialPDFURL': V2_URL, 'actualByteEquality': True, 'actualParagraphAndFooterRastersDirectlyVisuallyRead': ['sources/BW-physical-page-017.actual.png', 'sources/BW-physical-page-018.actual.png', 'sources/BW-live-v2-physical-page-018.actual.png'], 'targetPageTextsExactlyEqual': True}, 'previousURLActuallyDownloadsDifferentHistorical2016Version': json.loads((OWN / 'sources/official-url-access.actual.json').read_text()), 'headingVsParagraphDecision': 'Keep passage.page15 as section heading; change only exact paragraph(3) sourceRef to printed16. The corresponding physical page is18.', 'originalPDFRights': 'Official third-party curriculum and its page rasters retain original rights; no new license or distribution clearance claimed.', 'browserOpenOriginalURLAttempt': 'web.open returned inaccessible; actual direct urllib download succeeded HTTP200. Official V2 web page and PDF were then directly read; no browser byte-equality claim.'})
write('raw-source-review-input.author-candidate.json', {'schemaVersion': 1, 'role': ROLE, 'independentReviewsCompletedForThisNewCandidate': 0, 'requiredIndependentSourceReviewers': 2, 'primaryEvidence': 'actual-primary-source-paragraph-and-version-evidence.author.json', 'rawChanges': 'exact-before-after-fields.raw-author-candidate.json', 'reachAndUnresolvedHolds': 'actual-target-source-binding-reach-and-preserved-holds.author-candidate.json', 'rawSourceCandidates': [g['candidate'] for g in all_deltas if 'source-extraction' in g['candidate']], 'primaryB007CanonicalCandidate': 'raw-candidates/chemie-B007-v4-base.canonical.author-candidate.json', 'alternativeCurrentActiveBaseMetadataOnlyCandidate': 'raw-candidates/chemie-current-active-base-alternative.canonical.author-candidate.json', 'alternativeUseRule': 'Separate baselines; never overwrite current canonical with old B007v4 material proposals. Integrator applies reviewed exact field changes to intended current base with before-value preconditions.', 'peerNewVerdictsIncluded': False, 'sourceScienceAndCoverageApproval': False, 'status': 'ai_candidate / candidate; pending two independent source reviews'})

for row in inputs:
    path = ROOT / row['path']
    assert digest(path.read_bytes()) == row['sha256'], 'Concurrent input changed: ' + row['path']
write('actual-input-and-no-write-binding-guard.author.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'role': ROLE, 'boundInputs': inputs, 'historicalAuthorFreezes': historical_freezes, 'allBoundInputsExactlyRecheckedAtEnd': True, 'activeWrites': 0, 'historicalWrites': 0, 'writesRestrictedToOwnDirectory': str(OWN.relative_to(ROOT)), 'newNativeOrGlobalBuilds': 0, 'nativeValidatorsModified': False, 'sourceGoalStableIDAndParagraphTextUnchanged': True, 'canonicalOnlySourceRefChanges': True, 'checks': ['download actual V2 bytes equal retained official snapshot', 'actual PDF52pages and physical17/18 raster reading', 'source JSON recursively exact except approved sourceRef and sourceDocument.url', 'canonical JSON recursively exact except five sourceRef values', 'three mapping rows and all statuses exact; original413rows/403sourceIDs retained', 'original B007 ledger/config exact', 'four existing frontend/backend raster pairs equal and unchanged', 'historical input hash recheck'], 'status': 'PASS targeted author preservation checks; no scientific gate approval'})
print(json.dumps({'ownDirectory': str(OWN.relative_to(ROOT)), 'inputBindings': len(inputs), 'fieldChanges': sum(len(g['changes']) for g in all_deltas), 'primaryB007CanonicalSourceRefChanges': 5, 'mappedSourceBindings': 3, 'changedSourceRecords': 1, 'lowerSourceFieldChanges': 2, 'separateUpperURLOnlyFieldChanges': 1, 'candidateAlternativeActiveFieldChanges': 5, 'sourceHoldsCleared': 0, 'activeWrites': 0}, ensure_ascii=False))
