#!/usr/bin/env python3
"""Build a bounded inert successor; never mutate active curriculum files."""
from __future__ import annotations

import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
PACKAGE = Path(__file__).resolve().parent
INPUTS = PACKAGE / "inputs"
INPUTS.mkdir(exist_ok=True)

BEFORE_PATH = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-five-phase-practice-clusters-six-overbroad-gates-author-v1/inputs/whole-CAN494-reviewed-science-and-material-machine-before.json"
REVIEW_PATH = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-six-phase-gates-whole-material-independent-a-v1/actual-seven-old-whole-materials-nine-unproved-coverage-and-one-task-rubric-scientific-REVISE.independent-a.json"
ADDITIONAL_PATH = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-six-phase-gates-whole-material-independent-a-v1/actual-whole-15aa-regime-coverage-and-C19-fiscal-GK-LK-boundary-scientific-REVISE.independent-a.json"
PROFILES_PATH = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/whole-P336-only-two-current-reviewed-requires-input-fingerprint-successors.jsonl"

def binding(path: Path) -> dict:
    data = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}

def write(name: str, value: object) -> Path:
    path = PACKAGE / name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return path

def physical_copy(source: Path, name: str) -> Path:
    dest = INPUTS / name
    if dest.exists():
        assert dest.read_bytes() == source.read_bytes(), f"Refuse to replace historical input: {dest}"
    else:
        dest.write_bytes(source.read_bytes())
    return dest

before_input = physical_copy(BEFORE_PATH, "whole-CAN494.current-reviewed-material-predecessor.json")
review_input = physical_copy(REVIEW_PATH, "whole-independent-A-nine-false-coverage-and-real-rubric-REVISE.input.json")
additional_input = physical_copy(ADDITIONAL_PATH, "whole-independent-A-real-regime-and-separate-C19-boundary-REVISE.input.json")
agents_input = physical_copy(ROOT / "AGENTS.md", "whole-current-AGENTS.input.md")
assert binding(before_input)["sha256"] == "22826935bdcdb5190d3826062af835b1f7610ddd0f45398bb037726d106e9f78"
assert binding(review_input)["sha256"] == "0d058f92dba9e0e1796f48e1a4be8e2fe982f7a8104b538bc030cf169c1237ca"
assert binding(additional_input)["sha256"] == "791d6aaedf598bae2373e670d16d21fe4cdc493b9c281bac7c6fdc646265bf71"

before = json.loads(before_input.read_text())
candidate = copy.deepcopy(before)
bm = {g["id"]: g for g in before["goals"]}
cm = {g["id"]: g for g in candidate["goals"]}
foreign_findings = json.loads(review_input.read_text())
cuts = {}
for finding in foreign_findings["findings"]:
    if "claimedCoveredGoalId" in finding:
        cuts.setdefault(finding["materialGoalId"], []).append(finding["claimedCoveredGoalId"])
assert len(cuts) == 7 and sum(map(len, cuts.values())) == 9

reasons = {
    "ffe6ed04-c671-58c6-866c-f9eeba4210e2": "Die vier vollständigen Mindestlohnleistungen ordnen Markt-/Sozialordnungspositionen ein, erläutern den Mindestlohneingriff, analysieren Akteure und begründen eine Intervention. Die Zahlen zu Lohn/Kosten/Nachfrage dienen keinem Medienvergleich. Es werden weder Quellenzugang, Verifikation, Agenda-Auswahl noch Kontroll-/Öffentlichkeitsfunktionen demokratischer Medien verlangt oder bewertet. Eine vollständig richtige Lösung benötigt diese eigenständige Medienleistung nicht.",
    "a1e0e2fc-e255-5c52-aaa7-eed508228a0b": "Die Wohnungskoalition stellt Parteipositionen und Verbandsinteressen bereit, aber keine Stimmen, Mandate, Wahlregeln oder alternative Parteiensysteme. Alle vier Leistungen können Positionsvergleich, Interessenvermittlung, Investitions-/Zugangsfolgen und einen bedingten Koalitionskompromiss vollständig leisten, ohne die Übersetzung von Stimmen in Mandate und deren Repräsentationsfolgen zu analysieren.",
    "5b5d1d53-71c3-5fbf-b1cf-977c868b60e3": "Der ganze App-Store-Fall mit 78 % Marktanteil und 30 % Provision prüft Netzwerkeffekte/Wechselkosten/Datenvorteile, Ordnungspolitik, Wettbewerbsinstrumente und Innovationsfolgen. Kreditforderungen, Einlagen, Reserven, zwischenbankliche Zahlungen oder Kapitaltilgung kommen in keiner verlangten oder bewerteten Leistung vor. Vollständige richtige Antworten ersetzen keine Geldschöpfungs-Bilanzmodellierung.",
    "bc1ebc6a-3c15-547f-92a0-02ddeeafb5e4": "Weder der ganze Lieferketten-/Standortfall noch der ganze CO2-Grenzausgleichsfall benennt ein konkretes Handelsabkommen oder liefert dessen datierte Marktöffnungs-, Ursprungs-, Ausnahme- oder Umsetzungstexte. Ihre tatsächlich geprüften Spezialisierungs-/Standort-/Außenwirtschaftsleistungen beziehungsweise Instrumenten-/Verteilungs-/Umwelturteile sind fachlich andere Leistungen als ein begründetes Urteil über ein benanntes zentrales Handelsabkommen.",
    "87ee2b5a-8d10-51e4-a288-539e5ac251ea": "Der Währungsunionsfall verlangt die Einordnung von Löhnen, realer Wettbewerbsfähigkeit, Kapitalströmen und Anpassungsstrategien. Auch der echte Regimenachfolger vergleicht Wechselkursentscheidungen. Er enthält keine Zollsenkung/-erhebung oder deren Verteilung entlang Verbrauchern, Produzenten, Staat und Handelspartnern. Die handelspolitische Verteilungsleistung bleibt als eigene Lernzielroute offen.",
    "fb249488-944c-5123-a21e-5cb9a0431e8b": "Kapitalbewegungen und Fremdwährungsschulden sind im Währungsfall relevant, ersetzen aber keine Erklärung von Eigenkapitalverlustpuffern, Refinanzierung/Laufzeiten, Notverkäufen und grenzüberschreitender Ansteckung mit ursachengerechten Regulierungsregeln. Weder ursprünglicher vollständiger Fall noch begrenzter Regimefolger prüfen diese gesamte Finanzmarktregulierungsleistung.",
    "f1f73ebe-286a-52e8-a2e1-4383ece6e9ec": "Mikrokreditgröße, Rückzahlungsquote und erster Kontozugang prüfen nicht die im ganzen Lernziel/P2 geforderte Unterscheidung von Beschäftigungs- und Wertschöpfungsanteilen, sektoraler Produktivität, absolutem Wachstum und Strukturanteilen. Alle Mikrofinanz-/Handelsinstrumentenleistungen bleiben vollständig möglich, ohne einen konkreten sektoralen Wachstumspfad zu analysieren.",
    "543bf91f-f6c6-5b1b-ba9e-43de321d8c7f": "Die Mikrofinanzaufgaben beurteilen Inklusion, Überschuldung, Finanzierung und Marktzugang. Sie liefern weder Armutsgrenze und Bezugsgruppe noch Armutsquote, Einkommenslücke/Armutstiefe oder nichtmonetäre Versorgung zum Vergleich. Rückzahlungsquote und Kontozugang beweisen keine verringerte Armut; das ganze Armutsindikatoren- und Strategievergleichsziel ist damit nicht vollständig bewertet.",
}

individual = []
for mid, removed in cuts.items():
    original = bm[mid]
    goal = cm[mid]
    for gid in removed:
        assert gid in original["requires"] and gid in original["examData"]["coveredGoalIds"]
        individual.append({"materialGoalId": mid, "removedClaimedGoalId": gid, "wholeOriginalMaterial": original, "wholeRemovedCurrentGoal": bm[gid], "authorScientificReasonDe": reasons[gid], "resolution": "REMOVE_ONLY_UNPROVED_DIRECT_REQUIRES_AND_COVERED_BINDINGS_PRESERVE_REAL_STUDENT_PERFORMANCE", "newGoalRouteClosed": False, "independentScientificReviewPending": True})
    goal["requires"] = [gid for gid in original["requires"] if gid not in removed]
    goal["examData"]["coveredGoalIds"] = [gid for gid in original["examData"]["coveredGoalIds"] if gid not in removed]

currency_id = "15aa72ad-9236-5a68-8482-9408db439af2"
regime_id = "13b20cee-8977-5b3f-938b-2064e96f2a5b"
currency = cm[currency_id]
assert currency["requires"] == currency["examData"]["coveredGoalIds"] == [regime_id]
currency["examData"]["taskContent"] = """**Kontext (fiktives Dossier):**

Mehrere Mitgliedstaaten einer Währungsunion entwickeln sich wirtschaftlich unterschiedlich: In einem Land steigen Löhne und Preise rasch, in einem anderen bleiben Wachstum und Binnennachfrage schwach. Die gemeinsame Zentralbank hält an einem einheitlichen Zinssatz fest. Ein eigenständiges Nachbarland X handelt mit der Union und prüft für seine eigene Währung zwei Wechselkursregime. X ist kein Mitglied der Währungsunion; eine feste Bindung ist nicht dasselbe wie die Übertragung der Geldpolitik auf die gemeinsame Zentralbank.

**Material 1 (vereinfachte Angaben zu den Unionsmitgliedern):**

- Inflationsrate Land A: 5,2 %
- Inflationsrate Land B: 1,8 %
- Leistungsbilanz Land A: -4 % des BIP
- Leistungsbilanz Land B: +5 % des BIP

Die Angaben allein legen die Ursachen der Salden nicht fest. Aussagen über preisliche Wettbewerbsfähigkeit sind an Löhne, Produktivität und Preise zu binden.

**Material 2 (zwei mögliche Regime für X; alle Angaben sind Modellannahmen):**

- 70 % des Außenhandels von X entfallen auf die Union. Der Kapitalverkehr ist frei. X erlebt einen eigenen Nachfragerückgang, auf den seine Zentralbank reagieren möchte.
- **F: glaubwürdige feste Bindung.** Der Kurs bleibt bei 1 X-Währungseinheit je Unions-Währungseinheit. Die Zentralbank verfügt im Modell über die Mittel zur Verteidigung der Bindung. Bei freiem Kapitalverkehr kann sie ihren Zins nicht dauerhaft weit vom Zins der Union absetzen und gleichzeitig diese Bindung unverändert halten. Preise und Löhne können sich anpassen; nominale Kursstabilität garantiert keine stabile reale Wettbewerbsfähigkeit.
- **V: flexibler Kurs.** Es gibt keine zugesagte Parität. Im betrachteten Schockfall steigt der Kurs von 1 auf 1,20 X-Währungseinheiten je Unions-Währungseinheit. Der Zins kann stärker auf die eigene Lage ausgerichtet werden, aber der Wechselkurs schwankt. Die betrachtete Abwertung ist eine Fallannahme, keine allgemeine Garantie jedes flexiblen Systems.
- Unternehmen in X haben nicht abgesicherte Schulden in Unionswährung und beziehen wichtige Vorprodukte aus der Union. Die fremdwährungsfesten Beträge dieser Schulden und Importe verändern sich im betrachteten Schritt nicht. Exporterlöse sind teilweise ebenfalls in Unionswährung vereinbart; wie Absatzmengen reagieren, ist offen.

**Aufgaben:**

1. Erläutern Sie, warum in einer Währungsunion auch ohne nominale Abwertung wirtschaftlicher Anpassungsdruck entstehen kann. Beziehen Sie Material 1 ein, ohne aus den Salden allein eine eindeutige Ursache abzuleiten. **8 BE**
2. Analysieren Sie die Rolle von Lohnentwicklung, Kapitalströmen und Wettbewerbsfähigkeit. Unterscheiden Sie dabei Löhne von Lohnkosten je erzeugter Einheit und benennen Sie Bedingungen Ihrer Wirkungsannahmen. **7 BE**
3. Vergleichen und beurteilen Sie für X die feste Bindung F und den flexiblen Kurs V anhand von Handelssicherheit, geldpolitischem Spielraum, wirtschaftlicher Anpassung sowie Fremdwährungsschulden und Importkosten. Erklären Sie im gegebenen Schockfall auch die gegenläufigen Möglichkeiten für Exporterlöse und Kosten. **8 BE**
4. Beurteilen Sie, ob bei den Unionsmitgliedern eher nationale Reformen oder stärkere wirtschaftspolitische Koordination priorisiert werden sollten. Beziehen Sie Lohnzurückhaltung, Fiskalpolitik oder Transfers mit ihren Grenzen ein. Begründen Sie anschließend eine bedingte Regimeempfehlung für X anhand seiner anderen institutionellen Lage; mehrere Empfehlungen sind bei schlüssiger Begründung möglich. **7 BE**

**Bewertung:** Es gelten Teilpunkte für nachvollziehbare Leistungen; ein begrenzter Fehler wird nicht mehrfach abgezogen. Das Bestehen verlangt einen erkennbaren begründeten Vergleich beider Wechselkursregime aus den konkreten Fallbedingungen. Wenn die Unterscheidung und Beurteilung von F und V insgesamt fehlt oder durchgehend durch „feste Kurse sichern auch reale Wettbewerbsfähigkeit“ beziehungsweise „Abwertung garantiert Wohlstand ohne Kosten“ ersetzt wird, ist der Gesamtwert höchstens 17/30. Ein einzelner falscher Teilaspekt, eine begrenzte Rechenungenauigkeit oder ein anderer nachvollziehbarer Schwerpunkt im Urteil löst diese Begrenzung nicht aus. Es besteht keine Vollpunktpflicht pro Teilaufgabe.
"""
currency["examData"]["solutionContent"] = """1. Eine gemeinsame Währung schließt eine eigenständige nominale Abwertung eines einzelnen Mitglieds gegenüber den anderen Mitgliedern aus. Unterschiede in Preisen, Löhnen und Produktivität können trotzdem die reale Wettbewerbsposition verschieben. Anpassung erfolgt dann beispielsweise über Preise/Löhne, Produktivität und Nachfrage. A/B zeigen unterschiedliche Inflation und Außenbilanzsalden; diese Angaben belegen allein weder eine bestimmte Lohnursache noch eine zwangsläufige Entwicklung jedes Sektors. **8 BE**

2. Steigen Löhne stärker als die Produktivität, können Lohnkosten je Einheit und bei Weitergabe Preise steigen; höhere Löhne bei entsprechend höherer Produktivität bedeuten das nicht automatisch. In einer Union bleibt die nominale Binnenparität bestehen, während relative Preise und Kosten sich verändern können. Kapitalzuflüsse können Nachfrage/Investitionen finanzieren, Abflüsse Finanzierung erschweren; Zusammensetzung, Verwendung und Zeit der Ströme sind maßgeblich. Die gegebenen Leistungsbilanzsalden sind kein hinreichender Kausalbeweis. **7 BE**

3. F bietet X nominale Planungssicherheit für den starken Handel mit der Union und begrenzt im Modell das unmittelbare Umrechnungsrisiko der fremdwährungsfesten Schulden und Importe. Diese Stabilität bindet bei freiem Kapitalverkehr den geldpolitischen Zinsraum; ein eigener Nachfrageschock lässt sich weniger unabhängig über den Zins beantworten. Reale Anpassung kann dennoch über Preise, Löhne und Produktivität nötig werden. V erlaubt eher eine eigene Zinsreaktion und nominale Kursanpassung, verursacht aber Kursrisiken. Bei der gegebenen Notierung 1→1,20 werden unveränderte Unions-Währungsbeträge in X-Währung um 20 % teurer: Das betrifft Schuldendienst/Schuldenbewertung und importierte Vorprodukte. Fremdwährungsfeste Exporterlöse ergeben gleichzeitig mehr X-Währung. Höhere Absatzmengen und ein positiver Nettoeffekt sind wegen Nachfrage, Vorproduktkosten und Vertragswährungen nicht sicher. Beide Regime haben damit bedingte Vor- und Nachteile für mehrere betroffene Gruppen. **8 BE**

4. In der Union sind eine begründete Kombination und abweichende Prioritäten möglich: Produktivitätsreformen und gegebenenfalls Lohnmoderation können nationale Kostenpositionen verändern, haben aber Zeit-, Nachfrage- und Verteilungskosten. Fiskalische Stützung und Transfers können Anpassung erleichtern, brauchen Finanzierung, Koordination und Legitimation. Nationale Reformen lösen gemeinsame Ungleichgewichte nicht notwendig allein; Koordination ersetzt umgekehrt keine konkrete nationale Umsetzung. Für X kann F bei hohem Gewicht von Handelsplanung und ungesicherten Fremdwährungslasten plausibel sein, wenn der eingeschränkte Zinsraum und alternative Anpassung tragbar sind. V kann bei großem Gewicht eigener Stabilisierung plausibel sein, wenn Kursrisiken, Schuldentragfähigkeit und Importkosten berücksichtigt werden. Das Urteil muss Kriterien und Modellbedingungen offenlegen; die Union und eine eigenständige Festkursbindung werden nicht gleichgesetzt. **7 BE**

**Bewertungsbindung:** 30 BE, Bestehensgrenze 18 BE. Die im Aufgabenblatt erläuterte Begrenzung auf höchstens 17 BE bei insgesamt fehlendem oder durchgehend fachlich ersetztem Regimevergleich ist Teil der Bewertung. Sachlich vertretbare unterschiedliche Empfehlungen und begrenzte Teilfehler bleiben innerhalb der Teilpunktbewertung möglich.
"""
currency["examData"]["scoring"]["steps"] = [
    {"id": "s1", "points": 8, "description": "Reale Anpassung ohne eigenständige nominale Binnenabwertung erläutert; relative Preise/Löhne/Produktivität sowie Grenzen der Saldeninterpretation berücksichtigt"},
    {"id": "s2", "points": 7, "description": "Lohnentwicklung, Lohnstückkosten/Produktivität, Kapitalströme und reale Wettbewerbsfähigkeit mit ausdrücklichen Wirkungsbedingungen analysiert"},
    {"id": "s3", "points": 8, "description": "F und V nach nominaler Handelssicherheit, Zinsautonomie, Anpassung sowie Fremdwährungs-/Import- und Erlöswirkungen vergleichend beurteilt; keine automatischen Wohlfahrtsgarantien"},
    {"id": "s4", "points": 7, "description": "Nationale Reformen und Koordination samt Anpassungsstrategien abgewogen; für X eine kriteriale, bedingte Regimeempfehlung ohne Gleichsetzung von Union und eigenständiger Bindung begründet"},
]

profiles = [json.loads(line) for line in PROFILES_PATH.read_text().splitlines() if line.strip()]
relevant = set(reasons) | {regime_id}
context_profiles = [p for p in profiles if p["goalId"] in relevant]
assert len(context_profiles) == 9 and sum(len(p["profile"]["applicationCaseBriefs"]) for p in context_profiles) == 18
context_input = write("inputs/whole-nine-current-DE-EN-goals-and-P18-performance-contexts.json", {"sourceWholeProfiles": binding(PROFILES_PATH), "wholeGoals": [bm[gid] for gid in sorted(relevant)], "wholeProfiles": context_profiles, "readingScope": "All nine whole DE/EN goal contracts, expectations and eighteen whole DE/EN taskDemand/expectedPerformance/understandingFocus cases read. Profile bodies preserved, no new positive-evidence review or status claim."})

changed = []
for gid, original in bm.items():
    goal = cm[gid]
    if goal != original:
        keys = [key for key in set(goal) | set(original) if goal.get(key) != original.get(key)]
        changed.append({"goalId": gid, "changedTopLevelKeys": sorted(keys), "wholeOriginal": original, "wholeSuccessor": goal})
        assert set(keys) == {"requires", "examData"}
        assert {key: value for key, value in original.items() if key not in {"requires", "examData"}} == {key: value for key, value in goal.items() if key not in {"requires", "examData"}}
        if gid != currency_id:
            assert {key: value for key, value in original["examData"].items() if key != "coveredGoalIds"} == {key: value for key, value in goal["examData"].items() if key != "coveredGoalIds"}
        else:
            allowed = {"coveredGoalIds", "taskContent", "solutionContent", "scoring"}
            assert {key: value for key, value in original["examData"].items() if key not in allowed} == {key: value for key, value in goal["examData"].items() if key not in allowed}
            assert original["examData"]["scoring"]["maxPoints"] == goal["examData"]["scoring"]["maxPoints"] == 30
            assert original["examData"]["scoring"]["passingPoints"] == goal["examData"]["scoring"]["passingPoints"] == 18
            assert [(s["id"], s["points"]) for s in original["examData"]["scoring"]["steps"]] == [(s["id"], s["points"]) for s in goal["examData"]["scoring"]["steps"]]
assert len(changed) == 7
assert set(bm) == set(cm) and len(cm) == 494
assert sum(g.get("examData") is not None for g in bm.values()) == 97
assert all(cm[gid] == original for gid, original in bm.items() if gid not in cuts)
assert all(cm[gid]["contains"] == original["contains"] for gid, original in bm.items())
assert all(cm[gid]["requires"] == original["requires"] for gid, original in bm.items() if gid not in cuts)
assert all(cm[gid].get("examData") == original.get("examData") for gid, original in bm.items() if gid != currency_id and gid not in cuts)
assert all(cm[gid]["examData"]["reviewStatus"] == bm[gid]["examData"]["reviewStatus"] == "released" for gid in cuts)
assert all(cm[gid]["requires"] == cm[gid]["examData"]["coveredGoalIds"] for gid in cuts)

def direct_atomic_closure(mid: str, goals: dict) -> dict:
    """Actual atomic-edge path intake, not a native country/applicability approval."""
    paths = {}
    pending = [(mid, [mid])]
    while pending:
        gid, path = pending.pop()
        for rid in goals[gid].get("requires", []):
            if rid in paths or rid in path or rid not in goals or goals[rid].get("contains"):
                continue
            paths[rid] = [rid] + list(reversed(path))
            pending.append((rid, path + [rid]))
    return paths

route_intake = []
for mid, removed in cuts.items():
    previous_paths = direct_atomic_closure(mid, bm)
    current_paths = direct_atomic_closure(mid, cm)
    for gid in removed:
        other_terminals = []
        for goal in candidate["goals"]:
            if goal["id"] == mid or goal.get("contains") or goal.get("examData", {}).get("reviewStatus") != "released":
                continue
            paths = direct_atomic_closure(goal["id"], cm)
            if gid in paths:
                other_terminals.append({"terminalGoalId": goal["id"], "atomicPrerequisitePath": paths[gid], "declaredWholeCovered": gid in goal["examData"].get("coveredGoalIds", []), "scopeScienceAndVisibilityQualified": False})
        route_intake.append({"materialGoalId": mid, "removedFalseCoveredGoalId": gid, "beforeDirectAtomicPath": previous_paths.get(gid), "afterThisTerminalDirectAtomicPath": current_paths.get(gid), "endpointPathActuallyLostAtThisTerminal": gid not in current_paths, "otherReleasedAtomicPathCandidatesOnly": other_terminals, "meaning": "Structural path intake only. A retained transitive path or another released metadata endpoint is not a whole-goal scientific assessment approval and not current course/country route closure."})

science_path = write("nine-individual-false-direct-assessment-bindings-and-whole-15aa-real-regime.scientific-author-decisions.json", {
    "role": "BOUNDED_MATERIAL_AUTHOR_SEPARATE_FROM_PRIOR_INDEPENDENT_ROOT_QS",
    "status": "CANDIDATE_PENDING_INDEPENDENT_A_WHOLE_MATERIAL_REVIEW",
    "authoredAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "wholeReadScope": "Seven whole current DE task/solution/scoring bodies plus DE/EN goal descriptions; nine current DE/EN ordinary contracts and eighteen complete DE/EN P application cases. No English material-body approval is invented: these seven existing examData objects have no taskContentEn/solutionContentEn/scoring.descriptionEn fields.",
    "wholeInputBindings": [binding(before_input), binding(review_input), binding(additional_input), binding(context_input), binding(agents_input)],
    "nineIndividualScientificDecisions": individual,
    "wholeCurrencyRegimeCorrection": {
        "materialGoalId": currency_id,
        "retainedActualCoveredGoalId": regime_id,
        "wholeCurrentGoalAndTwoActualPerformanceCases": next(p for p in context_profiles if p["goalId"] == regime_id),
        "scientificReasonDe": "Die bisherige Unionanpassung war nur eine Teilperspektive. Ein vollständiges Urteil über feste UND flexible Systeme fehlte, ebenso eine passende s2-Rubrik. Der Nachfolger erhält den Union-/Lohn-/Kapital-/Anpassungsfall, stellt ein wirklich eigenständiges Land X mit konkret gebundenen festen/flexiblen Regimealternativen bereit und verlangt beide Systeme nach Handelssicherheit, Zinsautonomie bei Kapitalmobilität, realer/nominaler Anpassung und ungesicherten Fremdwährungslasten zu beurteilen. Die gegebenen 1→1,20-Kurse tragen gegenläufige Import-/Schuld- und Exporterlöswirkungen; Absatz/Wohlfahrt werden nicht als sicher behauptet. Währungsunion und eigene feste Bindung werden ausdrücklich unterschieden. Aufgaben, vollständige Lösung und alle tatsächlich betroffenen Rubriktexte sind gemeinsam korrigiert, statt bloß s2 umzubenennen.",
        "wholeOriginal": bm[currency_id],
        "wholeSuccessor": currency,
        "preserved": {"goalIdAndDE_ENDescriptions": True, "GK_LK_Q3AndSourceJurisdiction": True, "maxPoints30Passing18": True, "stepIdsAnd8_7_8_7Points": True, "machineReleasedStatus": True},
        "conditionalPassingBinding": "An entirely absent or consistently replaced fixed/floating regime judgment cannot pass through unrelated union answers. Cap17 only on missing central connected performance; partial mistakes and different defensible recommendations retain partial marks, no full-mark quota.",
        "newOrdinaryGoal": False,
        "newNamedMaterial": False,
        "humanReleaseClaim": False,
        "independentScientificApprovalPending": True,
    },
    "separateOpenBoundaries": [
        "C19/753 fiscal-rules performance and GK/LK scope require a separately authored and independently reviewed successor; this package changes no C19 field.",
        "Removing nine false covered claims closes metadata findings, not the eight distinct ordinary-goal performance routes. Author of country/local materials owns genuine replacement-route candidates.",
        "Five phase-practice cluster fields are a separately frozen candidate and are unchanged in this whole material candidate; Root must compose only independently reviewed exact fields.",
        "Current source/compiler/34-view local route checks and protected Math/Physics M7 floors remain required after actual integration.",
    ],
    "strictFiveGateGain": 0,
    "newScientificOrdinaryGoalClosures": 0,
    "restoredPositiveEvidenceBindings": 0,
    "blanketReleasedMaterialApproval": False,
})
delta_path = write("actual-seven-whole-material-deltas-and-preserved494-boundaries.json", {
    "wholeInput": binding(before_input),
    "changes": changed,
    "actualPreservation": {
        "all494IdsAndOrderedGoalArrayRetained": [g["id"] for g in before["goals"]] == [g["id"] for g in candidate["goals"]],
        "other487WholeGoalsExact": True,
        "all494ContainsDE_ENDescriptionsTagsSourceAndOtherGoalFieldsExact": True,
        "allOtherGoalRequiresIncludingFivePhaseClustersExact": True,
        "sixMaterialWholeBodiesSolutionsScoringStatusExact": True,
        "onlyOneWholeMaterialBodyScientificallyChanged": currency_id,
        "all97MachineReviewStatusesExact": True,
        "allMaxPassingPointsAndStepIdsPointsExact": True,
        "allOther90WholeExamDataExact": True,
        "nineRemovedFalseDirectRequiresAndCoveredBindings": True,
        "current336CurricularAtomicUniverseRetainedNoGoalAddedOrHidden": True,
        "activeProductionFilesEdited": False,
    },
})
route_path = write("actual-nine-cut-atomic-route-consequences-candidates-only.json", {"scope": "Nine actual cut × material bindings; private atomic requires paths, no native scope approval.", "nineBindings": route_intake, "distinctRemovedOrdinaryGoalIds": sorted(reasons), "newQualifiedReplacementRoutes": 0})
candidate_path = write("whole-CAN494.seven-material-assessment-bindings-and-real-regime.inert-author-candidate.json", candidate)
manifest_path = write("actual-seven-legacy-material-author.whole-file-manifest.json", {"status": "FROZEN_AUTHOR_CANDIDATE_INDEPENDENT_REVIEW_REQUIRED", "files": [binding(p) for p in sorted(PACKAGE.rglob("*")) if p.is_file() and p.name not in {"actual-seven-legacy-material-author.whole-file-manifest.json", "actual-seven-material-current-author-freeze.handoff.json"}], "productionMutations": 0, "historicalInputsPhysicalCopiesExact": True})
handoff_path = write("actual-seven-material-current-author-freeze.handoff.json", {
    "status": "INERT_AUTHOR_CANDIDATE_PENDING_INDEPENDENT_A_SCIENTIFIC_REVIEW",
    "wholePredecessor": binding(before_input),
    "wholeCandidate": binding(candidate_path),
    "scientificAuthorDecisions": binding(science_path),
    "wholeDeltasAndPreservation": binding(delta_path),
    "actualAtomicRouteConsequencesNotApprovals": binding(route_path),
    "manifest": binding(manifest_path),
    "counts": {"existingMaterials": 7, "removedFalseCoveredAndDirectRequiresBindings": 9, "distinctFalseClaimedOrdinaryGoals": 8, "genuineWholeMaterialRegimeCorrections": 1, "wholeCurrentPerformanceCasesRead": 18, "currentCanonicalGoals": 494, "ordinaryCurricularAtomicGoals": 336},
    "strictFiveGateGain": 0,
    "newOrdinaryGoalClosures": 0,
    "restoredPositiveEvidenceBindings": 0,
    "nativeCompilerSourceRouteAndProtectedM7IntegrationChecksPending": True,
    "activeProductionEdits": 0,
    "humanApprovalTrialOrExternalReleaseClaim": False,
    "integrationInstruction": "Apply only seven requires/coveredGoalIds fields and the whole15aa task/solution/scoring successor after independent science KEEP, with whole predecessor-field guards. Do not overwrite concurrent qualified canonical/view author packages.",
})
print(json.dumps({"candidate": binding(candidate_path), "handoff": binding(handoff_path), "manifest": binding(manifest_path)}, ensure_ascii=False))
