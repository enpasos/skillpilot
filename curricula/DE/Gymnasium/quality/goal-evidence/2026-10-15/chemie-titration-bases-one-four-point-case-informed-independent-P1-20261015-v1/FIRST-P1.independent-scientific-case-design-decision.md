# FIRST-P1: unabhängige Designprüfung des einen Basen-Vierpunktfalls

**Der einzelne zusätzliche Fall ist für den begrenzten rechnerischen Basenauftrag fachlich geeignet.** Die eigenen Stoff-/Ladungsbilanzrechnungen bestätigen sämtliche vier verlangten Punkte für starke und schwache Base und die begründete Indikatorübertragung. Für diesen begrenzten Fall besteht kein fachlicher Rechenblocker. Die pauschale Materialformulierung zu „Salzeffekten“ sollte präzisiert werden; im ganzen Fall ist die notwendige NH4+-Protolyse durch Auftrag und Modell ausdrücklich enthalten.

Geprüft wurde ausschließlich der Autorenselector mit SHA-256 `9d02f218bfc72ee4c6b21bba50d6e6410c46d7070fa0df91df4dc2e15048f9e1`, der ganze unintegrierte28c90-Zielkörper und der vollständige bilinguale Fall `strong-and-weak-bases-four-characteristic-points`, Datei-SHA-256 `29667425cdfd532d6606ef96a2be22e94958990f90dd04f4ee34297e1f611e95`. Die Autor-Rechenreferenz wurde gelesen, aber nicht als unabhängiger Beweis oder Freigabe übernommen. Die nachstehenden Ergebnisse stammen aus einer eigenen Herleitung und Berechnung in der Hydroxidvariablen.

Dies ist eine echte begrenzte P1-Designentscheidung, keine D-Rolle und keine Annahme des ganzen Kurvenziels, des Mergekandidaten oder von M7. Die Vorgängeraussagen, dass deren ganze Profile und Routen HOLD sind, bleiben bestehen. Der Fall ist zusätzliches theoretisches Material, keine ausgeführte Labor- oder Lernendenleistung. Eine E1-/G1-Aufwertung des ganzen Profils wird nicht behauptet und kein normaler Reviewrecord erzeugt.

## Eigene Bilanz und eindeutiges Modell

Beide Proben enthalten formal `N=0,02500 L·0,100 mol/L=0,002500 mol` Base. Die Neutralisationsstöchiometrie ist jeweils1:1: bei NaOH reagieren OH− und H3O+, bei NH3 bildet NH3 mit H3O+ NH4+. Somit benötigen beide formal25,00 mL HCl. Unterschiedliche Basenstärke ändert das Anfangsgleichgewicht und die Kurvenform, nicht diese vorgegebene titrierbare Stoffmenge.

Für die schwache Base sei `y=[OH−]`, `C_T=N/V` die gesamte analytische Konzentration von NH3 und NH4+ sowie `C_Cl=n(HCl)/V`. Dann gelten im vorgegebenen idealen Modell:

```text
[NH4+] = C_T Kb/(Kb+y)
[NH3]  = C_T y/(Kb+y)
[H3O+] = Kw/y
y - Kw/y - C_T Kb/(Kb+y) + C_Cl = 0
```

Die letzte Gleichung ist die Ladungsbilanz; die ersten beiden bewahren die Stickstoff-Stoffbilanz. Ihre linke Seite steigt für jedes positive y streng monoton, denn die Ableitung ist `1+Kw/y²+C_T Kb/(Kb+y)²>0`. Sie erlaubt eine eindeutige positive Lösung. Ich habe diese Gleichung selbst in log10(y) gelöst, anschließend die Stoff- und Ladungsreste kontrolliert. Die größte absolute Ladungsabweichung der ausgewiesenen Rechenpunkte liegt in der Größenordnung numerischer Rundung, unter `4·10^−17 mol/L`.

Für NaOH gilt mit `d=(N−n(HCl))/V` unmittelbar `y²−d·y−Kw=0`. Die positive, numerisch stabile Wurzel wurde separat verwendet. Dieses Modell enthält Na+ und Cl− als Zuschauerionen sowie die Wasserautoprotolyse. Es ist unabhängig von einer unkritischen Gleichsetzung „Formelüberschuss = exakt freie Ionenmenge“.

## Die vier Punkte für beide Basen

Eigene vollständige ideale Gleichgewichtswerte:

| HCl-Zugabe | Gesamtvolumen | NaOH-pH | NH3-pH |
|---|---|---|---|
| 0,00 mL | 25,00 mL | 13,000000 | 11,122104 |
| 12,50 mL | 37,50 mL | 12,522879 | 9,249537 |
| 25,00 mL | 50,00 mL | 7,000000 | 5,275461 |
| 30,00 mL | 55,00 mL | 2,041393 | 2,041393 |

Am Anfang ergibt NH3 mit `Kb=10^−4,75=1,7782794·10^−5` etwa `0,0013246597 mol/L` NH4+ und nahezu gleich viel OH−. Der Umsatz beträgt1,32466 % der formalen Basenkonzentration. Die übliche Wurzelnäherung liefert pH11,125; die genaue Rechnung11,122104. Die Modellantwort unterscheidet deshalb zu Recht den gerundeten vollständigen Wert11,12 von ungefähr11,13 aus der Näherung. Die geforderte Begründung des kleinen Umsatzes ist sinnvoll.

Bei NaOH verbleiben nach12,50 mL formal1,250 mmol OH− in37,50 mL. Es gibt kein schwaches konjugiertes Puffersystem und keinen aus diesem Halbpunkt ableitbaren pKa. Bei NH3 liegen dagegen formal gleiche NH3-/NH4+-Mengen vor. Aus `Ka=Kw/Kb=5,6234133·10^−10` folgt pKa9,25. Die vollständige Ladungsbilanz liefert am Halbpunkt9,249537, also eine Abweichung unter0,0005 zur erlaubten Näherung. Die tatsächlichen Partnerkonzentrationen sind dabei nicht exakt gleich: ungefähr0,03331557 mol/L NH3 und0,03335110 mol/L NH4+. Diese kleine Differenz begrenzt die Aussage „gleiche Mengen“ korrekt auf die vorgeschaltete formale Bilanz.

Am NH3-Äquivalenzpunkt ist `C_T=0,05000 mol/L`. Die schwache Säure NH4+ protolysiert; die Wurzelnäherung ergibt etwa `5,3026·10^−6 mol/L` H3O+ und pH5,28. Die vollständige Rechnung mit Wasser liefert pH5,275461. Der NH4+-Umsatz ist nur ungefähr0,0106 %, die Näherung ist hier tragfähig. Bei NaOH/HCl bleiben dagegen im idealen25-°C-Modell nur die neutralen Zuschauerionen, und Wasser gibt pH7 vor. Der Fall erklärt ausdrücklich, dass diese Neutralzahl weder für NH3 noch unabhängig von Temperatur gilt.

Bei30,00 mL beträgt der formale HCl-Überschuss0,500 mmol in55,00 mL. Die Überschussnäherung ergibt `[H3O+]≈0,0090909 mol/L` und pH2,04. Für NH3 liefert die vollständige Rechnung pH2,041392551, für NaOH2,041392685. Die verbleibende NH4+-Protolyse ändert das Ergebnis hier also nur um etwa `1,34·10^−7` pH-Einheiten. Die englische und deutsche Modellantwort behandeln den Überschuss ausdrücklich als begründete Näherung und nicht als universelle exakte Identität. Das ist richtig.

Alle acht geforderten Werte liegen weit innerhalb der angegebenen ungefähren0,02-pH-Toleranz, sofern die regionalen Modelle und ihre Annahmen begründet sind. Die Rubrik verlangt ausdrücklich die eigenen Rechnungen samt Gesamtvolumen, Kw/Kb-Beziehung, Partnerverhältnis und Salzprotolyse. Ein bloßes Wiederholen vorgedruckter Werte würde diese Kriterien nicht erfüllen.

## Unabhängige Indikatorübertragung

Die Aussage zur Indikatorwahl ist ebenfalls rechnerisch gestützt. Ich habe zusätzlich bei gegebenem pH das erforderliche Volumen direkt aus der Ladungsbilanz bestimmt. Mit `q=[H3O+]−[OH−]` und `f=[H3O+]/(Ka+[H3O+])` gilt für NH3:

```text
V(HCl) = (q·V0 + N·f)/(c(HCl)−q)
```

Hier bezeichnet V(HCl) das zugegebene Volumen in Litern. Diese Umkehrung verwendet beide Bilanzen und benötigt keine frei gezeichnete Zwischenkurve.

Für NH3 erreicht das Modell pH8,2 bei22,95345 mL. Der untere Phenolphthaleinbereich endet damit noch ungefähr2,04655 mL vor dem formalen Äquivalenzverbrauch; würde dieses Volumen als Äquivalenz eingesetzt, ergäbe sich eine Unterschätzung um etwa8,19 %. Das sind Modellwerte am angegebenen Intervallrand, keine gemessenen Umschlagsvolumina. Die tatsächliche Farbschwelle ist nicht spezifiziert; der qualitative Fehlermechanismus und seine Richtung stehen jedoch fest. Der obere Rand pH10 liegt sogar bereits bei ungefähr3,74574 mL. Die Wendung „kann deutlich zu früh anzeigen“ ist damit gerechtfertigt.

Die eigenen Zwischenwerte betragen für NH3 pH6,853950 bei24,90 mL und3,699532 bei25,10 mL. Methylrot4,4–6,2 liegt im steilen Äquivalenzbereich. Genauer entsprechen seine Grenzen im idealen Modell ungefähr24,97805 und25,01956 mL. Das stützt Methylrot als passenden Kandidaten unter den angebotenen Intervallen; es ersetzt weder eine festgelegte experimentelle Farbschwelle noch eine geforderte Messunsicherheit.

Für NaOH liegen die BTB-Grenzen pH7,6 und6,0 bei ungefähr24,99981 bzw.25,00050 mL. Die Auswahl um den neutralen Äquivalenzbereich ist sinnvoll. Der Fall verallgemeinert diesen Befund nicht zur Regel, jede starke Titrantlösung müsse pH7 erzeugen oder jeder Indikator sei universell geeignet.

## Material- und Nachweisgrenzen

DE und EN enthalten denselben fachlichen Auftrag. Die regionale Modellwahl kommt vor dem Rechnen, der Säureüberschuss nach der NH4+-Pufferregion wird ausdrücklich unterschieden, und die Indikatorübertragung fordert einen Bilanzbeleg statt bloßem Vergleich mit7. Das ist eine echte neue beobachtbare Designanforderung für die bisher fehlende Basen-Vierpunktrechnung. Der zusätzliche Fall kann diese begrenzte Designlücke adressieren; eine vollständige spätere Profil-/Fallbindung ist damit noch nicht vorgenommen.

Eine kleine Präzisierung ist empfehlenswert: Die Materialannahme „keine Salz-, CO2- oder weiteren Protolyseeffekte“ beziehungsweise „no salt, CO2 or additional protolysis effects“ sollte ausdrücklich **zusätzliche Fremdsalz-/Aktivitätseffekte** ausschließen und NH3/NH4+ sowie Wasser einschließen. NH4+-Protolyse ist ein wesentlicher Teil der verlangten Rechnung. Im vollständigen Fall schließen die konkrete Aufgabenstellung, der Ka-Auftrag und die Modellantwort diese Protolyse bereits zweifelsfrei ein. Daher ist dies eine nicht blockierende Wortlautklarstellung, kein verdeckter Rechenfehler. Kleinste Abhilfe sind die beiden entsprechenden Annahmensätze; keine neue Aufgabe oder chemische Operation ist nötig.

Die ausdrücklich schematische Zeichnung aus Modellpunkten ist ein zulässiges Darstellungsprodukt. Sie ist keine mit pH-Meter aufgenommene Säurekurve und keine experimentelle Halbpunktbestimmung. NI23 fordert die vier Punktarten für ausgewählte starke/schwache Säuren und Basen auf eA. Die selbst gelesene NI46 beschreibt zusätzlich die Rechnung und anschließende Skizze einer schwachen Base und grenzt Titrationskurven/Puffersysteme vom gA-Curriculum ab. Die source-/course-begrenzte Route des Falls passt hierzu. Diese Seiten tragen keine bundesweite GK-Freigabe und keine vollumfängliche Quellenunion.

Die bisherigen acht Fälle bleiben unverändert. Der neue eine Fall ist keine feste zusätzliche Abschlussquote: ausreichende selbstständige fachliche Evidenz kann mehrere Aspekte innerhalb einer zusammenhängenden Bearbeitung zeigen. Die Rubrik sagt dies ausdrücklich. Es wurde kein tatsächlicher Lernendenerfolg bewertet oder gespeichert und keine praktische Durchführung behauptet.

Alle übrigen HOLDs bleiben: pH-Meter-Erhebung, experimenteller Halbpunkt, die übrige konkrete Quellen-/Darstellungs-/Polyprotolyseroute, ganze Quellen-/Kurs-/Viewbindungen, schwache-Modell-Voraussetzung bzw. Sequenzierung und BW-HH-Memorysupport. Insbesondere bleibt die ganze Kurvenkompetenz mit bloßem c224-Vorgänger ungeklärt. Der geeignete Zusatzfall rechtfertigt weder diesen Vorgänger noch die Aktivierung eines ganzen Kandidaten. Kein M7-, Strictcount-, Human-Approval- oder Human-Trial-Nachweis entsteht.

Eigene fachliche Beurteilung und wissenschaftliche Modellwerte CC-BY-4.0; technische Bindungsbeschreibung Apache-2.0. Amtliche und sonstige Drittquellenrechte unverändert.
