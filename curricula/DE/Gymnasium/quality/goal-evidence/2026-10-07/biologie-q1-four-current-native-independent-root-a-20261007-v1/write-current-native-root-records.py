"""Serialize Root's actual Bio4 scientific decisions under native contracts."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
AUTHOR = BASE / 'biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1'
V2 = BASE / 'biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v2'
NATIVE = AUTHOR / 'native/four'
RID = 'biologie-q1-four-current-independent-root-a-20261007-v2'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p): return json.loads(p.read_text())
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
def lines(p): return list(map(json.loads, p.read_text().splitlines()))
def write_lines(p, rows):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        for row in rows: f.write(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n')

own = read(OUT / 'own-first-pass-current-four-science-and-actual-visual.root-a.json')
campaign = read(NATIVE / 'round-a/description-review-campaign.json')
inp = read(NATIVE / 'round-a/description-review-input.json')
bundle = read(NATIVE / 'round-a/review-bundle-manifest.json')
profiles = lines(V2 / 'native/positive-four.current-author-candidate.jsonl')
prior = {r['goalId']: r for r in lines(AUTHOR / 'native/positive-four.current-author-candidate.jsonl')}
profile_by_id = {r['goalId']: r for r in profiles}
for p in profiles:
    expected = copy.deepcopy(prior[p['goalId']]['profile'])
    if p['goalId'].startswith('ffef'):
        for key in ['taskDemandDe', 'taskDemandEn']:
            expected['applicationCaseBriefs'][1][key] = p['profile']['applicationCaseBriefs'][1][key]
    assert expected == p['profile']
    p.update(reviewId=RID, reviewedAt=NOW,
        reviewer='Codex Root independent scientific reviewer; exact serving variant not exposed',
        reason='Whole current DE/EN goal and both complete cases independently reviewed against bounded sources and actual retained PNGs. Codon, complementary strand, label tracking, change-origin evidence and function limits recomputed. Only ffef case2 task contexts clarify a terminal excerpt of a longer enzyme gene and activity of the complete protein; seven other cases and all answers are exact. E1/G1 AI candidate; no human approval.')
write_lines(OUT / 'native/positive-four.root-current-images.jsonl', profiles)
dump(OUT / 'own-ffef-v2-and-four-current-image-bindings.scientific-reconciliation.json', {
    'reviewedAtUTC': NOW, 'originalOwnFirstPassUnchanged': str(OUT / 'own-first-pass-current-four-science-and-actual-visual.root-a.json'),
    'originalFfefCase2': 'REVISE: unmarked four-amino-acid enzyme ambiguity',
    'currentFfefCase2': 'KEEP: terminal excerpt, unchanged preceding longer-gene/protein context; complete-enzyme matched assay explicitly supplied. ATG inside excerpt can code Met without being the translation start. TTT→TCT gives Phe→Ser; GGC deletion is in-frame; AC insertion and one-base copy shift frame. No unprovided phenotype claim.',
    'onlySubstantiveDelta': ['ffef.case2.taskDemandDe', 'ffef.case2.taskDemandEn'],
    'otherSevenCasesAndAllEightAnswersExact': True, 'D4CurrentInputsUnchanged': True,
    'currentPositiveBindings': [{k:p[k] for k in ['goalId','goalFingerprint','reviewInputFingerprint','profileFingerprint']} for p in profiles],
    'whole4PVerdict': 'KEEP', 'humanApproval': False, 'strictGain': 0})

reasons = {
 '0daa79f6-8f61-5506-98f9-65db83062ba8': 'Ein zusammenhängendes Struktur-Informations-Modell: Nukleotide, Rückgrat, komplementäre Paarung und Informationsspeicherung gehören zur selben prüfbaren Darstellung. Replikation ist ein getrenntes bestehendes Ziel. Beide tatsächlichen Fälle liefern Paarungsregel, Strangrichtung und Legende; die Leistung ist Modellbildung, neue Paarung und Erklärung, kein freier Namens- oder Sequenzabruf. Keine zusätzlichen erforderlichen Memory-Karten.',
 '475eebb4-4eb0-524f-b1ec-4a672bf856d2': 'Eine verbundene DNA→mRNA→Polypeptid-Kompetenz ist selbstständig prüfbar; vorhandene Prozess-Teilziele bleiben erhalten. Eine einzelne erfolgreich bearbeitete Stufe genügt hier nicht. Vorlagen- oder codierender Strang, Code-Tabelle und Zellkontext sind in beiden tatsächlichen Fällen gegeben. Begründete Ableitung und Störungslokalisierung sind der Nachweis, kein isolierter Codonabruf; keine erforderliche Memory-Erweiterung.',
 'ffef97e3-12d6-5090-9816-46ab9e57fae2': 'Eine Variantenanalyse verbindet Änderungstyp, Leserahmen und begrenzte Proteinfolge am selben Material. Kopierspuren begründen Duplikation; gleiche Endfolgen allein nicht. Fall2 ist ein expliziter terminaler Ausschnitt eines längeren Enzymgens mit Funktionsdaten für genau eine Variante. Beide Fälle liefern Code und Referenz; eigenständiges Ausrichten, Ableiten und Begrenzen ist die Kompetenz. Keine zusätzliche isolierte Memory-Pflicht.',
 'e70d8a85-2dea-5165-919b-200fee9f4db4': 'Eine einfache semikonservative Modellroute verbindet Material- und Informationserhaltung. Markierte Ausgangsstränge, neue komplementäre Stränge und die zweite Runde prüfen dieselbe Kopierkompetenz. Paarungsregel und Markierungsbezug sind gegeben; nach zwei Runden verteilen sich zwei Originalmarkierungen auf vier Tochtermoleküle. Enzymdetails und freier Basisnamenabruf sind keine verdeckten Teilziele. Keine erforderlichen Memory-Karten.'}
for kind in ['atomicity', 'memory']:
    rows = lines(AUTHOR / f'native/{kind}.four.pending.jsonl')
    for row in rows:
        row.update(reviewId=RID+'-'+kind, reviewedAt=NOW, reviewer='Codex Root independent targeted semantic/memory reviewer', reason=reasons[row['goalId']], status='atomic' if kind=='atomicity' else 'no_memory_needed')
        row['semanticAtomic' if kind=='atomicity' else 'memoryUseful'] = kind=='atomicity'
    path = OUT / f'native/{kind}.four.root.jsonl'
    write_lines(path, rows)
    config = read(AUTHOR / f'native/{kind}.four.pending.config.json')
    config.update(reviewId=RID+'-'+kind, reviewPath=str(path))
    config['scope']['label'] = 'Four current Q1 goals; independent Root substantive decisions'
    dump(OUT / f'native/{kind}.four.root.config.json', config)

template = lines(BASE / 'biologie-neuro21-final-images-current-bindings-independent-root-a-v1/native-d-one/records.native-conformant.jsonl')[0]
run_id = RID + '-d-run-001'
records = []
for ordinal, goal in enumerate(inp['goals'], 1):
    row = next(r for r in own['rows'] if r['goalId']==goal['goalId'])
    assert row['nativePageFingerprint']==goal['pageFingerprint']
    assert row['nativeInputFingerprint']==goal['goalFingerprint']
    profile = profile_by_id[goal['goalId']]['profile']
    rec = copy.deepcopy(template)
    rec.update({k:goal[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
    rec.update(recordId=run_id+'-'+str(ordinal), runId=run_id, campaignId=campaign['campaignId'], roundId=campaign['roundId'], bookDigest=campaign['bookDigest'], bundleFingerprint=campaign['bundleFingerprint'], decision='keep',
        rationale=row['DReason']+' Beide tatsächlichen nativen PDF-Kontexte betrachtet; vollständige DE/EN-Texte und begrenzte Originalquellen geprüft. Die sieben bestehenden Partnerziele bleiben erhalten und ganze ursprüngliche Quellenpflichten offen.')
    rec['understandingEvidence'] = {k:' '.join(e[k] for e in profile['expectations']) for k in ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn']}
    for language in ['De', 'En']:
        rec['understandingEvidence']['transferExpectation'+language] = profile['applicationCaseBriefs'][1]['taskDemand'+language]+' '+profile['applicationCaseBriefs'][1]['expectedPerformance'+language]
    records.append(rec)
batch = campaign['batches'][0]
results = OUT / 'native/d-a/results'
record_path = results / (batch['batchId']+'.records.jsonl')
write_lines(record_path, records)
run = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion':1,'runId':run_id,
    **{k:campaign[k] for k in ['campaignId','roundId','bundleFingerprint','bookDigest','promptFingerprint','criteriaFingerprint','independenceGroupId']},
    'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'provider':'OpenAI','model':'GPT-6 Codex; exact serving variant not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2',
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Root Bio4 actual independent full DE EN review').hexdigest(),'blindToOtherRuns':True,'goalIds':batch['goalIds'],
    'startedAt':own['startedAtUTC'],'completedAt':NOW,'status':'completed','outputDigest':sha(record_path),'toolchainVersion':'skillpilot-native-review-v3'}
run['inputArtifacts'] = [{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']] + [{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}]
dump(results / (batch['batchId']+'.run.json'), run)
print(json.dumps({'nativeD':4,'currentWholeP':4,'atomic4':True,'no_memory_needed4':True,'strictGain':0,'humanApproval':False}))
