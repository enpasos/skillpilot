"""Reassess both e763 diffusion/osmosis cases after the v3 osmotic-gradient HOLD.

The v2 and v3 candidate records remain historical and are never edited here.
"""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PREVIOUS = HERE.parent / "biologie-m7-ephase-e763-two-directions-v3"
REVIEW_ID = "biologie-m7-ephase-e763-two-directions-current-20260930-v4"
GOAL_ID = "e76315b1-2fed-525c-8efa-ca09da46f632"


def main() -> None:
    source = json.loads((PREVIOUS / "candidates.authoring.json").read_text())
    record = source["goals"][0]
    assert record["goalId"] == GOAL_ID
    first, second = record["profile"]["applicationCaseBriefs"]
    assert (first["id"], second["id"]) == ("dye-bag", "reversed-dye-and-salt")

    first["taskDemandDe"] = (
        "In einem Beutelversuch sind Wasser und ein Farbstoff durch dieselbe Membran beweglich, "
        "ein Salz dagegen nicht. Anfangs sind Druck und Temperatur innen und außen gleich. "
        "Das gleiche Salz liegt innen mit 100 mmol/L und außen mit 20 mmol/L vor; "
        "der Farbstoff liegt nur als Spurentracer mit 0,001 mmol/L innen und 0,01 mmol/L außen vor. "
        "Sein Beitrag zum osmotischen Gefälle ist gegenüber dem Salz vernachlässigbar. "
        "Sage die anfänglichen Nettorichtungen von Farbstoffdiffusion UND Osmose getrennt voraus und begründe beide."
    )
    first["taskDemandEn"] = (
        "In a bag experiment, water and a dye can cross the same membrane, but a salt cannot. "
        "Initially pressure and temperature are equal inside and outside. The same salt is at "
        "100 mmol/L inside and 20 mmol/L outside; the dye is present only as a trace marker at "
        "0.001 mmol/L inside and 0.01 mmol/L outside. Its contribution to the osmotic gradient "
        "is negligible compared with that of the salt. Predict and separately explain the initial "
        "net directions of dye diffusion AND osmosis."
    )
    first["expectedPerformanceDe"] = (
        "Der permeable Spurentracer diffundiert anfangs netto von außen nach innen entlang seines "
        "eigenen Konzentrationsgefälles. Wasser bewegt sich anfangs netto nach innen zum deutlich "
        "höher konzentrierten undurchlässigen Salz; das geringe Tracergefälle ändert diese "
        "Osmoserichtung bei gleichem Anfangsdruck nicht. Beide Richtungen werden aus "
        "Permeabilität und jeweiligen Gradienten getrennt hergeleitet."
    )
    first["expectedPerformanceEn"] = (
        "The permeable trace dye initially diffuses net from outside to inside down its own "
        "concentration gradient. Water initially moves net inward toward the much higher "
        "concentration of impermeable salt; the tiny tracer gradient does not reverse that "
        "osmotic direction at equal initial pressure. Both directions are derived separately "
        "from permeability and the respective gradients."
    )

    second["taskDemandDe"] = (
        "In einem neuen Beutelversuch mit derselben Membran und dem gleichen Salz sind "
        "Anfangsdruck und Temperatur wieder beiderseits gleich. Salz liegt innen mit 20 mmol/L "
        "und außen mit 100 mmol/L vor. Der permeable Farbstoff liegt als Spurentracer innen mit "
        "0,01 mmol/L und außen mit 0,001 mmol/L vor; sein osmotischer Beitrag ist gegenüber "
        "dem Salzgefälle vernachlässigbar. Sage die anfänglichen Nettorichtungen von "
        "Farbstoffdiffusion UND Osmose erneut getrennt voraus und begründe beide."
    )
    second["taskDemandEn"] = (
        "In a new bag experiment with the same membrane and salt, initial pressure and "
        "temperature are again equal on both sides. Salt is at 20 mmol/L inside and "
        "100 mmol/L outside. The permeable dye is a trace marker at 0.01 mmol/L inside "
        "and 0.001 mmol/L outside; its osmotic contribution is negligible compared with "
        "the salt gradient. Again predict and separately explain the initial net directions "
        "of dye diffusion AND osmosis."
    )
    second["expectedPerformanceDe"] = (
        "Der permeable Spurentracer diffundiert anfangs netto von innen nach außen entlang "
        "seines eigenen Gefälles. Wasser bewegt sich anfangs netto nach außen zum deutlich "
        "höher konzentrierten undurchlässigen Salz. Der Farbstoff in Spuren trägt nicht "
        "entscheidend zum osmotischen Gradienten bei; gleicher Anfangsdruck lässt keine "
        "entgegengesetzte hydrostatische Wirkung offen."
    )
    second["expectedPerformanceEn"] = (
        "The permeable trace dye initially diffuses net from inside to outside down its own "
        "gradient. Water initially moves net outward toward the much higher concentration "
        "of impermeable salt. The trace dye contributes negligibly to the osmotic gradient, "
        "and equal initial pressure leaves no opposing hydrostatic effect unspecified."
    )
    first["understandingFocusDe"] = "Beide anfänglichen Nettorichtungen werden bei dominierendem Salzgefälle getrennt aus Membranpermeabilität erklärt."
    first["understandingFocusEn"] = "Both initial net directions are explained separately using membrane permeability and the dominant salt gradient."
    second["understandingFocusDe"] = "Die umgekehrten Anfangsgradienten prüfen beide Bewegungen neu, ohne einen unbekannten osmotischen Farbstoffbeitrag."
    second["understandingFocusEn"] = "Reversed initial gradients test both movements anew without an unspecified osmotic dye contribution."

    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    source["reviewId"] = REVIEW_ID
    source["reviewedAt"] = now
    source["reviewer"] = "codex-biology-e763-osmotic-gradient-positive-profile-revision-2026-09-30"
    record["reason"] = (
        "Substantive new review after the independent v3 HOLD: both fresh cases now state "
        "equal initial pressure, a dominant impermeable-salt gradient and a negligible "
        "permeable trace-dye contribution. Both initial net directions and current goal/image "
        "binding were rechecked. This remains an AI candidate without human approval."
    )
    record["dissent"] = [
        "The historical E1-v2 second case tested water direction alone.",
        "The v3 cases left the permeable dye's opposing osmotic contribution unknown.",
    ]
    config = json.loads((PREVIOUS / "positive-evidence.config.json").read_text())
    config["reviewId"] = REVIEW_ID
    config["reviewPath"] = "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-e763-two-directions-v4/positive-evidence.review.jsonl"
    config["scope"]["label"] = "Biologie E.1: Diffusion und Osmose, gezielte P-v4-Osmosekorrektur"
    (HERE / "candidates.authoring.json").write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n")
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    print(f"Authored e763 P-v4 at {now}")


if __name__ == "__main__":
    main()
