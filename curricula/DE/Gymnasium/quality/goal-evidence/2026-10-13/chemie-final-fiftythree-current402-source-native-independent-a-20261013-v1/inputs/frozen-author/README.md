# Chemie: finaler inaktiver Quellen- und nativer Prüfstand

Dieser Autorenstand bereitet die bereits begonnenen 18 Polymer- und 19 Aromatenziele sowie 16 betroffene Beschreibungs- und Geltungskontexte des bisherigen strengen Stands zur unabhängigen Prüfung vor. Er aktiviert keine Nachweise und erteilt keine fachliche oder menschliche Freigabe.

## Eingaben und Umfang

- Der gemeinsame, unveränderte Produktions-BookModel enthält alle **402 aktuellen curricularAtomic-Ziele** aus 523 kanonischen Knoten. Die fachlichen Klassifikationsentscheidungen bleiben erhalten.
- Die drei nativen Gruppen mit **18, 19 und 16 Zielen** halten die bestehende Grenze von maximal 20 Zielen ein. Ihre Vereinigung umfasst 53 verschiedene Ziele. Alle drei Gruppen wurden mit den unveränderten Produktionsfunktionen `prepare` und `check` erzeugt und technisch geprüft.
- Die 37 positiven Profilnachweise bleiben ausdrücklich `ai_candidate` / `needs_human_review`. Die bestehenden unabhängigen Bildentscheidungen werden mit ihren genauen Bildbytes, Personen-/Datumseinträgen und getrennten menschlichen Feldern übernommen. Es werden keine zusätzlichen Freigaben erfunden.
- Die 69 gesondert betroffenen geschützten Quellenbindungen bleiben eine eigene Anlage. Vier davon liegen auch im nativen Umfang; die gesamte Quellenanlage umfasst deshalb 118 unterschiedliche Ziele. Seiten- oder Hashgleichheit ersetzt keine Quellenprüfung.
- Der tatsächlich kompilierte Quellen-Atlas enthält 379 veröffentlichbare Ziele, 48 Quellenansichten, 458 offene Quellen-Geltungsentscheidungen und 23 ausgelassene Ziele. Der zentrale fachliche Nenner bleibt 402.

## Drei ausdrückliche Quellen-Holds

Für `f85b4651-50ea-5b42-b193-3465c05257a7`, `057a6826-f599-53b1-bdd1-5a83037a1494` und `39c85aa0-b01f-56ec-a148-b8009bf650f5` existiert im endgültigen kompilierten Stand kein geprüfter gemappter Quellenzeuge. Die Anlage weist das offen aus. Ihre Darstellung auf einer Prüfseite und ihre historische strenge Zählung schließen diese Lücke nicht. Vor einer vollständigen Integration müssen diese Fälle gesondert geklärt werden.

## Portabilität und technische Grenzen

Die kanonischen Kandidaten, Ledger, Konfigurationen, Profile, nativen PDFs/HTML-Seiten und Quellenanlagen verwenden referenzierbare Dateien im Repository. Die genauen zusammengeführten Quellenbytes werden über den eingecheckten inaktiven Quellen-Checkpoint adressiert; zukünftige aktive Pfade werden nicht als bereits aktiv behauptet.

Die Vorbereitung lief in einer privaten Ausführungsumgebung. Sie kopierte nur die benötigten exakten Bildbytes in deren physische Quell- und Public-Verzeichnisse. Die Produktionsprüfung gegen aus dem Public-Verzeichnis ausbrechende Symlinks blieb erhalten. Ein erneuter Build aus diesem noch inaktiven Stand benötigt dieselbe private Bildbereitstellung aus den angegebenen eingecheckten Bildquellen; die fertigen nativen Review-Bundles sind bereits eigenständig gebunden.

Vier technische Vorprüfungsfehler sind mit Rohprotokollen und gezielten Korrekturen erhalten: der konfigurierte Ledger-Quellpfad, ein aus einem alten Autorenbezeichner übernommenes großes `Ar`, private schreibgeschützte Bild-Verweise außerhalb des Public-Verzeichnisses und die Reihenfolge der 16 betroffenen Ziele. Keine Prüfung wurde gelockert. Der vollständige Autoren-BookModel wurde einmal erzeugt und bei der Fortsetzung wiederverwendet; die unveränderten nativen Produktionsaufrufe luden ihre identischen Eingaben selbst. Die tatsächlichen Aufrufzahlen stehen im Abschlussbericht.

**Aktive Integration, unabhängige Beschreibungsreviews, aktuelle Gate-Abschlüsse, M7 und menschliche Prüfung/Erprobung bleiben separate Schritte. Der strenge aktive Chemie-Stand wird durch dieses Paket nicht erhöht.**
