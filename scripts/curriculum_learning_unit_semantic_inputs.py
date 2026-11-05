"""Bounded EN/recall source document and exact-input closure checks.

These checks do not award recognition or infer pedagogical equivalence. Java's
shared SrsGoalCardSelection and immutable catalog remain the selection/admission
authority; this module ensures that their declared evidence survives packaging.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any, Callable, Mapping
from curriculum_learning_unit_offers import exact, sha256, text

RECALL = 'verified-recall-selection-v1'


def texts(value: Any, *, nonempty: bool = False) -> list[str]:
    if not isinstance(value, list) or (nonempty and not value):
        raise ValueError('Learning-unit evidence requires a text list')
    result = [text(item) for item in value]
    if len(set(result)) != len(result):
        raise ValueError('Duplicate learning-unit evidence identity')
    return result


def review_path(value: Any, source_path: Callable[[Any], str]) -> str:
    path = text(value)
    return source_path(path if path.startswith('DE/') else 'DE/Gymnasium/' + path)


def validate(catalog: Mapping[str, Any], read: Callable[[str], bytes], parse: Callable[[bytes], Any],
             source_path: Callable[[Any], str]) -> None:
    for entry in catalog['contracts']:
        contract = parse(read(entry['path']))
        if not isinstance(contract, dict):
            raise ValueError('Learning-unit definition must be an object')
        pins = entry['inputs']

        def pinned(path: Any) -> Any:
            path = source_path(path)
            if path not in pins:
                raise ValueError('Variant/recall evidence path is not pinned')
            return parse(read(path))

        claims = contract.get('assessmentClaims', {})
        if not isinstance(claims, dict):
            raise ValueError('Invalid assessment claim map')
        assessments = entry.get('assessmentInputs', {})
        if not isinstance(assessments, dict):
            raise ValueError('Invalid assessment input map')
        for goal_id, claim in claims.items():
            if not isinstance(claim, dict):
                raise ValueError('Invalid assessment claim')
            variants = claim.get('taskVariants')
            inputs = assessments.get(goal_id, {})
            input_variants = inputs.get('taskVariants') if isinstance(inputs, dict) else None
            if variants is None and input_variants is None:
                continue
            exact(variants, {'en'})
            exact(input_variants, {'en'})
            variant = exact(variants['en'], {'taskRevision', 'rubricRevision', 'reviewRef'})
            pair = exact(input_variants['en'], {'taskPath', 'rubricPath'})
            task_revision = sha256(variant['taskRevision'])
            rubric_revision = sha256(variant['rubricRevision'])
            if rubric_revision != claim.get('rubricRevision'):
                raise ValueError('Translated task must use the unchanged normal rubric')
            task = exact(pinned(pair['taskPath']), {'taskContent', 'solutionContent'})
            text(task['taskContent'])
            text(task['solutionContent'])
            canonical_pair = json.dumps(task, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
            if hashlib.sha256(canonical_pair).hexdigest() != task_revision:
                raise ValueError('Translated task/solution revision differs from the exact delivered pair')
            if pinned(pair['rubricPath']) != pinned(inputs['rubricPath']):
                raise ValueError('Translated rubric differs from the normal rubric')
            review = exact(pinned(review_path(variant['reviewRef'], source_path)), {
                'schemaVersion', 'semantics', 'assessmentGoalId', 'locale', 'coveredGoalIds',
                'coveredGoalMeaningDigests', 'taskRevision', 'rubricRevision', 'independentReviewer', 'decision'})
            if (type(review['schemaVersion']) is not int or review['schemaVersion'] != 1
                    or review['semantics'] != 'assessment-task-variant-review-v1'
                    or review['assessmentGoalId'] != goal_id or review['locale'] != 'en'
                    or review['decision'] != 'same-claim-approved'):
                raise ValueError('Unsupported translated-claim review')
            text(review['independentReviewer'])
            covered = texts(claim['coveredGoalIds'])
            if (set(texts(review['coveredGoalIds'])) != set(covered)
                    or review['taskRevision'] != task_revision or review['rubricRevision'] != rubric_revision
                    or review['coveredGoalMeaningDigests'] != {goal: contract['ownGoalMeaningDigests'][goal] for goal in covered}):
                raise ValueError('Translated review does not bind the exact immutable claim and meanings')
        if any('taskVariants' in inputs and goal not in claims for goal, inputs in assessments.items() if isinstance(inputs, dict)):
            raise ValueError('Translated inputs have no immutable assessment claim')

        recalls = entry.get('recallInputs', {})
        owned = set(texts(contract.get('ownRecallGoalIds', [])))
        if not isinstance(recalls, dict) or set(recalls) != owned:
            raise ValueError('Recall input identities differ from immutable own recall goals')
        if owned:
            if entry.get('recallBindingSemantics') != RECALL:
                raise ValueError('Recall selections require their explicit supported semantics marker')
        elif 'recallBindingSemantics' in entry:
            raise ValueError('Recall semantics marker must be omitted when the contract has no recall goals')
        for goal_id, paths in recalls.items():
            if len(texts(paths)) != 2:
                raise ValueError('Recall inputs require exactly DE and EN selection documents')
            locales: dict[str, set[str]] = {}
            deck_identity: str | None = None
            for path in paths:
                selection = exact(pinned(path), {'schemaVersion', 'semantics', 'goalId', 'locale', 'deckId',
                    'sourcePath', 'deckPath', 'deckSha256', 'filterTags', 'requiredCardIds', 'reviewRef'})
                locale = selection['locale']
                if (type(selection['schemaVersion']) is not int or selection['schemaVersion'] != 1
                        or selection['semantics'] != RECALL or selection['goalId'] != goal_id
                        or locale not in ('de', 'en') or locale in locales):
                    raise ValueError('Unsupported recall selection document')
                source = text(selection['sourcePath'])
                if not source.startswith('/data/') or '\\' in source or any(part in ('', '.', '..') for part in source[1:].split('/')):
                    raise ValueError('Invalid delivered recall source locator')
                texts(selection['filterTags'])
                required = set(texts(selection['requiredCardIds'], nonempty=True))
                locales[locale] = required
                identity = text(selection['deckId'])
                if deck_identity is not None and identity != deck_identity:
                    raise ValueError('Recall locales disagree on the durable deck identity')
                deck_identity = identity
                deck_path = source_path(selection['deckPath'])
                deck = pinned(deck_path)
                if hashlib.sha256(read(deck_path)).hexdigest() != sha256(selection['deckSha256']):
                    raise ValueError('Recall deck bytes differ from the pinned selection')
                if not isinstance(deck, dict) or deck.get('deckId') != identity or not isinstance(deck.get('cards'), list):
                    raise ValueError('Recall deck identity or cards are invalid')
                ids: list[str] = []
                for card in deck['cards']:
                    if not isinstance(card, dict):
                        raise ValueError('Recall card must be an object')
                    ids.append(text(card.get('id')))
                    text(card.get('front'))
                    text(card.get('back'))
                if len(ids) != len(set(ids)) or not required <= set(ids):
                    raise ValueError('Recall cards are duplicated or a required stable ID is absent')
                pinned_review = review_path(selection['reviewRef'], source_path)
                if pinned_review not in pins:
                    raise ValueError('Recall independent review is not pinned')
                read(pinned_review)
            if set(locales) != {'de', 'en'} or locales['de'] != locales['en']:
                raise ValueError('Recall locales must retain the same nonempty stable card-ID set')
