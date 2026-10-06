# SPDX-License-Identifier: Apache-2.0
"""Materialize this bounded inactive author draft; never mutate active inputs."""
from pathlib import Path
import copy
import datetime
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def load(path):
    return json.loads(Path(path).read_text())


def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


snapshot = load(HERE / "current-twenty-one.snapshot.json")
ids = snapshot["goalIds"]
gm = {g["id"]: g for g in snapshot["goals"]}
author = {x["short"]: x for x in load(HERE / "author-profiles.data.json")}
assert len(ids) == len(author) == 21
assert set(author) == {i[:8] for i in ids}

# Only these demonstrated wording/scope conflicts have replacement text.
revisions = {
    "ce19b80f": {
        "descriptionDe": "Die lernende Person kann den Aufbau einer Nervenzelle modellhaft darstellen und die Funktion ihrer wesentlichen Strukturen für Signalaufnahme, Weiterleitung und Weitergabe erklären.",
        "descriptionEn": "The learner can model the structure of a neuron and explain how its main structures support signal reception, conduction and transmission.",
        "reasonDe": "Der Titel benennt Zellbau, der bestehende Satz fordert zusätzlich die unabhängige Entstehung des Aktionspotenzials. Dafür existiert bereits 04d770b3 samt e3fb5f1d als Vorziel. Die tatsächliche BY8-Komponente verlangt neuronalen Bau und Reiz-Reaktions-Kommunikation, keine molekulare Aktionspotenzialentstehung.",
        "preservationGoalIds": ["04d770b3-ba5e-5438-88ca-110cbaeba62c", "e3fb5f1d-e277-5e28-8883-45821b972607", "080b10c7-f308-57ff-b067-3bd189e37fea"],
        "blockers": ["Vor einer Verengung die gesamte bisher beanspruchte Aktionspotenzial-/Leitungsabdeckung über vorhandene, getrennt geprüfte Ziele in jeder betroffenen Quellenansicht bewahren.", "Die BY8-Reiz-Reaktions-Kette ist mehr als Zellbau; keine vollständige Abdeckung dieses Bullets allein durch den Kandidaten behaupten."],
    },
    "a46cafde": {
        "descriptionDe": "Die lernende Person kann an gegebenen neuronalen Netzwerkmodellen erklären, wie Änderungen wirksamer Verbindungen die Verarbeitung gleicher Eingangssignale verändern.",
        "descriptionEn": "The learner can use supplied neural network models to explain how changes in effective connections alter the processing of the same input signals.",
        "reasonDe": "Der bestehende Satz bündelt Integrationsprozesse, Lernen und Verschaltung ohne eine gemeinsame prüfbare Leistung. e1117126, 347110a1 und 97b24279 behandeln bereits die getrennten Ebenen. Der Kandidat bindet die Erklärung an einen konkreten Veränderungsbefund im Netzwerk; die übrigen Ebenen bleiben eigenständige Ziele.",
        "preservationGoalIds": ["e1117126-4e78-5a37-a645-2debc167219b", "347110a1-1d2e-5195-8acc-64e7e3893ce5", "97b24279-def0-5ce6-8726-a1cac9cd38ad"],
        "blockers": ["Keine gemeinsame Quellenklausel durch Verengung verlieren; alle bisher beanspruchten Komponenten und abhängigen Lernrouten gezielt erhalten.", "HE-LK zelluläres Lernen ist ein Anknüpfungspunkt, kein exakter Originalbullet für die gesamte Netzwerkmodellkompetenz.", "Unabhängig klären, ob das Netzwerkveränderungsziel eine eigene curriculare Kompetenz oder eine bloße Doppelung von 347/97 darstellt."],
    },
    "e1117126": {
        "descriptionDe": "Die lernende Person kann an gegebenen synaptischen Potenzialverläufen erklären, wie erregende und hemmende Eingänge räumlich und zeitlich verrechnet werden und die Auslösung eines Aktionspotenzials beeinflussen.",
        "descriptionEn": "The learner can use supplied synaptic potential traces to explain how excitatory and inhibitory inputs are integrated spatially and temporally and affect action-potential generation.",
        "reasonDe": "Der aktuelle Satz verlangt lediglich das Beschreiben einer Begriffsliste, während der Titel Analyse und der tatsächliche HE-LK-/BY13-Bullet die funktionelle Verrechnung fordert. Der Kandidat operationalisiert genau diese gemeinsame Signalverarbeitungsleistung.",
        "preservationGoalIds": [],
        "blockers": ["Rezeptor-/Leitwertkontext und Grenzen eines additiven Schulmodells unabhängig prüfen; keine universelle EPSP/IPSP-Vorzeichenregel behaupten."],
    },
    "2381d2bb": {
        "titleDe": "Potenzialmessungen planen und auswerten",
        "titleEn": "Plan and analyse potential recordings",
        "reasonDe": "Der bestehende Titel behauptet praktische Durchführung, die operative Beschreibung verlangt Planung und Auswertung. Der Kandidat korrigiert ausschließlich diesen tatsächlichen Anspruchsunterschied; die richtige Beschreibung bleibt exakt.",
        "preservationGoalIds": [],
        "blockers": ["Die Scope-Entscheidung zum HE-Bullet Potenzialmessungen getrennt prüfen; ein Modellfall beweist kein praktisches Gerätehandeln."],
    },
}

he = {
    "ce19b80f": [("GK1", "component_structure_only")],
    "ff1bf88f": [("GK2", "chemical_ACh_component_only_electrical_extension_unproved")],
    "a46cafde": [("LK5", "related_cellular_learning_not_exact_network_bullet")],
    "78748ef2": [("LK1", "receptor_potential"), ("LK2", "primary_secondary_sensory_cell")],
    "19758e09": [("LK3", "hormonal_neural_interplay")],
    "e1117126": [("LK4", "synaptic_integration")],
    "347110a1": [("LK5", "cellular_learning")],
    "485ef1c3": [("LK6", "neuronal_disorders_principle_example_not_whole_disease_explanation")],
    "afde0001": [("LK7", "one_brain_imaging_method_principle")],
    "2381d2bb": [("GK3", "potential_recording_scope_requires_decision")],
    "c9a06264": [("LK5", "didactic_specialisation_LTP_LTD_not_named")],
    "4f631f78": [("LK5", "didactic_specialisation_Hebb_not_named")],
    "97b24279": [("LK4", "related_integration_topology_not_named")],
    "9b966664": [("LK3", "related_neural_hormonal_context_modulators_not_named")],
    "f6280154": [("GK2", "ACh_substance_action_component_not_all_psychoactive_substances")],
    "8b23f8fb": [("Q2.4_GK1", "signal_transduction_context_three_codes_not_named")],
    "1b38144f": [("GK1", "membrane_function_implicit_prerequisite_not_separate_whole_bullet")],
    "e3fb5f1d": [("GK1", "resting_potential_component")],
    "04d770b3": [("GK1", "action_potential_component_coding_not_explicit")],
    "080b10c7": [("GK1", "conduction_component")],
    "c05e217f": [("LK3", "hormonal_context_chronic_stress_not_explicit")],
}

atomicity = {
    "ce19b80f": "Ein Struktur-Funktions-Zusammenhang im Kandidaten; bisheriger Struktur/Entstehungs-Doppelanspruch muss über vorhandene Ziele bewahrt werden.",
    "ff1bf88f": "Der begründete Vergleich zweier Übertragungsprinzipien kann eine gemeinsame Kompetenz sein; die direkte HE/BY-Klausel bindet vor allem chemische Synapsen. Elektrische Erweiterung und Vergleichsumfang bleiben offen.",
    "a46cafde": "Ein konkreter Zusammenhang zwischen geänderter Verbindung und neuer Verarbeitung wird vorgeschlagen; Eigenständigkeit gegenüber 347/97 und Bewahrung der drei bisherigen Ebenen bleiben offen.",
    "78748ef2": "Rezeptorantwort und ihre primäre/sekundäre Weitergabe sind ein gemeinsames sensorisches Modell; es wird keine Gesamterklärung verschiedener Sinnesorgane verlangt.",
    "19758e09": "Neuronale und hormonelle Teilwege bilden ausdrücklich eine gemeinsame gekoppelte Steuerung; keine zwei getrennten Organunterrichtseinheiten.",
    "e1117126": "EPSP/IPSP, räumliche/zeitliche Summation und Schwellenwirkung tragen dieselbe synaptische Verrechnung im gegebenen Fall.",
    "347110a1": "Funktionelle und strukturelle Befunde werden als Varianten zellulärer Plastizität erklärt; keine zusätzliche Gesamt-Netzwerk- oder Gedächtniskompetenz.",
    "485ef1c3": "Eine begrenzte materialgestützte Mechanismuserklärung kann atomar sein; die aktuelle pauschale Erkrankungserklärung und die verschiedenen BY-Erkrankungsklauseln benötigen eigene Scope-/Bewahrungsentscheidungen.",
    "afde0001": "Ein gegebenes bildgebendes Verfahren und seine Aussagegrenze bilden eine Methode; ENG/EKG sind dadurch nicht ersetzt.",
    "2381d2bb": "Planung und Auswertung betreffen denselben begrenzten Potenzialversuch; echte Durchführung wird weder beschrieben noch nachgewiesen.",
    "c9a06264": "Der Vergleich anhaltender Zu-/Abnahme bezieht sich auf dieselbe Übertragungswirksamkeit; die Zellversuchseinordnung ist kein Beleg einer konkreten Erinnerung.",
    "4f631f78": "Anwendung und begründete Grenze derselben ausdrücklich gegebenen Lernregel bilden eine Modellkompetenz.",
    "97b24279": "Konvergenz/Divergenz sind zwei Topologien derselben Signalroute; die materialgebundene Wirkung soll eine gemeinsame Analyseleistung tragen.",
    "9b966664": "Eine kontextabhängige Modulationswirkung wird übertragen; allgemeine Verhaltenserklärung oder vollständiges Wissen über alle Transmittersysteme ist nicht Teil der Fälle.",
    "f6280154": "Ein gegebener Angriffspunkt wird kausal an lokale Signalübertragung gebunden; daraus folgt keine Pharmakotherapiekompetenz.",
    "8b23f8fb": "Die gegebenen Codierungsvarianten tragen dieselbe Repräsentationsfrage; Abgrenzung von eigener Reiztransduktionsmechanik und dem Aktionspotenzialziel bleibt gezielt zu prüfen.",
    "1b38144f": "Membranbau und Stofftransport sind ein Struktur-Funktions-Zusammenhang im gleichen Kompartimentmodell.",
    "e3fb5f1d": "Gradienten, Permeabilität und Energie zur Erhaltung sind ein verbundenes Ruhepotenzialmodell; es werden keine zwei voneinander unabhängigen Rechenroutinen verlangt.",
    "04d770b3": "Die Ionenmechanik erklärt die Impulsform; seine Folge trägt die gegebene Codierung. Eigenständigkeit gegenüber 8b23f8fb ist auf den Axon-/Frequenzscope zu begrenzen.",
    "080b10c7": "Zwei Faserarten werden über dieselbe Leitungskompetenz verglichen; Tiergruppenverallgemeinerungen sind keine zweite Routine.",
    "c05e217f": "Die neue Belastung wird als Eingriff in gekoppelte Regelkreise erklärt, statt getrennte Endokrinologie-/Krankheitslehren zu verlangen.",
}

memory = {
    "ce19b80f": "Benennung erfolgt mit einer gegebenen Strukturlegende; die Zielkompetenz ist der erklärte Funktionszusammenhang, kein unbeeinflusster Fachwortabruf.",
    "ff1bf88f": "Gegebene Übertragungsmodelle und Rezeptorinformationen tragen die Erklärung; eine Liste aller Transmitter ist weder notwendig noch durch den Scope gefordert.",
    "a46cafde": "Die Veränderung und die Eingänge werden bereitgestellt; eigenständige Verarbeitungserklärung statt gespeicherter Netzwerkregel.",
    "78748ef2": "Die Zellschemata erlauben die Funktionsunterscheidung; eine separate Vollständigkeitsliste sämtlicher Sinneszellen ist nicht nötig.",
    "19758e09": "Der gegebene Regelkreis trägt die Vernetzung; Hormonnamen werden nicht als eigenständige Abrufleistung vorgeschrieben.",
    "e1117126": "Potenziallegende und vereinfachte Regeln werden gegeben; Modellverrechnung und begründete Wirkung sind die Leistung.",
    "347110a1": "Die Veränderungsbefunde werden vorgegeben; erklärt werden funktionelle/strukturelle Hinweise, keine molekulare Begriffsabfrage.",
    "485ef1c3": "Materialgestützte Erklärung verlangt keinen freien Abruf einer Symptom- oder Diagnoseliste. Eine solche Karte würde unberechtigt medizinischen Scope erweitern.",
    "afde0001": "Ein Messprinzip wird gegeben und auf neue Befunde angewendet; ein Methodenlexikon ist nicht gefordert.",
    "2381d2bb": "Geräte-/Ortslegende ist verfügbar; entscheidend sind begründete Kontrollplanung und Fehlerauswertung, nicht Geräteteile auswendig.",
    "c9a06264": "Die Begriffe werden an Zeitreihen unterschieden; ein molekularer Rezeptorabruf ist nicht Teil der beschriebenen Kompetenz.",
    "4f631f78": "Die Lernregel steht im Material. Ihre Herleitung/Wirkung/Grenze ist verständnisbezogen, ein Formelabruf ist nicht gefordert.",
    "97b24279": "Die Topologie ist sichtbar; begründete Wirkung benötigt die gegebenen Signalregeln und kein memoriertes Netz.",
    "9b966664": "Rezeptor- und Zellkontext werden angegeben. Eine pauschale Dopamin-/Serotonin-Wirkungskarte wäre fachlich irreführend.",
    "f6280154": "Der Stoffangriff ist vorgegeben; kausale Übertragungsanalyse verlangt keine Arzneimittel-/Dosisliste.",
    "8b23f8fb": "Gegebene Codes und Datensätze tragen die Repräsentationsanalyse; eine isolierte Begriffsdefinition ist keine zusätzliche notwendige Abrufkompetenz.",
    "1b38144f": "Die Transportlegende ist bereitgestellt; Selektivität und Energiebezug werden am Fall erklärt, keine Liste aller Transporter gefordert.",
    "e3fb5f1d": "Ionen- und Permeabilitätsdaten werden bereitgestellt; ein fester Millivoltwert auswendig würde die Erklärung nicht nachweisen.",
    "04d770b3": "Kanal-/Zeitlegende trägt die Mechanismuserklärung; kein freier Abruf einer vollständigen Kanalnamenliste verlangt.",
    "080b10c7": "Geschwindigkeiten und Fasermerkmale werden gegeben; Modellvergleich statt gespeicherter Tiergruppenrangfolge.",
    "c05e217f": "Das Rückkopplungsmodell ist im Material; keine Hormontabelle oder Krankheitsklassifikation als Abrufziel nötig.",
}

lanes = load(HERE / "retained-he-by-binding-inputs.snapshot.json")["lanes"]
decisions = []
profiles = []
source_rows = []
proposed = []
am = []
for goal_id in ids:
    g = gm[goal_id]
    short = goal_id[:8]
    data = author[short]
    revision = revisions.get(short, {})
    after = copy.deepcopy(g)
    for source, target in [("titleDe", "title"), ("titleEn", "titleEn"), ("descriptionDe", "description"), ("descriptionEn", "descriptionEn")]:
        if source in revision:
            after[target] = revision[source]
    proposed.append(after)
    blockers = list(revision.get("blockers", []))
    blockers += ["Zwei unabhängige aktuelle D-Reviews und aufgelöste Befunde fehlen.", "Das P-v2-Profil ist ein E1/G1-Autorenentwurf und muss unabhängig geprüft sowie später an tatsächlich übernommene Texte/Quellen/Bilder gebunden werden.", "Alle beanspruchten Länder-/Stufen-/Kurskontexte gezielt gegen die echte jeweilige Primärquelle prüfen; die hier gelesenen HE/BY-Kontexte sind keine Freigabe anderer Länder.", "Es gibt kein vorhandenes primäres Bild für diese ID; nach Scope-Entscheidung nur notwendige fehlende PNGs erzeugen und unabhängig fachlich/visuell prüfen."]
    if short == "485ef1c3":
        blockers += ["BY13-EA.2.7 Depression und .2.11 Multiple Sklerose/Parkinson sind keine exakten Quellen für eine Alzheimer-/Neurodegenerationskompetenz. Zuerst vorhandene passende Ziele suchen und die tatsächlichen Klauseln vollständig erhalten; keine stille Umbenennung der Krankheiten."]
    if short == "afde0001":
        blockers += ["BY13-EA.2.9 und seine Inhalte nennen elektrische Diagnoseverfahren ENG/EKG, nicht ein bildgebendes Hirnforschungsverfahren. Beide unterschiedlichen Quellenscopes bewahren; keine bloße Hash-Fortsetzung des bisherigen exact-Mappings."]
    if short in ["c9a06264", "4f631f78", "97b24279", "9b966664", "8b23f8fb"]:
        blockers += ["Der generische HE-Prinzipbullet nennt die gesamte operative Spezialisierung nicht ausdrücklich. Didaktische Ableitung oder konkrete anderweitige normative Bindung unabhängig entscheiden, nicht als wörtliche Originalkompetenz ausgeben."]
    if short == "ff1bf88f":
        blockers += ["Elektrische Synapsen sind im tatsächlich gelesenen HE-Q2.3-/BY13-EA.2-Bullet nicht als eigene Pflichtkompetenz genannt. Umfang und Sichtbarkeit dieses Erweiterungsanteils getrennt entscheiden."]
    decisions.append({"goalId": goal_id, "decision": "revise_candidate" if revision else "keep_current_text_candidate", "currentTitleDe": g["title"], "currentTitleEn": g["titleEn"], "currentDescriptionDe": g["description"], "currentDescriptionEn": g["descriptionEn"], "proposedTitleDe": after["title"], "proposedTitleEn": after["titleEn"], "proposedDescriptionDe": after["description"], "proposedDescriptionEn": after["descriptionEn"], "currentRequires": g.get("requires", []), "proposedRequires": g.get("requires", []), "reasonDe": revision.get("reasonDe", "Kein konkreter fachlicher Fehler im aktuellen DE/EN-Satz festgestellt. Der Satz bleibt exakt; neue Fälle operationalisieren den begrenzten erklärenden Scope. Quellen-/Atomaritätsgrenzen bleiben gesondert offen."), "semanticAtomicityReasonDe": atomicity[short], "preservationGoalIds": revision.get("preservationGoalIds", []), "integrationBlockers": blockers})
    profile = {
        "archetype": "modeling" if short not in ["2381d2bb", "afde0001", "c9a06264"] else "data",
        "expectations": [{"id": "bounded-mechanism-and-transfer", "essentialUnderstandingDe": data["understandingDe"], "essentialUnderstandingEn": data["understandingEn"], "observablePerformanceDe": data["performanceDe"], "observablePerformanceEn": data["performanceEn"]}],
        "coverageExpectations": {"requiredExpectationIds": ["bounded-mechanism-and-transfer"], "alternativeExpectationGroups": [], "minimumIndependentDemonstrations": 2, "freshVariationRequired": True, "independentTransferRequired": True},
        "variationAxes": [{"id": "fresh-model-or-dataset", "textDe": "Darstellung, Werte oder untersuchte Verbindung wechseln; die Mechanismuserklärung muss zum neuen gegebenen Material passen.", "textEn": "Change representation, values or studied connection; the mechanism explanation must fit the fresh material."}, {"id": "intervention-or-inference-limit", "textDe": "Einen frischen Eingriff, Kontrollvergleich oder Kontexteffekt begründet einordnen und die konkrete Aussagegrenze beachten.", "textEn": "Explain a fresh intervention, control comparison or contextual effect and respect its specific inference limit."}],
        "applicationCaseBriefs": [{"id": "initial-bounded-model", "taskDemandDe": data["case1De"], "taskDemandEn": data["case1En"], "expectedPerformanceDe": data["answer1De"], "expectedPerformanceEn": data["answer1En"], "understandingFocusDe": "Eigenständig begründete Erklärung des gegebenen Mechanismus und seiner Bedingungen.", "understandingFocusEn": "Independently justified explanation of the supplied mechanism and its conditions."}, {"id": "fresh-contextual-transfer", "taskDemandDe": data["case2De"], "taskDemandEn": data["case2En"], "expectedPerformanceDe": data["answer2De"], "expectedPerformanceEn": data["answer2En"], "understandingFocusDe": "Frischer Transfer mit konkreter Begrenzung der Schlussfolgerung.", "understandingFocusEn": "Fresh transfer with a specific inference limit."}],
    }
    profiles.append({"goalId": goal_id, "reason": "Inactive author draft for the proposed bounded scope. Supplied models/data/legends are aids; no learner work, independent review or approval exists. " + atomicity[short], "evidenceLevel": "E1", "maximumClaimScope": "G1", "dissent": blockers, "profile": profile})
    source_rows.append({"goalId": goal_id, "hePrimaryCandidates": [{"section": "Q2.4" if bullet.startswith("Q2.4") else "Q2.3", "printedPage": 43, "physicalPage": 43, "bulletLocalKey": bullet, "scopeLimit": meaning, "candidateMappingOnly": True} for bullet, meaning in he[short]], "retainedHEBYClaims": [{"mappingPath": lane["mappingPath"], "claims": [m for m in lane["mappings"] if m["canonicalGoalId"] == goal_id]} for lane in lanes], "otherJurisdictions": g.get("applicability", {}).get("jurisdiction", []), "nonHEBYPrimaryApprovalClaim": False, "independentReviewRequired": True})
    am.append({"goalId": goal_id, "authorAtomicityAssessment": "affected_revision_needs_independent_decision" if revision else "reuse_current_valid_decision_if_scope_unchanged", "semanticAtomicityReasonDe": atomicity[short], "changedSemanticFields": [f for f in ["title", "titleEn", "description", "descriptionEn"] if after[f] != g[f]], "reuseUnchangedCurrentDecisionOnlyIfStillSemanticallyValid": True, "memoryCandidateDecision": "no_memory_needed", "memoryReasonDe": memory[short], "memoryGoalIds": [], "deckIds": [], "newCardOrVisibilityApprovalClaim": False, "scopeChangedNeedsFreshDecisionBeforeAdoption": bool(revision)})

write("description-decisions.candidates.json", {"schemaVersion": 1, "candidateStatus": "ai_candidate", "createdAt": NOW, "modelFamily": "GPT-6", "exactModelIdentifier": None, "goals": decisions, "claimLimit": "Unadopted author decisions; no independent D or current gate completion."})
write("positive-evidence.candidates.json", {"schemaVersion": 1, "authoringContract": "positive-understanding-evidence-candidates-v1", "reviewId": "biologie-q2-neurobiology-twenty-one-author-20261006-v1", "reviewedAt": NOW, "reviewer": "codex-q2-neurobiology-author", "goals": profiles})
write("primary-source-bindings.candidates.json", {"schemaVersion": 1, "candidateStatus": "source_review_required", "createdAt": NOW, "HESourceVersion": "Retained actual KC2024 PDF Stand01.08.2025; current artificial16Q2.3spans are not the10original bullets", "HEBulletKeys": {"GK1": "Bau/Funktion Nervenzelle einschließlich Ruhe-/Aktionspotenzial/Leitung", "GK2": "Erregende ACh-Synapse einschließlich Kanälen, Stoffeinwirkung und neuromuskulärer Synapse", "GK3": "Potenzialmessungen", "LK1": "Rezeptorpotenzial", "LK2": "Primäre und sekundäre Sinneszelle", "LK3": "Hormonwirkung und neuronale/hormonelle Verschränkung", "LK4": "EPSP/IPSP und räumliche/zeitliche Verrechnung", "LK5": "Zelluläre Lernprozesse", "LK6": "Störungen neuronaler Systeme, Prinzip", "LK7": "Ein bildgebendes Verfahren der Hirnforschung, Prinzip", "Q2.4_GK1": "Sinnesorgan-Aufbau und Signaltransduktion"}, "goals": source_rows, "claimLimit": "Own bounded paraphrase keys and candidates; not official bullet IDs or whole-clause approvals. Existing authored extraction text is not promoted to original source text."})
write("atomicity-memory.candidates.json", {"schemaVersion": 1, "candidateStatus": "independent_review_required", "createdAt": NOW, "goals": am, "claimLimit": "Goal-specific author reasoning; no active A/M ledger or card/visibility decision changed."})

landscape = {k: copy.deepcopy(v) for k, v in load(ROOT / snapshot["canonicalPath"]).items() if k != "goals"}
landscape["goals"] = proposed + snapshot["contextGoals"]
write("proposed-twenty-one.validation-snapshot.json", landscape)
prefix = HERE.relative_to(ROOT).as_posix()
write("positive-evidence.validation-only.config.json", {"$schema": "https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json", "schemaVersion": 2, "reviewId": "biologie-q2-neurobiology-twenty-one-author-20261006-v1", "goalFingerprintRuleVersion": "goal-evidence-v1", "profileRuleVersion": "positive-understanding-evidence-v2", "landscapeId": snapshot["landscapeId"], "landscapePath": prefix + "/proposed-twenty-one.validation-snapshot.json", "semanticKindLedgerPath": "curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json", "reviewCriteriaPath": "curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md", "reviewPath": prefix + "/validation-only.not-registered.review.jsonl", "reviewRunManifestPaths": [], "reviewedResourceTypes": [], "requireApproved": False, "scope": {"label": "Inactive author21 P-v2 structural validation only; no active M7", "goalIds": ids}})
print(json.dumps({"profiles": len(profiles), "freshCases": sum(len(p["profile"]["applicationCaseBriefs"]) for p in profiles), "changedGoalCount": len(revisions), "descriptionChangedGoalCount": 3, "titleOnlyChangedGoalCount": 1, "activeFilesWritten": False}))
