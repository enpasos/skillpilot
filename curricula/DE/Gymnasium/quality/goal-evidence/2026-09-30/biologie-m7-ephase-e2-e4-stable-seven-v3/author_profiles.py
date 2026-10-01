"""Correct the 288 protein-model case after independent content review; retain v2."""

from datetime import datetime, timezone
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
OLD = HERE.parent / "biologie-m7-ephase-e2-e4-stable-seven-v2"
REVIEW_ID = "biologie-m7-ephase-e2-e4-stable-seven-current-20260930-v3"


def main():
    candidates = json.loads((OLD / "candidates.authoring.json").read_text())
    config = json.loads((OLD / "positive-evidence.config.json").read_text())
    protein = next(goal for goal in candidates["goals"] if goal["goalId"].startswith("28850d2e"))
    case = protein["profile"]["applicationCaseBriefs"][0]
    assert case["id"] == "four-residue-single-chain"
    case.update({
        "id": "long-chain-marked-residues",
        "taskDemandDe": "Ein neues vereinfachtes Modell zeigt eine gefaltete Polypeptidkette aus 80 Aminosäureresten. Ein Ausschnitt mit zwölf Resten ist vergrößert; vier direkt aufeinanderfolgende Reste A–D sind darin markiert. Daneben sind ein lokaler Helixabschnitt und die ganze gefaltete Einzelkette dargestellt. Markiere die Bindungen zwischen A–D und erläutere die gezeigten Strukturebenen samt Modellgrenze.",
        "taskDemandEn": "A new simplified model shows a folded polypeptide of 80 amino-acid residues. A segment of twelve residues is enlarged, with four consecutive residues A–D marked. A local helix segment and the entire folded single chain are also shown. Mark the bonds between A–D and explain the structure levels shown and the model limit.",
        "expectedPerformanceDe": "Zwischen den vier markierten Resten liegen drei Peptidbindungen; die Reihenfolge aller Reste ist die Primärstruktur. Der lokale Helixabschnitt ist eine Sekundärstruktur, die Gesamtfaltung der längeren Einzelkette ihre Tertiärstruktur. Für eine einzelne Kette wird keine Quartärstruktur behauptet; aus dem Schema folgen keine exakten Atompositionen.",
        "expectedPerformanceEn": "Three peptide bonds join the four marked residues; the order of all residues is the primary structure. The local helix is secondary structure and the overall fold of the longer single chain is its tertiary structure. No quaternary structure is claimed for one chain, and the diagram gives no exact atomic positions.",
        "understandingFocusDe": "Drei lokale Peptidbindungen werden an einer ausreichend langen Kette erkannt; Helix und Tertiärfaltung werden nicht einer Vierer-Kette zugeschrieben.",
        "understandingFocusEn": "Three local peptide bonds are identified within a sufficiently long chain; helix and tertiary folding are not attributed to a four-residue chain.",
    })
    protein["reason"] = (
        "Substantive correction after independent content review: the first case now uses an 80-residue protein with a 12-residue enlarged segment and four consecutive marked residues. "
        "This supports the local helix and whole-chain tertiary model while still testing three marked peptide bonds. Current goal/image remain bound; AI candidate, no human approval."
    )
    candidates["reviewId"] = REVIEW_ID
    candidates["reviewedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    candidates["reviewer"] = "codex-gpt-6-biology-e2e4-protein-model-correction-author-2026-09-30"
    config["reviewId"] = REVIEW_ID
    config["reviewPath"] = (
        "curricula/DE/Gymnasium/quality/goal-evidence/2026-09-30/"
        "biologie-m7-ephase-e2-e4-stable-seven-v3/positive-evidence.review.jsonl"
    )
    config["scope"]["label"] = "Biologie E.2-E.4: sieben aktuelle Ziele, 288-Proteinmodell fachlich korrigiert, AI-Kandidaten"
    (HERE / "candidates.authoring.json").write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + "\n")
    (HERE / "positive-evidence.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    print("Authored current E.2-E.4 v3 with corrected long-chain protein case")


if __name__ == "__main__":
    main()
