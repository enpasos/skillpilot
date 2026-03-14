# Schritt 5 - Abschluss-QS

Datum: 2026-02-06
Bezug:
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_2/checkliste.md`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_2/abi_2026_physik_exam_blueprint_2.json`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_2/Physik_Hessen_2026_Klausurbeispiel_2.md`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_2/Physik_Hessen_2026_Klausurbeispiel_2_Musterloesung.md`
- Vergleichsbezug: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/Klausurbeispiel2026_1/`

Legende:
- `[x]` erfuellt
- `[~]` nicht anwendbar / nur Sonderfall
- `[!]` Restrisiko

## 1) Checklistenabgleich

### 1) Metadaten und Formalia

- [x] Eindeutige Vorschlaege A-D fuer GK und LK mit Teilaufgaben.
- [x] BE-Zuordnung je Teilaufgabe vorhanden.
- [x] Materialgebundener Aufbau in allen Vorschlaegen.
- [x] Operatorik AB1-AB3 plausibel verteilt.
- [x] Sprachlich klar und fachlich eindeutig.
- [x] Formeln durchgaengig in LaTeX gesetzt.

### 2) Pruefungsstruktur und Auswahlmodus

- [x] GK/LK: vier Vorschlaege, drei zu bearbeiten.
- [~] LK_SfE-Sondermodus nicht separat ausgearbeitet (Standardbeispiel).
- [x] Umfang realistisch (GK je 25 BE, LK je 30 BE).

### 3) Inhaltsabdeckung laut Erlass

- [x] Q1.1, Q1.2, Q1.3 enthalten (Vorschlag A).
- [x] Q2.1, Q2.2, Q2.3 enthalten (Vorschlag B).
- [x] Q3.1, Q3.2 enthalten (Vorschlaege C/D).
- [x] Q3.3 (LK) enthalten (Vorschlag D LK).
- [x] Begriff `Energiestufenmodell` explizit in GK/LK vorhanden.
- [x] Moseley-/Rydberg-Erweiterung im LK enthalten (Vorschlag C LK).

### 4) Aufgabenqualitaet und Niveau

- [x] Kontexte neu und materialgebunden.
- [x] Rechnen + Deuten + Bewerten kombiniert.
- [x] Zahlenwerte und Einheiten plausibel.
- [x] Lenz-Richtung explizit abgefragt (GK A).
- [x] Linearisierungsanforderung explizit enthalten (LK C).

### 5) Originalitaet und Quellenhygiene

- [x] Keine wörtliche Uebernahme aus LEIFI-Quellen vorgenommen (manuelle Neufassung).
- [x] Gegenueber Klausurbeispiel 1 klar neue Kontexte und Daten.
- [!] Restrisiko: ohne automatischen Aehnlichkeitsreport bleibt semantische Restnaehe nicht vollstaendig ausschliessbar.

### 6) Hilfsmittel und Dokumentationsregeln

- [x] Hilfsmittelhinweis wortlautnah enthalten.
- [x] Keine impliziten Zusatzhilfsmittel erforderlich.
- [x] Musterloesung mit nachvollziehbaren Rechen-/Deutungsschritten.

### 7) Konsistenz Aufgabe - Musterloesung - BE

- [x] Jede Teilaufgabe in Musterloesung beantwortet.
- [x] BE konsistent zwischen Aufgabenblatt und Musterloesung.
- [x] Rundungsregel explizit dokumentiert.

### 8) Kombinationsabdeckung mit Klausurbeispiel 1

- [x] GK-Kombination erweitert um Compton, Balmer-Auswertung, Doppler.
- [x] LK-Kombination erweitert um Transformatorwirkungsgrad, Schwebung, Halbwertsdicke.
- [x] Zusatzvorgabe "moeglichst viele Themengebiete ueber beide Beispiele" im Blueprint explizit dokumentiert.

## 2) Selbstpruefung je Vorschlag

### GK A

- Staerken: klare Dreifachabdeckung Q1.1/Q1.2/Q1.3; Lenz-Richtung plus Robustheitsbewertung.
- Risiken: lineare Fitparameter koennen je Regressionsmethode leicht variieren.
- Schwierigkeitsgrad: AB1-AB2.

### GK B

- Staerken: Kombination aus Schwingung, Doppler und Grenzflaechenbrechung.
- Risiken: Doppler-Formel muss in Schreibweise sicher erinnert werden.
- Schwierigkeitsgrad: AB1-AB2.

### GK C

- Staerken: echter Q3.1-Schwerpunkt (Compton) plus Energiestufenzuordnung.
- Risiken: numerische Genauigkeit bei keV-eV-Umrechnung.
- Schwierigkeitsgrad: AB2.

### GK D

- Staerken: Balmer-Serie operationalisiert, inkl. De-Broglie-Transfer.
- Risiken: Rydberg-Umstellung erfordert saubere Einheitenarbeit.
- Schwierigkeitsgrad: AB2.

### LK A

- Staerken: Feldanalyse + Induktion + Transformatormodell mit Wirkungsgrad.
- Risiken: mehrere Modellschritte koennen kumulativ Fehler erzeugen.
- Schwierigkeitsgrad: AB2-AB3.

### LK B

- Staerken: Daempfungskennwert, Guete, Grenzflaeche und Schwebung in einem konsistenten Diagnostikkontext.
- Risiken: Halbwertsbreiten-Approximation methodisch offen.
- Schwierigkeitsgrad: AB2-AB3.

### LK C

- Staerken: Compton-Test plus Moseley-Linearisation decken Q3.1/Q3.2 mit hoher Tiefe ab.
- Risiken: lineare Anpassung bei kleiner Datenbasis ist nur Naeherung.
- Schwierigkeitsgrad: AB2-AB3.

### LK D

- Staerken: Q3.3 mit Halbwertsdicke, Bragg und Nachweisbarkeitsbewertung.
- Risiken: Regressions-/Punktwahl kann leichte Abweichungen in $\mu$ liefern.
- Schwierigkeitsgrad: AB2-AB3.

## 3) Freigabestatus

- Aktueller Stand: **freigabefaehig als Entwurfsversion**.
- Offene externe Pruefung: optionale Fachgegenlese (Didaktik-/Operatorik-Feinschliff) sinnvoll.
