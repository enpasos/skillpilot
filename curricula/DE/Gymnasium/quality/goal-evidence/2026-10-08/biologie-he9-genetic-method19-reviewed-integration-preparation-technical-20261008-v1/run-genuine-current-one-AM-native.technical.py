# SPDX-License-Identifier: Apache-2.0
import datetime
import json
import pathlib
import subprocess
import time

ROOT = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).parent
AUTHOR = OWN.parent / "biologie-he9-genetic-method19-current-raster-native-author-root-v3"


def rel(p):
    return str(p.relative_to(ROOT))


def save(p, o):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("x") as out:
        out.write(o if isinstance(o, str) else json.dumps(o, ensure_ascii=False, indent=2) + "\n")


save(OWN / "AM/no-required-cards.current1.jsonl", "")
checks = []
for source_name, output_name, script, row_path in [
    ("semantic-atomicity.one.scoped-native.config.json", "A1", "semanticAtomicityReview.ts", "semantic-atomicity.one.exact-reviewed.jsonl"),
    ("memory-card-review.one.scoped-native.config.json", "M1", "memoryCardReview.ts", "memory-card-review.one.exact-reviewed.jsonl"),
    ("memory-card-review.full.inactive.config.json", "M391", "memoryCardReview.ts", "memory-card-review.future-active.jsonl"),
]:
    config = json.loads((AUTHOR / "candidate" / source_name).read_text())
    config["landscapePath"] = rel(OWN / "candidate/canonical.one-current191-future-active.json")
    config["reviewPath"] = rel(OWN / "candidate" / row_path)
    config["reportPath"] = rel(OWN / f"AM/{output_name}.native.report.actual.md")
    if output_name == "M1":
        config["cardReviewPath"] = rel(OWN / "AM/no-required-cards.current1.jsonl")
    cfg = OWN / f"AM/{output_name}.inactive-native.config.json"
    save(cfg, config)
    argv = ["node", "app/node_modules/tsx/dist/cli.mjs", "app/scripts/" + script, "--mode=check", "--config=" + rel(cfg)]
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    timer = time.monotonic()
    r = subprocess.run(argv, text=True, capture_output=True)
    save(OWN / f"AM/{output_name}.native.stdout.actual.txt", r.stdout)
    save(OWN / f"AM/{output_name}.native.stderr.actual.txt", r.stderr)
    receipt = {"argv": argv, "startedAt": started, "exitCode": r.returncode, "elapsedSeconds": time.monotonic() - timer, "activeWrites": 0, "actualSourceClassAMScience": "Own and peer genuine targeted whole-science seals already existed; this run checks rebased bindings only", "newCardScienceReviews": 0}
    save(OWN / f"AM/{output_name}.native.terminal.actual.json", receipt)
    checks.append(receipt)
    if r.returncode:
        raise RuntimeError(output_name + " native check failed: " + r.stderr + r.stdout)
save(OWN / "checks/current-one-A-M-scoped-and-retained390-closure.actual.technical.json", {"checks": checks, "genuineNewReviewedGoal": 1, "retainedOrdinaryOtherGoals": 390, "existingCardsAndEightViewsUntouched": True, "activeWrites": 0, "newScientificReview": False, "humanApproval": False})
print(json.dumps({"A1": "PASS_actual0", "M1": "PASS_actual0", "M391Retained390": "PASS_actual0", "newMemoryCards": 0, "activeWrites": 0}))
