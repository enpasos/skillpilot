# Vier ganze Raumgeometrie-Prüfungsformen unter bestehenden Lernziel-IDs

Vier bestehende Kompetenzen erhalten jeweils eine vollständige deutsche und
englische Prüfungsaufgabe, Lösung und Gesamtbewertung: geradlinige Bewegung
mit Orts- und Geschwindigkeitsvektoren, Spurpunkte, Geradenscharen sowie
Ebenenscharen. Die beiden Scharaufgaben bleiben auf den vorhandenen LK-Umfang
begrenzt. Identität, Kompetenzbeschreibung und Voraussetzungen bleiben erhalten.
Die Prüfungsform schreibt weiterhin nur das eine binäre Mastery-Ergebnis.

Das unabhängige Astra-Review hat drei Formen unmittelbar bestätigt und bei der
Ebenenschar eine Lücke in der Bestehensregel gefunden: Der zentrale Spezialfall
konnte vollständig fehlen, obwohl genügend Punkte erreicht wurden. Die eng
begrenzte Nachbesserung schließt diesen Fall aus; korrekte Behandlung an anderer
Stelle sowie einzelne Rechen- und Folgefehler bleiben angemessen berücksichtigt.
Die nachfolgende unabhängige Prüfung bestätigt die vier vollständigen Formen.

Acht betroffene Atomicity-/Memory-Zeilen sind tatsächlich neu bewertet. In den
beiden additiven Gesamtsnapshots bleiben jeweils die übrigen 803 Zeilen bytegleich.
Alle 807 curricularen Ziele bleiben in der Qualitätsprüfung; die Prüfungsrolle
nimmt keines davon aus dieser Grundgesamtheit heraus.

Der echte Backendnachlauf über **161 Angebote und 46 Kursvereinigungen**
schließt **426 ungedeckte Ziel-Angebots-Paare und 406 Endpunktpaare**. In 138
Angeboten entstehen insgesamt 458 geschützte Kombinationen aus Lernziel und
Lehrplan. Es gibt keine neuen Lücken und keine Veränderungen an Targetumfang,
sichtbaren Pfaden, Vorbereitungsrollen oder effektiven Voraussetzungskanten.
Alle 322 Bedarfsmengen vor und nach der Änderung wurden zusätzlich nachgerechnet.

Es bleiben **343 ungedeckte Ziel-IDs / 7.710 Ziel-Angebots-Paare sowie
200 gewöhnliche Endpunkt-IDs / 3.745 Endpunktpaare**. Thüringen Sekundarstufe I /
G8 / GK+LK bleibt gültig; die übrigen 160 Angebote und damit die vollständige
Mathematikprüfung bleiben rot.

Der Lauf dauert 89,81 Sekunden, bindet 2.655 tatsächliche Eingabedateien und
verwendet dieselben 1.379 Produkt-/Testklassen und denselben privaten Sampler
wie der vorherige Vektor-Nachlauf. Die komprimierte Rohmessung liegt lokal als
`candidate.json.gz`, SHA-256
`710690ab31d452a66eed68b5cc4fb040e8af218fda4ba9276b0e2cceea36ab69`.
Die übernommenen Ausführungs- und Vergleichsdateien sind in `binding.json` gebunden.

Alle elf normalen Autorenprüfungen bestehen. Die 82 geprüften Dateien sind
übernommen; alle 2.655 tatsächlichen Runtime-Eingänge stimmen danach überein.
Die Ausführungs- und Importnachweise sind ebenfalls in `binding.json` gebunden.
Ein fehlgeschlagener erster Python-Hoststart bleibt neben dem erfolgreichen
gezielten Nachlauf dokumentiert. Kein Produktionslernstand wurde verändert;
eine vollständige Mathematik-, M7-, CI- oder Deployment-Abnahme steht weiter aus.
