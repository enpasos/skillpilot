#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare a bounded, physically separate two-component Biology candidate.

All content payloads come from frozen foreign-author candidates. This is an
author materialization, not an independent scientific review or active adoption.
"""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, shutil, uuid

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT).as_posix()
PRIOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1'
V4 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-integration-candidate-v4'
OLD_ISO = ROOT / 'tmp/biologie-q1-tf-methylation-current-source-consumer-native-isolated-20261005-v3'
ISO = ROOT / 'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
NOW = datetime.now(timezone.utc).isoformat()
BAU = '5b2571d9-f079-52b2-b21b-8f389c7409f4'
NS = uuid.UUID('fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb')
SEED = 'biology:08a43a1b-d97e-522c-9dfa-c950a493364e:bacterial-binary-fission-supplied-model'
FISSION = str(uuid.uuid5(NS, SEED))
PARENT = '96bdf495-2801-57e4-a0da-ce3bf91e402c'
CAPSTONE = '1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
SEMANTIC = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
REGISTRY = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'

def read(p): return json.loads(Path(p).read_text())
def sha(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p, value):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.is_symlink(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def physical(src, dst):
    src, dst = Path(src), Path(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    assert dst.parent.resolve().is_relative_to(ISO), dst
    if dst.is_symlink(): dst.unlink()
    shutil.copy2(src, dst)
    assert not dst.is_symlink() and sha(src) == sha(dst)
def detach(path):
    dst = ISO / path
    if dst.is_symlink(): physical(dst.resolve(), dst)
def both(name, value):
    write(OWN / name, value)
    write(ISO / REL / name, value)

assert OLD_ISO.is_dir() and not ISO.exists(), 'Never reset previously prepared work'
prior_freeze = read(PRIOR / 'author-candidate.freeze.json')
for row in prior_freeze['ownArtifacts']:
    assert sha(ROOT / row['path']) == row['sha256'], row['path']
v4_freeze = read(V4 / 'integration-candidate.final.freeze.json')
for row in v4_freeze['files']:
    assert sha(ROOT / row['path']) == row['sha256'], row['path']
baseline_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/bio-current-central-five-gates.stdout.txt'
baseline = read(baseline_path)
baseline_bio = next(s for s in baseline['subjects'] if s['subject'] == 'biologie')
assert baseline_bio['strictComplete'] == 40 and baseline_bio['denominator'] == 364
strict = baseline_bio['strictCompleteGoalIds']
assert len(strict) == 40 and BAU not in strict
canonical = read(ROOT / CANON)
by = {g['id']: g for g in canonical['goals']}
assert len(by) == 442 and FISSION not in by
assert read(ROOT / SEMANTIC)['counts']['curricularAtomic'] == 364
structure = copy.deepcopy(next(g for g in read(PRIOR / 'six-finalized-description.candidates.json')['goals'] if g['goalId'] == BAU))
companion = copy.deepcopy(next(g for g in read(PRIOR / 'two-preservation-companions.candidates.json')['goals'] if g['candidateKey'] == 'bacterial-binary-fission'))
assert by[BAU] == structure['currentGoal']
source_witnesses = read(PRIOR / 'bacterial-local-source-witnesses.candidates.json')
atlas = read(ROOT / ATLAS)
registry = read(ROOT / REGISTRY)
bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
old_he = next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p)
old_by = next(p for p in atlas['mappingPaths'] if '/DE-BY/' in p)
old_he_extraction = read(ROOT / old_he)['sourceExtractionPath']
current_inputs = [CANON, SEMANTIC, QA, ATLAS, REGISTRY, old_he, old_by, old_he_extraction]
current_inputs += atlas['mappingPaths']
for p in atlas['mappingPaths']:
    current_inputs.append(read(ROOT / p)['sourceExtractionPath'])
for field in ['semanticAtomicityConfigPath', 'memoryReviewConfigPath']:
    current_inputs.extend([bio[field], read(ROOT / bio[field])['reviewPath']])
current_inputs += [atlas['manifestPath'], atlas['navigationViewPath']]
current_inputs += [p.relative_to(ROOT).as_posix() for p in (ROOT / atlas['outputDirectory']).rglob('*') if p.is_file()]
current_inputs = sorted(set(current_inputs))
write(OWN / 'active-input-boundary.before.json', {
    'recordedAtUTC': NOW, 'paths': [{'path': p, 'sha256': sha(ROOT / p)} for p in current_inputs],
    'activeBaselineReport': {'path': baseline_path.relative_to(ROOT).as_posix(), 'sha256': sha(baseline_path)},
    'activeStrict': 40, 'activeDenominator': 364, 'strictGoalIds': strict,
    'freezeInputs': [{'path': (PRIOR / 'author-candidate.freeze.json').relative_to(ROOT).as_posix(), 'sha256': sha(PRIOR / 'author-candidate.freeze.json')},
                     {'path': (V4 / 'integration-candidate.final.freeze.json').relative_to(ROOT).as_posix(), 'sha256': sha(V4 / 'integration-candidate.final.freeze.json')}],
    'activeWritesAuthorized': False,
})
shutil.copytree(OLD_ISO, ISO, symlinks=True)
assert not (ISO / REL).exists()
(ISO / REL).mkdir(parents=True)
code_bindings = []
for directory in ['app/scripts', 'app/src', 'scripts']:
    assert not (ISO / directory).is_symlink(), directory
    for base, children, files in os.walk(ROOT / directory):
        children[:] = [c for c in children if c not in ['node_modules', '__pycache__']]
        for name in files:
            src = Path(base) / name
            if src.suffix in ['.ts', '.tsx', '.mjs', '.js', '.py', '.json']:
                rel = src.relative_to(ROOT).as_posix()
                physical(src, ISO / rel)
                code_bindings.append({'path': rel, 'sha256': sha(src)})
for p in current_inputs:
    physical(ROOT / p, ISO / p)
for src in (ROOT / 'curricula/DE/Gymnasium/canonical').glob('*.json'):
    physical(src, ISO / src.relative_to(ROOT))
# New registered v4 native histories must be physical for consumers that use
# regular-file traversal; no missing-witness waiver is introduced.
registered_bio_directories = {str(Path(p).parent) for p in bio['resolutionIndexPaths']}
registered_bio_directories.update(str(Path(p).parent) for p in bio['positiveEvidenceConfigPaths'])
registered_bio_directories.add(V4.relative_to(ROOT).as_posix())
for directory in registered_bio_directories:
    for src in (ROOT / directory).rglob('*'):
        if src.is_file(): physical(src, ISO / src.relative_to(ROOT))
for name in ['active-input-boundary.before.json']:
    physical(OWN / name, ISO / REL / name)
both('native-code-and-physical-isolation.actual.receipt.json', {
    'isolationRoot': str(ISO), 'currentCodeBindings': code_bindings,
    'currentOperativeInputsPhysicallyCopied': current_inputs,
    'registeredBiologyEvidencePhysicallyCopied': sorted(registered_bio_directories),
    'readOnlyHistoricalLeafMirrorsRetained': True, 'activeWrites': 0, 'humanApproval': False,
})
both('baseline-active-biology.report.json', baseline)
both('current-central-registry.before.snapshot.json', registry)
both('current-canonical.before.snapshot.json', canonical)
baseline_book = read(ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
baseline_book['outputPath'] = REL + '/baseline-full.book-model.json'
both('baseline-book.config.json', baseline_book)

# Exact foreign-author DE/EN and INNER profiles; no new subject text is authored.
candidate = copy.deepcopy(canonical)
cby = {g['id']: g for g in candidate['goals']}
cby[BAU].update(copy.deepcopy(structure['finalizedCandidateGoal']))
cby[BAU]['extendedData']['applicabilityMappingInheritance'] = 'boundary'
new = copy.deepcopy(cby[BAU])
new.update(id=FISSION, shortKey='canonical_biology_bacterial_binary_fission',
           title=companion['proposedTitleDe'], titleEn=companion['proposedTitleEn'],
           description=companion['proposedDescriptionDe'], descriptionEn=companion['proposedDescriptionEn'],
           requires=copy.deepcopy(companion['requiresCandidate']), tags=['LK', 'canonical'])
new['applicability']['jurisdiction'] = ['DE-BY', 'DE-HE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST']
new['sourceRef'] = 'Hessen KC Biologie Oberstufe, Ausgabe 2024, Stand 01.08.2025, Q1.2, gedruckte S.39; partielle Zweiteilungs-Komponente'
new.pop('resourceLinks', None)
candidate['goals'].insert(next(i for i, g in enumerate(candidate['goals']) if g['id'] == BAU) + 1, new)
cby[PARENT]['contains'].insert(cby[PARENT]['contains'].index(BAU) + 1, FISSION)
assert BAU in cby[CAPSTONE]['requires']
cby[CAPSTONE]['requires'].insert(cby[CAPSTONE]['requires'].index(BAU) + 1, FISSION)
equivalents = [g for g in canonical['goals'] if ('bakter' in (g.get('title', '') + ' ' + g.get('description', '')).lower() and any(w in (g.get('title', '') + ' ' + g.get('description', '')).lower() for w in ['vermehr', 'teil', 'wachst'])) or 'zweiteil' in (g.get('title', '') + ' ' + g.get('description', '')).lower()]
both('equivalence-and-stable-id.author.receipt.json', {
    'namespace': str(NS), 'seed': SEED, 'newGoalId': FISSION,
    'nativeConventionPath': 'scripts/adopt_hessen_upper_secondary_into_canonical.py',
    'existingCandidatesInspected': equivalents, 'existingStandaloneEquivalentFound': False,
    'reason': 'The existing Bau atom bundles structure and reproduction; infection assessment is a different competence. The biotechnology umbrella remains unchanged and is not a reviewed binary-fission replacement.',
    'activeCanonicalCount': 442, 'proposedCanonicalCount': 443,
    'activeCurricularAtomic': 364, 'proposedCurricularAtomic': 365,
    'newStrictClosures': 0, 'humanApproval': False,
})
both('two-goal-exact-content-and-prerequisite-candidates.json', {
    'status': 'inactive_author_materialization', 'structure': structure, 'companion': companion,
    'descriptionAndInnerProfileBytesPreserved': True,
    'requiresDelta': {'structureBefore': by[BAU]['requires'], 'structureAfter': cby[BAU]['requires'],
                      'companionBefore': companion['targetedPrerequisiteDelta']['beforeRequires'], 'companionAfter': new['requires']},
    'independentCurrentSourcePrerequisiteAndViewsReview': 'pending', 'humanApproval': False,
})

# New current source copies: original and previously frozen source bytes stay intact.
new_he_extraction = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-q1-bacterial-structure-fission-20261005-v1.source-extraction.json'
new_he = 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-q1-bacterial-structure-fission-20261005-v1.review.json'
source_id = companion['sourceBindingCandidate']['sourceGoalId']
he_extraction = read(ROOT / old_he_extraction)
delta = next(d for d in read(PRIOR / 'he-six-source-extraction-deltas.candidates.json')['deltas'] if d['sourceGoalId'] == source_id)
row_index = next(i for i, g in enumerate(he_extraction['sourceGoals']) if g['id'] == source_id)
before_source_row = copy.deepcopy(he_extraction['sourceGoals'][row_index])
old_explicit_key = before_source_row.pop('sourceDocumentKey')
assert before_source_row == delta['before'] and old_explicit_key == 'KC2024_BIOLOGIE_SEKII'
correct_source_row = copy.deepcopy(delta['after'])
correct_source_row['description'] = delta['before']['description']
correct_source_row['sourceDocumentKey'] = 'KC2024_BIOLOGIE_SEKII_STAND_20250801'
he_extraction['sourceGoals'][row_index] = correct_source_row
he = read(ROOT / old_he)
he.update(reviewId=Path(new_he).stem, sourceExtractionPath=new_he_extraction)
he_bau_row = next(r for r in he['mappings'] if r['legacyGoalId'] == source_id and r['canonicalGoalId'] == BAU)
assert he_bau_row['matchType'] == 'exact'
he_bau_row['matchType'] = 'partial'
he['mappings'].append({'legacyGoalId': source_id, 'canonicalGoalId': FISSION, 'matchType': 'partial', 'reviewDecisionId': source_id})
decision = next(d for d in he['decisions'] if d['sourceGoalId'] == source_id)
decision.update(canonicalGoalIds=[BAU, FISSION], matchType='partial', reviewedAt=NOW,
                reviewer='Codex inactive materialization author',
                rationale='Inaktiver aktueller Quellenkandidat: HE2025 Q1.2 S.39 LK nennt Bau und Vermehrung von Bakterien (Schema). Zwei partielle Ziele bewahren beide Komponenten; kein einzelnes Ziel beansprucht den ganzen Bullet. Gegebener beschreibender Teilungsprozess setzt keinen biochemischen Replikationskurs voraus. Unabhängige aktuelle D/Quellen-/Voraussetzungenprüfung ist offen; kein menschlicher oder ganzer Quellenabschluss.')
he['summary']['exactMappings'] -= 1
he['summary']['partialMappings'] += 2
write(ISO / new_he_extraction, he_extraction)
write(ISO / new_he, he)
mapping_replacements = {old_he: new_he}
source_deltas = [{'oldMappingPath': old_he, 'newMappingPath': new_he, 'newSourceExtractionPath': new_he_extraction,
                  'sourceGoalId': source_id, 'sourceGoalBefore': read(ROOT / old_he_extraction)['sourceGoals'][row_index],
                  'sourceGoalAfter': correct_source_row, 'mappingRows': [r for r in he['mappings'] if r['legacyGoalId'] == source_id]}]
by_binding = next(d for d in read(PRIOR / 'by-three-new-partial-source-bindings.candidates.json')['deltas'] if d['candidateMapping']['canonicalGoalId'] == BAU)
for reproduction in source_witnesses['candidateReproductionRelationships']:
    state = reproduction['jurisdiction']
    old_mapping = next(p for p in atlas['mappingPaths'] if '/' + state + '/' in p)
    old = read(ROOT / old_mapping)
    assert sha(ROOT / old['sourceExtractionPath']) == reproduction['sourceExtractionInput']['sha256']
    assert next(g for g in read(ROOT / old['sourceExtractionPath'])['sourceGoals'] if g['id'] == reproduction['sourceGoalId']) == reproduction['sourceGoal']
    updated = copy.deepcopy(old)
    name = Path(old_mapping).name.split('.m7-')[0].removesuffix('.review.json')
    new_mapping = str(Path(old_mapping).parent / (name + '.m7-q1-bacterial-structure-fission-20261005-v1.review.json'))
    if 'reviewId' in updated: updated['reviewId'] = Path(new_mapping).stem
    srcid = reproduction['sourceGoalId']
    d = next(row for row in updated['decisions'] if row['sourceGoalId'] == srcid)
    old_targets = copy.deepcopy(d['canonicalGoalIds'])
    appended = []
    if state == 'DE-BY':
        assert not any(r['legacyGoalId'] == srcid and r['canonicalGoalId'] == BAU for r in updated['mappings'])
        updated['mappings'].append(copy.deepcopy(by_binding['candidateMapping']))
        d['canonicalGoalIds'].append(BAU)
        appended.append(BAU)
    assert FISSION not in d['canonicalGoalIds']
    d['canonicalGoalIds'].append(FISSION)
    appended.append(FISSION)
    updated['mappings'].append({'legacyGoalId': srcid, 'canonicalGoalId': FISSION, 'matchType': 'partial', 'reviewDecisionId': srcid})
    d.update(reviewedAt=NOW, reviewer='Codex inactive component materialization author',
             rationale=d['rationale'] + ' Inaktive ergänzende partielle Zweiteilungs-Komponente aus den erhaltenen tatsächlichen Originalstellen. Nur gegebener Kopie–Verteilung–Trennung-Prozess; keine neue Gesamtfreigabe des breiten Quelloperators, keine Mitose, Virusvermehrung, Kulturkurven-, exponentielle Populations-, Stoffwechsel-, Überdauerungs- oder biotechnologische Gesamtleistung. Vorhandene andere Ziele und Mappingzeilen bleiben erhalten. Unabhängige Quellen-/Voraussetzungen-/Sichtprüfung steht aus.')
    if isinstance(updated.get('summary'), dict) and isinstance(updated['summary'].get('partialMappings'), int):
        updated['summary']['partialMappings'] += len(appended)
    write(ISO / new_mapping, updated)
    mapping_replacements[old_mapping] = new_mapping
    source_deltas.append({'jurisdiction': state, 'oldMappingPath': old_mapping, 'newMappingPath': new_mapping,
                          'sourceGoalId': srcid, 'sourceExtractionPath': old['sourceExtractionPath'],
                          'sourceExtractionUnchanged': True, 'oldTargetIdsPreserved': old_targets,
                          'appendedPartialGoalIds': appended, 'boundary': reproduction['boundary'],
                          'newRows': [r for r in updated['mappings'] if r['legacyGoalId'] == srcid and r['canonicalGoalId'] in appended]})
for existing in source_witnesses['currentStructuralRelationshipsInspected']:
    selected = next(p for p in atlas['mappingPaths'] if '/' + existing['jurisdiction'] + '/' in p)
    old = read(ROOT / selected)
    assert existing['unchangedMappingIdentity'] in old['mappings']
    if selected in mapping_replacements:
        assert existing['unchangedMappingIdentity'] in read(ISO / mapping_replacements[selected])['mappings']
atlas['mappingPaths'] = [mapping_replacements.get(p, p) for p in atlas['mappingPaths']]
atlas['expectedCurricularAtomicGoalCount'] = 365
both('source-components-and-domain-local-boundaries.author.json', {
    'status': 'inactive_source_component_candidates', 'deltas': source_deltas,
    'existingEightStructuralMappingRowsPreserved': True, 'newLowerReproductionStates': ['DE-BY', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST'],
    'THReproductionNotInvented': True, 'BYExponentialGrowthClosed': False, 'STCultureCurvesClosed': False,
    'wholeUmbrellaSourceOperatorsClosed': False, 'primaryWitnessDossier': (PRIOR / 'bacterial-local-source-witnesses.candidates.json').relative_to(ROOT).as_posix(),
    'independentSourceReview': 'pending', 'activeWrites': 0, 'humanApproval': False,
})
both('prospective-canonical.snapshot.json', candidate)
both('prospective-source-atlas.inputs.json', atlas)
both('prospective-paths.json', {
    'isolationRoot': str(ISO), 'ownPath': REL, 'goalIds': [BAU, FISSION], 'canonicalPath': CANON,
    'semanticPath': SEMANTIC, 'qaPath': QA, 'atlasPath': ATLAS, 'bioConfig': bio,
    'newHEExtractionPath': new_he_extraction, 'mappingReplacements': mapping_replacements,
    'changedCanonicalGoalIds': [BAU, FISSION, PARENT, CAPSTONE], 'createdAtUTC': NOW,
})
print(json.dumps({'status': 'inactive_author_isolate_ready', 'isolationRoot': str(ISO), 'goalIds': [BAU, FISSION],
                  'activeBaseline': '40/364', 'prospectiveDenominator': 365, 'currentCodeFiles': len(code_bindings),
                  'mappingSourceCopies': len(mapping_replacements), 'activeWrites': 0, 'humanApproval': False}))
