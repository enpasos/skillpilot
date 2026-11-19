## Allgemeines Zielsystem und schrittweise Migration {#sec:sga-goal-system}

Das langfristige Zielmodell von SkillPilot folgt zwei Leitprinzipien: **„So viel Semantik wie nötig, so wenig Ontologie wie möglich“** und **„Ziele sind stabil. Struktur ist kontextabhängig.“** Der formale mathematische Graphkern ist in [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md) spezifiziert; Projektionsregeln stehen in @ref{sec:sga-view-projection}, Laufzeit-Fallbacks in [Minimales Schema & Laufzeit-Fallback](repo:docs/dev/skill-graph-minimal-schema-runtime-fallback-and-math-pilot.md).

### Vier semantische Schichten plus Projektions- und Kartensichten {#sec:sga-gs-layers}

Statt Fachkompetenzen, Jahrgangscontainer und Prozesstaxonomien in einer undifferenzierten Hierarchie zu vermischen, trennt die Zielarchitektur vier semantische Schichten sowie eine lernendenseitige Projektions- und Kartenschicht:

| Schicht | JSON- / Artefaktträger | Rolle und Invarianten |
| --- | --- | --- |
| **Zielschicht (Goal Layer)** | `goals[]`, `contains`, `requires` | Stabile prüfbare atomare Lernziele und fachliche Cluster; nur Atome tragen Mastery. Trägt atomare Voraussetzungspfade ($R_{\mathrm{at}} \subseteq A \times A$) und kanonische IDs. Im Zielmodell wird eine fachliche Lerneinheit in der Platzierungsschicht durch Verweis auf einen kanonischen Cluster erklärt, und ihre eigenen Assessments liegen in diesem Cluster ([Graph-Definition §11.2](repo:docs/concept/skill-graph/learning-units.md#sec-unit-representation)). |
| **Einheiten- und Programmebene** | Deklarierte Facheinheiten, Planeinheiten und `programUnits[]` | Stufen und Semester ordnen den Lernweg. Nach dem geltenden Vertrag können Einheiten mit eigenen Prüfungen und geprüfter Deckung eigene gewöhnliche Ziele anerkennen. |
| **Verortungsschicht (Placement Layer)** | Landesplan-Zuordnungen (*geführt in* vs. *steht in*) sowie `goalPlacements[]` (`goalId`, `unitId`, `relation`, `context`) | Trennt belegte amtliche Quellenzuordnung (*geführt in*) von didaktischem Lernplatz (*steht in*, inkl. begründeter früherer Vorarbeit und abgeleitetem frühestem Bedarf im geschlossenen Umfang $L$); `goalPlacements` hängt Ziele (`primary`, `secondary`, `assessed`) in Programmcontainer ein und führt unter Vertrag 1.2 vorläufig `own`. |
| **Kompetenzachsenschicht** | `competencyCatalog[]` (`id`, `label`, `dimension`), `competencyRefs[]` | Orthogonale Kompetenztaxonomien (z. B. Prozesskompetenzen `K1`–`K6`); keine primären Inhaltseltern, sofern nicht eigenständig prüfbar. |
| **Projektions- und Kartenschicht** | Gemeinsame Landespläne, `*.view.json` (`structure`, `canonicalSubtree`, `goalEntry`) | Speist ohne Duplizierung von Zielinhalten sowohl den **Lernzielbaum** (alle Cluster, Einheiten und Ziele) als auch die **Lernkarte** (nur Einheiten und atomare Ziele durch Kontraktion gewöhnlicher Cluster entlang `contains`, Fächer als Filter). |
{cols="22%,32%,46%"}

Interpretationsinvarianten:

- Jahrgangs-, Halbjahres-, Modul- und Phasencontainer bilden **nicht** das dauerhafte semantische Rückgrat des kanonischen Fachgraphen; `phase` bleibt als Kompatibilitäts- und Badge-Metadatum erhalten und begründet höchstens eine als `canonicalDefault` markierte vorläufige Standardzuordnung, niemals einen amtlichen Landesbeleg.
- Breite Kompetenzfamilien (`K1`–`K6`) sind Taxonomieachsen und keine Programmeinheiten; nur konkrete, prüfbare Prozessfertigkeiten werden echte `LearningGoal`-Knoten.
- Die anfängliche Eingrenzung durch Lernende (Bundesland, Schulform, Stufe, Dauer, Kursprofil) wirkt als **Einstiegsscope** über gemeinsame Landespläne, Placements, Composition Views und kompilierte `applicability` ([Ebenen der Personalisierung](repo:docs/concept/levels-of-personalization.md)), niemals über duplizierte kanonische Ziele.

### Rekursive Lerneinheiten und schrittweise Migration {#sec:sga-gs-migration}

Rekursive Einheiten (Graph-Definition §11, [Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md); §12, [Optionale Planung](repo:docs/concept/skill-graph/planning-and-budget.en.md)) setzen auf denselben stabilen kanonischen Zielen auf:

1. Im aufgelösten Kurs gehört jedes atomare Erwerbsziel unmittelbar zu genau einer Einheit. Ihre Elterneinheit bündelt die Ziele ihrer Kinder. Ein ausdrücklich erreichtes Einzelziel behält seine kanonische Identität auch in anderen Einheiten und Fächern.
2. **Drei Stufen – Cluster, Einheit, Einheit mit Prüfungen:** Jede Einheit (fachliche Einheit wie Planeinheit) unterliegt den vier Ordnungsregeln **E1–E4** ([Einheitsfolge](repo:docs/concept/skill-graph/learning-unit-progression.md)). Einen lokalen Anerkennungsvertrag nach **R1–R5** ([Graph-Definition §13.3](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough)) bildet dagegen ausschließlich eine **Einheit mit Prüfungen** (mit eigenen Prüfungen und gültigen vollständigen `coverageReviews`); Stufen, Jahrgänge, Kurshalbjahre und prüfungsfreie Facheinheiten ordnen nur und erkennen nichts implizit an.
3. **Geschwisterfolge `after` ohne Zugangssperre:** Ein fachlich oder curricular begründetes `after` erklärt die vorgesehene Reihenfolge ganzer Geschwistereinheiten für Lernkarte und Ziel-Lernweise **„Einheit für Einheit“** ([Graph-Definition §11.5](repo:docs/concept/skill-graph/learning-unit-progression.md#sec-unit-by-unit)), fügt aber weder atomaren Bedarf hinzu noch verändert es Mastery oder Frontier; keine `requires`-Kante zeigt auf ein `Exam`-Ziel (Prüfungen sind Endpunkte von Voraussetzungspfaden).
4. **Geschützte Nachweise & länderübergreifende Blatt-Ganzheit:** Das Bestehen einer übergeordneten Integrationsprüfung besteht niemals geschützte Kindprüfungen oder Pflichtkartendecks mit, und kanonische fachliche Blatteinheiten bleiben in allen 16 Bundesländern ungeteilt in einer einzigen Planeinheit.

> [!NOTE]
> **Umsetzungsstand.** Die drei deklarierten Facheinheiten in Mathematik und Physik verwenden den Kompatibilitätsvertrag 1.2 mit eigenen Zielen und Prüfungen. Der [Grundvertrag für Stufenpläne](repo:contracts/curriculum-package/v1.3/README.md) beschreibt die Platzierung nach Land und Bildungsgang. Der Vorschlag vom 19. November unterscheidet das Urteil über die Einheit von der Freigabe einzelner Voraussetzungen für die weitere Planung. Die gegenwärtige Laufzeit kann Ziele aus dem Fehlen offener Prüfungs- oder Kartenpflichten implizit anrechnen.
