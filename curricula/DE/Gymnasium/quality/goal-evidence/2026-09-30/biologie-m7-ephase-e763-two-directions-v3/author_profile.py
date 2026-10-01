"""Correct only e763's second positive-evidence case after independent HOLD.

The first v2 case remains a source; the v2 package is historical and untouched.
"""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = HERE.parent / "biologie-m7-ephase-e1-stable-eight-v2"
REVIEW_ID = "biologie-m7-ephase-e763-two-directions-current-20260930-v3"
GOAL_ID = "e76315b1-2fed-525c-8efa-ca09da46f632"


def main() -> None:
    original = json.loads((BASE / "candidates.authoring.json").read_text())
    source = next(row for row in original["goals"] if row["goalId"] == GOAL_ID)
    profile = source["profile"]
    assert [row["id"] for row in profile["applicationCaseBriefs"]] == ["dye-bag", "reversed-salt"]
    second = profile["applicationCaseBriefs"][1]
    second["id"] = "reversed-dye-and-salt"
    second["taskDemandDe"] = "In einem zweiten Beutelversuch ist der permeable Farbstoff innen konzentrierter, ein nicht permeables Salz dagegen außen konzentrierter. Volumen, Membran und Permeabilität sind bekannt. Sage erneut Farbstoff- UND Wasserbewegung voraus und begründe sie getrennt."
    second["taskDemandEn"] = "In a second bag experiment, the permeable dye is more concentrated inside while an impermeable salt is more concentrated outside. Volumes, membrane and permeability are specified. Predict dye AND water movement again and justify them separately."
    second["expectedPerformanceDe"] = "Der Farbstoff diffundiert netto von innen nach außen entlang seines eigenen Gefälles; Wasser bewegt sich netto zur Außenseite mit höherer Konzentration des nicht permeablen Salzes. Beide Schlüsse nennen die Membranpermeabilität und werden nicht aus einem einzigen Pfeil kopiert."
    second["expectedPerformanceEn"] = "Dye diffuses net from inside to outside down its own gradient; water moves net toward the outside with the higher concentration of impermeable salt. Both conclusions cite membrane permeability and are not copied from one arrow."
    second["understandingFocusDe"] = "Beide Bewegungsrichtungen werden bei neuen Anfangsbedingungen unabhängig neu entschieden."
    second["understandingFocusEn"] = "Both movement directions are re-decided independently under changed starting conditions."
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    candidate = {
        "schemaVersion": 1,
        "authoringContract": "positive-understanding-evidence-candidates-v1",
        "reviewId": REVIEW_ID,
        "reviewedAt": now,
        "reviewer": "codex-biology-e763-targeted-positive-profile-revision-2026-09-30",
        "goals": [{
            "goalId": GOAL_ID,
            "reason": "Substantive targeted revision after independent v2 HOLD: the second fresh case now requires both solute diffusion and water osmosis under reversed, explicit gradients. The first case and current image binding were rechecked; human approval and learner achievement remain open.",
            "evidenceLevel": "E1",
            "maximumClaimScope": "G1",
            "dissent": ["The historical E1-v2 second case only checked water direction and is not carried forward as sufficient evidence."],
            "profile": profile,
        }],
    }
    old_config = json.loads((BASE / "positive-evidence.config.json").read_text())
    old_config["reviewId"] = REVIEW_ID
    old_config["reviewPath"] = "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-e763-two-directions-v3/positive-evidence.review.jsonl"
    old_config["scope"] = {"label": "Biologie E.1: Diffusion und Osmose, gezielte P-v3-Fallkorrektur", "goalIds": [GOAL_ID]}
    (HERE / "candidates.authoring.json").write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + "\n")
    (HERE / "positive-evidence.config.json").write_text(json.dumps(old_config, ensure_ascii=False, indent=2) + "\n")
    print(f"Authored e763 targeted P-v3 at {now}")


if __name__ == "__main__":
    main()
