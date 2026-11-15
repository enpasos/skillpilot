# Unabhängige begrenzte V7-Nachprüfung B

**Entscheidung: ACCEPT_BOUNDED_V7_CONTENT — alle sieben ursprünglichen Befunde sind für den exakt geprüften Eingang behoben.**

Eingang: `tmp/math-stage-v7-content-correction-20261115/sealed-input-manifest.json`, SHA256 `4f276a2649d2c4c78c595008d96fa9df54604170487f197345ec7b7544a6a698`.

Die Entscheidung beruht auf dem erneuten Lesen der sieben vollständigen gewöhnlichen Ziele, nativen P-Profile, tatsächlichen DE/EN-Aufgaben und Lösungen sowie sämtlicher **16 bilingualer Laufzeitrubrikblöcke dieser sieben Aufgaben**, davon zwölf geändert. Die ursprünglichen eigenen Gegenantworten wurden erneut bewertet und neue zulässige Alternativen unabhängig berechnet. Es wurden keine A-Prüfung, Autoren-Gegenantwortanalyse oder erwarteten Autoren-Akzeptanzentscheidungen gelesen. Hashprüfungen binden den Eingang; sie erzeugen kein fachliches Urteil.

| Aufgabe | Tatsächlich behobener Kern | Neue Schreibtischbewertung der alten Lücke |
| --- | --- | --- |
| 18 · `0b2c68f9…` | Beide eigenen Parabelkurven sind ausdrücklich erforderlich; andere geprüfte Punkte und verständliche Handskizzen gelten vollständig. | Keine der beiden Kurven: höchstens **4/8**; nur eine fehlt: höchstens **6/8**, unter der unveränderten Grenze 7. |
| 23 · `71169b14…` | Frei gewählte, nachgewiesene seitliche Ortslinienpunkte sind ausdrücklich zugelassen. Musterkoordinaten sind keine Pflicht. | Die ursprüngliche vollständige Alternative erhält **8/8**. Bloße Punktnamen ohne nachvollziehbaren Gleichabstand können nicht bestehen. |
| 32 · `a8dfd3ce…` | Eigene Kreisfigur, markierter Radianwinkel und tatsächliche Spiegelungs-/Drehkonstruktion sind ausdrücklich geschützt. | Keine Kreisfiguren: höchstens **4/8**; eine Konstruktion fehlt: höchstens **6/8**, unter 7. |
| 35 · `5641d6c9…` | Beliebige zwei geeignete konkrete Modellgrenzen reichen; zusätzliche Kurven der Varianten sind ausdrücklich freiwillig. Originalkurven und numerischer Vergleich bleiben erforderlich. | Vollständige Antwort mit genau zwei Grenzen, beiden Originalkurven und ohne zusätzliche 1,1-Kurve erhält **8/8**. Nur eine Grenze oder fehlende Originalkurve: höchstens **6/8**. |
| 36 · `64dafd7e…` | Beide eigenen Exponentialkurven sind im ersten tatsächlichen Block notwendig; Merkmalslisten reichen nicht. | Schon eine fehlende Kurve begrenzt den Block auf 2/4, insgesamt höchstens **14/16**, unter 15. |
| 38 · `9dbb9fd3…` | Die eigene Kurve über zwei vollständige Perioden mit Einheiten und passender Wiederholung ist notwendig. | Keine Kurve oder nur eine Periode: höchstens **6/8**, unter 7. Der vorhandene Wasserfensterblock ist unverändert. |
| 40 · `0220bbbc…` | Der eigene Quadratwurzelgraph und die tatsächlich ergänzte linke Kubikwurzelhälfte sind notwendig. Andere begründete Punkte und Symmetriekonstruktion sind erlaubt. | Beide fehlen: höchstens **4/8**; eine Leistung fehlt: höchstens **6/8**, unter 7. |

Die detaillierten sieben Einzelurteile, konkreten DE/EN-Gegenantworten, mathematischen Begründungen und fairen Alternativen stehen in `bounded-seven-review.json`. Sämtliche Punktwerte sind **eigene schriftliche Schreibtischbewertungen**, keine Ergebnisse eines tatsächlich ausgeführten Bewerters und keine Lernendenresultate.

Die Alternativen wurden nicht nur durch Wiederholung der vom Autor aufgenommenen Beispiele geprüft:

- Ortslinie 1: `(±12,12)` ergibt Fokus- und senkrechten Leitgeradenabstand jeweils 15. Ortslinie 2: `(18,±12)` ergibt jeweils 20. Diese unaufgeführten Punkte erfüllen die neue offene Rubrik vollständig.
- Parabeln: `f(1)=f(5)=0` und `g(−3)=g(1)=0` prüfen andere symmetrische Punkte.
- Exponentialkurven: `f(−2)=0,75`, `f(1)=6`, `g(−2)=−8`, `g(2)=−0,5` sind andere geeignete Kontrollen.
- Wurzelkurven: `(27,6),(38,7)` sowie `(−27,−5),(−1/8,−2,5)` liefern andere begründete Graphpunkte.
- Riesenrad: Die gleichwertige Sinusform `14+12 sin(π(t−10)/20)` wurde unabhängig über 0–80 Sekunden gezeichnet und an beiden Zyklen kontrolliert.

Dazu wurden zwölf **synthetische eigene Prüfzeichnungen** erstellt, tatsächlich betrachtet und als solche gekennzeichnet: `independent-fair-sketches.svg`, das PNG und die drei `fair-sketch-sheet-*.png`. Sie dienen der Beurteilung erlaubter Darstellungen und wurden keiner lernenden Person zugeordnet. Die Originalmaterialien — 14 SVGs und ein PNG — wurden erneut gegen ihre Bindungen geprüft und über die tatsächlichen gerenderten Kontaktblätter beziehungsweise das Original-PNG erneut visuell betrachtet. Die bestehende abgeschnittene Kubikwurzelgrafik stimmt mit dem Auftrag überein. Die Verfügbarkeit dieser Bilder im echten Dienst ist damit weiterhin nicht nachgewiesen.

Der eigene Änderungsvergleich bestätigt:

- genau 7 geänderte Aufgabenobjekte, genau 12 geänderte bilinguale Rubrikblöcke und die zugehörigen Lösungstexte;
- 37 unveränderte Aufgabenobjekte einschließlich Aufgabe 44;
- alle 44 Aufgaben entsprechen ihren Objekten im 1.308 Ziele umfassenden Kandidaten;
- alle anderen 1.264 Zielobjekte und die Wurzelmetadaten des Kandidaten unverändert;
- Aufgabenstellungen DE/EN, `requires`, Abdeckungs-IDs, Schritt-IDs/-Punkte, Gesamt-/Bestehenspunkte und Entwurfsstatus aller 44 Aufgaben unverändert;
- der bestehende V5-Wasserfensterblock unverändert; vollständige ursprüngliche P-Dateien und die tatsächlich gelesenen aktuellen gewöhnlichen Zielfelder weiterhin identisch.

Es wurden keine P-Kerne abgesenkt, keine Aufgabe freigegeben und keine Eingangsdateien verändert. Diese begrenzte Inhaltsnachprüfung schließt die sieben eigenen Befunde für V7. Sie ersetzt weder die zweite unabhängige Nachprüfung A noch echte Bewertungs-/Dienstaufrufe, Bildverfügbarkeit, Voraussetzungen-/Waiver- oder Rückflussnachweise, Lernendenverträge, Integration und frische Main-CI. Der ursprüngliche versiegelte REVISE-Bericht bleibt unverändert als Historie erhalten.
