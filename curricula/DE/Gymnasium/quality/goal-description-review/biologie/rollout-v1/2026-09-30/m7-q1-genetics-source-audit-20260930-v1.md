# Biologie Q1: gezielte Quelleninventur für das nächste M7-Paket

Stand: 30.09.2026. Dies ist eine maschinelle Quelleninventur, keine D-, P- oder
menschliche Freigabe. Geprüft wurde das tatsächlich vorliegende amtliche PDF
`curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf`,
gedruckte Seiten 38–40, gegen die aktuelle kanonische HE-Provenienz und die
versionierte HE-Source-Extraction. Andere Länderbelege sind damit nicht geprüft.

## Fixierter Q1-Zwölfer als D/P-Kandidat

| Ziel-ID-Präfix | HE-Punkt im Extraction-Mapping | Amtlicher Kern im PDF | Aktueller V-Stand |
| --- | --- | --- | --- |
| `0daa79f6` | Q1.1.1, GK/LK | DNA-Aufbau und semikonservative Replikation, S. 38 | Bild fehlt |
| `475eebb4` | Q1.1.2, GK/LK | Transkription und Translation, S. 38 | Bild fehlt |
| `ffef97e3` | Q1.1.4, GK/LK | Genmutationstypen, S. 38 | Bild fehlt |
| `946ce2e7` | Q1.2.9, GK/LK | eukaryotische Genregulation und DNA-Methylierung, S. 39 | Bild fehlt |
| `8f6933b1` | Q1.2.4, LK | Histonmodifikation, S. 39 | korrigierter PNG-Kandidat, noch nicht importiert |
| `ceb54223` | Q1.2.8, LK | RNA-Interferenz, S. 39 | korrigierter PNG-Kandidat, noch nicht importiert |
| `5b2571d9` | Q1.2.5, LK | Bakterienbau als Schema, S. 39 | Bild fehlt |
| `8eb86a82` | Q1.2.11, GK/LK | Gelelektrophorese, S. 39 | Bild fehlt |
| `440854be` | Q1.3.1, GK/LK | Stammbaumanalyse, S. 39 | korrigierter PNG-Kandidat, noch nicht importiert |
| `73b66ead` | Q1.3.4, GK/LK | Gentest und Beratung, S. 39 | Bild fehlt |
| `3891b735` | Q1.3.5, GK/LK | Gentherapie im Prinzip, S. 39 | Bild fehlt |
| `f53d0a0b` | Q1.4.3, LK | CRISPR/Cas-Methode, S. 39 | korrigierter PNG-Kandidat, noch nicht importiert |

Die vier PNG-Kandidaten werden erst nach Import, tatsächlicher Sichtprüfung und
exakter QA-Bindung als V gezählt. Die acht übrigen Ziele bleiben V-offen.

## Aus diesem Paket herausgenommene HE-Grenzfälle

- `7975e43b`: Kanon/Extraction binden Operon plus Epigenetik an HE Q1.1.3;
  das amtliche Q1.1 auf S. 38 nennt dort stattdessen den Zusammenhang von
  genetischem Material, Genprodukten und Merkmalen. HE-Bindung gezielt prüfen.
- `e36bebef`: Kanontitel behauptet Bewertung genetischer Diagnostik,
  Beschreibung nur Erläuterung pränataler und molekularer Methoden. HE Q1.3
  auf S. 39 nennt Gentest und Beratung; die Methode der
  Präimplantationsdiagnostik steht in Q1.4. Zieltext/Quelle/Seite prüfen.
- `99544494` und `3b55b551`: Extraction ordnet Epigenetik und
  Chromatin-Remodelling HE Q1.5.3/.4 zu; amtliches Q1.5 auf S. 40 behandelt
  auf erhöhtem Niveau Telomere, entwicklungsabhängige Genaktivität und
  Homöobox-Gene. Histonmodifikation steht unter Q1.2 auf S. 39.
  HE-Projektion deshalb nicht ohne neue Quellenprüfung als gültig zählen.

Die Feststellung betrifft diese HE-Zuordnung, nicht automatisch andere
jurisdiktionale Belege oder die Existenz des Lernziels im Kanon.
