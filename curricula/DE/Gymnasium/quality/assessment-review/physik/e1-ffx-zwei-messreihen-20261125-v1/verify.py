# SPDX-License-Identifier: Apache-2.0
"""Check the sealed native author and marker responses in this evidence directory."""
import hashlib
import json
from copy import deepcopy
from pathlib import Path

root = Path(__file__).resolve().parent
# The provider was stopped before either of these two requests returned JSON.
# Keep the original capture names in the sealed records and store the zero-byte streams as raw output.
EMPTY_TRANSPORT_OUTPUTS = {
    "v1/author/transport-attempt-1/provider-response.json",
    "v2/author/superseded-3-3-3-3-input/provider-response.json",
}

def read(path):
    return json.loads(path.read_bytes())

def bound(directory, entry):
    path = (directory / entry["path"]).resolve()
    assert path.is_relative_to(directory.resolve())
    if path.relative_to(root).as_posix() in EMPTY_TRANSPORT_OUTPUTS:
        assert not path.exists() and entry["sha256"] == hashlib.sha256(b"").hexdigest()
        path = path.with_suffix(".raw")
    assert hashlib.sha256(path.read_bytes()).hexdigest() == entry["sha256"], path
    return path

def artifact_value(directory, entry):
    return read(bound(directory, entry))

def authored_payload(version, original):
    native = read(version / "author/provider-response.json")
    assert not native["is_error"]
    result = native["result"].strip()
    if result.startswith("```"):
        lines = result.splitlines()
        assert lines[-1] == "```"
        result = "\n".join(lines[1:-1])
    author = json.loads(result)
    if "examData" in author:
        return author["examData"]
    exam = deepcopy(original)
    for field in ("solutionContent", "solutionContentEn"):
        exam[field] = author[field]
    exam["scoring"]["passingPoints"] = 20
    for old, new in zip(exam["scoring"]["steps"], author["stepDescriptions"], strict=True):
        assert old["id"] == new["id"]
        old["description"] = new["description"]
        if "points" in new:
            old["points"] = new["points"]
        elif version.name in {"v2","v3"}:
            old["points"] = 4 if "initial-law" in old["id"] else 2 if "boundaries" in old["id"] else 3
    return exam

def verify_version(entry, sessions):
    path = bound(root, entry)
    version = path.parent
    decision = read(path)
    for artifact in decision["artifacts"]:
        bound(version, artifact)
    original = artifact_value(version, decision["original"])
    candidate = artifact_value(version, decision["candidate"])
    payload = authored_payload(version, original["examData"])
    assert read(version / "author/examData.json") == payload
    restored = deepcopy(candidate["examData"])
    restored["reviewNote"] = original["examData"]["reviewNote"]
    assert restored == payload
    assert {**candidate, "examData":original["examData"]} == original
    native = artifact_value(version, decision["author"]["response"])
    assert decision["author"]["modelId"] in native["modelUsage"]
    assert native["session_id"] == decision["author"]["sessionId"]
    assert native["session_id"] not in sessions
    sessions.add(native["session_id"])
    keys = read(version / "round-keys.actual.json")
    submissions = {v["id"]:v["submission"] for v in read(version / "scripts.json")}
    assert list(keys["a"].values()) != list(keys["b"].values())
    assert set(keys["a"].values()) == set(keys["b"].values()) == set(submissions)
    papers = {s["auditId"]:s for s in decision["adjudicatedSubmissions"]}
    assert set(papers) == set(submissions)
    for row in decision["rounds"]:
        label = row["round"]
        run = artifact_value(version, row["run"])
        response = artifact_value(version, row["response"])
        rd = version / ("round-" + label)
        assert run["model"] == {"a":"gpt-6.1-sol","b":"gpt-6.2-astra"}[label]
        assert run["reasoningEffort"] == "ultra" and run["sandbox"]["type"] == "read-only"
        assert run["exitCode"] == 0 and run["blindToOtherRun"] and not run["nativeVerificationErrors"]
        assert run["threadId"] not in sessions
        sessions.add(run["threadId"])
        for artifact in run["inputArtifacts"] + run["outputArtifacts"]:
            bound(rd, artifact)
        for image in run["imageAttachments"]:
            bound(version, image)
        events = [json.loads(line) for line in (rd / "events.jsonl").read_text().splitlines()]
        assert [e["thread_id"] for e in events if e["type"]=="thread.started"] == [run["threadId"]]
        assert events[-1]["type"] == "turn.completed"
        items = [e["item"] for e in events if e["type"]=="item.completed"]
        assert all(i["type"] in {"agent_message","reasoning","plan","todo_list"} for i in items)
        assert json.loads([i["text"] for i in items if i["type"]=="agent_message"][-1]) == response
        capsule = read(rd / "canonical-input.json")
        assert capsule["original"] == original and capsule["candidate"] == candidate
        for item in capsule["learnerSubmissions"]:
            assert submissions[keys[label][item["submissionId"]]] == item["answer"]
        assert {g["submissionId"] for g in response["gradedSubmissions"]} == set(keys[label])
        for grade in response["gradedSubmissions"]:
            paper = papers[keys[label][grade["submissionId"]]]
            recorded = next(g for g in paper["grades"] if g["round"] == label)
            assert recorded["scores"] == {s["criterionId"]:s["pointsAwarded"] for s in grade["scores"]}
            assert recorded["total"] == grade["total"] and recorded["passes"] == grade["passes"]
            if decision["accepted"]:
                assert sum(recorded["scores"].values()) == grade["total"]
                assert paper["consensusPass"] == (grade["total"] >= 20)
    return decision

if __name__ == "__main__":
    final_path, = [p for p in (root/"accepted.actual.json",root/"parked.actual.json") if p.exists()]
    final = read(final_path)
    sessions = set()
    records = [verify_version(a, sessions) for a in final["attempts"]]
    assert 1 <= len(records) <= 3
    assert [r["version"] for r in records] == list(range(1,len(records)+1))
    assert not any(r["accepted"] for r in records[:-1])
    assert records[-1]["accepted"] == (final_path.name == "accepted.actual.json")
    assert records[-1]["accepted"] or len(records) == 3
    print(f"{len(records)} versions, {len(sessions)} native sessions, {sum(2*len(r['adjudicatedSubmissions']) for r in records)} marked submissions")
