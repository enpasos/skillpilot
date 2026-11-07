#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Add factual current context and cold-review tasks; never author a review."""
import collections
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06'
CONTROL = ROOT / 'tmp/math-three-description-preparer-20261106'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    if path.exists():
        if json.loads(path.read_bytes()) != value:
            raise ValueError('Refusing to replace differing prepared context: ' + str(path))
        return
    with path.open('x') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')


def main():
    global BASE, CONTROL
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', type=Path, default=BASE)
    parser.add_argument('--control', type=Path, default=CONTROL)
    parser.add_argument('--expected-source-sha256', default='b2155f4167f104e5b8eef183f7bb9a7a792a873a9e5d009d5083e0bc84c68cfd')
    args = parser.parse_args()
    BASE = args.base.resolve()
    CONTROL = args.control.resolve()
    if not BASE.is_relative_to(ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06'):
        raise ValueError('Only a separate repository audit input directory is permitted')
    packet = BASE / 'packet'
    manifest = json.loads((packet / 'batch-manifest.json').read_bytes())
    source = json.loads((CONTROL / 'candidate.json').read_bytes())
    candidate_sha = sha(CONTROL / 'candidate.json')
    if candidate_sha != args.expected_source_sha256:
        raise ValueError('Candidate bytes differ')
    model = json.loads((packet / 'bundle/book-model.json').read_bytes())
    bundle = json.loads((packet / 'bundle/manifest.json').read_bytes())
    if model['source']['evidenceReviewSources'] or any(page['evidenceReview'] is not None for page in model['pages']):
        raise ValueError('A blind input must not import existing D/P records')
    context = BASE / 'material-context'
    context.mkdir(exist_ok=True)
    plan = json.loads((ROOT / 'docs/dev/ci-graph-repairs/math-orientation-three-normalization-plan-2026-11-06.json').read_bytes())
    helper = ROOT / plan['graphHelper']['path']
    if sha(helper) != plan['graphHelper']['sha256']:
        raise ValueError('Context graph helper changed')
    spec = importlib.util.spec_from_file_location('math_context_graph', helper)
    graph = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(graph)
    documents = []
    document_paths = {}
    for binding in plan['catalogSources']:
        if sha(ROOT / binding['path']) != binding['sha256']:
            raise ValueError('Current catalog changed')
        document = json.loads((ROOT / binding['path']).read_bytes())
        if document['landscapeId'] == source['landscapeId']:
            document = source
        document_paths[document['landscapeId']] = binding['path']
        documents.append(document)
    catalog = graph.Catalog(documents)
    keys = [source['landscapeId'] + ':' + goal_id for goal_id in manifest['goalIds']]
    selected = set(keys)
    pending = list(keys)
    while pending:
        key = pending.pop()
        for other in set(catalog.parents[key]) | set(catalog.authored[key]):
            if other not in selected:
                selected.add(other)
                pending.append(other)
    direct_successors = {key for key in catalog.keys if set(catalog.authored[key]) & set(keys)}
    all_keys = selected | direct_successors
    goal_context = []
    for key in sorted(all_keys):
        owner, goal = catalog.nodes[key]
        goal_context.append({'qualifiedKey': key, 'landscapeId': owner, 'sourcePath': document_paths[owner],
                             'goal': goal, 'containingParentKeys': sorted(catalog.parents[key]),
                             'authoredPrerequisiteKeys': sorted(catalog.authored[key]),
                             'isAssignedGoal': key in keys, 'isDirectSuccessorOfAssignedGoal': key in direct_successors})
    write_json(context / 'current-goal-and-parent-context.json', {
        'schemaVersion': 1, 'candidateSourceSha256': candidate_sha, 'assignedGoalIds': manifest['goalIds'],
        'selection': 'Assigned goals, complete contains ancestors and prerequisite context closure, plus direct successors; no personalization projection is inferred.',
        'goalContexts': goal_context, 'reviewResultsIncluded': False})

    # Source bindings are factual excerpts, with no D/P review records or verdicts.
    goal_ids = set(manifest['goalIds'])
    mappings = []
    for path in sorted((ROOT / 'curricula/DE/Gymnasium/mapping').rglob('*.json')):
        data = json.loads(path.read_bytes())
        rows = [row for row in data.get('mappings', []) if row.get('canonicalGoalId') in goal_ids]
        if rows:
            mappings.append({'path': str(path.relative_to(ROOT)), 'sha256': sha(path),
                             'sourceLandscapeId': data.get('sourceLandscapeId'),
                             'targetLandscapeId': data.get('targetLandscapeId'),
                             'bindings': [{field: row[field] for field in ['legacyGoalId', 'canonicalGoalId', 'matchType'] if field in row} for row in rows]})
    wanted = collections.defaultdict(set)
    for mapping in mappings:
        wanted[mapping['sourceLandscapeId']].update(row['legacyGoalId'] for row in mapping['bindings'])
    excerpts = []
    official_documents = {}
    missing = {owner: set(ids) for owner, ids in wanted.items()}
    for path in sorted((ROOT / 'curricula/DE/Gymnasium/input').rglob('*source-extraction.json')):
        data = json.loads(path.read_bytes())
        owner = data.get('sourceLandscapeId')
        if owner not in wanted:
            continue
        for document in data.get('sourceDocuments', [data.get('sourceDocument')]):
            if not document or 'path' not in document:
                continue
            actual = ROOT / document['path']
            official_documents[document['path']] = {'declaredDocument': document, 'fileExists': actual.is_file(),
                                                    'sha256': sha(actual) if actual.is_file() else None}
        rows = [row for row in data.get('sourceGoals', []) if row.get('id') in wanted[owner]]
        if not rows:
            continue
        passage_ids = {row.get('passageId') for row in rows}
        passages = [row for row in data.get('passages', []) if row.get('id', row.get('passageId')) in passage_ids]
        excerpts.append({'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'sourceLandscapeId': owner,
                         'sourceGoals': rows, 'completeMatchingPassages': passages})
        missing[owner] -= {row['id'] for row in rows}
    # Some exact existing bindings name retained landscape goals rather than
    # literal extraction aspects. Preserve that distinction; never invent an
    # extraction match or substitute a merely similar source passage.
    retained = []
    for path in sorted((ROOT / 'curricula/DE/Gymnasium/input').rglob('*.json.snapshot')):
        data = json.loads(path.read_bytes())
        owner = data.get('landscapeId')
        if owner not in missing or not missing[owner]:
            continue
        rows = [row for row in data.get('goals', []) if row.get('id') in missing[owner]]
        if rows:
            retained.append({'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'landscapeId': owner,
                             'bindingClass': 'retained-landscape-goal-not-literal-official-extraction-aspect', 'goals': rows})
            missing[owner] -= {row['id'] for row in rows}
    if any(missing.values()):
        raise ValueError('A supplied direct source binding lacks actual extracted text: ' + repr(missing))
    provenance = json.loads((ROOT / 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json').read_bytes())
    math_provenance = next(row['goalProvenance'] for row in provenance['landscapes'] if row['landscapeId'] == source['landscapeId'])
    write_json(context / 'current-source-context.json', {'schemaVersion': 1, 'candidateSourceSha256': candidate_sha,
        'canonicalSourceRefs': [{'goalId': goal['id'], 'sourceRef': goal.get('sourceRef'), 'goalProvenance': math_provenance.get(goal['id'])} for goal in source['goals'] if goal['id'] in goal_ids],
        'directMappingBindings': mappings, 'boundExtractedSourceContexts': excerpts, 'boundRetainedLandscapeContexts': retained,
        'officialDocumentInputs': list(official_documents.values()),
        'scopeLimit': 'These are the actual direct binding data and extracted source texts. They do not prove every indirect mapping or every learner-facing projection; independent reviewers must not infer that claim.',
        'descriptionOrPositiveReviewResultsIncluded': False})
    for suffix in ['a', 'b']:
        round_dir = packet / ('round-' + suffix)
        campaign = json.loads((round_dir / 'description-review-campaign.json').read_bytes())
        batch_id = campaign['batches'][0]['batchId']
        result_paths = [str((round_dir / 'results' / (batch_id + ending)).relative_to(ROOT)) for ending in ['.run.json', '.records.jsonl']]
        task = f'''# Kalter unabhängiger D-Erstpass – Runde {suffix.upper()}

Starte einen neuen Agenten mit `fork_turns="none"`. Keine frühere Unterhaltung, andere Reviews, Synthesen, Diffs oder Anwendungspläne übernehmen. Dieser Auftrag enthält keine erwartete Entscheidung.

Lies ausschließlich die folgenden Eingaben:

- `{round_dir.relative_to(ROOT)}/description-review-campaign.json`
- `{round_dir.relative_to(ROOT)}/description-review-input.json`
- `{round_dir.relative_to(ROOT)}/batches/{batch_id}.input.jsonl`
- Prompt, Fachkriterien und Recordschema im selben Rundeverzeichnis.
- `{(packet / 'bundle').relative_to(ROOT)}/book.pdf`, `book.html`, `book-model.json`, `review-input.json` und `manifest.json`.
- Die beiden JSON-Dateien in `{context.relative_to(ROOT)}` und die dort exakt benannten, gehashten amtlichen Quelldokumente. Keine anderen Repositorydateien oder Verzeichnisse durchsuchen.

Prüfe die Eingabebindungen aus der Kampagne und den Kontextmanifesten. Lies alle {len(manifest['goalIds'])} vollständigen deutschen und englischen Ziele, die aktuellen Eltern/Voraussetzungen/Nachfolger, die vollständigen relevanten Quellpassagen und die dargestellten Abbildungen. Bewerte jeden Punkt der nativen Mathematikkriterien unabhängig. Wende den gebundenen Prompt unverändert an; `keep`, `revise`, `split_review` und `block` bleiben echte Optionen. Formuliere selbst die sechs zielbezogenen bilingualen Understanding-Evidence-Felder. Kein Quellen-, Scope- oder Effektivitätsnachweis darf erfunden werden.

`visualization.qaStatus` und `approvedForPublication` sind nur gebundene Asset-Materialprovenienz. Sie sind keine D-/P-Urteile und keine Autorität für deine Beschreibungseinschätzung. Dieser Lauf begründet keine neue V-Abnahme. Die native Eingabe enthält keine P-Profile oder D-Ergebnisse; leite daraus kein früheres Urteil ab. Die vorgegebenen semantischen Typen sind Scopekontext, keine Beschreibungsempfehlung.

Lies weder die andere Runde noch deren Ergebnisse. Teile vor dem abgeschlossenen eigenen Erstpass keine inhaltlichen Entscheidungen mit dem anderen Reviewer. Schreibe ausschließlich deine eigene echte Run-Metadatei und {len(manifest['goalIds'])} schemafähige Candidate-Records, in nativer Batchreihenfolge:

- `{result_paths[0]}`
- `{result_paths[1]}`

Verwende wahrheitsgemäße tatsächliche Modell-/Provider-/Zeit-/Parameterangaben, den eigenen tatsächlichen Run und die exakten vorgegebenen Kampagnen-/Bundle-/Goal-/Page-Bindungen; keine kopierten oder erfundenen Runbehauptungen. `recordStatus=candidate`, `reviewAuthority=ai_candidate`; keine menschliche Freigabe. Falls eine erforderliche Laufangabe nicht belegbar ist, melde diese konkrete Grenze, statt sie zu erfinden. Prüfe danach mit dem bestehenden nativen Kampagnenvalidator. Antworte dem Koordinator nur mit Ergebnis-/Logpfaden, Hashes, Exitcode und dem Hinweis, ob dein Erstpass abgeschlossen ist. Keine Änderung der Eingaben, Quellen, QA-Ledger oder Policy.
'''
        validation_command = ('./app/node_modules/.bin/tsx app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
                              + ' --bundle ' + str((round_dir / 'review-bundle-manifest.json').relative_to(ROOT))
                              + ' --input ' + str((round_dir / 'description-review-input.json').relative_to(ROOT))
                              + ' --campaign ' + str((round_dir / 'description-review-campaign.json').relative_to(ROOT))
                              + ' --batches-dir ' + str((round_dir / 'batches').relative_to(ROOT))
                              + ' --results-dir ' + str((round_dir / 'results').relative_to(ROOT)))
        task += ('\nDie Rundendateien `prompt.md`, `criteria.md` und `contracts/goal-description-review-record.schema.json` sind die genauen bindenden Anweisungsdateien. Lege bei einem frischen Checkout ausschließlich dein eigenes leeres Ergebnisverzeichnis an und validiere danach deine tatsächlichen Resultate mit diesem Befehl, jeweils vom Repositoryroot:\n\n```bash\nmkdir -p '
                 + str((round_dir / 'results').relative_to(ROOT)) + '\n' + validation_command + '\n```\n')
        with (BASE / ('cold-review-' + suffix + '.md')).open('x') as stream:
            stream.write(task)
    pins = [{'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'bytes': path.stat().st_size}
            for path in sorted(BASE.rglob('*')) if path.is_file()]
    write_json(BASE / 'input-inventory.json', {'schemaVersion': 1, 'candidateSourceSha256': candidate_sha,
        'curricularAtomicDenominator': manifest['curriculumAtomicDenominatorAtPreparation'], 'assignedGoalIds': manifest['goalIds'],
        'sourceContextGoalCount': len(goal_context), 'mappingBindingCount': sum(len(row['bindings']) for row in mappings),
        'runOrReviewRecordsPresent': 0, 'existingDescriptionOrPositiveJudgmentsPresent': False,
        'assetQaMetadataUnchangedMaterialProvenanceOnly': True, 'files': pins})
    print(json.dumps({'contextGoals': len(goal_context), 'sourceBindings': sum(len(row['bindings']) for row in mappings),
                      'assignedGoals': len(manifest['goalIds']), 'reviewRecordsAuthored': 0, 'packetFiles': len(pins)}))


if __name__ == '__main__':
    import sys
    sys.dont_write_bytecode = True
    main()
