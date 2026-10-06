# SPDX-License-Identifier: Apache-2.0
"""Bind independently written decisions to exactly the reviewed original inputs."""
import datetime
import hashlib
import json
import pathlib

OUT = pathlib.Path(__file__).resolve().parent
ROOT = OUT.parents[6]
AUTHOR = OUT.with_name("biologie-q1-four-current383-source-scope-author-remediation-v4")
AUTHOR_FREEZE = "89816e95a26d30ff82e900565ec164acb3427cb341129f86aaa154adce82419f"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())
write = lambda name, data: (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

assert sha((AUTHOR / "author-source-scope-remediation-v4.final.freeze.json").read_bytes()) == AUTHOR_FREEZE
components = read(AUTHOR / "four-main-components-eight-positive-cases.author-candidate.json")["components"] + read(AUTHOR / "mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json")["components"]
reasons = {
    "classical_genetic_information_carriers_dna_gene_chromosome": "Single relation among information-carrier levels; actual BE/BB terminology supported; alleles and gene-count bounds correctly assessed. No chemistry/practical route imported.",
    "by9_gene_product_trait_genwirk_chain": "Single causal gene-product/pathway/trait competence; two-step chain and transport/enzyme transfer positive. Does not itself assess all B9 protein-formation or structural-diversity source content.",
    "he_code_sun_forward_and_existing_reverse": "Actual full standard code wheel is provided and its radial use explicitly assessed; valid nonunique reverse reconstruction retained as canonical content without inventing a literal HE reverse duty.",
    "he_pro_euk_mrna_ribosome_trna_mechanism": "Connected transcription/translation mechanism with correct orientation, charged-tRNA roles, compartments and intervention predictions. Old molecules distinct from new production; typical models expressly bounded.",
    "mutation_levels_gen_chromosome_genome": "One scale/information-level distinction with supplied copying, segment and segregation causes; actual SN/TH lists supported. Functional consequences only where data exist.",
    "point_and_genome_mutation": "Single bounded ST point/genome scale distinction; two valid fresh substitutions and chromosome counts; source actually says year10 introduction phase.",
    "mutagen_causes_and_protection": "Both controlled causal/protection models scientifically usable. Full MV everyday-reflection and ST risk-evaluation operators need a concrete context and explicit justified judgement; original material remains useful.",
    "somatic_and_germline": "One lineage/transmission competence, with explicit animal-model separation, early versus late timing and conditional participation in fertilisation.",
    "mutation_vs_modification": "One cause distinction using explicit genetic/environment controls; equal phenotype is not identical DNA; genetic and environmental effects can coexist.",
    "protein_function_from_mutation_data": "One sequence/product/function-evidence competence; independently correct substitutions and in-frame deletion; matched amounts and spreads bound function claim to fictional assays.",
    "replication_error_control_and_repair": "One information-conservation mechanism through checking/restoration; correct complement and mismatch locations; mismatch is not automatically fixed mutation and repair is not perfect.",
}
component_rows = []
case_rows = []
for c in components:
    key = c["candidateKey"]
    comp_data = json.dumps(c, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    row = {"candidateKey": key, "canonicalGoalId": c["canonicalGoalId"], "componentSHA256CanonicalJSON": sha(comp_data), "decision": "REVISE" if key == "mutagen_causes_and_protection" else "KEEP", "scientificMaterialDecision": "KEEP_bounded_fictional_model", "semanticAtomicityDecision": "atomic_in_bounded_candidate_scope", "sourceOperatorDecision": "REVISE_MV_everyday_reflection_and_ST_explicit_risk_evaluation" if key == "mutagen_causes_and_protection" else "KEEP_only_identified_primary_components", "reason": reasons[key], "memoryDecisionScope": "Understanding/application with supplied rules; does not justify a new SRS deck or replace current individual M-ledger decisions", "nativeAApproval": False, "nativeMApproval": False, "nativeDApproval": False, "nativePApproval": False, "nativeVApproval": False, "runtimePrerequisiteApproval": False, "wholeSourceApproval": False, "humanApproval": False}
    component_rows.append(row)
    for task in c["tasks"]:
        case_rows.append({"caseId": task.get("caseId", task.get("caseKey")), "component": key, "caseSHA256CanonicalJSON": sha(json.dumps(task, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()), "actualMaterialTaskSolutionReadDE": True, "actualMaterialTaskSolutionReadEN": True, "decision": "KEEP_bounded_material", "positiveEssentialConditionsAssessed": True, "DEENScientificParity": True, "sourceOperatorDebt": "MV everyday-reflection and ST explicit risk-evaluation not completely demonstrated" if key == "mutagen_causes_and_protection" else None, "reasonPointer": "README.md 22 actually read cases; independent-sequence-and-arithmetic.actual.json", "nativePApproval": False, "learnerEvidence": False})
write("component-and-case-decisions.independent-b.json", {"schemaVersion": 1, "createdAtUTC": NOW, "role": "genuinely independent blind scientific/source/operator/P/atomicity/prerequisite B review", "authorFreezeSHA256": AUTHOR_FREEZE, "components": component_rows, "cases": case_rows, "counts": {"componentsKEEP":10,"componentsREVISE":1,"boundedCasesKEEP":22,"nullIDComponents":7,"retainedOperativeDescriptionsKEEP":4,"retainedOriginalPCaseBodiesKEEP":8}, "integrationDecision": "BLOCK current integration/whole-source/current-M7 closure until resolved canonical IDs, scopes, source-specific prerequisites, native bindings, required independent review pair and remaining actual gates exist", "held3417Decision": "BLOCK import as mutation-only whole target; retain complete NI semantic/prerequisite/P/image evidence and actual outstanding mutation duties until independently reviewed replacements", "BYEAOncogenesisDecision": "BLOCK new approval; oncogenes/anti-oncogenes, cell-cycle/apoptosis/tumour and separate EA PCR comparison remain distinct open duties", "SHDecision": "2023 frozen older/outgoing source only; incoming2026 source content not inspected or approved", "STStageDecision": "Actual year10 introduction phase retained; lower-secondary directory name is not a scientific stage decision", "activeM7NetIncrease":0,"newCanonicalIDsAssigned":0,"activeWrites":0,"humanApproval":False,"humanTrial":False,"nativeDRecordsWritten":0,"nativePRecordsWritten":0})

actual = [
    ROOT / "AGENTS.md",
    pathlib.Path("/home/enpasos/.codex/attachments/b77af694-ca1d-42ad-a722-1a0b77a18fe8/goal-objective.md"),
    AUTHOR / "author-source-scope-remediation-v4.final.freeze.json",
    AUTHOR / "actual-reviewed-inputs.author.freeze.json",
    AUTHOR / "README.md",
    AUTHOR / "canonical-preserved.inert-envelope.json",
    AUTHOR / "four-main-components-eight-positive-cases.author-candidate.json",
    AUTHOR / "mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json",
    AUTHOR / "positive-four.native-candidate-records.json",
    AUTHOR / "prerequisite-and-source-integration-plan.author.json",
    AUTHOR / "separate-real-open-source-boundaries.author.json",
    AUTHOR / "eleven-components.A-M-author-rationale.json",
    AUTHOR / "ten-open-obligations.concrete-remediation.author-matrix.json",
    AUTHOR / "mutation-source-components-author/six-open-obligations.source-to-component.author-matrix.json",
    AUTHOR / "mutation-source-components-author/actual-primary-pages-and-clause-hashes.json",
    AUTHOR / "mutation-source-components-author/existing-partners-full-current-prerequisites.author-inventory.json",
    AUTHOR / "thirteen-retained-partial-lanes.inert-payload-index.json",
    AUTHOR / "source-discovery.readonly.actual.json",
    AUTHOR / "standard-code-sun.codon-data.actual.json",
    AUTHOR / "standard-code-sun.author-material.svg",
    AUTHOR / "standard-code-sun.author-render.preview.png",
    AUTHOR / "native-preserved383.book-model.actual.json",
]
actual += sorted((AUTHOR / "source-overlays-inert").glob("*.json"))
v3 = AUTHOR.with_name("biologie-q1-four-current383-source-scope-author-remediation-v3")
actual += [v3 / "prospective-canonical.unchanged.snapshot.json", v3 / "positive-four.native-candidate-records.json", v3 / "prospective-native383.book-model.json"]
for p in sorted((AUTHOR / "source-overlays-inert").glob("*.json")):
    d = read(p)
    actual.append(ROOT / d.get("v3CandidatePath", d.get("v3SourcePath")))
for entry in read(OUT / "primary-inputs.actual.json")["sources"]:
    if "officialURL" not in entry:
        actual.append(ROOT / entry["path"])
actual = list(dict.fromkeys(actual))
inputs = [{"path": str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p), "sha256": sha(p.read_bytes()), "bytes": len(p.read_bytes()), "role": "Actual original authored/native/primary input used; v3 only preservation delta inputs"} for p in actual]
write("actual-reviewed-inputs.independent-b.freeze.json", {"createdAtUTC": NOW, "authorFreezeSHA256": AUTHOR_FREEZE, "substantiveOrDeltaInputs": inputs, "separateAll63And179BindingIntegrityReceipt": "binding-and-preservation.actual.json", "freshPrimaryRetrievalBindings": "primary-inputs.actual.json", "independence": {"siblingAResultsRead":False,"siblingBResultsRead":False,"priorIndependentConclusionsRead":False,"rootScientificSynthesisRead":False,"authorCandidateNotTreatedAsIndependentApproval":True}, "activeWrites":0,"humanApproval":False})

name = "independent-b-v4.final.freeze.json"
own = [{"path": str(p.relative_to(OUT)), "sha256": sha(p.read_bytes()), "bytes": len(p.read_bytes())} for p in sorted(OUT.rglob("*")) if p.is_file() and p.name != name]
write(name, {"schemaVersion":1,"createdAtUTC":NOW,"role":"independent blind B completed bounded review","authorFreezeSHA256":AUTHOR_FREEZE,"files":own,"fileCount":len(own),"decisionsFile":"component-and-case-decisions.independent-b.json","reviewScope":"11 bounded components,22 complete DE/EN cases,4 retained operative descriptions and8 retained original P bodies; actual primary source clauses, atomicity and static prerequisite review","activeM7NetIncrease":0,"wholeSourceClosure":False,"humanApproval":False,"humanTrial":False,"activeWrites":0,"nativeApproval":False})
print(json.dumps({"reviewFreeze":str((OUT/name).relative_to(ROOT)),"reviewFreezeSHA256":sha((OUT/name).read_bytes()),"files":len(own),"actualInputs":len(inputs),"boundedComponentKEEP":10,"componentREVISE":1,"boundedCaseKEEP":22},ensure_ascii=False))
