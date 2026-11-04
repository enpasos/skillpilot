# Bestehende Modellierungsprüfung in 20 weiteren Oberstufenangeboten

Die vollständige Prüfung zur Medikamentenkonzentration erhält fachlich
geprüfte Plätze in Niedersachsen, Nordrhein-Westfalen, Saarland, Sachsen
und Sachsen-Anhalt: jeweils LK und Kursvereinigung, nur Oberstufe sowie
beide Schulstufen zusammen. Die Aufgabe, ihre Bewertung, ihre Voraussetzungen
und die 807 curricularen Kompetenzen bleiben unverändert. Für Sachsen und
Sachsen-Anhalt ist dies eine eigene zusätzliche Kompetenz; damit wird keine
offizielle Lehrplanabdeckung uneigentlicher Integrale behauptet.

Der normale Generator reproduziert alle 83 Länderansichten: genau zehn
Ansichten ändern sich, 73 bleiben bytegleich. Eine benötigte Grundlage wird
nur in den fünf reinen Oberstufenansichten als Vorbereitung ergänzt; in den
stufenübergreifenden Ansichten bleibt sie ein eigenes Lernziel. Sämtliche
bisherigen sichtbaren Zielpfade und wirksamen Voraussetzungen bleiben erhalten.

Der tatsächliche Java-Nachlauf prüft **161 Angebote und 46 Kursvereinigungen**.
Er schließt **100 ungedeckte Ziel-Angebots-Paare und 60 Endpunktpaare**, ohne
neue Lücken oder Zielverluste. Es bleiben **353 ungedeckte Ziel-IDs / 8.217
Ziel-Angebots-Paare sowie 206 gewöhnliche Endpunkt-IDs / 4.169 Endpunktpaare**.
Thüringen Sekundarstufe I / G8 / GK+LK bleibt das erste gültige Angebot;
die übrigen 160 Angebote und damit die vollständige Mathematikprüfung sind rot.
Die bisher ausgewählten 32 Prüfungsangebote bleiben erhalten; es sind nun 52.
Die vollständigen Projektionen der übrigen 141 Angebote bleiben unverändert.

Der Lauf dauert 95,61 Sekunden und bindet 2.607 tatsächliche Eingabedateien
aus versionierten Runtime-Daten plus geprüfter Korrektur. Alle 1.379
kompilierten Klassen und der Sampler bleiben unverändert. Die Bedarfsrechnung
ist für Ausgangs- und Zielstand unabhängig nachgerechnet. `binding.json`
bindet die Ausführungs- und Vergleichsberichte. Die lokale vollständige
Rohmessung `candidate.json.gz` hat SHA-256
`547a02264b5f97295fb227ab18bd59b7a40d0f3345634e71a9443383427468a9`.

Alle **sieben relevanten Autorenchecks bestehen**: Länderansichten83,
Daueransichten18, Stage-Policy, vollständige Stage-Länderprüfung,
Quellenabdeckung, harte Routen und Phasenkompatibilität. Der erste Versuch der
Stage-Länderprüfung scheiterte am fehlenden leeren `tmp`-Verzeichnis im privaten
Prüfhost. Nach dessen Anlage besteht der unveränderte Test. Dieser Vorlauf ist
in `standard-checks` erhalten; Produktdaten und Prüfanweisungen wurden dafür
nicht geändert. Aufgaben-, Atomicity- und Memory-Prüfungen wurden bei diesem
reinen Platzierungspaket nicht erneut ausgeführt.

`root-import.json` dokumentiert die Übernahme aller 19 geprüften Dateien und
die anschließende Übereinstimmung sämtlicher 2.607 Runtime-Eingänge. Das
unabhängige Astra-Review liegt bei den versionierten Quellen-/Scopebelegen.
Es gab keine Lernstandsänderung. Diese begrenzte Verbesserung ist keine
vollständige M7-, CI- oder Produktionsabnahme.
