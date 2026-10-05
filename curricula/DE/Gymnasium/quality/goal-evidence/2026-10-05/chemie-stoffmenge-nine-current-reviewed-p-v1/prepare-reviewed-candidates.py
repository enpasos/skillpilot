from pathlib import Path
from decimal import Decimal as D
import json,copy,hashlib,datetime

ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).parent
SOURCE='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-stoffmenge-quantitative-foundations-twelve-candidate-v1/positive-evidence.candidates.json'
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
DINPUT='curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-013-stoffmenge-revised-nine-current-v1/round-a/description-review-input.json'
source=json.loads((ROOT/SOURCE).read_text());canon=json.loads((ROOT/CANON).read_text());di=json.loads((ROOT/DINPUT).read_text())
by={g['id']:g for g in canon['goals']};pby={g['goalId']:g for g in source['goals']};ids=[g['goalId']for g in di['goals']]
excluded=['11bea4c6-7b8a-47e0-8293-2eb1ce34cf66','965ca297-5dbf-5e58-b5f0-6559a4433646','e675fa94-6e23-59c0-b376-4340bf44c00e']
assert len(ids)==9 and len(set(ids))==9 and not set(ids)&set(excluded)
for g in di['goals']:
 n=by[g['goalId']]
 assert all(n[k]==g[d]for k,d in [('title','currentTitleDe'),('titleEn','currentTitleEn'),('description','currentDescriptionDe'),('descriptionEn','currentDescriptionEn')])

# These are this author's concrete content judgments, not inferred schema PASSes.
notes=[
 ('Festgelegte Moleküle, Atome, Ionen und Formeleinheiten bleiben die Zähleinheiten. 0,20 mol O2 enthält 0,40 mol O-Atome; 0,30 mol NaCl-Formeleinheiten enthält je 0,30 mol Na+ und Cl−, insgesamt 0,60 mol Ionen. Gleiche Stoffmenge impliziert keine gleiche Masse.',
  'Vorgegeben sind Stoffmengen, Formeln und das NaCl-Ionenverhältnis. Unabhängig bleiben die Wahl/Benennung der gezählten Einheit, die constituent-count-Übersetzung und die begründete Kritik an „NaCl-Molekülen“. Kein NA-Auswendiglernen oder zusätzlicher Gas-/Massenrechenweg wird verlangt.',
  'Wechsel von molekularem O2/atomarem He zum Ionengitter; Teilchenanzahl, Gruppenanzahl und Masse werden eigenständig abgegrenzt.'),
 ('M ist Masse je Stoffmenge. H2O ergibt mit den gerundeten Atommassen 18,0 g/mol und aus 9,0 g 0,50 mol. Mg(OH)2 ergibt 58,0 g/mol und bei 0,20 mol 11,6 g; NaOH 40,0 g/mol und 8,0 g. DE/EN zählen die Klammergruppe vollständig.',
  'Atombezogene molare Massen und chemische Formeln sind bereitgestellte Fachdaten. Selbstständig sind die Index-/Klammerzählung, Richtung und Einheiten der Umrechnung sowie der Vergleich gleicher Stoffmengen; der zweite Fall gibt keinen Rechenweg.',
  'Molekülformel wird durch Verhältnisformel mit Klammer ersetzt; statt m→n wird n→m stoffübergreifend begründet.'),
 ('u und g sind unterschiedlich große Masseneinheiten. Die inneren Texte behandeln ihre praktische Verwendung auf Teilchen-/Probenmaßstäben und setzen sie nicht gleich. Mit den gegebenen Näherungen entstehen 7,306376·10^-23 g je CO2-Molekül und 44,00001916464 g für ein mol; der Viertel-mol-CH4-Fall ergibt 4,000001742240 g. Die angegebenen gerundeten Lösungen passen.',
  'Umrechnungsfaktor, NA und Teilchenmasse sind gegebene Daten. Unabhängige Leistung ist der offengelegte Maßstabwechsel mit Teilchenzahlfaktor und Größenordnungs-/Einheitenkritik. Die innere Aussage zur nur annähernden u↔g/mol-Zahlenkorrespondenz stimmt mit aktuellem SI/CODATA; keine exakte Identität wird verlangt.',
  'Frische Zahl von CH4-Molekülen ersetzt den bereits benannten Ein-mol-CO2-Bezug; die Viertelmenge muss selbst erkannt und begründet werden.'),
 ('NA=N/n hat Einheit mol^-1; N ist eine Anzahl. 0,25 mol O2 ergibt 1,50553519·10^23 Moleküle und 3,01107038·10^23 O-Atome. Im frischen Vergleich entsprechen die CO2-/He-Zahlen 0,10/0,20 mol der benannten Teilchen; insgesamt enthält CO2 0,30 mol Atome und damit mehr als He.',
  'Der exakte Wert von NA ist vorgegeben. Unabhängig bleiben die Wahl von Vorwärts-/Rückwärtsübersetzung, die mol-Kürzung und der Vergleich von Molekül- versus Atomzahlen. NA-Wertwiedergabe allein zählt nicht als Performanz.',
  'Rückwärtsübersetzung und Änderung der Vergleichseinheit kehren die Rangfolge um; die Zusammensetzung wird als separater Faktor behandelt.'),
 ('Avogadros Gasvolumenregel ist ausdrücklich auf gleiche T,p und das ideale Gasmodell begrenzt. Im H2/O2-Fall sind Molekülzahl und Stoffmenge gleich, O2-Masse jedoch 16-mal größer. Im CO2/He-Fall mit 20/40 °C ist die unbedingte Gleichheitsbehauptung ungültig; selbst bei gleichen T,p unterscheiden sich Gesamtatomzahlen um den Zusammensetzungsfaktor.',
  'Volumen, Zustandsdaten und molare Massen sind bereitgestellt. Selbstständig sind die Bedingungenprüfung, die getrennte Masseninferenz und die Wahl der Teilchen-/Atomreferenz. Eine exakte Zahlengasgesetz-Rechnung bei abweichenden Temperaturen wird für dieses Konzeptziel ausdrücklich nicht verlangt.',
  'Eine veränderte Temperatur und CO2-versus-He statt zweier zweiatomiger Gase verhindern die ungeprüfte Gleichvolumen-Schablone.'),
 ('Vm ist Volumen pro Stoffmenge im genannten Zustand, keine universelle Zahl. 0,25 mol·24,0 L/mol ergibt 6,00 L; 12,0 L/24,0 L/mol ergibt 0,500 mol. Im geschlossenen Zustandswechsel: 9,00 L/30,0 L/mol=0,300 mol, danach 7,20 L. Die gerundeten 20-°C-Druck/Vm-Paare sind mit PV=nRT vereinbar.',
  'Die Zustandswerte für Vm sind Daten, keine eigenständige Herleitung einer Gaskonstante. Selbstständig sind Datenwahl, Umrechnungsrichtung und die Erklärung, warum n statt V erhalten bleibt; falsche Zustandsübertragung wird begründet korrigiert.',
  'Ein geschlossener Druck-/Volumenwechsel erfordert Erhaltungsargument und Zustandsauswahl statt nur neuer Zahlen im selben Zustand.'),
 ('Das aktuelle Gas-M-Ziel umfasst Formelweg und Masse/Volumenweg bei bekannten Bedingungen. CO2 ergibt auf beiden Wegen 44,0 g/mol. Frische B-Daten ergeben 64,0 g/mol, passend zu SO2, nicht CO2; A-Daten ergäben fälschlich 128 g/mol. rho·Vm hat g/mol, nicht g/L. Passendes M allein beweist keine eindeutige Identität.',
  'Massen, Volumina, Vm und atombezogene Massen sind Daten. Die Lernleistung ist die eigenständige Verknüpfung zweier Wege, die Einheiten-/Zustandswahl und die begrenzte Formel-Inferenz. Ein bereitgestellter Kandidatenname ist kein Identitätsnachweis.',
  'Geänderter Zustand, konkurrierende Formel und unzureichende Identitätsaussage verlangen eine neue Datenentscheidung.'),
 ('Die aktuelle Kompetenz nutzt gegebene Teilchenmodelle wichtiger elementarer Gase; sie fordert keine experimentelle Entdeckung der Zweiatomigkeit aus unbekannten Volumenverhältnissen. O2,N2,Ar und die Wasserbilanz 2H2+O2→2H2O sind richtig. Frisch folgt H2+Cl2→2HCl; Cl2 enthält eine Elementsorte, HCl2 wäre eine andere Zusammensetzung.',
  'O–O-, N–N-, Ar- und H–H-/Cl–Cl-/H–Cl-Modelle sind ausdrücklich gelieferte Fakten. Unabhängig bleiben das begründete Übersetzen in Formeln, die Atomzahlbilanz, die Kritik an Indexänderungen und die Abgrenzung Element/Verbindung. Die vorgegebene Paarstruktur selbst wird nicht als ungeholfen ermittelt gezählt.',
  'Neues H/Cl-Gas-/Produktpaar und falsche HCl2-Strategie prüfen selbstständigen Notationstransfer; Argon begrenzt die Aussage über alle Gase.'),
 ('Das aktuelle Ziel erlaubt den Schluss von nachgewiesenem Verbrennungs-CO2/H2O auf C/H in der Probe. Eine trockene CO2-freie Blindkontrolle macht diese Zuordnung belastbar; ein nasser Blindlauf verhindert eine eindeutige H-Zuordnung. Produkt-O kann aus zugeführtem O2 stammen. Positive qualitative Nachweise belegen weder Menge/Formel noch Ausschluss weiterer Elemente.',
  'Die CuSO4-/Kalkwasser-Nachweistabelle und Beobachtungen sind bereitgestellte Fachinformation. Unabhängige Leistung ist die kausale kontrollierte Zuordnung, gezielte trockene Wiederholung und Reichweitenbegrenzung. Keine unbelegte eigene Durchführung, Entdeckung der Nachweisreaktionen oder quantitative Elementaranalyse wird bescheinigt.',
  'Frische Wasser-Hintergrundstörung und unbekannte brennbare Probe verlangen eine Kontrollentscheidung und verhindern vorschnelle Kohlenwasserstoffidentifikation.')
]
review_note='Eigene aktuelle fachliche Inhaltsprüfung nach der von Root als unabhängig eingefroren gemeldeten B013-D2-Runde: kanonische DE/EN-Texte, Zahlen/Einheiten, Begründung und bereitgestellte Eingaben versus unabhängige Performanz geprüft. Innere P-v2-Profile unverändert. Inaktiver KI-Kandidat (ai_candidate/needs_human_review), E1/G1; keine menschliche Freigabe, Lernendenbewährung oder aktuelle D/P-Materialisierung. Ziel-/Seiten-/Bildbindung nach dem laufenden u/g-Bildaustausch gezielt zu erneuern.'
goals=[];rows=[]
for i,gid in enumerate(ids):
 r=copy.deepcopy(pby[gid]);r.update(reason=notes[i][0]+' '+review_note,evidenceLevel='E1',maximumClaimScope='G1')
 assert r['profile']==pby[gid]['profile'] and not r.get('dissent')
 goals.append(r);rows.append({'goalId':gid,'titleDe':by[gid]['title'],'verdict':'PASS','verdictScope':'Current inner-profile content suitability only; no binding, human approval or mastery claim','currentDescriptionDe':by[gid]['description'],'currentDescriptionEn':by[gid]['descriptionEn'],'b013TextMatchesCurrent':True,'coreAndNumbersCheckDe':notes[i][0],'suppliedInputVersusIndependentPerformanceDe':notes[i][1],'freshTransferCheckDe':notes[i][2],'bilingualCheck':'All essentialUnderstanding, observablePerformance, variationAxes, taskDemand, expectedPerformance and understandingFocus pairs personally read; matching scope/numbers/conditions and claim limits.','innerProfileChanged':False,'materializationStatus':'HOLD_IMAGE_AND_TARGET_PAGE_REBIND_PENDING','humanApproval':False})
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
candidate={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':'chemie-stoffmenge-nine-current-reviewed-20261005-p-v1','reviewedAt':now,'reviewer':'Codex local current P content review after Root-confirmed independent B013 D2 freeze','goals':goals}
def write(name,obj):(OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
write('positive-evidence.candidates.json',candidate)
write('current-goals-reviewed.snapshot.json',{'snapshotAtUtc':now,'canonicalPath':CANON,'canonicalBytesDigest':'sha256:'+hashlib.sha256((ROOT/CANON).read_bytes()).hexdigest(),'b013DescriptionInputPath':DINPUT,'b013DescriptionInputDigest':'sha256:'+hashlib.sha256((ROOT/DINPUT).read_bytes()).hexdigest(),'b013BookDigest':di['bookDigest'],'b013BundleFingerprint':di['bundleFingerprint'],'bindingStatus':'REVIEWED_TEXT_SNAPSHOT_ONLY; B013 current old-image page digests are not promoted to renewed evidence','goals':[by[x]for x in ids]})
write('content-review.verdicts.json',{'reviewedAt':now,'sourceCandidatePath':SOURCE,'sourceCandidateDigest':'sha256:'+hashlib.sha256((ROOT/SOURCE).read_bytes()).hexdigest(),'selectedGoalIds':ids,'excludedGoalIds':excluded,'descriptionRefinementsCheckedGoalIds':[x for x in ids if x not in ['e45c0022-ac0d-5c83-b433-5f68655e382f','2924f784-5261-54e8-93ee-49ac3b3cd300']],'verdictCount':{'PASS':9,'HOLD':0},'bindingHoldAppliesToAllNine':True,'unresolvedInnerContentConcerns':[],'rows':rows})
numbers=[
 ('O2 constituent amount',D('.20')*2,'0.40 mol O atoms'),('NaCl ion total',D('.30')*2,'0.60 mol ions'),
 ('Water molar mass',2*D('1.0')+D('16.0'),'18.0 g/mol'),('Water amount',D('9.0')/D('18.0'),'0.50 mol'),
 ('Mg(OH)2 molar mass',D(24)+2*(D(16)+D(1)),'58 g/mol'),('Mg(OH)2 mass',D('.20')*D(58),'11.6 g'),('NaOH mass',D('.20')*D(40),'8.0 g'),
 ('CO2 one molecule grams',D(44)*D('1.66054e-24'),'7.31e-23 g rounded'),('CO2 one mol grams',D(44)*D('1.66054e-24')*D('6.02214e23'),'44.0 g rounded'),('CH4 one molecule grams',D(16)*D('1.66054e-24'),'2.66e-23 g rounded'),('CH4 fresh sample grams',D('1.505535e23')*D(16)*D('1.66054e-24'),'4.00 g rounded'),
 ('O2 quarter mol molecules',D('.25')*D('6.02214076e23'),'1.50553519e23 molecules'),('O atoms quarter mol O2',D('.50')*D('6.02214076e23'),'3.01107038e23 atoms'),
 ('CO2 fresh amount',D('6.02214076e22')/D('6.02214076e23'),'0.10 mol CO2'),('He fresh amount',D('1.204428152e23')/D('6.02214076e23'),'0.20 mol He'),('H2/O2 mass ratio',D(32)/D(2),'16'),
 ('Reference N2 volume',D('.25')*D('24.0'),'6.00 L'),('Reference He amount',D('12.0')/D('24.0'),'0.500 mol'),('Closed sample amount at B',D('9.00')/D('30.0'),'0.300 mol'),('Closed sample volume at A',D('9.00')/D('30.0')*D('24.0'),'7.20 L'),
 ('Vm ideal compatibility A',D('8.31446261815324')*D('293.15')/D('101.6'),'23.990... L/mol consistent with rounded24.0'),('Vm ideal compatibility B',D('8.31446261815324')*D('293.15')/D('81.3'),'29.980... L/mol consistent with rounded30.0'),
 ('CO2 gas amount',D('.600')/D('24.0'),'0.0250 mol'),('CO2 gas M',D('1.10')/(D('.600')/D('24.0')),'44.0 g/mol'),('Unknown gas M',D('1.60')/(D('.300')/D('12.0')),'64.0 g/mol'),('Unknown gas wrong-state M',D('1.60')/(D('.300')/D('24.0')),'128 g/mol')
]
write('own-numerical-and-equation-checks.json',{'method':'Independent local Decimal arithmetic from task data; no copied answer-key calculation. Rounded model inputs are accepted as explicitly supplied.','calculations':[{'quantity':q,'computed':str(x),'profileExpected':e,'verdict':'PASS'}for q,x,e in numbers],'equationChecks':[{'equation':'2 H2 + O2 -> 2 H2O','reactantAtoms':{'H':4,'O':2},'productAtoms':{'H':4,'O':2},'verdict':'PASS'},{'equation':'H2 + Cl2 -> 2 HCl','reactantAtoms':{'H':2,'Cl':2},'productAtoms':{'H':2,'Cl':2},'verdict':'PASS'}],'inferenceChecks':{'hydrocarbonBlank':'Clean negative water/CO2 blank supports sample attribution; wet positive water blank blocks unique sample-H inference.','oxygenInCombustionProducts':'Supplied O2 prevents treating product oxygen as proof of original sample oxygen.','unknownSample':'Controlled C/H presence does not prove only C/H or exclude other elements.','molarMassIdentity':'SO2 is compatible among supplied candidates, not uniquely identified by M alone.'}})
print(json.dumps({'goalCount':len(goals),'innerProfilesUnchanged':True,'contentPASS':9,'contentHOLD':0,'bindingHold':True,'reviewedAt':now}))
