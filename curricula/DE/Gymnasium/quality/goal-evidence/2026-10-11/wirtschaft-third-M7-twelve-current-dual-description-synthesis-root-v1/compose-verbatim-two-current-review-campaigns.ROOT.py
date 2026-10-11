from pathlib import Path
from datetime import datetime, timezone
import json, hashlib

R = Path('/home/enpasos/projects/skillpilot')
Q = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
O = Path(__file__).parent
S = Q / 'wirtschaft-twelve-deferrals-native-one-and-eleven-reviewer-split-AUTHOR-INERT-v1'
C = Q / 'wirtschaft-twelve-deferrals-current-A1-A11-independent-c-READONLY-v1'
B = Q / 'wirtschaft-eleven-current-description-round-b-independent-READONLY-review-v1'
A = Q / 'wirtschaft-1826-single-monopoly-native-independent-round-b-a-v1'
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def obj(p): return json.loads(p.read_text())
def bind(p): return {'path':str(p.relative_to(R)), 'sha256':sha(p.read_bytes())}

reasons = {
    '1826': ('Ein bedingter Marktmacht-/Zugang-/Preis-Mengen-Mechanismus, korrekte Gewinne1200/1600/600 und tatsächlich bindende Fährlizenz. Ein Anbieter allein ist kein Effizienzbeweis; der historische Dreier-SPLIT ist durch getrennte Ziele aufgelöst.', 'One conditional market-power, entry and price/output mechanism, correct profits1200/1600/600 and a genuinely binding ferry licence. One supplier alone does not prove inefficiency; separate goals resolve the historical three-mechanism split.'),
    '625b': ('Ein fallbezogener Instrumentvergleich. Handelbare Emissionszertifikate, Preis-/Mengenunsicherheit und gegebene Zuständigkeiten sind eindeutig; der alte Zertifikatsprachbefund ist beseitigt.', 'One case-based instrument comparison. Tradable emissions allowances, price/quantity uncertainty and supplied responsibilities are clear; the historical certificate wording finding is resolved.'),
    '79ed': ('Eine begründete Aufgabenverteilung innerhalb gegebener Zuständigkeiten anhand Subsidiarität. Fluss- und Busfall variieren diesen Kern; unbegrenzte Zentralzuständigkeit und die eigene Beteiligungskompetenz des Nachfolgers bleiben ausgeschlossen.', 'One reasoned allocation of tasks within supplied competences using subsidiarity. River and bus cases vary this principle; neither unlimited central power nor the separate successor participation competence is asserted.'),
    'a178': ('Eine steuerbezogene Konfliktanalyse aus Zielen, Betroffenheit und Einflussmöglichkeiten. Materialgebundene Einnahmen- und Lastenbeziehungen beseitigen die alte unbestimmte Organisationsanalyse; reale aktuelle Reformen oder universelle Abstimmungsregeln werden nicht behauptet.', 'One tax-related conflict analysis through objectives, affected interests and influence. Material-bound revenue and burden relations resolve the vague organizational analysis; no real current reform or universal voting rule is asserted.'),
    '7c72': ('Ein unsicherer NAIRU-Modellvertrag. Inflationsänderung, Rate und Preisniveau bleiben getrennt; Δπ=0 bedeutet konstante gegebene Rate. Tarifkosten-/Nachfragewirkung liegt beim getrennten Nachfolger; Teilquellen bleiben Teilquellen.', 'One uncertain NAIRU model contract. Inflation change, rate and price level remain distinct; Δπ=0 means a constant supplied rate. Wage-cost and demand effects belong to the separate successor; partial sources remain partial.'),
    'dd38': ('Eine bedingte Arbeitszeitwirkung. Dauer/Lage, Stunden, Vollzeitäquivalente, Köpfe und Einkommen sind korrekt getrennt; zusätzliche Einstellung folgt nur im ausdrücklich geänderten Nachfragefall. Mitbestimmung und Gewinnbeteiligung sind eigenständige Ziele.', 'One conditional working-time effect. Duration/timing, hours, full-time equivalents, headcount and income are correctly separated; additional employment arises only with explicitly changed demand. Participation and profit sharing are separate goals.'),
    '3e26': ('Eine Unterscheidung grenzüberschreitender Datenübertragung, entlohnter Dienstleistungen und Plattformbeziehungen. Beide Runden bestätigen den aktuellen Beschreibungstext. Die erste Runde empfiehlt zusätzlich begrenzte P-Terminologiefolgen; dieser Hinweis bleibt ausdrücklich offen bis zum separat unabhängig geprüften Root-P2-Folger.', 'One distinction between cross-border data transfer, paid services and platform relationships. Both rounds keep the current description. The first additionally recommends bounded P wording corrections; that finding remains explicitly open pending the separately independently reviewed Root P2 follower.'),
    '6482': ('Ein Koordinationsurteil unter gegebenen Anpassungslasten und Vollzugsbedingungen. Rechnungen+6/−3,+3/+1, Kostenrevision und Nachweisprüfung sind korrekt. Fiktive Voraussetzungen behaupten keine wirklichen EU-Abstimmungs-, CE- oder Eurokrisenverfahren.', 'One coordination judgment under supplied adjustment burdens and enforcement conditions. Calculations+6/−3,+3/+1, cost revision and evidence checks are correct. Fictional conditions do not assert actual EU voting, CE or euro-crisis procedures.'),
    '543b': ('Ein sachgerechter Armutsindikatorvergleich unter Grenze, Preisen und Bezugsbevölkerung. Quote, Tiefe, Mangelunion und realer Zeitvergleich sind korrekt; individuelle Verläufe und Entwicklungsstrategien folgen nicht aus Gruppenindikatoren. Der historische Strategie-SPLIT ist aufgelöst.', 'One valid poverty-indicator comparison under thresholds, prices and reference populations. Headcount, gap, deprivation unions and real time comparisons are correct; group indicators imply neither individual trajectories nor development strategies. The historical strategy split is resolved.'),
    '1370': ('Klima- und Nachhaltigkeitsrahmen als gemeinsame Kategorie: SDGs sind ein Mehrzielrahmen, Paris ein Klimaabkommen. Wirkung, Finanzierung, Anreiz und Verteilung tragen ein ökonomisches Urteil ohne garantierte Umsetzung. Die P-Aufgabenformulierungsfolge der ersten Runde bleibt offen bis zum separat unabhängig geprüften Root-P2-Folger.', 'Climate and sustainability frameworks as the shared category: the SDGs are a multiple-objective framework, Paris a climate agreement. Effects, finance, incentives and distribution support an economic judgment without guaranteeing implementation. The first-round task-wording recommendation remains open pending the separately independently reviewed Root P2 follower.'),
    '87e1': ('Ein erklärbarer Systematikkern von Leistungsstörungen und Interessenausgleich. Rücktritt und zusätzliche Schadensersatzvoraussetzungen bleiben getrennt; verweigerte Nacherfüllung und noch laufende geeignete Reparatur führen zu unterschiedlichen begrenzten Fallpfaden. Es gibt keine pauschale Vollprüfung oder automatische Gewährung aller Rechtsbehelfe.', 'One explainable structure of defective performance and balancing interests. Withdrawal and additional damages requirements remain distinct; refused cure and appropriate ongoing repair lead to different bounded paths. The goal neither exhaustively assesses nor automatically grants every remedy.'),
    '479f': ('Eine Fallklassifikation nach den Hauptpflichten beider Parteien. Erfolg, Tätigkeit, fertige Ware und Herstellung/Lieferung folgen dem gegebenen Versprechen; grundsätzliches Kaufrecht mit verbleibenden Sonderregeln ist kein vollständiger Werkrechtsausschluss. Der unbestimmte Verweis ist beseitigt.', 'One case classification using both parties main obligations. Results, activities, ready-made goods and manufacture/delivery follow supplied promises; sales-law priority with remaining special rules does not exclude every work-contract rule. The vague reference is resolved.'),
}

copies, lanes = [], []
for lane, ctype in [('one-monopoly','A1-one-monopoly'), ('eleven-other-deferrals','A11-eleven-other-deferrals')]:
    cfgpath = S / (lane + '.native-batch.config.json')
    cfg = obj(cfgpath)
    native = R / cfg['outputDirectory']
    for role, source_folder in [('round-a', C / ctype), ('round-b', A / 'round-b/results' if lane == 'one-monopoly' else B / 'results')]:
        campaign = obj(native / role / 'description-review-campaign.json')
        batch = campaign['batches'][0]['batchId']
        dest = native / role / 'results'
        sf = source_folder / ('description-records.jsonl' if role == 'round-a' else batch + '.records.jsonl')
        uf = source_folder / ('run.json' if role == 'round-a' else batch + '.run.json')
        for source, target in [(sf,dest/(batch+'.records.jsonl')), (uf,dest/(batch+'.run.json'))]:
            assert source.exists() and not target.exists()
            copies.append((source,target))
    decisions, deferred = [], []
    for goal_id in cfg['goalIds']:
        de, en = reasons[goal_id[:4]]
        de = 'Beide unabhängigen aktuellen Runden bestätigen den ganzen DE/EN-Beschreibungsvertrag. ' + de + ' Quellen-/Kursgrenzen und AI E1/G1 bleiben erhalten; keine menschliche Freigabe oder neue vollständige Quellenprüfung.'
        en = 'Both independent current rounds confirm the whole bilingual description contract. ' + en + ' Source/course boundaries and AI E1/G1 remain; no human approval or new whole-source review.'
        if goal_id.startswith(('3e26','1370')):
            deferred.append({'goalId':goal_id,'rationaleDe':de,'rationaleEn':en})
        else:
            decisions.append({'goalId':goal_id,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':de,'rationaleEn':en})
    authoring = {'schemaVersion':1,'manifestId':cfg['batchId']+'-root-current-actual-synthesis-v1','synthesizedBy':'/root, actual independent current A/B review synthesis; separate human release pending','decisions':decisions}
    if deferred: authoring['deferredGoals'] = deferred
    target = native / 'synthesis-authoring.ROOT.json'
    assert not target.exists()
    lanes.append((cfgpath,target,authoring))

for source,target in copies:
    target.parent.mkdir(exist_ok=True)
    with target.open('xb') as f: f.write(source.read_bytes())
for cfgpath,target,authoring in lanes:
    with target.open('x') as f: f.write(json.dumps(authoring,ensure_ascii=False,indent=2)+'\n')
receipt = {
    'status':'ACTUAL_TWO_SINGLE_REVIEWER_CAMPAIGNS_VERBATIM_AB_RESULTS_COMPOSED_CANDIDATE_SYNTHESIS',
    'recordedAt':datetime.now(timezone.utc).isoformat(),
    'wholeExactOriginalReviewerCopies':[{'source':str(s.relative_to(R)), 'destination':str(t.relative_to(R)), 'sha256':sha(t.read_bytes()), 'wholeExact':s.read_bytes()==t.read_bytes()} for s,t in copies],
    'nativeConfigs':[str(c.relative_to(R)) for c,_,_ in lanes],
    'newScientificDescriptionReviewPairs':12,'candidateResolvedDecisions':10,'explicitlyDeferredPFindings':['3e26fb9e-634c-5454-b11f-1d925201182c','13705b9f-9623-500b-80ba-4574b753a29c'],
    'historicalReviewsPreserved':True,'activeRegistryWrites':0,'humanApproval':False,'strictCountClaim':False,
    'nativeSynthesizedAtContract':'Native deterministic synthesizedAt equals latest bound review completion+1second. Actual Root execution time is separately recorded; no observed human synthesis is claimed.'
}
with (O/'01-verbatim-two-current-independent-campaigns-and-ten-decisions-two-P-deferrals.ROOT.receipt.json').open('x') as f:
    f.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'verbatimCopies':len(copies),'campaigns':len(lanes),'candidateDecisions':10,'explicitPDeferrals':2,'activeWrites':0}))
