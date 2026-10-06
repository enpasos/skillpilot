# Chemie Q1: unabhängiger Review A des Routenentwurfs v1

**Gesamtentscheidung v1: REVISE.** Graph, Quellenumfang und die 34 neuen
D-Seitenkontextdeltas sind tragfähig. Die neue Paraben-Verwendungsaufgabe erhält
KEEP. Die neue quantitative Aufgabe braucht ausdrücklich fiktive Akzeptanzgrenzen
für ihre Referenz- und Wiederfindungskontrollen, bevor ihr kontrollierter Ablauf
inhaltlich freigegeben werden kann.

Der überprüfte Autor-Freeze ist
`e8e42b9cd2e0cdeb088b9c9037a520d98eaf18f6f18256259594491c5364a076`;
der Kandidat-Canonical ist
`1d7286396c23097c7c916d7b46d7441f5795ede5f519beebc47df0155372d379`.
Die Prüfung entstand unabhängig vom Autor. Aktuelle Schlussfolgerungen eines
unabhängigen B-Reviews wurden nicht gelesen.

## Befund und konkrete Korrektur

`A-Q1-CTRL-001` betrifft ausschließlich die neue quantitative Aufgabe
`171b47e2-2c53-50f2-a145-a26b896fd73f`. Material 2 nennt eine Referenzkontrolle
mit 99 % sowie eine Wiederfindung mit 100 %; Material 3 nennt nochmals 100 %.
Aufgabe 2 fordert die Verwendung sämtlicher Kontrollbefunde und den Umgang mit
Kontrollversagen. Der Lösungsvorschlag bewertet die Befunde als konsistent,
obwohl keine Akzeptanzgrenzen angegeben sind.

Eine Referenz mit 99 % besteht beispielsweise einen fiktiven Bereich 98–102 %,
aber keinen fiktiven Bereich 99,5–100,5 %. Beide Regeln passen zum bislang
gegebenen Material. Die Aufgabe benötigt deshalb eine ausdrückliche interne
didaktische Regel und den entsprechenden Vergleich aller Kontrollwerte in der
Lösung. Werte außerhalb dieser Regel müssen die Gültigkeitsbehauptung stoppen,
bevor Ursachenprüfung und Wiederholung folgen. Diese Regel darf keinen echten
Validierungsnachweis oder reale Labortoleranzen behaupten.

Die Rechnungen sind richtig: Die drei Ascorbinsäureansätze ergeben im Mittel
2,6418 g/L ursprüngliche Probe; die drei HPLC-Ansätze ergeben 2 000 mg/L
Methylparaben. Blindwert bzw. Kalibrierinterzept und die Verdünnungsfaktoren
20 bzw. 100 werden getrennt und genau einmal berücksichtigt. Die HPLC-Werte
bleiben innerhalb des angegebenen Kalibrierbereichs.

Die Paraben-Verwendungsaufgabe `4cb74d76-99f1-5264-b1e3-448cda47b005` ist als
begrenzter fiktiver LK-Fall tragfähig. M erfüllt die drei Fallkriterien. P
erfüllt die Keim- und Mengenbedingungen, scheitert aber bei 10 °C an der
Löslichkeit. Die ausdrücklich lineare Modellannahme trägt die Entscheidung
für das gesamte Temperaturintervall. 24/24 Punkte erzwingen den entscheidenden
Gegenbefund und die vorläufige Schlussfolgerung; ohne P-Konflikt sind höchstens
21 Punkte möglich. Die Angaben werden weder zu echten Grenzwerten noch zu
Sicherheits-, Wirksamkeits- oder Produktfreigaben.

## Tatsächliche unabhängige Gegenproben

- Autor-Freeze: alle 35 Dateien exakt; historischer Vorgänger: alle 407 Dateien
  exakt; aktive Baselinekopien: alle elf Dateien exakt.
- 479 Kandidatenknoten: acht vorhandene Objekte ändern sich; zwei konkrete
  `practiceAssessment`-Knoten kommen hinzu; die übrigen 469 Vorgängerobjekte und
  alle 104 aktiven strengen WholeGoals bleiben exakt.
- Die drei Q1-Übungsaufgaben behalten sämtliche zuvor im Cluster enthaltenen
  atomaren Voraussetzungen außer genau den zwei HE-Quantifizierungszielen:
  67 zu 65. Der generische Abschluss entfernt genau diese beiden Voraussetzungen
  und die alte AND-Cluster-Abdeckungsbehauptung. Unveränderte ältere Aufgaben
  erhalten dadurch keine neue Inhaltsfreigabe.
- `requires` und `contains` sind unabhängig auf Referenzen und Zyklen geprüft.
  Die native `contains`-Validierung bleibt fehlerfrei.
- 376 aktive, 378 frühere und 378 neue native Gesamtseiten wurden selbst neu
  erzeugt. Alle 34 eingefrorenen Seitentripel sind exakt reproduziert; die
  weiteren 70 Vorgängerseiten bleiben exakt.
- Alle 378 eigenen nativen positiven Verständnis-Payloads und die eigenen
  kanonischen D-Kontexte der 104 strengen Ziele bleiben exakt.
- Die 497 isolierten Applicability-Eingänge wurden gegen ihre Hashes geprüft,
  mit dem ausdrücklich bekannten Kandidat-Canonical-Overlay. Der unveränderte
  native Compiler wurde selbst ausgeführt: quantitative Kinder, AND-Cluster
  und quantitative Aufgabe HE-only; Paraben-Verwendungsaufgabe BY+HE ausschließlich
  über `assessment-requires`; null Chemie-Compilerfehler.
- Die Arithmetik und wesentliche Auslassungsfälle wurden unabhängig berechnet.
  Der Kontrollgrenzen-Gegenfall zeigt die tatsächliche verbleibende Materiallücke.

## Quellen- und Reviewgrenzen

Die aktuell gelesenen offiziellen Quellen stimmen mit der erhaltenen
Operatorgrenze überein. HE Q1.5 nennt im erhöhten Niveau Ascorbinsäurequantifizierung
und Parabenverwendung. Q1.5 gehört dabei nicht zu den allgemein verbindlichen
Themenfeldern 1–3. Die quantitative Bestimmung eines vorgegebenen Parabenesters
bleibt der bereits überprüfte eigene analytische Transfer.
[Hessisches Kerncurriculum, Stand 21.04.2026](https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf)

BY beschreibt selbständige qualitative/quantitative Analysen und Redoxtitrationen.
Chromatografische Identifikation ist konkret; HPLC und quantitative
Peakflächenauswertung sind bedingte Inhalte. Daraus entsteht keine Pflicht zur
Quantifizierung gerade dieser beiden Analyten. Die BY+HE-Sicht der eigenen
Paraben-Verwendungsaufgabe ist Übungsapplicability, keine neue Quellenabdeckung.
[LehrplanPLUS C11](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie),
[LehrplanPLUS C12 erhöht](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht)

`34-current-strict-d-context.independent-a.review.json` enthält 34 individuelle
KEEP-Entscheidungen für die tatsächlich geänderten Rückverweise. Jeder neue Link
bezeichnet eine bereits zuvor über den Cluster geltende Voraussetzung und
erteilt keine neue direkte Prüfungsabdeckung. Die 19 früheren Split-/Pagination-
Deltas bleiben separat erhalten und werden durch diesen Routenreview nicht
erneut freigegeben.

Es wurden keine nativen D-Reviewrecords mit erfundenen Kampagnenbindungen
erstellt. Solche Records benötigen eine tatsächliche aktuelle Kampagne. Die
historischen wissenschaftlichen D/P/A/M/Bildnachweise sind unveränderte
Wiederverwendung; sie werden nicht als neue Freigabe gezählt. Aktive Integration,
vollständige CQR-/GVR-/Floor-Prüfung und zentraler M7-Abschluss bleiben getrennt.
Neue wissenschaftliche Abschlüsse und wiederhergestellte native D-Bindungen:
jeweils **0**. Human Approval und Human Trial bleiben false.

Die drei Checkskripte schreiben ausschließlich in dieses unabhängige Dossier.
Die tatsächlichen Eingangs-, Ergebnis- und Codehashes sind unter
`independent-a.final.freeze.json` eingefroren.
