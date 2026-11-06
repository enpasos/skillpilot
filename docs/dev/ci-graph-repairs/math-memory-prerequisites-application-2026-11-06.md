# Mathematik: vier Karten-Vorbereitungen tatsächlich korrigiert

Die fünf einzeln und unabhängig geprüften Operationen des
[Memory-Manifests](math-memory-prerequisites-repair-proposal-2026-11-06.json)
sind angewandt. Vier `requires`-Arrays ändern sich: Komplexe Zahlen sowie
Lineare Algebra/Geometrie benötigen keine Analysisvorbereitung; Stochastik
behält seine elementare Zuordnungsgrundlage. Analysis behält die begrenzte
elementare Ableitungsgrundlage für die anschließende Regelfestigung. Zwei
zusätzliche Orientierungskanten entfallen nur nach dem vollständigen
sequenziellen Closure-Nachweis.

Der Quellhash wechselt von `e0ff0caf…` nach `da4724ae…`. Alle anderen Goalfelder,
IDs, Aufgaben, Coverage, 42 zweisprachig vorliegende Karten dieses Teilsatzes,
SRS- und Masterywerte bleiben unverändert. Der globale Replay über alle 21
kanonischen Quellen bestätigt genau drei geänderte Goal- und drei atomare
Nachfragemengen, keine fachfremde Wirkung und die Gleichheit beider Closures
nach jeder der zwei Normalisierungen. Der
[ursprüngliche aktuelle Katalogbeleg](math-memory-prerequisites-current-global-proof-2026-11-06.json)
ist auf `5cb5e567…` gebunden; der
[lesende Anwendungsreplay](verify_math_memory_application.py) prüft zusätzlich
die tatsächlich aktiven Dateien im jeweils aktuellen Fremdkatalogkontext.

## Vier echte neue Typprüfungen

Weil `requires` zum SemanticKind-Quellfingerprint gehört, wären die vier alten
Entscheidungsbindungen am korrigierten Inhalt veraltet. Die
[frische Einzelfallprüfung](math-memory-semantic-kind-independent-review-2026-11-06.md)
liest die ganzen Ziel-/Elterntexte, Vorbereitung und alle 42 Karten in beiden
Sprachen. Sie bestätigt weiterhin `memory`. Die bestehenden Methodenkonstante,
Entscheidungsbasis, Typen und Zähler bleiben erhalten; vier neu geprüfte
Fingerprints ersetzen ihre bisherigen Bindungen. Historische Entscheidungen
bleiben im gebundenen Original und im Einzelbeleg erhalten. Dies ist keine
automatische Altfortgeltung und keine neue D/P- oder Karteninhaltsfreigabe.

Der aktive Ledger wechselt von `ee7f3ea9…` nach `78a5f2d9…`. Der unveränderte
native Parser akzeptiert alle 1252 aktuellen Typentscheidungen. Beide Dateien
wurden koordiniert mit privaten temporären Inodes, `fsync`, Modus 0644 und
atomarem Ersetzen ausgetauscht; vorhandene Hardlink-Inodes wurden nicht
überschrieben.

## Tatsächliche Integrationsprüfung

Vor Anwendung führte der unveränderte native Deep-QA-Producer mit zwei
schreibgeschützten Kandidatenüberlagerungen tatsächlich alle fünf Fachprüfungen
aus. Das Ergebnis bleibt vollständig gleich: Mathematik 807/807, Physik 478/478,
Chemie 455/455, Biologie 397/397 und Wirtschaft 346/346, null Blocker. Die
physisch angewandten Bytes sind exakt diese geprüften Kandidaten. Alle 807
gewöhnlichen Mathematikdefinitionen und ihre Typentscheidungen bleiben gleich.
Damit werden bestehende gültige Nachweise erhalten; keine alten D/P-Hashes
werden umetikettiert.

Der ganze native Mathematik-Applicabilityreport mit sämtlichen 1252
Ableitungen, Evidenzarrays und Projektionen ist vor/nach identisch. Null Fehler
und elf bereits bestehende Warnungen bleiben ausgewiesen. Die aktive Memory-CLI
besteht mit 807 gewöhnlichen Zielrecords, sechs Memoryzielen, zwölf Deckdateien,
128 Sprachzeilen und 64 behaltenen Primärkarten. Der allgemeine Graphvalidator
besteht für 593 Landschaften.

Die echte aktive CQR-001-Teilprüfung führt alle zehn Strukturchecks aus und
meldet **919 verbleibende Befunde**, darunter 917 G17-Fälle. Mathematik ist damit
weiterhin nicht M7. Vollständige CQR-Neuerzeugung, weitere Integrationsprüfungen
und frische Remote-CI bleiben getrennte Pflichten. Die
[Anwendungsquittung](math-memory-prerequisites-application-2026-11-06.json)
bindet tatsächliche Befehle, Artefakte und Quellen. Die historische Source-A80-
Hülle wird durch diese fachliche Änderung nicht aktuell; Migration und Runtime
bleiben unaktiviert.
