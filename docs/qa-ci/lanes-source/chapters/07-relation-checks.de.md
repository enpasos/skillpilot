## Prüfung der Requires-Relationen {#sec:qal-relation-checks}

Dieses Kapitel dient als stabiler Kompatibilitäts-Einstiegspunkt für Verweise auf die strukturellen Relationsprüfungen.

Der vollständig gepflegte Regelkatalog befindet sich in [Graph-Validierungsregeln (`GVR`/`APV`/`CPV`)](repo:docs/qa-ci/graph-validation-rules.md) in Band IV des Qualitätshandbuchs. Maßgeblich dort dokumentiert sind:

- sämtliche implementierten Validatorregeln (`GVR-*`, `APV-*`, `CPV-*`),
- das strikte Standard-Durchsetzungsprofil in der CI (`npm run validate:graph`),
- der lokale Warnmodus für Altbestands-Analysen (`VALIDATE_GRAPH_STRICT_RULES=0 npm run validate:graph`).

Für das inhaltlich-didaktische Review einzelner Voraussetzungskanten siehe ergänzend den manuellen Voraussetzungs-Reviewprozess in @ref{sec:qal-requires-review}.
