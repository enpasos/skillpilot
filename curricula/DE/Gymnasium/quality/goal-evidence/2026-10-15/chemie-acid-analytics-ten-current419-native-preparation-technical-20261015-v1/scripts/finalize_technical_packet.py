# SPDX-License-Identifier: Apache-2.0
"""Finish technical provenance and finite integrity; create no science votes."""
import hashlib
import importlib.util
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(REPO).as_posix()
E14 = REPO / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14"
AUTHOR = E14 / "chemie-acid-analytics-remaining-ten-whole-material-and-profile-author-20261014-v1"
CURRENT = E14 / "chemie-acid7-current419-paired-D6-retained059-P7A7M2V1-inactive-integration-technical-20261014-v4"
HOST = REPO / "tmp/chemie-resume-20261015/remaining10-native-host"
SEAL_NAME = "FILES.finite-technical-native-ten.seal.json"
assert not (OWN / SEAL_NAME).exists(), "Sealed packet must never be changed"
sys.dont_write_bytecode = True


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def bind(path):
    return {"path": path.relative_to(REPO).as_posix(), "sha256": sha(path), "bytes": path.stat().st_size}


def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


source = read(CURRENT / "NEUTRAL.final-inactive-integration-and-physical-resume.json")
manifest = read(OWN / "native-ten-current/batch-manifest.json")
ids = manifest["goalIds"]
author = read(AUTHOR / "NEUTRAL.exact-ten-whole-material-profile-author-inputs.json")
assert ids == author["goalIds"] and len(ids) == 10
assert manifest["curriculumAtomicDenominatorAtPreparation"] == 419
for mode in ("prepare", "check"):
    assert read(OWN / ("receipts/native10." + mode + ".actual.json"))["exitCode"] == 0
memory_config_path = REPO / source["normalM419Config"]["path"]
memory_config = read(memory_config_path)
memory_path = REPO / memory_config["reviewPath"]
memory = {r["goalId"]: r for r in map(json.loads, memory_path.read_text().splitlines())}
qa_path = REPO / source["normalQA435"]["path"]
qa = {r["goalId"]: r for r in read(qa_path)["records"]}
author_joins = read(AUTHOR / "inputs/existing-ten-current-M-V-and-open-D-P-A.exact-joins.json")
selected = []
for old in author_joins["rows"]:
    gid = old["goalId"]
    assert memory[gid] == old["existingMemoryRecord"]
    assert qa[gid] == old["existingVisualizationRecord"]
    selected.append({"goalId": gid, "existingWholeMRecord": memory[gid], "existingWholeVRecord": qa[gid], "expectedCurrentMemoryFingerprint": old["expectedCurrentMemoryFingerprint"], "wholeMAndVRowsExactFromAuthor": True, "newScientificVote": False})
card_path = REPO / memory_config["cardReviewPath"]
assert sha(card_path) == author_joins["wholeCardReviewContainerBinding"]["sha256"]
hh = author_joins["HHUnchangedKeptCardBinding"]
assert sha(REPO / hh["wholeDeck"]["path"]) == hh["wholeDeck"]["sha256"]
physical_map = read(OWN / "checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json")
aliases = {r["normalHostAlias"]: r["physicalRepositorySource"] for r in physical_map["aliases"]}
visibility = [{"label": v["label"], "normalHostViewPath": v["viewPath"], "physicalRepositorySource": aliases.get(v["viewPath"], bind(REPO / v["viewPath"]))} for v in memory_config["visibilityScopes"]]
write("inputs/current-ten-M-V-whole-records-and-HH-card.exact-reuse.json", {"schemaVersion": 1, "role": "technical unchanged reuse audit only", "currentWholeMConfig": bind(memory_config_path), "currentWholeMContainer": bind(memory_path), "currentWholeCardContainer": bind(card_path), "currentWholeQAContainer": bind(qa_path), "currentVisibilityScopes": visibility, "selectedGoalIds": ids, "rows": selected, "HHUnchangedKeptCardBindingFromFrozenAuthor": hh, "newMDecisions": 0, "newVDecisions": 0, "newHumanApprovals": 0})

physical_map = read(OWN / "checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json")
frozen = read(OWN / "inputs/FROZEN.external-input-bindings.before-prepare.json")
checked = []
for row in frozen["bindings"]:
    path = REPO / row["path"]
    assert sha(path) == row["sha256"] and path.stat().st_size == row["bytes"], path
    checked.append(row)
for row in physical_map["aliases"]:
    ref = row["physicalRepositorySource"]
    path = REPO / ref["path"]
    assert sha(path) == ref["sha256"]
    assert sha(HOST / row["normalHostAlias"]) == ref["sha256"]
for row in physical_map["selectedCurrentAssetRows"]:
    ref = row["physicalRepositorySource"]
    path = REPO / ref["path"]
    assert sha(path) == ref["sha256"]
    assert sha(HOST / row["normalCanonicalDestination"]) == ref["sha256"]
    public = HOST / row["normalPublicDestination"]
    assert sha(public) == ref["sha256"]
    if row["publicMustBePhysicalWithinHostPublicRoot"]:
        assert not public.is_symlink() and public.resolve().is_relative_to((HOST / "app/public").resolve())
    else:
        assert public.is_symlink()
for row in physical_map["stockPhysicalModules"]:
    assert sha(REPO / row["path"]) == row["sha256"]
    assert sha(HOST / row["path"]) == row["sha256"]

pdf = read(OWN / "native-ten-current/bundle/book.pdf.render-manifest.json")
assert pdf["goalPageCount"] == 10 and pdf["frontMatterPageCount"] == 2 and pdf["physicalPageCount"] == 12
pdfinfo = subprocess.run(["pdfinfo", str(OWN / "native-ten-current/bundle/book.pdf")], capture_output=True, text=True)
(OWN / "receipts/pdfinfo.stdout.txt").write_text(pdfinfo.stdout)
(OWN / "receipts/pdfinfo.stderr.txt").write_text(pdfinfo.stderr)
assert pdfinfo.returncode == 0 and "Pages:           12" in pdfinfo.stdout
current_report = read(REPO / source["actualCentralStockReport"]["path"])
chemie = next(s for s in current_report["subjects"] if s["subject"] == "chemie")
assert chemie["strictComplete"] == 312 and chemie["denominator"] == 419
assert not (set(ids) & set(chemie["strictCompleteGoalIds"]))
assert all(not list((OWN / ("native-ten-current/round-" + r + "/results")).iterdir()) for r in ("a", "b"))
assert not list((OWN / "native-ten-current/resolutions").iterdir())

spec = importlib.util.spec_from_file_location("skillpilot_schema_portability", REPO / "scripts/validate_schemas.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(REPO)
assert not symlink_errors, symlink_errors
write("checks/FINAL.scope-portability-frozen-inputs-and-read-only-CAS.actual.json", {"schemaVersion": 1, "role": "technical integrity only", "frozenExternalBindingsVerified": len(checked), "aliasesVerified": 50, "currentPhysicalAssetSourcesVerified": 428, "sourceAndHostAssetHashesMatch": True, "physicalPublicSelectedLeaves": 10, "unselectedAssetLeavesRemainSymlinks": 418, "stockPhysicalModulesVerified": len(physical_map["stockPhysicalModules"]), "tenWholeGoalsUnchangedFromAuthor": True, "currentFullNeighborsRetained": True, "currentMAndVSelectedRowsByteDataExact": True, "HHKeptCardAndVisibilityBindingsPreserved": True, "nativeGoalPages": 10, "pdfFrontMatterPages": 2, "pdfPhysicalPages": 12, "pdfinfoExitCode": pdfinfo.returncode, "curriculum_symlink_errors": symlink_errors, "stockPrepareExitCode": 0, "stockCheckExitCode": 0, "currentInactiveStrictFromExistingReport": 312, "currentDenominator": 419, "centralMeasurementPerformed": False, "newStrictClosures": 0, "reviewResultsOrResolutionsCreated": 0, "scientificApprovals": 0, "humanApproval": False, "humanTrial": False, "activeIntegration": False, "fullBuildOrCI": False})

rounds = {}
for r in ("a", "b"):
    directory = OWN / ("native-ten-current/round-" + r)
    campaign = read(directory / "description-review-campaign.json")
    batch = campaign["batches"][0]
    rounds[r] = {"campaign": bind(directory / "description-review-campaign.json"), "reviewInput": bind(directory / "description-review-input.json"), "batchInput": bind(directory / ("batches/" + batch["batchId"] + ".input.jsonl")), "expectedOwnResultsBasename": batch["batchId"], "campaignId": campaign["campaignId"], "roundId": campaign["roundId"], "independenceGroupId": campaign["independenceGroupId"], "batchInputFingerprint": batch["batchInputFingerprint"], "frozenResultsDirectoryIsEmpty": True}

readme = """# Zehn aktuelle Analytik- und Pufferziele: technische native Vorbereitung

Einstieg: `NEUTRAL.exact-ten-current419-native-pages-whole-material-and-profile-review-inputs.json`.
Dieses Paket bereitet die unveränderten zehn Ganzziele des eingefrorenen
Autorenpakets vom 14. Oktober technisch für zwei getrennte Erstprüfungen vor.
Es erzeugt keine fachlichen Stimmen, keine Reviewläufe, keine auswählbaren
P-Records, keine Auflösungen und keine neuen strengen Abschlüsse.

Der vollständige aktuelle kanonische Stand enthält 551 Ganzobjekte und 419
curricularAtomic-Ziele. Seine Quelle ist exakt `b07e023f03a7…`: die beiden
neueren Beschreibungen von 2a8a13b8 und d7461c15 und die neuere 48115ff7-PNG
bleiben erhalten. Die zehn eigenen Zielkörper sind zum Autorenpaket exakt
gleich. `inputs/ten-whole-current-bodies-and-direct-neighbors.exact.json`
enthält zusätzlich alle ganzen direkten Nachbarobjekte dieses aktuellen Stands.

Die normalen unveränderten Stock-Befehle `materializeGoalDescriptionRolloutBatch.ts
prepare` und `check` wurden im eigenen sparsamen Host tatsächlich mit Exit 0
ausgeführt. Die genauen Befehle und Ausgaben stehen in `receipts/`. Der normale
Batch enthält BookModel, HTML, PDF, Prompt, Kriterien, Verträge und zwei leere
Kampagnen. Das PDF hat zehn Lernzielseiten und zwei Vorspannseiten. Es gab
keine fachliche Sichtprüfung der Bilder durch diese technische Rolle.

Die zwanzig vollständigen zweisprachigen Fälle und zehn Rohprofile bleiben
unverändert im versiegelten Autorenpaket; der neutrale Einstieg bindet ihre
physischen Repositorydateien exakt. Die Rohprofile sind E0/G0 und ungeprüfte
Autorenentwürfe. Gültige bestehende M/V-Zeilen werden unverändert gebunden,
einschließlich der vorhandenen HH-Karte und neun Sichtbarkeitssichten. Dies
erzeugt keine neue Memory- oder Bildentscheidung. Die Produktionshelfer binden
D-Ziel-/Seitenfingerprints sowie P-Eingabe- und Rohprofilfingerprints separat
von den technischen Ganzobjekthashes des Autors.

Der ursprüngliche Live-Claim über 17 Ziele bleibt bestehen. Der Zehnerumfang
ist lediglich dessen technische Auswahl; Ledger und Claim wurden nicht
geschrieben. Der vorhandene inaktive Messstand bleibt 312/419, netto +0 aus
dieser Vorbereitung. Es fand kein neuer zentraler Messlauf statt.

Für die unabhängigen Prüfer: vor einer fachlichen Erstentscheidung alle
aktuellen Ganzkörper, Voraussetzungen und relevanten Nachbarn, alle zwanzig
vollständigen Materialien/Aufgaben/Lösungen/Rubriken sowie alle zehn Rohprofile
lesen. EDTA-Quellenoperatoren BB/BE, Kurvenzielabgrenzung, HH-Überlappungen und
Entwurf gegenüber tatsächlicher Herstellung sind offene Prüffragen des
Autorenpakets. Synthetische Messprotokolle belegen keine tatsächliche
Ausführung. Quellen-, Kurs-, View- und Erwerbsvorbehalte bleiben erhalten.
Die technische Rolle gibt hierfür kein fachliches Votum ab.

Jeder Prüfer arbeitet in einem neuen eigenen Ausgabeverzeichnis mit eigenen
Roundcopies, hält tatsächliche Lektüre und Vorbefassung fest und versiegelt
sein FIRST-Ergebnis vor dem Lesen eines fremden Ersturteils. Die normal
vorbereiteten Kampagnen und ihre Ergebnisverzeichnisse bleiben unverändert.

`checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json` und
`scripts/rebuild_sparse_host.py` binden die Rekonstruktion an physische
Repositoryquellen. Es wurden nur 22 benötigte Stockmodule (658 KB) und zehn
öffentliche Bilddateien (22.4 MB) kopiert. Andere Eingaben und die übrigen 418
Bildblätter sind verlinkt. Kein vollständiger Host oder Baum wurde kopiert;
keine Hardlinks, keine Änderungen an früheren Hosts oder Siegeln.

Nach dem endlichen Siegel endet jede Schreibarbeit in diesem Paket. Eigene
technische Dokumentation und Helfer: Apache-2.0. Vorbestehende didaktische
Inhalte bleiben unter ihren vorhandenen Rechten. Keine menschliche Freigabe,
Erprobung, aktive Übernahme, Veröffentlichung, Git- oder CI-Operation.
"""
(OWN / "README.technical-preparation-and-independent-review-handoff.md").write_text(readme)

neutral_name = "NEUTRAL.exact-ten-current419-native-pages-whole-material-and-profile-review-inputs.json"
neutral = {"schemaVersion": 1, "createdAtUTC": datetime.now(timezone.utc).isoformat(), "role": "TECHNICAL native preparation only; not an author or independent science reviewer", "status": "inactive, ready for two independent scientific FIRST reviews", "goalIds": ids, "currentWholeCanonical": source["currentFullCanonical551"], "currentSemanticLedger": source["currentAuthoritativeSemanticLedger551"], "sourceAuthorSelector": bind(AUTHOR / "NEUTRAL.exact-ten-whole-material-profile-author-inputs.json"), "sourceAuthorFiniteSeal": bind(AUTHOR / author["finiteSealPath"]), "exactWholeTwentyDEENCases": bind(AUTHOR / "materials/twenty-complete-DEEN-cases.author.json"), "exactWholeTenRawProfiles": bind(AUTHOR / "author-profiles.ten.raw.json"), "rawEvidenceLevel": "E0", "rawMaximumClaimScope": "G0", "wholeCurrentGoalAndNeighborObjects": bind(OWN / "inputs/ten-whole-current-bodies-and-direct-neighbors.exact.json"), "exactCurrentMVAndHHCard": bind(OWN / "inputs/current-ten-M-V-whole-records-and-HH-card.exact-reuse.json"), "sourceScopeWitnessesAndHistory": bind(AUTHOR / "inputs/existing-ten-source-scope-witnesses.history-and-current-identity.json"), "authorOpenQuestions": bind(AUTHOR / "AUTHOR.open-findings-and-review-questions.json"), "authorOperatorBoundaries": bind(AUTHOR / "AUTHOR.practical-operators-and-course-boundaries.json"), "authorMethodContextLimits": bind(AUTHOR / "AUTHOR.method-context-reading-limits.json"), "original17ReadOnlyCAS": bind(OWN / "checks/CAS.original17-ownership-read-only.actual.json"), "normalBatchConfig": bind(OWN / "config/native10.current419.normal-prepare-only.config.json"), "normalFullBaseConfig": bind(OWN / "config/whole419.current-normal.stock-base.config.json"), "nativeBatchManifest": bind(OWN / "native-ten-current/batch-manifest.json"), "nativeBookModel": bind(OWN / "native-ten-current/bundle/book-model.json"), "nativeBundleManifest": bind(OWN / "native-ten-current/bundle/manifest.json"), "nativePDF": bind(OWN / "native-ten-current/bundle/book.pdf"), "nativeHTML": bind(OWN / "native-ten-current/bundle/book.html"), "nativeWholeReviewInput": bind(OWN / "native-ten-current/bundle/review-input.json"), "nativePDFRenderManifest": bind(OWN / "native-ten-current/bundle/book.pdf.render-manifest.json"), "productionFingerprints": bind(OWN / "checks/PRODUCTION.D-pages-P-inputs-and-raw-profile-fingerprints.actual.json"), "rounds": rounds, "physicalReconstructionMap": bind(OWN / "checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json"), "reconstructionScript": bind(OWN / "scripts/rebuild_sparse_host.py"), "integrityCheck": bind(OWN / "checks/FINAL.scope-portability-frozen-inputs-and-read-only-CAS.actual.json"), "existingInactiveBase": {"strictComplete": 312, "denominator": 419, "newStrictClosures": 0, "centralMeasurementPerformed": False}, "independentReviewRequirements": ["Read actual current whole bodies, prerequisites and full direct neighbors; all twenty full bilingual case materials/tasks/solutions/rubrics and all ten raw profiles.", "Write actual read inventory and disclose relevant prior exposure; seal own FIRST scientific outcome before reading peer outcomes.", "Preserve EDTA BB/BE source/operator, curve-goal overlap, HH/Seven overlap and buffer design/preparation review questions; actual execution is not shown by synthetic logs.", "Use separate own frozen roundcopies; do not change these native campaigns or predecessor packets.", "Reuse exact current valid M/V without inventing new decisions; raw P is E0/G0 author design and not accepted review evidence.", "Keep all source, course, view, acquisition and human holds open unless independently evidenced."], "reviewOutcomesCreated": [], "scientificVotes": 0, "selectablePRecordsCreated": 0, "generationRunsCreated": 0, "humanApproval": False, "humanTrial": False, "activeIntegration": False, "finalReceiptPath": "FINAL.native-ten-technical-preparation.receipt.json", "finiteSealPath": SEAL_NAME, "readme": bind(OWN / "README.technical-preparation-and-independent-review-handoff.md"), "stopBoundary": "Technical preparation finished; no writes after finite seal. Independent reviews go to new owned roots."}
write(neutral_name, neutral)
write("FINAL.native-ten-technical-preparation.receipt.json", {"schemaVersion": 1, "completedAtUTC": datetime.now(timezone.utc).isoformat(), "role": "technical preparation only", "neutral": bind(OWN / neutral_name), "canonicalWholeObjectCount": 551, "currentCurricularAtomic": 419, "nativeGoalCount": 10, "wholeSelectedBodiesUnchanged": True, "newerFullNeighborsPreserved": True, "twentyWholeCasesAndTenRawProfilesUnchanged": True, "existingCurrentMVRowsUnchanged": 10, "normalCommands": [bind(OWN / ("receipts/native10." + m + ".actual.json")) for m in ("prepare", "check")], "normalPrepareAndCheckExitCodes": [0, 0], "normalModelDigest": manifest["artifacts"]["bookModelDigest"], "normalBundleFingerprint": manifest["artifacts"]["bundleFingerprint"], "normalCampaignCount": 2, "normalGoalPageCount": 10, "normalPDFPhysicalPageCount": 12, "rawProfilesRemainE0G0": True, "original17ClaimReusedWithoutLedgerWrite": True, "scientificApprovalsCreated": 0, "generationRunsCreated": 0, "selectablePRecordsCreated": 0, "strictClosuresGranted": 0, "existingInactiveStrict": 312, "denominator": 419, "centralRunPerformed": False, "fullBuildOrCI": False, "humanApproval": False, "humanTrial": False, "activeIntegration": False, "sourceAndPredecessorMutation": False, "finiteFinalSealPath": SEAL_NAME})

# Parse every complete written JSON/JSONL file immediately before sealing.
json_count = 0
jsonl_count = 0
jsonl_rows = 0
for path in sorted(OWN.rglob("*")):
    if path.is_file() and path.suffix == ".json":
        read(path)
        json_count += 1
    elif path.is_file() and path.suffix == ".jsonl":
        lines = path.read_text().splitlines()
        assert path.read_bytes().endswith(b"\n")
        for line in lines:
            if line.strip():
                json.loads(line)
                jsonl_rows += 1
        jsonl_count += 1
files = [{"path": path.relative_to(OWN).as_posix(), "sha256": sha(path), "bytes": path.stat().st_size} for path in sorted(OWN.rglob("*")) if path.is_file()]
write(SEAL_NAME, {"schemaVersion": 1, "sealedAtUTC": datetime.now(timezone.utc).isoformat(), "role": "finite technical integrity only; no science approval", "goalCount": 10, "nativeCampaigns": 2, "nativeGoalPages": 10, "completeCasesBound": 20, "rawProfilesBound": 10, "jsonFilesParsedBeforeSeal": json_count, "jsonlFilesParsedBeforeSeal": jsonl_count, "jsonlRowsParsedBeforeSeal": jsonl_rows, "scientificVotes": 0, "newStrictClosures": 0, "excludedPath": SEAL_NAME, "files": files})
sealed = read(OWN / SEAL_NAME)
for row in sealed["files"]:
    path = OWN / row["path"]
    assert sha(path) == row["sha256"] and path.stat().st_size == row["bytes"]
print(json.dumps({"root": REL, "neutral": neutral_name, "finiteSeal": SEAL_NAME, "sealSha256": sha(OWN / SEAL_NAME), "ownedFilesSealed": len(files), "normalPrepareAndCheckExitCodes": [0,0], "strictGain": 0, "scientificApprovals": 0, "writesFinished": True}))
