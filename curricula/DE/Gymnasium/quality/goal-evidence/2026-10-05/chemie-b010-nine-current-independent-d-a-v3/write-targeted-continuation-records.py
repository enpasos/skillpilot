#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reuse exact valid own judgments and record actual two-page image continuations."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json
ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
PREPARED = OWN.parent / 'chemie-b010-five-corrected-image-current-candidate-v3'
PRIOR_REVIEW = OWN.parent / 'chemie-b010-nine-current-independent-d-a-v2'
ROUND = PREPARED / 'native-finalbook/round-a'
def read(p): return json.loads(Path(p).read_text())
def digest(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(name, value): (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
campaign = read(ROUND / 'description-review-campaign.json')
inputs = read(ROUND / 'description-review-input.json')
bundle = read(PREPARED / 'native-finalbook/bundle/manifest.json')
delta = read(OWN / 'exact-v1-v3-nine-D-input-deltas.actual.receipt.json')
old_path = PRIOR_REVIEW / 'results/chemie-b010-five-prospective-current-20261005-v1-first-pass-a.batch-001.records.jsonl'
assert digest(old_path) == 'sha256:09423be1593133ae9784cb7be14ce22dd013ca27c005a3f5c4fe8072a419194d'
old_records = {r['goalId']: r for r in [json.loads(line) for line in old_path.read_text().splitlines()]}
assert digest(PRIOR_REVIEW / 'reviewer-output.freeze.manifest.json') == 'sha256:d46c2aa647e6bb7368b9d2e7550781a777f73988c544b87f26dc7f0de4bd3dcb'
for r in read(PRIOR_REVIEW / 'reviewer-output.freeze.manifest.json')['files']:
    # Historical reviewer output is immutable; its own recorded path field is
    # repository-relative and all original bytes remain part of the evidence.
    assert digest(ROOT / r['path']).removeprefix('sha256:') == r['sha256']
assert delta['unchangedSevenGoalPageInputs'] == 7 and delta['changedTwoActualImagePageInputs'] == 2
assert {r['goalId'] for r in read(OWN / 'actual-current-two-html.receipt.json')['rows']} == {
    '16a80de2-b5e0-5467-a9b3-5860730d7d8b', '1f5ee84f-245a-5a1e-a260-f960f26523e9'
}

run_id = 'chemie-b010-nine-independent-current-d-a-20261005-v3'
rows = []
for goal in inputs['goals']:
    row = dict(old_records[goal['goalId']])
    change = next(r for r in delta['rows'] if r['goalId'] == goal['goalId'])
    row.update({'recordId': run_id + '.' + goal['goalId'], 'runId': run_id, 'campaignId': campaign['campaignId'],
                'roundId': campaign['roundId'], 'bundleFingerprint': inputs['bundleFingerprint'], 'bookDigest': inputs['bookDigest']})
    for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
        row[key] = goal[key]
    if not change['exactDeltas']:
        row['rationale'] += ' Gezielte v3-Fortsetzung: Das vollständige native Goal-/Page-Review-Input-Objekt einschließlich Bild, Bibliografie-/Kontextdaten und aller Fingerprints ist gegenüber meinem gültigen v2-Urteil exakt identisch. Dieses eigene unabhängige Urteil wird deshalb mit explizitem Ganzobjektvergleich erhalten; keine erneute fachliche Prüfung oder neue Bildfreigabe behauptet. Nur das nativ neu erzeugte Buch-/Bundle-/Campaign-Envelope wird aktuell gebunden.'
    elif goal['goalId'].startswith('16a80de2'):
        row['rationale'] = ('keep: Vollständige bilingual operative Beschreibung und alle Quellen-/Sek-I-/GK-LK-/Atomaritätsurteile bleiben exakt wie unabhängig in v2 geprüft. Zwei Produktwege werden verglichen; OH⁻ begründet die alkalische Lösung. Die frühere Seite mit untergetauchtem Natrium und Flamme wurde nach tatsächlich bestätigtem Befund auf HOLD gesetzt; der historische Review bleibt unverändert erhalten. '
            'Jetzt wurden die vollständige neue native PDF-Seite 6 und der tatsächlich gerenderte HTML-Abschnitt mit exact PNG 4a6674b85296131850c39fd6a87fe20eb567943cf6a2597ff9a100756c392087 angesehen. Das Natrium liegt auf einer eindeutigen Wasseroberfläche, ohne Flamme; 2 Na + 2 H₂O → 2 NaOH + H₂ sowie Na₂O + H₂O → 2 NaOH sind richtig. NaOH → Na⁺ + OH⁻ und die OH⁻-Begründung verbinden beide Panels fachlich. Original sowie tatsächliche 360-/680-px-Bilder sind gelesen; wichtige Gleichungen und Oberflächenrelation bleiben erkennbar. Der aktuelle Alttext entspricht diesem tatsächlichen Vergleich. Titel, vollständige Beschreibung, ID, Breadcrumb und externe Voraussetzungen sind lesbar. Der offene e0-Quellen-/Operatorfall wird nicht durch diese Seite freigegeben. Nur zwei tatsächliche Bildseiten werden neu geprüft; semantische Payloads werden nicht reautoriert. Menschliche Freigabe und Erprobung bleiben offen.')
    else:
        assert goal['goalId'].startswith('1f5ee84f')
        row['rationale'] = ('keep: HE10.3 benennt Düngemittel bei Salz-Anwendungen/Umwelterziehung; die exakt unveränderte bilinguale Beschreibung verlangt einen einfachen, datenabhängigen Nutzen-Risiko-Bezug und bleibt eine integrierte Salz-/Transport-Anwendung. Die bisherige pauschale Seitenbildbeurteilung war für den später unabhängig bestätigten falschen Phosphat→Nitrat-Pfeil unzureichend und wird für das alte JPG nicht fortgeführt. '
            'Die neue vollständige native PDF-Seite 11 und der tatsächliche HTML-Abschnitt wurden mit exact PNG 29204d030d780a41fc3f9b0dc35a75dc94c5094f6e23710b2ce98b0e851b67fb angesehen. Die orange Route endet jetzt am Phosphat-/Bodenbindungszeichen und führt über Abschwemmung/Erosion ins Oberflächengewässer. Die zulässige blaue NH₄⁺→NO₃⁻-Umwandlung sowie Nitrat-Auswaschung ins Grundwasser bleiben getrennt. Original und tatsächliche 360-/680-px-Ausgaben wurden fachlich/visuell gelesen: drei Ionenfelder, Pflanze und getrennte Wasserwege sind klar; kleine Transporttexte sind Zusatzorientierung zu extern vorgegebenen Aufgabenangaben. Der Generator hat ebenfalls die früheren Pflanzenaufnahme-Pfeile/-Beschriftung entfernt; diese ganze Ausgabe wurde tatsächlich geprüft und nicht als pixelgleiche Pfeilkorrektur ausgegeben. Der passende neue Alttext macht PO₄³⁻ zur schematischen Nährstoffkategorie statt einer dominanten freien Boden-Spezies. Quellen-, Operator-, Niveau-, Voraussetzung- und Atomaritätsdaten bleiben exakt gültig; die b508-Vorbedingung und vollständige Beschreibung sind auf der Seite lesbar. Keine Agronomie-Gesamtkompetenz, menschliche Freigabe oder Erprobung behauptet.')
    assert len(row['rationale']) <= 4000
    rows.append(row)
results = OWN / 'results'
results.mkdir(exist_ok=False)
batch = campaign['batches'][0]
output = results / (batch['batchId'] + '.records.jsonl')
output.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in rows))
params = {'provider': 'OpenAI Codex', 'modelIdentity': 'Exact model identifier not exposed', 'agentTask': 'chem_b010_current_d_a',
    'reviewMethod': 'Explicit exact reuse of seven whole goal/page input objects; targeted actual native PDF/HTML/new PNG/original/360/680 review for two changed image pages.',
    'noNewScientificGoalAuthorship': True, 'blindToOtherDescriptionRound': True,
    'disclosure': 'Parent supplied confirmed two image faults and corrected PNGs; separate independent machine V records used for technical import/QA binding. No new D-B verdict read. Own seven previous D-A judgments retained only after exact entire-input equality. Root independently reviewed P candidates were copied unchanged for native binding, not used as new D judgments.',
    'temperature': None, 'exactSamplingSettingsInvented': False}
write('actual-review-parameters.json', params)
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': bundle['bundleFingerprint'], 'bookDigest': bundle['bookModelDigest'],
    'provider': 'OpenAI Codex', 'model': 'Codex reviewer; exact model identifier not exposed', 'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(OWN / 'actual-review-parameters.json'), 'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True, 'goalIds': [r['goalId'] for r in rows],
    'inputArtifacts': [{'role': r['role'], 'digest': r['digest']} for r in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': delta['reviewStartedAtUTC'], 'completedAt': datetime.now(timezone.utc).isoformat(), 'status': 'completed',
    'outputDigest': digest(output), 'toolchainVersion': 'goal-description-review-v1'}
(results / (batch['batchId'] + '.run.json')).write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'records': len(rows), 'currentKeep': 9, 'reusedExactUnchangedPageInputs': 7, 'actualChangedImagePageContinuations': 2, 'recordsSHA256': digest(output)}))
