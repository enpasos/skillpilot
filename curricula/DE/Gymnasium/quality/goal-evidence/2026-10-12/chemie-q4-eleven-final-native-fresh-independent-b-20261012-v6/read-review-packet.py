import json
import sys
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5')
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2')
ROWS = [json.loads(s) for s in (BASE / 'native-D11/round-b/batches/chemie-q4-eleven-current220-final-native-20261012-v5-first-pass-b.batch-001.input.jsonl').read_text().splitlines()]
PROFILES = {p['goalId']: p for p in map(json.loads, (BASE / 'positive/P11.current-corrected-images.normal.review.jsonl').read_text().splitlines())}
CASES = json.loads((AUTHOR / 'cases/whole11.DEEN.cases-material-data-modelanswers-rubrics.json').read_text())['cases']

def packet(index):
    goal = ROWS[index]['goal']
    gid = goal['goalId']
    profile = PROFILES[gid]['profile']
    cases = [x for x in CASES if x['goalId'] == gid]
    assert profile['applicationCaseBriefs'] == [x['case'] for x in cases]
    expectations = profile['expectations']
    output_cases = []
    proofs = []
    for case in cases:
        c = json.loads(json.dumps(case))
        cid = c['case']['id']
        proof = {'caseId': cid}
        for language, suffix in [('de', 'De'), ('en', 'En')]:
            answer = c['modelAnswer'][language]
            matches = [e['id'] for e in expectations if e['observablePerformance' + suffix] == answer]
            assert matches
            assert c['case']['expectedPerformance' + suffix] == answer
            assert c['rubric']['fullCreditEvidence' + suffix] == answer
            proof[language + 'ModelAndExpectedAndFullCreditExactExpectationIds'] = matches
            del c['modelAnswer'][language]
            del c['case']['expectedPerformance' + suffix]
            del c['rubric']['fullCreditEvidence' + suffix]
            material = c['materialAndData'][language]
            if c['case']['taskDemand' + suffix].startswith(material):
                proof[language + 'MaterialDataExactTaskPrefix'] = True
                del c['materialAndData'][language]
        if not c['modelAnswer']:
            del c['modelAnswer']
        if not c['materialAndData']:
            del c['materialAndData']
        output_cases.append(c)
        proofs.append(proof)
    return {
        'goalAndWholeNativeContext': {**{k: v for k, v in goal.items() if k != 'reviewContext'}, 'page': goal['reviewContext']['page']},
        'wholeProfile': {k: v for k, v in profile.items() if k != 'applicationCaseBriefs'},
        'wholeCasesWithOnlyProvedRepeatedTextElided': output_cases,
        'exactDuplicateTextProof': proofs,
        'allApplicationCaseBriefsExactlyPresentAsWholeCaseFields': True,
    }

if __name__ == '__main__':
    for index in map(int, sys.argv[1:]):
        print(json.dumps(packet(index), ensure_ascii=False, separators=(',', ':')))
