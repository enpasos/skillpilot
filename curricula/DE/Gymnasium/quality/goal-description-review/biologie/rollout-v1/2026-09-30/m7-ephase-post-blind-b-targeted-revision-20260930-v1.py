"""Apply only the three substantive D-round-B biology corrections.

The v2 paired A/B records remain immutable evidence for these findings. This
script asserts their reviewed before-text so accidental hash-only rebinding or
unrelated changes cannot be mistaken for the correction.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
CANONICAL = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"

CHANGES = {
    "5c2ce7b1": (
        "Die lernende Person kann aktiven und passiven Stofftransport durch Kanal- oder Carrierproteine anhand von Konzentrationsgefälle und Energieeinsatz unterscheiden.",
        "Die lernende Person kann passiven Stofftransport durch Kanal- oder Carrierproteine und aktiven Stofftransport durch energiegekoppelte Transportproteine anhand von Konzentrationsgefälle und Energieeinsatz unterscheiden.",
        "The learner can distinguish active and passive solute transport through channel or carrier proteins using concentration gradients and energy input.",
        "The learner can distinguish passive solute transport through channel or carrier proteins from active solute transport through energy-coupled transport proteins using concentration gradients and energy input.",
    ),
    "1984fd66": (
        "Die lernende Person kann aus kontrollierten Daten erklären, warum die Enzymaktivität bei steigender Substratmenge schließlich ein Sättigungsplateau erreicht.",
        "Die lernende Person kann aus Daten bei konstanter Enzymmenge erklären, warum die Enzymaktivität bei steigender Substratkonzentration schließlich ein Sättigungsplateau erreicht.",
        "The learner can use controlled data to explain why enzyme activity eventually reaches a saturation plateau as substrate amount rises.",
        "The learner can use data at a fixed enzyme amount to explain why enzyme activity eventually reaches a saturation plateau as substrate concentration rises.",
    ),
    "01819a6c": (
        "Die lernende Person kann das Prinzip kompetitiver und allosterischer Enzymhemmung an einem geeigneten Hemmstoffbeispiel erklären.",
        "Die lernende Person kann das Prinzip kompetitiver und allosterischer Enzymhemmung an jeweils einem geeigneten Hemmstoffbeispiel erklären.",
        "The learner can explain the principles of competitive and allosteric enzyme inhibition using a suitable inhibitor example.",
        "The learner can explain the principles of competitive and allosteric enzyme inhibition using one suitable inhibitor example for each.",
    ),
}


def main() -> None:
    data = json.loads(CANONICAL.read_text())
    seen = set()
    for goal in data["goals"]:
        key = goal["id"][:8]
        if key not in CHANGES:
            continue
        assert key not in seen
        before_de, after_de, before_en, after_en = CHANGES[key]
        assert goal["description"] == before_de, (key, goal["description"])
        assert goal["descriptionEn"] == before_en, (key, goal["descriptionEn"])
        goal["description"] = after_de
        goal["descriptionEn"] = after_en
        seen.add(key)
    assert seen == set(CHANGES)
    CANONICAL.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("Substantively corrected 5c2ce7b1, 1984fd66, 01819a6c after independent B review")


if __name__ == "__main__":
    main()
