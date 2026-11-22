# Hessische E.1-Prüfungen lokal ansehen

Die Vorschau öffnet E.1 und ihre vier deutsch-englischen Prüfungen im regulären Cockpit. Im persönlichen Curriculum ist Hessen, Sekundarstufe II und standardmäßig Physik-GK ausgewählt. Mit `--physics-course LK` richtet das Skript für G8 und G9 jeweils ein persönliches Physik-LK-Profil ein. Der Mathematikvergleich verwendet in beiden Fällen den Grundkurs. G8 und G9 erhalten je ein Zuschauerprofil ohne Belege, zwei Profile für unabhängige Erststarts und zwei Profile mit bewerteten Prüfungen im atomaren Lernplan. Dazu kommen vier Profile mit ausdrücklich gewählten Aufträgen je Bildungsgang. Je Bildungsgang zeigen zwei weitere Profile die Rückkehr nach einem oder zwei bestätigten Einstiegen. Ein weiteres Profil öffnet die große Mathematiktafel. Die 23 lokalen Profile liegen in einer H2-Datenbank im Arbeitsspeicher und verfallen beim Beenden. Das Startskript setzt für diese Instanz `skillpilot.completion.unit-assessment-pilot-enabled=true`.

Für die persönliche Teilabnahme mit den beiden neuen Einstiegen stehen ein Grundkurs auf Port 5253 und ein Leistungskurs auf Port 5255 bereit. Bereits benutzte Profile auf den früher gestarteten Vorschauen bleiben auf Port 5245 bzw. 5247 erreichbar. Der Start mit den Standardparametern verwendet Port 5177. Jeder Kurs hat für G8 und G9 eigene Profile. Auf der Einstiegsseite lassen sich der offene Auftrag, zwei bestandene Teile und der abgeschlossene Auftrag vergleichen. [Grundkurs](http://localhost:5253/auftraege/G9) · [Leistungskurs](http://localhost:5255/auftraege/G9)

## Den geführten Einstieg ansehen

Im Profil ohne Nachweise die Einheit „E.1 Bewegungen und ihre Beschreibung“ öffnen. Dort stehen das Bild an der Tischkante, die Leitfrage und die Themen der Einheit. Das Öffnen und Umschauen erzeugt keinen Zielerfolg. „Mit Lerncoach fortsetzen“ führt zum Motivationsziel. Nach einem kurzen Rückblick kann die Person das Abschlussangebot des Coachs annehmen. Wer die Untereinheit „Beschleunigte Bewegung und freier Fall“ gezielt öffnet, sieht dort den Ball neben einem Maßstab und die Verbindung zur Landefrage. Der direkte Vergleich funktioniert auch in einem frischen Browserfenster. [E.1 im G8-Grundkurs](http://localhost:5253/nativ/G8/E1) · [Untereinheit direkt im G8-Grundkurs](http://localhost:5253/nativ/G8/E1/freier-fall) · [E.1 im G9-Leistungskurs](http://localhost:5255/nativ/G9/E1) · [Untereinheit direkt im G9-Leistungskurs](http://localhost:5255/nativ/G9/E1/freier-fall)

Für den Vergleich stellt das Vorschauprogramm je Bildungsgang drei getrennte Profile bereit. `/nativ/G8/E1` zeigt den offenen Einstieg. In `/vergleich/G8/elterneinstieg` ist der E.1-Einstieg bestätigt und der Auftakt zum freien Fall noch offen. In `/vergleich/G8/einstiege` sind beide Einstiege bestätigt und die zugehörigen Übungen zugänglich. Für G9 entsprechend `G9` einsetzen. Die Bestätigungen stammen aus dem lokalen Coach-Handler mit simuliertem Lernendengespräch.

## Start aus einem frischen Checkout

Vorausgesetzt werden Python 3, Git, das in `.java-version` und `.corretto-version` festgelegte Amazon-Corretto-JDK sowie Node gemäß `.nvmrc`. `JAVA_HOME` zeigt auf die JDK-Installation. Eine vollständige Arbeitskopie des Vorschau-Branches enthält die Aufgaben, Landschaften, Quellen und Startskripte. Die Befehle laufen im Wurzelverzeichnis.

```sh
npm ci --prefix app
python3 scripts/preview_hessen_physics_e1.py
```

Der Gradle-Wrapper übersetzt die Backendklassen aus diesem Checkout. Gradle und npm laden beim ersten Start gegebenenfalls ihre Abhängigkeiten. Die lokale API und Vite lauschen auf den Loopback-Ports 8084 und 5177. Auf der Konsole erscheinen die Einstiege, sobald beide Dienste bereit sind.

| Lehrplan | Einheit | Wagen | Waagerechter Wurf | Senkrechter Wurf | Beschleunigungsprotokoll |
| --- | --- | --- | --- | --- | --- |
| Hessen G8 · GK | [E.1](http://localhost:5177/nativ/G8/E1) | [A](http://localhost:5177/nativ/G8/A) | [B](http://localhost:5177/nativ/G8/B) | [C](http://localhost:5177/nativ/G8/C) | [D](http://localhost:5177/nativ/G8/D) |
| Hessen G9 · GK | [E.1](http://localhost:5177/nativ/G9/E1) | [A](http://localhost:5177/nativ/G9/A) | [B](http://localhost:5177/nativ/G9/B) | [C](http://localhost:5177/nativ/G9/C) | [D](http://localhost:5177/nativ/G9/D) |

Für Englisch `?lang=en` anhängen. Die lokale API akzeptiert Zugriffe von `localhost` und `127.0.0.1` auf dem gewählten Vorschauport, auch für den direkten Prüfungsstart. Der Einstiegslink wählt das lokale Profil und öffnet das Ziel im Cockpit. Für die Ballfrage beim Link **E.1** die **Lernkarte** öffnen und beim Eintrag „E.1 Bewegungen und ihre Beschreibung“ den Pfeil **Einheit öffnen** wählen. Vom Link **A** oder **B** aus öffnet sich die Lernkarte direkt bei den Prüfungszielen der Einheit. Die Aufgaben nennen die erreichbaren Punkte und ihre Bestehensgrenzen. Wagen A ist ab 14 von 17, Kugel B ab 15 von 18 Punkten bestanden. Die vier Pflichtteile des E.1-Auftrags sind A, B und die beiden Prüfungen C und D der Kindeinheit. Die weitere Aufgabe zum waagerechten Wurf lässt sich freiwillig starten und erhält einen eigenen Nachweis. Der senkrechte Wurf und das Beschleunigungsprotokoll sind jeweils ab 17 von 20 Punkten bestanden. Vor dem ersten Versuch zeigt der Nachweis 0 von 4 bestandenen Teilen. Er lässt sich öffnen und zeigt alle vier Aufgaben sowie die elf einzeln noch nachzuweisenden Inhaltsziele.

Für einen manuellen Erststart öffnet man z. B. `/testlauf/G8/A` und wählt **Prüfung direkt versuchen**. Dieser Pfad verwendet ein eigenes Versuchsprofil. Die lokale API kann die Übergabe zum gewählten Coach starten. Der automatisierte Browsercheck fängt die anschließende externe Navigation ab. Nach Änderungen an den ausgecheckten Aufgaben den Prozess mit Strg+C beenden und neu starten, damit das Backend die neue Katalogfassung lädt.

Die Zuschauerprofile beginnen ohne Prüfungsbelege. Nach Abschluss des jeweiligen Motivationsziels führen die drei Übungen vom Spielzeugzug über den Bremsweg zur Bodenmarke beim Wurf. **Lernkarten zu E.1 üben** öffnet die neun passenden Karten. Bei der fachlichen Durchsicht lässt sich so vom Einstiegsproblem über eine Übung bis zur Prüfung verfolgen, welche eigenständige Vorhersage die Person jeweils leisten soll.

## Welche Leistungen deckt E.1 ab?

Das hessische Kerncurriculum nennt E.1 als verbindliches Themenfeld der Einführungsphase. Die folgende Tabelle führt die 13 Haupt- und Unterpunkte auf Seite 30 zu den zugeordneten Lernzielen in SkillPilot. Bei den Punkten 5, 6, 7, 8 und 13 weist der fachliche Abgleich Teilzuordnungen aus. Die Zuordnung bezeichnet den Ort einer Kompetenz im Lehrplan. Ob ein Lernender sie gezeigt hat, ergibt sich aus seinem jeweiligen Nachweis. [Kerncurriculum Physik 2024, S. 30](https://github.com/enpasos/skillpilot/blob/98b61309acc16c32a00f1bf05151163c2f2ef617/curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf#page=30) · [Extrahierte Quellenstellen](https://github.com/enpasos/skillpilot/blob/98b61309acc16c32a00f1bf05151163c2f2ef617/curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json) · [Einzelzuordnungen zu den Lernzielen](https://github.com/enpasos/skillpilot/blob/98b61309acc16c32a00f1bf05151163c2f2ef617/curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json)

| Punkte auf S. 30 in Quellenreihenfolge | Physikalische Leistung | Zugeordnete Lernziele |
| --- | --- | --- |
| 1–2 | Bewegungen anhand von Orts-, Geschwindigkeits- und Beschleunigungsdiagrammen über der Zeit untersuchen | Bewegungen mit Diagrammen untersuchen |
| 3–5 | Gleichförmige Bewegung beschreiben, Geschwindigkeit definieren und ihren Betrag selbst messen | Gleichförmige Bewegung und Geschwindigkeit. Zum Versuch gehört auch die Zuordnung zu „Bewegungen mit Videoanalyse untersuchen“. |
| 6–8 | Bei gleichmäßiger Beschleunigung aus der Ruhe und mit Anfangsort null den Bewegungsverlauf erklären, Beschleunigung definieren, Durchschnitts- und Momentangeschwindigkeit vergleichen | Gleichmäßig beschleunigte Bewegung und Beschleunigung · Durchschnitts- und Momentangeschwindigkeit unterscheiden |
| 9 | Beim freien Fall eigene Daten erheben, grafisch auswerten, die Fallbeschleunigung bestimmen, eine Abweichung vom Literaturwert diskutieren und das Zeit-Ort-Gesetz aus dem Modell gewinnen | Freier Fall experimentell untersuchen |
| 10–12 | Begründen, wann ein Körper als Massepunkt behandelt und Reibung vernachlässigt werden kann | Modellierung und Idealisierung von Bewegungen |
| 13 | Orts- und Geschwindigkeitsgesetze aus Diagrammen gewinnen und ihren Zusammenhang erklären | Bewegungen mit Diagrammen untersuchen · Gleichförmige Bewegung und Geschwindigkeit · Gleichmäßig beschleunigte Bewegung und Beschleunigung |

Der Einheitenauftrag A–D verbindet Modellwahl, Rechnung, Vorhersage und Begründung. Aufgabe B verwendet den waagerechten Wurf als Anwendung. Ihr Bezug zu E.1 ist der freie Fall aus der Ruhe in vertikaler Richtung. Der waagerechte Wurf ist im Kerncurriculum eigens in E.3 verortet. Die eigene Geschwindigkeitsmessung und die Datenerhebung zum freien Fall bleiben auch bei 4/4 individuell offen, solange dafür kein eigener Nachweis vorliegt. In den vorbereiteten Abschlussprofilen lässt sich das an „Freier Fall experimentell untersuchen“ nachvollziehen. [Fachentscheid zur Zuordnung von A und B](https://github.com/enpasos/skillpilot/blob/98b61309acc16c32a00f1bf05151163c2f2ef617/curricula/DE/Gymnasium/quality/release-model/physics-he-e1-assessment-placement-review-2026-11-20.md) · [Fachentscheid zu C und D](https://github.com/enpasos/skillpilot/blob/98b61309acc16c32a00f1bf05151163c2f2ef617/curricula/DE/Gymnasium/quality/learning-units/physics-constant-acceleration-2026-11-20-v3.md) · [Abschlussprofil G8](http://localhost:5177/auftraege/G8/ABCD) · [Abschlussprofil G9](http://localhost:5177/auftraege/G9/ABCD)

## Zwei eigene Versuche

Die vorbereiteten Profile beginnen mit vier bestandenen Teilen. Im Cockpit den **Lernplan** öffnen und unter **Freiwillig weiterlernen** eines der beiden Fachziele wählen. Auf der Zielkarte **Üben** wählen. Ein noch offener Einstieg führt zunächst zum Motivationsziel der gewählten Einheit. Nach dessen Bestätigung den Versuch öffnen. Derselbe Versuch steht auch am Lernziel auf der grafischen Karte.

| Bildungsgang | Grundkurs | Leistungskurs |
| --- | --- | --- |
| G8 | [G8 im GK](http://localhost:5253/auftraege/G8/ABCD) | [G8 im LK](http://localhost:5255/auftraege/G8/ABCD) |
| G9 | [G9 im GK](http://localhost:5253/auftraege/G9/ABCD) | [G9 im LK](http://localhost:5255/auftraege/G9/ABCD) |

- **Gleichförmige Bewegung und Geschwindigkeit.** Bei „Wie schnell bewegt sich dein Wagen?“ selbst messen, aus dem Zeit-Ort-Diagramm die Geschwindigkeit bestimmen und die Vorhersage mit der Messung an einer weiteren Marke vergleichen.
- **Freier Fall experimentell untersuchen.** Bei „Wie groß ist die Fallbeschleunigung in deinem Versuch?“ eine eigene Aufnahme oder Sensormessung auswerten. Zu den Ergebnissen gehören ein Diagramm, die experimentell bestimmte Fallbeschleunigung, das zu den Achsen passende Zeit-Ort-Gesetz und der Vergleich mit 9,81 m/s². Der Kartenpfad führt über **Beschleunigte Bewegung und freier Fall**.

Die beiden Versuche gehören auch bei ausgeschaltetem Einheitenpiloten zum Übungsmaterial der Fachziele. Je vier Kriterien zeigen, welche Messdaten, Auswertungen und Begründungen zählen. Der Coach beurteilt die vorgelegte Leistung im Lerngespräch. Sein positives Urteil über das einzelne Lernziel führt zum grünen Häkchen. Das Öffnen des Versuchs lässt den Einzelstand und die bereits erworbenen vier Prüfungsbelege bestehen. [Unabhängiges Fachreview mit vier gerechneten Beispielfällen](https://github.com/enpasos/skillpilot/blob/289a53e091619013e0261a47669eb54b1250c1fd/curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-individual-experiments-2026-11-21/fachreview.md)

## Bestehensbelege, Lernplan und Lernfront vergleichen

| Bildungsgang | Vergleich der drei Ausgangszustände | C und D bestanden | A, B, C und D bestanden |
| --- | --- | --- | --- |
| G8 | [Lernplan und Lernfront](http://localhost:5177/vergleich/G8) | [Cockpit mit zwei Belegen](http://localhost:5177/vergleich/G8/CD) | [Cockpit mit vier Belegen](http://localhost:5177/vergleich/G8/ABCD) |
| G9 | [Lernplan und Lernfront](http://localhost:5177/vergleich/G9) | [Cockpit mit zwei Belegen](http://localhost:5177/vergleich/G9/CD) | [Cockpit mit vier Belegen](http://localhost:5177/vergleich/G9/ABCD) |

Diese drei Profile je Bildungsgang haben denselben Einzelzielplan. Im gespeicherten Block ist E.1 als Abschnitt gewählt. Der neu angelegte Plan umfasst 18 Einzelpositionen einschließlich der beiden Motivationsziele. Bereits gespeicherte Einzelpläne behalten ihre ursprünglichen Positionen. Die freiwillige Zusatzprüfung kommt bei ausdrücklicher Einzelwahl hinzu. Dafür startet das Vorschauprogramm die regulären Prüfungssitzungen, fordert die fassungsgebundene Bewertung an und reicht synthetische Punkte beim Claude-MCP-Handler ein. A erhält 14/17, B 15/18, C und D je 17/20 Punkte. Die Identität des Coaches wird lokal simuliert. Spring bewertet und speichert die Belege auf dem regulären Weg. Es gibt weder Lernendenabgaben noch eine Bewertung durch ein externes Claude-Konto.

| Prüfungsstand | Erledigte Positionen im Plan | Angerechnete Fachziele | Einzeln offene Fachziele |
| --- | --- | --- | --- |
| 0 von 4 | 0 von 18 | 0 | 11 |
| C und D | 4 von 18 | 2 | 11 |
| Alle vier | 6 von 18 | 2 | 11 |

Im vollständigen Fall entstehen sechs Planpositionen aus vier belegten Prüfungen und zwei daraus angerechneten Fachzielen. In G8 und G9 führen Lernplan und Lernfront aller drei Profile zunächst zu „Bewegungen entdecken: vom Tisch bis zum Boden“. Die vier Prüfungsbelege erfüllen den ausdrücklichen Einheitenauftrag. Sie lassen die beiden Motivationsziele im einzeln gewählten Lernweg offen.

Die Vergleichsseite zeigt zusätzlich eine gezielte Abfrage für Newtons erstes Axiom, dessen Anwendung und „Harmonische Schwingung verstehen“. Bei ausdrücklich auf das jeweilige Ziel verengtem Fokus bietet der Standardmodus jedes dieser Ziele bereits ohne Prüfungsbeleg an. Im strikten Modus bleibt jedes der drei Ziele in allen Vergleichszuständen gesperrt. Die Vorschau stellt danach die ursprüngliche Präferenz wieder her. Die Vergleichsseite hält den Stand beim Start fest. In den verlinkten Cockpits kann man weiterlernen.

### Grundkurs- und Leistungskursprofil vergleichen

Das hessische Kerncurriculum führt E.1 als gemeinsames Themenfeld der Einführungsphase. Die fachspezifischen Anforderungen der Grund- und Leistungskurse differenziert es für die Qualifikationsphase. Deshalb gilt für den E.1-Auftrag im technischen GK- und LK-Profil dieselbe Aufgaben- und Rasterfassung für A–D. Beide Profile bieten die zusätzliche Wurfprüfung an. Im LK gibt es außerdem „Mehrphasenbewegung und Modellprüfung“ als freiwillige Vertiefung. Wer E.1 als Abschnitt im Einzelzielplan wählt, plant die Fachziele und die vier Pflichtprüfungen A–D ein. Eine ausdrücklich einzeln beauftragte Zusatzprüfung zählt als weitere Planposition. [Hessisches Kerncurriculum Physik 2024, S. 25–26 und 30](https://github.com/enpasos/skillpilot/blob/d5c45c3830b374500fbfffb35e52dcc3797ccb55/curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf#page=25)

Auf dem Abnahmerechner zeigen die gesonderten LK-Profile dieselben vier Auftragszustände wie im GK. Für die freiwillige Mehrphasenprüfung das Profil **Einheitenauftrag mit C und D** öffnen. Im E.1-Baum **Mehrphasenbewegung und Modellprüfung** auswählen. Auf der Zielkarte führt **Prüfung direkt versuchen** zum Prüfungsstart. Im Einheitenauftrag sind zu diesem Zeitpunkt A und B offen. [LK mit C und D in G8](http://localhost:5255/auftraege/G8/CD) · [LK mit C und D in G9](http://localhost:5255/auftraege/G9/CD)

Im Vergleichsprofil mit bereits geöffnetem E.1-Prüfungsabschnitt führt ein zweiter Weg über **Freiwillige Zusatzprüfungen**. Neben der Mehrphasenaufgabe **Prüfung direkt versuchen** wählen. In der Vorschau mit Grundkursprofil steht an dieser Stelle die zusätzliche Wurfprüfung. [E.1-Prüfungsabschnitt im G8-LK](http://localhost:5255/vergleich/G8/CD) · [E.1-Prüfungsabschnitt im G9-LK](http://localhost:5255/vergleich/G9/CD)

Für einen eigenen parallelen LK-Vergleich zwei freie Ports wählen.

```sh
python3 scripts/preview_hessen_physics_e1.py --physics-course LK --ui-port 5201 --api-port 8211
```

### Einheitenauftrag und Häkchen auf der Lernkarte

Die vier weiteren Profile je Bildungsgang zeigen einen ausdrücklich gewählten Einheitenauftrag. Im offenen Profil steht die Wahl des ersten Prüfungsteils an. Im Profil mit C und D fehlen A und B. Mit allen vier Erfolgen ist der Auftrag erfüllt. Das gemischte Profil enthält zusätzlich einen eigenen Auftrag zu den Weg-Zeit-Diagrammen. Dieser bleibt nach dem Einheitenabschluss offen. [Aufträge in G8](http://localhost:5177/auftraege/G8) · [Aufträge in G9](http://localhost:5177/auftraege/G9)

Im Cockpit mit vier bestandenen Prüfungen die Lernkarte öffnen. Ein grünes Häkchen bezeichnet den eigenen Nachweis an genau diesem Ziel. A, B und C tragen dieses Häkchen auf der E.1-Tafel. D liegt in der Untereinheit „Beschleunigte Bewegung und freier Fall“. Dasselbe Häkchen in Grau zeigt die fachlich belegte Anrechnung für die Planung. C und D decken gemeinsam „Modellierung und Idealisierung von Bewegungen“ und „Gleichmäßig beschleunigte Bewegung und Beschleunigung“ ab. Wer eines dieser Fachziele anschließend selbst nachweist, sieht dort das grüne Häkchen. Bei den übrigen Fachzielen entsteht durch den Abschluss kein Häkchen. Weitere Prüfungen auf der Tafel, etwa „Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit“, bleiben freiwillig und haben ihren eigenen Nachweis. [Vier Belege in G8](http://localhost:5177/auftraege/G8/ABCD) · [Vier Belege in G9](http://localhost:5177/auftraege/G9/ABCD)

### Einen gespeicherten Auftrag pausieren

Im Cockpit den **Lernplan** öffnen. Unter **Gespeicherte Einheitenaufträge verwalten** beim E.1-Auftrag **Einheitenauftrag pausieren** wählen. Die Pause löst die Bindung an diesen Auftrag. Physik bleibt im Coach wählbar. Ein gewöhnliches „weiter“ kann im gewählten Fach auch zu einer benötigten mathematischen Grundlage führen. Ein eigenständiger Fachwechsel zu Mathematik setzt voraus, dass Mathematik im persönlichen Curriculum gewählt wurde. Bei zwei bestandenen Teilen bleiben C und D erhalten. Bei vier bestandenen Teilen bleiben alle elf freiwilligen Einzelwege erreichbar. Im gemischten Profil bleibt der gesondert gewählte Auftrag zu den Weg-Zeit-Diagrammen fällig. **Einheitenauftrag wieder aktivieren** nimmt denselben E.1-Auftrag mit seinen Belegen wieder auf. Auch nach einer Abwahl von Physik ist der gespeicherte Auftrag im Lernplan pausierbar. Zur Reaktivierung muss seine Fassung im persönlichen Curriculum wieder verfügbar sein. [G8 mit vier Belegen](http://localhost:5253/auftraege/G8/ABCD) · [G9 mit vier Belegen](http://localhost:5253/auftraege/G9/ABCD)

### Einen Prüfungsversuch vor der Abgabe verlassen

1. Das Cockpit mit den beiden bestandenen Teilen öffnen. Unter **Einheitenprüfung · 2 von 4 Teilen bestanden** bei „Wann überquert der Wagen die rote Linie?“ (A) **Direkt versuchen** wählen. Falls auf der Startseite **Weiter zu Schritt 2: Curriculum wählen** erscheint, diesen Schritt öffnen. Dann **Schritt 2: Mit Claude starten** anklicken. [G8 mit C und D](http://localhost:5177/auftraege/G8/CD) · [G9 mit C und D](http://localhost:5177/auftraege/G9/CD)
2. Vor der Abgabe denselben Cockpit-Link erneut öffnen. Bei der laufenden Prüfung **Zur normalen Lernansicht** wählen und mit **Prüfung beenden und wechseln** bestätigen.
3. Die **Einheitenprüfung** erneut aufklappen. A und B zeigen **Offen**, C und D jeweils **Beleg vorhanden**. Der Auftrag steht weiter bei zwei von vier bestandenen Teilen. Über **Für deinen Lernplan angerechnet (2)** lässt sich jetzt eines der beiden Fachziele zum freiwilligen Weiterlernen öffnen.

### Ein angerechnetes Fachziel freiwillig erarbeiten

Im Cockpit **C und D bestanden** die **Einheitenprüfung** und darin **Für deinen Lernplan angerechnet (2)** aufklappen. Der Titel **Gleichmäßig beschleunigte Bewegung und Beschleunigung** öffnet die Zielkarte. Unter **Offene Voraussetzungen** stehen die noch ausstehenden Grundlagen. Der beschriftete Startknopf merkt sich das gewählte Fachziel. Bei offenem Einstieg führt der Einzelweg zunächst zur Orientierung. Anschließend führt der Standardmodus zum Fachziel, der strikte Modus bei Bedarf zu einer noch offenen Voraussetzung. Im frischen Vergleichsprofil hat das Beschleunigungsziel 54 offene Voraussetzungen einschließlich ihrer Vorstufen. Fünf davon gehören zu den einzeln offenen E.1-Inhalten. Sie betreffen Durchschnitts- und Momentangeschwindigkeit, gleichförmige Bewegung, Bewegungsdiagramme, Messunsicherheiten und Fehlerarten. Unter den drei aktuell verfügbaren Grundlagen hat „Warum Mathematik? – Denken, Muster & Zukunft“ den kürzesten Weg zum Beschleunigungsziel (drei Voraussetzungsschritte). Die beiden anderen Angebote „Warum Physik? – Weltverständnis & Zukunft“ und „Warum Mathematik? – Entdecken, Muster & Alltag“ sind jeweils fünf Schritte entfernt. Keines der fünf E.1-Ziele ist hier bereits als nächster Schritt verfügbar. Das Cockpit zeigt nach dem Klick das aktive Ziel. Für einen eigenen Lernnachweis muss die Person das Ziel anschließend tatsächlich erarbeiten.

Nach A–D kann man im Claude-Coach zum Beispiel „Ich möchte den freien Fall selbst untersuchen“ wählen. Für jedes der elf individuell offenen Fachziele des gewählten, abgeschlossenen Auftrags kann der Coach nach Bestätigung des Abschlussvertrags die angebotene Einzelbearbeitung starten. In der Zielkarte steht dieselbe Wahl. Nach dem Einstieg beginnt im Standardmodus das gewählte Fachziel. Im strikten Modus kann zuerst eine offene Grundlage anstehen. Der Klick schreibt noch keinen eigenen Nachweis. Ein ausdrücklicher Wechsel zu einem anderen gewählten Fach ist auch bei einem offenen E.1-Auftrag möglich. Bei mehreren abgeschlossenen Aufträgen kann der Coach weitere Seiten mit Einzelwegen und Prüfungen aufrufen.

## Den Elternpfad in Baum und Karte prüfen

Im E.1-Cockpit den Abschnitt „E.1 Bewegungen und ihre Beschreibung“ aufklappen. „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ steht direkt darunter und trägt den Herkunftshinweis „Notwendige Grundlagen“. Die Wagenprüfung steht auf derselben Ebene. „Gleichmäßig beschleunigte Bewegung und Beschleunigung“ liegt eine Ebene tiefer unter „Beschleunigte Bewegung und freier Fall“. In der Lernkarte die gleichen Einheiten öffnen. Ein Klick auf das Weg-Zeit-Ziel führt in beiden Ansichten direkt zur Zielkarte. [E.1 in G8 öffnen](http://localhost:5177/nativ/G8/E1) · [E.1 in G9 öffnen](http://localhost:5177/nativ/G9/E1)

## Zwei Karten vergleichen

Vom Wurf (**B**) aus die **Lernkarte** öffnen. Bei 1024 × 650 und 1024 × 900 Pixeln stehen die Wagenprüfung A, die Wurfprüfung B und der Verweis auf C vollständig im Ausschnitt. Zoomleiste und interaktive Übersichtskarte stehen unter der Zeichenfläche. Die Ziele zum senkrechten und waagerechten Wurf lassen sich auch unten rechts ohne Überdeckung auswählen. Auf der Übersichtskarte kann man den Ausschnitt durch Verschieben oder mit dem Mausrad verändern. Der Titel der Wagenprüfung „Wann überquert der Wagen die rote Linie?“ lässt sich auf beiden Zeilen lesen. Das lässt sich auch im LK mit der zusätzlichen Mehrphasenprüfung kontrollieren. A anklicken, um die Wagenaufgabe zu lesen. Auf dem Smartphone in **In dieser Ebene suchen** „Wagen“ eingeben, den Treffer wählen und den zentrierten grafischen Knoten öffnen. **Diese Ebene einpassen** zeigt die gesamte Tafel. Die Zoomtasten, das Verschieben der Grafik und die Tastatur bleiben verfügbar. [Wurf in G8/GK](http://localhost:5253/nativ/G8/B) · [Wurf in G9/GK](http://localhost:5253/nativ/G9/B) · [Wurf in G8/LK](http://localhost:5255/nativ/G8/B) · [Wurf in G9/LK](http://localhost:5255/nativ/G9/B)

Der Mathematikvergleich öffnet „Intervalladditivität und Linearität von Integralen nutzen“ im hessischen G9-Grundkurs. **Lernkarte** zeigt dazu die Tafel „Q1.3 Vertiefung der Differenzial- und Integralrechnung“. Bei 1440 × 900 Pixeln startet sie mit 100 % und acht gerenderten Knoten. **Diese Ebene einpassen** zeigt bei 69 % alle 18 Knoten. So lassen sich Lesbarkeit und Gesamtübersicht auf derselben Tafel vergleichen. [Mathematik-Kartenvergleich öffnen](http://localhost:5253/vergleich/mathematik) · [Frühere Windows-Edge-Bilder zum Wechsel von der Wurf- zur Wagenaufgabe](http://localhost:5225/)

## Browserprüfung

```sh
cd app
npx playwright install chromium
cd ..
python3 scripts/preview_hessen_physics_e1.py --check
```

Auf einem neuen Linux-System installiert `npx playwright install --with-deps chromium` bei Bedarf auch die Systembibliotheken. Der Lauf prüft in G8 und G9 die deutschen und englischen Aufgabenstellungen einschließlich der Tabellen, den Kartenwechsel sowie vier reguläre Erststarts. Der Wechsel vom Wurf zum Wagen wird in beiden Bildungsgängen bei 761, 1024 und 1100 Pixeln Breite sowie bei 1024 × 650 Pixeln geprüft. Beide Bildungsgänge werden auch bei 390 Pixeln geprüft. Der Vergleich prüft die echten Punktebelege, die drei Planstände und die beobachteten Angebote im Standard- und im strikten Modus. In den vergänglichen Prüfprofilen startet er aus der Ergebnisübersicht einen freiwilligen Einzelweg und vergleicht die gespeicherten Lernstände vor und nach dem Start. Der Mathematikvergleich prüft den Einstieg und das manuelle Einpassen. Vor und nach dem Öffnen und Starten prüft der Test die Einzelzielwerte und die Beleglisten aller vier Einheitsteile. Lernendenabgaben und fachliche Bewertungen sind eigene Nachweise. Die unabhängigen Fachentscheide binden die geprüften Materialien für [Wagen und waagerechten Wurf](https://github.com/enpasos/skillpilot/blob/bea9d4329942a183424d2ff5615f10cdda7bdd8e/curricula/DE/Gymnasium/quality/release-model/physics-he-e1-partial-credit-review-2026-11-20.md) sowie für [senkrechten Wurf und Beschleunigungsprotokoll](../concept/skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/unabhaengiges-fachreview.md).

Die Vorschau verwendet nur die angegebenen Ports. Für einen unabhängigen zweiten Lauf während einer geöffneten Vorschau kann man die Ports 5187 und 8094 verwenden.

```sh
python3 scripts/preview_hessen_physics_e1.py --check --ui-port 5187 --api-port 8094
```
