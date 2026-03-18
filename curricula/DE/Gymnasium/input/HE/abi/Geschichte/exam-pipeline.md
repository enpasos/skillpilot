# Geschichte Exam Pipeline

Das Curriculum `DE_HES_S_GYM_2_GESCHICHTE.de.json` ist das kanonische Release-Artefakt.
Unter `abi/Geschichte/` liegen nur abgeleitete Build- und QA-Artefakte.

## Offizielle Struktur 2026

- drei Vorschlaege `A-C`
- genau ein Vorschlag wird bearbeitet
- historische Argumentation auf Quellenbasis

## Aktueller Stand

Der aktuelle Batch umfasst:

- `sourceRef` am Curriculum
- phasenlokale Übungsanker `E-Q4`
- erste materialgestuetzte Practice-Aufgaben
- freigegebene Offer-Anker `abi_gk_offer_2026` / `abi_lk_offer_2026`
- Erlassauszug und Blueprint
- `slot_matrix.json`
- `coverage_requirements.json`
- `build_history_exam_task_bank.py`
- `validate_history_exam_pipeline.py`

## Ableitungslogik

- `offer` wird nur ueber die beiden freigegebenen Curriculum-Anker aufgeloest.
- `master` ist kein eigener Baum im Curriculum; die Pipeline leitet `gk_master_2026`
  und `lk_master_2026` aus Offer-Aufgaben plus phasenlokalen Practice-Aufgaben ab.

## Naechster Batch

Der naechste Inhaltsbatch baut darauf die eigentlichen GK-/LK-Offer-Aufgaben `A-C`
auf. Erst dann koennen die Offer-Sets `draftReady` werden.
