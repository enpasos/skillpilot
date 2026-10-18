"""Import six existing actual V decisions and retain exact superseded Chemistry assets."""
from pathlib import Path
import collections
import copy
import datetime
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
O = Path(__file__).resolve().parent
N = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17")
QA = Path("curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json")
MANIFEST = Path("scripts/config/historical-goal-visualization-assets.json")
CANONICAL = Path("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json")
SELECTOR = N / "chemie-current442-V114-portable-exact-asset-input-selection-technical-20261017-v1/V114.source-and-independent-review-input-selection.json"
CONTEXT = O / "V2.retained-images-current-whole-context.actual-visual-review.root.json"
ROOTS = [Path("curricula/DE/Gymnasium/visualizations"), Path("app/public/assets/goal-visualizations"), Path("backend/src/main/resources/static/assets/goal-visualizations")]
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
AI_FIELDS = {"aiApproved", "aiApprovedAssetSha256", "aiReviewedAt", "aiReviewer", "aiNotes"}


def pin(path):
    path = Path(path)
    b = path.read_bytes()
    label = str(path.relative_to(ROOT)) if path.is_absolute() and path.is_relative_to(ROOT) else str(path)
    return {"path": label, "sha256": hashlib.sha256(b).hexdigest(), "bytes": len(b)}


def read(path):
    return json.loads(Path(path).read_text())


def ptr(value, address):
    for part in address.split("/")[1:]:
        part = part.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def object_sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def verified_ref(ref):
    actual = pin(ref["path"])
    assert actual["sha256"] == ref["sha256"].removeprefix("sha256:"), ref
    if "bytes" in ref:
        assert actual["bytes"] == ref["bytes"], ref
    return ptr(read(ref["path"]), ref.get("jsonPointer", ref.get("pointer", "")))


def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def prose(value):
    if isinstance(value, list):
        return " ".join(prose(x) for x in value)
    return " ".join(str(value).split())


assert ROOT.name == "skillpilot", ROOT
assert pin(QA)["sha256"] == "141c922907e22ffe2fed33b67d720d1b054d00e6ce4c1d94212f61504b3851a3"
assert pin(MANIFEST)["sha256"] == "6e468d87f8f389f36fe9a980381a77fb302845ba37b3264599df21ac4dc793f6"
assert pin(CANONICAL)["sha256"] == "cb3c432cc7b6875b55d8ea58acceb0048cdda7a532441dc122abb09a4b51c056"
assert pin(SELECTOR)["sha256"] == "a4cc2e8f0e416c58ffa2bf8af22c4a6b41c9d3f1f5fb93757b5ae9a599b6f87a"
assert pin(CONTEXT)["sha256"] == "23a3743c780923dfaa9088a85e9c91bf94d5f0d536dee15c1aa4807df72d0d5f"
before_qa_bytes = QA.read_bytes()
before_manifest_bytes = MANIFEST.read_bytes()
before_qa = read(QA)
qa = copy.deepcopy(before_qa)
by_id = {r["goalId"]: r for r in qa["records"]}
goals = {g["id"]: g for g in read(CANONICAL)["goals"]}
selected_profiles = {r["goalId"]: r["profile"] for r in map(json.loads, (O / "P442-plan/P442.actual-selected-whole-profile-writer-input.jsonl").read_text().splitlines())}
selector = read(SELECTOR)
four = [r for r in selector["records"] if r["acceptedV"]["kind"] == "separately-sealed-current-independent-V-FIRST"]
assert {r["goalId"] for r in four} == {"8721d943-8368-5304-bd3c-7d7944099662", "31cce65a-480a-5111-ab3c-da2feb3d4065", "abfa609d-9764-5bd8-999c-1d10a7eeac78", "04ebfc99-dbac-539e-95db-642addcaca8c"}
updates = []
for chosen in four:
    gid = chosen["goalId"]
    accepted = chosen["acceptedV"]
    first = verified_ref(accepted["first"])
    assert object_sha(first) == accepted["first"]["objectSha256"]
    assert ptr(first, accepted["decisionPointer"]) == "KEEP"
    asset = ptr(first, accepted["exactAssetPointer"])
    digest = accepted["acceptedDigest"]
    assert asset["sha256"].removeprefix("sha256:") == digest == chosen["selectedPNG"]["sha256"]
    row = by_id[gid]
    assert row["assetSha256"] == "sha256:" + digest and row["imageUrl"] == chosen["imageUrl"]
    assert pin(chosen["selectedPNG"]["path"])["sha256"] == digest
    path = chosen["imageUrl"].removeprefix("/assets/goal-visualizations/")
    assert all(pin(root / path)["sha256"] == digest for root in ROOTS)
    if "goalAndProfileBinding" in first:
        reviewed_goal = first["goalAndProfileBinding"]["goalExact"]
        assert object_sha(selected_profiles[gid]) == first["goalAndProfileBinding"]["profileObjectSha256"]
    elif gid.startswith("8721"):
        reviewed_goal = verified_ref(first["inputBindings"]["wholeGoal"])
        assert verified_ref(first["inputBindings"]["wholeProfile"]) == selected_profiles[gid]
    else:
        reviewed_goal = verified_ref(first["inputBindings"]["wholeFrozenGoal"])
        assert verified_ref(first["inputBindings"]["wholeFrozenProfile"]) == selected_profiles[gid]
    assert all(reviewed_goal[k] == goals[gid][k] for k in ("title", "titleEn", "description", "descriptionEn"))
    if gid.startswith("8721"):
        summary = " ".join(f"{x['aspect']}: {x['imageEvidence']} {x['boundary']}" for x in first["scientificContextChecks"])
    elif gid.startswith("04eb"):
        summary = prose(first["observationsDe"]) + " " + prose(first["keepLimits"])
    else:
        summary = first["summaryDe"]
    row.update({"aiApproved": "yes", "aiApprovedAssetSha256": "sha256:" + digest, "aiReviewedAt": first.get("reviewedAt", first.get("atUTC")), "aiReviewer": first["reviewer"], "aiNotes": prose(f"Existing genuine independent actual-image KEEP: {accepted['first']['path']} sha256:{accepted['first']['sha256']}. {summary} Exact asset and unchanged current DE/EN goal text and whole P verified in this technical integration. This imports machine V evidence only; no new visual review, learner performance, D/P completion, M7 or human approval by the integrator.")})
    updates.append({"goalId": gid, "kind": "four-current-genuine-independent-KEEP", "source": accepted, "currentTextAndWholePMatchReviewedBody": True, "threeNormalAssetCopiesVerified": True, "humanFieldsTransferredFromDifferentAsset": False})

context = read(CONTEXT)
assert len(context["records"]) == 2
for current in context["records"]:
    gid = current["goalId"]
    assert current["decision"] == "KEEP_CURRENT_ACTUAL_IMAGE" and current["actualNativeAssetOpened"] and current["actualDesktopAndMobileScreenshotOpened"]
    assert not current["blockingFindings"] and not current["humanApproval"]
    assert verified_ref(current["currentWholeGoal"]) == goals[gid]
    assert verified_ref(current["currentWholeProfile"]) == selected_profiles[gid]
    row = by_id[gid]
    digest = current["image"]["sha256"]
    assert pin(current["image"]["path"])["sha256"] == digest
    assert row["assetSha256"] == "sha256:" + digest == row["aiApprovedAssetSha256"]
    path = row["imageUrl"].removeprefix("/assets/goal-visualizations/")
    assert all(pin(root / path)["sha256"] == digest for root in ROOTS)
    old_notes = row["aiNotes"]
    text = f"Targeted informed actual current whole-goal/P context KEEP at {context['reviewedAtUTC']} by {context['reviewer']}; source {pin(CONTEXT)['path']} sha256:{pin(CONTEXT)['sha256']}. {current['visibleScienceDe']} {current['currentExtensionCompatibilityDe']} {current['mobileDesktopDe']} {prose(current['limitsDe'])} The source reviewer actually inspected native/680/360; the technical integrator grants no new science, mastery or human approval."
    row.update({"aiApproved": "yes", "aiApprovedAssetSha256": "sha256:" + digest, "aiReviewedAt": context["reviewedAtUTC"], "aiReviewer": context["reviewer"], "aiNotes": prose(old_notes + " " + text)})
    updates.append({"goalId": gid, "kind": "two-genuine-root-actual-current-context-KEEP", "source": dict(pin(CONTEXT), jsonPointer=f"/records/{context['records'].index(current)}"), "currentTextAndWholePMatchReviewedBody": True, "threeNormalAssetCopiesVerified": True, "historicalIndependentAiNotesRetained": True, "humanFieldsTransferredFromDifferentAsset": False})

changed_ids = {x["goalId"] for x in updates}
assert len(changed_ids) == 6
for old, new in zip(before_qa["records"], qa["records"]):
    assert old["goalId"] == new["goalId"]
    delta = {k for k in old.keys() | new.keys() if old.get(k) != new.get(k)}
    if old["goalId"] in changed_ids:
        assert delta and delta <= AI_FIELDS, (old["goalId"], delta)
    else:
        assert old == new
    assert {k: v for k, v in old.items() if k.startswith("human")} == {k: v for k, v in new.items() if k.startswith("human")}

# Retain only exact Chemistry JPGs with a concrete supersession/retirement.
before_manifest = read(MANIFEST)
manifest = copy.deepcopy(before_manifest)
expected = set()
all_goals = {}
for path in Path("curricula/DE/Gymnasium/canonical").glob("*.json"):
    for goal in read(path).get("goals", []):
        all_goals[goal["id"]] = goal
        for link in goal.get("resourceLinks", []):
            if link.get("type") == "goal-visualization" or link.get("resourceType") == "goal-visualization":
                expected.add(link["url"].removeprefix("/assets/goal-visualizations/"))
old_historical = {r["path"] for r in manifest["assets"]}
source_rasters = {str(p.relative_to(ROOTS[0])) for p in (ROOTS[0] / "chemie").rglob("*") if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}}
additions = []
for path in sorted(source_rasters - expected - old_historical):
    assert path.startswith("chemie/") and path.endswith(".jpg"), path
    gid = path.split("/")[1]
    goal = all_goals.get(gid)
    links = [r["url"] for r in goal.get("resourceLinks", []) if r.get("type") == "goal-visualization"] if goal else []
    if goal and len(links) == 1 and links[0].endswith(".png"):
        reason = "superseded JPG; same current canonical goal has exact PNG primary"
    elif goal and goal.get("type") == "cluster" and goal.get("extendedData", {}).get("provenance", {}).get("retainedFormerAtomicId") is True and not links:
        reason = "retained former atomic ID is now a cluster with no current primary visualization"
    else:
        assert gid == "413c5ee5-7826-549f-ad76-63743c59b188" and goal is None
        reason = "retired413 goal absent from current canonical; old exact JPG retained"
    hashes = [pin(root / path)["sha256"] for root in ROOTS]
    assert len(set(hashes)) == 1
    additions.append({"path": path, "sha256": hashes[0], "reason": reason, "currentGoalId": gid if goal else None, "currentPrimaryURLs": links, "normalCopies": [pin(root / path) for root in ROOTS], "notAnyCurrentPrimaryReference": path not in expected})
assert len(additions) == 46
assert collections.Counter(r["reason"] for r in additions) == {"superseded JPG; same current canonical goal has exact PNG primary": 40, "retained former atomic ID is now a cluster with no current primary visualization": 5, "retired413 goal absent from current canonical; old exact JPG retained": 1}
manifest["reason"] = "Former primary visualization URLs after image replacement or goal restructuring; retain their exact bytes without treating them as active primary images."
manifest["assets"].extend({"path": r["path"], "sha256": r["sha256"]} for r in additions)
assert manifest["assets"][:len(before_manifest["assets"])] == before_manifest["assets"]

history = O / "history"
history.mkdir(exist_ok=True)
qa_backup = history / "chemie.qa.generated-C653-before-six-V.141c9229.exact.json.snapshot"
manifest_backup = history / "historical-goal-visualization-assets.before-Chemistry46.6e468d87.exact.json.snapshot"
assert not qa_backup.exists() and not manifest_backup.exists()
qa_backup.write_bytes(before_qa_bytes)
manifest_backup.write_bytes(before_manifest_bytes)
assert pin(QA)["sha256"] == "141c922907e22ffe2fed33b67d720d1b054d00e6ce4c1d94212f61504b3851a3"
assert pin(MANIFEST)["sha256"] == "6e468d87f8f389f36fe9a980381a77fb302845ba37b3264599df21ac4dc793f6"
write(QA, qa)
write(MANIFEST, manifest)
ai_current = lambda r: r.get("aiApproved") == "yes" and r.get("aiApprovedAssetSha256") == r.get("assetSha256")
write(O / "V6.normal-QA.exact-before-after-and-source-bindings.receipt.json", {"artifactType": "Actual normal technical import of six existing genuine machine V judgments", "createdAtUTC": NOW, "before": pin(qa_backup), "after": pin(QA), "V114Selector": pin(SELECTOR), "rootTwoActualContextReview": pin(CONTEXT), "normalCanonicalUnchanged": pin(CANONICAL), "updates": updates, "counts": {"wholeQARows": len(qa["records"]), "AIApprovedBefore": sum(ai_current(r) for r in before_qa["records"]), "AIApprovedAfter": sum(ai_current(r) for r in qa["records"]), "newExactAssetAIApprovals": 4, "existingSameAssetCurrentContextUpdates": 2, "allOtherRowsWholeExact": len(qa["records"]) - 6, "allHumanBlocksWholeExact": len(qa["records"])}, "onlyAiReviewFieldsChanged": True, "noDifferentAssetHumanApprovalTransfer": True, "newScienceByIntegrator": False, "Canonical_P_M_views_registryChangedByThisScript": False, "HumanApprovalGranted": False, "HumanTrial": False, "M7Claim": False})
write(O / "HISTORICAL46.exact-before-after-retained-assets.receipt.json", {"artifactType": "Actual exact Chemistry-only historical primary asset retention", "createdAtUTC": NOW, "before": pin(manifest_backup), "after": pin(MANIFEST), "oldRowsWholeExact": True, "oldCount": len(before_manifest["assets"]), "addedCount": len(additions), "newCount": len(manifest["assets"]), "classificationCounts": dict(collections.Counter(r["reason"] for r in additions)), "additions": additions, "noCurrentReferenceAllowedAsHistorical": True, "allThreeCopiesExact": True, "unrelatedAllowlistAdded": False, "assetBytesChangedOrDeleted": False})
print(json.dumps({"QA": pin(QA), "manifest": pin(MANIFEST), "QARows": len(qa["records"]), "currentAIApproved": sum(ai_current(r) for r in qa["records"]), "historicalAdditions": len(additions), "historicalTotal": len(manifest["assets"])}, indent=2))
