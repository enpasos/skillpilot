#!/usr/bin/env python3
"""Close an inactive author draft; never install goals or approve evidence."""
import copy
import datetime
import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]

def binding(p):
    data = p.read_bytes()
    return {"path": str(p.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}

def write(name, value):
    p = HERE / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return binding(p)

raw_name = "two-child-four-whole-bilingual-cases-and-P.author-candidate.json"
raw = json.loads((HERE / raw_name).read_text())
current = copy.deepcopy(raw)
changes = []
# Explicit prose replacements only: stable identifiers and scientific numbers stay intact.
replacements = {
    "von450": "von 450", "volume380": "volume 380", "is2.6": "is 2.6",
    "has450": "has 450", "X3.1": "X 3.1", "Y2.8": "Y 2.8", "Z2.6": "Z 2.6",
    "Jahr0": "Jahr 0", "Jahr10": "Jahr 10", "leben1000": "leben 1000",
    "bei2000": "bei 2000", "bei20": "bei 20", "bei100": "bei 100",
    "dann1300": "dann 1300", "und40": "und 40", "year0": "year 0",
    "year10": "year 10", "has1000": "has 1000", "supply2000": "supply 2000",
    "failure20": "failure 20", "and100": "and 100", "then1300": "then 1300",
    "and40": "and 40", "auf1800": "auf 1800", "to1800": "to 1800",
    "von30": "von 30", "auf8": "auf 8", "pro1000": "pro 1000",
    "StadtB": "Stadt B", "bei28": "bei 28", "from30": "from 30",
    "to8": "to 8", "per1000": "per 1000", "has28": "has 28",
    "auf24": "auf 24", "to24": "to 24",
}

def readable(x, path=""):
    if isinstance(x, dict):
        for k, v in x.items():
            if k.endswith(("De", "En")) and isinstance(v, str):
                new = v
                for old, replacement in replacements.items():
                    new = new.replace(old, replacement)
                new = re.sub(r",(?=\d)", ", ", new) if k.endswith("En") else re.sub(r",(?=\d{3,}\b)", ", ", new)
                if new != v:
                    changes.append({"path": path + "/" + k, "kind": "word-boundary-only", "before": v, "after": new})
                x[k] = new
            elif isinstance(v, (dict, list)):
                readable(v, path + "/" + k)
    elif isinstance(x, list):
        for i, v in enumerate(x):
            readable(v, path + "/" + str(i))

readable(current)
for i, entry in enumerate(current["entries"]):
    old = entry["wholeProfile"]["archetype"]
    entry["wholeProfile"]["archetype"] = "data"
    changes.append({"path": f"/entries/{i}/wholeProfile/archetype", "kind": "regular-schema-archetype", "before": old, "after": "data", "reason": "Both proposed competencies interpret complete evidence sets. explanation is not a supported v2 archetype."})

# A wooded upright-walking find alone cannot refute where walking FIRST arose.
# Test a contemporaneous exclusivity claim instead; do not infer the first origin.
case = current["entries"][0]["newAuthoredWholeCases"][1]
for key, old, new in [
    ("materialDe", "Aufrechter Gang konnte erstmals ausschließlich in baumloser Savanne entstehen.", "Aufrechter Gang kam ausschließlich in baumloser Savanne vor."),
    ("materialEn", "Upright walking could first arise exclusively in treeless savannah.", "Upright walking occurred exclusively in treeless savannah."),
]:
    before = case[key]
    assert old in before
    case[key] = before.replace(old, new)
    changes.append({"path": "/entries/0/newAuthoredWholeCases/1/" + key, "kind": "bounded-author-scientific-hypothesis-clarification", "before": before, "after": case[key]})
case["workedResponseDe"] += " Über den Ort der erstmaligen Entstehung des aufrechten Gangs entscheidet diese spätere Fundzuordnung allein nicht."
case["workedResponseEn"] += " This later find association alone does not determine where upright walking first arose."
changes.append({"path": "/entries/0/newAuthoredWholeCases/1/workedResponseDeEn", "kind": "explicit-origin-inference-limit", "reason": "Distinguish an observed habitat association from an evolutionary origin claim; independent science review remains pending."})

for entry in current["entries"]:
    for case, brief in zip(entry["newAuthoredWholeCases"], entry["wholeProfile"]["applicationCaseBriefs"]):
        assert case["caseId"] == brief["id"]
        for lang, label, transfer in [("De", "Auftrag", "Frische Variation"), ("En", "Task", "Fresh variation")]:
            brief["taskDemand" + lang] = case["material" + lang] + "\n\n" + label + ": " + case["task" + lang] + "\n\n" + transfer + ": " + case["freshTransferTask" + lang]
            brief["expectedPerformance" + lang] = case["workedResponse" + lang] + "\n\nTransfer: " + case["workedFreshTransfer" + lang]

current["role"] = "Inactive current readable author candidate: two whole proposed profiles/four constructed bilingual cases; every independent gate pending"
current["createdAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
current["historicalDraftBinding"] = binding(HERE / raw_name)
current["candidateStatus"] = "ai_candidate/needs_human_review/E1/G1"
current["actualExperimentsOrHumanPerformance"] = False
current["independentApprovals"] = []
current["activeWrites"] = []
write("two-child-four-whole-bilingual-cases-and-P.readable-v2.author-candidate.json", current)

spec = json.loads((HERE / "two-normal-positive-profile-specs.author-candidate.json").read_text())
for e, s in zip(current["entries"], spec["goals"]):
    assert e["goalId"] == s["goalId"]
    s["profile"] = e["wholeProfile"]
spec["reviewedAt"] = current["createdAt"]
write("two-normal-positive-profile-specs.readable-v2.author-candidate.json", spec)
write("bounded-readable-v2-author-deltas.actual.json", {
    "schemaVersion": 1, "role": "Explicit unapproved author corrections; old draft bytes preserved",
    "initialDraft": binding(HERE / raw_name), "currentCandidate": binding(HERE / "two-child-four-whole-bilingual-cases-and-P.readable-v2.author-candidate.json"),
    "changes": changes, "wholeCandidateGoalsUnchanged": all(a["wholeCandidateGoal"] == b["wholeCandidateGoal"] for a, b in zip(raw["entries"], current["entries"])),
    "scientificAuthorChangesRequireIndependentReview": True, "noHistoricalReviewSupersession": True,
    "sourceDutyOrPartnerEdits": [], "activeWrites": [], "strictGain": 0,
})
print(json.dumps({"candidateGoals": [e["goalId"] for e in current["entries"]], "cases": 4, "deltaFields": len(changes), "activeWrites": [], "strictGain": 0}))
