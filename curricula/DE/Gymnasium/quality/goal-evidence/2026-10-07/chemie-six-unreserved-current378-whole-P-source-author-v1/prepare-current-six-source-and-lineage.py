#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind unchanged current inputs and every original source partner; never close duties."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
IDS = ["416dfd33-8b43-5c49-903c-9847b95e4208", "466bd2e9-39a5-5221-b620-945934adce00",
       "62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2", "6d3a2bad-8c67-5964-a720-375f138adaba",
       "8edee6b6-9ead-515e-93f5-feada64522b2", "cd9ec99b-b694-5673-863c-55528e31250a"]
REG = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
LEDGER = "curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json"
CENTRAL = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-twelve-reviewed-active-integration-root-v1/active-after-twelve-central.actual.json"
ATLAS = "app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json"
BY = "curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.m7-energy13-current-20261005-v1.review.json"
INPUTS = {}

def sha(b): return hashlib.sha256(b).hexdigest()
def stable(v): return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
def load(path):
    p = ROOT / path
    b = p.read_bytes()
    INPUTS[str(path)] = dict(path=str(path), sha256=sha(b), bytes=len(b))
    return json.loads(b)
def write(name, v):
    p = HERE / name; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + "\n")

reg = load(REG); chem = next(x for x in reg["subjects"] if x["subject"] == "chemie")
canon = load(chem["landscapePath"]); by_id = {g["id"]: g for g in canon["goals"]}
central = next(x for x in load(CENTRAL)["subjects"] if x["subject"] == "chemie")
ledger = load(LEDGER)
reserved = set()
reservation_paths = ledger.get("current7activeBatchConfigPaths", ledger["activeBatchConfigPaths"])
for path in reservation_paths:
    cfg = load(path)
    reserved.update(cfg.get("goalIds", cfg.get("scope", {}).get("goalIds", [])))
    reserved.update(cfg.get("scope", {}).get("leafGoalIds", []))
assert not (reserved & set(IDS)), f"Reserved selected goals: {reserved & set(IDS)}"
assert len(canon["goals"]) == 480 and central["denominator"] == 378
assert not (set(IDS) & set(central["strictCompleteGoalIds"]))
write("current-six-whole-goals-and-central-scope.raw.json", dict(
    schemaVersion=1, role="unchanged whole current input, not a review decision", activeWrites=False,
    landscapeId=canon["landscapeId"], selectedWholeGoals=[by_id[gid] for gid in IDS],
    centralState=dict(denominator=central["denominator"], strictComplete=central["strictComplete"], gates=central["gates"]),
    selectedGoalIds=IDS, selectedAlreadyStrictGoalIds=[], selectedReservedGoalIds=[],
    reservationBindingPaths=reservation_paths))

parents = {gid: [] for gid in IDS}
for goal in canon["goals"]:
    for gid in IDS:
        if gid in goal.get("contains", []): parents[gid].append(goal["id"])
for gid in IDS:
    split = by_id[gid].get("extendedData", {}).get("provenance", {}).get("splitFromCanonicalGoalId")
    if split and split not in parents[gid]: parents[gid].append(split)

atlas = load(ATLAS)
source_rows = {gid: [] for gid in IDS}
ancestor_rows = {gid: [] for gid in IDS}
all_mapping_paths = atlas["mappingPaths"]
# Bind the older BY reference as retained lineage; it is not an additional current duty.
load(BY)
for mp in dict.fromkeys(all_mapping_paths):
    mapping = load(mp)
    ep = mapping.get("sourceExtractionPath")
    if not ep: continue
    extraction = load(ep)
    source_by_id = {x["id"]: x for x in extraction.get("sourceGoals", [])}
    for index, decision in enumerate(mapping.get("decisions", [])):
        targets = decision.get("canonicalGoalIds", [])
        for gid in IDS:
            direct = gid in targets
            via = [p for p in parents[gid] if p in targets]
            if not direct and not via: continue
            source = source_by_id.get(decision.get("sourceGoalId"))
            entry = dict(mappingPath=mp, decisionIndex=index,
                         decisionJsonSha256=sha(stable(decision).encode()),
                         sourceExtractionPath=ep, sourceGoalId=decision.get("sourceGoalId"),
                         sourceGoalPresent=source is not None,
                         wholeSourceGoalJsonSha256=sha(stable(source).encode()) if source else None,
                         jurisdiction=extraction.get("jurisdiction"), stage=extraction.get("stage"),
                         sourceSpan=source.get("sourceSpan") if source else decision.get("sourceSpan"),
                         topicCode=source.get("topicCode") if source else decision.get("topicCode"),
                         originalCompletePartnerGoalIds=targets,
                         originalWholePartnerDutyPreserved=True,
                         directCurrentGoalBinding=direct, ancestorBindingGoalIds=via,
                         wholeSourceClosure="HOLD_unreviewed_current_whole_operator_and_partner_coverage")
            (source_rows if direct else ancestor_rows)[gid].append(entry)

# Targeted prior D material only; existing reviews remain unchanged and are not renamed into approval.
historical = []
base = ROOT / "curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-09-30"
for p in sorted(base.rglob("*.records.jsonl")):
    selected = []
    for line, raw in enumerate(p.read_text().splitlines(), 1):
        row = json.loads(raw)
        if row.get("goalId") in IDS:
            selected.append(dict(goalId=row["goalId"], line=line, decision=row.get("decision"),
                                 recordJsonSha256=sha(stable(row).encode()),
                                 recordId=row.get("recordId"), runId=row.get("runId"),
                                 wholePriorRecord=row))
    if selected:
        path = p.relative_to(ROOT).as_posix()
        b = p.read_bytes(); INPUTS[path] = dict(path=path, sha256=sha(b), bytes=len(b))
        historical.extend(dict(path=path, **row) for row in selected)
write("targeted-prior-description-records.unchanged-lineage.json", dict(
    schemaVersion=1, role="exact existing selected D records and unresolved dissent, no new approval",
    previousSelectedRecords=historical,
    mandatoryRestriction="No historical REVISE/SPLIT/BLOCK is resolved by copying a fingerprint or authoring two cases."))

readiness = {
 IDS[0]: dict(status="HOLD_broad_description_and_source_whole_coverage",
              intendedWholeBoundedSource="BY C8.1.2 guided basic methods/documents; analysis/display stays with original other partner 49b13b33",
              reason="Unchanged D A split_review and B block: unspecified basic laboratory methods cannot be mastered by two selected routines. Actual execution is required; simulated text is not performed evidence.",
              completedAuthorWork="Two whole bilingual supervised water-measurement/filtration case materials; no broad-goal closure.",
              nationalWholeSourceDutiesClosed=0),
 IDS[1]: dict(status="HOLD_direct_source_operator_mismatch",
              reason="14 current direct RP/MV whole rows include UV/VIS, Beer-Lambert, AAS/AES, 13C NMR, instrument/matter interaction and linked applications beyond IR/1H-NMR. Original complete partner lists remain.",
              completedAuthorWork="Two whole bilingual simple IR/1H-NMR assignment cases with numerical data, OH-exchange caveat and changed-spectrum transfer.",
              nationalWholeSourceDutiesClosed=0),
 IDS[2]: dict(status="bounded_D_P_author_candidate_independent_and_whole_partner_review_pending",
              intendedWholeBoundedSource="BW 3.2.1.1(5) one selected substance from industrial extraction to use; iron and salt are examples, not all examples required",
              reason="The direct BW whole operator is concretely met by the authored case design, pending independent judgment. Other BB/BE/HB whole operators require preserved companions; no worldwide closure inferred.",
              completedAuthorWork="Two full bilingual extraction-processing-use cases, conceptual iron reduction/steel and physical salt separation, with changed-feedstock/purity transfer.",
              locatorFinding="Existing extraction says printed S.13. Actual current local BP2016_V2 PDF places 3.2.1.1(5) on physical page16 / printed14; author locator proposal only, old extraction unchanged.",
              nationalWholeSourceDutiesClosed=0),
 IDS[3]: dict(status="HOLD_description_scope_and_primary_source",
              reason="Historical B requests reaction context. The sole current direct HE Q2.1 carbohydrate/enol/acetal operator has a different scope and original partner 8761cfd2; it is not a complete Q1 aldehyde/ketone reactivity comparison proof.",
              completedAuthorWork="Two limited nucleophilic-addition comparisons reusing historical D scientific core, with steric/electronic explanations and refusal of universal ranking.",
              nationalWholeSourceDutiesClosed=0),
 IDS[4]: dict(status="HOLD_description_operator_and_normative_source",
              reason="No direct atlas Source-Extraction decision for current goal and no Grignard term found in current official HE/BY source extraction. Historical B-revise interpretation/practical-use operator mismatch remains open.",
              completedAuthorWork="Two complete theoretical bilingual organomagnesium addition/workup cases, carbon conservation and primary/secondary/tertiary variations; no practical synthesis evidence.",
              nationalWholeSourceDutiesClosed=0),
 IDS[5]: dict(status="bounded_D_P_author_candidate_national_source_review_pending",
              intendedWholeBoundedSource="BY C10 non-NTG health/influence/dependence source64973c76 mapped to original parentdd843; currentcd9 child owns the matching risk facet",
              reason="Current official BY page matches whole health operator. Parent bindings in other jurisdictions remain original whole duties; no automatic all16-state equivalence.",
              completedAuthorWork="Two fictional whole health/acute-risk/dependence/everyday-decision cases, without diagnosis, private data, blame or safe-quantity claims.",
              nationalWholeSourceDutiesClosed=0),
}
write("six-goal-original-source-duties-and-author-readiness.json", dict(
    schemaVersion=1, createdAtUTC=datetime.now(timezone.utc).isoformat(),
    role="author current original source-duty reconstruction; no independent source clearance", activeWrites=False,
    sourceWholeCoverageClaimed=False, sourceThirdPartyWholeTextsCopied=False,
    entries=[dict(goalId=gid, title=by_id[gid]["title"], originalCurrentProvenance=by_id[gid].get("extendedData", {}).get("provenance"),
                  directSourceDutyCount=len(source_rows[gid]), ancestorSourceDutyCount=len(ancestor_rows[gid]),
                  currentDirectWholeDuties=source_rows[gid], originalAncestorWholeDuties=ancestor_rows[gid],
                  wholeCurrentParentGoals=[by_id[p] for p in parents[gid] if p in by_id], **readiness[gid]) for gid in IDS]))

# Actual PDF read, retained in existing repository only; no new third-party text copy.
pdf = "curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf"
b = (ROOT / pdf).read_bytes(); INPUTS[pdf] = dict(path=pdf, sha256=sha(b), bytes=len(b))
text = subprocess.check_output(["pdftotext", "-f", "16", "-l", "16", "-layout", str(ROOT/pdf), "-"], text=True)
assert "industriellen Gewinnung" in text and "bis zur Verwendung" in text
assert "14" in text[-180:]
write("actual-primary-reading-locators-and-boundaries.json", dict(
    schemaVersion=1, createdAtUTC=datetime.now(timezone.utc).isoformat(), role="actual author primary reading, no independent approval",
    sourceBodyCopiesCommitted=False,
    primaryCurriculumReadings=[
      dict(path=pdf, fileSha256=sha(b), physicalPage=16, printedPage=14, sourceSpan="3.2.1.1(5)",
           sourceGoalId="bw-chem-seki-3-2-1-1-b05-a01-cf1b3dcc", actualPageTextSha256=sha(text.encode()),
           officialUrl="https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf",
           boundedOriginalOperatorQuote="an einem ausgewählten Stoff den Weg von der industriellen Gewinnung aus Rohstoffen bis zur Verwendung darstellen (zum Beispiel Kochsalz, Eisen, Kupfer, Benzin)",
           quoteWordCount=22,
           interpretation="Whole operator: describe a selected material from industrial extraction through use; illustrative materials, not a mandatory list of all examples."),
      dict(officialUrl="https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie", sourceSpan="C8.1.2", sourceGoalId="64050036-5de4-5064-a598-68e50b5dd91b",
           reading="Current official HTML read through web tool; guided basic working techniques, ordered documentation, further analysis/display in whole original row.", originalPartners=["266a2b2a-9ee2-52f6-ae09-59343da9a60b", "49b13b33-34b7-5e4e-861c-b21082cb9922"], closure="HOLD broad unchanged lab goal; companion whole inquiry remains untouched"),
      dict(officialUrl="https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch", sourceSpan="C10-HG_SG_MUG_WWG_SWG.5.6", sourceGoalId="64973c76-d058-5e82-8d8d-239e473b4abc",
           reading="Current official HTML read through web tool; physical harm from alcoholic drinks, dangers under influence and causes of dependence.", originalPartners=["dd843c85-bf60-58c3-861b-fb531ba69b17"], closure="Bounded author child-facet interpretation pending independent review; no all-jurisdiction clearance")],
    scientificReferenceReadings=[
      dict(url="https://www.who.int/news-room/fact-sheets/detail/alcohol", role="Brief factual cross-check of ethanol risks/context; own fictional tasks, not copied source material"),
      dict(url="https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/understanding-alcohol-use-disorder", role="Multifactorial dependence and diagnostic limits; no clinical diagnosis"),
      dict(url="https://openstax.org/books/organic-chemistry/pages/19-4-nucleophilic-addition-reactions-of-aldehydes-and-ketones", role="Factual cross-check of carbonyl addition and steric/electronic comparison; no source exercise/image copied"),
      dict(url="https://openstax.org/books/organic-chemistry/pages/19-7-nucleophilic-addition-of-hydride-and-grignard-reagents-alcohol-formation", role="Factual cross-check of organomagnesium addition followed by workup; own compounds/tasks"),
      dict(url="https://openstax.org/books/organic-chemistry/pages/10-6-reactions-of-alkyl-halides-grignard-reagents", role="Factual cross-check of C-Mg polarity and water sensitivity; no procedure copied"),
      dict(url="https://openstax.org/books/organic-chemistry/pages/21-10-spectroscopy-of-carboxylic-acid-derivatives", role="Factual signal-range check; own synthetic ester-isomer task"),
      dict(url="https://openstax.org/books/organic-chemistry/pages/17-11-spectroscopy-of-alcohols-and-phenols", role="Factual OH-exchange caveat; own synthetic ethanol/ether case")],
    licensingBoundary="Own fictional material CC-BY-4.0; third-party reference pages retain their terms. No source exercises, images or substantial wording copied or relicensed."))

write("declared-current-input-bindings.actual.json", dict(
    schemaVersion=1, createdAtUTC=datetime.now(timezone.utc).isoformat(), inputBindings=list(INPUTS.values()),
    currentWholeGoals=480, currentCurricularAtomic=378, selectedGoalIds=IDS,
    strictCompletionsAdded=0, restoredActiveBindings=0, activeWrites=False,
    deferredScientificDecisions=readiness))
print(json.dumps({"selected":6, "directDuties":{g:len(source_rows[g]) for g in IDS},
                  "ancestorDuties":{g:len(ancestor_rows[g]) for g in IDS}, "inputBindings":len(INPUTS),
                  "previousSelectedDRecords":len(historical), "sourceDutiesClosed":0}))
