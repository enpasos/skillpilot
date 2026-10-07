"""Serialize actual Root targeted D decisions; reuse fourteen exact valid inputs."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'
AUTHOR = BASE / 'chemie-four-final-images-native-d17-plus-c441-p18-technical-author-20261007-v1'
OLD = BASE / 'chemie-next17-fresh-blind-independent-a-20261007-v1'
NATIVE = AUTHOR / 'native-root'
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

changed = {
 '0bf26276-2780-506c-ac34-35dd44a29409': 'Die tatsächlich betrachtete aktuelle PDF-Seite bindet den ganzen unveränderten DE-Satz und den vollständigen EN-Input an die neue pH-Abbildung. Die Pfeile treffen die gegebenen Beispielwerte 2, 7 und 10; Zahn, Gewässer und Hautschutz illustrieren Folgen, ohne pH allein als Stoffidentität oder allgemeine Gefährdung zu deuten. Die fachliche Bewertungsleistung bleibt dieselbe; die schon unabhängig geprüften konkreten P-Fälle und Grenzen bleiben gültig.',
 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4': 'Die aktuelle reale PDF-Seite zeigt den vollständigen unveränderten DE-Satz; der vollständige EN-Satz hat dieselbe Nachweis- und Auswertungskompetenz. Das neue Bild zeigt Flammenproben, mit Salpetersäure angesäuerten Chloridnachweis und weißen AgCl-Niederschlag sowie den Schluss von reinem NaCl zu 1:1. Der deutliche Hinweis Ionen ≠ Salzpaare verhindert die unzulässige Zuordnung sämtlicher nachgewiesener Ionen in einem Gemisch zu ursprünglichen Salzen. Keine neue Quellen- oder Verfahrensbehauptung.',
 '9751b6d8-cde3-527b-b37c-babb6cee79d2': 'Die aktuelle PDF-Seite und der vollständige EN-Input beziehen die Erklärung einheitlich auf reversible Protonenübergänge. Im neuen Bild sind NH3 + H2O ⇌ NH4+ + OH− sowie die beiden zugrunde liegenden Zusatzreaktionen stöchiometrisch und ladungsbezogen korrekt. Säurezugabe erhöht im qualitativen Modell den NH4+-Anteil, Hydroxidzugabe den NH3-Anteil. Es werden keine absoluten Konzentrationen oder universellen pH-Werte behauptet. Die sichtbare Voraussetzung 597 und die externe Reversibilitätskompetenz passen zur abgegrenzten Erklärung.',
 'c441d9e8-d9d9-5e55-a189-a37345541321': 'Die aktuelle tatsächliche PDF-Seite trägt den ganzen DE-Satz und das korrigierte Bild; der vollständige EN-Satz ist deckungsgleich. Die gemeinsame Kompetenz verbindet Elektronenübergang, Edelgaskonfiguration und Gesamtenergiebilanz einer Salzbildung. Die Abbildung trennt Elemente, gasförmige Ionen und das tiefere feste Gitter; Gasförmige ist korrekt geschrieben und die Pfeile enden an den richtigen Energieniveaus. Der netto endotherme Modellweg zu Na+(g)/Cl−(g) ist keine Behauptung, jeder Teilschritt sei endotherm. Die NaCl-Bilanz −410 und der getrennte illustrative MgO-Transfer −600 kJ/mol passen; Exothermie wird nicht mit Spontaneität oder Aktivierungsenergie gleichgesetzt.',
}
current_inputs = {}
for name in ['native-d-seventeen', 'native-d-c441']:
    for g in read(NATIVE / name / 'round-a/description-review-input.json')['goals']:
        current_inputs[g['goalId']] = g
first = {'documentType': 'actual targeted independent Root D first pass',
 'startedAtUTC': '2026-10-07T07:20:34+00:00', 'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'reviewedActualPhysicalPages': ['0bf26276.physical-05.png','a44af1fa.physical-14.png','9751b6d8.physical-16.png','c441d9e8.physical-03.png'],
 'wholeCurrentDeEnInputs': [{'goalId': g, 'input': current_inputs[g], 'decision': 'keep', 'rationale': r} for g, r in changed.items()],
 'judgmentBasis': 'Actual new PDF pages and whole four DE/EN inputs; Root own earlier sealed visual judgments; no current final D peer judgments read.',
 'c441PositiveProfile': {'decision': 'keep', 'actualCasesReadDeEn': 2, 'checks': 'Na shell 2|8, Cl 2|8|8; 108+122+496−349−787=−410; Mg/O both 2|8, MgO1:1; 3000−3600=−600; model values not measurements and enthalpy not spontaneity.'},
 'unmodifiedFourteenReviewPolicy': 'Reuse valid original independent A records only after exact whole-input and page fingerprint equality; no fourteen renewed scientific reviews.',
 'strictGain': 0, 'humanApproval': False, 'humanTrial': False}
if (OUT / 'own-four-first-pass.seal.json').exists():
    first = read(OUT / 'own-four-actual-pages-and-whole-inputs.first-pass.json')
    assert sha(OUT / 'own-four-actual-pages-and-whole-inputs.first-pass.json') == read(OUT / 'own-four-first-pass.seal.json')['sha256']
else:
    write(OUT / 'own-four-actual-pages-and-whole-inputs.first-pass.json', first)
    write(OUT / 'own-four-first-pass.seal.json', {'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'path': str((OUT/'own-four-actual-pages-and-whole-inputs.first-pass.json').relative_to(ROOT)), 'sha256': sha(OUT/'own-four-actual-pages-and-whole-inputs.first-pass.json')})

old_records_path = next((OLD / 'native-d-a/results').glob('*.records.jsonl'))
old_records = {a['goalId']: a for a in map(json.loads, old_records_path.read_text().splitlines())}
old_inputs = {a['goalId']: a for a in read(OLD / 'native-d-a/description-review-input.json')['goals']}
reuse = []
for name in ['native-d-seventeen', 'native-d-c441']:
    native = NATIVE / name
    campaign = read(native / 'round-a/description-review-campaign.json')
    inp = read(native / 'round-a/description-review-input.json')
    bundle = read(native / 'bundle/manifest.json')
    batch = campaign['batches'][0]
    run_id = OUT.name + '-' + name + '-run-001'
    records = []
    for ordinal, goal in enumerate(inp['goals'], 1):
        gid = goal['goalId']
        if gid in old_records:
            rec = copy.deepcopy(old_records[gid])
            if gid not in changed:
                assert old_inputs[gid] == goal, gid
                assert rec['pageFingerprint'] == goal['pageFingerprint']
                reuse.append({'goalId':gid,'wholeCurrentInputExact':True,'pageFingerprintExact':True,'originalRecordId':rec['recordId'],'originalRunId':rec['runId'],'originalRecordsPath':str(old_records_path.relative_to(ROOT)),'originalRecordsDigest':sha(old_records_path)})
            else:
                rec['rationale'] = changed[gid]
        else:
            rec = copy.deepcopy(next(iter(old_records.values())))
            rec['rationale'] = changed[gid]
            rec['understandingEvidence'] = {
                'essentialUnderstandingDe': 'Die Gesamtenergiebilanz aus Elementvorbereitung, Ionenbildung und Gitterbildung erklärt die exotherme Salzbildung; Edelgaskonfiguration allein ist keine Energiebilanz.',
                'essentialUnderstandingEn': 'The total energy balance of preparing elements, forming ions and forming the lattice explains exothermic salt formation; noble-gas configuration alone is no energy balance.',
                'observablePerformanceDe': 'Die lernende Person begründet Na+ und Cl− mit Elektronenübergang und Schalenbelegungen 2|8 beziehungsweise 2|8|8 und bilanziert die fünf gelieferten NaCl-Modellwerte zu −410 kJ/mol; sie benennt die energiefreisetzende Rolle des Gitters.',
                'observablePerformanceEn': 'The learner explains Na+ and Cl− using electron transfer and shell occupancies 2|8 and 2|8|8, sums the five supplied NaCl model values to −410 kJ/mol and identifies the energy-releasing role of lattice formation.',
                'transferExpectationDe': 'Im unabhängigen MgO-Modell leitet die lernende Person Elektronen- und Ionenverhältnis 1:1 und beide Schalenbelegungen 2|8 ab, bilanziert +3000−3600=−600 kJ/mol und widerlegt universelle Energieabgabe bei Ionenbildung sowie den Schluss auf spontane Bildung oder Aktivierungsenergie.',
                'transferExpectationEn': 'In the separate MgO model the learner derives the electron and ion ratio 1:1 and both shell occupancies 2|8, balances +3000−3600=−600 kJ/mol and rejects universal energy release in ion formation and claims about spontaneous formation or activation energy.'}
        rec.update({k:goal[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
        rec.update({'recordId':run_id+'-'+str(ordinal).zfill(2),'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bookDigest':bundle['bookModelDigest'],'bundleFingerprint':bundle['bundleFingerprint']})
        records.append(rec)
    result_dir = OUT / name / 'results'
    result_dir.mkdir(parents=True, exist_ok=True)
    record_path = result_dir / (batch['batchId']+'.records.jsonl')
    exact_records = ''.join(json.dumps(rec,ensure_ascii=False,separators=(',',':'))+'\n' for rec in records)
    if record_path.exists():
        assert record_path.read_text() == exact_records
    else:
        with record_path.open('x') as f:f.write(exact_records)
    params = json.dumps({'actualReviewer':'Root GPT-6 Codex','targetedNewWholeInputs':len([g for g in inp['goals'] if g['goalId'] in changed]),'unchangedValidInputsReused':len([g for g in inp['goals'] if g['goalId'] not in changed]),'servingModelVariantExposed':False},sort_keys=True).encode()
    run = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,
        **{k:campaign[k] for k in ['campaignId','roundId','bundleFingerprint','bookDigest','promptFingerprint','criteriaFingerprint','independenceGroupId']},
        'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'provider':'OpenAI','model':'GPT-6 Codex; exact serving variant not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','generationParametersFingerprint':'sha256:'+hashlib.sha256(params).hexdigest(),'blindToOtherRuns':True,'goalIds':batch['goalIds'],
        'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']] + [{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
        'startedAt':first['startedAtUTC'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':sha(record_path),'toolchainVersion':'skillpilot-native-review-v3'}
    write(result_dir/(batch['batchId']+'.run.json'),run)
assert len(reuse)==14
write(OUT/'fourteen-unmodified-valid-native-inputs-and-records.reuse.json',reuse)
print(json.dumps({'newWholeDReviews':4,'unchangedValidDInputsReused':14,'strictGain':0,'humanApproval':False}))
