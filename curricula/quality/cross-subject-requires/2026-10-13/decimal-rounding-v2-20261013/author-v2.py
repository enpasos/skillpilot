"""Apache-2.0 technical writer. Own authored didactic payloads: CC-BY-4.0.

Write inert, independently reviewable candidates exclusively. Never mutate sources.
"""
import copy
import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

BASE = Path("tmp/cross-subject-requires/decimal-rounding-v2-20261013")
MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced"
GOAL = "077d5e2f-27f2-5215-9d48-fe002cf1c663"
REP = "2f565855-bcd6-4da5-bc80-4b72a2d93d50"
NAT = "fe07241a-b779-5f35-a82d-7aa51ae74f42"
ORIENTATION = "65365dce-f33f-49d8-9516-42f75883aa86"
AUTHOR = "Codex GPT-6.1 Sol Ultra / requires_canonical_author"
NOW = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load(path):
    return json.loads(Path(path).read_text())


def digest(path):
    return "sha256:" + hashlib.sha256(Path(path).read_bytes()).hexdigest()


def dump(name, obj):
    path = BASE / name
    with path.open("x") as stream:
        json.dump(obj, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    assert load(path) == obj
    return {"path": str(path), "sha256": digest(path)}


v1_path = "tmp/cross-subject-requires/decimal-rounding.math-goal.candidate.json"
root_path = "tmp/cross-subject-requires/decimal-rounding.root-independent-source-review-v1.json"
v1 = load(v1_path)
math_path = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"
math = load(math_path)
goals = {goal["id"]: goal for goal in math["goals"]}
assert GOAL not in goals
assert str(uuid.uuid5(uuid.UUID(MATH), v1["proposedGoal"]["shortKey"])) == GOAL

goal = copy.deepcopy(v1["proposedGoal"])
goal.update({
    "title": "Nichtnegative Dezimalzahlen auf eine vorgegebene Stelle runden",
    "titleEn": "Round nonnegative decimals to a specified place",
    "description": "Die lernende Person kann nichtnegative, endliche Dezimalzahlen nach einer angegebenen Rundungsregel auf eine vorgegebene Stellenwertstelle runden, die Wahl mithilfe der Stellenwerte oder bereitgestellter Nachbarwerte begründen und das Ergebnis vom bloßen Abschneiden unterscheiden.",
    "descriptionEn": "The learner can round nonnegative, terminating decimals to a specified place using a stated rounding rule, justify the choice using place values or supplied neighboring values, and distinguish the result from simple truncation.",
    "requires": [REP, ORIENTATION],
    "semanticKind": "curricularAtomic",
    "semanticAtomic": True,
    "resourceLinks": [],
})
goal["dimensionTags"]["processCompetencies"] = ["K3.1", "K4.1"]

profile = {
    "archetype": "procedure",
    "expectations": [
        {
            "id": "requested-place-and-value",
            "essentialUnderstandingDe": "Die vorgegebene Stelle legt fest, in welchen Stellenwertschritten das gerundete Ergebnis liegt. Nullen zwischen Komma und erster von null verschiedener Ziffer ändern diese Zuordnung nicht; die Zahl der Nachkommastellen ist von der Zahl signifikanter Stellen zu unterscheiden.",
            "essentialUnderstandingEn": "The specified place determines the place-value steps of the rounded result. Zeros between the decimal point and the first nonzero digit do not change that correspondence; decimal places differ from significant figures.",
            "observablePerformanceDe": "Die lernende Person benennt bei einer neuen nichtnegativen endlichen Dezimalzahl die vorgegebene Stelle, ordnet die beibehaltenen und folgenden Ziffern richtig zu und notiert ein Ergebnis auf dieser Stellenwertstufe, auch bei kleinen Zahlen mit inneren Nullen.",
            "observablePerformanceEn": "For a fresh nonnegative terminating decimal, the learner identifies the specified place, correctly locates retained and following digits, and writes a result at that place-value resolution, including small numbers with internal zeros.",
        },
        {
            "id": "round-and-justify-under-given-rule",
            "essentialUnderstandingDe": "Runden wählt einen nahen Wert auf der vorgegebenen Stellenwertstufe. Bei der hier jeweils angegebenen Regel wird der nähere Nachbar gewählt; bei genau gleichem Abstand wird der weiter von null entfernte Nachbar gewählt. Das ist eine ausdrücklich gegebene Konvention, keine Aussage, dass es keine anderen Rundungsregeln gibt.",
            "essentialUnderstandingEn": "Rounding selects a nearby value at the specified place-value resolution. The rule supplied in these cases selects the nearer neighbor; at an exact tie it selects the neighbor farther from zero. This is an explicitly given convention, not a claim that other rounding rules do not exist.",
            "observablePerformanceDe": "Die lernende Person rundet selbstständig nach der angegebenen Regel und begründet die Wahl anhand der Stellenwerte und entscheidenden Folgeziffer oder anhand bereitgestellter Nachbarwerte und Abstände. Sie führt einen nötigen Übertrag über mehrere Neunen bis in den ganzzahligen Teil aus. Eine eigenständige Dezimalsubtraktion ist für die Begründung nicht erforderlich.",
            "observablePerformanceEn": "The learner independently rounds using the stated rule and justifies the choice through place values and the decisive following digit, or through supplied neighbors and distances. The learner carries across several nines into the integer part when necessary. The justification does not require independent decimal subtraction.",
        },
        {
            "id": "distinguish-rounding-from-truncation",
            "essentialUnderstandingDe": "Abschneiden entfernt die Ziffern hinter der Zielstelle; Runden kann den beibehaltenen Teil ändern. Für dieselbe nichtnegative Zahl und Zielstelle können beide Verfahren verschiedene Werte liefern. Der gerundete Wert gibt die entfernten Ziffern nicht wieder.",
            "essentialUnderstandingEn": "Truncation removes the digits after the target place; rounding can change the retained part. For the same nonnegative number and target place, the procedures can produce different values. The rounded value does not preserve the removed digits.",
            "observablePerformanceDe": "Die lernende Person vergleicht in einem frischen Fall das Rundungsergebnis mit dem durch Abschneiden entstehenden Wert und erklärt mit einer zulässigen Stellenwert- oder Nachbarbegründung, warum die vorgegebene Rundungsregel zu einem anderen Ergebnis führt.",
            "observablePerformanceEn": "In a fresh case, the learner compares the rounded result with the truncated value and uses a valid place-value or neighbor explanation to show why the supplied rounding rule yields a different result.",
        },
    ],
    "coverageExpectations": {
        "requiredExpectationIds": ["requested-place-and-value", "round-and-justify-under-given-rule", "distinguish-rounding-from-truncation"],
        "alternativeExpectationGroups": [],
        "minimumIndependentDemonstrations": 2,
        "freshVariationRequired": True,
        "independentTransferRequired": True,
    },
    "variationAxes": [
        {"id": "place-and-zero-layout", "textDe": "Hundertstel, Tausendstel oder Zehntausendstel bei einer Zahl über eins oder bei einer kleinen Zahl mit inneren Nullen; die Stelle bleibt immer vorgegeben.", "textEn": "Hundredths, thousandths, or ten-thousandths for a value above one or a small value with internal zeros; the target place is always given."},
        {"id": "rounding-boundary-and-carry", "textDe": "Ein Fall ohne Übertrag, ein exakter Halbfall und ein Übertrag über mehrere Neunen in den ganzzahligen Teil.", "textEn": "A case without carrying, an exact tie, and a carry across several nines into the integer part."},
        {"id": "direct-choice-and-procedure-comparison", "textDe": "Selbstständiges Runden und der Vergleich mit Abschneiden; Ziffernbegründung und bereitgestellte Nachbarabstände sind gleichwertige Begründungswege.", "textEn": "Independent rounding and comparison with truncation; a digit explanation and supplied neighbor distances are equivalent justification routes."},
    ],
    "applicationCaseBriefs": [
        {
            "id": "hundredths-non-tie",
            "taskDemandDe": "Runde 8,746 auf Hundertstel. Die Regel lautet: Wähle den näheren Nachbarwert; bei genau gleichem Abstand den weiter von null entfernten. Benenne die Zielstelle und begründe das Ergebnis mit Stellenwerten. Alternativ darfst du die gegebenen Nachbarn 8,74 und 8,75 mit den gegebenen Abständen 0,006 und 0,004 verwenden.",
            "taskDemandEn": "Round 8.746 to hundredths. Use the rule: choose the nearer neighbor; at an exact tie choose the neighbor farther from zero. Identify the target place and explain using place values. Alternatively, use the supplied neighbors 8.74 and 8.75 with supplied distances 0.006 and 0.004.",
            "expectedPerformanceDe": "8,75. Die Hundertstelziffer ist zunächst 4, die folgende Tausendstelziffer 6; nach der angegebenen Regel wird die Hundertstelziffer erhöht. Eine Begründung über den kleineren bereitgestellten Abstand zu 8,75 ist ebenfalls vollständig zulässig.",
            "expectedPerformanceEn": "8.75. The hundredths digit is initially 4 and the following thousandths digit is 6, so the supplied rule increases the hundredths digit. An explanation using the smaller supplied distance to 8.75 is equally sufficient.",
            "understandingFocusDe": "Die gegebene Zielstelle bestimmt das Raster; das Ergebnis wird begründet und nicht aus einer fertigen Visualisierung kopiert.",
            "understandingFocusEn": "The given target place determines the grid; the result is justified rather than copied from a completed visualization.",
        },
        {
            "id": "small-value-ten-thousandths",
            "taskDemandDe": "Runde unabhängig 0,00487 auf Zehntausendstel nach derselben ausdrücklich angegebenen Nächster-Nachbar-/Halbfall-weiter-von-null-Regel. Zeige an den Ziffern, wo die Zielstelle liegt. Wenn du Abstände nutzen möchtest, sind die Nachbarn 0,0048 und 0,0049 sowie die Abstände 0,00007 und 0,00003 gegeben.",
            "taskDemandEn": "Independently round 0.00487 to ten-thousandths using the same explicitly supplied nearest-neighbor/ties-away-from-zero rule. Show which digit occupies the target place. If you choose distances, the neighbors 0.0048 and 0.0049 and distances 0.00007 and 0.00003 are supplied.",
            "expectedPerformanceDe": "0,0049. Die Zielziffer ist 8 an der vierten Stelle nach dem Komma; die folgende 7 führt nach der Regel zum Erhöhen. Die beiden Nullen vor der 4 bleiben erhalten. Die Alternative nutzt den kleineren gegebenen Abstand zu 0,0049.",
            "expectedPerformanceEn": "0.0049. The target digit is 8 in the fourth decimal place; the following 7 increases it under the rule. The two zeros before the 4 remain. The alternative uses the smaller supplied distance to 0.0049.",
            "understandingFocusDe": "Die feinere Stellenwertstufe und führenden Dezimalnullen ändern die Struktur des direkten Falls.",
            "understandingFocusEn": "The finer place-value resolution and leading decimal zeros change the structure of the direct case.",
        },
        {
            "id": "exact-tie-carry-to-integer",
            "taskDemandDe": "Runde 19,995 auf Hundertstel. Die Nachbarn 19,99 und 20,00 haben beide den gegebenen Abstand 0,005. Die Regel für diesen Halbfall lautet ausdrücklich: Wähle den weiter von null entfernten Nachbarn. Erkläre den Übertrag und notiere das Ergebnis bis zur Hundertstelstelle.",
            "taskDemandEn": "Round 19.995 to hundredths. The neighbors 19.99 and 20.00 both have the supplied distance 0.005. The rule for this tie is explicitly: choose the neighbor farther from zero. Explain the carry and write the result through the hundredths place.",
            "expectedPerformanceDe": "20,00. Der genaue Halbfall wird durch die gegebene Regel entschieden; beim Erhöhen von 19,99 wird über die Neunen bis in den ganzzahligen Teil übertragen. 20 und 20,00 sind derselbe Zahlenwert; die verlangte ausgeschriebene Hundertstelstelle ist eine Darstellungsanforderung dieser Aufgabe und keine Aussage über Messgenauigkeit.",
            "expectedPerformanceEn": "20.00. The supplied rule resolves the exact tie; increasing 19.99 carries across the nines into the integer part. 20 and 20.00 have the same numerical value; displaying the requested hundredths place is a notation requirement of this task, not a claim about measurement precision.",
            "understandingFocusDe": "Ein exakter Halbfall mit mehrstelligem Übertrag prüft die gegebene Konvention statt einer nur nachgesprochenen 5-Regel.",
            "understandingFocusEn": "An exact tie with a multiple-digit carry tests the supplied convention rather than mere repetition of a '5' rule.",
        },
        {
            "id": "fresh-truncation-contrast",
            "taskDemandDe": "Runde 0,007649 auf Tausendstel nach der angegebenen Nächster-Nachbar-/Halbfall-weiter-von-null-Regel. Eine zweite Person schneidet an der Tausendstelstelle ab und erhält 0,007. Vergleiche die Verfahren und begründe dein Ergebnis. Wenn du Abstände nutzt, sind 0,000649 zu 0,007 und 0,000351 zu 0,008 vorgegeben; eine eigene Subtraktion wird nicht verlangt.",
            "taskDemandEn": "Round 0.007649 to thousandths using the supplied nearest-neighbor/ties-away-from-zero rule. Another person truncates at the thousandths place and obtains 0.007. Compare the procedures and justify your result. If you use distances, 0.000649 to 0.007 and 0.000351 to 0.008 are supplied; calculating a subtraction is not required.",
            "expectedPerformanceDe": "Runden ergibt 0,008, Abschneiden 0,007. Die erste entfernte Ziffer ist 6, daher wird nach der Regel die Tausendstelziffer 7 zu 8 erhöht; alternativ ist der bereitgestellte Abstand zu 0,008 kleiner. Die weitere Ziffernfolge wird nicht als Hundertstelstelle missverstanden.",
            "expectedPerformanceEn": "Rounding gives 0.008; truncation gives 0.007. The first removed digit is 6, so the supplied rule increases the thousandths digit from 7 to 8; alternatively, the supplied distance to 0.008 is smaller. The following digit sequence is not mistaken for the hundredths place.",
            "understandingFocusDe": "Der Vergleich mit einem plausiblen zweiten Verfahren macht die Bedeutung der gerundeten Näherung im frischen kleinen Zahlenfall sichtbar.",
            "understandingFocusEn": "Comparison with a plausible second procedure reveals the meaning of the rounded approximation in a fresh small-number case.",
        },
    ],
}

description_profile = {
    "archetype": "procedure",
    "facets": [
        {"id": "nonnegative-terminating-domain", "criterionDe": "Eine nichtnegative endliche Dezimalzahl wird bei gegebener Stelle und Regel gerundet; negative und periodische Zahlen werden nicht als Pflichttransfer eingeschmuggelt.", "criterionEn": "Round a nonnegative terminating decimal at a given place under a given rule; negative and recurring decimals are not introduced as mandatory transfer."},
        {"id": "rounding-choice-and-place", "criterionDe": "Die gewählte Näherung liegt auf der geforderten Stellenwertstufe; Stellenwert oder gegebene Nachbarinformation begründen die Wahl einschließlich eines möglichen Übertrags.", "criterionEn": "The selected approximation lies at the required place-value resolution; place value or supplied neighbor information justifies the choice, including a possible carry."},
        {"id": "rounding-truncation-contrast", "criterionDe": "Runden wird durch einen neuen Fall, in dem sich beide Werte unterscheiden, von Abschneiden abgegrenzt.", "criterionEn": "Distinguish rounding from truncation using a fresh case in which the two values differ."},
    ],
    "coverageRequirements": {"allOf": ["nonnegative-terminating-domain", "rounding-choice-and-place", "rounding-truncation-contrast"], "anyOf": [], "minimumIndependentChecks": 2, "requireChangedCase": True, "requireCueFreeTransfer": True},
    "variationAxes": copy.deepcopy(profile["variationAxes"]),
    "misconceptions": [
        {"id": "truncate-as-rounding", "signalDe": "0,007649 wird auf Tausendstel mit 0,007 angegeben, obwohl die gegebene Regel den näheren Nachbarn fordert.", "signalEn": "0.007649 is reported as 0.007 to thousandths although the given rule requires the nearer neighbor.", "correctionEvidenceDe": "Die lernende Person erklärt selbstständig 0,008 über die Folgeziffer 6 oder die gegebenen Abstände und unterscheidet dies von Abschneiden.", "correctionEvidenceEn": "The learner independently explains 0.008 through the following digit 6 or supplied distances and distinguishes it from truncation."},
        {"id": "zero-skips-place", "signalDe": "Bei 0,00487 wird die 4 als Zehntelstelle gelesen oder die verlangte Zehntausendstelstelle mit einer Zahl signifikanter Stellen gleichgesetzt.", "signalEn": "For 0.00487, the 4 is read as the tenths digit, or the requested ten-thousandths place is equated with a number of significant figures.", "correctionEvidenceDe": "Die lernende Person ordnet die vierte Nachkommastelle unabhängig zu und erhält 0,0049, ohne die führenden Nullen zu entfernen.", "correctionEvidenceEn": "The learner independently identifies the fourth decimal place and obtains 0.0049 without removing leading zeros."},
        {"id": "carry-lost", "signalDe": "19,995 wird zu 19,910 oder 19,99 gerundet, obwohl die genaue Halbfallregel gegeben ist.", "signalEn": "19.995 is rounded to 19.910 or 19.99 despite the supplied exact-tie rule.", "correctionEvidenceDe": "Die lernende Person führt den Übertrag zu 20,00 aus und begründet die Halbfallentscheidung mit der angegebenen Konvention.", "correctionEvidenceEn": "The learner carries to 20.00 and justifies the tie decision using the stated convention."},
    ],
    "nonEvidence": [
        {"id": "copied-illustration", "textDe": "Eine aus dem Bild oder Musterbeispiel abgeschriebene Ziffernfolge beweist keine selbstständige Rundungswahl.", "textEn": "Digits copied from an image or worked example do not demonstrate independent rounding choice."},
        {"id": "bare-result", "textDe": "Nur das richtige Ergebnis ohne die im Ziel verlangte Begründung und den Kontrast zu Abschneiden deckt das Ziel nicht vollständig ab.", "textEn": "A correct result alone without the claimed justification and truncation contrast does not fully cover the goal."},
    ],
    "outOfScope": [
        {"id": "signed-and-recurring", "textDe": "Negative Zahlen, periodische Dezimaldarstellungen und allgemeine Regeln für alle Vorzeichen bleiben außerhalb dieses Pflichtziels.", "textEn": "Negative numbers, recurring decimal representations, and universal rules for all signs remain outside this required goal."},
        {"id": "precision-selection", "textDe": "Die Zielstelle oder Zahl signifikanter Stellen aus Messunsicherheit, Verwendungszweck oder Fehlerfortpflanzung auswählen gehört nicht zu diesem Ziel.", "textEn": "Selecting a target place or number of significant figures from measurement uncertainty, purpose, or error propagation is outside this goal."},
        {"id": "independent-distance-calculation", "textDe": "Exakte Abstände durch Dezimalsubtraktion berechnen ist kein Pflichtnachweis; Abstände werden bei diesem Begründungsweg bereitgestellt.", "textEn": "Calculating exact distances by decimal subtraction is not required evidence; distances are supplied for that justification route."},
    ],
    "contrastCaseBriefs": [
        {"id": "round-vs-truncate", "purposeDe": "0,007649 auf Tausendstel trennt Nächster-Nachbar-Runden von Abschneiden.", "purposeEn": "0.007649 to thousandths separates nearest-neighbor rounding from truncation.", "strengthDe": "Der Vergleich verlangt eine begründete Verfahrensunterscheidung bei gleichem Wert und gleicher Zielstelle.", "strengthEn": "The comparison requires a justified distinction between procedures for the same value and target place.", "whyAlternativesUnderperformDe": "Fälle, bei denen beide Verfahren dasselbe Ergebnis liefern, machen den Unterschied allein nicht sichtbar.", "whyAlternativesUnderperformEn": "Cases in which both procedures yield the same result do not by themselves reveal the distinction."},
        {"id": "given-tie-carry", "purposeDe": "19,995 auf Hundertstel mit gegebener Half-away-Regel prüft einen echten Halbfall und Übertrag.", "purposeEn": "19.995 to hundredths with a supplied ties-away rule tests an exact tie and carry.", "strengthDe": "Beide bereitgestellten Abstände sind gleich; die Konvention entscheidet und der Übertrag muss vollständig ausgeführt werden.", "strengthEn": "Both supplied distances are equal; the convention decides and the carry must be completed.", "whyAlternativesUnderperformDe": "Ein Fall ohne Übertrag prüft weder das Weitertragen über Neunen noch den Übergang in den ganzzahligen Teil.", "whyAlternativesUnderperformEn": "A case without carrying tests neither carrying across nines nor crossing into the integer part."},
    ],
}

prerequisites = {
    "schemaVersion": 1,
    "status": "author_proposal_requires_independent_whole_goal_and_route_review",
    "proposedDirectRequires": goal["requires"],
    "inspectedExistingGoals": [goals[NAT], goals[REP], goals[ORIENTATION]],
    "decisions": [
        {"goalId": NAT, "decision": "omit_from_v2_mandatory_requires", "rationale": "The complete existing goal and actual P include choosing context-appropriate precision and recovering a natural-input interval. The new operation supplies its place and tie convention. Natural rounding is an excellent analogy and is explicitly invoked by BY/SL sources, but the complete predecessor is broader than what every method of this new operation needs. Preserve its semantics, mastery, image, P and existing edges; no decimal mastery is inferred from it."},
        {"goalId": REP, "decision": "candidate_add_with_explicit_granularity_review_required", "requiredCompetence": "Interpret the decimal place-value grid and neighboring decimal values, including internal zeros.", "wholeGoalRationale": "The current goal is the closest existing ordinary decimal foundation and includes place values, matching number-line positions and equivalent fractions. No narrower existing decimal-place-value atom was found in the 807-goal search. The proposed edge represents a conventional whole foundation, but equivalent-fraction conversion and constructing a scaled line are not unavoidable prerequisites of the accepted digit-only rounding method.", "dissent": "This candidate cannot be called an independently accepted universal minimal AND edge until a reviewer accepts the whole existing representation competence as the didactic foundation or selects a separately reviewed narrower solution. Do not pretend that mastery of one convenient facet equals mastery of the whole atom.", "alternatives": ["Accept the current complete representation goal as a reviewed curricular foundation, retaining the explicit breadth cost.", "If that breadth is rejected, author and independently review a narrower decimal-place-value foundation or a self-contained decimal-rounding route; create a fresh bound proposal rather than editing this reviewed candidate in place."], "runtimeCaution": "Only direct and contains-inherited requirements count. A saved rounded-number skill must not imply prior decimal-representation or natural-rounding mastery."},
        {"goalId": ORIENTATION, "decision": "retain_explicit_ordinary_math_orientation_convention", "rationale": "The existing content route uses the Sek-I orientation completion marker directly; it is not subject-matter mastery and cannot be inferred from mastery of REP. New goal requires this explicit completion marker separately."},
    ],
    "excludedPrerequisites": [{"goalId": "4eeab7d5-eeb3-579b-845e-1c52ffe9e89f", "rationale": "Decimal addition/subtraction is unnecessary for either accepted justification: decisive-digit reasoning or supplied distances."}],
}

SOURCE_CHOICES = {
    "DE-BB": (40, "D decimal rounding; current extracted source row is a D–H rational-number summary", "D / years5–6 is supported by the actual PDF, not by interpreting the broad extracted level as exactJ6", "The rational-row mapping is partial. Early D placement additionally binds PDF40, where decimal rounding is distinct from later E rational rounding. A source-extraction locator repair may be required before native mapping adoption."),
    "DE-BE": (40, "D decimal rounding; current extracted source row is a D–H rational-number summary", "D / year6 with someE; no universal exactJ6 assertion from broad metadata", "Same actualPDF as BB: the earlyD decimal item and laterE rational item are separate. Retain partial mapping and an explicit supplementaryD PDF anchor; do not infer signed early mastery."),
    "DE-BW": (20, "Classes5/6, 3.1.1 competence18", "5/6 band", "The full competence includes situation-appropriate precision selection and interpreting rounded size information. A given-place nonnegative operation covers only part."),
    "DE-BY": (1, "M6.1.2 decimal fractions", "year6", "The source bullet combines extending place values, decimal notation and rounding by analogy with whole numbers. Only the rounding operation is mapped; analogy does not prove a universal whole-goal prerequisite."),
    "DE-HB": (14, "End-of-year6 content standard", "by end ofyear6", "The bullet also covers natural rounding and estimation; the new atom covers only nonnegative decimal rounding. Preserve binding-core-with-restriction."),
    "DE-HE": (26, "KC7.3 numbers5/6; later7/8 rational/reals is separate", "5/6 band; G8/G9 precise existing authoredJ6 slot may be reviewed", "The source names natural and decimal rounding together. Map the decimal component partially and do not import signed7/8 or contextual precision into the early core."),
    "DE-HH": (50, "Module5/6 7 Positive numbers in decimal notation", "5/6 band", "The actualPDF has a standalone rounding bullet in the positive-decimal module. The extracted row interleaves 'runden' with a subsequent addition/subtraction heading; it is a locator with an OCR caution, not a reliable quote. Use the actualPDF rounding fragment and partial mapping."),
    "DE-MV": (19, "Orientierungsstufe, year5 broken numbers / decimal fractions", "year5 in the actual content section, within5/6 source", "Rounding is nested under decimal fractions. Nonnegative terminating decimals are a conservative operational subset; do not relabel the document a generic all-grade binding source."),
    "DE-NI": (41, "Learning-area core: dealing with decimal numbers; printedpage40", "source spans5–10; no exactyear inferred from the learning-area label", "The row also includes estimation. Its surrounding decimal learning area supports the operation, but a specific early placement is didactic and requires explicit independent route review."),
    "DE-NW": (24, "Erprobungsstufe arithmetic/algebra, competence10", "5/6 band in G9", "Context-appropriate rounding, estimation and checking are broader. Map the given-place nonnegative arithmetic core partially; retain source counting and all remaining coverage."),
    "DE-RP": (33, "Orientierungsstufe L2 measuring/sizes, printedpage32", "Orientierungsstufe5/6", "Size computations and appropriate rounding are broader. Neighboring row cross-reference to natural/fraction numbers supports decimal context, not a standalone exact rounding rule or prerequisite quote."),
    "DE-SH": (28, "L1 rational numbers: terminating/simple recurring decimals, place table, rounding", "source5–10; current authored5/6 corridor is a proposal requiring placement review", "Use the second rounding item under the decimal/rational column, not the first natural-number item. Nonnegative terminating inputs are only a partial subset; no arbitrary exactJ6 claim."),
    "DE-SL": (41, "5/6 fractions: rounding rules applied to decimal fractions", "5/6 band", "A given-rule operation implements the supported decimal rounding core. The full source curriculum also teaches other fraction/representation skills; no source-wide exact claim."),
    "DE-SN": (20, "Class5 learning-area2: common fractions and decimals", "year5", "The subitem combines estimation and rounding within decimal/fraction foundations. Keep a partial mapping and year5 placement rather than canonicalJ6 promotion."),
    "DE-ST": (30, "Years5/6 fractions: round decimal fractions", "5/6 band", "The source row directly names the decimal operation, while the canonical mandatory domain is explicitly a nonnegative terminating subset and the tie convention is supplied didactic specification, not an official quote."),
    "DE-TH": (13, "2025 class6 broken numbers: round decimals to given places", "year6; document binding for5/6 and11/12 from2025/26 only", "Retain exact role binding-for-grade-5-6-and-11-12-from-2025-26. The filename's Entwurfsfassung is not an exclusion. Map the positive/terminating core partially; do not promote the role to unrestricted binding-core."),
}
sources = []
for ref in v1["sourceRefs"]:
    state = ref["jurisdiction"]
    ctx_path = BASE / "source-context-v2" / (state + ".context.json")
    ctx = load(ctx_path)
    page, scope, grade, rationale = SOURCE_CHOICES[state]
    anchors = [x for x in ctx["roundingMatches"] if x["pdfPage"] == page]
    assert anchors, state
    sources.append({
        "jurisdiction": state,
        "sourceGoalId": ref["sourceGoalId"],
        "extractionPath": ref["extractionPath"],
        "extractionSha256": ctx["extractionSha256"],
        "sourceRowSha256": "sha256:" + hashlib.sha256(json.dumps(ctx["sourceRow"], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "sourceRowSerialization": "UTF8 json.dumps(ensure_ascii=False,sort_keys=True,separators=(',',':'))",
        "passageId": ctx["sourceRow"]["passageId"],
        "sourceDocument": copy.deepcopy(ref["sourceDocument"]),
        "pdfSha256": ctx["pdfSha256"],
        "actualPdfPage": page,
        "selectedPdfLocators": [{"pdfPage": x["pdfPage"], "pageLine": x["pageLine"]} for x in anchors],
        "fullSourceContextFile": {"path": str(ctx_path), "sha256": digest(ctx_path)},
        "actualSourceScope": scope,
        "placementProposal": grade,
        "proposedMapping": {"sourceGoalId": ref["sourceGoalId"], "canonicalGoalId": GOAL, "matchType": "partial"},
        "mappingRationale": rationale,
        "status": "authored_partial_mapping_pending_independent_source_and_placement_review",
        "authorReadMethod": "Complete current source row and passage, and actual relevant local officialPDF rounding context read by this author; current extraction/PDF SHA checked against root's source-review receipt. Search is discovery, never approval.",
        "universalMethodClaim": "All positive inputs are handled by either place-value/digit reasoning or supplied neighbors. This didactic specification does not claim that all16 official sources prescribe the exact tie rule or four tasks.",
    })

goal_artifact = dump("goal.author-candidate.json", {
    "schemaVersion": 2,
    "status": "inert_author_candidate_pending_independent_semantics_requires_mapping_route_and_native_D_P_A_M_V",
    "author": AUTHOR,
    "authoredAt": NOW,
    "licensing": copy.deepcopy(v1["licensing"]),
    "retainedInputs": [{"path": v1_path, "sha256": digest(v1_path)}, {"path": root_path, "sha256": digest(root_path)}],
    "canonicalBaseline": {"path": math_path, "sha256": digest(math_path), "curricularAtomicCount": 807},
    "proposedGoal": goal,
    "uuidDerivation": v1["uuidDerivation"],
    "sourceApplicabilityClaim": "Candidate common nonnegative decimal core for16 jurisdictions, independently source/placement review pending; every source mapping is partial. Canonical referencephaseJ6 is compatibility grouping only, not an exact all-state targetgrade.",
    "prerequisiteDecisionPath": str(BASE / "prerequisites.author-decisions.json"),
    "domainBoundaries": {"required": "nonnegative terminating decimals, including zero", "optionalLater": "signed transfer only after separate source/method/placement review; not inherited mastery", "excluded": ["selecting a place from context or measurement uncertainty", "significant-figure counting", "mandatory independent decimal subtraction", "periodic decimal rounding", "any mandatory negative-number rule"]},
    "rootReviewReconciliation": ["Explicit nonnegative terminating domain", "Given targetplace and tie convention", "Distances supplied when used; decisive-digit route equally accepted", "Carry20.00 and small-zero cases retained with corrected0.007649→0.008", "TH exactrestrictedrole retained", "HH actualPDF fragment rather than OCRinterleaving used"],
    "activationAuthorized": False,
})
dump("positive-profile.body.author-candidate.json", profile)
dump("description-profile.body.author-candidate.json", description_profile)
dump("prerequisites.author-decisions.json", prerequisites)
dump("source-mappings-and-placement.author-candidate.json", {"schemaVersion": 2, "goalId": GOAL, "status": "inert_all16_partial_proposals_pending_independent_review", "sourceRefs": sources})

dump("atomicity-memory-kind.author-candidate.json", {
    "schemaVersion": 1,
    "goalId": GOAL,
    "goalAuthorArtifact": goal_artifact,
    "status": "author_judgments_not_active_native_ledgers_or_independent_gate_receipts",
    "semanticKind": {"proposed": "curricularAtomic", "rationaleDe": "Das Ziel verlangt selbstständig überprüfbare mathematische Rundungsleistung; es ist weder Orientierung noch Übungsabschluss, Prüfung, Struktur oder SRS.", "rationaleEn": "The goal demands independently assessable mathematical rounding; it is neither orientation, a practice endpoint, assessment, structure, nor SRS."},
    "atomicity": {"proposedStatus": "atomic", "semanticAtomic": True, "rationaleDe": "Zielstelle identifizieren, Näherungswert wählen, Übertrag ausführen und den Unterschied zu Abschneiden begründen sind Ausführung und Bedeutung derselben Rundungsoperation. Es werden keine unabhängige Präzisionswahl, Dezimalsubtraktion, allgemeine Vorzeichenregel oder Bruchumwandlung mitgeprüft.", "rationaleEn": "Identifying the target place, selecting an approximation, carrying, and explaining the difference from truncation are execution and meaning of one rounding operation. Independent precision selection, decimal subtraction, a general sign rule, and fraction conversion are not additionally assessed.", "independentReview": "pending"},
    "memory": {"proposedStatus": "no_memory_needed", "memoryGoalIds": [], "deckIds": [], "rationaleDe": "Die Leistung ist eine begründete angewandte Stellenwertoperation bei gegebener Regel. Ein eigener Merkkartensatz würde die Regel vom Verständnis abtrennen und die neue Kompetenz nicht nachweisen. Die Rundungskonvention bleibt Aufgabeninformation, kein auswendig zu lernender universeller Satz.", "rationaleEn": "The performance is a justified applied place-value operation under a given rule. A separate recall deck would detach the rule from understanding and would not establish this competence. The rounding convention remains task information rather than a universal theorem to memorize.", "independentReview": "pending"},
    "visualization": {"status": "pending_no_asset_or_image_review", "existingNaturalImageReuse": "not_authorized_or_assessed", "candidateBriefDe": "Eine klare freundliche Illustration zeigt eine nichtnegative kleine Dezimalzahl zwischen benachbarten Tausendstelwerten auf einer korrekt beschrifteten Skala; die Zielstelle und inneren Nullen müssen stimmen. Separater kleiner Übertragsausschnitt kann das Überschreiten von19,99 zu20,00 erklären. Das finale Bild ist Lehrhilfe und kein Assessmentbeleg.", "candidateBriefEn": "A clear friendly illustration shows a small nonnegative decimal between neighboring thousandth values on a correctly labelled scale; the target place and internal zeros must be correct. A separate small carry panel may explain crossing from19.99 to20.00. The final image is teaching support, not assessment evidence.", "requiredNext": "After independent semantic/route acceptance, use the actual image provider workflow and separately inspect assethash, mathematical marks/scales/zeros/tie/carry, alt text, licensing and fit. This task does not generate an image."},
})

dump("assessment-probes.author-candidate.json", {
    "schemaVersion": 1,
    "goalId": GOAL,
    "status": "own_author_case_proposals_pending_independent_task_review_no_learner_evidence",
    "cases": copy.deepcopy(profile["applicationCaseBriefs"]),
    "grading": {
        "required": ["correct specifiedplace and rounded value", "valid reasoning by either permittedmethod", "given exacttie rule applied in tie/carry case", "a fresh rounding/truncationcontrast"],
        "allowedAlternatives": ["Decisive-digit/place-value explanation needs no distance arithmetic", "If distances are used, the task supplies them; compare these rather than requiring fresh decimal subtraction", "20 and20.00 are mathematically equal; requested written resolution can be checked without claiming physicalprecision"],
        "coverageCountInterpretation": "NativeP minimum2 means genuinely independent demonstrations across meaningful boundary/place/contrast variation. It is not an extra-task quota; one multi-step task can contain sufficient independent transfer. Stop assessing when actual evidence covers the goal.",
        "limits": "No student response, mastery state, passed exam, actual coaching outcome, independent reviewer verdict or human approval is claimed.",
    },
    "examRouteImpact": "Do not add this new atom automatically to any existing exercise/exam requires. Review actual task content and source demands; any assessment description/task/solution/score/requires change needs separately bound review and retained history.",
})

# Snapshot metadata only: immutable inputs are referenced, never edited.
active_inputs = [Path(math_path), Path("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json")]
active_inputs += sorted(Path("curricula/DE/Gymnasium/composition-views/mathematik").glob("*.view.json"))
active_inputs += sorted(Path("curricula/DE/Gymnasium/composition-views/physik").glob("*.view.json"))
active_inputs += [Path("curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"), Path("curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json"), Path("curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl"), Path("curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl"), Path("curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json")]
dump("active-input-baseline.sha256.json", {"schemaVersion": 1, "status": "read_only_candidate_baseline", "files": [{"path": str(p), "sha256": digest(p)} for p in active_inputs]})
print("Wrote inert author candidates; native bindings and route manifest are separate additive artifacts.")
