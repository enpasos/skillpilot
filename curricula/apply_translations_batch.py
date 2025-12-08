import json
import os
from typing import Dict, Any

# Batch-fix for all curricula:
# For every *.de.json under this directory, if `titleEn` or `descriptionEn`
# is still identical to the German field (and not a [TODO] placeholder),
# replace it with the English text defined in TRANSLATIONS below.

TRANSLATIONS: Dict[str, str] = {
    # History / cross-subject (examples, extend as needed)
    "Interpretation": "Interpretation",
    "Kontext überblicken": "Overview the context",
    "Quellen untersuchen": "Analyze sources",
    "Begriffe anwenden": "Apply concepts",
    "Historisches Urteil bilden": "Form a historical judgment",
    "Bezüge zur Gegenwart": "Relate to the present",
    "Ergebnisse präsentieren": "Present results",
    "Kostenartenrechnung": "Cost Type Accounting",
    "Skill: Einzel- vs. Gemeinkosten, Fix vs. Variabel.": "Skill: Direct vs. Overhead costs, Fixed vs. Variable.",
    "Kostenstellenrechnung": "Cost Center Accounting",
    "Skill: Betriebsabrechnungsbogen (BAB) erstellen.": "Skill: Creating an expense distribution sheet (BAB).",
    "Kostenträgerrechnung": "Cost Object Accounting",
    "Skill: Divisionskalkulation und Zuschlagskalkulation.": "Skill: Division calculation and overhead calculation.",
    
    # Expanded CEFR / Language Competencies (Reception/Production/Interaction/Mediation)
    "[A1] Mündliche Interaktion allgemein (Interaktion)": "[A1] Oral Interaction General (Interaction)",
    "[A2] Mündliche Interaktion allgemein (Interaktion)": "[A2] Oral Interaction General (Interaction)",
    "[B1] Mündliche Interaktion allgemein (Interaktion)": "[B1] Oral Interaction General (Interaction)",
    "[B2] Mündliche Interaktion allgemein (Interaktion)": "[B2] Oral Interaction General (Interaction)",
    "[C1] Mündliche Interaktion allgemein (Interaktion)": "[C1] Oral Interaction General (Interaction)",
    "[C2] Mündliche Interaktion allgemein (Interaktion)": "[C2] Oral Interaction General (Interaction)",
    
    "[A1] Schriftliche Interaktion allgemein (Interaktion)": "[A1] Written Interaction General (Interaction)",
    "[A2] Schriftliche Interaktion allgemein (Interaktion)": "[A2] Written Interaction General (Interaction)",
    "[B1] Schriftliche Interaktion allgemein (Interaktion)": "[B1] Written Interaction General (Interaction)",
    "[B2] Schriftliche Interaktion allgemein (Interaktion)": "[B2] Written Interaction General (Interaction)",
    "[C1] Schriftliche Interaktion allgemein (Interaktion)": "[C1] Written Interaction General (Interaction)",
    "[C2] Schriftliche Interaktion allgemein (Interaktion)": "[C2] Written Interaction General (Interaction)",

    "[A1] Mündliche Produktion allgemein (Produktion)": "[A1] Oral Production General (Production)",
    "[A2] Mündliche Produktion allgemein (Produktion)": "[A2] Oral Production General (Production)",
    "[B1] Mündliche Produktion allgemein (Produktion)": "[B1] Oral Production General (Production)",
    "[B2] Mündliche Produktion allgemein (Produktion)": "[B2] Oral Production General (Production)",
    "[C1] Mündliche Produktion allgemein (Produktion)": "[C1] Oral Production General (Production)",
    "[C2] Mündliche Produktion allgemein (Produktion)": "[C2] Oral Production General (Production)",

    "[A1] Schriftliche Produktion allgemein (Produktion)": "[A1] Written Production General (Production)",
    "[A2] Schriftliche Produktion allgemein (Produktion)": "[A2] Written Production General (Production)",
    "[B1] Schriftliche Produktion allgemein (Produktion)": "[B1] Written Production General (Production)",
    "[B2] Schriftliche Produktion allgemein (Produktion)": "[B2] Written Production General (Production)",
    "[C1] Schriftliche Produktion allgemein (Produktion)": "[C1] Written Production General (Production)",
    "[C2] Schriftliche Produktion allgemein (Produktion)": "[C2] Written Production General (Production)",
    
    "[A1] Kooperieren (Interaktion)": "[A1] Cooperating (Interaction)",
    "[A2] Kooperieren (Interaktion)": "[A2] Cooperating (Interaction)",
    "[B1] Kooperieren (Interaktion)": "[B1] Cooperating (Interaction)",
    "[B2] Kooperieren (Interaktion)": "[B2] Cooperating (Interaction)",
    "[C1] Kooperieren (Interaktion)": "[C1] Cooperating (Interaction)",
    "[C2] Kooperieren (Interaktion)": "[C2] Cooperating (Interaction)",

    "[A1] Um Klärung bitten (Interaktion)": "[A1] Asking for Clarification (Interaction)",
    "[A2] Um Klärung bitten (Interaktion)": "[A2] Asking for Clarification (Interaction)",
    "[B1] Um Klärung bitten (Interaktion)": "[B1] Asking for Clarification (Interaction)",
    "[B2] Um Klärung bitten (Interaktion)": "[B2] Asking for Clarification (Interaction)",
    "[C1] Um Klärung bitten (Interaktion)": "[C1] Asking for Clarification (Interaction)",
    "[C2] Um Klärung bitten (Interaktion)": "[C2] Asking for Clarification (Interaction)",

    "[A1] Planen (Produktion)": "[A1] Planning (Production)",
    "[A2] Planen (Produktion)": "[A2] Planning (Production)",
    "[B1] Planen (Produktion)": "[B1] Planning (Production)",
    "[B2] Planen (Produktion)": "[B2] Planning (Production)",
    "[C1] Planen (Produktion)": "[C1] Planning (Production)",
    "[C2] Planen (Produktion)": "[C2] Planning (Production)",
    
    "[A1] Kompensieren (Produktion)": "[A1] Compensating (Production)",
    "[A2] Kompensieren (Produktion)": "[A2] Compensating (Production)",
    "[B1] Kompensieren (Produktion)": "[B1] Compensating (Production)",
    "[B2] Kompensieren (Produktion)": "[B2] Compensating (Production)",
    "[C1] Kompensieren (Produktion)": "[C1] Compensating (Production)",
    "[C2] Kompensieren (Produktion)": "[C2] Compensating (Production)",

    "[A1] Kontrolle und Reparaturen (Produktion)": "[A1] Monitoring and Repair (Production)",
    "[A2] Kontrolle und Reparaturen (Produktion)": "[A2] Monitoring and Repair (Production)",
    "[B1] Kontrolle und Reparaturen (Produktion)": "[B1] Monitoring and Repair (Production)",
    "[B2] Kontrolle und Reparaturen (Produktion)": "[B2] Monitoring and Repair (Production)",
    "[C1] Kontrolle und Reparaturen (Produktion)": "[C1] Monitoring and Repair (Production)",
    "[C2] Kontrolle und Reparaturen (Produktion)": "[C2] Monitoring and Repair (Production)",
    
    # Common Academic Terms
    "Vorlesung": "Lecture",
    "Übung": "Exercise / Tutorial",
    "Seminar": "Seminar",
    "Praktikum": "Practical Course / Internship",
    "Bachelorarbeit": "Bachelor's Thesis",
    "Masterarbeit": "Master's Thesis",
    "Kolloquium": "Colloquium",
    "Pflichtmodul": "Compulsory Module",
    "Wahlpflichtmodul": "Elective Compulsory Module",
    "Wahlmodul": "Elective Module",
    "Grundlagen der": "Foundations of",
    "Einführung in": "Introduction to",
    "Fortgeschrittene": "Advanced",
    "Allgemeines": "General",
    "Spezialisierung": "Specialization",
    "Vertiefung": "In-depth Study / Specialization",
    
    # Law Specifics
    "Europarecht": "European Law",
    "Internationales Recht": "International Law",
    "Arbeitsrecht": "Labor Law",
    "Handelsrecht": "Commercial Law",
    "Gesellschaftsrecht": "Corporate Law",
    "Familienrecht": "Family Law",
    "Erbrecht": "Inheritance Law",
    "Strafprozessrecht": "Criminal Procedure Law",
    "Zivilprozessrecht": "Civil Procedure Law",
    "Verwaltungsprozessrecht": "Administrative Procedure Law",
    "Besonderes Verwaltungsrecht": "Special Administrative Law",
    "Polizei- und Ordnungsrecht": "Police and Regulatory Law",
    "Baurecht": "Construction Law",
    "Kommunalrecht": "Municipal Law",
    "Steuerrecht": "Tax Law",
    "E1 Gesellschaftlicher Wandel": "E1 Societal change",
    "Unternehmen im Wandel": "Companies in transition",
    "Wechselkursregime vergleichen": "Compare exchange rate regimes",
    "Fachkräftesicherung": "Securing skilled labour",
    "Digitale Globalisierung": "Digital globalisation",
    "Desinformation erkennen": "Identify disinformation",
    "RGT-Regel anwenden": "Apply the RGT rule",
    "E1 Sprache": "E1 Language",
    "Rezeptionsgeschichte": "History of reception",

    # English subject helper titles that were duplicated into En
    "Text comprehension": "Text comprehension",
    "Vocabulary/Grammar consolidation": "Vocabulary/Grammar consolidation",
    "Listening/Speaking": "Listening/Speaking",
    "Writing/Mediate": "Writing/Mediate",
    "Intercultural reflection": "Intercultural reflection",

    # Mathematics – process competences (K1–K6) – titles
    "K1 Mathematisch argumentieren": "K1 Mathematical reasoning",
    "Mathematische Aussagen prüfen": "Check mathematical statements",
    "Logische Schlussfolgerungen ziehen": "Draw logical conclusions",
    "Gegenbeispiele finden und nutzen": "Find and use counterexamples",
    "Begründungen und Beweise strukturieren": "Structure justifications and proofs",
    "Formale Argumentationen im Leistungskurs entwickeln": "Develop formal arguments in the advanced course",
    "K2 Probleme mathematisch lösen": "K2 Solve problems mathematically",
    "Probleme analysieren und strukturieren": "Analyze and structure problems",
    "Heuristische Strategien auswählen": "Select heuristic strategies",
    "Mathematische Modelle aufbauen": "Construct mathematical models",
    "Lösungen überprüfen und reflektieren": "Check and reflect on solutions",
    "Strategien vergleichen und optimieren (LK)": "Compare and optimize strategies (advanced course)",
    "K3 Mathematisieren": "K3 Mathematising",
    "Sachverhalte strukturieren und vereinfachen": "Structure and simplify situations",
    "Mathematische Modelle bilden": "Form mathematical models",
    "Modelle mathematisch bearbeiten": "Process models mathematically",
    "Modelle validieren und anpassen": "Validate and adapt models",
    "Mehrere Modelle vergleichen (LK)": "Compare multiple models (advanced course)",
    "K4 Darstellen": "K4 Representation",
    "Geeignete Darstellungen auswählen": "Choose appropriate representations",
    "Zwischen Darstellungen wechseln": "Switch between representations",
    "Diagramme und Visualisierungen interpretieren": "Interpret diagrams and visualisations",
    "Darstellungen mit digitalen Werkzeugen erstellen": "Create representations with digital tools",
    "Komplexe Visualisierungen entwickeln (LK)": "Develop complex visualisations (advanced course)",
    "K5 Symbolisch, formal, technisch umgehen": "K5 Work symbolically, formally and technically",
    "K6 Kommunizieren": "K6 Communicate",

    # Mathematics – process competences – descriptions (selection)
    "Knoten für prozessbezogene Kompetenzen des Argumentierens: Aussagen prüfen, logische Schlüsse ziehen, Gegenbeispiele finden und Begründungen formulieren.": (
        "Node for process-related competencies in reasoning: checking statements, drawing logical conclusions, finding counterexamples and formulating justifications."
    ),
    "Die lernende Person kann Aussagen auf Plausibilität testen, Annahmen identifizieren und einfache Begründungen oder Widerlegungen formulieren.": (
        "The learner can test statements for plausibility, identify assumptions and formulate simple justifications or refutations."
    ),
    "Die lernende Person kann aus gegebenen Voraussetzungen korrekte Schlussfolgerungen ableiten, Kettenschlüsse nachvollziehen und Fehlschlüsse erkennen.": (
        "The learner can derive correct conclusions from given premises, follow chains of reasoning and identify fallacies."
    ),
    "Die lernende Person kann Vermutungen durch gezielte Beispiele prüfen, Gegenbeispiele konstruieren und daraus Folgerungen für die ursprüngliche Aussage ziehen.": (
        "The learner can test conjectures using targeted examples, construct counterexamples and draw conclusions for the original statement."
    ),
    "Die lernende Person kann Argumentationsketten gliedern, Beweisschemata (z. B. direkte Beweise, Beweise durch Widerspruch) anwenden und Ergebnisse verständlich präsentieren.": (
        "The learner can structure chains of argument, apply proof schemes (e.g. direct proofs, proofs by contradiction) and present results clearly."
    ),
    "Die lernende Person kann komplexere Beweise konzipieren, Präzision der Sprache reflektieren und Argumente verschiedener Strategien vergleichen.": (
        "The learner can design more complex proofs, reflect on the precision of language and compare arguments based on different strategies."
    ),
    "Prozessknoten für das mathematische Problemlösen: Aufgaben analysieren, Strategien auswählen, Modelle entwickeln und Lösungen reflektieren.": (
        "Process node for mathematical problem solving: analysing tasks, selecting strategies, developing models and reflecting on solutions."
    ),
    "Die lernende Person kann komplexe Problemstellungen in Teilaufgaben zerlegen, relevante Informationen herausarbeiten und Ziele formulieren.": (
        "The learner can break down complex problems into sub-tasks, extract relevant information and formulate goals."
    ),
    "Die lernende Person kann geeignete heuristische Strategien (Vorwärts-/Rückwärtsarbeiten, Extremalprinzip, systematisches Probieren) benennen, begründen und einsetzen.": (
        "The learner can name, justify and use suitable heuristic strategies (working forwards/backwards, extremal principle, systematic trial)."
    ),
    "Die lernende Person kann reale Situationen mathematisieren, Annahmen formulieren und Modelle zur Problemlösung entwickeln oder anpassen.": (
        "The learner can mathematise real situations, formulate assumptions and develop or adapt models to solve problems."
    ),
    "Die lernende Person kann Ergebnisse im Kontext deuten, Plausibilitätsprüfungen durchführen, Modellgrenzen diskutieren und alternative Strategien vorschlagen.": (
        "The learner can interpret results in context, perform plausibility checks, discuss model limitations and propose alternative strategies."
    ),
    "Die lernende Person kann verschiedene Problemlösestrategien hinsichtlich Effizienz und Verlässlichkeit vergleichen, Optimierungen vorschlagen und Entscheidungen begründen.": (
        "The learner can compare different problem-solving strategies in terms of efficiency and reliability, propose optimisations and justify decisions."
    ),
    "Prozessknoten für das Mathematisieren: Sachverhalte in Modelle überführen, mathematisch bearbeiten, Ergebnisse zurückübersetzen und Modelle anpassen.": (
        "Process node for mathematizing: translating situations into models, treating them mathematically, translating results back and adapting models."
    ),
    "Die lernende Person kann Situationstexte analysieren, relevante Größen identifizieren, Annahmen formulieren und vereinfachte Beschreibungen festlegen.": (
        "The learner can analyse situational texts, identify relevant quantities, formulate assumptions and establish simplified descriptions."
    ),
    "Die lernende Person kann passende Variablen wählen, Beziehungen festlegen (z. B. Gleichungen, Funktionen) und ein mathematisches Modell zur Fragestellung aufstellen.": (
        "The learner can choose suitable variables, define relationships (e.g. equations, functions) and set up a mathematical model for the question."
    ),
    "Die lernende Person kann Modelle mithilfe mathematischer Verfahren bearbeiten, Ergebnisse berechnen und Zwischenschritte dokumentieren.": (
        "The learner can process models using mathematical methods, calculate results and document intermediate steps."
    ),
    "Die lernende Person kann Ergebnisse zurückübersetzen, Plausibilität prüfen, Modellgrenzen benennen und Verbesserungen vorschlagen.": (
        "The learner can translate results back, check plausibility, state model limitations and suggest improvements."
    ),
    "Die lernende Person kann unterschiedliche mathematische Modelle für einen Sachverhalt gegenüberstellen, Vor- und Nachteile diskutieren und Entscheidungen begründen.": (
        "The learner can compare different mathematical models for a situation, discuss advantages and disadvantages and justify decisions."
    ),
    "Prozessknoten für das Darstellen mathematischer Objekte: geeignete Repräsentationen wählen, zwischen Darstellungen wechseln und digitale Werkzeuge zielgerichtet einsetzen.": (
        "Process node for representing mathematical objects: choosing suitable representations, switching between them and using digital tools in a targeted way."
    ),
    "Die lernende Person kann entscheiden, welche Darstellungsform (Tabellen, Graphen, Formeln) für eine Fragestellung sinnvoll ist, und diese erzeugen.": (
        "The learner can decide which form of representation (tables, graphs, formulae) is suitable for a question and produce it."
    ),
    "Die lernende Person kann zwischen Tabellen, Graphen und Termdarstellungen wechseln, Informationen übertragen und Zusammenhänge begründen.": (
        "The learner can switch between tables, graphs and algebraic expressions, transfer information and justify relationships."
    ),
    "Die lernende Person kann verschiedene Diagrammtypen deuten, Aussagen kritisch prüfen und Missverständnisse ansprechen.": (
        "The learner can interpret different types of diagrams, critically examine statements and address misunderstandings."
    ),
    "Die lernende Person kann digitale Werkzeuge (CAS, Tabellenkalkulation, Grafiksoftware) gezielt verwenden, Ergebnisse dokumentieren und interpretieren.": (
        "The learner can use digital tools (CAS, spreadsheets, graphing software) in a targeted way, document results and interpret them."
    ),
    "Die lernende Person kann bei anspruchsvolleren Problemstellungen eigenständig Visualisierungen entwerfen, mehrere Darstellungen kombinieren und deren Aussagekraft diskutieren.": (
        "The learner can independently design visualisations for more demanding problems, combine multiple representations and discuss their explanatory power."
    ),
    "Prozessknoten für das sichere Arbeiten mit Symbolen, Formeln und Werkzeugen: Terme manipulieren, Verfahren begründen und digitale Hilfsmittel sachgerecht einsetzen.": (
        "Process node for working confidently with symbols, formulae and tools: manipulating expressions, justifying procedures and using digital aids appropriately."
    ),
    "Die lernende Person kann mathematische Symbole korrekt deuten, Terme umformen und formale Schreibweisen situationsgerecht einsetzen.": (
        "The learner can interpret mathematical symbols correctly, transform expressions and use formal notation appropriately."
    ),
    "Die lernende Person kann Rechenverfahren, Transformationsschritte oder Regeln nachvollziehen, begründen und auf andere Beispiele übertragen.": (
        "The learner can follow computational procedures, transformation steps or rules, justify them and transfer them to other examples."
    ),
    "Die lernende Person kann digitale Werkzeuge oder CAS-Systeme sinnvoll einbinden, Ergebnisse kritisch prüfen und mit handschriftlichen Verfahren kombinieren.": (
        "The learner can meaningfully integrate digital tools or CAS systems, critically examine results and combine them with manual methods."
    ),
    "Die lernende Person kann Rechenergebnisse durch Einsetzen, dimensionsanalysen oder Kontrollrechnungen prüfen und Fehlerquellen analysieren.": (
        "The learner can check numerical results by substitution, dimensional analyses or control calculations and analyse sources of error."
    ),
    "Die lernende Person kann verschiedene symbolische oder technische Verfahren hinsichtlich Aufwand und Genauigkeit vergleichen und begründete Entscheidungen treffen.": (
        "The learner can compare different symbolic or technical procedures in terms of effort and accuracy and make well-founded decisions."
    ),
    "Prozessknoten für mathematische Kommunikation: Ergebnisse adressatengerecht darstellen, argumentativ austauschen und kooperativ arbeiten.": (
        "Process node for mathematical communication: presenting results appropriately for the audience, exchanging arguments and working collaboratively."
    ),
    "Die lernende Person kann mathematische Begriffe korrekt einsetzen, Aussagen strukturiert formulieren und Notationen adressatengerecht erläutern.": (
        "The learner can use mathematical terms correctly, formulate statements in a structured way and explain notation appropriately for the audience."
    ),
    "Die lernende Person kann Lösungen für unterschiedliche Zielgruppen aufbereiten, nachvollziehbar begründen und auf Nachfragen eingehen.": (
        "The learner can prepare solutions for different target groups, justify them in a comprehensible way and respond to questions."
    ),
    "Die lernende Person kann mathematische Argumente austauschen, Kritik aufnehmen, eigene Standpunkte begründen und gemeinsam Ergebnisse entwickeln.": (
        "The learner can exchange mathematical arguments, respond to criticism, justify their own positions and jointly develop results."
    ),
    "Die lernende Person kann mathematische Ergebnisse strukturiert präsentieren, Medien auswählen und Kommunikationsergebnisse reflektieren.": (
        "The learner can present mathematical results in a structured way, select media and reflect on communication outcomes."
    ),
    "Die lernende Person kann komplexe mathematische Inhalte sprachlich präzise formulieren, schriftliche Ausarbeitungen strukturieren und auf Fachsprache achten.": (
        "The learner can formulate complex mathematical content precisely, structure written work and pay attention to technical language."
    ),
    # Language / phonology descriptor (appears frequently in language curricula)
    "Die lernende Person kann Lautung/Töne sicher umsetzen und typische Fehler vermeiden.": (
        "The learner can produce sounds/tones reliably and avoid typical errors."
    ),

    # Math - General and Analysis (Hesse)
    "Symbolsprache sicher verwenden": "Use symbolic language confidently",
    "Formale Verfahren begründen": "Justify formal procedures",
    "Technische Hilfsmittel zielgerichtet einsetzen": "Use technical aids in a targeted way",
    "Ergebnisse formal überprüfen": "Check results formally",
    "Effizienz von Verfahren beurteilen (LK)": "Assess efficiency of procedures (advanced course)",
    "Diskutieren und kooperieren": "Discuss and cooperate",
    "Kommunikation reflektieren und präsentieren": "Reflect on and present communication",
    "Fachsprache präzisieren (LK)": "Refine technical language (advanced course)",
    "Cluster-Knoten für alle Analysis-Themenfelder der Einführungsphase (E.1–E.3).": "Cluster node for all analysis topics in the introductory phase (E.1-E.3).",
    "E-Phase · Analysis-Cluster": "Introduction Phase · Analysis Cluster",
    "Grundbegriffe und Eigenschaften von Funktionen (Definitions-/Wertemenge, Graph, Term), Symmetrien, Verhalten im Unendlichen, Transformationen sowie Modellieren einfacher Situationen mit linearen und quadratischen Funktionen.": "Basic concepts and properties of functions (domain/range, graph, term), symmetries, behavior at infinity, transformations and modelling simple situations with linear and quadratic functions.",
    "E.1 Funktionen und ihre Darstellung": "E.1 Functions and their representation",
    "Ableitung als Grenzprozess mittlerer Änderungsraten, Tangentensteigungen, Ableitung an einer Stelle und als Funktion sowie grundlegende Ableitungsregeln.": "Derivative as a limit process of average rates of change, tangent slopes, derivative at a point and as a function, and basic differentiation rules.",
    "E.2 Einführung des Ableitungsbegriffs": "E.2 Introduction to the concept of derivative",
    "Funktionsuntersuchungen mit Hilfe der Ableitung (Monotonie, Extrem- und Wendestellen) sowie Anwendung auf Extremalprobleme in mathematischen und realen Kontexten.": "Function analysis using the derivative (monotonicity, extrema and inflection points) and application to extremal problems in mathematical and real-world contexts.",
    "E.3 Anwendungen des Ableitungsbegriffs": "E.3 Applications of the concept of derivative",
    "Exponentielle Wachstums- und Zerfallsprozesse, Parameterdeutung, natürliche Exponentialfunktion und grundlegende Exponentialgleichungen.": "Exponential growth and decay processes, parameter interpretation, natural exponential function and basic exponential equations.",
    "E.4 Exponentialfunktionen": "E.4 Exponential functions",
    "Die lernende Person kann Wachstums- und Zerfallsprozesse anhand von Tabellen, Graphen und Kontextbeschreibungen erkennen, typische Merkmale benennen und passende Exponentialfunktionen zuordnen.": "The learner can identify growth and decay processes using tables, graphs and contextual descriptions, name typical characteristics and assign suitable exponential functions.",
    "Exponentialen Wachstum und Zerfall deuten": "Interpret exponential growth and decay",
    "Die lernende Person kann Verdopplungs- und Halbwertszeiten bestimmen, den Einfluss des Parameters a in f(t)=b·a^t beschreiben und unterschiedliche Darstellungsmöglichkeiten (Term, Tabelle, Graph) verknüpfen.": "The learner can determine doubling and half-lives, describe the influence of the parameter a in f(t)=b·a^t and link different representations (term, table, graph).",
    "Parameter exponentieller Funktionen interpretieren": "Interpret parameters of exponential functions",
    "Die lernende Person kann e^x motivieren, wichtige Eigenschaften (Werte, Ableitung, Verhalten im Unendlichen) begründen und e^x zur Modellierung kontinuierlicher Prozesse verwenden.": "The learner can motivate e^x, justify important properties (values, derivative, behavior at infinity) and use e^x to model continuous processes.",
    "Eigenschaften der natürlichen Exponentialfunktion nutzen": "Use properties of the natural exponential function",
    "Die lernende Person kann Gleichungen der Form b·a^x = c mithilfe logarithmischer Umformungen lösen, Ergebnisse überprüfen und in Sachsituationen interpretieren.": "The learner can solve equations of the form b·a^x = c using logarithmic transformations, check results and interpret them in contexts.",
    "Exponentialgleichungen lösen": "Solve exponential equations",
    "Die lernende Person kann Daten zu Wachstum oder Zerfall mit exponentiellen Funktionen modellieren, Parameter aus Messwerten bestimmen und Aussagen zur Zukunftsentwicklung treffen.": "The learner can model growth or decay data with exponential functions, determine parameters from measured values and make predictions about future development.",
    "Exponentielle Modelle anwenden": "Apply exponential models",
    "Sinus- und Kosinusfunktionen als Modelle periodischer Prozesse, Parameterinterpretation, einfache trigonometrische Gleichungen und Ableitungen.": "Sine and cosine functions as models of periodic processes, parameter interpretation, simple trigonometric equations and derivatives.",
    "E.5 Trigonometrische Funktionen": "E.5 Trigonometric functions",
    "Die lernende Person kann Sinus- und Kosinusfunktionen mithilfe von Kreisbewegungen motivieren, Graphen skizzieren und charakteristische Punkte (Amplitude, Nullstellen) benennen.": "The learner can motivate sine and cosine functions using circular movements, sketch graphs and name characteristic points (amplitude, zeros).",
    "Sinus- und Kosinusfunktionen verstehen": "Understand sine and cosine functions",
    "Die lernende Person kann Amplitude, Periodenlänge, Phasenverschiebung und vertikale Verschiebung interpretieren und entsprechende Parameter in Termen y = a·sin(bx+c)+d bestimmen.": "The learner can interpret amplitude, period, phase shift and vertical shift and determine corresponding parameters in terms y = a·sin(bx+c)+d.",
    "Parameter periodischer Funktionen deuten": "Interpret parameters of periodic functions",
    "Die lernende Person kann einfache trigonometrische Gleichungen wie sin(x)=k oder cos(x)=k lösen, allgemeine Lösungsangaben formulieren und Lösungen im Einheitskreis veranschaulichen.": "The learner can solve simple trigonometric equations such as sin(x)=k or cos(x)=k, formulate general solutions and illustrate solutions in the unit circle.",
    "Trigonometrische Gleichungen lösen": "Solve trigonometric equations",
    "Die lernende Person kann mithilfe geometrischer Argumente oder Grenzwertüberlegungen die Ableitungen von sin(x) und cos(x) nachvollziehen und für Untersuchung von trigonometrischen Funktionen einsetzen.": "The learner can use geometric arguments or limit considerations to understand the derivatives of sin(x) and cos(x) and use them to investigate trigonometric functions.",
    "Sinus- und Kosinusfunktionen ableiten": "Differentiate sine and cosine functions",
    "Die lernende Person kann periodische Realsituationen (z. B. Gezeiten, Schwingungen) mit Sinus- oder Kosinusfunktionen beschreiben, Parameter mithilfe von Messdaten bestimmen und Aussagen zum Verlauf treffen.": "The learner can describe periodic real-world situations (e.g. tides, oscillations) using sine or cosine functions, determine parameters using measured data and make statements about the progression.",
    "Periodische Prozesse modellieren": "Model periodic processes",
    "Polynomdivision, Faktorisierung und numerische Näherungsverfahren (z. B. Bisektion, Newton) zur Nullstellensuche sowie Reflexion über deren Einsatz.": "Polynomial division, factorization and numerical approximation methods (e.g. bisection, Newton) for finding zeros as well as reflection on their use.",
    "E.6 Weitere Verfahren zum Lösen von Gleichungen": "E.6 Further methods for solving equations",
    "Die lernende Person kann ganzrationale Funktionen mithilfe von Polynomdivision faktorisieren, Nullstellen aus linearen Faktoren ablesen und Ergebnisse durch Einsetzen überprüfen.": "The learner can factorize polynomial functions using polynomial division, read off zeros from linear factors and check results by substitution.",
    "Polynomdivision zur Nullstellensuche anwenden": "Apply polynomial division to find zeros",
    "Ganzrationale Funktionen faktorisieren und analysieren": "Factorize and analyze polynomial functions",
    "Numerische Verfahren zur Nullstellennäherung nutzen": "Use numerical methods for zero approximation",
    "Konvergenz und Grenzen numerischer Verfahren reflektieren": "Reflect on convergence and limits of numerical methods",
    "E.7 Folgen und Reihen": "E.7 Sequences and series",
    "Arithmetische und geometrische Folgen beschreiben": "Describe arithmetic and geometric sequences",
    "Arithmetische und geometrische Reihen untersuchen": "Investigate arithmetic and geometric series",
    "Konvergenz und Divergenz von Folgen beschreiben": "Describe convergence and divergence of sequences",
    "Grenzwerte von Folgen argumentativ begründen": "Argumentatively justify limits of sequences",
    "Digitale Werkzeuge · Analysis (E)": "Digital Tools · Analysis (Introductory Phase)",
    "Grundlagen der Analysis (E) sicher anwenden": "Apply foundations of analysis (Introductory Phase) securely",
    "Funktionsbegriff und Darstellungen verstehen": "Understand function concept and representations",
    "Funktionswerte berechnen": "Calculate function values",
    "Funktionswerte aus Graphen ablesen": "Read function values from graphs",
    "Parameter linearer Funktionen deuten": "Interpret parameters of linear functions",
    "Lineare Modelle aus Sachsituationen aufstellen": "Set up linear models from real-world situations",
    "Quadratische Funktionen im Graphen deuten": "Interpret quadratic functions in graphs",
    "Mittlere Änderungsrate berechnen und deuten": "Calculate and interpret average rate of change",
    "Momentane Änderungsrate qualitativ verstehen": "Qualitatively understand instantaneous rate of change",
    "Ableitungen elementarer Funktionen berechnen": "Calculate derivatives of elementary functions",
    "Ableitung als Steigung im Punkt deuten": "Interpret derivative as slope at a point",
    "Zusammenhang von f und f′ am Graphen beschreiben": "Describe relationship between f and f' on the graph",
    "Einfache Extremwertprobleme lösen": "Solve simple extremal problems",
    "Digitale Werkzeuge zur Analyse von Funktionen nutzen": "Use digital tools to analyze functions",
    "Funktionen digital darstellen und untersuchen": "Represent and investigate functions digitally",
    "Digitale Werkzeuge für numerische Analysen einsetzen": "Deploy digital tools for numerical analyses",

    # Math - Stochastics (Q3 Hesse)
    "Q3.1 Grundlegende Begriffe und Methoden der Stochastik": "Q3.1 Basic Concepts and Methods of Stochastics",
    "Ereignisse darstellen und Baumdiagramme nutzen": "Represent events and use tree diagrams",
    "Vierfeldertafeln interpretieren": "Interpret four-fold tables",
    "Bedingte Wahrscheinlichkeiten berechnen": "Calculate conditional probabilities",
    "Zählverfahren systematisch anwenden": "Apply counting methods systematically",
    "Diskrete Zufallsexperimente modellieren": "Model discrete random experiments",
    "Hypergeometrische Verteilung anwenden (LK)": "Apply hypergeometric distribution (advanced course)",
    "Q3.2 Wahrscheinlichkeitsverteilungen (Überblick)": "Q3.2 Probability Distributions (Overview)",
    "Zufallsgrößen und Verteilungen verstehen": "Understand random variables and distributions",
    "Histogramme und Kennwerte interpretieren": "Interpret histograms and characteristic values",
    "Bernoulli-Experimente und -Ketten beschreiben": "Describe Bernoulli experiments and chains",
    "Wahrscheinlichkeiten in Bernoulli-Ketten berechnen": "Calculate probabilities in Bernoulli chains",
    "Kenngrößen binomialverteilter Zufallsgrößen": "Characteristic values of binomially distributed random variables",
    "Binomialverteilungen in Kontexten nutzen": "Use binomial distributions in contexts",
    "Normalverteilung als Approximation der Binomialverteilung": "Normal distribution as approximation of binomial distribution",
    "Poisson-Verteilung als Grenzfall der Binomialverteilung": "Poisson distribution as limit case of binomial distribution",
    "Weitere stetige Verteilungen einordnen": "Classify further continuous distributions",
    "Q3.3 Hypothesentests": "Q3.3 Hypothesis Tests",
    "Null- und Alternativhypothesen formulieren": "Formulate null and alternative hypotheses",
    "Testkennzahlen und Testvariablen bestimmen": "Determine test statistics and test variables",
    "Verwerfungsbereich eines Tests bestimmen": "Determine rejection region of a test",
    "Fehler 1. und 2. Art deuten": "Interpret Type 1 and Type 2 errors",
    "Testergebnisse im Kontext interpretieren": "Interpret test results in context",
    "Gütefunktion und Teststärke untersuchen (LK)": "Investigate power function and test power (advanced course)",
    "Tests vergleichen und bewerten (LK)": "Compare and evaluate tests (advanced course)",
    "Q3.4 Prognose- und Konfidenzintervalle": "Q3.4 Prediction and Confidence Intervals",
    "Sigma-Regeln für Verteilungen anwenden": "Apply sigma rules for distributions",
    "Prognoseintervalle für relative Häufigkeiten bestimmen": "Determine prediction intervals for relative frequencies",
    "Konfidenzintervalle für Wahrscheinlichkeiten angeben": "State confidence intervals for probabilities",
    "Prognose- und Konfidenzintervalle im Kontext interpretieren": "Interpret prediction and confidence intervals in context",
    "Konfidenzdiagramme deuten (LK)": "Interpret confidence diagrams (advanced course)",
    "Stichprobenumfang für gewünschte Genauigkeit planen (LK)": "Plan sample size for desired accuracy (advanced course)",
    "Q3.5 Statistik und weitere Wahrscheinlichkeitsverteilungen": "Q3.5 Statistics and Further Probability Distributions",
    "Statistischen Wahrscheinlichkeitsbegriff verstehen": "Understand statistical concept of probability",
    "Lageparameter von Daten bestimmen und deuten": "Determine and interpret location parameters of data",
    "Streuungsmaße von Daten bestimmen und deuten": "Determine and interpret dispersion measures of data",
    "Daten mit Verteilungen vergleichen": "Compare data with distributions",
    "Zufallsexperimente statistisch auswerten": "Evaluate random experiments statistically",
    "Poisson-Verteilung als Modell seltener Ereignisse nutzen (LK)": "Use Poisson distribution as model for rare events (advanced course)",
    "Normalverteilung zur Modellierung von Messdaten verwenden (LK)": "Use normal distribution to model measurement data (advanced course)",
    "Weitere stetige Verteilungen exemplarisch kennenlernen (LK)": "Get to know further continuous distributions exemplarily (advanced course)",
}


def translate_node(node: Dict[str, Any], stats: Dict[str, int]) -> None:
    title = node.get("title", "")
    title_en = node.get("titleEn", "")
    if title and title_en and title == title_en and not title_en.startswith("[TODO]"):
        if title in TRANSLATIONS:
            node["titleEn"] = TRANSLATIONS[title]
            stats["titles_fixed"] += 1

    desc = node.get("description", "")
    desc_en = node.get("descriptionEn", "")
    if desc and desc_en and desc == desc_en and not desc_en.startswith("[TODO]"):
        if desc in TRANSLATIONS:
            node["descriptionEn"] = TRANSLATIONS[desc]
            stats["descriptions_fixed"] += 1

    for key in ("contains", "goals"):
        if isinstance(node.get(key), list):
            for child in node[key]:
                if isinstance(child, dict):
                    translate_node(child, stats)


def process_file(path: str) -> Dict[str, int]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    stats = {"titles_fixed": 0, "descriptions_fixed": 0}
    translate_node(data, stats)

    if stats["titles_fixed"] or stats["descriptions_fixed"]:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    return stats


def main() -> None:
    base_dir = "."
    total_titles = 0
    total_desc = 0
    files_changed = 0

    for root, _, files in os.walk(base_dir):
        for name in files:
            if not name.endswith(".de.json"):
                continue
            full = os.path.join(root, name)
            stats = process_file(full)
            if stats["titles_fixed"] or stats["descriptions_fixed"]:
                files_changed += 1
                total_titles += stats["titles_fixed"]
                total_desc += stats["descriptions_fixed"]
                print(f"{full}: {stats['titles_fixed']} titles, {stats['descriptions_fixed']} descriptions updated.")

    print("\nDone.")
    print(f"Files changed: {files_changed}")
    print(f"Titles fixed: {total_titles}")
    print(f"Descriptions fixed: {total_desc}")


if __name__ == "__main__":
    main()
