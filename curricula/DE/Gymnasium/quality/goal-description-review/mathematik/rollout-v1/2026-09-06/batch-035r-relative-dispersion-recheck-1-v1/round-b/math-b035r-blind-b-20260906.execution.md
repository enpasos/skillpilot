# Mathematik B035r — frische unabhängige Runde B

Run `math-b035r-blind-b-20260906`; tatsächlicher Beginn 2026-09-06T08:50:43Z, Recordabschluss 2026-09-06T08:52:10Z, Validierungsabschluss 2026-09-06T08:53:09Z.

Die aktuelle Konfiguration, eigene Kampagne, eigenes Bundlemanifest, eigener vollständiger Prompt v2, vollständige Mathematik-Kriterien v2, das gebundene Recordschema und die einzige vollständige aktuelle JSONL-Eingabe einschließlich aller DE/EN- und Kontextfelder wurden gelesen. Das generische AI-Run-Schema wurde in diesem Ausführungsturn vollständig gelesen. Die Prompt-/Kriterienkopien stimmen rohhashgleich mit den in der Konfiguration genannten Originaldateien überein. Keine neue A-/P-Runde, Synthese oder alten Reviewdateien wurden eingesehen oder als Urteil übernommen.

Ergebnis: genau 1 KEEP für 5b54f272-f588-5009-8b42-eb15f846d3e2, candidate/ai_candidate, Profil-Empfehlung create. Die aktuelle Aussage folgt für n ≥ 1 und 0 < p < 1 aus μ=np, σ=√(np(1−p)) und σ/μ=√((1−p)/p)·n^(−1/2). Die positive Konstante bei festem p trägt die allgemeine Abnahme. Ein zusätzlich gerechneter Kontrollfall n=20→80 bei p=0,2 halbiert den Koeffizienten von ungefähr 0,4472 auf 0,2236; das ist ein Zahlencheck, nicht der allgemeine Beweis. Keine Quellen-, Bild- oder Humanfreigabe wurde erteilt.

## Bindungen und Prüfung

- Book: `sha256:21b6ffd0d184216456c4d78e2d27bdfcf101925d503a6763bcdf7bf9730be58a`
- Bundle: `sha256:f6b5d6ce7368d9d1367d853e4edd5ef6858b749a3556761411caa4fae5c1adf7`
- Rohinput: `sha256:5a5d98fd75159737adc6e748141998481a2dcc81f61699596b9e34efead87e45`
- Prompt: `sha256:b58605a08b1570635cee845d8aa295d13ad861ae20a8e8000360e020bbe0a10b`
- Kriterien: `sha256:d5fc404ad4f4b23b5edcbb73ae133211081745786ac29ae9c7e46c51ae24f919`
- Recordschema, über Kampagne/Input gebunden: `sha256:b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff`
- Records: `sha256:14ef20cc355533e81db436c5251450ac5dec844cda9a4e7f07b5a95e6e8f26de`
- Runmanifest: `sha256:6e20d7ac5a47792fd34cc3ec6f749466a55d3f7781031ed3a93988144b5b73cf`

Provider OpenAI, Modell Codex, kein unbekannter Snapshot behauptet. Generation-Parameter-Digest `sha256:c2c84483e6bac8b77deaeb36c4a432dfd090d2aa84b1b1f44ac1369d07409a4c` bindet exakt folgendes JSON ohne abschließenden Zeilenumbruch:

`{"executionMode":"codex_agent","generationParameters":"not_exposed","modelSnapshot":"not_exposed"}`

Runinputrollen exakt description_review_batch_input_jsonl, review_prompt und review_criteria. Das Recordschema ist kein finding_schema.

Native Kampagnenvalidierung der eigenen Runde: `Goal-description review campaign results valid: 1`, Exit 0. Zehn zusätzliche Rohhash-, Text-, Reihenfolge-, Parameter-, Autoritäts-, Output- und Zeitchecks PASS. Geschrieben wurden ausschließlich die erwarteten Records-/Run-Dateien im eigenen results-Verzeichnis und diese Notiz; keine kanonischen oder zentralen Änderungen.
