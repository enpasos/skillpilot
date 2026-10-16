#!/usr/bin/env python3
"""Finite technical selection and staging, never an independent science vote."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
E16 = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16")
OUT = E16 / "chemie-current437-paired-nine-five-gate-owner-integration-technical-20261016-v1"
OLD = E16 / "chemie-current435-five-supported-description-normal-H-and-native5-technical-20261016-v1"
PREP = E16 / "chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1"
A = E16 / "chemie-native9-current437-fresh-independent-a-20261016-v1"
B = E16 / "chemie-native9-current437-fresh-independent-b-20261016-v1"
H = ROOT / "tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1"
L = ROOT / "tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1"
CANONICAL = Path("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json")
KINDS = Path("curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json")
QA = Path("curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json")
MCFG = Path("curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json")
EXPECTED_L = "sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9"


def digest(path: Path) -> str:
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def read(path: Path):
    return json.loads(path.read_text())


def save(path: Path, data) -> None:
    assert not path.exists(), f"Refuse to overwrite previous evidence: {path}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def json_lines(path: Path):
    return [(json.loads(line), line) for line in path.read_text().splitlines(keepends=True) if line.strip()]


def exact_rows(path: Path, rows: list[str]) -> None:
    assert not path.exists(), f"Refuse to overwrite previous records: {path}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(rows))


def owned_parents(relative: Path) -> None:
    current = L
    for part in relative.parts[:-1]:
        current = current / part
        if current.is_symlink():
            original = current.resolve(strict=True)
            current.unlink()
            current.mkdir()
            for child in original.iterdir():
                (current / child.name).symlink_to(child)
        elif not current.exists():
            current.mkdir()
        assert current.is_dir() and not current.is_symlink()


def stage_exact(relative: Path, data: bytes) -> None:
    owned_parents(relative)
    target = L / relative
    if target.exists() and target.read_bytes() == data:
        return
    if target.exists() or target.is_symlink():
        target.unlink()  # Break hardlinks/file aliases before any write.
    target.write_bytes(data)


def stage_readonly_tree(relative: Path) -> None:
    for source in sorted((ROOT / relative).rglob("*")):
        if not source.is_file():
            continue
        rel = source.relative_to(ROOT)
        target = L / rel
        if target.exists():
            assert target.read_bytes() == source.read_bytes(), f"Historical L input differs: {rel}"
            continue
        owned_parents(rel)
        if target.is_symlink():
            target.unlink()
        target.symlink_to(source)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--actual-corrected-independent-card-records", required=True)
    args = parser.parse_args()
    os.chdir(ROOT)
    assert digest(L / CANONICAL) == EXPECTED_L, "Root canonical drift: stop before staging/report"
    assert not (ROOT / OUT / "MATERIALIZE.actual-reviewed-nine-L-only.json").exists()
    r_normal_pin, h_pin = digest(ROOT / CANONICAL), digest(H / CANONICAL)
    a_first = A / "FIRST.independent-current-nine-science-and-separate699.frozen.json"
    b_first = B / "science.first.independent-b.json"
    assert digest(ROOT / a_first) == "sha256:dbdbefe4b37fa1dc2d314b647d1a275d81715783a9c2b6c76ef17ce846d97d4a"
    assert digest(ROOT / b_first) == "sha256:70cc3fe9a98d1bd1738f00cf8183d51b37a865373b4ee3e14f3cf2b55b665fc3"
    base = read(ROOT / OLD / "central.current435.all435-paired-final-inputs.inactive.config.json")
    result = copy.deepcopy(base)
    subject = result["subjects"][0]
    result["reportId"] = "chemie-current437-all-paired-D437-P437-A437-M437-V437-inactive-machine-integration-20261016-v1"
    new_index = PREP / "native-nine/resolution-index.json"
    nine = read(ROOT / new_index)["batchGoalIds"]
    selected = set(nine)
    assert len(selected) == 9
    new_kinds = read(ROOT / PREP / "SEMANTIC639.descriptive-classification.for-review-only.json")
    ordinary = {x["goalId"] for x in new_kinds["decisions"] if x["semanticKind"] == "curricularAtomic"}
    assert len(ordinary) == 437 and selected <= ordinary
    old_kinds = read(H / KINDS)
    old_ordinary = {x["goalId"] for x in old_kinds["decisions"] if x["semanticKind"] == "curricularAtomic"}
    assert len(old_ordinary) == 435 and len(selected & old_ordinary) == 7
    assert ordinary - old_ordinary == selected - old_ordinary
    before_goals = {g["id"]: g for g in read(H / CANONICAL)["goals"]}
    after_goals = {g["id"]: g for g in read(L / CANONICAL)["goals"]}
    changed_old_ordinary = {i for i in old_ordinary if before_goals[i] != after_goals[i]}
    assert changed_old_ordinary == selected & old_ordinary
    preservation = {"A": [], "P": []}
    for gate, key, scope_key in [
        ("A", "semanticAtomicityConfigPaths", "leafGoalIds"),
        ("P", "positiveEvidenceConfigPaths", "goalIds"),
    ]:
        new_paths = []
        old_claims, retained_claims = [], []
        for position, config_path in enumerate(subject[key], start=1):
            config_path = Path(config_path)
            assert (H / config_path).read_bytes() == (L / config_path).read_bytes()
            config = read(H / config_path)
            ids = config["scope"][scope_key]
            assert len(ids) == len(set(ids))
            old_claims.extend(ids)
            keep = [goal_id for goal_id in ids if goal_id not in selected]
            retained_claims.extend(keep)
            previous_review_path = Path(config["reviewPath"])
            assert (H / previous_review_path).read_bytes() == (L / previous_review_path).read_bytes()
            row_pairs = json_lines(H / previous_review_path)
            assert {row["goalId"] for row, _ in row_pairs} == set(ids)
            if keep == ids:
                new_paths.append(str(config_path))
                preservation[gate].append({"configPath": str(config_path), "configSha256": digest(H / config_path), "reviewPath": str(previous_review_path), "reviewSha256": digest(H / previous_review_path), "selectedRows": len(ids), "wholeOriginalConfigAndRecordsRetained": True})
                continue
            filtered_config = OUT / f"config/{gate}-retained-{position:03d}.original-review-identity.config.json"
            filtered_records = OUT / f"records/{gate}-retained-{position:03d}.whole-exact-original-lines.jsonl"
            if keep:
                config["scope"][scope_key] = keep
                config["reviewPath"] = str(filtered_records)
                exact_rows(ROOT / filtered_records, [raw for row, raw in row_pairs if row["goalId"] in set(keep)])
                save(ROOT / filtered_config, config)
                new_paths.append(str(filtered_config))
            preservation[gate].append({"originalConfigPath": str(config_path), "originalConfigSha256": digest(H / config_path), "originalReviewPath": str(previous_review_path), "originalReviewSha256": digest(H / previous_review_path), "filteredConfigPath": str(filtered_config) if keep else None, "filteredReviewPath": str(filtered_records) if keep else None, "reviewIdUnchanged": config["reviewId"], "replacedGoalIds": [i for i in ids if i in selected], "retainedGoalIds": keep, "retainedWholeOriginalLinesExact": True})
        assert len(old_claims) == len(set(old_claims)) == 435
        assert len(retained_claims) == len(set(retained_claims)) == 428
        source_config = A / f"{gate}9.current-independent.config.json"
        if gate == "P":
            config = read(ROOT / source_config)
            assert config["semanticKindLedgerPath"] == str(PREP / "SEMANTIC639.descriptive-classification.for-review-only.json")
            config["semanticKindLedgerPath"] = str(KINDS)
            alias = OUT / "config/P9.actual-original-independent-A.normal-kind-address-only.config.json"
            save(ROOT / alias, config)
            new_paths.append(str(alias))
        else:
            new_paths.append(str(source_config))
        subject[key] = new_paths

    superseded = {(x["goalId"], x["supersededIndexPath"]) for x in subject["resolutionSupersessions"]}
    withdrawn = {(x["goalId"], x["indexPath"]) for x in subject["resolutionWithdrawals"]}
    owner_additions = []
    for goal_id in nine:
        previous = []
        for index_path in subject["resolutionIndexPaths"]:
            assert (H / index_path).read_bytes() == (L / index_path).read_bytes()
            index = read(H / index_path)
            if any(x["goalId"] == goal_id for x in index["resolutions"]) and (goal_id, index_path) not in superseded and (goal_id, index_path) not in withdrawn:
                previous.append(index_path)
        if goal_id in old_ordinary:
            assert len(previous) == 1, (goal_id, previous)
            owner_additions.append({"goalId": goal_id, "supersededIndexPath": previous[0], "replacementIndexPath": str(new_index)})
        else:
            assert not previous
    assert len(owner_additions) == 7
    subject["resolutionSupersessions"].extend(owner_additions)
    subject["resolutionIndexPaths"].append(str(new_index))
    assert len(subject["resolutionIndexPaths"]) == 100
    assert len(subject["resolutionSupersessions"]) == 208
    assert len(subject["resolutionWithdrawals"]) == 7
    assert len(subject["resolutionSemanticRetirements"]) == 3

    mconfig_path = PREP / "M437.current-prospective-for-technical-check.v2.config.json"
    mconfig = read(ROOT / mconfig_path)
    old_m = json_lines(L / mconfig["reviewPath"])
    assert len(old_m) == 437
    m9_path = A / "M9.current-independent.review.jsonl"
    actual_m9 = json_lines(ROOT / m9_path)
    actual_m9_by_id = {row["goalId"]: row for row, _ in actual_m9}
    assert set(actual_m9_by_id) == selected
    original_m9_archive = OUT / "HISTORY.M9.actual-original-independent-A.whole-lines.jsonl"
    exact_rows(ROOT / original_m9_archive, [raw for _, raw in actual_m9])
    exact_rows(ROOT / OUT / "HISTORY.M437.prospective-whole-before.jsonl", [raw for _, raw in old_m])
    mixed_m = []
    m_normalizations = []
    for old_row, raw in old_m:
        if old_row["goalId"] in selected:
            original = actual_m9_by_id[old_row["goalId"]]
            normalized = {**original, "reviewId": mconfig["reviewId"]}
            assert {k for k in set(original) | set(normalized) if original.get(k) != normalized.get(k)} == {"reviewId"}
            mixed_m.append(json.dumps(normalized, ensure_ascii=False, separators=(",", ":")) + "\n")
            m_normalizations.append({"goalId": original["goalId"], "originalWhole": original, "normalizedWhole": normalized, "onlyChangedField": "reviewId"})
        else:
            mixed_m.append(raw)
    final_m_path = OUT / "records/M437.retained428-whole-lines-nine-actual-independent-successors.review.jsonl"
    exact_rows(ROOT / final_m_path, mixed_m)
    cards_path = Path(args.actual_corrected_independent_card_records)
    current_cards = json_lines(L / mconfig["cardReviewPath"])
    actual_cards = json_lines(ROOT / cards_path)
    assert len(current_cards) == 79 and len(actual_cards) == 4
    key = lambda row: (row["deckId"], row["cardId"])
    replacements = {key(row): row for row, _ in actual_cards}
    assert len(replacements) == 4 and set(replacements) <= {key(row) for row, _ in current_cards}
    exact_rows(ROOT / OUT / "HISTORY.cards79.whole-before.jsonl", [raw for _, raw in current_cards])
    exact_rows(ROOT / OUT / "HISTORY.M4.actual-original-independent-A.stock-normalized.whole-lines.jsonl", [raw for _, raw in actual_cards])
    mixed_cards = []
    card_normalizations = []
    for old_row, raw in current_cards:
        if key(old_row) in replacements:
            original = replacements[key(old_row)]
            normalized = {**original, "reviewId": mconfig["reviewId"]}
            assert {k for k in set(original) | set(normalized) if original.get(k) != normalized.get(k)} == {"reviewId"}
            mixed_cards.append(json.dumps(normalized, ensure_ascii=False, separators=(",", ":")) + "\n")
            card_normalizations.append({"deckId": original["deckId"], "cardId": original["cardId"], "originalWhole": original, "normalizedWhole": normalized, "onlyChangedField": "reviewId"})
        else:
            mixed_cards.append(raw)
    final_cards_path = OUT / "records/cards79.retained75-whole-lines-four-actual-independent-successors.cards.review.jsonl"
    exact_rows(ROOT / final_cards_path, mixed_cards)
    mconfig["reviewPath"] = str(final_m_path)
    mconfig["cardReviewPath"] = str(final_cards_path)
    mconfig["reportPath"] = "docs/qa-ci/status/memory-card-review-canonical-chemistry-full.md"
    final_m_config_path = OUT / "config/M437.actual-independent-nine-and-four-cards.full-scope.config.json"
    save(ROOT / final_m_config_path, mconfig)
    save(ROOT / OUT / "CAS.review-id-only-normalization.actual-independent-M9-and-M4.json", {"role": "Technical aggregate reviewId normalization only; genuine original science retained byte-exact", "firstScience": {"path": str(a_first), "sha256": digest(ROOT / a_first)}, "originalM9Path": str(m9_path), "originalM4Path": str(cards_path), "M9WholeOperations": m_normalizations, "M4WholeOperations": card_normalizations, "HumanApproval": False, "HumanTrial": False})

    current_qa_path = PREP / "QA460.current-unapproved-candidate-contexts.json"
    qa = read(ROOT / current_qa_path)
    old_qa_by_id = {x["goalId"]: x for x in qa["records"]}
    v9_path = A / "V9.current-exact-assets-independent.qa.json"
    v9 = read(ROOT / v9_path)
    v9_by_id = {x["goalId"]: x for x in v9["records"]}
    assert len(qa["records"]) == 460 and set(v9_by_id) == selected
    for goal_id, new_row in v9_by_id.items():
        old_row = old_qa_by_id[goal_id]
        for field in set(old_row) | set(new_row):
            if field.lower().startswith(("human", "chatgpt")):
                assert old_row.get(field) == new_row.get(field), (goal_id, field)
    qa["records"] = [v9_by_id.get(row["goalId"], row) for row in qa["records"]]
    final_qa_path = OUT / "QA460.retained451-whole-records-nine-actual-independent-V.json"
    save(ROOT / final_qa_path, qa)
    owner_receipt = {"role": "Exact owner selection from prior435 plus genuinely independent reviewed nine; no new scientific vote", "createdAt": datetime.now(timezone.utc).isoformat(), "baseConfigPath": str(OLD / "central.current435.all435-paired-final-inputs.inactive.config.json"), "priorOrdinary": 435, "unchangedOrdinaryRetained": 428, "sevenExistingReplaced": sorted(selected & old_ordinary), "twoNewOrdinary": sorted(selected - old_ordinary), "currentOrdinary": 437, "A": preservation["A"], "P": preservation["P"], "D": {"historical99IndexPathsUnchanged": True, "original201SupersessionsUnchangedPrefix": True, "addedSevenSupersessions": owner_additions, "withdrawals7Unchanged": True, "semanticRetirements3Unchanged": True, "newActualPairedNineIndex": str(new_index)}, "M": {"retainedWholeOriginalRows": 428, "actualIndependentSuccessorRows": 9, "reviewIdOnlyNormalization": True, "currentMemoryNodes": 58, "currentCards": 79, "retainedWholeCardLines": 75, "actualReviewedCardSuccessors": 4}, "V": {"retainedWholeOriginalRecords": 451, "actualIndependentRecords": 9, "allHistoricalHumanFieldsUnchanged": True}, "MachineM7Pass": False, "HumanApproval": False, "HumanTrial": False}
    save(ROOT / OUT / "OWNER-SELECTION.exact428-retained-plus-real-nine.json", owner_receipt)
    final_config_path = OUT / "central.current437.all437-paired-final-inputs.inactive.config.json"
    save(ROOT / final_config_path, result)

    for source in [A, B]:
        stage_readonly_tree(source)
    for path in sorted((ROOT / OUT).rglob("*")):
        if path.is_file():
            stage_exact(path.relative_to(ROOT), path.read_bytes())
    stage_exact(MCFG, (ROOT / final_m_config_path).read_bytes())
    stage_exact(KINDS, (ROOT / PREP / "SEMANTIC639.descriptive-classification.for-review-only.json").read_bytes())
    stage_exact(QA, (ROOT / final_qa_path).read_bytes())
    assert digest(L / CANONICAL) == EXPECTED_L
    assert digest(ROOT / CANONICAL) == r_normal_pin and digest(H / CANONICAL) == h_pin
    materialization = {"role": "Actual finite technical L-only owner integration; central stock check not yet run", "createdAt": datetime.now(timezone.utc).isoformat(), "capsule": str(L.relative_to(ROOT)), "canonicalBeforeAfterSha256": EXPECTED_L, "canonicalUnchanged": True, "normalRCanonicalSha256": r_normal_pin, "HCanonicalSha256": h_pin, "normalRAndHUnchanged": True, "centralConfigPath": str(final_config_path), "actualIndependentAFirst": {"path": str(a_first), "sha256": digest(ROOT / a_first)}, "actualIndependentBFirst": {"path": str(b_first), "sha256": digest(ROOT / b_first)}, "normalLFilesUpdated": [{"path": str(p), "sha256": digest(L / p)} for p in [MCFG, KINDS, QA]], "currentOrdinary": 437, "currentKinds": 639, "historyPreserved": True, "MachineM7Pass": False, "HumanApproval": False, "HumanTrial": False}
    save(ROOT / OUT / "MATERIALIZE.actual-reviewed-nine-L-only.json", materialization)
    stage_exact(OUT / "MATERIALIZE.actual-reviewed-nine-L-only.json", (ROOT / OUT / "MATERIALIZE.actual-reviewed-nine-L-only.json").read_bytes())
    print(json.dumps({"centralConfigPath": str(final_config_path), "AConfigs": len(subject["semanticAtomicityConfigPaths"]), "PConfigs": len(subject["positiveEvidenceConfigPaths"]), "DIndices": len(subject["resolutionIndexPaths"]), "supersessions": len(subject["resolutionSupersessions"]), "canonical": digest(L / CANONICAL), "M": len(mixed_m), "cards": len(mixed_cards), "QA": len(qa["records"])}))


if __name__ == "__main__":
    main()
