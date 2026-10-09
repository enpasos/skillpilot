"""Display actual bound inputs for a human-readable independent machine review.

Pointer verification and duplicate detection are technical checks only.
They do not produce a scientific verdict or an approval.
"""
import hashlib
import json
import sys
from pathlib import Path

AUTHOR = Path(__file__).parent.parent / "chemie-b008-current-nineteen-whole-positive-author-v1"
cache = {}


def load(path):
    key = str(path)
    if key not in cache:
        cache[key] = json.loads(Path(path).read_text())
    return cache[key]


def actual(reference):
    binding = reference["input"]
    raw = Path(binding["path"]).read_bytes()
    assert len(raw) == binding["bytes"]
    assert hashlib.sha256(raw).hexdigest() == binding["sha256"].removeprefix("sha256:")
    value = load(binding["path"])
    for segment in reference["jsonPointer"].split("/")[1:]:
        segment = segment.replace("~1", "/").replace("~0", "~")
        value = value[int(segment)] if isinstance(value, list) else value[segment]
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    assert hashlib.sha256(encoded).hexdigest() == reference["valueSha256"].removeprefix("sha256:")
    return value


facets = load(AUTHOR / "nineteen-whole-facet-case-source-context.author-receipt.json")["entries"]
profiles = load(AUTHOR / "nineteen.normal-positive-candidate-set.author-candidate.json")["goals"]
transfers = load(AUTHOR / "thirty-eight-whole-case-worked-transfer.supplement.author-candidate.json")["entries"]
start, stop = map(int, sys.argv[1:3])
for index in range(start, stop):
    facet, candidate = facets[index], profiles[index]
    assert facet["goalId"] == candidate["goalId"]
    print("WHOLE CANDIDATE", index, facet["candidateKey"])
    print("ACTUAL WHOLE GOAL", json.dumps(actual(facet["wholeGoal"]), ensure_ascii=False))
    profile = candidate["profile"]
    print("WHOLE PROFILE", json.dumps({k: v for k, v in profile.items() if k != "applicationCaseBriefs"}, ensure_ascii=False))
    print("MANDATORY SOURCE/CONTEXT", json.dumps({k: v for k, v in facet.items() if k not in ["wholeGoal", "wholeHistoricalProfile", "wholeHistoricalCases"]}, ensure_ascii=False))
    for transfer in transfers:
        if transfer["goalId"] != facet["goalId"]:
            continue
        case = actual(transfer["wholeOriginalCase"])
        brief = next(x for x in profile["applicationCaseBriefs"] if x["id"] == transfer["caseKey"])
        for suffix, language, task_connector, answer_connector in [
            ("De", "de", "\nFrische Variation: ", "\nFrischer Transfer: "),
            ("En", "en", "\nFresh variation: ", "\nFresh transfer: "),
        ]:
            assert brief["taskDemand" + suffix] == case["learnerTask"][language] + task_connector + transfer["wholeOriginalFreshTransferDemand"][language]
            assert brief["expectedPerformance" + suffix] == case["expectedAnswer"][language] + answer_connector + transfer["authoredWorkedFreshTransferResponse"][language]
            assert brief["understandingFocus" + suffix] == transfer["understandingFocus"][language]
        scientific_fields = ["caseKey", "suppliedMaterial", "learnerTask", "expectedAnswer", "requiredAssessmentCriteria", "transfer", "sourceOperatorScopeContractDe"]
        print("ACTUAL CASE SCIENTIFIC FIELDS", json.dumps({k: case[k] for k in scientific_fields}, ensure_ascii=False))
        print("ACTUAL FRESH SUPPLEMENT", json.dumps({k: transfer[k] for k in ["caseKey", "authoredWorkedFreshTransferResponse", "freshSupplementalMaterial", "understandingFocus"]}, ensure_ascii=False))
        print("CASE BRIEF", "exactly the displayed original task/answer plus displayed fresh task/answer and focus in both languages; verified, not a scientific decision")
