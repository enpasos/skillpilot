## Nachvollziehbare Quellenbegründungen {#sec:sga-source-rationales}

Jedes kanonische Lernziel einer SkillPilot-Skill-Landschaft muss nachvollziehbar auf amtliche Lehrplanevidenz zurückgeführt werden können, ohne dass Lehrkräfte oder Prüfende rohe JSON-Ledger oder SPARQL-Ausgaben lesen müssen (operative Befehle im [Quellenbegründungen-Runbook](repo:docs/qa-ci/goal-source-rationales-runbook.md)).

### Deterministischer Erklär-Umschlag und duale Nachweisrouten {#sec:sga-sr-envelope}

`generateGoalSourceRationales.ts` erzeugt pro Lernziel einen deterministischen JSON-Umschlag (`schemaVersion: 1`), der zwei komplementäre Nachweisrouten zusammenführt:

- **Statusklassifikation (`sourceRationaleStatus`):** `classic_source_reviewed` (durch geprüfte amtliche Quellenextraktion und Mapping belegt), `partial` (unvollständige oder breitere Themenfeldabdeckung) oder `gap` (fehlender Nachweis, ehrlich unter `limitations` ausgewiesen).
- **Klassische Quellenroute (`classicSourceRoute`):** Bindet geprüfte `source-to-canonical`-Mappings (`exact` oder `partial`), amtliche Lehrplandokumente, Kapitelpfade und kurze Fundstellenauszüge.
- **MEM-SPARQL-Route (`memSparqlRoute`):** Ergänzt Abgleiche gegen externe Metadata-for-Educational-Media-(`MEM`-) bzw. FWU-Ontologie-Bestände ([MEM-SPARQL-Audit](repo:docs/qa-ci/mem-sparql-consistency.md)), soweit vorhanden.

### Deterministische Rangfolge, Ausspielmodi und Urheberrechtsdisziplin {#sec:sga-sr-ranking}

Kandidatenbelege werden deterministisch sortiert:

1. `exact`-Mappings stehen vor `partial`-Mappings;
2. gültige aktuelle Landeslehrpläne stehen vor archivierten Altständen;
3. Belege des gewählten Bundeslands stehen vor bundesweiten oder länderübergreifenden Ersatzbelegen.

Im Standalone-Paketmodus (@ref{sec:sga-dual-packages}) liefert die Laufzeit generationsgebundene Evidenz über Catalog-1.2-Discovery statt über fest verdrahtete Repositorypfade und fällt bei Fehlern nicht auf statische Altdateien zurück. Lehrplanzitate bleiben auf knappe Fundstellennachweise beschränkt (keine Volltextübernahme amtlicher Dokumente), um Urheber- und Verwertungsrechte strikt zu wahren.
