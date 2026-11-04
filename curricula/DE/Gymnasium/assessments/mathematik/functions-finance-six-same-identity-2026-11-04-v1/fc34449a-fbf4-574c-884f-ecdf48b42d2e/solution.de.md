# Musterlösung: Ganze Zahlungsperioden

**1. Tabellenformeln**

Bei $G_k$ als Guthaben nach dem $k$-ten Jahresende gilt
$G_0=1000$ und $G_k=1{,}02G_{k-1}+200$.
Stehen in Zeile 2 das Jahr 0 in A und 1000 in E, kann die nächste Zeile
lauten: `A3=A2+1`, `B3=E2`, `C3=B3*2%`, `D3=200`,
`E3=B3+C3+D3`. Die Formeln werden nach unten kopiert.
Zuerst wird das bereits vorhandene Guthaben verzinst, danach wird eingezahlt.
Die 200 € erhalten für das gerade abgeschlossene Jahr noch keine Zinsen.

**2. Tabelle mit 2 % Zins**

| Jahr | Anfang € | Zinsen € | Einzahlung € | Ende € |
|---:|---:|---:|---:|---:|
| 0 | – | – | – | 1000,00 |
| 1 | 1000,00 | 20,00 | 200,00 | 1220,00 |
| 2 | 1220,00 | 24,40 | 200,00 | 1444,40 |
| 3 | 1444,40 | 28,89 | 200,00 | 1673,29 |
| 4 | 1673,29 | 33,47 | 200,00 | 1906,75 |
| 5 | 1906,75 | 38,14 | 200,00 | 2144,89 |
| 6 | 2144,89 | 42,90 | 200,00 | 2387,79 |
| 7 | 2387,79 | 47,76 | 200,00 | 2635,54 |

Die Anzeige ist auf Cent gerundet, die folgenden Zellen verwenden die intern
ungerundeten Werte. Dadurch können Summen der angezeigten gerundeten Spalten
im Einzelfall um einen Cent abweichen.

**3. Kontextprüfung**

Erstmals nach sieben Jahren ist das Ziel erreicht; bis dahin erfolgen
sieben Einzahlungen. Nach sechs Jahren fehlen noch etwa 112,21 €,
nach sieben Jahren liegt das Guthaben etwa 135,54 € über dem Ziel.
Das Guthaben steigt in jeder Periode; alle früheren Jahresenden reichen
also ebenfalls nicht. Im vereinbarten Modell ändert sich das Guthaben nur
an den Jahresenden. Ein interpolierter Bruchteil zwischen sechs und sieben
Jahren ist daher kein tatsächlich erreichter Zielzeitpunkt in diesem Modell.

**4. Ohne Zinsen**

Die zweite Tabelle verwendet dieselben Formeln mit Zinssatz 0 %.
Ihre Endguthaben für Jahr 0 bis 8 sind
$1000,1200,1400,1600,1800,2000,2200,2400,2600$ Euro.
Nach sieben Jahren sind es erst 2400 €, nach acht Jahren 2600 €.
Die neue Laufzeit beträgt acht Jahre mit acht Einzahlungen, also ein Jahr
mehr. Ohne Zinsen fehlt der zusätzliche Guthabenzuwachs; die Einzahlungen
allein überschreiten 2500 € erst in der nächsten vollständigen Periode.
