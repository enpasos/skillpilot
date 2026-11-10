<!-- SPDX-License-Identifier: Apache-2.0 -->
# Physik: native Completion-Zustände und gültige Verbraucherzeugen

Der zweite tatsächliche native Lauf scheiterte beim vollständigen Vergleich
zweier `CompletionEvaluation`-Records. Alle zehn Zustands-, Zähl- und
Begründungsfelder waren gleich. Auch die 575 blockierten Voraussetzungen
blieben gleich; 118 zugeordnete Verbraucherzeugen unterschieden sich.
`blockedByGoalIds` ordnet einer offenen gewöhnlichen Voraussetzung eine offene
Prüfung zu, die sie benötigt. Eine solche Verbraucher-ID ist bei mehreren
gültigen Prüfungen kein stabiler Identitätswert der transitiv reduzierten
Graphdarstellung. Der ursprüngliche Fehler bleibt unverändert dokumentiert.

Die drei Completion-Vergleichsstellen des neuen Physiktests prüfen nun alle
zehn Felder ausdrücklich auf Gleichheit, außerdem die blockierten Schlüssel,
die kompilierten Zielmengen und die Prüfungsmengen. Jeder einzelne Zeuge
beider Frames wird geprüft: Der Schlüssel liegt im Profil und nativen Kontext,
ist gewöhnlich, unbeherrscht und nicht erlassen; der Verbraucher ist eine
offene Prüfung desselben Profils. Der Schlüssel muss zum vollständigen
atomaren Voraussetzungenbedarf dieses Verbrauchers gehören. Die Bedarfssets
stammen unmittelbar aus der bestehenden nativen Topologie und werden je Scope
und Frame einmal ermittelt, ohne Schnitte an beherrschten Zwischenzielen.

Drei echte Negativkontrollen verwerfen einmalig einen erfundenen Verbraucher,
einen beherrschten Verbraucher und eine andere offene Prüfung ohne diese
Voraussetzung. Die vier historischen Testmethoden bleiben bytegleich; die
allgemeine Zielkandidaten-Abgrenzung des neuen Tests bleibt bestehen. Es gibt
keine ID-Ausnahmeliste, ausgelassene Record-Felder oder Produktionsänderung.

Die tatsächliche Parserprüfung unter Corretto 25.0.2 und `git diff --check`
bestanden. Der dritte native Lauf kompiliert und prüft die korrigierte
Java-Datei frisch; dessen Ergebnis bleibt zum Erfassungszeitpunkt offen.
Der vorherige vollständige TS-Lauf bestand in 2.453,113 s mit 65 unveränderten
Eingaben. Er wird für diese reine Java-Testkorrektur nicht erneut ausgeführt.
Der tatsächliche native Projektionsvergleich über 178 Konfigurationen bestand
unabhängig davon. [completion-oracle-followup.json](completion-oracle-followup.json)
bindet die Dateihashes und Rohbelege; lokale Pfade sind keine öffentlichen
Downloads.
