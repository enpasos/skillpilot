# Wissenskontext: Fachprüfung der Pilotbefunde, 14. November 2026

Stand: 14. November 2026. Dieses Protokoll ist die Entscheidungsvorlage für den
nächsten Schritt nach dem
[Pilot zur Hinlänglichkeit](knowledge-context-sufficiency-pilot-2026-11-13.md):
die Fachprüfung der 15 Befunde, bei denen beide Pilotreviewer mit hoher
Sicherheit dasselbe gefunden haben. Es ändert kein Ziel, keine Kante und keinen
Text. Was umgesetzt wird, entscheidet der Product Owner.

## Vorgehen

1. **Neu berechnet auf dem aktuellen Katalog** (`main` bei `8ebcfbab67`, also
   nach `e95d6a0a64` und #141). Keiner der 13 Kantenkandidaten ist dort schon
   erfüllt, und keiner erzeugt einen Zyklus.
2. **Struktur im Speicher geprüft.** Die Kanten wurden gemeinsam in eine Kopie
   des Katalogs eingetragen und mit dem Prüfer der transitiven Minimalität über
   alle 21 kanonischen Wurzeln geprüft. Wo eine neue Kante eine vorhandene
   überflüssig macht, muss die vorhandene entfallen; diese Entfernungen sind
   mitgerechnet.
3. **Zwei unabhängige maschinelle Reviewer** (Claude Opus 5.5) haben jeden
   Kandidaten beurteilt, ohne erwartetes Ergebnis und ohne Kenntnis des
   anderen. Gefragt war: Braucht die Zielbeschreibung die Kompetenz wirklich?
   Ist das vorgeschlagene Ziel das passende, oder gibt es ein besseres? Zeigt
   die Kante auf dem Lernweg zurück, und zieht sie Ziele in Lernumfänge, in
   die sie nicht gehören? Für die beiden Ziele, die in späteren Stoff greifen,
   war die Abhilfe gefragt. Beide Reviewer haben dafür amtliche Quellen
   gelesen: das hessische Kerncurriculum Mathematik (S. 31–34), das hessische
   Kerncurriculum Physik (S. 30) und die Fachanforderungen Mathematik
   Schleswig-Holstein 2024 (S. 38 und 61).

Auftrag, Kandidaten, Strukturprüfung und beide Ergebnisse liegen in
[`curricula/DE/Gymnasium/quality/knowledge-context/2026-11-14-subject-review/`](https://github.com/enpasos/skillpilot/tree/main/curricula/DE/Gymnasium/quality/knowledge-context/2026-11-14-subject-review).

## Ergebnis

Bei 14 der 15 Kandidaten urteilen beide Reviewer gleich.

| Nr. | Ziel | Vorschlag | Urteil A | Urteil B |
| --- | --- | --- | --- | --- |
| 1 | Tangentengleichungen und Steigungswinkel bestimmen | benötigt „Geradengleichungen linearer Funktionen aufstellen“ (J8) | ergänzen, hoch | ergänzen, hoch |
| 2 | Tangentengleichungen und Steigungswinkel bestimmen | benötigt „Trigonometrie am rechtwinkligen Dreieck anwenden“ (J9) | ergänzen, hoch | ergänzen, hoch |
| 3 | Newton-Verfahren zur Nullstellennäherung anwenden | benötigt „Tangenten- und Normalengleichungen bestimmen“ (E) | ergänzen, hoch | ergänzen, hoch |
| 4 | Einfache Extremwertprobleme lösen | benötigt „Quadratische Funktionen in Anwendungen modellieren und lösen“ (J9) | ergänzen, mittel | ergänzen, mittel |
| 5 | Schnittwinkel zwischen Funktionsgraphen deuten | benötigt „Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen“ (E) | ergänzen, mittel | ergänzen, hoch |
| 6 | Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen | benötigt „Trigonometrie am rechtwinkligen Dreieck anwenden“ (J9) | ergänzen, hoch | ergänzen, hoch |
| 7 | Ableitungen elementarer Funktionen berechnen | benötigt „Faktor- und Summenregel beweisen und anwenden“ (E) | ergänzen, hoch | ergänzen, hoch |
| 8 | Ableitungen elementarer Funktionen berechnen | greift in späteren Stoff: Ableitungen von Exponentialfunktionen | Text enger fassen, hoch | Text enger fassen, hoch |
| 9 | Ganzrationale Funktionen aus Eigenschaften rekonstruieren | benötigt „Quadratische Funktionen aus Punkten oder Bedingungen bestimmen“ (J9) | ergänzen, mittel | ergänzen, mittel |
| 10 | Grenzwerte des Differenzenquotienten bestimmen | benötigt „Parameter linearer Funktionen deuten“ (E) | ergänzen, mittel | ergänzen, mittel |
| 11 | Ganzrationale Funktionen mit Differentialrechnung analysieren | benötigt „Digitale Werkzeuge zur Analyse von Funktionen nutzen“ (E) | ergänzen, hoch | ergänzen, hoch |
| 12 | Potenzregel für ganzzahlige Exponenten exemplarisch begründen | benötigt „Quadratische Terme mit binomischen Formeln umformen“ (J8) | ergänzen, mittel | ergänzen, mittel |
| 13 | Tangenten- und Normalengleichungen bestimmen | benötigt „Geradengleichungen linearer Funktionen aufstellen“ (J8) | ergänzen, hoch | ergänzen, hoch |
| 14 | Durchschnitts- und Momentangeschwindigkeit unterscheiden (Physik) | benötigt „Momentane Änderungsrate qualitativ verstehen“ (Mathematik E) | anderes Ziel: „Ableitungsbegriff aus mittleren und momentanen Änderungsraten entwickeln“ (J10), mittel | ergänzen, mittel |
| 15 | Bewegungen mit Diagrammen untersuchen (Physik) | greift in späteren Stoff: t-a-Diagramme vor der Beschleunigung | Text enger fassen, hoch | Text enger fassen, hoch |

Begründungen, Quellenstellen und Bedenken stehen in den Ergebnisdateien.

### Die beiden enger zu fassenden Texte

- **„Ableitungen elementarer Funktionen berechnen“**
  (`858113c5-e53b-57bb-b01f-ba95c3ddcb6f`): „Exponential-“ entfällt; die
  Potenzfunktionen werden auf ganzzahlige Exponenten beschränkt. Das Ziel zu
  Ableitungen von $e^x$ und $a^x$ setzt dieses Ziel transitiv voraus, eine
  umgekehrte Kante wäre also ein Zyklus. Das hessische Kerncurriculum führt in
  E.2 nur $x^n$ mit ganzzahligem $n$, Faktor- und Summenregel und ganzrationale
  Funktionen, die Ableitung von $e^x$ erst in E.4. Die Ableitung von $\sqrt{x}$
  kommt in Q2 und setzt dieses Ziel ebenfalls voraus. Das neue, noch nicht
  freigegebene Bild des Ziels zeigt nur ganzrationale Beispiele und passt auch
  zum engeren Text.
- **„Bewegungen mit Diagrammen untersuchen“**
  (`ce431132-dfc4-42c2-aff6-bd72035190f8`): „t-a-“ entfällt. Die
  Beschleunigung führt erst „Gleichmäßig beschleunigte Bewegung und
  Beschleunigung“ ein, das dieses Ziel transitiv voraussetzt. Jenes Ziel
  beschreibt t-a-Darstellungen bereits; das hessische Kerncurriculum Physik
  nennt beides im selben Themenfeld E.1, die Quelle bleibt also über beide
  Ziele abgedeckt. Ob das Bild t-a-Diagramme zeigt, ist bei der Umsetzung zu
  prüfen.

### Der strittige Kandidat

Für die Physik-Kante (Nr. 14) schlagen die Reviewer verschiedene
Mathematikziele vor, beide mit mittlerer Sicherheit:

| Ziel | Für | Gegen |
| --- | --- | --- |
| „Momentane Änderungsrate qualitativ verstehen“ (E) | Gleiche Phase wie die Physik-E.1; setzt die vorhandene Verbindung von Physik-E zur Mathematik-E fort; sichert dem Ziel nur zwei weitere Ziele. | Bindet Physik E.1 an den Zeitpunkt von Mathematik E.2 und zieht das Ziel zur h-Methode mit. |
| „Ableitungsbegriff aus mittleren und momentanen Änderungsraten entwickeln“ (J10) | Liegt früher. | Sichert dem Ziel 24 weitere Ziele der Klassen 5 bis 10, die auch die 322 darauf aufbauenden Physikziele erben, und macht neun vorhandene Kanten überflüssig, die dann entfallen müssten (nachgerechnet). |

Die Frage hängt an einer offenen Einordnung: In Baden-Württemberg und Bayern
stehen die Bewegungsziele in Abschnitten der Sekundarstufe I (Arbeitsplan,
Abschnitt 7). Dort passt keine der beiden Kanten.

## Was sich ändern würde

Mit den zwölf übereinstimmenden Kanten und den beiden Textänderungen ändern
sich 14 Ziele, zwölf in Mathematik und zwei in Physik:

- elf Ziele bekommen eine oder zwei Kanten;
- zwei Ziele verlieren eine Kante, die durch die neuen überflüssig wird:
  „Anzahl von Graph-Schnittpunkten anschaulich begründen“ und das Physikziel
  „Erhaltung der mechanischen Energie tiefer verstehen (LK)“. Bei diesem führt
  die neue Kette über die Kettenregel (LK) und die Potenzregel jetzt zu
  „Terme im Bereich rationaler Zahlen äquivalent umformen“, das es bisher
  direkt benötigte;
- zwei der elf verlieren außerdem eine direkte Voraussetzung, die über die
  neue Kante gesichert bleibt;
- zwei Ziele bekommen einen engeren Text.

Die Prüfung der transitiven Minimalität besteht danach in allen 21 Wurzeln.
Keine Entfernung verkleinert eine Menge gesicherter Ziele. Vier der 14 Ziele
haben eine Übertragung im eingefrorenen Reduktionsnachweis und verlieren sie.
Jedes geänderte Ziel braucht neue zielgebundene Reviews (Beschreibung, Profil,
Atomarität, Karten, Bild), wie in `e95d6a0a64` für drei Ziele. Ziele, deren
gesicherte Menge nur wächst, behalten ihre Urteile; das gilt für mehrere
hundert abhängige Ziele, deren Wissenskontext größer wird.

## Weitere Befunde beider Reviewer

- **Gleiche Ursache:** Die Einstiegsziele der Analysis in der
  Einführungsphase sichern nur das Rechnen der Klassen 5 bis 7. Die meisten
  Kanten flicken einzeln dieselbe Lücke zur Sekundarstufe I. Beide Reviewer
  erwarten bei einer systematischen Prüfung aller Einstiegsziele weitere
  Befunde dieser Art und halten sie für billiger als Einzelkanten.
- **Schon jetzt sichtbare weitere Lücken:**
  - Nullstelle einer linearen Funktion für das Newton-Verfahren (A);
  - Normalensteigung $-1/m$ für „Tangenten- und Normalengleichungen bestimmen“
    (beide);
  - Ableitungskriterium für Extremstellen bei „Einfache Extremwertprobleme
    lösen“ (beide);
  - Schnittpunkt zweier Graphen für den Schnittwinkel (A);
  - negative Exponenten bei der Potenzregel (beide).
- **Fast gleiche Ziele:** Im Tangentencluster überschneiden sich vier Ziele,
  und „Ableitungen elementarer Funktionen berechnen“ überschneidet sich mit
  „Ganzrationale Funktionen ableiten“. Deshalb brauchen die Kandidaten 1 und
  13 sowie 2 und 6 dieselbe Kante. Ein Zusammenführen wäre eine eigene
  Entscheidung über Ziele, keine Kantenfrage.
- **Abhängigkeiten:** Kandidat 5 erhält die Trigonometrie nur über Kandidat 6,
  und Kandidat 3 die Geradengleichung nur über Kandidat 13.
- **Umfang in Schleswig-Holstein:** Kandidat 9 zieht ein Ziel der Klasse 9 in
  den Lernumfang von Schleswig-Holstein, wo lineare Gleichungssysteme mit drei
  Unbekannten in die Oberstufe gehören. Beide Reviewer halten die Kante
  trotzdem für richtig, weil der Inhalt dort gebraucht wird; nur die
  Stufenangabe passt nicht.

## Empfehlung

1. **Die zwölf übereinstimmenden Kanten und die beiden Textänderungen
   übernehmen.** Ihre Herkunft wird als didaktische Modellierungsentscheidung
   mit Verweis auf dieses Protokoll festgehalten, nicht als Aussage einer
   amtlichen Quelle. Die Umsetzung braucht die vollständigen aktuellen Reviews
   der 14 Ziele und einen eigenen PR.
2. **Kandidat 14 zurückstellen,** bis die Einheit zur Beschreibung von
   Bewegungen (Stufe 5) die Stufenfrage für Baden-Württemberg und Bayern
   klärt.
3. **Danach die Einstiegsziele der Analysis systematisch prüfen,** statt
   weitere Einzelkanten zu sammeln: alle Ziele der Einführungsphase, deren
   gesicherte Menge keine Algebra der Sekundarstufe I enthält, mit derselben
   Methode. Die fünf weiteren Lücken oben gehören dazu.

## Grenzen

1. Maschinelle Reviews, keine menschliche Fachprüfung; beide Reviewer sind
   dasselbe Modell.
2. Gelesen wurden nur die hessischen Kerncurricula und die
   Fachanforderungen Mathematik von Schleswig-Holstein, keine weiteren Länder.
3. Geurteilt wurde über Titel und Beschreibungen, nicht über Aufgaben,
   Karten und Bilder.
4. Die Strukturprüfung ist eine Prüfung im Speicher, kein Meilensteinlauf;
   Reifegrade, Sichten und Bindungen zeigt erst der Umsetzungs-PR.
