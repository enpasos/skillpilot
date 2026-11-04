# Musterlösung: Jährliche Sparrate

**1. Tabellenmodell**

Bei fester Jahresrate $r$ und Guthaben $G_k$ nach der $k$-ten Einzahlung gilt
$G_0=0$ und $G_k=1{,}03G_{k-1}+r$.
Eine mögliche Versuchstabelle enthält in A die Rate, in B bis E die Guthaben
nach Jahr 1 bis 4. In der ersten Datenzeile:
`B2=A2`, `C2=B2*1.03+A2`, `D2=C2*1.03+A2`, `E2=D2*1.03+A2`.
Die Formeln werden für weitere Versuchsraten nach unten kopiert.
Die letzte Einzahlung eines Jahres erhält in diesem Jahr keine Zinsen;
im ersten Jahr werden daher nur $r$ Euro angespart.

**2. Versuchsraten**

| Jahresrate € | Jahr 1 € | Jahr 2 € | Jahr 3 € | Jahr 4 € |
|---:|---:|---:|---:|---:|
| 450 | 450,00 | 913,50 | 1390,91 | 1882,63 |
| 475 | 475,00 | 964,25 | 1468,18 | 1987,22 |
| 500 | 500,00 | 1015,00 | 1545,45 | 2091,81 |
| 478 | 478,00 | 970,34 | 1477,45 | 1999,77 |
| 479 | 479,00 | 972,37 | 1480,54 | 2003,96 |

**3. Gewählte Rate prüfen**

Die kleinste passende ganze Rate ist 479 € pro Jahr. Ihre vier Guthaben
stehen in der letzten Zeile. Die Rate 478 € verfehlt das Ziel um etwa
0,23 €, während 479 € es um etwa 3,96 € übertrifft. Mit wachsender fester
Rate wächst in jeder Tabellenperiode auch das Guthaben; deshalb reichen
noch kleinere ganze Raten ebenfalls nicht aus. Insgesamt werden viermal
479 €, also 1916 €, eingezahlt; die Differenz zum Endguthaben stammt aus Zinsen.

**4. Einzahlungstermine**

Die erste Rate liegt erst am Ende des ersten Jahres auf dem Konto.
$1{,}03r$ als erstes Jahresguthaben würde ihr zu Unrecht ein volles Jahr
Zinsen zuschreiben. Bei Einzahlung jeweils am Jahresanfang bekäme jede
Rate ein zusätzliches Zinsjahr. Bei derselben Rate wäre das Endguthaben
also höher und eine kleinere benötigte Rate wäre plausibel. Das ist ein
anderer Zahlungsplan; die bisherige Tabelle dürfte nicht unverändert gelten.
Eine neue genaue Rate für diesen Plan wird nicht verlangt.
