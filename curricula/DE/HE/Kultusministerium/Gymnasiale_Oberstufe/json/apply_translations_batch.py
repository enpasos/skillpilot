import json
import os
from typing import Dict, Any

# This script fixes cases where `titleEn` or `descriptionEn`
# are still identical to their German counterpart.
# It only changes entries that are explicitly listed in TRANSLATIONS.

TRANSLATIONS: Dict[str, str] = {
    # History / cross‑subject (examples, extend as needed)
    "Interpretation": "Interpretation",
    "Kontext überblicken": "Overview the context",
    "Quellen untersuchen": "Analyze sources",
    "Begriffe anwenden": "Apply concepts",
    "Historisches Urteil bilden": "Form a historical judgment",
    "Bezüge zur Gegenwart": "Relate to the present",
    "Ergebnisse präsentieren": "Present results",
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
                print(f"{name}: {stats['titles_fixed']} titles, {stats['descriptions_fixed']} descriptions updated.")

    print("\nDone.")
    print(f"Files changed: {files_changed}")
    print(f"Titles fixed: {total_titles}")
    print(f"Descriptions fixed: {total_desc}")


if __name__ == "__main__":
    main()
