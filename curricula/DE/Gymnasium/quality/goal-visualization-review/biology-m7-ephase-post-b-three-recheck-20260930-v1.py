"""Record actual image review against the three newly revised E goals.

The two retained PNGs were inspected in original size and at 360 px. The
substrate PNG is held because its x-axis says amount without the fixed-volume
condition needed for the new, source-faithful concentration goal.
"""

from datetime import datetime, timezone
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
LEDGER = ROOT / "curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json"

DECISIONS = {
    "5c2ce7b1": (
        "yes",
        "At original and 360 px, the bottom panel depicts ATP-coupled active movement against the shown concentration gradient through a pump, distinct from the passive water channel in the osmosis panel. The top diffusion panel is contextual. This fits the revised active/passive protein distinction; the PNG does not present an active channel.",
    ),
    "01819a6c": (
        "yes",
        "At original and 360 px, separate large panels give one competitive inhibitor in the active site and one allosteric inhibitor elsewhere with a changed pocket. Both example mechanisms remain legible and agree with the revised 'one example for each' text.",
    ),
    "1984fd66": (
        "no",
        "HOLD after original-size review: the reused right-hand saturation plot labels its x-axis and heading 'Substratmenge', without fixed volume, while the current goal and HE E.2.3 require substrate concentration at fixed enzyme amount. The curve and three occupied enzyme sites are qualitatively useful, but the unqualified variable label can misteach the target; await a corrected PNG and fresh independent review.",
    ),
}


def main() -> None:
    data = json.loads(LEDGER.read_text())
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    seen = set()
    for record in data["records"]:
        key = record["goalId"][:8]
        if key not in DECISIONS:
            continue
        assert key not in seen
        approved, notes = DECISIONS[key]
        assert record["visualizationState"] == "available" and record["assetSha256"].startswith("sha256:")
        record["aiApproved"] = approved
        # The model keeps a reviewed HOLD only when the exact inspected image
        # hash is recorded; aiApproved itself remains no for this asset.
        record["aiApprovedAssetSha256"] = record["assetSha256"]
        record["aiReviewedAt"] = now
        record["aiReviewer"] = "Codex biology post-blind-B focused image review 2026-09-30"
        record["aiNotes"] = notes
        seen.add(key)
    assert seen == set(DECISIONS)
    LEDGER.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("Current E V recheck: 5c/018 KEEP, 198 HOLD pending corrected PNG")


if __name__ == "__main__":
    main()
