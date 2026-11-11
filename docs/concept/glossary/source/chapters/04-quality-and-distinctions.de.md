## Qualität, Review und Governance {#sec:quality-governance}

### Curriculum Champion {unnumbered=true}

*EN: Curriculum Champion* — siehe [Champion Guide](repo:docs/qa-ci/champion-guide.md)

Eine fachkundige Person, die Verantwortung für die praktische Erprobung eines Curriculums oder eines klar abgegrenzten Themen-Scopes übernimmt: Ziele selbst durchlernen, Stolperstellen am betreffenden Lernziel oder über GitHub zurückmelden und die fachliche Weiterentwicklung begleiten.

### Vier-Stufen-Champion-Modell {unnumbered=true}

*EN: Four-level champion model* — siehe [Four-Level Champion Model](repo:docs/qa-ci/four-level-champion-model.md)

Die QS-Kaskade zwischen maschineller Prüfung und menschlicher Erprobung: `1a` automatisierte CI-Pipeline (aktiv), `1b` statischer KI-Review-Agent und `1c` dynamischer KI-Agent sowie `2` die unabhängige menschliche Champion-Erprobung.

### QA-Scope {unnumbered=true}

*EN: QA scope* — siehe [Curriculum-Qualität](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

Ein explizit konfiguriertes Prüfprofil für einen lernendenseitigen Curriculumabschnitt, bestimmt durch Curriculum, Bezeichnung (z. B. `Sekundarstufe I`), Motivationsanker, ausgewählte atomare Ziele, terminale Autonomiebereiche und Cluster-Selektor. Ein QA-Scope zählt registrierte Prüfprofile – weder Einzelpfade im Graphen noch Aufgabenanzahlen. Die frühere Bezeichnung „Routen“ wurde abgelöst.

### CQR-Regel {unnumbered=true}

*EN: CQR rule* — siehe [Curriculum-Qualität](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md)

Eine *Curriculum-Quality-Review*-Regel mit stabiler ID im Qualitäts-Dashboard, z. B. `CQR-003` für bidirektionale Bundesland-Abdeckung oder `CQR-101` für geschlossene Lernrouten. CQR-Regeln bewerten die inhaltliche Curriculum-Qualität.

### GVR-Regel {unnumbered=true}

*EN: GVR rule* — siehe [Graph Validation Rules](repo:docs/qa-ci/graph-validation-rules.md)

Eine *Graph-Validation-Rollout*-Regel mit stabiler ID im CI-Validator, z. B. `GVR-001` (kein Ziel darf seinen eigenen `contains`-Vorfahren voraussetzen). GVR-Regeln sichern die strukturelle Graphintegrität ab.

### Reifegrad (`Maturity level`) {unnumbered=true}

*EN: Maturity level* — siehe [Curriculum-Qualität](repo:docs/qa-ci/curriculum-quality-maturity-and-routes.md) und [Qualitäts- und Erprobungskonzept](repo:docs/concept/curriculum-quality-and-human-trial.md)

Eine kumulative, konservative Einstufung (`M0`–`M7`) für einen exakt benannten Umfang und Inhaltsstand. Ein einzelner QA-Scope erreicht höchstens `M3`; ein Curriculum kann `M0` bis `M7` erreichen. `M5` steht für den abgeschlossenen Kern-QS-Stand (Quellen erfasst, Ländersichten bidirektional belegt, Pflicht-QA-Scopes routen- und prüfungsvollständig). `M6` ergänzt die geprüfte Memory-Schicht; `M7` ist der vollständig abgeschlossene maschinelle QS-Stand über alle fünf Einzelziel-Gates (`D` Beschreibungen, `P` Verständnisprofile, `A` Atomizität, `M` Memory, `V` Visualisierungen).

Menschliche Erprobung durch Curriculum Champions wird als eigenes Merkmal separat ausgewiesen (kein `M8`); `M7` allein bescheinigt keine menschliche Freigabe oder Unterrichtswirksamkeit.

### Semantische Atomarität (`Semantic atomicity`) {unnumbered=true}

*EN: Semantic atomicity* — siehe [Semantic Atomicity Review](repo:docs/qa-ci/semantic-atomicity-review.md)

Die fachliche Prüffrage, ob ein Lernziel tatsächlich genau eine überprüfbare Kompetenz beschreibt statt mehrere Fähigkeiten zu bündeln. Strukturelle Atomarität (keine `contains`-Kinder) ist dafür notwendig, aber nicht hinreichend.

### Generiertes Artefakt (`Generated artifact`) {unnumbered=true}

*EN: Generated artifact* — siehe [Documentation Guidelines](repo:docs/dev/documentation-guidelines.md)

Ein durch ein Skript erzeugter Bericht, Status-Snapshot oder Dokumentations-Build mit explizitem Hinweis auf Generator, Regenerierbefehl und maßgebliche Quelle (*Source of truth*). Inhaltliche Entscheidungen gehören stets in die Quelldateien, niemals als manuelle Nachbearbeitung in das generierte Artefakt.

---

## Wichtige Abgrenzungen auf einen Blick {#sec:key-distinctions}

:::table{longtable=true cols="5.4cm,X"}
| Nicht dasselbe | Warum die Trennung zählt |
| --- | --- |
| `contains` vs. `requires` | `contains` bündelt Inhalte hierarchisch; `requires` ordnet Lernvoraussetzungen. Nur `requires` steuert die Frontier. |
| `contains` vs. `goalPlacement` | Fachliche Zusammensetzung vs. Verortung im Programmbaum. Eine Platzierung hängt niemals den Inhaltsbaum um. |
| `requires` vs. effektive Voraussetzungen | `requires` speichert direkte Kanten; effektive Voraussetzungen umfassen während der Migration auch von Vorfahren geerbte Voraussetzungen. |
| Atomares Lernziel vs. Cluster-Ziel | Mastery, Frontier und Abdeckungszählungen sind auf atomaren Zielen definiert; Cluster aggregieren ausschließlich. |
| Strukturelle vs. semantische Atomarität | Ein Blattknoten ohne `contains`-Kinder kann inhaltlich trotzdem mehrere Teilkompetenzen vermischen. |
| `applicability` vs. `projectionRole` | `applicability` regelt, *ob* ein Ziel im Kontext sichtbar ist; `projectionRole` regelt, ob es eigenes Ziel (`target`) oder reine Voraussetzung (`prerequisiteOnly`) ist. |
| `applicability` vs. Knotentyp | `applicability` ist kontextuelle Sichtmetadaten, kein vierter Lernmodus. |
| Einstiegskontext vs. persönliches Curriculum | Der Einstiegskontext filtert eine Abfrage; das persönliche Curriculum ist der dauerhaft bestätigte Lernumfang. |
| Lernumfang vs. Fokus | Der Umfang legt fest, was insgesamt zählt; der Fokus wählt den aktuellen Arbeitskorridor. |
| Frontier vs. Empfehlung | Die Frontier ist mathematisch aus Graph und Lernstand bestimmt; Auswahlstrategie und Autopilot ordnen nur innerhalb der Frontier. |
| Optimistischer vs. strikter Modus | Gleiche Zielkandidaten, unterschiedliche Voraussetzungstiefe – strikter Modus ist Diagnose, kein strengerer Lehrplan. |
| SRS-Üben vs. Verified Recall | Karteikartenüben plant Wiederholungen; erst der ungeholfene Abruftest im Coach schließt ein Memorierziel ab. |
| SkillPilot-ID vs. Lernsession | Dauerhafte pseudonyme Backend-Identität vs. frischer 24-Stunden-Schlüssel für die Provider-Anbindung. |
| OAuth-Bindung vs. Lernsession | OAuth authentisiert die App/Integration; die Lernsession adressiert den Lernkontext. |
| `phase` vs. Programmeinheit | `phase` ist Kompatibilitätsmetadaten; nur explizite Programmeinheiten bilden Strukturknoten. |
| Lerneinheit vs. Personalisierungsstufe | Rekursive pädagogische Einheit mit abgeleitetem Abschluss vs. eine der vier Umfangs-/Zustandsebenen. |
| Lerneinheit vs. Zielschwierigkeit | Erwerbs- und Abschlusseinheit vs. Anspruchsniveau eines einzelnen Ziels (`level`). |
| Einheitsabschluss vs. Zielverfügbarkeit | Erfüllte Kind- und Eigenpflichten vs. Startvoraussetzungen; ein technisches Ganz-Einheiten-Gate erfordert eine separate Policy. |
| QA-Scope vs. Lernroute | Ein QA-Scope ist ein registriertes Prüfprofil, kein einzelner Lernpfad. |
| CQR- vs. GVR-Regeln | Inhaltliche Curriculum-Qualitätssicherung vs. strukturelle Graphvalidierung. |
| Curriculum vs. Skill-Graph | Normatives externes Dokument vs. versioniertes operatives Graphmodell. |
| Skill-Graph vs. Skill-Landschaft | Formales Modell und Semantik vs. konkrete veröffentlichte Fachinstanz mit `landscapeId`, Champion und Reifegrad. |
:::

---

## Pflegehinweise {unnumbered=true shortMark="Pflegehinweise"}

- `cd app && npm run check:terminology` weist abgelöste Synonyme zurück; bei Konsolidierung eines Begriffs wird dort eine entsprechende Prüfregel ergänzt.
- Neue Begriffe gehören hierher, sobald sie dokumentübergreifend verwendet werden und ihre Bedeutung nicht unmittelbar aus dem Code hervorgeht.
- Jeder Eintrag beschränkt sich auf Definition und knappe Abgrenzung; Einzelheiten bleiben im verlinkten normativen Fachdokument.
- Bei Abweichungen zwischen diesem Glossar und einem verlinkten Fachdokument ist das Fachdokument maßgeblich und dieser Eintrag nachzuziehen.
