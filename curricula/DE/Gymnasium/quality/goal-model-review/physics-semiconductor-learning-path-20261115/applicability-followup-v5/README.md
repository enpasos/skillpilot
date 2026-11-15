# Quellenbegrenzung nach der vollständigen Statusprüfung

Die erste integrierte Statusberechnung bestand CQR-303 für alle fünf
konfigurierten Fächer, erreichte für Physik aber nur M4. Die unveränderte
M7-Untergrenze schlug korrekt fehl: Sieben gespeicherte Angaben zum
Geltungsbereich wichen von der aktuellen Quellenkompilierung ab.
[Der tatsächliche Zwischenstand](first-integrated-status.json) und
[der fehlgeschlagene Floor-Check](before-correction-floor-failure.actual.txt)
bleiben erhalten.

Die [begrenzte Korrektur](bounded-decision.json) betrifft sechs Zielobjekte:

- Der eigene Transistorversuch `77ab31a9` erhält eine Vererbungsgrenze.
  Seine direkte Platzierung unter Physik darf allgemeine Quellenzuordnungen
  des Fachwurzelknotens nicht als Nachweis eigener Transistorversuche in allen
  Ländern verwenden. Ziel und Aufgabe `2cfd5c6a` bleiben bei BY; die explizite
  NTG-Begrenzung der Quellpassage bleibt bestehen.
- Das funktionale Diodenziel `dc55adac` und seine Aufgabe `8670cff6` erhalten
  die tatsächlich kompilierten Länder BW, BY, HE, SL und SN. Hessen folgt aus
  der notwendigen Vorbereitung für Gleichrichtung, nicht aus einer erfundenen
  unmittelbaren Landesanforderung an das neue Ziel.
- Beim Bandziel `df010b2b`, seiner Aufgabe `1abfd5ef` und dem abhängigen
  Smartphone-Kontext `70b358bf` entfällt BY. Die korrigierte NTG-Passage trägt
  das energetische Bandmodell nicht. Sämtliche Kompetenztexte, Aufgaben,
  Bewertungsregeln, Bilder und Voraussetzungen bleiben gegenüber dem zuletzt
  fachlich geprüften Stand unverändert. Insbesondere wird die gespeicherte
  Beherrschung des Bandziels nicht neu interpretiert.

Der native Compiler schlug zusätzlich vor, sieben bisher fehlende optionale
Angaben anderer Ziele zu materialisieren. Diese unbeteiligten Objekte bleiben
exakt im vorherigen Zustand. Es erfolgt keine allgemeine Normalisierung.
Erhaltene Quelleninputs und die eingefrorene V9-Evidenz bleiben unangetastet.

Die [erneute Kompilierung](applicability.actual.txt) enthält keine APV-203-
Abweichung. [Quellenprüfung](source-coverage.actual.txt),
[33 Quellenregressionen mit 70 Pfaden](source-guard.actual.txt) und
[80 native Physik-Prüfungsrouten](projection.actual.txt) bestehen.
Die geänderten Review-Kontexte benötigen ihre eigenen aktuellen Nachweise;
diese lokalen Ergebnisse ersetzen weder die vollständige Qualitätsprüfung
noch die noch ausstehende Integration und frische Main-CI.

Die vollständige Buchregression deckte außerdem eine Verwechslung im neu
angepassten Test auf: Die bundesweite Zielvereinigung und die gemeinsame
Sek-I-Prüfroutenauswahl sind verschiedene Mengen. Der tatsächliche native
[Vergleich mit `a7c7e9ceb2`](national-target-delta.actual.json) erhält alle
408 früheren bundesweiten Ziele und ergänzt genau drei neue Atome sowie das
bereits bestehende Bandziel beim nach oben verlegten Prüfungsweg. Die
Materialklassifikation war bundesweit schon enthalten; sie kommt nur zur
gemeinsamen Sek-I-Prüfroutenauswahl hinzu. Beide Testmengen werden getrennt
benannt. Der ältere unabhängige Hashbeleg über die vollständige Zielmenge
bleibt unverändert; er wird nicht auf einen beliebigen neuen Istwert gesetzt.

Die abschließende vollständige [Statusberechnung](final-integrated-status.actual.json)
besteht jetzt für alle fünf tief geprüften Fächer mit jeweils sechs von sechs
Prüfungen und ohne Blocker. Physik erreicht mit 481 aktuellen Inhaltszielen
wieder M7. Die unveränderten [Mindeststandards](after-correction-floor-pass.actual.txt)
für alle 21 Kataloge und zwölf geschützten Routen bestehen gegen `a7c7e9ceb2`.
Die vorherige Fehlprüfung bleibt erhalten. Diese Aussage betrifft den lokal
geprüften Integrationsstand; PR- und Main-CI sind noch nicht nachgewiesen.
