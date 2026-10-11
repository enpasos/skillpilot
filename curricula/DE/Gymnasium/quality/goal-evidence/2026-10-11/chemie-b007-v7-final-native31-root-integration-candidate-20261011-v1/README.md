# B007 v7: inaktiver Final-Integrationskandidat für Root

## Ergebnis und Umfang

Technische Übernahme der bereits tatsächlich unabhängig geprüften sechs B007-Bilder. Dies ist eine Fortsetzung der technischen Integration, keine neue unabhängige fachliche Prüfung. Alle sechs Bilder bleiben exakt **KEEP**; keine Bilderzeugung, keine Generator-Umstellung. Eigene didaktische Inhalte/Bilder: CC-BY-4.0 gemäß LICENSING.md; technische Skripte: Apache-2.0.

- Sechs normale Prepare-Aufrufe und sechs normale Import-Aufrufe: Exit 0, explizit `OpenAI / Codex built-in image_gen`, `chemie`, `de`, `pilot`, `CC-BY-4.0`, bisherige vollständige Beschreibung/Alttexte und ursprüngliche Prompts.
- 18 neue PNG-Kopien unter den normalen kanonischen, Frontend- und Backend-Pfaden sowie sechs kanonische `prompt.de.md`: bytegenau zu den überprüften Originalen. Alle übrigen Bilder bleiben erhalten.
- Ganze 523-Landschaft: **bytegenau** zur v7-Vorlage. Semantische 523 Entscheidungen, darunter 402 `curricularAtomic`, exakt erhalten; ausschließlich `sourceLandscapePath` in der eigenen inaktiven Ledgerkopie umgebunden.
- Normale Gesamt-QA: **412 eindeutige Zeilen**. Die Ausgangsdatei enthält bereits sechs unfreigegebene Autorenplatzhalter. Die übrigen 406 Zeilen bleiben vollständig unverändert; die sechs werden durch die tatsächlichen Approved-AI-Records der echten B-Bildprüfung ersetzt. Kein Anfügen doppelter IDs.
- Aus den B-Records ausschließlich `landscapePath`, `canonicalAssetPath`, `publicAssetPath` umgebunden. `aiReviewer`, `aiReviewedAt`, `aiNotes` und alle sonstigen Nicht-Pfadfelder unverfälscht. Alle 412 Human-Feldkörper exakt erhalten. Alte Autorenzeilen und vollständige ursprüngliche B-Zeilen stehen gesondert in der Adoptionshistorie.
- Normale `source382`- und `whole402`-Modelle erfolgreich gebaut. Source382-Manifest und alle Views bleiben an die vorhandenen v7-/v3-Quellen gebunden. Keine neue HTML-/PDF-Ausgabe und keine vollständige QS.
- Scoped Check: **PASS**, einschließlich aller 523 normalen semantischen Fingerprints, echter AI-Approval-Prädikate, Kopiengleichheit, normaler Modellvalidierung und 268 unveränderten geschützten aktiven/Helper-Eingaben.

## Aktuelle Artefakte

| Zweck | Datei |
| --- | --- |
| Erster tatsächlicher technischer Freeze, 228 deklarierte Dateien und alle sechs vollständigen A/B-/Goal-/Bild-Tupel | `FIRST.technical-adoption-inputs.actual.json` |
| Ganze Landschaft | `candidate/whole523-six-child-DE15-deck.inactive.json` |
| Inaktive semantische Klassifikation | `candidate/semantic-kinds.current523.DE15-deck.inactive.json` |
| Normale QA mit sechs tatsächlichen AI-Freigaben | `candidate/visualization-qa-current-whole-plus-six-approved-ai.inactive.json` |
| Alte Autoren-/B-Felder und exakte Pfadänderungen | `adoption/six-approved-ai.path-rebinding-and-author-staging-history.actual.json` |
| Source382-Modell | `native/source382.normal.book-model.json` |
| Whole402-Modell | `native/whole402.normal.book-model.json` |
| Scoped tatsächlicher Prüfbefund, alle 24 übernommenen Dateien und Modellbindungen | `checks/scoped-technical-adoption.actual.json` |
| Terminaldaten jedes normalen Aufrufs | `checks/*.terminal.actual.json`, zugehörige STDOUT/STDERR |

Die tatsächlichen visuellen A-Entscheidungen und B-Approved-AI-Records sind vor Übernahme aus ihren Originaldateien vollständig gelesen und gegen alle sechs ganzen aktuellen Goals, Linkmetadaten, Original-PNGs, 360-/680-Dateien und Prompts gehasht worden. Die aktuellen v7-Goalobjekte stimmen vollständig mit diesen Bildtupeln überein. Der vollständige v7-Autorenfreeze wurde technisch gegen seine echten Dateien geprüft. Das FIRST dokumentiert die Herkunft und Grenzen.

## Normale Helfer und Reproduktion

Die normalen Repo-Helfer sind unverändert. `prepare_goal_visualization.mjs` hat einen fest eingebauten normalen Scratchpfad, dessen sechs Verzeichnisse bereits bestanden. Für Prepare wurden deshalb byteidentische Kopien von Prepare und Common in einem temporären isolierten Root verwendet. Deren normale Prompt-/Metadatenausgaben stehen als reguläre Dateien unter `prepared/<goal-id>/`; das temporäre Verzeichnis ist entfernt. Die erhaltenen vorbereiteten generischen Prompts sind technische Helferausgaben. Die kanonischen importierten Prompts enthalten jeweils die **ursprünglichen tatsächlich verwendeten Provider-Prompts**, unverändert aus den vorhandenen Review-Eingaben. Prepare hat keine Generation ausgelöst. Import lief über den tatsächlichen unveränderten Repo-Helfer auf der neuen inaktiven Landschaft.

Die genauen vollständigen argv einschließlich sämtlicher Linkmetadaten stehen pro Ziel unter `checks/import-<goal-id>.terminal.actual.json`. Die Verpackungsskripte sind lokale technische Orchestrierung; sie ändern keine normalen Helfer und schaffen keine Freigabeprädikate.

Aus dem Repo-Root:

```bash
npm --prefix app run build:goal-book-model -- ../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-final-native31-root-integration-candidate-20261011-v1/configs/native-current-source-atlas382.closed-carriers.inactive.config.json
npm --prefix app run build:goal-book-model -- ../curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-final-native31-root-integration-candidate-20261011-v1/configs/native-current-whole402.inactive.config.json
node --import ./app/node_modules/tsx/dist/loader.mjs curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-final-native31-root-integration-candidate-20261011-v1/scripts/check-adoption.mjs
```

Zwei anfängliche Fehler ausschließlich im eigenen Freeze-Wrapper sind vollständig erhalten: zunächst falsches Groß-/Kleinschreibungsassert gegen den tatsächlichen Inventarliteral `keep`, danach versuchte Dateiprüfung einer Registry-Prosanotiz. Beide vor FIRST/Kandidaten-/Importmutation; die eigene Orchestrierung wurde korrigiert, unveränderte normale Helfer waren nicht betroffen. Der erfolgreiche Freeze folgt unter `first-preflight-retry.*`.

## AI und native Publikationsstatus

Die normalen aktuellen AI-Approval-Prädikate erkennen alle sechs übernommenen QA-Zeilen als Approved-AI für den tatsächlichen aktuellen Hash. Der bestehende unveränderte `app/scripts/goalBookModel.ts` reserviert `approvedForPublication` jedoch für `humanApproved === 'yes'` (Zeilen 921–925). Deshalb bleiben alle sechs Bilder in beiden **Review**-Buchmodellen sichtbar mit `qaStatus: review_candidate`, `approvedForPublication: false`. Es gibt keine Humanfreigabe und keine öffentliche Publikationsfreigabe. Dieser Status ist kein Verlust der tatsächlichen AI-V-Nachweise.

## Offene Finalgates bei Root

- Die 31 vollständigen integrierten nativen HTML-/PDF-Seiten bauen und tatsächlich ansehen; dieses Paket enthält nur Modelle.
- D14-Inhaberschaft/Supersession und P2-Bindung an die aktuellen Seiten normal integrieren; historische Records erhalten.
- Normaler finaler inaktiver D/P/A/M/V-Vergleich mit Erhalt jedes bisherigen Chemie-206-Strict-IDs sowie Biologie 366/395, bevor irgendein Zuwachs behauptet wird.
- Bestehende Quellen-/Operator-HOLDs, die zwei ungeklärten Fractional-Precipitation-Operatorfälle, Source-Omissions und unresolved Scope bleiben offen; aus der V-Übernahme folgt kein Source- oder M7-Schluss.
- Der zentrale Asset-Checker prüft aktive kanonische Inhaberschaft. Die sechs neu angelegten Assets sind derzeit ausschließlich in der inaktiven Landschaft verlinkt und wären im aktiven Orphanscan noch unregistriert. Die finale Eigentümer-/Aktivierungsprüfung gehört zur separaten Root-Integration.

Aktive Landschaften, zentrale Registry, aktive QA und semantische Ledger, Karten, Runtime-/Plugin-/Helper-Implementierungen, Git und GitHub wurden nicht verändert. Autorisierte Ausnahme: genau die 24 neuen Bild-/Promptdateien der sechs IDs. **StrictGain 0, Human 0, keine Aktivierung.** Das Paket enthält ausschließlich reguläre portable Dateien; historische Herkunfts-/Kommandoangaben bleiben als Rohprovenienz kenntlich.
