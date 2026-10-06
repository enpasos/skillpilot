"""Serialize this session's scientific D-A verdicts against the frozen native batch.

This utility copies bindings; the six understanding statements and decisions below
are this reviewer session's own scientific decisions, not generated validator results.
"""
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
CANDIDATE = OUT.parent / "biologie-q1-tf-methylation-current-source-consumer-candidate-v3"
ROUND = CANDIDATE / "native-finalbook/round-a"
BUNDLE = CANDIDATE / "native-finalbook/bundle"

def digest(path):
    return "sha256:" + sha256(path.read_bytes()).hexdigest()

def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

campaign = json.loads((ROUND / "description-review-campaign.json").read_text())
manifest = json.loads((BUNDLE / "manifest.json").read_text())
batch = campaign["batches"][0]
batch_path = ROUND / "batches" / (batch["batchId"] + ".input.jsonl")
inputs = [json.loads(line) for line in batch_path.read_text().splitlines()]
run_id = "biologie-q1-tf-methylation-current-independent-d-a-20261005-v3.run-001"

decisions = [
    {
        "essentialUnderstandingDe": "Transkriptionsfaktoren sind regulatorische Proteine. Ihre Bindung an passende regulatorische DNA-Bereiche beeinflusst im gegebenen eukaryotischen Modell die Transkriptionsmaschinerie; Aktivierung oder Hemmung ergibt sich aus der angegebenen Faktorwirkung und dem Modellkontext.",
        "essentialUnderstandingEn": "Transcription factors are regulatory proteins. Their binding to suitable regulatory DNA regions influences the transcription machinery in the supplied eukaryotic model; activation or repression depends on the stated factor function and model context.",
        "observablePerformanceDe": "Die lernende Person verbindet im gegebenen Genmodell Faktor, Bindungsbereich und Transkriptionsausgang zu einer begründeten Erklärung. Sie erklärt aus einer bekannten aktivierenden oder hemmenden Wirkung eine Änderung passender mRNA-Befunde, ohne die Bindung selbst mit einer gemessenen Proteinmenge oder einem Organismusmerkmal gleichzusetzen.",
        "observablePerformanceEn": "The learner links the factor, binding region and transcription outcome in the supplied gene model to form a reasoned explanation. They use a stated activating or repressing function to explain a change in matched mRNA data without treating binding itself as a measured protein amount or organismal trait.",
        "transferExpectationDe": "In einem neuen Modell mit veränderter Bindungsstelle oder veränderter Verfügbarkeit eines anders wirkenden Faktors begründet die lernende Person eine passende Transkriptionsprognose. Sie benutzt die angegebenen Modellbedingungen, statt die im Lernbild gezeigte Aktivierung auf jede Faktorbindung zu übertragen.",
        "transferExpectationEn": "In a fresh model with a changed binding site or changed availability of a factor with a different stated function, the learner justifies an appropriate transcription prediction. They use the supplied model conditions rather than generalizing the activation shown in the teaching image to every factor-binding event.",
        "rationale": "KEEP. DE und EN beanspruchen denselben einzelnen, an einem gegebenen eukaryotischen Genmodell erklärbaren Regulationsmechanismus. Proteinbiosynthese bleibt Voraussetzung; Methylierung, Histonmodifikation und Organismusentwicklung werden nicht hinzugefügt. Der tatsächliche PDF-/HTML-Seitenkontext und das ausdrücklich aktivierende PNG widersprechen dem allgemeineren Ziel nicht. Die aktuelle HE-Q1.2-Zeile auf physisch/gedruckt S.39 des KC Stand 01.08.2025 nennt Transkriptionsfaktoren für GK und LK. Die geprüften BY-GA-/EA-Inhalte 12.2 nennen diesen Mechanismus ebenfalls; die breitere BY-Kompetenz zu gleicher genetischer Ausstattung, Entwicklung und Umweltanpassung bleibt über ihr eigenes vollständiges Ziel erhalten. Das native Quellen-Sidecar enthält für HE ausschließlich den korrekt verbundenen 2025-Dokumentnachweis. Im gebundenen D-Batch liegt kein aktuelles P-Profil vor; create ist eine Empfehlung für den getrennten P-Abschluss, keine Behauptung, dass der vorhandene externe Autorenkandidat fachlich fehlt.",
    },
    {
        "essentialUnderstandingDe": "DNA-Methylierung verändert chemische Markierungen der DNA und nicht deren Basenfolge. Ihr Einfluss auf die Transkription hängt unter anderem vom betroffenen DNA-Bereich und vom jeweiligen Genmodell ab; eine geringere mRNA-Menge im gezeigten Promotormodell ist keine allgemeine Abschaltregel für jedes methylierte Gen.",
        "essentialUnderstandingEn": "DNA methylation changes chemical marks on DNA rather than its base sequence. Its effect on transcription depends on the affected DNA region and the particular gene model; lower mRNA in the illustrated promoter model is not a universal switching-off rule for every methylated gene.",
        "observablePerformanceDe": "Die lernende Person erklärt in gegebenen Modellen den Zusammenhang zwischen Methylierungsmarken, regulatorischem Kontext und Transkription. Sie deutet passende Methylierungs- und mRNA-Befunde mit Gründen und trennt einen Zusammenhang zwischen unterschiedlichen Zelltypen von einer unter angegebenen Kontrollbedingungen gestützten Erklärung.",
        "observablePerformanceEn": "The learner explains how methylation marks, regulatory context and transcription relate in supplied models. They interpret matched methylation and mRNA data with reasons and distinguish an association between different cell types from an explanation supported under stated controlled conditions.",
        "transferExpectationDe": "Bei einem neuen Fall mit kontrollierter Promotormethylierung und einem Gegenbeispiel aus einem anderen DNA-Bereich begründet die lernende Person eine kontextgerechte Deutung. Sie erhält die Unterscheidung zwischen gleicher Basenfolge und veränderter Markierung und behauptet weder eine universelle Genabschaltung noch aus den mRNA-Befunden allein eine bestimmte Protein- oder Merkmalsänderung.",
        "transferExpectationEn": "In a fresh case involving controlled promoter methylation and a counterexample from a different DNA region, the learner justifies a context-appropriate interpretation. They preserve the distinction between an unchanged base sequence and changed marks and claim neither universal gene silencing nor a specific protein or trait change from the mRNA data alone.",
        "rationale": "KEEP. Erklärung und Deutung passender Befunde zeigen denselben einzelnen Regulationszusammenhang auf Modell- und Datenebene und erfordern keinen Split. DE und EN erhalten die Begrenzungen gegeben, eukaryotisch und im jeweiligen Kontext. Der tatsächliche PNG-/Alt-Text-/PDF-/HTML-Kontext bezeichnet den Promotorvergleich ausdrücklich als Modell; gleiche Basenfolge wird erhalten. Die HE-Q1.2-Zeile im KC Stand 01.08.2025, physisch/gedruckt S.39, benennt DNA-Methylierung im grundlegenden Niveau für GK und LK. Histonmodifikation aus der folgenden LK-Zeile wird nicht übernommen. Beide geprüften BY-Inhalte 12.2 tragen die partielle DNA-Methylierungs-Komponente; X-Inaktivierung, Entwicklung, Umweltanpassung und EA-Zusätze bleiben außerhalb dieses Atoms und ihrer vollständigen Ziele erhalten. Die aktuelle direkte HE-Dokumentbindung und die BY-Komponentenbindung sind im tatsächlichen nativen Quellen-Sidecar nicht mit historischen Quellen vermischt. Im gebundenen D-Batch ist evidenceProfile null; die create-Empfehlung betrifft den getrennten maschinellen P-Abschluss des extern vorhandenen Kandidaten.",
    },
    {
        "essentialUnderstandingDe": "DNA-Fragmente wandern im elektrischen Feld zum Pluspol. Für die im üblichen Größenvergleich betrachteten linearen Fragmente führt die Trennung im Gel dazu, dass kleinere Fragmente unter gleichen Bedingungen weiter wandern; ein Größenmarker ermöglicht den begründeten Vergleich der Probenbanden.",
        "essentialUnderstandingEn": "DNA fragments move towards the positive electrode in an electric field. In the usual size comparison of linear fragments, separation in the gel makes smaller fragments travel farther under the same conditions; a size marker supports reasoned comparison of sample bands.",
        "observablePerformanceDe": "Die lernende Person erklärt Ladungsrichtung und größenabhängige Trennung und ordnet in einem vorgegebenen Gelbild Probenbanden anhand des bereitgestellten Markers ein. Sie begründet Zuordnung und gegebenenfalls Größenintervall aus den Daten, statt aus nicht beschrifteten Bildbanden exakte Fragmentlängen zu erfinden.",
        "observablePerformanceEn": "The learner explains the charge-related direction and size-dependent separation and assigns sample bands in a supplied gel image using the provided marker. They justify the assignment and, where appropriate, a size interval from the data rather than inventing exact fragment lengths from unlabelled image bands.",
        "transferExpectationDe": "In einem neuen Gel mit verändertem Marker und anderen Probenbanden wendet die lernende Person die gleiche Trennungsregel an und begründet eine Größenzuordnung. Sie unterscheidet Markerreferenz, Probenbefund und Reichweite der Interpretation und überträgt keine behauptete lineare Längenabstandsskala ohne dafür bereitgestellte Kalibrierung.",
        "transferExpectationEn": "In a fresh gel with a different marker and different sample bands, the learner applies the same separation rule and justifies a size assignment. They distinguish the marker reference, sample findings and interpretive limits and do not assume a linear distance-to-length scale without a supplied calibration.",
        "rationale": "KEEP; gezielte aktuelle Quellen-/Seitenbindung, kein neuer fachlicher Abschluss. Der vorhandene DE-/EN-Zieltext bleibt ein einzelner methodischer Erklärungs- und Auswertungsauftrag. Tatsächliches PNG und Alt-Text stimmen überein: vier Markerbanden, zwei Banden je Probe, Taschen am Minuspol und kleine lineare Fragmente weiter in Richtung Pluspol; es werden keine numerischen Größen erfunden. HE-Q1.2 nennt PCR und Gelelektrophorese im grundlegenden Niveau auf physisch/gedruckt S.39 des aktuellen KC Stand 01.08.2025. Das neue native Quellen-Sidecar beseitigt den zusätzlich falschen historischen 2024-11-Zeugen, behält den korrekten 2025-Nachweis und die BY-GA-/EA-12.6-Methodenkomponente bei. Die vollständige BY-Kompetenz zur medizinischen/gesellschaftlichen DNA-Analytik und ethischen Bewertung bleibt im eigenen Ziel erhalten und wird nicht durch diesen Gelauftrag als abgedeckt behauptet. Im Teilbuch sind die vollständigen direkten externen Voraussetzungen und Abschlussnachfolger sichtbar. Der native D-Batch enthält kein P-Profil; create behauptet weder neue Facharbeit noch eine fehlende historische P-Prüfung.",
    },
]

records = []
for number, (line, verdict) in enumerate(zip(inputs, decisions, strict=True), 1):
    goal = line["goal"]
    record = {
        "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
        "schemaVersion": 1,
        "recordId": run_id + ".goal-" + str(number),
        "runId": run_id,
        "campaignId": campaign["campaignId"],
        "roundId": campaign["roundId"],
        "bundleFingerprint": line["bundleFingerprint"],
        "bookDigest": line["bookDigest"],
        **{key: goal[key] for key in ["goalId", "goalFingerprint", "pageFingerprint", "currentTitleDe", "currentTitleEn", "currentDescriptionDe", "currentDescriptionEn"]},
        "decision": "keep",
        "understandingEvidence": {key: value for key, value in verdict.items() if key != "rationale"},
        "rationale": verdict["rationale"],
        "evidenceProfileContract": "positive-understanding-evidence-v2",
        "evidenceProfileRecommendation": "create",
        "recordStatus": "candidate",
        "reviewAuthority": "ai_candidate",
    }
    records.append(record)

record_path = OUT / "results" / (batch["batchId"] + ".records.jsonl")
record_path.write_text("".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records))
parameters = {
    "sessionRole": "independent scientific D-A reviewer after technical compiler/materialization work",
    "textOrProfileAuthor": False,
    "otherDescriptionOutputsRead": False,
    "backendModelIdentifierExposed": False,
    "temperatureExposed": False,
    "topPExposed": False,
    "observations": "Actual frozen native PDF pages 3/4/5 and HTML, actual PNGs/alt text, current source indexes, HE primary physical39, live official BY GA/EA12 contents, native campaign/context read by reviewer; no review verdict imported.",
}
write_json(OUT / "review-generation-parameters.json", parameters)
run = {
    "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
    "schemaVersion": 1,
    "runId": run_id,
    "campaignId": campaign["campaignId"],
    "roundId": campaign["roundId"],
    "batchId": batch["batchId"],
    "batchInputFingerprint": batch["batchInputFingerprint"],
    "bundleFingerprint": manifest["bundleFingerprint"],
    "bookDigest": manifest["bookModelDigest"],
    "provider": "OpenAI",
    "model": "GPT-6 Codex inherited session; exact backend deployment identifier not exposed",
    "role": "subject_reviewer",
    "promptFamilyId": "goal-description-understanding-evidence-review-v2",
    "promptFingerprint": manifest["promptFingerprint"],
    "criteriaFingerprint": manifest["criteriaFingerprint"],
    "generationParametersFingerprint": digest(OUT / "review-generation-parameters.json"),
    "independenceGroupId": campaign["independenceGroupId"],
    "blindToOtherRuns": True,
    "goalIds": batch["goalIds"],
    "inputArtifacts": [{"role": item["role"], "digest": item["digest"]} for item in manifest["artifacts"]] + [{"role": "description_review_batch_input_jsonl", "digest": batch["batchInputFingerprint"]}],
    "startedAt": "2026-10-05T17:49:51Z",
    "completedAt": datetime.now(timezone.utc).isoformat(),
    "status": "completed",
    "outputDigest": digest(record_path),
    "toolchainVersion": "codex-cli-current-session",
}
write_json(OUT / "results" / (batch["batchId"] + ".run.json"), run)
print(json.dumps({"runId": run_id, "recordCount": len(records), "decisions": [r["decision"] for r in records], "humanApproval": False, "newStrictClosures": 0}))
