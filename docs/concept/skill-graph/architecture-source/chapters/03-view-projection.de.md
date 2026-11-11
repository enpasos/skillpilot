## Sichtenprojektion und Goal-Placement {#sec:sga-view-projection}

Eine sorgfältig lesende Person muss jeden sichtbaren Lernbaum allein aus dokumentierten JSON-Feldern rekonstruieren können – ohne Laufzeitcode zu lesen oder auf Titel- bzw. `phase`-Heuristiken zurückzugreifen.

### Vier Sichtenfamilien und fünf unverhandelbare Projektionsregeln {#sec:sga-vp-families}

| Sichtenfamilie | Beantwortete Leitfrage | Ausschließliche strukturelle Wahrheitsquelle |
| --- | --- | --- |
| **Inhaltsbaum (Content Tree)** | Was gehört fachlich worunter? | `goals` + explizite `contains`-Kanten (geordnet nach `contains`-Array). |
| **Programmbaum (Program Tree)** | Wo im Bildungsgang wird ein Ziel eingeführt, vertieft oder geprüft? | `programUnits` (`parentUnitId`, `order`) + `goalPlacements` (`primary` hängt ein; `secondary`/`assessed` als Badges/Overlays, fehlend liefert `unplacedInScope`). |
| **Kompetenzsicht** | Entlang welcher Prozess- oder Kompetenzachse ist ein Ziel eingeordnet? | `competencyCatalog` + `competencyRefs` (orthogonale Taxonomieprojektion). |
| **Composition-Baum** | Wie sieht ein aufgelöster Scope das Fach als einen Default-Baum? | Geprüfte `*.view.json` (`structure` + `canonicalSubtree` / `goalEntry`) + kanonische `contains`-Expansion. |
{cols="20%,36%,44%"}

Fünf verbindliche Regeln gelten für alle Projektionen:

1. **Regel 1 (Keine Heuristik):** Niemals Eltern-Kind-Beziehungen aus Titeln, lokalisierten Labels, `phase`, `dimensionTags.phase` oder Namensähnlichkeit ableiten.
2. **Regel 2 (Explizite Kantenherkunft):** Jede sichtbare Baumkante stammt aus genau einem dokumentierten Feld (`contains`, `parentUnitId`, `goalPlacements`, `competencyRefs` oder `children` einer Composition View).
3. **Regel 3 (Eine Relationsfamilie je Default-Sicht):** Sichten dürfen Badges oder Filter ergänzen, aber niemals stillschweigend Elternhierarchien mischen.
4. **Regel 4 (Geprüfte Composition View hat Vorrang):** Existiert für einen Scope eine `.view.json`, definiert sie den lernendenseitigen Default-Baum, während `programUnits`/`goalPlacements` für Programmsichten und Diagnostik gültig bleiben (`ALL` ist ein reiner Query-Sentinel und wird nie in Placements oder Applicability serialisiert).
5. **Regel 5 (Einmalvorkommen je aufgelöstem Scope):** Innerhalb eines aufgelösten Scopes (z. B. `DE-HE / Gymnasium / SekII / LK`) erscheint jedes sichtbare Ziel **höchstens einmal** unter **höchstens einem** sichtbaren Elternknoten; überlappende `canonicalSubtree`-Expansionen sind Kompilierfehler.

### Voraussetzungshülle, persönlicher Lernscope und kanonische Identität {#sec:sga-vp-closure anchors="required-prerequisite-learning-scope"}

Gemäß den Product-Owner-Entscheidungen vom **9. November 2026**, **10. November 2026** und **11. November 2026** ([Graph-Definition §§5.1–5.2](repo:docs/concept/skill-graph/graph-definition.md)):

- **Unbeschnittene Voraussetzungshülle (09.11.2026) & robuste Lern-Lesezugriffe (11.11.2026):** Die Auswahl atomarer Ziele muss deren vollständigen transitiven Voraussetzungsbedarf auf dem unbeschnittenen kanonischen Graphen erhalten (`A requires B requires C` behält `B`, selbst wenn anfangs nur `A` und `C` dem Scope-Filter entsprachen). Unbekannte IDs, Zyklen oder nicht ausgewiesene Pflichtatome bleiben harte Fehler in Validierung, Curriculum-QS und nativer Abnahme; bei Lern-Lesezugriffen behält die Laufzeit im Fall eines nicht streng kompilierbaren kanonischen Kontexts den geprüften Seed-Scope ohne abgeleitete Hülle bei, beansprucht keine Lernbasis, bietet kein Ziel mit defektem Voraussetzungsbedarf an und protokolliert den Fehler einmal je Curriculum und Fehlercode (Fehler in der Seed-Auswahl selbst bleiben harte Fehler).
- **Persönliche Lernscope-Basis $L$ (10.11.2026):** Notwendige Voraussetzungen gehören zu Lernen, Fortschritt und Abschluss, nicht bloß zur unsichtbaren Nachschlagehülle. Aus den gültigen geprüften atomaren Seed-Zielen $S$ wird auf dem unbeschnittenen kanonischen Graphen die feste globale Zielbasis $L = S \cup \{p \in A \mid \exists t \in S : (t, p) \in R_{\mathrm{at}}^+\}$ kompiliert. $L$ hängt ausschließlich von persönlicher Konfiguration und Curriculum-/Projektionsstand ab, **niemals** vom aktuellen Mastery-Stand. Beherrschte Atome bleiben als erfüllt in $L$; offene Voraussetzungen erhalten im vollständigen Persönlichen Curriculum navigierbare Erwerbsziele mit nachvollziehbarer `required by`-Provenienz (ohne neue Quellenmappings zu erfinden, Geschwisterknoten mitzuziehen oder Mastery zu schreiben). Der Level-3-Fokus ist der Schnitt der Nachfahren ausgewählter Wurzeln mit $L$ (der Normalmodus blendet Prüfungen erst *nach* Bestimmung effektiver transitiver Erreichbarkeit auf den Fokus ab, ohne Pfade über Zwischenziele außerhalb des Fokus zu löschen).
- **Fachlokale `projectionRole`-Spezifität:** View-Referenzen tragen `projectionRole: "target" | "prerequisiteOnly"` (Standard `"target"`). Überlappungen lösen nach Spezifität auf: (1) direktes `goalEntry` vor `canonicalSubtree`, (2) tieferer/näherer `canonicalSubtree` vor breiterem Oberbaum, (3) `"target"` bei gleicher Spezifität. Ein fachlokal als `prerequisiteOnly` markiertes Ziel (etwa Brücken-/Formelziele in Hessen Sek-II-LK Mathematik oder Mathe-Stützziele in Physik) benötigt bei echtem Bedarf dennoch irgendwo im geschlossenen Persönlichen Curriculum $L$ ein Erwerbsziel.
- **Erhaltene kanonische Atomizität:** Das Einklappen oder Referenzieren eines kanonischen Clusters erzeugt niemals ein opakes Ersatzatom und überträgt keine Cluster-Ergebnisse auf Kinder (siehe auch die historische `DPK-006c-c`-Grenze in [Umsetzungsstand Duale Pakete](repo:docs/dev/dual-curriculum-package-implementation-status.md) sowie den Werkzeugschnitt in [Curriculum-Autoreneditoren](repo:docs/dev/curriculum-authoring-editors.md)).

### Lerneinheiten in projizierten Sichten {#sec:sga-vp-units anchors="learning-units-in-projected-views,curriculum-levels-in-projected-views"}

Projizierte [Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md) (Zielkonzept; Laufzeitcompiler offen) binden an die geprüfte Composition View oder Programmprojektion:

1. **Ein direkter Kursbesitzer:** Jeder geplante atomare Kompetenzerwerb hat im aufgelösten Kurs genau eine direkt besitzende Einheit; Vorfahren aggregieren Kindpflichten ohne Doppelbesitz.
2. **Fachübergreifende Identität:** Gemeinsame kanonische Ziele (z. B. `target` in Mathematik und `prerequisiteOnly` in Physik) zählen im Gesamtplan einmal bei erhaltener Fachrolle.
3. **Vollständige Voraussetzungsbilanz:** Jedes benötigte Atom muss spätestens beim abhängigen Ziel durch die explizite Eingangsbasis oder einen geplanten Erwerb gedeckt sein.
4. **Lokale Anerkennung & Blockfolge:** Implizite Anerkennung gilt ausschließlich gemäß dem geprüften Vertrag der direkt besitzenden Einheit; Elternprüfungen öffnen weder abgeschlossene Kindeinheiten neu noch bestehen sie geschützte Kindprüfungen/Karten, und eine [Blockfolge ganzer Einheiten](repo:docs/concept/skill-graph/learning-unit-progression.md) bleibt eine separate explizite Kurspolitik.
