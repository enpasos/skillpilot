# Umsetzungsplan Kanonisches Gymnasium

Snapshot: `2026-03-16`

Hinweis zur Laufzeitbereinigung (`2026-08-29`): Die temporären Einzel- und Sammel-Cutover-Endpunkte
für das Gymnasium, ihre Cockpit-/Operator-Bedienelemente sowie der dedizierte Download-Endpunkt
für das Lernenden-Kompatibilitätsarchiv wurden entfernt. Keine realen Bestands-Lernenden
benötigen diesen Übergangspfad. Die kanonischen Curricula sowie die bundesweiten Archiv-,
Mapping-, Provenienz-, Kompatibilitätsübersichts- und Themenübersichts-Register auf DE-Ebene
bleiben maßgeblich und unverändert. Die nachfolgenden Aussagen zu Cutover-Pfaden beschreiben
die Rollout-Historie, keine aktuell verfügbaren Laufzeitoperationen.

Dieses Dokument überführt die Rollout-Strategie aus den Konzeptdokumenten in einen umsetzungsorientierten Plan.

Siehe auch:

- `docs/concept/skill-graph/canonical-gymnasium-rollout.md`
- `docs/dev/canonical-gymnasium-migration-status.md`
- `docs/dev/canonical-gymnasium-math-bundeslaender-status.md`
- `docs/dev/canonical-gymnasium-applicability-design.md`
- `docs/dev/canonical-gymnasium-physics-parity-plan.md`

## Zweck

Die Umsetzung soll starten, ohne Folgendes zu brechen:

- bestehende hessische Lernenden-Abläufe,
- bestehende Custom-GPT-Abläufe,
- den aktuellen einheitlichen Learner-State-Vertrag.

Das Projekt beginnt daher mit einem kleinen, testbaren Piloten statt mit einem breit angelegten Curriculum-Umbau.

## Aktuell berichteter Stand

`docs/dev/canonical-gymnasium-migration-status.md` dient als einzige Quelle für den übergeordneten Gesamtscore.

Aktuell berichteter Migrationsstand am `2026-03-16`:

- `100%`

Einordnung:

- Der frühere Quellbaum der hessischen gymnasialen Oberstufe steht bei `100%` Abschluss des Delete-Gates auf Baumebene und ist bereits aus dem aktiven Repository gelöscht
- Der frühere Quellbaum der hessischen gymnasialen Mittelstufe steht bei `100%` Abschluss des Delete-Gates auf Baumebene und ist bereits aus dem aktiven Repository gelöscht
- `curricula/DE/BY/Gymnasium` steht nun ebenfalls bei `100%` Abschluss des Delete-Gates auf Baumebene und ist aus dem aktiven Repository entfernt

## Leitplanken

- Kanonische Lernziele nicht pro Bundesland duplizieren.
- Gelöschte Legacy-Quellbäume nicht wieder einführen; jeder verbleibende Kompatibilitäts- oder Prüfbedarf wird über die Archiv-, Mapping- und Provenienz-Lanes auf DE-Ebene aufgelöst.
- Die hessische gymnasiale Oberstufe hat den aktiven Repository-Pfad bereits verlassen; statt den alten Baum zu reaktivieren, sind die archivierten Quell-Snapshots unter `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/` zu nutzen.
- Die archivierten Quell-Snapshots der hessischen gymnasialen Oberstufe unter `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/` nicht verändern, nur um dort kanonische Inhalte unterzubringen.
- Die Custom-GPT-Schnittstelle unverändert lassen: ein Learner-State, eine Frontier, ein Mastery-Ablauf.
- In neuen bundeslandbezogenen Metadaten, Filtern und API-sichtbaren Feldern ISO-3166-2-Ländercodes verwenden, zum Beispiel `DE-HE` und `DE-BY`.
- Bestehende Verzeichnissegmente der Curricula während des Piloten nicht bloß zur Durchsetzung dieser Konvention umbenennen.
- Kanonische Skill-Landschaften der gymnasialen Fächer auf einem deutschlandweiten Pfad ablegen, nicht innerhalb eines einzelnen Bundesland-Teilbaums.
- Additive Infrastruktur gegenüber destruktiver Migration bevorzugen.
- Nur das Minimum an neuen Datenstrukturen einführen, das für den ersten Piloten erforderlich ist.
- Fachübergreifende Navigation von Anfang an als Entwurfsziel wahren.
- Für die Sek I mit unterschiedlichen Gesamtschulzeiten die erste kanonische Schicht auf die G9-Jahrgangsstufen `5-10` normieren, statt getrennte kanonische G8-/G9-Zweige anzulegen.
- Für aufbewahrte nicht-kanonische Materialien bundesweite, aber nach Bundesland getrennte Archiv-Lanes auf DE-Ebene nutzen. `curricula/DE/Gymnasium/input/DE-HE/abi` ist der Modellfall, keine Sonderausnahme.

## Erster Umsetzungsschnitt

Der erste Schnitt umfasst:

- Fach: Mathematik
- Quelle: Hessen Gymnasiale Oberstufe
- Modus: additiver Pilot

Dieser Schnitt erzeugt eine kanonische Skill-Landschaft für Mathematik, ohne den nach außen sichtbaren Lernablauf bereits zu verändern.

## Liefergegenstände

### D1. Kanonische Pilot-Skill-Landschaft

Erstelle eine erste kanonische Skill-Landschaft für Mathematik, abgeleitet aus der ausgereiften hessischen Oberstufen-Skill-Landschaft für Mathematik.

Anfängliche Randbedingungen:

- laufzeitkompatibles `SkillLandscape`-JSON
- noch keine weitreichende Umstrukturierung
- stabile IDs innerhalb der kanonischen Datei
- nur ein Fach im Umfang

### D2. Ziel-Mapping-Datei

Erstelle eine explizite Mapping-Datei von den hessischen Oberstufen-Mathematikzielen auf die kanonischen Mathematikziele.

Pilotumfang:

- Unterstützung für `exact`
- Unterstützung für `partial`
- Verzicht auf weitergehende Semantik bis zum tatsächlichen Bedarf

### D3. Backend-Projektionsschicht

Ergänze eine kompakte Backend-Komponente, die:

- kanonische Mastery über Mappings aus Legacy-Mastery auflöst,
- aktuelle Learner-State-Antworten stabil hält,
- die Legacy-/Kanonisch-Komplexität vor dem Custom GPT verbirgt.

Die Projektionsschicht arbeitet zunächst lesend (Read-first). Starte nicht mit einer invasiven Schreibmigration.

### D4. Invariantentests

Ergänze Tests, die für den überlappenden hessischen Pilotumfang belegen, dass:

- der Learner-State verfügbar bleibt,
- das Frontier-Verhalten stabil bleibt,
- die Mastery-Projektion deterministisch ist,
- bestehende API-/Controller-Verträge unverändert bleiben.

## Betriebszustände

Die kanonische Konvergenz wird pro übernommenem Teilbaum verfolgt, nicht nur pro Arbeitspaket.

Verwende diese Betriebszustände:

- `legacy_frozen`
  - der Legacy-Quellteilbaum bleibt für Konvergenzzwecke maßgeblich und schreibgeschützt
- `subtree_adopted`
  - der Teilbaum liegt in kanonischer Form auf DE-Ebene vor und besitzt explizite Mappings
- `cutover_ready`
  - Projektions-, Frontier- und Learner-State-Verhalten sind stabil genug für eine risikoarme betriebliche Umschaltung
- `legacy_view_retained`
  - der kanonische Pfad ist bevorzugt, während der alte Teilbaum als Kompatibilitätssicht verfügbar bleibt

Übergangsregel:

- `legacy_frozen` -> `subtree_adopted` -> `cutover_ready` -> `legacy_view_retained`

Übernahme-Checkliste für einen Teilbaum:

- der Teilbaum ist didaktisch kohärent
- die `contains`-Abdeckung ist vollständig genug, um ihn als Einheit zu navigieren
- Voraussetzungen sind übernommen oder explizit neu angebunden
- Legacy-zu-Kanonisch-Mappings existieren mit begründeter `exact`-/`partial`-Semantik
- Laufzeit-Projektionstests decken mindestens Mastery und die Normalisierung geplanter Ziele ab

Aktuelle operative Ausgangslage:

- Quell-JSONs der hessischen Mittelstufe (Sek I), Mapping-Fixtures und die zentralen Provenienzregister der Mittelstufe bestehen nun in Archiv-/Provenienz-Lanes auf DE-Ebene fort; der ursprüngliche Baum ist aus dem aktiven Repository stillgelegt
- Quell-JSONs der hessischen gymnasialen Oberstufe bestehen nur noch als archivierte Snapshots auf DE-Ebene unter `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/`; der ursprüngliche Baum ist aus dem aktiven Repository stillgelegt
- das erste kanonische Sek-I-Normierungsziel ist das gemeinsame G9-orientierte Jahrgangsstufenraster `5-10`; bildungsgangspezifische Quellbezeichnungen bleiben in Provenienz und archivierten Eingangsdaten erhalten
- aufbewahrte bundeslandspezifische Bestände wie `abi/`, Quellpakete und abgeleitete Prüfungspakete überdauern den Übergang in bundeslandbezogenen Archiv-Lanes auf DE-Ebene
- die kanonische Übersichtswurzel `Gymnasium (DE)` ist der aktuell bevorzugte bundesweite Einstiegspunkt für Lernende
- kompilierte knotenbezogene `applicability` ist für das geprüfte kanonische DE-Gymnasium-Set über `app/scripts/compileApplicability.ts`, `app/scripts/validateViewFilters.ts` und `app/scripts/applyApplicability.ts` umgesetzt; das aktuelle geprüfte Validator-Ergebnis lautet `0` Fehler, `0` aktive Warnungen, `136` akzeptierte Warnungen
- die Skill-Landschaft Mathematik auf DE-Ebene übernimmt den hessischen Oberstufenbaum vollständig (Bulk-Adoption) und bewahrt die bestehende Sek-I-Brücke sowie exakte hessische Legacy-Mappings für die spätere Lernendenmigration
- die Skill-Landschaft Physik auf DE-Ebene übernimmt den hessischen Oberstufenbaum vollständig und hält die bestehende fachübergreifende Mathematik-Brücke sowie die bayerischen Stoß-Anker-IDs für die spätere Lernendenmigration stabil
- die Skill-Landschaft Chemie auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Biologie auf DE-Ebene übernimmt den hessischen Oberstufenbaum als weiteren Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Informatik auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Geschichte auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Deutsch auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Politik und Wirtschaft auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Englisch auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Französisch auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Latein auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Spanisch auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Griechisch auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Chinesisch auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Musik auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- die Skill-Landschaft Wirtschaftswissenschaften auf DE-Ebene übernimmt den hessischen Oberstufenbaum als nächsten Hessen-zuerst-Fachschnitt vollständig und ist unter der gemeinsamen DE-Wurzel eingehängt
- mit der Ergänzung von Musik besitzt nun jede derzeit modellierte Fach-Skill-Landschaft der hessischen gymnasialen Oberstufe ein übernommenes Gegenstück auf DE-Ebene unterhalb von `Gymnasium (DE)`
- ein erster Backend-Cutover-Pfad für Lernende aus eingefrorenen hessischen Oberstufensichten für Mathematik/Physik/Chemie/Biologie/Informatik/Geschichte/Deutsch/Politik und Wirtschaft/Englisch/Französisch/Latein/Spanisch/Griechisch/Chinesisch/Musik/Wirtschaftswissenschaften in die Wurzel `Gymnasium (DE)` auf DE-Ebene steht bereit
- der Cutover stabilisiert nun Curriculum-Auswahl, Wurzel-/Fachfilter, Normalisierung des geplanten Scopes bei der ersten Antwort sowie die kanonische Fortsetzung unter Erhalt der bisherigen Legacy-Mastery-Historie
- der HTTP-Vertrag für den Cutover deckt nun auch den Fall der eingefrorenen hessischen Übersicht mit kombinierter Mathematik-/Physik-Auswahl sowie den direkten Chemie-Cutover mit kanonischer Fortsetzung des geplanten Scopes ab
- das Lernenden-Cockpit bietet nun einen ersten expliziten UI-Migrationspfad aus eingefrorenen hessischen Oberstufensichten nach `Gymnasium (DE)` und schaltet nach erfolgreichem Cutover den Landschaftskontext im Frontend um
- nach erfolgreichem UI-Cutover navigiert das Cockpit nun direkt in den migrierten kanonischen Fokus, statt Lernende auf der alten Hessen-Route oder lediglich auf der DE-Wurzel zu belassen
- der UI-Cutover-Dialog zeigt vor dem Auslösen der Migration eine Vorschau der übernommenen Hessen->DE-Übertragung je Fach und Kursniveau
- die Curriculum-Auswahl priorisiert für neue Lernende nun `Gymnasium (DE)` und kennzeichnet die eingefrorenen hessischen Oberstufensichten ausdrücklich als Kompatibilitätssichten
- die eingefrorene hessische Cockpit-Ansicht blendet den DE-Cutover nun auch direkt im Arbeitsbereich der Lernenden ein, sodass aufbewahrte Kompatibilitätssichten nutzbar bleiben, ohne den kanonischen Migrationspfad nur im Setup zu verstecken
- reguläre Auswahllisten beim Sitzungsstart und bei der Championship-Anmeldung führen Kompatibilitätssichten standardmäßig nicht mehr auf; sie bleiben dort nur erhalten, wenn sie bereits ausgewählt sind
- das Backend-Bootstrap für neue Lernende folgt derselben Regel und liefert empfohlene Curricula standardmäßig ohne Kompatibilitätssichten; der allgemeine UI-Endpunkt für Skill-Landschaften gibt Kompatibilitätseinträge explizit über `includeCompatibility=true` aus
- das Setup im Lernenden-Cockpit behandelt hessische Kompatibilitätsfächer nun als explizit einblendbaren Sekundärbereich, und kanonische `Gymnasium (DE)`-Setups bereinigen veraltete hessische Kompatibilitätseinträge aus gespeicherten Konfigurationen des persönlichen Curriculums
- befindet sich eine lernende Person noch in einer hessischen Kompatibilitätssitzung, läuft dasselbe Cockpit-Setup nun im reinen Stilllegungsmodus: Migration und Audit bleiben verfügbar, aber es fungiert nicht mehr als normaler Konfigurationseditor für den eingefrorenen Hessen-Pfad
- das Lernenden-Cockpit behandelt solche offenen hessischen Kompatibilitätssitzungen nun auch für Planung, Auswahl des aktiven Ziels und SRS-Training als schreibgeschützt/reine Prüfansicht, sodass der aufbewahrte Hessen-Pfad bereits vor der vollständigen Backend-Stilllegung kein normaler aktiver Lernarbeitsbereich mehr ist
- UI- und AI-Schreibendpunkte setzen dieselbe Regel nun serverseitig durch: aufbewahrte hessische Kompatibilitätssitzungen lehnen Schreibzugriffe auf Curriculum-Änderung, Planung, aktives Ziel, Mastery und Client-State ab, sodass die verbleibende Kompatibilitätsroute sowohl im Frontend als auch im Backend schreibgeschützt ist
- UI- und AI-Learner-State-Routen bedienen aufbewahrte hessische Kompatibilitätssitzungen nicht mehr als Live-Zustandssichten; die temporären Cockpit-Migrations- und einzelbezogenen Archiv-Bedienelemente wurden entfernt, nachdem sich das Migrationsfenster für reale Nutzende als leer erwiesen hat
- stillgelegte hessische Curriculum-Zusammenfassungen bleiben über das Archivregister `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` auf DE-Ebene für abgegrenzte Vergleichs-/Audit-Metadaten verfügbar, ohne eine Live-Projektion alter Lernzustände wiederherzustellen
- der Hessen-Cutover löst gespeicherte Zuordnungen `legacyGoalId -> sourceLandscapeId` nun ebenfalls über das Provenienzregister `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json` auf DE-Ebene auf, sodass die Fachableitung nicht mehr davon abhängt, dass ein hessischer Oberstufen-Skill-Graph zur Laufzeit geladen bleibt
- `/api/ui/landscapes?includeCompatibility=true` löst hessische Kompatibilitätsübersichten nun ebenfalls aus dem eingefrorenen Archivregister auf DE-Ebene auf, sodass Übersichts- und Listenmetadaten nicht mehr von geladenen Dateien der hessischen Oberstufen-Skill-Landschaften abhängen
- `/api/ui/curricula/{curriculumId}/topics` löst hessische Kompatibilitätsthemen nun ebenfalls aus dem eingefrorenen Archivregister `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json` auf DE-Ebene auf, während direkte Routen `/api/ui/landscapes/{id}` und `/closure` für hessische Kompatibilitäts-Skill-Landschaften stillgelegt sind
- das `Abi26`-Mathematik-Bootstrap für Hessen provisioniert Lernende nun auf das kanonische `Gymnasium (DE)` mit `DE-HE` an der Wurzel und kanonischen Mathematik-Filtern `GK`/`LK`, statt das stillgelegte hessische Mathematik-Curriculum direkt auszuwählen
- neue Curriculum-Auswahlen von Lernenden lehnen stillgelegte hessische Kompatibilitäts-IDs nun auch serverseitig ab, selbst wenn der Aufrufer diese IDs bereits kennt, sodass die Kompatibilitätsroute nicht als frischer Laufzeitpfad wieder geöffnet werden kann
- Hilfsskripte für Prüfung, Deployment und Übernahme der hessischen Oberstufe lösen aufbewahrte `abi/`-Standardpfade sowie archivierte Mapping-Standardpfade nun über `curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json` auf und ermitteln Legacy-Quellpfade der Fach-Skill-Landschaften über das gemeinsame Provenienz-Quellregister auf DE-Ebene statt über skriptweise hartcodierte Legacy-Baum-Defaults
- die operativen `abi/`-Metadaten für Hessen auf DE-Ebene folgen derselben Regel: Aufgabenbanken speichern `sourceLandscapeId` plus den gemeinsamen Pfad zum Provenienzregister statt Dateipfade alter Quell-Skill-Landschaften einzubetten, während Quellverweise in Blueprints, Quellkatalogen und Release-Bundles nur noch auf aufbewahrte Bestände unter `curricula/DE/Gymnasium/input/DE-HE/...` zeigen
- im Repository gepflegte hessische `abi/`-Markdown-Dokumente folgen ebenfalls dieser Trennung: selbst verfasste Pipeline-/QS-/Leitfadendokumente verweisen auf aufbewahrte DE-Bestände oder Einträge im Provenienzregister, während importiertes Roh-Quell-Markdown als archivarische Provenienz bewusst unverändert bleibt
- die Grenze zwischen aufbewahrten Beständen und Rohquellen wird nun durch `scripts/validate_hessen_upper_secondary_archive_paths.py` anhand der expliziten hessischen `allowedRawLegacyPathGlobs` in `curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json` durchgesetzt; dieses Gate ist sowohl in `.github/workflows/ci.yml` als auch lokal in `run_ci.sh` eingebunden
- die verbleibenden repositoryweiten Verweise auf den Legacy-Baum werden zusätzlich durch `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json` sowie `scripts/validate_hessen_upper_secondary_legacy_refs.py` eingezäunt, sodass aktive Laufzeit-, Tooling- und Testoberflächen nur noch über eine explizite Übergabe-Allowlist auf den eingefrorenen hessischen Oberstufenbaum verweisen dürfen
- `backend/src` enthält keinerlei explizite Verweise auf den hessischen Oberstufenbaum mehr; die verbleibenden Blocker auf Repository-Ebene sind rein deklarative Provenienz-/Transferdateien sowie die Validatoren, die diese Grenze absichern
- die eingefrorene Quell-JSON-Lane der hessischen Oberstufe ist nun unter `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/` gespiegelt, und `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` stellt `archiveSourcePath` bereit, sodass Autoren- und Deployment-Werkzeuge diese Snapshots ohne aktiven Legacy-Baum lesen können
- das Laden von Skill-Landschaften im Backend fällt nun ebenfalls auf diese archivierten Quell-Snapshots der hessischen Oberstufe zurück, sodass stillgelegte Curriculum-IDs nach der repositoryseitigen Löschübergabe für Release-Metadaten, Frontier-Invarianten und explizite Stilllegungs-/Konfliktbehandlung lesbar bleiben
- die Löschübergabe der hessischen Oberstufe wurde vollzogen: der ursprüngliche Baum ist aus dem aktiven Repository-Pfad entfernt, und `bash scripts/run_hessen_upper_secondary_delete_handoff_dry_run.sh` dient nun als Verifikationsbefehl nach der Stilllegung für die fortbestehende Archiv-/Provenienz-Lane
- ein expliziter Backend-Sammel-Cutover-Pfad mit `dryRun` und übergebener Lernenden-ID-Liste steht bereit, sodass spätere Hessen->DE-Migrationen geprobt und ausgeführt werden können, ohne globale Lernendenlisten offenzulegen
- die Operator-Oberfläche für den Sammel-Cutover unterstützt CSV-Export der Dry-Run-/Ausführungsergebnisse und erlaubt es Operatoren, die aktuelle Eingabeliste vor dem Auslösen der eigentlichen Migration auf die `eligible` Lernenden-IDs einzugrenzen
- der Backend-Cutover-Pfad für Lernende der hessischen Sek I deckt nun auch die eingefrorene gemischte Übersichtswurzel über die derzeit unterstützte Fläche `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch` ab; Physik der Mittelstufe wählt weiterhin automatisch die kanonische Mathematik mit aus, um die bestehende fachübergreifende Brücke sichtbar zu halten, und Französisch der Mittelstufe wechselt nun auf die gemeinsame kanonische Skill-Landschaft Französisch, statt die Stilllegung der gemischten Übersicht zu blockieren
- der reguläre Lernendeneinstieg bevorzugt nun auch gegenüber den hessischen Sek-I-Legacy-Wurzeln den kanonischen DE-Pfad: die hessischen Mittelstufen-Übersichts- und Fachwurzeln sind im Bootstrap und in allgemeinen Auswahloberflächen standardmäßig ausgeblendet, bleiben aber beibehaltbar, wenn sie bereits die aktive Auswahl bilden
- die eingefrorene Quell-JSON-Lane der hessischen Mittelstufe ist nun unter `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/source-json/` (`6` Dateien) gespiegelt, und `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` weist `archiveSourcePath` nun auch für diese Mittelstufen-Skill-Landschaften aus
- die Legacy-zu-Kanonisch-Mapping-Fixtures der hessischen Sek I liegen nun ebenfalls in der Archiv-Lane auf DE-Ebene unter `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/`
- eingefrorene Kompatibilitätsübersichten und Themenlisten der hessischen Sek I werden nun ebenfalls aus den Archivregistern `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` und `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json` auf DE-Ebene aufgelöst
- `scripts/validate_hessen_lower_secondary_archive_paths.py` und `scripts/validate_hessen_lower_secondary_legacy_refs.py` zäunen aufbewahrte Bestände und repositoryweite Verweise für die hessische Sek I ein; beide Prüfungen sind in `.github/workflows/ci.yml` sowie lokal in `run_ci.sh` eingebunden
- die Löschübergabe der hessischen Mittelstufe wurde vollzogen: der ursprüngliche Baum ist aus dem aktiven Repository-Pfad entfernt, und `bash scripts/run_hessen_lower_secondary_delete_handoff_dry_run.sh` dient nun als Verifikationsbefehl nach der Stilllegung gegen die fortbestehenden Archiv-/Provenienz-/Mapping-Lanes
- Quellziel-Hüllen (Closures) und Zielzugehörigkeiten der hessischen Sek I sind nun ebenfalls in den gemeinsamen Provenienzregistern `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` und `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json` auf DE-Ebene eingefroren, sodass die Überlebensfähigkeit der Mittelstufen-Übersicht und -Wurzeln nicht mehr vom aktiven Legacy-Baum abhängt
- das derzeit vom Cutover unterstützte hessische Sek-I-Legacy-Bündel ist über `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch` hinweg im Frontend und Backend schreibgeschützt; gemischte Übersichtssitzungen, die sich auf dieses unterstützte Bündel auflösen, lehnen aktive Lernschreibzugriffe ebenfalls ab, sobald die kanonische Cutover-Fläche vorliegt
- der erste bayerische Lernenden-Cutover-Pfad ist für direkte Legacy-`Mathematik`-Lernende in Betrieb: bayerische `Mathematik` migriert nach `Gymnasium (DE)` mit dem Wurzelfilter `DE-BY`, ausgewählter kanonischer Mathematik und normalisierter Fortsetzung des geplanten Scopes auf dem gemeinsamen kanonischen Mathematik-Rückgrat
- der reguläre Lernendeneinstieg bevorzugt nun auch gegenüber der bayerischen Legacy-Wurzel den kanonischen DE-Pfad: `Gymnasium (Bayern)` ist in allgemeinen Übersichts-/Bootstrap-Oberflächen standardmäßig ausgeblendet und bleibt nur erhalten, wenn es bereits die aktive Auswahl der lernenden Person ist
- der aktive übernommene Bayern-Korridor für Mathematik/Physik/Chemie/Biologie/Informatik/Geschichte/Deutsch/Englisch/Französisch/Spanisch/Italienisch/Russisch/Polnisch/Tschechisch/Griechisch/Wirtschaft_und_Recht/Politik_und_Gesellschaft/Latein/Musik/Chinesisch hängt nicht mehr allein am aktiven Baum `curricula/DE/BY/Gymnasium`: die übernommenen Bayern-Mappings liegen nun unter `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/`, das gemeinsame Quell-Skill-Landschaftsregister weist `archiveSourcePath` für die aktuell übernommenen bayerischen Quell-Skill-Landschaften aus, und `scripts/validate_bavaria_gymnasium_archive_paths.py` sowie `scripts/validate_bavaria_gymnasium_legacy_refs.py` zäunen die aufbewahrte Quell-Lane auf DE-Ebene und operative Verweise im Repository ein
- der derzeit unterstützte bayerische Legacy-Mathematikpfad ist als aktiver Laufzeitpfad abgekoppelt: direkte `Mathematik`-Sitzungen sind im Frontend und Backend schreibgeschützte Stilllegungssichten, UI-/AI-Schreibendpunkte lehnen Änderungen ab, und der kanonische Cutover nach `Gymnasium (DE)` + `DE-BY` bleibt die unterstützte Fortsetzung
- die aktuelle bayerische Physik-Pilotfläche verfügt über dieselbe direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Physik`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY`, ausgewählter kanonischer Physik plus erforderlicher Mathematik-Brücke, und aktive Legacy-Physiksitzungen sind im Frontend und Backend schreibgeschützte Stilllegungssichten statt regulär beschreibbarer Lernpfade
- die aktuellen bayerischen Chemie- und Biologie-Pilotflächen verfügen nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Chemie`- und -`Biologie`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- die aktuelle bayerische Informatik-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Informatik`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewählter kanonischer Informatik, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- die aktuelle bayerische Deutsch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Deutsch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Deutsch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Englisch-Pilot ergänzt `11` geprüfte Mappings in die kanonische DE-Englischschicht und liefert `2` festgeschriebene `DE-BY`-Applicability-Knoten auf der aktuell geprüften Englischfläche sowie einen direkten bayerischen `Englisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Englisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Englisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Englisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Französisch-Pilot ergänzt `11` geprüfte Mappings in die kanonische DE-Französischschicht und liefert `3` festgeschriebene `DE-BY`-Applicability-Knoten auf der aktuell geprüften Französischfläche sowie einen direkten bayerischen `Französisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Französisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Französisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Französisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Spanisch-Pilot ergänzt `8` geprüfte Mappings in die kanonische DE-Spanischschicht und liefert `2` festgeschriebene `DE-BY`-Applicability-Knoten auf der aktuell geprüften Spanischfläche sowie einen direkten bayerischen `Spanisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Spanisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Spanisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Spanisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Italienisch-Pilot ergänzt `8` geprüfte Mappings in die kanonische DE-Italienischschicht und liefert `8` festgeschriebene `DE-BY`-Applicability-Knoten sowie einen direkten bayerischen `Italienisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Italienisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Italienisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Italienisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Russisch-Pilot ergänzt `8` geprüfte Mappings in die kanonische DE-Russischschicht und liefert `8` festgeschriebene `DE-BY`-Applicability-Knoten sowie einen direkten bayerischen `Russisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Russisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Russisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Russisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Polnisch-Pilot ergänzt `5` geprüfte Mappings in die kanonische DE-Polnischschicht und liefert `5` festgeschriebene `DE-BY`-Applicability-Knoten sowie einen direkten bayerischen `Polnisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Polnisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Polnisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Polnisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Tschechisch-Pilot ergänzt `5` geprüfte Mappings in die kanonische DE-Tschechischschicht und liefert `5` festgeschriebene `DE-BY`-Applicability-Knoten sowie einen direkten bayerischen `Tschechisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Tschechisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Tschechisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Tschechisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Geschichte-Pilot ergänzt `56` geprüfte Mappings in die kanonische DE-Geschichtsschicht und liefert `58` festgeschriebene `DE-BY`-Applicability-Knoten über die erste geprüfte gemischte `G8`-/`G9`-Brücke sowie einen direkten bayerischen `Geschichte`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Geschichte-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Geschichte`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewählter kanonischer Geschichte samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Griechisch-Pilot ergänzt `14` geprüfte Mappings in die kanonische DE-Griechischschicht und liefert `11` festgeschriebene `DE-BY`-Applicability-Knoten auf einer frühen geprüften `E-Phase`-Brücke sowie einen direkten bayerischen `Griechisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Griechisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Griechisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Griechisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- die aktuelle bayerische Pilotfläche für Wirtschaft und Recht verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Wirtschaft und Recht`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewählten kanonischen `Wirtschaftswissenschaften`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Pilot für Politik und Gesellschaft ergänzt `39` geprüfte Mappings in die kanonische DE-Schicht Politik und Wirtschaft und liefert `22` festgeschriebene `DE-BY`-Applicability-Knoten über eine geprüfte gemischte `G8`-/`G9`-Brücke sowie einen direkten bayerischen `Politik und Gesellschaft`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Pilotfläche für Politik und Gesellschaft verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Politik und Gesellschaft`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem `Politik und Wirtschaft` samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- die aktuelle bayerische Latein-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Latein`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Latein samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Musik-Pilot ergänzt `15` geprüfte Mappings in die kanonische DE-Musikschicht und liefert `15` festgeschriebene `DE-BY`-Applicability-Knoten sowie einen direkten bayerischen `Musik`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Musik-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Musik`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewählter kanonischer Musik samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- der aktuelle bayerische Chinesisch-Pilot ergänzt `35` geprüfte Mappings in die kanonische DE-Chinesischschicht und liefert `33` festgeschriebene `DE-BY`-Applicability-Knoten sowie einen direkten bayerischen `Chinesisch`-Cutover-Pfad nach `Gymnasium (DE)`
- die aktuelle bayerische Chinesisch-Pilotfläche verfügt nun ebenfalls über direkte Cutover- und Stilllegungsbehandlung: direkte Legacy-`Chinesisch`-Lernende migrieren nach `Gymnasium (DE)` mit `DE-BY` und ausgewähltem kanonischem Chinesisch samt Standardfilter `GK`, und aktive Legacy-Sitzungen laufen als im Frontend und Backend schreibgeschützte Stilllegungssichten statt als regulär beschreibbare Lernpfade
- Quellziel-Hüllen und Zielzugehörigkeiten für Mathematik/Physik/Chemie/Biologie in Bayern liegen nun ebenfalls in den gemeinsamen Provenienzregistern `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` und `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json` auf DE-Ebene, sodass der aktuell übernommene Bayern-Korridor für archivierte Closure- oder Zugehörigkeitsabfragen nicht mehr vom aktiven Legacy-Baum abhängt
- der gesamte verbleibende bayerische Gymnasium-Legacy-Baum ist auf dem aktiven Laufzeitpfad nun als reine Kompatibilitätssicht eingestuft, sodass explizite UI-/AI-Curriculum-Auswahlen neue Lernende nicht mehr in bayerische Legacy-Wurzel- oder -Fachsichten leiten, während bestehende stillgelegte Sitzungen auf Archiv/Cutover beschränkt bleiben
- der kanonische Mathematik-Pilotkorridor Funktionen steht auf `cutover_ready`
- der kanonische Physik-Bewegungskorridor steht auf `cutover_ready`
- der kanonische Physik-Korridor E.2 Mechanik steht auf `cutover_ready`
- der kanonische Physik-Schnitt E.3 Waagerechter Wurf steht auf `cutover_ready`
- die erste hessische Sek-I-Physikbrücke Mechanik steht auf `subtree_adopted`
- die erste hessische Sek-I-Physikbrücke Optik steht auf `subtree_adopted`
- die erste hessische Sek-I-Physikbrücke Elektrizitätslehre steht auf `subtree_adopted`
- die erste hessische Sek-I-Chemiebrücke Grundlagen steht auf `subtree_adopted`
- die erste hessische Sek-I-Biologiebrücke Grundlagen/Zelle plus Fotosynthese/Zellatmung steht auf `subtree_adopted`
- die kanonische Chemie-Basis Hessen steht auf `subtree_adopted`
- die kanonische Biologie-Basis Hessen steht auf `subtree_adopted`
- die kanonische Informatik-Basis Hessen steht auf `subtree_adopted`
- die kanonische Geschichte-Basis Hessen steht auf `subtree_adopted`
- die kanonische Deutsch-Basis Hessen steht auf `subtree_adopted`
- die kanonische Basis Politik und Wirtschaft Hessen steht auf `subtree_adopted`
- die kanonische Englisch-Basis Hessen steht auf `subtree_adopted`
- die kanonische Französisch-Basis Hessen steht auf `subtree_adopted`
- die kanonische Latein-Basis Hessen steht auf `subtree_adopted`
- die kanonische Spanisch-Basis Hessen steht auf `subtree_adopted`
- die kanonische Griechisch-Basis Hessen steht auf `subtree_adopted`
- die kanonische Chinesisch-Basis Hessen steht auf `subtree_adopted`
- die kanonische Musik-Basis Hessen steht auf `subtree_adopted`
- die kanonische Wirtschaftswissenschaften-Basis Hessen steht auf `subtree_adopted`
- auf Ebene der verfolgten Quellbäume haben die hessische gymnasiale Oberstufe, die hessische Mittelstufe und das bayerische Gymnasium die Löschübergabe abgeschlossen (`legacy_deleted`)

## Steuerung in der Abschlussphase

Die Migration befindet sich nun in der expliziten Abschlussphase:

- die hessische gymnasiale Oberstufe ist bereits aus dem aktiven Repository stillgelegt
- das verbleibende Programmrisiko wird nun von optionalen Entscheidungen zur Umfangserweiterung bestimmt
- daher sollte die primäre Spitzenkennzahl für den Fortschritt nicht mehr allein der historische Teilbaum-Übernahmescore sein

Ab hier gilt als maßgeblicher Gesamtprozentsatz der Completion-Track-Score aus
`docs/dev/canonical-gymnasium-migration-status.md`:

- `completion-track score` = Durchschnitt der Delete-Gate-Scores der verfolgten Legacy-Bäume

Aktueller Spitzenwert der Abschlussphase:

- `100%`

Operative Konsequenz:

- den historischen Abschlussscore stabil halten, neue Erweiterungsarbeit jedoch auf eine bundesweite Mathematik-zuerst-Spur auf DE-Ebene verlagern
- die Aufnahme des nächsten Bundeslands in die kanonische Gymnasium-`Mathematik` gegenüber der Verbreiterung weiterer Nicht-Mathematik-Fächer bevorzugen
- die Migrationseinheit auch auf dieser Mathematik-zuerst-Spur didaktisch geschlossen halten; keine Big-Bang-Umstellungen ganzer Fächer oder ganzer Bundesländer durchführen
- Quellimport und Aufbau der Mapping-Lane für das nächste Mathematik-Bundesland höher priorisieren als optionale Abgrenzungsfragen außerhalb des Kerns wie etwa Debatten zum Umfang eines bayerischen `abi/`-Bestands

Strategische Neufokussierung am `2026-03-20`:

- nach dem geprüften Abschluss der bayerischen Applicability über das aktuell aktive Fächerset soll der nächste Konvergenzdruck aus **neuen Bundesländern in der kanonischen Gymnasium-Mathematik** kommen
- die aktuelle Realität im Mapping-Archiv spiegelt weiterhin nur `DE-HE` und `DE-BY` wider; der nächste aussagekräftige Architekturtest ist daher ein drittes Bundesland auf dem gemeinsamen kanonischen Mathematik-Rückgrat, nicht zusätzliche Fächerbreite auf derselben Zwei-Länder-Basis
- das Arbeitsmodell lautet ab hier: **Mathematik zuerst, ein Bundesland nach dem anderen, ein didaktisch geschlossener Korridor nach dem anderen**
- siehe `docs/dev/canonical-gymnasium-math-de-expansion-plan.md` für die konkrete Reihenfolge und die Aufnahmekriterien

## Arbeitspakete

## WP0. Bestandsaufnahme (Baseline Inventory)

Status: `done`

Aufgaben:

- die genaue(n) Quelldatei(en) der hessischen Mathematik-Skill-Landschaft identifizieren
- ermitteln, welche Lernziel-IDs bereits stabil genug für ein Mapping sind
- Backend-Klassen identifizieren, die für das Laden von Zielen, Learner-State, Frontier und Mastery-Persistenz zuständig sind
- ermitteln, wo eine Mapping-Registry mit minimaler Angriffsfläche ergänzt werden kann

Erwartetes Ergebnis:

- eine kurze Bestandsnotiz in `tmp/canonical-gymnasium-work_notes.md`

Ergebnis der Bestandsaufnahme:

- Quelldatei der hessischen Oberstufen-Mathematik identifiziert:
  `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot`
- Quell-Landscape-ID identifiziert:
  `2796fc7b-ba9d-446f-8f26-711dd6d8a9a3`
- kleinste Einfügepunkte im Backend identifiziert:
  - Laden / Nachschlagen von Skill-Landschaften: `backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java`
  - Lesen / Schreiben von Mastery und einheitlicher Learner-State: `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`
- Mapping-Dateien können gefahrlos als gewöhnliche JSON-Dateien in curriculumnahen Verzeichnissen liegen, da der bestehende Loader für Skill-Landschaften JSON-Dateien ohne `landscapeId` plus `goals`-Array bereits überspringt

## WP1. Mapping-Format und Loader

Status: `done`

Aufgaben:

- JSON-Struktur für Mappings definieren
- Backend-Loader für Mapping-Dateien ergänzen
- doppelte oder widersprüchliche Mappings frühzeitig validieren
- das Format für den Piloten bewusst schlank halten

Vorgeschlagener anfänglicher Speicherort:

- `curricula/.../mapping/` oder ein anderer curriculumnaher Ort, der die Zuständigkeit sichtbar hält

Entscheidungsregel:

- den kleinsten Speicherort und Loader-Entwurf wählen, der später keine Duplizierung erzwingt

Ergebnis von WP1:

- minimales Mapping-Format im Backend umgesetzt:
  - Felder auf oberster Ebene: `version`, `sourceLandscapeId`, `targetLandscapeId`, `mappings`
  - Eintragsfelder: `legacyGoalId`, `canonicalGoalId`, `matchType`
- aktuell unterstützte `matchType`-Werte:
  - `exact`
  - `partial`
- widersprüchliche doppelte Mappings für dieselbe `legacyGoalId` werden sofort beim Laden abgewiesen
- JSON-Dateien, die weder Skill-Landschaft noch Mapping sind, werden weiterhin ignoriert
- anfängliche Ablagekonvention für gepflegte Mapping-Dateien:
  - curriculumnah unter `curricula/.../mapping/*.json` ablegen
- Konvention für Bundesland-Kennungen in späteren Overlay-/Filter-Metadaten:
  - ISO-3166-2-Codes wie `DE-HE` und `DE-BY` verwenden
  - bestehende Repository-Pfadsegmente wie `DE/HE` unverändert lassen, sofern keine separate Dateisystemmigration nötig wird
- Erkennungsregel für Mappings:
  - gewöhnliche `.json`-Dateien prüfen und Mapping-Dateien anhand ihrer JSON-Struktur statt über ein spezielles Dateinamenssuffix identifizieren
- Mapping-Dateien lassen `landscapeId` und `goals` bewusst weg, sodass der bestehende `LandscapeService` sie weiterhin ignoriert
- Implementierungsklassen:
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingService.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingFile.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingEntry.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/ResolvedGoalMapping.java`
- anfängliche Testabdeckung:
  - `backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingServiceTest.java`

## WP2. Kanonische Skill-Landschaft Mathematik

Status: `done`

Aufgaben:

- die erste Datei der kanonischen Mathematik-Skill-Landschaft erstellen
- die Datei nah an der aktuellen `SkillLandscape`-Struktur halten
- die Herkunft aus der hessischen Oberstufen-Mathematik dokumentieren
- Bayern oder Sek I noch nicht einmischen

Abnahmekriterien:

- Datei lädt über den regulären Ladepfad für Skill-Landschaften
- Graph-Validierung läuft erfolgreich durch

Ergebnis von WP2:

- erste kanonische Mathematik-Skill-Landschaft ergänzt:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- erstes reales Hessen-zu-Kanonisch-Mapping-Fixture ergänzt:
  - `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json`
- vorläufige Ortsentscheidung für den Piloten:
  - den ersten kanonischen Seed physisch getrennt von bundeslandspezifischen Quellbäumen auf einem deutschlandweiten Pfad halten
- Pilotumfang bewusst klein gehalten:
- Pilotwurzel
  - Motivationsziel
  - ein einführender Analysis-Zweig zu Funktionen und Darstellungsformen
- Koexistenzstrategie:
  - alle Pilotziele verwenden neue IDs
  - die Pilot-Skill-Landschaften bleiben direkt ladbar, der lernendenseitige Einstiegspunkt ist jedoch nun die gemeinsame Wurzel `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json`
- aktuelle lernendenseitige Filteraufteilung:
  - Wurzel: `ALL`, `DE-HE`, `DE-BY`
  - untergeordnete Fächer: `GK`, `LK`
- aktuelle Laufzeitregel:
  - der gewählte Bundesland-Filter an der Wurzel wird bei der Zielfilterung in die ausgewählten kanonischen Fach-Skill-Landschaften weitergereicht
- aktuelle Laufzeitregel ist noch übergangsweise:
  - die kanonische Bundesland-Sichtbarkeit wird derzeit zur Laufzeit aus Mappings und Provenienz abgeleitet
  - die Auflösung `sourceLandscapeId -> jurisdiction` kann nun aus dem Provenienzregister `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` auf DE-Ebene bedient werden, statt allein von einer geladenen Legacy-Skill-Landschaftsdatei abzuhängen
  - Champion-/Themen-Äquivalenz für die hessische Oberstufe kann `sourceLandscapeId + sourceGoalId -> atomic legacy closure` nun ebenfalls aus dem Provenienzregister `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` auf DE-Ebene bedienen
  - die Zielarchitektur soll auf kompilierte knotenbezogene `applicability` konvergieren; siehe `docs/dev/canonical-gymnasium-applicability-design.md`
- Verifikation:
  - Backend-Tests bestätigen das Laden der Pilot-Skill-Landschaft und des Mapping-Fixtures im Repository
  - die Graph-Validierung besteht mit der neuen Pilot-Skill-Landschaft

## WP3. Leseseitige Mastery-Projektion

Status: `done`

Aufgaben:

- kanonische Mastery aus zugeordneter Legacy-Mastery berechnen
- die bestehende Speicherung der Legacy-Mastery intakt lassen
- keine Änderungen am Custom GPT voraussetzen
- noch keine Datenmigration für Lernende erzwingen

Wichtiger Hinweis:

- Mastery ist derzeit nach `learner + goal key` geschlüsselt, nicht nach `learner + landscape`, sodass die Projektion additiv eingeführt werden kann

Ergebnis von WP3:

- leseseitige Projektion ergänzt in:
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getMastery`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getMasteryWithTimestamps`
- vorläufige Projektionsregel im Piloten:
  - nur `exact`-Mappings projizieren Mastery auf kanonische Ziele
  - die Projektion greift nur, wenn das kanonische Ziel in der aktuell ausgewählten Curriculum-Sicht sichtbar ist
  - eine höhere vorhandene kanonische Mastery hat Vorrang vor projizierter Legacy-Mastery
  - zeitstempelbehaftete Lesezugriffe lösen Gleichstände über den neueren Zeitstempel auf
- Auswirkung auf das Laufzeitverhalten:
  - hessische Legacy-Sichten behalten ihr gespeichertes Mastery-Verhalten
  - kanonische Pilotsichten können projizierte Legacy-Mastery ohne GPT-/API-Änderungen nutzen
  - Frontier-Berechnung und Aufbau des Learner-State profitieren automatisch, da sie Mastery bereits über `LearnerService` lesen
- die direkte Testabdeckung umfasst nun:
  - leseseitige Projektion kanonischer Mastery
  - kanonische Frontier auf Basis projizierter Legacy-Mastery
  - Kompatibilität des kanonischen Learner-State ohne Durchsickern von Legacy-Zielen
  - Ausschluss des Durchsickerns in Gegenrichtung bei Legacy-Sichten

## WP4. Kompatibilität des Learner-State

Status: `done`

Aufgaben:

- sicherstellen, dass `getLearnerState` weiterhin einen kohärenten Gesamtzustand zurückgibt
- sicherstellen, dass die Frontier-Logik für hessische Bestands-Lernende stabil bleibt
- sicherstellen, dass kanonische Pilotsichten projizierte Mastery konsumieren können
- jede Anforderung vermeiden, nach der der GPT Übergänge auf der Datenschicht verstehen müsste

Abnahmekriterien:

- keine neuen verpflichtenden GPT-Actions
- keine neue clientseitige Fallunterscheidung nach Legacy-/Kanonisch-Modus

Ergebnis von WP4:

- Learner-State-Kompatibilität rund um sichtabhängige Lernziel-IDs ergänzt in:
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getLearnerState`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getRichFrontier`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getPlannedGoals`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setPlannedGoals`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setActiveGoal`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setMastery`
- aktuelle Kompatibilitätsregel:
  - stellt das aktuell ausgewählte Curriculum kanonische Ziele bereit, werden Legacy-Ziel-IDs überall dort auf sichtbare kanonische Ziel-IDs normalisiert, wo ein Mapping existiert
  - `exact`-Mappings werden für Active-Goal- und Mastery-Abläufe verwendet
  - `partial`-Mappings sind zusätzlich für die Verankerung geplanter Ziele / des Scopes zulässig
  - die Persistenz bleibt leichtgewichtig: für den Piloten ist keine Sammelmigration gespeicherter Lernzustände erforderlich
- praktische Auswirkung:
  - kanonische Pilotsichten lassen zugeordnete Legacy-IDs nicht mehr in geplante Ziele oder den Zustand des aktiven Ziels durchsickern
  - `setMastery` kann erfolgreich abgeschlossen werden, selbst wenn das gespeicherte aktive Ziel noch eine Legacy-ID trägt, die sichtbare Lerncoach-Schleife aber bereits kanonisch läuft
  - UI-/GPT-Abläufe behalten einen einheitlichen, kohärenten Learner-State-Vertrag
- die gezielte Verifikation deckt nun ab:
  - projizierte IDs geplanter Ziele in der kanonischen Sicht
  - projizierte IDs aktiver Ziele in der kanonischen Sicht
  - Schreibvorgänge für kanonische Mastery, wenn das gespeicherte aktive Ziel ursprünglich von einer Legacy-ID stammte

## WP5. Testabdeckung

Status: `done`

Aufgaben:

- Unit-Tests für das Laden und Nachschlagen von Mappings ergänzen
- Service-Tests für die Mastery-Projektion ergänzen
- Learner-State-Invarianten für den Piloten ergänzen
- einen Regressionstest ergänzen, der sicherstellt, dass das bestehende hessische Legacy-Verhalten intakt bleibt

Ergebnis von WP5:

- Testabdeckung für den Mapping-Loader liegt für repositorygestützte Fixtures und die Konfliktbehandlung vor
- die Testabdeckung im `LearnerService` sichert nun explizit die ersten kanonischen Cutover-Invarianten für den Mathematik-Funktionskorridor ab:
  - exakte Legacy-Mastery aus Hessen und Bayern projiziert deterministisch auf dieselben kanonischen Ziele
  - die kanonische Frontier schaltet über projizierte Legacy-Mastery frei, ohne Legacy-IDs in den sichtbaren Learner-State durchsickern zu lassen
  - gemischte geplante Legacy-Ziele falten sich auf dieselben kanonischen Teilbaum-Ziele zusammen
  - gespeicherte kanonische Mastery wird durch schwächere projizierte Legacy-Mastery nicht herabgestuft
  - gleichwertige Projektionsstände werden deterministisch über den neueren Zeitstempel aufgelöst
- praktische Konsequenz:
  - der erste übernommene Mathematik-Funktionskorridor kann auf Backend-/Laufzeitseite nun als `cutover_ready` geführt werden, während die Legacy-Sichten verfügbar bleiben

## WP6. Anbindung der hessischen Sek-I-Mathematik

Status: `in_progress`

Aufgaben:

- die kanonische Mathematik nach unten um die hessische Sek I erweitern
- Mappings explizit halten
- die API-Oberfläche während des inhaltlichen Ausbaus unverändert lassen

Bisheriger Fortschritt in WP6:

- erster Anbindungsschnitt der hessischen Sek I zur kanonischen Skill-Landschaft Mathematik hinzugefügt:
  - Zuordnungen / funktionale Zusammenhänge
  - proportionale Zuordnungen
  - lineare Funktionen
  - quadratische Gleichungen
  - quadratische Funktionen
- die Anbindung der hessischen Sek-I-Mathematik ist nun um das erste geprüfte zeilenbasierte Brückenpaket über diesen ursprünglichen Korridor hinaus verbreitert:
  - exakte geprüfte Zeilen-Mappings für Quadratwurzeln, Ähnlichkeit/Strahlensatz sowie Kreis/Zylinder
  - exakte geprüfte Grundlagen-Mappings für Sicherheit im Umgang mit rationalen Zahlen, Sichtbarkeit geometrischer Grundlagen, Umgang mit Größen/Einheiten sowie die J6-Basis zu Symmetrie/Winkeln
  - die kanonische `J6`-Basis zu Flächeninhalt/Volumen ist nun in getrennte atomare Ziele für Flächen- und Körpermaße aufgeteilt, sodass Hessen dort mit exakter Evidenz auf Zeilenebene statt über eine breite `partial`-Brücke abbilden kann
  - die kanonische `J9`-Basis zu Potenzen/Wurzeln ist nun so aufgeteilt, dass Hessen das graphenbasierte Potenz-/Wurzelfunktionsziel exakt anbinden kann, während die gemeinsame Potenzgesetz-Route als Geschwisterknoten sichtbar bleibt
  - die kanonische `J8`-Basis zur linearen Analysis ist nun so aufgeteilt, dass Hessen `Lineare Gleichungen und Ungleichungen lösen` exakt anbinden kann, während Bayern die exakte Zeile für Geradengleichungen, Nullstellen und Schnittpunkte behält
  - die kanonische `quadratic vertex`-Basis ist nun so aufgeteilt, dass Hessen den Zugang über binomische Formeln exakt anbinden kann, während Bayern die exakte Scheitelpunkt-/Graphen-Route als eigenen Geschwisterknoten behält
  - die kanonische `J5`-Zahlengrundlagen-Basis ist nun so aufgeteilt, dass Hessen `Natürliche Zahlen sicher darstellen, ordnen und mit ihnen rechnen` exakt anbinden kann, während Bayern die exakte Additions-/Subtraktionsroute mit natürlichen und ganzen Zahlen behält
  - verbleibende geprüfte Mathematik-Offenpunkte liegen nicht mehr bei der hessischen Zeilenabdeckung; es verbleiben lediglich die zwei override-gestützten bayerischen Funktionswert-Lücken aus dem Piloten
  - exakte Mappings für Satz des Pythagoras, Potenzgesetze mit ganzzahligen Exponenten, Kongruenz und Termaufstellung
  - der Voraussetzungsabschluss für `DE-HE` ist in der Mapping-Schicht nun für rationale Zahlen, Terme, geometrische Grundlagen sowie den Umgang mit Größen und Einheiten explizit modelliert
- der kanonische Seed verweist nun sowohl auf Quellmaterial der hessischen Oberstufe als auch auf Material der hessischen Sek I
- explizite zweite Mapping-Datei für Hessen Sek I -> kanonischer Pilot ergänzt
- für diese Inhaltserweiterung waren keine Änderungen am API-/GPT-Vertrag erforderlich
- erster hessischer Sek-I-Physik-Brückenschnitt zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Mechanik-Brückencluster unter der DE-Physik
  - exakte Mappings für Bewegungsdiagramme, Kräfte/Trägheit, Reibung und qualitative mechanische Energie
  - ein eigenes kanonisches atomares Ziel zu Dichte/Masse/Volumen schließt nun die alte hessische Zeile `7.4 Mechanik`, sodass der breite Mechanik-Anker selbst exakt statt nur `partial` angebunden werden kann
  - die hessische Zeile `Kräfteigenschaften nutzen` bindet nun exakt an ein dediziertes kanonisches Sek-I-Atom `force-properties` statt an den breiten Mechanik-Brückencluster
  - die hessische Zeile `10.1 Arbeit und Energie` bindet nun exakt an einen dedizierten kanonischen Sek-I-Cluster `work-and-energy`, der untergeordnete Ziele zu qualitativer Arbeit, mechanischer Energie, Wärme und elektrischer Energie bündelt
  - ausgewählte Physikziele der Oberstufe hängen nun explizit von diesen übernommenen Sek-I-Mechanikankern ab
  - Mastery-Projektion und Frontier-Freischaltung sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Wärmelehre-Brückenschnitt zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Sek-I-Wärmelehrecluster unter der DE-Physik
  - exakte Mappings decken nun die gesamte hessische Zeile `7.2 Wärmelehre` ab, einschließlich Temperatur/Wärme, Temperaturmessung und Ausdehnung, Teilchenmodell sowie Wärmeübertragung
  - das kanonische Atom `Wärme als Energieform` hängt nun explizit von dieser geprüften Sek-I-Wärmelehrebrücke ab statt nur von der groben Basis zur mechanischen Energie
  - Mastery-Projektion für den übernommenen Wärmelehrecluster und seine atomaren Zeilen sowie eine Frontier-Freischaltung über das Teilchenmodell hin zur Wärmeübertragung sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Optik-Brückenschnitt zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Sek-I-Optik-Brückencluster unter der DE-Physik
  - exakte Mappings decken nun sowohl `7.1 Optik 1` als auch `8.1 Optik 2` ab, einschließlich Lichtausbreitung, Strahlenmodell, Reflexion, Linsenabbildungen, Sehen und einfacher optischer Geräte
  - `Linsenabbildungen` hängt nun explizit vom übernommenen Sek-I-Anker zum Strahlenmodell ab
  - Mastery-Projektion für beide übernommenen Optikcluster und ihre atomaren Zeilen sowie die Frontier-Freischaltung über das Strahlenmodell für Linsenabbildungen sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Elektrizitätslehre-Brückenschnitt zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Sek-I-Elektrizitätslehre-Brückencluster unter der DE-Physik
  - exakte Mappings decken nun sowohl `7.3 Magnetismus und Elektrizität 1` als auch `8.2 Elektrizität 2` ab, einschließlich Magneten/Feldern, einfachen Stromkreisen, Stromwirkungen, Strommessung, Elektrostatik/Spannung, Strom-Spannungs-Zusammenhang, Widerstandsschaltungen und elektrischer Sicherheit
  - der J8-Cluster zu Spannung/Sicherheit hängt nun explizit vom übernommenen J7-Elektrizitätscluster ab
  - Mastery-Projektion für beide übernommenen Elektrizitätscluster und ihre atomaren Zeilen sowie Frontier-Freischaltungen für Stromwirkungen/Strommessung und den Spannungs-Strom-Zusammenhang sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Radioaktivitäts-Brückenschnitt zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Sek-I-Radioaktivitätscluster unter der DE-Physik
  - exakte Mappings decken nun die gesamte nicht-fakultative hessische Zeile `10.2 Radioaktivität` ab, einschließlich Atombau, Strahlungsnachweis/-wirkungen sowie Anwendungen/Risiken
  - der Oberstufen-Einstiegspunkt `Radioaktive Strahlung und Wirkungen` hängt nun explizit von dieser geprüften Sek-I-Radioaktivitätsbrücke ab
  - Mastery-Projektion für den übernommenen Radioaktivitätscluster und seine atomaren Zeilen sowie eine Frontier-Freischaltung vom Atombau zum Strahlungsnachweis sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Brückenschnitt zu Druck/Auftrieb zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Sek-I-Cluster zu Druck und Auftrieb unter der DE-Physik
  - exakte Mappings decken nun die fakultative hessische Zeile `8.3 Druck und Auftrieb` ab, einschließlich Druck in Flüssigkeiten/Gasen, qualitativer Druck-Temperatur-Zusammenhänge, archimedischem Prinzip und erster qualitativer Deutungen zu Fliegen/Luftwiderstand
  - der neue Cluster hängt explizit von der geprüften Sek-I-Mechanikbrücke ab, und das Druck-Temperatur-Atom hängt zusätzlich von der geprüften Sek-I-Wärmelehrebrücke ab
  - Mastery-Projektion für den übernommenen Druckcluster und seine atomaren Zeilen sowie eine Frontier-Freischaltung aus projizierter Druck-/Dichte-Mastery hin zum Auftrieb sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Akustik-Brückenschnitt zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Sek-I-Akustikcluster unter der DE-Physik
  - exakte Mappings decken nun die fakultative hessische Zeile `8.3b Akustik` ab, einschließlich Schallquellen, Schallausbreitung, Tonhöhe/Lautstärke, Hören/Lärm sowie musikbezogener Schallphänomene
  - das Atom zur Schallausbreitung nutzt explizit den geprüften Sek-I-Teilchenmodell-Anker wieder, und der Oberstufen-Q2-Einstiegspunkt `Harmonische Wellen und ihre Größen` hängt nun zusätzlich von der geprüften Sek-I-Akustikbrücke ab
  - Mastery-Projektion für den übernommenen Akustikcluster und seine atomaren Zeilen sowie eine Frontier-Freischaltung aus projizierter Mastery zu Schallquellen und Teilchenmodell hin zur Schallausbreitung sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Farben-Brückenschnitt zur kanonischen DE-Skill-Landschaft Physik hinzugefügt:
  - neuer kanonischer Sek-I-Farbencluster unter der DE-Physik
  - exakte Mappings decken nun die fakultative hessische Zeile `8.3c Farben` ab, einschließlich Farbentstehung/-zerlegung, additiver und subtraktiver Farbmischung, einfacher Farbwahrnehmung und technischer Farbanwendungen
  - die Farbenbrücke nutzt explizit den geprüften Sek-I-Anker zur Lichtausbreitung wieder, und der Oberstufen-Q3-Einstiegspunkt `Spektrum elektromagnetischer Wellen` hängt nun zusätzlich von der geprüften Sek-I-Farbenbrücke ab
  - Mastery-Projektion für den übernommenen Farbencluster und seine atomaren Zeilen sowie eine Frontier-Freischaltung aus projizierter Mastery zur Farbentstehung hin zur Farbmischung sind durch gezielte Backend-Tests abgedeckt
- die hessische Sek-I-Brücke zu Arbeit/Energie ist nun auf die `J10`-Fortführung von `10.1 Arbeit und Energie` erweitert:
  - exakte Mappings decken nun auch `Wärme als Energieform` und `Elektrische Energie nutzen` ab, wobei das kanonische Wärmeenergie-Atom explizit von der geprüften Sek-I-Wärmelehrebrücke und das kanonische Elektroenergie-Atom von der geprüften Sek-I-Spannungsbrücke abhängt
- erster hessischer Sek-I-Chemie-Brückenschnitt zur kanonischen DE-Skill-Landschaft Chemie hinzugefügt:
  - neuer kanonischer Grundlagencluster für Arbeitsweisen, Stoffe, Aggregatzustände, Lösungen und erste Säure-Base-Unterscheidungen
  - exakte Mappings für die übernommenen J8-Chemie-Atome sowie `partial`-Scope-Anker aus Hessen J8/8.1
  - ausgewählte Protolyse-Ziele der E-Phase hängen nun explizit von diesen übernommenen Sek-I-Chemieankern ab
  - Mastery-Projektion, Projektion geplanter Ziele und Frontier-Freischaltung sind durch gezielte Backend-Tests abgedeckt
- die hessische Sek-I-Chemie-Grundlagenbrücke ist nun auf die vollständige geprüfte Zeile `8.1 Stoffe – Strukturen – Eigenschaften` erweitert:
  - neue kanonische Sek-I-Atome zu Sicherheit und Trennverfahren liegen nun innerhalb des bestehenden Grundlagenclusters
  - die hessischen Atome `Gefahren beim Umgang mit Chemikalien` und `Trennverfahren für Stoffgemische` bilden nun exakt ab, und der alte Cluster `8.1` selbst steigt von `partial` auf `exact` auf
  - Mastery-Projektion für den verbreiterten Schnitt zu Sicherheit/Trennverfahren sowie eine lokale Sek-I-Frontier-Freischaltung aus projizierter Mastery zu Arbeitsweisen und Stoffen hin zu Sicherheit, Trennverfahren und Aggregatzuständen sind durch gezielte Backend-Tests abgedeckt
- die hessische Sek-I-Chemie-Reaktionsbrücke weitet die geprüfte Übernahme nun auf `8.2 Chemische Reaktion – Stoff- und Energieumsatz` aus:
  - neuer kanonischer Sek-I-Reaktionscluster für Reaktionsmerkmale, einfache Oxidation/Reduktion, Verbrennung, Reaktionsenergie und Massenerhaltung
  - die hessische Zeile `8.2` und alle fünf übernommenen J8-Atome bilden nun exakt in diesen Cluster ab
  - die Redox-Route `Einfache Redoxreihen aufstellen` der E-Phase in der Oberstufe hängt nun zusätzlich vom übernommenen Sek-I-Anker zu Oxidation/Reduktion ab, ohne die früheren Startknoten der E-Phase auszuweiten
  - Mastery-Projektion, Projektion geplanter Ziele und lokale Sek-I-Frontier-Freischaltung für den erweiterten Reaktionsschnitt sind durch gezielte Backend-Tests abgedeckt
- die hessische Sek-I-Chemie-Symbolsprachenbrücke weitet die geprüfte Übernahme nun auf `9.1 Chemische Symbolsprache und Anwendung` aus:
  - neuer kanonischer Sek-I-Symbolsprachencluster für konstante Proportionen, Dalton-Modell, chemische Symbole/Formeln, einfache Reaktionsgleichungen und erste Redoxschemata
  - die hessische Zeile `9.1` und alle fünf übernommenen J9-Atome bilden nun exakt in diesen Cluster ab
  - der neue Cluster nutzt die geprüfte Reaktionsbrücke `8.2` als didaktische Basis wieder, und die lokale Frontier-Freischaltung deckt nun den späten J9-Endpunkt `Redoxreaktionen und Oxidationszahlen` der Symbolsprache ab
  - Mastery-Projektion, Projektion geplanter Ziele und Frontier-Freischaltung für die Symbolsprache sind durch gezielte Backend-Tests abgedeckt
- die hessische Sek-I-Chemie-Brücke zu Ionen/Elektrolyse weitet die geprüfte Übernahme nun auf `9.3 Elektrolyse und Ionenbegriff` aus:
  - neuer kanonischer Sek-I-Cluster zu Ionen/Elektrolyse für Leitfähigkeit, Ionen als Ladungsträger und Elektrolyse einfacher Salzlösungen
  - die hessische Zeile `9.3` und alle drei übernommenen J9-Atome bilden nun exakt in diesen Cluster ab
  - der neue Cluster nutzt die geprüfte Symbolsprachenbrücke `9.1` als didaktische Basis wieder, und die Oberstufenroute `Elektrolyse beschreiben` hängt nun zusätzlich vom übernommenen Sek-I-Elektrolyseanker ab
  - Mastery-Projektion, Projektion geplanter Ziele und lokale Frontier-Freischaltung für den erweiterten Ionen-/Elektrolyseschnitt sind durch gezielte Backend-Tests abgedeckt
- die hessische Sek-I-Chemie-Atombau-Brücke weitet die geprüfte Übernahme nun auf `10.1 Atombau, Periodensystem und Ionenbindung` aus:
  - neuer kanonischer Sek-I-Cluster zu Atombau und Bindung für Kern-Hülle-Modell, Energiestufen nach Bohr, Orientierung im Periodensystem, Ionenbildung über die Edelgasregel sowie Ionenbindung
  - die hessische Zeile `10.1` und alle fünf übernommenen J10-Atome bilden nun exakt in diesen Cluster ab
  - der neue Cluster nutzt die geprüfte Symbolsprachenbrücke `9.1` als didaktische Basis wieder, während `Ionenbildung` zusätzlich vom geprüften Ionenanker `9.3` und die Oberstufenroute `Bindungsmodelle sicher nutzen` nun vom übernommenen Sek-I-Ionenbindungsanker abhängt
  - Mastery-Projektion, Projektion geplanter Ziele und lokale Frontier-Freischaltung für den erweiterten Atombau-Schnitt sind durch gezielte Backend-Tests abgedeckt
- erster hessischer Sek-I-Biologie-Brückenschnitt zur kanonischen DE-Skill-Landschaft Biologie hinzugefügt:
  - neuer kanonischer Cluster zu Grundlagen und Zellen für Biologie als Naturwissenschaft, Kennzeichen des Lebendigen, Mikroskopie, Pflanzenzellen sowie den Vergleich von Pflanzen- und Tierzelle
  - exakte Mappings für die übernommenen Sek-I-Biologie-Atome sowie `partial`-Scope-Anker aus den hessischen Einführungs- und Zellclustern
  - ausgewählte Zellbiologie-Ziele der E-Phase hängen nun explizit von diesen übernommenen Sek-I-Biologieankern ab
  - Mastery-Projektion, Projektion geplanter Ziele und Frontier-Freischaltung sind durch gezielte Backend-Tests abgedeckt
- hessische Sek-I-Biologiebrücke in derselben kanonischen DE-Skill-Landschaft Biologie verbreitert:
  - neuer kanonischer Cluster zu Fotosynthese und Zellatmung für Lichtabhängigkeit, Kohlenstoffdioxid/Wasser, Stärke-/Sauerstoffnachweis, Wortgleichung und erste Bedeutungsbrücke zur Zellatmung
  - exakte Mappings für die übernommenen hessischen Stoffwechsel-Atome aus `7.2` sowie ein `partial`-Scope-Anker aus dem hessischen Cluster `7.2`
  - ausgewählte Q3-Stoffwechselziele hängen nun explizit von diesen übernommenen Sek-I-Biologieankern ab
  - Mastery-Projektion, Projektion geplanter Ziele und Q3-Frontier-Freischaltung sind durch gezielte Backend-Tests abgedeckt

## WP7. Mapping der bayerischen Mathematik

Status: `in_progress`

Aufgaben:

- `curricula/DE/BY/Gymnasium/Mathematik.json` in die kanonische Mathematikschicht abbilden
- die bayerische Struktur als Platzierungs-/Sicht-Metadaten statt als duplizierten Inhalt erhalten

Bisheriger Fortschritt in WP7:

- erstes Bayern-Mapping-Fixture ergänzt:
  - `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json`
- der anfängliche Pilotumfang bleibt bewusst eng gefasst und nutzt den bereits stabilisierten kanonischen Funktionspfad wieder:
  - Funktionsbegriff
  - Deutung linearer Funktionen
  - Geradengleichungen, Nullstellen und Geradenschnittpunkte
  - direkte Proportionalität
  - Scheitelpunktbestimmung bei quadratischen Funktionen
  - Deutung quadratischer Funktionen
  - Eigenschaften quadratischer Funktionsgraphen
  - Lösen quadratischer Gleichungen
- der kanonische Pilot führt nun zwei kompakte Bayern-kompatible Atome mit, statt enger gefasste bayerische Ziele auf breitere bereits vorhandene kanonische Ziele zu pressen:
  - `Lineare Funktionen rechnerisch untersuchen`
  - `Scheitelpunkte quadratischer Funktionen bestimmen`
- diese beiden Atome sind auf Seite der hessischen Sek I nun ebenfalls über explizite `partial`-Mappings verankert aus:
  - `Lineare Gleichungen und Ungleichungen loesen`
  - `Binomische Formeln nutzen`
- bayerische Themencluster bilden derzeit mit `partial`-Semantik auf den kanonischen Sek-I-Funktionscluster ab, sodass Scope und Planung ohne Inhaltsduplizierung konvergieren können
- gezielte Regressionstests für Repository-Fixtures und den `LearnerService` decken diesen ersten Bayern-Schnitt ab

## WP8. Fachübergreifender Pilot

Status: `in_progress`

Aufgaben:

- eine erste kombinierte Sicht Mathematik + Physik ergänzen
- zunächst nur eine kleine Menge expliziter `requires`-Kanten Mathematik -> Physik anlegen
- prüfen, ob sich die Navigation verbessert, bevor fachübergreifende Abhängigkeiten weiter ausgebaut werden

Bisheriger Fortschritt in WP8:

- erster kanonischer Physik-Pilot auf dem deutschlandweiten Pfad ergänzt:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- Pilotumfang bleibt bewusst eng gefasst:
  - Bewegungskorridor E.1 der hessischen Oberstufe
  - erster Teilbaum E.3 Waagerechter Wurf der hessischen Oberstufe
  - Bewegungsdiagramme
  - gleichförmige Bewegung
  - gleichmäßig beschleunigte Bewegung
  - freier Fall
  - Bewegungsmodellierung
  - Bezugssysteme und Superposition
  - waagerechter Wurf
  - Verkehrssicherheit / Reaktions- und Bremswege
- erstes explizites Mapping-Fixture Hessen Physik -> kanonische Physik ergänzt:
  - `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json`
- der Physik-Pilot nutzt den bestehenden kanonischen Mathematik-Piloten wieder, statt Inhalte zu duplizieren:
  - ausgewählte kanonische Mathematikatome sind im Physik-Bewegungscluster sichtbar
  - atomare Physikziele ergänzen nur eine kleine Menge expliziter Voraussetzungskanten Mathematik -> Physik
- zweiter Physik-Übernahmeschnitt ergänzt:
  - der hessische E.2-Newton-Teilbaum (`Newtons Axiome und Inertialsysteme`) ist nun an den kanonischen Physik-Piloten angebunden
  - der übergeordnete hessische E.2-Elterncluster bildet mit `partial`-Semantik auf diesen übernommenen Newton-Schnitt ab
- dritter Physik-Übernahmeschnitt ergänzt:
  - der hessische E.2-Erhaltungsteilbaum (`Erhaltungssaetze`) ist nun an den kanonischen Physik-Piloten angebunden
  - der übernommene Erhaltungskorridor hält Ziele zu Energie, Impuls und einfachen Stößen als geschlossene Migrationseinheit zusammen
- E.2-Härtungsschritt ergänzt:
  - eine kanonische E.2-Mechanikwurzel gruppiert die übernommenen Teilbäume zu Newton und Erhaltungssätzen nun als explizite gemeinsame Migrationseinheit
  - der hessische E.2-Elterncluster bildet nun `exact` auf diesen kanonischen E.2-Korridor ab
- erster bayerischer Physik-Kompatibilitätsschnitt ergänzt:
  - ein kompaktes Bayern-Mapping-Fixture projiziert ausgewählte Mechanikziele aus Ph8/Ph9/Ph10 in den kanonischen Physik-Piloten
  - die ersten bayerischen Scope-Anker decken Bewegungsmodellierung, Energieerhaltung und Impulserhaltung ab
- bayerische Stoßbrücke ergänzt:
  - ein kompaktes kanonisches Stoß-Atom nimmt das breiter gefasste bayerische Stoßziel auf, ohne die bestehenden hessenbasierten Atome für elastische/inelastische Stöße umzuformen
- bayerische Kante zur 2D-Bewegung ergänzt:
  - ausgewählte bayerische Ziele zum waagerechten Wurf und zur Bewegungsmodellierung knüpfen nun an den kanonischen Bewegungsschnitt an
  - das bayerische Analyseziel zum waagerechten Wurf und das breite Ziel zur Bewegungsmodellierung projizieren nun `exact` auf die übernommenen kanonischen Atome
  - die übrigen mitgenutzten Hüllknoten für die bayerische Sichtbarkeit stützen sich weiterhin dort auf explizite Overrides oder `partial`-Evidenz, wo noch kein ehrliches 1:1-Quellziel vorliegt
- Neuverankerung von Bayern an E.3 ergänzt:
  - die ausgewählten bayerischen Ziele zum waagerechten Wurf hängen nun am neuen kanonischen E.3-Schnitt, statt ältere Bewegungs-/Freier-Fall-Atome mitzunutzen
- erster E.3-Übernahmeschnitt ergänzt:
  - der hessische Teilbaum `Waagerechter Wurf und Superposition` ist als neue Migrationseinheit im Status `subtree_adopted` an den kanonischen Physik-Piloten angebunden
  - der breitere eingefrorene hessische E.3-Elterncluster bildet `partial` auf diesen übernommenen Schnitt zum waagerechten Wurf ab
- Scope-Normalisierung für gemischte Bundeslandstände gehärtet:
  - redundante kanonische Kind-Scopes werden nun entfernt, sobald ein zugeordneter hessischer oder bayerischer Elterncluster sie bereits umfasst
- Normalisierung geplanter Scopes im Learner-State angeglichen:
  - `getLearnerState` liefert für gemischte Hessen-/Bayern-Pläne nun dieselben zusammengefalteten kanonischen Eltern-Scopes zurück, die `getPlannedGoals` bereits bereitstellte
- HTTP-Zustandsvertrag abgedeckt:
  - der UI-Learner-State-Endpunkt besitzt nun Integrationstests, die persistierte gemischte Hessen-/Bayern-Legacy-Pläne lesen und prüfen, dass das serialisierte Feld `goals.planned` für Bewegung, E.2-Mechanik und Erhaltungssätze jeweils nur den zusammengefalteten kanonischen Eltern-Scope ausgibt
- erster Cutover-Nutzungstest abgedeckt:
  - ein gemischter Hessen-/Bayern-Erhaltungsplan samt gemischter projizierter Legacy-Mastery liefert am UI-Learner-State-Endpunkt nun eine gemeinsame kanonische Stoß-Frontier
- Cutover-Nutzungstest für Bewegung abgedeckt:
  - ein gemischter Hessen-/Bayern-Bewegungsplan samt projizierter bayerischer Physik-Mastery und hessischer Mathematik-Mastery liefert am UI-Learner-State-Endpunkt nun eine gemeinsame kanonische Frontier zur gleichförmigen Bewegung
- Cutover-Nutzungstest für E.2 abgedeckt:
  - ein gemischter Hessen-/Bayern-E.2-Plan samt projizierter hessischer Mastery zur beschleunigten Bewegung liefert am UI-Learner-State-Endpunkt nun eine gemeinsame kanonische Newton-Frontier
- Nutzungstest für E.3 abgedeckt:
  - ein hessischer E.3-Legacy-Plan samt projizierter hessischer E.2-Mastery liefert am UI-Learner-State-Endpunkt nun eine kanonische Superpositions-Frontier
- gemischter Nutzungstest für E.3 abgedeckt:
  - ein gemischter Hessen-/Bayern-E.3-Plan samt projizierter hessischer E.2-Mastery liefert am UI-Learner-State-Endpunkt dieselbe kanonische Superpositions-Frontier
- Invarianten der Cutover-Bereitschaft für E.3 abgedeckt:
  - exakte Mastery-Projektion von hessischen Legacy-E.3-Atomen auf kanonische E.3-Atome
  - Vorrang kanonischer Werte und Auflösung von Gleichständen über den Zeitstempel für zugeordnete E.3-Mastery
  - Verhalten beim Setzen des aktiven Ziels und beim Schreiben von Mastery für zugeordnete kanonische E.3-Ziele
  - Freiheit hessischer Legacy-Physiksichten von durchsickernden kanonischen E.3-Zielen
- die gezielte Verifikation deckt nun ab:
  - Laden des Wurzel-Curriculums und Hüllenbildung von der kanonischen Physik in die kanonische Mathematik
  - Laden der im Repository abgelegten Physik-Mapping-Fixtures
  - Frontier- und Learner-State-Verhalten unter Nutzung projizierter hessischer Physik- und Mathematik-Mastery innerhalb des Physik-Piloten
  - erste bayerische Physik-Mastery-Projektion und Scope-Normalisierung in den kanonischen Physik-Piloten
  - exakte Projektion des bayerischen Stoßziels auf das kanonische Stoßbrücken-Atom der Physik
  - `partial`-Scope-Normalisierung bayerischer 2D-Bewegungsziele auf bestehende kanonische Bewegungsatome
  - Normalisierung geplanter Ziele für neu zugeordnete bayerische Ziele zum waagerechten Wurf in den neuen kanonischen E.3-Schnitt
  - Normalisierung geplanter Ziele aus dem eingefrorenen hessischen E.3-Elterncluster und dem übernommenen Teilbaum zum waagerechten Wurf in den neuen kanonischen E.3-Schnitt
  - Zusammenfalten gemischter Hessen-/Bayern-Scopes auf gemeinsame kanonische Wurzeln für Bewegung, Erhaltungssätze und E.2
  - Zusammenfalten gemischter Hessen-/Bayern-Scopes auf die neue gemeinsame kanonische E.3-Wurzel
  - Ausgabe geplanter Ziele im Learner-State mit demselben Zusammenfalten gemischter Hessen-/Bayern-Scope-Kombinationen auf gemeinsame kanonische Wurzeln für Bewegung, Erhaltungssätze und E.2
  - exakte Normalisierung geplanter Ziele aus dem hessischen E.2-Elterncluster und dem hessischen Erhaltungscluster in kanonische E.2-Scopes
  - Frontier-Freischaltung innerhalb des gehärteten E.2-Korridors aus projizierter hessischer Mastery
  - Projektion aktiver Ziele und Schreibverhalten für kanonische Mastery bei zugeordneten E.2-Zielen
  - deterministischer Projektionsvorrang und Zeitstempel-Gleichstandsauflösung auf kanonischen E.2-Zielen
  - Freiheit hessischer Legacy-Physiksichten von durchsickernden kanonischen E.2-Zielen
  - Cutover-Bereitschafts-Invarianten für den Physik-Bewegungskorridor:
    - exakte Projektion von Legacy-Physik-Mastery auf kanonische Physikziele
    - Normalisierung geplanter Ziele aus dem hessischen E.1-Cluster in den kanonischen Physikkorridor
    - kanonischer Ablauf für aktives Ziel und Mastery-Schreibvorgänge bei zugeordneten Legacy-Physikzielen
    - Freiheit von Legacy-Physiksichten gegenüber durchsickernden kanonischen Physikzielen
    - deterministischer Projektionsvorrang und Zeitstempel-Gleichstandsauflösung auf kanonischen Physikzielen
- praktische Konsequenz:
  - der übernommene Physik-Bewegungskorridor kann auf Backend-/Laufzeitseite nun als `cutover_ready` geführt werden, während die eingefrorene hessische Physiksicht verfügbar bleibt
  - der kanonische Physik-Korridor E.2 Mechanik kann auf Backend-/Laufzeitseite nun ebenfalls als `cutover_ready` geführt werden, während die eingefrorene hessische Physiksicht verfügbar bleibt
  - der kanonische Physik-Schnitt E.3 Waagerechter Wurf kann auf Backend-/Laufzeitseite nun ebenfalls als `cutover_ready` geführt werden, während die eingefrorene hessische Physiksicht verfügbar bleibt
  - derselbe kanonische Physik-Pilot nimmt nun einen ersten bayerischen Legacy-Schnitt auf, ohne eine zweite kanonische Struktur einzuführen

## Empfohlene Ausführungsreihenfolge

1. WP0 Bestandsaufnahme (Baseline Inventory)
2. WP1 Mapping-Format und Loader
3. WP2 Kanonische Skill-Landschaft Mathematik
4. WP3 Leseseitige Mastery-Projektion
5. WP4 Kompatibilität des Learner-State
6. WP5 Testabdeckung
7. WP6 Anbindung der hessischen Sek-I-Mathematik
8. WP7 Mapping der bayerischen Mathematik
9. WP8 Fachübergreifender Pilot

## Statusmodell

Verwende in diesem Dokument und in den Arbeitsnotizen folgende Statuswerte:

- `todo`
- `in_progress`
- `blocked`
- `done`
- `later`

## Änderungsrichtlinie

Nutze `docs/` für dauerhaftes Projektwissen:

- Architekturentscheidungen
- Rollout-Stufen
- stabile Dateiformate
- verabschiedete Migrationsregeln

Nutze `tmp/canonical-gymnasium-work_notes.md` für flüchtige Ausführungsnotizen:

- aktueller Sprint-Stand
- offene Fragen
- Zwischenentscheidungen
- konkrete nächste Schritte

## Definition eines guten ersten Meilensteins

Der erste Meilenstein ist erfolgreich, wenn:

- ein kanonischer Mathematik-Pilot existiert,
- die hessische Oberstufen-Mathematik darauf abgebildet ist,
- sich die aktuellen Learner-APIs aus Sicht des GPT unverändert verhalten,
- mindestens ein deterministischer Pfad der Mastery-Projektion getestet ist,
- kein bestehender hessischer Lernenden-Workflow gebrochen wird.
