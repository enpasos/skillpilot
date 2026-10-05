from pathlib import Path
from datetime import datetime, timezone
import json, os, hashlib, shutil

ROOT = Path.cwd().resolve()
REL = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1')
OWN = ROOT / REL
ISO = ROOT / 'tmp/chemie-b014-five-native-isolated-20261005-v1'
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1'
IDS = ['04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162', '16da6a4d-8e9c-5f5d-b69d-338d67a2d362', 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef', 'efa24b77-0f98-5835-9d82-3e539ab20253', '02634fdd-c8ba-591a-b240-77129b1bebb8']
assert not ISO.exists(), 'No destructive reset of an existing isolated preparation'
ISO.mkdir(parents=True)
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def read(path): return json.loads(Path(path).read_text())
def write(path, value):
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.is_symlink(), 'Never write through an active input symlink'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def detach(rel):
    path = ISO / rel
    if path.is_symlink(): path.unlink(); shutil.copy2(ROOT / rel, path)
    assert not path.is_symlink()
    return path

# Same native-code-safe isolation as the completed BioGel preparation.
code = []; replicated = []
for rel in ['app/scripts', 'scripts']:
    shutil.copytree(ROOT / rel, ISO / rel, symlinks=False)
    for path in sorted((ROOT / rel).rglob('*')):
        if path.is_file():
            target = ISO / path.relative_to(ROOT)
            assert sha(path) == sha(target)
            code.append({'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'bytes': path.stat().st_size})
for rel in ['app/src', 'app/node_modules', 'docs', 'contracts']:
    target = ISO / rel; target.parent.mkdir(parents=True, exist_ok=True)
    target.symlink_to(ROOT / rel, target_is_directory=True)
for rel in ['curricula', 'app/public', 'backend/src/main/resources/static']:
    for base, children, files in os.walk(ROOT / rel, followlinks=False):
        base = Path(base); target = ISO / base.relative_to(ROOT); target.mkdir(parents=True, exist_ok=True)
        for name in files:
            src = base / name; dst = target / name
            if dst.exists() or dst.is_symlink(): continue
            dst.symlink_to(src); replicated.append(str(src.relative_to(ROOT)))
for rel in ['app/package.json', 'app/tsconfig.json', 'app/tsconfig.node.json', 'package.json', 'AGENTS.md', 'LICENSING.md', 'LICENSE']:
    if (ROOT / rel).exists():
        target = ISO / rel; target.parent.mkdir(parents=True, exist_ok=True); target.symlink_to(ROOT / rel)
mutable = ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json', 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json']
for rel in mutable: detach(rel)
before = read(ROOT / mutable[0]); canonical = read(ISO / mutable[0])
proposals = read(SOURCE / 'eight-complete-text-source-prerequisite-deltas.json')['rows']
deltas = []
for id in IDS:
    row = next(r for r in proposals if r['goalId'] == id)
    current = next(g for g in canonical['goals'] if g['id'] == id)
    actual_before = json.loads(json.dumps(current))
    for field in row['changedFields']:
        assert current.get(field) == row['before'].get(field), (id, field, 'Current input changed; examine the actual new context')
        current[field] = row['after'][field]
    deltas.append({'goalId': id, 'before': actual_before, 'afterBeforeImageImport': current, 'scientificSourceCandidatePath': str(SOURCE.relative_to(ROOT) / 'eight-complete-text-source-prerequisite-deltas.json'), 'sourceCandidateFreezeSha256': sha(SOURCE / 'independent-source-a-m.freeze.manifest.json')})
assert len(canonical['goals']) == len(before['goals']) == 473
changed = [g['id'] for a, g in zip(before['goals'], canonical['goals']) if a != g]
assert set(changed) == set(IDS), changed
write(ISO / mutable[0], canonical)
write(OWN / 'five-exact-operative-goal-deltas.candidate.json', {'authority': 'ai_candidate', 'status': 'prospective_only', 'rows': deltas, 'all468OtherGoalObjectsUnchanged': True, 'newGoalIds': [], 'memory28Activated': False, 'strictNetDelta': 0, 'activeWrites': 0})

# Correct just the two affected HE clauses; preserve every other source component.
inputs_rel = Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
atlas = read(ROOT / inputs_rel)
old_mapping_rel = next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p)
new_mapping_rel = 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.m7-b014-five-current-20261005-v1.review.json'
mapping = read(ROOT / old_mapping_rel); prior = json.loads(json.dumps(mapping)); groups = read(SOURCE / 'nine-complete-source-row-remediation-groups.json')['groups']
source_ids = ['he-chem-sekii-e-1-b08-a01-0bba4a7b', 'he-chem-sekii-e-2-b04-a01-803d5801']
changes = []
for sid in source_ids:
    group = next(g for g in groups if g['sourceGoalId'] == sid)
    decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == sid)
    removed = [m for m in mapping['mappings'] if m['legacyGoalId'] == sid]
    mapping['mappings'] = [m for m in mapping['mappings'] if m['legacyGoalId'] != sid]
    exemplar = removed[0]; replacements = []
    for target, match in zip(group['replacementTargets'], group['matchTypes']):
        record = dict(exemplar, canonicalGoalId=target, matchType=match)
        mapping['mappings'].append(record); replacements.append(record)
    old_decision = json.loads(json.dumps(decision))
    decision['canonicalGoalIds'] = group['replacementTargets']
    decision['rationale'] = 'Gezielte aktuelle B014-Quellenkorrektur: ' + group['retainedWidth'] + ' Vollständige Primärquelle und aktueller Zielkontext im eingefrorenen unabhängigen Source/A/M-Kandidaten geprüft; diese operative Übernahmevorbereitung ist noch kein D/P-Abschluss oder Human Approval.'
    decision['reviewedAt'] = '2026-10-05'
    decision['reviewer'] = 'codex-independent-source-a-m-candidate'
    changes.append({'sourceGoalId': sid, 'sourceText': group['sourceText'], 'sourceSpan': group['sourceSpan'], 'beforeMappings': removed, 'afterMappings': replacements, 'beforeDecision': old_decision, 'afterDecision': decision, 'sourceComponentsPreserved': group['retainedWidth']})
mapping['reviewId'] = 'hessen-chemistry-upper-secondary-source-extraction-to-canonical-chemistry-m7-b014-five-current-20261005-v1'
write(ISO / new_mapping_rel, mapping)
atlas['mappingPaths'] = [new_mapping_rel if p == old_mapping_rel else p for p in atlas['mappingPaths']]
write(ISO / inputs_rel, atlas)
untouched_prior = [r for r in prior['mappings'] if r['legacyGoalId'] not in source_ids]
untouched_after = [r for r in mapping['mappings'] if r['legacyGoalId'] not in source_ids]
assert untouched_prior == untouched_after
assert [r for r in prior['decisions'] if r['sourceGoalId'] not in source_ids] == [r for r in mapping['decisions'] if r['sourceGoalId'] not in source_ids]
write(OWN / 'two-he-source-clause-before-after.candidate.json', {'authority': 'ai_candidate', 'fromMappingPath': old_mapping_rel, 'futureActiveMappingPath': new_mapping_rel, 'rows': changes, 'allOtherHEMappingsAndDecisionsByteSemanticUnchanged': True, 'allBYHBG9SourceMappingsUnchanged': True, 'sourceExtractionBytesUnchanged': True, 'partialCompanionSourceGroupsNotAdopted': ['f093-reference-and-numeric-voltage', '28-salt-width', '1c-protolysis-reuse'], 'strictNetDelta': 0, 'activeWrites': 0})

# The already established full canonical review view is the required exact 376 base.
# National source-atlas publication currently excludes 18 atoms; do not lower its gate.
book = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json')
book['outputPath'] = str(REL / 'prospective-full-base.book-model.json')
batch = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json', 'schemaVersion': 1, 'batchId': 'chemie-b014-five-prospective-current-20261005-v1', 'subject': 'chemie', 'subjectLabel': 'Chemie', 'bookId': 'de-gym-chemie-b014-five-prospective-current-20261005-v1', 'title': 'Chemie B014 – fünf aktuelle Redox- und Titrationsziele', 'baseGoalBookConfigPath': str(REL / 'book.config.json'), 'goalIds': IDS, 'outputDirectory': str(REL / 'native-finalbook'), 'feedbackBaseUrl': 'https://skillpilot.com/lernziel-feedback', 'promptPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md', 'criteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md', 'printDerivativeProfile': 'bounded-atlas'}
for name, value in [('book.config.json', book), ('batch.config.json', batch)]:
    write(OWN / name, value)
    target = ISO / REL / name
    if target.is_symlink(): target.unlink()
    write(target, value)
write(OWN / 'isolation-and-native-code-baseline.receipt.json', {'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'isolationRoot': str(ISO), 'nativeAppScriptsAndRootScriptsCopiedUnmodified': code, 'replicatedLeafFileSymlinkCount': len(replicated), 'mutableInputsDetachedBeforeWrite': [{'path': p, 'baselineSHA256': sha(ROOT / p), 'isSymlink': False} for p in mutable], 'fullCanonicalReviewBaseRetained': book['compositionViewPath'], 'exactBaseAtomicDenominatorExpected': 376, 'nationalAtlas18ExcludedAtomsNotSilentlyPublished': True, 'activeWrites': 0})
print(json.dumps({'isolationReady': str(ISO), 'copiedNativeFiles': len(code), 'replicatedLeafSymlinks': len(replicated), 'changedGoalIds': changed, 'boundedHEClauseChanges': source_ids, 'activeWrites': 0}))
