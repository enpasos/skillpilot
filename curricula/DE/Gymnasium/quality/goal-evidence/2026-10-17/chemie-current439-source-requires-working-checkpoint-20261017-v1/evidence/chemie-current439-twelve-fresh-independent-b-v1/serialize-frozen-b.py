from pathlib import Path
import json,hashlib,datetime
base=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-b008-terminal12-native-preparation-technical-c-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-b008-terminal12-native-preparation-technical-c-v1')
out=Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-twelve-fresh-independent-b-v1')
first=out/'FIRST.independent-scientific-findings.frozen.md'
assert hashlib.sha256(first.read_bytes()).hexdigest()=='4ff0f27b957cbe341965344f7c6a531a0444e997e3ab7c093430d4303ea25323'
campaign=json.loads((base/'native12/round-b/description-review-campaign.json').read_text())
input_=json.loads((base/'native12/round-b/description-review-input.json').read_text())
bundle=json.loads((base/'native12/bundle/manifest.json').read_text())
batch=campaign['batches'][0]
runid='chemie-current439-twelve-native-independent-b-20261017-v1'
# Scientific choices and expectations originate from FIRST, frozen before this serialization.
rows=[
[
'Eine angeleitete Hypothesenprüfung liefert einen begrenzten Befund, wenn die vorgegebenen Bedingungen sicher eingehalten und eigene Beobachtungen dokumentiert werden; Leitfähigkeit beruht hier auf beweglichen Ionen, Auflösezeit ist keine Löslichkeitsgrenze.',
'A guided hypothesis test yields a bounded finding when prescribed conditions are followed safely and own observations are recorded; conductivity here depends on mobile ions, while dissolution time is not a solubility limit.',
'Führt den freigegebenen Leitfähigkeits- oder Zucker-Temperaturvergleich tatsächlich nach Anleitung aus, protokolliert eigene Rohwerte mit Bedingungen und begründet damit den Bezug zur Ausgangshypothese.',
'Actually carries out the authorised conductivity or sugar-temperature comparison as instructed, records own raw values and conditions, and uses them to justify the relation to the initial hypothesis.',
'Erklärt anhand des eigenen Protokolls die mögliche Wirkung einer ungespülten Sonde oder gröberer Körnung und begründet einen sicheren Kontrollvergleich, der die zusätzliche Einflussgröße trennt.',
'Uses the own record to explain possible carry-over from an unrinsed probe or the effect of coarser grains and justifies a safe comparison isolating the additional variable.',
'Die Beschreibung benennt eine zusammenhängende angeleitete Untersuchungsleistung und wahrt DE/EN-Parität. Vollfälle und P verlangen tatsächliche sichere Ausführung, eigene Werte, geeignete Standardprüfung und Hypothesenbezug; Referenzzahlen ersetzen diese nicht. Die Bilder sind passende Unterstützung. Keine neue P- oder V-Freigabe.'
],
[
'Eine selbst geplante chemische Untersuchung verbindet qualitative Beobachtung und quantitative Größen mit gezielter Variablenwahl, Kontrollen und geeigneten Arbeitstechniken; Planung und tatsächliche Durchführung sind verschiedene erforderliche Produkte.',
'An independently planned chemical investigation connects qualitative observations and quantitative quantities with deliberate variables, controls and suitable techniques; planning and actual execution are distinct required products.',
'Erstellt einen eigenen freigabefähigen Ionenreihen- oder Sättigungsplan, führt ihn sicher aus und protokolliert tatsächlich eigene qualitative und quantitative Daten mit nachvollziehbaren Bezugsgrößen und Grenzen.',
'Creates an own plan for an ion series or saturation investigation, obtains authorisation, executes it safely and records actual own qualitative and quantitative data with clear reference quantities and limits.',
'Plant bei abweichender Temperatur eine neue kontrollierte Leitfähigkeitsprüfung oder verfeinert anhand des eigenen klar/Rest-Protokolls die Massengrenze, ohne langsame Auflösung vorschnell als Sättigung zu deuten.',
'Plans a new controlled conductivity test for a temperature confound or refines the mass bracket from the own clear/residue record without mistaking slow dissolution for saturation.',
'Der Text grenzt Eigenplanung und einfache qualitative/quantitative Ausführung klar von der angeleiteten Voraussetzung ab. Beide Vollfälle erlauben eigene Methodenentscheidungen und verlangen reale Ausführung. Eine selbst erfundene Hypothese wird nicht universell hinzugedichtet. DE/EN sind gleichwertig; der P-Kontext deckt Bedingungen und Transfer.'
],
[
'Eine geeignete chemische Analyse prüft eine Hypothese durch überwiegend eigene Planung, sichere qualitative und quantitative Durchführung und eigene Dokumentation; Stöchiometrie, Endpunkt und gültige Kalibration begrenzen die quantitative Aussage.',
'A suitable chemical analysis tests a hypothesis through largely independent planning, safe qualitative and quantitative execution and own documentation; stoichiometry, endpoint and valid calibration bound quantitative conclusions.',
'Begründet die Methodenwahl, führt eine konkret freigegebene Säure- oder Farbstoffanalyse tatsächlich aus und dokumentiert eigene Standards, qualitative Beobachtungen, Rohwerte und Auswertung mit eindeutig bezeichnetem Konzentrationsverhältnis.',
'Justifies method choice, actually performs a specifically authorised acid or dye analysis and records own standards, qualitative observations, raw values and evaluation with an explicitly identified concentration ratio.',
'Unterscheidet beim gemeinsamen Maßlösungsfehler absolute Konzentrationsverzerrung und ein unter Bedingungen erhaltenes Verhältnis; plant bei einer Absorbanz außerhalb der Kalibration eine bekannte Verdünnung und verlangt eine neue gültige Messung.',
'Distinguishes absolute concentration bias from a conditionally preserved ratio under a common titrant error; for absorbance outside the calibration, plans a known dilution and requires a new valid measurement.',
'D keep: Beschreibung und Übersetzung tragen die anspruchsvollere praktische Analysenleistung korrekt. P revise, offener Befund B-P-01: Der volle Säurefall und aktuelle P-taskDemand verlangen A/B-Verhältnis bzw. A/B ratio, die Referenz cA=0,00800 und cB=0,0160 nennt aber Verhältnis2; der frische Transfer nennt ausdrücklich B/A2. cB/cA=2, cA/cB=0,5. Richtung in DE/EN-Aufgabe, Transfer und Antwort durchgängig ausdrücklich benennen, z.B. B/A. Diese begrenzte Nachweiskorrektur ist hier weder ausgeführt noch freigegeben. Die übrige Standard-/Endpunkt-/Verdünnungslogik ist fachlich nachvollziehbar.'
],
[
'Reflexion einer eigenen Untersuchung bindet Methodenbegründung, Unsicherheiten und Verbesserungen an tatsächlich eigene Ergebnisse und die Ausgangshypothese; eine eigene angeleitete Durchführung ist dabei zulässig.',
'Reflection on an own investigation connects method justification, uncertainty and improvements to actual own results and the initial hypothesis; an own guided investigation is a valid starting point.',
'Verknüpft das unveränderte eigene Roh- und Handlungsprotokoll mit der Frage, begründet die angewandte Methode und leitet aus einer konkreten beobachteten Grenze eine überprüfbare Verbesserung ab.',
'Links the unchanged own raw-data and action record to the question, justifies the method used and derives a testable improvement from a specific observed limitation.',
'Wählt für einen im eigenen Log belegten Temperatur-, Endpunkt- oder Verschleppungseffekt eine neue sichere Untersuchung und erklärt, welcher neue Befund die verbleibende Unsicherheit unterscheiden könnte.',
'Chooses a new safe investigation for a temperature, endpoint or carry-over effect evidenced in the own log and explains which new finding could distinguish the remaining uncertainty.',
'Die gemeinsame Reflexionskompetenz ist klar und bilingual gleichwertig. Eigene Ausführung ist erforderlich, selbstständige Planung wird bei einem angeleiteten eigenen Ausgangsversuch nicht vorgetäuscht. Vollfälle/P sichern Hypothesenbezug, tatsächliche Protokolle und konkret davon abgeleiteten Transfer; eine Musterkritik schließt das Ziel nicht.'
],
[
'Chemische Quelleninformation ist nach Frage, Adressat und Situation auszuwählen und zu strukturieren; Werbeaussage, Modellbefund und fachliche Erklärung haben unterschiedliche Belegfunktionen und Grenzen.',
'Chemical source information is selected and structured for the question, audience and situation; advertising, model findings and scientific explanations have distinct evidential functions and limits.',
'Erstellt eine eigene begründete Auswahl und adressatengerechte Information aus den S- oder T-Quellen, nennt Herkunft und Bezugsgrößen und dokumentiert auf dem tatsächlich recherchepflichtigen Weg zusätzlich eigenes Suchen, Lesen und Zitieren.',
'Creates an own justified selection and audience-appropriate note from the S or T sources, identifies origin and reference quantities and additionally records own searching, reading and citation on a route that actually requires research.',
'Passt die Quelleninformation für ein Hausmeisterteam oder einen Mehrwegvergleich an und begründet, welche zusätzlichen Oberflächen-, Nutzungs-, Reinigungs- oder Transportangaben dafür erforderlich sind.',
'Adapts the source information for a caretaker team or reuse comparison and explains which additional surface, use, cleaning or transport information is required.',
'Kanonischer Wortlaut und DE/EN-Parität sind korrekt. Das ODER der allgemeinen Quellenwahl bleibt erhalten; der konkrete BY-C9-NTG-Zusatz verlangt im Fallmaterial ausdrücklich vorgegebene UND eigene Recherche. Rechercheweg und leere Protokolle liegen tatsächlich vor. Modellrestflächen und Stückmasse werden nicht zu universellen Wirkungs- oder Umweltbehauptungen erweitert.'
],
[
'Selbstständige komplexe Quellenerschließung verbindet analoge und digitale Recherche, Interpretation von Gleichgewichts- oder Bilanzdarstellungen und belegte chemische Schlussfolgerungen; Quelleninhalt, Zitat und eigene Ableitung bleiben unterscheidbar.',
'Independent interpretation of complex sources combines analogue and digital research, interpretation of equilibrium or balance representations and supported chemical conclusions; source content, quotation and own inference remain distinguishable.',
'Belegt den tatsächlichen Such- und Leseweg, interpretiert die pH-/Löslichkeitsdarstellung oder die Stoff-/Energiedaten je akzeptierter Produktmasse und erstellt eine begründete Auswertung mit gekennzeichneten Zitaten und genauer Fundstelle.',
'Evidences the actual search and reading process, interprets the pH/solubility representation or material/energy data per accepted product mass and produces a justified evaluation with marked quotations and precise locations.',
'Recherchiert eine zusätzliche feste Salzphase als Grenze des einfachen Säuremodells oder aktualisiert die Bilanz bei veränderter akzeptierter Produktmasse und trennt jeweils neue Folgerung, ursprüngliche Quelle und fehlende Daten.',
'Researches an additional solid salt phase as a limit of the simple acid model or updates the balance for changed accepted product mass, distinguishing the new inference, original source and missing data.',
'Der Text beschreibt eine zusammenhängende anspruchsvollere Quellenkompetenz und ist DE/EN-gleichwertig. Die sechs tatsächlich gelieferten Archivdateien enthalten nachvollziehbare Annahmen und Daten; die Zusatzquelle und echte analoge/digitale Eigenrecherche bleiben künftige erforderliche Lernendenprodukte. 1,1/2/11 sowie5 gegenüber2,22 kg/kg und2,5 gegenüber3,5 kWh/kg sind korrekt begrenzt. Keine Quellen-/Human- oder Beratungserfolgsfreigabe.'
],
[
'Die Eignung einer chemischen Quelle hängt von konkreter Aussage, fachlicher Relevanz, Urheber und Intention sowie überprüfbarer Methode und Beleglage ab; Vertrauen und Gültigkeit sind keine bloßen Herkunftsetiketten.',
'A chemistry source is suitable only relative to a specific claim, scientific relevance, authorship and intention, and checkable methods and evidence; trust and validity are not mere labels of origin.',
'Vergleicht Anbieter-, Labor- und anonymes Material oder Fachblatt, Lehrtext und Werbung anhand konkreter Aussagen und Methoden und begründet jeweils die Tragweite für Farbstoff-, Sicherheits- oder Löslichkeitsfragen.',
'Compares vendor, laboratory and anonymous material or a technical report, textbook and advertisement using specific claims and methods and justifies their scope for dye, safety or solubility questions.',
'Prüft bei angekündigten neuen unabhängigen Daten die tatsächliche Beleglage und revidiert nur gedeckte Aussagen; bewertet offengelegte Herstellerfinanzierung als zu prüfendes Interesse ohne automatischen Falschheitsbeweis.',
'Checks the actual evidence when new independent data are announced and revises only supported claims; evaluates disclosed manufacturer funding as an interest to examine without automatically declaring the content false.',
'Die Beschreibung trifft die eigenständige Quellenkritik klar und bilingual gleichwertig. Vollfälle/P unterscheiden 75% Signalabnahme, +900% Löslichkeitszunahme und unbewiesene Trinkbarkeit oder Wirksamkeit. Der neue Bericht ist nur angekündigt, daher wird kein erfolgreich gelesener Prüfbeleg erfunden; die fachliche Revisionsregel bleibt beobachtbar.'
],
[
'Eine begründete chemische Abwägung entwickelt eigene belegte Argumente aus vergleichbaren Daten und verbindet sie mit offengelegten Kriterien, Gewichtungen und Mindestanforderungen.',
'A reasoned chemical assessment develops own supported arguments from comparable data and connects them to explicit criteria, weights and minimum requirements.',
'Entwickelt aus dem F/G- oder E/M-Rohdossier selbst konkrete Pro- und Kontra-Argumente, vergleicht sie mit der vorgegebenen Pauschalbehauptung und begründet eine Entscheidung mit passenden Bezugsgrößen und Grenzen.',
'Independently develops specific arguments for and against from the F/G or E/M raw dossier, compares them with the supplied blanket claim and justifies a decision with appropriate reference quantities and limits.',
'Bewertet bei G=18 kWh das bisherige Energiekontraargument neu oder begründet, welche gemeinsamen Wirkungsindikatoren für Transport und Waschen fehlen; verändert das eigene Urteil nur entsprechend den geänderten Bedingungen.',
'Reassesses the previous energy argument when G uses18 kWh or explains which common impact indicators are missing for transport and washing, revising the own judgment only as supported by changed conditions.',
'Eigenes Finden, Vergleich und Gewichtung bilden eine gemeinsame Bewertungskompetenz; Beschreibung und Übersetzung sind präzise. Die Rohdossiers geben keine fertige Pro-/Kontra-Liste vor. Gs geänderter Energiebedarf ändert ein echtes Argument, während Kosten und Mindestentfernung bestehen. Unvereinbare Umwelteinheiten werden nicht addiert; der P-Vertrag passt.'
],
[
'Chemisches Präsentieren verbindet fachlichen Gegenstand und eigene Arbeit mit einer begründeten Auswahl von Aufbau, Darstellung und analogen sowie digitalen Medien für eine konkrete Zielgruppe.',
'Presenting chemistry connects subject matter and own work with justified structure, representations and analogue and digital media for a specific audience.',
'Präsentiert tatsächlich eine eigene Prozessdatenauswertung oder Modellprüfung mit eigenem analogem Produkt und digitalen Folien beziehungsweise Tabelle, erläutert Datenherkunft und eigenen Beitrag und beantwortet eine echte Publikumsfrage.',
'Actually presents an own process-data evaluation or model test using an own analogue product and digital slides or table, explains data origin and own contribution and answers an actual audience question.',
'Passt die tatsächlich gehaltene Darstellung für ein Oberstufenlabor oder jüngeres Publikum an und begründet Medienwahl und Fachsprache, während Stoff-/Energiebezüge oder Belegung-versus-Wirkung erhalten bleiben.',
'Adapts the actual presentation for an upper-secondary laboratory or younger audience and justifies media and terminology while preserving material/energy reference quantities or the occupancy-versus-effect distinction.',
'Die Beschreibung ist korrekt, bilingual gleichwertig und auf die Präsentationskompetenz begrenzt. Vollfälle/P verlangen Sachverhalt UND eigene Arbeit, beide Medien und wirklichen Vortrag/Austausch. Eigenes Arbeiten mit fremden Lehrdaten ist zulässig und wird nicht als eigene Forschung ausgegeben. Eine gelesene Musterfolie zählt nicht als Präsentation.'
],
[
'Chemische Berufsfelder unterscheiden sich durch Aufgaben, Anwendungen und Anforderungen; ihr gesellschaftlicher Bezug und konkrete Interessen können eine begründete berufliche Orientierung tragen.',
'Chemical career fields differ in tasks, applications and requirements; their societal role and specific interests can support a reasoned career orientation.',
'Vergleicht mindestens drei fiktive L/P/U/F-Felder anhand konkreter chemischer Tätigkeiten und Anforderungen, begründet eine persönliche oder ausdrücklich hypothetische Auswahl und benennt Herausforderung und weiteren Informationsbedarf.',
'Compares at least three fictional L/P/U/F fields using specific chemical tasks and requirements, justifies a personal or explicitly hypothetical choice and identifies a challenge and further information needed.',
'Überprüft bei einer neuen Präferenz für Anlagensteuerung die Wahl anhand veränderter Aufgabenpassung oder leitet aus neuer Sensortechnik konkrete zusätzliche Informationsfragen ab.',
'Reviews the choice using changed task suitability when a preference shifts to plant control or derives specific additional information questions from new sensor technology.',
'Der curriculare Kompetenztext ist klar und DE/EN-gleichwertig. Hypothetische Entscheidung erlaubt beobachtbare Begründung, ohne menschlichen Beratungserfolg oder amtliche Qualifikation zu behaupten. Die verschiedenen Aufgabenfelder, Anforderungen und geänderte Präferenz ergeben sinnvollen Transfer. Keine Umdeutung in ungeprüfte Motivationsorientierung; aktuelle reale Berufswege bleiben nachzuschlagen.'
],
[
'Fachlicher chemischer Diskurs verknüpft schlüssige Erklärung, datenbezogene Argumentation und tatsächliche Reaktion auf Gegenbeiträge mit begründeter Reflexion des eigenen Standpunkts.',
'Scientific chemistry discussion combines coherent explanation, data-based argument and actual responses to other contributions with reasoned reflection on the own standpoint.',
'Führt einen echten Austausch über Katalysator/Gleichgewicht oder Leitfähigkeit/Temperatur, stellt eine sachliche Rückfrage, nimmt die tatsächliche Partnerantwort auf und begründet anschließend eine Beibehaltung, Einschränkung oder Korrektur des eigenen Standpunkts.',
'Conducts an actual exchange about catalysts/equilibrium or conductivity/temperature, asks a scientific follow-up, receives the actual partner reply and then justifies retaining, restricting or correcting the own standpoint.',
'Reagiert auf die neue Behauptung nur beschleunigter Hinreaktion oder auf neue temperaturgleiche NaCl-Daten mit einer fachlich begründeten responsiven Antwort statt eines vorgedruckten Dialogs.',
'Responds to a new claim that only the forward reaction accelerates or to new equal-temperature NaCl data with a scientifically justified responsive reply rather than a prewritten dialogue.',
'Die Beschreibung wahrt die gemeinsame Diskurskompetenz und DE/EN-Parität. Vollfälle/P verlangen tatsächliche Wechselbeiträge und eigene Reflexion; Sachblätter liefern fallspezifische Grundlagen. Katalysator verändert K nicht, und eine Temperaturkontrolle begrenzt die Konzentrationsaussage. Vorgegebene Gesprächskarten sind kein tatsächlich erfolgter Austausch.'
],
[
'Chemische Modelle machen theorieabhängige Beziehungen zugänglich und begrenzen ihre Aussagen durch Annahmen; Atombau/Periodizität, Stoffbilanzgleichgewicht, Bindung/Geometrie und Rezeptor-/Enzymwechselwirkung verlangen jeweils passende Modelle und Kritik.',
'Chemical models expose theory-dependent relationships and bound their claims through assumptions; atomic structure/periodicity, mass-balance equilibrium, bonding/geometry and receptor/enzyme interactions each require suitable models and criticism.',
'Nutzt eigene analoge Modelle und digitale Tabellen tatsächlich für die gesamte genannte Kontextbreite, prüft Hypothesen gegen Daten, vergleicht die registrierten vollständigen L/L2-Posen und begründet konkrete Grenzen und Weiterentwicklungen.',
'Actually uses own analogue models and digital tables across the stated contextual breadth, tests hypotheses against data, compares the registered complete L/L2 poses and justifies specific limits and developments.',
'Passt das Gleichgewichtsmodell bei K=2 mit zulässiger Stoffbilanz an und prüft die räumliche OH-Ergänzung bei L2, ohne aus zusätzlicher Gruppe oder Belegung eine stärkere Wirkung oder aus K eine Reaktionsgeschwindigkeit abzuleiten.',
'Adapts the equilibrium model at K=2 using a valid mass balance and tests the spatial OH addition to L2 without inferring stronger effects from an extra group or occupancy, or a reaction rate from K.',
'Die gemeinsame Kompetenz ist theoriegestützte Modellnutzung/-kritik mit ausdrücklich verbindlicher Anwendungsbreite; ein Einzelkontext schließt sie nicht. DE/EN erhalten diese Breite. Tatsächliches28-Atom-Kit und OH-Transfer liegen vor: unabhängig nachgerechnet Kontakte L3,40/2,00/3,50, L2-Ammonium6,1907, Winkel180°, CH2-Winkel109,471° und OX…H3,7353. K2 ergibt x=4−sqrt(13); Belegung ist keine Aktivierung, Esterhydrolyse erhält E. P fordert eigene analoge/digitale Produkte und Modellgrenzen. Keine allein durch Kontextvielfalt begründete Wortlaut-/Splitkorrektur; keine P-, A- oder V-Neufreigabe.'
]
]
assert len(rows)==12
fields=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
records=[]
for i,(g,row) in enumerate(zip(input_['goals'],rows),1):
 r={
 '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
 'recordId':f'{runid}.g{i:02}', 'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
 **{k:g[k]for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
 'decision':'keep','understandingEvidence':dict(zip(fields,row[:6])),'rationale':row[6],
 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'revise'if i==3 else'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
 records.append(r)
resultdir=out/'results';resultdir.mkdir(exist_ok=True)
recordpath=resultdir/(batch['batchId']+'.records.jsonl')
assert not recordpath.exists()
recordpath.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n'for r in records))
params={'execution':'native Codex independent B reviewer session','systemIdentifiedModel':'GPT-6','exactBackendModelSnapshot':'not exposed','temperature':'not exposed','samplingParameters':'not exposed','externalModelApiCalled':False,'blindToOtherReviewerScientificJudgments':True,'modelFamilyDiversityClaimed':False,'firstScientificFindingsSha256':hashlib.sha256(first.read_bytes()).hexdigest(),'startedAtSemantics':'Earliest directly recorded own reviewer artifact time (first PDF render directory); native session began earlier, exact session start unavailable.','toolsActuallyUsed':['functions.exec','tools.exec_command','tools.view_image'],'localScientificInspection':['Python text reading','BeautifulSoup HTML parsing','PyMuPDF rasterization of existing PDF','NumPy calculation from supplied coordinates'],'imageGeneration':False,'actualLearnerPerformanceSupplied':False}
parampath=out/'native-execution-availability-and-parameters.json';parampath.write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n')
inputroles={'book_model','book_pdf','book_html','review_prompt','review_criteria'}
run={
 '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 via native Codex session; exact backend model snapshot unavailable',
 'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':'sha256:'+hashlib.sha256(parampath.read_bytes()).hexdigest(),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],
 'inputArtifacts':[{'role':a['role'],'digest':a['digest']}for a in bundle['artifacts']if a['role']in inputroles]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
 'startedAt':'2026-10-17T10:13:21.211287Z','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':'sha256:'+hashlib.sha256(recordpath.read_bytes()).hexdigest(),'toolchainVersion':'codex-native-independent-b-v1'}
runpath=resultdir/(batch['batchId']+'.run.json');assert not runpath.exists();runpath.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
finding={'findingId':'B-P-01','status':'unresolved','authority':'ai_candidate','lane':'P recommendation in independent D review; no P approval','goalId':input_['goals'][2]['goalId'],'caseKey':'upper-hypothesis-investigation-acid-analysis','type':'ratio-direction-inconsistency','observedDemandDe':'A/B-Verhältnis','observedDemandEn':'A/B ratio','referenceConcentrations':{'cA_mol_L':0.008,'cB_mol_L':0.016},'referenceReportedRatio':2,'freshReferenceExplicitDirection':'B/A','calculation':{'cB_over_cA':2,'cA_over_cB':0.5},'recommendedBoundedCorrection':'State cB/cA or B/A consistently in both languages across task, transfer and answer bindings; alternatively retain A/B consistently with reference0.5. No canonical D change.','authoredCorrectionApplied':False,'resolvedByDKeepOrStockValidation':False,'firstScientificFindingsSha256':hashlib.sha256(first.read_bytes()).hexdigest()}
(out/'P-recommendation-B-P-01.unresolved.json').write_text(json.dumps(finding,ensure_ascii=False,indent=2)+'\n')
for p in [recordpath,runpath,parampath]:
 if p.suffix=='.jsonl': [json.loads(x)for x in p.read_text().splitlines()]
 else:json.loads(p.read_text())
 print(p.name,hashlib.sha256(p.read_bytes()).hexdigest(),p.stat().st_size)
