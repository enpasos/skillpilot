#!/usr/bin/env python3
"""Isolated author candidate; ordinary authoritative mapping edges only.

Writes this new packet only. No active canonical, ledger, QA or atlas writes.
"""
import copy
import hashlib
import json
from pathlib import Path
import shutil
import uuid

REPO = Path('/home/enpasos/projects/skillpilot')
PACK = Path(__file__).resolve().parent
ROLE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-first-three-regional-source-remediation-author-20261008-v1'
TARGETS = ['32f47903-0788-5c27-ac88-7464f481f2f7', '135447a0-5d55-564a-afc3-3e3fbed77819', 'ec782ce3-475e-5628-b3fe-947d72e74a74']
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'

def load(path):
    return json.loads(Path(path).read_text())

def rel(path):
    return str(Path(path).relative_to(REPO))

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': rel(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def put(name, value):
    path = PACK / name
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), f'Author input/output already exists: {path}'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

def exact_copy(source, name):
    destination = PACK / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    assert not destination.exists(), f'Frozen input already exists: {destination}'
    shutil.copyfile(source, destination)
    assert source.read_bytes() == destination.read_bytes()
    return binding(destination)

canonical = load(REPO / CANON)
by_id = {g['id']: g for g in canonical['goals']}
assert len(by_id) == 476
kinds = load(REPO / KINDS)
assert kinds['counts']['curricularAtomic'] == 392
atlas = load(REPO / ATLAS)
roles = load(ROLE / 'source/three-targets-twenty-whole-source-duties-twenty-five-bounded-roles.author-candidate.json')
assert len(roles['rows']) == 20
guards = []
for original, name in [(CANON, 'canonical.current476.after19.exact.json'), (KINDS, 'semantic-kinds.current476.exact.json'), (QA, 'visualization-QA.current.exact.json'), (ATLAS, 'atlas-current.inputs.exact.json')]:
    guards.append({'original': binding(REPO / original), 'portableExactInput': exact_copy(REPO / original, 'input/' + name)})

# Preserve every current selected whole duty/decision and every actual partner
# body, including the genuinely integrated19 image links rather than old476.
whole = []
partners = []
selected_by_mapping = {}
for row in roles['rows']:
    mapping_path, source_id = row['sourceKey'].split('#', 1)
    # HE's selected mapping changed during the real19 integration. Locate the
    # actual current extraction edge by stable source ID, never use the old copy.
    matching = []
    for selected_path in atlas['mappingPaths']:
        mapping = load(REPO / selected_path)
        decisions = [d for d in mapping['decisions'] if d['sourceGoalId'] == source_id]
        if decisions:
            matching.append((selected_path, mapping, decisions[0]))
    assert len(matching) == 1, (source_id, len(matching))
    mapping_path, mapping, decision = matching[0]
    extraction = load(REPO / mapping['sourceExtractionPath'])
    source_goal = next(g for g in extraction['sourceGoals'] if g['id'] == source_id)
    partner_rows = [m for m in mapping['mappings'] if m['legacyGoalId'] == source_id]
    assert sorted(m['canonicalGoalId'] for m in partner_rows) == sorted(decision['canonicalGoalIds'])
    whole.append({'sourceOrdinal': row['sourceOrdinal'], 'mappingPath': mapping_path, 'sourceExtractionPath': mapping['sourceExtractionPath'], 'wholeSourceDuty': source_goal, 'wholeDecisionBefore': decision, 'wholeOriginalRoles': row['selectedTargetRoles'], 'wholePartnerRowsBefore': partner_rows})
    for partner in partner_rows:
        partners.append({'sourceOrdinal': row['sourceOrdinal'], 'sourceKey': mapping_path + '#' + source_id, 'wholeMappingPartnerRow': partner, 'wholeCurrentCanonicalPartnerBody': by_id[partner['canonicalGoalId']], 'newScienceApprovalClaimed': False})
    selected_by_mapping.setdefault(mapping_path, []).append((row, source_id))
assert len(partners) == 268
put('input/twenty-current-whole-source-duties-and-decisions.exact.json', {'schemaVersion': 1, 'rows': whole})
put('input/all268-current-whole-partner-bodies-after19.exact.json', {'schemaVersion': 1, 'rows': partners})

mapping_paths = []
changes = []
all_mapping_checks = []
for ordinal, original_path in enumerate(atlas['mappingPaths'], 1):
    original = load(REPO / original_path)
    guards.append({'original': binding(REPO / original_path), 'portableExactInput': exact_copy(REPO / original_path, f'input/mappings/{ordinal:02d}-{Path(original_path).name}')})
    extraction_path = original['sourceExtractionPath']
    if not any(g['original']['path'] == extraction_path for g in guards):
        guards.append({'original': binding(REPO / extraction_path), 'portableExactInput': exact_copy(REPO / extraction_path, f'input/extractions/{ordinal:02d}-{Path(extraction_path).name}')})
    candidate = copy.deepcopy(original)
    changed_source_ids = []
    removed_pairs = set()
    for row, source_id in selected_by_mapping.get(original_path, []):
        before = next(d for d in original['decisions'] if d['sourceGoalId'] == source_id)
        after = next(d for d in candidate['decisions'] if d['sourceGoalId'] == source_id)
        # HE is the valid current whole-target primary support. BY upper-level
        # photo/resp contributions remain; only the method->antenna edge is false.
        if row['nativeStage'] == 'SekI':
            removed = [g for g in before['canonicalGoalIds'] if g in TARGETS[:2]]
            reason = 'Die amtliche Sek-I-Pflicht trägt Grundprinzipien/Bedeutung/Grundgleichungen bzw. den ausdrücklich begrenzten Originalbeitrag, nicht das ganze Q3-Oberstufenziel. Die übrigen tatsächlichen Partner und die ganze Originalpflicht bleiben erhalten. Noch fehlende konkrete Grundkompetenzen sind im separat offenen Companion-Kandidaten dokumentiert; keine Whole-Duty-Freigabe.'
        elif source_id == '2cc41e62-ec79-5add-9d43-2499b4e147b2':
            removed = [TARGETS[2]]
            reason = 'Blattextrakt-Chromatographie ist eine praktische Trenn-/Deutepflicht, keine curriculare Pflicht zum Aufbau und zur Funktion von Lichtsammelkomplexen. Daher keine target-Platzierung des HE-LK-Antennenziels aus dieser BY-GK/LK-Quelle. Der ursprüngliche Kontextpartner bleibt unverändert und wird hier nicht zu einer Verfahrensabdeckung erklärt. Der echte Chromatographieoperator bleibt offen.'
        else:
            continue
        assert removed
        after['canonicalGoalIds'] = [g for g in before['canonicalGoalIds'] if g not in removed]
        assert after['canonicalGoalIds'], 'Do not silently erase an entire source duty'
        after['rationale'] = before['rationale'] + '\n\nIsolierter operativer Autorenkandidat 2026-10-08 (zwei unabhängige aktuelle Prüfungen ausstehend): ' + reason
        after['reviewedAt'] = '2026-10-08'
        after['reviewer'] = 'Codex author candidate; independent source/projection review pending'
        changed_source_ids.append(source_id)
        for g in removed:
            removed_pairs.add((source_id, g))
        changes.append({'sourceOrdinal': row['sourceOrdinal'], 'originalMappingPath': original_path, 'sourceGoalId': source_id, 'nativeStage': row['nativeStage'], 'nativeCourseScope': row['nativeCourseScope'], 'wholeSourceDutyUnchanged': True, 'wholeBeforeDecision': before, 'wholeAfterDecision': after, 'removedMisplacedTargetIds': removed, 'remainingPartnerIdsExact': after['canonicalGoalIds'], 'rationaleDe': reason, 'reviewStatus': 'ai_candidate', 'independentReviewStatus': 'needs_human_review', 'humanApprovalClaimed': False, 'wholeDutyClosureClaimed': False})
    candidate['mappings'] = [m for m in candidate['mappings'] if (m['legacyGoalId'], m['canonicalGoalId']) not in removed_pairs]
    if changed_source_ids:
        after_bind = put(f'candidate/mappings/{ordinal:02d}-{Path(original_path).name}', candidate)
        mapping_paths.append(after_bind['path'])
        other_decisions = [d for d in original['decisions'] if d['sourceGoalId'] not in changed_source_ids]
        assert other_decisions == [d for d in candidate['decisions'] if d['sourceGoalId'] not in changed_source_ids]
        assert [m for m in original['mappings'] if (m['legacyGoalId'], m['canonicalGoalId']) not in removed_pairs] == candidate['mappings']
        other_fields = {k: v for k, v in original.items() if k not in ['decisions', 'mappings']}
        assert other_fields == {k: v for k, v in candidate.items() if k not in ['decisions', 'mappings']}
        all_mapping_checks.append({'original': binding(REPO / original_path), 'candidate': after_bind, 'changedSourceIds': changed_source_ids, 'removedTargetEdges': len(removed_pairs), 'allOtherWholeDecisionValuesExact': True, 'allOtherMappingPartnerRowsExact': True, 'allOtherTopLevelValuesExact': True, 'wholeExtractionInputExact': True})
    else:
        mapping_paths.append(original_path)
        all_mapping_checks.append({'original': binding(REPO / original_path), 'candidateUsesOriginalUnchanged': True})
assert len(changes) == 15
assert sum(len(c['removedMisplacedTargetIds']) for c in changes) == 20
candidate_atlas = {**atlas, 'mappingPaths': mapping_paths}
put('candidate/ordinary-current392-source-atlas.inputs.json', candidate_atlas)
put('candidate/authoritative-decision-and-compatible-edge.current20-removals.diff.json', {'schemaVersion': 1, 'role': 'Actual ordinary-authoritative mapping candidate; no current approval', 'rows': changes, 'mappingChecks': all_mapping_checks, 'removedEdges': 20, 'changedWholeDecisions': 15, 'HEWhole3Preserved': True, 'actualOperatorHoldsRetained': 4, 'activeWrites': 0, 'strictGainClaimed': 0})
put('input/actual-current476-after19-input.guards.json', {'schemaVersion': 1, 'protectedCurrentGoals': [by_id[g] for g in TARGETS], 'wholeCurrentCanonicalNodeCount': 476, 'wholeCurrentCurricularAtomicCount': 392, 'guards': guards, 'activeWrites': 0})
exact_copy(ROLE / 'source/four-specific-original-operator-duties.still-open.author.json', 'candidate/four-original-operator-HOLDs.exact-KEEP.json')

# Real new basis competencies are explicitly separate pending proposals. They
# do NOT enter this392-atom ordinary scope simulation or acquire authority.
namespace = uuid.UUID(canonical['landscapeId'])
base_resp = str(uuid.uuid5(namespace, 'canonical_biology_sek1_cell_respiration_principle_word_equation'))
base_coupling = str(uuid.uuid5(namespace, 'canonical_biology_sek1_photosynthesis_light_dark_basic_coupling'))
proposals = [
    {'id': base_resp, 'shortKey': 'canonical_biology_sek1_cell_respiration_principle_word_equation', 'title': 'Zellatmung als Energieumwandlung erklären', 'titleEn': 'Explain cell respiration as energy conversion', 'description': 'Die lernende Person kann Zellatmung als Abbau von Glucose unter Verbrauch von Sauerstoff und Bildung von Kohlenstoffdioxid und Wasser durch eine Wortgleichung darstellen und erklären, dass dabei chemische Energie für Lebensprozesse nutzbar wird.', 'descriptionEn': 'The learner can represent cell respiration as the breakdown of glucose using oxygen and producing carbon dioxide and water with a word equation, and explain that chemical energy becomes usable for life processes.', 'type': 'atomic', 'contains': [], 'requires': [], 'weight': 1, 'tags': ['canonical', 'SekI', 'GK', 'LK'], 'dimensionTags': {'framework': 'canonical-gymnasium-biology', 'phase': 'GLOBAL', 'area': 'Grundlagen', 'topicCode': 'CANONICAL.BIOLOGY.SEK1.CELL_RESPIRATION_PRINCIPLE_WORD_EQUATION', 'demandLevel': 'AB1', 'processCompetencies': [], 'guidingIdeas': ['BIO_STOFF_ENERGIE']}, 'applicability': {'jurisdiction': ['DE-BB', 'DE-BE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST', 'DE-TH']}, 'extendedData': {'provenance': {'sourceLandscapeId': canonical['landscapeId'], 'sourceGoalId': 'regional-basic-respiration-duty-author-candidate', 'sourceLandscapeTitle': 'Amtliche regionale Sek-I-Zellatmungspflichten, genaue Eingaben im Autorenpaket'}}},
    {'id': base_coupling, 'shortKey': 'canonical_biology_sek1_photosynthesis_light_dark_basic_coupling', 'title': 'Zusammenwirken der Fotosynthesereaktionen erklären', 'titleEn': 'Explain how photosynthesis reactions work together', 'description': 'Die lernende Person kann auf einem vereinfachten Modell erklären, dass lichtabhängige Reaktionen Lichtenergie für die Bildung energiereicher organischer Stoffe durch lichtunabhängige Reaktionen bereitstellen, und daraus erklären, warum lichtunabhängig nicht nur bei Dunkelheit bedeutet.', 'descriptionEn': 'The learner can use a simplified model to explain that light-dependent reactions provide light energy for the formation of energy-rich organic substances through light-independent reactions, and explain why light-independent does not mean occurring only in darkness.', 'type': 'atomic', 'contains': [], 'requires': ['576d59e2-397a-5654-b853-7c0c4870fbd3'], 'weight': 1, 'tags': ['canonical', 'SekI', 'GK', 'LK'], 'dimensionTags': {'framework': 'canonical-gymnasium-biology', 'phase': 'GLOBAL', 'area': 'Grundlagen', 'topicCode': 'CANONICAL.BIOLOGY.SEK1.PHOTOSYNTHESIS_LIGHT_DARK_BASIC_COUPLING', 'demandLevel': 'AB2', 'processCompetencies': [], 'guidingIdeas': ['BIO_STOFF_ENERGIE']}, 'applicability': {'jurisdiction': ['DE-SN']}, 'extendedData': {'provenance': {'sourceLandscapeId': canonical['landscapeId'], 'sourceGoalId': 'sn-biology-seki-lehrplan-2025-k9-samenpflanzen-07-anatomie-und-physiologie-der-samenpflanzen-erklaeren', 'sourceLandscapeTitle': 'Sachsen Biologie Gymnasium Klassenstufe9: ganze amtliche Originalseite38, gedruckt26'}}},
]
put('pending-companions/two-real-basic-goal-bodies.ai-candidate.json', {'schemaVersion': 1, 'role': 'Separate unapproved goal templates; not an active landscape or ordinary392 scope input', 'goalTemplates': proposals, 'reviewStatus': 'ai_candidate', 'status': 'needs_human_review', 'newCountIfActuallyReviewedAndIntegrated': 394, 'strictClosedCountClaimed': 0, 'unresolvedGates': ['two independent source/description reviews', 'full positive-understanding evidence-v2 DE/EN candidates and reviews', 'semantic atomicity decisions', 'memory/card/visibility decisions', 'actual PNG author candidates and independent visual QA', 'native page checks and all affected bindings'], 'all20WholeDutiesRetained': True, 'all268WholePartnerInputsRetained': True, 'activeWrites': 0, 'noRegionalWholeDutyClosureClaimed': True})
put('pending-companions/actual-regional-competence-retention-and-next-map-plan.author.json', {'schemaVersion': 1, 'existingBasicGoalIdsRetainedWithoutTextChanges': ['fc89ed54-1a78-55a9-8e54-751d6d46dad6', '0d96a802-2a8d-5445-a7fa-02387f6b1f2d', 'e6f128c8-b38e-5167-9367-77e079a994c3', '576d59e2-397a-5654-b853-7c0c4870fbd3', '8678d0b5-8b74-5b01-8143-91bfea1e4482'], 'pendingBasicRespirationGoalId': base_resp, 'pendingSNLightDarkCouplingGoalId': base_coupling, 'candidateByDuty': [{'sourceOrdinal': d['sourceOrdinal'], 'wholeSourceDuty': d['wholeSourceDuty'], 'remainingExistingPartnerIds': next((c['remainingPartnerIdsExact'] for c in changes if c['sourceOrdinal'] == d['sourceOrdinal']), d['wholeDecisionBefore']['canonicalGoalIds']), 'separateUnapprovedBasicCompanionIds': ([base_resp] if d['sourceOrdinal'] in [1,2,3,4,11,13,14,15,17,18,19,20] else []) + ([base_coupling] if d['sourceOrdinal'] == 15 else []), 'wholeDutyClosure': False} for d in whole], 'chromatographyOperatorStillOpen': True, 'SNCarbonDioxideAndHeatExperimentsStillOriginalObligations': True, 'fourOriginalOperatorHoldsRetained': True, 'plainMappingSemanticsOnly': True, 'prerequisiteOnlySubstitutionUsed': False})
print(json.dumps({'changedWholeDecisions': len(changes), 'removedMisplacedEdges': 20, 'current476And392Unchanged': True, 'wholeDuties': len(whole), 'wholePartners': len(partners), 'pendingCompanionIds': [base_resp, base_coupling], 'activeWrites': 0}))
