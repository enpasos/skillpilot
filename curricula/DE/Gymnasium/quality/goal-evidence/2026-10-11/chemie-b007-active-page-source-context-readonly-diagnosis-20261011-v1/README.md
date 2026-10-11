# B007: aktive Seiten- und Quellenkontextdiagnose (B)

## Ergebnis

Die normalen Source-Mapper für aktive Eingaben und für den unveränderten Stage-Normalhelper erzeugen für `413040cd-ba74-5227-948c-a778b0bd0f56` jeweils nur **DE-TH / SekII / LK**. Beide binden dieselben zwei direkten Thüringer Source-Zeilen. Es gibt hier keine aktive Mapper-Adoptionslücke.

Der zusätzliche **HE / SekI / G9**-Scope des Stage-Buchs kommt aus einem manuell eingefügten fakultativen View-Eintrag. Die hessische Originalquelle enthält Sättigung tatsächlich, kennzeichnet diesen Abschnitt aber auf Druckseite 12 / physischer PDF-Seite 13 als fakultativ. Der aktuelle HE-Extrakt besitzt dafür kein getrenntes Source-Ziel; die aktive Pflicht-Mappingzeile bindet das Kind nicht. Die `boundary` des Kindes verhindert korrekt die automatische Übernahme einer breiten Elternbindung. Sichtbarkeit darf nicht allein für Stage-Parität erweitert werden.

Die sechs leeren `evidenceReview`-Felder des aktiven Buchs folgen exakt aus `evidenceReviewPaths=[]`. Das ist eine Buch-Konfigurationsentscheidung und beweist keine fehlende Veröffentlichung der P-Records im Runtime-Kontext. Alle 382 Ziel-Fingerprints bleiben gleich. Fünf Seiten ändern ausschließlich die Evidence-Zusammenfassung und den Seiten-Fingerprint; die Sättigungsseite zusätzlich die Applicability. Die anderen 376 Seiten sind semantisch identisch.

## Tatsächliche Prüfungen

- Eigene FIRST: 208 Eingaben; ergänzend 34 Stage-Normalhelper-Eingaben und vier Diagnose-/P-Quellbindungen.
- Zwei unveränderte normale Mapperfunktionen im Speicher, ohne Schreibausgabe; normaler aktiver `--check`: PASS (402 atomare Ziele, 382 publizierte Ziele, 48 Source-Views).
- Beide ganzen 382-Seitenmodelle normal semantisch geprüft und feldweise verglichen.
- Die betreffenden HE-/TH-Mappingzeilen und vollständigen Source-Ziele gelesen; vier ganze Primärseiten tatsächlich als Text und gerastertes Bild angesehen (HE physisch 12/13, TH 48/49).
- Keine neue wissenschaftliche D/P/V-Entscheidung, kein neuer Review-Zähler, keine Human-/Lernenden-/Gesamtquellenfreigabe.

## Minimaler gültiger Integrationsplan

1. Den normalen aktiven TH-LK-Scope beibehalten. Historische Stage-Ergebnisse unverändert lassen und diese Diagnose als neue Kontextklärung binden.
2. Die Buch-Konfiguration für Evidence-Zusammenfassungen ausdrücklich entscheiden. Bei gewünschter Anzeige nur den exakt validierten aktuellen Review-Input binden und normal ableiten; E1/G1 bleibt Kandidatenstatus.
3. Nach der Entscheidung die tatsächlich geänderten ganzen HTML-/PDF-Seiten prüfen und deren neue Kontext-/Seiten-Fingerprints binden. Unveränderte Ziel- und Bildverdicts behalten. Keine bloße Stage-Parität behaupten.
4. Fakultatives HE erst separat mit eigener konkreter optionaler Source-Zeile, partiellem Mapping und passenden optionalen Scope-Semantiken aufnehmen. Die bestehende Pflichtzeile nicht erweitern, um das alte Stage-Modell nachzubauen.

Details, vollständige Mappingbelege, echte Primärseiten-Captures und technische Eingabebindungen liegen in den JSON-Dateien dieses Pakets. Breitere Source-Union bleibt HOLD.
