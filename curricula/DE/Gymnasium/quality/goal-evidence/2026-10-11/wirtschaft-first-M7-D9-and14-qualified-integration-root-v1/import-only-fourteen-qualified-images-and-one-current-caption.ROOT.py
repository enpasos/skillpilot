"""Run the native importer for the fourteen actually reviewed Economics PNGs.

This is an integration driver, not an image generator or review substitute.
Historical inputs and author/independent reviews remain unchanged.
"""

import datetime
import hashlib
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUTPUT = pathlib.Path(__file__).resolve().parent
CANONICAL = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json"


def load(path):
    return json.loads(path.read_text())


def digest(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    assert (ROOT / "app/package.json").exists(), ROOT
    plan = load(OUTPUT / "03-root-selected14-actual-inspection-and-independent-qualified-import-plan.receipt.json")
    before_path = OUTPUT / "canonical-before14-current434.EXACT.json"
    assert (ROOT / CANONICAL).read_bytes() == before_path.read_bytes()
    final_path = OUTPUT / "04-actual-fourteen-native-imports-and-one-qualified-caption.receipt.json"
    assert not final_path.exists(), "Never overwrite an integration receipt."
    node = pathlib.Path("/tmp/skillpilot-checkpoint-native-node-path.txt").read_text().strip()
    commands = []
    for row in plan["records"]:
        goal_id = row["goalId"]
        image = ROOT / row["selectedAsset"]["path"]
        prompt = ROOT / row["actualFinalPrompt"]["path"]
        assert digest(image) == row["selectedAsset"]["sha256"]
        assert digest(prompt) == row["actualFinalPrompt"]["sha256"]
        args = [
            node, "scripts/import_goal_visualization.mjs", goal_id, str(image),
            "--landscape", CANONICAL, "--subject", "wirtschaftswissenschaften",
            "--provider", "OpenAI Codex image_gen", "--prompt", str(prompt),
            "--review-status", "pilot", "--alt-text", row["altText"],
            "--description", "Visualisierung zum Lernziel: " + row["currentWholeGoalBefore"]["title"] + ".",
        ]
        started = datetime.datetime.now(datetime.timezone.utc).isoformat()
        result = subprocess.run(args, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        log = OUTPUT / ("native-import-" + goal_id + ".raw.txt")
        assert not log.exists()
        log.write_text(result.stdout)
        command = {"goalId": goal_id, "argv": args, "startedAt": started,
                   "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                   "exitCode": result.returncode, "wholeOutput": str(log.relative_to(ROOT))}
        commands.append(command)
        if result.returncode:
            (OUTPUT / "native-import-partial-FAILED.receipt.json").write_text(json.dumps(commands, indent=2) + "\n")
            sys.exit(result.returncode)
        for asset_root in ["curricula/DE/Gymnasium/visualizations", "app/public/assets/goal-visualizations",
                           "backend/src/main/resources/static/assets/goal-visualizations"]:
            imported = ROOT / asset_root / "wirtschaftswissenschaften" / goal_id / (goal_id + ".png")
            assert digest(imported) == row["selectedAsset"]["sha256"]

    current = load(ROOT / CANONICAL)
    caption_goal = next(g for g in current["goals"] if g["id"] == "dd38e0c5-d77b-5893-815c-548ea2a84429")
    link = next(link for link in caption_goal["resourceLinks"] if link.get("role") == "primary")
    link["title"] = "Visualisierung: " + caption_goal["title"]
    link["description"] = "Visualisierung zum Lernziel: " + caption_goal["title"] + "."
    link["altText"] = ("Eine Gruppe bespricht eine Tafel mit versetzten Arbeitszeiten und unterschiedlich langen "
                       "Wochenblöcken. Eine gemeinsame Planungsunterlage, Beschäftigungssymbole und eine Frage "
                       "zur Serviceabdeckung begleiten die Arbeitszeitmodelle.")
    (ROOT / CANONICAL).write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n")
    before = load(before_path)
    old_goals = {g["id"]: g for g in before["goals"]}
    allowed = {r["goalId"] for r in plan["records"]} | {caption_goal["id"]}
    changed = []
    for goal in current["goals"]:
        old = old_goals[goal["id"]]
        assert {k: v for k, v in goal.items() if k != "resourceLinks"} == {k: v for k, v in old.items() if k != "resourceLinks"}
        if old != goal:
            assert goal["id"] in allowed
            changed.append(goal["id"])
    assert set(changed) == allowed
    assert {k: v for k, v in before.items() if k != "goals"} == {k: v for k, v in current.items() if k != "goals"}
    final = {"status": "ACTUAL_NATIVE_IMPORT14_AND_ONE_INDEPENDENTLY_QUALIFIED_CAPTION_COMPLETE_BINDING_CHECKS_PENDING",
             "recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "commands": commands,
             "changedGoalIds": changed, "onlyResourceLinksChanged": True, "wholeGoalSciencePreserved": True,
             "importedImageCount": 14, "assetCopiesByteExact": 42, "releaseReviewStatus": "pilot",
             "activeQaApprovalsWritten": 0, "newDescriptionReviews": 0, "humanApproval": False,
             "strictCompletionsNotYetMeasured": True}
    final_path.write_text(json.dumps(final, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"nativeImports": 14, "assetCopiesByteExact": 42, "onlyResourceLinksChanged": 15,
                      "activeQaApprovalsWritten": 0, "humanApproval": False}))


if __name__ == "__main__":
    main()
