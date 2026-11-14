# Wissenskontext: Pilot zur Hinlänglichkeit, 13. November 2026

Stand: 13. November 2026. Dieses Protokoll hält den zweiten Einführungsschritt
des [Wissenskontexts](../concept/skill-graph/knowledge-context.de.md) fest: das
Review, ob die Voraussetzungen eines Ziels ausreichen, an einem Pilotblock je
Fach. Es ändert kein Ziel, keine Kante und keinen Text. Die Befunde sind
Arbeitslisten für die Fachprüfung, keine entschiedenen Korrekturen.

## Gegenstand und Vorgehen

| Block | Cluster | Ziele |
| --- | --- | --- |
| Mathematik: Ableitungseinstieg und Differentialrechnung (Sek II) | `fa273adc-25c0-4ba7-90da-57e68c59390e` | 32 |
| Physik: E.1 Bewegungen und ihre Beschreibung | `65ddd780-0323-45d1-8f94-5e31bf28da23` | 7 |

Für jedes Ziel wurde der Wissenskontext in Vollform abgeleitet
(`npm --prefix app run knowledge-context -- --cluster <id> --full`, Katalog
von `main` nach #139). Je Block haben zwei maschinelle Reviewer (Claude Opus
5.5) unabhängig voneinander und ohne erwartetes Ergebnis dieselbe Frage
beantwortet:

> Kann jemand, der genau die gesicherten Ziele und Grundwissen besitzt, dieses
> Ziel so lernen, wie seine Beschreibung es verlangt?

Grundwissen ist Alltags- und Grundschulwissen; was ein Ziel des Katalogs
erarbeitet, zählt nicht dazu. Befunde sind eine fehlende Voraussetzung (ein
vorhandenes Ziel, das nicht gesichert ist), ein Griff in späteren Stoff oder
eine Lücke im Katalog. Auftrag und Ergebnisse liegen in
[`curricula/DE/Gymnasium/quality/knowledge-context/2026-11-13-sufficiency-pilot/`](https://github.com/enpasos/skillpilot/tree/main/curricula/DE/Gymnasium/quality/knowledge-context/2026-11-13-sufficiency-pilot).
Die Mathematik-Ergebnisse sind dort verdichtet: Urteile und Befunde sind
vollständig, die Anmerkungen gekürzt.

## Ergebnis

| Block | Beide: nicht hinlänglich | Beide: hinlänglich | Uneinig |
| --- | --- | --- | --- |
| Mathematik (32) | 16 | 11 | 5 |
| Physik (7) | 4 | 2 | 1 |

In 20 der 39 Ziele finden beide Reviewer unabhängig, dass die Voraussetzungen
nicht ausreichen. Für 17 dieser 20 Ziele nennen beide mindestens eine
identische fehlende Voraussetzung (gleiches vorhandenes Ziel); insgesamt sind
es 29 übereinstimmende Befunde, 15 davon beide mit hoher Sicherheit.

Die Uneinigkeit hat eine Ursache: Ein Reviewer meldet eine Lücke nur am ersten
Ziel, das sie braucht, und rechnet sie danach als vorhanden; der andere liest
strenger. In fünf der sechs uneinigen Fälle hat der strengere Reviewer seinen
Befund mit niedriger oder mittlerer Sicherheit versehen. Im sechsten („Faktor-
und Summenregel beweisen und anwenden“, Termumformungen) hat der andere
Reviewer dieselbe Lücke ein Ziel früher gemeldet, an der Potenzregel.

### Übereinstimmende Befunde mit hoher Sicherheit

| Ziel | Fehlt (vorhandenes Ziel) |
| --- | --- |
| Grenzwerte des Differenzenquotienten bestimmen | Parameter linearer Funktionen deuten |
| Potenzregel für ganzzahlige Exponenten exemplarisch begründen | Quadratische Terme mit binomischen Formeln umformen |
| Ableitungen elementarer Funktionen berechnen | Faktor- und Summenregel beweisen und anwenden |
| Ableitungen elementarer Funktionen berechnen | greift in späteren Stoff: Ableitungen von $e^x$ und $a^x$ verwenden |
| Tangentengleichungen und Steigungswinkel bestimmen | Geradengleichungen linearer Funktionen aufstellen; Trigonometrie am rechtwinkligen Dreieck anwenden |
| Tangenten- und Normalengleichungen bestimmen | Geradengleichungen linearer Funktionen aufstellen |
| Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen | Trigonometrie am rechtwinkligen Dreieck anwenden |
| Schnittwinkel zwischen Funktionsgraphen deuten | Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen |
| Newton-Verfahren zur Nullstellennäherung anwenden | Tangenten- und Normalengleichungen bestimmen |
| Einfache Extremwertprobleme lösen | Quadratische Funktionen in Anwendungen modellieren und lösen |
| Ganzrationale Funktionen aus Eigenschaften rekonstruieren | Quadratische Funktionen aus Punkten oder Bedingungen bestimmen |
| Ganzrationale Funktionen mit Differentialrechnung analysieren | Digitale Werkzeuge zur Analyse von Funktionen nutzen |
| Durchschnitts- und Momentangeschwindigkeit unterscheiden (Physik) | Momentane Änderungsrate qualitativ verstehen |
| Bewegungen mit Diagrammen untersuchen (Physik) | greift in späteren Stoff: Gleichmäßig beschleunigte Bewegung und Beschleunigung |

Die übrigen übereinstimmenden Befunde haben mittlere oder niedrige Sicherheit
und stehen in den Ergebnisdateien.

### Muster

- **Die Einstiegskette der Analysis sichert keine Algebra der Klassen 7 bis 9.**
  Von „Mittlere Änderungsrate berechnen und deuten“ bis „Ganzrationale
  Funktionen ableiten“ sind nur Funktionsbegriff, Funktionswerte und das
  Rechnen der Klassen 5 und 6 gesichert: keine linearen Funktionen, keine
  Terme mit Variablen, keine Potenzen, keine Gleichungen, keine
  Trigonometrie. Beide Reviewer sehen darin die Wurzel der meisten Befunde.
- **Parallele Ketten mit verschiedenen Voraussetzungen.** Die Ableitungsziele
  der Jahrgangsstufe 10 bauen auf den quadratischen Funktionen der Klasse 9
  auf; die inhaltsgleichen Ziele des Sek-II-Blocks nicht. Auch die vier
  Tangenten- und Steigungsziele des Blocks setzen Verschiedenes voraus.
- **Reihenfolge innerhalb einer Kette.** „Ableitungen elementarer Funktionen
  berechnen“ verlangt Ableitungen von Exponentialfunktionen, die erst später
  erarbeitet werden, und baut nicht auf den Zielen der Ableitungsregeln auf.
  In der Physik verlangt das Einstiegsziel t-a-Diagramme, bevor die
  Beschleunigung eingeführt ist. Das ist der Fehlertyp, den der Product Owner
  an Bildern beobachtet hat, eine Ebene tiefer: in der Zielbeschreibung.
- **Ziele, die kein gewöhnliches Ziel benötigt.** „Momentane Änderungsrate
  qualitativ verstehen“, „Lokale Differenzierbarkeit am Graphen beurteilen“
  und „Digitale Werkzeuge zur Analyse von Funktionen nutzen“ erarbeiten Stoff,
  den andere Ziele des Blocks benutzen. Vorausgesetzt werden sie nur von
  Übungsprüfungen.

## Bindung

Die Kontexte wurden auf dem Katalog vor `e95d6a0a64` abgeleitet. Dieser Commit
hat die Beschreibungen von drei Zielen des Mathematikblocks neu gefasst
(„Monotonie und Extremstellen mit der ersten Ableitung untersuchen“, „Krümmung
und Wendestellen mit der zweiten Ableitung untersuchen“, „Notwendige und
hinreichende Bedingungen für Extrem- und Wendestellen unterscheiden“) und beim
ersten die Voraussetzung von „Ableitungen elementarer Funktionen berechnen“ auf
„Ganzrationale Funktionen ableiten“ umgestellt. Auf dem neuen Stand ist für
alle drei weiterhin kein Ziel zu linearen oder quadratischen Gleichungen
gesichert; die Befunde zur Gleichungslehre gelten fort. Die übrigen Befunde zu
diesen drei Zielen sind gegen den neuen Text erneut zu prüfen.

## Was daraus folgt

- **Der Wissenskontext kann den Coach in diesen Blöcken noch nicht
  begrenzen.** Er würde verbieten, was Lernende an dieser Stelle tatsächlich
  können, etwa lineare Funktionen. Das bestätigt die Reihenfolge des Konzepts:
  erst hinlänglich machen, dann den Coach bedienen.
- **Ein Gate wäre verfrüht.** Die Hälfte der Ziele beider Pilotblöcke würde es
  heute verfehlen.
- **Die Kandidatenkanten brauchen eine Fachprüfung.** Mehrere Befunde nennen
  verschiedene Ziele für dieselbe Kompetenz, weil der Katalog Inhalte mehrfach
  führt (Klasse 9/10 und Einführungsphase). Eine Kante muss zur Quelle und zum
  Lernweg passen und die transitive Minimalität halten; zwei vorgeschlagene
  Kanten würden zusammen einen Zyklus bilden („Polynomgleichungen in
  Funktionsuntersuchungen lösen“ und „Monotonie und Extremstellen mit der
  ersten Ableitung untersuchen“).

## Empfehlung für den nächsten Schritt

Die 15 übereinstimmenden Befunde mit hoher Sicherheit als erste Fachprüfung
bearbeiten: je Befund entscheiden, ob eine Kante ergänzt wird (mit ehrlicher
Herkunft als didaktische Modellierungsentscheidung) oder ob ein Ziel anders
einzuordnen ist, dann den Wissenskontext neu ableiten und die betroffenen Ziele
erneut prüfen lassen. Jede neue Kante ändert ein Ziel und braucht nach dem
eingefrorenen Reduktionsnachweis ein neues Review dieses Ziels.

## Grenzen

1. Maschinelles Review, keine menschliche Fachprüfung.
2. Geurteilt wurde nur über Titel und Beschreibungen, ohne Aufgaben, Bilder und
   Quellen.
3. Die Abgrenzung von Grundwissen ist eine Ermessensfrage; beide Reviewer haben
   Alltagsvorstellungen von Geschwindigkeit, Reibung und Luftwiderstand
   unterschiedlich weit gelten lassen.
4. Zwei Blöcke sind keine Stichprobe des Katalogs. Die Analysis-Einstiegskette
   wurde gewählt, weil dort schon Befunde vorlagen.
