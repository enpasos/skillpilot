# Informatik Exam Pipeline

Das Curriculum `DE_HES_S_GYM_2_INFORMATIK.de.json` ist das kanonische Release-Artefakt.
Unter `abi/Informatik/` liegen nur abgeleitete Build- und QA-Artefakte.

## Offizielle Struktur 2026

- GK: Pflichtaufgabe `A` plus genau eine Aufgabe aus `B1/B2`
- LK: Pflichtaufgaben `A` und `B` plus genau eine Aufgabe aus `C1/C2`
- Aufgabe `A` wird in den Sprachvarianten Java und Python angeboten

## Aktueller Stand

Der aktuelle Batch umfasst:

- `sourceRef` am Curriculum
- phasenlokale Uebungsanker `E-Q4`
- erste materialgestuetzte Practice-Aufgaben
- freigegebene Offer-Anker `abi_gk_offer_2026` / `abi_lk_offer_2026`
- Erlassauszug und Blueprint
- `slot_matrix.json`
- `coverage_requirements.json`
- `build_informatics_exam_task_bank.py`
- `validate_informatics_exam_pipeline.py`

## Ableitungslogik

- `offer` wird spaeter nur ueber die beiden freigegebenen Curriculum-Anker aufgeloest.
- `master` ist kein eigener Baum im Curriculum; die Pipeline leitet `gk_master_2026`
  und `lk_master_2026` aus Offer-Aufgaben plus phasenlokalen Practice-Aufgaben ab.

## Naechster Batch

Der naechste Inhaltsbatch baut die eigentlichen GK-/LK-Offer-Aufgaben `A`, `B1/B2`,
`B`, `C1/C2` auf. Erst dann koennen die Offer-Sets `draftReady` werden.
