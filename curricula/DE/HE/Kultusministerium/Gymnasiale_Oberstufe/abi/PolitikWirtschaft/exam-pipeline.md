# Politik und Wirtschaft Exam Pipeline

Das Curriculum `DE_HES_S_GYM_2_POLITIKWIRTSCHAFT.de.json` ist das einzige kanonische
Release-Artefakt. Unter `abi/PolitikWirtschaft/` liegen nur abgeleitete Build- und
QA-Artefakte.

## Offizielle Struktur 2026

- drei Vorschlaege `A-C`
- genau ein Vorschlag wird bearbeitet
- materialgebundene Textaufgaben nach EPA Sozialkunde/Politik

## Collections

- `gk_offer_2026`
- `lk_offer_2026`
- `gk_master_2026`
- `lk_master_2026`

Nur die beiden Offer-Sets haben Release-Anker im Curriculum. Die Master-Sets werden aus
Offer-Aufgaben und phasenlokalen Practice-Aufgaben abgeleitet.

## Pipeline

1. Curriculum pflegen
2. `python scripts/build_politics_economics_exam_task_bank.py`
3. `python scripts/validate_politics_economics_exam_pipeline.py --report tmp/politik_wirtschaft_exam_pipeline_report.json`
4. QA im abgeleiteten `task_bank.json`

## QA-Regeln

Review-Felder:

- `abiStyle`
- `materialQuality`
- `powiConsistency`
- `solutionConsistency`
- `motivationPraxisbezug`
- `originality`
