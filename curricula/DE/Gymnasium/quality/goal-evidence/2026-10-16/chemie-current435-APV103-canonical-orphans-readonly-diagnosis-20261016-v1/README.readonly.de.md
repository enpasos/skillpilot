# Chemie: tatsächliche APV-103-Orphans und unvollständige Scannerkapsel

Dies ist eine technische Lesediagnose. Sie enthält keine unabhängigen fachlichen Freigaben, keine normalen Änderungen, keine neuen D/P/A/M/V-Abschlüsse und keinen Layer-A- oder M7-Pass. Historische Reports wurden unverändert erhalten.

## Tatsächlicher Befund

Der unveränderte Stock-ApplicabilityCompiler meldet unter dem aktuellen H629-Kanon im geprüften Kapselumfang 482 APV-103-Fehler an 48 eindeutigen Zielen. Davon sind 44 Memory-Ziele mit 458 Projektionsfehlern, zwei ausdrücklich historische Kontextcluster mit 20 Projektionsfehlern und zwei gewöhnliche Ziele mit vier Projektionsfehlern betroffen. Alle 48 aktuellen Wholegoals sind vollständig vorhanden, haben aber überhaupt keinen kanonischen `contains`-Elternknoten. Der Compiler prüft hier die Erreichbarkeit von der kanonischen Chemiewurzel; die 39 Composition-Views ersetzen diese Strukturprüfung nicht.

Die gewöhnlichen Ziele sind Gaschromatografie `5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d` und Arzneimittel-Qualitätskontrolle `4a7dee38-1056-5e27-acec-e6a12f58109f`. Die historische Grignard-Ergänzung ist ausdrücklich von curricularer Projektion ausgeschlossen und zählt nicht zu diesen 48 Fehlerzielen.

## Entdeckte Grenze der Kapsel

`getAllJsonFiles` in `app/scripts/applicabilityCompiler.ts:246` folgt Verzeichnissymlinks nicht. Deshalb sehen sowohl die bisherige Kapsel als auch die derzeitige dünne H-Verzeichnisstruktur nur 51 der 82 tatsächlich vorhandenen aktuellen Chemie-Mappingdateien. 31 Dateien, darunter 13 der 32 konfigurierten SourceAtlas-Pfade, existieren und haben gültige Bytes, werden aber bei dieser Rekursion übersprungen. Die vollständige Liste mit blockierenden Verzeichnissymlinks und aktuellen H-Hashes steht in `INPUT-COMPLETENESS.actual-directory-symlink-omissions.json`.

Das ist ein anderer Prüfweg als der tatsächliche explizite Root-CQR-004-Lauf über 82 Mappingdateien und 35 Quellen: Dessen 4.019 Quellenziele und null Kursmismatches werden hier nicht widerrufen. Für einen vollständigen ApplicabilityCompiler-Nachweis muss Root die Verzeichnisvorfahren physisch bereitstellen und die exakten aktuellen H-Dateien als Blätter binden. Ein Compilerpatch ist dafür nicht erforderlich. Die bisherige Zahl 482 darf nicht als endgültige vollständige Jurisdiktionsfehlerzahl ausgegeben werden.

## Versiegelter hypothetischer Vorschlag

Die inaktive CAS-Datei serialisiert ausschließlich zwei vorhandene Clusterobjekte:

- Die Chemiewurzel erhält die 44 bisher elternlosen Memory-IDs und die zwei unveränderten historischen Kontextcluster als zusätzliche Kinder.
- Der vorhandene Cluster „Quellengebundene Chemie-Ergänzungen“ mit `applicabilityMappingInheritance: boundary` erhält die beiden gewöhnlichen Orphan-Ziele.

Alle 435 gewöhnlichen Wholegoals und 57 Memory-Wholegoals, alle Beschreibungen, Voraussetzungen, Quellenentscheidungen und bestehenden View-Rollen bleiben dabei unverändert. Die historische Henderson-Kontext-ID ist bereits ein HB-LK-goalEntry. Ein pauschales `excluded` würde diesen bestehenden View verändern und ist daher nicht die kleinste Strukturkorrektur.

Der rein lesende Algorithmus-Replay reproduziert die tatsächlichen 482 Stockfehler exakt. Der ausdrücklich hypothetische Graph mit diesen zwei Clusteränderungen hat im bisherigen kompilierten Scope null APV-103-Fehler; nur die Child-Union des Ergänzungsclusters gewinnt das bereits belegte NI-Scope des GC-Ziels. Das ist kein tatsächlicher Stock-After-Lauf und keine fachliche Freigabe.

Die echten Stock-CompositionView-Preview-Wholeoutputs und Projektionsrollen sind für alle 39 Views vor/nach dem in-memory-Vorschlag identisch. Der echte Stock-SourceAtlasDescendants-Helper liefert für alle 469 tatsächlich gemappten aktuellen kanonischen Ziel-IDs aus den expliziten 82 Mappingdateien exakt dieselben atomaren Nachkommensmengen. Die Boundary verhindert eine fälschliche Übernahme der beiden Ergänzungen aus breiten alten Rootmappings; Memory-Kinder werden nicht zu curricularAtomic-Quellenbelegen.

## Verbleibende Integrationsprüfungen

Nach tatsächlich fachlich bestätigter Clusterplatzierung und vollständiger Inputkapsel müssen der unveränderte Stockcompiler, alle 39 Kursprojektionen und die bestehende Memory-Sichtbarkeitsprüfung tatsächlich laufen. Anschließend sind die aktuellen Buchmodelle und konkreten 435 Zielseiten/-kontexte zu vergleichen. Alle wissenschaftlichen Ordinary-Felder und `requires` bleiben exakt; deshalb ist kein historischer Beschreibungsreview-Neustart begründet. Eventuelle reale Navigations-/Seitenänderungen dürfen aber erst nach ihrem tatsächlichen Vergleich technisch neu gebunden werden. Die zwei geänderten Cluster benötigen zutreffende semantische Source-Fingerprints.

Mathematik-, Physik- und Biologie-M7 bleiben geschützte Untergrenzen. Menschliche Freigabe und Erprobung werden nicht behauptet.
