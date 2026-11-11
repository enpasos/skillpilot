## Curriculum-Qualitätsdashboard {#sec:qal-quality-dashboard}

Dieses Kapitel spezifiziert die persistierte Qualitätsstatus-Schicht für die lokale schreibgeschützte Workbench-Ansicht unter `/quality-dashboard` (detaillierte Fachsemantik der Reifegrade und `CQR-*`-Regeln siehe [Qualitätshandbuch Band IV](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)).

### Generatoren, Artefakte und lokale Befehle {#sec:qal-dashboard-files}

Das Dashboard implementiert keine eigene Validierungslogik in React, sondern liest ausschließlich generierte Status-Snapshots über `/__quality-dashboard/status` und `/__quality-dashboard/file?path=docs/qa-ci/status/<file>.md`:

- **Hauptstatus:** `app/scripts/generateCurriculumQualityStatus.ts` schreibt [curriculum-quality-status.json](repo:docs/qa-ci/status/curriculum-quality-status.json) und [curriculum-quality-status.md](repo:docs/qa-ci/status/curriculum-quality-status.md).
- **Merkkarten-Review (`CQR-302`):** `app/scripts/memoryCardReview.ts`, `runMemoryCardReviewConfigs.ts` und `reportMemoryCardReviewRollout.ts` prüfen `curricula/DE/Gymnasium/quality/memory-card-review/*.review.jsonl` sowie `*.cards.review.jsonl` und schreiben die Berichte `docs/qa-ci/status/memory-card-review-*.md` (aktuell in CI abgeschlossen und erzwungen für Mathematik, Physik, Chemie, Biologie, Deutsch, Geschichte, Informatik, Latein, Politik und Wirtschaft sowie Wirtschaftswissenschaften).
- **Sanierungs-, Quellen- und MEM-Berichte:** `reportM0RemediationPlan.ts` (`m0-remediation-plan.md`), `reportEnglishRemediationPilot.ts` (`english-remediation-pilot.md`), `generateCurriculumSourceCoverageAudit.ts` (`curriculum-source-coverage-audit.{json,md}`) und der bewusst nicht-blockierende `generateMemSparqlConsistencyAudit.ts` (`mem-sparql-consistency-audit.{json,md}`).

Aktualisierung der lokalen Snapshots und Bootstrap einer sichtbaren offenen Merkkarten-Queue (`needs_developer_review` ohne inhaltliche Freigabe; `pilot-dossier` dient der unverbindlichen Vorab-Triage):

```bash
cd app
npm run quality:curriculum-status
npm run quality:memory-card-review:report:all
npm run quality:memory-card-review:check:all
npm run quality:memory-card-review:rollout
npm run quality:memory-card-review:pilot-dossier
npm run quality:m0-remediation
npm run quality:english-remediation-pilot
npm run quality:source-coverage-audit
npm run quality:mem-sparql-consistency
npm run quality:memory-card-review -- --mode=bootstrap \
  --config=curricula/DE/Gymnasium/quality/memory-card-review/<id>.config.json
```

### Reifegrade `M0`–`M7`, Quellenbelege und Regelfamilie `curriculum-quality-v5` {#sec:qal-dashboard-rules}

Das Dashboard weist jedem Curriculum konservativ einen Reifegrad `M0`–`M7` zu und zeigt zusätzlich den Gate-Streifen `M5–M7 review gates` (`CQR-301`, `CQR-401`, `CQR-501` für Kernstufe `M5`, `CQR-302` für `M6`, `CQR-303` für `M7`). Menschliche Champion-Erprobungen bleiben eine orthogonale Aussage ([Qualität & Erprobung](repo:docs/concept/curriculum-quality-and-human-trial.md)). Amtliche Quellen werden zweischichtig geführt: dauerhaft eingecheckt sind strukturierte `sourceDocument`/`sourceDocuments`-Referenzen mit offiziellen HTTP(S)-URLs und lesbaren extrahierten Inventaren; lokale Arbeitskopien (`curricula/**/*.pdf`) sind regulär per Git ignoriert, sodass ein grünes Quellen-Badge auch bei `0/n` lokalen PDFs gültig ist, sofern alle `n/n` offiziellen URLs und Inventare vorliegen.

:::table{cols="2.2cm,1.3cm,X",longtable=true}
| Regel | Ziel | Bedeutung in `curriculum-quality-v5` |
| --- | --- | --- |
| `CQR-000` | `M1` | Quelleninventare lesbar, mit offiziellen HTTP(S)-URLs verknüpft und extrahierte Ziele im Membership-/Closure-Ledger registriert. |
| `CQR-001` | `M0` | Basis-Graphintegrität: IDs, lokale/globale Referenzen, Selbstreferenz-Schutz und direkte DAG-Prüfung. |
| `CQR-002` | `M0` | Explizite `type`-Metadaten stimmen mit struktureller Atom-/Cluster-Klassifikation überein. |
| `CQR-003` | `M2` | Bundesland-Abdeckung: volle Quellenbindung aller quellenrelevanten View-Atome, keine unbelegten Zuordnungen, keine fehlenden registrierten Originalziele. |
| `CQR-004` | `M2` | Kursniveau-Konsistenz: Quellziele (`GK_LK`, `LK`, `unspecified` mit Standard `GK_LK`) mappen nur auf kompatible `GK`/`LK`-Ziele. |
| `CQR-101` | `M3` | Effektive Routenabdeckung über $R_{\mathrm{effective}}$ vom Motivationsanker über Atomziele bis zur terminalen Autonomie. |
| `CQR-102` | `M3` | Direkte atomare Routenabdeckung über explizite atomare `requires`-Kanten. |
| `CQR-103` | `M3` | Keine verbleibenden Cluster-`requires` für die reguläre Sequenzierung im Routenscope. |
| `CQR-201` | `M4` | Terminale Autonomieziele besitzen `examData` (oder eine explizit geprüfte Ausnahmekonvention). |
| `CQR-301` | `M5` | Ledger der semantischen Atomizität für fachliche Blattziele sind vollständig, aktuell und aufgelöst. |
| `CQR-302` | `M6` | Merkkarten-Ledger entscheiden explizit über Memorierungsbedarf, binden jede aktive Primärkarte und sichern Sichtbarkeit in Lernansichten. |
| `CQR-303` | `M7` | Zentraler Bericht aus `reportDeepUnderstandingRollout.ts` beweist die exakte Schnittmenge der Gates D/P/A/M/V auf allen aktuellen `curricularAtomic`-Zielen (technische Bild-Deferrals zählen nie als erfüllt; `humanApproved`/`humanIssueIdentified` erfüllen oder blockieren Gate V/`M7` nicht). |
| `CQR-401` | `M5` | Mindestens eine lernendenseitige Kompositionsansicht existiert. |
| `CQR-501` | `M5` | Applicability-Warnungen sind sauber in aktive, aktuell akzeptierte und veraltet akzeptierte Zähler getrennt (`active = 0`). |
:::

### Mapping-Pipeline, Bundesland-Evidenz und Routenprofile {#sec:qal-dashboard-coverage}

Unabhängig von `M0`–`M7` zeigt das Dashboard den Fortschritt der `source-extraction`-Pipeline je Quelllandschaft (`complete`, `incomplete`, `blocked`; fehlende Extraktionen erscheinen als `0/3` mit offenem `MAPPING-1`):

1. **`MAPPING-1`:** Amtliche Lehrplanpassagen vollständig extrahiert.
2. **`MAPPING-2`:** Quellziele aus diesen Passagen gebildet.
3. **`MAPPING-3`:** Quellziele auf kanonische SkillPilot-Ziele abgebildet (für Hessen Mathematik Sek II sind `E.1`–`E.7`, `Q1.1`–`Q1.5`, `Q2.1`–`Q2.5`, `Q3.1`–`Q3.5`, `Q4.1`–`Q4.3` mit `316/316` Quellzielen abgeschlossen; für Hessen Mathematik Sek I alle `426/426` Quellziele aus KC 7.3, KC 7.1/7.2/6 und G9-Themenlinien).

Für **`CQR-003` (Bundesland-Abdeckung)** zählen ausschließlich quellenrelevante atomare Ziele lernendenseitiger Kompositionsansichten (ohne Memory/SRS-, Übungs-, Assessment-, Motivations-, Orientierungs- und `examData`-Knoten). Als direkter Lehrplannachweis gelten **nur** `provenance`, geprüfte `mapping`-Kanten (einschließlich `partial`, die als Passgenauigkeitswarnung sichtbar bleiben) und explizit akzeptierte Surrogat-Einträge für reale Voraussetzungslücken — **niemals** manuelle `override`-Overlays, `child-union` oder automatische `requires-closure`.

Aktuell erforderliche Routenprofile und lokaler Prüfablauf (z. B. für den Mathe-Sek-I-Ausbau von `M3` nach `M4`):

- **`canonical-math-sek1` / `canonical-math-sek2`:** `Mathematik (Gymnasium, DE)`, Motivationsanker `Warum Mathematik? – Entdecken, Muster & Alltag` bzw. `Warum Mathematik? – Denken, Muster & Zukunft`, terminale Prüfungsaufgaben unter `Prüfungen Jahrgangsstufe 5`–`10` bzw. `Übungen E-Phase`, `Q1`–`Q4` und `Übungen Prozesskompetenzen`.
- **`canonical-physics-sek1` / `canonical-physics-sek2`:** `Physik (Gymnasium, DE)`, Motivationsanker `Warum Physik?`, terminale Aufgaben unter `Übungen Sekundarstufe I Physik` bzw. `Übungen E-Phase` und `Q1`–`Q4`.

```bash
cd app
npm run quality:curriculum-status
npm run validate:graph
npm run validate:view-filters
npm run validate:composition-views
npm run quality:semantic-atomicity:check -- \
  --config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.config.json
```
