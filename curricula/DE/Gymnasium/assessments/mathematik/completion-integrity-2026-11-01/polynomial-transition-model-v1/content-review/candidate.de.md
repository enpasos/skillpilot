# Übergangsweg rekonstruieren, glatt anschließen und Wendestelle begründen

DRAFT — not integrated. Own SkillPilot task; knowledge content CC-BY-4.0.

## Aufgabe

Ein Besucherweg soll zwei vorhandene Abschnitte verbinden. Die waagerechte Koordinate $t$ und alle Höhen werden in Metern gemessen. In der Nähe der ersten Anschlussstelle verläuft der linke Abschnitt nach
$$\ell(t)=5-\frac{t}{10}\quad(t\leq0).$$
Der rechte Abschnitt ist in der Nähe der zweiten Anschlussstelle waagerecht:
$$r(t)=\frac72\quad(t\geq20).$$
Dazwischen soll für $0\leq t\leq20$ ein geeignetes Polynom $q$ vom Grad höchstens vier den Höhenverlauf beschreiben. An beiden Anschlussstellen dürfen weder ein Höhensprung noch ein Knick auftreten. Außerdem soll bei $t=10$ eine Wendestelle des Übergangs liegen. Andere Wendestellen werden nicht ausgeschlossen.

1. Übersetzen Sie die beiden sprung- und knickfreien Anschlüsse in vier Gleichungen für $q$ und $q'$. Erläutern Sie die Bedeutung der Werte und der Steigungen. (2 BE)
2. Formulieren Sie die zunächst notwendige Gleichung aus der geplanten Wendestelle. Erklären Sie, weshalb diese Gleichung allein noch keinen tatsächlichen Krümmungswechsel beweist. (2 BE)
3. Verwenden Sie den Ansatz $q(t)=at^4+bt^3+ct^2+dt+e$. Stellen Sie aus Ihren fünf Bedingungen ein lineares Gleichungssystem für die Koeffizienten auf und lösen Sie es nachvollziehbar. Prüfen Sie die erhaltenen Koeffizienten an allen fünf Bedingungen. (4 BE)
4. Begründen Sie für die zusammengesetzte Wegfunktion mit $\ell$, $q$ und $r$, dass beide Anschlüsse tatsächlich ohne Höhensprung und ohne Knick sind. Eine bloße Liste von Koeffizienten genügt nicht. (2 BE)
5. Prüfen Sie am erhaltenen Modell den Krümmungswechsel bei $t=10$ und erläutern Sie ihn für den Höhenverlauf. Nennen Sie auch eine gegebenenfalls weitere Wendestelle im Übergangsintervall; bewerten Sie, ob sie den Vorgaben widerspricht. (2 BE)
6. Prüfen Sie, ob der Übergang zwischen den vorgegebenen Anschlusshöhen bleibt. Benennen Sie eine Grenze dieses geometrischen Modells; etwaige bautechnische Eignung ist durch die Rechnung allein nicht nachgewiesen. (1 BE)

Hilfsmittel dürfen zur Kontrolle verwendet werden. Ein bloß ausgegebener Funktionsterm ersetzt das selbst aufgestellte Gleichungssystem und die geforderten Begründungen nicht.

Bewertet wird eine Gesamtpunktzahl von höchstens 13 BE; bestanden ist die Aufgabe ab 11 BE. Die Gesamtpunktzahl wird auf höchstens 10 BE begrenzt, wenn eine der folgenden wesentlichen Modellierungshandlungen fehlt oder fachlich falsch ist:

- Rekonstruktion: das vollständige Koeffizienten-LGS aus allen fünf Vorgaben aufstellen, ein nachvollziehbar gültiges Lösungsverfahren durchführen und den erhaltenen Term tatsächlich an den Vorgaben kontrollieren.
- Anschlussmodellierung: die Werte- und Steigungsübereinstimmung an beiden Nähten formulieren, im Kontext deuten und beide Anschlüsse fachlich richtig prüfen.
- Wendemodellierung: die Wendebedingung aus dem Kontext formulieren, notwendig und hinreichend unterscheiden, einen gültigen Test auf eine tatsächliche Wendestelle anwenden und den Wechsel im Höhenverlauf deuten.

Für die Bewertung zählt die gesamte Lösung, nicht der Antwortort. Gleichwertige systematische Lösungs- und Eliminationswege sind zulässig. Nachweise aus den Teilen 3, 4 und 5 können einander belegen; dieselbe Rechnung muss nicht erneut aufgeschrieben werden. Eine fachlich ausreichende Erklärung in Teil 2 genügt; ein Gegenbeispiel ist eine mögliche, keine verpflichtende Begründung.

Ein nachvollziehbarer isolierter Rechenfehler gilt nicht schon als fehlende Modellierungshandlung. Fachlich richtige Folgearbeit am eigenen Term wird gewertet; derselbe Ursprungsfehler wird nicht wiederholt abgezogen. Eine korrekt durchgeführte Kontrolle kann ausdrücklich ergeben, dass der eigene Term eine Vorgabe nicht erfüllt. Eine ungeprüfte oder fachlich falsche Behauptung, alle Vorgaben seien erfüllt, gilt nicht als Kontrolle. Mehrere unabhängige Fehler begründen keinen pauschalen Bestehensanspruch. Ein vor Abgabe selbst korrigierter Fehler kostet keinen Punkt. Die zusätzliche Wendestelle und die Höhen-/Modellgrenzenprüfung sind reguläre Einzelpunkte, keine weiteren wesentlichen Handlungen für die Kappung. Aus der so bewerteten Gesamtpunktzahl folgt ein einziges binäres Ergebnis.

## Lösung

Aus der ersten Naht folgen $q(0)=\ell(0)=5$ und $q'(0)=\ell'(0)=-1/10$. An der zweiten Naht gelten $q(20)=r(20)=7/2$ und $q'(20)=r'(20)=0$. Gleiche Funktionswerte verhindern einen Höhensprung; gleiche erste Ableitungen verhindern einen Knick.

Die geplante Wendestelle liefert zunächst $q''(10)=0$. Diese notwendige Bedingung allein reicht nicht: Beispielsweise hat $t^4$ bei $0$ zwar eine Nullstelle der zweiten Ableitung, dort aber keinen Vorzeichenwechsel der zweiten Ableitung.

Beim Polynomansatz gilt $e=5$, $d=-1/10$. Die übrigen Bedingungen liefern
$$\begin{aligned}
160000a+8000b+400c&=\frac12,\\
32000a+1200b+40c&=\frac1{10},\\
1200a+60b+2c&=0.
\end{aligned}$$
Aus der dritten Gleichung folgt $c=-600a-30b$. Einsetzen in die zweite liefert $8000a=1/10$, also $a=1/80000$. Die erste wird zu $-80000a-4000b=1/2$ und ergibt $b=-3/8000$. Damit ist $c=3/800$. Insgesamt:
$$q(t)=\frac{t^4}{80000}-\frac{3t^3}{8000}+\frac{3t^2}{800}-\frac t{10}+5.$$
Die Kontrolle ergibt $q(0)=5$, $q'(0)=-1/10$, $q(20)=7/2$, $q'(20)=0$ und $q''(10)=0$. Die Koeffizienten sind durch die angegebenen Eliminationsschritte eindeutig bestimmt.

Für die zusammengesetzte Wegfunktion stimmen bei $t=0$ die einseitigen Höhenwerte und Steigungen von $\ell$ und $q$ überein. Dasselbe gilt bei $t=20$ für $q$ und $r$. Die Wegfunktion ist an beiden Stellen stetig und hat dort jeweils eine übereinstimmende erste Ableitung. Eine übereinstimmende zweite Ableitung ist nicht verlangt und liegt hier an den Nähten nicht vor.

Es gilt
$$q''(t)=\frac{3(t-5)(t-10)}{20000}.$$
Links von $10$ (zwischen $5$ und $10$) ist $q''<0$, rechts von $10$ ist $q''>0$. Damit liegt tatsächlich eine Wendestelle vor. Alternativ bestätigt $q^{(3)}(10)=3/4000\neq0$ den Wechsel. Die Steigung des abfallenden Wegs nimmt unmittelbar vor $t=10$ ab und danach wieder zu. Auch bei $t=5$ wechselt das Vorzeichen, von positiv zu negativ; das ist eine weitere Wendestelle. Sie widerspricht den Vorgaben nicht, da keine Einzigkeit der Wendestelle gefordert wurde.

Für die Plausibilitätsprüfung eignet sich
$$q'(t)=\frac{(t-20)(2t^2-5t+200)}{40000}.$$
Der zweite Faktor ist stets positiv, denn $2t^2-5t+200=2(t-5/4)^2+1575/8>0$. Daher ist $q'<0$ für $0\leq t<20$ und $q'(20)=0$. Der Übergang fällt von $5$ auf $7/2$ und bleibt dazwischen. Das Modell beschreibt nur einen geometrischen Höhenverlauf. Material, Tragfähigkeit, zulässige Steigungen oder kontinuierliche Krümmung an den Nähten sind damit nicht nachgewiesen.

13 BE insgesamt; bestanden ab 11 BE nach den oben genannten gewöhnlichen Bewertungsregeln einschließlich der Gesamtkappung auf 10 BE bei einer fehlenden oder fachlich falschen wesentlichen Modellierungshandlung. Der dargestellte Lösungsweg ist ein Beispiel; gleichwertige Verfahren sind zulässig. Kontrollen in den Teilen 3, 4 und 5 dürfen einander belegen. Die fehlende Übersetzung einer Bedingung darf nicht durch eine passende, aber unbegründet ausgegebene Koeffizientenliste ersetzt werden.

## Bewertung

- 2 BE: Vier Werte-/Steigungsbedingungen aus beiden Nähten selbstständig formulieren und im Kontext begründen; je Naht 1 BE.
- 2 BE: q''(10)=0 aus der Wendestellenvorgabe formulieren (1); notwendig und hinreichend fachlich ausreichend unterscheiden, beispielsweise mit einem optionalen Gegenbeispiel (1).
- 4 BE: Koeffizientenansatz und vollständiges LGS (1; gleichwertige Formulierungen zulässig); systematisch gültige Lösungsschritte beginnen (1; jeder gleichwertige Eliminations-/Lösungsweg zulässig); die Koeffizienten nachvollziehbar bestimmen (1; jeder gleichwertige Lösungsweg zulässig); alle fünf Bedingungen tatsächlich kontrollieren (1; gleichwertige Kontrollen auch in 4/5 zählen, keine doppelte Niederschrift). Folgefehlerregel und Gesamtkappung aus den Bewertungshinweisen anwenden.
- 2 BE: Beide Nähte mit Funktionswert und erster Ableitung prüfen und Sprung-/Knickfreiheit erklären; je Naht 1 BE.
- 2 BE: Tatsächlichen Vorzeichenwechsel bei t=10 nachweisen und im Höhenverlauf deuten (1); zusätzliche Wendestelle t=5 erkennen und die nicht geforderte Einzigkeit korrekt beurteilen (1).
- 1 BE: Keine Über-/Unterschreitung der Anschlusshöhen fachlich prüfen und mindestens eine Grenze des geometrischen Modells benennen; beides für 1 BE erforderlich.
