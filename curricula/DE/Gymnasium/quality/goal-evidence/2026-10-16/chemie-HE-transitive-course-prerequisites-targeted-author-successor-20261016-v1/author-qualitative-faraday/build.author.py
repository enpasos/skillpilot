#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Own qualitative Faraday content; serializes only this AUTHOR package.

Own learning content is CC-BY-4.0. No independent review is performed here.
"""
from pathlib import Path
import copy
import hashlib
import json
import os

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
REPO = next(p for p in BASE.parents if (p / 'AGENTS.md').is_file())
H = REPO / 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
CANONICAL = H / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SOURCE_PIN = 'd17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f'
FREEZE = ROOT / 'ERROR-MAP.first-full-readonly-current-H-primary-sources-before-authoring.json'
FREEZE_PIN = '2d184a94d67e18baa2dea1f6098a547ec8846c7979410f916ffe944c5c77722f'
assert hashlib.sha256(CANONICAL.read_bytes()).hexdigest() == SOURCE_PIN
assert hashlib.sha256(FREEZE.read_bytes()).hexdigest() == FREEZE_PIN
stock = json.loads(CANONICAL.read_text())
goals = {g['id']: g for g in stock['goals']}
assert len(goals) == 634
ORDINARY_ID = '0e3f849b-133d-57da-882c-0d67c3eb05b8'
MEMORY_ID = '03b08b91-6809-576a-8cf1-4a131caab4e5'
QUANT = 'b8c8f70f-64cb-50b1-970c-e0c4295da3fb'
ELECTROLYSIS = 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef'
MOLAR_MASS = '8a2ad724-df5e-5986-8de9-560ba43caac2'
assert ORDINARY_ID not in goals and MEMORY_ID not in goals
HE_PDF = 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-chemie_0.pdf'
OPENSTAX = 'https://openstax.org/books/chemistry-2e/pages/17-7-electrolysis'
SOURCE_PATH = H / 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json'
DECK_PATH = H / 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json'
DECK = json.loads(DECK_PATH.read_text())
assert len(DECK['cards']) == 11
AUTHOR_ROOT = str(BASE.relative_to(REPO))

def bytes_json(v):
    return (json.dumps(v, ensure_ascii=False, indent=2) + '\n').encode()

def write_json(name, v):
    p = BASE / name
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(p.name + '.tmp')
    tmp.write_bytes(bytes_json(v))
    os.replace(tmp, p)

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

ordinary = {
    'id': ORDINARY_ID,
    'shortKey': 'canonical_chemistry_q3_faraday_laws_qualitative',
    'title': 'Faraday-Gesetze qualitativ erklären',
    'titleEn': "Explain Faraday's laws qualitatively",
    'description': 'Die lernende Person kann die Faraday-Gesetze ohne Berechnungen erklären, indem sie bei vollständig für die betrachtete Elektrodenreaktion genutzter Ladung den proportionalen Zusammenhang zwischen Ladung und Stoff- beziehungsweise Massenumsatz für denselben Stoff begründet und bei verschiedenen Stoffen den Einfluss der Elektronenzahl pro gebildetem Teilchen und der molaren Masse auf den Umsatz unterscheidet.',
    'descriptionEn': "The learner can explain Faraday's laws without numerical calculations by justifying the proportional relationship between charge and amount or mass converted for a fixed substance, and distinguishing how electrons required per product particle and molar mass affect conversion across substances when all transferred charge drives the specified electrode reaction.",
    'type': 'atomic', 'nodeKind': 'tutor', 'weight': 1, 'core': False,
    'contains': [], 'requires': [ELECTROLYSIS, MOLAR_MASS],
    'tags': ['LK', 'canonical', 'SekII'],
    'applicability': {'jurisdiction': ['DE-HE'], 'courseProfile': ['LK']},
    'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB2', 'phase': 'Q3', 'area': 'Redoxgleichgewichte', 'topicCode': 'CANONICAL.CHEMISTRY.Q3.FARADAY_LAWS_QUALITATIVE', 'processCompetencies': ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'], 'guidingIdeas': ['BC_REAKTION']},
    'phase': 'Q3',
    'examples': ['faraday-qualitative-case-1-charge-same-copper-process', 'faraday-qualitative-case-2-electrons-amount-and-mass'],
    'sourceRef': 'Hessen KCGO Chemie, Ausgabe 2024, Q3.3, gedruckte Seite 45: erhöhtes Niveau; Faraday-Gesetze ohne Berechnungen.',
    'extendedData': {
        'provenance': {'sourceLandscapeId': '2f391ba2-ba1e-40e4-a8d2-dff049516c13', 'sourceGoalId': 'he-chem-sekii-q3-3-b10-a01-f814c697', 'sourceSpan': 'Q3.3#B10A01', 'sourcePdfUrl': HE_PDF, 'printedPage': 45, 'pdfPageIndex': 44, 'sourceCourseLevel': 'LK', 'sourceBoundary': 'Qualitative laws only; no HE calculation requirement.', 'legacyExtractionPageNote': 'The older extraction passage says page 47; the currently read official _0.pdf places this item on printed page 45.'},
        'authorDraft': {'status': 'author-draft-pending-two-independent-content-reviews', 'authorRoot': AUTHOR_ROOT, 'errorMapSHA256': FREEZE_PIN, 'sourceCanonicalSHA256': SOURCE_PIN, 'ordinaryBefore': 435, 'ordinaryAfterThisOneAddition': 436, 'role': 'AUTHOR, not independent reviewer', 'assetClass': 'E0/G0', 'observedLearnerExecution': False, 'HumanApproval': False, 'HumanTrial': False},
        'prerequisiteRationale': {ELECTROLYSIS: 'The learner must distinguish the specified electrode reaction, electron transfer and product identity; no thermodynamic redox-equilibrium analysis is required.', MOLAR_MASS: 'The second-law comparison must distinguish amount/particle count from mass, using mass per amount. This supplies its own mol/particle prerequisite transitively.'},
        'scopeBoundary': {'normativeAuthoredTarget': 'DE-HE SekII LK only', 'HEGKTarget': False, 'HEQuantitativeObligation': False, 'otherJurisdictions': 'A qualitative prerequisite to the retained quantitative goal may be authored separately where that goal is a justified target. This HE-LK goal body does not silently expand another jurisdiction or course target.'},
    },
    'resourceLinks': [{'type': 'goal-visualization', 'resourceType': 'image', 'role': 'primary', 'skillpilotId': ORDINARY_ID, 'title': 'Visualisierung: Faraday-Gesetze qualitativ erklären', 'url': f'/assets/goal-visualizations/chemie/{ORDINARY_ID}/{ORDINARY_ID}.png', 'provider': 'Own authored SVG diagram / rendered PNG', 'license': 'CC-BY-4.0', 'reviewStatus': 'needs_review', 'lang': 'de', 'description': 'Vorgeschlagene eigene qualitative Modellgrafik; zwei unabhängige Inhalts-/Bildprüfungen offen, kein beobachteter Versuch.', 'altText': 'Qualitatives Vergleichsmodell ohne Nebenreaktionen: Bei demselben Metallionentyp bewirkt mehr für die Metallabscheidung genutzte Ladung mehr abgeschiedenen Stoff. Bei gleicher Ladung unterscheiden sich Silber- und Kupferabscheidung durch die benötigte Elektronenzahl; für einen Massenvergleich zählt zusätzlich die molare Masse. Keine eingesetzten Strom-, Zeit-, Ladungs- oder Massenwerte.'}],
}

case1_de = '''**Materialfall 1: Kupferüberzug und gezählte Ladung**

Ein fiktiver Betrieb vergleicht drei rechnerfreie Papiermodelle der Kupferabscheidung. Es wird kein Versuch ausgeführt und kein Messwert behauptet. Alle drei verwenden dieselbe Kupfer(II)-Ionenlösung mit ausreichendem Ionenvorrat, dieselbe geeignete Kathode und denselben vollständig funktionierenden Elektrodenprozess:

Cu2+ + 2 e− → Cu.

Für den Modellvergleich fließt die gesamte gezählte Ladung in diese Reaktion; es gibt keine Nebenreaktionen, keinen Stoffverlust und keine Wiederauflösung. Eine gleichartig geeignete Anode schließt den Stromkreis; aus ihrer Natur wird keine zusätzliche Aussage verlangt. Masse meint den tatsächlich abgeschiedenen Kupferstoff, nicht die Masse des anfangs vorhandenen Trägers.

| Modelllauf | Vorgegebene qualitative Information |
| --- | --- |
| A | Ein gleichbleibender Strom fließt für eine kürzere Zeit. |
| B | Derselbe Strom wie in A fließt für eine längere Zeit. |
| C | Ein anderer Stromverlauf als in A; ein idealer Ladungszähler bestätigt dieselbe gesamte Ladung wie bei A. |

**Aufgaben ohne Zahleneinsatz**

1. Ordne A und B nach übertragener Ladung, gebildeter Kupferteilchenzahl, abgeschiedener Stoffmenge und abgeschiedener Kupfermasse. Begründe die gesamte Kette vom Elektronenfluss bis zum Stoffumsatz.
2. Vergleiche C mit A. Erkläre, welche der gerade genannten Größen gleich sind, obwohl sich der Stromverlauf unterscheidet. Formuliere daraus den ersten Faraday-Zusammenhang für denselben Stoff und dieselbe Reaktion.
3. Eine Person behauptet: „Höhere angelegte Spannung bedeutet immer mehr abgeschiedenes Metall.“ Reichen Spannung oder ein sichtbarer Betriebsstrom allein aus? Nenne die notwendige Information und die Grenzen des Modellvergleichs.

**Frischer Transfer**

In einem neuen Lauf zeigt der Ladungszähler wieder dieselbe Gesamtladung wie bei A. Jetzt wird jedoch ein Teil der Elektronen für die gleichzeitig auftretende Wasserstoffbildung verbraucht. Es wird weniger Kupfer abgeschieden. Widerspricht das den Faraday-Gesetzen? Begründe ausschließlich qualitativ und benenne, welche Ladung für die Kupferaussage zählt.

Erwartet wird eine eigene zusammenhängende Begründung. Keine Strom-/Zeit-/Ladungs-/Massenwerte, keine Faraday-Konstante und keine Zahlenverhältnisse sind auszurechnen.'''
case1_en = '''**Material case 1: copper coating and counted charge**

A fictional workshop compares three paper models of copper deposition, without numerical calculation. No experiment is performed or measurement claimed. All use the same copper(II)-ion solution with sufficient ions, the same suitable cathode and the same functioning electrode process:

Cu2+ + 2 e− → Cu.

All counted charge drives this reaction in the model; there are no side reactions, losses or redissolution. An equally suitable anode completes the circuit; no further inference about it is required. Mass means the copper deposited, excluding the original substrate mass.

| Model run | Supplied qualitative information |
| --- | --- |
| A | A steady current flows for a shorter time. |
| B | The same current as A flows for a longer time. |
| C | A different current history from A, but an ideal charge counter confirms the same total charge as A. |

**Tasks without numerical substitution**

1. Compare A/B in transferred charge, number of copper particles, deposited amount and deposited copper mass. Explain the entire chain from electron flow to conversion.
2. Compare C/A. Explain which quantities agree despite the different current histories. State the first Faraday relationship for the same substance and reaction.
3. Someone claims that higher applied voltage always gives more deposited metal. Are voltage or a visible operating current alone sufficient? State the necessary information and model limits.

**Fresh transfer**

A new run has the same total counted charge as A, but some electrons now produce hydrogen in a competing reaction. Less copper is deposited. Does this contradict Faraday's laws? Explain qualitatively which charge matters for the copper claim.

Submit your own connected reasoning. No current/time/charge/mass numbers, Faraday-constant values or numerical ratios are to be calculated.'''
solution1_de = '''B überträgt bei gleichem Strom und längerer Laufzeit mehr Ladung als A. Mehr für den festgelegten Kupferprozess übertragene Ladung bedeutet mehr Elektronen für die Reduktion. Da pro Kupferteilchen dieselbe Elektronenzahl benötigt wird, entstehen mehr Kupferteilchen und eine größere Kupferstoffmenge. Für denselben Stoff mit unveränderter molarer Masse ist auch die abgeschiedene Masse größer. Im idealen Vergleich sind diese Größen proportional, nicht bloß zufällig gemeinsam größer.

C und A übertragen laut Material gleich viel Ladung. Bei derselben Reaktion und vollständiger Nutzung für die Kupferabscheidung entstehen daher gleich viele Kupferteilchen, gleiche Stoffmenge und gleiche Kupfermasse. Ein anderer Stromverlauf ändert dieses Ergebnis nicht, wenn die gesamte relevante Ladung gleich bleibt. Der erste Zusammenhang lautet: Bei derselben Elektrodenreaktion und gleicher Stromausbeute ist der umgesetzte Stoff beziehungsweise seine Masse proportional zur dafür durchgesetzten Ladung.

Aus Spannung allein folgt keine bestimmte übertragene Ladung; der Stromverlauf, die Laufzeit und die Reaktionsbedingungen sind entscheidend. Auch der bloße Nachweis eines Stroms nennt noch keine Gesamtladung. Ohne festgelegte Reaktion/Stromausbeute lässt sich nicht jede Gesamtladung als Metallladung behandeln. Eine höhere Spannung kann unter realen Bedingungen Nebenreaktionen oder Verluste verändern.

Transfer: Kein Widerspruch. Für Kupfer zählt der Ladungsanteil, der tatsächlich den Kupfer(II)-Ionen Elektronen liefert. Wird bei gleicher Gesamtladung ein Teil für Wasserstoff verwendet, ist dieser Anteil kleiner und es entsteht weniger Kupfer. Der Vergleich mit vollständiger Kupfer-Stromausbeute ist dann nicht mehr derselbe. Es ist weder ein Zahlenanteil zu schätzen noch die Faraday-Beziehung zu widerlegen. Gleichwertige fachlich korrekte Darstellungen sind anzuerkennen.'''
solution1_en = '''B transfers more charge than A because the same current flows longer. More charge assigned to the fixed copper reaction supplies more reduction electrons. Because each copper particle requires the same electron count, more copper particles and a greater amount form. For the same substance with unchanged molar mass, deposited mass is also greater. These quantities are proportional in the stated ideal model, rather than merely coincidentally increasing.

C and A have the same charge by stipulation. With the same reaction and complete use for copper deposition, they produce the same particle count, amount and copper mass despite different current histories. The first relationship is that conversion, and mass for a fixed substance, is proportional to the charge used for the same electrode reaction at unchanged current efficiency.

Voltage alone specifies no total transferred charge; current history, duration and reaction conditions matter. Merely detecting current also gives no total charge. Without fixed reaction/current efficiency not all measured charge can be treated as metal-deposition charge. Higher voltage can alter side reactions or losses in real systems.

Transfer: no contradiction. Copper depends on the charge fraction actually delivering electrons to copper(II) ions. If some of the same total charge makes hydrogen, the copper fraction is smaller and less copper forms. The complete-copper-current-efficiency comparison no longer applies unchanged. No numerical fraction should be guessed. Accept equivalent scientifically correct explanations.'''

case2_de = '''**Materialfall 2: Gleiche Ladung, unterschiedliche Metallabscheidung**

Drei voneinander getrennte ideale Papiermodelle scheiden Silber, Kupfer oder Nickel ab. Für jeden jeweiligen Stoff werden ein geeignetes Elektrolyt-/Elektrodensystem und ausreichender Ionenvorrat vorausgesetzt. In jedem Modell wird genau dieselbe Gesamtladung übertragen und vollständig für die angegebene Metallabscheidung genutzt; keine Nebenreaktionen oder Verluste. Die Stromverläufe brauchen nicht gleich zu sein. Es werden keine realen Metallbäder hergestellt und keine Messwerte behauptet.

| Produkt | Vorgegebene Elektrodenreaktion |
| --- | --- |
| Silber | Ag+ + e− → Ag |
| Kupfer | Cu2+ + 2 e− → Cu |
| Nickel | Ni2+ + 2 e− → Ni |

Zusätzlich ist nur diese qualitative Masseninformation gegeben: Ein Silberatom ist schwerer als ein Kupferatom; ein Kupferatom ist schwerer als ein Nickelatom. Entsprechend ist die molare Masse von Silber größer als die von Kupfer und diese größer als die von Nickel. Es werden keine Atommassenwerte oder Stoffmengenwerte benötigt.

**Aufgaben ohne Zahleneinsatz**

1. Vergleiche die abgeschiedenen Teilchenzahlen und Stoffmengen von Kupfer und Nickel. Vergleiche anschließend ihre Massen und begründe, weshalb die Aussagen verschieden ausfallen.
2. Vergleiche Silber mit Kupfer hinsichtlich benötigter Elektronen je Produktteilchen, Teilchenzahl/Stoffmenge bei gleicher Ladung und abgeschiedener Masse. Nutze beide voneinander getrennten Begründungen: Elektronenbedarf und molare Masse.
3. Formuliere den zweiten Faraday-Zusammenhang in Worten: Wie wirken sich bei gleicher für die Reaktion genutzter Ladung der Elektronenbedarf pro Produktteilchen und die molare Masse auf den Stoff- und Massenumsatz aus? Erkläre, warum aus der Teilchenladungszahl allein keine allgemeine Massenrangfolge für beliebige Metalle folgt.

**Frischer Transfer**

Ein neues ideales Zinkbad reduziert Zn2+ unter derselben für die Metallreaktion genutzten Ladung wie das Kupfermodell. Ein Zinkatom sei laut Material etwas schwerer als ein Kupferatom. Beurteile die Behauptung: „Gleiche Ionenladung und gleiche elektrische Ladung bedeuten gleiche Stoffmenge und gleiche Metallmasse.“ Begründe beide Teile getrennt. Berechne keine Massen, Stoffmengen oder Zahlenverhältnisse.'''
case2_en = '''**Material case 2: equal charge, different metal deposition**

Three separate ideal paper models deposit silver, copper or nickel. Each uses a suitable electrolyte/electrode system and sufficient ions. Exactly the same total charge is transferred and entirely used for the stated metal reaction, with no side reactions or losses. Current histories need not match. No real baths are prepared and no measurements claimed.

| Product | Supplied electrode reaction |
| --- | --- |
| Silver | Ag+ + e− → Ag |
| Copper | Cu2+ + 2 e− → Cu |
| Nickel | Ni2+ + 2 e− → Ni |

Only this qualitative mass information is supplied: a silver atom is heavier than a copper atom, and a copper atom heavier than a nickel atom. Their molar masses follow the same order. No atomic-mass or amount values are needed.

**Tasks without numerical substitution**

1. Compare deposited copper/nickel particle counts and amounts, then their masses. Explain why the two comparisons differ.
2. Compare silver/copper electron requirements per product particle, particle counts/amounts at equal charge and deposited masses. Use the separate reasons of electron requirement and molar mass.
3. State the second Faraday relationship in words: at equal charge used for the reaction, how do electrons needed per product particle and molar mass affect amount and mass converted? Explain why ion charge alone gives no general mass ranking across arbitrary metals.

**Fresh transfer**

A new ideal zinc bath reduces Zn2+ using the same reaction-specific charge as the copper model. A zinc atom is supplied as slightly heavier than a copper atom. Assess: “Equal ion charge and equal electrical charge mean the same amount and the same metal mass.” Justify both parts separately, without calculating masses, amounts or numerical ratios.'''
solution2_de = '''Kupfer(II)- und Nickel(II)-Ionen benötigen je gebildetem Metallteilchen gleich viele Elektronen. Gleiche übertragene Ladung liefert bei vollständiger Stromausbeute gleich viele Elektronen für den jeweiligen Prozess. Daher entstehen gleiche Teilchenzahlen und gleiche Stoffmengen Kupfer beziehungsweise Nickel. Gleiche Stoffmenge bedeutet bei verschiedenen Stoffen jedoch nicht gleiche Masse: Wegen der größeren molaren Masse ist die Kupfermasse größer.

Für jedes Silberteilchen ist weniger Elektronenübertragung nötig als für jedes Kupferteilchen. Aus derselben Elektronenmenge können deshalb mehr Silberteilchen entstehen; die Silberstoffmenge ist größer. Zusätzlich ist laut Material jedes Silberatom schwerer als jedes Kupferatom. In genau diesem Vergleich ist daher auch die Silbermasse größer. Eine ausgerechnete Verhältniszahl ist weder nötig noch gefordert.

Zweiter Zusammenhang: Gleiche Ladung stellt dieselbe Elektronenmenge bereit. Je mehr Elektronen ein Produktteilchen benötigt, desto weniger Produktteilchen und desto weniger Stoffmenge können daraus entstehen. Bei gleichem Elektronenbedarf führt eine größere molare Masse zu größerer Produktmasse. Über verschiedene Stoffe hängt die Masse deshalb gemeinsam von Masse je Stoffmenge und Elektronenbedarf ab: Größere molare Masse erhöht die Masse je gegebener Ladung; größerer Elektronenbedarf vermindert sie, wenn die jeweils andere Größe gleich bleibt. Ohne deren gemeinsamen Vergleich gibt die Ionenladungszahl allein keine allgemeine Massenrangfolge.

Transfer: Der Stoffmengenteil stimmt im idealen Vergleich, weil Zn2+ und Cu2+ je Produktteilchen den gleichen Elektronenbedarf haben und die relevante Ladung gleich ist. Der Massenteil ist falsch: Bei gleicher Teilchenzahl/Stoffmenge ist Zink laut Material wegen seiner größeren molaren Masse schwerer. Gleichheit von Stoffmenge und Gleichheit von Masse sind zu trennen. Auch hier gelten die vorgegebenen Reaktions- und Stromausbeutegrenzen; keine tatsächliche Versuchsdurchführung wird nachgewiesen.'''
solution2_en = '''Copper(II) and nickel(II) require the same number of electrons per product particle. Equal transferred charge supplies equal electrons to each specified reaction at complete current efficiency. Thus equal particle counts and equal amounts of copper/nickel form. Equal amounts of different substances do not imply equal masses: copper's larger molar mass gives the larger deposited mass.

Each silver particle requires fewer electrons than each copper particle, so the same electron supply makes more silver particles and a greater silver amount. Each silver atom is also supplied as heavier than each copper atom; in this particular comparison the silver mass is therefore greater as well. No numerical ratio is required.

Second relationship: equal charge supplies the same electron amount. More electrons required per product particle means fewer particles and a smaller product amount. At equal electron requirement, larger molar mass gives greater product mass. Across substances, mass therefore depends jointly on mass per amount and electron requirement: larger molar mass raises mass per given charge, while greater electron requirement lowers it with the other factor fixed. Ion charge alone does not establish a general mass ranking.

Transfer: the amount part is correct in the ideal model because Zn2+/Cu2+ have the same electron requirement and reaction-specific charge. The mass part is false: at equal particle count/amount, the supplied larger zinc molar mass gives greater zinc mass. Keep amount equality separate from mass equality. Reaction/current-efficiency limits still apply; no actual execution is demonstrated.'''

criteria1 = [
    ('charge_and_electrons', 'Bei gleichem Strom/längerer Zeit mehr Ladung und mehr für denselben Prozess übertragene Elektronen erklären.', 'Explain greater charge and more electrons for the same reaction at equal current and longer duration.'),
    ('first_law_amount_mass', 'Fester Elektronenbedarf pro Kupferteilchen verbindet Ladung proportional mit Teilchenzahl, Stoffmenge und Masse desselben Stoffs.', 'Connect fixed electrons per copper particle to charge-proportional particle count, amount and mass for that substance.'),
    ('same_charge_different_history', 'Gleiche relevante Gesamtladung bedeutet im unveränderten Idealprozess gleichen Kupferumsatz trotz anderem Stromverlauf.', 'Same reaction-specific charge gives the same ideal copper conversion despite a different current history.'),
    ('voltage_is_insufficient', 'Spannung oder bloß vorhandenen Strom nicht mit Gesamtladung gleichsetzen; Reaktion und Stromausbeute begrenzen.', 'Do not equate voltage or merely present current with total charge; bound the reaction/current efficiency.'),
    ('fresh_side_reaction_transfer', 'Im Wasserstoff-Transfer die tatsächlich dem Kupferprozess dienende Ladung von der Gesamtladung trennen; weniger Kupfer ist kein Gesetzeswiderspruch.', 'In the hydrogen transfer distinguish copper-reaction charge from total charge; less copper does not contradict the law.'),
]
criteria2 = [
    ('same_electron_need_same_amount', 'Cu/Ni bei gleichem Elektronenbedarf und gleicher Ladung gleiche Teilchenzahl/Stoffmenge begründen.', 'Explain equal Cu/Ni particle counts/amounts at equal charge and electron requirements.'),
    ('molar_mass_distinction', 'Bei gleicher Cu/Ni-Stoffmenge unterschiedliche Masse mit der molaren Masse begründen.', 'Explain different Cu/Ni masses at equal amounts using molar mass.'),
    ('different_electron_need', 'Ag/Cu aus unterschiedlichem Elektronenbedarf qualitativ nach Teilchenzahl/Stoffmenge vergleichen und Material-Massenordnung getrennt verwenden.', 'Compare Ag/Cu counts/amounts from electron requirements and apply the supplied mass order separately.'),
    ('second_law_joint_factors', 'Gemeinsamen Einfluss von Elektronenbedarf und molarer Masse auf Masse pro relevanter Ladung erklären; keine alleinige Ionenladungs-Massenregel.', 'Explain the joint electron-requirement/molar-mass influence on mass per reaction charge; reject an ion-charge-only mass rule.'),
    ('fresh_zinc_transfer', 'Zn/Cu: gleiche Stoffmenge, aber größere Zinkmasse aus vorgegebener molarer Masse korrekt getrennt begründen.', 'For Zn/Cu justify equal amount but greater zinc mass using the supplied molar-mass order.'),
]
cases = []
for cid, de, en, sol_de, sol_en, criteria in [
    ('faraday-qualitative-case-1-charge-same-copper-process', case1_de, case1_en, solution1_de, solution1_en, criteria1),
    ('faraday-qualitative-case-2-electrons-amount-and-mass', case2_de, case2_en, solution2_de, solution2_en, criteria2),
]:
    cases.append({'id': cid, 'goalId': ORDINARY_ID, 'role': 'Own AUTHOR qualitative material case; no independent review', 'status': 'draft', 'materialAndTaskDe': de, 'materialAndTaskEn': en, 'solutionDe': sol_de, 'solutionEn': sol_en, 'rubric': {'purpose': 'Author evidence-aspect map, not a released exam or observed learner score.', 'maxPoints': 10, 'criteria': [{'id': c, 'maxPoints': 2, 'criterionDe': a, 'criterionEn': b} for c,a,b in criteria], 'completionRuleDe': 'Für Kompetenznachweis sind beide Faraday-Zusammenhänge, die Trennung von Stoffmenge/Masse und der frische Modellgrenzen-Transfer fachlich zu zeigen; bloßer Kartenabruf oder ein richtiger Slogan reicht nicht. Nicht die Anzahl weiterer Aufgaben, sondern fehlende Aspekte prüfen.', 'completionRuleEn': 'Competence evidence must establish both Faraday relationships, amount/mass distinction and fresh model-limit transfer. Card recall or a correct slogan alone is insufficient; assess missing aspects, not an extra-task quota.'}, 'noNumericalSubstitution': True, 'chemicalStoichiometricCoefficientsAreNotNumericalExercises': True, 'conditions': ['fixed_specified_electrode_reactions', 'suitable_electrodes_and_electrolytes', 'sufficient_ions', 'all_relevant_charge_used_for_specified_reaction', 'no_side_reactions_in_base_model', 'no_actual_experiment_claim'], 'assetClass': 'E0/G0', 'HumanApproval': False, 'HumanTrial': False})

new_cards = [
    {'id': 'chem_eq_q3_012', 'front': 'Erstes Faraday-Gesetz: Wie hängen bei derselben Elektrodenreaktion Ladung und Stoff-/Massenumsatz zusammen?', 'back': 'Bei unveränderter Elektrodenreaktion und gleicher Stromausbeute ist der umgesetzte Stoff proportional zur dafür durchgesetzten Ladung. Für denselben Stoff gilt das auch für seine Masse. Mehr Gesamtladung allein genügt bei wechselnden Nebenreaktionen nicht.', 'category': DECK['title'], 'tags': ['goal:' + ORDINARY_ID]},
    {'id': 'chem_eq_q3_013', 'front': 'Zweites Faraday-Gesetz: Was bestimmt bei gleicher für die Reaktion genutzter Ladung Stoffmenge und Masse verschiedener Produkte?', 'back': 'Gleiche Ladung liefert die gleiche Elektronenmenge. Je mehr Elektronen pro Produktteilchen benötigt werden, desto weniger Teilchen und Stoffmenge entstehen. Die Produktmasse hängt zusätzlich von der molaren Masse ab: gleiche Stoffmenge verschiedener Stoffe bedeutet nicht gleiche Masse. Die Reaktion und Stromausbeute müssen festliegen.', 'category': DECK['title'], 'tags': ['goal:' + ORDINARY_ID]},
]
assert not {c['id'] for c in new_cards} & {c['id'] for c in DECK['cards']}
new_deck = copy.deepcopy(DECK)
new_deck['cards'].extend(new_cards)
memory = {
    'id': MEMORY_ID, 'shortKey': 'canonical_chemistry_compact_recall_faraday_qualitative',
    'title': 'Qualitative Faraday-Zusammenhänge abrufen', 'titleEn': 'Recall qualitative Faraday relationships',
    'description': 'Die lernende Person kann die bereits erlernten qualitativen Faraday-Zusammenhänge zwischen relevanter Ladung, Elektronenbedarf, Stoffmenge und Masse sowie ihre Beschränkung auf die festgelegte Elektrodenreaktion und Stromausbeute mithilfe der zugehörigen Lernkarten sicher abrufen.',
    'descriptionEn': 'The learner can reliably recall the previously taught qualitative Faraday relationships between reaction-specific charge, electron requirement, amount and mass, including their limitation to the specified electrode reaction and current efficiency, using the associated flashcards.',
    'weight': 0.5, 'type': 'atomic', 'nodeKind': 'memory', 'contains': [], 'requires': [ORDINARY_ID],
    'tags': ['memorization', 'srs-deck:' + DECK['deckId'], 'goal:' + ORDINARY_ID],
    'applicability': {'jurisdiction': ['DE-HE'], 'courseProfile': ['LK']},
    'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB1', 'phase': 'Q3', 'area': 'Kompakte Chemie-Abrufroutinen', 'guidingIdeas': ['BC_REAKTION'], 'processCompetencies': []},
    'extendedData': {'vocabularySource': '/data/' + DECK_PATH.name, 'memorySupportSelection': {'authorRoot': AUTHOR_ROOT, 'status': 'author-proposal-pending-independent-M-content-origin-selection-and-visibility-review', 'selectedCardIds': [c['id'] for c in new_cards], 'originGoalIds': [ORDINARY_ID], 'role': 'Recall of previously taught compact verbal laws only; no numerical formula/value obligation, no ordinary mastery or practical-performance certification.', 'selectionSemantics': 'Only the goal: tag remains after actual getSrsFilterTags; FlashcardDrill uses OR-intersection with card.tags. No GK/LK selector is added, so legacy quantitative card008 cannot match.'}},
}

ordinary_nodes = [g for g in stock['goals'] if g.get('type') == 'atomic' and not g.get('contains') and not g.get('examData') and g.get('nodeKind') != 'memory' and g.get('semanticKind') != 'orientation' and 'memorization' not in g.get('tags', [])]
assert len(ordinary_nodes) == 435
keywords = ['faraday', 'elektroly', 'ladungsmenge', 'elektronenübertragung', 'elektronenanzahl', 'elektronenzahl', 'stoffumsatz', 'stoffumsetz', 'stromstärke', 'stromausbeute', 'abscheid', 'elektrodenreaktion']
plausible = [g for g in ordinary_nodes if any(k in (g.get('title', '') + ' ' + g.get('description', '')).lower() for k in keywords)]
audit = {'role': 'AUTHOR carrier diagnosis, not independent review', 'actualCanonicalSHA256': SOURCE_PIN, 'actualWholeGoals': 634, 'actualOrdinaryGoals': 435, 'newOrdinaryAfterAddition': 436, 'screenedOrdinaryIds': [g['id'] for g in ordinary_nodes], 'screenMethod': 'Search current titles/descriptions for charge/electron/electrolysis/conversion/deposition/current terms, then read the entire plausible competence wording. The quantitative Faraday goal contains a related explanation component but is not a qualitative-only HE carrier.', 'plausibleCandidates': [{'id':g['id'], 'title':g['title'], 'description':g['description'], 'descriptionEn':g.get('descriptionEn')} for g in plausible], 'carrierDecision': 'No current narrowly bounded qualitative-only complete first/second-Faraday carrier. b8c8f70f imposes calculations; fd7977bf/70b12d1c explain electrolysis/products, not charge-to-conversion with molar-mass/electron-count distinction; 0c9fe376 explains thermodynamic direction/equilibrium.', 'existingMemoryCandidate': {'id':'ddde45b7-a3de-585b-b41e-3ae841349c87', 'selectedCardIds':['chem_eq_q3_008'], 'requires':[QUANT], 'actualJurisdictions':['DE-BY','DE-HB','DE-NI'], 'decision':'Do not reuse for HE qualitative obligation; it selects Q=It=zFn and numerical F, requires the quantitative goal, and is not HE-scoped.'}, 'protectedOld13PackageUnchanged':True, 'HumanApproval':False, 'HumanTrial':False}

write_json('ordinary-goal.author-draft.json', ordinary)
write_json('two-whole-qualitative-material-cases.author-draft.json', cases)
write_json('memory-unit.author-draft.json', memory)
write_json('memory-two-cards.author-draft.json', {'deckId': DECK['deckId'], 'cards': new_cards, 'status': 'author-draft'})
write_json('candidate-deck/' + DECK_PATH.name, new_deck)
write_json('memory-decision.author-proposal.json', {'role':'AUTHOR proposed M decision; not a review record or approval', 'goalId':ORDINARY_ID, 'proposedStatus':'memory_required', 'memoryUseful':True, 'memoryGoalIds':[MEMORY_ID], 'deckIds':[DECK['deckId']], 'selectedCardIds':[c['id'] for c in new_cards], 'reasonDe':'Die beiden qualitativen Gesetzesaussagen sind kurze dauerhaft verfügbare Grundlagen für neue Deutungsfälle. Zwei reinverbale Karten sichern nur diesen Abruf; Anwendung, Elektronenbilanz, Stoff-/Massenunterscheidung und Grenzen bleiben in den Materialfällen zu begründen. Die vorhandene quantitative Formelkarte darf nicht als neue HE-Rechenpflicht übernommen werden.', 'actualSelectionEvidencePath':AUTHOR_ROOT + '/CHECK.actual-H-SRS-two-qualitative-cards.author.json', 'independentMReview':'pending', 'HumanApproval':False, 'HumanTrial':False})
write_json('carrier-audit.current435.author.json', audit)
write_json('quantitative-prerequisite-addition.author-proposal.json', {'role':'AUTHOR scientific edge proposal only; no b8 whole-goal mutation here', 'goalId':QUANT, 'beforeRequires':goals[QUANT]['requires'], 'addQualitativePrerequisiteId':ORDINARY_ID, 'reason':'Full Faraday calculation requires qualitative charge/electron/stoichiometry understanding; new qualitative competence is a true foundation. Any separate removal/replacement of 0c9 or concentration prerequisites belongs to the parent frozen edge map.', 'scopeBoundary':'Do not include quantitative b8 as a HE GK/LK target on the basis of this qualitative HE-LK source item. Any other-country qualitative placement must be explicit and justified where quantitative b8 is retained.', 'status':'author-proposal-pending-independent-graph-and-course-review'})
write_json('inputs/current-three-prerequisite-and-quantitative-wholegoals.json', [goals[k] for k in [ELECTROLYSIS,MOLAR_MASS,QUANT]])
write_json('inputs/existing-quantitative-faraday-memory-unit.json', goals['ddde45b7-a3de-585b-b41e-3ae841349c87'])
write_json('inputs/existing-q3-deck.json', DECK)
write_json('source-and-scope.author.json', {'role':'AUTHOR source analysis; no source review approval', 'errorMapSHA256':FREEZE_PIN, 'actualCanonicalSHA256':SOURCE_PIN, 'officialCurriculum':{'url':HE_PDF,'edition':'Ausgabe 2024','printedPage':45,'pdfPageIndex':44,'topic':'Q3.3','courseLevel':'LK','exactShortQuote':'Faraday-Gesetze (ohne Berechnungen)','sourceGoalId':'he-chem-sekii-q3-3-b10-a01-f814c697','sourceSpan':'Q3.3#B10A01'}, 'scientificReference':{'url':OPENSTAX,'section':'17.7, Quantitative Aspects of Electrolysis','usedFor':'Scientific relations between charge, electron amount, stoichiometric electron requirement and product amount; own qualitative tasks, no copied OpenStax numerical examples or artwork.'}, 'sourceExtraction':{'path':str(SOURCE_PATH.relative_to(H)),'sha256':sha(SOURCE_PATH),'legacyPassagePage':47,'currentOfficialPrintedPage':45}, 'scopePolicy':{'newNormativeTarget':'HE SekII LK qualitative only','HEGKFaradayTarget':False,'HELKQuantitativeTarget':False,'otherCountryQuantitativeFoundation':'Separately authored explicit prerequisite/placement proposal, not inferred HE normativity.'}, 'HumanApproval':False,'HumanTrial':False})
assert sha(CANONICAL) == SOURCE_PIN
assert sha(FREEZE) == FREEZE_PIN
print(json.dumps({'ordinaryId':ORDINARY_ID,'memoryId':MEMORY_ID,'ordinarySHA256':hashlib.sha256(bytes_json(ordinary)).hexdigest(),'memorySHA256':hashlib.sha256(bytes_json(memory)).hexdigest(),'cases':len(cases),'newCards':[c['id'] for c in new_cards],'inputWholeGoals':len(goals),'ordinary435Before':len(ordinary_nodes),'ordinary436After':len(ordinary_nodes)+1},ensure_ascii=False,indent=2))
