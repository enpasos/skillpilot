# Unabhängige Bildsichtprüfung v1

Prüfzeitpunkt der ersten fünf Bildprüfungen: `2026-09-06T22:24:30.548Z`.

Prüfinstanz: OpenAI/Codex, unabhängiger AI-Reviewer; der technische Modellbezeichner ist nicht offengelegt. Alle Ergebnisse sind ausschließlich AI-Kandidatenurteile. Dieses Dokument erteilt keine menschliche Freigabe, Publikationsfreigabe oder neue Autorität für kanonische Daten.

Die sechs unten gebundenen Bilder wurden vollständig mit dem Bildbetrachter angesehen; die angegebenen SHA-256-Werte wurden direkt aus ihren lokalen Bytes berechnet. Zahlen wurden zusätzlich unabhängig nachgerechnet. Maßstab der Zielpassung sind die aktuellen kanonischen Beschreibungen der fünf genannten Lernziele. Andere Bildreviewdateien und Urteile des koordinierenden Agents wurden nicht gelesen. Die vorherigen blinden Beschreibungsreviews bleiben unverändert. Die Beschreibungen werden hier nicht erneut adjudiziert.

## 1. Parameter exponentieller Funktionen interpretieren

Ziel-ID: `346efb31-c400-5bd3-a698-dd9a7e1bc3f7`.

Zielumfang: Verdopplungs- und Halbwertszeiten bestimmen, Einfluss von a in f(t)=b·aᵗ beschreiben und Term, Tabelle und Graph verknüpfen.

Datei: `346efb31-c400-5bd3-a698-dd9a7e1bc3f7/candidate-1/346efb31-c400-5bd3-a698-dd9a7e1bc3f7.generated.2026-09-06T22-20-01-103Z.jpg`.

SHA-256: `f76b06ed52e8f8599314346edbf5d80ab123cd9e11fa65181cc2d52fd3085b25`.

AI-Urteil: **fachlich geeigneter Kandidat; kein konkreter Korrekturbedarf festgestellt**.

- f(t)=50·1,2ᵗ stimmt mit den Tabellenwerten 50, 60, 72 und 86,4 für t=0,1,2,3 überein.
- Die neue y-Achse ist mit 0,25,50,75,100 konsistent linear skaliert; die vier markierten Punkte passen innerhalb der Strichbreite zu den Tabellenwerten. Die Zeitachse besitzt gleiche Einerschritte.
- Die Pfeile unterscheiden Startwert 50 und Wachstumsfaktor 1,2 korrekt. Die Aussage +20 Prozent pro Zeitschritt und die Rechnung 50+10=60 sind richtig.
- g(t)=80·0,5ᵗ zeigt korrekt den Startwert 80, den Wert 40 nach einem Zeitschritt und die Halbwertszeit 1. Die Positionen von 80 und 40 passen zum Achsenursprung.
- Der ganze Aufbau ist lesbar, die Verbindung von Term, Tabelle und Graph ist inhaltlich direkt. Dass das Bild nur die Halbwertszeit konkret ausführt, ist kein Fehler; es ist eine begrenzte Lehrillustration und keine vollständige Abdeckung aller Zielnachweise.

## 2. Natürliche Exponentialfunktion für kontinuierliche Prozesse verwenden — Kandidat 1

Ziel-ID: `f05acdc5-4949-54c7-b8cd-56ddd1fbdbad`.

Zielumfang: eˣ für die Modellierung kontinuierlichen Wachstums oder Zerfalls verwenden und Ergebnisse im Kontext deuten.

Datei: `f05acdc5-4949-54c7-b8cd-56ddd1fbdbad/candidate-1/f05acdc5-4949-54c7-b8cd-56ddd1fbdbad.generated.2026-09-06T22-20-02-435Z.jpg`.

SHA-256: `c23225a084ca4eb9f3ddf1507e39da1e52c9e135e029848e25f92610cd90b8c9`.

AI-Urteil: **fachlich abzulehnen; eindeutige Koordinatenwidersprüche**.

- Der als (0,100) beschriftete Startpunkt liegt direkt an der y-Marke 50. Das ist ein konkreter Widerspruch und keine bloße Stil- oder Genauigkeitsfrage.
- Der als (1, ungefähr 135) beschriftete Punkt liegt unterhalb der y-Marke 100. Auch seine horizontale Hilfslinie markiert dort einen Wert unter 100.
- Der als (2, ungefähr 182) beschriftete Punkt liegt nur etwas oberhalb der y-Marke 150 statt nahe 182; seine vertikale Hilfslinie endet außerdem links der x-Marke 2.
- Die Formel und die Tabelle selbst sind richtig: 100·e^0,3≈134,9859 und 100·e^0,6≈182,2119. Auch die Aussage ungefähr 182 nach zwei Stunden ist rechnerisch richtig. Diese richtigen Textwerte heben die falschen Punktlagen nicht auf.
- Der separate Zerfallsgraph zu 80·e^(-0,4t) ist qualitativ stimmig. Der fachliche Ablehnungsgrund betrifft den großen quantitativ beschrifteten Wachstumsgraphen.

## 3. Interferenz einzelner Quantenobjekte mit Wahrscheinlichkeitsaussagen beschreiben

Ziel-ID: `1a1c09f0-96b7-4c33-a623-0e8101537876`.

Zielumfang: Interferenz einzelner Quantenobjekte mithilfe von Wahrscheinlichkeitsaussagen beschreiben und den Aufbau eines Interferenzmusters aus vielen Einzelereignissen qualitativ deuten.

Datei: `1a1c09f0-96b7-4c33-a623-0e8101537876/candidate-1/1a1c09f0-96b7-4c33-a623-0e8101537876.generated.2026-09-06T22-19-57-825Z.jpg`.

SHA-256: `ac0240de6c3917ec150cc32cacf3bfe32fc10c79cdefa9f6b15e0be973cca6e8`.

AI-Urteil: **fachlich geeigneter Kandidat; kein konkreter Korrekturbedarf festgestellt**.

- Die beiden Spalte sind vertikal gezeichnet. Die dichten und dünnen Trefferstreifen auf dem Schirm verlaufen parallel zu den Spalten; die Mustervariation erfolgt quer dazu.
- Ein einzelnes Ereignis erscheint als lokalisierter Punkt, nicht als fertiges Streifenmuster. Bei vielen Einzelereignissen werden bevorzugte und seltenere Trefferbereiche sichtbar.
- Die drei Schirme sind als qualitative Darstellungen von einem Treffer, ersten Treffern und vielen Treffern beschriftet. Sie behaupten keine exakte Ereignisanzahl im mittleren oder rechten Bild und keine quantitative Wahrscheinlichkeitskurve.
- Eine frühe, noch unregelmäßige Verteilung steht einer später klareren statistischen Struktur nicht entgegen. Die Abbildungen müssen für diesen qualitativen Zweck keine exakt identischen Punktpositionen als fotografisch kumulierte Messfolge nachbilden.
- Das Bild illustriert die Zielidee verständlich. Es beweist keine Aussage über das Verständnis einer lernenden Person und ist keine Quelle für eine konkrete Apparatur oder gemessene Verteilung. Keine neue normative Quellenprüfung wurde durchgeführt.

## 4. Exponentialgleichungen mit Logarithmen lösen — vorhandenes Original

Ziel-ID: `c088fd81-fe4f-4282-99af-ebc0d1a7d202`.

Datei: `app/public/assets/goal-visualizations/mathematik/c088fd81-fe4f-4282-99af-ebc0d1a7d202/c088fd81-fe4f-4282-99af-ebc0d1a7d202.jpg` (relativ zur Repositorywurzel).

SHA-256: `40c4cdf69e848cd8d6664ddad9be8039413abc52f2998d68796db90d2ebe0a54`.

AI-Urteil: **beibehalten; kein eindeutig falscher Zahlen- oder Beziehungsbefund**.

- 2ˣ=12, log(2ˣ)=log(12), x·log(2)=log(12) und x=log(12)/log(2) sind korrekt. Der Näherungswert 3,58 stimmt mit 3,5849625… überein.
- Die Eingrenzung durch 2³=8 und 2⁴=16 ist korrekt und ausdrücklich als Plausibilitätsprüfung gekennzeichnet.
- Die Pflanzen tragen die Werte 1,2,4,12. Ihre Anordnung enthält keine Zeitmarken und keine Pfeile mit der Behauptung gleicher Zeitabstände. Der Begleittext sagt zutreffend, dass der Wert 12 zwischen drei und vier Verdopplungsschritten erreicht wird.
- Eine Leserin könnte die gleichmäßig nebeneinander gestellten Pflanzen als aufeinanderfolgende volle Verdopplungsschritte auffassen; dann wäre der Sprung 4→12 falsch. Diese zusätzlichen gleichen Zeitschritte behauptet die Grafik aber nicht, und der Begleittext widerspricht gerade dieser Lesart. Daher liegt nur ein mögliches Missverständnis vor, kein belegter harter Bildfehler, der einen Austausch rechtfertigt.
- Eine optionale Zielwertbeschriftung an der letzten Pflanze wäre eine Verständnishilfe. Sie ist keine fachlich notwendige Korrektur und begründet keine Neugenerierung des sonst korrekten Bildes.

## 5. Logarithmen als Umkehrung exponentieller Zusammenhänge nutzen — vorhandenes Original

Ziel-ID: `aed3ca99-815b-40b8-ae91-e11bf92f51da`.

Datei: `app/public/assets/goal-visualizations/mathematik/aed3ca99-815b-40b8-ae91-e11bf92f51da/aed3ca99-815b-40b8-ae91-e11bf92f51da.jpg` (relativ zur Repositorywurzel).

SHA-256: `a3d112ccfcdfe89d83ea1e09ef1557b557253f5fd3284752ea9875bb82e552b4`.

AI-Urteil: **beibehalten; Pfeilsemantik mehrdeutig, aber keine eindeutig falsche Zahl oder Äquivalenz**.

- 2³=8 und log₂(8)=3 sind richtig und äquivalent. Die Aussage, der Logarithmus frage nach dem Exponenten, ist richtig.
- Die drei eingezeichneten Verdopplungsschritte von einer Einheit zum Wert 8 sind konsistent. Das Ergebnis drei Schritte passt zur logarithmischen Aussage.
- Der obere Pfeil von der Potenzgleichung zur logarithmischen Gleichung trägt Potenz (Exponential), der untere Rückpfeil Logarithmus (Umkehrung). Liest man diese Wörter als auszuführende Umformungsoperationen, wären die Richtungsbezeichnungen vertauscht: Zur logarithmischen Darstellung gelangt man durch Logarithmieren, zurück durch Exponentieren.
- Die Wörter können jedoch ebenso die jeweilige Ausgangsdarstellung benennen: oben die Potenzdarstellung, unten die Logarithmusdarstellung. Da vollständige Gleichungen statt bloßer Operanden verbunden sind und die Mitte mit WECHSEL beschriftet ist, ist diese nichtoperationale Lesart konsistent. Das Bild enthält deshalb keine eindeutig falsche mathematische Äquivalenz; der Befund ist eine Beschriftungsmehrdeutigkeit.
- Optional ließen sich Ausgangsformen direkt an den Kästen benennen und die Pfeile neutral als Darstellungswechsel beschriften. Aus diesem möglichen Missverständnis allein folgt keine fachlich zwingende Neugenerierung.

## 6. Natürliche Exponentialfunktion für kontinuierliche Prozesse verwenden — Kandidat 2

Zusätzlicher tatsächlicher Sichtprüfzeitpunkt: `2026-09-06 22:29:29 UTC`.

Ziel-ID: `f05acdc5-4949-54c7-b8cd-56ddd1fbdbad`.

Datei: `f05acdc5-4949-54c7-b8cd-56ddd1fbdbad/candidate-2/f05acdc5-4949-54c7-b8cd-56ddd1fbdbad.generated.2026-09-06T22-23-12-124Z.jpg`.

SHA-256: `2a41da1a57fa6b3a675b38c5e6bed9a77f1d8857348b1235186aa9b6e5ff9dfd`.

AI-Urteil: **fachlich geeigneter Kandidat; die konkreten Koordinatenfehler von Kandidat 1 sind behoben**.

- Der vollständig neu aufgebaute Wachstumsgraph besitzt eine konsistente lineare y-Skala 0,50,100,150,200 und gleichmäßige Zeitabstände 0,1,2. Der Startpunkt liegt bei (0,100), der mittlere Punkt bei ungefähr (1,135), der letzte bei ungefähr (2,182); alle Punktlagen stimmen innerhalb der Strichbreite mit den Zahlen überein.
- N(t)=100·e^(0,3t) und die Tabelle 100/ungefähr 135/ungefähr 182 stimmen rechnerisch. Der positive, zunehmende und nach oben gekrümmte Verlauf ist mit dieser Funktion verträglich. Am rechten Rand erreicht er nahe t=2,3 einen Wert um 200, passend zu 100·e^0,69≈199,4.
- t ist über die Tabelle als Zeit in Stunden bestimmt. Die Aussage nach zwei Stunden etwa 182 passt zum modellierten Bestand. Die Darstellung benennt keine besondere Bestandsart und behauptet daher keine zusätzliche reale Messung.
- Der qualitative Zerfallsgraph von M(t)=80·e^(-0,4t) bleibt positiv, nimmt ab und nähert sich der horizontalen Achse. Er enthält keine falschen numerischen Skalen oder Punktzuordnungen.
- Alle sichtbaren Formeln, Tabellenzahlen und Beschriftungen wurden mitbetrachtet. Kein konkreter fachlicher Ablehnungsgrund festgestellt. Das Urteil bleibt AI-only und kann keine menschliche Bildfreigabe ersetzen.
