# SPDX-License-Identifier: Apache-2.0
"""Write only inactive candidate artifacts in this folder."""
import copy
import datetime
import hashlib
import json
import pathlib
import re
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[7]
OWN = pathlib.Path(__file__).resolve().parent
QUALITY = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05"
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()
NS = uuid.UUID("fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb")
LANDSCAPE = "08a43a1b-d97e-522c-9dfa-c950a493364e"
SEED = f"biology:{LANDSCAPE}:nonmolecular-mitotic-genetic-identity-chromosome-model"
NEW = str(uuid.uuid5(NS, SEED))
CELL = "b1dff57f-329e-5264-b2b9-2db71a0b2172"
PARENT = "b4176012-f93a-5dd2-84b3-edd6a9932367"
MITOSIS = "1d2b1038-dcd5-529a-b085-9e14f1d58c76"
DNA = "e70d8a85-2dea-5165-919b-200fee9f4db4"
CYCLE = "05358518-f66c-5c1b-ad3f-d16211d0fc1c"
COMPARE = "ec88fc1d-ee0f-5a01-9464-dc358241050e"
RETIRE = "ni-biology-seki-kc2015-fw6-003-fd1495c5"
SOURCE = "ni-biology-seki-kc2015-fw6-004-f11cdf34"
SOURCE_TEXT = "begründen die Erbgleichheit von Körperzellen eines Vielzellers mit der Mitose."

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, payload):
    (OWN / name).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")

canonical_path = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
canonical = read(canonical_path)
by = {g["id"]: g for g in canonical["goals"]}
assert NEW not in by
duplicates = [g for g in canonical["goals"] if re.search(r"mitos|erbgleich|genetisch.*ident|tochter|replikation|zellzyklus", g.get("title", "") + " " + g.get("description", ""), re.I)]

goal = {
    "id": NEW,
    "shortKey": "canonical_biology_nonmolecular_mitotic_genetic_identity",
    "title": "Erbgleichheit durch Mitose am Chromosomenmodell begründen",
    "titleEn": "Justify genetic identity through mitosis using a chromosome model",
    "description": "Die lernende Person kann an einem vorgegebenen Chromosomenmodell begründen, wie die zuvor verdoppelte Erbinformation bei der Mitose so verteilt wird, dass beide Tochterzellen je eine identische Kopie jedes Chromosoms und damit die gleiche vollständige Erbinformation wie die Ausgangszelle erhalten.",
    "descriptionEn": "The learner can use a supplied chromosome model to justify how previously duplicated genetic information is distributed during mitosis so that each daughter cell receives one identical copy of every chromosome and thus the same complete genetic information as the original cell.",
    "weight": 1,
    "tags": ["GK", "LK", "canonical", "SekI"],
    "contains": [],
    "requires": [CELL],
    "applicability": {"jurisdiction": ["DE-NI"]},
    "type": "atomic",
    "dimensionTags": {
        "framework": "canonical-gymnasium-biology",
        "demandLevel": "AB2",
        "processCompetencies": [],
        "guidingIdeas": ["BIO_INFORMATION_KOMMUNIKATION", "BIO_ENTWICKLUNG"],
        "phase": "GLOBAL",
        "area": "Genetik",
        "topicCode": "CANONICAL.BIOLOGY.NONMOLECULAR_MITOTIC_GENETIC_IDENTITY",
    },
    "extendedData": {
        "applicabilityMappingInheritance": "boundary",
        "provenance": {
            "sourceLandscapeId": "0b27a054-e81e-5423-aa71-d3d8d9d8f0db",
            "sourceLandscapeTitle": "DE-NI - Biologie Sekundarstufe I (Niedersachsen, KC 2015 Source-Extraction)",
            "sourceGoalId": SOURCE,
        },
    },
}

prior_canon_path = QUALITY / "biologie-ni-preservation-candidate-v2/canonical.delta.candidates.json"
prior_canon = read(prior_canon_path)
genetic_parent = next(p for p in prior_canon["parentContainsDeltas"] if p["goalId"] == PARENT)
parent_after = genetic_parent["after"] + [NEW]
write("canonical.delta.candidates.json", {
    "schemaVersion": 1, "candidateStatus": "inactive_author_candidate",
    "authoredAt": STAMP, "ownGoalContentLicense": "CC-BY-4.0",
    "goalIdNamespace": str(NS), "stableIdProposals": [{"goalId": NEW, "seed": SEED}],
    "newGoals": [goal], "currentGoalDeltas": [],
    "parentContainsDeltas": [{"goalId": PARENT, "beforeCurrent": by[PARENT]["contains"], "beforeAfterPriorNICandidate": genetic_parent["after"], "after": parent_after}],
    "compositionWithEarlierCanonicalDeltaPath": str(prior_canon_path.relative_to(ROOT)),
    "existingMitosisGoalPreservedUnchanged": MITOSIS,
    "independentAtomicityReviewRequired": True,
    "currentStrictClosuresClaimed": 0,
})

source_path = ROOT / "curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json"
mapping_path = ROOT / "curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-e3-recombination-20261001-v2.review.json"
source = read(source_path)
mapping = read(mapping_path)
sources = {s["id"]: s for s in source["sourceGoals"]}
retired_rows = [r for r in mapping["mappings"] if r["legacyGoalId"] == RETIRE]
retired_decision = next(d for d in mapping["decisions"] if d["sourceGoalId"] == RETIRE)
prior_source_path = QUALITY / "biologie-ni-preservation-candidate-v2/source-extraction.delta.candidates.json"
prior_source = read(prior_source_path)
prior_map_path = QUALITY / "biologie-ni-preservation-candidate-v3/mapping.delta.candidates.json"
prior_map = read(prior_map_path)
successor_source = "curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.m7-ni-preservation-complete-20261005-v4.json"
successor_map = "curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-ni-preservation-complete-20261005-v4.review.json"

after_source = copy.deepcopy(sources[SOURCE])
after_source.update({
    "title": SOURCE_TEXT,
    "description": "Die lernende Person kann die Erbgleichheit von Körperzellen eines Vielzellers mit der Mitose begründen.",
    "sourceText": SOURCE_TEXT,
    "sourceRef": "Niedersachsen Kerncurriculum Naturwissenschaften Gymnasium Sekundarbereich I 2015, Biologie, FW 6.1 Individualentwicklung, zusätzlich am Ende von Jahrgangsstufe 10, S. 87.",
    "sourceSpan": {"passageId": sources[SOURCE]["passageId"], "label": "FW 6.1 Individualentwicklung: " + SOURCE_TEXT},
    "sourceSpanText": f"FW 6.1 Individualentwicklung, Tabellenspalte zusätzlich Ende Jg. 10, S. 87, Source-Ziel {SOURCE}",
    "tags": [t for t in sources[SOURCE]["tags"] if not t.startswith("grades:")] + ["grades:9/10"],
})
after_source["metadata"].update({
    "grades": "9/10", "sourcePage": 87,
    "sourceTableColumn": "zusätzlich Ende Jg. 10",
    "sourceScopeRestriction": "cytological/chromosomal mitotic genetic-identity justification; DNA structure/identical molecular replication/protein biosynthesis explicitly postponed to SekII",
    "canonicalTargets": [MITOSIS, NEW], "matchType": "partial",
})
source_deltas = copy.deepcopy(prior_source["sourceGoalDeltas"])
source_deltas.append({"sourceGoalId": SOURCE, "before": sources[SOURCE], "after": after_source, "reason": "Own actual printed87 table inspection: correct the original paraphrase to Erbgleichheit, bind the end-class10 column and preserve the nonmolecular justification demand."})
write("source-extraction.delta.candidates.json", {
    "schemaVersion": 1, "candidateStatus": "inactive_author_candidate",
    "beforePath": str(source_path.relative_to(ROOT)), "beforeSha256": sha(source_path),
    "proposedSuccessorPath": successor_source,
    "carriedEarlierSixDeltaPath": str(prior_source_path.relative_to(ROOT)),
    "carriedEarlierSixDeltasUnchanged": True,
    "sourceGoalDeltas": source_deltas,
    "retiredSourceGoalDeltas": [{"sourceGoalId": RETIRE, "before": sources[RETIRE], "after": None, "reason": "Synthetic introductory DNA-replication statement is not a SekI table competence and contradicts the explicit molecular SekII restriction.", "retirementManifestCandidatePath": str((OWN / "source-retirement.manifest.candidate.json").relative_to(ROOT))}],
    "candidateCountDelta": {"beforeSourceGoals": len(source["sourceGoals"]), "afterSourceGoals": len(source["sourceGoals"]) - 1, "newSourceGoals": 0, "retiredSyntheticSourceGoals": 1},
    "scope": "Exact earlier six cell corrections plus FW6-004 wording/grade/target correction and one FW6-003 retirement; no blanket grade normalization or source-document replacement.",
    "qualityMetadataAdoptionRequired": "A versioned successor must update stale124 pipeline count statements to the actual123 active source atoms, preserve the historical audit, and append only the selected current review scope. Old 'all sources covered' labels are not a new whole-document approval.",
    "unchangedRecordsAreNotReapproved": True,
})

new_rows = [
    {"legacyGoalId": SOURCE, "canonicalGoalId": MITOSIS, "matchType": "partial", "reviewDecisionId": SOURCE},
    {"legacyGoalId": SOURCE, "canonicalGoalId": NEW, "matchType": "exact", "reviewDecisionId": SOURCE},
]
before_decision = next(d for d in mapping["decisions"] if d["sourceGoalId"] == SOURCE)
after_decision = copy.deepcopy(before_decision)
after_decision.update({
    "sourceSpan": after_source["sourceSpanText"], "canonicalGoalIds": [MITOSIS, NEW],
    "matchType": "partial",
    "rationale": "INACTIVE CANDIDATE: actual FW6.1 class10 table asks to justify Erbgleichheit through mitosis on the chromosomal level. The new narrowly atomic chromosome-copy-distribution competence carries this justification, with one identical copy of every represented chromosome in each daughter. Existing1d mitosis-description remains a partial procedural component, not a full justification witness; its meiosis content is unchanged. Molecular e70 DNA replication, molecularly dependent053 whole-cell-cycle scope and ec88 mitosis/meiosis comparison do not become required by this particular cell. Their unsupported rows are removed here; all independently supported other NI rows remain. Exact refers to the new normalized one-competence target after required independent review, not an active machine or human completion.",
    "reviewer": "codex-ni-mitotic-identity-author-candidate", "reviewedAt": STAMP,
    "notes": "All source rights and historical source/mapping bytes retained. No DNA replication mechanism, DNA structure, protein synthesis or independent full meiosis prerequisite is required.",
})
map_deltas = copy.deepcopy(prior_map["sourceGoalDeltas"])
map_deltas += [
    {"sourceGoalId": RETIRE, "beforeRows": retired_rows, "afterRows": [], "beforeDecision": retired_decision, "afterDecisionCandidate": None, "retirementManifestCandidatePath": str((OWN / "source-retirement.manifest.candidate.json").relative_to(ROOT))},
    {"sourceGoalId": SOURCE, "beforeRows": [r for r in mapping["mappings"] if r["legacyGoalId"] == SOURCE], "afterRows": new_rows, "beforeDecision": before_decision, "afterDecisionCandidate": after_decision},
]
write("mapping.delta.candidates.json", {
    "schemaVersion": 1, "candidateStatus": "inactive_author_candidate",
    "beforePath": str(mapping_path.relative_to(ROOT)), "beforeSha256": sha(mapping_path),
    "proposedSuccessorPath": successor_map,
    "proposedSourceExtractionSuccessorPath": successor_source,
    "carriedEarlierSixMappingDeltaPath": str(prior_map_path.relative_to(ROOT)),
    "carriedEarlierSixMappingDeltasUnchanged": True,
    "sourceGoalDeltas": map_deltas,
    "adoptionStatus": "Inactive;123 source decisions after retiring FW6-003, with current independent source/content review still needed. Partial1d is not promoted to full source coverage. Recompute actual summary counts from adopted rows; neither old complete labels nor this author file proves a full NI curriculum review.",
    "currentStrictClosuresClaimed": 0,
})
write("source-retirement.manifest.candidate.json", {
    "schemaVersion": 1, "candidateStatus": "inactive_retirement_proposal", "authoredAt": STAMP,
    "sourceGoalId": RETIRE, "reasonCode": "synthetic_introductory_statement_not_seki_competence",
    "history": {"sourceExtractionPath": str(source_path.relative_to(ROOT)), "sourceExtractionSha256": sha(source_path), "fullRetiredAtom": sources[RETIRE], "mappingPath": str(mapping_path.relative_to(ROOT)), "mappingSha256": sha(mapping_path), "retiredRows": retired_rows, "retiredDecision": retired_decision},
    "primaryEvidence": {"retainedPdfPath": "curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf", "retainedSha256": "sha256:7b3c69767b4c9a47d87598bee76a28bf7b6d2f6c9b039f2e655a9ad14d47aeac", "printedPage": 87, "actualTableCompetencePreservedBySourceGoalId": SOURCE, "actualTableHeading": "FW 6.1 Individualentwicklung", "actualTableColumn": "zusätzlich am Ende von Jg. 10"},
    "requiredIntentPreserved": "Retire a synthetic molecular-replication source atom, not a required table competence. Keep the actual Erbgleichheit demand through the new supplied-chromosome-model justification target. All valid existing canonical DNA/cell-cycle/mitosis/meiosis content and other-state requirements remain intact.",
    "canonicalGoalsDeleted": [], "historicalArtifactsOverwritten": False,
    "successorSourcePath": successor_source, "successorMappingPath": successor_map,
    "independentAdoptionReviewRequired": True, "humanApprovalClaimed": False,
})

# Compute target membership from every remaining genuine mapping, not from a fixed removal list.
current_rows = list(mapping["mappings"])
delta_ids = {r["sourceGoalId"] for r in map_deltas}
after_rows = [r for r in current_rows if r["legacyGoalId"] not in delta_ids]
for delta in map_deltas:
    after_rows += delta["afterRows"]
before_targets = {r["canonicalGoalId"] for r in current_rows}
after_targets = {r["canonicalGoalId"] for r in after_rows}
view_path = ROOT / "app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json"
view = read(view_path)
view_ids = {e["goalId"] for e in view["rootNodes"][0]["children"]}
assert view_ids == before_targets
kept_targets = {}
for target in [DNA, CYCLE, COMPARE, MITOSIS]:
    kept_targets[target] = [{"sourceGoalId": r["legacyGoalId"], "matchType": r["matchType"]} for r in after_rows if r["canonicalGoalId"] == target]
removed = sorted(before_targets - after_targets)
added = sorted(after_targets - before_targets)
entries = []
for i, entry in enumerate(view["rootNodes"][0]["children"]):
    if entry["goalId"] in removed:
        entries.append({"jsonPointer": f"/rootNodes/0/children/{i}", "before": entry, "after": None, "reason": "No mapping to this target remains after all eight bounded source deltas; no inference from only one removed row."})
write("view-source-preservation.delta.candidates.json", {
    "schemaVersion": 1, "candidateStatus": "inactive_author_candidate", "sourceViewPath": str(view_path.relative_to(ROOT)), "beforeSha256": sha(view_path),
    "compositionWithEarlierCanonicalDeltaPath": str(prior_canon_path.relative_to(ROOT)),
    "exactRemovedEntriesFromCurrentSourceView": entries,
    "exactAddedEntries": [{"kind": "goalEntry", "goalId": i, "projectionRole": "target"} for i in added],
    "sourceViewGoalSetImpact": {"before": len(before_targets), "candidateAfterAllPreservationDeltas": len(after_targets), "removedIds": removed, "addedIds": added},
    "remainingSourceSupportCheckedForPotentialRemovedTargets": kept_targets,
    "newGoalGradePlacement": {"goalId": NEW, "jurisdiction": "DE-NI", "stage": "SekI", "yearBand": "9/10", "endYear": 10, "sourceGoalId": SOURCE, "printedPage": 87, "sourceHeading": "FW 6.1 Individualentwicklung", "requires": [CELL]},
    "regeneration": "Rebuild the NI source view from the fully reviewed successor extraction/mapping overlay; do not manually remove one target while keeping its obsolete source mapping active.",
    "nationalCompositionImpact": "New atom is attached to current b417 genetics cluster. Its explicit NI applicability and atomic inheritance boundary prevent broad source mappings from claiming other-state evidence. Existing national canonicalSubtree entries can structurally expose it. Actual jurisdiction/stage/year-resolved runtime applicability/frontier must still be verified during adoption; static visibility is not a learner-year runtime test.",
    "runtimeYearFrontierClaimed": False, "currentStrictClosuresClaimed": 0,
})
write("current-bindings.snapshot.json", {
    "schemaVersion": 1, "capturedAt": STAMP,
    "canonicalPath": str(canonical_path.relative_to(ROOT)), "canonicalSha256": sha(canonical_path),
    "sourcePath": str(source_path.relative_to(ROOT)), "sourceSha256": sha(source_path),
    "mappingPath": str(mapping_path.relative_to(ROOT)), "mappingSha256": sha(mapping_path),
    "preservedExistingMitosisGoal": by[MITOSIS],
    "prerequisiteChain": [],
    "duplicateSearch": [{"goalId": g["id"], "title": g["title"], "description": g.get("description"), "requires": g.get("requires", [])} for g in duplicates],
    "parentBeforeCurrent": by[PARENT], "actualSourceAtoms": [sources[RETIRE], sources[SOURCE]],
})
snapshot = read(OWN / "current-bindings.snapshot.json")
seen = set()
def chain(i):
    if i in seen: return
    seen.add(i)
    snapshot["prerequisiteChain"].append({"goalId": i, "title": by[i]["title"], "description": by[i].get("description"), "requires": by[i].get("requires", [])})
    for x in by[i].get("requires", []): chain(x)
chain(CELL)
write("current-bindings.snapshot.json", snapshot)
write("semantic-memory.candidates.json", {
    "schemaVersion": 1, "candidateStatus": "inactive_author_candidate",
    "goals": [{"goalId": NEW, "semanticKindCandidate": "curricularAtomic", "semanticAtomicCandidate": True,
        "atomicityReason": "One chromosomal causal justification: beforehand identical copies of every chromosome are distributed one to each daughter, preserving the complete starting genetic information. Correct and incorrect allocations assess that same justification; there is no independent meiosis, molecular replication, gene-product or cell-cycle teaching routine.",
        "memoryDecisionCandidate": "no_memory_needed", "memoryReason": "Copy identity and model labels are provided facts, not a recall quota. Independent allocation/identity reasoning on fresh labels demonstrates the competence. A memorized 'mitosis makes equal cells' slogan or chromosome count does not suffice. No new compact hard-recall card is needed; existing unrelated card origins and visibility decisions must remain intact."}],
    "existingGoalAorMRecordsAltered": [], "cardsChanged": False,
    "finalCurrentAMBindingsPending": True, "humanApprovalClaimed": False,
})

profile = {
    "archetype": "proof",
    "expectations": [
        {"id": "identical-copy-distribution",
         "essentialUnderstandingDe": "Für die modellierte normale Mitose liegt vor der Verteilung zu jedem Chromosom eine zweite identische Informationskopie vor. Erbgleichheit entsteht, wenn jede Tochterzelle genau eine Kopie jedes ursprünglichen Chromosoms erhält. Gleich viele Informationsträger allein reichen nicht aus.",
         "essentialUnderstandingEn": "Before distribution in the modelled normal mitosis, each chromosome has a second copy with identical information. Genetic identity results when each daughter receives exactly one copy of every original chromosome. Equal numbers of information carriers alone are insufficient.",
         "observablePerformanceDe": "Die lernende Person entwirft auf frischen vorgegebenen Chromosomenkennzeichen eine zulässige Verteilung und begründet deren Erbgleichheit mit der Ausgangszelle über die vollständige Information, nicht nur die Teilchenanzahl.",
         "observablePerformanceEn": "The learner constructs a valid allocation using fresh supplied chromosome labels and justifies identity with the starting cell through complete information, rather than particle counts alone."},
        {"id": "identity-criterion-transfer",
         "essentialUnderstandingDe": "Identische Tochter-Erbinformation setzt Kopiengleichheit und vollständige Verteilung aller ursprünglichen Informationstypen voraus. Eine neue Verteilung mit gleichen Stückzahlen, aber fehlenden Informationstypen, erfüllt dieses Kriterium nicht; andere Zeichenfarben oder Anordnungen ändern die Information laut Modelllegende nicht.",
         "essentialUnderstandingEn": "Identical daughter genetic information requires matching copies and complete allocation of all original information types. A fresh allocation with equal counts but missing information types fails this criterion; different drawing colours or positions do not change information according to the model legend.",
         "observablePerformanceDe": "Die lernende Person prüft eine neue korrekt und eine neue fehlerhaft angebotene Verteilung, erklärt, welche Informationsarten übereinstimmen beziehungsweise fehlen, und verwirft eine bloß zahlenbezogene Gleichheitsbehauptung mit einem konkreten Gegenbeispiel.",
         "observablePerformanceEn": "The learner assesses a fresh correct and incorrect allocation, explains which information types match or are missing, and rejects a counts-only equality claim with a concrete counterexample."},
    ],
    "coverageExpectations": {"requiredExpectationIds": ["identical-copy-distribution", "identity-criterion-transfer"], "alternativeExpectationGroups": [], "minimumIndependentDemonstrations": 2, "freshVariationRequired": True, "independentTransferRequired": True},
    "variationAxes": [
        {"id": "information-labels-and-context", "textDe": "Ein frisches Modell von Körperzellvermehrung und ein zweites Modell von Gewebereparatur mit anderer Legende; keine Abfrage echter Chromosomenzahlen.", "textEn": "A fresh model of somatic cell multiplication and a second tissue-repair model with a different legend; no recall of real chromosome numbers."},
        {"id": "allocation-and-counterexample", "textDe": "Eigenständig eine erbgleiche Verteilung erzeugen und eine andere gleichzahlige Fehlverteilung über ihre fehlenden Informationstypen widerlegen.", "textEn": "Independently construct a genetically identical allocation and refute another equal-count incorrect allocation through its missing information types."},
    ],
    "applicationCaseBriefs": [
        {"id": "somatic-model-complete-copy-allocation",
         "taskDemandDe": "Ein vereinfachtes Körperzellmodell zeigt als vollständigen Erbsatz vier Chromosomen mit den Informationskennzeichen K, L, M und N. Vor der Mitose liegen zu jedem dieser Chromosomen zwei verbundene identische Schwesterkopien vor: K1/K2, L1/L2, M1/M2, N1/N2. Die Legende gibt ausdrücklich vor: Die Ziffer unterscheidet nur die Kopie; beide Kopien desselben Buchstabens enthalten gleiche Information. Ein K enthält andere Information als ein L, M oder N. Es wird weder nach DNA-Aufbau noch nach dem molekularen Herstellen der Kopien gefragt. Entwirf eine Verteilung auf zwei Tochterzellen und begründe anhand aller Kennzeichen, warum beide danach erbgleich mit der ursprünglichen Zelle sind. Eine Person behauptet, auch ohne vorherige Kopien könnten die vier ursprünglichen Chromosomen einfach auf zwei Zellen aufgeteilt werden und beide blieben erbgleich. Prüfe diese Behauptung am vorliegenden Modell. Zwei erbgleiche Tochterzellen sind nicht bereits eingezeichnet.",
         "taskDemandEn": "A simplified somatic-cell model represents the complete genetic set by four chromosomes carrying information labels K, L, M and N. Before mitosis, each has two connected identical sister copies: K1/K2, L1/L2, M1/M2 and N1/N2. The supplied legend states explicitly that the digit distinguishes the copy only; copies with the same letter carry identical information, while K contains different information from L, M or N. Neither DNA structure nor molecular copying is asked. Construct an allocation to two daughter cells and justify, using every label, why both are genetically identical to the original cell. Someone claims that without prior copies the four original chromosomes could simply be divided between two cells and both would still be genetically identical. Assess this claim in the model. Genetically identical daughters have not already been drawn.",
         "expectedPerformanceDe": "Eine zulässige eigene Verteilung gibt jeder Tochter genau eine K-, L-, M- und N-Kopie; welche Schwesterkopie links oder rechts landet, ist beliebig. Die Erklärung verknüpft die bereitgestellte Kopiengleichheit mit der vollständigen Informationsausstattung beider Töchter und dem ursprünglichen K/L/M/N-Erbsatz. Ohne vorherige Kopien würde eine reine Aufteilung mindestens Informationstypen in den Töchtern fehlen lassen; zwei gleich große Teilmengen wären keine erbgleichen vollständigen Erbsätze. Eine Aussage 'weil es Mitose ist' oder reine Stückzahlbeobachtung genügt nicht.",
         "expectedPerformanceEn": "A valid independently constructed allocation gives each daughter one K, one L, one M and one N copy; either sister copy may go to either side. The explanation links supplied copy identity to complete information in both daughters and the original K/L/M/N set. Without previous copies, merely partitioning the originals would leave information types absent from daughters; two equally sized subsets would not be genetically identical complete sets. 'Because it is mitosis' or counts alone are insufficient.",
         "understandingFocusDe": "Positive eigene Verteilungsbegründung einschließlich der notwendigen bereitgestellten Kopienbedingung.",
         "understandingFocusEn": "Positive independent allocation justification including the necessary supplied copy condition."},
        {"id": "fresh-tissue-repair-equal-count-counterexample",
         "taskDemandDe": "Für ein neues vereinfachtes Modell der Gewebereparatur besteht die vollständige Ausgangsinformation aus den Chromosomen P, Q, R und S. Das Material gibt zwei identische Schwesterkopien pro Chromosom vor; P1/P2 tragen die gleiche Information, entsprechend Q1/Q2, R1/R2 und S1/S2. Kopien mit verschiedenen Buchstaben sind nicht informationsgleich. Zeichnungsfarben, Drehung und Reihenfolge sind laut Legende bedeutungslos. Vorschlag A verteilt P1,Q2,R1,S2 an Tochter links und P2,Q1,R2,S1 an Tochter rechts. Vorschlag B verteilt P1,P2,Q1,Q2 an Tochter links und R1,R2,S1,S2 an Tochter rechts. Beide Vorschläge liefern vier Träger pro Tochter. Prüfe jeden Vorschlag auf Erbgleichheit mit der Ausgangszelle und begründe deine Entscheidung über die Informationstypen. Widerlege gegebenenfalls die Aussage 'gleiche Anzahl beweist vollständige Erbgleichheit'. Beschreibe eine korrigierte Verteilung für Vorschlag B. Eine Erklärung der molekularen Replikation oder der Meiose ist nicht verlangt.",
         "taskDemandEn": "In a fresh simplified tissue-repair model, the complete starting information consists of chromosomes P, Q, R and S. The material supplies two identical sister copies per chromosome: P1/P2 carry identical information, likewise Q1/Q2, R1/R2 and S1/S2. Different letters do not carry the same information. Drawing colours, orientation and order are explicitly irrelevant in the legend. Proposal A sends P1,Q2,R1,S2 to the left daughter and P2,Q1,R2,S1 to the right. Proposal B sends P1,P2,Q1,Q2 to the left daughter and R1,R2,S1,S2 to the right. Both proposals give four carriers per daughter. Assess each proposal for genetic identity with the original cell, justifying your decisions through information types. Refute the claim 'equal numbers prove complete genetic identity' where appropriate. Describe a corrected allocation for proposal B. Molecular replication and meiosis explanations are not required.",
         "expectedPerformanceDe": "A wird positiv begründet: Beide Töchter erhalten trotz gemischter Kopienziffern alle vier ursprünglichen Informationstypen P,Q,R,S genau einmal; die jeweilige Kopie ist laut gegebenem Material identisch mit der Ausgangsinformation. B wird begründet verworfen: Links fehlen R/S und rechts P/Q, obwohl die Stückzahlen gleich sind. Die eigene Korrektur verteilt von jedem Buchstaben je eine Schwesterkopie an jede Tochter und stellt damit die komplette informationsgleiche Ausstattung wieder her. Farben und Reihenfolge werden nicht mit genetischer Information verwechselt; keine neuen ungenannten Mutationen oder molekularen Mechanismen werden behauptet.",
         "expectedPerformanceEn": "A is positively justified: despite mixed copy digits, both daughters receive each original information type P,Q,R,S exactly once; each copy matches the starting information according to the supplied material. B is rejected with a reason: the left daughter lacks R/S and the right lacks P/Q, although counts are equal. The independent correction sends one sister copy of every letter to each daughter, restoring complete matching information. Colours and order are not mistaken for genetic information; no unreported mutations or molecular mechanisms are claimed.",
         "understandingFocusDe": "Unabhängiger Transfer und konkrete Widerlegung von Zahlen-Gleichheit als vermeintlichem Identitätsbeweis.",
         "understandingFocusEn": "Independent transfer and a concrete refutation of numerical equality as a supposed identity proof."},
    ],
}
write("positive-evidence.candidates.json", {
    "schemaVersion": 1, "authoringContract": "positive-understanding-evidence-candidates-v1",
    "reviewId": "biologie-ni-mitotic-identity-preservation-candidate-v1-20261005",
    "reviewedAt": STAMP, "reviewer": "codex-ni-mitotic-identity-author-candidate",
    "goals": [{"goalId": NEW, "reason": "Genuine end-class10 Erbgleichheit justification gap; supplied copy/legend facts are assistance, independent complete-allocation explanation and fresh faulty-allocation transfer carry the evidence.", "evidenceLevel": "E1", "maximumClaimScope": "G1", "dissent": ["Inactive author candidate; final current independent D/P/A/M/V review and actual image approval remain required."], "profile": profile}],
})

write("assistance-and-claim-boundaries.json", {
    "schemaVersion": 1, "goalId": NEW,
    "providedHelp": ["Identical sister-copy facts, the complete model chromosome set and all letter/digit legends", "All offered allocations in the second case", "Any future illustration showing a correct allocation; copying such an allocation is assisted, not uncued performance"],
    "independentEvidence": ["Own fresh valid allocation in case1 when not shown in an exposed image", "Causal justification through complete information and identity of each supplied copy", "Fresh evaluation and correction of same-count missing-type allocations in case2"],
    "misconceptionsRejected": ["Same chromosome-carrier count alone proves complete identity", "Mitosis label alone is a justification", "Drawing colours or position create information differences despite the supplied legend"],
    "excluded": ["DNA nucleotide/double-helix structure", "Molecular replication mechanisms or enzymes", "DNA/RNA sequence transfer, transcription/translation", "Independent full meiosis or actual species chromosome-number recall", "Universal identity of all real cells despite mutation, differentiation or other model exceptions"],
    "modelScope": "Normal nonmutating mitotic copy-distribution model; no unsupported universal claims outside supplied chromosome information.",
    "currentStrictClosuresClaimed": 0, "humanApprovalClaimed": False,
})

print(json.dumps({"newGoalId": NEW, "allNIViewAfterTargets": len(after_targets), "removedNIViewTargets": removed, "addedNIViewTargets": added, "retainedEc88OtherSourceRows": kept_targets[COMPARE]}, ensure_ascii=False))
