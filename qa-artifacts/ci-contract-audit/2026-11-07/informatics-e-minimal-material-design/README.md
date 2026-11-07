# Konkreter kleiner E-Aufbau: drei lokale Aufgaben

**Fachliche Designentscheidung:** Die beiden nicht vollständig materialisierten E-Prüfungen `bb651ed7-2674-580c-8916-ac5aa88d93f8` und `fa47a714-07c3-589b-a4e2-385a33e84c79` werden ausdrücklich durch **drei neue lokale Prüfungsidentitäten** ersetzt. Damit werden aus22 aktuellen Examdefinitionen23. Der Schul-AG-/Webkontext wird wiederverwendet. Das alte bb651-Material nennt HTTP, HTML und JavaScript nur als Materialüberschriften; konkrete Eingaben, Code und belastbare Lösungen fehlen. Ein materieller Reuse-Pass oder eine Übernahme seiner drei Cluster-Coverages wäre unbegründet.

Das Paket enthält die tatsächlichen Aufgaben, vollständige Lösungen und Rubriken sowie ausführbare Muster für HTML/CSS und JavaScript. Es ist eine **konkrete private Autorenvorlage**, keine aktive Quelle, unabhängige Materialfreigabe, M6/M7-Freigabe oder Human Approval. Die vorhandene Entscheidung, keine Informatikergebnisse erhalten zu müssen, benötigt weder Aliase noch eine Migrationsruntime. Andere Fächer sind davon nicht betroffen.

| Neue lokale Aufgabe | Tatsächlich geprüfte Inhalte | Coverage | Direkte notwendige `requires` | Mindestkriterien |
|---|---|---:|---:|---:|
| Netz/HTTP | Rechnernetz, IP/DNS/TCP-IP, Client-Server-Protokoll, Authentifizierung/Logrisiken |4|3|12/12|
| Webdokument | HTML, Grund-CSS einschließlich einspaltigem Grid, Formular/GET/POST, Dokumentbaum |4|3|10/10|
| Buchungslogik | Variablen/Ein-Ausgabe, Objektzustand, Kontrollstrukturen, Unterprogramme, Debuggen, Testdokumentation, Codeanpassung |7|4|12/12|

Die vollständigen UUIDs und unveränderten gewöhnlichen Goaltexte stehen in `coverage-matrix.json`; `draft-goals.json` enthält unmittelbar übernehmbare vollständige Draftobjekte. Die drei Bedeutungen sind bewusst getrennt: ein gelungener Netzabruf belegt noch keine HTML-Erstellung und eine gute Webseite noch keine korrekte Zustandsänderung. Ein zusätzlicher umfassender E-Abschlusstest ist für diesen Aufbau nicht nötig. Der kleine gemeinsame Schul-AG-Kontext verbindet echte Verwendungssituationen, erzwingt aber keine harte Reihenfolge zwischen den drei Aufgaben.

## Quellen- und Scopeentscheidung

Basis ist der geprüfte Source37 `d163550987320c6c8667fde4782a40ed4308525b8b9f025fcfc7fd6d70591d9c`. Die aktuelle Arbeit des Doing-Agenten an fünf Draftstatuswerten, der SL10-Dokumentbindung und dem Q2-Profilanschluss ist getrennt; die endgültige Materialintegration muss auf dessen neuer Quelle erfolgen und neu gebunden werden.

Der **tatsächlich lokale Original-PDF-Text** des hessischen KC, Druckseiten28 sowie30–32, wurde gelesen. E.1–E.3 sind verbindliche Themenfelder; E.4 Projekt und E.5 Kryptologie sind dort keine pauschale zusätzliche Doppelpflicht. E.1 nennt Netze, IP, DNS, TCP/IP und Client-Server-Sicherheitsaspekte. E.2 nennt Grundgerüst, Dokumentbaum, CSS, **Grid-Layout** und Formulare. Das kleine Grundgrid ist daher enthalten. Daraus folgt nicht automatisch die weitergehende kanonische Mehrviewport-Leistung. E.3 trägt Kontrollstrukturen, Datentypen, Parameter/Rückgaben und ereignisgebundene Ein-/Ausgabe; objektorientierte Modellierung steht noch nicht im Mittelpunkt. Die Sprachwahl liegt im genannten Rahmen bei der Fachkonferenz. JavaScript ist hier das explizite eigene Aufgabenangebot, keine für Hessen behauptete allgemeine Schulsprachfestlegung.

Die vorhandenen HE-Extractionzeilen sind überwiegend `sourceSnapshotGoal`. Ihr `sourceText` ist oft eigener Goaltext. `original-e-inputs.json.gz` bewahrt diese tatsächlichen Eingaben verlustfrei komprimiert; sie werden nicht nachträglich zu Originalzitaten oder amtlichen Vollleistungsbeweisen erklärt. Die fachliche Zuschnittsbegründung stützt sich auf die tatsächlich gelesenen PDF-Passagen. Das Paket kopiert keine vollständigen amtlichen Texte/PDFs.

Alle15 abgedeckten gewöhnlichen Ziele sind im Source37 sowohl GK als auch LK zugeordnet und in den relevanten HE-/Own-Compositiontargets enthalten. Das PDF unterscheidet für E nicht eigens GK/LK. Die technische Angebotsentscheidung lautet daher **HE-kompatibles eigenes Angebot für beide Profile**, nicht zwei verschiedene amtliche E-Pflichten. Kanonische Own-GK/LK-Views dürfen es als eigenes Angebot enthalten. Bayerische und andere Landespflichten sind damit nicht qualifiziert. HE-Kohortenfragen, andere Quellenlücken und vollständige amtliche E-Abdeckung werden nicht als erledigt behauptet.

## Verbindliche Strukturbedingungen für die Übernahme

`integration-contract.json` enthält die exakten Felder und18 betroffenen Viewreferenzen. Die Übernahme ist nur zusammenhängend fachlich stimmig:

1. Die zwei alten Examdefinitionen ausdrücklich zurückziehen und die drei frischen IDs aufnehmen. Keine stille Umbenennung, keine Alias-/Resultübernahme. Das aktuelle HE-Snapshot-Exact-Mapping `7fc8c5e4-5d0b-4a4e-b94b-5b743c93816a -> bb651...` zurückziehen; historische Belege erhalten, niemals auf die drei neuen Prüfungen umdeuten. Die Elternherkunft `b9cb98f0... -> 91c5...` ist Strukturherkunft, kein Material-/Pflichtnachweis.
2. **Elterncluster `91c5be09-cc6b-5f57-bfe1-9f0038faf26a`: `contains` genau die drei neuen IDs, `requires: []`, Gewicht3 und HE-Bezug.** Die bisherigen Anforderungen an die ganzen Cluster Internet/HTML/Programmierung gelten nicht universell für jede einzelne der drei Aufgaben. Die neue Verantwortung liegt in den notwendigen atomaren Blattvoraussetzungen. Nur Leaf-Coverage zu kürzen wäre unzureichend: die Gegenprobe mit den alten Elternrequires erzwingt wieder18 Vorbereitungsblätter, darunter die LK-Paketleistung, bei jeder der drei Aufgaben.
3. Den lokalen Ast in HE-CrossStage sowie den beiden technischen kanonischen GK/LK-Views behalten. In den15 anderen Landesviews genau die bisher ungeprüfte E-Prüfungsastreferenz auf91c5 zurückziehen. Alle gewöhnlichen Targets und alle anderen Routen erhalten. Die betreffende Landesroute bleibt damit ehrlich ohne dieses qualifizierte E-Material. Das tatsächliche Gegenbeispiel BY zeigt: `applicability: DE-HE` allein verhindert beim Composition-Subtree-Collector keine Übernahme der drei Kinder. Ein Scopeetikett ersetzt deshalb die Viewkorrektur nicht.
4. Alle25 gewöhnlichen E-Inventarziele bleiben in ihrer Definition unverändert.15 werden hier geprüft; die übrigen10 stehen vollständig in `residual-ten.json`. Das sind Projektstruktur/Prototyp/Präsentation, drei Kryptologieziele, Mehrviewport-Layout, LK-Paketübertragung, breite Softwarequalitätsbewertung und Pflichtenheft. Sie sind weder gelöscht noch anerkannt. Der reine Orientierungsanker wird durch bestehende gewöhnliche prerequisites mitgeführt, bleibt aber ohne Coverage: Motivation enthält laut aktueller Definition keine zu prüfenden Detailkenntnisse.
5. Die vier anderen neuen Platzhalter bleiben fachlich offen und unverändert; ihre vollständigen Hashes sind im Vertrag gebunden. **Own20 `6ebc2a67-ea20-5c4e-8a63-635f40438d6a` bleibt mit Material, Coverage und seinen exakten Scopegrenzen unverändert.** Kein neuer Q2-Beweis wird aus diesem E-Design abgeleitet.

Die18 Viewreferenzen wurden aus dem Source37-Overlay beziehungsweise unveränderten Rootpfaden gelesen. Vier konkrete Views wurden nativ mit dem in-memory-Entwurf geprüft: HE, Own-GK, Own-LK sowie BY als negativer Fremdscope. Die übrigen14 fremden Views haben einen genauen Referenzplan; ihre endgültige native Integrationskontrolle bleibt beim Doing. Eine komplette CQR-Wiederholung fand nicht statt.

## Bewertung und vorhandener Runtimevertrag

`ExamData` unterstützt derzeit `maxPoints`, `passingPoints` und Bewertungssteps, aber keine separaten Pflichtpunktgruppen. Deshalb sind die34 Steps **binäre fachliche Mindestkriterien**; pro lokaler Aufgabe müssen alle12/10/12 erkennbar erfüllt sein. Das vermeidet beispielsweise eine ganze HTML-Coverage trotz unbearbeitetem Formularteil. Gleichwertige richtige Lösungen zählen; Ausdrucks-, Formatierungs- oder Stilperfektion wird nicht verlangt. Es wird kein neuer Runtime-Gate, keine Schulnotenregel und keine Unterrichtszeitbehauptung eingeführt. Fehlende Kriterien erfordern gezielte weitere Bearbeitung; unabhängiger fachlicher Review kann vor Übernahme weiterhin Umfang/Scoring konkret beanstanden.

Das ist keine Aussage über eine neue globale Anerkennungslogik. Welche gültigen lokalen Verträge Anerkennung tatsächlich auslösen, folgt weiterhin dem bestehenden Runtimevertrag. Das Design begründet ausschließlich, was diese drei Aufgaben prüfen und zum Bestehen benötigen.

## Tatsächlich ausgeführte kleine Kontrollen

- Native Coverageauflösung bestätigt4/4/7 explizite Atome, keine Clusterabkürzungen. Die exakt mit dem aktuellen Reader verglichene native Vorbereitungsfunktion ergibt5/5/8 Blätter: jeweils genau die lokalen Inhalte plus den bestehenden Orientierungsanker. Jede der10 direkten Blattkanten ist notwendig; der kontrollierte Einzelentzug verliert die betreffende Vorbereitung. Das ist kein Beweis aus einem bloßen Zeugenpfad.
- Native Compositionprüfung:0 Compilefehler, unveränderte gewöhnliche Targetmengen in allen vier geprüften Views; drei neue Prüfungen nur in den drei positiven Views. Alte Elternrequires und das unveränderte BY-Subtreeref bilden echte negative Gegenfälle.
- Tatsächliches Node-Ausführen der Musterlösung:18 frische Fälle plus3 Folgeaufrufe erfolgreich. Drei Fehler des ausführbaren Ausgangscodes sind einzeln gezeigt; drei gezielte Codevarianten werden an konkreten Inputs unterschieden. Tatsächlicher String-/Typtrace ist gespeichert.
- Lokaler Chromiumtest: tatsächlicher Formular-POST `name=Lea&termin=fr`, einspaltiger Gridstil, vier echte Klick-/Eingabeschritte mit den erwarteten Textausgaben,0 JavaScript-Seitenfehler. Das ist ein Funktionstest bei800×700, keine mobile/Host-/Bild-QA und kein Lernertest.
- Punktewerte, eindeutige Coverage, GK/LK-Tags und Markdown-Tabellen sind geprüft. Der In-Memory-Entwurf ändert außerhalb der zwei alten Prüfungen und ihres Elternclusters kein bestehendes vollständiges Goalobjekt. Es wurde keine aktive Datei beschrieben.

Reproduktion aus dem Repositoryroot:

```bash
python qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-minimal-material-design/build_design.py
TMPDIR=/dev/shm/informatics-e-design-HfbGFF node qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-minimal-material-design/check_material.mjs
TMPDIR=/dev/shm/informatics-e-design-HfbGFF ./app/node_modules/.bin/tsx qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-minimal-material-design/check_scope.mts
```

Die beiden Checks schreiben ausschließlich ihre Dateien in dieses neue Paket; der Builder schreibt ausschließlich diesen neuen Entwurf. Die RAM-Originale und eingebundenen Repositorymodule sind in `input-pins.json` gebunden. Das ist ein kleiner lokaler Reviewrahmen, kein portabler Releasecontainer. Materialtests und Scopechecks liefen erfolgreich; ein wirkungsloser Patch-Versuch wegen nicht gefundener Kontextzeile wurde vor der tatsächlichen Ergänzung korrigiert und änderte keine Datei.

**Nächster Doing-Schritt:** den hier konkreten Entwurf auf den aktualisierten privaten Metadatenstand übernehmen; tatsächliche Current-Identity-/Source-/Materialautorität für23 Definitionen im vorhandenen Weg binden, aktuelle Referenzen und alle18 Viewentscheidungen prüfen, unabhängigen Fachreview auf die vollständigen neuen Aufgaben erhalten. Draft und nicht angebotene Definitionen bleiben in sämtlichen harten Qualitätschecks. Erst der gebündelte aktuelle Endstand erlaubt den späteren vollständigen Qualitätslauf. Keine SourceA-Probe, aktive QA, DB-, Git-, Produktions- oder Assetänderung wurde vorgenommen.
