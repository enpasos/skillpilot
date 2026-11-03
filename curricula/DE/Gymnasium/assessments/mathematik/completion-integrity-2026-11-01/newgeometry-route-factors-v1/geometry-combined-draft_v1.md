# Regenwassertank modellieren und die Kegelvolumenformel begründen

Status: Autorenkandidat. Unabhängige Inhaltsprüfung, Quellen-/Platzierungsprüfung, Exklusivität und Maschinen-QA stehen aus.

## Herkunft

Diese Aufgabe ist neu für den zusammenhängenden Regenwassertank-Kontext verfasst. Die alte gemischte Drohnen-/Tankaufgabe `ea664a30-98be-508e-90ac-5304679814ee` aus `seki/j10/draft_v3.md`, Aufgabe 5, Teilaufgabe 4, dient nur als Kontextanregung. Maße, Modellzerlegung, Längen-/Winkel-/Flächenfragen, explizite Pyramidenargumentation und kleinteilige Vollpunkterubrik sind neu; es handelt sich nicht um einen unveränderten Auszug oder eine offizielle Prüfungsaufgabe. Die Ursprungsaufgabe bleibt unverändert.

## Aufgabe

Ein Betrieb plant einen geschlossenen Regenwassertank. Sein idealisierter Innenraum besteht aus einem geraden Kreiszylinder mit Radius $r=2\,\mathrm{m}$ und Höhe $h_Z=3\,\mathrm{m}$. Darauf sitzt ein gerader Kreiskegel mit demselben Radius und der Höhe $h_K=1{,}5\,\mathrm{m}$; beide Körper haben dieselbe senkrechte Achse. Die gemeinsame Kreisfläche ist keine Trennwand. Der Tank steht mit seiner gesamten unteren Kreisfläche auf einem Fundament.

Für die Rechnung sind Wandstärke und Einbauten zu vernachlässigen. Als theoretisches Fassungsvermögen gilt der gesamte Innenraum bis zur Kegelspitze; ein betrieblich nötiger Luftraum wird zunächst nicht abgezogen. Beschichtet werden nur die frei liegenden Zylinder- und Kegelmantelflächen, nicht die untere Kreisfläche und nicht die gemeinsame Kreisfläche. Ein Taschenrechner darf verwendet werden. Runde Längen, Flächen und Winkel sinnvoll; rechne vor dem Runden mit den genauen Werten.

1. Skizziere einen senkrechten Schnitt durch die gemeinsame Achse. Trage die gegebenen Maße ein und erläutere, aus welchen beiden Körpern sich das Modell zusammensetzt. (1 BE)
2. Bestimme die Länge $s$ einer Mantellinie des Kegels. Begründe die verwendete geometrische Beziehung anhand deines Schnitts. (2 BE)
3. Bestimme den Winkel $\alpha$, den eine Kegelmantellinie mit der horizontalen Ebene des gemeinsamen Kreises einschließt. Begründe deinen Ansatz. (2 BE)
4. Berechne die gesamte zu beschichtende Fläche. Begründe, welche Flächen einbezogen werden und warum die beiden Kreisflächen nicht zusätzlich zählen. (2 BE)
5. Bestimme das theoretische Fassungsvermögen in Kubikmetern und Litern. Entscheide begründet, ob $45\,000$ Liter in dieses Modell passen. Nenne außerdem eine für die praktische Nutzung relevante Modellgrenze und erläutere, wie sie das praktisch nutzbare Volumen beeinflussen könnte. (4 BE)
6. Die Pyramidenformel $V_P=\frac13G h$ ist bekannt. Begründe nun die verwendete Kegelvolumenformel anschaulich; eine formale Grenzwertrechnung wird nicht verlangt. Beschreibe oder skizziere Pyramiden, deren regelmäßige Grundvielecke dem Grundkreis einbeschrieben beziehungsweise umbeschrieben sind. Alle Pyramiden sollen dieselbe Spitze wie der Kegel und dieselbe senkrechte Höhe haben. Erläutere, was bei wachsender Eckenzahl mit den Grundflächen und den eingeschlossenen beziehungsweise umschließenden Körpern geschieht. Begründe damit die Formel $V_K=\frac13\pi r^2h_K$. Es reicht nicht, nur zu schreiben: „Ein Kegel ist eine Pyramide mit unendlich vielen Ecken.“ (5 BE)

## Lösung

1. Im Achsenschnitt liegt über einem Rechteck der Breite $4\,\mathrm{m}$ und Höhe $3\,\mathrm{m}$ ein gleichschenkliges Dreieck mit Grundseite $4\,\mathrm{m}$ und Höhe $1{,}5\,\mathrm{m}$. Das räumliche Modell setzt sich aus einem geraden Kreiszylinder und einem geraden Kreiskegel mit gemeinsamer Achse zusammen. Die Radiusstrecke im halben Dachdreieck ist $2\,\mathrm{m}$ lang. Die Gesamtinnenhöhe beträgt $4{,}5\,\mathrm{m}$.

2. Die halbe Dachquerschnittsfigur ist ein rechtwinkliges Dreieck mit Katheten $r$ und $h_K$ und Hypotenuse $s$. Deshalb ist $s=\sqrt{r^2+h_K^2}=\sqrt{2^2+1{,}5^2}\,\mathrm{m}=2{,}5\,\mathrm{m}$.

3. Der gesuchte Winkel liegt zwischen der Mantellinie und der waagerechten Radiusstrecke, nicht zwischen Mantellinie und senkrechter Achse. Es gilt $\tan(\alpha)=h_K/r=1{,}5/2=0{,}75$, somit $\alpha=\arctan(0{,}75)\approx36{,}87^\circ$. Gleichwertige Ansätze mit Sinus oder Kosinus am selben rechtwinkligen Dreieck sind möglich.

4. Die Beschichtungsfläche besteht aus Zylindermantel und Kegelmantel: $A=2\pi r h_Z+\pi r s=12\pi\,\mathrm{m}^2+5\pi\,\mathrm{m}^2=17\pi\,\mathrm{m}^2\approx53{,}41\,\mathrm{m}^2$. Die untere Kreisfläche liegt auf dem Fundament und gehört nach der Aufgabenstellung nicht zur Beschichtung. Der gemeinsame Kreis liegt im Inneren der zusammengesetzten Außenhülle; dort gibt es weder eine zusätzliche Außenfläche noch eine Trennwand.

5. Die beiden Innenvolumina werden addiert: $V=\pi r^2h_Z+\frac13\pi r^2h_K=12\pi\,\mathrm{m}^3+2\pi\,\mathrm{m}^3=14\pi\,\mathrm{m}^3\approx43{,}9823\,\mathrm{m}^3$. Mit $1\,\mathrm{m}^3=1000\,\mathrm{L}$ ergibt das ungefähr $43\,982$ Liter. $45\,000$ Liter passen nicht, denn das theoretische Fassungsvermögen ist bereits kleiner; es fehlen etwa $1018$ Liter.

Eine passende Modellgrenze ist beispielsweise ein im Betrieb freizuhaltender Luftraum unter dem Dach: Er verringert das praktisch nutzbare Volumen gegenüber der theoretischen Vollfüllung. Auch eingebaute Rohre können Platz beanspruchen. Eine andere begründete technische Einschränkung wird akzeptiert. Die vorgegebene Vernachlässigung der Wandstärke darf ebenfalls fachlich diskutiert werden, muss dann aber auf Innen- beziehungsweise Außenmaße bezogen werden: Bei fest vorgegebenen Innenmaßen darf eine dickere Außenwand nicht ohne Weiteres vom berechneten Innenraum abgezogen werden.

6. Man betrachtet in der Grundebene regelmäßige Vielecke innerhalb des Grundkreises, deren Eckpunkte auf dem Kreis liegen, und regelmäßige Vielecke außerhalb des Kreises, deren Seiten den Kreis berühren. Verbindet man ihre Ecken jeweils mit der Kegelspitze, entstehen eingeschriebene und umschriebene Pyramiden. Sie haben dieselbe senkrechte Höhe $h_K$ wie der Kegel. Die eingeschriebene Pyramide liegt im Kegel; die umschriebene enthält ihn.

Bei immer feinerer Annäherung, beispielsweise durch fortgesetztes Verdoppeln der Eckenzahl, nähern sich beide Grundflächen dem Kreis an. Ihre Flächeninhalte $G_n^-$ und $G_n^+$ nähern sich von innen beziehungsweise außen dem Kreisflächeninhalt $\pi r^2$. Wenn die Zentriwinkel der regelmäßigen Vielecke kleiner werden, nähert sich der Radius eines Innenkreises im einbeschriebenen Vieleck dem Radius r. Ebenso nähert sich der Radius eines Außenkreises um das umbeschriebene Vieleck dem Radius r. Die noch fehlenden beziehungsweise überschüssigen Flächen liegen damit in einem immer dünneren Kreisring. Mit der Kreisflächenformel wird anschaulich klar, dass die Fläche dieses Rings und damit die beiden Flächenunterschiede beliebig klein werden können. Entsprechend füllen die eingeschriebenen Pyramiden den Kegel immer genauer aus, während der Überschuss der umschriebenen Pyramiden immer kleiner wird.

Für jede dieser Pyramiden gilt $V_n^-=\frac13G_n^-h_K$ beziehungsweise $V_n^+=\frac13G_n^+h_K$. Der Faktor $\frac13h_K$ bleibt unverändert. Deshalb nähern sich beide Pyramidenvolumina demselben Wert $\frac13\pi r^2h_K$. Das Kegelvolumen liegt zwischen ihnen und wird dadurch anschaulich als $V_K=\frac13\pi r^2h_K$ plausibel. Der Faktor ein Drittel stammt aus der Pyramidenformel; die bloße Annäherung einer Vielecksfläche an einen Kreis würde ihn allein nicht begründen. Die Erklärung verwendet keinen zweiten bekannten Kegelvolumensatz als Begründung.

## Bewertung

16 BE insgesamt; bestanden nur mit 16 BE. Jeder nachstehende Nachweis ist erforderlich. Fachlich gleichwertige Begründungen sind zulässig. Ein korrektes Endergebnis ersetzt keine ausdrücklich verlangte Modellierung oder Begründung.

- 1 BE (`space-model`): Achsschnitt und Körperzerlegung mit Radius 2 m, Zylinderhöhe 3 m und Kegelhöhe 1,5 m richtig darstellen; ein Durchmesser von 2 m statt 4 m erfüllt den Nachweis nicht.
- 1 BE (`space-right-triangle`): Das rechtwinklige halbe Dachdreieck mit Katheten r und h_K sowie der Mantellinie als Hypotenuse begründet identifizieren.
- 1 BE (`space-slant-length`): Die Mantellinie rechnerisch richtig als 2,5 m bestimmen, mit passender Längeneinheit.
- 1 BE (`space-angle-reference`): Den Winkel zur horizontalen Radiusrichtung richtig festlegen und einen korrekten trigonometrischen Ansatz am Dachdreieck begründen; der Komplementwinkel zur Achse ist nicht der gesuchte Winkel.
- 1 BE (`space-angle-value`): Den gesuchten Winkel richtig berechnen, ungefähr 36,9 Grad; sinngemäße Rundung und Gradangabe zulässig.
- 1 BE (`space-coating-boundaries`): Zylinder- und Kegelmantel als Beschichtungsflächen auswählen und beide Ausschlüsse begründen: Boden auf dem Fundament, gemeinsamer Kreis innerhalb der Außenhülle ohne Trennwand.
- 1 BE (`space-coating-value`): Beide Mantelformeln richtig kombinieren und 17 pi m² beziehungsweise ungefähr 53,4 m² erhalten; Umfang oder Volumen anstelle von Fläche erfüllt den Nachweis nicht.
- 1 BE (`space-volume-model`): Zylinder- und Kegelvolumen richtig addieren: pi r² h_Z plus ein Drittel pi r² h_K; der Kegelbeitrag ist 2 pi m³.
- 1 BE (`space-capacity-units`): 14 pi m³ beziehungsweise ungefähr 43,9823 m³ richtig erhalten und konsistent in ungefähr 43 982 Liter umrechnen.
- 1 BE (`space-capacity-decision`): Die 45 000 Liter mit dem berechneten theoretischen Fassungsvermögen vergleichen und die negative Entscheidung nachvollziehbar begründen.
- 1 BE (`space-model-limit`): Eine technische Modellgrenze mit nachvollziehbarer Wirkung auf das nutzbare Volumen nennen; zum Beispiel notwendiger Luftraum oder platzbeanspruchende Einbauten. Eine bloße Eigenschaft ohne Wirkungserklärung genügt nicht; Wandstärke darf nicht fälschlich bei fest vorgegebenen Innenmaßen vom Innenraum abgezogen werden.
- 1 BE (`cone-pyramid-families`): Geeignete einbeschriebene und umbeschriebene regelmäßige Grundvielecke sowie die gemeinsame Spitze und die unveränderte senkrechte Höhe h_K richtig beschreiben oder skizzieren.
- 1 BE (`cone-pyramid-law`): Die bekannte Pyramidenformel V = ein Drittel G h_K auf beide Näherungskörper anwenden; Grundflächeninhalt und feste senkrechte Höhe müssen erkennbar zugeordnet sein.
- 1 BE (`cone-base-area-approximation`): Geometrisch erläutern, warum sich bei wachsender Eckenzahl die beiden Grundflächen dem Kreis und ihre Flächeninhalte pi r² annähern; nur eine steigende Eckenzahl zu erwähnen genügt nicht.
- 1 BE (`cone-inner-outer-solids`): Die eingeschriebene Pyramide als im Kegel liegend und die umschriebene als den Kegel enthaltend deuten; erklären, dass die verbleibenden räumlichen Unterschiede bei feinerer Näherung verschwinden.
- 1 BE (`cone-volume-conclusion`): Aus der Annäherung beider Grundflächeninhalte und der festen Höhe nachvollziehbar V_K = ein Drittel pi r² h_K folgern und den Faktor ein Drittel auf die Pyramidenformel zurückführen; bloßes Zitieren der Kegelformel oder der unendlichen Eckenzahl genügt nicht.

## Zielverträge und Grenzen

- `6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9`: Die lernende Person kann Raumgeometrie-Situationen mit verschiedenen Körpern modellieren, Formeln und geometrische Beziehungen flexibel kombinieren sowie Längen, Winkel, Oberflächen und Volumina in Sachsituationen begründet bestimmen.
- `50612a57-7b9d-45fd-bc08-e95556444760`: Die lernende Person kann die Volumenformel eines geraden Kreiskegels plausibilisieren, indem sie den Körper als Grenzfall geeigneter Pyramiden deutet und den Zusammenhang zur Formel V = 1/3 pi r^2 h erläutert.

`requires` und `coveredGoalIds` benennen ausschließlich die oben ausgewiesenen Ziele. Ihre echten Voraussetzungen bleiben über den kanonischen Graphen erhalten. Ein Prüfungserfolg schreibt keine Mastery dieser Voraussetzungen und behauptet keine zusätzliche Kompetenzzertifizierung. Vollpunkte sichern hier, dass kein ausgewiesener Kernnachweis bei bestandenem Kandidaten ausgelassen werden kann; sie ersetzen keine unabhängige Prüfung der Aufgabenqualität.

Dieser Kandidat darf erst nach gesonderter Prüfung in passende autoritative Zielprojektionen aufgenommen werden. Er darf dort nicht zusätzlich zur unveränderten Ursprungsaufgabe oder zu einer anderen Variante derselben Familie verpflichtend werden. Tatsächliche Targetmitgliedschaft belegt keine offizielle Lehrplanzuordnung. Insbesondere bleiben die Schleswig-Holstein-Profile wegen offener Quellenzuordnungsfragen zur gesonderten Prüfung angehalten. Keine menschliche Freigabe, Erprobung, Host-Abnahme oder erreichte M7-Reife wird behauptet.
