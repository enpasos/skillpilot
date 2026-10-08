"""Serialize this reviewer's actual first targeted context decisions.

No prior description/source/positive-understanding verdict is consulted here.
All scientific wording below was decided after the actual input inspections.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-source-supplement-technical-author-resumed-v1"
entry = json.loads((AUTHOR / "neutral-source-supplement-two-context-review.entry.json").read_text())
campaign = json.loads((AUTHOR / "native-two-context/round-b/description-review-campaign.json").read_text())
review_input = json.loads((AUTHOR / "native-two-context/round-b/description-review-input.json").read_text())
bundle = json.loads((AUTHOR / "native-two-context/bundle/review-bundle-manifest.json").read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def binding(path):
    return {"path": str(path.relative_to(ROOT)), "sha256": sha(path), "bytes": path.stat().st_size}

def write(name, value):
    path = OWN / name
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return path

now = datetime.now(timezone.utc).isoformat()
started = datetime.fromtimestamp((OWN / "inputs/profiles-content-only.independent-b.input.json").stat().st_mtime, timezone.utc).isoformat()
run_id = "bio-basis2-supplement-context-independent-b-20261008-v1"
understanding = [
    {
        "essentialUnderstandingDe": "Die aerobe Zellatmung verknüpft den Abbau von Glucose mit dem Verbrauch von Sauerstoff, der Bildung von Kohlenstoffdioxid und Wasser und der Nutzbarmachung chemischer Energie. Stoffumsatz und Energieumwandlung beschreiben denselben Zellprozess; Energie wird nicht neu geschaffen.",
        "essentialUnderstandingEn": "Aerobic cell respiration links glucose breakdown to oxygen consumption, formation of carbon dioxide and water, and usable chemical energy. Material conversion and energy conversion describe the same cellular process; energy is not created anew.",
        "observablePerformanceDe": "Die lernende Person stellt den Zusammenhang ohne Kopieren des Bildes als Wortgleichung dar und begründet am Muskelmodell die Herkunft nutzbarer Energie und der abgegebenen Wärme. Sie unterscheidet die Zellreaktion von der Lungenventilation.",
        "observablePerformanceEn": "The learner represents the relationship with a word equation without copying the picture and explains the source of usable energy and released heat in a muscle model. The learner distinguishes the cellular reaction from lung ventilation.",
        "transferExpectationDe": "In einem frischen Modell keimender Samen erklärt die lernende Person Sauerstoffverbrauch und Kohlenstoffdioxidabgabe aus dem Abbau gespeicherter organischer Stoffe. Eine Netto-Kohlenstoffdioxidaufnahme eines beleuchteten Blatts wird nicht als Beweis für fehlende Zellatmung fehlgedeutet.",
        "transferExpectationEn": "In a fresh model of germinating seeds, the learner explains oxygen consumption and carbon-dioxide release through breakdown of stored organic substances. Net carbon-dioxide uptake by an illuminated leaf is not misinterpreted as proof that cell respiration is absent.",
    },
    {
        "essentialUnderstandingDe": "Lichtabhängige Reaktionen überführen Lichtenergie in chemische Mittel für den Stoffaufbau. Lichtunabhängige Reaktionen benötigen diese Mittel und Kohlenstoffdioxid; fehlende direkte Lichtaufnahme bedeutet weder ausschließliche Nachtaktivität noch unbegrenzte Unabhängigkeit vom lichtabhängigen Teil.",
        "essentialUnderstandingEn": "Light-dependent reactions convert light energy into chemical resources for synthesis. Light-independent reactions require these resources and carbon dioxide; not absorbing light directly means neither exclusively nocturnal activity nor unlimited independence from the light-dependent component.",
        "observablePerformanceDe": "Die lernende Person erklärt an einem vereinfachten Zweiteil-Modell den kausalen Nachschub und begründet, warum nach Abdunkeln höchstens ein begrenzter Restvorrat nutzbar ist. Sie widerlegt aus der Kopplung heraus die Aussage, lichtunabhängig bedeute ausschließlich nachts.",
        "observablePerformanceEn": "The learner explains causal resource supply using a simplified two-part model and explains why only a limited residual supply can be used after darkening. The learner uses the coupling to refute the claim that light-independent means exclusively nocturnal.",
        "transferExpectationDe": "In einem unabhängig vorgelegten Pflanzenpaar-Modell unterscheidet die lernende Person fehlenden Kohlenstoffdioxid-Ausgangsstoff von fehlendem chemischem Nachschub. Sie begründet, weshalb stärkere Beleuchtung den fehlenden Kohlenstoff nicht ersetzt und bloße Beleuchtung des Stoffaufbau-Teils nach Unterbrechung des anderen Teils nicht genügt.",
        "transferExpectationEn": "In an independently presented paired-plant model, the learner distinguishes missing carbon-dioxide substrate from missing chemical-resource supply. The learner explains why brighter illumination cannot replace missing carbon and why illuminating the synthesis component alone is insufficient after interruption of the other component.",
    },
]
rationales = [
    "Eigenständige gezielte Folgeprüfung des tatsächlich geänderten Kapitel-/Seitenkontexts: Die vollständige DE/EN-Kompetenz bleibt ein grundlegender Zusammenhang von aerober Stoffumwandlung und Energieumwandlung. Die neue Sek-I-Ergänzungsgruppe behauptet weder molekulare Abbaustufen noch Gärungsversuche. Beide vollständigen Muskel-/Samenfälle, ihre Bewertungsmaßstäbe und frischen Gegenfälle passen weiterhin zu diesem Anspruch. PDF-Seite 3 zeigt die richtige ganze Beschreibung, das unveränderte unterstützende Bild und genau BB/BE/MV/NW/SH/SN/ST/TH. Der bisherige zellbiologische Voraussetzungskontext bleibt über den neuen Cluster erhalten. Die zehn partiellen Quellenbeiträge ersetzen keine ganze mehrteilige Lehrplananforderung; vier fachpraktische/Urteils-/Vergleichs-HOLDs bleiben ausdrücklich offen. Der bestehende V2-Profilinhalt benötigt deshalb keine Änderung; seine neue Kontextbindung muss auf diese tatsächliche Prüfung verweisen.",
    "Eigenständige gezielte Folgeprüfung des tatsächlich geänderten Kapitel-/Seitenkontexts: Beschreibung und englisches Gegenstück erklären eine vereinfachte funktionale Kopplung; die begründete Abgrenzung von 'nur nachts' ist Bestandteil desselben Verständnisses. Der Wechsel in die begrenzte Sek-I-Ergänzungsgruppe erhöht den Anspruch nicht zu Calvinzyklus, Elektronenübertragung oder Versuchsplanung. PDF-Seite 4 zeigt die ganze Kompetenz, SN/Sek I/G8 und die reale externe Vorbedingung 576d59e2. Der amtliche Sachsen-Abschnitt Klassenstufe 9, gedruckte Seite 26, verlangt ausdrücklich die Wechselwirkung beider Reaktionsformen. Die vollständigen Vorrats-/Kohlenstofffälle und frischen Eingriffe passen zum neuen Kontext; ATP-Namen oder eine Nachtpflicht werden nicht vorausgesetzt. Keine Ganzquellenfreigabe folgt aus der partiellen Zuordnung. Der bestehende V2-Profilinhalt bleibt fachlich passend und kann mit tatsächlich geprüfter neuer Kontextbindung weiterverwendet werden.",
]
records = []
for index, goal in enumerate(review_input["goals"]):
    record = {
        "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
        "schemaVersion": 1,
        "recordId": run_id + "." + goal["goalId"], "runId": run_id,
        "campaignId": campaign["campaignId"], "roundId": campaign["roundId"],
        "bundleFingerprint": campaign["bundleFingerprint"], "bookDigest": campaign["bookDigest"],
        **{key: goal[key] for key in ["goalId", "goalFingerprint", "pageFingerprint", "currentTitleDe", "currentTitleEn", "currentDescriptionDe", "currentDescriptionEn"]},
        "decision": "keep", "understandingEvidence": understanding[index], "rationale": rationales[index],
        "evidenceProfileContract": "positive-understanding-evidence-v2",
        "evidenceProfileRecommendation": "none", "recordStatus": "candidate", "reviewAuthority": "ai_candidate",
    }
    records.append(record)
results = OWN / "normal-campaign-b-results"
results.mkdir(exist_ok=False)
batch = campaign["batches"][0]
record_path = results / (batch["batchId"] + ".records.jsonl")
record_path.write_text("".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n" for r in records))
generation_parameters = {"mode": "Independent targeted new-context first review", "reviewer": "/root/biology_basis2_supplement_context_independent_b", "historicalScientificReviewsRestarted": False, "learnerDataUsed": False}
parameters_path = write("actual-review-parameters.independent-b.json", generation_parameters)
run = {
    "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
    "schemaVersion": 1, "runId": run_id,
    "campaignId": campaign["campaignId"], "roundId": campaign["roundId"], "batchId": batch["batchId"],
    "batchInputFingerprint": batch["batchInputFingerprint"],
    "bundleFingerprint": campaign["bundleFingerprint"], "bookDigest": campaign["bookDigest"],
    "provider": "OpenAI", "model": "Codex", "role": "subject_reviewer",
    "promptFamilyId": "skillpilot-goal-description-understanding-evidence-v2",
    "promptFingerprint": campaign["promptFingerprint"], "criteriaFingerprint": campaign["criteriaFingerprint"],
    "generationParametersFingerprint": "sha256:" + sha(parameters_path),
    "independenceGroupId": campaign["independenceGroupId"], "blindToOtherRuns": True,
    "goalIds": batch["goalIds"],
    "inputArtifacts": [{"role": r["role"], "digest": r["digest"]} for r in bundle["artifacts"]] + [{"role": "description_review_batch_input_jsonl", "digest": batch["batchInputFingerprint"]}],
    "startedAt": started, "completedAt": now, "status": "completed", "outputDigest": "sha256:" + sha(record_path),
    "toolchainVersion": "skillpilot-goal-description-review-campaign-v2",
}
run_path = write("normal-campaign-b-results/" + batch["batchId"] + ".run.json", run)
preservation = json.loads((OWN / "twenty-whole-sources-268-partners-and-four-holds.preservation.independent-b.actual.json").read_text())
word_delta = json.loads((OWN / "576-full394-structural-and-semantic-delta.independent-b.actual.json").read_text())
own_verdict = {
    "schemaVersion": 1, "reviewId": run_id, "role": "Actual independent targeted source/native D/P context review B",
    "reviewerTask": "/root/biology_basis2_supplement_context_independent_b", "reviewedAtUtc": now,
    "neutralInputEntry": binding(AUTHOR / "neutral-source-supplement-two-context-review.entry.json"),
    "normalDescriptionRecords": binding(record_path), "normalDescriptionRun": binding(run_path),
    "newContextDecision": "KEEP_BOTH_UNCHANGED_WHOLE_GOALS_AND_UNCHANGED_WHOLE_P2_CASES",
    "nativePdfActuallyViewedPhysicalPages": [1, 2, 3, 4],
    "nativeGoalPhysicalPages": [{"goalId": records[0]["goalId"], "physicalPage": 3}, {"goalId": records[1]["goalId"], "physicalPage": 4}],
    "actualSourcePrimaryReading": [
        {"jurisdiction": "DE-BB", "physicalPages": [30], "basis": "Explicit principle of cell respiration as energy conversion"},
        {"jurisdiction": "DE-BE", "physicalPages": [30], "basis": "Same bound official document and explicit principle"},
        {"jurisdiction": "DE-MV", "physicalPages": [8, 21, 22, 26], "basis": "Grade 8 cell respiration/biological oxidation and its relationship to gas exchange; no expanded new coupling assignment"},
        {"jurisdiction": "DE-NW", "physicalPages": [30], "basis": "Ecology section explicitly contrasts basic photosynthesis and cell respiration"},
        {"jurisdiction": "DE-SH", "physicalPages": [27, 33, 64, 65, 71], "basis": "Sek-I SE4-SE6; upper-secondary requirements distinguish the limit of the new basic goal"},
        {"jurisdiction": "DE-SN", "physicalPages": [17, 18, 38, 39], "basis": "Grade 9 explicitly requires coupled photosynthesis reactions and cell respiration; more extensive equations and experiments remain outside the new partial goals"},
        {"jurisdiction": "DE-ST", "physicalPages": [34, 35, 36, 37], "basis": "Muscle energy provision, word and overall equations; two-goal basic scope does not absorb whole system or practical duties"},
        {"jurisdiction": "DE-TH", "physicalPages": [23, 24, 26, 27], "basis": "Word/overall respiration equation and energy release; broader investigations and systematization stay separate"},
    ],
    "positiveUnderstandingContextReview": {
        "contract": "positive-understanding-evidence-v2", "scope": "Targeted new page/chapter/context binding of existing exact profile contents and four complete cases; no historical whole-profile review restarted",
        "originalProfileFile": entry["originalWholeP2Profiles"], "originalFourWholeCases": entry["originalFourWholeDEENCases"],
        "profileContentReadWithoutHistoricalReviewerAndReasonValues": True,
        "wholeCaseIds": ["bio-basic2-respiration-muscle", "bio-basic2-respiration-seed", "bio-basic2-coupling-reserve", "bio-basic2-coupling-carbon"],
        "languagesActuallyRead": ["de", "en"], "completeTaskResponseScoringTransferRead": True,
        "decision": "KEEP_CONTENT_WITH_CURRENT_SCIENTIFIC_CONTEXT_BINDING", "contentChanged": False,
        "statusPreserved": "needs_human_review", "reviewAuthorityPreserved": "ai_candidate",
        "evidenceLevelPreserved": "E1", "maximumClaimScopePreserved": "G1", "actualLearnerPerformance": False,
        "performedExperiments": False, "newEmpiricalEvidenceClaimed": False,
    },
    "sourceScopeContextReview": {
        "respirationJurisdictions": ["DE-BB", "DE-BE", "DE-MV", "DE-NW", "DE-SH", "DE-SN", "DE-ST", "DE-TH"],
        "photosynthesisCouplingJurisdictions": ["DE-SN"], "newTargetsOutsideSekI": 0,
        "twentyWholeSourceDutiesPreserved": True, "historicalOriginalPartnerRowsRetainedAsReadingInputs": 268,
        "effectiveHistoricalPartnerRows": preservation["currentEffectiveOriginalPartnerCount"],
        "historicalPartnerRowsAlreadyAbsentInActualActiveAtlas": 20,
        "all3084ActualActiveAtlasRowsRetainedExactly": True, "tenNewRowsRemainPartial": True,
        "fourOriginalOperatorHoldStatesUnchanged": True, "wholeOriginalSourceDutiesNewlyApproved": 0,
        "scopeDecision": "KEEP_BOUNDED_NEW_TARGET_CONTEXT",
    },
    "word576ContextDecision": {
        "decision": "KEEP_ACTUALLY_CORRECT_FULL394_REFERENCE_CONTEXT",
        "changedWholePageKeys": word_delta["changedKeys"],
        "scientificContentAndRelationIdentitiesUnchanged": True,
        "actualPaginationAndOrderDeltaChecked": True,
        "paginationDeltas": word_delta["paginationDeltas"],
        "currentReferencesPointToActualTargetPages": True,
        "notOnlyExternalSubsetPermutation": True, "claimOf392ExactWholePages": False,
        "newScientificWordGoalClosure": False,
    },
    "technicalFindings": [{
        "findingId": "BIO-BASIS2-CONTEXT-B-TECH-001", "status": "OPEN_TECHNICAL_RECEIPT_CORRECTION",
        "affectedArtifact": entry["sourcePreservationProof"],
        "affectedField": "all268OriginalPartnerWholeRowsRetainedInOrdinaryMappingInputs",
        "actualEffectiveHistoricalRows": 248, "historicalRowsAlreadyAbsentInActiveAtlas": 20,
        "scientificTwoGoalContextBlocker": False,
        "requiredAction": "Preserve the first technical artifact unchanged and attach a truthful scoped followup separating the 268 historical reading rows from 248 effective rows. Do not restore withdrawn witnesses merely to make an incorrect preservation claim true.",
        "blocksFinalIntegrationUntilTruthfullyResolved": True,
    }],
    "scientificContextFindings": [], "firstNewContextPeerVerdictsRead": False,
    "independenceExposure": {
        "assignmentDisclosedExistingGoalsAlreadyPairedAndHistoricalHoldStates": True,
        "historicalPReviewerReasonAndReviewerValuesDisplayed": False,
        "historicalPMetadataKeysSeen": True,
        "caseAuthorAtomicAxisAndBoundariesSeen": "The first two full case dumps included author-declared semantic-axis/boundary material and the pending author-only label. These are declared author scope, not prior scientific review decisions.",
        "historicalFourOperatorHoldConstraintsSeen": "Only source identities, original duties, partner identities and required existing HOLD statuses were displayed; prior reviewer reasons and proposed remediations were not consulted.",
        "noClaimOfNewBlindHistoricalWholeProfileOrSourceReview": True,
    },
    "newScientificGoalClosuresIntegrated": 0, "activeWrites": 0, "activeStrictGain": 0,
    "activeBaseline": "244/392", "humanApproval": False, "humanTrial": False,
}
verdict_path = write("new-two-context-and-576.independent-b.first-verdict.json", own_verdict)
first_files = [p for p in OWN.rglob("*") if p.is_file()]
seal_path = write("independent-b.first-context.freeze.json", {
    "schemaVersion": 1, "reviewId": run_id, "createdAtUtc": now,
    "firstVerdict": binding(verdict_path),
    "firstDescriptionRecords": binding(record_path), "firstDescriptionRun": binding(run_path),
    "firstNewContextPeerVerdictsRead": False, "historicalReviewsRestarted": False,
    "artifacts": [binding(p) for p in sorted(first_files)],
    "activeWrites": 0, "humanApproval": False,
})
print(json.dumps({"firstVerdict": binding(verdict_path), "firstSeal": binding(seal_path), "descriptionRecords": binding(record_path), "normalRun": binding(run_path)}, ensure_ascii=False, indent=2))
