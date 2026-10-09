import json
import pathlib
import sys

author = pathlib.Path(__file__).parent.parent / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
materials = json.loads((author / 'eighteen-whole36-bilingual-cases-and-P.author-candidate.json').read_text())
start, end = map(int, sys.argv[1:3])
for entry in materials['entries'][start - 1:end]:
    print('\nWHOLE GOAL', entry['ordinal'], json.dumps(entry['wholeCurrentGoal'], ensure_ascii=False))
    profile = entry['wholeProfile']
    print('PROFILE UNIQUE BODY', json.dumps({k: v for k, v in profile.items() if k != 'applicationCaseBriefs'}, ensure_ascii=False))
    for case, brief in zip(entry['newAuthoredWholeCases'], profile['applicationCaseBriefs']):
        for language in ['De', 'En']:
            task = case['material' + language] + '\n\n' + ('Auftrag: ' if language == 'De' else 'Task: ') + case['task' + language] + '\n\n' + ('Frische Variation: ' if language == 'De' else 'Fresh variation: ') + case['freshTransferTask' + language]
            answer = case['workedResponse' + language] + '\n\nTransfer: ' + case['workedFreshTransfer' + language]
            focus = ' '.join(e['essentialUnderstanding' + language] for e in profile['expectations'])
            assert brief['taskDemand' + language] == task
            assert brief['expectedPerformance' + language] == answer
            assert brief['understandingFocus' + language] == focus
        assert len(case['rubric']) == len(profile['expectations'])
        for rubric, expectation in zip(case['rubric'], profile['expectations']):
            assert rubric['expectationId'] == expectation['id']
            assert rubric['criterionDe'] == expectation['observablePerformanceDe']
            assert rubric['criterionEn'] == expectation['observablePerformanceEn']
        print('WHOLE CASE UNIQUE BODY', json.dumps({k: v for k, v in case.items() if k != 'rubric'}, ensure_ascii=False))
        for rubric in case['rubric']:
            assert rubric['rubricScope'] == 'pair_reference_not_single_case_quota'
            assert rubric['actualEvidenceLocations'] == ['workedResponseDe', 'workedResponseEn', 'workedFreshTransferDe', 'workedFreshTransferEn']
            assert rubric['rubricNoteDe'] == 'Die Kriterien beschreiben zusammen die gesamte Kompetenz. Nur tatsächlich im eigenen Fall bearbeitete Aspekte zählen;zusätzliche Fälle sind keine feste Quote, wenn ausreichende eigenständige Evidenz bereits vorliegt.'
            assert rubric['rubricNoteEn'] == 'Together these criteria describe the whole competence. Count only aspects actually demonstrated in this case;additional cases are no fixed quota once sufficient independent evidence exists.'
        print('WHOLE RUBRIC EXACT REUSE: criteria equal profile; previously read common scope/locations/bilingual notes value-exact')
    print('PROFILE BRIEFS EXACT RECOMPOSITION VERIFIED', entry['goalId'])
