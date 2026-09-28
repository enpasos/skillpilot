# `baf7276f…`: LK-Voraussetzung bei GK/LK-Schnittpunktziel

Stand 27.09.2026. **Nur Audit und Patchvorschlag; keine kanonische Änderung.**

## Befund

`baf7276f-60a0-4d96-b959-d63acfb929de` („Schnittpunkte von Geraden mit Ebenen berechnen“) ist `GK`/`LK` getaggt. Unter seinen sechs direkten `requires` steht `36e0de23-1e3b-5c69-888f-e5e19e79cbbe` („Normalenform und Hessesche Normalenform einer Ebene anwenden (LK)“). Die HE-Quelle Q2.3, **Druckseite 42, Spiegelstrich 7**, verlangt Gerade–Ebene-Lage und Durchstoßpunkt im GK und LK, insbesondere mit Koordinatengleichung. Die Normalenform ist separat erst im **LK-Teil auf Druckseite 43, Spiegelstrich 12** genannt. Die direkte BB-Quellenverknüpfung von `baf7276f…` ist `partial` zu „Geraden und Ebenen analytisch beschreiben und Lagebeziehungen ... untersuchen“, `courseLevel: GK/LK`; sie trägt keine Hesse-Form-Pflicht.

Mathematisch reicht bei `g(t)=p+t·v` und `E:n·x=d` das Einsetzen: `(n·v)t=d−n·p`. Ist `n·v≠0`, erhält man den eindeutigen Schnittpunkt; sonst entscheidet die Punktprobe zwischen Gerade-in-Ebene und getrennter Parallelität. Dafür sind weder eine normierte Normale noch Hessesche Normalenform erforderlich. Schon vorhandene GK/LK-Voraussetzungen von `baf7276f…` umfassen parametrisierte Geraden, Ebenengleichungen/-formen, Punktprobe und Ebenenbildung. Das benachbarte, HE-exakt zugeordnete `3def350a…` prüft denselben Schnittpunkt mit nur parametrisierter Gerade und Ebenengleichung als Voraussetzungen. Die Identitätsüberschneidung dieser beiden Ziele bleibt eine **separate** D-Entscheidung; sie rechtfertigt die fachlich unpassende LK-Kante nicht.

## Tatsächliche GK-Projektion und Risiko

Die aktuelle Runtime-Projektion wurde für alle **40** Mathematik-Kompositionsansichten mit `scope.courseProfile=GK` über `normalizeCompositionView`, `applyCompositionViewProjection`, `collectCompositionProjectionRoleGoalIds` und `buildVisibleChildrenMap` geprüft. `baf7276f…` ist in **0/40** GK-Ansichten als `target` oder sichtbares Kind enthalten; der LK-Vorgänger ist dort ebenfalls nicht sichtbar. Das belegt **keine aktuelle GK-Frontier-Blockade** durch diese Kante. In zwei BW-LK-Ansichten ist `baf7276f…` dagegen `target`. Sollte das Ziel künftig in einen GK-Target-Scope aufgenommen werden, wertet `LearnerService.getFrontier` direkte, im strukturellen Graphen vorhandene, aber weder Target noch `prerequisiteOnly` genannte Anforderungen bei Kompositionsansichten **fail-closed**; die LK-Kante wäre dann eine echte Zugangsbarriere. Das ist ein latentes Graphmodellierungsproblem, nicht ein hier nachgewiesener Produktionsausfall.

## Kleinster kanonischer Patchvorschlag

Nur in `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`, beim Ziel `baf7276f…`, den einen Eintrag

```diff
     "fa02cf14-0411-4fe3-8be7-a62c69743e26",
-    "36e0de23-1e3b-5c69-888f-e5e19e79cbbe",
     "d76766a5-ce07-5c7a-987b-157f2998b05e",
```

aus `requires` entfernen; **keine Ersatzkante** hinzufügen. ID, Texte, Tags, `contains`, Bild und Quellenzuordnung bleiben unverändert. Dieser Patch ist fachlich enger als ein pauschales Entfernen anderer Voraussetzungen und vermeidet eine unbelegte neue Leistung.

## QA-Folgen vor Integration

Die `goal-evidence-v1`-Semantikfingerprints für P lassen `requires` aus, aber `goalEvidenceReviewInputPayload` bindet die sortierten `requires` ein. Deshalb bleibt der P-**Profilinhalt** fachlich passend, der aktuelle P-**Review-Input-Fingerprint** von `baf7276f…` würde aber ungültig. Nur gezielte neue Bindung mit überprüftem aktuellem Input und wahrheitsgemäßem `ai_candidate`-/`needs_human_review`-Status, kein bloßer Hash-Tausch. Die D-Kanonikkontext-/Buchseite bindet `requires` ebenfalls; `baf7276f…` ist ohnehin D-offen und müsste auf dem neuen Kontext mit zwei unabhängigen Runden und Synthese geprüft werden. A- und M-Fingerprints binden dagegen Texte/semantische Felder, nicht `requires`; die bestehenden Entscheidungen sollten sich unverändert nachweisen lassen. Das V-Asset bleibt bytegleich und sein fachlicher Inhalt wird durch die Kantenentfernung nicht verändert, doch die QA-Bindung ist gezielt zu prüfen. Ziel-IDs/Denominator, Quellmappings und menschliche Freigaben ändern sich nicht.

Gezielte Checks nach einer tatsächlichen Integration: Canonical-GK/LK-Prerequisite-Audit für das Ziel, D-Review-Input-/Resolution-Check für die betroffene Seite, P-v2-Review-Check nur für `baf7276f…`, A/M- und V-Statuscheck auf unveränderte gültige Bindungen, Goal-Book-Modell/Publikation sowie zentraler Fünf-Gate-Bericht und Curriculum-Status auf unveränderte Schutzuntergrenzen. Erst wenn diese Nachweise grün sind, kann die Kante als repariert gelten.
