# QS-Checkliste Abitur Mathematik Hessen 2026

Bezug: la26_abiturerlass_mathe.txt, SkillPilot_Niveausteuerung_Mathe_Hessen.md, abi_2026_mathe_exam_blueprint.json

## 1) Metadaten und Formalia

- [ ] Jede Aufgabe hat eine eindeutige ID sowie course_level (GK/LK/LK_SfE), exam_part (A/B/C/D), domain (analysis/linalg_geo/stoch), niveau (1/2), allowed_tools und BE-Zuordnung.
- [ ] Jede Aufgabe und Teilaufgabe hat eine Angabe der BEs.
- [ ] Jede Aufgabe gibt das Niveau an.
- [ ] Operatoren passen zum beabsichtigten Niveau (AB1-AB3).
- [ ] Aufgaben sind innerhalb eines Prüfungsteils unabhängig (keine Abhängigkeiten zwischen Aufgaben).
- [ ] Sprachliche Richtigkeit (Rechtschreibung/Zeichensetzung) ist gewährleistet (Vorbildfunktion, vgl. OAVO).
- [ ] Wording ist unmissverständlich (keine Mehrdeutigkeiten in Auftrag, Bedingungen, Größen/Bezugssystemen).
- [ ] Fremdwörter außerhalb des Lernkontexts, die nicht vorausgesetzt werden können, sind kurz erklärt.

## 2) Struktur Teil 1 (hilfsmittelfrei, 5 BE je Aufgabe)

- [ ] GK: 9 Aufgaben angeboten (3 Pflicht Niveau 1: je Analysis/Linalg/Stoch; 3 Wahl Niveau 1; 3 Wahl Niveau 2).
- [ ] GK Auswahlregel: 5 Aufgaben bearbeiten (4 x Niveau 1 + 1 x Niveau 2).
- [ ] GK BE: 25 BE.
- [ ] LK: 10 Aufgaben angeboten (Pflicht Niveau 1: 2 x Analysis, 1 x Linalg/Geo, 1 x Stoch; Wahl Niveau 2: je 2 pro Sachgebiet).
- [ ] LK Auswahlregel: 6 Aufgaben bearbeiten (4 x Niveau 1 + 2 x Niveau 2).
- [ ] LK BE: 30 BE.

## 3) Struktur Teil 2 (mit Hilfsmitteln)

- [ ] GK: B1/B2 (Analysis) genau 1 wählen, C (Linalg/Geo) Pflicht, D (Stoch) Pflicht; BE: 25/15/15 (Summe 55).
- [ ] LK: B1/B2 genau 1 wählen, C Pflicht, D Pflicht; BE: 30/20/20 (Summe 70).
- [ ] LK_SfE (falls relevant): B1/B2 25, C 20, D 20 (Summe 65).
- [ ] Gesamt BE passt: GK 80, LK 100, LK_SfE 95.

## 4) Inhaltsabdeckung (Schwerpunkt laut Erlass/Blueprint)

- [ ] Analysis: Q1.1-Q1.4 sind abgedeckt (GK/LK).
- [ ] Linalg/Geo: GK Q2.1, Q2.2, Q2.3, Q2.6; LK Q2.1, Q2.2, Q2.3, Q2.4.
- [ ] Stochastik: Q3.1-Q3.4 (GK/LK).
- [ ] Nur LK SfE: Aufgaben der Analysis (Q1.1–Q1.4) orientieren sich am grundlegenden Niveau (GK).
- [ ] Spezielle Hinweise umgesetzt:
  - [ ] Q1.3: Grenzwerte von Funktionen kommen vor.
  - [ ] Lagebeziehungen (Q2.3/Q2.6) beinhalten Winkelberechnung.
  - [ ] GK: Q2.6 behandelt Normalenvektor einer Ebene.
  - [ ] Stochastik: inverse Fragestellungen (kumulierte Binomial- und Normalverteilung) mindestens einmal in Teil 2.

## 5) Niveausteuerung (Aufgabenschwierigkeit)

- [ ] Niveau 1: AB1-AB2, Standardverfahren, kurze Begründung; keine Kochrezept-Teilaufgaben.
- [ ] Niveau 2: AB2-AB3, mehrschrittig, mind. 1 Entscheidungspunkt, Begründung/Interpretation verpflichtend.
- [ ] LK-Aufgaben erfordern höhere Selbstständigkeit (Planen/Entscheiden/Begründen).
- [ ] Anti-Patterns vermieden (Methode vorgegeben, triviale Zahlen, reine Auswertung ohne Kontext).

## 6) Hilfsmittel, Dokumentation, Sprache

- [ ] Teil 1 ohne WTR/CAS; Teil 2 mit festgelegter Rechnertechnologie (WTR oder CAS).
- [ ] WTR-Grenzen beachtet: Polynomgleichungen max. 3. Grades, LGS max. 3 Unbekannte (sonst CAS erforderlich).
- [ ] Tool-Einsatz in Teil 2: Setup + Ergebnis + Interpretation/Plausibilitätscheck dokumentierbar.
- [ ] Schriftliche Lösungswege verwenden korrekte mathematische Schreibweise; keine rechnerspezifische Syntax.
- [ ] Erlaubte Hilfsmittel eingehalten; nicht erlaubte Hilfsmittel ausgeschlossen.

## 7) Qualitäts-Check und Niveau-/Komplexitäts-Tabelle

- [ ] Qualitäts-Check (Selbstprüfung) ist vorhanden und enthält konkrete, überprüfbare Aussagen zu Komplexität, Kontext und Fallen.
- [ ] Wo eine Darstellung sinnvoll ist (z. B. Geometrie/Sachkontext), ist ein Bild vorhanden; keine unnötigen Bilder.
- [ ] Niveau-/Komplexitäts-Tabelle (Abschnitt C) ist vorhanden und vollständig ausgefüllt.
- [ ] Qualitäts-Check und Tabelle sind konsistent mit Niveau, Teil (A/B/C/D), Domain und BE-Zuordnung der Aufgaben.

## 8) Konsistenz von Aufgabe, Musterlösung, BEs

- [ ] Der logische Fluss der Aufgaben ist fachlich korrekt (keine unzulässigen Sprünge, Annahmen und Verweise sind konsistent).
- [ ] Musterlösung ist fachlich korrekt und vollständig; jeder BE ist einer klaren Teilleistung zugeordnet.
- [ ] BE-Verteilung passt zur Aufgabenstruktur und zum geforderten Niveau.
- [ ] Rechenweg, Kontextdeutung und Einheiten sind konsistent.
