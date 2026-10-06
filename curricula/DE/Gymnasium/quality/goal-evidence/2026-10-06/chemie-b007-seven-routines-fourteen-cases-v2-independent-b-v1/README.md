# B007 v2 — unabhängiger B-Prüfstand

Dieser Prüfstand bindet ausschließlich die sieben Routinen, vierzehn vollständig
gelesenen DE/EN-Fälle mit 46 Pflichtkriterien und zwei schmalen Primärkarten des
Autoren-v2-Freeze `e86359b0cea958c6964ad801945810c4621d2a542f426e69e5e92ad1cc303357`.
Der Prüfer hat B007 nicht verfasst. Alte A-Urteile und spätere A-Nachprüfungen
wurden nicht gelesen; Hinweise im Autoren-README waren ausschließlich Kontext.

## Fachliches Ergebnis

Alle sieben Beschreibungsroutinen sind als begrenzte, semantisch atomare
Kandidaten **KEEP**. Alle vierzehn bilingualen Fälle und beide Karten sind
fachlich **KEEP**. Es wurde kein verbleibender Material- oder Rechenfehler
festgestellt. Die Einzelbegründungen stehen in `independent-b.review.json`
und `independent-fourteen-case-review.actual.json`.

Die tatsächlichen Handlungsschritte der Salzlösung verfügen über die nötigen
Geräte und eine nachvollziehbare Folge aus getrennten Wägungen, vollständigem
Transfer, Rühren, Endpunktprüfung und Beschriftung. Die drei ergänzenden
Feststoff-/Flüssigkeits-/Gas-Modelle liefern konkrete, moderierbare Aktionen
und Rückmeldungen. Diese Texte beschreiben mögliche Handlungsevidenz; ein
implementierter Simulator, eine durchgeführte Lernendenhandlung und eine
menschliche Erprobung werden dadurch nicht belegt.

Die Fraktionsdefinitionen verwenden die richtigen Bezugsgrößen: gesamte
Mischungsmasse für den Massenanteil und Summe der Eingangsvolumina vor dem
Mischen für den Volumenanteil. Der Kontraktionsfall fragt die fehlende räumliche
Trennung ausdrücklich ab. Die Definitionen wurden mit den tatsächlichen
offiziell indexierten [IUPAC-Massenanteil-](https://goldbook.iupac.org/terms/view/M03722)
und [IUPAC-Volumenanteil-Einträgen](https://goldbook.iupac.org/terms/view/V06643)
verglichen; direkte Seitenabrufe lieferten 403.

## Quellen- und Integrationsgrenzen

Die neu gelesenen tatsächlichen HE-Seiten 7, 11 und 12 zeigen: geklammerte
Beispiele sind Vorschläge; das Pflichtprogramm unterscheidet das Lösen fester,
flüssiger und gasförmiger Stoffe sowie beide Anteile; der ausdrückliche
Sättigungs-/Temperatureintrag steht im fakultativen Teil. Die aktuelle lokale
PDF wurde mit einem frischen offiziellen Download bytegenau verglichen.
[HE G9 Chemie](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf)

Die tatsächliche NI-Seite 51 verlangt in der angeführten Kompetenz für Klasse
5/6 qualitative Eigenschaftsbeschreibungen einschließlich Löslichkeit. Sie
trägt den gesamten quantitativen Sättigungsroutinenumfang nicht allein.
[NI Naturwissenschaften Sek I 2015](https://cuvo.nibis.de/index.php?p=download&upload=18)

Deshalb bleibt die Quellenroute **HOLD**, insbesondere bis zur passenden
Bindung des fakultativen HE-Sättigungsumfangs und zur Wahrung der qualitativen
NI-Grenze. Auch die übrigen Routinen benötigen ihre tatsächlichen aktuellen
Quellen-, Operator-, Stufen- und Zielbindungen. Die ursprünglichen 403
Quellenpflichten und 413 zugehörigen Mappingzeilen werden durch diesen lokalen
Prüfstand nicht pauschal freigegeben. Indexierte BAuA-/IUPAC-Ausschnitte und
Teilprüfungen sind keine Gesamtquellenfreigabe.

Sechs neue Ziel-IDs, endgültige Eltern-/Voraussetzungsrouten, unabhängige
A-Nachprüfung des exakten v2, operative D-/P-/A-/M-Nachweise, Kartenherkunft,
Decks und Sichtbarkeit sowie aktuelle V- und abhängige Layer-A-Prüfungen
bleiben Gegenstand der späteren Integration. Beide neuen Karten sind
`not_active` und haben noch keine freigegebenen Ziel-/Deckbindungen.

## Tatsächliche begrenzte Checks

`check-independent-materials.py` lief mit Exitcode 0. Der selbst geschriebene
Checker rechnete 21 konkrete Autoren-Rechenoperationen mit exakten Brüchen und
zwei zusätzliche Kapazitätsdifferenzen nach: **23 Prüfungen, 0 Fehler**. Er
prüfte zudem die Vollständigkeit der 14 bilingualen Fälle, 46 Kriterien, sieben
Routinen und zwei Karten sowie die Auflösung aller bestehenden vorgeschlagenen
Voraussetzungs-IDs. Die wissenschaftliche Aufgaben-/Kriterienpassung beruht
auf dem tatsächlichen Lesen aller Materialien, nicht auf diesem Formcheck.

Fünf ganze Fallobjekte wurden gegenüber v1 verändert, neun blieben exakt.
Nur die Label-Routine erhielt eine geänderte Wesentlichkeitsanforderung;
sechs ganze Routinen, alle sieben Beschreibungs-/Voraussetzungsobjekte und
beide ganzen Karten blieben exakt. Die sieben Autoren-v2-Dateien, zehn
Autoren-v1-Dateien, alle 62 ursprünglichen Quellen-Eingabebindungen und die
19 aktiven Checkpoint-Eingaben wurden tatsächlich kontrolliert.

Strenger Stand bleibt **Chemie 112/378, Biologie 67/383**; **Nettozuwachs 0**,
neue aktive fachliche Abschlüsse 0, wiederhergestellte aktive Bindungen 0.
Aktive und historische Dateien, Qualitätsuntergrenzen und frühere Neuro-B-
Artefakte wurden nicht geändert. Menschliche Prüfung, Freigabe und Erprobung
sowie Runtime und Veröffentlichung werden nicht behauptet.

`actual-execution-and-final-input-preservation.json` hält den tatsächlich
beobachteten Lauf und die abschließende Eingabekontrolle fest.
`independent-b.final.freeze.json` bindet diesen unabhängigen Prüfstand und
seine konkret verwendeten unveränderten Eingaben.
