#!/usr/bin/env python3
"""Author inactive, bounded Q1 repairs. Never mutate an operative input."""
import copy
import hashlib
import json
import pathlib
import subprocess
import unicodedata
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
REL = OUT.relative_to(ROOT).as_posix()
NOW = datetime.now(timezone.utc).isoformat()
OLD = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-candidate-v1"
V2 = OLD.with_name("biologie-q1-six-candidate-v2")

def read(path):
    return json.loads((ROOT / path).read_text())

def digest(path):
    return "sha256:" + hashlib.sha256((ROOT / path).read_bytes()).hexdigest()

def binding(path):
    return {"path": str(path), "sha256": digest(path)}

def write(name, value):
    (OUT / name).parent.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

canon_path = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
current = read(canon_path)
by_id = {g["id"]: g for g in current["goals"]}
descriptions = read((V2 / "description-decisions.candidates.json").relative_to(ROOT))
ids = [g["goalId"] for g in descriptions["goals"]]
snapshot = copy.deepcopy(current)
proposed = {g["id"]: g for g in snapshot["goals"]}
for d in descriptions["goals"]:
    g = proposed[d["goalId"]]
    for field, source in [("title", "proposedTitleDe"), ("titleEn", "proposedTitleEn"),
                          ("description", "proposedDescriptionDe"), ("descriptionEn", "proposedDescriptionEn")]:
        g[field] = d[source]
    g["requires"] = d["proposedRequires"]
    d["currentGoal"] = by_id[g["id"]]
    d["finalizedCandidateGoal"] = g
    d["sourceRemediationStatus"] = "inactive_author_candidate_with_explicit_component_preservation"
descriptions.update({"createdAt": NOW, "reviewer": "/root/bio_q1_six_source_remediation",
                     "predecessorPath": (V2 / "description-decisions.candidates.json").relative_to(ROOT).as_posix(),
                     "predecessorDigest": digest((V2 / "description-decisions.candidates.json").relative_to(ROOT)),
                     "notBlind": True, "independentReviewClaim": False})
write("six-finalized-description.candidates.json", descriptions)
write("six-proposed.validation-snapshot.json", snapshot)

inputs_path = "app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json"
inputs = read(inputs_path)
maps = {p: read(p) for p in inputs["mappingPaths"]}
he_mp = next(p for p in maps if "/DE-HE/upper-secondary/" in p)
by_mp = next(p for p in maps if "/DE-BY/" in p)
he_ext_path = maps[he_mp]["sourceExtractionPath"]
by_ext_path = maps[by_mp]["sourceExtractionPath"]
he_ext = read(he_ext_path)
by_ext = read(by_ext_path)
he_goals = {g["id"]: g for g in he_ext["sourceGoals"]}
by_goals = {g["id"]: g for g in by_ext["sourceGoals"]}
he_pdf = "curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf"
he_url = "https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf"
clauses = {
    ids[0]: ("81989ae5-1566-4c16-a5db-9959e9db831e", "Q1.1", 38,
             "Aufbau und Replikation der DNA: Watson-Crick-Modell (Schema), Nukleotide, semikonservative Replikation (Schema)"),
    ids[1]: ("098832af-d236-4b95-8dd6-c8d45ba2293b", "Q1.1", 38,
             "Ablauf der Proteinbiosynthese bei Pro- und Eukaryoten: Transkription, Struktur und Funktion von mRNA, Translation, Ribosom, tRNA, genetischer Code einschließlich des Umgangs mit der Code-Sonne"),
    ids[2]: ("ed4cdb55-2514-4483-9db6-eb4d74bd6663", "Q1.1", 38,
             "Genmutationen (Substitution, Deletion, Insertion, Duplikation)"),
    ids[3]: ("b8aa6b7a-8598-4498-83f5-5162bc3cb419", "Q1.2", 39,
             "Regulation der Genaktivität bei Eukaryoten: Transkriptionsfaktoren, Modifikation des Epigenoms durch DNA-Methylierung"),
    ids[4]: ("6576c30f-638e-4c20-b6c6-97c602b6b2fa", "Q1.2", 39,
             "Bau und Vermehrung von Bakterien (Schema)"),
    ids[5]: ("b5e1cdfd-34ff-4c05-976c-ee69ec041fdb", "Q1.2", 39,
             "PCR und Gelelektrophorese"),
}
source_deltas = []
for gid, (sid, topic, page, actual) in clauses.items():
    before = he_goals[sid]
    after = copy.deepcopy(before)
    # Keep stable extraction ID and local span as extraction identity. The actual
    # bullet is the quoted raw source; a didactic goal sentence stays authored.
    after.update({"description": proposed[gid]["description"],
                  "sourceText": actual, "rawSourceText": actual,
                  "parentBulletText": actual, "rawParentBulletText": actual,
                  "sourceRef": f"Hessen KC Biologie Oberstufe, Ausgabe 2024, Stand 01.08.2025, {topic}, gedruckte S. {page}; lokale Extraktions-ID {before['sourceSpan']}"})
    source_deltas.append({"sourceGoalId": sid, "before": before, "after": after,
                          "officialPdf": binding(he_pdf), "officialUrl": he_url,
                          "printedPage": page, "pdfPageIndex": page - 1,
                          "officialBulletIsSource": True, "authoredDescriptionIsOfficialQuote": False,
                          "adoptionCondition": "Independent source/component review and current view preservation; never treat this narrower authored description as full-bullet coverage."})
write("he-six-source-extraction-deltas.candidates.json", {
    "schemaVersion": 1, "status": "unadopted_author_candidate", "createdAtUtc": NOW,
    "sourceInput": binding(he_ext_path), "deltas": source_deltas,
    "documentBoundary": "The old source-json snapshot is authored structured provenance, not the official PDF. Bind these six inspected passages to the real official PDF independently; do not relabel every uninspected passage."})

companions = read((V2 / "split-companions.candidates.v3.json").relative_to(ROOT))
companions.update({"createdAt": NOW, "reviewer": "/root/bio_q1_six_source_remediation", "notBlind": True,
                   "independentReviewClaim": False,
                   "predecessorPath": (V2 / "split-companions.candidates.v3.json").relative_to(ROOT).as_posix(),
                   "predecessorDigest": digest((V2 / "split-companions.candidates.v3.json").relative_to(ROOT))})
for c in companions["goals"]:
    c["stableGoalId"] = None
    if c["candidateKey"] == "bacterial-binary-fission":
        c["requiresCandidate"] = ["5b2571d9-f079-52b2-b21b-8f389c7409f4", "2d451684-6e53-565e-a987-f362da919d2c"]
        c["sourceScope"] = "HE Q1.2 p39 LK schema plus independently inspected descriptive reproduction components in BY9, MV7, NW SekI, SH7-10, SN7 and ST7/8. Not full source clauses, quantitative culture growth or all-state approval."
        c["targetedPrerequisiteDelta"] = {
            "beforeRequires": ["5b2571d9-f079-52b2-b21b-8f389c7409f4", "e70d8a85-2dea-5165-919b-200fee9f4db4", "2d451684-6e53-565e-a987-f362da919d2c"],
            "afterRequires": c["requiresCandidate"],
            "reason": "Actual cases supply chromosome copying/distribution as a schema. They do not assess nucleotide pairing, biochemical synthesis or semiconservative molecular replication. That detailed replication atom is therefore not a universal prerequisite for this descriptive reproduction process.",
            "descriptionAndInnerProfileChanged": False, "independentTargetedPrerequisiteReview": "pending"}
    c["sourceBindingCandidate"] = {
        "officialPdf": binding(he_pdf), "officialUrl": he_url,
        "sourceGoalId": clauses[c["splitFromGoalId"]][0], "topicCode": "Q1.2", "printedPage": 39,
        "matchType": "partial", "scope": "GK_LK" if c["candidateKey"].startswith("dna-") else "LK",
        "wholeSourceBulletCoveredAlone": False}
    c["atomicityCandidate"] = {"status": "atomic", "semanticAtomic": True,
                               "reason": "One bounded causal mechanism: " + ("DNA marking and transcription in the same supplied gene context." if c["candidateKey"].startswith("dna-") else "chromosomal copying, distribution and separation constitute a single binary-fission process; optional population numbers are not another required goal.")}
    c["memoryCandidate"] = {"status": "no_memory_needed", "memoryUseful": False,
                           "reason": "The supplied model and matched data support explanation and fresh transfer. No standalone uncued recall item or mandatory memorized catalogue is added.",
                           "requiredCards": [], "newDecks": [], "visibilityClaim": "No memory_required goal or memory node is authored; no vacuous visibility pass stands for a companion's ordinary goal visibility."}
    c["placementCandidate"] = {"parentGoalId": "96bdf495-2801-57e4-a0da-ce3bf91e402c",
                                "requires": c["requiresCandidate"],
                                "sourceViews": ["DE-HE-SekII-GK", "DE-HE-SekII-LK"] if c["candidateKey"].startswith("dna-") else ["DE-HE-SekII-LK"],
                                "otherSourceScopes": "Only the explicit source witnesses and partial candidate relationships in bacterial-local-source-witnesses.candidates.json may authorize further views after independent source/frontier checks. No automatic all-state projection."}
write("two-preservation-companions.candidates.json", companions)

mapping_deltas = []
for gid, (sid, topic, page, actual) in clauses.items():
    existing = [r for r in maps[he_mp]["mappings"] if r["legacyGoalId"] == sid and r["canonicalGoalId"] == gid]
    assert len(existing) == 1
    row = copy.deepcopy(existing[0])
    row["matchType"] = "partial" if gid in [ids[0], ids[3], ids[4], ids[5]] else "exact"
    component = {"sourceGoalId": sid, "retainedGoalId": gid, "beforeMappings": existing,
                 "candidateRetainedMapping": row, "officialClause": actual, "printedPage": page,
                 "individualTargetIsWholeBullet": row["matchType"] == "exact"}
    if gid == ids[0]:
        component["candidateAdditionalMapping"] = {"legacyGoalId": sid,
            "canonicalGoalId": "e70d8a85-2dea-5165-919b-200fee9f4db4", "matchType": "partial", "reviewDecisionId": sid}
        component["preservationGate"] = "Explicit semiconservative model, source-bound e70 description/P and HE GK/LK visibility must be reviewed before narrowing 0daa. Existing generic simple-replication text alone is not this gate. NI molecular-DNA placement remains a separate HOLD."
    elif gid == ids[3]:
        component["candidateAdditionalMapping"] = {"legacyGoalId": sid, "candidateKey": "dna-methylation-eukaryotes", "canonicalGoalId": None, "matchType": "partial", "reviewDecisionId": sid}
        component["preservationGate"] = "Adopt/reuse an independently reviewed GK/LK DNA-methylation atom, both HE Q1.2 views and actual exam routing; histone8f is only the LK histone component."
    elif gid == ids[4]:
        component["candidateAdditionalMapping"] = {"legacyGoalId": sid, "candidateKey": "bacterial-binary-fission", "canonicalGoalId": None, "matchType": "partial", "reviewDecisionId": sid}
        component["preservationGate"] = "Adopt/reuse the independently reviewed binary-fission atom and HE LK visibility before narrowing. Seven other source states preserve only the independently supported local components."
    elif gid == ids[5]:
        component["preservedExistingPCRMapping"] = next(r for r in maps[he_mp]["mappings"] if r["canonicalGoalId"] == "a3f483ce-126e-595c-999c-aa4d95106221")
        component["preservationGate"] = "PCR remains an ordinary separate source target; its current canonical text/P/asset and untouched source mapping are preserved. No PCR lab-performance approval or deletion is inferred from removing it as a universal gel prerequisite."
    mapping_deltas.append(component)
write("he-six-component-mapping-deltas.candidates.json", {"status": "unadopted_author_candidate", "createdAtUtc": NOW,
    "mappingInput": binding(he_mp), "deltas": mapping_deltas,
    "idBoundary": "Null target IDs are pending candidate references, not valid final mapping rows. Do not install this delta file as an operative reviewed mapping."})

# BY partial method/regulation/structure bindings add only supported components.
by_add = []
for sid, gid, section, boundary in [
    ("43240b1a-10e4-5c51-ad89-92dbed53d3f1", ids[5], "B12 2.6", "Gel separation and supplied marker analysis are one DNA-analytics method component. They do not cover all human medical/social/ethical analysis, fingerprinting or sequencing."),
    ("925fc9a9-6e86-54ff-a294-de755d5ba47a", ids[3], "B12 2.2", "Transcription-factor influence is one regulation component. It does not cover DNA methylation, X inactivation, all environmental adaptation or developmental specialization."),
    ("dc5044f4-bf54-5642-8201-49dcf8dce9e1", ids[4], "B9 2", "The bacterial ground plan is one biotechnology component. Do not infer the complete microbe reproduction/metabolism/usability clause, obligatory exponential population analysis or a detailed organelle catalogue.")]:
    by_add.append({"sourceGoalId": sid, "sourceGoal": by_goals[sid], "proposedTargetGoalId": gid,
                   "candidateMapping": {"legacyGoalId": sid, "canonicalGoalId": gid, "matchType": "partial", "reviewDecisionId": sid},
                   "beforeMappings": [r for r in maps[by_mp]["mappings"] if r["legacyGoalId"] == sid],
                   "officialSection": section, "wholeClauseClaim": False, "boundary": boundary,
                   "sourceOccurrencesPreserved": by_goals[sid].get("sourceOccurrences", []),
                   "sourceUrl": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/biologie" if section.startswith("B9") else "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend",
                   "additionalEnhancedUrl": None if section.startswith("B9") else "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht"})
write("by-three-new-partial-source-bindings.candidates.json", {"status": "unadopted_author_candidate", "createdAtUtc": NOW,
    "mappingInput": binding(by_mp), "extractionInput": binding(by_ext_path), "deltas": by_add,
    "existingSourceTargetsUnchanged": True, "claimLimit": "Actual official competence and associated content were inspected. Adding these partial bindings is not a new approval of unchanged whole-clause targets or their assessment profiles."})

by475 = "a6ad1554-558e-51e4-9d05-aa9b38ebfa40"
byffef = "ef3a58c6-09b3-5e91-80a0-fb3857268603"
write("by-protein-and-mutation-partial-boundaries.candidates.json", {
    "status": "unadopted_author_candidate_with_open_preservation", "createdAtUtc": NOW,
    "mappingInput": binding(by_mp), "deltas": [
        {"sourceGoalId": by475, "canonicalGoalId": ids[1], "beforeMatchType": "exact", "candidateMatchType": "partial",
         "preservedRequiredComponent": "Proteins' role in trait expression and simple gene-product-trait models.",
         "existingComponentCandidates": ["18b3540e-4379-5d13-b3ec-dc7fe21c5e6a", "5f01403c-6560-5515-aa76-03860aa52315"],
         "hold": "Both existing protein/gene-chain candidates depend on detailed upper-secondary biosynthesis1ec and include a multi-gene chain. Neither is a reviewed age-fit BY9 replacement as-is. Review/re-scope a simple trait-role component before installing the partial relationship."},
        {"sourceGoalId": byffef, "canonicalGoalId": ids[2], "beforeMatchType": "exact", "candidateMatchType": "partial",
         "preservedRequiredComponents": ["Mutagenic causes", "protein-function consequences with sufficient supplied measurements/model", "protection against mutagenic influences"],
         "sourceOccurrences": by_goals[byffef].get("sourceOccurrences", []),
         "hold": "HE four-subtype sequence analysis is not the complete BY GA/EA mutagen/function/protection competence; no unreviewed replacement or full source claim is authored."}
    ]})

exam_id = "3ac1cbb1-a366-5ae5-85c0-76b08270869d"
write("assessment-and-overlap-preservation.candidates.json", {"status": "unadopted_author_candidate", "createdAtUtc": NOW,
    "exam": {"goalId": exam_id, "before": by_id[exam_id],
             "requiresCandidateExistingGoalIds": by_id[exam_id]["requires"],
             "requiresCandidateAdditionalCandidateKey": "dna-methylation-eukaryotes",
             "coveredGoalIdsCandidateExistingGoalIds": by_id[exam_id]["examData"]["coveredGoalIds"],
             "coveredGoalIdsCandidateAdditionalCandidateKey": "dna-methylation-eukaryotes",
             "rationale": "Actual task1/2 and solution use both promoter methylation and factor binding. Keep TF946 AND the methylation companion, plus biosynthesis475 and cell-cycle7f. Do not replace946 by methylation alone or bulk-cover unrelated companions.",
             "unchangedScientificFollowupFinding": "Material4 is an explicitly supplied promoter model. Its task/solution may be judged within that model; no universal methylation effect is inferred. Existing scoring step sum29 versus maxPoints30/task total30 is visible and remains a separate assessment HOLD, not silently fixed here."},
    "existingEpigeneticsOverlap": {"goalId": "99544494-1825-5fc1-8e23-56f0df808e56", "before": by_id["99544494-1825-5fc1-8e23-56f0df808e56"],
        "sourceGoalId": "a588f3b5-7b11-4480-af76-81c54990e1df", "beforeSource": he_goals["a588f3b5-7b11-4480-af76-81c54990e1df"],
        "officialQ15Boundary": "HE p40 Q1.5 LK: principle of gene-activity control in developmental phases/organisms; the official bullet is not the old authored methylation/acetylation sentence.",
        "decision": "HOLD existing995 reuse pending independent overlap, actual Q1.5 coverage and source-route review. Prefer the explicitly reviewed Q1.2 GK/LK companion for immediate component preservation; do not mint a duplicate without this recorded boundary.",
        "existingHistoneComponent": "8f6933b1-6e02-5512-acf2-a90a7fb9cb75", "unchangedHistoneReviewNotRestarted": True}})

am_reasons = [
    ("DNA structure and information storage are one structure-function model. Copying DNA is explicitly excluded and must be preserved by a distinct replication atom.", "A supplied nucleotide/paired-base model supports explaining storage and deriving a fresh complement; no independent mandatory fact catalogue or uncued base-name retrieval has been introduced."),
    ("The same supplied sequence is traced through DNA, mRNA and polypeptide as one connected information-flow explanation, rather than two unrelated routines.", "The genetic-code table, pairing data and cell contexts are supplied; the positive requirement is explaining their connected model and fresh transfer, not memorizing codon assignments."),
    ("The event and its bounded possible protein consequence concern the same supplied coding case; classification without context is insufficient, and protein function/phenotype cannot be invented.", "Mutation events are distinguished through supplied changes and gene/code data. Understanding mutation consequence is the goal; there is no separate indispensable memorized four-term catalogue in this material-supported scope."),
    ("One factor-mediated transcription mechanism; methylation and operon regulation are excluded as independently assessable mechanisms and remain preservation dependencies.", "Binding sites, factor effects and mRNA evidence are supplied. Explaining and testing a factor-mediated model requires no newly authored obligatory recall deck."),
    ("The prokaryotic ground plan and location of genetic material constitute one structure-function representation. Reproduction is a separate pending companion.", "The diagram and legend supply visible components. The goal is comparative structural explanation and transfer to a plasmid-free bacterium, not recalling an expanded bacterial-component list."),
    ("Separation principle and marker-backed reading explain one analytical method. Laboratory execution and PCR competence remain outside this operative goal.", "Marker sizes, polarities and sample data are supplied; justified length ordering and interpretation are the positive work, not uncued numerical constants or memorized band catalogues.")
]
def fp(goal, rule):
    def norm(value): return " ".join(unicodedata.normalize("NFKC", str(value or "")).split())
    payload = {"ruleVersion": rule, "goalId": goal["id"], "shortKey": goal.get("shortKey", ""),
               "title": norm(goal.get("title")), "titleEn": norm(goal.get("titleEn")),
               "description": norm(goal.get("description")), "descriptionEn": norm(goal.get("descriptionEn")),
               "phase": norm(goal.get("dimensionTags", {}).get("phase")), "area": norm(goal.get("dimensionTags", {}).get("area")),
               "topicCode": norm(goal.get("dimensionTags", {}).get("topicCode")), "nodeKind": norm(goal.get("nodeKind"))}
    return "sha256:" + hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()

for lane, rule in [("atomicity", "semantic-atomicity-v1"), ("memory", "memory-card-review-v1")]:
    rows = []
    for gid, reasons in zip(ids, am_reasons):
        record = {"schemaVersion": 1, "reviewId": "biologie-q1-six-source-hold-remediation-candidate-v1", "ruleVersion": rule,
                  "landscapeId": current["landscapeId"], "goalId": gid, "fingerprint": fp(proposed[gid], rule),
                  "reviewedAt": NOW, "reviewer": "/root/bio_q1_six_source_remediation", "reason": reasons[lane == "memory"]}
        record.update({"status": "atomic", "semanticAtomic": True} if lane == "atomicity" else {"status": "no_memory_needed", "memoryUseful": False})
        rows.append(record)
    (OUT / (lane + ".candidate.review.jsonl")).write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows))
    config = {"schemaVersion": 1, "reviewId": rows[0]["reviewId"], "ruleVersion": rule,
              "landscapeId": current["landscapeId"], "landscapePath": REL + "/six-proposed.validation-snapshot.json",
              "reviewPath": REL + "/" + lane + ".candidate.review.jsonl",
              "scope": {"label": "Inactive proposed six ordinary atoms only; source/placement holds are independent", "rootGoalIds": ids}}
    if lane == "memory":
        (OUT / "memory.candidate.cards.review.jsonl").write_text("")
        config["cardReviewPath"] = REL + "/memory.candidate.cards.review.jsonl"
        config["visibilityScopes"] = read("curricula/DE/Gymnasium/quality/memory-card-review/biologie-q1-tests-therapy-current-20261004-v1/canonical-biology-full.config.json")["visibilityScopes"]
    write(lane + ".candidate.config.json", config)

p_candidate = read((OLD / "positive-evidence.candidates.json").relative_to(ROOT))
p_candidate.update({"reviewId": "biologie-q1-six-source-hold-remediation-candidate-v1", "reviewedAt": NOW,
                    "reviewer": "/root/bio_q1_six_source_remediation"})
for rec in p_candidate["goals"]:
    rec["reason"] = "Inactive author successor: operative DE/EN scope remains exactly the independently reviewed v2 scope. The INNER profile is unchanged from v1; source/placement/component preservation is explicitly open. No current central or human approval."
write("positive-evidence.candidates.json", p_candidate)
p_config = read((OLD / "positive-evidence.validation-only.config.json").relative_to(ROOT))
p_config.update({"reviewId": p_candidate["reviewId"], "landscapePath": REL + "/six-proposed.validation-snapshot.json",
                 "reviewPath": REL + "/positive.validation-only.not-registered.review.jsonl"})
write("positive.validation-only.config.json", p_config)

context_ids = set(ids)
for gid in ids:
    context_ids.update(by_id[gid].get("requires", []))
    context_ids.update(proposed[gid].get("requires", []))
    context_ids.update(k for k, v in by_id.items() if gid in v.get("requires", []) or gid in v.get("contains", []))
context_ids.update(["e70d8a85-2dea-5165-919b-200fee9f4db4", "99544494-1825-5fc1-8e23-56f0df808e56", "8f6933b1-6e02-5512-acf2-a90a7fb9cb75", "18b3540e-4379-5d13-b3ec-dc7fe21c5e6a", "5f01403c-6560-5515-aa76-03860aa52315"])
write("current-six-and-neighbor-context.snapshot.json", {"status": "current_public_context_input_only", "capturedAtUtc": NOW,
    "canonicalInput": binding(canon_path), "currentGoalCount": len(by_id), "goalIds": ids,
    "contextOnlyGoalIds": sorted(context_ids - set(ids)), "currentGoals": [by_id[k] for k in sorted(context_ids)],
    "scopedDirectParentAndNeighborRelationsInspected": True, "claimLimit": "Current contexts are inspection inputs, not reviews of every unchanged neighbor or a new full effective-route gate."})

bindings = [binding(p) for p in [canon_path, inputs_path, he_ext_path, by_ext_path, he_mp, by_mp, he_pdf,
    "AGENTS.md", "docs/concept/skill-graph/atomic-goal-visualizations.md",
    (V2 / "description-decisions.candidates.json").relative_to(ROOT).as_posix(),
    (OLD / "positive-evidence.candidates.json").relative_to(ROOT).as_posix(),
    (V2 / "split-companions.candidates.v3.json").relative_to(ROOT).as_posix()]]
write("author-input-bindings.json", {"createdAtUtc": NOW, "inputs": bindings, "stableGoalIdsMinted": 0,
    "activeCanonicalEdits": 0, "activeRegistryEdits": 0, "humanApproval": False})
print(json.dumps({"directory": REL, "sixCurrentIds": ids, "currentCanonicalGoals": len(by_id),
                  "ordinaryGoalIdsMinted": 0, "activeWrites": False, "claim": "inactive_candidate_authoring_only"}))
