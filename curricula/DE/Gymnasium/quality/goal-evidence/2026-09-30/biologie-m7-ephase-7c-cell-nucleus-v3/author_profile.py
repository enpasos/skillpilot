"""Reassess the 7c E1 P profile after the overgeneralized nucleus finding."""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "biologie-m7-ephase-e1-stable-eight-v2"
GOAL_ID = "7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f"
REVIEW_ID = "biologie-m7-ephase-7c-cell-nucleus-current-20260930-v3"


def main() -> None:
    original = json.loads((SOURCE / "candidates.authoring.json").read_text())
    record = next(row for row in original["goals"] if row["goalId"] == GOAL_ID)
    profile = record["profile"]
    expectation = profile["expectations"][0]
    assert expectation["id"] == "cell-type-visible"
    expectation["essentialUnderstandingDe"] = (
        "Pflanzen- und Tierzellen gehören zu den Eukaryoten; typische hier untersuchte "
        "Zellen haben einen Zellkern, der im Lichtmikroskop je nach Präparat und Färbung "
        "sichtbar sein kann. Das gilt nicht ausnahmslos für jede differenzierte Zelle "
        "(zum Beispiel reife Säugererythrozyten). Pflanzenzellen besitzen eine Zellwand "
        "und häufig Chloroplasten, Tierzellen beides nicht. Bakterien sind Prokaryoten; "
        "ein im Bild nicht sichtbarer Kern allein beweist keine prokaryotische Zugehörigkeit."
    )
    expectation["essentialUnderstandingEn"] = (
        "Plant and animal cells belong to the eukaryotes; typical cells examined here have "
        "a nucleus that may be visible by light microscopy depending on specimen and stain. "
        "This is not true without exception for every differentiated cell (for example, "
        "mature mammalian red blood cells). Plant cells have a cell wall and often "
        "chloroplasts, while animal cells have neither. Bacteria are prokaryotes; "
        "failure to see a nucleus in an image alone does not prove prokaryotic identity."
    )
    second = profile["applicationCaseBriefs"][1]
    assert second["id"] == "elodea-insect-bacteria"
    second["taskDemandDe"] = (
        "Neue Aufnahmen zeigen ein grünes Wasserpflanzenblatt, gefärbtes Insektengewebe "
        "und stäbchenförmige Bakterien; ein Zusatzschema markiert Zellkerne/DNA. "
        "Einzelne Tierzellen zeigen im Bild keinen klaren Kern. Begründe die Zuordnung "
        "an sichtbaren Merkmalen und erkläre, ob das fehlende Kernsignal allein "
        "eine Zelle als Prokaryot ausweist."
    )
    second["taskDemandEn"] = (
        "New images show a green aquatic plant leaf, stained insect tissue and rod-shaped "
        "bacteria; a supplementary diagram marks nuclei/DNA. Some animal cells do not "
        "show a clear nucleus in the image. Classify the samples using visible features "
        "and explain whether an absent nuclear signal alone makes a cell prokaryotic."
    )
    second["expectedPerformanceDe"] = (
        "Die lernende Person nutzt sichtbare Wand-/Chloroplastenmerkmale bei der Pflanze, "
        "Zellgrenzen und gegebenenfalls Kerne im gefärbten Tiergewebe sowie kleine "
        "Stäbchen bei den Bakterien. Ein nicht erkennbarer Kern kann an Präparat, "
        "Färbung oder Zelltyp liegen und reicht allein nicht für die sichere "
        "Einordnung als Prokaryot. Modellangaben werden nicht als direkte "
        "Lichtmikroskopbeobachtung ausgegeben."
    )
    second["expectedPerformanceEn"] = (
        "The learner uses visible walls/chloroplasts in the plant, cell boundaries and, "
        "where discernible, nuclei in stained animal tissue, and small rods in the bacteria. "
        "An unseen nucleus may reflect the specimen, stain or cell type and alone does "
        "not justify definite classification as a prokaryote. Diagram information is "
        "not presented as direct light-microscope observation."
    )
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    candidate = {
        "schemaVersion": 1,
        "authoringContract": "positive-understanding-evidence-candidates-v1",
        "reviewId": REVIEW_ID,
        "reviewedAt": now,
        "reviewer": "codex-biology-7c-cell-type-positive-profile-revision-2026-09-30",
        "goals": [{
            **record,
            "reason": "Substantive targeted re-review after independent E1-v2 HOLD: typical examined eukaryotic cells may display nuclei, but no universal nucleus claim is made. Both fresh microscopy/schema cases and current goal/image binding were rechecked; this is an AI candidate, not human approval.",
            "dissent": ["The v2 essential understanding incorrectly generalized nuclei to all plant and animal cells; differentiated mammalian erythrocytes are a counterexample."],
        }],
    }
    config = json.loads((SOURCE / "positive-evidence.config.json").read_text())
    config["reviewId"] = REVIEW_ID
    config["reviewPath"] = "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/biologie-m7-ephase-7c-cell-nucleus-v3/positive-evidence.review.jsonl"
    config["scope"] = {"label": "Biologie E.1: 7c Zellkern-Aussage fachlich begrenzt, P-v3", "goalIds": [GOAL_ID]}
    (HERE / "candidates.authoring.json").write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + "\n")
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    print(f"Authored 7c targeted P-v3 at {now}")


if __name__ == "__main__":
    main()
