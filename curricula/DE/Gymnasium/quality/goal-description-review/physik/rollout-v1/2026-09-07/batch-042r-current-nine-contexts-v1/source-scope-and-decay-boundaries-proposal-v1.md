# B042r: enger Quellen-/Geltungs- und Zerfallsgrenzen-Vorschlag

Stand 7. September 2026. **Nur Vorschlag; keine kanonischen Ziele, Mappings oder Views wurden hierfür geändert.** Die drei registrierten KEEP/KEEP-Ziele und der verbleibende 17er-Claim sind separat in `post-seal-three-registration-v1.receipt.json` dokumentiert. Neue Review-Originale bleiben unverändert.

## 1. Direkt belegte GK-Projektionsfehler

Die Original-PDF Hessen, Q4.5, gedruckte S. 46–47, trennt das grundlegende qualitative Bändermodell und den bipolaren Transistor vom erhöhten Niveau: Fermienergie und Supraleitung stehen auf S. 47 unter „erhöhtes Niveau (Leistungskurs)“. Die direkten Source-Extraction-Einträge sind `he-phys-sekii-q4-5-b09-a01-2ee64ed0` → `658cf33d-a0c2-5d47-801a-3dbcd5cac074` und `he-phys-sekii-q4-5-b11-a01-14834c04` → `853dbe54-85b0-59ab-8f3a-000c2b7746ec`, jeweils LK.

Die Original-PDF Rheinland-Pfalz MSS, gedruckte S. 53, führt den schiefen Wurf unter „Einführungsphase Leistungsfach“, Wahlpflichtbaustein Wurfbewegungen. Die direkte Zuordnung `rp-phys-sek2-ef-oblique-throw-lk` → `fbecbd60-5db3-51e8-94be-d66b066ffa06` ist LK. Dies ist kein Schluss aus einem Dateinamen oder einem kanonischen Tag: Originalabschnitt und extrahierter Kurslevel wurden gelesen.

Die echte Ursache ist die breite **target-Vererbung der vorhandenen canonicalSubtree-Referenzen**: `620d4320-6b93-500b-8a62-86d02b1ed1f0` (Festkörperphysik) in HE-GK bzw. `04d1d2df-a94b-5db4-8d07-cbb512c2e0b9` (Weitere Bewegungen) in RP-GK. Keine der vier betroffenen Views hat eine spezifische Rollenüberschreibung für diese drei Atome. Die nativen Compiler liefern deshalb die ungeeigneten Atome als target, obwohl die direkten Originalquellen LK ausweisen.

Der kleinste Vorschlag ist je eine direkte `goalEntry`-Referenz mit `projectionRole: "prerequisiteOnly"` für das jeweilige Atom. Das nutzt die bestehende Spezifitätsregel, erhält kanonische IDs, globale Mastery und LK-Ziele und ändert weder Quellentext noch Runtime. Betroffen sind **vier Dateien, sechs Referenzen**: `de-he-gk`, `de-he-sekii-gk` jeweils 853/658; `de-rp-gk`, `de-rp-sekii-gk` jeweils fbec.

Beide Stufenvarianten sind nötig: `goalBookModel.ts` kompiliert die Source-Views des Atlas-Manifests und bildet Kursprofilgeltung in `normalizeAtlasApplicability` aus den **SekII**-Views. CrossStage dient zusätzlich der Navigation und der Ermittlung übriger Sek-I-Ziele. Nur die CrossStage-View zu korrigieren würde die falsche öffentliche Sek-II-Matrix nicht korrigieren.

`three-goal-gk-scope-proposal-v1.json` enthält den noch nicht angewandten Patch, Bytehashes sämtlicher Quellen und den nativen Vorher/Nachher-Beweis für alle **64** Atlas-Views: exakt die sechs vorgesehenen Zielentfernungen, keine neuen Ziele, keine anderen Viewänderungen und null Compilerbefunde. Originalquellen und LK-Views bleiben unverändert. Ein neues Modell-/Seitensnapshot muss nach Anwendung dennoch nativ erstellt werden; dieser Vorschlag behauptet keinen bereits erfolgten Modell-Rebind oder M6-Abschluss.

## 2. Vorhandene Zerfallsziele statt neuer IDs

Der vorgeschlagene fachliche Schnitt ist sinnvoll, weil drei vorhandene Ziele verschiedene beobachtbare Leistungen abbilden können:

| ID | Erhaltener, eng operationalisierter Kern | Abgrenzung |
| --- | --- | --- |
| `a12fddce-0215-58d9-bd91-21be8a960d25` | Einfaches zeitliches Zerfallsgesetz anwenden; Aktivität und Halbwertszeit im gegebenen Modell interpretieren. | Kein zusätzlicher Auftrag zur Zerfallsreihe, keine verpflichtende Differentialgleichungsherleitung oder Bateman-Gleichung. |
| `3b50255a-6b01-578b-8f5c-4383536a3221` | Eine **vorgegebene** Zerfallsreihe anhand der Änderungen von Massenzahl und Kernladungszahl bei angegebenen Zerfallsarten prüfen und begründen. | Keine unbestimmte „Berechnung einer Zerfallsreihe“, keine zeitabhängigen gekoppelten Tochteraktivitäten. |
| `64b30d2e-cbe1-55d8-915a-a050d736b96e` | Aus einer **digitalen Nuklidkarte** Eigenschaften/Übergänge entnehmen und daraus eine Zerfallsreihe rekonstruieren. | Daten-/Darstellungsauswertung; nicht noch einmal dieselbe vorgegebene A/Z-Konsistenzaufgabe. Keine eigenen radioaktiven Messungen voraussetzen. |

Mögliche neue a12-DE-Beschreibung: „Die lernende Person kann mit einem einfachen exponentiellen Zerfallsgesetz die zeitliche Abnahme einer radioaktiven Substanz oder ihrer Aktivität bestimmen und die Halbwertszeit im Sachkontext interpretieren.“ Gleichwertig EN: “The learner can use a simple exponential decay law to determine the decrease of a radioactive substance or its activity over time and interpret the half-life in context.”

Mögliche neue 3b-DE-Beschreibung: „Die lernende Person kann in einer vorgegebenen Zerfallsreihe die Änderungen von Massenzahl und Kernladungszahl bei den angegebenen Zerfallsarten prüfen und die Konsistenz der aufeinanderfolgenden Nuklide begründen.“ Gleichwertig EN: “The learner can check changes in mass number and atomic number for the specified decay types in a supplied decay chain and justify the consistency of successive nuclides.”

64b benötigt nach dieser Abgrenzung **keine neue DE-Kompetenz**. Die separat von Hooke bearbeitete EN-Übersetzung wird hier weder überschrieben noch vorweg als geprüft ausgegeben. Unveränderte vorhandene Kanten sind a12→Strahlungsbasis, 3b→a12, 64b→3b; eine weitere Kantenänderung ist mit diesem Vorschlag nicht freigegeben.

### Konkrete direkte Mapping-Zuordnungen

In `mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`:

- `/mappings/303`, `/304`, `/305`: HE Q4.3 b04/b05/b06 → a12, grundlegendes Niveau (Zerfallsgesetz, Aktivität/Halbwertzeit, C14-Anwendung). Erhalten.
- `/mappings/313`: `he-phys-sekii-q4-3-b12-a01-732dce59` → 3b; Original-PDF gedruckte S. 46, Zerfallsreihen unter erhöhtem Niveau. Erhalten.
- `/mappings/312`: LK-Überschrift `he-phys-sekii-q4-3-b11-a01-3f3a940f` („Zerfallsgesetze“) → bisher a12. Als eng begründeter Vorschlag kann die Überschrift ihres einzigen folgenden Inhalts „Zerfallsreihen“ künftig 3b zugeordnet werden; dazu auch `/decisions/232/canonicalGoalIds` mit aktuellem ehrlichem Reviewvermerk nachführen. Kein pauschales Umschreiben sämtlicher LK-Quellen. Die extrahierte `sourceRef` nennt den Themenfeldbeginn S. 45; die tatsächlich maßgebliche LK-Stelle steht auf S. 46.

64b hat **keine direkte HE-Source-Extraction-Zuordnung**. Echte direkte Quellen liegen u. a. vor:

- Bayern Mapping `/mappings/951` (64b) und `/952` (3b): `be4f8330-c717-556b-b4ec-dff318a7bfff`, Ph13-EA.4.4, LK: Eigenschaften von Nukliden und Zerfallsreihen aus digitalen Nuklidkarten entnehmen. Beide bestehenden Teilzuordnungen werden nicht ohne fachlichen Grund gelöscht.
- Niedersachsen Mapping `/48`, `/136`, `/139`, `/212` nach 64b; die ersten beiden betreffen laut extrahiertem Wortlaut allein Halbwertszeit/Zerfallsgesetz. Für eine spätere saubere Umleitung dieser beiden nach a12 müssen die tatsächlichen Originalstellen zusätzlich gezielt geprüft werden; hier keine stillschweigende Umzuordnung oder behauptete Originalfreigabe.
- Nordrhein-Westfalen Mapping `/409` (GK) und `/717` (LK) nach 64b: Nuklidkarte für Kernumwandlungsprozesse bzw. natürliche Zerfallsreihen. Diese Quellen zeigen gerade, warum **kein bundesweites LK-Tagfilter** zulässig wäre.
- Thüringen hat eine direkte GK/LK-Zuordnung nach 3b (`/mappings/663`); Hamburg Sek I ebenfalls eine qualitative Reihenbeschreibung (`/mappings/186`). Die 3b-Abgrenzung bleibt daher niedrigschwellig und führt keine pauschale Oberstufenrechnung ein.

## 3. Zusätzlicher HE-Kettenscope: noch nicht unbesehen anwenden

HE Q4.3 S. 46 belegt auch 3b als LK, die beiden HE-GK-Views zeigen es gegenwärtig als target aus dem breiten Kernphysik-Subtree `72c2bf5d-c62b-5744-9971-4c117f2a432d`. Die alternative Datei `chain-extended-gk-scope-proposal-v1.json` simuliert zusätzlich genau zwei entsprechende 3b-Overrides. Auch diese Variante kompiliert alle64 Views ohne technische Befunde.

**Fachlicher Folgebefund:** Danach ist 64b in beiden HE-GK-Views weiterhin target und verlangt direkt das nun nur als prerequisiteOnly geführte 3b. Ein fehlender Compilerfehler macht diese curriculare Zugangssituation nicht automatisch sinnvoll. Die HE-Kettenkorrektur muss deshalb 64b ausdrücklich mitbeurteilen: Entweder existiert eine eigenständige belegte HE-GK-Kartenkompetenz mit kleinerem Inhalt, oder der aktuelle Reihenrekonstruktionsauftrag gehört auch dort aus dem GK-target entfernt. Keine neue Voraussetzung, keine automatische Mastery und keine heimliche HE-GK-Nachforderung einführen. Diese Entscheidung ist **nicht** durch die drei ursprünglichen Scope-Freigaben abgedeckt und bleibt im erweiterten Vorschlag sichtbar offen.

## 4. Erforderlicher kontrollierter Abschluss nach gesonderter Schreibfreigabe

Erst exakte Quellen-/View-Deltas anwenden, dann die betroffenen aktuellen Buchseiten und öffentlichen Geltungszeilen nativ neu erstellen und vergleichen. Bei Textänderungen A/M/SemanticKind-Fingerprints und betroffene D/P/V-Kontexte ehrlich neu prüfen; keine bloße Hashfreigabe. Quellendeckung, Routen/Prüfungsabdeckung und geschützte M6-Floors nachführen. Insbesondere die lokalen Assessment-Endpunkte dürfen nicht still neu mit inhaltlich geänderten Zielbedeutungen etikettiert werden. Alte A9/B9-Urteile und die hier dokumentierten Vorher-Snapshots bleiben historische Nachweise, keine aktuellen Freigaben nach einer Änderung.
