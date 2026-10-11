import hashlib
import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

R = Path(__file__).resolve().parents[7]
O = Path(__file__).resolve().parent
Q = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
INPUT = Q / 'wirtschaft-ten-new-current-goals-author-source-scope-native-inputbundle-AUTHOR-INERT-v1'
A = Q / 'wirtschaft-ten-new-current-native-independent-round-a-a-v1'
B = Q / 'wirtschaft-ten-new-current-descriptions-round-b-independent-c-READONLY-v1'

def obj(p):
    return json.loads(p.read_text())

def sha(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def bind(p):
    return {'path': str(p.relative_to(R)), 'sha256': sha(p), 'bytes': p.stat().st_size}

def new(p, d):
    assert not p.exists(), str(p)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def sealed(folder):
    candidates = list(folder.glob('SEALED*.json'))
    assert len(candidates) == 1, (str(folder), candidates)
    p = candidates[0]
    for b in obj(p)['artifacts']:
        assert sha(R / b['path']).removeprefix('sha256:') == b['sha256'].removeprefix('sha256:'), b['path']
    return bind(p)

seals = [sealed(INPUT), sealed(A), sealed(B)]
cfgpath = INPUT / 'ten-current-new-goals.native-batch.config.json'
cfg = obj(cfgpath)
native = R / cfg['outputDirectory']
assert len(cfg['goalIds']) == 10

notes = {
    'a2fa': ('Vorvertragliche verdeckte Merkmale verändern Auswahl und Teilnahme unter gemeinsamen Preisen: 80 schließt Mindestpreis90 aus; Mischprämie300 verliert niedrige Risiken und verändert den verbleibenden Pool. Moralisches Risiko nach Vertrag ist ein anderer Mechanismus.', 'Hidden pre-contract characteristics change selection and participation under pooled prices:80 excludes minimum90; premium300 loses low risks and changes the remaining pool. Post-contract moral hazard is a different mechanism.'),
    'df17': ('Nicht-Rivalität und Nicht-Ausschließbarkeit erklären den individuellen Trittbrettfahreranreiz trotz Gesamtvorteil1440 gegenüberKosten1200. Die offene Karte und reservierten knappen Fahrradplätze verhindern Klassifikation nach öffentlichem Zweck; Unterbereitstellung bleibt möglich, nicht zwingend.', 'Non-rivalry and non-excludability explain free-riding despite aggregate benefit1440 against cost1200. The open map and scarce reserved cycle spaces prevent classification by public purpose; underprovision remains possible rather than inevitable.'),
    'ec1e': ('Anbieterzahl allein trägt kein Preisurteil. Gleiche40 Anbieter, Produktunterschiede, Information und Wechsel führen zu verschiedenen Spielräumen; drei Firmen beweisen kein Kartell. Die veränderten Zutritts-/Wechselbedingungen verlangen begründete Revision, keinen erfundenen neuen Preis.', 'Supplier count alone does not determine pricing. The same40 suppliers with different products, information and switching conditions face different scope; three firms do not establish a cartel. Changed entry/switching conditions require revised reasoning, not an invented new price.'),
    '8820': ('Individuelle Anbieterabsatzkurve und Gesamtnachfrage sind getrennt. Mengenhorizontal/Preisvertikal, 60/45/30/15 und die andere abschnittsweise Reaktion sind korrekt. Eine gegebene Knickform ist keine universelle Regel; der Preisnehmer-Benchmark ist begrenzt.', 'Individual sales curves and aggregate demand remain distinct. Quantity horizontal/price vertical,60/45/30/15 and the second case’s different segment responses are correct. A supplied kink is not universal; the price-taking benchmark is bounded.'),
    '646c': ('Gewinnvergleich zur besten zugelassenen Einheitspreisreferenz, nicht Umsatz:200=200 im ersten Fall,350 gegenüber300 im zweiten, Zusatzkostengrenze50. Wirksame Trennung und Weiterverkauf ändern den Schluss; ein Wohlfahrtsurteil wird nicht hinzugefügt.', 'Profit is compared with the best permitted uniform-price benchmark, not revenue:200=200 initially,350 versus300 subsequently, with extra-cost bound50. Enforceable separation and resale change the conclusion; no welfare judgment is added.'),
    '2dea': ('Bindender Preis und gegebener Vollzug bilden eine zusammenhängende Modellanwendung: Gleichgewicht25/50, Höchstpreis20 mit60/40 und Knappheit20; Mindestpreis30 mit40/60 und explizitem Ankauf20 zu600 gegenüberBudget500. Angebote sind nicht tatsächliche Verkäufe und Erlös kein Gewinn.', 'Binding prices and supplied implementation form one coherent model application: equilibrium25/50; ceiling20 with60/40 and shortage20; floor30 with40/60 and stipulated public purchases20 costing600 against budget500. Offered quantities are not actual sales and revenue is not profit.'),
    '5aaf': ('Ein materialgebundener Normenanwendungsfall verbindet direkten Haushaltsbezug, tatsächlichen Verfahrensstand, proportionale Maßnahme und Empfängerpflichten. Risiko40 rechtfertigt nicht automatisch100; Vorschlag ist kein Ratsbeschluss. Die Bedingung abweichender Beschlussregel bleibt erhalten; null curriculare Sourcekanten bleiben null.', 'One material-bound application connects direct budget relevance, actual procedural stage, proportional measures and beneficiary obligations. Risk40 does not automatically justify100; a proposal is not a Council decision. The exception for a different decision provision remains; zero curricular source edges remain zero.'),
    'b6f3': ('Quantität, Qualifikation und Zeitpunkt bestimmen nutzbare Kapazität:960/1200 ergibt240;630/720 und B180/270 zeigen verschiedene Lücken. A90 schließt keinen B-Engpass; Schulung schafft nicht automatisch Gesamtstunden. Arbeitgeber-/Arbeitnehmerperspektiven beurteilen denselben Plan.', 'Quantity, qualifications and time determine usable capacity:960/1200 yields240;630/720 and B180/270 reveal different gaps. A90 cannot resolve a B bottleneck; training does not automatically create total hours. Both perspectives assess the same plan.'),
    '8e06': ('Gegebene Entscheidungs-, Koordinations- und Rückmelderegeln werden nach Betriebs- und Beschäftigtenkriterien beurteilt.102/3 gegenüber105/7 sowie70 gegenüberMindest65 tragen bedingte Urteile. Erfahrung und verfügbare Rückmeldung verändern die Empfehlung; kein Führungsstil ist allgemein überlegen.', 'Supplied decision, coordination and feedback rules are judged using firm and worker criteria.102/3 versus105/7 and70 against minimum65 support conditional judgments. Experience and available feedback change the recommendation; no leadership style is universally superior.'),
    '1839': ('Gegebene Beurteilungsbefunde sind Lernbedarfsgrundlage, keine zusätzlich verlangte Mitarbeiterbeurteilung. Begleitung plus Brücke kostet1200 gegenüberBudget1000, bei1300 möglich;96 gegenüber95 verliert ohne Mentor mit92 die Durchführungsgrundlage. Regelwissen, praktische Anwendung und vergleichbarer Transfernachweis bleiben getrennt.', 'Supplied appraisal informs learning needs rather than adding an independent appraisal task. Mentoring plus bridging costs1200 against budget1000 and becomes feasible at1300;96 against95 falls to92 without the mentor. Rule knowledge, practical application and comparable transfer evidence remain distinct.'),
}
copies = []
records = {}
for role, source in [('round-a', A / 'round-a/results'), ('round-b', B)]:
    campaign = obj(native / role / 'description-review-campaign.json')
    batch = campaign['batches'][0]['batchId']
    sf = source / (batch + '.records.jsonl' if role == 'round-a' else 'description-records.jsonl')
    uf = source / (batch + '.run.json' if role == 'round-a' else 'run.json')
    values = list(map(json.loads, sf.read_text().splitlines()))
    assert [v['goalId'] for v in values] == cfg['goalIds']
    assert all(v['decision'] == 'keep' and v['evidenceProfileRecommendation'] == 'none' and v['reviewAuthority'] == 'ai_candidate' and v['recordStatus'] == 'candidate' for v in values)
    records[role] = values
    for src, name in [(sf, batch + '.records.jsonl'), (uf, batch + '.run.json')]:
        dest = native / role / 'results' / name
        assert not dest.exists()
        copies.append((src, dest))
assert obj(copies[1][0])['independenceGroupId'] != obj(copies[3][0])['independenceGroupId']
for src, dest in copies:
    dest.parent.mkdir(exist_ok=True)
    with dest.open('xb') as f:
        f.write(src.read_bytes())
decisions = []
for gid in cfg['goalIds']:
    de, en = notes[gid[:4]]
    decisions.append({'goalId': gid, 'resolutionDecision': 'keep_current', 'evidenceRound': 'first', 'rationaleDe': 'Beide tatsächlich unabhängigen aktuellen Runden bestätigen den ganzen bilingualen Beschreibungsvertrag; Root hat alle zwanzig vollständigen Wissenschaftsrecords und ihre sechs DE/EN-Verständnisfelder tatsächlich gelesen. ' + de + ' Wahl-, Kurs-, eigene Erweiterungs- und Teilquellengrenzen bleiben erhalten; E1/G1 ist AI-Kandidat, keine menschliche Freigabe oder ganze Quellenprüfung.', 'rationaleEn': 'Both actual independent current rounds confirm the whole bilingual description contract; Root read all twenty complete scientific records and their six bilingual understanding fields. ' + en + ' Elective, course, own-extension and partial-source boundaries remain; E1/G1 is an AI candidate, not human approval or whole-source review.'})
authoring = native / 'synthesis-authoring.ROOT.ten-current-pairs.json'
new(authoring, {'schemaVersion': 1, 'manifestId': cfg['batchId'] + '-root-actual-ten-pair-synthesis-v1', 'synthesizedBy': '/root, actual current independent A/B review synthesis; separate human release pending', 'decisions': decisions})
new(O / '01-actual-ten-first-whole-independent-review-pairs-verbatim-composed.receipt.json', {'status': 'ACTUAL_TEN_FIRST_INDEPENDENT_PAIRS_COMPOSED_INERT', 'recordedAt': datetime.now(timezone.utc).isoformat(), 'sourceSeals': seals, 'wholeExactCopies': [{'source': bind(s), 'destination': bind(t), 'wholeExact': s.read_bytes() == t.read_bytes()} for s,t in copies], 'rootWholeScienceRead': 20, 'newScientificDescriptionPairs': 10, 'unchangedHistoricalGoalsRereviewed': 0, 'activeRegistryWrites': 0, 'humanApproval': False, 'strictClosureClaim': False})
node = Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
cli = str(R / 'app/node_modules/tsx/dist/cli.mjs')
checks = []
commands = [
    ('summarize', 'materializeGoalDescriptionRolloutBatch.ts', ['summarize', '--config', str(cfgpath), '--write']),
    ('synthesis', 'materializeGoalDescriptionRolloutSynthesisManifest.ts', ['--config', str(cfgpath), '--authoring', str(authoring), '--write']),
    ('resolutions', 'materializeGoalDescriptionRolloutResolutions.ts', ['--config', str(cfgpath), '--synthesis-manifest', str(native / 'synthesis-decisions.json'), '--write']),
    ('finalize', 'materializeGoalDescriptionRolloutBatch.ts', ['finalize', '--config', str(cfgpath)]),
]
for label, script, args in commands:
    argv = [node, cli, str(R / 'app/scripts' / script), *args]
    start = datetime.now(timezone.utc).isoformat()
    tick = time.monotonic()
    proc = subprocess.run(argv, cwd=R, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    log = O / (label + '.actual-native.raw.txt')
    assert not log.exists()
    log.write_bytes(proc.stdout)
    check = {'label': label, 'actualArgv': argv, 'startedAt': start, 'completedAt': datetime.now(timezone.utc).isoformat(), 'elapsedSeconds': round(time.monotonic()-tick, 3), 'exitCode': proc.returncode, 'log': bind(log), 'activeWrites': 0}
    checks.append(check)
    new(O / (label + '.actual-command.receipt.json'), check)
    print(json.dumps(check), flush=True)
    if proc.returncode:
        break
new(O / '02-actual-ten-first-native-dual-summary-synthesis-resolutions-finalize.receipt.json', {'status': 'PASS' if len(checks) == 4 and all(c['exitCode'] == 0 for c in checks) else 'FAIL', 'actualChecks': checks, 'candidatePairs': 10, 'activeWrites': 0, 'humanApproval': False})
assert len(checks) == 4 and all(c['exitCode'] == 0 for c in checks)
