# Musterlösung: Zinssatzsuche in der Tabelle

**1. Tabellenformeln**

In Zeile 1 stehen die Überschriften. Die Versuchszinssätze stehen als
Prozentwerte in Spalte A. Eine mögliche erste Datenzeile ist
`B2=2000*(1+A2)`, `C2=B2*(1+A2)`, `D2=C2*(1+A2)`, `E2=D2-2320`.
Die Formeln werden für weitere Versuchszinssätze nach unten kopiert.
So wird jedes Jahr das gesamte Vorjahresguthaben einschließlich der bereits
gutgeschriebenen Zinsen verzinst. Andere passende Tabellenlayouts sind gleichwertig.

**2. Suche und Eingrenzung**

| Zinssatz | Jahr 1 € | Jahr 2 € | Jahr 3 € | Differenz € |
|---:|---:|---:|---:|---:|
| 4,00 % | 2080,00 | 2163,20 | 2249,73 | -70,27 |
| 5,00 % | 2100,00 | 2205,00 | 2315,25 | -4,75 |
| 6,00 % | 2120,00 | 2247,20 | 2382,03 | 62,03 |
| 5,06 % | 2101,20 | 2207,52 | 2319,22 | -0,78 |
| 5,07 % | 2101,40 | 2207,94 | 2319,88 | -0,12 |
| 5,08 % | 2101,60 | 2208,36 | 2320,55 | 0,55 |

Die Zielsumme liegt zwischen den Werten zu 5,07 % und 5,08 %. Ein größerer
positiver Zinssatz erzeugt hier in jedem Jahr ein größeres Guthaben.

**3. Näherung**

Zum Beispiel sind 5,07 % pro Jahr geeignet: Die intern berechnete
Abweichung beträgt etwa $-0{,}1164$ €, also betragsmäßig weniger als 1 €.
Auch 5,08 % ist nach der ausdrücklich vorgegebenen Ein-Euro-Toleranz geeignet.
5,06 % erfüllt ebenfalls diese Endwerttoleranz; die engere Suchklammer aus
Teil 2 bleibt jedoch zu dokumentieren. Der Wert ist ein jährlicher Satz,
kein insgesamt für drei Jahre anfallender Prozentsatz. Er liegt plausibel
zwischen 5 % und 6 %. Eine kleine Endwerttoleranz ist keine Behauptung,
der reale Vertragssatz sei exakt auf die angegebenen Stellen bekannt.

**4. Modellprüfung**

$2000(1+3p)$ verzinst dreimal nur den Anfangsbetrag. Die Tabelle verzinst
auch frühere Zinsen. Zum Beispiel ergeben sich bei 5 % ohne Zinseszins
2300 €, mit jährlichem Zinseszins aber 2315,25 €. Etwa jährliche Gebühren,
Zwischenentnahmen oder ein wechselnder Zinssatz würden das Modell ändern.
Dann darf die Abweichung nicht ohne Weiteres einem anderen festen Zinssatz
zugeschrieben werden. Eine passende konkrete Änderung mit Erklärung genügt.
