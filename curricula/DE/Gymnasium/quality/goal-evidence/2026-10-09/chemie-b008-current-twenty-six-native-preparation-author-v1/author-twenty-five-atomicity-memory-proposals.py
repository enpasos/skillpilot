# SPDX-License-Identifier: Apache-2.0
"""Whole scientific A/M author proposals; no approved records or fingerprints before scope resolution."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
RAW = OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json'

# Each rationale concerns the complete competence, including its coupled steps and boundaries.
RATIONALES = {
 'lower-chemical-question-hypothesis': (
  'Eine selbst formulierte chemisch untersuchbare Frage, ihre begründete Hypothese und erwartete Stütz- oder Gegenbefunde bilden einen zusammenhängenden hypothesenbildenden Arbeitsgang. Ohne Gegenbefund bleibt die Hypothese ungeprüft; bloßes Benennen eines Phänomens reicht nicht. Der gemeinsame Leistungsgegenstand ist die eigene überprüfbare Hypothese, nicht das unabhängige Beherrschen jeder möglichen Alltagschemie.',
  'A self-formulated investigable chemical question, its justified hypothesis and supporting or opposing predictions form one hypothesis-construction performance. Without a counter-prediction the hypothesis remains untested; merely naming a phenomenon is insufficient. The shared assessable product is the learner’s own testable hypothesis, not independent mastery of every possible everyday chemical topic.',
  'Prüfbarkeit und eigene Befundprognosen müssen an einem neuen Phänomen entwickelt werden. Eine Karte mit Frage-/Hypothesenschablonen ersetzt dies nicht. Fachbegriffe und chemische Grundlagen des jeweiligen Phänomens bleiben Aufgabenmaterial bzw. Voraussetzungen eigener Inhaltsziele.',
  'Testability and predictions must be developed for a new phenomenon. Memorized question/hypothesis templates cannot replace this performance. Chemical terms and prerequisites of the selected phenomenon belong to supplied material or separate content goals.'),
 'upper-theory-based-question-hypothesis': (
  'Frageidentifikation, Konzeptwahl, eigene Hypothese, theoretisch abgeleitete Prognose und belastbarer Gegenbefund sind gekoppelte Teile einer theoriegestützten Hypothesenbildung. Eine richtige Theoriebezeichnung ohne passende Vorhersage erfüllt die Kompetenz nicht. Unterschiedliche chemische Theorien sind Kontexte der Routine; ihre eigenständigen Inhaltsziele werden nicht zu diesem Prozessziel umklassifiziert.',
  'Identifying a question, choosing a concept, creating a hypothesis, deriving a prediction and specifying a credible counter-result are coupled parts of theory-based hypothesis construction. Naming a correct theory without a relevant prediction is insufficient. Different chemical theories are contexts of the routine; their separate content goals are not reclassified as this process goal.',
  'Die notwendige Leistung ist die fallabhängige Ableitung und begründete Widerlegbarkeit, kein isolierter Theorienkatalog. Erforderlicher fachlicher Abruf bleibt bei den bestehenden inhaltlichen Voraussetzungen; hier wird kein zusätzliches Prozessdeck vorgeschlagen.',
  'The required performance is context-specific derivation and justified falsifiability, not isolated recall of a theory catalogue. Necessary chemical recall remains with existing content prerequisites; no additional process deck is proposed.'),
 'lower-guided-hypothesis-investigation': (
  'Die sichere tatsächliche Durchführung der angeleiteten Untersuchung mit kontrollierten Vorgaben und einem nachvollziehbaren Protokoll ist eine integrierte praktische Untersuchungsroutine. Sicherheit, Einflussgrößen und Hypothesenbezug dürfen nicht als optionale Zusatzhandlungen wegfallen. Ein geschriebener Modellplan allein ersetzt den ausdrücklich verlangten Durchführungsteil nicht; G1-Materialien sind keine beobachtete Ausführung.',
  'Safely carrying out the guided investigation with its specified controls and traceable record is one integrated practical investigation routine. Safety, variables and the hypothesis link are mandatory. A written model plan alone cannot substitute for explicitly required execution; G1 author materials are not observed performance.',
  'Anweisungen, Sicherheitsinformationen und Datenblatt müssen angemessen bereitgestellt und angewendet werden. Ihr Auswendiglernen ist kein Nachweis sicherer Ausführung. Bereits notwendige Gefahrstoff-/Symbolkarten anderer Inhaltsziele bleiben erhalten; neue Schritte-Karten werden nicht als praktische Evidenz benötigt.',
  'Instructions, safety information and a recording sheet must be appropriately provided and applied. Memorizing them does not demonstrate safe execution. Existing hazard/symbol cards of separate content goals remain intact; new step-list cards are not required as practical evidence.'),
 'lower-independently-planned-hypothesis-investigation': (
  'Eigene Untersuchungsplanung, begründete Vergleichsbedingungen, geeignete sichere Arbeitstechniken und Protokoll der tatsächlich ausgeführten einfachen qualitativen und quantitativen Untersuchung bilden einen zusammenhängenden Untersuchungszyklus. Planung und Durchführung sind erforderliche Leistungsfacetten derselben Routine. Beide Untersuchungsformen bleiben verpflichtende Varianten, nicht beliebig gegeneinander austauschbar.',
  'Independent planning, justified comparison conditions, suitable safe techniques and a record of the actually completed simple qualitative and quantitative investigation form one investigation cycle. Planning and execution are required facets of the same routine. Both investigation forms remain required variants, not arbitrary alternatives.',
  'Ein gelernter Standardversuch kann weder passende Kontrollen für einen neuen Fall noch tatsächliche sichere Ausführung belegen. Berechnungs- und Stoffwissen bleibt bei den fachlichen Voraussetzungen; dieses Ziel benötigt begründete Planung und Praxis statt eines neuen Rezeptdecks.',
  'A memorized standard experiment proves neither appropriate controls for a new problem nor actual safe execution. Calculation and substance knowledge remain with content prerequisites; this goal needs justified planning and practice rather than a new recipe deck.'),
 'upper-hypothesis-investigation': (
  'Die überwiegend selbstständige hypothesengeleitete Planung, Auswahl geeigneter Analysenmethoden, sichere tatsächliche Durchführung und nachvollziehbare Protokollierung anspruchsvoller qualitativer und quantitativer Experimente bilden eine integrierte experimentelle Routine. Mehrere Arbeitsschritte begründen hier keinen automatischen Split. Die eigenständige Methodenwahl und tatsächliche Durchführung dürfen durch reine Falllektüre nicht ersetzt werden.',
  'Largely independent hypothesis-driven planning, suitable analytical-method selection, safe actual execution and traceable recording of demanding qualitative and quantitative experiments form one experimental routine. Multiple steps do not automatically require splitting. Independent method choice and actual execution cannot be replaced by reading a case.',
  'Methodeneignung, sichere Entscheidungen und Ausführungsqualität sind fallabhängig zu zeigen. Kompakte Stoff-/Reaktionsgrundlagen aus bestehenden Inhaltszielen bleiben möglich; ein neuer auswendig gelernter Analysenablauf würde die geforderte selbstständige praktische Leistung nicht ersetzen.',
  'Method suitability, safe decisions and execution quality must be demonstrated in context. Compact substance/reaction recall from existing content goals may remain necessary; a newly memorized analytical recipe cannot replace the required independent practical performance.'),
 'data-documentation': (
  'Strukturierte Datendokumentation mit Größen, Einheiten, Herkunft, Bedingungen und sauberer Trennung von Beobachtung und Erklärung bildet eine einzige nachvollziehbare Dokumentationsleistung. Fehlende Angaben müssen als fehlend markiert statt erfunden werden. Die Quelle experimentell oder recherchiert ändert die Datenherkunft, nicht die gemeinsame Dokumentationskompetenz.',
  'Structured recording of quantities, units, provenance and conditions while separating observation from explanation forms one traceable documentation performance. Missing entries must remain explicitly missing. Experimental versus researched data changes provenance, not the shared documentation competence.',
  'Die prüfbare Leistung ist ein korrektes eigenes Datenartefakt und begründeter Umgang mit Lücken. Eine Karte über Tabellenüberschriften beweist weder Quellenzuordnung noch unverfälschte Datenerhaltung. Fachliche Einheiten werden im Material oder bei vorausgesetzten Inhaltszielen behandelt.',
  'The assessable performance is a correct learner-created data artifact and justified treatment of gaps. A card listing table headings proves neither provenance assignment nor unaltered data preservation. Chemical units belong to the material or prerequisite content goals.'),
 'lower-chemical-data-interpretation': (
  'Geeignete tabellarische oder grafische Auswertung, Beziehungserklärung und begründeter Bezug auf die Ausgangshypothese sind gekoppelte Facetten einer Dateninterpretation. Trendlesen ohne Hypothesenbezug reicht nicht. Quantitative Beziehungen und begründete Nichtschlussfolgerungen bleiben Teil derselben Auswertung, statt die Daten lediglich zu beschreiben.',
  'Suitable tabular or graphical evaluation, explaining relationships and justified linkage to the starting hypothesis are coupled facets of data interpretation. Reading a trend without addressing the hypothesis is insufficient. Quantitative relationships and justified limits belong to the same evaluation rather than mere description.',
  'Neue Tabellen oder Diagramme müssen interpretiert werden. Das Wiedergeben gelernter Trends oder einer Diagramm-Schablone reicht nicht. Notwendige Größen-/Einheitenkenntnisse bleiben getrennte inhaltliche Voraussetzungen; neue Ergebnismerk-Karten sind nicht erforderlich.',
  'New tables or diagrams must be interpreted. Recalling a learned trend or diagram template is insufficient. Quantity/unit knowledge remains a separate content prerequisite; new result-memorization cards are unnecessary.'),
 'upper-quantitative-hypothesis-data-evaluation': (
  'Die begründete Auswahl und Anwendung mathematischer und digitaler Auswertung, bedingungsbezogene Interpretation und daraus abgeleiteter Hypothesenschluss bilden eine quantitative Auswertungsroutine. Ein berechneter Wert ohne Verfahren-/Bedingungsbegründung und Hypothesenbezug genügt nicht. Fachübergreifende Begründungen sind Mittel dieser Auswertung, keine beliebige Sammlung unabhängiger Stoffziele.',
  'Justified selection and use of mathematical and digital analysis, condition-sensitive interpretation and the resulting hypothesis conclusion form one quantitative evaluation routine. A computed number without explaining the method, conditions and hypothesis relation is insufficient. Cross-disciplinary reasons serve this evaluation rather than creating an arbitrary collection of unrelated content goals.',
  'Verfahren werden nach Datenlage gewählt und ihre Schlüsse geprüft; vorgegebene Formeln oder Softwareausgaben sind zu begründen. Rechen- und Formelabruf bleibt in passenden inhaltlichen Voraussetzungen. Ein neues Softwarebefehls- oder Ergebnisdeck ist kein erforderlicher Ersatz für Auswertungstransfer.',
  'Methods are chosen for the data and their conclusions checked; formulas and software outputs must be justified. Formula/calculation recall remains in suitable content prerequisites. A new software-command or result deck is not a necessary substitute for analytical transfer.'),
 'data-validity': (
  'Das begründete Urteil über Angemessenheit, Gültigkeit und Tragweite der Daten einschließlich Fehlerursachen und zulässiger Schlussfolgerungen bildet eine einheitliche Datenkritik. Fehleretiketten ohne konkrete Wirkung auf den Schluss reichen nicht. Verfahrensbedingungen und Aussagegrenzen müssen verbunden werden.',
  'Judging appropriateness, validity and reach of data, including error causes and permitted conclusions, forms one data-critique performance. Naming errors without explaining their effect on the conclusion is insufficient. Procedure conditions and inferential limits must be connected.',
  'Die Kompetenz verlangt fallbezogene Fehler- und Schlussanalyse. Listen von Fehlerarten oder Gültigkeitsdefinitionen allein erfüllen sie nicht. Keine zusätzliche Memoryroutine ist nötig, wenn konkrete Daten und Bedingungen vorliegen und fachliche Grundlagen anderweitig gesichert sind.',
  'The competence requires contextual analysis of error and inference. Lists of error types or validity definitions do not satisfy it. No additional memory routine is needed when data and conditions are supplied and chemical prerequisites are separately secured.'),
 'foreign-inquiry-process-and-reach': (
  'Die Erklärung des Zusammenhangs von Frage, Methode, Beobachtung und Interpretation eines vorgegebenen Erkenntniswegs mit dessen Reichweite ist eine integrierte methodologische Einordnung. Methodenschritte aufzuzählen genügt nicht; die Beantwortbarkeit und Unsicherheit müssen konkret begründet werden. Dieses fremde Erkenntniswegziel darf nicht mit Reflexion einer eigenen Untersuchung verwechselt werden.',
  'Explaining the connection between question, method, observation and interpretation of a supplied inquiry, together with its reach, is one integrated methodological analysis. Listing steps is insufficient; answerability and uncertainty require concrete reasons. This supplied-inquiry goal must remain distinct from reflecting on one’s own investigation.',
  'Die Lernleistung ist die Erklärung eines neuen vorgegebenen Erkenntniswegs, nicht der Abruf eines einzigen Wissenschaftsschemas. Begriffe dienen der begründeten Analyse; ein neues Ablaufschema-Deck ist kein notwendiger Leistungsnachweis.',
  'The performance is explaining a new supplied inquiry rather than recalling one scientific-method diagram. Terms serve justified analysis; a new sequence-of-steps deck is not necessary evidence.'),
 'own-inquiry-process-reflection': (
  'Die auf eigene Untersuchungsergebnisse bezogene Begründung von Frage, Hypothese, Methoden, Grenzen und konkreten Verbesserungen ist eine einzige reflektierende Untersuchungskompetenz. Die eigene Untersuchung und eigene Entscheidungen sind zwingend; Kritik an einem ausschließlich fremden fertigen Protokoll ist kein gleichwertiger Ersatz. G1-Materialien beschreiben Anforderungen, behaupten aber keine Durchführung.',
  'Explaining the question, hypothesis, methods, limits and concrete improvements with reference to one’s own results is one reflective investigation competence. The learner’s own inquiry and decisions are mandatory; critique of an entirely supplied finished protocol is not an equivalent substitute. G1 materials define requirements without claiming execution.',
  'Eigene Entscheidungen und Ergebnisse müssen begründet überprüft werden. Auswendig gelernte Reflexionssätze können diesen Bezug nicht herstellen. Vorhandene fachliche Grundlagen und Karten bleiben erhalten; kein neues Reflexionsphrasen-Deck wird benötigt.',
  'The learner must justify and check their own decisions and results. Memorized reflective phrases cannot establish that connection. Existing content knowledge and cards remain intact; no new stock-reflection-phrase deck is needed.'),
 'upper-scientific-validity': (
  'Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, Konsistenz und Vorläufigkeit sind verschiedene Prüfkriterien eines begründeten Gültigkeitsurteils über einen chemischen Erkenntnisprozess. Sie müssen am selben Leistungsprodukt sachgerecht unterschieden und angewendet werden. Die zwingende Unterscheidung belastbarer Gegenbefunde von Durchführungs-/Messfehlern verhindert bloßes Kriterienaufsagen.',
  'Reproducibility, falsifiability, intersubjectivity, consistency and provisionality are distinct criteria serving one justified judgement of a chemical inquiry’s validity. They must be distinguished and applied appropriately in the same performance. Separating credible counter-evidence from procedural or measurement failure prevents mere recital of criteria.',
  'Das Ziel verlangt Anwendung und Abgrenzung der benannten Kriterien. Kompakte Begriffskenntnis kann unterstützend sein, ist hier aber kein separater zwingender Kartenabruf: ein begründetes Urteil an neuem Material und korrekte Gegenbefundanalyse sind unverzichtbar. Ein Glossar allein ist keine Evidenz.',
  'The goal requires applying and distinguishing named criteria. Concise term knowledge may support this but is not a separate mandatory card-recall axis: justified judgement of new material and correct counter-evidence analysis remain essential. A glossary alone is not evidence.'),
 'sek1-source-information': (
  'Die fragestellungsgeleitete Auswahl, Strukturierung und adressatengerechte Auswertung relevanter Informationen mit Quellenangabe bildet eine einheitliche Quellenerschließung. Quelle finden oder Text zusammenfassen allein genügt nicht. Vorgegebene und selbst recherchierte analoge/digitale Darstellungen bleiben echte Leistungsvarianten, nicht eine Freigabe jeder recherchierten Quelle.',
  'Question-guided selection, organization and audience-appropriate evaluation of relevant information with provenance form one source-exploration performance. Merely finding a source or summarizing text is insufficient. Supplied and independently researched analogue/digital representations remain genuine performance variants, not approval of any retrieved source.',
  'Information muss für eine neue Frage ausgewählt und mit Herkunft belegt werden. Ein Quellenangabe-Muster kann unterstützen, ersetzt aber weder Materialauswahl noch Auswertung. Keine zusätzlichen Faktenkarten über konkrete Quellen sind notwendig.',
  'Information must be selected for a new question and traced to its source. A citation template may assist but replaces neither selection nor evaluation. Additional fact cards about particular sources are unnecessary.'),
 'upper-source-information': (
  'Eigenständige analoge/digitale Recherche, Auswahl und Interpretation komplexer Informationen, fachlicher Schluss und nachvollziehbarer Beleg einschließlich Zitatkennzeichnung bilden eine anspruchsvolle Rechercheauswertung. Alle Glieder des belegten Informationswegs sind verpflichtend. Erfundene Abrufvorgänge, Quelleninhalte oder Zitate wären kein Ersatz für eine tatsächliche Rechercheleistung.',
  'Independent analogue/digital searching, selecting and interpreting complex information, drawing chemical conclusions and providing traceable citations form one demanding research-evaluation performance. Every link in the evidence trail is mandatory. Invented retrieval, source content or quotations cannot substitute for actual research.',
  'Das Ziel verlangt einen neuen belegten Informationsweg statt das Merken einer festen Link- oder Zitatsammlung. Chemische Grundbegriffe bleiben Voraussetzungen; es wird kein neues Quellenfakten-Deck benötigt. Ein bereitgestellter Auszug allein beweist noch keine eigenständige Recherche.',
  'The goal requires a new evidenced information trail rather than memorizing fixed links or quotations. Chemical terms remain prerequisites; no new source-fact deck is necessary. A supplied extract alone does not demonstrate independent research.'),
 'upper-source-criticism': (
  'Vergleich von Aussagen, Relevanz, Urheberschaft, Vertrauenswürdigkeit und Intention mündet in ein einziges begründetes Eignungs-/Validitätsurteil für eine konkrete chemische Frage. Diese Kriterien sind gekoppelte Begründungsfacetten. Ansehen eines Anbieters oder ein pauschales interessengeleitet-Label allein erlauben kein Validitätsurteil über seine konkrete Aussage.',
  'Comparing statements, relevance, authorship, trustworthiness and intention leads to one justified suitability/validity judgement for a chemical question. These are coupled justificatory facets. Provider reputation or a blanket conflict-of-interest label cannot alone determine the validity of a specific statement.',
  'Konkrete Quellenbelege und Darstellungen müssen geprüft werden. Eine gelernte Rangliste von Quellentypen oder Kritikkriterien reicht nicht. Keine neuen Anbieter-/Kriterienkarten ersetzen die fallbezogene fachliche Prüfung.',
  'Concrete evidence and representations must be examined. A memorized ranking of source types or critique criteria is insufficient. New provider/criteria cards do not replace contextual chemical scrutiny.'),
 'criteria-arguments': (
  'Kriterienerkennung, eigene fachlich belegte Pro-/Kontra-Argumente, Vergleich mit bereitgestellten Argumenten und begründete Gewichtung bilden eine argumentierende Abwägungsleistung. Sie verlangt eigene Argumente statt bloßen Sortierens. Die Gewichtung ist offenzulegen und hängt vom Kriterium ab; sie ist nicht durch chemische Daten allein normativ festgelegt.',
  'Identifying criteria, creating evidence-backed pro/con arguments, comparing them with supplied arguments and justifying weights form one argumentative evaluation. Own arguments are required rather than merely sorting supplied ones. Weights must be explicit and depend on criteria; chemical data alone do not determine normative priorities.',
  'Eigene Kriterienbezüge und Argumente müssen an neuem Material entstehen. Ein memorierter Pro-/Kontra-Katalog ist keine geforderte Routine. Fachliche Daten dürfen bereitgestellt werden; zusätzliche argumentbezogene Memorykarten sind nicht notwendig.',
  'Criterion-linked arguments must be generated from new material. Recalling a pro/con catalogue is not the required routine. Chemical data may be provided; additional argument-memory cards are unnecessary.'),
 'chemical-applications-society': (
  'Chemische Aufgaben und Anwendungen an Beispielen fachlich erklären und deren Bedeutung für Gesellschaft, Mensch und Umwelt begründet diskutieren ist eine integrierte Anwendungsdeutung. Beispielwissen allein genügt nicht, eine pauschale Wertung ohne chemischen Mechanismus ebenfalls nicht. Kontextwechsel prüfen den Transfer dieser Deutungsroutine.',
  'Explaining chemical functions/applications through examples and discussing their significance for society, people and the environment forms one application-interpretation performance. Example recall alone and blanket evaluations without a chemical mechanism are insufficient. Changed contexts test transfer of the same interpretive routine.',
  'Die Leistung verknüpft bereitgestellte oder recherchierte Anwendungsinformationen mit einer begründeten Diskussion. Ein Produkt-/Berufsnamenkatalog ist kein notwendiger Abrufbestandteil dieses Ziels; die chemischen Inhaltsvoraussetzungen bleiben eigenständig.',
  'The performance connects supplied or researched application information to a justified discussion. A product/job-name catalogue is not a necessary recall component of this goal; chemical content prerequisites remain separate.'),
 'chemistry-career-choice': (
  'Berufsaufgaben und Anforderungen vergleichen, ihre chemischen/gesellschaftlichen Zusammenhänge erklären und Informationen in eine eigene begründete Orientierung einbeziehen bildet eine fachlich begründete Berufsorientierungsroutine. Eine bestimmte Berufswahl oder persönliches Interesse wird nicht als richtig vorgeschrieben. Dieses assessierbare Informations-/Begründungsziel ist keine bloße motivierende Orientation.',
  'Comparing professional tasks/requirements, explaining their chemical and societal connections and using information for a justified personal orientation form one career-orientation routine. No particular occupation or personal interest is prescribed as correct. This assessable information-and-justification goal is distinct from purely motivational orientation.',
  'Aufgaben, Anforderungen und Informationslücken werden anhand aktueller Beispiele ausgewertet. Berufe auswendig aufzuzählen ersetzt weder Vergleich noch begründete persönliche Einbeziehung. Kein neues Berufsfakten-Deck ist erforderlich; tatsächliche berufliche Eignung wird nicht zertifiziert.',
  'Tasks, requirements and information gaps are evaluated through examples. Listing jobs from memory replaces neither comparison nor justified personal consideration. No new occupation-fact deck is necessary; actual occupational suitability is not certified.'),
 'criteria-decision': (
  'Das ganze Ziel bindet ethische, ökologische, ökonomische, soziale und Sicherheitskriterien an Chancen/Risiken, eigene Handlungsoptionen, begründete Strategie und deren überprüfende Reflexion. Das ist ein integrierter Entscheidungszyklus; Kriterien oder Abschlussentscheidung allein reichen nicht. Normative Gewichtungen bleiben begründet plural, chemische Daten begrenzen Aussagen, legen aber nicht die einzige zulässige Entscheidung fest.',
  'The whole goal links ethical, environmental, economic, social and safety criteria to risks/benefits, own options, a justified strategy and critical reconsideration. This is one integrated decision cycle; criteria or a final choice alone are insufficient. Normative weights remain justifiably plural; chemical data constrain claims without dictating the only acceptable decision.',
  'Kriterien und Strategie müssen am konkreten Entscheidungsfall begründet und überprüft werden. Eine feste Werteskala oder Musterentscheidung würde gerade die geforderte Reflexion umgehen. Daten und Begriffshilfen können bereitgestellt werden; keine zusätzlichen normativen Entscheidungsmerk-Karten.',
  'Criteria and strategy must be justified and reconsidered for the decision at hand. Fixed value rankings or memorized model choices bypass the required reflection. Data and terminology aids may be supplied; no additional normative-choice memory cards are needed.'),
 'upper-knowledge-influences': (
  'Die Bewertung sozialer, kultureller, technischer, historischer, ökologischer und ökonomischer Einflüsse auf chemische Wissensentwicklung ist eine wissenschaftsbezogene Kontextanalyse. Diese Perspektiven dienen demselben begründeten Entwicklungsurteil, ohne empirische Gültigkeit mit Zustimmung gleichzusetzen. Ein Einflussnachweis ist kein Beweis, dass eine chemische Erkenntnis wahr oder falsch ist.',
  'Evaluating social, cultural, technological, historical, ecological and economic influences on chemical knowledge development is one science-in-context analysis. These perspectives support the same justified developmental judgement without equating empirical validity with social approval. Demonstrating an influence does not itself prove a chemical claim true or false.',
  'Historische Quellen, technische Möglichkeiten und Konsequenzen müssen verbunden und Evidenzgrenzen beachtet werden. Jahreszahlen oder Personenlisten auswendig zu lernen ersetzt keine Einflussanalyse. Kein neuer Chronologie-Kartenabruf wird benötigt; vorhandene chemische Inhaltsgrundlagen bleiben erhalten.',
  'Historical evidence, technical possibilities and consequences must be connected while respecting inferential limits. Memorizing dates or names does not replace influence analysis. No new chronology-card recall is required; chemical content prerequisites remain intact.'),
 'upper-chemical-effects-sustainability': (
  'Historische und aktuelle chemische Wirkungen aus ökologischer, ökonomischer und sozialer Nachhaltigkeit einschließlich eigener möglicher Handlungseffekte bewerten ist eine gekoppelte Wirkungs-/Nachhaltigkeitsanalyse. Alle Perspektiven müssen erkennbar angewendet werden. Ein universelles Produktgut/-schlecht-Urteil ohne Systemgrenzen und begründete Abwägung erfüllt sie nicht.',
  'Evaluating historical/current chemical impacts through environmental, economic and social sustainability, including possible effects of one’s own actions, is one coupled impact/sustainability analysis. All perspectives must be applied visibly. Universal good/bad product labels without boundaries and justified weighing are insufficient.',
  'Bereitgestellte oder recherchierte Wirkungsdaten müssen auf einen neuen Kontext und eigene Handlungsmöglichkeiten bezogen werden. Gelernte Nachhaltigkeitslabels reichen nicht. Zusatzkarten über starre Produkturteile sind nicht erforderlich; chemische Grundlagen bleiben eigene Ziele.',
  'Supplied or researched impact data must be related to a new context and personal actions. Memorized sustainability labels are insufficient. Cards containing fixed product judgements are unnecessary; chemical foundations remain separate goals.'),
 'sek1-model-use-criticism': (
  'Hypothesengeleitete Wahl und Nutzung analoger/digitaler Modelle oder Simulationen, Vergleich mit Beobachtungen und anderen Modellen sowie begründete Grenzen/Weiterentwicklung bilden eine Modellierungsroutine. Materie, Reaktion, Bindung und Wechselwirkung sind verpflichtende fachliche Varianten, keine beliebig weglassbaren Teilpflichten. Eine einzelne Zeichnung ohne Modellkritik deckt diese Kompetenz nicht ab.',
  'Hypothesis-guided choice/use of analogue/digital models or simulations, comparison with observations and other models, and justified limitations/improvement form one modeling routine. Matter, reaction, bonding and interaction are required chemical variants, not disposable obligations. A single drawing without model critique cannot cover the competence.',
  'Der Lernnachweis ist begründeter Einsatz und Kritik eines passenden neuen Modells, nicht Abruf einer Bildvorlage. Eigene Stoff-/Bindungskenntnisse können bestehende Inhaltsmemory benötigen; dieses Prozessziel erfordert kein neues Modellbilder-Deck.',
  'Evidence consists of justified use and critique of a suitable new model, not recall of an illustration. Substance/bonding prerequisites may require existing content memory; this process goal needs no new model-picture deck.'),
 'upper-model-use-criticism': (
  'Theoriegestützte Modellwahl und Nutzung zur Hypothesenprüfung mit Beobachtungs-/Modellvergleich und begründeter Aussagegrenze/Weiterentwicklung ist ein übertragbarer Modellierungsprozess. Die ganze benannte Variantenunion – Atombau/Periodizität, Gleichgewichte, Bindung/Geometrie und komplexe Wechselwirkungen einschließlich Wirkstoff–Rezeptor und Substrat–Enzym – bleibt erhalten. Die Einordnung als eine Routine ist keine Behauptung, zwei beliebige Beispiele deckten jede Variante oder jede Fachtheorie ab.',
  'Theory-informed model selection/use for hypothesis testing, observational/model comparison and justified limitations/improvement form a transferable modeling process. The complete named variant union—atomic structure/periodicity, equilibria, bonding/geometry and complex interactions including drug–receptor and substrate–enzyme—remains intact. Treating this as one routine does not imply that any two examples cover every variant or every chemical theory.',
  'Der Kompetenzkern ist fallabhängige Theorie-/Modellpassung und Kritik. Die verschiedenen chemischen Inhalte bleiben eigenständige Voraussetzungen mit ihren bestehenden Memoryentscheidungen. Kein zusätzliches Modellnamen-Deck ist als Ersatz für die komplette Kontextunion erforderlich.',
  'The core competence is contextual theory/model suitability and critique. Different chemical contents remain independent prerequisites with their existing memory decisions. No extra model-name deck is required as a substitute for the complete context union.'),
 'chemical-representation-transformation': (
  'Sachgerechte Transformation chemischer Informationen in eine adressaten-/situationsgerechte Darstellung mit korrekter Fachsprache, Bezugsgrößen und begründeter Erhaltung/Begrenzung der Aussage ist eine Repräsentationsroutine. Darstellungswahl und fachliche Treue müssen zusammen beurteilt werden. Eine schön gestaltete, aber mengen- oder bezugsgrößenfalsche Grafik genügt nicht.',
  'Transforming chemical information into an audience/context-appropriate representation with correct terminology, reference quantities and justified preserved/limited claims is one representational routine. Representation choice and chemical fidelity must be judged together. An attractive but quantitatively misleading graphic is insufficient.',
  'Eine neue Information muss fachlich treu umgeformt werden. Diagrammtypen auswendig zu benennen ersetzt diese begründete Transformation nicht. Notwendiger Einheiten-/Symbolabruf bleibt bei bestehenden Inhaltszielen; kein neues Darstellungsrezepte-Deck ist notwendig.',
  'New information must be transformed faithfully. Naming diagram types from memory cannot replace justified transformation. Unit/symbol recall remains with existing content goals; no new representation-recipe deck is necessary.'),
 'chemical-presentation': (
  'Chemische Sachverhalte sowie eigene Lern-/Arbeitsergebnisse sach-, adressaten- und situationsgerecht mit geeigneten analogen/digitalen Medien präsentieren und Aufbau/Medium begründen ist eine integrierte Präsentationsleistung. Ein eigener präsentierter Lern- oder Arbeitsgegenstand und die begründete Gestaltung sind verpflichtend. Eine fertige Folie nur abzulesen oder ein Medium nur zu nennen reicht nicht.',
  'Presenting chemical content and one’s own learning/work results appropriately for audience and situation using suitable analogue/digital media, while justifying structure and medium, is one presentation performance. A learner’s own presented learning/work product and justified design are required. Merely reading a supplied slide or naming a medium is insufficient.',
  'Die Leistung besteht im Aufbau, fachlichen Erklären und begründeten Darstellen neuer bzw. eigener Ergebnisse. Präsentationsregeln auswendig zu nennen ersetzt das sichtbare Produkt nicht. Keine neuen Präsentationsphrasen-Karten sind erforderlich; Fachwissen bleibt in den jeweiligen Inhaltsvoraussetzungen.',
  'The performance consists of structure, chemical explanation and justified presentation of new or learner-created results. Reciting presentation rules does not replace the visible product. No new presentation-phrase cards are necessary; content knowledge remains in the appropriate prerequisites.'),
}


def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(),
            'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


raw = json.loads(RAW.read_text())
rows = [row for row in raw['routineBodies'] if row['wholeGoal']['id'] != '1f354a60-be44-512b-8f8b-f67c8c456035']
assert len(rows) == len(RATIONALES) == 25
assert {row['candidateKey'] for row in rows} == set(RATIONALES)
created = datetime.datetime.now(datetime.timezone.utc).isoformat()
atomicity, memory = [], []
for row in rows:
    gid = row['wholeGoal']['id']
    ade, aen, mde, men = RATIONALES[row['candidateKey']]
    common = {'goalId': gid, 'candidateKey': row['candidateKey'], 'wholeUnchangedScientificGoal': row['wholeGoal'],
              'wholeOriginalRawProfile': row['wholeProfile'], 'wholeOriginalTwoCases': row['wholeTwoCases'],
              'authorRole': 'science_candidate_not_independent_review', 'authoredAt': created,
              'reviewerAliasUsed': False, 'independentJudgmentStatus': 'PENDING',
              'ordinaryFingerprintMaterializationStatus': 'PENDING_FINAL_WHOLE_SOURCE_VIEW_CONTEXT',
              'actualApprovedRecordCreated': False, 'humanApproval': False, 'humanTrial': False}
    atomicity.append({**common, 'ordinaryRuleVersion': 'semantic-atomicity-v1',
                      'proposedStatus': 'atomic', 'proposedSemanticAtomic': True,
                      'wholeGoalSemanticReasonDe': ade, 'wholeGoalSemanticReasonEn': aen,
                      'wholeSourceVariantUnionMayNotBeNarrowedByTwoExampleCases': True,
                      'currentSourcePlacementOrLabExecutionApproval': False})
    memory.append({**common, 'ordinaryRuleVersion': 'memory-card-review-v1',
                   'proposedStatus': 'no_memory_needed', 'proposedMemoryUseful': False,
                   'proposedMemoryGoalIds': [], 'proposedDeckIds': [],
                   'wholeGoalMemoryReasonDe': mde, 'wholeGoalMemoryReasonEn': men,
                   'existingChemicalContentCardsAndVisibilityRetained': True,
                   'newCardsCreatedOrRemoved': 0, 'currentSourcePlacementOrLabExecutionApproval': False})
am = OWN / 'atomicity-memory-author'
write(am / 'twenty-five-whole-semantic-atomicity.science-author-candidates.json', {
    'schemaVersion': 1, 'role': '25 whole-goal scientific atomicity proposals; normal approved review records are not authored',
    'createdAt': created, 'originalWhole26Input': bind(RAW), 'decisions': atomicity,
    'unchangedExistingScientificAtomicityReuseId': '1f354a60-be44-512b-8f8b-f67c8c456035',
    'sourceCourseContextBindingsStillPending': True, 'independentApprovalCount': 0,
    'humanApproval': False, 'activeWrites': [], 'strictGain': 0})
write(am / 'twenty-five-whole-memory.science-author-candidates.json', {
    'schemaVersion': 1, 'role': '25 whole-goal scientific memory proposals; normal approved review records and fingerprints await independent review and final source/view context',
    'createdAt': created, 'originalWhole26Input': bind(RAW), 'decisions': memory,
    'unchangedExistingScientificMemoryReuseId': '1f354a60-be44-512b-8f8b-f67c8c456035',
    'existing73PrimaryCardsAnd7VisibilityScopesRetainedExactly': True,
    'sourceCourseContextBindingsStillPending': True, 'independentApprovalCount': 0,
    'humanApproval': False, 'activeWrites': [], 'strictGain': 0})
frame = json.loads((OWN / 'input/current-whole-source-partner-atomicity-memory-frame.neutral.json').read_text())
exact_a = [record for record in frame['wholeCurrentAtomicityRecords'] if record['goalId'] == '1f354a60-be44-512b-8f8b-f67c8c456035']
exact_m = [record for record in frame['wholeCurrent378MemoryRows'] if record['goalId'] == '1f354a60-be44-512b-8f8b-f67c8c456035']
assert len(exact_a) == len(exact_m) == 1
write(am / 'one-existing-current-science-atomicity-memory.exact-reuse.input.json', {
    'schemaVersion': 1, 'role': 'Exact existing valid A/M records only; no repeated scientific review',
    'goalId': '1f354a60-be44-512b-8f8b-f67c8c456035', 'originalAtomicityRecord': exact_a[0], 'originalMemoryRecord': exact_m[0],
    'actualOrdinaryExplicit26ProbePath': (OWN / 'checks/atomicity.exact26-unmodified-old-records.actual-terminal.json').relative_to(ROOT).as_posix(),
    'activeWrites': [], 'newScientificClosures': 0, 'strictGain': 0})
entry = {'schemaVersion': 1, 'role': 'Neutral whole25 scientific A/M author proposals and exact unchanged original1f A/M evidence; no author or peer verdicts',
         'goalIds': [row['wholeGoal']['id'] for row in rows], 'atomicityProposalCount': 25, 'memoryProposalCount': 25,
         'wholeAtomicityAuthorCandidate': bind(am / 'twenty-five-whole-semantic-atomicity.science-author-candidates.json'),
         'wholeMemoryAuthorCandidate': bind(am / 'twenty-five-whole-memory.science-author-candidates.json'),
         'genuineExistingOneReuseInput': bind(am / 'one-existing-current-science-atomicity-memory.exact-reuse.input.json'),
         'wholeSourceAndPartnerContextPath': (OWN / 'input/current-whole-source-partner-atomicity-memory-frame.neutral.json').relative_to(ROOT).as_posix(),
         'normalAtomicityProbePath': (OWN / 'checks/atomicity.exact26-unmodified-old-records.actual-terminal.json').relative_to(ROOT).as_posix(),
         'normalMemoryProbePath': (OWN / 'checks/memory.future504-unmodified-current-records.actual-terminal.json').relative_to(ROOT).as_posix(),
         'source19WholeClosure': False, 'ordinarySourceCoursePlacementApproval': False,
         'activeWrites': [], 'newScientificClosures': 0, 'netStrictGain': 0, 'humanApproval': False, 'humanTrial': False,
         'fingerprintsCreatedOrAdjusted': 0, 'normalApprovedReviewsCreated': 0}
write(am / 'neutral-twenty-five-whole-A-M-science-author.entry.json', entry)
seal = {'schemaVersion': 1, 'role': 'First author proposal freeze, not independent approval', 'frozenAt': created,
        'outputs': [bind(path) for path in sorted(am.glob('*.json'))], 'sourceInput': bind(RAW),
        'authorScript': bind(Path(__file__).resolve()), 'activeWrites': [], 'strictGain': 0}
write(am / 'twenty-five-whole-A-M-science-author.first.freeze.json', seal)
print(json.dumps({'wholeA25Authored': True, 'wholeM25Authored': True, 'originalOneAMExactReuse': True,
                  'actualApprovedRecords': 0, 'fingerprintsWritten': 0, 'wholeSourceViewFinal': False,
                  'activeWrites': 0, 'strictGain': 0}))
