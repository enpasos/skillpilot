## MEM/FWU-Roundtrip-Plan {#sec:sga-mem-fwu-plan}

SkillPilot versteht Metadata for Educational Media (`MEM`) und [`FWU-DE/lehrplan-ontologie`](https://github.com/FWU-DE/lehrplan-ontologie) als benachbarte semantische Metadaten- und Provenienzschicht statt als Gegenmodell und dient als offener Prüfstand für nachvollziehbare KI-Lernschritt-Navigation (operative Pipeline in [MEM/FWU-Roundtrip-Pipeline](repo:docs/production-pipelines/mem-fwu-roundtrip.md); Referenzpapier <https://aifyer.com/ki-lernbegleitung/versions/v1.0/schulisch-verantwortete-ki-lernbegleitung-v1.0.pdf>).

### Semantischer Roundtrip-Test und geforderte Abdeckung {#sec:sga-mf-probe}

```text
SkillPilot-Skill-Landschaft (JSON-Export-ZIP)
  -> MEM/FWU-first-RDF/OWL-Bundle + gehashte Binaer-Sidecars
  -> Rekonstruierte SkillPilot-Skill-Landschaft (ohne Quell-JSON-Zugriff)
  -> Deterministische Graph-, View- und Asset-Validierung
```

Ohne opake JSON-Blobs oder Base64-Medienliterale bewahrt das semantische Bundle:

- Zielidentität (`id`, `shortKey`, `title`, `description`), Atomar-/Cluster-Klassifikation, `weight`, `core` und Dimensionsmetadaten;
- direkte `contains`-Komposition und didaktische `requires`-Voraussetzungen;
- Programmstruktur (`programUnits`), `goalPlacements`, Kompetenzachsen (`competencyCatalog`, `competencyRefs`) und lernendenseitige Composition Views;
- amtliche Quellen-/Provenienzreferenzen sowie `goal-visualization`-Verweise (`schema:ImageObject`) samt bytegleichen SHA-256-Bild-Sidecars (persönliche Lernstände bleiben außerhalb öffentlicher Pakete).

### Core-First-FWU-Abbildung und Anwendungsprofil {#sec:sga-mf-profile}

| Relation / Konzept | Core-First-RDF/OWL-Darstellung & Modellgrenzen |
| --- | --- |
| **Didaktisches `requires`** | Spezialisierte reifizierte `LP_0000554`-Ressource über `LP_0030071` (`hat Verweis`) und `LP_0030072` (`verweist auf`, eingeführt in `FWU-DE/lehrplan-ontologie#9`). Ein generischer `CE-Verweis` darf **niemals** pauschal als Voraussetzung gedeutet werden. |
| **Curriculares `contains`** | `BFO_0000051` (`hat Teil`) nur bei echter fachlicher Teil-Ganzes-Beziehung, zusätzlich flankiert durch `skillpilot:containsGoal` auf jeder direkten Autorenkante, damit transitive BFO-Inferenzen die Direktkanten nicht verwischen (Übungs-/Prüfungs-/Karten-/Navigationskanten nutzen nur `skillpilot:containsGoal`). |
| **Minimale Anwendungsterme** | `skillpilot:{LearningGoal,AtomicGoal,ClusterGoal,containsGoal,weight,core,shortKey,ProgramUnit,GoalPlacement,CompositionView,GoalVisualizationReference}` sowie `schema:ImageObject` für Binär-Sidecars. |
{cols="28%,72%"}

Erfolgskriterien sind vollständige SkillPilot-Validierung (zyklenfreie `requires`/`contains`, referenzielle Integrität, gültige Composition Views), deterministische Feldäquivalenz, OWL-2-DL-/Core-Strukturprüfung und byteidentische Bild-SHA-256-Prüfung ohne versteckten Rückgriff auf das Ursprungs-JSON.
