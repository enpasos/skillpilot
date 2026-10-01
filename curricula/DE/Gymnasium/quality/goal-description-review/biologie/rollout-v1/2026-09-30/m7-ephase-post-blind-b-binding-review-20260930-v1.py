"""Record the new atomicity and memory decisions after three B findings.

Fingerprint tools run separately after this substantive per-goal review.
"""

from datetime import datetime, timezone
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
ATOMICITY = ROOT / "curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl"
MEMORY = ROOT / "curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl"

ATOMIC_REASONS = {
    "5c2ce7b1": "Kanal und Carrier als passive Wege entlang des Gefälles werden jetzt ausdrücklich von energiegekoppeltem aktivem Proteintransport getrennt. Die eine prüfbare Leistung ist der begründete Transportvergleich; Membranmodell und Osmose sind eigene Ziele.",
    "1984fd66": "Das Sättigungsplateau bei steigender Substratkonzentration wird aus Daten bei fester Enzymmenge erklärt. Der Konzentrationsbegriff und die Versuchsbedingung begrenzen einen einzigen modellgestützten Deutungsvorgang.",
    "01819a6c": "Kompetitive und allosterische Hemmung werden anhand jeweils eines geeigneten Hemmstoffbeispiels als zwei Varianten eines abgrenzbaren Mechanismenvergleichs erklärt; ein Nutzen-Risiko-Urteil bleibt außerhalb dieses Ziels.",
}
MEMORY_REASONS = {
    "5c2ce7b1": "Passive Kanal-/Carrierwege und energiegekoppelter aktiver Proteintransport werden anhand Gefälle und Energieeinsatz entschieden. Das verlangt Mechanismenverständnis statt einer isolierten Faktenkarte.",
    "1984fd66": "Die Sättigung bei steigender Substratkonzentration und konstanter Enzymmenge wird aus Daten und ausgelasteten aktiven Zentren erklärt. Eine Faktenkarte würde den Datentransfer nicht ersetzen.",
    "01819a6c": "Die zwei Hemmungsprinzipien werden an je einem Hemmstoffbeispiel über Bindestelle und Wirkung auf Substrat/Katalyse unterschieden; keine isolierte Karte ist erforderlich.",
}


def update(path: Path, reasons: dict[str, str], atomicity: bool) -> None:
    rows = [json.loads(line) for line in path.read_text().splitlines() if line]
    seen = set()
    for row in rows:
        key = row["goalId"][:8]
        if key not in reasons:
            continue
        assert key not in seen
        assert row["status"] == ("atomic" if atomicity else "no_memory_needed")
        row["reason"] = reasons[key]
        row["reviewer"] = "codex-biology-ephase-post-independent-b-synthesis"
        row["reviewedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z") if atomicity else "2026-09-30"
        seen.add(key)
    assert seen == set(reasons)
    path.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows))


if __name__ == "__main__":
    update(ATOMICITY, ATOMIC_REASONS, True)
    update(MEMORY, MEMORY_REASONS, False)
    print("Reassessed atomicity and memory for the three B-revised goals")
