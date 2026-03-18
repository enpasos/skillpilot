# Offizielle Quellenlage: Chinesisch

## Verwendete Hessen-Quellen

- KCGO-Startseite Gymnasiale Oberstufe:
  - `https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula/gymnasiale-oberstufe-ab-schuljahr-20242025-kerncurricula`
- Kerncurriculum Chinesisch, Ausgabe 2024:
  - `https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-chinesisch.pdf`
- KCGO Chinesisch, fortgefuehrte Form:
  - `https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kcgo_chinesisch_2022.pdf`
- Landesabitur 2026, offizieller Erlass:
  - `https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-11/la26-abiturerlass.pdf`

## Arbeitsbefund

- In den verfuegbaren 2026-Landesabiturunterlagen gibt es keinen expliziten Chinesisch-Abschnitt,
  der eine schriftliche Offer-Struktur wie bei Mathematik, Physik, Chemie, Deutsch oder den
  modernen Fremdsprachen traegt.
- Die vorhandenen KCGO-Quellen sind fuer die allgemeine Landscape-Modellierung belastbar,
  aber nicht fuer eine abgeleitete schriftliche ABI-Pipeline mit `release`-Ankern.

## Konsequenz im Repo

- `DE_HES_S_GYM_2_CHINESISCH.de.json` wird als Practice-/Skill-Landscape gepflegt.
- Unter `abi/Chinesisch/` gibt es aktuell keine `slot_matrix.json`, keine
  `coverage_requirements.json` und keinen `task_bank.json`.
- Ein Ausbau zur echten Offer-/Master-Pipeline erfolgt erst bei neuer offizieller Quellenlage.
