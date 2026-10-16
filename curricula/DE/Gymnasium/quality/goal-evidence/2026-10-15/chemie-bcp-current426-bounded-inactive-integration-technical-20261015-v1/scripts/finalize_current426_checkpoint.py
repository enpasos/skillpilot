# SPDX-License-Identifier: Apache-2.0
"""Seal the measured inactive BcP checkpoint; no new science or active writes."""
import ast
import datetime
import hashlib
import json
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]


def load(p):
    return json.loads(p.read_text())


def ref(p):
    raw = p.read_bytes()
    return {"path": p.relative_to(REPO).as_posix(), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def verify(r):
    p = REPO / r["path"]
    actual = ref(p)
    assert actual["sha256"] == r["sha256"] and actual["bytes"] == r["bytes"], p
    return p


def put(p, value):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


seal = OWN / "FILES.finite-current426-inactive-checkpoint.final.seal.json"
assert not seal.exists()
prep = load(OWN / "preparation/PREPARED.awaiting-two-fresh-D-FIRSTs.json")
receipt_path = OWN / "central/CENTRAL.current426.BcP.command.actual.json"
receipt = load(receipt_path)
assert receipt["exitCode"] == 0 and receipt["actualCentralRuns"] == 1
report = load(verify(receipt["stdout"]))
verify(receipt["stderr"])
s = report["subjects"][0]
delta_path = OWN / "central/DELTA.current371-to-current426.actual.json"
delta = load(delta_path)
assert s["strictComplete"] == 386 and s["denominator"] == 426 and s["remaining"] == 40
assert delta["allOld371Preserved"] and delta["netStrictGain"] == 15
assert delta["lostOldStrictIds"] == [] and delta["restoredOwnE7D1BindingAddsNoNetClosure"]
assert len(s["requiredChecks"]) == 6 and all(c["status"] == "pass" for c in s["requiredChecks"])
assert report["blockingIssueCount"] == 0 and s["issues"] == [] and not s["strictCompletionReady"]
for k in ["canonical", "semanticHeaderAddressOnly", "QA443"]:
    verify(prep[k])
for r in load(OWN / "preparation/ROOT_RELEASE.genuine-D15-D1-normal-transport-pair-only.json")["actualScientificInputs"].values():
    verify(r)

before = load(OWN / "checks/PROTECTED697.actual-before-central.all-exact.json")
snapshot = load(verify(before["sourceSnapshot"]))
for r in snapshot["files"]:
    verify(r)
assert len(snapshot["files"]) == 697
protection = OWN / "checks/PROTECTED697.actual-after-central.all-exact.json"
put(protection, {
    "createdAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "sourceSnapshot": before["sourceSnapshot"], "filesActuallyReadAndHashed": 697,
    "bytesRead": sum(r["bytes"] for r in snapshot["files"]), "mismatches": [],
    "all697ActualBytesExact": True,
    "protectedSubjectBaselines": before["protectedSubjectBaselines"],
    "activeWrites": 0, "scientificReReview": False,
})
canonical = load(verify(prep["canonical"]))
by_id = {g["id"]: g for g in canonical["goals"]}
remaining = sorted(set(s["currentGoalIds"]) - set(s["strictCompleteGoalIds"]))
assert len(remaining) == 40
remaining_path = OWN / "central/REMAINING.current426.actual-forty-whole-ID-list.json"
put(remaining_path, {
    "role": "Set difference of the actual current central report; no new review or gate verdict",
    "report": receipt["stdout"], "count": len(remaining),
    "goals": [{"goalId": gid, "titleDe": by_id[gid]["title"], "titleEn": by_id[gid].get("titleEn")} for gid in remaining],
    "externalRPSourceAndContextImageHoldsAreAdditional": True,
    "M7Granted": False,
})
paired_path = OWN / "phase2/OUTPUTS.finite-genuine-D15-D1-stock-pairing.ready-for-one-scoped-Central.selector.json"
paired = load(paired_path)
assert paired["readyForOneScopedCentral"] and paired["actualStockCurrentStrictDescriptionResolutions"] == 16
for r in paired["descriptionResolutionIndices"] + paired["actualStockPairChecks"]:
    verify(r)
host_map = load(verify(prep["privateHostRebuildMap"]))
host_map.update({
    "role": "Finite exact rebuild recipe for the measured inactive386/426 checkpoint; no additional report run authorized",
    "finalCentralConfig": ref(OWN / "central/config/central.current426.BcP-genuine-D15-D1.inactive.config.json"),
    "actualCentralReport": receipt["stdout"], "actualCentralReceipt": ref(receipt_path),
    "actualCentralRuns": 1, "allowedAdditionalCentralRuns": 0, "centralAllowed": False,
})
map_path = OWN / "preparation/REBUILD.final-current426-measured-inactive-checkpoint.physical-map.json"
put(map_path, host_map)
(OWN / "README.final-current426-inactive-checkpoint.md").write_text("""# BcP: gemessener inaktiver Zwischenstand 386/426

Der unveränderte zentrale Bericht lief genau einmal: 55,024 Sekunden, Exit0,
sechs Pflichtprüfungen PASS, keine Issues. 386/426 Ziele sind streng
abgeschlossen; 40 bleiben offen. D/P/A/M/V: 388/397/401/426/422.

15 echte fachliche Erstabschlüsse (zehn neue Kinder und fünf Bestandsziele)
kommen zu allen erhaltenen 371 Abschlüssen hinzu. Die gezielte neue e7-D1-
Kontextbindung erhält einen bereits gezählten Abschluss, Nettozuwachs null.
Acht weitere alte ganze Zielkörper und ihre D-Bindungen bleiben unverändert;
die beiden echten Neun-Kontextprüfungen sind ergänzende Wissenschaft und
werden nicht als neun neue Beschreibungsfreigaben ausgegeben.

Zwei ursprünglich unabhängige wissenschaftliche Rollen haben ihre eigenen
15 Beschreibungsurteile und Verständnisfelder vor der technischen Bindung
versiegelt. e7 wurde abschließend an seiner tatsächlichen neuen Einzelseite
von beiden Rollen geprüft. 32 Originalrecords und 192 eigene DE/EN-Felder
bleiben wortgleich. Alle acht Stock-Paarungsschritte sind bestanden. Keine
neuen wissenschaftlichen Urteile des technischen Binders, keine aus NULL
erfundenen P-Nachweise und keine behauptete Modellanbieter-Diversität.

Der Nenner steigt von422 auf426: sechs zu breite Atome sind jetzt
curricularArea-Kontexte mit zehn eigenen atomaren Kindern. Die 52 ganzen
amtlichen BcP-Quellenzellen bleiben erhalten. Das bayerische Praktikum12/13
ist ein gesonderter gewählter Kursumfang, keine bundesweite GK-/LK-Pflicht.
Fiktive Übungsfallwerte sind kein Beleg für tatsächlich ausgeführte Versuche.

Zehn Kindbilder wurden real am GoalCard bei360/680 betrachtet. Gute vorhandene
Bilder bleiben erhalten. Fünf konkret fehlerhafte optionale Kontextbildlinks
sind ausschließlich im Kandidaten entfernt; alte Bildbytes bleiben erhalten.
Globale QA bleibt HOLD wegen vier alten Kontextbildern; vier atomare V-Lücken
sind offen. Die 360px-Titel/Icon-Überlappung bei0f632595 bleibt gesondert als
Runtime-UI-REVISION außerhalb dieses QS-Auftrags dokumentiert.

Die falsche RP-Kp/Gasnachweis-Quellenkante bleibt ein externer offener Befund.
Ihr additiver Entfernungsfolger ist gehalten und nicht aktiv integriert;
der zentrale Fünf-Gate-Erfolg ersetzt weder diesen Layer-A-Quellenabschluss
noch weitere Quellen-/Kursprüfungen, CQR-303 oder die spätere M7-Ausweisung.

Alle697 geschützten aktiven Dateien sind vorher und nachher bytegleich.
Aktiv bleiben Chemie231/402 M6 sowie Mathematik807/807, Physik478/478 und
Biologie397/397 jeweils M7. Der Kandidat enthält keine aktive Registry-,
Runtime-, Plugin- oder Veröffentlichungsänderung und behauptet weder
menschliche Freigabe noch Erprobung. Der bisherige371-Commit2fd57186 hat
GitHub-CI bestanden; der neue386-Commit benötigt seinen eigenen GitHub-Lauf.

Maßgeblich sind der finale Selector, der tatsächliche Zentralbericht und
seine genaue Restliste. Frühere READY-Dateien bleiben historische Stufen.
Die Integration ist versiegelt; die übergeordnete Chemie-M7-Arbeit läuft weiter.
""")
stats = {"jsonFiles": 0, "jsonlFiles": 0, "jsonlRows": 0, "pythonAST": 0}
for p in sorted(OWN.rglob("*")):
    if p.is_symlink() or not p.is_file():
        continue
    if p.suffix == ".json":
        load(p)
        stats["jsonFiles"] += 1
    elif p.suffix == ".jsonl":
        rows = [json.loads(line) for line in p.read_text().splitlines() if line.strip()]
        stats["jsonlFiles"] += 1
        stats["jsonlRows"] += len(rows)
    elif p.suffix == ".py":
        ast.parse(p.read_text())
        stats["pythonAST"] += 1
audit_path = OWN / "checks/FINITE.final-own-payload-parse-and-current-integrity.actual.json"
put(audit_path, {"role": "Finite own syntax and exact input preservation; no full schema/build or new science", "stats": stats, "protected697Exact": True, "allOld371Preserved": True, "actualCentralRuns": 1, "activeWrites": 0})
final = OWN / "OUTPUTS.finite-current426-measured-inactive-checkpoint.final-selector.json"
put(final, {
    "schemaVersion": 1, "role": "Measured inactive BcP integration from genuine original independent science",
    "canonical": prep["canonical"], "semantic": prep["semanticHeaderAddressOnly"], "visualizationQA": prep["QA443"],
    "actualCentralConfig": ref(OWN / "central/config/central.current426.BcP-genuine-D15-D1.inactive.config.json"),
    "actualCentralReport": receipt["stdout"], "actualCentralReceipt": ref(receipt_path),
    "actualSetDifference": ref(delta_path), "actualCompleteRemainingFortyList": ref(remaining_path),
    "originalPAMSelection": prep["genuinePAMSelector"], "originalVSelection": prep["genuineVSelector"],
    "originalD15D1StockPairSelection": ref(paired_path), "protected697BeforeAndAfter": ref(protection),
    "exactRebuildRecipe": ref(map_path), "finiteOwnSyntaxAndIntegrityAudit": ref(audit_path),
    "openRuntimeAndGlobalVisualFindings": paired["openRuntime360AndGlobalImages"],
    "globalQAApprovalCoverage": paired["globalQaApprovalCoverage"],
    "actualStrictComplete": 386, "actualDenominator": 426, "actualRemaining": 40,
    "newScientificClosures": 15, "allOld371Preserved": True, "ownE7ContextBindingRestored": 1,
    "pureBindingNetGain": 0, "originalEightDContextsPreserved": True, "newD9Votes": 0,
    "gates": s["gates"], "requiredChecks": s["requiredChecks"], "issues": s["issues"],
    "actualCentralRuns": 1, "allowedAdditionalCentralRuns": 0,
    "RPSourceHoldRemainsOpen": True, "strictCompletionReady": False,
    "M7Granted": False, "HumanApproval": False, "HumanTrial": False,
    "activeWrites": 0, "technicalRoleNewScientificVotes": 0,
    "finalSealPath": seal.relative_to(REPO).as_posix(),
})
files = [ref(p) for p in sorted(OWN.rglob("*")) if p.is_file() and not p.is_symlink()]
links = [{"path": p.relative_to(REPO).as_posix(), "target": p.readlink().as_posix()} for p in sorted(OWN.rglob("*")) if p.is_symlink()]
assert all(not Path(x["target"]).is_absolute() and (REPO / x["path"]).exists() for x in links)
put(seal, {"schemaVersion": 1, "role": "Finite final inactive checkpoint payload; own final seal excluded", "sealedAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(), "selector": ref(final), "files": files, "relativeSymlinks": links, "fileCount": len(files), "totalRegularPayloadBytes": sum(r["bytes"] for r in files), "actualCentralRuns": 1, "activeWrites": 0})
for r in files:
    verify(r)
print(json.dumps({"selector": ref(final), "seal": ref(seal), "fileCount": len(files), "payloadBytes": sum(r["bytes"] for r in files), "strict": "386/426", "remaining": 40, "newScientificClosures": 15, "allOld371Preserved": True, "protected697Exact": True}))
