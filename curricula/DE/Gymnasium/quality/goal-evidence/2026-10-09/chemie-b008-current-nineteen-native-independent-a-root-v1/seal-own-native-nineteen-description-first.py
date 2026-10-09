# SPDX-License-Identifier: Apache-2.0
"""Seal Root's actual independent reading; never generate a peer verdict."""
import hashlib
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = next(p for p in OWN.parents if (p / '.git').exists() and (p / 'AGENTS.md').is_file())
NATIVE = OWN.parent / 'chemie-b008-current-twenty-six-native-preparation-author-v1/nineteen-operative-native-preparation-v2/native-nineteen'


def read(p):
    return json.loads(p.read_text())


def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, value):
    p = OWN / name
    with p.open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)


# All six expectations and each rationale are own, content-specific judgments.
# They describe required future learner performance, not performed learner work.
NOTES = [
    [
        'Eine untersuchbare chemische Frage benennt einen beobachtbaren Zusammenhang. Eine Hypothese macht eine begründete Vorhersage, für die auch ein Gegenbefund angegeben werden kann; sie ist keine gesicherte Erklärung.',
        'An investigable chemistry question concerns an observable relationship. A hypothesis gives a justified prediction for which counterevidence can also be specified; it is not an established explanation.',
        'Die lernende Person formuliert aus einem Alltagsphänomen selbst Frage und Hypothese, erklärt die erwartete Beobachtung und benennt einen Befund, der ihr unter vergleichbaren Bedingungen widersprechen würde.',
        'The learner independently formulates a question and hypothesis from an everyday phenomenon, explains the expected observation and identifies a finding that would contradict it under comparable conditions.',
        'Bei einem neuen Phänomen mit zwei zugleich veränderten Bedingungen trennt sie die Variablen und formuliert eine tatsächlich prüfbare Frage, statt aus dem bloßen Unterschied eine Ursache zu behaupten.',
        'For a fresh phenomenon with two conditions changed together, the learner separates the variables and formulates a testable question instead of claiming a cause from the difference alone.',
        'KEEP: DE/EN verbinden eigene Formulierung, Begründung und unterscheidbare Stütz-/Gegenbefunde zu einer Kompetenz. Die obere theoriegestützte 503-Kompetenz ist Nachfolger, kein vorausgesetztes Konzeptwissen. Der chemische Fragenkontext und leere Voraussetzungen sind stimmig.'
    ],
    [
        'Ein chemisches Konzept oder eine Theorie begründet eine Vorhersage unter bestimmten Bedingungen. Die Fragenauswahl, theoretische Begründung und empirische Prüfbarkeit gehören zusammen; Zustimmung beweist die Hypothese nicht.',
        'A chemical concept or theory supports a prediction under stated conditions. Question selection, theoretical justification and empirical testability belong together; agreement does not prove the hypothesis.',
        'Die lernende Person identifiziert selbst ein chemisch untersuchbares Problem, verwendet ein passendes Konzept zur begründeten Hypothese und leitet einen erwarteten und einen widersprechenden Befund ab.',
        'The learner independently identifies a chemically investigable problem, uses a suitable concept to justify a hypothesis and derives an expected and a contradicting finding.',
        'Nach Änderung einer Modellbedingung prüft sie, ob dieselbe Vorhersage noch folgt, und grenzt einen echten Gegenbefund von einem Versuch außerhalb der angenommenen Bedingungen ab.',
        'After a model condition changes, the learner checks whether the same prediction still follows and distinguishes genuine counterevidence from a test outside the assumed conditions.',
        'KEEP: Die ganze DE/EN-Kette enthält identifizieren UND selbst formulieren, Theoriebezug und Gegenbefund. Voraussetzung75e liefert elementare Hypothesenbildung; Nachfolger9e3 übernimmt quantitative Auswertung. Keine Versuchsdurchführung wird als diese Beschreibungskompetenz importiert.'
    ],
    [
        'Eine angeleitete Untersuchung prüft die Frage nur bei kontrollierten vorgegebenen Bedingungen, sicherer Arbeitsweise und nachvollziehbaren Beobachtungen. Messung und Erklärung sind zu unterscheiden.',
        'A guided investigation tests its question only with controlled specified conditions, safe practice and traceable observations. Measurement and explanation must be distinguished.',
        'Die lernende Person befolgt die angeleiteten Arbeitsschritte sicher, protokolliert tatsächliche Beobachtungen mit Bedingungen und erklärt deren Bezug zur Ausgangshypothese. Ein vorgegebenes Protokoll ersetzt ihre Durchführung nicht.',
        'The learner follows the guided steps safely, records actual observations with their conditions and explains their relationship to the initial hypothesis. A supplied record does not replace their execution.',
        'Bei einer neuen Anleitung mit unerwarteter Beobachtung prüft sie die tatsächlich eingehaltenen Bedingungen, dokumentiert die Abweichung und entscheidet begründet, ob ein Gegenbefund oder ein Verfahrensfehler vorliegt.',
        'For a fresh procedure with an unexpected observation, the learner checks the conditions actually followed, documents the deviation and judges whether it is counterevidence or procedural error.',
        'KEEP: Angeleitet und vorgegeben grenzen diese DE/EN-Kompetenz von eigener Planung423 ab. Die externe Sicherheitsvoraussetzung13d bleibt ausdrücklich sichtbar; eigene Reflexion99d und Nachweistechniken sind Nachfolger. Dieser D-Review bescheinigt keinen realen Laborversuch.'
    ],
    [
        'Eigene Untersuchungsplanung verbindet prüfbare Hypothese, geeignete qualitative oder quantitative Methode und kontrollierte Vergleichsbedingungen. Planung und tatsächliche sichere Durchführung mit Rohprotokoll sind gemeinsam erforderlich.',
        'Independent investigation planning connects a testable hypothesis, a suitable qualitative or quantitative method and controlled comparisons. Planning and actual safe execution with a raw record are both required.',
        'Die lernende Person legt die eigene einfache Untersuchung samt Variablen und Kontrollbedingungen fest, wählt sichere Techniken und protokolliert das tatsächlich Ausgeführte einschließlich Abweichungen.',
        'The learner specifies their own simple investigation, variables and controls, selects safe techniques and records what was actually performed, including deviations.',
        'Bei einem neuen Stoffsystem mit einer zusätzlichen Störgröße ändert sie Kontrolle oder Messmethode begründet und erklärt, wie die neue Untersuchung den relevanten Hypothesentest erhält.',
        'For a fresh substance system with an additional confounder, the learner justifies changing the control or measurement method and explains how the new investigation preserves the hypothesis test.',
        'KEEP: Die DE/EN-Texte fordern tatsächliche Durchführung und schließen hypothetische Planung als alleinigen Nachweis aus. Der angeleitete Vorgänger e81 ist plausibel, anspruchsvollere Methoden f79 folgen. Qualitativ und quantitativ sind Varianten derselben hypothesengeleiteten Untersuchung, keine versteckte Mehrfachkompetenz.'
    ],
    [
        'Eine anspruchsvollere chemische Untersuchung benötigt hypothesenbezogene Methodenwahl, kontrollierte Analyse und proportionate Sicherheit. Ein geeignetes Messfenster und nachvollziehbare Rohdaten verhindern eine scheinbare Schlussfolgerung aus ungeeigneten Messungen.',
        'An advanced chemistry investigation needs hypothesis-related method selection, controlled analysis and proportionate safety. An appropriate measurement range and traceable raw data prevent apparent conclusions from unsuitable measurements.',
        'Die lernende Person plant überwiegend selbstständig, begründet geeignete qualitative und quantitative Analysen, führt die Untersuchung tatsächlich sicher aus und erstellt ein überprüfbares Protokoll.',
        'The learner plans largely independently, justifies suitable qualitative and quantitative analyses, actually conducts the investigation safely and produces a verifiable record.',
        'Bei einer neuen Probe außerhalb des verfügbaren Messbereichs verwirft sie einen unzulässigen Zahlenwert, wählt eine passende sichere Analyse und begründet, welche neue Rohdatenaufnahme benötigt wird.',
        'For a fresh sample outside the available instrument range, the learner rejects an invalid numerical reading, selects a suitable safe analysis and explains what new raw measurements are needed.',
        'KEEP: DE/EN erhalten hypothesengeleitet, überwiegend selbstständig, Methodenwahl, tatsächlich durchführen und dokumentieren. Der einfachere selbstgeplante Vorgänger423 begrenzt das Vorwissen. Der endliche korrigierte Leitfähigkeitsfall gehört in P, nicht als Instrument- oder Stoffvorschrift in diese allgemeine Beschreibung.'
    ],
    [
        'Quantitative chemische Schlüsse verbinden Daten und Bedingungen mit einem geeigneten mathematischen Verfahren. Digitale Werkzeuge müssen die Beziehung nachvollziehbar auswerten; Korrelation allein begründet keine chemische Ursache.',
        'Quantitative chemistry conclusions connect data and conditions with a suitable mathematical method. Digital tools must analyze the relationship transparently; correlation alone does not establish a chemical cause.',
        'Die lernende Person wählt und nutzt ein begründetes Auswertungsverfahren und digitales Werkzeug, interpretiert den Zusammenhang unter den Untersuchungsbedingungen und prüft dessen Bedeutung für die Ausgangshypothese.',
        'The learner selects and uses a justified analysis method and digital tool, interprets the relationship under the investigation conditions and evaluates its implications for the initial hypothesis.',
        'Bei einer neuen Datenreihe mit veränderter Temperatur oder unsicherem Einzelwert prüft sie die Modellannahmen und Reichweite des Schlusses, statt nur dieselbe Kurve mit neuen Zahlen zu berechnen.',
        'For a fresh dataset with changed temperature or an uncertain observation, the learner examines the model assumptions and reach of the inference instead of merely computing the same curve with different numbers.',
        'KEEP: Ganzes DE/EN verlangt begründete echte Auswahl UND Anwendung, quantitative Interpretation und fachübergreifenden Hypothesenbezug. Die untere Auswertung7d9 und Theoriehypothese503 bleiben als verschiedene Voraussetzungen sichtbar. Keine fixe Software, zusätzliche Experimentdurchführung oder starre Aufgabenquote wird erfunden.'
    ],
    [
        'Chemische Daten tragen nur zu ihrer Herkunft, Messmethode und ihren Bedingungen passende Schlüsse. Angemessenheit, Gültigkeit und Tragweite unterscheiden sich; Geräteauflösung ist nicht automatisch die gesamte Unsicherheit.',
        'Chemistry data support conclusions appropriate to their provenance, method and conditions. Suitability, validity and reach differ; instrument resolution is not automatically the total uncertainty.',
        'Die lernende Person beurteilt erhobene oder recherchierte Daten an ihren Bedingungen, begründet konkrete Mess- oder Verfahrensfehler und formuliert sowohl tragfähige als auch nicht gedeckte Schlussfolgerungen.',
        'The learner assesses acquired or researched data using their conditions, justifies specific measurement or procedural errors and states both supported and unsupported conclusions.',
        'Bei einem neuen Datensatz aus einer anderen Probenmatrix oder einer nicht kalibrierten Messung prüft sie die Übertragbarkeit und kennzeichnet die Grenze statt eine bekannte Auswertung ungeprüft fortzuführen.',
        'For fresh data from another sample matrix or an uncalibrated measurement, the learner checks transferability and identifies the limit rather than applying a familiar analysis unchecked.',
        'KEEP: Die ganze DE/EN-Beschreibung verbindet drei Datenkriterien mit konkreten Fehlergründen und Schlussgrenzen. Dokumentation9fc und Auswertung7d9 stehen extern; allgemeine wissenschaftliche Gültigkeit a008 folgt und wird nicht doppelt in diesen Datenfokus übernommen.'
    ],
    [
        'Reflexion einer eigenen Untersuchung verbindet tatsächlich erhobene Ergebnisse mit Frage und Methode. Ein belastbarer Schluss, eine Verfahrensgrenze und eine begründete Verbesserung sind unterschiedliche Teile derselben Prozessreflexion.',
        'Reflection on an investigation of one’s own relates actual results to the question and method. A supported conclusion, procedural limit and justified improvement are distinct parts of the same process reflection.',
        'Die lernende Person erklärt den Bezug ihrer eigenen Ergebnisse zur Hypothese, begründet die angewandte Methode und leitet aus erkennbaren Grenzen konkrete Verbesserungen ab.',
        'The learner explains how their own results relate to the hypothesis, justifies the method used and derives concrete improvements from identifiable limits.',
        'Bei einer eigenen Folgeuntersuchung mit einer neuen Störgröße wählt sie eine zielgerichtete Verbesserung und erklärt, welche Unsicherheit sie damit reduziert und welche Frage trotzdem offenbleibt.',
        'For a follow-up investigation with a new confounder, the learner selects a targeted improvement and explains which uncertainty it reduces and which question remains open.',
        'KEEP: DE/EN erhalten eigene Untersuchung und tatsächlich angewandte Methoden; eine fremde Beispielantwort bescheinigt dies nicht. Die angeleitete Durchführung e81 und untere Dateninterpretation7d9 sind plausible Voraussetzungen. Der ganze Text bleibt Prozessreflexion statt abstrakter Methodenaufzählung.'
    ],
    [
        'Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logische Konsistenz und Vorläufigkeit haben verschiedene Funktionen in der Gültigkeitsprüfung. Ein technischer Fehlschlag ist kein belastbarer Gegenbefund gegen eine Hypothese.',
        'Reproducibility, falsifiability, intersubjectivity, logical consistency and provisionality have different roles in assessing validity. A technical failure is not robust counterevidence to a hypothesis.',
        'Die lernende Person wendet alle fünf Kriterien begründet auf chemische Erkenntnisse an, reflektiert Möglichkeiten und Grenzen des Prozesses und trennt echte Gegenbefunde von unzuverlässigen Messungen.',
        'The learner applies all five criteria with reasons to chemical findings, reflects on the possibilities and limits of inquiry and distinguishes genuine counterevidence from unreliable measurements.',
        'Bei einem neuen Fall mit nicht dokumentierten Bedingungen und scheinbar widersprechender Wiederholung unterscheidet sie mangelnde Intersubjektivität und technische Wiederholungsprobleme von wirklicher Falsifikation.',
        'For a fresh case with undocumented conditions and an apparently contradictory repetition, the learner distinguishes limited intersubjectivity and technical repeatability problems from genuine falsification.',
        'KEEP: Alle fünf Kriterien und die wichtige Gegenbefundgrenze stehen gleichwertig in DE/EN. Sie sind Kriterien einer einzigen begründeten Gültigkeitsprüfung, keine fünf isolierten Vokabelziele. Externe Erkenntniswege a880 und Datenvalidität4aa begrenzen den tatsächlichen Kontext.'
    ],
    [
        'Quelleninformationen müssen zur chemischen Frage passen, strukturiert interpretiert und mit ihrer Herkunft nachvollziehbar sein. Eine Darstellung oder Textpassage allein erklärt noch nicht die Aussage für einen bestimmten Adressaten.',
        'Source information must fit the chemistry question, be interpreted in a structured way and retain traceable provenance. A representation or passage alone does not explain its meaning for a particular audience.',
        'Die lernende Person wählt relevante Informationen aus gegebenen oder selbst recherchierten Quellen, strukturiert sie chemisch, wertet sie für Situation und Adressaten aus und nennt die verwendeten Quellen.',
        'The learner selects relevant information from supplied or independently researched sources, structures it chemically, interprets it for the situation and audience and identifies the sources used.',
        'Bei einer neuen widersprüchlichen oder anders dargestellten Information trennt sie die relevante Aussage von Nebendetails, erklärt die Frageabhängigkeit der Auswahl und dokumentiert die Herkunft ohne Quellen zu erfinden.',
        'For fresh conflicting information or another representation, the learner separates the relevant claim from incidental details, explains how selection depends on the question and records provenance without inventing sources.',
        'KEEP: DE/EN erhalten ausdrücklich vorgegeben ODER selbst recherchiert. Diese generische Methodenalternative hebt eine in einer einzelnen BY-Route verlangte UND-Pflicht nicht auf. Komplexe Rechercheac8, Quellenkritik366, Darstellungswechsel317 und Anwendungsdiskussion7f sind getrennte Nachfolger; der aktuelle D-Text gibt keine ganze Source-Route frei.'
    ],
    [
        'Komplexe chemische Informationen werden durch eigene analoge und digitale Recherche, Interpretation und belegte Schlussfolgerung erschlossen. Ein Zitat braucht Kennzeichnung; Quellenbeleg ersetzt nicht die fachliche Interpretation.',
        'Complex chemistry information is interpreted through independent analogue and digital research, analysis and supported inference. Quotations need marking; a source citation does not replace scientific interpretation.',
        'Die lernende Person recherchiert selbst, wählt relevante Daten aus komplexen Darstellungen, strukturiert und interpretiert sie und erstellt belegte fachliche Schlussfolgerungen mit markierten Zitaten.',
        'The learner researches independently, selects relevant data from complex representations, structures and interprets it and produces supported scientific conclusions with marked quotations.',
        'Bei einer neuen pharmazeutischen Darstellung mit unklarer Bezugsgruppe sucht sie eine passende unabhängige Quelle und erklärt, weshalb die Daten keine uneingeschränkte klinische Wirksamkeitsaussage tragen.',
        'For a fresh pharmaceutical representation with an unclear reference group, the learner seeks an appropriate independent source and explains why the data do not support an unrestricted clinical efficacy claim.',
        'KEEP: Eigene Recherche sowie analoge UND digitale Medien bleiben in beiden ganzen Beschreibungen erhalten. Die untere Auswahl5b1 ist Voraussetzung; Forschungstexte über Medikamente begründen keine klinische Beratung oder reale Versuchsbehauptung. Die konkrete eigene Recherchehandlung des BY-Falls bleibt getrennte P-Pflicht.'
    ],
    [
        'Aussage, fachliche Relevanz, Vertrauenswürdigkeit, Urheberschaft und Intention sind getrennte Prüfdimensionen einer Quelle. Werbung kann überprüfbare Daten enthalten; Herkunft allein entscheidet nicht deren fachliche Validität.',
        'Claims, scientific relevance, trustworthiness, authorship and intention are distinct dimensions of source assessment. Advertising may contain verifiable data; provenance alone does not determine scientific validity.',
        'Die lernende Person vergleicht analoge und digitale Quellen entlang der genannten Dimensionen und begründet, welche für eine konkrete chemische Frage geeignet und gültig sind.',
        'The learner compares analogue and digital sources using those dimensions and justifies which are suitable and valid for a particular chemistry question.',
        'Bei einer neuen Quelle mit vertrautem Logo aber ungeeignetem Datensatz oder veränderter Fragestellung revidiert sie die Eignungsentscheidung mit überprüfbaren Gründen statt ein pauschales Quellenranking anzuwenden.',
        'For a fresh source with a familiar logo but unsuitable data or a changed question, the learner revises the suitability judgment using verifiable reasons instead of a blanket source ranking.',
        'KEEP: DE/EN nennen alle fünf Prüfdimensionen und fragenbezogene Eignung/Validität. Der untere Quellenzugang5b1 liefert Inhalte; historische Wissenseinflüsse e5a und Folgenbewertung9f8 sind Nachfolger, keine vermischten Anforderungen. Analoge/digitale Quellen und Darstellungsformen bleiben methodisch neutral.'
    ],
    [
        'Darstellungswechsel erhält fachlich relevante Größen und Beziehungen, kann aber Aussagen vereinfachen oder verdecken. Teilchenbild, Fachtext und Diagramm sind Darstellungen, keine direkt austauschbaren Beobachtungen.',
        'Changing representation preserves scientifically relevant quantities and relationships but may simplify or obscure claims. Particle pictures, text and graphs are representations, not interchangeable observations.',
        'Die lernende Person erzeugt für Inhalt, Situation und Adressat eine geeignete Darstellung, verwendet Fachsprache und Bezugsgrößen korrekt und erklärt Erhaltung und Begrenzung der Aussage.',
        'The learner constructs a suitable representation for the content, situation and audience, uses scientific language and reference quantities correctly and explains what claims are retained or limited.',
        'Bei einer neuen Fragestellung mit anderem Maßstab oder Konzentrationsbezug verändert sie die Darstellung begründet, erhält Stoff-/Ladungsbilanzen und kennzeichnet, was das vereinfachte Schema nicht zeigt.',
        'For a fresh question with another scale or concentration basis, the learner justifies changing the representation, preserves substance and charge balances and identifies what the simplified diagram omits.',
        'KEEP: Ganze DE/EN koppeln Darstellungsproduktion an korrekte Bezugsgrößen und Grenzen. Auswahl5b1 liegt vorher; Präsentation38e liegt danach. Das konkrete Salzbild ist ein begrenztes Beispiel, keine Pflicht zu genau diesem Stoff oder eine alleinige Beweisleistung.'
    ],
    [
        'Eine chemische Präsentation verbindet fachlich korrekten eigenen Inhalt mit Struktur, Publikum, Situation und geeigneten analogen und digitalen Medien. Medienwahl allein ist kein fachlicher Erkenntnisnachweis.',
        'A chemistry presentation connects scientifically correct work with structure, audience, situation and appropriate analogue and digital media. Choosing media alone does not demonstrate scientific understanding.',
        'Die lernende Person präsentiert eigene Lern- oder Arbeitsergebnisse sachgerecht und begründet Wahl von Darstellung, Aufbau und Medium mit Inhalt und Publikum.',
        'The learner presents their own learning or work results appropriately and justifies the representation, structure and medium using the content and audience.',
        'Bei einem neuen Publikum oder einem Datensatz mit zusätzlicher Unsicherheit verändert sie Aufbau und Medium und erhält die chemische Aussage samt Grenzen, statt nur die Foliengestaltung zu wechseln.',
        'For a fresh audience or data with additional uncertainty, the learner changes structure and medium while preserving the chemical claim and its limits instead of merely restyling slides.',
        'KEEP: Beide ganzen Texte verlangen Präsentation eigener Ergebnisse und begründete Medien-/Strukturwahl. Der Darstellungswechsel317 ist eine passende Voraussetzung. Analoge und digitale Medien bleiben erhalten; eine bloße Beschreibung eines imaginären Vortrags ist kein tatsächlich geleisteter Vortrag.'
    ],
    [
        'Chemische Anwendungen besitzen konkrete Aufgaben und Wirkungen für Mensch, Gesellschaft und Umwelt. Fachliche Folgen und deren Bewertung müssen begründet werden; bloße Begeisterung für Chemie ersetzt keine Diskussion.',
        'Chemical applications have concrete functions and impacts for people, society and the environment. Consequences and evaluations need reasons; enthusiasm for chemistry does not replace discussion.',
        'Die lernende Person beschreibt chemische Anwendungsbereiche anhand konkreter Beispiele und diskutiert deren Bedeutung mit nachvollziehbaren fachlichen Gründen.',
        'The learner describes chemical application areas using concrete examples and discusses their significance with traceable scientific reasons.',
        'Bei einer neuen Anwendung mit anderem Nutzungskontext wägt sie veränderten Nutzen und mögliche Auswirkungen ab, statt eine frühere positive oder negative Bewertung ungeprüft zu übernehmen.',
        'For a fresh application with another use context, the learner weighs changed benefits and possible impacts instead of carrying over a previous positive or negative judgment unchecked.',
        'KEEP: DE/EN sind eine assessierbare fachlich begründete Anwendungsdiskussion, keine nicht bewertete Orientierung. Der Quellenzugang5b1 ist Voraussetzung; Berufswahl6c9 bleibt gesonderter Nachfolger. Kein pauschaler Umwelt-/Gesundheitsnutzen wird behauptet.'
    ],
    [
        'Eine chemisch relevante Entscheidung benötigt Kriterien, Chancen und Risiken sowie eine begründete Strategie. Ethische, ökologische, ökonomische, soziale und sicherheitsbezogene Perspektiven dürfen nicht mit Messdaten oder einem automatisch richtigen Gesamtwert gleichgesetzt werden.',
        'A chemistry-related decision needs criteria, opportunities and risks and a justified strategy. Ethical, environmental, economic, social and safety perspectives must not be equated with measurements or an automatically correct total score.',
        'Die lernende Person entwickelt Kriterien und Handlungsoptionen, wägt sie mit einer passenden Strategie ab und prüft anschließend Entscheidung, Kriterien, Strategie und Grenzen chemischer Sichtweisen.',
        'The learner develops criteria and action options, weighs them with a suitable strategy and subsequently reviews the decision, criteria, strategy and limits of chemical perspectives.',
        'Bei einem neuen Zielkonflikt oder veränderter Gewichtung prüft sie, ob die Entscheidung kippt, begründet die Werteannahmen und benennt fachlich begründbare und gesellschaftlich auszuhandelnde Teile getrennt.',
        'For a fresh conflict or changed weighting, the learner checks whether the decision changes, explains value assumptions and distinguishes scientifically supportable parts from those requiring social deliberation.',
        'KEEP: Der ganze DE/EN-Text bewahrt alle fünf Perspektiven sowie Reflexion von Entscheidung, Kriterien UND Strategie. Das sind Phasen derselben Entscheidungskompetenz. Pro-/Kontra431 ist externes Vorwissen; historische Nachhaltigkeitsbewertung9f8 erweitert den Kontext, ersetzt die Kriterien nicht.'
    ],
    [
        'Chemische Produkte und Verfahren haben historische und heutige soziale, ökologische und ökonomische Wirkungen. Nachhaltigkeitsurteile brauchen Grenzen und vergleichbare Bezugsgrößen; das eigene Handeln gehört zur Folgenreflexion.',
        'Chemical products and processes have historical and current social, environmental and economic impacts. Sustainability judgments need boundaries and comparable reference quantities; one’s own actions belong in the reflection on consequences.',
        'Die lernende Person beschreibt Bedeutung und Auswirkungen in beiden Zeitkontexten, bewertet sie aus den drei Nachhaltigkeitsperspektiven mit Gründen und reflektiert mögliche Folgen eigener Entscheidungen.',
        'The learner describes significance and impacts in both temporal contexts, assesses them using the three sustainability perspectives with reasons and reflects on possible consequences of their own decisions.',
        'Bei einer neuen Wiederverwendungsroute mit veränderter Transportentfernung und Haltbarkeit überprüft sie Systemgrenze und Vergleichsbasis und erklärt, welche frühere Nachhaltigkeitsbewertung noch trägt.',
        'For a fresh reuse route with changed transport distance and lifetime, the learner examines system boundaries and comparison basis and explains which previous sustainability judgment remains supported.',
        'KEEP: DE/EN halten historische UND aktuelle Zusammenhänge, alle drei Nachhaltigkeitsperspektiven und eigenes Handeln. Quellenkritik366 und kriteriengeleitete Entscheidung1df sind passende Voraussetzungen. Nicht identisch mit Einfluss auf die Entwicklung wissenschaftlichen Wissens e5a; keine universelle Materialrangfolge.'
    ],
    [
        'Theoriegestützte Modelle erklären je nach Zweck Atombau, Periodizität, Gleichgewichte, Bindung, Geometrie oder komplexe Wechselwirkungen. Passung allein beweist weder Bindungsstärke noch Arzneiwirkung; analoge oder digitale Modelle haben unterschiedliche Grenzen.',
        'Theory-based models explain atomic structure, periodicity, equilibria, bonding, geometry or complex interactions according to their purpose. Fit alone proves neither binding strength nor drug efficacy; analogue and digital models have different limits.',
        'Die lernende Person wählt und nutzt ein passendes Modell zur chemischen Frage, prüft damit Aussagen oder Hypothesen und begründet Aussagekraft, Grenzen und mögliche Weiterentwicklung anhand tatsächlicher Beobachtungen oder Modellvergleiche.',
        'The learner selects and uses a suitable model for the chemistry question, tests statements or hypotheses and justifies explanatory power, limits and possible development using observations or model comparisons.',
        'Bei einer neuen Protonierungsform oder geänderten Gleichgewichtsbedingung prüft sie Ladung, Geometrie und gültige Annahmen, erkennt ein anderes Molekül statt einer bloßen Pose und verwirft aus Kontaktabständen abgeleitete klinische Wirksamkeitsbehauptungen.',
        'For a fresh protonation form or changed equilibrium condition, the learner checks charge, geometry and valid assumptions, recognizes a different molecule rather than a mere pose and rejects clinical efficacy claims inferred from contact distances.',
        'KEEP: Beide ganzen Texte erhalten alle Modellkontexte einschließlich Wirkstoff–Rezeptor/Substrat–Enzym, Modellnutzung und begründete Weiterentwicklung. Die externe untere Modellkompetenz6c7 ist ein angemessener Vorgänger. Das Wasserbild bleibt nur Einstieg; die ganze Kompetenz wird weder auf Wasser noch auf selbstprogrammierte Software reduziert.'
    ],
    [
        'Eine chemische Argumentation verbindet Beleg, fachlichen Grund und Schluss. Konstruktiver Austausch erlaubt begründete Korrektur des Standpunkts; Zustimmung oder ein gut klingender Satz ersetzt keine fachliche Erklärung.',
        'A chemistry argument connects evidence, scientific reasoning and conclusion. Constructive exchange allows a justified correction of one’s position; agreement or plausible wording does not replace an explanation.',
        'Die lernende Person erklärt den Sachverhalt schlüssig, begründet ihren Standpunkt chemisch, bearbeitet Gegenargumente konstruktiv und hält oder korrigiert den Standpunkt anhand der fachlichen Gründe.',
        'The learner explains the issue coherently, justifies their position scientifically, engages constructively with counterarguments and retains or corrects their position using scientific reasons.',
        'Bei einem neuen Gegenargument zu einem anderen Baustoff oder Reaktionsprodukt prüft sie den gültigen Stoff-/Teilchenzusammenhang und begründet die Änderung, statt nur dieselbe Empfehlung auf eine andere Oberfläche zu übertragen.',
        'For a fresh counterargument concerning another construction material or reaction product, the learner checks the valid substance and particle relationships and explains the revision instead of transferring the same recommendation to another surface.',
        'KEEP: Die ganze DE/EN-Beschreibung ist ein zusammenhängender fachlicher Diskurs mit Standpunktprüfung. Symbolsprache95dc ist externe Voraussetzung; die separate Abschlussaufgabe ist Nachfolger. Das korrigierte Essig/Carbonatbild liefert ein Beispiel ohne tatsächliche Learner-Diskussion oder Persistenz zu bescheinigen.'
    ],
]

now = datetime.now(timezone.utc).isoformat()
inp = read(NATIVE / 'round-a/description-review-input.json')
campaign = read(NATIVE / 'round-a/description-review-campaign.json')
assert len(NOTES) == len(inp['goals']) == 19
assert len(campaign['batches']) == 1
fields = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe',
          'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
run_id = 'chemie-b008-native19-current-v2-root-actual-independent-a-20261009-first'
records, criteria = [], []


class TextReader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []

    def handle_data(self, value):
        self.text.append(value)


parser = TextReader()
parser.feed((NATIVE / 'bundle/book.html').read_text())
html_text = ' '.join(' '.join(parser.text).split())
pdf_pages = (OWN / 'native19-pages3-21.actual-read.txt').read_text().split('\f')[:19]
actual_bindings = []
for ordinal, (goal, note, pdf) in enumerate(zip(inp['goals'], NOTES, pdf_pages), 1):
    assert goal['reviewContext']['evidenceProfile'] is None
    assert goal['goalId'] in pdf and goal['goalId'] in html_text
    # The source HTML preserves the whole text; PDF discretionary hyphens are only typography.
    assert ' '.join(goal['currentDescriptionDe'].split()) in html_text
    page = goal['reviewContext']['page']
    assert page['description'] == goal['currentDescriptionDe']
    assert page['title'] == goal['currentTitleDe']
    assert page['visualization']['approvedForPublication'] is False
    rec = {k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe',
                               'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']}
    rec.update({'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
                'schemaVersion': 1, 'recordId': run_id + '.goal-' + str(ordinal), 'runId': run_id,
                'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
                'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
                'decision': 'keep', 'understandingEvidence': dict(zip(fields, note[:6])),
                'rationale': note[6], 'evidenceProfileContract': 'positive-understanding-evidence-v2',
                'evidenceProfileRecommendation': 'create', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
    records.append(rec)
    actual_bindings.append({'goalId': goal['goalId'], 'PDFPhysicalPage': ordinal + 2,
                           'actualPDFWholeTextRead': True, 'wholeHTMLDescriptionActualMatch': True,
                           'wholeCanonicalAndPageContext': goal})
    criteria.append({'goalId': goal['goalId'], 'chemicalCorrectness': note[0],
                     'scopeAtomicityAndEquivalentWholeDEEN': note[6], 'independentPerformance': note[2],
                     'meaningfulFreshTransfer': note[4],
                     'energyAndReactionPath': 'No unsupported numerical energetic or catalytic claim introduced; comparisons retain stated system and conditions.',
                     'representationAndObservation': 'Rendered illustration supports the goal but does not demonstrate independent learner work; full particle/model/data distinctions above apply.',
                     'experimentsAndSafety': 'Actual performance and safe controlled work remain required where claimed by the goal. No model answer, supplied observation or blank artifact is asserted to be an actual learner experiment.',
                     'evaluation': 'Keep source claims, empirical data, uncertainties, decision criteria and values distinct; no clinical or universal environmental benefit inferred.',
                     'exactSourceAndProjectionBoundary': 'Whole supplied canonical/page scope inspected. A null sourceRef/raw applicability is not complete source/course/projection approval. Whole Atlas and protected contexts remain separate.',
                     'conservativeDecision': 'KEEP exact candidate description only. create is the honest recommendation for the actual null profile in this supplied D-only frame; the separately bound existing P19 materials are not approved by that recommendation.'})

records_path = OWN / 'native-nineteen-description.independent-A-root.first.records.jsonl'
with records_path.open('x') as f:
    for row in records:
        f.write(json.dumps(row, ensure_ascii=False) + '\n')
proof = write('native-nineteen.whole-DEEN-HTML-PDF-context.actual-independent-A-root.reading.json', {
    'schemaVersion': 1, 'role': 'Whole actually read bilingual/page contexts and genuine native artifact checks',
    'actualInputs': bind(NATIVE / 'round-a/description-review-input.json'),
    'wholePDFText': bind(OWN / 'native19-pages3-21.actual-read.txt'),
    'wholeHTML': bind(NATIVE / 'bundle/book.html'), 'wholePDF': bind(NATIVE / 'bundle/book.pdf'),
    'actualWholeContexts': actual_bindings,
    'actualPDFPageRastersViewed': [bind(OWN / f'actual-native-pages/physical-{n:02d}.png') for n in [3, 7, 12, 20, 21]],
    'all19PDFWholeTextRead': True, 'all19GoalImagePrerequisiteContextRead': True,
    'all19RasterPagesClaimedViewed': False, 'freshVApproval': False,
    'generationIsNotApproval': True, 'humanApproval': False})
criteria_ref = write('native-nineteen-description.independent-A-root.first.criteria-notes.json', {
    'schemaVersion': 1, 'role': 'Own criterion-by-criterion native D19 review', 'criteriaNotes': criteria,
    'actualCriteria': bind(NATIVE / 'round-a/criteria.md'), 'actualPrompt': bind(NATIVE / 'round-a/prompt.md')})
verdict = write('native-nineteen-description.independent-A-root.first.verdict.json', {
    'schemaVersion': 1, 'role': 'Root genuine independent Native19 description FIRST', 'createdAt': now,
    'records': bind(records_path), 'criteria': criteria_ref, 'actualReading': proof,
    'actualInputFirst': bind(OWN / 'native-nineteen-current-input.independent-A-root.first.freeze.json'),
    'decisions': {'keep': 19, 'revise': 0, 'split_review': 0, 'block': 0},
    'blindToCurrentNativeD19PeerRuns': True, 'currentNativePeerOutcomeReadBeforeFirst': False,
    'previousSeparatePairedP19MaterialEvidenceSuppliedAsNeutralBoundInput': True,
    'descriptionOrP19MaterialAuthorIsRoot': False,
    'sourceAtlasOrCourseViewApproval': False, 'protected8ContextsApproved': False,
    'humanApproval': False, 'humanTrial': False, 'newScientificM7Closures': 0,
    'restoredM7Bindings': 0, 'netStrictGain': 0, 'activeWrites': []})
freeze = write('native-nineteen-description.independent-A-root.first.freeze.json', {
    'schemaVersion': 1, 'sealedAt': now, 'role': 'Own actual FIRST before any current Native19 peer outcome',
    'verdict': verdict, 'records': bind(records_path), 'criteria': criteria_ref,
    'actualReading': proof, 'script': bind(Path(__file__)), 'humanApproval': False, 'netStrictGain': 0})
print(json.dumps({'verdict': verdict, 'freeze': freeze, 'records': bind(records_path)}, indent=2))
