# E25: vollständiger Prüfungsentwurf, noch nicht angewandt

Der Kandidat für die bestehende Informatik-Identität `49ba66cf-accd-5938-a63e-f031bc786767` erhält exakt alle 25 bisherigen `coveredGoalIds` in derselben Reihenfolge. Er enthält konkrete Netz-/SMTP-Daten, vollständige Ausgangsdaten, tatsächlich gegebenen fehlerhaften Code, vier klassische Kryptofälle und ein konkretes TCP-Segmentmodell. Die lokale Projektaufgabe verlangt eine eigene Webanwendung, Planung, echte Zwischenstände, Tests, Präsentation und Qualitäts-/Anforderungsbeurteilung. Die vollständige Musterlösung ist separat vom Lernendenmaterial.

- [Rohe examData](informatics-e25-terminal-candidate-2026-11-06.exam-data.json): `reviewStatus=draft`; ein Gesamtscore mit 25 notwendigen Einpunktkriterien und 25 Punkten zum Bestehen. Das ist eine konkrete Rubrik dieses Entwurfs, keine neue allgemeine Bewertungsregel und keine zweite gespeicherte Ergebnisart.
- [Reviewinput mit 25 vollständigen Zielbindungen](informatics-e25-terminal-candidate-2026-11-06.review-input.json): Materialstelle → Teilaufgabe → selbstständige beobachtbare Leistung → Musterlösung → Kriterium. Vollständige Originalziele, Eltern und explizite aktuelle Kontextunterschiede sind gebunden.
- [Aufgabe](informatics-e25-terminal-reference-2026-11-06/task.md), [vollständige Musterlösung](informatics-e25-terminal-reference-2026-11-06/solution.md), [lauffähige lokale Modellseite](informatics-e25-terminal-reference-2026-11-06/solution.html).

Die Quellenbasis ist die tatsächlich gelesene 93a653-Fassung im Commit `0f86df880a24f366d7d357160271dceeb6ce94c0`. Der aktuelle f95c0a11-Kontext wird zusätzlich vollständig gehasht: Die Identität, das gesamte alte Terminalpayload, alle 25 Bedeutungen und deren Coverage sind unverändert; nur bereits separat reparierte Vorbereitungsarrays einzelner Ziele unterscheiden sich. Der Kandidat ändert keine Quelle, keine View, keine QA-Freigabe und keinen Lernzustand.

Die Ausführungsbelege betreffen ausschließlich eigene lokale Referenzprogramme: zehn gruppierte Node-Fälle, 16 unabhängige Pythonkontrollen, drei echte V0-Fehler, unterschiedliche V1/V2/V3-Artefakte und tatsächliche lokale Chromium-Läufe bei 320/767/768/1024 Pixeln. Der Rabatt wurde auch über das echte lokale Formular geprüft. HTTP(S)-Versuche waren blockiert und wurden nicht beobachtet. Es gab keine SMTP-/HTTP-Netzübertragung, keinen echten Kryptoschutznachweis und keinen Deployment-/Host-/Menschenversuch. Der native bestehende CQR202-Prüfer blockiert den Kandidaten korrekt ausschließlich mit `reviewStatus=draft`; das ist keine inhaltliche Freigabe oder M6-/P-Aussage.

Offen bleibt das alte Angebot im GK mit nur 24 der 25 Ziele. Dieser Entwurf bearbeitet ausschließlich den vollen 25er-/LK-Vertrag einschließlich Paketübertragung. Er verkleinert die Coverage nicht, legt keinen 24er-Teilpass an und führt keine neue GK-Identität ein. Vor einer Anwendung ist diese Angebots-/Identitätsfrage getrennt zu entscheiden. Bereits gespeicherte Ergebnisse werden hier weder umgedeutet noch neu bewertet, entzogen oder migriert; ein altes Ergebnis beweist nicht, dass die neuen Aufgaben bearbeitet wurden. Q4, die 875-/41er-Prüfungsfrage und gewöhnliche Prerequisite-Reparaturen bleiben getrennte Blöcke.

Lesender Konsistenzreplay aus der Repositorywurzel:

```bash
python3 -B docs/dev/ci-graph-repairs/informatics-e25-terminal-reference-2026-11-06/verify_candidate.py
```

Er prüft Artefakt-/Quellpins, feste Reihenfolge, 25 vollständige Bindungen, Rubrikarithmetik und die gebundenen Ausführungsergebnisse. Er ersetzt keinen unabhängigen Inhaltsreview. Für eine erneute Ausführung der Referenzmodelle das Referenzverzeichnis in ein eigenes temporäres Verzeichnis kopieren: Die Programme schreiben ihre Ergebnisse neben ihre eigenen Dateien. Node-/Python-/Browserbefehle und erwartete Exitcodes sind in `execution-receipt.json` dokumentiert; beim nativen Draftcheck ist die Kandidaten-JSON als zweites Argument anzugeben. Der Chromium-Test benutzt die vorhandene lokale Playwright-Installation des Repositorys und lädt ausschließlich die eigene lokale Modellseite.
