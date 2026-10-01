"""New transfer case for e763 after independent v4 HOLD on mirrored conditions."""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PREVIOUS = HERE.parent / "biologie-m7-ephase-e763-two-directions-v4"
REVIEW_ID = "biologie-m7-ephase-e763-opposing-directions-current-20260930-v5"
GOAL_ID = "e76315b1-2fed-525c-8efa-ca09da46f632"


def main() -> None:
    source = json.loads((PREVIOUS / "candidates.authoring.json").read_text())
    record = source["goals"][0]
    assert record["goalId"] == GOAL_ID
    profile = record["profile"]
    first, second = profile["applicationCaseBriefs"]
    assert first["id"] == "dye-bag" and second["id"] == "reversed-dye-and-salt"
    second["id"] = "urea-sucrose-two-chambers"
    second["taskDemandDe"] = (
        "Ein anderer Versuch trennt eine Innen- und Außenkammer durch eine Labor-Membran. "
        "Diese lässt Wasser und Harnstoff durch, nicht aber Saccharose. Anfangsdruck "
        "und Temperatur sind auf beiden Seiten gleich. Saccharose liegt innen mit "
        "20 mmol/L, außen mit 100 mmol/L vor. Harnstoff dient nur als Spurentracer: "
        "innen 0,001 mmol/L, außen 0,01 mmol/L; sein osmotischer Beitrag ist "
        "gegenüber dem Saccharosegefälle vernachlässigbar. Sage die anfänglichen "
        "Nettorichtungen von Harnstoffdiffusion UND Osmose bezogen auf die Innenkammer "
        "getrennt voraus und begründe beide."
    )
    second["taskDemandEn"] = (
        "A different experiment separates an inner and an outer chamber with a laboratory "
        "membrane. Water and urea can cross, but sucrose cannot. Initial pressure and "
        "temperature are equal on both sides. Sucrose is 20 mmol/L inside and "
        "100 mmol/L outside. Urea is only a trace marker: 0.001 mmol/L inside and "
        "0.01 mmol/L outside; its osmotic contribution is negligible compared with "
        "the sucrose gradient. Relative to the inner chamber, separately predict and "
        "explain the initial net directions of urea diffusion AND osmosis."
    )
    second["expectedPerformanceDe"] = (
        "Harnstoff diffundiert anfangs netto von außen in die Innenkammer entlang "
        "seines eigenen Konzentrationsgefälles, weil er die Membran passieren kann. "
        "Wasser bewegt sich anfangs netto aus der Innenkammer nach außen zum deutlich "
        "höher konzentrierten, undurchlässigen Saccharose-Osmolyt. Der Harnstoff in "
        "Spuren ändert die dominierende Osmoserichtung nicht; gleicher Anfangsdruck "
        "schließt eine unbekannte gegenläufige Druckwirkung aus. Die Pfeile sind "
        "entgegengesetzt und müssen unabhängig begründet werden."
    )
    second["expectedPerformanceEn"] = (
        "Urea initially diffuses net from outside into the inner chamber down its own "
        "concentration gradient because it can cross the membrane. Water initially moves "
        "net from the inner chamber outward toward the much higher concentration of "
        "impermeable sucrose. Trace urea does not reverse the dominant osmotic direction; "
        "equal initial pressure rules out an unspecified opposing pressure effect. "
        "The arrows point in opposite directions and need independent explanations."
    )
    second["understandingFocusDe"] = (
        "Eine andere Membran-/Stoffkonstellation mit gegenläufigen Netto-Pfeilen "
        "erzwingt getrennte Entscheidungen über permeablen Tracer und Wasser."
    )
    second["understandingFocusEn"] = (
        "A different membrane/solute setting with opposite net arrows requires "
        "separate decisions about permeable tracer and water."
    )
    profile["variationAxes"] = [
        {
            "id": "driving-gradient",
            "textDe": "Im zweiten Aufbau zeigt der permeable Tracer weiter nach innen, die Osmoserichtung aber nach außen.",
            "textEn": "In the second setup the permeable tracer still moves inward, but osmosis moves outward.",
        },
        {
            "id": "membrane-and-solute",
            "textDe": "Beutel mit Farbstoff/nicht permeablem Salz und Zweikammer-Membran mit Harnstoff/nicht permeabler Saccharose vergleichen.",
            "textEn": "Compare a bag with dye/impermeable salt and a two-chamber membrane with urea/impermeable sucrose.",
        },
    ]
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    source["reviewId"] = REVIEW_ID
    source["reviewedAt"] = now
    source["reviewer"] = "codex-biology-e763-opposing-directions-positive-profile-revision-2026-09-30"
    record["reason"] = (
        "Substantive new review after independent v4 HOLD: the second fresh case changes "
        "membrane/solute setting and puts permeable tracer diffusion opposite the initial "
        "osmosis direction. Dominant impermeable osmolyte, negligible tracer, equal "
        "initial pressure and current goal/image binding were checked. AI candidate only."
    )
    record["dissent"] = [
        "Historical v2 second case checked osmosis without a separate new diffusion judgment.",
        "Historical v3 cases left the permeable dye's osmotic contribution unspecified.",
        "Historical v4 second case merely mirrored the first bag and kept both arrows together.",
    ]
    config = json.loads((PREVIOUS / "positive-evidence.config.json").read_text())
    config["reviewId"] = REVIEW_ID
    config["reviewPath"] = "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-e763-opposing-directions-v5/positive-evidence.review.jsonl"
    config["scope"]["label"] = "Biologie E.1: Diffusion/Osmose mit gegenläufigem Transfer, P-v5"
    (HERE / "candidates.authoring.json").write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n")
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    print(f"Authored e763 P-v5 at {now}")


if __name__ == "__main__":
    main()
