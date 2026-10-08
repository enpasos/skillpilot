"""Materialize inert independent source-boundary findings; no live writes."""
from __future__ import annotations

import copy
import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-by-ten-profile-concretization-author-candidate-v2"
CANONICAL = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json"
REVIEWER = {"provider": "OpenAI", "tool": "Codex session", "exactModel": "not disclosed", "independentAgent": "/root/economics_layer_a", "status": "ai_candidate"}
NOW = datetime.now(timezone.utc).isoformat()

def read(p):
    return json.loads(p.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def objsha(o):
    return hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()

def write(name, value):
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("x") as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return {"path": str(p.relative_to(ROOT)), "sha256": sha(p)}

# Every disposition below follows actual reading of complete source rows,
# complete historical passages, ten new DE/EN competence texts and the 42
# other distinct current competence texts. Numbers refer only to this frozen
# author input's explicit ordered records, never to historical grand totals.
DISPOSITIONS = [
 ("remove", "Wissenschaftssystem einordnen ist keine Innovationswirkungsanalyse.", "Orientation 6bf prüft ausdrücklich kein Fachwissen; c494 beschreibt nur eine unbestimmte Marktvertiefung. Die Einordnung als Wissenschaftssystem ist durch diese Resttexte nicht konkret belegt."),
 ("remove", "VWL und BWL unterscheiden ist keine Innovationswirkungsanalyse.", "Der verbleibende c494-Text verlangt weder die Unterscheidung von Volks- und Betriebswirtschaftslehre noch deren Gegenstandsbereiche. Keine Vollabdeckung aus einer allgemeinen Marktvertiefung ableiten."),
 ("partial", "Der Vergleich nach Eigentum und Koordination trägt einen begrenzten Ordnungsvergleich. Eine bereitgestellte Gemeinwohl-Konzeption ist aber keine vollständige Behandlung aller Idealtypen und wird von dieser Fremdquelle nicht namentlich gefordert.", "9ca diskutiert ordnungspolitische Schulen und Maßnahmen. Zusammen mit dem engen f7-Vergleich ist nur eine konkrete Teiloperation belegt; weitere Idealtypen und deren systematische Unterscheidung sind hier nicht vollständig freigegeben."),
 ("remove", "EZB-Instrumente, Wirkungswege und Hemmnisse betreffen die Geldpolitik; Portfoliogewichte und Diversifikation erfüllen diese Operation nicht.", "f913 nennt Instrumente/Wirkungen; 676 Geldschöpfung/Zinssteuerung; f70 makroökonomische Wirkungen. Diese Texte tragen Teilaspekte, beweisen für sich aber nicht sämtliche verlangten Wirkungshemmnisse. Übrige Haushalts-/Anlagetexte sind keine Instrumentenprüfung."),
 ("remove", "Interessenkonflikte von Euromitgliedstaaten mit Geldwertstabilität sind keine Portfoliooperation.", "024 ordnet EZB-Entscheidungen am Mandat ein; 406 behandelt stabile Kaufkraft. Die spezifischen Interessen verschiedener Mitgliedstaaten und ihre Konfliktbeziehungen stehen nicht ausdrücklich in den Resttexten. Fiskal-/Steuer-/Schuldenthemen ersetzen diesen Zusammenhang nicht automatisch."),
 ("remove", "Den Prozess der Giralgeldschöpfung erläutern ist von Wertpapierrendite und Diversifikation verschieden.", "676 verlangt Geldschöpfung und ist der direkte einschlägige Resttext. Seine unveränderten gültigen eigenen Nachweise werden hier nicht neu bewertet. Der Wegfall der falschen Portfoliozuordnung ist kein Beweis, dass alle weiteren zehn Restzuordnungen fachlich nötig oder vollständig sind."),
 ("remove", "M3 ist eine Geldmengenabgrenzung; gewichtete Portfoliorendite erklärt keine ihrer Komponenten.", "Keiner der zehn Resttexte nennt die Bestandteile von M3 ausdrücklich. Allgemeine Geldfunktionen, Geldschöpfung oder EZB-Instrumente dürfen nicht ohne zusätzlichen konkreten Nachweis als die M3-Operation ausgegeben werden."),
 ("remove", "Zins- und Mengentender sind verschiedene Zuteilungsverfahren; Portfolioertrag und Kurskorrelation unterscheiden sie nicht.", "f913 trägt den Instrumentenbereich, benennt aber in seinem Zieltext keinen Tendervergleich. Die konkrete Zins-/Mengentender-Unterscheidung bleibt durch diese Textsichtung unbelegt, nicht durch ein anderes Finanzthema automatisch geschlossen."),
 ("remove", "Möglichkeiten und Grenzen der Geldpolitik sind keine Möglichkeiten und Grenzen privater Diversifikation.", "f913/024/8ebb sind einschlägige Instrumenten-/Mandats-/Inflationstexte. Deren unveränderte separate Nachweise bleiben erhalten; diese begrenzte Quellentupleprüfung behauptet keine vollständige neue Prüfung aller geldpolitischen Grenzen."),
 ("remove", "Die Dilemmamethode für geldpolitische Interessenkonflikte wird durch eine Portfolioanalyse nicht verlangt.", "Keiner der zehn Resttexte verlangt die Dilemmamethode. Allgemeines Erklären von Instrumenten oder Nachvollziehen von Entscheidungen ersetzt die ausdrücklich geforderte Methode nicht."),
 ("remove", "Periodenbezogene Effizienz geldpolitischer Instrumente ist nicht die Rendite eines privaten Wertpapierportfolios.", "024 liefert monetäre und realwirtschaftliche Größen zur mandatsbezogenen Entscheidungseinordnung; f913 liefert Instrumentwirkungen. Das ist ein fachlicher Anschluss, aber keine automatische neue Vollfreigabe der periodenbezogenen Wirksamkeitsbeurteilung."),
 ("remove", "Der Grundaufbau der Zahlungsbilanz betrifft volkswirtschaftliche Außenkonten, nicht private Portfoliogewichte.", "8a interpretiert die Leistungsbilanz unter Einbezug der Kapitalbilanz. Das liefert einen Anschluss; der Grundaufbau der gesamten Zahlungsbilanz steht nicht ausdrücklich im Zieltext. Handels-, Wechselkurs-, Haushalts- und Buchführungstexte dürfen nicht pauschal als Ersatz aller Konten gelten."),
 ("remove", "Zahlungsbilanzausgleichsmechanismen sind keine Diversifikationsmechanismen eines privaten Portfolios.", "8a sowie 13b/995 tragen Außenbilanz- bzw. Wechselkursbezüge. Eine ausdrückliche Darstellung der Ausgleichsmechanismen ist aus diesen allgemeinen Resttexten nicht vollständig nachgewiesen."),
 ("remove", "Unternehmensfinanzwirtschaft und betriebliche Zahlungsfähigkeit sind von privatem Portfolioertrag zu unterscheiden.", "e7 und 15d tragen Unternehmensfinanzierung und finanzwirtschaftliche Ziele. Die konkrete Beziehung zur Zahlungsfähigkeit ist als enger Anschluss zu prüfen; übrige Haushalts- und Organisationszuordnungen sind keine automatische fachliche Vollabdeckung."),
 ("remove", "Betriebliche Liquiditäts-, Anlagendeckungs-, Rentabilitäts- und Verschuldungskennziffern sind keine gewichtete Wertpapierrendite.", "ae7 nennt ausgewählte Kennzahlen, aber nicht ausdrücklich die ganze geforderte Vierergruppe. Bilanzaufstellung oder grafische Darstellung ersetzt weder die Erklärung jeder geforderten Kennziffer noch deren Aussagegrenzen."),
 ("remove", "Die Berechnung der vier genannten betrieblichen Kennziffern wird durch eine private Portfoliorechnung nicht erfüllt.", "ae7 ermittelt ausgewählte Kennzahlen und ist einschlägig. Aus 'ausgewählt' folgt keine vollständige Abdeckung aller vier ausdrücklich geforderten Kennziffern. Übrige Resttexte wurden nicht als Ersatzrechnungen akzeptiert."),
 ("remove", "Geldfunktionen und Entwicklungen des Zahlungsverkehrs sind keine Portfolioertrags-/Diversifikationsrechnung.", "406 nennt zentrale Geldfunktionen; e2 wählt Zahlungsarten situationsbezogen. Der Entwicklungsaspekt des Zahlungsverkehrs ist damit nicht ausdrücklich vollständig belegt. Haushaltsbudget und Anlagekriterien schließen diesen Teil nicht automatisch."),
 ("partial", "Rendite und Diversifikationsgrenzen sind vergleichbare Eigenschaften vorgegebener Anlageportfolios. Das ist nur ein Teilbeitrag zum Vergleich von Geldanlagemöglichkeiten, keine Abdeckung von Kreditarten oder sämtlichen Anlageformen.", "047 liefert ausgewählte Anlagekriterien. Keiner der übrigen zehn Resttexte nennt die verlangte Verschiedenheit der Kreditarten konkret. Keine Vollabdeckung der gesamten Kredit-/Anlagevergleichszeile oder ihrer Beispiele behaupten."),
 ("partial", "Rendite und Diversifikationsgrenzen liefern begrenzte Anlagekriterien für eine Beurteilung. Das neue Ziel verlangt jedoch keine vollständige Eignungsentscheidung anhand von Einkommen und Vermögen und keine Prüfung von Kreditarten.", "e5 Budget und 047 Anlagekriterien bilden Anschlüsse an Haushaltsbedingungen. Der Portfolio-Teil bleibt eng; Einkommens-/Vermögenseignung, Liquiditätsbedarf, Kreditarten und die ganze Fallbeurteilung werden durch ihn nicht als abgeschlossen gezählt."),
 ("remove", "Die eigene Geld- und Konsumreflexion wird nicht durch die Rechnung an vorgegebenen Portfolios verlangt.", "a60 verlangt reflektierte eigene Konsumentscheidungen bei knappen Mitteln; 047 reflektiert Anlageentscheidungen und e5 plant Budgets. Diese bestehenden Anschlüsse bleiben unangetastet. Die neue Portfoliofassung fügt keine persönliche Reflexion hinzu."),
 ("remove", "Geschäftsbankfunktionen in Einlagen- und Kreditgeschäften sind keine Diversifikationsrechnung.", "6f75 analysiert die Bedeutung von Geld-/Kapitalmarktakteuren, aber nennt nicht ausdrücklich Einlagen-/Kreditfunktionen von Geschäftsbanken. Unternehmensorganisation, Projektmodell und Berufswahl liefern dafür keine konkrete Ersatzoperation."),
 ("partial", "Baustellen-/Inselfertigung operationalisiert eine ausgewählte Fertigungsverfahrens-Vertiefung. Der alte Snapshot enthält nur die breite WWG-Vertiefungszeile, keine vollständige Abdeckung aller Produktionsinhalte.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Die Bindung ist ausgewählte Teilabdeckung; die aktuelle amtliche Inhaltswahl benötigt die separate Primärquellenprüfung und ist nicht aus dem generischen Snapshot allein bewiesen."),
 ("partial", "Die Beschäftigung Minderjähriger ist ein ausgewählter Schutzrechtsfall. Die breite historische Rechtsvertiefung ist damit weder insgesamt noch für alle möglichen Normengebiete erfüllt.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Nur der im Zieltext begrenzte Regeltest wird gebunden; bereitgestellte Normen müssen aktuell sein. Keine pauschale rechtliche Vollabdeckung."),
 ("partial", "Innovationswirkungen sind ein ausgewählter Unternehmens-/Gesellschaftsbezug. Die breite historische Vertiefung von 10.1 nennt selbst keine vollständigen Innovationsinhalte.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Nur diese gewählte Wirkungspfadanalyse wird gebunden; weitere Inhalte und Vertiefungsalternativen bleiben außerhalb."),
 ("partial", "Zivil-/Strafverfahrensvergleich ist ein ausgewählter Rechtsvertiefungsinhalt. Er ersetzt nicht die gesamte 9.1/10.2-Rechtsvertiefung oder die tatsächliche Teilnahme an einem Gerichtsbesuch.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Zweck/Rollen/Grundschritte/Ergebnisgrenzen werden eng gebunden; kein belegloser Erfahrungs- oder vollständiger Prozessrechtsnachweis."),
 ("partial", "Die konkrete bereitgestellte Gemeinwohl-Konzeption ist eine ausgewählte Alternative zur Sozialen Marktwirtschaft. Sie repräsentiert weder jede Gemeinwohlökonomie-Variante noch alle alternativen Wirtschaftsordnungen.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Nur die beschriebenen Regeln und Vergleichsachsen werden gebunden; der ganze optionale Profilbereich ist nicht vollständig abgeschlossen."),
 ("partial", "Die begründete Zuständigkeitszuordnung verschiedener Gerichtszweige ist ein ausgewählter Gerichtsstrukturinhalt. Sie ist keine gesamte Rechtsvertiefung und keine Vollprüfung aller Gerichtsinstanzen/Verfahrensregeln.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Nur die bereitgestellten Zuständigkeitsregeln und Fälle tragen die Zieloperation."),
 ("partial", "Faktorproportionen operationalisieren eine ausgewählte zusätzliche Handelstheorie. Andere Optionen wie die Produktlebenszyklustheorie und der ganze internationale Vertiefungsbereich bleiben außerhalb.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Die Bindung gilt unter den im Zieltext verlangten Modellannahmen; keine globale empirische Erklärung aller Handelsmuster."),
 ("partial", "Gewichtete Rendite und Diversifikationsgrenzen operationalisieren ausgewählte Portfolioaspekte. Der ganze optionale Kapitalmarkt-/Geldanlageprofilbereich wird nicht erfüllt.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Keine Vollbindung sämtlicher Anlageformen, Transaktionsregeln oder individueller Anlageberatung."),
 ("partial", "Bedingte spieltheoretische Vorhersagen mit bereitgestellten Versuchsdaten vergleichen ist eine ausgewählte Spiel-/Experimentoperation. Eine eigene Experimentdurchführung und alle institutionenökonomischen Vertiefungsinhalte werden nicht beansprucht.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Modell- und Versuchsbedingungen begrenzen die Teilbindung ausdrücklich."),
 ("partial", "Die statische Reserven-/Förderungsreichweite operationalisiert einen ausgewählten Rohstoffgrenzeninhalt. Sie bildet weder alle Zukunftstrends ab noch prognostiziert sie einen festen Erschöpfungszeitpunkt.", "Kein weiteres aktuelles Mapping für dieselbe Source-ID. Nur R/P samt Prognosegrenze wird gebunden; alternative Trendinhalte bleiben außerhalb."),
 ("remove", "Die BW-Zeile verlangt verhaltensökonomische Akteursmotive und die Darstellung von Anleihen, Devisen und Derivaten. Portfoliogewichte/Erträge und Kurskorrelation verlangen keine dieser Darstellungs- oder Motivoperationen. Ein bloßer Anlagekontext ist kein ausreichender partieller Kompetenznachweis.", "6f75 analysiert Akteursbedeutung, nicht ausdrücklich verhaltensökonomische Motive; f0b0 erläutert Derivate/Rolle, nicht die ganze Anleihen-/Devisen-/Derivategruppe. Diese beiden Resttexte beweisen keine vollständige Abdeckung. Die Portfolio-Tuple wird zusätzlich zum Autorvorschlag entfernt."),
 ("remove", "Wissenschaftssystem einordnen ist keine Innovationswirkungsanalyse.", "Wie BB: Orientation 6bf prüft kein Fachwissen und c494 ist eine unbestimmte Marktvertiefung. Keine konkrete vollständige Wissenschaftssystemabdeckung durch diese Resttexte."),
 ("remove", "VWL und BWL unterscheiden ist keine Innovationswirkungsanalyse.", "Wie BB: Der verbleibende c494-Text verlangt die BWL-/VWL-Unterscheidung nicht ausdrücklich. Keine vollständige Quellenabdeckung aus einer allgemeinen Marktvertiefung."),
 ("partial", "Der konkrete Vergleich von Zielsetzung/Eigentum/Koordination trägt eine begrenzte Ordnungsvergleichsoperation. Die Fremdquelle fordert keine benannte Gemeinwohl-Konzeption und wird nicht als durch alle Idealtypen vollständig erfüllt ausgegeben.", "Wie BB: 9ca diskutiert ordnungspolitische Schulen/Maßnahmen. Dieser Anschluss plus enger f7-Vergleich begründet nur ausgewählte Teilaspekte, keine vollständige Behandlung aller Idealtypen."),
]

def main():
    source_input = AUTHOR / "actual-thirty-five-historical-source-tuples-and-bounded-content-dispositions.author.json"
    rows = read(source_input)["records"]
    goals = read(AUTHOR / "whole-goals.candidate.json")
    goals = goals.get("goals", goals) if isinstance(goals, dict) else goals
    goal_by_id = {g["id"]: g for g in goals}
    live_goals = {g["id"]: g for g in read(CANONICAL)["goals"]}
    assert len(rows) == len(DISPOSITIONS) == 35 and len(goals) == 10
    maps, source_files, passages, other_goals = {}, {}, {}, {}
    actual_current_changes = {}
    records, patches = [], []
    same_source_other_count = 0
    for i, (r, (action, rationale, residual)) in enumerate(zip(rows, DISPOSITIONS)):
        mp = ROOT / r["mappingPath"]
        sp = ROOT / r["sourceExtractionPath"]
        maps.setdefault(r["mappingPath"], read(mp))
        source_files.setdefault(r["sourceExtractionPath"], read(sp))
        m, s = maps[r["mappingPath"]], source_files[r["sourceExtractionPath"]]
        old = r["wholeHistoricalMappingTuple"]
        assert m["mappings"].count(old) == 1
        assert r["wholeOriginalSourceRow"] in s["sourceGoals"]
        assert r["wholeHistoricalSourcePassage"] in s["passages"]
        prior = next(d for d in m["decisions"] if d["sourceGoalId"] == old["legacyGoalId"])
        assert prior == r["wholePriorSourceDecision"]
        actual_other = [x for x in m["mappings"] if x["legacyGoalId"] == old["legacyGoalId"] and x != old]
        assert actual_other == r["otherExistingWholeMappingsForSameSourceID"]
        same_source_other_count += len(actual_other)
        for g in r["otherExistingCanonicalGoalTexts"]:
            current = live_goals[g["id"]]
            if current != g:
                # This genuine current successor was separately actually read:
                # whole c494 plus all three whole DE/EN child competencies.
                # It is not a fingerprint-only continuation.
                assert g["id"] == "c49497e8-a139-5bfb-8a47-39aa72d8cbf3"
                assert current["description"] == "Dieser fachliche Cluster bündelt Preiselastizität, zusätzliche Kosten und Nutzen sowie Anbieterstrukturen."
                assert current["contains"] == ["c3512617-8522-5751-8660-5241a6379790", "b08b7a2e-e281-5dc8-b79d-5d44032fb6cc", "273809d9-bc31-5c1b-8a58-149dd61d2ba0"]
                actual_current_changes[g["id"]] = {"wholeAuthorSnapshot": g, "wholeCurrentCluster": current, "wholeCurrentChildren": [live_goals[k] for k in current["contains"]], "actualWholeClusterAndAllThreeChildCompetenceTextsRead": True, "findingDe": "Auch der aktuelle BY-Cluster und seine drei Kinder zu Elastizität, zusätzlichen Kosten/Nutzen und Anbieterstruktur verlangen weder Wissenschaftssystem-Einordnung noch VWL/BWL-Unterscheidung. Die BB/BE-Bindungen tragen damit auch nach diesem tatsächlichen Nachsehen keine konkrete vollständige Fachabdeckung.", "scopeOrGoalFieldsEdited": False}
            other_goals[g["id"]] = g
        passages[(r["sourceExtractionPath"], r["wholeHistoricalSourcePassage"]["id"])] = r["wholeHistoricalSourcePassage"]
        after_tuple = None if action == "remove" else {**old, "matchType": "partial"}
        new_ids = [x["canonicalGoalId"] for x in actual_other]
        if after_tuple is not None:
            # Preserve the prior decision's existing order, including this tuple.
            new_ids = list(prior["canonicalGoalIds"])
        else:
            new_ids = [v for v in prior["canonicalGoalIds"] if v != old["canonicalGoalId"]]
        after_decision = copy.deepcopy(prior)
        after_decision.update({"canonicalGoalIds": new_ids, "matchType": "partial", "rationale": f"Begrenzte aktuelle Quellentupleprüfung: {rationale} Restgrenze: {residual} Keine neue fachliche Vollabdeckung der ganzen Source-Zeile oder des ganzen Landeslehrplans behauptet.", "reviewedAt": NOW, "reviewer": "OpenAI/Codex session; independent agent /root/economics_layer_a; exact model not disclosed", "sourceCoverageBoundary": {"status": "partial_or_unresolved_full_coverage", "sourceTupleScopeOnly": True, "fullSourceCoverageApproved": False, "otherMappingQualityReapproved": False, "humanApprovalClaimed": False}})
        if i in [0, 1, 32, 33]:
            residual += " Tatsächlicher aktueller Nachfolger zusätzlich vollständig gegengelesen: c494 ist nun ein BY-Cluster mit drei Kindern zu Preiselastizität, zusätzlichen Kosten/Nutzen und Anbieterstrukturen. Auch diese drei aktuellen Kompetenztexte verlangen die Quellenoperation nicht. Keine automatische Fremdlandprojektion wird daraus geändert."
            after_decision["rationale"] = f"Begrenzte aktuelle Quellentupleprüfung: {rationale} Restgrenze: {residual} Keine neue fachliche Vollabdeckung der ganzen Source-Zeile oder des ganzen Landeslehrplans behauptet."
        records.append({"index": i, "sourceGoalId": old["legacyGoalId"], "goalId": old["canonicalGoalId"], "mappingPath": r["mappingPath"], "sourceExtractionPath": r["sourceExtractionPath"], "reviewer": REVIEWER, "verdict": "REVISE" if action == "remove" or old["matchType"] == "exact" else "KEEP_PARTIAL_ONLY", "proposedTupleAction": action, "actualSourceRowRead": True, "actualWholePassageRead": True, "actualNewDEENCompetenceRead": True, "wholeOriginalSourceRow": r["wholeOriginalSourceRow"], "wholePassageId": r["wholeHistoricalSourcePassage"]["id"], "wholePassageSha256": objsha(r["wholeHistoricalSourcePassage"]), "wholeNewCompetenceText": {k: goal_by_id[old["canonicalGoalId"]].get(k) for k in ["id", "title", "description", "titleEn", "descriptionEn", "requires", "contains"]}, "originalTuple": old, "proposedTuple": after_tuple, "rationaleDe": rationale, "remainingSourceCoverageBoundaryDe": residual, "otherExistingSameSourceTuplesUnchanged": actual_other, "sameSourceOtherGoalTextReviewIsNotNewAMDPApproval": True, "authorDispositionAgreement": not (i == 31), "liveWrites": 0, "newStrictClosures": 0})
        patches.append({"mappingPath": r["mappingPath"], "index": i, "sourceGoalId": old["legacyGoalId"], "wholeBeforeTuple": old, "wholeAfterTuple": after_tuple, "wholeBeforeDecision": prior, "wholeAfterDecision": after_decision})
    assert len(passages) == 14 and len(other_goals) == 42
    guards = []
    outputs = []
    for map_path, original in maps.items():
        candidate = copy.deepcopy(original)
        selected = [p for p in patches if p["mappingPath"] == map_path]
        for p in selected:
            old = p["wholeBeforeTuple"]
            idx = candidate["mappings"].index(old)
            if p["wholeAfterTuple"] is None:
                del candidate["mappings"][idx]
            else:
                candidate["mappings"][idx] = p["wholeAfterTuple"]
            didx = candidate["decisions"].index(p["wholeBeforeDecision"])
            candidate["decisions"][didx] = p["wholeAfterDecision"]
        candidate["reviewId"] = original["reviewId"] + "-BOUNDED-BY10-SOURCE-TUPLES-INDEPENDENT-20261008-CANDIDATE-V1"
        candidate["status"] = "incomplete"
        candidate["summary"]["exactMappings"] = sum(d.get("matchType") == "exact" for d in candidate["decisions"])
        candidate["summary"]["partialMappings"] = sum(d.get("matchType") == "partial" for d in candidate["decisions"])
        candidate["boundedSuccessorReview"] = {"status": "ai_candidate", "reviewer": REVIEWER, "actualTupleCount": len(selected), "wholeUnchangedSourceExtractionPath": original["sourceExtractionPath"], "completeStatusNotCarriedForward": True, "structuralMappedCountsAreNotFullCurriculumCoverage": True, "fullLandeslehrplanApproval": False, "otherMappingQualityReapproved": False, "applicabilityTagsOrViewRolesEdited": False, "primaryCurrentBYSelectedOptionReviewSeparate": True}
        affected_ids = {p["sourceGoalId"] for p in selected}
        assert [d for d in original["decisions"] if d["sourceGoalId"] not in affected_ids] == [d for d in candidate["decisions"] if d["sourceGoalId"] not in affected_ids]
        target_pairs = {(p["wholeBeforeTuple"]["legacyGoalId"],p["wholeBeforeTuple"]["canonicalGoalId"]) for p in selected}
        untouched = lambda doc: [x for x in doc["mappings"] if (x["legacyGoalId"],x["canonicalGoalId"]) not in target_pairs]
        assert untouched(original) == untouched(candidate)
        op = write("mapping-successors/" + Path(map_path).name + ".candidate.json", candidate)
        outputs.append(op)
        guards.append({"mappingPath": map_path, "wholeOriginalSha256": sha(ROOT/map_path), "candidate": op, "originalTupleCount": len(original["mappings"]), "candidateTupleCount": len(candidate["mappings"]), "affectedDecisions": len(selected), "allNonTargetTuplesWholeEqual": True, "allUnaffectedDecisionsWholeEqual": True, "currentSourcePathUnchanged": True, "foreignCurrentCourseDecisionsUnchanged": True})
    manifests = [{"path": p, "sha256": sha(ROOT/p)} for p in maps] + [{"path": p, "sha256": sha(ROOT/p)} for p in source_files] + [{"path": str(CANONICAL.relative_to(ROOT)), "sha256": sha(CANONICAL)}, {"path": str(source_input.relative_to(ROOT)), "sha256": sha(source_input)}, {"path": str((AUTHOR/"whole-goals.candidate.json").relative_to(ROOT)), "sha256": sha(AUTHOR/"whole-goals.candidate.json")}]
    changed_output = write("actual-one-current-c494-cluster-and-three-child-source-boundary-countercheck.receipt.json", {"reviewer": REVIEWER, "reviewedAt": NOW, "status": "ai_candidate", "actualCurrentCanonicalSha256": sha(CANONICAL), "41OtherGoalObjectsWholeEqualAuthor": len(other_goals) - len(actual_current_changes) == 41, "actualChangedGoalCount": len(actual_current_changes), "changes": list(actual_current_changes.values()), "humanApprovalClaimed": False, "liveWrites": 0})
    core = {"reviewId": "wirtschaft-by-ten-35-source-tuples-independent-20261008-v1", "reviewedAt": NOW, "reviewer": REVIEWER, "status": "ai_candidate", "counts": {"actualTargetTuples": 35, "foreignRemoved": 21, "foreignStrictPartialRetained": 4, "BYExactToPartial": 10, "wholeHistoricalSourceRows": 35, "wholeHistoricalPassageObjects": 14, "newDEENCompetenceTexts": 10, "otherDistinctAuthorCompetenceTexts": 42, "otherCurrentWholeUnchangedGoals": 41, "actualCurrentChangedWholeClusterRechecked": 1, "actualCurrentAdditionalChildCompetenceTexts": 3, "otherSameSourceMappingTuplesPreserved": same_source_other_count}, "actualReadScope": "Complete 35 source-row objects, all14 complete historical passage objects including text/rawText, 10 whole new DE/EN competence descriptions and prerequisite/contains limits; 42 other distinct author-snapshot DE/EN competence descriptions and prerequisite/contains limits, of which41 remain current whole-equal. Genuine current c494 successor separately actually read as whole cluster plus all three whole current DE/EN child competencies; all35 prior decision rationales and205 other same-source tuple associations. Whole metadata-byte equality is a technical guard, not a substitute for the documented semantic reading.", "primaryScopeLimits": "This review reads the actual historical extraction rows/passages. Their paraphrases and BY sourceSnapshotGoal carriers are not silently declared verbatim original law/curriculum citations. The exact current official BY optional content selection remains a separately required primary-source adjudication. No whole-country source coverage, learner mastery, human release, new A/M/D/V acceptance or current CQR PASS is claimed.", "currentChangedClusterCountercheck": changed_output, "inputs": manifests, "records": records}
    main_output = write("actual-thirty-five-source-tuple-boundaries.independent.json", core)
    patch_output = write("minimal-thirty-five-tuple-and-decision-patches.candidate.json", {"reviewer": REVIEWER, "status": "candidate", "liveWrites": 0, "patches": patches})
    write("actual-whole-input-equality-and-bounded-delta-guards.receipt.json", {"reviewer": REVIEWER, "reviewedAt": NOW, "status": "candidate", "inputs": manifests, "outputs": [main_output, patch_output, changed_output, *outputs], "guards": guards, "all35OriginalTuplesRowsPassagesPriorDecisionsCurrentWholeEqual": True, "41OtherCurrentWholeGoalsEqualAuthorSnapshot": True, "oneGenuineCurrentClusterAndThreeChildrenActuallySemanticallyRechecked": True, "all205OtherSameSourceTuplesPreserved": same_source_other_count == 205, "rawSourcesHistoricalMappingFilesWritten": False, "liveCanonicalRegistryLedgerStatusWritten": False, "foreignCourseTagsAndCompositionViewsWritten": False, "independentCandidateReviewNotIntegrationApproval": True, "newStrictClosures": 0, "restoredStrictBindings": 0, "strictNetIncrease": 0})
    print(json.dumps({"counts": core["counts"], "main": main_output, "patches": patch_output, "mapCandidates": len(outputs)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
