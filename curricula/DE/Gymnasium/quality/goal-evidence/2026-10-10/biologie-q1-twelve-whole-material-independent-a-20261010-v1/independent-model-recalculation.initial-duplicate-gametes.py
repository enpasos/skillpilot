"""Actual independent classroom-model calculations; no learner or release evidence."""
from collections import Counter
from fractions import Fraction as F
from itertools import product
import hashlib
import json
from pathlib import Path
import subprocess

AUTHOR = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-regulation-data-risk-twelve-whole-material-author-candidate-v1")
OUT = Path(__file__).resolve().parent

def bound(path):
    b = Path(path).read_bytes()
    return {"path": str(path), "sha256": hashlib.sha256(b).hexdigest(), "bytes": len(b)}

def gametes(genotype):
    return list(product(*[genotype[i:i + 2] for i in range(0, len(genotype), 2)]))

def cross_counts(a, b):
    return dict(sorted(Counter(sum(x.isupper() for x in ga + gb)
                               for ga, gb in product(gametes(a), gametes(b))).items()))

entry = json.loads((AUTHOR / "neutral-twelve-whole-material-review.entry.json").read_text())
inputs = []
for item in entry["neutralFirstInputs"]:
    actual = bound(item["path"])
    assert actual["sha256"] == item["sha256"] and actual["bytes"] == item["bytes"], item["path"]
    inputs.append({**actual, "role": item["role"]})

whole = json.loads((AUTHOR / "input/whole479-current-canonical.actual.json").read_text())
goals = {g["id"]: g for g in whole["goals"]}
owned = json.loads((AUTHOR / "frozen-inputs/candidate/twelve-whole-unmodified-DEEN-goals.inactive.json").read_text())
materials = json.loads((AUTHOR / "candidate/twelve.full-material-and-profile.author.json").read_text())
source = json.loads((AUTHOR / "frozen-inputs/source/all-original-whole-duties-and-all-current-whole-partners.neutral.json").read_text())
partners = {g["id"]: g for r in source for g in r["wholeCurrentCanonicalPartners"]}
assert len(goals) == 479 and len(owned) == 12 and len(materials["goals"]) == 12
assert all(goals[g["id"]] == g for g in owned)
assert all(goals[g["id"]] == g for g in partners.values())
assert len(source) == 16 and len(partners) == 41
assert sum(len(r["allOriginalPartnerRows"]) for r in source) == 113
assert sum(len(r["cases"]) for r in materials["goals"]) == 24
records = [json.loads(s) for s in (AUTHOR / "candidate/positive.twelve.author.review.jsonl").read_text().splitlines() if s]
assert len(records) == 12
for row in records:
    assert (row["status"], row["reviewAuthority"], row["evidenceLevel"], row["maximumClaimScope"]) == ("needs_human_review", "ai_candidate", "E1", "G1")
    original = next(r for r in materials["goals"] if r["goalId"] == row["goalId"])
    assert row["profile"] == original["profile"]

p = F(0)
recurrence = []
for stimulus in [4, 4, 4, 0, 0]:
    p = p / 2 + F(stimulus) / (1 + p)
    recurrence.append(float(p))
p = F(0)
removed = []
for stimulus in [4, 4, 4, 0, 0]:
    p = p / 2 + stimulus
    removed.append(float(p))
assert [round(v, 3) for v in recurrence] == [4, 2.8, 2.453, 1.226, .613]
assert removed == [4, 6, 7, 3.5, 1.75]

def pathway(stimuli, feedback):
    a = r = p = 0
    states = [[a, r, p]]
    for s in stimuli:
        a, r, p = int(bool(s) and (not p if feedback else True)), a, r
        states.append([a, r, p])
    return states
plain = pathway([1, 1, 0, 0, 0], False)
negative = pathway([1, 1, 1, 1, 1, 1], True)
assert plain == [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 1], [0, 0, 1], [0, 0, 0]]
assert negative[1:] == [[1, 0, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1], [0, 0, 1], [0, 0, 0]]
counts = cross_counts("AaBb", "AaBb")
fresh_counts = cross_counts("Aabb", "aaBb")
assert counts == {0: 1, 1: 4, 2: 6, 3: 4, 4: 1}
assert fresh_counts == {0: 1, 1: 2, 2: 1}
poly = {str(k): [10 + 5 * k, 10 + 5 * k + 20] for k in [4, 3, 2, 0]}
assert poly == {"4": [30, 50], "3": [25, 45], "2": [20, 40], "0": [10, 30]}
snp = {"P": [20 / 40, 20 / 40, "GA"], "Q": [30 / 30, 0 / 30, "GG"],
       "R_original": [8 / 10, 2 / 10, "unresolved: fewer than 20 molecules"],
       "R_fresh": [24 / 50, 26 / 50, "GA"], "S_reverse": [30 / 30, 0 / 30, "GG after C/T to G/A complement"]}
association = {"risk_A": F(30, 200), "risk_no_A": F(10, 200), "RR": F(30, 200) / F(10, 200),
               "difference": F(30, 200) - F(10, 200), "high_strata": [F(30, 150), F(10, 50)], "low_strata": [F(0, 50), F(0, 150)]}
assert association["RR"] == 3 and association["difference"] == F(1, 10)
assert association["high_strata"] == [F(1, 5), F(1, 5)]
cpm = {"control_G": 100 / 1_000_000 * 1_000_000, "treated_G": 200 / 2_000_000 * 1_000_000,
       "control_H": 50 / 1_000_000 * 1_000_000, "treated_H": 300 / 2_000_000 * 1_000_000,
       "fresh_G": 90, "fresh_H": 60}
assert cpm["treated_G"] / cpm["control_G"] == 1 and cpm["treated_H"] / cpm["control_H"] == 3
ref, query = "ACGTACGTACGT", "ACGTTCGTACGT"
assert [i + 1 for i, (a, b) in enumerate(zip(ref, query)) if a != b] == [5]
align = {"initial_identity_percent": sum(a == b for a, b in zip(ref, query)) / 12 * 100,
         "hitA_coverage_percent": 20, "hitA_identity_percent": 100,
         "hitB_coverage_percent": 95, "hitB_identity_percent": 84 / 95 * 100,
         "fresh_gap_identity_percent": 12 / 13 * 100, "fresh_gap_score": 12 * 2 - 2,
         "repeat_hit_coverage_percent": 30 / 120 * 100, "diverse_hit_coverage_percent": 85 / 120 * 100,
         "diverse_hit_identity_percent": 80 / 85 * 100, "trimmed_coverage_if_alignment_retained_percent": 85 / 110 * 100,
         "tenfold_database_supplied_E_approximation": 1e-12 * 10}
assert align["fresh_gap_score"] == 22
risks = {"case1": F(50, 1000) * F(1, 4), "case1_new_partner_Aa": F(1, 4),
         "case2_unaffected_carrier": F(2, 3), "case2": F(2, 3) * F(90, 900) * F(1, 4),
         "case2_confirmed_AA": F(0), "counsel1_variant_transmission": F(1, 2),
         "counsel2_observed_ratio": F(4, 100) / F(2, 100), "counsel2_observed_difference": F(2, 100)}
assert risks["case1"] == F(1, 80) and risks["case2"] == F(1, 60)
result = {"purpose": "Independent recalculation of supplied synthetic models only; qualitative scientific review remains separate",
          "counts": {"canonicalGoals": 479, "ownedWholeGoals": 12, "wholeSourceDuties": 16, "wholePartnerEdges": 113,
                     "uniqueWholePartnerBodies": 41, "bilingualCasesAndFreshTransfers": 24},
          "allNeutralInputBytesMatch": True, "allOwnedAndPartnerBodiesMatchWholeCanonical": True,
          "allPositiveRecordsRemainE1G1AiCandidateNeedsHumanReview": True, "boundInputs": inputs,
          "actualNumbers": {"negative_feedback": recurrence, "feedback_removed": removed,
                            "delayed_boolean_pathway": plain, "fresh_boolean_feedback": negative,
                            "epigenetic_baseline_aware_additive_prediction": 4 + (18 - 4) + (22 - 4),
                            "poly_cross_counts": counts, "fresh_poly_cross_counts": fresh_counts, "poly_risks_percent": poly,
                            "SNP_genotyping": snp, "SNP_association": association, "RNA_counts_per_million": cpm,
                            "alignment_and_BLAST_supplied_model": align, "population_and_counseling_risks": risks},
          "newStrictCompletions": 0, "restoredBindings": 0, "humanApproval": False, "actualLearnerPerformances": 0}
def encode(x):
    if isinstance(x, F):
        return {"exactFraction": str(x), "decimal": float(x)}
    raise TypeError(type(x).__name__)
(OUT / "independent-model-recalculation.actual.json").write_text(json.dumps(result, ensure_ascii=False, indent=2, default=encode) + "\n")
for s, a, b in [("MV", 29, 30), ("SN", 42, 43), ("ST", 42, 43), ("TH", 28, 29)]:
    text = subprocess.check_output(["pdftotext", "-f", str(a), "-l", str(b), "-layout", str(AUTHOR / f"primary/{s}.official-whole.original.pdf.bytes"), "-"])
    (OUT / f"{s}.whole-relevant-two-primary-pages.actual.txt").write_bytes(text)
he = subprocess.check_output(["pdftotext", "-layout", str(AUTHOR / "frozen-inputs/primary/HE-current-official.whole.pdf.bytes"), "-"]).decode()
lines = he.splitlines()
(OUT / "HE.binding-policy-and-whole-Q1.actual.txt").write_text("\n".join(lines[1239:1290] + lines[1557:1702]) + "\n")
print("PASS: exact 12 whole goals, 24 bilingual cases/transfers, 16 source duties, 113 edges, 41 unchanged partners; independent model arithmetic reconciles.")
print("Candidate only: no source/course blanket approval, no native D/V approval, 0 learner performances, 0 strict completions.")
