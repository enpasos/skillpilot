# SPDX-License-Identifier: Apache-2.0
"""Serialize B's own already-read, individually scoped scientific findings."""
import datetime, hashlib, json
from pathlib import Path
O=Path(__file__).resolve().parent.parent
A=O.parent/'chemie-current450-fourteen-method-multistate-source-author-20261018-v1'
read=lambda p:json.loads(Path(p).read_text())
digest=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=Path(p); b=p.read_bytes(); return {'path':p.as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,x):
 p=O/name
 if p.exists():raise RuntimeError('Do not overwrite FIRST: '+str(p))
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(p)

# Own models, formulated after full C/P and primary reading; not imported author judgments.
models={
'1351706f':{
 'de':'Die reale Route verlangt eigene Freigabeprüfung, Tara, getrennte48,0g Wasser/2,0g NaCl, verlustbewussten Übertrag, Rühren, eigenen Endbefund und Etikett. Diese Handlung ist ein konkreter Präparations-/Dokumentationsteil eines Experiments. Der erlaubte Simulator ist ein anderer Nachweismodus und erfüllt keinen realexperimentellen Quellenoperator.',
 'en':'The real route requires an own permission check, tare, separate48.0g water/2.0g NaCl weighing, controlled transfer, stirring, an own endpoint observation and a label. These actions contribute preparation/recording to an experiment. The permitted simulator is a different evidence mode and does not fulfil a real experimental source duty.',
 'transferDe':'Ein frischer L/S/G-Fall muss mit seinem tatsächlich freigegebenen Lösungsmittel neu ausgeführt werden; Wasser darf nicht die für einen anderen Stoff vorgegebene Ethanolroute ersetzen. Ein vorhandener Erfolgslog kann nicht übertragen werden.',
 'transferEn':'A fresh liquid/solid/gas module must actually use its authorised solvent; water cannot replace a specified ethanol route for another substance. An existing successful log cannot be reused.',
 'limitDe':'Nur reale beaufsichtigte Durchführung trägt die hier experimentellen Quellen; keine volle qualitative/quantitative Untersuchung, alle Konzentrationsmaße oder alle Phasenkombinationen. SN bleibt Klasse9 Wahlbereich3; tatsächlich getroffene Lernendenwahl ist unbekannt.',
 'limitEn':'Only actual supervised real performance supports these experimental sources; this supplies neither a complete qualitative/quantitative investigation nor all concentration measures or phase combinations. SN remains grade9 elective area3; actual learner selection is unknown.'},
'4b6d1824':{
 'de':'Das P lässt die Schutzmaßnahme aus Stoffinformation und konkretem Kontaktweg herleiten. Spritzschutz im Tropffall und geschlossener Transport sind vom offenen Abwiegen mit vorgeschriebener Absaugung zu unterscheiden. Der Beitrag ist eine fachliche Begründung vor einer Handlung.',
 'en':'The P derives protection from substance information and the specific exposure route. Splash protection in the dropping case and sealed transport differ from open weighing requiring extraction. The contribution is scientific justification before action.',
 'transferDe':'Bei frischem lockerem Verschluss entfällt die Begründung für sicheren geschlossenen Transport; geringe Menge oder eine Maske ersetzt keine geforderte Absaugung.',
 'transferEn':'A fresh loose closure removes the justification for safe sealed transport; a small amount or mask does not replace required extraction.',
 'limitDe':'Kein tatsächlich beobachtetes Beachten/Handeln, keine ganze Labor- und Alltagssicherheit. SLs Abfallvermeidung/sichere Lösemittel und SNs Brand-/Arbeitsschutz bleiben zusätzlich offen.',
 'limitEn':'No observed compliance/action or complete laboratory/everyday safety is established. SL waste avoidance/safer solvents and SN fire/occupational protection remain additional open duties.'},
'ac8b6c0f':{
 'de':'Das ganze P fordert eigenes analoges UND digitales Suchen, tatsächliches Öffnen/Lesen einer zugänglichen Zusatzquelle, Fundstelle, Urheberschaft und markiertes Zitat. Die mehrstufige Interpretation verbindet Säuregleichgewicht mit1,1/2/11mg/L sowie Frischzufuhr, Rückführung und Energie pro akzeptierter Produktmasse.',
 'en':'The whole P requires own analogue AND digital searching, actual opening/reading of an accessible additional source, a location, authorship and a marked quotation. Multistep interpretation links acid equilibrium to1.1/2/11mg/L and distinguishes fresh input, internal circulation and energy per accepted product mass.',
 'transferDe':'Bei20kg akzeptiertem B-Produkt entstehen2,00kg Frischzufuhr/kg und3,15kWh/kg. Eine neue schwerlösliche Salzphase verlangt eine belegte zusätzliche Annahme/Ksp-Information; keine Zahl darf aus der schwachen Säure erfunden werden.',
 'transferEn':'With20kg accepted B output the results become2.00kg fresh input/kg and3.15kWh/kg. A new sparingly soluble salt phase requires an evidenced additional assumption/Ksp information; its number cannot be invented from the weak-acid model.',
 'limitDe':'K1-artige Quellen tragen reale Recherche, K2/SN/SL nur ihre ausdrücklich genannte Informationserschließung. SN/SL begründen keine volle Recherche-/Vertrauenspflicht. NI wird nur auf den Gleichgewichtsanteil gebunden, ohne eA-only Salzpflicht. HB-Zusatzdossiers bleiben HB.',
 'limitEn':'K1-type sources support actual research; K2/SN/SL support only their stated information interpretation. SN/SL do not establish a whole research/trust duty. NI is bound only to equilibrium-related work without eA-only salt requirements. HB additional dossiers remain HB-only.'},
'e81a4aed':{
 'de':'Die Person muss nach Freigabe eine eigene Leitfähigkeits- oder Auflösungsuntersuchung real ausführen, Geräteprüfung/Blank, kontrollierte Bedingungen und Wiederholung mit eigenen Rohwerten dokumentieren. Ein tatsächlicher1970–2010µS/cm-Standard bei25°C prüft den0–5000-Bereich; Auflösung und Messgenauigkeit sind verschieden.',
 'en':'After permission the learner must actually perform an own conductivity or dissolution investigation, documenting instrument check/blank, controlled conditions and repetition with own raw values. An actual1970–2010µS/cm standard at25°C checks the0–5000 range; resolution and accuracy differ.',
 'transferDe':'Eine frische Verschleppungs- oder Körnungserklärung muss anhand der eigenen Kontrollen geprüft werden; bei misslungener Geräteprüfung stoppen. Referenzwerte und leere Rohprotokolle zählen nicht als eigene Beobachtung.',
 'transferEn':'A fresh carryover or grain-size explanation must be checked against own controls; stop after a failed instrument check. Reference values and blank raw forms are not own observations.',
 'limitDe':'Aktuelles P enthält zusätzlich2 echte ST7/8-Fälle: beaufsichtigte Mg-Oxidation und kalte MgO/Wasser-Untersuchung mit eigenem Wasserblank/Indikator. Sie wurden mitgelesen, tragen aber keine der hier10 anderen Länderbindungen. Alle Altpflichten sind exakt erhalten; HB-Eigenprotokoll bleibt HB.',
 'limitEn':'The current P additionally contains2 actual ST7/8 cases: supervised Mg oxidation and a cold MgO/water investigation with an own water blank/indicator. They were read but supply none of these10 other-state bindings. Every old duty is exactly retained; the HB own electronic record remains HB-only.'},
'36666b4a':{
 'de':'Die Person vergleicht die tatsächlichen Aussagen von Anbieter, Labor und anonymer Quelle sowie Modell, Fachtext und Werbung nach Herkunft, Methode, Datenreichweite und Interesse.75% Absorbanzabnahme beweist keine Trinkbarkeit;1,1→11 bedeutet Faktor10/+900% und keine klinische Wirksamkeit.',
 'en':'The learner compares actual vendor, laboratory and anonymous claims and model, technical and advertising texts for origin, method, evidential reach and interest. A75% absorbance decrease proves no drinkability;1.1→11 means factor10/+900%, not clinical efficacy.',
 'transferDe':'Ein bloß angekündigtes unabhängiges Protokoll ist noch kein neuer Befund. Ein Urteil darf nur durch konkret zugängliche neue Methodik/Daten begrenzt geändert werden; Finanzierung allein macht eine Aussage nicht falsch.',
 'transferEn':'An announced independent protocol is not a new finding. Only actually accessible new methods/data may change a bounded judgment; funding alone does not make a statement false.',
 'limitDe':'SN trägt nur die chemisch sachgerechte Text-/Grafikanalyse, keine ganze Herkunfts-/Intentionenprüfung. SLs allgemeine Kommunikationsdefinition enthält keinen eigenständigen kritischen Prüfoperator und erhält hier HOLD.',
 'limitEn':'SN supports only scientifically appropriate text/graphic analysis, not a whole provenance/intent evaluation. SL general communication has no distinct critical-checking operator and is held here.'},
'805a2f58':{
 'de':'Das P fordert eine begründete Papierentscheidung anhand identifizierter Zusammensetzung und der konkreten örtlichen W-Anweisung: NaCl/Wasser→W-A, Cu-Rest→W-B, Ethanol/Wasser ohne Metall→W-C. Ein unbekannter klarer Rest bleibt geschlossen/getrennt ungeklärt.',
 'en':'The P requires a reasoned paper decision using identified composition and the concrete local W instruction: NaCl/water→W-A, Cu residue→W-B, ethanol/water without metal→W-C. An unknown clear residue remains closed/separate/unresolved.',
 'transferDe':'Erst eine zuverlässige neue Cu-Identität ändert die betroffene Route. Klarheit, Farbe oder Gefahrensymbol allein erlauben weder Ausguss noch Mischung.',
 'transferEn':'Only reliable new Cu identification changes the affected route. Clarity, colour or a pictogram alone permit neither drain disposal nor mixing.',
 'limitDe':'Sicherheitsquellen tragen nur die begründete vorbereitende lokale Entscheidung. Keine real ausgeführte Entsorgung, kein gesamter Alltag und keine ganze Umweltverantwortung. SL nennt Abfallvermeidung, jedoch keine solche Sammelwegentscheidung: HOLD.',
 'limitEn':'Safety sources support only the justified preparatory local decision. No actual disposal, entire everyday context or complete environmental responsibility is established. SL names waste avoidance but not this collection-route decision: HOLD.'},
'42391b16':{
 'de':'Das P fordert eigenen qualitativen Salz/Zucker/Blank- und quantitativen NaCl-Reihen- oder Sättigungsplan mit Hypothese, Variablen/Kontrollen, Wiederholung und Lehrkraftfreigabe sowie persönliche reale Durchführung und Rohprotokoll. Planung und Ausführung sind getrennt nachzuweisen.',
 'en':'The P requires an own qualitative salt/sugar/blank and quantitative NaCl-series or saturation plan, a hypothesis, variables/controls, repetition and teacher permission, plus actual personal performance and a raw record. Planning and performance require distinct evidence.',
 'transferDe':'Ein Temperaturkonfound verlangt kontrollierte Gegenansätze. Ein eigenes klar/Rest-Intervall darf nur durch tatsächlich neue kleinere Einwaageschritte präzisiert werden;3,5/3,8g sind bloße Lehrwerte.',
 'transferEn':'A temperature confound requires controlled comparison samples. An own clear/residue bracket can be refined only through actual new smaller weighed increments;3.5/3.8g are teaching values.',
 'limitDe':'NI/SL/SH-Einzeloperatoren tragen nur Planung, Handling oder Protokoll gemäß ihrem Wortlaut. Keine Übertragung der5 HB-Proteinbedingungen oder HB-Öl/Wasser/Ethanol/Heptan-Zusätze auf andere Länder, keine ganze Forschungsmethodik.',
 'limitEn':'NI/SL/SH individual operators support only planning, handling or recording according to their wording. Do not transfer the5 HB protein conditions or HB oil/water/ethanol/heptane additions to other states; no complete research-method coverage.'},
'416dfd33':{
 'de':'Eigene Tara/Einwaage, Meniskusablesung, korrektes Filtrieren/Übertragen, Absetzen/Dekantieren und Pipettieren mit Saugball müssen tatsächlich gezeigt und mit Originalwerten/Verlusten dokumentiert werden. Gelöstes Salz passiert den Filter; klares Filtrat ist kein Reinheitsbeweis.',
 'en':'Own taring/weighing, meniscus reading, correct filtering/transfer, settling/decanting and bulb pipetting must actually be demonstrated and documented with original values/losses. Dissolved salt passes the filter; clear filtrate does not prove purity.',
 'transferDe':'Bei frischem löslichem Zucker oder nach2min weiter trübem Feinsand selbst eine passende geänderte Methode wählen und tatsächlich anwenden; nasse Rückstandsmasse ist keine trockene Sandmasse.',
 'transferEn':'For fresh soluble sugar or fine sand still cloudy after2min independently choose and actually apply an adapted method; wet residue mass is not dry sand mass.',
 'limitDe':'Keine Handgeschicklichkeit aus Lehrdaten. BW trägt sachgerechten Geräteumgang, BB/BE/NI den realen Arbeitsschritt innerhalb größerer Experimente; weder alle Techniken noch ganze qualitative/quantitative Auswertung wird der Quelle vollständig gutgeschrieben.',
 'limitEn':'Teaching data prove no handling skill. BW supports appropriate apparatus handling and BB/BE/NI the actual operation within larger experiments; neither every technique nor entire qualitative/quantitative evaluation receives whole-source credit.'},
'503dedcb':{
 'de':'Eigene untersuchbare Frage und theoriegeleitete Hypothese verbinden Ka/Massenwirkungsgesetz mit einer bedingten Vorhersage und möglichem Gegenbefund. Zehnfache Verdünnung einer schwachen Säure ergibt unter gültiger Näherung ΔpH≈+0,5, nicht den Wert einer vollständig dissoziierten Säure.',
 'en':'An own investigable question and theory-guided hypothesis link Ka/the mass-action law to a conditional prediction and a possible counterfinding. Tenfold weak-acid dilution gives ΔpH≈+0.5 under valid approximations, rather than the fully dissociated-acid result.',
 'transferDe':'Frisch starke Säure→ΔpH≈+1; Produktentzug senkt Q unter K. Katalysator ändert die Einstellungsgeschwindigkeit, nicht K; ohne weitere Angaben keine neue Gleichgewichtskonzentration erfinden.',
 'transferEn':'Fresh strong acid→ΔpH≈+1; product withdrawal lowers Q below K. A catalyst changes equilibration rate, not K; without additional information invent no new equilibrium concentration.',
 'limitDe':'E2 trägt Fragebildung, E3 theoriegeleitete Hypothesen. Eigene weitergehende GK-Erwerbsrechnung bleibt eigene Route, keine amtliche allgemeine schwache-Säure-Rechenpflicht; kein Experiment oder empirischer Befund.',
 'limitEn':'E2 supports question formation and E3 theory-guided hypotheses. The broader own GK acquisition calculation remains an own route rather than a universal official weak-acid calculation duty; no experiment or empirical result is claimed.'},
'75e2eff1':{
 'de':'Die Person entwickelt eine chemisch prüfbare Alltagsfrage zu Zuckerauflösung oder Apfelbräunung, eine begründete Hypothese, Kontrollen sowie stützenden und widerlegenden Befund. Lösungsgeschwindigkeit und Gleichgewichtslöslichkeit sind zu unterscheiden.',
 'en':'The learner develops a chemically testable everyday question about sugar dissolution or apple browning, a justified hypothesis, controls and supporting/counter findings. Dissolution rate differs from equilibrium solubility.',
 'transferDe':'Neue Variation Oberfläche statt Temperatur bzw. Sauerstoffzugang statt Säure: eine Abdeckung verändert gegebenenfalls auch Feuchte und Temperatur und isoliert Sauerstoff nicht automatisch.',
 'transferEn':'Freshly vary surface area rather than temperature or oxygen access rather than acid: a cover may also change humidity and temperature and does not automatically isolate oxygen.',
 'limitDe':'HE/RP-E2 trägt nur die eigene Frage; NW-EP-E3 zusätzlich überprüfbare Hypothesen auf der ausgewählten EP-Stufe. Keine ganze Q-Theoriestufe und keine tatsächliche Durchführung.',
 'limitEn':'HE/RP E2 supports only the own question; NW introductory E3 additionally supports testable hypotheses at its selected introductory level. No whole qualification-level theory or actual performance is established.'},
'1df17884':{
 'de':'Das P verlangt selbst hergeleitete ethische, ökologische, ökonomische, soziale und Sicherheitskriterien, realisierbare Handlungsoptionen, Mindestbedingungen und begründete Abwägung. Stoff-/Energie-/Kostenangaben dürfen nicht zu einer dimensionswidrigen Gesamtsumme addiert werden.',
 'en':'The P requires independently derived ethical, environmental, economic, social and safety criteria, feasible options, minimum conditions and justified weighing. Material/energy/cost figures cannot be added into a dimensionally invalid total.',
 'transferDe':'Veränderte Rücklaufzahl oder Kostenübernahme verändert bestimmte Kriterien und Verteilung, nicht rückwirkend die Chemiedaten. Sprachzugang/Sponsoring verlangen neue transparente Abwägung; keine individuelle Therapieempfehlung.',
 'transferEn':'Changed return rates or subsidy alter particular criteria and distribution, not the chemical data retrospectively. Language access/sponsorship require renewed transparent weighing; no individual therapy recommendation.',
 'limitDe':'B5 trägt Kriterien→Optionen→Abwägung, keinen einzig richtigen Gesamtscore. Alle ganzen Ethanol-Folgen- und übrigen P-Fälle bleiben als eigene Anforderungen bestehen; keine gesamte Bewertungskompetenz.',
 'limitEn':'B5 supports criteria→options→weighing, not one correct overall score. The complete ethanol-consequence and other P cases remain own requirements; no entire assessment competence is covered.'},
'9e3fae29':{
 'de':'Eigene digitale Arbeitsdatei mit bezeichneten Modell-Rohdaten, Formeln/Zellbezügen, Offsetregression und Residuen ist erforderlich. Die Kalibrierung liefert3,5mg/L verdünnt bzw.7mg/L vor Faktor2; ln(c/c0) liefert k≈0,05min−1 und t½≈13,86min.',
 'en':'An own digital workbook with labelled model raw data, formulas/cell links, offset regression and residuals is required. Calibration gives3.5mg/L diluted or7mg/L before factor2; ln(c/c0) gives k≈0.05min−1 and t½≈13.86min.',
 'transferDe':'Frisch A=0,650 liegt außerhalb0–6mg/L und darf nicht als gültiger16mg/L-Befund berichtet werden. Die getrennte c20=0,050-Version neu fitten und das Residuenproblem unter Fehlergrenzen bewerten, ohne einen Mechanismus allein daraus zu beweisen.',
 'transferEn':'Fresh A=0.650 is outside0–6mg/L and cannot be reported as a valid16mg/L finding. Refit the separate c20=0.050 version and evaluate its residual issue within error limits, without proving a mechanism from it alone.',
 'limitDe':'E6 trägt tatsächliche digitale Verarbeitung, E8 theoriebezogene Datenfolgerung. Modell-/Fremddaten sind keine eigene Messwerterhebung; HB-eigene Drucksimulation und deren Erfassung bleibt HB, keine Sensorpflicht in HE/RP.',
 'limitEn':'E6 supports actual digital processing and E8 theory-related data inference. Model/external data are not own measurement acquisition; the HB own pressure simulation/acquisition remains HB-only, with no sensor duty in HE/RP.'},
'9e656697':{
 'de':'Piktogramm zusammen mit zugehörigem H-Satz deuten: H315/H319/H335 unterscheiden Haut/Auge/Atemweg trotz gleichen Ausrufezeichens; H225/H228/H226 unterscheiden konkrete Entzündbarkeitswarnungen. Fehlende zugehörige Information wird im tatsächlich gegebenen Material nachgeschlagen.',
 'en':'Interpret the pictogram together with its associated H statement: H315/H319/H335 distinguish skin/eye/airway despite the shared exclamation mark; H225/H228/H226 distinguish specific flammability warnings. Actually consult the supplied material for missing associated information.',
 'transferDe':'Das neu gegebene H335 bzw. H226 ändert die konkrete Gefahrdeutung; das Symbol beweist weder Stoffidentität noch ein bestimmtes Lösungsmittel. Diese Vorbereitung ist für den realen ASA-/Reinigungsendpunkt sachlich nötig.',
 'transferEn':'Fresh H335 or H226 changes the specific hazard interpretation; the symbol proves neither identity nor a particular solvent. This preparation is scientifically needed for the actual ASA/purification endpoint.',
 'limitDe':'Ausschließlich vorhandene direkte requires-Erwerbsstütze über e7c3d20e, kein direkter amtlicher Kennzeichnungsstandard. Primärseite17 präzisiert3.1.7 als EP-Wahlpflichtthema; kursiv gesetzte Reinstoffisolierung auf25 ist mögliche Vertiefung in beiden Kursformen, keine universelle Gymnasium-/Q-/GK-/LK-Pflicht. Keine Lernendenwahl, keine Endpoint-Mastery, kein Ganzquellencredit.',
 'limitEn':'Only the existing direct requires acquisition support via e7c3d20e is accepted, not a direct official labelling standard. Primary page17 defines3.1.7 as an introductory elective-compulsory topic; italic pure-substance isolation on25 is a possible extension in both course forms, not a universal Gymnasium/qualification/GK/LK duty. No learner selection, endpoint mastery or whole-source credit is established.'},
'ebaae4f5':{
 'de':'Stoffgefahr bleibt von Exposition, Menge und Verfahren getrennt. Der Papierfall bewertet Spritz-/Dampfwege beim Transfer und leitet passende begründete Schutzänderungen ab; geringe Menge oder ein anderes Gefäß hebt ein Gefahrmerkmal nicht auf.',
 'en':'Substance hazard remains distinct from exposure, amount and procedure. The paper case evaluates splash/vapour routes during transfer and derives justified suitable control changes; a small amount or another vessel does not remove a hazard characteristic.',
 'transferDe':'Frische offene größere/volatile Situation verändert die Exposition gegenüber geschlossenem Vorführen. Der HB-Sprühfall unterscheidet Tropfen von Dampf; kein realer Gebrauch und keine allgemeine Handschuh-/Produkterlaubnis wird daraus abgeleitet.',
 'transferEn':'A fresh open larger/volatile situation changes exposure relative to a closed demonstration. The HB spray case distinguishes droplets from vapour; it grants neither real use nor general glove/product permission.',
 'limitDe':'BB/BE G/H trägt Risikoabschätzung und neue Schutzmaßnahmen als kognitiven Teil; keine ausgeführte Handlung, numerische Risikozahl oder Übertragung des HB-Haushaltszusatzes. Offizielle Niveaustufe bleibt SekI G/H, technische obere Ansicht macht daraus keinen Q-Standard.',
 'limitEn':'BB/BE G/H supports risk assessment and new controls as a cognitive contribution; no executed action, numerical risk or transfer of the HB household addition. Its official level remains lower-secondary G/H; a technical upper view does not make it a qualification standard.'}
}

def contribution_part(g,key):
 short=g[:8]
 if short=='1351706f':return ('Reale angeleitete Präparation und eigenes Handlungs-/Endprotokoll; keine Simulation als Experiment.','Actual guided preparation and own action/endpoint record; no simulation counted as an experiment.')
 if short=='4b6d1824':return ('Stoff- und kontaktwegbezogen begründete Auswahl von Schutzmaßnahmen.','Substance/exposure-specific justified selection of protective measures.')
 if short=='ac8b6c0f':
  if key in ['SN_ANALYSE','SL_INFO'] or key.endswith('K2') or key=='ST_INTERPRET':return ('Chemisch richtige Interpretation konkreter Fachtexte, Tabellen und Darstellungen; keine zusätzliche Recherche-/Vertrauenspflicht aus diesem Teilanker.','Chemically correct interpretation of concrete texts, tables and representations; this partial anchor adds no research/trust duty.')
  return ('Tatsächliches eigenes zielgerichtetes Suchen und Auswählen gelesener chemischer Quellen; NI nur der Gleichgewichtsanteil.','Actual own purposeful search and selection of read chemical sources; NI only the equilibrium portion.')
 if short=='e81a4aed':
  if key=='SH_DEV':return ('Tatsächliche sichere Gerätebenutzung im eigenen Versuchsaufbau.','Actual safe apparatus use in an own experimental arrangement.')
  if key in ['SH_DATA','SL_RECORD']:return ('Eigene tatsächliche Untersuchungsdaten in einem eigenen getrennten Roh-/Versuchsprotokoll festhalten.','Record actual own investigation data in an own distinct raw/experiment record.')
  if key=='SH_HYP_TEST':return ('Eigene kontrollierte Befunde mit der vorherigen Verschleppungs-/Auflösungshypothese vergleichen.','Compare own controlled findings against the prior carryover/dissolution hypothesis.')
  if key=='SL_SAFE':return ('Die Sicherheitsvoraussetzungen des eigenen realen Versuchs nennen und beachten; Green-Chemistry-Restumfang offen.','Name and follow safety conditions for the own actual experiment; remaining Green Chemistry range stays open.')
  if key=='SL_DISTINGUISH':return ('Im eigenen Versuch tatsächlich durchgeführte Schritte, beobachtete Werte und Erklärung getrennt halten.','Keep actually performed steps, observed values and interpretation separate in the own experiment.')
  return ('Persönliche reale angeleitete Untersuchung mit Rohdaten, Kontrollen und begrenzter Auswertung.','Personal actual guided investigation with raw data, controls and bounded evaluation.')
 if short=='36666b4a':
  if key=='SN_ANALYSE':return ('Nur die ausdrückliche sachlich chemische Text-/Grafikanalyse; keine ganze Vertrauens- oder Intentionsprüfung.','Only the explicit scientific chemical text/graphic analysis; no entire trust or intent check.')
  return ('Belegte Prüfung der konkreten Quellenbehauptung auf fachliche Tragweite/Vertrauenswürdigkeit anhand tatsächlich vorhandener Angaben.','Evidence-based checking of the actual source claim for scientific reach/trust using actually available information.')
 if short=='805a2f58':return ('Begründete lokale Sammelwegwahl anhand Zusammensetzung und gültiger örtlicher Anweisung als vorbereitender Sicherheitsanteil.','Justified local collection-route choice using composition and the applicable local instruction as a preparatory safety contribution.')
 if short=='42391b16':
  if key in ['HE_E4','NI_PLAN','SH_PLAN','SL_PLAN']:return ('Eigener hypothesenbezogener Versuchsplan mit Variablenkontrolle und entscheidbarem Gegenbefund.','Own hypothesis-related experimental plan with variable control and a discriminating counterfinding.')
  if key in ['SH_DATA','SL_RECORD']:return ('Originalprotokoll der eigenen tatsächlich ausgeführten Versuchsreihe; kein Protokoll als Ersatz der Ausführung.','Original record of an actually performed own investigation series; a record does not replace performance.')
  if key=='SH_DEV':return ('Realer sachgerechter Geräteumgang im selbst entworfenen freigegebenen Aufbau.','Actual appropriate apparatus use in the independently designed authorised setup.')
  return ('Eigene reale Durchführung/Beobachtung/Auswertung des selbst geplanten freigegebenen Versuchs.','Own actual performance/observation/evaluation of the independently planned authorised experiment.')
 if short=='416dfd33':return ('Tatsächlich selbst ausgeführtes sachgerechtes Wägen/Messen/Übertragen/Trennen mit Originalbefunden.','Actually personally executed appropriate weighing/measuring/transfer/separation with original findings.')
 if short in ['503dedcb','75e2eff1']:
  if key.endswith('E3'):return ('Eigene bedingte überprüfbare Hypothese; Q theoriegeleitet, NW-EP nur die ausgewählte überprüfbare Stufe.','Own conditional testable hypothesis; qualification level is theory-guided, NW introductory only its selected testable level.')
  return ('Eigene chemisch untersuchbare Fragestellung; weitergehende Theorie-/Durchführungsanteile bleiben eigenständig.','Own chemically investigable question; broader theory/performance parts remain separate.')
 if short=='1df17884':return ('Eigene Kriterien ableiten, realisierbare Optionen entwickeln und begründet gegeneinander abwägen.','Derive own criteria, develop feasible options and weigh them with reasons.')
 if short=='9e3fae29':
  if key.endswith('E6'):return ('Tatsächlich eigene digitale Datei/Formeln/Regression/Residuen aus bezeichneten Modell-Rohdaten.','Actually own digital file/formulas/regression/residuals from labelled model raw data.')
  return ('Theoriebezogene Interpretation von Trends und Residuen mit begrenzter Schlussfolgerung.','Theory-related interpretation of trends and residuals with bounded inference.')
 if short=='ebaae4f5':return ('Konkretes Expositionsrisiko beurteilen und passende neue Schutzmaßnahmen begründet ableiten.','Assess the specific exposure risk and derive justified suitable new controls.')
 raise ValueError((g,key))

matrix=read(A/'MATRIX.eighty-six-current-goal-country-source-author.json')
sources=read(A/'INPUT.selected-whole-source-cells-and-primary-operators.json')
bykey={x['cellKey']:x for x in sources}
inputs=read(A/'INPUT.fourteen-whole-current-C-and-P.exact.json')
checks=read(O/'CHECK.current-selected-inputs-and-CAS.actual.json')
current={r['goalId']:r for r in checks['wholeCurrentCAndP']}
relations=[];pairs=[]
for i,row in enumerate(matrix):
 gid=row['goalId'];model=models[gid[:8]]; disposition=row['authorDisposition']
 decision='HOLD' if disposition=='HOLD' else 'APPROVE'
 rec={'pairIndex':i,'goalId':gid,'title':row['title'],'jurisdiction':row['jurisdiction'],
  'decision':decision,'acceptedEvidenceKind':'NONE' if decision=='HOLD' else ('LITERAL_REQUIRES_ACQUISITION_ONLY' if 'LITERAL' in disposition else 'DIRECT_PARTIAL_ONLY'),
  'wholeGoalSHA256':current[gid]['currentWholeGoalSHA256'],'wholeCurrentProfileSHA256':current[gid]['currentWholeProfileSHA256'],
  'wholeOriginalInput':row['wholeCurrentInput'],'currentWholeNativeOwner':current[gid]['nativeReview'],
  'evidenceModelDe':model['de'],'evidenceModelEn':model['en'],'actualExistingTransferDe':model['transferDe'],'actualExistingTransferEn':model['transferEn'],
  'remainingScopeDe':model['limitDe'],'remainingScopeEn':model['limitEn'],
  'actualCurrentTargetViewIds':[v['viewId'] for v in row['actualCurrentViews'] if v['isCurrentTarget']],
  'sourceRelationIds':[],'wholeSourceCredit':False,'learnerExecutionObserved':False,'humanApproval':False,'newDPAMVVote':False}
 if decision=='HOLD':
  reason={'1351706f':('Eine bloße Gemisch-/Homogenitätsbeschreibung enthält keine konkrete persönliche Präparationspflicht. SL7/12/13 liefert keinen passenden Herstellungsoperator oder nachgewiesenen literal-requires-Erwerb für dieses Paar.','A mixture/homogeneity description contains no concrete personal preparation duty. SL7/12/13 supplies neither an appropriate preparation operator nor an evidenced literal-requires route for this pair.'),
  '36666b4a':('SL7 definiert Informationserschließung und Austausch allgemein, jedoch keinen prüfbaren kritischen Qualitäts-/Vertrauens-/Intentionsoperator. Den eigenständigen kritischen Kern kann ich damit nicht fachlich binden.','SL7 defines information interpretation and exchange generally, but no assessable critical quality/trust/intent operator. It does not scientifically anchor the distinct critical core.'),
  '805a2f58':('SL12 nennt Abfallvermeidung/Green Chemistry. Daraus folgt kein Operator zur örtlichen stoffabhängigen Sammlung. Kein real vorhandener qualifizierter anderer Erwerbsanker ist für dieses Paar belegt.','SL12 names waste avoidance/Green Chemistry. That does not imply an operator for local composition-dependent collection. No actually qualified alternative acquisition anchor is evidenced for this pair.')}[gid[:8]]
  rec['rationaleDe'],rec['rationaleEn']=reason
 else:
  rec['rationaleDe']='Der konkret genannte Quellenanteil und die gesamte aktuelle P-Route bestehen sachlich fort; Annahme gilt ausschließlich unter den individuellen Restgrenzen der unten referenzierten Relation(en).'
  rec['rationaleEn']='The specified source contribution and the complete current P route remain scientifically supported; acceptance is limited to the individual remaining boundaries of the referenced relation(s).'
  for j,c in enumerate(row['sourceContributions']):
   key=c['sourceCellKey'];s=bykey[key];rid=f'B14-{i:02d}-{j:02d}-{key}';rec['sourceRelationIds'].append(rid)
   literal='LITERAL' in disposition
   if literal:
    part=('Die reale Reinstoffisolierung/Rekristallisation im ganzen e7c3d20e-C/P benötigt die vorhandene Kennzeichnungsgrundlage9e656; die direkte requires-Kante und der aktuelle Quellenanker sind tatsächlich vorhanden.','Actual pure-substance isolation/recrystallisation in the whole e7c3d20e C/P needs the existing9e656 labelling foundation; the direct requires edge and current source anchor are actually present.')
   else:part=contribution_part(gid,key)
   relations.append({'relationId':rid,'pairIndex':i,'goalId':gid,'jurisdiction':row['jurisdiction'],
    'sourceCellKey':key,'sourceGoalId':c['sourceGoalId'],'decision':'APPROVE',
    'acceptedEvidenceKind':rec['acceptedEvidenceKind'],'matchType':'partial' if not literal else None,
    'wholeSourceObject':c['wholeSourceCell'],'primary':c['primary'],'physicalPdfPage':c['physicalPdfPage'],
    'actualWholeOperatorRead':c['actualWholePrimaryOperator'],
    'sourceStageCourseContextRead':c['sourceStageCourseAndContext'],
    'individualAcceptedPartDe':part[0],'individualAcceptedPartEn':part[1],
    'concreteCurrentEvidenceDe':model['de'],'concreteCurrentEvidenceEn':model['en'],
    'actualExistingTransferDe':model['transferDe'],'actualExistingTransferEn':model['transferEn'],
    'individualRemainingDutiesDe':model['limitDe']+' '+c['individualUncoveredSourceDutyDe'],
    'individualRemainingDutiesEn':model['limitEn']+' The complete quoted source operator remains binding; all unassessed verbs, contexts and course demands remain open.',
    'wholeCurrentGoalSHA256':rec['wholeGoalSHA256'],'wholeCurrentProfileSHA256':rec['wholeCurrentProfileSHA256'],
    'wholeSourceCredit':False,'learnerExecutionObserved':False,'independent14MappingJudgment':True,
    'ownPriorSource60RawTransportAuthorship':s['origin']=='SHARED_SOURCE60_TRANSPORT_REFERENCE_ONLY'})
 pairs.append(rec)

assert len(pairs)==86 and len(relations)==106
assert sum(r['decision']=='APPROVE' for r in pairs)==83
assert sum(r['acceptedEvidenceKind']=='DIRECT_PARTIAL_ONLY' for r in pairs)==81
assert sum(r['acceptedEvidenceKind']=='DIRECT_PARTIAL_ONLY' for r in relations)==104
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
first={'schemaVersion':1,'artifactRole':'FIRST_INFORMED_INDEPENDENT_B_SOURCE_BINDING_REVIEW',
 'reviewerId':'chemie450_caption1_native_fresh_b','reviewedAt':now,'provider':'OpenAI','tool':'Codex',
 'modelFamily':'GPT-6','exactModelRevision':None,'exactModelRevisionKnown':False,
 'reviewMode':'informed_independent_first_before_other_current_fourteen_method_reviews',
 'otherCurrentFourteenMethodPeerJudgmentsReadBeforeOwnFirst':False,
 'authorshipDisclosure':'I authored the prior Source60 source candidate and technically integrated its foreign accepted relations, including shared HE/NW raw extraction transports. I did not author this fourteen-method/86-pair proposal. Shared raw cells are not newly independently approved by reviewing my own transport; the106 concrete foreign proposed relations are independently judged here against whole current C/P and actual primaries. No blind-review claim.',
 'knownPriorInformation':'Root disclosed routing counts/exclusions and the actual later NI/ST e81 additive P integration. Historical source metadata refers to earlier reviews. No other current14/86 scientific review was read or used for this FIRST.',
 'authorSeal':pin(A/'SEAL.inactive-fourteen-method-eighty-six-pair-author.json'),
 'authorMatrix':pin(A/'MATRIX.eighty-six-current-goal-country-source-author.json'),
 'scope':{'wholeMethodGoals':14,'additionalWholeEndpointGoals':1,'actualGoalCountryPairs':86,
  'wholeSelectedSourceObjects':85,'directPartialRelationsApproved':104,'directPartialPairsApproved':81,
  'literalAcquisitionPairsApproved':2,'heldPairs':3,'newWholeSourceApprovals':0,'newDPAMVVotes':0},
 'materialScientificQualifications':[
  {'id':'REAL_EXECUTION_ONLY','de':'135s erlaubter Simulator bleibt im ganzen eigenen P gültig, ist aber für die hier realexperimentellen Quellen kein Ausführungsbeleg. Reale beaufsichtigte Route ist erforderlich; Papierdaten/Blankformulare/Referenzwerte nie eigene Ausführung.','en':'The135 permitted simulator remains valid in the whole own P but supplies no execution evidence for these actual experimental sources. The supervised real route is required; paper data/blank forms/reference values are never own performance.'},
  {'id':'BB_BE_EP_OPTIONAL_EXTENSION','de':models['9e656697']['limitDe'],'en':models['9e656697']['limitEn']},
  {'id':'CURRENT_E81_SCOPE','de':models['e81a4aed']['limitDe'],'en':models['e81a4aed']['limitEn']},
  {'id':'ALL_WHOLE_SOURCE_GAPS_REMAIN','de':'Jede Annahme ist ein einzelner Teilbeitrag bzw. eine echte bereits vorhandene Erwerbskante. Kein ganzer Quellenstandard, Kurs, ganzes Thema oder Stage wird damit geschlossen. Historische HOLD/REJECT und sonstige Pflichtanteile bleiben erhalten.','en':'Each acceptance is an individual partial contribution or an actual existing acquisition edge. It closes no whole source standard, course, topic or stage. Historical HOLD/REJECT judgments and other duties remain preserved.'}],
 'technicalMetadataCorrectionsBeforeIntegration':[
  {'cellKeys':['TH_SAFETY'],'correction':'Actual primary17 prints B2.3. Set officiallyNumbered=true and record B2.3 as the official code; the candidate false flag must not be propagated. Full operator unchanged.'},
  {'cellKeys':['BW_E5','BW_E6','BW_B11'],'correction':'Primary11/13 explicitly number the items5/6/11 under2.1/2.3. Record the section/item numbering accurately rather than officiallyNumbered=false. Full operators unchanged.'},
  {'cellKeys':['BB_ISOLATE','BE_ISOLATE'],'correction':'Persist the actual3.1 EP Wahlpflicht/italic optional-extension context from primary17/25 in each new acquisition rationale; preserve existing raw sources/history. This is not a universal official Gymnasium/Q/GK/LK labelling duty.'},
  {'cellKeys':[],'correction':'Rebase additive counts against current SN183 (SN4 six general clauses already integrated), never replace whole snapshots or lose those clauses/rows. TH corrected233 successor and old225 contracts stay separate; HE current2026 standards never enter old2024 aliases.'}],
 'pairs':pairs,'relations':relations,'normalWrites':0,'APCompilerBuildRuns':0,
 'humanApproval':False,'learnerPerformanceClaim':False}
p=write('FIRST.fourteen-method-eighty-six-pairs.informed-independent-b.json',first)
seal=write('SEAL.FIRST.before-other-current-fourteen-method-judgments.json',{
 'schemaVersion':1,'sealedAt':now,'reviewerId':first['reviewerId'],'reviewMode':first['reviewMode'],
 'ownFirstActuallyWritten':True,'otherCurrentFourteenMethodPeerJudgmentsReadBeforeOwnFirst':False,
 'first':p,'authorSeal':first['authorSeal'],'authorMatrix':first['authorMatrix'],
 'counts':first['scope'],'exactModelRevision':None,'normalWrites':0})
print(json.dumps({'FIRST':p,'SEAL':seal,'counts':first['scope']},ensure_ascii=False,indent=2))
