# Biology Exam Pipeline

Der kanonische fachliche Release-Pfad fuer Biologie bleibt das Curriculum:

- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_BIOLOGIE.de.json`

Dieser erste Bio-Batch bereitet nur die Architektur vor:

- Quellenpaket fuer das Landesabitur 2026
- erster offizieller Blueprint
- lokale Uebungsanker im Curriculum
- zwei draft-Offer-Anker im Curriculum

Zielzustand analog zu Mathe und Physik:

- nur die Offer-Anker leben als Release-Struktur im Curriculum
- Master-Sets werden spaeter aus Offer-Tasks plus Phase-Practice-Tasks abgeleitet
- `abi/Biologie/*` bleibt Build- und QA-Infrastruktur

Geplante Artefakte in der naechsten Ausbaustufe:

- `slot_matrix.json`
- `coverage_requirements.json`
- `task_bank.json`
- `build_biology_exam_task_bank.py`
- `validate_biology_exam_pipeline.py`

Wichtige Modellregel:

- Die normalen Lernrouten enden in phasenlokalen Uebungszielen wie `Uebungen E-Phase`, `Uebungen Q1`, `Uebungen Q2`, `Uebungen Q3`, `Uebungen Q4`.
- Der globale Abi-Zweig bleibt davon getrennt.
- Es wird kein Master-Baum in die Curriculum-`contains`-Struktur geschrieben.

Aktueller Status nach diesem Batch:

- Bio hat einen 2026-Erlassauszug fuer das Fach.
- Bio hat einen ersten offiziellen Quellen-Blueprint mit Mapping auf die vorhandene Landscape.
- Bio hat vorbereitete lokale Uebungsanker und draft-Offer-Anker im Curriculum.
- Die eigentlichen `examData`-Tasks, die Slot-Matrix und die Validator-Pipeline folgen in den naechsten Batches.
