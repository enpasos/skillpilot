# Ein numerisches Vorgehen dokumentieren und rückblickend bewerten

Gesucht ist eine Näherung der Lösung von $x+e^x=4$ in $[1,2]$.
Für $f(x)=x+e^x-4$ darfst du voraussetzen: $f$ ist stetig und streng
wachsend. Die Näherung soll zunächst höchstens $0{,}0005$ vom tatsächlichen
Lösungswert abweichen.

Zur Wahl stehen Intervallhalbierung oder ein numerischer Gleichungslöser.
Bei der **Intervallhalbierung** wertet man den Mittelpunkt eines Intervalls
mit verschiedenen Funktionsvorzeichen aus und behält die Hälfte mit
Vorzeichenwechsel. Bei einem beliebigen gefundenen Intervall $[a,b]$ mit
Vorzeichenwechsel hat der Mittelpunkt einen Fehler von höchstens $(b-a)/2$.
Diese Angaben dürfen verwendet werden. Ein spezieller Lösealgorithmus muss
nicht auswendig gewusst werden. Folgende Funktionswerte stehen als geprüfte
Rechenhilfe zur Verfügung (Rundungsfehler jeweils kleiner als $10^{-7}$):

| $x$ | $f(x)$ näherungsweise |
|---:|---:|
| 1 | -0,2817182 |
| 2 | 5,3890561 |
| 1,5 | 1,9816891 |
| 1,25 | 0,7403430 |
| 1,073 | -0,0028612 |
| 1,074 | 0,0010644 |
| 1,0737 | -0,0001136 |
| 1,0738 | 0,0002790 |

Insgesamt sind **20 BE** erreichbar. Schreibe ein knappes, für eine andere
Person nachvollziehbares Prüfprotokoll. Du darfst die Tabelle, einen
Taschenrechner oder ein digitales Werkzeug nutzen.

**1. Gewählte Vorgehensweise dokumentieren (6 BE)**

Wähle eine der beiden Vorgehensweisen und notiere Zielgleichung, Suchbereich,
Genauigkeitsziel, Methode und einen konkreten Grund für deine Wahl.
Dokumentiere die Durchführung: Bei Intervallhalbierung zeige die ersten
zwei Halbierungsschritte ab $[1,2]$; bei einem Gleichungslöser notiere
reproduzierbar die Eingabe mit Suchbereich beziehungsweise Startwert
und den erhaltenen Näherungswert. Falls du kein Werkzeug verwendest,
kannst du die Intervallhalbierung vollständig mit der Tabelle beginnen.

**2. Ergebnis und Genauigkeit belegen (6 BE)**

Nutze geeignete Werte aus der Tabelle für eine unabhängige Eingrenzung.
Gib eine Näherung mit begründeter absoluter Fehlergrenze an, die das
Genauigkeitsziel erfüllt. Erkläre, warum genau eine Lösung im betrachteten
Intervall liegt. Eine beliebig lange Dezimalausgabe allein ist kein Fehlerbeleg.

**3. Grenzen benennen (4 BE)**

Eine Person schreibt ohne weitere Kontrolle den Löserwert
$1{,}073728937556$ ab und behauptet, alle gezeigten Stellen seien damit
belegt. Bewerte diesen Nachweis. Benenne zwei konkrete Grenzen deiner
gewählten Vorgehensweise oder ihrer Dokumentation und erkläre jeweils,
wie sie sich auf die Verlässlichkeit beziehungsweise den Aufwand auswirken.

**4. Die Entscheidung im Nachhinein bewerten (4 BE)**

Bewerte anhand deines tatsächlichen Protokolls, ob deine Wahl für das
ursprüngliche Genauigkeitsziel zweckmäßig war. Die geforderte absolute
Fehlergrenze wird nun auf $0{,}00005$ verschärft. Zeige mit der Tabelle
eine passende neue Eingrenzung und Näherung. Erkläre, welche Ergänzung
oder Änderung deines ursprünglichen Vorgehens dafür nötig ist.
