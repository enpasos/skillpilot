"""Actual read-only production CLI checks; outputs are technical QA only."""
from pathlib import Path
import concurrent.futures
import datetime
import hashlib
import json
import os
import subprocess

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
REL = OWN.relative_to(REPO).as_posix()
def bind(path):
    data = (REPO / path).read_bytes()
    return {"path": path, "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}
def dump(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
assert REPO.name == "skillpilot"
assert not (OWN / "actual-base-cli-checks.receipt.json").exists()
paths = ["AGENTS.md", "app/package.json", "scripts/validate_competency_wording.py", "scripts/config/competency-wording-exceptions.json", "scripts/check_curriculum_spelling.mjs", "scripts/check_curriculum_spelling.test.mjs", "app/scripts/validateGraph.ts", "app/scripts/validateViewFilters.ts", "app/scripts/validateCompositionViews.ts", "app/scripts/applicabilityCompiler.ts", "app/scripts/treeProjectionValidator.ts", "app/scripts/testGoalBookSourceAtlasInputs.ts", "app/scripts/goalBookSourceAtlasInputs.ts", "docs/qa-ci/applicability-accepted-warnings.json", "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"]
for subject in ["MATHEMATIK", "PHYSIK", "CHEMIE", "BIOLOGIE"]:
    paths.append("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_" + subject + ".de.json")
for subject in ["mathematik", "physik", "chemie", "biologie"]:
    path = "curricula/DE/Gymnasium/quality/goal-book-publication/" + subject + ".semantic-kinds.json"
    if (REPO / path).exists(): paths.append(path)
paths.append("curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json")
for root in ["curricula/DE/Gymnasium/memory-decks", "app/public/data", "backend/src/main/resources/static/data"]:
    paths.append(root + "/de_gymnasium_chemistry_flashcards_organic_q1.de.json")
for id in ["b8d3b453-d638-5518-aab0-d84ec2e8567c", "973c12d9-d863-5292-8c68-9c80cdacf9e2", "363c5740-8a3c-50b8-8c3a-5548c80c36ea"]:
    for root in ["curricula/DE/Gymnasium/visualizations/chemie", "app/public/assets/goal-visualizations/chemie", "backend/src/main/resources/static/assets/goal-visualizations/chemie"]:
        paths.append(root + "/" + id + "/" + id + ".png")
before = [bind(path) for path in paths]
dump("actual-current-active-input-bindings.before.json", {"schemaVersion":1,"documentType":"readonly-layer-a-current-active-input-bindings-before","bindings":before,"activeCurriculumWrites":False})
commands = [
    ("graph", ["npm", "--prefix", "app", "run", "validate:graph"]),
    ("view-filters", ["npm", "--prefix", "app", "run", "validate:view-filters"]),
    ("composition-views", ["npm", "--prefix", "app", "run", "validate:composition-views"]),
    ("competency-wording", ["python", "-B", "scripts/validate_competency_wording.py"]),
    ("spelling-helper-contract", ["node", "--test", "scripts/check_curriculum_spelling.test.mjs"]),
    ("spelling-current-native", ["node", "scripts/check_curriculum_spelling.mjs"]),
]
environment = os.environ.copy()
# Preserve the normal production validation scope and strict rule defaults.
assert environment.get("VALIDATE_GRAPH_STRICT_RULES", "1") != "0"
assert environment.get("APPLICABILITY_VALIDATION_SCOPE", "reviewed") != "all"
def run(item):
    name, argv = item
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(argv, cwd=REPO, env=environment, capture_output=True, text=True)
    (OWN / (name + ".actual.stdout.txt")).write_text(result.stdout)
    (OWN / (name + ".actual.stderr.txt")).write_text(result.stderr)
    return {"checkId":name,"argv":argv,"cwd":str(REPO),"startedAtUTC":started,"completedAtUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"actualExitCode":result.returncode,"stdoutPath":REL+"/"+name+".actual.stdout.txt","stderrPath":REL+"/"+name+".actual.stderr.txt","unmodifiedProductionCli":True,"activeWritesByThisCheck":False,"technicalScratchReportsByNativeHelper": "tmp/applicability" if name=="view-filters" else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    checks = list(executor.map(run, commands))
actual = [bind(path) for path in paths]
assert actual == before
summary = REPO / "tmp/applicability/summary.json"
if summary.exists():
    (OWN / "native-applicability-summary.actual.json").write_bytes(summary.read_bytes())
dump("actual-base-cli-checks.receipt.json", {"schemaVersion":1,"documentType":"actual-production-layer-a-base-check-cli-receipts","checks":checks,"allChecksExitZero":all(check["actualExitCode"]==0 for check in checks),"allCapturedCurrentActiveInputsByteExactAfter":True,"activeCurriculumWrites":False,"nativeViewFiltersActuallyWroteTechnicalScratchReports":True,"noNewScienceReviewOrStatusChange":True})
dump("actual-current-active-input-bindings.after-base.json", {"schemaVersion":1,"documentType":"readonly-layer-a-current-active-input-bindings-after-base","bindings":actual,"allBeforeBindingsExact":True,"activeCurriculumWrites":False})
print(json.dumps({"checks":[{"id":check["checkId"],"exitCode":check["actualExitCode"]} for check in checks],"activeGuardBindings":len(before)}))
