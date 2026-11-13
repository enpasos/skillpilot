## Runbook für Lernziel-Quellenbegründungen {#sec:qal-source-rationales}

Dieses Runbook beschreibt Erzeugung, Laufzeitbereitstellung und Prüfung menschenlesbarer Quellenbegründungen (`generateGoalSourceRationales.ts`) entlang der geprüften klassischen Kette `canonical goal -> mapping review -> source extraction -> official source document` (Fachkonzept siehe `docs/concept/skill-graph/human-readable-source-rationales.md`, Statusverzeichnis [status/README.md](repo:docs/qa-ci/status/README.md)).

### PoC-, Zielmengen- und MEM/FWU-Showcase-Kommandos {#sec:qal-rationales-commands}

Ausführung aus `app/` für den Bayern-Mathematik-PoC ([goal-source-rationales-poc.md](repo:docs/qa-ci/status/goal-source-rationales-poc.md) + `.json`), benutzerdefinierte Zielmengen und die Bayern-LehrplanPLUS-Showcases mit Live-MEM/FWU-Abgleich (`:plain` blendet Ziel-UUIDs zugunsten des SkillPilot-Pfads aus und ergänzt konkrete SPARQL-Abfragen):

```bash
cd app
npm run quality:goal-source-rationales:poc
npx tsx scripts/generateGoalSourceRationales.ts \
  --jurisdiction=DE-BY --goals=<goal-id>,<another-goal-id>
npm run quality:goal-source-rationales:mem-examples
npm run quality:goal-source-rationales:mem-examples:plain
```

Wichtige CLI-Optionen: `--landscape=<path>`, `--mapping-root=<path>`, `--output-json=<path>`, `--output-md=<path>`, `--no-md`, `--goals=source-backed | source-backed-relevant-leaves | all-relevant-leaves`, `--jurisdiction=all`, `--include-mem`, `--mem-config=<path>` und `--mem-replay=<path>`.

`--mem-replay=<path>` verwendet statt einer Abfrage des Endpunkts die MEM-Erwartungstexte, die in den konsistenten Wegen eines früheren Berichts dieses Generators festgehalten sind, und wendet denselben Abgleich auf die aktuellen klassischen Wege an. Ein Weg, der nicht mehr passt, wird `mem_sparql_review_needed`; durch eine Wiedergabe wird nichts neu konsistent. Die Option dient, mit dem eingecheckten Bericht als Eingabe, für den Fall, dass sich nur kanonische Zieltexte geändert haben und der Endpunkt nicht ausgewertet werden kann. Am 13. November 2026 lieferte der Endpunkt die bayerischen LehrplanPLUS-Pläne noch, sie erreichen ihre Kompetenzen aber nicht mehr über `bfo:BFO_0000051`, sodass ein Live-Lauf keinen Erwartungstext fand; die Anpassung der Abfrage an das neue Datenmodell ist offen.

### Öffentlicher Laufzeitindex (Repository- vs. Paketmodus) & Deployment-Smoke {#sec:qal-rationales-runtime}

- **Repository-Modus:** Der Explorer lädt bei Bedarf genau zwei Kompatibilitätsindizes außerhalb von JS-Bundle und Service-Worker-Precache nach: `/data/goal-source-rationales-math-public.json` (bevorzugt `DE-BY` für sichtbaren MEM/FWU-Abgleich) und `/data/goal-source-rationales-physics-public.json` (die generische Deck-Route darf sie nicht abfangen).
- **Paketmodus:** `/data/**` ist gesperrt; das UI ermittelt die Bindungen über Catalog API 1.2 (`/api/ui/curriculum-catalog`) und lädt Einzelziele generationsgebunden über `/api/ui/curriculum-source-evidence/packages/{packageId}/{packageVersion}/goals/{goalId}` ohne Repository-/Classpath-Fallback.

Erzeugung, Build-Artefaktprüfung und Live-Deployment-Smoke (automatisch im Deploy-Skript nach Service-Neustart ausgeführt; erkennt anhand von `/api/ui/curriculum-catalog` `404` vs. `1.2` den aktiven Modus):

```bash
cd app
npm run quality:goal-source-rationales:public
npm run check:goal-source-rationales:math-public
npm run check:goal-source-rationales:build-artifact
npm run smoke:goal-source-rationales:deployment
npm run smoke:goal-source-rationales:deployment -- --base-url=http://127.0.0.1:8080
cd ..
SKILLPILOT_BASE_URL=https://staging.example.org \
  ./deploy_skillpilot.sh --coach-variant openai-mcp
```

### Review-Checkliste und Folge-Issues {#sec:qal-rationales-checklist}

Je gerendertem Ziel sind fünf Punkte zu prüfen:

1. **`sourceRationaleStatus`:** `classic_source_reviewed` (regulär zulässig), `classic_source_partial` (nur mit nachvollziehbarer Teil-Begründung) oder `classic_source_gap` (erfordert nicht-blockierendes Folge-Issue).
2. **Originalquelle finden:** Offizielle URL oder archivierter Quellpfad samt konkretem Such-/Abschnittshinweis vorhanden.
3. **Extrahierter Quellenbeleg:** Dokumentmetadaten aufgelöst, `sourceGoalId` und Referenz konsistent, Markdown-Auszug knapp gehalten (Volltext nur im JSON).
4. **Begründung des SkillPilot-Ziels:** Verständliche Zuordnungsbegründung ohne Übertreibung von `partial`-, `split`- oder `aggregate`-Mappings.
5. **MEM/FWU-SPARQL-Route:** `mem_sparql_unavailable` im klassischen PoC bzw. `mem_sparql_consistent` im Bayern-Showcase (stets sekundäre Route, solange kein Scope als Primärquelle freigegeben ist; bei Widersprüchen oder fehlenden Metadaten manuelles Review-Issue anlegen).
