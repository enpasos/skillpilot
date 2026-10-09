#!/usr/bin/env python3
# Apache-2.0. Technical materialization of the independently read first judgment.
import csv
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
AUTHOR = ROOT / BASE / 'chemie-b008-source19-remaining-seven-whole-author-v1'
OWN = ROOT / BASE / 'chemie-b008-source19-remaining-seven-whole-independent-b-v1'
NOW = datetime.now(timezone.utc).isoformat()
errors = []
bindings = []

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def binding(path):
    p = Path(path)
    p = p if p.is_absolute() else ROOT / p
    data = p.read_bytes()
    return dict(path=str(p.relative_to(ROOT)), sha256=digest(data), bytes=len(data))

def verify(b, label):
    actual = binding(b['path'])
    if actual['sha256'].removeprefix('sha256:') != b['sha256'].removeprefix('sha256:') or actual['bytes'] != b['bytes']:
        errors.append(dict(label=label, expected=b, actual=actual))
    bindings.append(actual)
    return actual

def read(name):
    return json.loads((AUTHOR / name).read_text())

def value_hash(v):
    return digest(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())

def resolve(p):
    verify(p['file'], 'pointer-file')
    v = json.loads((ROOT / p['file']['path']).read_text())
    for part in p['jsonPointer'].split('/')[1:]:
        part = part.replace('~1', '/').replace('~0', '~')
        v = v[int(part)] if isinstance(v, list) else v[part]
    if p.get('valueSha256') and value_hash(v) != p['valueSha256']:
        errors.append(dict(label='pointer-value', pointer=p, actual=value_hash(v)))
    return v

def write(name, value):
    p = OWN / name
    with p.open('x') as f:
        if isinstance(value, str):
            f.write(value)
        else:
            json.dump(value, f, ensure_ascii=False, indent=2)
            f.write('\n')
    return binding(p)

entry = read('neutral-remaining-seven-whole-source-and-P.author.entry.json')
entry_binding = binding(AUTHOR / 'neutral-remaining-seven-whole-source-and-P.author.entry.json')
author_seal = read('remaining-seven-whole-source-and-P-author.first.freeze.json')
author_seal_binding = binding(AUTHOR / 'remaining-seven-whole-source-and-P-author.first.freeze.json')
assert entry_binding['sha256'] == 'sha256:560d82aa70ae109789526eac70f44061ef67cc7f767f1d4946c787ede6c9a996'
assert author_seal_binding['sha256'] == 'sha256:5885d5f2e57b39a471f500a379873dfa751c1c0d18ed770082be3d8e34ef8901'
for b in author_seal['outputs']:
    verify(b, 'author-first-seal-output; content review does not follow from a digest')
for b in [author_seal['entry'], author_seal['originalInputFreeze']]:
    verify(b, 'author-first-seal-input')
whole = read('remaining-seven.whole-goal-profile-fourteen-cases.exact-input.json')
profiles = read('remaining-seven.normal-positive-profile-bodies.author-candidate.json')
cases = read('remaining-seven.fourteen-whole-cases-with-worked-transfer.author-candidate.json')
source = read('seven-bounded-BY8-11-source-roles.author-candidate.json')
delta = read('remaining-seven.normal-partial-mapping-delta.author-candidate.json')
finite = read('finite-seven-materials.author.index.json')
author_records = [json.loads(line) for line in (AUTHOR / 'remaining-seven.positive-understanding-evidence-v2.author-candidates.jsonl').read_text().splitlines()]
schema_path = ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
schema = json.loads(schema_path.read_text())
import jsonschema
schema_errors = []
for i, r in enumerate(author_records):
    for e in jsonschema.Draft202012Validator(schema).iter_errors(r):
        schema_errors.append(dict(index=i, path=list(e.absolute_path), message=e.message))
    if not (r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate' and r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1' and r['reviewRunIds'] == []):
        errors.append(dict(label='false-author-record-authority', index=i))
    if r['profile'] != profiles['entries'][i]['profile']:
        errors.append(dict(label='profile-record-spec-difference', index=i))
for i, p in enumerate(profiles['entries']):
    if p['goal'] != whole['entries'][i]['wholeGoal'] or p['originalWholeProfile'] != whole['entries'][i]['wholeProfile']:
        errors.append(dict(label='whole-goal-old-profile-not-value-exact', index=i))
for c in cases['cases']:
    v = resolve(c['originalWholeCasePointer'])
    if v != c['originalWholeCase']:
        errors.append(dict(label='original-whole-case-changed', caseKey=c['caseKey']))
for b in finite['files']:
    verify(b, 'finite-material')

source_values = []
for row in source['wholeSourceRows']:
    g = resolve(row['wholeOriginalSourceGoal'])
    passage = resolve(row['wholeOriginalPassage'])
    decision = resolve(row['wholeOriginalDecision'])
    source_values.append(dict(sourceGoalId=row['originalSourceGoalId'], sourceSpan=row['originalSourceSpan'], wholeSourceGoalValueSha256=value_hash(g), wholePassageValueSha256=value_hash(passage), wholeDecisionValueSha256=value_hash(decision), originalPartners=row['allOriginalPartnerGoalIds'], originalEdges=row['allOriginalCompatibleEdges'], occurrences=row['allOriginalSourceOccurrencesPreserved']))
for partner in source['wholeCurrentPartnerGoals']:
    v = resolve(partner['wholeCurrentGoalBinding'])
    if v != partner['wholeCurrentGoal']:
        errors.append(dict(label='whole-partner-goal-not-exact', goalId=partner['goalId']))
assert len(whole['entries']) == len(profiles['entries']) == len(author_records) == 7
assert len(cases['cases']) == 14 and len(finite['files']) == 10
assert len(source['wholeSourceRows']) == len(delta['mappings']) == 13
assert len(source['wholeCurrentPartnerGoals']) == 8
assert all(m['matchType'] == 'partial' for m in delta['mappings'])

primary = {}
for row in source['wholeSourceRows']:
    for occurrence in row['actualScopeOccurrences']:
        b = occurrence['retainedPrimaryCapture']
        verify(b, 'actual-retained-primary-capture')
        text = (ROOT / b['path']).read_text()
        start = text.index('Fachlehrplan')
        end = text.index('Lernbereich 2')
        primary[b['path']] = dict(file=b, actualIndependentlyReadHeaderAndWholeLB1=True, selectedTextSha256=digest(text[start:end].encode()), primaryURL=occurrence['primaryURL'], header=text.splitlines()[1], actualTrack=occurrence['actualTrack'], grade=occurrence['grade'], stage=occurrence['stage'], courseLevel='unspecified', compatibilityProfile=None, durationModel=None, wholeOccurrenceApproved=False)
assert len(primary) == 6

# These executions are this reviewer agent's finite calculation/rule checks only.
cal = list(csv.DictReader(io.StringIO((AUTHOR / 'finite-materials/calibration.synthetic.csv').read_text())))
slope = (float(cal[1]['absorbance_520nm']) - float(cal[0]['absorbance_520nm'])) / 2
mean = (float(cal[4]['absorbance_520nm']) + float(cal[5]['absorbance_520nm'])) / 2
diluted = (mean - float(cal[0]['absorbance_520nm'])) / slope
rules = list(csv.DictReader(io.StringIO((AUTHOR / 'finite-materials/digital-model-rule.blank.csv').read_text())))
rule_checks = []
for r in rules:
    # The given table contains one ion and one facing partial-charge sign per row.
    ion = float(r['ion_charge']); face = float(r['facing_partial_charge'])
    result = 'undetermined' if ion == 0 else 'attracting' if ion * face < 0 else 'repelling' if ion * face > 0 else 'undetermined'
    rule_checks.append(dict(input=r, ownReviewerFiniteComputedResult=result))
calculations = dict(schemaVersion=1, role='actual AI reviewer finite-model calculations, not learner or experimental evidence', performedAt=NOW, calibration=dict(slope=slope, meanAbsorbance=mean, diluted_mg_L=diluted, factor2Original_mg_L=diluted*2, factor4CorrectedOriginal_mg_L=diluted*4), temperatureMeans_s=[(90+94)/2,(65+63)/2,(48+50)/2], fresh50C=dict(mean_s=(80+45)/2, range_s=80-45, massVolumeStirConditionsConfirmed=False), modelRuleChecks=rule_checks, atomConservation=dict(left=dict(H=4,O=2),right=dict(H=4,O=2),reaction='2 H2 + O2 -> 2 H2O'), metalDisplacement=dict(reaction='Fe + Cu2+ -> Fe2+ + Cu',leftCharge=2,rightCharge=2,colourAloneProvesProductIdentity=False), learnerSoftwareExecution=False, physicalExperimentPerformed=False, actualLearnerPerformance=False)
calc_bind = write('own-actual-finite-calculation-and-rule-checks.json', calculations)

device = dict(findingId='B7-FIRST-D2-INSTRUMENT-FIDELITY', severity='HOLD', affectedGoalId=whole['entries'][0]['wholeGoal']['id'], affectedCaseKey=cases['cases'][1]['caseKey'], originalWholeCasePointer=cases['cases'][1]['originalWholeCasePointer'], actualFiniteInput=binding(AUTHOR/'finite-materials/calibration.synthetic.csv'), originalDeviceIdentifierDeEn='P-2', actualFiniteDeviceIdentifiers=sorted({r['instrument'] for r in cal}), semanticReasonDe='Das Ziel verlangt nachvollziehbare Geräte-/Herkunftszuordnung. Beide Originalsprachen geben P-2 vor; sechs tatsächliche Worksheet-Zeilen geben P2 vor. Ein erklärter Alias fehlt. Eine rechnerisch richtige Konzentration behebt diese Änderung der Provenienz nicht.', remedyDe='In einem neuen, getrennt versiegelten Nachfolger alle sechs Gerätewerte exakt P-2 setzen oder einen expliziten belegten Alias ergänzen. Ursprüngliche ganze Fälle/Erstsiegel erhalten; neue Worksheet-, Materialindex-, P-/Witness- und spätere Nativebindungen tatsächlich nachprüfen. Keine neue Messung behaupten.', mathematicalChemistryError=False, originalWholeGoalOrCaseMustBeRewritten=False)
assert device['actualFiniteDeviceIdentifiers'] == ['P2']

goal_notes = [
 ('Dokumentation ist ein integriertes, prüfbares Leistungsprodukt: Rohdaten, Einheit, Bedingung, Quelle und auditierbare Änderung gehören zusammen. Es braucht kein weiteres Atom nur für die Änderungshistorie.', 'Fakten und Formeln sind fallweise gegeben; der Erfolg ist nachvollziehbares Dokumentieren und begründetes Trennen, keine isolierte Abrufleistung.', [
  ('traceable-record','R1 enthält vier zuordenbare Temperatur-/Zeitpaare, Stoffmasse/Volumen/Rührbedingung und fehlendes Datum. R2 W3 ist ein neues Ereignis; die neue TH1-Anzeige bestätigt nicht rückwirkend R1. D2-Gerätezuordnung im finite CSV ist jedoch HOLD.'),
  ('observation-interpretation','Endpunkt letztes sichtbares Kristallstück und Beobachtung W1 werden von Teilchenerklärung getrennt. Dimensionlose A-Rohwerte bleiben getrennt von c in mg/L und vom berechneten Mittelwert.'),
  ('auditable-change','D2: Kalibrationsgerade A=0,010+0,080c; Mittelwert 0,290, verdünnt 3,50 mg/L, Faktor 2 ->7,00 und korrigiert Faktor 4 ->14,00. Unbekannte Autor-/Korrekturzeit nicht erfinden; zwei Rechenversionen statt Rohwertüberschreiben.')]),
 ('Das Deuten eines Datensatzes in Darstellung, Trend und Hypothesenbezug bildet eine zusammenhängende Auswertung; Fehler-/Konfundierungsprüfung ist Teil dieses Produkts.', 'Hier werden gegebene chemische Daten und Hypothesen gedeutet; keine verpflichtende isolierte Merkliste oder Faktenabfrage erforderlich.', [
  ('representation-and-trend','Eigene Tabelle oder Diagramm mit Rohwiederholungen und 92/64/49 s; Achsengrößen/Einheiten. Die neue 50-Grad-Reihe 80/45 s hat Mittel 62,5 und Spannweite35; kein stilles Löschen des Gegenwerts.'),
  ('hypothesis-inference','Temperatur-Zeit-Daten betreffen Auflösungsgeschwindigkeit unter diesen Bedingungen, nicht maximale Löslichkeit. NaCl-Konzentration steigert Leitfähigkeit durch mobile Ionen; Saccharose4 nahe Blank3 ist ein stofflich anderer Vergleich.'),
  ('confounds-and-transfer','Neue 50-Grad-Bedingungen Masse/Volumen/Rühren sind nicht bestätigt. Warme Einzelprobe konfundiert Konzentration und Temperatur; gleicher T-Vergleich oder fachlich belegte Korrektur nötig, kein erfundener Zahlenfaktor.')]),
 ('Ein vorgegebener Erkenntnisweg mit Reichweitenaussage ist ein prüfbares Erklärprodukt. Methodenkette und Gültigkeitsgrenzen dürfen gemeinsam geprüft werden; keine eigene Durchführung als Voraussetzung erfunden.', 'Beobachtungen, Stoffe und Reaktionsdaten werden bereitgestellt; gefragt ist Zusammenhang und begrenzte Schlussfolgerung, nicht unabhängiger Faktenabruf.', [
  ('inquiry-chain','Metall- und Gasarchiv verbinden Frage, Versuch/Blindvergleich, Beobachtung und Interpretation. Die gegebenen Beobachtungen werden erklärt; sie sind keine eigene Untersuchungsleistung.'),
  ('chemical-reach','Fe+Cu2+ ->Fe2++Cu ist atom- und ladungsbilanziert. Rötliche Farbe allein ist kein vollständiger Stoffnachweis. Kalkstein/Säure und trübes Kalkwasser stützen CO2, nicht Reinheit, Menge oder vollständige Umsetzung; gesellschaftliche Zustimmung ist anders zu beantworten.'),
  ('control-revision','Zusätzliche Produktanalyse mit Referenz/Blank kann Identitätsaussage stärken. Positive Glas-Kontrolle verlangt getrennte Prüfung auf Kontamination/Versuchsweg und schwächt die spezifische Kalkstein-Zuordnung; sie beweist nicht CO2-Erzeugung durch Glas.')]),
 ('Kriterien, selbst gefundene Argumente und begründetes Abwägen sind ein gemeinsames Urteilsprodukt. Argumentfindung bleibt verbindlich; bloßes Vergleichen fertiger Listen genügt nicht.', 'Die vergleichbaren Falldaten sind gegeben. Auswahl, Gewichtung und Neubewertung prüfen Verständnis; keine zusätzliche isolierte SRS-Abrufpflicht.', [
  ('independent-arguments','F/G und E/M verlangen eigene datenbezogene Pro-/Kontra-Argumente und Vergleich mit einem Pauschalargument. G entfernt25 Prozentpunkte mehr, kostet15 Euro und ursprünglich20 kWh mehr; weniger Rückstandsmasse bedeutet nicht automatisch weniger Gefahr.'),
  ('weighted-judgment','Eine offengelegte 90%-Mindestanforderung würde F70% ausschließen, ist als gewählte/gemeldete Bedingung zu kennzeichnen. Verpackung M20 kg bei zehn Umläufen gegen E40 kg, bei zwei Umläufen M100 kg; Transport-/Waschindikatoren verschiedener Einheit nicht addieren.'),
  ('revised-argument','G18 kWh gegen unverändertes F20 kehrt das Energieargument um: G spart2 kWh, während Kosten-/Entsorgungsgrenzen bleiben. Fehlende gemeinsame Folgenindikatoren und Systemgrenze müssen begründet werden. Formulierung nun18 statt20 ist im Kontext Vergleich mit F20, nicht Änderung des alten G40.')]),
 ('Dies ist curricular: konkrete Aufgaben/Anforderungen vergleichen, Informationen in eine begründete hypothetische Berufsentscheidung einbeziehen. Der Titel Berufswahl macht es nicht zur unbewerteten Motivations-orientation.', 'Fiktive Berufskarten liefern die benötigten Angaben. Vergleich und an Interessen begründete Informationsfragen brauchen keine auswendig gelernte amtliche Ausbildungsliste.', [
  ('diverse-occupations','L Laborprüfung/Kalibration, P Anlagen/Faults, U Umweltproben/Interpretation und F Methoden/Modelle ermöglichen mindestens drei echte Aufgabenvergleiche mit Sicherheits-/Kommunikationsanforderungen.'),
  ('reasoned-choice','Daten/Umwelt stützen eine begründete U-Wahl mit Herausforderung und aktuellem Informationsbedarf; Technik/Ressourcen ermöglichen begründete P-Wahl. Gesellschaftliche Chemieanwendungen werden in die Wahl einbezogen, nicht nur Berufe genannt.'),
  ('changed-preference','Direkte Anlagensteuerung verändert U/P-Abwägung. Neue Sensoren führen zu konkreten Kalibrations-/Software-/Training- und Sicherheitsfragen; tatsächliche Qualifikationswege/aktueller Berufsrat werden nicht erfunden.')]),
 ('Das Beschreiben und Bewerten mehrerer Einflüsse auf dieselbe Wissensentwicklung bildet eine zusammenhängende Quellenbewertung. Alle sechs Zieldimensionen bleiben verpflichtend; kein Weglassen von Kultur oder Historie.', 'Historische Fakten und Quellen sind fallweise zugänglich. Der Erfolg ist erklärtes Einfluss-/Gültigkeitsurteil, keine ungeprüfte historische Kartensammlung.', [
  ('social','UNEP: Kooperation/Politik können Beobachtungsaustausch und Forschung ermöglichen; Ammoniak Lehrimpuls Nachfrage/Nutzen ist als Unterrichtsinterpretation zu markieren. Zustimmung ersetzt keine Daten.'),
  ('cultural','Fortschritts-, Verantwortungs- oder Technikvorstellungen sind ausdrücklich eigene Lehrinterpretationen, kein belegter damaliger Konsens. Sie sind mit möglicher Förderung und Begrenzung der Fragen zu bewerten.'),
  ('technological','Ozon-Messnetze, Labor und Modelle ermöglichen Prüfung; BASF Übergang von Haber-Labor zu Bosch-Industrie einschließlich Hochdruck ist konkret belegt. Verfügbarkeit einer Technik beweist keine Aussage.'),
  ('historical','UNEP Mitte1970er Erkenntnisse, 1985Wien und 1987Montreal sind unterschiedliche datierte Ereignisse. BASF1913 und FHI1911 Finanzierung sowie spätere politische Forschungseingriffe geben konkrete historische Veränderungen.'),
  ('ecological','Ozon-UV/Ökosystemfragen beeinflussen Forschungs-/Handlungsbedarf; ökologische Ammoniakfragen als gekennzeichnete Lehrergänzung liefern Bewertungsanlass. Folgenurteil und empirischer chemischer Nachweis unterscheiden.'),
  ('economic','Montreal technische/finanzielle Unterstützung und FHI Stifter-/Staatsfinanzierung ermöglichen Arbeit; Kosten/Fördererinteressen können Auswahl und Kommunikation verzerren, ohne alle Resultate automatisch falsch zu machen.'),
  ('empirical-validity','Populärer unbelegter Gegenbeitrag ändert Aufmerksamkeit/Vertrauen, nicht den chemischen Befund. Hypothetische Positivergebnisforderung erzeugt Selektions-/Publikationsbias; vollständige Methoden/Daten und unabhängige Prüfung nötig. Nicht als historische Zitatbehauptung lesen.')]),
 ('Passende Modellwahl, tatsächliche analoge/digitale Nutzung und begründete Kritik/Erweiterungsbedarf ergeben ein zusammenhängendes Modellierungsprodukt. Verschiedene Darstellungen sind Facetten, keine künstliche zusätzliche Faktensammlung.', 'Teilchenkarten, Ladungsvorzeichen und Reaktionsstoffangaben sind bereitgestellt. Auswahl, Regelimplementierung und Grenzen sind Verständnisleistungen; Daltonwissen ist keine universelle Voraussetzung jeder Modellfrage.', [
  ('hypothesis-guided-use','NaCl-M2 mit festen/mobilen geladenen Teilchen passt zur Leitfähigkeitsfrage und gegebenen Hypothese; M1 ungeladene Kugeln erklärt diese nicht. Eigenes Kartenprodukt 2H2+O2 ->2H2O erhält H4/O2 und wird mit Beobachtungen verglichen.'),
  ('digital-rule-and-comparison','Eigene bedingte Regel liefert für Na/O Anziehung, Na/H Abstoßung, Cl/O Abstoßung, Cl/H Anziehung, U/O und U/H unbestimmt. O-Partialladung zeigt zum Na+, H-Partialladung zum Cl-. Zahlenvorzeichen sind nicht volle Wasser-Ionenladungen.'),
  ('justified-model-limits','NaCl-Kühlung unter bereitgestellter verdünnter Bedingung braucht zusätzliche Gitter-/Hydratationsenergiebilanz; keine allgemeine Temperaturprognose aus Ladung. Schlecht lösliches Salz widerspricht Ion-Wasser-Anziehung nicht: Gitter, Gesamt-Solvation und Entropie fehlen. Neutral-unbestimmt heißt nicht wechselwirkungsfrei.')])
]

goal_results=[]
for i,(atomic_reason,memory_reason,facets) in enumerate(goal_notes):
    p=profiles['entries'][i]; w=whole['entries'][i]
    by_id={f[0]:f[1] for f in facets}
    assert set(by_id)==set(p['profile']['coverageExpectations']['requiredExpectationIds'])
    result=dict(goalId=w['wholeGoal']['id'],candidateKey=w['candidateKey'],wholeGoalAndBothDescriptionsActuallyRead=True,wholeOldProfileActuallyRead=True,wholeNewNormalProfileActuallyRead=True,wholeInput=dict(file=binding(AUTHOR/'remaining-seven.whole-goal-profile-fourteen-cases.exact-input.json'),jsonPointer=f'/entries/{i}',goalValueSha256=value_hash(w['wholeGoal']),oldProfileValueSha256=value_hash(w['wholeProfile'])),normalProfile=dict(file=binding(AUTHOR/'remaining-seven.normal-positive-profile-bodies.author-candidate.json'),jsonPointer=f'/entries/{i}/profile',valueSha256=value_hash(p['profile'])),semanticKind=dict(decision='curricular',reasonDe=atomic_reason),atomicity=dict(decision='atomic',reasonDe=atomic_reason),memory=dict(decision='no_memory_needed',reasonDe=memory_reason,flashcardsReviewed=False,uncheckedCardsOrStageRoutesApproved=False),scientificCoreDecision='ACCEPT_CANDIDATE',wholePositiveMaterialDecision='HOLD' if i==0 else 'ACCEPT_CANDIDATE',facets=[dict(expectationId=id,decision='HOLD_FINITE_OPERAND_FIDELITY' if i==0 and id=='traceable-record' else 'ACCEPT_CANDIDATE',ownScientificEvidenceDe=note) for id,note in facets],coverage=dict(allRequiredExpectationIds=p['profile']['coverageExpectations']['requiredExpectationIds'],alternatives=p['profile']['coverageExpectations']['alternativeExpectationGroups'],allWholeGoalFacetsRetained=True,twoIndependentDemonstrationsAvailableWithinMaterials=True,caseCountIsNotExtraTaskQuota=True,singleComplexPerformanceCanContainBothDemonstrations=True),nativePositiveApproval=False,currentKindAtomicityMemoryBindingsApproved=False,reviewAuthority='ai_candidate',status='needs_human_review',evidenceLevel='E1',maximumClaimScope='G1',actualLearnerPerformance=False,actualExperimentPerformed=False,humanApproval=False,humanTrial=False)
    goal_results.append(result)

case_notes=[
 'R1 raw structure and R2 separate event; .1C display resolution is not an uncertainty and does not retroactively confirm old temperatures. Original dates remain unknown.',
 'All calibration/dilution arithmetic is independently correct. Raw versus derived/versioned data is clear. Actual finite instrument token mismatch P2/P-2 blocks full material fidelity.',
 'Means92/64/49 valid bounded trend; fresh80/45,mean62.5,range35 demands both observations and unknown control conditions, not cherry-picking.',
 'NaCl mobile ions versus sucrose/blank explains conductivity. Warmer sample requires matched temperatures or substantiated correction, not inference of concentration alone.',
 'Fe displacement atom/charge balance correct; controls support bounded interpretation, added reference/blank product analysis needed beyond colour.',
 'Limestone plus acid and limewater cloud support bounded CO2 identification; a positive glass control weakens specificity and calls for contamination/path blanks. No purity/yield claim.',
 'Own arguments/weighting are necessary. New G18 versus F20 revises energy preference, not cost/residue danger. Old G40 remains the original baseline.',
 'Common functional unit1000drinks is retained; M10cycles20kg/M2cycles100kg versus E40kg changes the material argument. Unlike transport/washing units cannot be summed.',
 'L/P/U/F genuine task comparisons and data/environment preference give a reasoned U choice; direct plant control transfer forces U/P reconsideration.',
 'Technology/resources support P choice with limitations. Sensor transfer demands two specific task/requirement information questions, not invented qualification rules.',
 'All6 dimensions plus empirical validity are explicit. Actual UNEP primary statements support history, monitoring/lab/model evidence and governance; culture teaching interpretation is labelled. Popularity changes attention, not empirical validity.',
 'BASF1913 and FHI funding/institution/political history support dated anchors; company/institution viewpoint retained. Economic/environmental/cultural additions are labelled teaching interpretations; hypothetical positive-only funding is not a historical quote.',
 'M2 charge/mobility hypothesis-guided use plus atom-conserving H/O cards is coherent. Cooling transfer needs lattice/hydration energy beyond mobility/charge; supplied observation is not reviewer measurement.',
 'Actual reviewer six-row sign-rule computation agrees; learner must independently implement and submit formula/results. Poorly soluble salt/neutral object expose rule limits; no geometry or solubility guarantee.'
]
case_results=[]
for i,c in enumerate(cases['cases']):
    case_results.append(dict(caseKey=c['caseKey'],goalId=c['operativeGoalId'],wholeOriginalCasePointer=c['originalWholeCasePointer'],wholeCandidateCase=dict(file=binding(AUTHOR/'remaining-seven.fourteen-whole-cases-with-worked-transfer.author-candidate.json'),jsonPointer=f'/cases/{i}',valueSha256=value_hash(c)),read=dict(bothLanguageMaterials=True,bothLanguageTasks=True,bothLanguageOriginalExpectedAnswers=True,allRequiredRubricCriteria=True,bothLanguageOriginalTransfers=True,wholeSourceOperatorContract=True,bothLanguageNewWorkedTaskResponse=True,bothLanguageNewFreshTransferTask=True,bothLanguageNewWorkedFreshTransferResponse=True),scientificDecision='ACCEPT_CANDIDATE',actualFiniteMaterialFidelityDecision='HOLD' if i==1 else 'ACCEPT_CANDIDATE',ownEvidence=case_notes[i],workedResponseIsLearnerEvidence=False,physicalExperimentPerformed=False,nativeEvidenceApproved=False))

source_notes=[
 'C8NTG/C9nonNTG require guided practical work and guided documentation/evaluation/visualization. The child only documents; actual technique and other outputs remain with both partners. Researched CSV is not actual measurement.',
 'C9NTG has simple self-planned OR complex guided experiments; familiar documentation independently, unfamiliar with help. This assistance distinction stays source-specific, not universal whole independence.',
 'C10nonNTG requires actual self-planned experiments and independent documentation/evaluation/visualization. Child documentation is only a bounded component; physical conduct and full representations not discharged.',
 'C8NTG/C9nonNTG interpreting collected OR researched data and relating initial hypotheses matches lower child as a partial role. No own hypothesis formulation prerequisite imposed universally.',
 'C9NTG explicitly includes possible errors and initial hypothesis comparison. Fresh spread/temperature confounding addresses that role; original broader data partner quantitative/digital duties remain.',
 'C10both tracks adds validity, trends, structures and relationships. Bounded chemical inferences and confounds fit partial role; no full upper mathematical/data-capture duty or all contexts closure.',
 'C8NTG/C9nonNTG knowledge development through inquiry and chemistry-answerable given question fits explaining a foreign inquiry; no own investigation/results reflection substituted into f660 partner.',
 'C10both tracks limits and validity of generated knowledge fit control/product-identity/reach reasoning. Own results and the entire partner criteria suite stay separate.',
 'C9NTG independently find AND compare arguments. Own F/G and E/M arguments carry this role. C8 given-argument entry is not silently upgraded; broad source criticism/presentation partner remains.',
 'C9both tracks explicitly include diverse chemical careers in career choice; assessable hypothetical choice is curricular. Actual current qualifications/counselling not proved by cards; original applications partner retained.',
 'C11NTG lists five influence dimensions; the whole child additionally preserves historical dimension. UNEP/BASF/FHI make history concrete. No GK/LK or duration inferred; broader product/procedure/sustainability partner retained.',
 'C8NTG/C9nonNTG matter models compare appropriateness, power, limits and need for critical development. Cards/model criticism is a bounded stage contribution; not all upper organic/biochemical model contexts.',
 'C10both tracks hypothesis-guided bond/interaction models within inquiry. Ion/water rule plus hypothesis meets bounded model role. Own question formation, planning/conduct in 91238 partner are not replaced by a supplied hypothesis.'
]
source_results=[]
for i,row in enumerate(source['wholeSourceRows']):
    mapping=next(m for m in delta['mappings'] if m['legacyGoalId']==row['originalSourceGoalId'])
    source_results.append(dict(sourceGoalId=row['originalSourceGoalId'],sourceSpan=row['originalSourceSpan'],proposedChildGoalId=mapping['canonicalGoalId'],proposedRelationScientificDecision='ACCEPT_BOUNDED_PARTIAL_CANDIDATE',matchType='partial',ownSemanticCorrespondenceAndDutyLimits=source_notes[i],originalWholeSourceDecision='HOLD',wholeSourceGoalPointer=row['wholeOriginalSourceGoal'],wholePassagePointer=row['wholeOriginalPassage'],wholeDecisionPointer=row['wholeOriginalDecision'],allOriginalPartnerGoalIds=row['allOriginalPartnerGoalIds'],allOriginalEdges=row['allOriginalCompatibleEdges'],allActualOccurrenceScopes=[dict(primaryURL=s['primaryURL'],grade=s['grade'],stage=s['stage'],track=s['actualTrack'],courseLevel='unspecified',compatibilityProfile=None,durationModel=None,wholeOccurrenceApproved=False) for s in row['actualScopeOccurrences']],ordinaryMappingOrPlacementApproved=False,physicalPartnerDutyClosed=False))

holds=[device,
 dict(findingId='B7-WHOLE-SOURCE-AND-PARTNER-HOLD',scope='Original whole Source19, all21 rows/36 historical partner edges/79 occurrences, protected first12 children/23 partial roles',remedy='Complete original whole source/operator/partner/program-placement and genuine independent pairing with normal mapping metadata; keep partial contributions distinct. These seven do not re-review or expand protected first12, BY12GA to EA or13, or the remaining national source obligations.'),
 dict(findingId='B7-STAGE-ASSISTANCE-AND-PRACTICAL-HOLD',scope='actual own planning/conduct/protocol and digital measurement acquisition',remedy='Where source requires it, produce and independently review actual appropriately guided/self-planned safe performance and device/sample/time protocol plus acquired digital measurements. CSV import, foreign archive analysis, author answers and this reviewer rule/arithmetic receipt are not such evidence.'),
 dict(findingId='B7-ACTUAL-NATIVE-AND-CONTEXT-HOLD',scope='normal current source/view/native/content-context D/P/A/M/V bindings',remedy='Review exact final whole native26 pages with actual resource digests and operative context, then normal current bound records/runs and independent pairing. Do not count this semantic author-material review as native P approval or strict completion.'),
 dict(findingId='B7-SL-AND-OTHER-CONTEXT-HOLD',scope='retained SL9CO2 and SL8experiment/protocol proposals, Atlas missing SL metadata,35 CPV00916 views,8 protected177 context deltas',remedy='The route shows actual SL operators experimentally deriving CO2 properties and independent protocols, not just generic interpretation. Preserve all concrete content/practice and unresolved course metadata; independent actual primary/context/view integration remains separately required. No source GK_LK tag proves a SekI course, and no seven-role material closes these wider contexts.')]

technical=write('exact-input-and-candidate-contract.actual-check.json',dict(schemaVersion=1,checkedAt=NOW,checkedFileBindings=list({b['path']:b for b in bindings}.values()),schema=binding(schema_path),normalAuthorRecordCount=7,normalAuthorRecordSchemaErrors=schema_errors,actualPointerAndValueErrors=errors,wholeOriginalGoalsAndOldProfilesValueExact=True,wholeOriginal14CasesValueExact=True,finite10ActualDigestExact=True,whole13SourcePointersAnd8PartnerValuesExact=True,normalCandidateRecordAuthorityTruthful=True,checkingMeaning='Technical consistency only; scientific decisions in separate independently reasoned first verdict. Author remedy and pre-firstseal correction bytes were hashed but their contents were not read.',ordinaryNativePositiveCheckPerformed=False,currentActiveAssetBindingApproved=False))
if errors or schema_errors:
    raise SystemExit('Technical input inconsistency retained; do not freeze an acceptance until investigated')

historical_primary=[
 dict(url='https://ozone.unep.org/20-questions-and-answers',actualOwnWebReading=True,readSections='Introduction and science/policy timeline, chemistry/measurement explanation',support='1970s discovery, monitoring/laboratory/computer models,1985Vienna/1987Montreal distinct; technical evidence versus policy',interpretationLimit='Cultural implications are explicitly authored teaching interpretations, not a sourced historical consensus.'),
 dict(url='https://www.unep.org/ozonaction/who-we-are/about-montreal-protocol',actualOwnWebReading=True,readSections='Montreal Protocol and Multilateral Fund',support='1987 adoption, differentiated commitments, scientific/technical/economic revision and technical/financial assistance',interpretationLimit='Treaty compliance is not proof of a chemical proposition.'),
 dict(url='https://www.basf.com/global/en/who-we-are/history/chronology/1902-1924/1913',actualOwnWebReading=True,readSections='1913 First Ammonia Synthesis Plant',support='Haber laboratory/Bosch industry transition,1913Oppau industrial operation, high pressure and fertilisers',interpretationLimit='Company-authored historical page; its promotional food claim is not an independent impact assessment.'),
 dict(url='https://www.fhi.mpg.de/history',actualOwnWebReading=True,readSections='Foundation,First World War,1919-1933,National Socialism,postwar and later development',support='1911 foundation,endowment/state financing,later military and political redirection and exclusion, institutional research context',interpretationLimit='Institutional retrospective; specific historical statements distinguished from labelled fictional positive-only funder transfer.')]

verdict=dict(schemaVersion=1,reviewId='chemie-b008-source19-remaining-seven-whole-independent-b-v1',reviewedAt=NOW,reviewer='Codex independent reviewer B; exact runtime model variant not exposed',role='first independent whole7 science/source/scope/P-material/atomicity/memory judgment, distinct from own author19',firstJudgmentImmutable=True,overallDecision='HOLD_ONE_FINITE_MATERIAL_FIDELITY',inputEntry=entry_binding,authorFirstSeal=author_seal_binding,readIndependentlyBeforeFirstSeal=dict(wholeBilingualGoals=7,wholeOldProfiles=7,wholeNewNormalProfiles=7,wholeBilingualCases=14,wholeNewWorkedTaskAndTransferSupplements=14,actualFiniteFiles=10,wholeOriginalBYSourceRows=13,wholeCurrentPartners=8,wholePrimaryLB1AndHeaders=6,ownHistoricalPrimaryPages=4,peerReviewsRead=False,rootIndependentSevenDirectoryRead=False,authorRemediationRead=False,authorPreFirstsealCorrectionRead=False,ownAuthored19ReviewedAsIndependent=False),scientificCoreSummary=dict(wholeGoalsAcceptedAsCurricularAtomic=7,scientificNoMemoryNeededDecisions=7,wholePSubstantiveMaterialsAccepted=6,wholePFiniteFidelityHold=1,wholeCasesScientificCoreAccepted=14,boundedPartialSourceRelationsAcceptedAsCandidates=13,wholeSourceClosures=0,normalNativePositiveApprovals=0),goalResults=goal_results,caseResults=case_results,sourceResults=source_results,actualPrimaryReading=list(primary.values()),ownHistoricalPrimaryReading=historical_primary,originalSourceValueBindings=source_values,technicalReceipt=technical,ownFiniteComputationReceipt=calc_bind,remainingHolds=holds,modelAndPhysicalClaimBoundary=dict(availableBlankWorksheetsAreUsable=True,actualReviewerArithmeticAndSixRulesComputed=True,learnerOwnArtifactsStillRequired=True,actualLearnerSoftwareUseObserved=False,digitalMeasurementAcquisitionObserved=False,actualLearnerPhysicalExperimentObserved=False,modelActionsDischargeWholePracticalSourceDuty=False,foreignInquiryIsOwnResultsReflection=False),normalProfileContract=dict(reviewAuthority='ai_candidate',status='needs_human_review',evidenceLevel='E1',maximumClaimScope='G1',authorRecordsHaveNoIndependentRunIds=True,normalCurrentNativeProfileFingerprintApproved=False),authority='ai_candidate',status='needs_human_review',evidenceLevel='E1',maximumClaimScope='G1',wholeSource19Status='HOLD',normalSourceViewNativeContentContextStatus='HOLD',nativePApproval=False,currentStrictM7=False,strictGain=0,strictM7NetGain=0,newScientificClosures=0,restoredBindings=0,activeCanonical_QS_Config_LedgerWrites=False,actualLearnerPerformance=False,actualExperimentPerformed=False,humanApproval=False,humanTrial=False)
vbind=write('whole-seven.independent-b.first-verdict.immutable.json',verdict)
md='''# Independent whole-seven review B: first judgment

The exact author entry and immutable author first seal were verified. Seven complete bilingual goals, old and new profiles, fourteen complete bilingual cases and worked transfers, ten finite files, thirteen whole original BY source rows, eight full partner goals and six official header/LB1 captures were read. UNEP, BASF and FHI pages were independently opened and read. Peer/root judgments and author remedy notes were not read before this first seal.

## Result

All seven scientific goal cores are curricular and atomic; all seven have reasoned `no_memory_needed` decisions. This does not review flashcards or approve current stage routes. Six whole positive material packets are accepted as AI candidates. **Data documentation is HOLD for actual finite operand fidelity:** the original bilingual calibration archive says instrument **P-2**; all six actual CSV rows say **P2**, with no documented alias. The correct 3.50/7.00/14.00 mg/L arithmetic cannot repair a provenance change. Supply a separately sealed successor with exact device identifiers (or a substantiated explicit alias) and verify affected finite/profile/witness/native bindings. Preserve the first inputs and first judgment.

The thirteen proposed source relations are scientifically defensible **partial candidates** within the actual BY8/9/10 tracks and BY11NTG source scope. Guided versus independent documentation, original partner operators and every occurrence remain distinct. All original whole Source19 obligations and source/view/native/content-context approvals remain HOLD. No GK/LK/duration is inferred from tags. Source12 stays BY12GA12/23partial; no EA/13 expansion.

The reviewer actually computed calibration, trend summaries, atom/charge balances and six digital sign-rule outputs. These are finite reviewer model actions. They prove neither learner software use nor physical experiment or digital measurement capture. Supplied records and foreign inquiry analysis do not close own planning/conduct/protocol duties or own-results reflection.

## Independent primary evidence

Ozone scientific discovery, measurement/model work and the1985/1987 policy events are distinguished using [UNEP science and policy timeline](https://ozone.unep.org/20-questions-and-answers). Technical/economic revision and assistance are supported by [UNEP Montreal Protocol](https://www.unep.org/ozonaction/who-we-are/about-montreal-protocol). The industrial1913 anchor is supported by [BASF1913](https://www.basf.com/global/en/who-we-are/history/chronology/1902-1924/1913); institutional funding and later political redirection are supported by [FHI history](https://www.fhi.mpg.de/history). Cultural/environmental teaching additions and the positive-only funding transfer are labelled interpretations/counterfactuals, not historical quotations or consensus.

All records remain `ai_candidate` / `needs_human_review`, E1/G1. Human approval/trial and real learner/experiment claims are false. Native P approval is pending. Strict gain, new whole scientific closures and restored current bindings are zero. The JSON records contain every facet, case and source-duty rationale and exact remedies.
'''
mdbind=write('WHOLE-SEVEN-FIRST-REVIEW.md',md)
outputs=[calc_bind,technical,vbind,mdbind,binding(Path(__file__))]
seal=write('whole-seven.independent-b.first.freeze.json',dict(schemaVersion=1,freezeId='chemie-b008-source19-remaining-seven-whole-independent-b-first',frozenAt=datetime.now(timezone.utc).isoformat(),role='immutable first independent semantic judgment; sealed before author remedy or peer reading',inputEntry=entry_binding,authorFirstSeal=author_seal_binding,outputs=outputs,outputCount=len(outputs),firstVerdictImmutable=True,overallDecision=verdict['overallDecision'],wholeSource19Status='HOLD',nativePApproval=False,currentStrictM7=False,strictM7NetGain=0,newScientificClosures=0,restoredBindings=0,humanApproval=False,humanTrial=False))
print(json.dumps(dict(verdict=vbind,firstSeal=seal,technicalErrors=errors,schemaErrors=schema_errors),ensure_ascii=False,indent=2))
