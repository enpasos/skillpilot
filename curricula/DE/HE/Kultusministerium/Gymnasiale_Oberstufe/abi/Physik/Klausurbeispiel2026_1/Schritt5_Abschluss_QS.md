# Schritt 5 - Abschluss-QS

Datum: 2026-02-06
Bezug:
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/checkliste.md`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/Physik_Hessen_2026_Klausurbeispiel_1.md`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/Physik_Hessen_2026_Klausurbeispiel_1_Musterloesung.md`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/abi_2026_physik_exam_blueprint.json`

Legende:
- `[x]` erfuellt
- `[~]` nicht anwendbar / nur bei Sonderfall
- `[!]` offenes Restrisiko

## 1) Checklistenabgleich Punkt fuer Punkt

### 1) Metadaten und Formalia

- [x] Jede Aufgabe hat eine eindeutige ID sowie Kennzeichnung fuer `GK` oder `LK`.
  Evidenz: Vorschlaege `A` bis `D` getrennt fuer GK/LK, Teilaufgaben nummeriert.
- [x] Jede Aufgabe und Teilaufgabe hat eine nachvollziehbare BE-Zuordnung.
  Evidenz: Aufgabenblatt mit BE je Teilaufgabe; Musterloesung mit identischer BE-Struktur.
- [x] Jede Aufgabe ist als materialgebundene Aufgabe konzipiert.
  Evidenz: Jeder Vorschlag hat Materialbloeke mit Tabellen/Daten/Angaben.
- [x] Operatoren passen zum beabsichtigten Anforderungsbereich.
  Evidenz: Mischung aus berechnen/ermitteln/erklaeren/beurteilen/modellieren.
- [x] Aufgaben innerhalb derselben Klausur sind unabhaengig.
  Evidenz: Jeder Vorschlag ist eigenstaendig loesbar.
- [x] Sprachliche Richtigkeit ist gewaehleistet.
  Evidenz: offensichtliche Tippfehler korrigiert (z. B. Prueffall, Sensor-Ion).
- [x] Wording ist unmissverstaendlich.
  Evidenz: klare Groessen, Einheiten und Arbeitsauftraege.

### 2) Pruefungsstruktur und Auswahlmodus

- [x] GK/LK Standard: vier Vorschlaege `A`, `B`, `C`, `D`; drei zu bearbeiten.
  Evidenz: explizit im Aufgabenblatt genannt.
- [~] Variante Schulen fuer Erwachsene (LK) ist dokumentiert (falls relevant).
  Bewertung: fuer dieses Standard-Klausurbeispiel nicht relevant; daher bewusst nicht umgesetzt.
- [x] Aufgabenstruktur ist explizit angegeben.
  Evidenz: eigene Abschnitte GK und LK plus Auswahlregel.
- [x] Gesamtumfang ist realistisch.
  Evidenz: GK 25 BE je Vorschlag, LK 30 BE je Vorschlag, materialgebundene Struktur.

### 3) Inhaltsabdeckung laut Erlass

- [x] Q1.1 Elektrisches Feld ist abgedeckt.
- [x] Q1.2 Magnetisches Feld ist abgedeckt.
- [x] Q1.3 Induktion ist abgedeckt.
- [x] Q2.1 Schwingungen ist abgedeckt.
- [x] Q2.2 Wellen ist abgedeckt.
- [x] Q2.3 Wellen an Grenzflaechen ist abgedeckt.
- [x] Q3.1 Eigenschaften von Quantenobjekten ist abgedeckt.
- [x] Q3.2 Atommodelle ist abgedeckt.
- [x] Q3.3 Roentgenstrahlung ist abgedeckt.
- [x] In Q3.2 ist der Begriff `Energiestufenmodell` explizit enthalten.
- [x] LK-Erweiterung (Moseley) ist enthalten.
  Evidenz: LK Vorschlag C, Teilaufgabe 4.

### 4) Aufgabenqualitaet und Niveau

- [x] Stil entspricht LEIFI-typischem Abiturniveau.
  Evidenz: mehrschrittige, kontextgebundene Aufgaben mit Deutung.
- [x] Reine Schema-F-Aufgaben ohne Deutung sind vermieden.
- [x] Mathematische Schritte sind fachlich angemessen.
- [x] Zahlenwerte sind plausibel und physikalisch sinnvoll.
- [x] Einheiten, Groessenordnungen und Rundungen sind konsistent.

### 5) Originalitaet und Quellenhygiene

- [x] Keine woertliche Uebernahme aus LEIFI-Aufgaben.
  Bewertung: automatisierter Vergleich gegen alle 385 Markdown-Dateien in `.../input/leifiphysik_abitur_md` wurde durchgefuehrt.
  Evidenz (Report in `tmp/physik_similarity_report.md` und `tmp/physik_similarity_report.json`):
  - 8-Gram-Containment (mit Stopwortfilter) fuer beide Zieltexte: max. `0.0000`
  - Satz-Overlap (>= 6 Token): max. `0.0000`
  - Sensitiver Zweitlauf (5-Gram ohne Stopwortfilter): max. Containment `0.0013` (2 geteilte 5-Grams), sonst nur Einzel-5-Gram-Treffer.
  Fazit: keine Hinweise auf kopierte Aufgaben-/Loesungspassagen.
- [x] Kontexte, Zahlenwerte und Fragelogik sind eigenstaendig formuliert.
- [x] Bei aehnlichen Fachideen ist Eigenleistung erkennbar.
- [~] Bild-/Lizenzdokumentation ist vorhanden (falls Bilder genutzt werden).
  Bewertung: keine externen Abbildungen im Aufgabenentwurf enthalten.

### 6) Hilfsmittel und Dokumentationsregeln

- [x] Erlaubte Hilfsmittel aus Erlass sind beruecksichtigt.
- [x] Keine implizit unerlaubten Hilfsmittel notwendig.
- [x] Schreibweise und Loesungsdokumentation sind eingehalten.
- [x] Musterloesung enthaelt nachvollziehbare Begruendungen, nicht nur Endwerte.

### 7) Konsistenz von Aufgabe, Musterloesung und BEs

- [x] Jede Teilfrage ist in der Musterloesung beantwortet.
  Evidenz: 35 Teilaufgaben in Aufgabe und 35 in Musterloesung.
- [x] Jeder BE ist klarer Teilleistung zugeordnet.
- [x] Musterloesung ist fachlich konsistent und nachvollziehbar.
- [x] Deutungen/Interpretationen sind sichtbar bepunktet.

### 8) Abschluss-QS vor Freigabe

- [x] Vollstaendiger Checklistenabgleich wurde durchgefuehrt.
- [x] Selbstpruefung pro Vorschlag ist dokumentiert (siehe Abschnitt 2).
- [x] GK/LK sind klar getrennt und konsistent beschriftet.
- [x] Finale Plausibilitaetspruefung ist dokumentiert.

## 2) Selbstpruefung pro Vorschlag

### GK Vorschlag A

- Staerken: klare Materialbindung, gute Mischung aus Rechnen und Bewertung.
- Risiken: lineare Naeherung bei Material 2 koennte je nach Ausgleichsmethode leicht variieren.
- Schwierigkeitsgrad: AB1-AB2, solide GK-Mitte.

### GK Vorschlag B

- Staerken: Schwingung, Resonanz und Brechung in einem konsistenten Kontext.
- Risiken: Trigonometrische Brechungsbeziehung muss in Formelsammlung eindeutig sein.
- Schwierigkeitsgrad: AB1-AB2.

### GK Vorschlag C

- Staerken: explizites Energiestufenmodell, quantitativer und konzeptueller Anteil.
- Risiken: Zuordnung realer Linien zu vereinfachtem Modell ist nur naeherungsweise.
- Schwierigkeitsgrad: AB2 mit klaren AB1-Anteilen.

### GK Vorschlag D

- Staerken: klassischer Q3.3-Kontext mit Modellierung und Unsicherheitsbewertung.
- Risiken: Absorptionskoeffizient je nach Punktwahl/Regression leicht streuend.
- Schwierigkeitsgrad: AB1-AB2.

### LK Vorschlag A

- Staerken: verbindet Feldrechnung, Induktion und Herleitung `v = E/B`.
- Risiken: Modellgrenzen muessen im Erwartungshorizont offen genug bewertet werden.
- Schwierigkeitsgrad: AB2-AB3.

### LK Vorschlag B

- Staerken: deutlicher LK-Mehrwert durch Daempfungsparameter und Modellreflexion.
- Risiken: qualitative Modellierung kann unterschiedlich tief ausfallen.
- Schwierigkeitsgrad: AB2-AB3.

### LK Vorschlag C

- Staerken: sauberer Uebergang von Fotoeffekt zu Energiestufen plus Moseley-Erweiterung.
- Risiken: kleine Datenbasis bei Moseley, entsprechend nur einfache Schaetzung.
- Schwierigkeitsgrad: AB2-AB3.

### LK Vorschlag D

- Staerken: realistischer Technikbezug (CT), quantitative und bewertende Teile ausbalanciert.
- Risiken: Nachweisbarkeitsdiskussion haengt von gewaehltem Unsicherheitsmodell ab.
- Schwierigkeitsgrad: AB2-AB3.

## 3) Offene Risiken / Restunsicherheiten

- Ein algorithmischer Aehnlichkeitscheck deckt vor allem woertliche bzw. stark textnahe Uebernahmen ab; rein semantische Naehe ohne Textuebernahme ist prinzipbedingt nie vollstaendig ausschliessbar.
- Sonderfall "Schulen fuer Erwachsene" wurde nicht als eigene LK-Variante ausformuliert (bewusst nicht im Standardbeispiel).

## 4) Freigabestatus

- Empfehlung: **freigabefaehig mit den oben dokumentierten Resthinweisen**.
- Der naechste sinnvolle Schritt ist eine finale didaktische Gegenlese (Fachkollegium) und danach die Markierung als finale Version.
