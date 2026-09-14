# Transistor: aktueller positiver Verständnisnachweis

Informierter Wiederverwendungsnachweis für
`7d4d6a39-0c78-5fb0-b7bf-182ed00972f7`, kein neuer Blindreview und keine
menschliche Freigabe. Der vollständige historische P-v2-Profilkörper und sein
Quellenunion-Dissens bleiben unverändert. Nur seine tatsächliche aktuelle
Kontextbindung wird nach fachlicher Prüfung wiederhergestellt.

- [Kontextaudit](informed-context-audit.json): beide Sprachfassungen, alte/neue
  Voraussetzung, tatsächlich geöffnetes unverändertes Bild und Quellen-/Viewgrenzen.
- [Kontextvergleich](context-comparison.json): vollständige Vergleichsdaten.
- [Autorenvorlage](positive-evidence.candidates.json),
  [native Config](positive-evidence.config.json) und
  [materialisierter Record](positive-evidence.review.jsonl).

Status: `ai_candidate`, `needs_human_review`, E1/G1. Das neue p-n-Übergangsatom
erhält das benötigte Ladungsträger-/Polungsmodell. Die funktionale Schaltererklärung
verlangt weiterhin die konkrete Basisansteuerung und trennt sie von der
Versorgungsenergie des Lastkreises. `npn` oder `pnp` bleibt eine Alternative;
ein eigener Aufbau ist nur bei vorgesehener Schülerexperimentform verpflichtend
und wird nicht durch eine Papiererklärung ersetzt.

Die Roh-Applicability für sechzehn Länder beweist keine landesweite
Pflichtabdeckung. Native View-/Stage-Prüfungen zeigen Targets in BY Sek I sowie
HE/RP Sek II. Der unverändert vorausgesetzte Dotierungsvorläufer erscheint nicht
im Supportset der RP-CrossStage-SekII-Views; daraus wird keine Runtime-Abnahme
oder vollständige Quellenabdeckung abgeleitet. Details und historische Grenzen
bleiben im Audit sichtbar.

Prüfen ab Repository-Root:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/transistor-current-positive-evidence-b059-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/transistor-current-positive-evidence-b059-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/transistor-current-positive-evidence-b059-v1/positive-evidence.config.json
```

Beide Prüfungen bestehen mit einem aktuellen AI-Kandidaten, null menschlichen
Freigaben und null blockierenden Problemen. Keine kanonischen Zieltexte,
Graphkanten, aktiven Bilder oder historischen Reviewartefakte geändert.
