# B036: Quellen- und Identitätsaudit zu 333ca92b

Stand: 2026-09-06, read-only Audit ab 09:07:19 UTC. Ziel: `333ca92b-a92c-46a9-86be-dea8ddbd43e0`. Keine kanonischen, Mapping-, Ledger-, Bild- oder Runtimeänderungen. Diese Notiz ist weder ein neuer Description-Record noch eine Freigabe.

## Ergebnis

**Keinen automatischen Pflichtsplit in Kontinuität, Bernoulli, Stokes und Reynolds durchführen.** Die tatsächlich gelesene amtliche Quelle trägt einen beispielgebundenen Zugang mit ausgewählten Gesetzen. Eine gemeinsame qualitative Modelldeutung ist daher fachlich vertretbar, wird aber weder durch die gemeinsame Quellseite noch durch einen generischen Atomicity-Check bereits bewiesen. Die aktuelle kanonische Aufzählung macht insbesondere Reynolds eigenständig verpflichtend; diesen Umfang stillschweigend zu ändern wäre keine rein sprachliche Korrektur.

## Tatsächliche Quelle versus Extraktion

Primärquelle: `curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf`, vollständig gelesene Strömungsphysik-Bausteine **Grundfach S. 45** und **Leistungsfach S. 75**, jeweils Wahlpflichtbaustein mit zehn Stunden. Die PDF-Seitenzahlen stimmen hier mit den gedruckten Seitenzahlen überein. Reproduzierbar über `pdftotext -f 45 -l 45 -layout <PDF> -` beziehungsweise Seite 75. Kein externer Abruf war nötig.

- Beide Tabellen nennen mögliche Inhalte. Bernoulli, Stokes und Reynolds stehen gemeinsam in der Beispielklammer zum Eintrag über Kontinuität und Strömungsgesetze; die Quelle verlangt nicht ausdrücklich alle drei als gesonderte Pflichtnachweise.
- Die didaktische Leitlinie lautet: **„Die zu behandelnden Gesetze ergeben sich aus den gewählten Beispielen.“** Dazu kommen der Einblick in Phänomene, Gesetzmäßigkeiten und Anwendungen sowie projektartiges Arbeiten; Sinkgeschwindigkeiten werden als Praktikum genannt.
- `input/RP/upper-secondary/source-extraction/DE_RP_PHYSIK_SEKII_MSS_SOURCE_EXTRACTION_DRAFT.source-extraction.json:506` bindet die Passage `rp-physics-sekii:rp-phys-sek2-fluid-dynamics-lf`. Ihre `rawText`-Fassung ist keine wortgetreue Abschrift der Originaltabelle: Sie fasst diese als formulierte Kompetenzen zusammen und lässt die Auswahlhinweise aus.
- Der Eintrag `rp-phys-sek2-continuity-bernoulli-stokes-reynolds` bei Zeile 3128 macht aus der Beispielklammer eine Liste mit separat angehängter Reynolds-Zahl und nennt `granularity: officialCompetencyRow`. Der Quellenanker `S. 44 und 75` ist für das Grundfach falsch: **S. 44 behandelt Astrophysik/Kosmologie, Strömungsphysik steht auf S. 45.** Die Abschnittszuordnung 4.4/5.4 ist dagegen richtig.

Alle verkürzten Repositorypfade in dieser Notiz beginnen unter `curricula/DE/Gymnasium/`, soweit nicht ausdrücklich `docs/`, `contracts/`, `backend/` oder `app/` genannt wird.

## Konkrete Mappings und Struktur

`mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json:566` sowie das gleichnamige `...source_extraction_to_canonical_physics.review.json:600` enthalten genau zwei direkte Zuordnungen auf dieses Ziel, beide **partial**:

- `rp-phys-sek2-continuity-bernoulli-stokes-reynolds` → `333ca92b…`;
- `rp-phys-sek2-sinking-velocities-practicum` → `333ca92b…`.

Die Reviewentscheidungen bei Zeilen 2758–2792 behaupten pauschal inhaltliche Abdeckung. Das ist kein zusätzlicher Beleg für vollständig beherrschte Experimente: Der kanonische Text verlangt qualitative Einordnung, nicht selbstständiges Messen von Sinkgeschwindigkeiten. Die Praktikumsstelle darf als Beispielkontext dienen, aber keine zusätzliche experimentelle Kompetenz verdeckt in dieses Ziel hineintragen. Strömungsphänomene/-arten sind dem Cluster `a658b54c-94ac-4e9c-93e3-defe1f2508a1` zugeordnet; dynamischer Auftrieb dem Nachbarn `24b4686a-e8a6-4583-8952-33e6f653c2a3`. Deren Inhalte werden hier nicht dem Ziel zugeschlagen.

Aktuelle Kanonik `canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json:34171`: Content-Leaf, AB2, `contains: []`, einziges direktes `requires` ist die Orientierung `5c44b9ba-9b05-4774-95d5-073230d3fc4f`. Einziger direkter Container ist `a658b54c…` (Zeile 34122); einziger direkter Nachfolger ist `4a58df57-f791-502f-8b8d-9ba155e46035` (Q4-Klausuraufgaben), der das Ziel sowohl in `requires` (Zeile 41539) als auch in `examData.coveredGoalIds` (Zeile 41630) nennt. Sein generischer Aufgabentext enthält keinen konkreten Strömungsnachweis.

Direkte `goalEntry`-Projektionen mit Label Strömungsphysik stehen in `composition-views/physik/de-rp-gk.view.json:923`, `de-rp-lk.view.json:903`, `de-rp-sekii-gk.view.json:340` und `de-rp-sekii-lk.view.json:320`, jeweils im Q4-Zweig und ohne einschränkendes `projectionRole`. Ein Split würde diese direkten Einträge nicht automatisch auf neue Kinder umstellen. Das bloße kanonische LK-Tag darf die tatsächlich vorhandene GF/GK-Projektion nicht ersetzen. Die historische Onboardingnotiz `provenance/rp-physics-onboarding.md:159` dokumentiert bewusst eine gemeinsame Oberfläche und warnt vor einem erzwungenen RP-spezifischen Split; sie ist Kontext, keine aktuelle Quellen- oder Atomicity-Freigabe.

## Sichere Reparaturoption

1. Zuerst die konkrete Originalstelle und Auswahlsemantik in der Extraktion/Quellenreconciliation korrekt binden: GF S.45, LF S.75, echte Beispielklammer, keine Pflicht zu sämtlichen Gesetzen. Die beiden bisherigen partial-Zuordnungen und die Praktikumsgrenze ausdrücklich neu begründen; keine pauschale Full-Coverage-Erhöhung.
2. Danach explizit entscheiden, ob die bestehende Identität eine **beispielgebundene qualitative Modelldeutung** meint. Dafür muss das Evidenzprofil einen gemeinsamen Erfolgskern zeigen: Aussagen und Voraussetzungen eines zum Fall passenden Gesetzes beziehungsweise einer Kennzahl erklären und in einem sinnvoll veränderten Fall wieder anwenden. Eine richtige Kontinuitätsdeutung belegt nicht zusätzlich Stokes oder Reynolds; umgekehrt muss eine illustrative Auswahl nicht alle Beispiele zum Pflichtkanon machen.
3. Nur nach dieser Umfangs-/Identitätsentscheidung wäre eine lokale DE/EN-Neufassung statt Split plausibel, beispielsweise als noch nicht angenommener Entwurf:

   DE: „Die lernende Person kann an ausgewählten Strömungsbeispielen die Aussagen und Voraussetzungen der jeweils verwendeten Gesetze oder Kennzahlen qualitativ erläutern, etwa der Kontinuitätsgleichung, der Bernoulli-Gleichung, des Stokes-Gesetzes oder der Reynolds-Zahl.“

   EN: “The learner can use selected flow examples to explain qualitatively the statements and assumptions of the laws or dimensionless quantities used in each case, such as the continuity equation, Bernoulli's equation, Stokes' law, or the Reynolds number.”

   Der Titel müsste dieselbe Auswahlsemantik ausdrücken. Dies ist bewusst keine automatische Übernahme: Gegenüber dem aktuellen verpflichtenden `sowie Reynolds-Zahl` ist die Scopefrage ausdrücklich zu entscheiden; danach folgen frische D-/P-Prüfung und notwendige abhängige Bindungen.
4. Falls stattdessen unabhängig verpflichtende Einzelkompetenzen gewünscht sind, deren Umfang separat belegen und einen echten Split planen; die RP-Beispielliste allein legitimiert keinen neuen Vierfach-Pflichtkanon.

## Identität und Mastery bei einem tatsächlichen Split

Eine parallele, zielgenaue read-only Prüfung fand keine vorhandene Alias-/Nachfolgerregistrierung oder einen konkreten Migrationsplan für `333ca92b…`. Die bisherige `curricularAtomic`-Registrierung in `quality/release-model/physik.semantic-kinds.json:1004` ist kein Ersatz für diese Entscheidung.

`docs/concept/skill-graph/dual-curriculum-package-releases.md:565` untersagt die Wiederverwendung von IDs für neue Bedeutungen; Zeile 576 untersagt die automatische Mastery-Verteilung bei Splits. `contracts/curriculum-package/v1/migration-aliases.schema.json:318` verlangt für `splitInto` eine Quelle, mindestens zwei Nachfolger, `masteryPolicy: reassess` und `historyPolicy: preserve-with-successor-links`. Ein neuer Zielzuschnitt benötigt deshalb explizite Identitäts-/Nachfolgerdaten und bewahrte Historie, nicht bloß mehrere neue Records.

Zusätzlich beachten: `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:1975` projiziert Legacy-Mastery ausschließlich aus **exact**-Mappings. Der Sonderpfad bei Zeile 2072 kann sichtbare Contains-Nachfolger mit `splitFromCanonicalGoalId` berücksichtigen. Die beiden hier geprüften direkten RP-Mappings sind **partial** und lösen diesen Pfad derzeit nicht aus; daraus folgt aber keine allgemeine sichere Split-Übertragung. Kein Lernendenbestand wurde eingesehen und keine bestehende Mastery-Abdeckung behauptet. Eine solche Runtime-Policy wäre nicht Teil einer stillen curricularen Textkorrektur.

## Quellenhashes

- Amtliche PDF: `sha256:3bf220e5e409fc4ae057b3327dfa3d445a8f27ad6961925aae5eb16f2d1c12cc`.
- Aktuelle Source-Extraction: `sha256:435baf95e7c075db0afa13a980bfc1506cdb647d93493a05902bb5515a94fc3a`.
- Direktes RP-Mapping: `sha256:62665721dc740a9fdac1262eb3ae3abb4c428cbbfd611ece6d56f6eaefdf3925`.
- RP-Source-Extraction-Reviewmapping: `sha256:5c6159e486a0265cb28d2221e420ddc485a3a272028830c2396d5ca8f17561fa`.
