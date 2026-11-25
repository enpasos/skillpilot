# SPDX-License-Identifier: Apache-2.0
"""Replay the two blind markings and the supersession of the parked E.1 rubric."""
from hashlib import sha256
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
REPO = next(p for p in ROOT.parents if (p / "curricula/curriculum_manifest.json").is_file())
GOAL_ID = "f41e4e30-794e-5ce4-ba5e-cc72712cd691"

def read(path):
    return json.loads(path.read_bytes())

def bound(directory, ref):
    path = (directory / ref["path"]).resolve()
    assert path.is_relative_to(directory.resolve()) and path.is_file(), ref["path"]
    assert sha256(path.read_bytes()).hexdigest() == ref["sha256"], ref["path"]
    return path

def canonical(value):
    data = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256(data.encode()).hexdigest()

def verify_round(directory, letter, candidate, scores_by_id, rows, keys, judgment):
    folder = directory / ("round-" + letter)
    run = read(bound(directory, judgment["receipt"]))
    response = read(bound(directory, judgment["response"]))
    for artifact in run["inputArtifacts"] + run["outputArtifacts"]:
        bound(folder, artifact)
    for image in run["imageAttachments"]:
        bound(directory, image)
    capsule = read(folder / "canonical-input.json")
    scripts = {s["id"]: s["submission"] for s in read(directory / "scripts.json")}
    assert capsule["candidate"] == candidate
    assert {item["submissionId"]: item["answer"] for item in capsule["learnerSubmissions"]} == {
        label: scripts[key] for label, key in keys.items()
    }
    assert run["exitCode"] == 0 and run["blindToOtherRun"] and run["round"] == letter
    assert run["reasoningEffort"] == "ultra" and run["sandbox"]["type"] == "read-only"
    events = [json.loads(line) for line in (folder / "events.jsonl").read_text().splitlines() if line.strip()]
    threads = [event["thread_id"] for event in events if event["type"] == "thread.started"]
    assert threads == [run["threadId"]] and events[-1]["type"] == "turn.completed"
    messages = []
    for event in events:
        if event["type"].startswith("item."):
            item = event["item"]
            assert item["type"] in {"reasoning", "agent_message", "plan", "todo_list"}
            if event["type"] == "item.completed" and item["type"] == "agent_message":
                messages.append(item["text"])
    assert messages and json.loads(messages[-1]) == response
    assert response["goalId"] == GOAL_ID and response["candidateDecision"] == judgment["decision"]
    assert run["model"] == judgment["model"] and run["threadId"] == judgment["threadId"]
    assert capsule["candidateFileSha256"] == run["candidateSha256"] == sha256((directory / "candidate.goal.json").read_bytes()).hexdigest()
    assert run["originalSha256"] == sha256((directory / "original.goal.json").read_bytes()).hexdigest()
    if judgment["eligibleForActivation"]:
        assert response["candidateDecision"] == "accept" and not response["requiredCorrections"]

    grades = response["gradedSubmissions"]
    assert len(grades) == len(keys) and {g["submissionId"] for g in grades} == set(keys)
    for grade in grades:
        audit_id = keys[grade["submissionId"]]
        scores = {s["criterionId"]: s["pointsAwarded"] for s in grade["scores"]}
        assert len(grade["scores"]) == len(scores_by_id) and set(scores) == set(scores_by_id)
        assert all(0 <= value <= scores_by_id[key] for key, value in scores.items())
        assert sum(scores.values()) == grade["total"]
        assert (grade["total"] >= candidate["examData"]["scoring"]["passingPoints"]) == grade["passes"]
        stored = next(item for item in rows[audit_id]["grades"] if item["round"] == letter)
        assert [stored["submissionId"], stored["scores"], stored["total"], stored["passes"]] == [
            grade["submissionId"], scores, grade["total"], grade["passes"]]
    return run["threadId"]

def verify_version(ref):
    path = bound(ROOT, ref)
    decision, directory = read(path), path.parent
    for artifact in decision["artifacts"]:
        bound(directory, artifact)
    candidate = read(bound(directory, decision["candidate"]))
    original = read(bound(directory, decision["original"]))
    assert {**candidate, "examData": original["examData"]} == original
    assert original["id"] == candidate["id"] == GOAL_ID and decision["currentGoalSha256"] == canonical(candidate)
    exam = candidate["examData"]
    payload = read(directory / "author/examData.json")
    assert {**exam, "reviewNote": payload["reviewNote"]} == payload
    assert exam["taskContent"] == original["examData"]["taskContent"]
    assert "cordon" in exam["taskContentEn"].lower()
    assert set(original["examData"]) == set(exam)
    assert {k for k in exam if exam[k] != original["examData"][k]} <= {
        "taskContentEn", "solutionContent", "solutionContentEn", "scoring", "reviewNote"}
    memo = read(directory / "author/author-memorandum.json")
    assert memo["candidate"]["sha256"] == sha256((directory / "author/examData.json").read_bytes()).hexdigest()
    caps = {step["id"]: step["points"] for step in exam["scoring"]["steps"]}
    assert list(caps.values()) == [3, 3, 2.5, 2.5, 2] * 2
    assert [sum(caps.values()), exam["scoring"]["maxPoints"], exam["scoring"]["passingPoints"]] == [26, 26, 22]
    assert all(len(s["description"].encode("utf-16-le")) // 2 <= 2000 for s in exam["scoring"]["steps"])
    rows = {row["auditId"]: row for row in decision["adjudicatedSubmissions"]}
    keys = read(directory / "round-keys.actual.json")
    assert keys["a"] != keys["b"] and all(set(k.values()) == set(rows) for k in keys.values())
    previous_dir = ROOT.parent / "e1-ffx-zwei-messreihen-20261125-v1" / "v3"
    existing = {r["id"]: r["submission"] for r in read(previous_dir / "scripts.json")}
    submitted = {r["id"]: r["submission"] for r in read(directory / "scripts.json")}
    assert len(existing) == 14 and len(submitted) >= 16
    assert all(submitted.get(k) == v for k, v in existing.items())
    for image in (previous_dir / "graphs").glob("*.png"):
        assert (directory / "graphs" / image.name).read_bytes() == image.read_bytes()
    sessions = {verify_round(directory, j["round"], candidate, caps, rows, keys[j["round"]], j)
                for j in decision["judgments"]}
    assert len(sessions) == 2 and decision["author"]["sessionId"] not in sessions
    if decision["accepted"]:
        assert not decision["validationFindings"] and not decision["panelDifferences"]
        assert all(j["decision"] == "accept" and j["eligibleForActivation"] for j in decision["judgments"])
        assert len({j["model"] for j in decision["judgments"]}) == 2
        for exp in read(directory / "expected-marks.json")["rows"]:
            actual = rows[exp["auditId"]]
            assert actual["consensusPass"] == exp["passes"]
            for grade in actual["grades"]:
                normalized = {decision["prospectiveCriterionIdAliases"].get(k,k): v for k,v in exp["scores"].items()}
                assert [grade["scores"],grade["total"]] == [normalized,exp["total"]]
    return decision

def main():
    accepted = (ROOT / "accepted.actual.json").exists()
    final = read(ROOT / ("accepted.actual.json" if accepted else "parked.actual.json"))
    parked = read(bound(REPO, final["supersedes"]))
    assert final["goalId"] == GOAL_ID == parked["goalId"]
    decisions = [verify_version(ref) for ref in final["attempts"]]
    latest = decisions[-1]
    assert latest["version"] in {4, 5}
    assert sha256((ROOT / final["reviewPath"] / "review-disposition.actual.json").read_bytes()).hexdigest() == final["dispositionSha256"]
    for key in ("original", "candidate"):
        assert read(bound(ROOT, final[key])) == read(bound(ROOT / final["reviewPath"], latest[key]))
    assert read(bound(ROOT, final["candidate"]))["id"] == GOAL_ID
    assert [d["version"] for d in decisions] in ([4], [4, 5])
    assert not any(d["eligibleForActivation"] for d in decisions[:-1])
    assert decisions[-1]["eligibleForActivation"] == accepted
    if accepted:
        assert final["currentGoalSha256"] == decisions[-1]["currentGoalSha256"]
    print(f"Verified {len(decisions)} rubric version(s), accepted={accepted}.")

if __name__ == "__main__":
    main()
