"""Summarize Reviewer A's original corpus re-executed against the second candidate."""
import hashlib
import json
import math
import statistics
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

tag = sys.argv[1] if len(sys.argv) > 1 else "fresh48"
here = Path(__file__).resolve().parent
round2 = here.parent.parent
original = round2.parent / "reviewer-a"
raw = round2 / "raw" / "native-a"
log = raw / f"{tag}.log"
xml, = raw.glob(f"{tag}-TEST-*.xml")
run = ET.parse(xml).getroot()
log_text = log.read_text()
source = original / "bench.method.java"
prior_evidence = json.loads((original / "evidence.actual.json").read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    (raw / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")

def read_output(marker):
    return [json.loads(line[len(marker):]) for line in (run.findtext("system-out") or "").splitlines() if line.startswith(marker)]

def quartiles(values):
    q1, _, q3 = statistics.quantiles(values, n=4, method="inclusive")
    return dict(n=len(values), median=round(statistics.median(values), 3), q1=round(q1, 3), q3=round(q3, 3))

counts = {name: int(run.get(name)) for name in ("tests", "failures", "errors", "skipped")}
assert counts == {"tests": 6, "failures": 0, "errors": 0, "skipped": 0}, counts
methods = [
    "independentReadCost(boolean)",
    "expiredDirectAssessmentOrigin(boolean)",
    "goalInProgressSurvivesARegroupingOutOfTheFocusedSection(boolean)",
]
passes = [line for line in log_text.splitlines() if line.startswith("GoalInProgressProbe > ") and line.endswith(" PASSED")]
assert len(passes) == 6 and all(sum(f"> {method} >" in line for line in passes) == 2 for method in methods), passes
assert prior_evidence["files"]["reviewer-a/bench.method.java"] == digest(source)
scope = "composition:de-he-gym-sekii-physics-gk:structure:physics-e1-motion"
goals = {"ordinary": "262f807a-30d0-503e-986f-856cbd048e8e", "moved-traffic": "4a2bf015-052b-4af0-aed7-324259fa1a8a", "moved-reference": "68c90ba6-c438-463c-9a53-cf61062d416a", "absent": None}
rows = read_output("REVIEW_A_BENCH ")
origins = read_output("REVIEW_A_ORIGIN ")
prior_origin = [v for v in json.loads((original / "expiry.actual.json").read_text()) if v["variant"] == "candidate"]
assert sorted(origins, key=lambda v: v["global"]) == sorted(prior_origin, key=lambda v: v["global"])
assert {x["global"] for x in origins} == {True, False} and len(origins) == 2
prior_measure = json.loads((original / "measure.actual.json").read_text())
prior = {(x["variant"], x["repeat"], x["pilot"], x["scenario"], x["reader"]):x for x in prior_measure["samples"]}
keys = {(r["pilot"], r["scenario"], r["reader"]) for r in rows}
assert len(rows) == 16 and keys == {(p,s,r) for p in (False, True) for s in goals for r in ("state","mcp")}
comparison = []
for x in rows:
    key = x["pilot"], x["scenario"], x["reader"]
    expected = goals[x["scenario"]]
    assert x["activeGoal"] == x["storedActive"] == expected
    assert x["stateMachine"]["state"] == ("TEACHING" if expected else "FRONTIER")
    assert x["storedFocus"] == [scope]
    assert x["variant"] == "candidate" and x["repeat"] == tag
    assert len(x["ms"]) >= 24 and all(math.isfinite(v) and v > 0 for v in x["ms"])
    observed_focus = [g["id"] for g in x["focus"]] if x["focus"] is not None else None
    previous_visible = prior[("candidate", "3", *key)]["focus"]
    previous_focus = [g["id"] for g in previous_visible] if previous_visible is not None else None
    assert observed_focus == ([scope] if x["reader"] == "state" else None)
    stats = quartiles(x["ms"])
    previous = {f"{variant}_{repeat}": quartiles(prior[(variant, repeat, *key)]["ms"])["median"]
                for variant in ("baseline", "candidate") for repeat in ("2", "3")}
    comparison.append({
        "pilot":key[0], "scenario":key[1], "reader":key[2],
        "activeGoal":expected, "stateMachine":x["stateMachine"]["state"],
        "storedFocus":x["storedFocus"], "displayedPlannedFocus":observed_focus,
        "round1Run3DisplayedPlannedFocus":previous_focus, "freshMilliseconds":stats,
        "historicalMedianMilliseconds":previous,
        "deltaFromPriorCandidateMedianMilliseconds":{run_id: round(stats["median"] - previous[f"candidate_{run_id}"],3) for run_id in ("2","3")},
    })
write(f"{tag}-summary.json", {
    "candidate":"fc7cab9ca11e795a982081af293eff3e357f5551", "tree":"b4c5e227414b858021e27c00b65b507e70bb173c",
    "priorCandidate":"1431a79dbea806dfed00a268b0b2bec4e58f7faa", "priorBaselineService":"53fd44c88b",
    "originalBenchMethodSHA256":prior_evidence["files"]["reviewer-a/bench.method.java"], "reusedBenchMethodSHA256":digest(source),
    "originalGradleInitSHA256":digest(original/"bench-init.gradle"),
    "sourceHashes":{p.name:digest(p) for p in (xml, log, original/"measure.actual.json", original/"expiry.actual.json")},
    "cases":counts, "originalProbeCases":4, "candidateRegressionCases":2, "gradleCaseEvents":passes,
    "cells":len(rows), "timedReads":sum(len(x["ms"]) for x in rows), "warmupReads":16 * len(rows),
    "expiredDirectAssessment":origins, "timings":comparison,
    "measurementLimit":"Single fresh candidate run with historical H2 timings on a shared developer machine. Historical run 2 has 48 values per cell, run 3 has 24. The comparison is descriptive. There is no paired new baseline or host latency measurement.",
})
print(json.dumps({"tests":counts, "cells":len(rows), "measured":sum(len(x["ms"]) for x in rows), "warmups":16*len(rows), "expired":len(origins)}, ensure_ascii=False))
for x in comparison:
    print(x["pilot"], x["scenario"], x["reader"], x["freshMilliseconds"]["median"], x["deltaFromPriorCandidateMedianMilliseconds"])
