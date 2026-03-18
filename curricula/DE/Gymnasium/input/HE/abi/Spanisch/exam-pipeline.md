# Spanisch Exam Pipeline

Das Curriculum `DE_HES_S_GYM_2_SPANISCH.de.json` ist das kanonische Release-Artefakt.
Unter `abi/Spanisch/` liegen nur abgeleitete Build- und QA-Artefakte.

## Offizielle Struktur 2026

- zwei Prüfungsteile
- Pflichtaufgabe `A`: Sprachmittlung
- Wahl zwischen `B1` und `B2` im zweiten Prüfungsteil
- Hilfsmittel: Wörterbücher, Pflichtwerke ohne Kommentar, Operatorenliste

## Aktueller Stand

Der aktuelle Batch umfasst:

- `sourceRef` am Curriculum
- phasenlokale Übungsanker `E-Q4`
- fünf materialgestützte Practice-Aufgaben
- freigegebene Offer-Anker `abi_gk_offer_2026` / `abi_lk_offer_2026`
- Erlassauszug und Blueprint unter `abi/Spanisch/`

## Ableitungslogik

- `offer` wird später ausschließlich über die beiden freigegebenen Curriculum-Anker aufgelöst.
- `master` ist kein eigener Baum im Curriculum; die Pipeline leitet `gk_master_2026` und `lk_master_2026` später aus Offer-Aufgaben plus phasenlokalen Practice-Aufgaben ab.
- Die aktuelle Spanisch-Landschaft ist bereits kompetenzorientiert modelliert, deckt die offiziellen 2026-Fokusthemen aber noch nicht 1:1 ab; die Brückenschicht dazu liegt im Blueprint.

## Nächste Schritte

1. `slot_matrix.json` und `coverage_requirements.json` anlegen.
2. `build_spanish_exam_task_bank.py` und `validate_spanish_exam_pipeline.py` aufsetzen.
3. Die eigentlichen Offer-Aufgaben `A`, `B1`, `B2` für GK und LK schreiben.
4. Danach QA- und Release-Batches fahren.
