# Zwei vorhandene enge Memory-Einheiten in Hessen ergänzen

Status: **inaktiver Author-Kandidat; unabhängige Prüfung steht aus**.

Der eingefrorene HE-Kandidat enthält 636 Ziele, davon 436 fachliche Einzelziele
und 58 Memory-Ziele. Die tatsächliche Kursprojektion hatte vier Memory-Lücken
für zwei fachliche Ziele. Fachliche Notwendigkeit, passende Karten und enge
Memory-Einheiten sind bereits vorhanden und werden nicht neu entschieden.

| Fachliches Ziel | Vorhandene enge Memory-Einheit | Tatsächlich ausgewählte Karte | Ergänzte Sichten |
| --- | --- | --- | --- |
| Löslichkeitsgleichgewichte interpretieren (`ac1bcf34-169c-5339-92ba-efe8c3022560`) | Löslichkeitsprodukt abrufen (`be848fa1-8f52-5099-923f-79b776f07f2f`) | `chem_eq_q3_011` | Hessen GK: CrossStage und SekII |
| Arrhenius-Beziehung anwenden (`e62c6c58-b688-59c3-8ac5-2cfc26ac22d7`) | Arrhenius-Beziehung und lineare Steigung abrufen (`50ea4d12-6da8-5a56-a79f-f518e105efd7`) | `chem_eq_q3_010` | Hessen LK: CrossStage und SekII |

Der Kandidat hängt genau einen `goalEntry` mit `projectionRole: "target"` an
den jeweils vorhandenen Abschnitt zur Festigung von Gleichgewichts- und
Elektrochemiebegriffen an. Die Memory-Einheiten erfordern jeweils nur ihr bereits
sichtbares fachliches Ursprungsziel. Sie ergänzen gezielten Abruf nach dem
Erwerb; sie bescheinigen weder fachliches Verständnis noch eine Lernleistung.
Insbesondere entsteht keine Arrheniuspflicht im GK und keine Pflicht zum
breiten elfteiligen Gleichgewichtsdeck.

## Tatsächlich geprüft

- Unveränderte Stock-Compilation mit allen **82** Chemie-Mappingdateien:
  **0 Fehler**. Beide engen Einheiten haben bereits über `memory-review-origin`
  kompilierte Geltung für `DE-HE`; keine Änderung ihrer Zielobjekte ist nötig.
- Stock-Kompositionsprüfung und tatsächliche Projektions-/Baum-/Kursfilterung
  für alle **39** Sichten, jeweils vorher und nachher: **0 Kompositionsfehler**.
- Tatsächlicher unveränderter SRS-Filter aus `FlashcardDrill.tsx` und
  `getSrsFilterTags`: jede enge Einheit wählt **genau ihre eine genannte Karte**.
- Vier tatsächliche Sichtbarkeitslücken werden zu **0**. In allen 39 Sichten
  bleiben fachliche Zielmengen und fachliche sowie Memory-Vorbedingungen exakt
  erhalten. Kein vorher sichtbares Memory-Ziel entfällt. Nur die vier oben
  benannten Einträge kommen hinzu.
- Kanonische Zielobjekte, M436-Entscheidungen, Karten und die eingefrorene
  Quellkapsel bleiben unverändert. Der volle Scope von 436 fachlichen Zielen
  darf nicht mit der Vereinigung der engeren Kursansichten verwechselt werden;
  eine falsche Verifier-Annahme dazu ist als erster Versuch dokumentiert.

Das ist eine geprüfte technische Author-Vorbereitung und **kein vollständiger
M436-Check oder M7-Abschluss**. Der getrennte QA-Fehler für ungefilterte
LK-Ziele in GK-Sichten wird in einem anderen Paket behoben. Unabhängige Prüfung
und Integration dieser vier Datenplatzierungen stehen aus. Menschliche
Freigabe oder Erprobung werden nicht behauptet.

## Integration

`CAS.four-whole-views-existing-narrow-memory-placement.author-inactive.json`
enthält die vollständigen Vorher-/Nachher-Objekte, normalisierten Whole-View-
Fingerprints und exakten Dateien. Jede Operation darf nur auf ihrem exakten
Vorher-Objekt aufsetzen. Die vier Vorher-Sichten stammen aus dem eingefrorenen
HE-Kandidaten mit Canonical-SHA
`8ee85c5a6e6cc9de4a65cea2583dcfba6764f25f2febdf68162a188d9083d974`.
Die ursprünglichen Erwerbsscope-Metadaten der beiden Memory-Ziele bleiben als
Geschichte unverändert; die vier zusätzlichen Erwerbssichten sind hier und im
CAS ausdrücklich dokumentiert.

Der mitgelieferte `author_and_verify.mts` wurde einmal erfolgreich gegen diese
Eingaben ausgeführt. Die Ergebnisdateien werden versiegelt erhalten; ein neuer
Ausführungsstand gehört in ein neues Nachweispaket.
