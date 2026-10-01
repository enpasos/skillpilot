"""Carry over exactly six previously checked E1-v2 P records byte-for-byte.

The v2 eight-row and seven-row packages remain historical; 7c and e763 each
require a separately reviewed current profile.
"""

from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "biologie-m7-ephase-e1-seven-v2-carryover"
EXCLUDED = "7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f"


def main() -> None:
    source_path = SOURCE / "positive-evidence.review.jsonl"
    lines = [line for line in source_path.read_bytes().splitlines(keepends=True) if line.strip()]
    assert len(lines) == 7
    kept = [line for line in lines if json.loads(line)["goalId"] != EXCLUDED]
    assert len(kept) == 6
    (HERE / "positive-evidence.review.jsonl").write_bytes(b"".join(kept))
    config = json.loads((SOURCE / "positive-evidence.config.json").read_text())
    config["reviewPath"] = "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-e1-six-v2-carryover/positive-evidence.review.jsonl"
    config["scope"] = {
        "label": "Biologie E.1: sechs unveränderte P-v2-Gegenprüfungen; 7c/e763 separat",
        "goalIds": [json.loads(line)["goalId"] for line in kept],
    }
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    receipt = {
        "sourceReviewPath": str(source_path),
        "sourceSha256": "sha256:" + sha256(source_path.read_bytes()).hexdigest(),
        "keptGoalIds": config["scope"]["goalIds"],
        "keptRowsSha256": ["sha256:" + sha256(line).hexdigest() for line in kept],
        "excludedGoalId": EXCLUDED,
        "reason": "Independent E1-v2 content review found a universal nucleus claim for 7c; its old candidate stays HOLD and receives a targeted v3 reassessment. The other six row bytes are unchanged; no new content review is claimed by copying.",
        "humanApproval": False,
    }
    (HERE / "carryover-receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    print("Selected six exact E1-v2 P rows; historical seven-row package unchanged")


if __name__ == "__main__":
    main()
