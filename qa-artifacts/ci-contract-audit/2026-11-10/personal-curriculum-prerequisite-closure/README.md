# Persönlicher Lernumfang: notwendige Voraussetzungen

Stand: 10. November 2026. Status: lokale gezielte Abnahme; Remote-CI und
Main-Lieferung dieser Runtimekorrektur sind offen. Die Norm ist in PR #112
auf Main `0bf53b1252` geliefert.

Die Runtime wählt gültige Ausgangsatome, berechnet deren vollständigen
kanonischen atomaren Bedarf mit der vorhandenen Normalisierung und verwendet
diese feste Lernmenge für Auswahl, Planung, Fortschritt und Gesamtabschluss.
Mastery verändert das Ergebnis, nicht die Zielmenge. Fachfremde Grundlagen
werden mit stabilen IDs und geprüftem Voraussetzungspfad ausgeliefert; ihre
amtliche Quellenzuordnung bleibt erhalten. Die WebGUI übernimmt diese Basis,
erhält die tatsächliche atomare Zielbasis von Clustern und zeigt sonst unplatzierte Atome unter einer reinen
Navigationsgruppe. Diese Gruppe kann kein künstliches Fokusziel werden.

Der tatsächliche frische Java-Lauf besteht 66/66 Tests ohne Fehler oder Skips:
neun reine Hüllentests, acht Service-Integrationstests und sämtliche 49
weitergeführten Rollenregressionen. Alle 790 benannten Eingaben bleiben während
dieses Laufs unverändert. Geprüft sind unter anderem der reale Chemiefall
Brønsted → Symbole/Formeln, tatsächliche Planungszähler und Abschlusszielinputs,
kanonische Clusterkinder, fehlende Referenzen, Zyklen, Rollenpriorität, normaler
und strikter Fokus sowie reine Fremdfachauslieferung ohne Mastery-Schreibzugriff.
Abschlusszielinputs sind kein kompletter Abschlussworkflow.

TypeScript, Lint, direkte Darstellungsregressionen und die echte Chromium-
Gegenprobe bestehen. Letztere prüft auch die Navigation einer benötigten
Fremdfachgrundlage innerhalb eines eigenständigen Chemie-Lehrplans. Die neuen
Gegenfälle sind in die bestehenden npm-/CI-Prüfpfade eingebunden.

Der [kompakte Nachweis](local-acceptance.json) bindet Quellen und tatsächliche
JUnit-Ergebnisse. Frühere fehlgeschlagene und durch eine Quellenänderung
beeinträchtigte Läufe bleiben als solche archiviert; ihre Belege wurden nicht
umgebunden. Kanonische Fachdaten und die zehn Reifegraduntergrenzen ändern sich
in dieser Korrektur nicht.

Ungefiltertes Backend, native Gesamtmatrix, regulärer Curriculum-Producer,
geschützte Floors und frische Remote-CI bleiben für den Lieferstand erforderlich.
Die getrennte Biologie-Korrektur braucht weiterhin den frisch ausgewerteten
Erhalt ihrer Ausgangsgeltung und eine erklärte Proof-Erweiterung. Das harte
G17-Gate in der Standard-Meilensteinprüfung und die vollständige Main-Abnahme
aller zehn Fächer sind weiterhin offen.
