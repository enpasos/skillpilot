## Skill-Graph-Produktionspipeline {#sec:pp-skill-graph}

Dieses Kapitel definiert die allgemeine, wiederholbare und prüfbare Blaupause, mit der aus einer beliebigen amtlichen oder institutionellen Curriculumquelle ein sauberer `SkillLandscape`-JSON-Graph unter `curricula/<...>/json/<file>.json` (bzw. `curricula/DE/Gymnasium/canonical/`) entsteht (für Prüfungsaufgaben siehe @ref{sec:pp-exam-example}).

### Eingaben und Schritte 0–2: Extraktion, Gliederung und JSON-Erzeugung {#sec:pp-sg-outline-json}

Als Eingaben dienen (1) ein normalisierter Rohtext-Auszug mit Themen, Kompetenzen, Voraussetzungen, Bewertungsumfang und Quelllink, (2) eine menschlich kuratierte Gliederung in Wurzel, Cluster und messbare Atomziele sowie optional (3) benachbarte Landschaften für konsistente Namens- und ID-Konventionen:

- **Schritt 0 (Quellenextraktion):** Amtliche Vorlage in sauberen Klartext (kein HTML) mit eindeutiger URL-/Seitenreferenz überführen.
- **Schritt 1 (Strukturgliederung):** Wurzelknoten anlegen, Phasen/Themenfelder als Cluster gliedern und Kompetenzen in messbare **atomare Lernziele** (1–3 Aufgaben, Formulierung „Die lernende Person kann …“) schneiden. Für lernendenseitige Routen **Motivationsanker** sowie **phasenlokale Autonomiecluster** mit Klausurcharakter (`Übungen E-Phase`, `Übungen Q1`–`Q4` sowie ggf. `Übungen Prozesskompetenzen`) vorsehen und globale Abitur-Zweige als zusätzliche Prüfungsschicht davon getrennt halten.
- **Schritt 2 (JSON-Kodierung):**
  - **Stabile IDs:** UUID v5 im Projektnamensraum oder deterministische Abbildung aus `(landscapeId, shortKey)` (`shortKey` optional, aber innerhalb von `landscapeId` eindeutig; dieselbe `(goalId, shortKey)`-Kombination darf über Sprachdateien hinweg wiederholt werden, niemals jedoch ein `shortKey` für verschiedene `goalId`s).
  - **Pflichtfelder:** Top-Level `landscapeId`, `title`, `description`, `locale`, `subject`, `goals`; Ziel-Level `id`, `title`, `description`, `weight`, `requires`, `contains`, `dimensionTags` (mindestens `phase`; bevorzugt zusätzlich `area`, `topicCode`, `demandLevel`, `processCompetencies`, `guidingIdeas`; optional `tags`, `core`, `examples`, `sourceRef`, `resourceLinks`).
  - **Lokalisierung, Assets & Links:** Mehrsprachige Landschaften nutzen getrennte Locale-JSONs mit bedeutungsäquivalenten Texten; lokale Bilder liegen neben dem JSON mit relativen Markdown-Pfaden. `sourceRef` trägt die kanonische Herkunftsreferenz, `resourceLinks` ausschließlich zielspezifische Lernressourcen (Überblicksseiten auf Wurzel/Clustern, spezifische Übungs-/Visualisierungslinks auf Atomzielen).

### Schritte 3–7: Relationen, Referenzimplementierungen, Validierung und Registrierung {#sec:pp-sg-relations-qa}

- **Schritt 3 (`contains`-Hierarchie):** Zyklenfreien DAG (Cluster $\to$ Teilziele) mit flacher, fachlich sprechender Gliederung aufbauen.
- **Schritt 4 (`requires`-Sequenzierung):** Kanonisch **atomar-zu-atomar** ohne transitive Redundanz modellieren ([Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md), [Graph-Validierungsregeln](repo:docs/qa-ci/graph-validation-rules.md)); geerbte Cluster-`requires` gelten nur als Übergangsmechanismus. Jedes lernendenseitige Atomziel soll auf mindestens einer lehrbaren Route vom Motivationsanker zu einem lokalen Autonomieziel liegen. Als praktische Autoren-Referenzmuster unter `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/` dienen `DE_HES_S_GYM_2_PHYSIK.de.json.snapshot` und `DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot` (lokale `Übungen E-Phase`/`Q1`–`Q4` plus `Übungen Prozesskompetenzen`, sauber getrennt von den globalen Abitur-Containern; die aktiven Laufzeitlandschaften liegen unter `curricula/DE/Gymnasium/canonical/`).
- **Schritt 5 (Validierung & manuelle Reviews):**

```bash
cd app
npm run validate:graph
```

Ergänzend die manuellen Reviews für Atomizität ([Atomizitäts-Review](repo:docs/qa-ci/atomic-review-process.md)) und Voraussetzungen ([Voraussetzungs-Review](repo:docs/qa-ci/requires-review-process.md)) durchlaufen.

- **Schritt 6 (Registrierung):** Wurzelcurricula in `curricula/curriculum_manifest.json` eintragen; Teilcurricula im Eltern-`contains` verankern.
- **Schritt 7 (QA-Checkliste):** Klare, in 1–3 Aufgaben prüfbare Atomziele, kanonische atomare `requires`, zyklenfreie `contains`/`requires`, geschlossene Routen von Motivation bis phasenlokaler Autonomie, stabile IDs, konsistente Metadaten (`phase`, `area`, `level`, `core`, `weight`) und abgeglichene Lokalisierung.
