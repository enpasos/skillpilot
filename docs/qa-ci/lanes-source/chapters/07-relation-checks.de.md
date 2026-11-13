## Prüfung der Requires-Relationen {#sec:qal-relation-checks}

Dieses Kapitel dient als stabiler Kompatibilitäts-Einstiegspunkt für Verweise auf die strukturellen Relationsprüfungen.

Der vollständig gepflegte Regelkatalog befindet sich in [Graph-Validierungsregeln (`GVR`/`APV`/`CPV`)](repo:docs/qa-ci/graph-validation-rules.md) in Band IV des Qualitätshandbuchs. Maßgeblich dort dokumentiert sind:

- sämtliche implementierten Validatorregeln (`GVR-*`, `APV-*`, `CPV-*`),
- die ausnahmslose Durchsetzung als Fehler (`npm run validate:graph`),
- die Sperre für atomare Normalform und transitive Minimalität im vollständigen Katalog (`npm run check:transitive-minimality`, alle 21 kanonischen Wurzeln).

Es gibt keinen umgebungsabhängigen Warnmodus. Die ausgemusterten Kennungen `GVR-004`, `GVR-005`, `GVR-006` und `GVR-013` bleiben für historische Nachweise reserviert.

Die direkte Sperre `npm run check:curriculum-maturity-floors` prüft zusätzlich fest gebundene Fach- und Scope-Verpflichtungen gegen die mit `--base-ref` gewählte Git-Basis: beim PR dessen Basis-SHA, beim Push dessen vorherige SHA und lokal `origin/main`. Beide direkten Sperren laufen im vollständigen Job `graph-validation` und in der lokalen Curriculum-Suite.

Für das inhaltlich-didaktische Review einzelner Voraussetzungskanten siehe ergänzend den manuellen Voraussetzungs-Reviewprozess in @ref{sec:qal-requires-review}.
