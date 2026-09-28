# Q2 Raumgeometrie: enger Authoring-Vorschlag nach v2-PDF-Verlust

Status: fachliche **Kandidaten**, keine Freigabe oder operative Änderung. Die v2-A/B-Records und `substantive-synthesis-candidates.md` waren Hinweise für diese Auswahl; ihre exakte PDF-Bindung ist lokal nicht wiederherstellbar. Sie werden weder übernommen noch auf einen neuen PDF-Hash umetikettiert. Eine neue Review-Bindung kommt erst bei gezieltem Integrationsbedarf in Betracht.

Quellenbasis: der lokal gebundene HMKB-KCGO-Mathematik-PDF-Hash `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`, gedruckte Seiten 42–43, und die [amtliche Ausgabe 2024](https://www.fortbildung.kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf). Die Seite 42 nennt Gerade–Ebene-Lage und Durchstoßpunkte (Spiegelstrich 7), die drei Winkelpaare (3 und 8), parameterabhängige Winkel/Lagen (9) und den Punkt–Ebene-Lotfuß (10). Der aktuelle kanonische Stand ist `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json` am 26.09.2026.

## Vier eng begrenzte Kandidaten

1. `baf7276f-60a0-4d96-b959-d63acfb929de` — **nur `sourceRef` ergänzen**: `HMKB Kerncurriculum Mathematik gymnasiale Oberstufe, Q2.3, S. 42, Spiegelstrich 7`. DE/EN-Titel und -Beschreibung bleiben wie heute. Der Quellpunkt nennt das Bestimmen von Gerade–Ebene-Durchstoßpunkten ausdrücklich; drei benachbarte, fachlich zugehörige Ziele zitieren bereits denselben Spiegelstrich. Die HE-Quelle allein belegt damit noch keine anderen Bundesländer und ändert keine Jurisdiktionszuordnung.

2. `18be713b-7d90-4f01-b60a-5582ac4df0e8` — **Objektpaare des Schnittwinkels benennen**, bestehender `sourceRef` S. 42, Spiegelstriche 3 und 8 bleibt:
   - DE: „Die lernende Person kann Schnittwinkel zwischen zwei Geraden, einer Geraden und einer Ebene sowie zwei Ebenen berechnen und geometrisch deuten, wenn die jeweiligen Objekte sich schneiden.“
   - EN: “The learner can calculate and geometrically interpret the intersection angle between two lines, a line and a plane, or two planes when the respective objects intersect.”
   - Die aktuelle Formulierung „geometrische Objekte“ lässt die in der Quelle getrennt genannten Paare offen. Der Vorschlag bewahrt Berechnung, Deutung und tatsächliche Schnittlage; er macht keine allgemeine Winkelkompetenz für parallele/identische Objekte daraus.

3. `5f90df42-8a71-534d-b995-b8f7dcaf1661` — **nur die Gültigkeitsbedingung der Parameterwerte explizit machen**, bestehender `sourceRef` S. 42, Spiegelstrich 9 bleibt:
   - DE: „Die lernende Person kann in räumlichen Konfigurationen mit einem zusätzlichen Parameter Winkel zwischen einer Geraden und einer Ebene sowie zwischen zwei Ebenen untersuchen und zulässige Parameterwerte bestimmen, für die eine vorgegebene Winkel-, Orthogonalitäts-, Parallelitäts- oder Lagebedingung erfüllt ist.“
   - EN: “The learner can analyze, in spatial configurations with an additional parameter, angles between a line and a plane and between two planes, and determine admissible parameter values for which a specified angle, orthogonality, parallelism, or positional condition is satisfied.”
   - „Zulässig“ verlangt nur, algebraische Kandidaten gegen die definierten Geraden/Ebenen und die Ausgangsbedingung zu prüfen. Sonderfälle und Transfer bleiben im P-Profil statt als neue Teilziele im kanonischen Satz.

4. `79c4cd21-af64-5925-968e-9bc1f74cd0ad` — **die schon verlangte geometrische Begründung konkretisieren**, bestehender `sourceRef` S. 42, Spiegelstrich 10 bleibt:
   - DE: „Die lernende Person kann ein Lotfußpunktverfahren erarbeiten und anwenden, um den Abstand eines Punktes von einer Ebene als Lotlänge zu bestimmen und zu begründen, warum dies der kürzeste Abstand ist.“
   - EN: “The learner can develop and apply a perpendicular-foot method to determine the distance from a point to a plane as the length of the perpendicular segment and explain why this is the shortest distance.”
   - A sagte `keep`, B `revise`; dieser kleine Wortlautvorschlag löst den Dissens nicht automatisch. Punkt–Ebene und Erarbeiten/Anwenden bleiben erhalten; das aktive P-Profil behandelt die kürzeste Lotverbindung bereits als Verständnisgegenstand.

## Exakt betroffene Bindungen bei einer späteren Anwendung

| Änderung | Erneut zu binden oder zu prüfen |
|---|---|
| `sourceRef` bei `baf7276f…` | Der direkte kanonische Quellenbezug und die `sourceRef`-Metadaten der D-Review-Eingabe (`round-a/description-review-input.json`, `round-b/description-review-input.json`) ändern sich; neue A/B-Inputs und deren Fingerprints wären nötig. `sourceRef` gehört **nicht** zum GoalBook-Seitenmodell oder den aktuellen P-/Semantic-kind-/Atomicity-/Memory-Fingerprint-Payloads. Keine alte v2-Review- oder Quellenfreigabe umschreiben. |
| DE/EN-Beschreibung bei `18be713b…`, `5f90df42…`, `79c4cd21…` | Jeweils neuer `goalFingerprint` und `pageFingerprint`, neues Teil-BookModel, HTML/PDF/Bündel und neue D-Eingabe samt unabhängigen A/B-Records; die v2-Artefakte und `dual-summary.json` bleiben historisch. Für keine der vier IDs ist aktuell ein zentral eingebundener strikter D-Resolution-Index vorhanden. |
| Dieselben drei Beschreibungen | Betroffene Zielzeilen in `curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json`, `quality/semantic-atomicity/canonical-math-full.review.jsonl` und `quality/memory-card-review/canonical-math-full.review.jsonl` erhalten neue semantische Fingerprints und brauchen fachlich gültige Neuprüfung statt Hashkosmetik. Die `description`-Zeilen in `quality/goal-visualization-qa/mathematik.qa.json` und die Bild-Text-Passung sind erneut zu prüfen; Bilddatei-Hashes bleiben davon unabhängig. |
| `5f90df42…` und `79c4cd21…` | Die aktiven P-v2-Records `quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/rest-8cb.review.jsonl` bzw. `quality/goal-evidence/m7-q2-angle-image-hold-p-retention-20260924-v1/retained-image-bound-twelve.review.jsonl` verlieren ihre bisherigen Ziel-/Review-Input-Fingerprints. Die kanonischen Bild-`altText`-Felder wiederholen derzeit die alten Beschreibungen und müssten inhaltlich synchronisiert und neu gebunden werden. `18be713b…` hat derzeit keinen zentral aktiv eingebundenen P-v2-Record und kein Bild; sein schon berichteter P-Fingerprint-Hold bleibt offen. |

Nicht in diese enge Auswahl aufgenommen: `8eb14d81…` hat keinen direkten `sourceRef`, ist aber derzeit GK/LK getaggt, während der herangezogene allgemeine Abstandsteil auf S. 43 als LK ausgewiesen ist; Quellen-/Geltungsprüfung zuerst. `0f4f9957…` hat einen Titel-/Beschreibungskonflikt über Gerade–Ebene versus Ebene–Ebene. `c2c49659…` hat eine offene semantische Atomaritätsfrage trotz alter `atomic`-Ledgerentscheidung. Bei `fcd1d180…`, `a97c7cce…` und `985d5529…` lässt das LK-Quellwort „allgemein“ das Spiegelobjekt offen; „an einer Ebene“ wäre ohne weitere Klärung eine mögliche Verengung. Für diese Fälle wird hier kein Ersatztext vorgeschlagen.

Dieser Vorschlag ändert keine kanonischen Ziele, Registry, P-/A-/M-/V-Ledger, Review- oder Release-Artefakte. **Strikter D-Zuwachs: 0.** Bei einer tatsächlichen kanonischen Änderung sind die aktuellen Quellen- und Fingerprintbindungen, Curriculum-Quality-Status, konkrete CQR-Fehler und geschützte Maturity-Floors im selben Änderungsschritt zu prüfen; diese Authoring-Notiz führt keine solchen Gates aus.
