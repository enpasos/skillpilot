# SPDX-License-Identifier: Apache-2.0
"""Serialize one deliberately authored correction; preserve all other 51 cases."""
from pathlib import Path
from datetime import datetime, timezone
from hashlib import sha256
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'chemie-b008-targeted-material-corrections-author-v9'
SOURCE = AUTHOR / 'fifty-two-cases.de-en.author-candidate.json'
TARGET = OWN / 'fifty-two-cases.de-en.author-candidate.json'
data = json.loads(SOURCE.read_text())
original = json.loads(SOURCE.read_text())
case_key = 'upper-hypothesis-investigation-colour-analysis'
case = next(r for r in data['cases'] if r['caseKey'] == case_key)
before = json.loads(json.dumps(case))
case['transfer']['de'] = (
    'Begründe für den bereitgestellten Modellwert A = 0,810, weshalb die gültige '
    'Kalibration 0–6 mg/L mit ihrem oberen Modellwert A = 0,490 keine Auswertung '
    'der unverdünnten Probe erlaubt. Wähle eine zweifache Verdünnung als ersten '
    'Prüfversuch: 10,00 mL Aliquot im 20,00-mL-Messkolben bis Marke auffüllen und '
    'mischen; erläutere die Gerätefehlergrenzen. Dieser Vorschlag garantiert '
    'noch keinen Wert im gültigen Bereich. Erst eine neue tatsächliche '
    'In-Bereich-Messung mit eigener gültiger Kalibration erlaubt die Bestimmung '
    'von cverdünnt und die Rückrechnung cunverdünnt = 2·cverdünnt. Liegt der neue '
    'Wert weiterhin außerhalb, ist eine weitere bekannte Verdünnung und eine '
    'neue gültige Messung erforderlich; den Gesamtfaktor dokumentieren. Aus '
    'A = 0,810 wird weder die ursprüngliche Konzentration noch der neue '
    'Messwert extrapoliert. Modellplanung ersetzt keine Durchführung. Echte '
    'Ausführung verlangt Freigabe, eigenen Volumenlog und eigene Messwerte.'
)
case['transfer']['en'] = (
    'For the supplied model value A = 0.810, explain why the valid 0–6 mg/L '
    'calibration with its upper model value A = 0.490 does not permit evaluation '
    'of the undiluted sample. Choose a twofold dilution as an initial trial: '
    'dilute a 10.00-mL aliquot to the mark in a 20.00-mL flask and mix; explain '
    'instrument error limits. This proposal does not yet guarantee a value '
    'within the valid range. Only a new actual in-range reading using own '
    'valid calibration permits determination of cdiluted and back-calculation '
    'cundiluted = 2·cdiluted. If the new reading remains outside the range, '
    'another known dilution and a new valid reading are required; record the '
    'overall factor. Neither original concentration nor the new reading is '
    'extrapolated from A = 0.810. Model planning does not replace execution. '
    'Actual execution requires authorisation, own volume log and own readings.'
)
changed = []
for old, new in zip(original['cases'], data['cases']):
    if old != new:
        assert old['caseKey'] == new['caseKey'] == case_key
        assert {k: v for k, v in old.items() if k != 'transfer'} == {k: v for k, v in new.items() if k != 'transfer'}
        assert set(old['transfer']) == set(new['transfer']) == {'de', 'en'}
        changed.extend([{'caseKey': case_key, 'field': 'transfer.' + language,
                         'before': old['transfer'][language], 'after': new['transfer'][language]}
                        for language in ['de', 'en']])
assert len(data['cases']) == 52 and len(changed) == 2
data['artifactKind'] = 'targeted-positive-material-author-candidate-v10'
data['authoredAtUTC'] = datetime.now(timezone.utc).isoformat()
data['author'] = 'Codex Root targeted calibration-domain correction author'
assert data['nativeEvidenceApproved'] is False and data['strictCompletionsAdded'] == 0
def write(path, value):
    with path.open('x') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')
write(TARGET, data)
write(OWN / 'two-transfer-field-deltas.author.json', {
    'schemaVersion': 1, 'createdAtUTC': data['authoredAtUTC'],
    'role': 'one targeted authored response to an actual independent v9 A finding; no approval',
    'previousAuthor': {'path': str(SOURCE.relative_to(ROOT)), 'sha256': sha256(SOURCE.read_bytes()).hexdigest()},
    'currentAuthor': {'path': str(TARGET.relative_to(ROOT)), 'sha256': sha256(TARGET.read_bytes()).hexdigest()},
    'caseKey': case_key, 'literalChangedFields': changed,
    'unchangedWholeCases': 51, 'changedWholeCases': 1,
    'unchangedWithinChangedCase': [k for k in before if k != 'transfer'],
    'authoredDecision': 'Remove predictions inferred by extrapolating outside the calibration domain; retain dilution factor2 as a conditional trial and require a new valid reading before concentration/back-calculation.',
    'arithmeticCheck': {'upperValidConcentrationMgL': 6, 'upperValidModelAbsorbance': 0.010 + 0.080 * 6, 'givenOutsideModelAbsorbance': 0.810, 'dilutionFactor': 20 / 10, 'newAbsorbanceInvented': False, 'originalConcentrationExtrapolated': False},
    'twoIndependentFollowups': 'pending', 'candidateGoalIdsStillNull': True,
    'nativeEvidenceApproved': False, 'humanApproval': False, 'learnerPerformanceRecorded': False,
    'activeWrites': False, 'strictCompletionsAdded': 0, 'restoredActiveBindings': 0,
})
print(json.dumps({'authoredChangedCases': 1, 'literalFields': 2, 'wholeUnchangedCases': 51, 'nativeEvidenceApproved': False, 'strictGain': 0}))
