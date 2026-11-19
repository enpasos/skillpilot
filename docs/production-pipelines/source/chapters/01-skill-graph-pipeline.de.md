## Skill-Graph-Produktionspipeline {#sec:pp-skill-graph}

Dieses Kapitel definiert die allgemeine, wiederholbare und prüfbare Blaupause, mit der aus einer beliebigen amtlichen oder institutionellen Curriculumquelle ein sauberer `SkillLandscape`-JSON-Graph unter `curricula/<...>/json/<file>.json` (bzw. `curricula/DE/Gymnasium/canonical/`) entsteht (für Prüfungsaufgaben siehe @ref{sec:pp-exam-example}).

### Eingaben und Schritte 0–2: Extraktion, Gliederung und JSON-Erzeugung {#sec:pp-sg-outline-json}

Als Eingaben dienen (1) ein normalisierter Rohtext-Auszug mit Themen, Kompetenzen, Voraussetzungen, Bewertungsumfang und Quelllink, (2) eine menschlich kuratierte Gliederung in Wurzel, Cluster und messbare Atomziele sowie optional (3) benachbarte Landschaften für konsistente Namens- und ID-Konventionen:

- **Schritt 0 (Quellenextraktion):** Amtliche Vorlage in sauberen Klartext (kein HTML) mit eindeutiger URL-/Seitenreferenz überführen.
- **Schritt 1 (Strukturgliederung):** Wurzelknoten und fachliche Cluster anlegen; Kompetenzen in messbare **atomare Lernziele** (typisch mit 1–3 Aufgaben überprüfbar, Formulierung „Die lernende Person kann …“) schneiden. Jahrgänge und Phasen gehören in Programm-/Planstrukturen und lernendenseitige Kompositionsansichten, nicht als dauerhafte fachliche Identität in die kanonischen Ziele. Eine erklärte Lerneinheit braucht den geltenden eigenen Vertrag; weder ein Cluster noch ein Prüfungsordner erklärt sie automatisch. Motivationsanker und lokale Prüfungsendpunkte nach dem anwendbaren Routenprofil einplanen; bestehende E-/Q-Ordner sind keine universelle Gliederungsvorgabe für neue Curricula.
- **Schritt 2 (JSON-Kodierung):**
  - **Stabile IDs:** UUID v5 im Projektnamensraum oder deterministische Abbildung aus `(landscapeId, shortKey)` (`shortKey` optional, aber innerhalb von `landscapeId` eindeutig; dieselbe `(goalId, shortKey)`-Kombination darf über Sprachdateien hinweg wiederholt werden, niemals jedoch ein `shortKey` für verschiedene `goalId`s).
  - **Felder und Metadaten:** Die aktuelle [Landschaftsreferenz](repo:docs/dev/landscape-json-field-reference.md) und das zugehörige Schema bestimmen Pflichtfelder und zulässige Werte. Stabile Zielidentität, Texte, `requires`, `contains` und fachliche Klassifikation explizit pflegen. `dimensionTags.phase` bleibt gegebenenfalls Kompatibilitäts-/Sichtmetadatum; es ersetzt weder Programmplatzierung noch einen Einheitenvertrag.
  - **Lokalisierung, Assets & Links:** Mehrsprachige Landschaften nutzen getrennte Locale-JSONs mit bedeutungsäquivalenten Texten; lokale Bilder liegen neben dem JSON mit relativen Markdown-Pfaden. `sourceRef` trägt die kanonische Herkunftsreferenz, `resourceLinks` ausschließlich zielspezifische Lernressourcen (Überblicksseiten auf Wurzel/Clustern, spezifische Übungs-/Visualisierungslinks auf Atomzielen).

### Schritte 3–7: Relationen, Referenzimplementierungen, Validierung und Registrierung {#sec:pp-sg-relations-qa}

- **Schritt 3 (`contains`-Hierarchie):** Zyklenfreien DAG (Cluster $\to$ Teilziele) mit flacher, fachlich sprechender Gliederung aufbauen.
- **Schritt 4 (`requires`-Sequenzierung):** Kanonisch **atomar-zu-atomar** ohne transitive Redundanz modellieren ([Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md), [Graph-Validierungsregeln](repo:docs/qa-ci/graph-validation-rules.md)); geerbte Cluster-`requires` gelten nur als Übergangsmechanismus. `requires` bezeichnet notwendige Vorbereitung, `examData.coveredGoalIds` die beanspruchte Prüfungsdeckung; keines ersetzt das andere. Die im geltenden QA-Profil geforderten Routen von Motivation zu lokalem Autonomieziel mit fachlich echten Voraussetzungen absichern. Eine fehlende Prüfung oder Route wird durch passende Aufgaben und Curriculumreparatur behoben, niemals durch erfundene Voraussetzungen. Aktive Autorenbeispiele liegen im kanonischen Katalog und seinen aktuellen QA-Berichten; die unveränderlichen Hessen-Snapshots unter `input/HE/upper-secondary/source-json/` dokumentieren Herkunft, keine neue Modellvorgabe.
- **Schritt 5 (Validierung & manuelle Reviews):**

```bash
cd app
npm run validate:graph
```

Ergänzend die manuellen Reviews für Atomizität ([Atomizitäts-Review](repo:docs/qa-ci/atomic-review-process.md)) und Voraussetzungen ([Voraussetzungs-Review](repo:docs/qa-ci/requires-review-process.md)) durchlaufen. Ein Struktur- oder Routenpass belegt keine fachliche Prüfungsdeckung; dafür sind Aufgabe, Lösung, Bewertungsraster und zulässige Bestehenskombinationen unabhängig zu prüfen. Der [Einheitenvorschlag vom 19. November 2026](repo:docs/concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) ändert die bestehenden Verträge und QA-Gates noch nicht.

- **Schritt 6 (Registrierung):** Wurzelcurricula in `curricula/curriculum_manifest.json` eintragen; Teilcurricula im Eltern-`contains` verankern.
- **Schritt 7 (QA-Checkliste):** Klare, prüfbare Atomziele, kanonische atomare `requires`, zyklenfreie `contains`/`requires`, die im jeweiligen QA-Profil geforderten vollständigen Routen, stabile IDs, konsistente Fach-/Platzierungsmetadaten und abgeglichene Lokalisierung. Formale Checks, unabhängiges Inhaltsreview und praktische Erprobung getrennt ausweisen.
