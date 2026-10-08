"""Freeze existing A/M decisions and shared-deck dependencies, without new judgments."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent
CANON = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
A_BASE = ROOT / "curricula/DE/Gymnasium/quality/semantic-atomicity"
M_BASE = ROOT / "curricula/DE/Gymnasium/quality/memory-card-review"


def rel(path):
    return str(path.relative_to(ROOT))


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def write_json(path, value):
    assert not path.exists(), f"Immutable output already exists: {path}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def exact_rows(path, key):
    rows = {}
    for raw in path.read_bytes().splitlines(keepends=True):
        if not raw.strip():
            continue
        row = json.loads(raw)
        assert key(row) not in rows, f"Duplicate existing decision: {path}"
        rows[key(row)] = (row, raw)
    return rows


observations = []


def snapshot(source, target):
    data = source.read_bytes()
    assert not target.exists(), f"Immutable snapshot already exists: {target}"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    observations.append({"sourcePath": rel(source), "snapshotPath": rel(target),
                         "sha256": sha(data), "bytes": len(data)})


def copy_rows(path, ids, row_by_id):
    assert not path.exists()
    path.write_bytes(b"".join(row_by_id[gid][1] for gid in ids))


assert (ROOT / "AGENTS.md").exists(), ROOT
selection = load(AUTHOR / "current19-whole-DEEN-goals.actual.json")
initial_freeze = load(AUTHOR / "initial-whole-source-and-goal-selection.author.freeze.json")
for binding in initial_freeze["files"]:
    data = (ROOT / binding["path"]).read_bytes()
    assert len(data) == binding["bytes"] and sha(data) == binding["sha256"]
landscape = load(CANON)
goal_by_id = {g["id"]: g for g in landscape["goals"]}
selected = [g["id"] for g in selection["goals"]]
assert len(selected) == len(set(selected)) == 19
assert all(goal_by_id[g["id"]] == g for g in selection["goals"])
a_config_source = A_BASE / "canonical-biology-full.config.json"
m_config_source = M_BASE / "canonical-biology-full.config.json"
a_config, m_config = load(a_config_source), load(m_config_source)
a_path = ROOT / a_config["reviewPath"]
m_path = ROOT / m_config["reviewPath"]
card_path = ROOT / m_config["cardReviewPath"]
a_rows = exact_rows(a_path, lambda r: r["goalId"])
m_rows = exact_rows(m_path, lambda r: r["goalId"])
card_rows = exact_rows(card_path, lambda r: (r["deckId"], r["cardId"]))
memory_ids = sorted({mid for gid in selected
                     for mid in m_rows[gid][0].get("memoryGoalIds", [])})
deck_ids = sorted({did for gid in selected
                   for did in m_rows[gid][0].get("deckIds", [])})
needed_card_keys = sorted(k for k, (r, _) in card_rows.items()
                          if k[0] in deck_ids and r["status"] != "remove")
origin_ids = sorted({gid for key in needed_card_keys
                     for gid in card_rows[key][0].get("originGoalIds", [])})
extra_ids = sorted(set(origin_ids) - set(selected))
ordinary_ids = selected + extra_ids
direct_keys = [key for key in needed_card_keys
               if set(card_rows[key][0].get("originGoalIds", [])) & set(selected)]
assert len(memory_ids) == 1 and len(deck_ids) == 1
assert len(needed_card_keys) == 17 and len(origin_ids) == 8
assert len(extra_ids) == 6 and len(ordinary_ids) == 25 and len(direct_keys) == 7

fixed_inputs = [CANON, a_config_source, m_config_source, a_path, m_path, card_path,
                AUTHOR / "current19-whole-DEEN-goals.actual.json",
                AUTHOR / "initial-whole-source-and-goal-selection.author.freeze.json",
                AUTHOR / "actual-whole-HE-G9-9-1-to-9-4-primary-reading.author.receipt.json",
                AUTHOR / "neutral-nineteen-current-whole-author-routing.entry.json",
                ROOT / "app/scripts/semanticAtomicityReview.ts",
                ROOT / "app/scripts/memoryCardReview.ts"]
for source in fixed_inputs:
    snapshot(source, OWN / "input-snapshots" / rel(source))

deck_sources = sorted({value for goal in landscape["goals"]
                       if goal.get("nodeKind") == "memory" or any(
                           tag == "memorization" or tag.startswith("srs-deck:")
                           for tag in goal.get("tags", []))
                       for key, value in goal.get("extendedData", {}).items()
                       if key in ("vocabularySource", "vocabularySourceEn") and isinstance(value, str)})
for source in deck_sources:
    path = ROOT / ("app/public" + source if source.startswith("/data/") else source.lstrip("/"))
    snapshot(path, OWN / "input-snapshots" / rel(path))
for scope in m_config["visibilityScopes"]:
    source = ROOT / scope["viewPath"]
    target = OWN / "input-snapshots" / rel(source)
    snapshot(source, target)
    scope["viewPath"] = rel(target)

a_copy, m_copy, card_copy = (OWN / name for name in (
    "A19.exact-retained.review.jsonl", "M25.exact-retained-dependency-closure.review.jsonl",
    "cards17.exact-retained-shared-deck.review.jsonl"))
copy_rows(a_copy, selected, a_rows)
copy_rows(m_copy, ordinary_ids, m_rows)
copy_rows(card_copy, needed_card_keys, card_rows)
canon_snapshot = OWN / "input-snapshots" / rel(CANON)
a_config.update(landscapePath=rel(canon_snapshot), reviewPath=rel(a_copy),
                scope={"label": "HE G9 nineteen unchanged goals: retained A only", "leafGoalIds": selected},
                reportPath=rel(OWN / "A19.native.stdout.actual.txt"))
m_config.update(landscapePath=rel(canon_snapshot), reviewPath=rel(m_copy), cardReviewPath=rel(card_copy),
                scope={"label": "HE G9 nineteen unchanged goals plus shared deck dependency closure",
                       "leafGoalIds": ordinary_ids + memory_ids},
                reportPath=rel(OWN / "M25-cards17-views8.native.actual.md"))
write_json(OWN / "A19.exact-retained.native.config.json", a_config)
write_json(OWN / "M25-cards17-views8.exact-retained.native.config.json", m_config)

core_sources = goal_by_id[memory_ids[0]]["extendedData"]
de_path = ROOT / ("app/public" + core_sources["vocabularySource"])
en_path = ROOT / ("app/public" + core_sources["vocabularySourceEn"])
de, en = load(de_path), load(en_path)
assert de["deckId"] == en["deckId"] == deck_ids[0]
de_cards, en_cards = ({c["id"]: c for c in deck["cards"]} for deck in (de, en))
assert len(de_cards) == len(de["cards"]) == len(en_cards) == len(en["cards"]) == 17
assert set(de_cards) == set(en_cards) == {k[1] for k in needed_card_keys}
write_json(OWN / "required-cards-and-whole-origin-goals.retained.technical.json", {
    "artifactKind": "existing-AM-and-shared-memory-card-dependency-binding-input",
    "recordedAt": datetime.now(timezone.utc).isoformat(),
    "reviewer": "/root/flora_fauna_independent_a", "technicalOnly": True,
    "selectedGoalIds": selected, "wholeSelectedGoalRows": selection["goals"],
    "selectedAExistingDecisionRows": [a_rows[g][0] for g in selected],
    "selectedMExistingDecisionRows": [m_rows[g][0] for g in selected],
    "selectedStatusCounts": {"atomic": 19, "no_memory_needed": 17, "memory_required": 2},
    "memoryNodeRows": [goal_by_id[g] for g in memory_ids],
    "wholeOriginGoalRows": [goal_by_id[g] for g in origin_ids],
    "additionalDependencyGoalIds": extra_ids,
    "additionalExistingMDecisionRows": [m_rows[g][0] for g in extra_ids],
    "directSelectedCardIds": [k[1] for k in direct_keys],
    "sharedDeckOtherCardIds": [k[1] for k in needed_card_keys if k not in direct_keys],
    "cardBindingRows": [{"cardId": k[1], "deckId": k[0],
                         "wholeCardDE": de_cards[k[1]], "wholeCardEN": en_cards[k[1]],
                         "existingCardReviewRow": card_rows[k][0],
                         "directSelectedOrigin": k in direct_keys} for k in needed_card_keys],
    "interpretation": "Historical reasons, reviewer, date, fingerprints and statuses are retained exactly. No fresh science review is claimed. Seven cards directly trace to the two selected memory-required goals; the ten other cards and six additional whole origin goals are required shared-deck technical closure.",
    "newScienceReviews": 0, "newScientificClosures": 0, "strictGainClaimed": 0,
    "humanApprovalClaimed": False, "activeWrites": False,
})
write_json(OWN / "exact-existing-source-observations.technical.json", {
    "artifactKind": "technical-existing-input-snapshots-and-original-path-observations",
    "recordedAt": datetime.now(timezone.utc).isoformat(), "technicalOnly": True,
    "observations": observations,
    "nativeDeckReadNote": "Native memoryCardReview reads actual standard vocabularySource paths. Exact copies and pre/post source digest checks bind those reads; the whole canonical memory node is not altered to redirect its vocabularySource.",
    "wholeSelectedGoalsEqualCurrentCanonicalAtSnapshot": True,
    "sourceScienceRechecked": False, "historicalSourceReadingReceiptRetainedOnly": True,
    "activeWrites": False, "strictGainClaimed": 0,
})
print(json.dumps({"directory": rel(OWN), "ordinaryGoalsM": len(ordinary_ids),
                  "memoryNodes": len(memory_ids), "primaryCards": len(needed_card_keys),
                  "directSelectedCards": len(direct_keys), "visibilityScopes": len(m_config["visibilityScopes"]),
                  "snapshotInputs": len(observations)}, ensure_ascii=False))
