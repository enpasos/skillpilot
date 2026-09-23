# Erweiterte Integrationsregeln: informierter Abschlusskandidat

Genau ein Ziel: `0d21097c-09bf-5375-8c56-34ce8dc5bc35`.

Die fachliche Entscheidung steht in `adjudication.json`: Die von Runde B gewünschten Intervall- und Erkläranforderungen sind richtig und werden im vorhandenen konkreten P-Profil erhalten. Sie rechtfertigen hier keine zwingende Erweiterung des knappen, mathematisch korrekten kanonischen Zieltextes. Die beiden Integrandklassen prüfen die gemeinsame Struktur der umgekehrten Kettenregel; weder ein Split noch eine allgemeine Substitutionskompetenz ist erforderlich.

## Was diese Mappe leistet

- Sie referenziert die **unveränderten unabhängigen B041-Reviews** vom 07.09. Keine zusätzliche Blindprüfung wird behauptet.
- Die aktuelle native B041-Subset-Seite muss vollständig mit der historischen Seite übereinstimmen. DE-/EN-Zieltext, Canonical-Kontext, Ziel-/Seitenfingerprints und aktive Bildbytes werden zusätzlich geprüft. Ein Hash-Update bei verändertem Inhalt ist nicht zulässig.
- Die KEEP/REVISE-Auflösung bindet den genauen abgelehnten DE-/EN-Ersatzvorschlag in `synthesis-decisions.json`; die fachlichen Nachweisakzente aus Runde B bleiben erhalten. Native Synthesis- und Resolution-Validatoren sind unverändert.
- Der vorhandene P-Autorenbody wird nach inhaltlicher Prüfung exakt wiederverwendet. Nur Reviewmetadaten und aktuelle native Bindungen sind neu. Die neue P-Konfiguration bindet auch das tatsächlich gesichtete unveränderte Lernzielbild.
- P bleibt `needs_human_review` / `ai_candidate`, E1/G1. Das ist keine menschliche Freigabe und keine behauptete Lernendenleistung. M7 bleibt davon getrennte maschinelle QS.
- Keine Canonical-, Registry-, In-flight-, A-, M- oder V-Änderung. Der zentrale Fünf-Gate-Bericht entscheidet nach expliziter Integration über Fortschritt.

Der unterstützte V1-Partial-Index referenziert den ursprünglichen Zehn-Ziele-Durchgang und beansprucht nur dieses eine Ziel. Seine Denominator-Metadaten stammen aus dem historischen Batch-Manifest und sind **kein aktueller Gesamtfortschritt**. Offene andere B041-Ziele werden nicht übernommen.

## Gezielte native Prüfung

Aus dem Repository-Root:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/m7-extended-integration-informed-keep-1-v1/emit-current-artifacts.ts --check
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/m7-extended-integration-informed-keep-1-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/m7-extended-integration-informed-keep-1-v1/positive-evidence.candidates.json
```

Ohne `--check` ist das lokale Hilfsskript ausschließlich ein Patch-Emitter für noch nicht bestehende Artefakte. Es schreibt selbst keine Dateien und verweigert ein Überschreiben. Der native P-Materializer erzeugt die erstmalige `positive-evidence.review.jsonl` mit seinem normalen `--write`-Modus. Eine veränderte fachliche Entscheidung verlangt eine neue Version; historische Artefakte werden nicht aktualisiert.

Der `synthesizedAt`-Wert der nativen D-Auflösung liegt aus Kompatibilitätsgründen eine Sekunde nach dem letzten historischen Reviewlauf. Das ist nicht der Zeitpunkt dieser späteren informierten Entscheidung; deren tatsächliches Datum steht in `adjudication.json` und der Currency-Receipt. Die komplette Canonical-Datei kann später durch andere Ziele geändert werden: Der historische Snapshot im Manifest bleibt erhalten, während `--check` die betroffene aktuelle Seite und den Zielkontext erneut exakt prüft.

Validierungsergebnisse werden in `validation.receipt.json` dokumentiert, sobald die nativen D- und P-Prüfungen abgeschlossen sind. Diese README allein ist kein bestandener Testnachweis.
