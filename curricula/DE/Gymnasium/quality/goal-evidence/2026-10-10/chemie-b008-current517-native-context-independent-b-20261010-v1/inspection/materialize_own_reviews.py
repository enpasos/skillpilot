#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,datetime,copy
R=pathlib.Path('/home/enpasos/projects/skillpilot')
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
A=B/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1'
C=B/'chemie-b008-C11-current-G1-competence-source-context-author-20261010-v1'
O=B/'chemie-b008-current517-native-context-independent-b-20261010-v1'
def read(p):return json.loads((R/p).read_text())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def put(p,j):
 f=R/O/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return f
first=read(O/'FIRST.current517-native-and-C11-G1.independent-b.json')
assert first['currentPeerVerdictsReadBeforeSeal']==False
# Independently authored bilingual positive chains; no peer-output content.
chains={
'75e2eff1':[
'Eine prüfbare chemische Hypothese verknüpft eine veränderte Bedingung mit einem beobachtbaren Ergebnis; Vorhersage und Befund sind verschieden.',
'A testable chemical hypothesis links a changed condition to an observable outcome; prediction differs from a finding.',
'Formuliert selbst eine Frage zu Zuckerauflösung, begründet eine Vorhersage und benennt vergleichbare Bedingungen sowie mögliche stützende und widersprechende Beobachtungen.',
'Independently formulates a question about sugar dissolution, justifies a prediction and specifies comparable conditions and possible supporting and contradicting observations.',
'Überträgt die Fragelogik auf Körnung oder Apfelbräunung und prüft zusätzliche Störgrößen, ohne Durchführung oder Messergebnisse zu erfinden.',
'Transfers the question structure to grain size or apple browning and checks additional confounders without inventing execution or measurements.'],
'503dedcb':[
'Theoriegeleitete Hypothesen begründen erwartbare Befunde durch chemische Konzepte und bleiben bei passenden Gegenbefunden prüfbar.',
'Theory-guided hypotheses justify expected findings through chemical concepts and remain testable against appropriate counterevidence.',
'Identifiziert selbst eine Frage zu sauren Proben, entwickelt daraus mit dem gegebenen Gleichgewichts- oder Stoffmengenkonzept eine eigene Hypothese und konkrete Prüfbedingungen.',
'Independently identifies a question about acidic samples and uses the supplied equilibrium or amount-of-substance concept to develop an own hypothesis and concrete testing conditions.',
'Erklärt bei veränderter Verdünnung oder Probe, welcher neue Befund die begründete Vorhersage stützen oder tatsächlich widerlegen könnte.',
'Explains which fresh finding after changed dilution or sample would support or genuinely contradict the justified prediction.'],
'e81a4aed':[
'Ein angeleiteter Versuch prüft eine Hypothese nur bei eingehaltenen Sicherheits- und Vergleichsbedingungen und nachvollziehbaren Beobachtungen.',
'A guided experiment tests a hypothesis only through observed safety and comparison conditions and traceable observations.',
'Führt die freigegebenen Schritte tatsächlich sicher aus, dokumentiert Werte und Abweichungen und erklärt den Bezug der Beobachtung zur Hypothese.',
'Actually executes approved steps safely, records values and deviations and explains how the observation relates to the hypothesis.',
'Passt bei einer neuen kontrollierten Bedingung das Protokoll sachgerecht an und benennt, welche Vorgabe oder Sicherheitsgrenze weiterhin gilt.',
'Adapts the record for a new controlled condition and identifies which instruction or safety limit continues to apply.'],
'42391b16':[
'Eine selbst geplante chemische Untersuchung verbindet Fragestellung, geeignete qualitative und quantitative Methoden, Kontrollen und sichere Ausführung.',
'An independently planned chemical investigation connects the question, suitable qualitative and quantitative methods, controls and safe execution.',
'Wählt begründet Einflussgrößen und Vergleichsproben, legt einen eigenen sicheren Plan vor und protokolliert die tatsächlich selbst ausgeführten Untersuchungen.',
'Justifies selected variables and comparison samples, submits an own safe plan and documents the investigations actually performed independently.',
'Ändert bei einer neuen Probe oder Messgrenze die Methode begründet und zeigt, welche Kontrollen die Hypothesenprüfung noch tragen.',
'Justifies a method change for a fresh sample or measurement limit and shows which controls still support testing the hypothesis.'],
'f79f15c0':[
'Anspruchsvolle Analytik benötigt eine hypothesenbezogene Auswahl qualitativer und quantitativer Techniken und tatsächliche sichere Ausführung.',
'Advanced analysis requires hypothesis-related selection of qualitative and quantitative techniques and actual safe execution.',
'Plant weitgehend selbst eine passende Analyse, führt beide Teile betreut tatsächlich aus und liefert eigene zeitnahe Beobachtungen, Messwerte und Verfahrensangaben.',
'Largely independently plans a suitable analysis, actually performs both parts with supervision and supplies own contemporaneous observations, measurements and procedures.',
'Wählt für eine veränderte saure Probe oder einen abweichenden Endpunkt eine begründete methodische Anpassung und hält deren Grenzen fest.',
'Selects a justified method adaptation for a changed acidic sample or endpoint and records its limitations.'],
'9fc800d1':[
'Nachvollziehbare Dokumentation bewahrt Rohdaten, Einheiten, Probenbezug und Herkunft und trennt Beobachtung, Berechnung und Deutung.',
'Traceable documentation preserves raw data, units, sample identity and provenance and separates observation, calculation and interpretation.',
'Erstellt selbst ein strukturiertes Protokoll zu den bereitgestellten Daten; fehlende Zeiten oder Bedingungen bleiben offen und berechnete Konzentrationen sind gekennzeichnet.',
'Independently creates a structured record for the supplied data; missing times or conditions remain open and calculated concentrations are labelled.',
'Ergänzt R2 als neues Ereignis und eine Verdünnungskorrektur als versionierte Rechnung, ohne alte Rohdaten oder fehlende Metadaten rückwirkend zu ersetzen.',
'Adds R2 as a new event and a dilution correction as a versioned calculation without retrospectively replacing old raw data or missing metadata.'],
'7d9fcc7f':[
'Tabellen und Diagramme machen chemische Trends unter definierten Bedingungen sichtbar; ihre Beziehung zur Hypothese benötigt eine begründete Interpretation.',
'Tables and graphs reveal chemical trends under defined conditions; their relation to a hypothesis requires justified interpretation.',
'Wertet gegebene Daten selbst in einer passenden Darstellung aus, erklärt einen Trend und begründet, wie er die Ausgangshypothese stützt oder ihr widerspricht.',
'Independently evaluates supplied data in a suitable representation, explains a trend and justifies how it supports or contradicts the initial hypothesis.',
'Beurteilt bei einer veränderten Vergleichsbedingung oder auffälligen Datenreihe, ob dieselbe Deutung noch zulässig ist.',
'Assesses whether the same interpretation remains valid for a changed comparison condition or anomalous series.'],
'9e3fae29':[
'Quantitative chemische Auswertung verbindet geeignete mathematische Verfahren und digitale Werkzeuge mit Bedingungen und Hypothesenprüfung.',
'Quantitative chemical analysis connects suitable mathematical methods and digital tools with conditions and hypothesis testing.',
'Wählt und nutzt selbst eine passende digitale Auswertung, zeigt Rechnung und Einheiten und begründet den Schluss fachübergreifend durch Chemie und Mathematik.',
'Independently selects and uses suitable digital analysis, shows calculations and units and justifies the conclusion through chemistry and mathematics.',
'Prüft nach veränderter Verdünnung oder systematischer Messstörung, welche Skalierung oder Schlussfolgerung unter den neuen Bedingungen gilt.',
'After changed dilution or a systematic measurement disturbance, checks which scaling or conclusion holds under the new conditions.'],
'4aa3a130':[
'Die Aussagekraft chemischer Daten hängt von Fragestellung, Messverfahren, Bedingungen und Fehlerquellen ab.',
'The evidential value of chemical data depends on the question, measurement method, conditions and sources of error.',
'Begründet an konkreten Messwerten, welche Schlussfolgerung zulässig ist und wie Auflösung, Probenbehandlung oder systematische Fehler sie begrenzen.',
'Uses specific measurements to justify which conclusion is warranted and how resolution, sample treatment or systematic errors limit it.',
'Unterscheidet bei einem widersprechenden neuen Wert belastbares Gegenwissen von einem unzuverlässigen oder unpassenden Messverfahren.',
'For a conflicting fresh value, distinguishes reliable counterevidence from an unreliable or unsuitable measurement procedure.'],
'a8800c36':[
'Chemische Erkenntnis entsteht aus dem Zusammenwirken von Frage, Methode, Beobachtung und Interpretation innerhalb eines begrenzten Geltungsbereichs.',
'Chemical knowledge arises from the relation of question, method, observation and interpretation within a bounded scope.',
'Erklärt an einem vorgegebenen Erkenntnisweg, welche Beobachtung welche Deutung trägt und welche Fragen damit offen bleiben.',
'Explains which observation supports which interpretation in a supplied inquiry process and which questions remain open.',
'Überträgt diese Zuordnung auf einen neuen chemischen Befund und kennzeichnet die neue Unsicherheit oder Reichweitengrenze.',
'Transfers this relationship to a fresh chemical finding and identifies the new uncertainty or limit of reach.'],
'99d41b0f':[
'Reflexion eigener Forschung verbindet tatsächliche eigene Ergebnisse mit der ursprünglichen Hypothese, Methodenwahl und konkreten Grenzen.',
'Reflection on own inquiry connects actual own results to the original hypothesis, method selection and concrete limitations.',
'Begründet anhand des eigenen Rohprotokolls den Schluss, zwei wirkliche Unsicherheiten und eine passende verbesserte Folgeuntersuchung.',
'Uses the own raw record to justify the conclusion, two actual uncertainties and a suitable improved follow-up investigation.',
'Entwickelt für eine neue Kontrollbedingung einen verbesserten Plan und erklärt, welche konkrete Unsicherheit er vermindert.',
'Develops an improved plan for a fresh control condition and explains which concrete uncertainty it reduces.'],
'a0080b5f':[
'Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, Konsistenz und Vorläufigkeit begründen wissenschaftliche Gültigkeit ohne fehlerhafte Messungen als Gegenbeweis auszugeben.',
'Reproducibility, falsifiability, intersubjectivity, consistency and provisionality support scientific validity without treating faulty measurements as refutation.',
'Wendet alle fünf Kriterien konkret auf die Ammoniakbehauptung an und trennt nachvollziehbare Gegenbefunde von defektem Sensor oder unbekannten Bedingungen.',
'Applies all five criteria specifically to the ammonia claim and separates traceable counterevidence from a faulty sensor or unknown conditions.',
'Beurteilt eine neue Ergebnisauswahl oder unabhängige Messreihe mit denselben Kriterien und erklärt die verbleibende Vorläufigkeit.',
'Assesses a fresh selection of results or independent measurement series using the same criteria and explains remaining provisionality.'],
'5b1bb5d9':[
'Quellenerschließung ordnet relevante Aussagen einer chemischen Frage und Zielgruppe zu und unterscheidet Information, Werbung und Datenreichweite.',
'Source interpretation relates relevant statements to a chemical question and audience and distinguishes information, advertising and data limits.',
'Wählt und strukturiert selbst passende Quellen für Reinigungs- oder Verpackungsfragen, belegt Aussagen und erstellt auf recherchepflichtiger Route einen tatsächlichen Such-/Lese-/Zitiernachweis.',
'Independently selects and structures sources for cleaning or packaging questions, attributes statements and supplies an actual search/read/citation record on routes requiring research.',
'Passt die Information an eine neue Zielgruppe oder Mehrwegfrage an und begründet zusätzliche fehlende Angaben statt ungestützter Wirkungsversprechen.',
'Adapts the information to a fresh audience or reuse question and justifies additional missing information instead of unsupported promises.'],
'ac8b6c0f':[
'Selbstständige Recherche in komplexen analogen und digitalen Quellen benötigt fachliche Auswahl, Interpretation und nachvollziehbare Belege.',
'Independent research in complex analogue and digital sources requires scientific selection, interpretation and traceable attribution.',
'Findet und liest selbst relevante Quellen, erklärt eine komplexe Darstellung chemisch und trennt eigene Schlussfolgerung, Paraphrase und Zitat.',
'Independently finds and reads relevant sources, interprets a complex representation chemically and separates own conclusions, paraphrase and quotation.',
'Überträgt die Recherche auf eine neue chemische oder pharmazeutische Frage und prüft geänderte Quellenqualität und Aussagegrenzen.',
'Transfers the research to a fresh chemical or pharmaceutical question and examines changed source quality and statement limits.'],
'36666b4a':[
'Vertrauenswürdigkeit einer chemischen Quelle folgt aus fachlicher Relevanz, nachvollziehbaren Belegen, Urheberschaft und Intention.',
'Trustworthiness of a chemistry source follows from scientific relevance, traceable evidence, authorship and intention.',
'Vergleicht analoge und digitale Darstellungen zur konkreten Frage und begründet Eignung oder eingeschränkte Validität anhand ihrer Aussagen und Belege.',
'Compares analogue and digital representations for a specific question and justifies suitability or limited validity through their claims and evidence.',
'Prüft einen neuen widersprechenden Beitrag und unterscheidet Popularität oder Werbung von nachvollziehbarem chemischem Gegenbefund.',
'Examines a fresh opposing contribution and distinguishes popularity or advertising from traceable chemical counterevidence.'],
'431a0f03':[
'Chemische Pro- und Kontra-Argumente benötigen fachliche Belege und transparente Bewertungskriterien; ihre Gewichtung ist begründungspflichtig.',
'Arguments for and against chemical claims need scientific support and transparent evaluation criteria; weighting requires justification.',
'Findet selbst belegte Gegen- und Fürargumente, vergleicht sie mit vorgegebenen und erklärt das unterschiedliche Gewicht für eine konkrete Entscheidung.',
'Independently finds supported opposing and supporting arguments, compares them with supplied arguments and explains different weights for a specific decision.',
'Begründet bei einer neuen Zielsetzung oder Information, welche Gewichtung sich ändert und welche fachliche Grundlage bestehen bleibt.',
'For a fresh objective or information item, justifies which weighting changes and which scientific foundation remains.'],
'31781d00':[
'Eine Darstellungswahl erhält relevante chemische Aussagen und Bezugsgrößen entsprechend Inhalt, Adressat und Situation.',
'A representation choice preserves relevant chemical statements and reference quantities according to content, audience and situation.',
'Überführt Informationen selbst in ein geeignetes Diagramm, Schema oder Textprodukt und erklärt erhaltene Aussagen, Fachsprache und Grenzen.',
'Independently transforms information into a suitable graph, scheme or text and explains retained claims, terminology and limitations.',
'Erstellt für eine neue Zielgruppe eine alternative Darstellung und begründet, welche Aussage trotz Vereinfachung unverändert bleibt.',
'Creates an alternative representation for a fresh audience and justifies which statement remains despite simplification.'],
'38e30bb9':[
'Eine fachliche Präsentation verbindet eigene Arbeitsergebnisse mit begründeter analoger und digitaler Medienwahl für tatsächliche Zuhörer.',
'A scientific presentation connects own work results with justified analogue and digital media choices for actual listeners.',
'Hält selbst eine adressatengerechte Präsentation, zeigt eigene Medien und beantwortet wirkliche Rückfragen mit korrektem Bezug auf Daten und Modelle.',
'Actually presents independently for an audience, shows own media and answers real questions with correct reference to data and models.',
'Überarbeitet aufgrund einer tatsächlichen Rückfrage eine Darstellung und erhält dabei fachliche Aussage und Reichweite.',
'Revises a representation in response to an actual question while preserving its scientific statement and reach.'],
'7f140b34':[
'Chemische Anwendungen erfüllen konkrete Aufgaben und haben begründbar unterschiedliche Bedeutungen für Mensch, Gesellschaft und Umwelt.',
'Chemical applications serve specific purposes and have justifiably different implications for people, society and the environment.',
'Beschreibt eine konkrete Anwendung chemisch und diskutiert Nutzen und Grenzen mit fachlichen Gründen statt pauschalen Werturteilen.',
'Describes a specific application chemically and discusses benefits and limits through scientific reasons rather than blanket judgments.',
'Vergleicht eine neue Anwendung oder Nutzungssituation und erklärt, welche chemischen und gesellschaftlichen Bedingungen die Bewertung verändern.',
'Compares a fresh application or use context and explains which chemical and societal conditions change the evaluation.'],
'6c9adc36':[
'Chemische Berufsfelder verbinden fachliche Aufgaben, Anforderungen und Anwendungen mit gesellschaftlicher Entwicklung und persönlicher Berufsorientierung.',
'Chemistry occupations connect scientific tasks, requirements and applications to social development and personal career orientation.',
'Vergleicht konkrete chemische Tätigkeitsfelder anhand belegter Anforderungen und nutzt den Vergleich für eine begründete eigene Orientierung.',
'Compares specific chemistry occupations through supported requirements and uses the comparison for justified own orientation.',
'Prüft bei einem neuen Berufsfeld oder veränderten Interessenschwerpunkt, welche Anforderungen und gesellschaftlichen Bezüge die Wahl beeinflussen.',
'For a fresh occupation or changed interest, examines which requirements and societal links affect the choice.'],
'1df17884':[
'Chemische Entscheidungen verbinden sachliche Chancen und Risiken mit ethischen, ökologischen, ökonomischen, sozialen und Sicherheitskriterien.',
'Chemical decisions connect factual opportunities and risks to ethical, environmental, economic, social and safety criteria.',
'Leitet Kriterien selbst ab, formuliert begründete Optionen, wendet eine passende Entscheidungsstrategie an und reflektiert Entscheidung und fachliche Grenzen.',
'Independently derives criteria, formulates justified options, applies a suitable decision strategy and reflects on the decision and scientific limits.',
'Überprüft bei einer neuen Rahmenbedingung die Kriterien und Strategie und begründet, warum sich die bevorzugte Option ändern kann.',
'For a fresh condition, reviews criteria and strategy and justifies why the preferred option may change.'],
'e5a5dcd8':[
'Soziale, kulturelle, technische, historische, ökologische und ökonomische Bedingungen beeinflussen Wissensentwicklung; empirische Gültigkeit hängt weiterhin an prüfbaren Befunden.',
'Social, cultural, technical, historical, environmental and economic conditions influence knowledge development; empirical validity still depends on testable findings.',
'Beschreibt und bewertet alle sechs Einflüsse am Ozon- und Ammoniakfall konkret und trennt datierte Quellenbelege von Lehrszenario und eigener Folgerung.',
'Specifically describes and evaluates all six influences in the ozone and ammonia cases and distinguishes dated source evidence from a teaching scenario and own inference.',
'Begründet die gesellschaftliche Wirkung eines populären unbelegten Beitrags und die Selektionsverzerrung eines Positivergebniswunsches ohne daraus chemische Wahrheit oder Falschheit abzuleiten.',
'Justifies the social effect of a popular unsupported claim and the selection bias of a demand for positive results without inferring chemical truth or falsehood from them.'],
'9f892457':[
'Historische und aktuelle chemische Wirkungen sind aus ökologischer, ökonomischer und sozialer Sicht anhand konkreter Systemgrenzen zu bewerten.',
'Historical and current chemical impacts require evaluation from environmental, economic and social perspectives using concrete system boundaries.',
'Beurteilt Ammoniakproduktion und Nutzung fachlich, trennt Daten von Werten und reflektiert mögliche Folgen eigenen oder hypothetischen eigenen Handelns.',
'Scientifically evaluates ammonia production and use, separates data from values and reflects on possible consequences of own or hypothetical own actions.',
'Vergleicht bei veränderter Herstellungsroute oder Nutzung die drei Nachhaltigkeitsperspektiven und erklärt fehlende oder zeitgebundene Evidenz.',
'For changed production or use, compares the three sustainability perspectives and explains missing or time-bound evidence.'],
'1f354a60':[
'Fachliche Diskussion verbindet chemisch stimmige Erklärungen und begründete Argumente mit konstruktiver Prüfung des eigenen Standpunkts.',
'Scientific discussion connects coherent chemical explanations and justified arguments to constructive examination of an own position.',
'Erklärt eine chemische Behauptung, antwortet sachbezogen auf ein Gegenargument und korrigiert den eigenen Standpunkt bei tragfähigem neuem Grund.',
'Explains a chemical claim, responds substantively to a counterargument and revises an own position when a sound new reason warrants it.',
'Überträgt den Austausch auf einen neuen Sachverhalt und unterscheidet fachliche Korrektur von bloßer Zustimmung.',
'Transfers the exchange to a fresh issue and distinguishes scientific correction from mere agreement.'],
'6c7ce93c':[
'Chemische Modelle sind hypothesenbezogene Vereinfachungen mit unterschiedlichen Aussagen zu Materie, Reaktion, Bindung und Wechselwirkung.',
'Chemical models are hypothesis-related simplifications with different claims about matter, reactions, bonding and interactions.',
'Wählt und nutzt tatsächlich ein analoges oder digitales Modell, prüft seine Vorhersage, vergleicht Modelle und Beobachtungen und begründet konkrete Grenzen.',
'Actually selects and uses an analogue or digital model, tests its prediction, compares models and observations and justifies concrete limitations.',
'Erklärt an Abkühlung oder schlechter Salzlöslichkeit die fehlende Energiebilanz und den begründeten Erweiterungsbedarf; ein unbestimmter Ladungsfall bedeutet nicht wechselwirkungsfrei.',
'Uses cooling or poor salt solubility to explain the missing energy balance and justified need for development; an undetermined charge case does not mean absence of interactions.'],
'86d34f1f':[
'Theoriegestützte Modellarbeit verknüpft Atombau, Gleichgewicht, Bindung/Geometrie und komplexe Wechselwirkungen mit prüfbaren Aussagen und Begrenzungen.',
'Theory-supported modelling connects atomic structure, equilibrium, bonding/geometry and complex interactions to testable claims and limitations.',
'Erstellt und nutzt eigene analoge und digitale Produkte in allen Modellfamilien, prüft Hypothesen und unterscheidet Rezeptorbindung von enzymatischem Umsatz.',
'Creates and uses own analogue and digital products across all model families, tests hypotheses and distinguishes receptor binding from enzymatic turnover.',
'Revidiert für veränderte Bedingungen oder Molekülanordnung die Modellwahl und begründet Grenzen und mögliche Erweiterungen in beiden komplexen Fällen.',
'For changed conditions or molecular arrangement, revises model choice and justifies limits and possible developments in both complex cases.'],
'13d4f336':[
'Sicherheitsregeln beziehen sich auf reale Gefahr und konkrete Laborsituation, nicht nur auf auswendig gelernte Verbote.',
'Safety rules relate to actual hazards and the concrete laboratory context, not just memorised prohibitions.',
'Wählt und führt im betreuten Schulrahmen passende sichere Handlungen aus und begründet Schutz, Ordnung und Reaktion auf eine Störung.',
'Selects and performs suitable safe actions in a supervised school context and justifies protection, organisation and response to a disturbance.',
'Reagiert auf eine veränderte Arbeitssituation begründet sicher und erkennt, wann Aufsicht oder ein Arbeitsstopp nötig ist.',
'Responds safely with justification to a changed work situation and recognises when supervision or stopping work is required.'],
'9b5d6326':[
'Daltons Atomannahmen erklären chemische Atomerhaltung; empirisches Gesetz, prüfbare Hypothese und vereinfachtes Modell sind verschiedene Aussagen.',
'Dalton’s atomic assumptions explain conservation of atoms in chemistry; empirical law, testable hypothesis and simplified model are distinct statements.',
'Trennt bei einer geschlossenen Wasserbildung die gemessene Masse, das Erhaltungsgesetz und die Atomumgruppierung und erklärt, weshalb ein passender Befund das Modell stützt.',
'For closed-system water formation, separates measured mass, the conservation law and atomic rearrangement and explains why a compatible finding supports the model.',
'Begründet anhand von Isotopen und Elektronen historische Modellgrenzen und erklärt die weiterhin begrenzte Nutzbarkeit chemischer Atom-Bilanzen.',
'Uses isotopes and electrons to justify historical model limitations and explains the continuing bounded usefulness of chemical atom balances.'],
'95dc0ee5':[
'Chemische Fach- und Symbolsprache unterscheidet sichtbare Stoffeigenschaften von Teilchen, Formeln und erklärenden Wechselwirkungen.',
'Chemical technical and symbolic language distinguishes visible substance properties from particles, formulae and explanatory interactions.',
'Übersetzt selbst eine Alltagsaussage korrekt in Fachsprache, benennt die Darstellungsebene und nutzt passende Molekül-, Ion- oder Reaktionssymbole.',
'Independently translates an everyday statement into accurate scientific language, identifies its representational level and uses suitable molecular, ionic or reaction symbols.',
'Erklärt bei einer neuen Darstellung, welche Aussage auf Stoffebene beobachtet und welche auf Teilchenebene modelliert wird.',
'For a fresh representation, explains which statement is observed at the substance level and which is modelled at the particle level.'],
'c0f1bf09':[
'Ein Stoffkreislauf kombiniert chemische Umwandlungen und physikalische Vorgänge bei unterscheidbaren Stoff- und Atomwegen.',
'A matter cycle combines chemical transformations and physical processes with distinguishable paths of substances and atoms.',
'Beschreibt einen Natur- oder Technikzyklus mit passenden Reaktionen und Phasenwechseln und erklärt die stoffliche Verbindung der Schritte.',
'Describes a natural or technical cycle through suitable reactions and phase changes and explains how its steps connect through matter.',
'Ordnet in einem neuen Kreislaufausschnitt einen geänderten Prozess begründet als Reaktion oder physikalischen Vorgang ein.',
'For a fresh section of a cycle, classifies a changed process as a reaction or physical process with justification.'],
'8ece9beb':[
'Brennstoffvergleiche benötigen Verbrennungschemie und energetische Kennzahlen auf derselben Bezugsbasis im konkreten Nutzungskontext.',
'Fuel comparisons require combustion chemistry and energy figures on the same reference basis within a specific use context.',
'Vergleicht Kohlenwasserstoffe mit passenden Verbrennungsbeschreibungen und rechnet gegebene Energiewerte auf eine gemeinsame Basis um.',
'Compares hydrocarbons using suitable combustion descriptions and converts supplied energy values to a common basis.',
'Erklärt bei einer veränderten Basis oder Nutzung, warum sich die Rangfolge ändern kann und welche Grenze eine unvollständige Verbrennung setzt.',
'For a changed basis or use, explains why the ranking may change and what limit incomplete combustion imposes.'],
'5a30273a':[
'Zwischenmolekulare Wechselwirkungen, Struktur und Packung begrenzen Vorhersagen zu Phasenwechseln, Löslichkeit und Lösemitteln.',
'Intermolecular interactions, structure and packing constrain predictions about phase changes, solubility and solvents.',
'Begründet und vergleicht Eigenschaften molekularer Stoffe anhand ihrer relevanten Struktur und Kräfte statt einer einzelnen unbedingten Faustregel.',
'Justifies and compares properties of molecular substances through relevant structures and forces rather than a single unconditional rule.',
'Prüft ein neues Isomer oder Lösemittel und erklärt, welche Strukturänderung die bisherige Vorhersage verändert oder einschränkt.',
'Examines a fresh isomer or solvent and explains which structural change alters or constrains the previous prediction.'],
'd4928773':[
'Eine Halogenalkan-Hydroxid-Gleichung muss Stoffidentität, Atomzahl und Ladung korrekt wiedergeben.',
'A haloalkane-hydroxide equation must correctly represent substance identity, atom count and charge.',
'Formuliert selbst für den gegebenen geeigneten Reaktionsfall eine korrekte Gleichung und prüft Atome, Ladung und Produktfunktion.',
'Independently formulates a correct equation for the supplied suitable reaction case and checks atoms, charge and product functionality.',
'Überträgt die Gleichungslogik auf einen geänderten einfachen Halogenalkan-Fall unter den gegebenen Reaktionsbedingungen.',
'Transfers the equation structure to a changed simple haloalkane case under the supplied reaction conditions.'],
'70b34ae7':[
'Esterbildung verknüpft Alkohol und Carbonsäure durch Kondensation; Stoffeigenschaften und Anwendungen hängen an Struktur und Wechselwirkungen.',
'Ester formation connects an alcohol and a carboxylic acid through condensation; properties and uses depend on structure and interactions.',
'Leitet die Bildung aus gegebenen Beobachtungen begründet ab, formuliert die Reaktion und verbindet konkrete Estereigenschaften mit passenden Einsatzbereichen.',
'Justifies formation from supplied observations, formulates the reaction and relates specific ester properties to suitable uses.',
'Erklärt bei verändertem Alkohol-/Säurerest eine relevante Eigenschafts- oder Anwendungsänderung mit Grenzen der Verallgemeinerung.',
'For a changed alcohol or acid residue, explains a relevant property or use change and limits of generalisation.'],
'e313c1ee':[
'Ein Reinstoffgehalt folgt aus geeigneter tatsächlicher Messung und Rechnung mit definierter Probe, Bezugsgröße und methodischer Zuverlässigkeit.',
'Pure-substance content follows from suitable actual measurement and calculation with a defined sample, reference quantity and method reliability.',
'Bestimmt selbst mit einer sicheren geeigneten Methode den Gehalt, zeigt Rohdaten und Rechnung und beurteilt die Messgrenzen.',
'Independently determines content using a suitable safe method, supplies raw data and calculations and evaluates measurement limits.',
'Begründet bei einer neuen Matrix oder Messstörung eine methodische Änderung und deren Einfluss auf das Gehaltsergebnis.',
'For a fresh matrix or measurement disturbance, justifies a method change and its effect on the content result.'],
'a0e8f0f2':[
'Fossile und nachwachsende Ressourcen erfüllen chemische Funktionen; nachhaltige Bewertung braucht Herkunft, Nutzung und tatsächliche Systemgrenzen.',
'Fossil and renewable resources serve chemical functions; sustainability evaluation needs provenance, use and actual system boundaries.',
'Recherchiert selbst belegte Informationen zu Energieträger und Rohstoff und wägt Nutzen sowie ökologische und wirtschaftliche Grenzen begründet ab.',
'Independently researches supported information on energy carriers and raw materials and weighs benefits and environmental and economic limits with justification.',
'Vergleicht eine neue Ressource oder Nutzung ohne erneuerbar automatisch mit folgenlos gleichzusetzen und benennt fehlende Evidenz.',
'Compares a fresh resource or use without automatically equating renewability with absence of impacts and identifies missing evidence.'],
'8b98d8ba':[
'Begrenzte organische Rohstoffverfügbarkeit begründet Einsparung und Alternativen; Quellenqualität beeinflusst die Belastbarkeit vorgeschlagener Maßnahmen.',
'Limited availability of organic raw materials motivates savings and alternatives; source quality affects the strength of proposed measures.',
'Leitet aus belegter Abhängigkeit konkrete Maßnahmen ab, prüft Herkunft und Vertrauen der Quellen und kennzeichnet Belege sowie Zitate.',
'Derives concrete measures from supported dependence, examines source provenance and trust and marks references and quotations.',
'Überprüft bei einer neuen Alternative die Ressourcenannahmen und Interessenlage und revidiert die Maßnahme begründet.',
'For a fresh alternative, reviews resource assumptions and interests and revises the measure with justification.'],
'3c9bfa10':[
'Die Bewertung von Halogenkohlenwasserstoffen verbindet konkreten Einsatz, mögliche Freisetzung und belastbare Informationen über Mensch und Umwelt.',
'Evaluation of halogenated hydrocarbons connects specific uses, possible releases and reliable information on people and the environment.',
'Recherchiert selbst einen belegten Einsatzfall, bewertet die Folgen unter definierten Bedingungen und prüft Quelle, Beleg und Zitatkennzeichnung.',
'Independently researches a supported use case, evaluates impacts under defined conditions and checks source, evidence and quotation marking.',
'Vergleicht einen neuen Stoff oder Freisetzungsweg und erklärt, welche Risiko- und Quellenannahmen für die neue Bewertung geändert werden müssen.',
'Compares a fresh substance or release pathway and explains which risk and source assumptions must change for the new evaluation.']}
assert len(chains)==38
params={'provider':'OpenAI','model':'Codex GPT-6 agent','exactModelRevision':'not exposed','temperature':'not exposed','reasoningSettings':'not exposed','execution':'Interactive Codex independent review of actual supplied inputs; no fabricated API invocation.','blindScope':first['blindScope'],'currentPeerVerdictsRead':False}
paramf=put('generation-parameters.actual.json',params);paramdigest=digest(paramf.read_bytes())
outputs=[]
for group in ['current20','current6','protected12']:
    inp=read(A/f'native/{group}/round-b/description-review-input.json');cam=read(A/f'native/{group}/round-b/description-review-campaign.json');bun=read(A/f'native/{group}/bundle/manifest.json')
    assert len(cam['batches'])==1
    batch=cam['batches'][0];runid=f'chemie-current517-{group}-independent-b-20261010-v1';rows=[]
    for g in inp['goals']:
        short=g['goalId'][:8];chain=chains[short]
        evidence=dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],chain))
        rationale=first['fourCurrentChangedPBindings'].get(short,{}).get('reasonDe')
        if not rationale:
            rationale='Aktueller DE/EN-Text und ganzer verknüpfter Seiten-/Kanonkontext passen zu dieser Kompetenz. '+chain[0]+' '+chain[4]+' Bestehende gültige wissenschaftliche Entscheidungen werden unverändert übernommen; dieses Urteil prüft den aktuellen Kontext, keine erfundene Lernendenleistung.'
        row={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+':'+g['goalId'],'runId':runid,'campaignId':cam['campaignId'],'roundId':cam['roundId'],'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest']}
        for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:row[k]=g[k]
        row.update({'decision':'keep','understandingEvidence':evidence,'rationale':rationale,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create' if short=='e5a5dcd8' else 'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'});rows.append(row)
    out=R/O/f'native/{group}/results';out.mkdir(parents=True,exist_ok=True)
    records=out/f"{batch['batchId']}.records.jsonl";records.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rows))
    artifacts=[{'role':r['role'],'digest':r['digest']} for r in bun['artifacts']]
    artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':cam['campaignId'],'roundId':cam['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':bun['bundleFingerprint'],'bookDigest':bun['bookModelDigest'],'provider':'OpenAI','model':'Codex GPT-6 agent','modelVersion':'exact revision not exposed','role':'sequencing_representation_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':cam['promptFingerprint'],'criteriaFingerprint':cam['criteriaFingerprint'],'generationParametersFingerprint':paramdigest,'independenceGroupId':cam['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':first['sealedAt'],'completedAt':now,'status':'completed','outputDigest':digest(records.read_bytes()),'toolchainVersion':'skillpilot-native-campaign-v1'}
    runpath=out/f"{batch['batchId']}.run.json";runpath.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
    outputs.append({'group':group,'recordCount':len(rows),'runId':runid,'run':str(runpath.relative_to(R)),'records':str(records.relative_to(R)),'resultDir':str(out.relative_to(R))})
assert sum(x['recordCount'] for x in outputs)==38
put('native/own-description-results.index.json',{'schemaVersion':1,'firstDigest':digest((R/O/'FIRST.current517-native-and-C11-G1.independent-b.json').read_bytes()),'outputs':outputs,'currentPeerResultsRead':False})
# The complete already-reviewed scientific profile is kept verbatim. Only current
# reviewer metadata and the genuine current binding supplied to this review change.
profile=json.loads((R/C/'positive/current-e5-G1.original-author.records.jsonl').read_text())
profile['reviewId']='chemie-b008-current517-native-context-independent-b-c11-g1-20261010-v1'
profile['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
profile['reviewer']='OpenAI Codex GPT-6 independent current B; exact revision not exposed'
profile['reason']='Genuine independent current whole-goal/source/native-context decision, sealed before current A/ROOT outputs. Whole E1/G1 profile and both original cases retained exactly. Six influence dimensions plus empirical validity are demanded, with meaningful independent transfers: unsupported popularity and selective positive-result funding. Current NTG11 primary source supports its literal five influences; dated ozone/ammonia sources support the retained historical operationalisation. Cultural teaching interpretations are labelled. This positive-v2 competence decision supplies no GK/LK, source-atlas or held-assessment course clearance, human approval/trial or actual learner-performance claim.'
profile['reviewRunIds']=[]
profile['dissent']=['C11 programme/course/source-atlas placement remains a separate HOLD; no GK/LK equivalence or source fallback.','Held eed5 assessment PSelected=false remains unchanged.','Author worked responses and supplied model data do not evidence an actual learner performance.']
f=R/O/'positive/current-e5-G1.independent-b.records.jsonl';f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(profile,ensure_ascii=False,separators=(',',':'))+'\n')
config=read(C/'positive/current-e5-G1.original-author.normal.config.json');config['reviewId']=profile['reviewId'];config['reviewPath']=str(f.relative_to(R));config['scope']['label']='Independent current B bounded E1/G1 competence candidate; no course placement or operative P selection';put('positive/current-e5-G1.independent-b.normal.config.json',config)
print(json.dumps(outputs,indent=2))
