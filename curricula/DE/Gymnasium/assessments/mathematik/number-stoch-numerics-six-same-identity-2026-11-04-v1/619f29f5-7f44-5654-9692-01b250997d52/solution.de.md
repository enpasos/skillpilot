# Musterlösung: Nachvollziehbare numerische Entscheidung

Es sind verschiedene dokumentierte Vorgehensweisen gleichwertig. Ein
mögliches Protokoll mit Intervallhalbierung lautet wie folgt.

**1. Durchführung festhalten**

Ziel ist die Nullstelle von $f(x)=x+e^x-4$ auf $[1,2]$ mit absolutem
Fehler höchstens $0{,}0005$. Ich wähle Intervallhalbierung, weil ich damit
bei stetigem $f$ aus einer Vorzeichenklammer eine nachvollziehbare
Fehlergrenze erhalte; das ist ohne besondere Löserfunktionen reproduzierbar.
Anfangs gilt $f(1)<0<f(2)$.
Der erste Mittelpunkt ist $1{,}5$. Weil $f(1{,}5)>0$, bleibt $[1,1{,}5]$.
Der zweite Mittelpunkt ist $1{,}25$. Weil $f(1{,}25)>0$, bleibt $[1,1{,}25]$.
Das dokumentiert den Beginn der Durchführung, aber noch nicht die Zielgenauigkeit.
Die weitere Eingrenzung kann hier mit den geprüften Tabellenwerten erfolgen;
es werden nicht zehn undokumentierte Halbierungsschritte behauptet.

Alternativ ist etwa die konkrete Löseranweisung „Löse $x+e^x-4=0$
mit Suchintervall $[1,2]$“ samt Werkzeugfunktion und Ausgabe
$x\approx1{,}07372894$ ein nachvollziehbarer Start. Eine entsprechende
konkrete reale Eingabe eines verwendeten Werkzeugs ist ebenso richtig.
Die nachfolgende Intervallkontrolle bleibt für beide Wege nötig.

**2. Ergebnis kontrollieren**

Die Tabelle liefert $f(1{,}073)<0<f(1{,}074)$. Daher liegt die Lösung
im Intervall $[1{,}073,1{,}074]$. Stetigkeit sichert die Existenz,
strenges Wachstum die Eindeutigkeit. Der Mittelpunkt ist
$$m=1{,}0735,\qquad |m-x_*|\leq\frac{1{,}074-1{,}073}{2}=0{,}0005.$$
Damit ist die ursprüngliche Anforderung erfüllt. Die Rundungsfehler der
Tabellenwerte sind viel kleiner als ihre Beträge und ändern kein Vorzeichen.
Auch eine feinere, passend belegte Näherung ist zulässig; bloße gedruckte
Stellen belegen noch keine entsprechende Genauigkeit.

**3. Grenzen**

Die lange Löserausgabe allein ist kein Beleg für alle angezeigten Stellen.
Man braucht eine geeignete Kontrolle beziehungsweise Fehlerabschätzung.
Konkrete Grenzen bei Intervallhalbierung sind zum Beispiel:

- Eine Vorzeichenklammer und Stetigkeit sind für diesen Existenznachweis
  nötig. Bei falscher Klammer liefert das Halbierungsprotokoll keine
  gesicherte Eingrenzung der gesuchten Nullstelle.
- Jede Halbierung halbiert nur die Intervallbreite; für deutlich engere
  Toleranzen können viele Funktionsauswertungen nötig werden.
- Gerundete Funktionswerte unmittelbar nahe null können ohne ausreichende
  Genauigkeit ein falsches Vorzeichen vortäuschen. Hier schließen die
  angegebenen Fehlergrenzen diesen konkreten Vorzeichenfehler aus.

Zwei passend erklärte Grenzen genügen. Bei einem Löser sind etwa
Startwert-/Suchbereichsabhängigkeit und die fehlende Fehlergarantie einer
bloßen Dezimalausgabe passende Grenzen, sofern ihre Folgen erläutert werden.

**4. Rückbewertung und geänderte Anforderung**

Die Wahl war für das ursprüngliche Ziel zweckmäßig: Das Protokoll und die
zusätzlichen Tabellenwerte liefern eine reproduzierbare Eingrenzung und
den verlangten Fehlerbeleg. Ein Löser könnte den Näherungswert schneller
liefern, benötigt für die behauptete Genauigkeit aber ebenfalls Kontrolle.
Die Tabelle zeigt $f(1{,}0737)<0<f(1{,}0738)$. Daher gilt für den neuen
Mittelpunkt
$$m_2=1{,}07375,\qquad |m_2-x_*|\leq0{,}00005.$$
Die alte Klammer genügt für das verschärfte Ziel nicht; man muss eine engere
Klammer nachweisen, durch weitere Halbierungen, präzisere Werte oder die hier
bereitgestellten Tabellenwerte. Ein Beibehalten der Methode mit ergänzter
Kontrolle ist ebenso begründbar wie ein Methodenwechsel. Die Bewertung
muss sich auf das eigene Protokoll und die Anforderung beziehen.
