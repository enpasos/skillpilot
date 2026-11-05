#!/usr/bin/env python3
"""Finite EN/recall packaging evidence checks; no learner or live content writes."""
import copy
import hashlib
import json
from pathlib import Path
import curriculum_learning_unit_artifacts as units
import curriculum_learning_unit_semantic_inputs as semantic


def run() -> None:
    prefix = 'DE/Gymnasium/learning-units/inputs/fixture/'
    contract_path = 'DE/Gymnasium/learning-units/contracts/fixture/1.json'
    en_task = {'taskContent': 'Explain the projection.', 'solutionContent': 'Compare the two projections.'}
    revision = hashlib.sha256(json.dumps(en_task, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    rubric_revision = 'a' * 64
    meanings = {'A': 'b' * 64}
    claim = {'coveredGoalIds': ['A'], 'taskRevision': 'c' * 64, 'rubricRevision': rubric_revision,
             'reviewRef': 'quality/learning-units/de.md',
             'taskVariants': {'en': {'taskRevision': revision, 'rubricRevision': rubric_revision,
                                    'reviewRef': 'quality/learning-units/en.json'}}}
    contract = {'contractId': 'fixture', 'revision': '1', 'ownRecallGoalIds': [],
                'assessmentClaims': {'Q': claim}, 'ownGoalMeaningDigests': meanings}
    documents = {
        contract_path: contract,
        prefix + 'de.task.json': {'taskContent': 'Erkläre die Projektion.', 'solutionContent': 'Vergleiche beide Projektionen.'},
        prefix + 'en.task.json': en_task,
        prefix + 'rubric.json': {'maxPoints': 10},
        'DE/Gymnasium/quality/learning-units/en.json': {
            'schemaVersion': 1, 'semantics': 'assessment-task-variant-review-v1', 'assessmentGoalId': 'Q',
            'locale': 'en', 'coveredGoalIds': ['A'], 'coveredGoalMeaningDigests': meanings,
            'taskRevision': revision, 'rubricRevision': rubric_revision,
            'independentReviewer': 'independent-fixture-reviewer', 'decision': 'same-claim-approved'},
    }
    entry = {'path': contract_path, 'inputs': {path: 'd' * 64 for path in documents if path != contract_path},
             'assessmentInputs': {'Q': {'taskPath': prefix + 'de.task.json', 'rubricPath': prefix + 'rubric.json',
                'taskVariants': {'en': {'taskPath': prefix + 'en.task.json', 'rubricPath': prefix + 'rubric.json'}}}},
             'recallInputs': {}}

    def check(candidate_entry, candidate_documents):
        raw = {path: value if isinstance(value, bytes) else json.dumps(value).encode() for path, value in candidate_documents.items()}
        semantic.validate({'contracts': [candidate_entry]}, raw.__getitem__, units._json, units.source_path)

    check(entry, documents)
    failures = 0

    def reject(changed_entry, changed_documents):
        nonlocal failures
        try:
            check(changed_entry, changed_documents)
        except (KeyError, TypeError, ValueError):
            failures += 1
        else:
            raise AssertionError('Invalid EN/recall evidence was accepted')

    changed = copy.deepcopy(documents)
    changed[contract_path]['assessmentClaims']['Q']['taskVariants'] = {'fr': claim['taskVariants']['en']}
    reject(entry, changed)
    changed = copy.deepcopy(documents)
    changed[prefix + 'en.task.json']['taskContent'] = 'Different claim.'
    reject(entry, changed)
    changed = copy.deepcopy(documents)
    changed['DE/Gymnasium/quality/learning-units/en.json']['coveredGoalMeaningDigests'] = {'A': 'e' * 64}
    reject(entry, changed)
    changed = copy.deepcopy(documents)
    changed['DE/Gymnasium/quality/learning-units/en.json']['decision'] = 'pending'
    reject(entry, changed)
    changed = copy.deepcopy(documents)
    changed['DE/Gymnasium/quality/learning-units/en.json']['schemaVersion'] = True
    reject(entry, changed)

    recall_entry = copy.deepcopy(entry)
    recall_documents = copy.deepcopy(documents)
    recall_documents[contract_path]['ownRecallGoalIds'] = ['K']
    recall_entry['recallBindingSemantics'] = semantic.RECALL
    selections = []
    for locale in ('de', 'en'):
        deck_path = prefix + f'deck.{locale}.json'
        deck = {'deckId': 'deck-one', 'cards': [{'id': 'card-one', 'front': f'Front {locale}', 'back': f'Back {locale}'}]}
        recall_documents[deck_path] = deck
        deck_sha = hashlib.sha256(json.dumps(deck).encode()).hexdigest()
        path = prefix + f'K.{locale}.selection.json'
        selections.append(path)
        recall_documents[path] = {'schemaVersion': 1, 'semantics': semantic.RECALL, 'goalId': 'K', 'locale': locale,
            'deckId': 'deck-one', 'sourcePath': f'/data/deck.{locale}.json', 'deckPath': deck_path,
            'deckSha256': deck_sha, 'filterTags': [], 'requiredCardIds': ['card-one'],
            'reviewRef': 'quality/learning-units/recall.md'}
    recall_documents['DE/Gymnasium/quality/learning-units/recall.md'] = b'Independent fixture selection review.\n'
    recall_entry['recallInputs'] = {'K': selections}
    recall_entry['inputs'] = {path: 'd' * 64 for path in recall_documents if path != contract_path}
    check(recall_entry, recall_documents)
    changed_entry = copy.deepcopy(recall_entry)
    del changed_entry['recallBindingSemantics']
    reject(changed_entry, recall_documents)
    changed_entry = copy.deepcopy(recall_entry)
    changed_entry['recallInputs']['K'] = [prefix + 'deck.de.json', prefix + 'deck.en.json']
    reject(changed_entry, recall_documents)
    changed = copy.deepcopy(recall_documents)
    changed[selections[1]]['requiredCardIds'] = ['card-missing']
    reject(recall_entry, changed)
    changed = copy.deepcopy(recall_documents)
    changed[selections[1]]['locale'] = 'de'
    reject(recall_entry, changed)
    changed = copy.deepcopy(recall_documents)
    changed[selections[0]]['deckSha256'] = 'f' * 64
    reject(recall_entry, changed)
    print(f'Finite EN/recall input evidence: valid bilingual pairs/selections and {failures} negative cases passed; Java remains selection/admission authority.')


if __name__ == '__main__':
    run()
