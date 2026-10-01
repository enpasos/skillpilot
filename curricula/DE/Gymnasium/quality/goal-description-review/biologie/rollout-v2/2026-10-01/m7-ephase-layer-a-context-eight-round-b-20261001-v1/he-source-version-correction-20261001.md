# Korrektur zur HE-Seitenbindung des vorläufigen Reviews v1

Die Aussage „Mapping S. 33/34 ist falsch“ im vorläufigen Review v1 ist ohne
Quellenversion zu grob. Am 01.10.2026 wurden **beide amtlichen PDFs** live
geprüft:

| Amtliche Version | Beleg | E-Phasen-Seiten |
| --- | --- | --- |
| [Ausgabe 2024 unter `/2024-11/`](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-biologie.pdf), 47 PDF-Seiten | Dies ist die in der bestehenden HE-Extraction gespeicherte `sourceDocument.url`. | E.1 gedruckte S. 33/34, E.2 und E.3 S. 34; alte Mapping-Rationales sind **für diese Version** seitengenau. |
| [Ausgabe 2024, Stand 01.08.2025 unter `/2025-10/`](https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf), 49 PDF-Seiten | Die [aktuelle amtliche KCGO-Übersicht](https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula/gymnasiale-oberstufe-ab-schuljahr-20242025-kerncurricula) verlinkt diese Fassung; sie entspricht dem lokalen PDF `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf`. | E.1 gedruckte S. 35/36, E.2 und E.3 S. 36. |

Der aktuelle Quellenabgleich muss **Fassung und Seiten zusammen** binden.
Es wäre falsch, in einem Mapping mit alter `/2024-11/`-URL lediglich die
Seitenzahl auf 35/36 zu ändern. Historische Artefakte bleiben unverändert;
eine neue, ausdrücklich auf 2025-Stand bezogene Bindung ist erforderlich.
Die fachlichen Unterschiede der Split-Befunde für `2517be3f`/`c5435624`
werden dadurch nicht aufgehoben: Die beiden E.3-Inhalte sind auch in der
älteren amtlichen Version getrennt aufgeführt.
