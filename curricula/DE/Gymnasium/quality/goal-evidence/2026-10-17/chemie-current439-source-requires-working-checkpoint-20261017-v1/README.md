# Chemie current439: sichtbarer, inaktiver Arbeitsstand

Dieser Ordner erhält die bereits vorhandene fachliche Arbeit vom 17. Oktober 2026 direkt im normalen Repository. Die Dateien sind exakte historische Arbeits-, Autoren- und KI-Prüfkopien. Die kanonische aktive Landschaft, ihre Register und der Laufzeitstand werden dadurch nicht geändert. Es entsteht weder eine M7-Freigabe noch Human Approval oder Human Trial.

Die sechs Dateien unter `candidate/` enthalten den C650-/SEM650-Stand mit 439 fachlichen Atomen, den korrigierten P439-Stand, die HB232-/SN-Quellenkandidaten und den noch offenen paired51-requires-Kandidaten. `CANDIDATE-FILES.snapshot.json` bindet ihre ursprünglichen Pfade und exakten Bytes.

Unter `evidence/` stehen die ursprünglichen lesbaren Arbeitsordnernamen. Die fachlichen Familien enthalten insbesondere HB232-Quelleninventar und beide Nachprüfungen, SN-Indikator/P1/Quellenzelle66, f79-Konzentrationsverhältnis, source83/315-Notwendigkeitsprüfungen A/B, die drei requires-Dissenspaare, paired51, native12, A/V und remediation14. Die gepaarte Gesamtsynthese liegt unter `current439-paired-requires-and-source-root-synthesis-v1`.

Offene Autorenarbeit bleibt offen: `current439-HB232-canonical-binding-author-a-v1` enthält Arbeitskatalog, Ziel-/Profilkörper und Eingangsbindungen; `current439-requires-narrower-foundations-author-c-v1` enthält die ersten 24 Befunde, den nachfolgenden Teilauftrag und den getrennten offenen CFC/HFC-Materialbedarf. Diese Dateien beweisen keinen abgeschlossenen oder unabhängig freigegebenen Nachfolger. Der MV-Mol/Titration-HOLD und die abschließende ganze current439-Prüfung bleiben offen.

`MANIFEST.inactive-current439-source-requires.json` ist die verbindliche Auflösungstabelle: `originalPath` bleibt als historische Herkunft erhalten; `storedPath` nennt die hier gespeicherte Datei oder eine bytegleiche vorhandene Repositorydatei. `aliases` vermeiden doppelte Bytes; `reusedPreviousFiles` bindet die exakten Dateien des vorherigen Checkpoints. Eingebettete alte Pfade in den Originaldateien wurden nicht umgeschrieben. Historische JSON-/JSONL-Dateien tragen die zusätzliche Endung `.snapshot`, damit sie nicht als aktive Quell- oder Konfigurationsdateien eingelesen werden.

Ausführungskapseln, Abhängigkeits-/Buildcaches, ganze erzeugte PDF-/HTML-Publikationen, amtliche Original-/Volltextcaches und alle `.txt` bleiben lokal. Die großen rohen STOCK-Applicability-Diagnosen und portable-plan-Abhängigkeitsinventare sind ebenfalls ausgeschlossen; ihre Pfade, Hashes, Größen und Gründe stehen unter `omittedLocalCaches`. Fachliche FIRST-/Prüfurteile und die wissenschaftlichen Eingabebündel bleiben erhalten. Die physische FIRST-TSV ist eine eigene Analyse, kein amtlicher Volltext.

Die Prüfung benötigt ausschließlich dieses Repository:

```bash
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-source-requires-working-checkpoint-20261017-v1/verify_checkpoint.py
```

Sie prüft jeden gespeicherten oder wiederverwendeten Hash, Dateigrößen und bekannte JSON-/JSONL-Artefakttypen sowie die genaue C650/439/P439-Identität. Zusätzlich prüft sie den unveränderten normalen kanonischen Stand, das aktive zentrale Register, die Maturity-Floor-Policy und den aktiven Qualitätsstand: Chemie M6 mit 231/402; Mathematik M7 807, Physik M7 478 und Biologie M7 397. Das ist eine technische Checkpoint-Prüfung, keine erneute wissenschaftliche oder menschliche Freigabe.
