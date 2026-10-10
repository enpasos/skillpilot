from pathlib import Path
import json, hashlib, shutil, datetime

ROOT = Path('/home/enpasos/projects/skillpilot')
SRC = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1'
OUT = Path(__file__).parent
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p): return {'path':str(p.relative_to(ROOT)), 'sha256':digest(p), 'bytes':p.stat().st_size}
def write(p, a):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(a, ensure_ascii=False, indent=2)+'\n')
    json.loads(p.read_text())

write(OUT/'generation-parameters.observed.json', {'exactRuntimeRevision':'not exposed','temperature':'not exposed','samplingParameters':'not exposed','reviewMode':'fresh independent agent B, author and peer verdicts not read'})

# Independently formulated bilingual understanding/performance/transfer chains.
# Neither author expectations nor another reviewer's prose is used as a template.
OWN = {
'f4d5a02d': (
'Chiralität und die Drehung linear polarisierten Lichts hängen zusammen; spezifische Drehung setzt definierte Messbedingungen voraus.',
'Chirality relates to rotation of linearly polarised light; specific rotation assumes defined measurement conditions.',
'Erklärt das Polarimeter und unterscheidet beobachteten Drehwinkel, Konzentration, Weglänge und spezifische Drehung an einer Naturstoffprobe.',
'Explains a polarimeter and distinguishes observed angle, concentration, path length and specific rotation for a natural-substance sample.',
'Beurteilt eine Probe mit veränderter Enantiomerenzusammensetzung und erklärt, warum ein ausbleibender Drehwinkel allein keine fehlende Chiralität beweist.',
'Assesses a sample with a changed enantiomer composition and explains why zero rotation alone does not prove absence of chirality.',
'DE/EN bewahren Erklärung und methodische Einordnung; der Wegfall von DE-HH schafft keine neue Stoffaussage. Die fehlende Buchvisualisierung ist sichtbar ausgewiesen und keine neue V-Freigabe.'),
'2fdd759f': (
'Elektronenbilanz bestimmt das Stoffmengenverhältnis einer Redoxtitration; der Endpunkt ist unter passenden Reaktionsbedingungen interpretierbar.',
'Electron balance determines the mole ratio of a redox titration; its endpoint is interpretable under suitable reaction conditions.',
'Führt eine freigegebene Redoxtitration sicher durch, dokumentiert Volumen und Endpunkt und berechnet die Probenkonzentration aus der ausgeglichenen Redoxgleichung.',
'Safely performs an authorised redox titration, documents volume and endpoint, and calculates sample concentration from the balanced redox equation.',
'Wählt bei einem anderen Elektronendonator das passende Stoffmengenverhältnis und erklärt die Folge einer veränderten Säurebedingung für die Auswertung.',
'Selects the appropriate mole ratio for a different electron donor and explains how changed acidity affects evaluation.',
'Die Beschreibung fordert tatsächliche Durchführung und Auswertung; bereitgestellte Zahlen ersetzen diesen praktischen Anteil nicht. Aktuelle Quellenannotation entfernt DE-SN ohne Textänderung.'),
'75e2eff1': (
'Eine chemisch untersuchbare Frage benennt einen beobachtbaren Zusammenhang; eine prüfbare Hypothese schließt einen möglichen Gegenbefund ein.',
'An investigable chemical question specifies an observable relation; a testable hypothesis admits a possible counter-finding.',
'Formuliert zur Auflösung eines Stoffes eine eigene Frage, eine begründete Vorhersage und einen konkret beobachtbaren Befund, der ihr widerspräche.',
'Formulates an own question, a justified prediction and a concrete contradicting observation about dissolution of a substance.',
'Entwickelt bei einer veränderten Einflussgröße einen neuen Vergleich und trennt die neue Hypothese von einer bloßen Umformulierung der Ausgangsfrage.',
'Develops a new comparison for a changed variable and distinguishes the new hypothesis from a mere rephrasing of the initial question.',
'Eigene Frage, Begründung und Gegenbefund sind in beiden Sprachen ausdrücklich gefordert. Der Sek-I-Leaf ist durch die Boundary auf BY begrenzt; kein fremder Oberstufenoperator wird hinzugefügt.'),
'503dedcb': (
'Chemische Theorien verbinden eine selbst formulierte Frage mit einer überprüfbaren Vorhersage und deren Gültigkeitsbedingungen.',
'Chemical theories connect an own question to a testable prediction and its validity conditions.',
'Leitet aus einem geeigneten Säure- oder Gleichgewichtskonzept eine begründete Hypothese und einen widersprechenden Befund ab.',
'Derives a justified hypothesis and a contradicting finding from a suitable acid or equilibrium concept.',
'Prüft bei veränderter Stoffentnahme oder Verdünnung, ob dieselben Modellannahmen gelten, und verändert die Vorhersage begründet.',
'Checks whether the same model assumptions hold after changed substance removal or dilution, and revises the prediction with reasons.',
'Die höhere Anforderung an Theoriebezug baut auf dem Sek-I-Frageziel auf. DE/EN sind gleichwertig; die Annotation stellt keine praktische Durchführung oder universelle nationale Stoffabdeckung her.'),
'e81a4aed': (
'Angeleitete Untersuchungen prüfen eine Hypothese durch kontrollierte Schritte; sicheres Handeln und nachvollziehbare Rohdaten gehören zur Untersuchung.',
'Guided investigations test a hypothesis through controlled steps; safe action and traceable raw data are part of the investigation.',
'Befolgt unter geeigneter Aufsicht die freigegebene Anleitung, erfasst tatsächliche Beobachtungen mit Einheiten und erklärt den Bezug zur Hypothese.',
'Follows the authorised instructions under suitable supervision, records actual observations with units and explains their relation to the hypothesis.',
'Erkennt in einer neuen Anleitung eine veränderte Kontrollbedingung und begründet, wie sie Vergleich und sichere Durchführung beeinflusst.',
'Identifies a changed control condition in a new set of instructions and explains its effect on comparison and safe performance.',
'Die direkte Laborsicherheitsvoraussetzung bleibt erhalten. Der verbreiterte Jurisdiktionssatz folgt Voraussetzungssichtbarkeit, nicht einer unabhängigen Primärquellenfreigabe jedes Landes.'),
'42391b16': (
'Ein eigener Untersuchungsplan verbindet Hypothese, qualitative und quantitative Beobachtung, Variablenkontrolle und sichere Technikwahl.',
'An own investigation plan connects a hypothesis, qualitative and quantitative observations, variable control and safe technique selection.',
'Plant einen einfachen Vergleich selbst, begründet Größen und Kontrollen, führt ihn nach Freigabe tatsächlich aus und protokolliert Abweichungen.',
'Plans a simple comparison, justifies quantities and controls, actually performs it after authorisation and records deviations.',
'Ändert bei einer neuen Störgröße den Plan und begründet, welche Vergleichsbedingung die ursprüngliche Schlussfolgerung wieder prüfbar macht.',
'Revises the plan for a new confounding variable and explains which comparison condition makes the original inference testable again.',
'Die eigene Planung ist klar von angeleitetem Handeln des Vorgängers abgegrenzt. Beide Sprachen verlangen qualitative und quantitative Untersuchungen sowie tatsächliche Leistung.'),
'f79f15c0': (
'Anspruchsvolle Analysen benötigen eine zur Hypothese passende Methode, quantitative Kontrolle und ein überprüfbares Handlungsprotokoll.',
'Demanding analyses require a method suited to the hypothesis, quantitative control and an auditable action record.',
'Plant die Analyse überwiegend selbstständig, begründet Standards und Messbereich und dokumentiert die tatsächlich freigegebene Durchführung.',
'Plans the analysis largely independently, justifies standards and measurement range, and documents the actual authorised performance.',
'Entscheidet bei einer außerhalb der Kalibrierung liegenden Probe begründet über Verdünnung oder neue Messung und bewahrt die Rohdaten.',
'Makes a reasoned choice of dilution or new measurement for a sample outside calibration and preserves the raw data.',
'Der Sek-II-Leaf fordert überwiegend selbstständige reale Experimente; ein Simulationsblatt oder eine Musterrechnung kann die Durchführung nicht ersetzen. Die BY-Begrenzung verändert den Operator nicht.'),
'9fc800d1': (
'Eine nachvollziehbare Dokumentation unterscheidet Rohbeobachtung, Herkunft, Messbedingungen und chemische Interpretation.',
'Traceable documentation distinguishes raw observation, provenance, measurement conditions and chemical interpretation.',
'Erstellt aus chemischen Rohdaten eine strukturierte Tabelle mit Größen, Einheiten, Quellen und kenntlich gemachten fehlenden Angaben.',
'Creates a structured table from chemical raw data with quantities, units, sources and explicitly identified missing metadata.',
'Dokumentiert eine später korrigierte Verdünnung als neue nachvollziehbare Datenversion und trennt die Korrektur von einer neuen Messung.',
'Documents a later corrected dilution as a traceable new data version and distinguishes correction from a new measurement.',
'Erhebung oder Recherche sind zulässige Datenherkünfte. Die Beschreibung verlangt keine erfundene Eigenmessung und nimmt die hypothesenbezogene Deutung des Nachfolgers nicht vorweg.'),
'7d9fcc7f': (
'Trends und Zusammenhänge chemischer Daten können eine Hypothese stützen oder ihr widersprechen; Darstellung und Bedingungen bestimmen die Aussage.',
'Trends and relations in chemical data may support or contradict a hypothesis; representation and conditions determine the claim.',
'Stellt eine Temperatur-Zeit- oder Konzentrations-Messreihe geeignet dar, erläutert den Trend und begründet seinen Bezug zur Ausgangshypothese.',
'Appropriately represents a temperature-time or concentration dataset, explains the trend and justifies its relation to the initial hypothesis.',
'Beurteilt eine neue Reihe mit verändertem Temperaturverlauf und erklärt, welche vermeintliche Konzentrationsaussage dadurch unsicher wird.',
'Assesses a new series with a changed temperature course and explains which apparent concentration inference becomes uncertain.',
'Der Sek-I-Operator bleibt Datenauswertung mit Hypothesenbezug; statistische Oberstufenverfahren werden nicht zur generellen Zusatzpflicht. Dokumentation ist als Voraussetzung explizit.'),
'9e3fae29': (
'Quantitative chemische Schlüsse brauchen passende mathematische Verfahren, digitale Arbeitsprodukte und chemisch begründete Modellbedingungen.',
'Quantitative chemical conclusions require suitable mathematical methods, digital work products and chemically justified model conditions.',
'Erstellt selbst eine überprüfbare Kalibrier- oder Kinetikauswertung mit Formeln, Einheiten und Residuen und bezieht das Ergebnis auf die Hypothese.',
'Creates an auditable calibration or kinetics analysis with formulas, units and residuals, and relates its result to the hypothesis.',
'Analysiert eine veränderte Datenqualität oder einen überschrittenen Kalibrierbereich und begründet die berichtbare Aussagegrenze.',
'Analyses changed data quality or an exceeded calibration range and justifies the limit of the reportable conclusion.',
'Eigene Auswahl und Anwendung digitaler Werkzeuge ist ausdrücklich Teil des Sek-II-Ziels. Analoge Nachfolger oder reine Musterlösungen schließen diese Pflicht nicht.'),
'4aa3a130': (
'Datenqualität, Verfahren und Untersuchungsbedingungen bestimmen, wie weit eine chemische Schlussfolgerung trägt.',
'Data quality, procedure and investigation conditions determine the reach of a chemical conclusion.',
'Unterscheidet an einem Test Signal, Selektivität, Blank und Fehlerquellen und begründet unterstützte sowie nicht unterstützte Aussagen.',
'Distinguishes signal, selectivity, blank and error sources in a test, and justifies supported and unsupported conclusions.',
'Prüft nach einer veränderten Probenmatrix oder Kontrolle erneut die Aussagekraft, ohne Streuung mit Gesamtunsicherheit gleichzusetzen.',
'Reassesses validity after a changed sample matrix or control without equating repeat scatter with total uncertainty.',
'Das Urteil über Tragweite ist von bloßer Diagrammauswertung getrennt und baut auf beiden Datenzielen auf. DE/EN behalten die Begründung von Mess- und Verfahrensfehlern.'),
'a8800c36': (
'Ein chemischer Erkenntnisweg verbindet Frage, Methode, Beobachtung und Interpretation; seine Reichweite hängt von Kontrollen und Annahmen ab.',
'A chemical inquiry connects question, method, observation and interpretation; its reach depends on controls and assumptions.',
'Erklärt an einem fremden Untersuchungsbericht, wie ein Befund eine Deutung stützt und welche Frage das Verfahren nicht beantworten kann.',
'Explains in another investigation report how a finding supports an interpretation and which question its method cannot answer.',
'Revidiert bei einem neuen positiven Blindbefund die Aussage des Berichts und entwickelt einen gezielten Kontrollbedarf.',
'Revises the report’s conclusion after a newly positive blank and develops a targeted control requirement.',
'Ein vorgegebener Erkenntnisweg darf fremde Daten verwenden. Eigene Durchführung oder Reflexion eigener Arbeit wird diesem Ziel nicht unterstellt; dafür existiert der benachbarte Leaf.'),
'99d41b0f': (
'Reflexion eigener Untersuchungen bezieht tatsächlich entstandene Ergebnisse und Vorgehensweisen auf die eigene Frage und deren Grenzen.',
'Reflection on own investigations relates actual results and procedures to the own question and its limits.',
'Verknüpft ein eigenes Handlungs- und Rohdatenprotokoll mit der Hypothese, begründet die Methode und benennt eine konkrete Verbesserung.',
'Connects an own action and raw-data record to the hypothesis, justifies the method and identifies a concrete improvement.',
'Plant aus einer eigenen dokumentierten Abweichung einen gezielten Folgeversuch mit verbesserter Kontrolle, ohne dessen Durchführung zu erfinden.',
'Plans a targeted follow-up with improved control from an own documented deviation without inventing its performance.',
'Die eigene Untersuchung bleibt eine echte Evidenzvoraussetzung. Fremde Archive können dieses Ziel nicht abschließen; DE/EN und die beiden direkten Voraussetzungen erhalten die Unterscheidung.'),
'5b1bb5d9': (
'Quellenauswahl richtet sich nach einer chemischen Frage, relevanten Informationen und der verständlichen Aufbereitung für ein Publikum.',
'Source selection follows a chemical question, relevant information and comprehensible presentation for an audience.',
'Wählt begründet Text- und Bildinformationen zur Frage aus, strukturiert die chemische Aussage und belegt die benutzten Quellen.',
'Selects text and image information with reasons, structures the chemical claim and identifies the sources used.',
'Passt die Auswahl für ein neues Publikum oder eine neue Vergleichsbedingung an und benennt fehlende statt erfundene Angaben.',
'Adapts selection to a new audience or comparison condition and identifies missing rather than invented information.',
'Vorgegebene oder selbst recherchierte Quellen bleiben beide zulässig. Wo ein Quellkontext eigene Recherche verlangt, bleibt diese gesondert verbindlich; allgemeine Quellenanalyse ersetzt sie nicht.'),
'ac8b6c0f': (
'Komplexe chemische Recherche verbindet tatsächliche Quellensuche, die Interpretation mehrerer Darstellungen und belegte eigene Schlussfolgerungen.',
'Complex chemical research connects actual source searching, interpretation of multiple representations and supported own conclusions.',
'Recherchiert tatsächlich analog und digital, verknüpft Text, Formel und Tabelle, leitet eine chemische Aussage ab und markiert Zitate.',
'Actually researches analogue and digital sources, connects text, formula and table, derives a chemical claim and marks quotations.',
'Erschließt einen neuen chemischen Randfall durch zusätzliche belegte Recherche und trennt Quellenaussage, eigene Folgerung und offene Daten.',
'Investigates a new chemical boundary case through additional supported research and distinguishes source claim, own inference and missing data.',
'Selbstständige Recherche und analoge UND digitale Medien sind im Sek-II-Text ausdrücklich erhalten. Ein bereitgestelltes synthetisches Archiv allein ist keine erfüllte Rechercheleistung.'),
'36666b4a': (
'Quellenvalidität hängt von fachlicher Relevanz, überprüfbaren Belegen, Urheberschaft und Absicht für eine konkrete chemische Frage ab.',
'Source validity depends on scientific relevance, checkable evidence, authorship and intention for a specific chemical question.',
'Vergleicht Laborbericht, Fachtext und Werbeaussage anhand ihrer tatsächlichen Daten, Bezugsgrößen und Interessen und begründet ihre Eignung.',
'Compares a laboratory report, technical text and advertisement using their actual data, reference quantities and interests, and justifies suitability.',
'Prüft bei neu offengelegter Finanzierung oder neuer Messmethode gezielt die betroffene Aussage und erhält verbleibende Unsicherheiten.',
'Checks the affected claim after newly disclosed funding or measurement methods and preserves remaining uncertainty.',
'Quellenkritik ist gegenüber der Informationserschließung ein eigenständiges Urteil. DE/EN verlangen begründeten Vergleich und keine bloße Vertrauensetikettierung.'),
'431a0f03': (
'Pro- und Kontra-Argumente benötigen chemische Belege und offengelegte Kriterien; ihre Gewichtung ist keine reine Zählentscheidung.',
'Arguments for and against require chemical support and explicit criteria; weighting is not simply counting arguments.',
'Entwickelt eigene belegte Argumente zu einer chemischen Option, vergleicht sie mit vorgegebenen Argumenten und begründet deren Gewicht.',
'Develops own supported arguments about a chemical option, compares them with supplied arguments and justifies their weight.',
'Bewertet nach einer geänderten Energie- oder Sicherheitsbedingung das betreffende Argument neu und erhält unabhängige Kriterien.',
'Reassesses the affected argument after changed energy or safety conditions while retaining independent criteria.',
'Der eigene Argumentfund bleibt verbindlich und unterscheidet das Ziel von reinem Vergleich vorgelegter Listen. Eine allgemeine Bewertungsquelle wird nicht als Vollbeleg jedes Einzelaspekts ausgegeben.'),
'31781d00': (
'Eine chemische Darstellung bewahrt fachliche Beziehungen und Bezugsgrößen, während ihre Form an Frage und Publikum angepasst wird.',
'A chemical representation preserves scientific relations and reference quantities while adapting its form to question and audience.',
'Überführt einen Stofftext in ein eigenes beschriftetes Teilchenschema oder eine Datentabelle in eine Grafik und begründet Auswahl und Grenzen.',
'Transforms a substance text into an own labelled particle diagram or a table into a graph and justifies selection and limits.',
'Passt eine Darstellung an ein anderes Publikum an, ohne Einheiten, Stoff-Teilchen-Unterscheidung oder chemische Bilanz zu verändern.',
'Adapts a representation to a different audience without changing units, substance-particle distinctions or chemical balance.',
'Der Darstellungswechsel verlangt ein tatsächliches Produkt und begründete Aussagen. Die Nachfolger-Präsentation ist ein eigener Schritt; aktuelle HE-Sichtbarkeit ist Voraussetzungsschluss, keine neue Stofffreigabe.'),
'38e30bb9': (
'Präsentation verbindet chemischen Inhalt und eigene Arbeit mit einer begründeten Medien-, Aufbau- und Adressatenwahl.',
'Presentation connects chemical content and own work to a justified choice of media, structure and audience.',
'Präsentiert ein eigenes Arbeitsprodukt mit passenden analogen und digitalen Medien und erklärt den fachlichen Inhalt und die Medienwahl.',
'Presents an own work product with suitable analogue and digital media and explains its scientific content and media choice.',
'Verändert für ein jüngeres oder fachlich spezialisiertes Publikum Aufbau und Erklärung, während chemische Aussage und Herkunft erhalten bleiben.',
'Changes structure and explanation for a younger or specialised audience while preserving chemical claims and provenance.',
'Die Formulierung fordert beide Medientypen und eigene Ergebnisse. Ein geschriebenes Referat ohne tatsächliche Präsentation ist nicht ausreichend; beide Sprachfassungen bewahren dies.'),
'7f140b34': (
'Chemische Anwendungen haben konkrete Funktionen und gesellschaftliche, menschliche und ökologische Folgen mit begrenzter Beleglage.',
'Chemical applications have concrete functions and societal, human and environmental consequences with bounded evidence.',
'Erklärt zwei unterschiedliche chemische Anwendungsfunktionen und diskutiert Nutzen und mögliche Belastungen anhand fachlicher Zusammenhänge.',
'Explains two different chemical application functions and discusses benefits and possible burdens using scientific relations.',
'Beurteilt dieselbe Anwendung unter veränderten Nutzungs- oder Entsorgungsbedingungen und vermeidet pauschale Umwelturteile.',
'Assesses the same application under changed use or disposal conditions and avoids blanket environmental judgements.',
'Der Beitrag beschreibt und diskutiert Anwendungen; die begründete Berufswahl bleibt im Nachfolger. DE/EN erhalten Mensch, Gesellschaft und Umwelt als Bezug.'),
'6c9adc36': (
'Chemische Berufsfelder unterscheiden sich in Aufgaben und Anforderungen; chemische Anwendung und gesellschaftliche Entwicklung informieren eine begründete Wahl.',
'Chemical occupations differ in tasks and requirements; chemical applications and social developments inform a reasoned choice.',
'Vergleicht Labor-, Produktions- und Umweltaufgaben anhand konkreter Anforderungen und bezieht die Informationen begründet auf eine Berufsorientierung.',
'Compares laboratory, production and environmental tasks using concrete requirements and relates the information to reasoned career orientation.',
'Prüft bei verändertem Interesse oder neuer Technik die eigene begründete Wahl und nennt zusätzlich benötigte aktuelle Berufsinformationen.',
'Reviews the reasoned choice after changed interests or technology and identifies additional current career information needed.',
'Dies ist ein fachliches curriculares Ziel, kein als orientation klassifiziertes Motivationsziel. Die BY-Annotation bewahrt den Quellenbezug, ohne eine tatsächliche Berufsberatung zu behaupten.'),
'1df17884': (
'Chemische Entscheidungen verbinden belegte Chancen und Risiken mit ethischen, ökologischen, ökonomischen, sozialen und sicherheitsbezogenen Kriterien.',
'Chemical decisions connect supported opportunities and risks with ethical, environmental, economic, social and safety criteria.',
'Leitet die Kriterien für einen konkreten Fall selbst ab, entwickelt Optionen, begründet eine Strategie und prüft Entscheidung und Grenzen der chemischen Sicht.',
'Derives criteria for a specific case, develops options, justifies a strategy and reviews the decision and limits of the chemical perspective.',
'Überprüft bei veränderter Kostenverteilung oder Sicherheitslage die Strategie und erklärt, welche Kriterien das Urteil ändern oder erhalten.',
'Reviews the strategy after changed cost distribution or safety conditions and explains which criteria change or preserve the judgement.',
'Die Schritte bilden eine zusammenhängende Entscheidungskompetenz; die zwei Sätze sind keine versteckte separate Prüfung. Alle fünf Perspektiven und die Strategiereflexion sind zweisprachig erhalten.'),
'e5a5dcd8': (
'Entwicklung chemischen Wissens wird gesellschaftlich und technisch beeinflusst; empirische Gültigkeit bleibt von gesellschaftlicher Zustimmung verschieden.',
'Development of chemical knowledge is influenced by society and technology; empirical validity remains distinct from social approval.',
'Ordnet an einer chemischen Wissensentwicklung soziale, kulturelle, historische, technische, ökologische und ökonomische Einflüsse begründet ein.',
'Reasonably identifies social, cultural, historical, technical, environmental and economic influences in a case of chemical knowledge development.',
'Bewertet eine neue technische oder wirtschaftliche Voraussetzung und erklärt deren Einfluss auf Forschung, ohne dadurch Messergebnisse für wahr zu erklären.',
'Assesses a new technical or economic condition and explains its influence on research without using it to establish empirical truth.',
'DE/EN unterscheiden Einfluss und Gültigkeit ausdrücklich. Der verlinkte C11-Nachfolger bleibt ohne Kurszuordnung; dieses neue D-Urteil räumt dessen HOLD nicht aus.'),
'9f892457': (
'Chemische Produkte, Verfahren, Methoden und Wissen wirken in historischen und aktuellen Zusammenhängen auf Umwelt, Wirtschaft und Gesellschaft.',
'Chemical products, processes, methods and knowledge affect environment, economy and society in historical and current contexts.',
'Erklärt eine historische und heutige Wirkungskette und bewertet sie mit drei Nachhaltigkeitsperspektiven einschließlich möglicher eigener Handlungen.',
'Explains a historical and current chain of effects and assesses it through three sustainability perspectives including possible own actions.',
'Prüft bei geändertem Wissenszugang oder Verlustpfad die Bewertung und trennt neue Daten, Wertkriterien und offene Folgen.',
'Reviews the evaluation after changed knowledge access or loss pathways and distinguishes new data, values and unresolved consequences.',
'Die vollständige Wirkungskette einschließlich eigener Handlungsreflexion bleibt erkennbar; der Gegenstand ist mehr als ein pauschales Umweltetikett. HE-Sichtbarkeit folgt aktuellen Voraussetzungen.'),
'1f354a60': (
'Ein fachlicher Standpunkt verbindet chemische Erklärung und Beleg; konstruktiver Austausch reagiert auf reale Beiträge und überprüft die eigene Aussage.',
'A scientific standpoint connects chemical explanation and evidence; constructive exchange responds to actual contributions and reviews the own claim.',
'Erklärt Geschwindigkeit und Gleichgewicht oder Leitfähigkeit und Temperatur, fragt einen Partner nach dem Beleg und reagiert begründet auf dessen Antwort.',
'Explains rate and equilibrium or conductivity and temperature, asks a partner for evidence and responds to their answer with reasons.',
'Prüft einen neuen tatsächlichen Einwand oder neue kontrollierte Daten und hält den eigenen Standpunkt begründet aufrecht, schränkt ihn ein oder korrigiert ihn.',
'Checks a new actual objection or controlled data and reasonably retains, restricts or corrects the own standpoint.',
'Die direkte Orientierung ergänzt Motivation; Fach- und Symbolsprache bleibt vorausgesetzt. Sie ersetzt weder den tatsächlichen Dialog noch Begründung und eigene Reflexion des vollständigen P-Bodys.'),
'6c7ce93c': (
'Chemische Modelle wählen Beziehungen aus, erklären Materie und Reaktionen und besitzen prüfbare Aussagen sowie begründete Grenzen.',
'Chemical models select relations, explain matter and reactions, and have testable statements and justified limits.',
'Wählt hypothesengeleitet ein analoges oder digitales Modell, nutzt es selbst, vergleicht dessen Aussagen mit einem anderen Modell und Beobachtungen und begründet Grenzen.',
'Selects an analogue or digital model using a hypothesis, actually uses it, compares its claims with another model and observations, and justifies limits.',
'Erkennt bei einer geänderten Lösungs- oder Energiefrage einen fehlenden Modellanteil und begründet eine geeignete Weiterentwicklung statt eine unbelegte Vorhersage.',
'Identifies a missing model component for a changed dissolution or energy question and justifies suitable development instead of an unsupported prediction.',
'Die Sek-I-ODER-Route bleibt methodenneutral, während tatsächliche Modellarbeit Pflicht ist. SOURCE7-Fachkontexte und spezielle Software-/Feinbaupflichten behalten eigene Grenzen; NaCl-Modelle schließen sie nicht pauschal.'),
'86d34f1f': (
'Modellwahl verbindet Atombau, Periodizität, Gleichgewicht, Geometrie und komplexe Molekülkontakte mit überprüfbaren Aussagen und Annahmen.',
'Model selection connects atomic structure, periodicity, equilibrium, geometry and complex molecular contacts to testable claims and assumptions.',
'Nutzt tatsächlich analoge und digitale Modelle in den genannten Kontexten, prüft Hypothesen und begründet ihre Aussagekraft einschließlich Rezeptor- und Enzymbeziehungen.',
'Actually uses analogue and digital models in the named contexts, tests hypotheses and justifies their reach including receptor and enzyme relationships.',
'Ändert Gleichgewichtsbedingungen oder eine registrierte Ligandenpose und begründet die neuen Modellfolgen ohne daraus Kinetik oder medizinische Wirkung abzuleiten.',
'Changes equilibrium conditions or a registered ligand pose and justifies the new model consequences without inferring kinetics or medical effects.',
'Die Sek-II-UND-Pflicht und alle komplexen Kontexte bleiben trotz neuer direkter Orientierung erhalten. Das vollständige finite Material erlaubt eigene Modellarbeit, behauptet aber keine reale Labor- oder Lernendenleistung.')
}

campaign_products=[]
all_records=[]
for group in ['affected20-1','affected7-2']:
    source_round=SRC/'native'/group/'round-b'
    target_round=OUT/'normal'/group/'round-b'
    target_round.mkdir(parents=True, exist_ok=True)
    for name in ['description-review-campaign.json','description-review-input.json','review-bundle-manifest.json','prompt.md','criteria.md']:
        shutil.copyfile(source_round/name,target_round/name)
    shutil.copytree(source_round/'contracts',target_round/'contracts',dirs_exist_ok=True)
    shutil.copytree(source_round/'batches',target_round/'batches',dirs_exist_ok=True)
    inp=json.loads((source_round/'description-review-input.json').read_text())
    campaign=json.loads((source_round/'description-review-campaign.json').read_text())
    batch=campaign['batches'][0]
    runid='chemie-source7-normal37-native27-genuine-b-'+group+'-20261010-v1'
    records=[]
    for g in inp['goals']:
        values=OWN[g['goalId'][:8]]
        six=dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],values[:6]))
        rec={
          '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
          'schemaVersion':1,'recordId':runid+'.'+g['goalId'],'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
          'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
          **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
          'decision':'keep','understandingEvidence':six,'rationale':values[6],
          'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none' if g['reviewContext']['evidenceProfile'] else 'create',
          'recordStatus':'candidate','reviewAuthority':'ai_candidate'}
        records.append(rec)
    result_dir=target_round/'results';result_dir.mkdir(exist_ok=True)
    records_path=result_dir/(batch['batchId']+'.records.jsonl')
    records_path.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in records))
    assert len([json.loads(x) for x in records_path.read_text().splitlines()])==len(records)
    manifest={
      '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
      'schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
      'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
      'provider':'OpenAI','model':'Codex GPT-6 (session label; precise runtime revision not exposed)',
      'promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
      'independenceGroupId':campaign['independenceGroupId'],'role':'subject_reviewer','blindToOtherRuns':True,
      'promptFamilyId':'goal-description-understanding-evidence-v2','generationParametersFingerprint':digest(OUT/'generation-parameters.observed.json'),'toolchainVersion':'skillpilot-normal-description-review-v2',
      'goalIds':batch['goalIds'],'inputArtifacts':[
        {'role':'review_input_json','digest':digest(SRC/'native'/group/'bundle/review-input.json')},
        {'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']},
        {'role':'review_prompt','digest':campaign['promptFingerprint']},
        {'role':'review_criteria','digest':campaign['criteriaFingerprint']}],
      'startedAt':'2026-10-10T13:45:00+00:00','completedAt':NOW,'status':'completed','outputDigest':digest(records_path)}
    # startedAt is revised below from this agent's observed shell process clock;
    # no provider invocation duration or unexposed model revision is invented.
    manifest['startedAt']=NOW
    run_path=result_dir/(batch['batchId']+'.run.json');write(run_path,manifest)
    campaign_products.append({'group':group,'campaign':binding(target_round/'description-review-campaign.json'),'input':binding(target_round/'description-review-input.json'),'bundle':binding(target_round/'review-bundle-manifest.json'),'records':binding(records_path),'run':binding(run_path),'batchesDirectory':str((target_round/'batches').relative_to(ROOT)),'resultsDirectory':str(result_dir.relative_to(ROOT))})
    all_records.extend(records)

write(OUT/'D27.first.independent-b.json',{'schemaVersion':1,'role':'Genuine fresh independent B blind first pass','createdAt':NOW,'records':all_records,'count':27,'humanApproval':False,'learnerPerformanceClaim':False,'verdicts':{'keep':27,'revise':0,'split_review':0,'block':0}})
write(OUT/'normal-campaigns.independent-b.json',{'schemaVersion':1,'campaigns':campaign_products,'originalSuppliedBatchOwnershipPreserved':True,'freshIndependentReviewerAgent':'/root/chemistry_current517_source7_d27_genuine_b','authorAndPeerVerdictsNotRead':True,'sameProviderNoDiversityClaim':True,'modelRevisionExposed':False,'timestampMeaning':'Record serialization start and completion time; actual provider invocation timing is not exposed.'})
print('WROTE',len(all_records),'own normal records')
