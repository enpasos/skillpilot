"""Inert AUTHOR preparation; scientific reasons are adopted from Root/B receipts.

Unmodified production CLIs compute their own fingerprints and validate candidate
records. No private fingerprint formula or alternative checker is implemented.
"""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import tempfile

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
OWN_REL = OWN.relative_to(REPO).as_posix()
BASE = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/"
V6 = BASE + "chemie-current-aromatic-delocalization-final-native-author-v6/"
ROOT_RATIONALE = BASE + "chemie-current-fifteen-reviewed-integration-preparation-v1/four-targeted-substantive-atomicity-and-memory-decisions.root-candidate.json"
CARD_AUTHOR = BASE + "chemie-current-one-formula-card-targeted-author-v1/"
CARD_B = BASE + "chemie-current-one-formula-card-independent-b-v1/"
REGISTRY = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    return json.loads((REPO / path).read_text())


def digest_bytes(data):
    return "sha256:" + hashlib.sha256(data).hexdigest()


def bind(path):
    data = (REPO / path).read_bytes()
    return {"path": path, "sha256": digest_bytes(data), "bytes": len(data)}


def write(name, data):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return OWN_REL + "/" + name


def verify_freeze(path, expected=None):
    if expected:
        assert bind(path)["sha256"] == "sha256:" + expected, path
    data = read(path)
    for row in data["files"]:
        actual = bind(row["path"])
        assert actual["sha256"] == row["sha256"] and actual["bytes"] == row["bytes"], row["path"]
    return {"freeze": bind(path), "ownFileCount": len(data["files"]), "allOwnOutputsExact": True}


def lines(path):
    return (REPO / path).read_bytes().splitlines(keepends=True)


def candidates(original, changed_ids, rationale, kind):
    rows = []
    for line in lines(original):
        row = json.loads(line)
        if row["goalId"] in changed_ids:
            reason = rationale[row["goalId"]]
            row["reviewedAt"] = "2026-10-06"
            row["reviewer"] = "codex-root-substantive-targeted-chemistry-a-m"
            row["reason"] = (reason["independentReason"] if kind == "A" else reason["memoryReason"]) + " Tatsächliche substantielle Root-Entscheidung: " + ROOT_RATIONALE + "; exakt aktueller v6-Zieleingang. AUTHOR übernimmt diese Entscheidung und berechnet die native Bindung; keine zusätzliche unabhängige Fachprüfung durch die technische Vorbereitung."
            if kind == "A":
                assert row["status"] == reason["semanticAtomicityDecision"] == "atomic"
                assert row["semanticAtomic"] is True and reason["semanticAtomic"] is True
                assert row.get("suggestedSplit", []) == reason["suggestedSplit"] == []
            else:
                assert row["status"] == reason["memoryDecision"]
                if row["status"] == "memory_required":
                    assert row["memoryGoalIds"] == ["e3e8582a-976b-5f0f-b31b-3cf59a4fff24"]
                    assert row["deckIds"] == ["de_gymnasium_chemistry_organic_q1"]
            rows.append(json.dumps(row, ensure_ascii=False, separators=(",", ":")).encode() + b"\n")
        else:
            rows.append(line)
    return b"".join(rows)


assert REPO.name == "skillpilot", REPO
registry = read(REGISTRY)
chem = next(s for s in registry["subjects"] if s["subject"] == "chemie")
decision = read(ROOT_RATIONALE)
rationale = {r["goalId"]: r for r in decision["rows"]}
target_ids = set(rationale)
assert len(target_ids) == 4
native_goal_path = V6 + "prospective-current378.canonical.author-candidate.json"
canonical = read(native_goal_path)
goal_by_id = {g["id"]: g for g in canonical["goals"]}
assert len(goal_by_id) == 479
b8 = goal_by_id["b8d3b453-d638-5518-aab0-d84ec2e8567c"]
assert b8["description"] == "Die lernende Person kann die Reaktivität aromatischer Systeme anhand ihrer Elektronendelokalisierung begründen."
assert b8["descriptionEn"] == "The learner can explain the reactivity of aromatic systems in terms of their electron delocalization."
assert b8["tags"] == ["LK"] and b8["contains"] == []

frozen_proof = [verify_freeze(V6 + "final-aromatic-native-author-v6.final.freeze.json", "4416b557cfd9c17444e380514f4743336e0cc5de3ad7191f6fae8781788aee79")]
frozen_proof.append(verify_freeze(CARD_AUTHOR + "formula-card-author-candidate.final.freeze.json", "493d1e3f4dce9f6098c55fdecc45d9611a39baaec274f1a13f6e7ae5045b4684"))
frozen_proof.append(verify_freeze(CARD_B + "independent-formula-card-b.final.freeze.json"))
assert read(CARD_B + "one-formula-card.actual-independent-b.review.json")["decision"] == "KEEP"
card_deck = read(CARD_AUTHOR + "organic-q1-deck.one-card.author-candidate.json")
old_deck_path = "app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json"
old_deck = read(old_deck_path)
assert (REPO / old_deck_path).read_bytes() == (REPO / "curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_organic_q1.de.json").read_bytes()
card_deltas = []
for old, new in zip(old_deck["cards"], card_deck["cards"], strict=True):
    for field in set(old) | set(new):
        if old.get(field) != new.get(field):
            card_deltas.append({"cardId": old["id"], "field": field, "before": old.get(field), "after": new.get(field)})
assert [(r["cardId"], r["field"]) for r in card_deltas] == [("chem_org_q1_001", "back")]
deck_path = write("organic-q1-deck.one-reviewed-card.author-candidate.json", card_deck)

atomic_configs = []
active_inputs = {REGISTRY, chem["landscapePath"], chem["semanticKindLedgerPath"], chem["visualizationQaPath"], chem["memoryReviewConfigPath"], ROOT_RATIONALE, native_goal_path, "AGENTS.md", "docs/concept/skill-graph/atomic-goal-visualizations.md", "app/scripts/semanticAtomicityReview.ts", "app/scripts/memoryCardReview.ts", "app/src/landscapeTypes.ts", old_deck_path, "curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_organic_q1.de.json"}
record_inputs = []
for path in chem["semanticAtomicityConfigPaths"]:
    config = read(path)
    scoped_targets = target_ids & {json.loads(line)["goalId"] for line in lines(config["reviewPath"])}
    if not scoped_targets:
        continue
    active_inputs.update([path, config["reviewPath"]])
    name = config["reviewId"]
    before_name = "before/" + name + ".review.jsonl"
    (OWN / before_name).parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REPO / config["reviewPath"], OWN / before_name)
    review_name = "atomicity/" + name + ".review.jsonl"
    (OWN / review_name).parent.mkdir(parents=True, exist_ok=True)
    (OWN / review_name).write_bytes(candidates(config["reviewPath"], scoped_targets, rationale, "A"))
    candidate_config = {**config, "landscapePath": native_goal_path, "reviewPath": OWN_REL + "/" + review_name}
    config_path = write("atomicity/" + name + ".config.json", candidate_config)
    future_config_path = write("future-active-configs/" + name + ".config.json", {**candidate_config, "landscapePath": chem["landscapePath"]})
    atomic_configs.append({"originalConfigPath": path, "configPath": config_path, "futureActiveConfigPath": future_config_path, "originalReviewPath": config["reviewPath"], "candidateReviewPath": candidate_config["reviewPath"], "changedGoalIds": sorted(scoped_targets), "beforePath": OWN_REL + "/" + before_name})
    record_inputs.append(atomic_configs[-1])
assert len(atomic_configs) == 3 and set().union(*(set(r["changedGoalIds"]) for r in atomic_configs)) == target_ids

m = read(chem["memoryReviewConfigPath"])
active_inputs.update([m["reviewPath"], m["cardReviewPath"]])
for field in ["reviewPath", "cardReviewPath"]:
    shutil.copyfile(REPO / m[field], OWN / "before" / Path(m[field]).name)
memory_review_path = OWN_REL + "/memory/current378-memory.review.jsonl"
memory_card_path = OWN_REL + "/memory/current55-cards.review.jsonl"
(OWN / "memory").mkdir()
(REPO / memory_review_path).write_bytes(candidates(m["reviewPath"], target_ids, rationale, "M"))
card_lines = []
for line in lines(m["cardReviewPath"]):
    row = json.loads(line)
    if row["deckId"] == card_deck["deckId"] and row["cardId"] == "chem_org_q1_001":
        row["reviewedAt"] = "2026-10-06"
        row["reviewer"] = "codex-root-adopted-independent-b-formula-card"
        row["reason"] = "Bestehende notwendige kompakte Reihen-/Formelkarte behalten; nur belegte Überbreite mindestens eine Mehrfachbindung korrigiert. Die Antwort begrenzt CnH2n bzw. CnH2n-2 auf neutrale acyclische Kohlenwasserstoffe mit genau einer Doppel- bzw. Dreifachbindung und sonst Einfachbindungen. Root/IUPAC-Grundlage sowie tatsächliches unabhängiges KEEP: " + CARD_B + "one-formula-card.actual-independent-b.review.json. Technische AUTHOR-Vorbereitung bindet diese fachlich geprüfte Antwort nativ; keine neue unabhängige fachliche Kartenfreigabe durch Fingerprint-Berechnung."
        card_lines.append(json.dumps(row, ensure_ascii=False, separators=(",", ":")).encode() + b"\n")
    else:
        card_lines.append(line)
(REPO / memory_card_path).write_bytes(b"".join(card_lines))
memory_config = {**m, "landscapePath": native_goal_path, "reviewPath": memory_review_path, "cardReviewPath": memory_card_path, "reportPath": OWN_REL + "/memory/current378-memory.native-report.md"}
memory_config_path = write("memory/current378-memory.config.json", memory_config)
future_memory_config_path = write("future-active-configs/current378-memory.config.json", {**memory_config, "landscapePath": chem["landscapePath"], "reportPath": OWN_REL + "/memory/current378-memory.future-active-native-report.md"})
record_inputs.append({"originalReviewPath": m["reviewPath"], "candidateReviewPath": memory_review_path, "changedGoalIds": sorted(target_ids), "beforePath": OWN_REL + "/before/" + Path(m["reviewPath"]).name})
active_inputs.update(v["viewPath"] for v in m["visibilityScopes"])

isolated = Path(tempfile.mkdtemp(prefix="skillpilot-chemie-current-four-am-"))
def isolate_copy(source, dest):
    path = isolated / dest
    path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REPO / source, path)
    return path
def isolate_link(source, dest):
    path = isolated / dest
    path.parent.mkdir(parents=True, exist_ok=True)
    path.symlink_to(os.path.relpath(REPO / source, path.parent))
for helper in ["semanticAtomicityReview.ts", "memoryCardReview.ts"]:
    isolate_copy("app/scripts/" + helper, "app/scripts/" + helper)
isolate_link("app/node_modules", "app/node_modules")
isolate_link("app/src", "app/src")
isolate_link("curricula/DE/Gymnasium/quality/goal-evidence", "curricula/DE/Gymnasium/quality/goal-evidence")
isolate_copy(native_goal_path, chem["landscapePath"])
future_kind = read(V6 + "prospective-current378.semantic-kinds.author-input.json")
future_kind["sourceLandscapePath"] = chem["landscapePath"]
future_kind_path = write("future-active-configs/current378-semantic-kinds.only-source-path.author-input.json", future_kind)
isolate_copy(future_kind_path, chem["semanticKindLedgerPath"])
isolate_copy(V6 + "prospective-current378.visualization-qa.inert-author-input.json", chem["visualizationQaPath"])
for scope in m["visibilityScopes"]:
    isolate_copy(scope["viewPath"], scope["viewPath"])
deck_inputs = []
for g in goal_by_id.values():
    if g.get("nodeKind") != "memory":
        continue
    for key in ["vocabularySource", "vocabularySourceEn"]:
        source = g.get("extendedData", {}).get(key)
        if not source:
            continue
        path = "app/public" + source if source.startswith("/data/") else source
        active_inputs.add(path)
        chosen = deck_path if path == old_deck_path else path
        isolate_copy(chosen, path)
        deck_inputs.append({"memoryGoalId": g["id"], "sourceField": key, "sourcePath": path, "candidateInputPath": chosen, "actualInput": bind(chosen), "candidateDeck": path == old_deck_path})
image_inputs = []
for id in ["b8d3b453-d638-5518-aab0-d84ec2e8567c", "973c12d9-d863-5292-8c68-9c80cdacf9e2", "363c5740-8a3c-50b8-8c3a-5548c80c36ea"]:
    url = next(r["url"] for r in goal_by_id[id]["resourceLinks"] if r["type"] == "goal-visualization")
    source = {
        "b8d3b453-d638-5518-aab0-d84ec2e8567c": BASE + "chemie-current-atomic-description-positive-gap-author-v2/visual-candidates/b8/attempt-01.png",
        "973c12d9-d863-5292-8c68-9c80cdacf9e2": BASE + "chemie-current-atomic-description-positive-gap-author-v2/visual-candidates/carbonyl/attempt-01.png",
        "363c5740-8a3c-50b8-8c3a-5548c80c36ea": BASE + "chemie-current-coordinate-bond-visual-correction-author-v4/visual-candidate/attempt-02.png",
    }[id]
    isolate_copy(source, "app/public" + url)
    image_inputs.append({"goalId": id, "url": url, "actualCandidateImage": bind(source), "noGenerationOrVisualReReview": True})
active_bindings_before = [bind(p) for p in sorted(active_inputs)]

commands = []
def cli(helper, config, args, log_name):
    command = [str(REPO / "app/node_modules/.bin/tsx"), str(isolated / "app/scripts" / helper), "--config=" + config, *args]
    result = subprocess.run(command, cwd=isolated / "app", text=True, capture_output=True)
    (OWN / log_name).parent.mkdir(parents=True, exist_ok=True)
    (OWN / log_name).write_text(result.stdout + result.stderr)
    commands.append({"argv": command, "cwd": str(isolated / "app"), "exitCode": result.returncode, "actualOutputPath": OWN_REL + "/" + log_name, "unmodifiedProductionHelper": bind("app/scripts/" + helper)})
    assert result.returncode == 0, result.stdout + result.stderr
    return result.stdout
for i, a in enumerate(atomic_configs):
    cli("semanticAtomicityReview.ts", a["configPath"], ["--write-fingerprints"], f"native-cli/atomicity-{i+1}.write-fingerprints.actual.txt")
cli("memoryCardReview.ts", memory_config_path, ["--write-fingerprints"], "native-cli/memory.write-fingerprints.actual.txt")

reuse_rows = []
for info in record_inputs:
    original = lines(info["originalReviewPath"])
    candidate = lines(info["candidateReviewPath"])
    assert len(original) == len(candidate)
    targets = set(info["changedGoalIds"])
    final_lines, changes = [], []
    for old_line, new_line in zip(original, candidate, strict=True):
        old, new = json.loads(old_line), json.loads(new_line)
        assert old["goalId"] == new["goalId"]
        if old["goalId"] in targets:
            assert old["fingerprint"] != new["fingerprint"]
            assert old["status"] == new["status"]
            final_lines.append(new_line)
            changes.append({"goalId": old["goalId"], "before": old, "after": new, "nativeFingerprintChanged": True, "substantiveReasonSource": bind(ROOT_RATIONALE)})
        else:
            assert old == new, old["goalId"]
            final_lines.append(old_line)
    (REPO / info["candidateReviewPath"]).write_bytes(b"".join(final_lines))
    reuse_rows.append({**info, "totalRows": len(original), "changedRows": changes, "unaffectedRowsByteExact": len(original) - len(targets)})
original_cards, new_cards = lines(m["cardReviewPath"]), lines(memory_card_path)
assert len(original_cards) == len(new_cards) == 55
final_cards, changed_cards = [], []
for old_line, new_line in zip(original_cards, new_cards, strict=True):
    old, new = json.loads(old_line), json.loads(new_line)
    if old["cardId"] == "chem_org_q1_001" and old["deckId"] == card_deck["deckId"]:
        assert old["fingerprint"] != new["fingerprint"]
        assert old["status"] == new["status"] == "kept" and old["originGoalIds"] == new["originGoalIds"]
        final_cards.append(new_line)
        changed_cards.append({"before": old, "after": new, "independentScientificReview": bind(CARD_B + "independent-formula-card-b.final.freeze.json")})
    else:
        assert old == new, old["cardId"]
        final_cards.append(old_line)
(REPO / memory_card_path).write_bytes(b"".join(final_cards))
for i, a in enumerate(atomic_configs):
    output = cli("semanticAtomicityReview.ts", a["configPath"], ["--mode=check"], f"native-cli/atomicity-{i+1}.check.actual.txt")
    assert "Missing review records: 0" in output and "Stale review records: 0" in output
output = cli("memoryCardReview.ts", memory_config_path, ["--mode=check", "--write-report"], "native-cli/memory.check-and-report.actual.txt")
for required in ["Ordinary atomic goals in scope: 378", "Missing review records: 0", "Stale review records: 0", "Missing card review records: 0", "Stale card review records: 0", "Composition visibility scopes: 3", "Memory-required goals without visible memory node: 0"]:
    assert required in output, required
for i, a in enumerate(atomic_configs):
    cli("semanticAtomicityReview.ts", a["futureActiveConfigPath"], ["--mode=check"], f"native-cli/atomicity-{i+1}.future-active-isolated.check.actual.txt")
future_output = cli("memoryCardReview.ts", future_memory_config_path, ["--mode=check", "--write-report"], "native-cli/memory.future-active-isolated.check-and-report.actual.txt")
assert "Ordinary atomic goals in scope: 378" in future_output and "Memory-required goals without visible memory node: 0" in future_output

active_guard = []
for before in active_bindings_before:
    after = bind(before["path"])
    if before["path"] == REGISTRY:
        assert next(s for s in read(REGISTRY)["subjects"] if s["subject"] == "chemie") == chem
        active_guard.append({"before": before, "after": after, "chemieRegistryRowExact": True, "otherSubjectRegistryMayProgressSeparately": True})
    else:
        assert after == before, before["path"]
        active_guard.append({**before, "activeInputUnchanged": True})

write("actual-native-a-m-cli.receipt.json", {"schemaVersion": 1, "documentType": "inert-author-native-cli-execution-receipt", "createdAtUTC": NOW, "role": "Unmodified production checks only; no independent science review added", "isolatedRootUsed": str(isolated), "commands": commands, "atomicityConfigCount": 3, "currentMemoryGoalCount": 378, "currentPrimaryCardCount": 55, "allCommandsPassed": True, "activeWrites": False})
write("exact-record-reuse-and-targeted-substantive-deltas.author.json", {"schemaVersion": 1, "documentType": "inert-author-native-record-reuse-and-substantive-adoption", "createdAtUTC": NOW, "goalRecordDeltas": reuse_rows, "cardRecordDeltas": changed_cards, "unaffectedCardRowsByteExact": 54, "actualDeckFieldDeltas": card_deltas, "other9WholeDeckCardsExact": True, "wholeB8V6GoalActuallyRead": b8, "substantiveRootRationale": bind(ROOT_RATIONALE), "technicalPreparerIsNotIndependentScientificReviewer": True, "nativeFingerprintModeRunAfterSubstantiveReasonAdoption": True, "noCurrentGateOrHumanStatusPromoted": True})
write("actual-inputs-and-active-no-write-guard.author.json", {"schemaVersion": 1, "documentType": "inert-author-current-inputs-and-no-write-guard", "createdAtUTC": NOW, "inputBindings": active_bindings_before, "nativeGoalInput": bind(native_goal_path), "deckInputs": deck_inputs, "actualCandidateImages": image_inputs, "immutableFreezeChecks": frozen_proof, "activeInputsAfterCheck": active_guard, "newIndependentTmpRoot": str(isolated), "priorV6TemporaryRootNotMutated": True, "activeWrites": False})
write("isolated-root.reproduction.author.json", {"schemaVersion": 1, "documentType": "temporary-native-author-root-reproduction", "isolatedRootUsed": str(isolated), "rootIsTemporaryNotCommitted": True, "repoRelativeReadOnlySymlinkTargets": ["app/node_modules", "app/src", "curricula/DE/Gymnasium/quality/goal-evidence"], "physicalCandidateInputs": [native_goal_path, future_kind_path, V6 + "prospective-current378.visualization-qa.inert-author-input.json", deck_path], "atomicityConfigPaths": [a["configPath"] for a in atomic_configs], "futureActiveAtomicityConfigPaths": [a["futureActiveConfigPath"] for a in atomic_configs], "memoryConfigPath": memory_config_path, "futureActiveMemoryConfigPath": future_memory_config_path, "futureActiveCanonicalPathExistsOnlyInTmpRoot": chem["landscapePath"], "futureActiveConfigsNotInCentralRegistry": True, "recordFingerprintComputation": "Exact unmodified production --write-fingerprints after adopting actually documented substantive reasons, followed by byte restoration of unaffected identical rows and complete --mode=check", "noAlternativeRuntimeOrFingerprintChecker": True})
print(json.dumps({"own": OWN_REL, "isolatedRoot": str(isolated), "atomicityPassCounts": [8, 15, 28], "memoryPass": 378, "cardsPass": 55, "strictNetGain": 0}))
