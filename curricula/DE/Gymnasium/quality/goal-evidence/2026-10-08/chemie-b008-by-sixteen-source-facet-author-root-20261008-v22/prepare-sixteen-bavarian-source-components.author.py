# SPDX-License-Identifier: Apache-2.0
"""Bind genuine BY partial components; do not approve or change active data."""
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re
import sys

from bs4 import BeautifulSoup

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
PREVIOUS = OWN.parent / 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21'
V12 = OWN.parent.parent / '2026-10-07/chemie-b008-current169-routing-placement-author-v12'
CACHE = ROOT / 'tmp/chemie-b008-by-sixteen-primary-root-20261008-v1'
assert not (OWN / 'author.first.freeze.json').exists()

def read(p):
    return json.loads(p.read_text())

def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, data):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

def compact(text):
    return re.sub(r'\s+', '', text)

for b in read(PREVIOUS / 'author.final.freeze.json')['payloads']:
    assert bind(ROOT / b['path']) == b
inventory = read(V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json')
routes = inventory['originalUnresolvedFacetDutyRoutes']
assert len(routes) == 16
routine_ids = read(V12 / 'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
candidate_path = PREVIOUS / 'candidate/canonical.current504-sl-source-metadata.author-candidate.json'
candidate = {g['id']: g for g in read(candidate_path)['goals']}
active_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
active = {g['id']: g for g in read(active_path)['goals']}
active_before = bind(active_path)
registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry_before = bind(registry_path)

primary_readings = []
sections = {}
for receipt in read(CACHE / 'actual-http-primary-receipts.json'):
    html_path = ROOT / receipt['actualLocalHtml']
    data = html_path.read_bytes()
    assert hashlib.sha256(data).hexdigest() == receipt['sha256']
    soup = BeautifulSoup(data, 'html.parser')
    header = next(h for h in soup.find_all('h2') if 'Lernbereich 1:' in h.get_text())
    section = header.parent.parent
    assert section.name == 'section'
    sections[receipt['key']] = section.get_text(' ', strip=True)
    h1 = soup.find('h1').get_text(' ', strip=True)
    if receipt['key'] == 'C11-NTG':
        assert '(NTG)' in h1
    else:
        assert 'Praktikum' in h1 and '12/13' in h1
        assert 'mindestens drei' in soup.get_text(' ', strip=True)
    primary_readings.append({
        **{k: receipt[k] for k in ['key', 'requestedUrl', 'effectiveUrl', 'status', 'fetchedAt', 'sha256', 'bytes']},
        'wholeActualPageHeading': h1,
        'wholeLernbereich1ActuallyRead': True,
        'wholeSectionTextSha256': hashlib.sha256(sections[receipt['key']].encode()).hexdigest(),
        'fullPrimaryHtmlRetainedOnlyInLocalScratch': True,
        'portableReviewRoute': receipt['effectiveUrl'],
        'primaryReceiptIsNotSourceApproval': True,
    })
primary_binding = write('three-current-official-whole-LB1.actual-reading-receipts.json', {
    'role': 'Actual author reading of three whole primary sections and source-specific scope notices',
    'readings': primary_readings,
    'C11IsNTGNotEverySchoolTrack': True,
    'BcPIsDistinctPracticalCourseNotAutomaticChemistryGKOrLK': True,
    'BcPSourceHasChoiceOfAtLeastThreePracticalBranches': True,
    'BcP12And13SeparateSourceIdentitiesRetained': True,
    'humanApproval': False,
})

selections = {
    ('BcP12.1.2', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61'): ['upper-theory-based-question-hypothesis', 'upper-hypothesis-investigation'],
    ('BcP13.1.2', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61'): ['upper-theory-based-question-hypothesis', 'upper-hypothesis-investigation'],
    ('BcP12.1.3', '49b13b33-34b7-5e4e-861c-b21082cb9922'): ['data-validity'],
    ('BcP13.1.3', '49b13b33-34b7-5e4e-861c-b21082cb9922'): ['data-validity'],
    ('BcP12.1.6', '1df17884-96ae-57d7-9da9-dbebd082596f'): ['criteria-decision'],
    ('BcP13.1.6', '1df17884-96ae-57d7-9da9-dbebd082596f'): ['criteria-decision'],
    ('C11.1.2', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61'): ['upper-hypothesis-investigation'],
    ('C11.1.3', '277a3c20-6082-5a95-be08-c1e386efe79b'): ['upper-model-use-criticism'],
    ('C11.1.3', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61'): ['upper-theory-based-question-hypothesis', 'upper-hypothesis-investigation'],
    ('C11.1.4', '49b13b33-34b7-5e4e-861c-b21082cb9922'): ['data-validity'],
    ('C11.1.5', '49b13b33-34b7-5e4e-861c-b21082cb9922'): ['upper-quantitative-hypothesis-data-evaluation'],
    ('C11.1.6', '277a3c20-6082-5a95-be08-c1e386efe79b'): ['upper-model-use-criticism'],
    ('C11.1.8', 'b6327e98-8ab9-5d7f-b826-4023bc1a56a7'): ['chemical-representation-transformation'],
    ('C11.1.9', 'b6327e98-8ab9-5d7f-b826-4023bc1a56a7'): ['upper-source-information', 'upper-source-criticism'],
    ('C11.1.10', '1df17884-96ae-57d7-9da9-dbebd082596f'): ['criteria-decision'],
    ('C11.1.11', 'b3c9c4b8-5575-5200-86cf-26c14ebcc3d8'): ['upper-knowledge-influences'],
}
assert len(selections) == 16
notes = {
    'upper-hypothesis-investigation': 'Planning and/or genuine safety-compliant qualitative/quantitative performance contributes to this routine. The original named analytical methods, actual performance and substance-specific scope remain obligations; no written case certifies performed work.',
    'upper-theory-based-question-hypothesis': 'Explicit theory-based hypothesis and investigation planning. Predicting and discriminating counterevidence is interpreted within the complete source inquiry context, not fabricated as a separate literal bullet.',
    'data-validity': 'Explicit validity and causes of measurement/procedure error. BcP also requires actual design optimization; data-validity alone does not complete that entire operator.',
    'criteria-decision': 'Explicit scientific, ethical/social/ecological/economic or decision-strategy components. Source-specific products, biological preparations and reflected real decisions remain distinct whole duties.',
    'upper-model-use-criticism': 'Explicit model/simulation use; C11.1.6 includes complex molecule geometries and drug-receptor/substrate-enzyme contexts. Source contents also discuss model limits. This is not proof of every canonical model domain, especially equilibrium and periodicity, nor new P-case coverage.',
    'upper-quantitative-hypothesis-data-evaluation': 'Explicit spreadsheet processing, trends and support/falsification of hypotheses. It does not alone prove all mathematical methods, every quantitative context or full cross-disciplinary inference.',
    'chemical-representation-transformation': 'Explicit audience/situation-appropriate transformations in chemistry/pharmacy. All factual representation content remains required.',
    'upper-source-information': 'Self-obtained analogue/digital sources provide a bounded reception component; complex interpretation, citation and all-domain coverage are not asserted from one suitability bullet.',
    'upper-source-criticism': 'Explicit source suitability judgment; full source contents include source selection and opinion-influence risks. Author/intention/validity interpretation remains partial until independently reviewed.',
    'upper-knowledge-influences': 'Explicit social/cultural/technological/ecological/economic influences on development of scientific knowledge. The entire contextual source obligation remains retained.',
}
loaded = {}
rows = []
partners = {}
for route in routes:
    extraction_path = ROOT / route['sourceExtractionPath']
    mapping_path = ROOT / route['mappingPath']
    if str(extraction_path) not in loaded:
        extraction = read(extraction_path)
        loaded[str(extraction_path)] = ({g['id']: g for g in extraction['sourceGoals']}, {p['id']: p for p in extraction['passages']})
    source_by_id, passage_by_id = loaded[str(extraction_path)]
    source = source_by_id[route['sourceGoalId']]
    passage = passage_by_id[source['passageId']]
    assert source['sourceText'] == route['actualWholeSourceText']
    primary_key = 'C11-NTG' if source['sourceSpan'].startswith('C11.') else source['sourceSpan'].split('.')[0]
    assert compact(source['sourceText']) in compact(sections[primary_key]), source['sourceSpan']
    mapping = read(mapping_path)
    decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == source['id'])
    assert route['familyGoalId'] in decision['canonicalGoalIds']
    for goal_id in decision['canonicalGoalIds']:
        assert goal_id in active
        partners[goal_id] = active[goal_id]
    original_edges = [m for m in mapping['mappings'] if m['legacyGoalId'] == source['id']]
    selected = selections[(source['sourceSpan'], route['familyGoalId'])]
    proposals = [{
        'candidateKey': key,
        'canonicalGoalId': routine_ids[key],
        'wholeExistingInactiveRoutine': candidate[routine_ids[key]],
        'matchType': 'partial',
        'operatorAndWholeDutyBoundary': notes[key],
        'sourceApproval': 'pending_two_independent_source_reviews',
        'ordinaryAtlasDecisionProjection': 'pending_whole_decision_and_all_partner_review',
    } for key in selected]
    rows.append({
        'originalUnresolvedRoute': route,
        'wholeCurrentSourceGoal': source,
        'wholeCurrentPassage': passage,
        'wholeOriginalDecision': decision,
        'wholeOriginalCompatibleEdges': original_edges,
        'currentExtractionBinding': bind(extraction_path),
        'currentMappingBinding': bind(mapping_path),
        'actualPrimaryReadingReceipt': primary_readings[['C11-NTG', 'BcP12', 'BcP13'].index(primary_key)],
        'sourceSpecificScope': {'jurisdiction': 'DE-BY', 'stage': 'SekII', 'track': 'NTG' if primary_key == 'C11-NTG' else 'separate Biologisch-chemisches Praktikum', 'courseProfile': 'unresolved; never infer GK/LK from unspecified or repeated text'},
        'proposedBoundedComponents': proposals,
        'originalAllPartnerCoverageRemainsUnapproved': True,
        'originalWholeDutyDeleted': False,
        'originalWholeDutyComplete': False,
    })
assert len(rows) == 16 and len({r['wholeCurrentSourceGoal']['id'] for r in rows}) == 15
component_count = sum(len(r['proposedBoundedComponents']) for r in rows)
packet_binding = write('sixteen-original-BY-routes-and-bounded-current-components.author.json', {
    'schemaVersion': '1', 'role': 'Candidate only: recover missing specific source routes without whole-duty or generic school-track claims',
    'rows': rows, 'originalFamilyRoutes': 16, 'uniqueWholeSourceGoals': 15,
    'partialComponents': component_count, 'originalNationalSourceDutiesRetained': 1646,
    'wholeSourceClosure': False, 'newPReviews': 0, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
partner_binding = write('actual-current-whole-source-partners.not-coverage-approval.json', {
    'schemaVersion': '1', 'role': 'All whole current canonical partner bodies retained for independent review, no automatic source coverage',
    'wholePartners': list(partners.values()), 'uniqueWholePartners': len(partners),
    'allOriginalDecisionAndCompatibleEdgesRetained': True,
})
entry = write('neutral-sixteen-BY-source-components.author.entry.json', {
    'schemaVersion': '1', 'role': 'Bounded current BY source-facet author candidate, independent review pending',
    'createdAt': datetime.now(timezone.utc).isoformat(), 'previousFirstSeal': bind(PREVIOUS / 'author.final.freeze.json'),
    'previousWholeCurrent504Candidate': bind(candidate_path),
    'actualOfficialWholePrimaryReadings': primary_binding, 'actualSixteenRoutesAndComponents': packet_binding,
    'actualWholeCurrentPartners': partner_binding,
    'primaryUrls': [r['effectiveUrl'] for r in primary_readings],
    'C11NTGTrackBoundaryPreserved': True, 'BcPSeparatePracticalCourseBoundaryPreserved': True,
    'ordinaryViewAndApplicabilityWrites': 0, 'ordinaryCompilerReductionClaimed': 0,
    'allCurrent177StrictGoalsUnchanged': True, 'activeWrites': 0, 'strictGain': 0,
    'sourceReviewStatus': 'ai_candidate_pending_two_independent_reviews', 'humanApproval': False,
})
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import validate_file
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
checked = []
for p in sorted(OWN.rglob('*.json')):
    assert validate_file(str(p), schema), str(p)
    checked.append(bind(p))
assert bind(active_path) == active_before and bind(registry_path) == registry_before
write('normal-targeted-schema-and-active-exact-guards.actual.json', {
    'role': 'Executed ordinary schema checks and exact active input guards; no scientific approval',
    'checkedFiles': checked, 'normalSchemasPassed': len(checked),
    'currentActiveCanonical': active_before, 'currentActiveRegistry': registry_before,
    'wholeCandidateRutinesPreserved': True, 'strictGain': 0, 'humanApproval': False,
})
payloads = [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('author.first.freeze.json', {'schemaVersion': '1', 'role': 'Immutable first author candidate seal; not independent approval', 'payloads': payloads, 'humanApproval': False})
print(json.dumps({'rows': 16, 'uniqueWholeSources': 15, 'partialComponents': component_count, 'wholePartners': len(partners), 'normalChecks': len(checked), 'entry': entry, 'activeWrites': 0, 'strictGain': 0}, ensure_ascii=False))
