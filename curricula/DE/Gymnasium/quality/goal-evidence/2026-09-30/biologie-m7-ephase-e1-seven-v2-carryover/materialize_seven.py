"""Select seven independently counterchecked E1-v2 P rows byte-for-byte.

The e763 row remains in the historical eight-row input but is excluded here
because its independent content check found an insufficient second case.
"""

from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "biologie-m7-ephase-e1-stable-eight-v2"
EXCLUDED = "e76315b1-2fed-525c-8efa-ca09da46f632"


def main() -> None:
    source_path = SOURCE / "positive-evidence.review.jsonl"
    lines = [line for line in source_path.read_bytes().splitlines(keepends=True) if line.strip()]
    assert len(lines) == 8
    kept = [line for line in lines if json.loads(line)["goalId"] != EXCLUDED]
    assert len(kept) == 7
    (HERE / "positive-evidence.review.jsonl").write_bytes(b"".join(kept))
    config = json.loads((SOURCE / "positive-evidence.config.json").read_text())
    config["reviewPath"] = "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-e1-seven-v2-carryover/positive-evidence.review.jsonl"
    config["scope"] = {
        "label": "Biologie E.1: sieben unverändert fachlich gegengeprüfte P-v2-Kandidaten; e763 separat v3",
        "goalIds": [json.loads(line)["goalId"] for line in kept],
    }
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    receipt = {
        "sourceReviewPath": str(source_path),
        "sourceSha256": "sha256:" + sha256(source_path.read_bytes()).hexdigest(),
        "keptGoalIds": config["scope"]["goalIds"],
        "keptRowsSha256": ["sha256:" + sha256(line).hexdigest() for line in kept],
        "excludedGoalId": EXCLUDED,
        "reason": "Root independent content check found seven suitable v2 profiles; e763 needs a second case that checks both diffusion and osmosis and is replaced by targeted v3. No new content review is claimed for these seven rows.",
        "humanApproval": False,
    }
    (HERE / "carryover-receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    print("Selected seven exact E1-v2 P rows without changing their bytes")


if __name__ == "__main__":
    main()
