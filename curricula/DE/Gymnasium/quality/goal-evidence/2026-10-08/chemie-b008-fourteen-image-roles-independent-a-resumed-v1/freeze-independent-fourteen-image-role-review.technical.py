#!/usr/bin/env python3
"""Record this reviewer's actual independent image observations, once only."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
ENTRY = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-fourteen-remaining-images-author-root-resumed-v1/neutral-fourteen-final-actual-image-role-candidates.independent-review.entry.json"
EXPECTED = "7037584c8b5b34cc5a180fee73194b97281767746396081b9bf8936fd3582e73"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def object_sha(obj):
    return sha(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def binding(path):
    path = Path(path)
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": sha(raw), "bytes": len(raw)}


def write_once(name, obj):
    path = OUT / name
    assert not path.exists(), f"Immutable first review already exists: {path}"
    with path.open("x") as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    return binding(path)


def verify_bound(item):
    result = binding(ROOT / item["path"])
    assert result == item, (item, result)
    return result


assert sha(ENTRY.read_bytes()) == EXPECTED
entry = json.loads(ENTRY.read_text())
snapshot_binding = verify_bound(entry["all26WholeGoalsProfiles52Cases"])
goals_binding = verify_bound(entry["exactWholeFourteenGoalsWithCandidateResourceLinks"])
snapshot = json.loads((ROOT / snapshot_binding["path"]).read_text())
goal_rows = json.loads((ROOT / goals_binding["path"]).read_text())["goals"]
selected = {r["wholeGoal"]["id"]: r for r in snapshot["routineBodies"] if r["wholeGoal"]["id"] in entry["selectedGoalIds"]}
candidate_goals = {g["id"]: g for g in goal_rows}
assert len(selected) == len(candidate_goals) == len(entry["candidates"]) == 14
assert set(selected) == set(candidate_goals) == set(entry["selectedGoalIds"])

role_reasons = {
    "lower-chemical-question-hypothesis": "Frage und beobachtungsprüfbare Temperatur-Zeit-Hypothese werden in einem konkreten Brausetablettenbeispiel verbunden. Der dargestellte Befund 80 s bei 20 °C gegenüber 35 s bei 40 °C stützt genau diese Beispielvorhersage. Die Pfeile motivieren die eigene Formulierung; die Zeichnung behauptet weder eine eigene Lernendenleistung noch eine universelle Zeit- oder Löslichkeitsregel.",
    "lower-guided-hypothesis-investigation": "Schutzbrille, Handschuhe, zwei offene Vergleichsbecher und gemeinsamer Beginn veranschaulichen eine sichere chemische Untersuchung. Der Ablauf Frage–Hypothese–Versuch–Auswertung passt zu Durchführung und Protokollierung. Der Comic ist keine Durchführungsvorschrift und ersetzt die verbindlichen realen, freigegebenen Zucker-/Leitfähigkeitsfälle mit eigenen Messwerten nicht.",
    "lower-independently-planned-hypothesis-investigation": "Der Vergleich zweier Temperaturen mit messbarer Zeit zeigt die Verbindung von Einflussgröße, Vergleich und quantitativem Untersuchungsprodukt. Das Motiv ist eine passende Orientierung für Planung und Ausführung. Es gibt keinen zusätzlichen Eigenformulierungs-Zwang vor und behauptet keine durchgeführte qualitative/quantitative Eigenleistung; beide verbindlichen Fallarten bleiben durch die unveränderten Fallkontexte erhalten.",
    "lower-chemical-data-interpretation": "Die gezeichnete Tabelle stellt einen konkreten Temperatur-Zeit-Vergleich dar; kürzere Beispielzeit stützt die im linken Feld benannte Hypothese. Daten und Schluss sind hier fachlich konsistent. Die motivierende Bildfolge verengt den Zieltext nicht auf bloßes Ablesen und behauptet weder maximale Löslichkeit noch Gültigkeit außerhalb des Beispiels.",
    "upper-quantitative-hypothesis-data-evaluation": "Die Tabelle mit zwei Zeiten je Temperatur, korrekt berechneten Mittelwerten 59/46/31 s und passenden Diagrammpunkten stellt quantitative Aufbereitung nachvollziehbar dar. Die Bildaussage ist ausdrücklich eine Beschreibung; sie macht aus dem Trend keinen ungeprüften Hypothesen- oder Falsifizierungsbeweis. Digitale Rechendatei, Regression, Residuen und fachübergreifende Interpretation bleiben unveränderte eigenständige Lernprodukte.",
    "data-validity": "Zwei Einzelzeiten je Temperatur und deren korrekte Mittelwerte bieten ein klares Datenobjekt für die Prüfung von Wiederholung, Streuung und begrenztem Trend. Das Bild unterscheidet eine Beschreibung von einem umfassenden Gültigkeitsurteil und enthält keinen X-Nachweis, keine Trinkbarkeits- oder Konzentrationsbehauptung. Die gebundenen Fälle erhalten Kontrollen, Temperaturkonfundierung und Schlussgrenzen vollständig.",
    "foreign-inquiry-process-and-reach": "Die vier zusammenhängenden Felder zeigen einen vorgegebenen Erkenntnisweg, den Lernende erklären können. Frage, Vergleichsversuch, Daten und Interpretation sind fachlich nachvollziehbar gekoppelt. Das Beispiel erlaubt die Unterscheidung von fremdem Prozess und eigener Durchführung; seine Einzelbefunde werden visuell nicht zu einer vollständigen Stoffbilanz oder allgemeinen gesellschaftlichen Bewertung erweitert.",
    "own-inquiry-process-reflection": "Die offene Frage zur Ergebnissicherheit, nachvollziehbare Methode, Prüfung von Bedingungen und Messung sowie neue Daten motivieren die Reflexion eines Untersuchungsbefunds. Fragezeichen und offene Prüffragen verhindern ein pauschales Gültigkeitssiegel. Die Zeichnung behauptet kein vorhandenes eigenes Protokoll; eigene Durchführung, fallbezogene Methodenbegründung und Verbesserungen bleiben im vollständigen Ziel-/Fallkontext verbindlich.",
    "sek1-source-information": "Messbericht, Fachtext und Werbung werden als verschiedene Informationsangebote zu einem chemischen Wasserfilterkontext gezeigt. Wer, welche Daten und welche Absicht sind erkennbare offene Auswahlfragen; kein Quellentyp wird automatisch als wahr oder falsch markiert. Das Bild unterstützt relevante Auswahl und Strukturierung, ohne eine Recherche, Quellenangabe oder Trinkbarkeit bereits zu bescheinigen.",
    "upper-source-information": "Analoge Fachtext-/Buch- und Messberichtsangebote sowie Werbung bilden einen klaren Einstieg in das eigenständige Erschließen verschiedener Quellen. Die neutralen Fragen fördern eine begründete Auswahl. Das einfache Motiv beansprucht keine vollständige komplexe Recherche- oder Zitierleistung und ersetzt weder die tatsächlichen analogen/digitalen Suchwege noch die gebundenen Modell-Arznei-/Prozessquellen.",
    "upper-source-criticism": "Die gleichrangigen Quellkarten und drei offenen Fragen veranschaulichen Aussagen-/Datenbezug, Urheberschaft und Intention ohne institutionelles Wahrheitssiegel. Die Wasserfilterdarstellung passt zum vollständig gebundenen Filter-/Absorbanzfall, ohne Farbstoffentfernung mit Trinkbarkeit gleichzusetzen. Eignung, Relevanz und Validität müssen weiterhin im konkreten Fall beurteilt werden.",
    "criteria-arguments": "Große Pro-/Kontra-Felder enthalten je Belegbuch und gleichen neutralen Kolben; die leere, ausgeglichene Waage mit Fragezeichen lässt die Gewichtung offen. Umwelt, Sicherheit und Kosten sind gut erkennbare Beispielkriterien und keine starre abschließende Kriterienliste. Es gibt weder einen pauschalen Materialgewinner noch vorformulierte Argumente, die das eigene Finden aus Rohfakten ersetzen.",
    "upper-knowledge-influences": "Technik, Gesellschaft, Umwelt und Wirtschaft weisen auf Forschungsbedingungen; Befunde prüfen bleibt als eigener großer Maßstab sichtbar. Damit werden gesellschaftliche Zustimmung und empirische Gültigkeit nicht gleichgesetzt. Das Motiv ist eine reduzierte Orientierung; soziale, kulturelle, historische und weitere tatsächliche Fallaspekte bleiben im vollständigen Zieltext und den zwei Fallkontexten erhalten.",
    "upper-chemical-effects-sustainability": "Herstellung, Nutzung und erneute Verwendung chemischer Werkstoffe werden mit Umwelt, Wirtschaft und Menschen verbunden. Eine leere Waage und zwei offene Fragen lassen die Bewertung kontextabhängig; das Bild verspricht keine emissionsfreie Wiederverwendung oder allgemeine Überlegenheit eines Werkstoffs. Alte und neuere Fabrikmotive geben einen zeitlichen Anstoß ohne behauptete historische Messdaten. Produkt-/Methoden-/Verfahrens-/Erkenntnisfolgen und eigenes Handeln bleiben durch die ganzen Fallkontexte erhalten.",
}

motif_observations = {
    "investigation": {
        "fachlicheBeobachtungDe": "Illustrative Werte 20 °C/80 s und 40 °C/35 s sind mit wärmer → kürzer konsistent. Die Brausetablette reagiert in offenen Bechern; das konkrete Beispiel ist weder Löslichkeitsgrenzmessung noch universelles Zeitgesetz. Die roten/blauen Elemente kodieren Temperatur in einer Comicdarstellung.",
        "actual360De": "Haupttitel, vier Prozessüberschriften, wärmer/kürzer, Vergleichsbecher und Schutzbrille sind erkennbar. Die kleine Beispielzeile ist Zusatz; die wesentliche Darstellung benötigt keine entzifferte Kleinschrift.",
        "actual680De": "Frage, beide Temperaturen, Zeiten und Datenstützung sind lesbar; keine notwendige Angabe wird abgeschnitten.",
        "perspectiveDe": "Die Person führt Tabletten zu den offenen Bechern. Es gibt keinen geschriebenen Heft-/Tafeleintrag aus falscher Sicht; die separate Stoppuhr ist ein äußeres Zeitmesssymbol und wird nicht als von der Person abgelesener Wert inszeniert.",
    },
    "data": {
        "fachlicheBeobachtungDe": "(60+58)/2=59, (45+47)/2=46, (30+32)/2=31; die drei Punkte bei 20/30/40 °C passen zu diesen Sekundenwerten. Beide Achsen haben richtige Größen und Einheiten. Beschreibung ist von einer Erklärung/Hypothesenprüfung getrennt.",
        "actual360De": "Alle drei Datenzeilen, Mittelwerte, Hauptachsen und großer Beschreibungssatz bleiben erkennbar. Keine wichtige Ziffer wird durch die kleine Lupe verdeckt.",
        "actual680De": "Rohwerte, Mittelwerte, Achsenskalierung und Einheiten sind klar lesbar.",
        "perspectiveDe": "Tabelle und Diagramm sind externe Darstellungen; die kleine Lupenfigur schreibt und liest keinen falsch gedrehten Eintrag.",
    },
    "validity": {
        "fachlicheBeobachtungDe": "Wiederholbarkeit, nachvollziehbare Methode, Prüfbarkeit, Widerspruchsfreiheit und Vorläufigkeit werden als offene Prüfgesichtspunkte dargestellt. Befund, Bedingungen und Messung werden geprüft, nicht automatisch bestätigt.",
        "actual360De": "Die große Ergebnisfrage, Hauptprüfüberschriften und zentraler Befund bleiben sichtbar. Kleine Zusatzwörter im Methodenfeld sind keine lesepflichtige Voraussetzung für das Motiv.",
        "actual680De": "Alle Hauptfelder und auch Methoden-/Bedingungsangaben sind lesbar; Figuren und Pfeile bleiben getrennt erkennbar.",
        "perspectiveDe": "Der schreibende Mensch wird seitlich von hinten gezeigt und kann sein Heft in eigener Richtung sehen. Die Hypothesenkarte wird als Karte nach außen präsentiert; das Tablet zeigt keine falsch gedrehten lesepflichtigen Einträge.",
    },
    "sources": {
        "fachlicheBeobachtungDe": "Die drei Quellentypen werden ohne Haken, Kreuz oder automatische Vertrauenshierarchie verglichen. Wasserfilter und Glas bilden einen chemischen Kontext; es wird kein Reinheits-/Gesundheitsurteil abgegeben.",
        "actual360De": "Quellen vergleichen, Messbericht/Fachtext/Werbung und alle drei großen Prüffragen sind lesbar. Buch, Messsymbol und Megafon sind getrennt erkennbar.",
        "actual680De": "Alle Quellkarten und Fragen sind klar lesbar; keine Quellenkarte ist verdeckt.",
        "perspectiveDe": "Keine handelnde Person liest von der falschen Seite; die Karten und ihre Beschriftungen sind bewusst für die externe Betrachtung angeordnet.",
    },
    "criteria": {
        "fachlicheBeobachtungDe": "Pro und Kontra besitzen dieselben neutralen Beleg- und Stoffsymbole. Leere gleich hohe Waagschalen und Fragezeichen treffen keine Vorabentscheidung; Kriterien werden erst zur Gewichtung herangezogen.",
        "actual360De": "Pro, Kontra, Umwelt, Sicherheit und Kosten sind lesbar; die große Waage und Belegbücher tragen den Kern ohne Kleinschrift.",
        "actual680De": "Überschrift, Kriterien und alle Symbole sind klar lesbar und passen zur freundlichen Comiclandschaft.",
        "perspectiveDe": "Die anthropomorphe Lupe weist auf eine externe Darstellung; keine Person schreibt oder liest ein verkehrt orientiertes Heft oder Instrument.",
    },
    "knowledge": {
        "fachlicheBeobachtungDe": "Vier Einflüsse führen zur Forschungsarbeit; die gesonderte Aufforderung Befunde prüfen verhindert, dass Zustimmung oder Finanzierung als Beweis dargestellt wird. Molekül, Mikroskop und Buch sind abstrakte Symbole, keine unzutreffende Stoffstruktur oder Messung.",
        "actual360De": "Technik, Gesellschaft, Umwelt, Wirtschaft, Forschungsfrage und Befunde prüfen sind lesbar; zentrale Forscherin und Einfluss-Pfeile bleiben erkennbar.",
        "actual680De": "Alle Einflüsse und der empirische Prüfmaßstab sind klar lesbar. Details sind frei von zwingender Kleinschrift.",
        "perspectiveDe": "Die Forscherin betrachtet ein symbolisches Buch ohne lesepflichtigen Text, Formel oder gerichteten Eintrag. Seine Molekül-/Welt-/Ideensymbole behaupten keinen falsch ausgerichteten eigenen Heftbefund; die äußeren Texte gehören zur Gesamtgrafik.",
    },
    "effects": {
        "fachlicheBeobachtungDe": "Glas und Kunststoff führen über Herstellung/Nutzung/erneute Verwendung zu drei Wirkungsperspektiven. Fragezeichen und leere Waage setzen keinen ökologischen Gewinner. Die verschiedenen Fabrikbilder sind historische/aktuelle Symbole und keine quantitative Vergleichsstudie; Recycling bedeutet visuell nicht folgenlos.",
        "actual360De": "Bottles, Nutzung, erneute Verwendung, Umwelt/Wirtschaft/Menschen und große Folgefrage sind erkennbar. Das längere Wort Materialherstellung ist klein, aber Herstellung wird auch durch Fabriken und Materialflaschen unmittelbar dargestellt.",
        "actual680De": "Sämtliche Hauptlabels einschließlich Materialherstellung sind gut lesbar; Waage und drei Wirkungsperspektiven sind klar getrennt.",
        "perspectiveDe": "Die nachdenkliche Figur betrachtet die Gegenstände; sie schreibt und liest keine falsch orientierte Notiz. Die Fragen sind äußere Sprech-/Denkdarstellung.",
    },
}

timestamp = datetime.now(timezone.utc).isoformat()
verified_refs = {}
actual_views = {}
rows = []
for c in entry["candidates"]:
    gid = c["goalId"]
    source_row = selected[gid]
    actual_goal = candidate_goals[gid]
    original_goal = source_row["wholeGoal"]
    assert {k: v for k, v in actual_goal.items() if k != "resourceLinks"} == {k: v for k, v in original_goal.items() if k != "resourceLinks"}
    link = c["resourceLink"]
    image_links = [r for r in actual_goal["resourceLinks"] if r.get("type") == "goal-visualization" and r.get("role") == "primary" and r.get("lang") == "de"]
    assert image_links == [link]
    assert link["skillpilotId"] == gid
    assert link["title"] == "Visualisierung: " + actual_goal["title"]
    assert link["url"] == f"/assets/goal-visualizations/chemie/{gid}/{gid}{Path(c['candidateAsset']['path']).suffix}"
    assert link["resourceType"] == "image" and link["reviewStatus"] == "pilot" and link["license"] == "CC-BY-4.0"
    for field in ["originalAsset", "candidateAsset", "actual360", "actual680"]:
        r = verify_bound(c[field])
        verified_refs[r["path"]] = r
    for prompt in c["availableActualPrompts"]:
        r = verify_bound(prompt)  # Verify bytes only, no author judgments are read.
        verified_refs[r["path"]] = r
    assert c["originalAsset"]["sha256"] == c["candidateAsset"]["sha256"]
    with Image.open(ROOT / c["originalAsset"]["path"]) as img:
        assert list(img.size) == c["actualDimensions"]
        assert img.format == c["actualFormat"]
        for field, width in [("actual360", 360), ("actual680", 680)]:
            with Image.open(ROOT / c[field]["path"]) as derivative:
                assert derivative.width == width
                height = round(img.height * width / img.width)
                assert derivative.height == height
                reference = img.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
                assert ImageChops.difference(reference, derivative.convert("RGB")).getbbox() is None, (gid, field)
                actual_views[c[field]["path"]] = {**c[field], "width": width, "height": height, "actuallyViewedByIndependentReviewer": True, "pixelExactLanczosDerivativeOfBoundOriginal": True}
        actual_views[c["originalAsset"]["path"]] = {**c["originalAsset"], "width": img.width, "height": img.height, "actualFormat": img.format, "actuallyViewedByIndependentReviewer": True}
    profile = source_row["wholeProfile"]
    assert profile["essentialUnderstanding"] == {"de": original_goal["description"], "en": original_goal["descriptionEn"]}
    assert profile["status"] == "ai_candidate" and profile["reviewStatus"] == "needs_human_review"
    assert profile["evidenceLevel"] == "E1" and profile["generationLevel"] == "G1"
    cases = source_row["wholeTwoCases"]
    assert len(cases) == 2
    assert all(not case["learnerPerformanceRecorded"] and not case["humanApproval"] and not case["humanTrial"] for case in cases)
    rows.append({
        "goalId": gid,
        "candidateKey": c["candidateKey"],
        "imageRole": c["imageRole"],
        "decision": "KEEP",
        "reasonDe": role_reasons[c["candidateKey"]],
        "currentWholeGoalInputObjectSha256": object_sha(original_goal),
        "exactBoundCandidateGoalObjectSha256": object_sha(actual_goal),
        "wholeProfileInputObjectSha256": object_sha(profile),
        "wholeTwoCasesInputObjectSha256": object_sha(cases),
        "caseKeysActuallyReadBothLanguages": [case["caseKey"] for case in cases],
        "originalAsset": c["originalAsset"],
        "candidateAsset": c["candidateAsset"],
        "actual360": c["actual360"],
        "actual680": c["actual680"],
        "resourceLink": link,
        "motifScientificAndVisualObservation": motif_observations[c["imageRole"]],
        "blockingFindings": [],
        "historicalMachineOrHumanApprovalInherited": False,
        "humanApproval": False,
        "humanTrial": False,
        "nativeWholeGoalPageContextReviewPending": True,
        "activeVisualizationApprovalWritten": False,
    })

assert len({r["originalAsset"]["sha256"] for r in rows}) == 7
assert len(actual_views) == 21
inputs_receipt = write_once("actual-input-bindings.independent-a.receipt.json", {
    "schemaVersion": 1,
    "recordedAt": timestamp,
    "reviewerId": "chemistry_fourteen_image_roles_independent_a",
    "neutralEntry": binding(ENTRY),
    "all26WholeGoalsProfiles52Cases": snapshot_binding,
    "exactWholeFourteenGoalsWithCandidateResourceLinks": goals_binding,
    "verifiedAssetAndPromptBindings": list(verified_refs.values()),
    "wholeGoalScienceUnchangedForAllFourteen": True,
    "wholeFourteenGoalDescriptionsActuallyReadDeAndEn": True,
    "wholeFourteenProfileAndTwentyEightCaseContextsActuallyReadDeAndEn": True,
    "unchangedOtherTwelveImagesNotReviewedAgain": True,
    "authorAndPeerVerdictsReadBeforeOwnFirstFreeze": False,
    "actualGenerationProvenanceOnlyHashBoundNotReadBeforeFirstVerdict": binding(ROOT / entry["actualGenerationProvenance"]["path"]),
    "objectHashEncoding": "UTF-8 JSON ensure_ascii=False sort_keys=True separators=(',', ':')",
    "activeWrites": 0,
})
views_receipt = write_once("actual-seven-originals-and-fourteen-responsive-views.independent-a.receipt.json", {
    "schemaVersion": 1,
    "recordedAt": timestamp,
    "actualOriginals": 7,
    "actualResponsiveViews": 14,
    "images": list(actual_views.values()),
    "technicalVerificationIsNotTheVisualJudgment": True,
    "manualMotifObservations": motif_observations,
})
verdict = write_once("fourteen-actual-image-role-decisions.independent-a.first.verdict.json", {
    "schemaVersion": 1,
    "reviewId": "chemie-b008-fourteen-image-roles-independent-a-resumed-20261008-v1",
    "recordedAt": timestamp,
    "reviewerId": "chemistry_fourteen_image_roles_independent_a",
    "independentMachineImageRoleReview": True,
    "authorAndPeerVerdictsReadBeforeOwnFirstFreeze": False,
    "inputsReceipt": inputs_receipt,
    "actualViewsReceipt": views_receipt,
    "decisions": rows,
    "summary": {"KEEP": 14, "HOLD": 0, "blockingFindings": 0},
    "scopeLimits": {
        "actualImageRoleCandidateAcceptanceOnly": True,
        "nativeDAndP26CompletionClaimed": False,
        "sourceAtlas395ApprovalClaimed": False,
        "knownThirtyEightSourceHoldsNotReviewedOrClosedByThisReview": True,
        "activeVisualizationApprovalsWritten": 0,
        "strictCompletionsAdded": 0,
        "humanApproval": False,
        "humanTrial": False,
    },
    "nonBlockingDidacticLimits": [
        "Reduced motivational images do not replace whole goal scopes, independent learner products, source obligations or assessment contexts.",
        "The validity motif's small method sublabels are secondary; the main open checks and objects remain legible at 360 px.",
        "The sustainability motif's leaf on a container is a decorative label, not an ecological rating; the empty balance and open questions do not select a material winner.",
    ],
})
first_freeze = write_once("independent-a.first-verdict.freeze.json", {
    "schemaVersion": 1,
    "frozenAt": timestamp,
    "immutableFirstIndependentVerdict": True,
    "authorAndPeerVerdictsReadBeforeFirstFreeze": False,
    "files": [inputs_receipt, views_receipt, verdict],
    "activeWrites": 0,
})
neutral_forward = json.loads(ENTRY.read_text())
neutral_forward["role"] = "Neutral selected actual fourteen image-role inputs for a separate independent reviewer; contains no verdict"
neutral_forward["firstAuthorNeutralEntry"] = binding(ENTRY)
forward = write_once("neutral-fourteen-actual-image-role-inputs.independent-a.forward.entry.json", neutral_forward)
completed = write_once("neutral-independent-a.completed.entry.json", {
    "schemaVersion": 1,
    "role": "Root-only completion pointers for independent A image role review",
    "firstVerdict": verdict,
    "firstFreeze": first_freeze,
    "neutralSeparateReviewerInput": forward,
    "activeWrites": 0,
    "strictCompletionsAdded": 0,
    "humanApproval": False,
    "humanTrial": False,
})
print(json.dumps({"completedEntry": completed, "firstVerdict": verdict, "firstFreeze": first_freeze, "neutralForward": forward}, ensure_ascii=False))
