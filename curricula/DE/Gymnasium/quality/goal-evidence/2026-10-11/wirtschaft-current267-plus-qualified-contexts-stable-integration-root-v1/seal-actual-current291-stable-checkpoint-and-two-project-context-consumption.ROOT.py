"""Record actually completed native checks and bounded root review consumption."""
import datetime
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
assert (ROOT / "AGENTS.md").is_file()
BASE = Path(__file__).resolve().parent
Q = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11"
PROJECT = Q / "wirtschaft-0d8-596-existing-D2-current-P-and-selected-P12-context-independent-READONLY-v1"


def read(path):
    return json.loads(path.read_text())


def meta(path):
    data = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write(name, value):
    p = BASE / name
    assert not p.exists(), "Preserve existing checkpoint evidence"
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    assert read(p) == value
    return meta(p)


status_path = ROOT / "docs/qa-ci/status/curriculum-quality-status.json"
status = read(status_path)
baseline = json.loads(subprocess.check_output(["git", "show", "43461b906438572f4f3b64d056112f4189dca4f4:" + str(status_path.relative_to(ROOT))]))
foreign_old = [row for row in baseline["curricula"] if row["subject"] != "Wirtschaftswissenschaften"]
foreign_now = [row for row in status["curricula"] if row["subject"] != "Wirtschaftswissenschaften"]
assert len(foreign_now) == 20 and foreign_old == foreign_now
econ = next(row for row in status["curricula"] if row["subject"] == "Wirtschaftswissenschaften")
cqr = next(row for row in econ["rules"] if row["id"] == "CQR-303")
assert econ["maturity"] == "M6" and cqr["status"] == "fail"
assert cqr["metrics"]["strictComplete"] == 291 and cqr["metrics"]["remaining"] == 55
assert cqr["metrics"]["requiredChecksPassed"] == 5 and cqr["metrics"]["blockingIssues"] == 60
report = read(BASE / "actual-native-current-five-gate-report.raw.txt")
e = next(row for row in report["subjects"] if row["subject"] == "wirtschaftswissenschaften")
assert e["strictComplete"] == 291 and e["denominator"] == 346 and not e["strictCompletionReady"]
protected = {}
for subject, count in [("mathematik", 807), ("physik", 478)]:
    row = next(row for row in report["subjects"] if row["subject"] == subject)
    assert row["strictComplete"] == count == row["denominator"] and row["strictCompletionReady"]
    assert not row["issues"] and all(check["status"] == "pass" for check in row["requiredChecks"])
    protected[subject] = {"strictComplete": count, "denominator": count, "requiredChecks": row["requiredChecks"]}
phases = [read(BASE / f"actual-native-{phase}.phase-receipt.json") for phase in ["books", "status"]]
checks = [result for phase in phases for result in phase["results"]]
assert len(checks) == 8 and all(result["exitCode"] == 0 and result["status"] == "PASS" for result in checks)
for result in checks:
    assert meta(ROOT / result["rawLog"]["path"]) == result["rawLog"]
registry_path = ROOT / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
assert meta(registry_path)["sha256"] == "sha256:66dc158fbade6384af9c36d8c2b943525d53fb6f1856a7be04c8007509e85bf6"
snapshot = BASE / "actual-central-current291.EXACT.json"
assert not snapshot.exists()
snapshot.write_bytes(status_path.read_bytes())
write("02-actual-current291-stable-native-checkpoint-twenty-foreign-rows-exact.receipt.json", {
    "recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "status": "PASS-current291-stable-integration-checks-M6-M7-still-open",
    "centralGeneratedAt": status["generatedAt"], "centralSnapshot": meta(snapshot),
    "actualNativeReport": meta(BASE / "actual-native-current-five-gate-report.raw.txt"),
    "actualRegistry": meta(registry_path), "economics": {"maturity": "M6", "metrics": cqr["metrics"], "cqr303": "FAIL"},
    "actualNativeChecks": checks, "protected": protected,
    "twentyOtherCurriculumRowsWholeExactAgainst": "43461b906438572f4f3b64d056112f4189dca4f4",
    "netSinceCurrent225": 66, "newScientificStrictClosuresSince225": 16,
    "restoredStrictBindingsSince225": 50,
    "actualNewCurrentDualDescriptionPairs": 22, "ofThoseStrictNow": 16, "ofThoseStillChainBlocked": 6,
    "m7CompletionClaim": False, "humanApprovalClaim": False,
    "githubCiQualifiedCommitOnly": "43461b906438572f4f3b64d056112f4189dca4f4",
    "localM7ChangesGithubCiQualified": False,
})
seal_path = next(PROJECT.glob("SEALED-*.json"))
seal = read(seal_path)
for artifact in seal["artifacts"]:
    assert meta(ROOT / artifact["path"]) == artifact
guards = read(PROJECT / "actual-project-context-input-before-after.READONLY.json")["inputGuards"]
assert len(guards) == 24 and all(g["exact"] and g["before"] == g["after"] for g in guards)
actual_guards = []
for guard in guards:
    current = meta(ROOT / guard["after"]["path"])
    assert current == guard["after"]
    actual_guards.append(current)
receipt_path = PROJECT / "actual-independent-two-whole-project-descriptions-P4-and-selected-P12-context-KEEP.READONLY.receipt.json"
receipt = read(receipt_path)
assert len(receipt["individualContextDecisions"]) == 2
assert all(j["decision"] == "KEEP" and len(j["ownCompleteDEENAnswersAndNegativeExamples"]) == 2 for j in receipt["individualContextDecisions"])
write("03-actual-root-two-project-context-whole-meaning-consumption-not-native-closure.receipt.json", {
    "recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "actualReviewer": "/root, current Codex assistant; exact model revision not exposed",
    "status": "KEEP-bounded-existing-D-science-current-two-project-context-fit",
    "consumedIndependentSeal": meta(seal_path), "consumedWholeMeaningAndFourDEENAnswers": meta(receipt_path),
    "verifiedActualArtifacts": seal["artifacts"], "actual24InputGuardsStillExact": actual_guards,
    "individualDecisions": [
        {"goalId": "0d8cb18d-7fd9-56f5-8009-8045d44f4127", "decision": "KEEP", "rootFindingDe": "Ein ergebnisorientierter koordinierter Projektvollzug; Datenprüfung, tatsächliche Kostenrechnung und Diagramm mit dokumentierter Änderung gehen über Board und Toolliste hinaus. Netz 6 mit C-Puffer1 wird bei C4 zu7, kritischer Weg wechselt. Stand45/Reserve15 wird60/Reserve0 und Ende8; die angebotene verfügbare Digitalalternative50/Reserve10 endet5. Keine echte Teambeobachtung behauptet. WholeP ist ausdrücklich nicht historisch wortgleich: vier qualifizierte Leistungs-/Variationsformulierungen und vier Metadatenfelder unterscheiden sich; beide ganzen Fälle und übrige Profilfelder bleiben erhalten."},
        {"goalId": "596c02e3-6263-5084-8593-c5f51808326b", "decision": "KEEP", "rootFindingDe": "Ein geschlossener Projektzyklus mit tatsächlich ausgeführter fachlicher Auswertung und begründeter Methodenrevision. Tagesprognose40/34 wird nach getrennten beiden Tagesrechnungen zu28/31; Geldkosten erlauben keine Umweltbehauptung. Die Kopfhörerkarte und Musteranfrage wenden ausdrücklich bereitgestellte Regeln an; Ja/Ja-Selbstauskunft wird durch angewendetes Fallraster ersetzt: A unbelegte automatische Erstattung, B Reparatur und Bereitstellung unter den gelieferten Grenzen. Ganze aktuelle P-/Goal-/DEEN-Verträge historisch gleich; keine menschliche Erprobung oder Vollbeherrschung behauptet."},
    ],
    "sourceBoundaryDe": "Klassische BY-Projektverträge und die bereits unabhängig qualifizierte eigene wirtschaftliche BE-P12-Facette passen zu den zwei zusammenwirkenden partial-Kanten. Keine ganze technisch-innovative P12-Deckung und keine neue Prüfung unveränderter Sourcezeilen.",
    "newDescriptionReviews": 0, "activeWrites": 0, "strictGain": 0,
    "nativeOwnerCandidatesRemainUncountedUntilCombinedStrictCheck": True,
    "humanApprovalClaim": False, "sourceCoverageUpgrade": False,
})
print(json.dumps({"status": "PASS", "strictComplete": 291, "remaining": 55, "foreignRowsWholeExact": 20, "projectContextsQualified": 2}))
