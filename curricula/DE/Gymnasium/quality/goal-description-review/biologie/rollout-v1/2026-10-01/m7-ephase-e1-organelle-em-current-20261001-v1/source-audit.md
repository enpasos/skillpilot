# E.1 Organellen: gezielte Quellenkorrektur für fc8c4b02

## Amtliche Bindung und bisherige Lücke

Das [hessische Kerncurriculum Biologie 2024, E.1, Druckseite 33](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-biologie.pdf) verlangt einen Überblick zu Bau und Funktion der Zellorganellen **im elektronenmikroskopischen Bild der Zelle**. Die [Fassung mit Stand 1. August 2025, E.1, Druckseite 35](https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf) behält diese Anforderung bei. Die bisherige kanonische Beschreibung verlangte nur die Zuordnung in einem allgemeinen Zellmodell; die bisherigen positiven Fallskizzen nutzten ebenfalls Modelle. Das konnte die Bildinterpretation aus einem Elektronenmikroskopie-Befund nicht belegen.

Die lokale historische Source-Extraction `E.1.3` mischt Organellen und Endosymbiontentheorie. Sie ist kein wörtlicher amtlicher E.1-Punkt. Die aktuelle HE-Mapping-Review `hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-ephase-20260930-v2.review.json` kennzeichnet deshalb `cadc6465-804b-4bdb-979c-99d359f81ac7` → `fc8c4b02-02f2-5ad6-b481-224d36121da1` als **partial**; die eigenständige Endosymbiontentheorie wird über `1042bb24-96ba-553b-a956-abaf9c74dc43` abgedeckt. Mapping und historische Extraktion wurden nicht verändert.

## Fachliche Entscheidung

Alt (DE): „Die lernende Person kann Aufbau und zentrale Funktionen ausgewählter Zellorganellen in einem Zellmodell begründet zuordnen.“

Neu (DE): „Die lernende Person kann ausgewählte Zellorganellen in einem elektronenmikroskopischen Zellbild anhand ihres Baus erkennen und ihre zentralen Funktionen begründet zuordnen.“

Neu (EN): “The learner can identify selected cell organelles in an electron micrograph from their structures and relate them to their main functions with reasons.”

`Ausgewählte` und der Aufbau-Funktion-Zusammenhang halten die amtliche Übersichtstiefe ein. Das Identifizieren im EM-Bild und die dazugehörige Funktionszuordnung bilden eine zusammenhängende, beobachtbare Leistung; Präparation, Bedienung des Mikroskops und Endosymbiontentheorie werden nicht in dieses Ziel hineingelesen. Die bestehende Einstufung `curricularAtomic` bleibt nach dieser fachlichen Prüfung gerechtfertigt; ihr exakter aktueller Quellen-Fingerprint wurde im aktiven Semantic-Kind-Ledger erneuert.

Die gezielte A-Entscheidung bestätigt die semantische Atomarität für den neuen EM-Bildbezug. Die gezielte M-Entscheidung bleibt `no_memory_needed`: Bildmerkmale und Funktionsbezug müssen gedeutet werden. Bereits vorhandene Grundkarten `biology_core_003` bis `_006` liegen bei `e0d04e58-1591-5230-bfa6-5c685b56d25b`; sie wurden weder umgebunden noch neu freigegeben. Der Biologie-Memory-Check prüft weiterhin alle erforderlichen Karten und die sichtbaren Memory-Ziele.

## Offene Bindungen und Grenze dieses Pakets

- Der frühere D-Abschluss für `fc8c4b02` ist im zentralen Register bereits zurückgezogen. Der neue Ein-Ziel-D-Durchgang ist nur **vorbereitet und strukturell geprüft**; seine beiden unabhängigen Reviews und die Befundauflösung stehen aus.
- Das bisherige positive Evidence-v2-Profil fordert ein allgemeines Zellmodell und bleibt für den geänderten Zieltext inhaltlich und per Ziel-Fingerprint veraltet. Ein neues, fachlich unabhängig geprüftes Profil mit tatsächlichen EM-Bildfällen ist erforderlich. `needs_human_review` bezeichnet dabei den ehrlichen Kandidatenstatus, keine menschliche Freigabe.
- Das aktive PNG wurde tatsächlich angesehen: Es ist eine beschriftete Comicdarstellung von Pflanzen- und Tierzellen mit einer Endosymbiose-Sequenz, **kein** elektronenmikroskopisches Zellbild. Es kann einen allgemeinen Struktur-Funktions-Einstieg illustrieren, belegt aber für sich nicht die EM-Bildinterpretation. Die vorhandene Visualisierungs-QA bindet noch die alte Zielbeschreibung. Eine gezielte fachlich-visuelle V-Neuprüfung und gegebenenfalls eine geeignete Bildentscheidung stehen aus; Bilddatei und QA wurden hier nicht verändert.
- Weder der zentrale Fünf-Gate-Bericht noch die Registry wurden in diesem Paket als Abschluss geändert. Es wird kein zusätzlicher strenger M7-Abschluss und keine menschliche Freigabe beansprucht.

## Gezielte Prüfungen

- `quality:semantic-atomicity:check -- --config=...canonical-biology-full.config.json`: 362/362 aktuelle Atomaritätsentscheidungen, 0 stale.
- `quality:memory-card-review:check -- --config=...canonical-biology-full.config.json`: 362 Ziele, 0 stale; 8 Memory-Ziele sichtbar, 17/17 primäre Karten behalten.
- `quality:goal-description-rollout-batch -- prepare/check --config ...m7-ephase-e1-organelle-em-current-20261001-v1.config.json`: ein Ziel vorbereitet und gültig; keine inhaltlichen A/B-Reviews daraus abgeleitet.
