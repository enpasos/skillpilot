# Chinesisch Exam Pipeline

Das Curriculum `DE_HES_S_GYM_2_CHINESISCH.de.json` ist aktuell bewusst **kein**
kanonisches Abitur-Release-Artefakt wie Mathematik, Physik oder Deutsch.

Unter `abi/Chinesisch/` liegt daher derzeit **keine Offer-/Master-Pipeline**, sondern
nur die dokumentierte Quellenlage fuer diesen Sonderfall.

## Aktueller Modellierungsstand

- `DE_HES_S_GYM_2_CHINESISCH.de.json` ist eine sauber modellierte Practice-/Skill-Landscape.
- Die Datei enthaelt:
  - `sourceRef` und offizielle `resourceLinks` am Root
  - lokale Uebungsanker `E-Q4`
  - materialgestuetzte Practice-Aufgaben mit `examData`
- Es gibt bewusst **keine** Release-Anker `abi_gk_offer_2026` / `abi_lk_offer_2026`.

## Warum keine ABI-Offer-Pipeline?

Die verfuegbaren offiziellen Hessen-Quellen liefern fuer 2026 derzeit **keine belastbare
schriftliche Landesabitur-Struktur fuer Chinesisch** in der hier benoetigten Form.

Statt eine pruefungsnahe Offer-Struktur zu raten, bleibt Chinesisch deshalb vorerst:

- runtime-faehige Skill-Landscape
- mit Practice-Aufgaben
- aber ohne künstlichen Offer-/Master-Layer

## Trigger fuer einen spaeteren Ausbau

Ein echter ABI-Stack unter `abi/Chinesisch/` wird erst angelegt, wenn mindestens eines
der folgenden Artefakte vorliegt:

- ein offizieller Abiturerlass mit explizitem Chinesisch-Abschnitt
- eine belastbare offizielle Aufgabenstruktur fuer schriftliche 2026-Pruefungen
- eine andere gleichwertige Hessen-Quelle, aus der `slot_matrix.json`,
  `coverage_requirements.json` und Offer-Anker sauber abgeleitet werden koennen

Bis dahin bleibt die Praxisregel:

- **Practice ja**
- **künstliche ABI-Offers nein**
