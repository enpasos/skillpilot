# Hessische E.1-Prüfungen lokal ansehen

Die Vorschau öffnet E.1 und ihre vier deutsch-englischen Prüfungen im regulären Cockpit. Im persönlichen Curriculum ist ausdrücklich Hessen, Sekundarstufe II, Physik (GK) ausgewählt. G8 und G9 erhalten je ein Zuschauerprofil ohne Belege, zwei Profile für unabhängige Erststarts und zwei Profile mit bewerteten Prüfungen im atomaren Lernplan. Dazu kommen vier Profile mit ausdrücklich gewählten Aufträgen je Bildungsgang. Ein weiteres Profil öffnet die große Mathematiktafel. Die 19 lokalen Profile liegen in einer H2-Datenbank im Arbeitsspeicher und verfallen beim Beenden. Das Startskript setzt für diese Instanz `skillpilot.completion.unit-assessment-pilot-enabled=true`.

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

Die Zuschauerprofile beginnen ohne Prüfungsbelege. In der Lernkarte führen die drei Übungen vom Spielzeugzug über den Bremsweg zur Bodenmarke beim Wurf. **Lernkarten zu E.1 üben** öffnet die neun passenden Karten. Bei der fachlichen Durchsicht lässt sich so vom Einstiegsproblem über eine Übung bis zur Prüfung verfolgen, welche eigenständige Vorhersage die Person jeweils leisten soll.

## Bestehensbelege, Lernplan und Lernfront vergleichen

| Bildungsgang | Vergleich der drei Ausgangszustände | C und D bestanden | A, B, C und D bestanden |
| --- | --- | --- | --- |
| G8 | [Lernplan und Lernfront](http://localhost:5177/vergleich/G8) | [Cockpit mit zwei Belegen](http://localhost:5177/vergleich/G8/CD) | [Cockpit mit vier Belegen](http://localhost:5177/vergleich/G8/ABCD) |
| G9 | [Lernplan und Lernfront](http://localhost:5177/vergleich/G9) | [Cockpit mit zwei Belegen](http://localhost:5177/vergleich/G9/CD) | [Cockpit mit vier Belegen](http://localhost:5177/vergleich/G9/ABCD) |

Diese drei Profile je Bildungsgang haben denselben Plan mit 17 einzeln ausgewählten Zielen. Dafür startet das Vorschauprogramm die regulären Prüfungssitzungen, fordert die fassungsgebundene Bewertung an und reicht synthetische Punkte beim Claude-MCP-Handler ein. A erhält 14/17, B 15/18, C und D je 17/20 Punkte. Die Identität des Coaches wird lokal simuliert. Spring bewertet und speichert die Belege auf dem regulären Weg. Es gibt weder Lernendenabgaben noch eine Bewertung durch ein externes Claude-Konto.

| Prüfungsstand | Erledigte Positionen im Plan | Angerechnete Fachziele | Einzeln offene Fachziele |
| --- | --- | --- | --- |
| 0 von 4 | 0 von 17 | 0 | 11 |
| C und D | 4 von 17 | 2 | 11 |
| Alle vier | 6 von 17 | 2 | 11 |

Im vollständigen Fall entstehen sechs Planpositionen aus vier belegten Prüfungen und zwei daraus angerechneten Fachzielen. In beiden Bildungsgängen empfiehlt der Plan in allen drei Zuständen weiterhin „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“. Die Lernfront im E.1-Fokus bietet außerdem „Messabweichungen und Fehlerarten unterscheiden“ und „Waagerechter Wurf und Superposition“ an.

Die Vergleichsseite zeigt zusätzlich eine gezielte Abfrage für Newtons erstes Axiom, dessen Anwendung und „Harmonische Schwingung verstehen“. Bei ausdrücklich auf das jeweilige Ziel verengtem Fokus bietet der Standardmodus jedes dieser Ziele bereits ohne Prüfungsbeleg an. Im strikten Modus bleibt jedes der drei Ziele in allen Vergleichszuständen gesperrt. Die Vorschau stellt danach die ursprüngliche Präferenz wieder her. Die Vergleichsseite hält den Stand beim Start fest. In den verlinkten Cockpits kann man weiterlernen.

### Einheitenauftrag und Häkchen auf der Lernkarte

Die vier weiteren Profile je Bildungsgang zeigen einen ausdrücklich gewählten Einheitenauftrag. Im offenen Profil steht die Wahl des ersten Prüfungsteils an. Im Profil mit C und D fehlen A und B. Mit allen vier Erfolgen ist der Auftrag erfüllt. Das gemischte Profil enthält zusätzlich einen eigenen Auftrag zu den Weg-Zeit-Diagrammen. Dieser bleibt nach dem Einheitenabschluss offen. [Aufträge in G8](http://localhost:5177/auftraege/G8) · [Aufträge in G9](http://localhost:5177/auftraege/G9)

Im Cockpit mit vier bestandenen Prüfungen die Lernkarte öffnen. Ein grünes Häkchen bezeichnet den eigenen Nachweis an genau diesem Ziel. A, B und C tragen dieses Häkchen auf der E.1-Tafel. D liegt in der Untereinheit „Beschleunigte Bewegung und freier Fall“. Dasselbe Häkchen in Grau zeigt die fachlich belegte Anrechnung für die Planung. C und D decken gemeinsam „Modellierung und Idealisierung von Bewegungen“ und „Gleichmäßig beschleunigte Bewegung und Beschleunigung“ ab. Wer eines dieser Fachziele anschließend selbst nachweist, sieht dort das grüne Häkchen. Bei den übrigen Fachzielen entsteht durch den Abschluss kein Häkchen. Weitere Prüfungen auf der Tafel, etwa „Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit“, bleiben freiwillig und haben ihren eigenen Nachweis. [Vier Belege in G8](http://localhost:5177/auftraege/G8/ABCD) · [Vier Belege in G9](http://localhost:5177/auftraege/G9/ABCD)

### Einen Prüfungsversuch vor der Abgabe verlassen

1. Das Cockpit mit den beiden bestandenen Teilen öffnen. Unter **Einheitenprüfung · 2 von 4 Teilen bestanden** bei „Wann überquert der Wagen die rote Linie?“ (A) **Direkt versuchen** wählen. Auf der Startseite **Schritt 2: Mit Claude starten** anklicken. [G8 mit C und D](http://localhost:5177/auftraege/G8/CD) · [G9 mit C und D](http://localhost:5177/auftraege/G9/CD)
2. Vor der Abgabe denselben Cockpit-Link erneut öffnen. Bei der laufenden Prüfung **Zur normalen Lernansicht** wählen und mit **Prüfung beenden und wechseln** bestätigen.
3. Die **Einheitenprüfung** erneut aufklappen. A und B zeigen **Offen**, C und D jeweils **Beleg vorhanden**. Der Auftrag steht weiter bei zwei von vier bestandenen Teilen. Über **Für deinen Lernplan angerechnet (2)** lässt sich jetzt eines der beiden Fachziele zum freiwilligen Weiterlernen öffnen.

### Ein angerechnetes Fachziel freiwillig erarbeiten

Im Cockpit **C und D bestanden** die **Einheitenprüfung** und darin **Für deinen Lernplan angerechnet (2)** aufklappen. Der Titel **Gleichmäßig beschleunigte Bewegung und Beschleunigung** öffnet die Zielkarte. Unter **Offene Voraussetzungen** stehen die noch ausstehenden Grundlagen. Der beschriftete Startknopf aktiviert im Standardmodus den Einzelfokus auf das gewählte Ziel. Bei eingeschaltetem strikten Modus nennt der Knopf die verfügbare Grundlage, bei der der Einzelweg beginnt. Im frischen Vergleichsprofil hat das Beschleunigungsziel 54 offene Voraussetzungen einschließlich ihrer Vorstufen. Fünf davon gehören zu den einzeln offenen E.1-Inhalten. Sie betreffen Durchschnitts- und Momentangeschwindigkeit, gleichförmige Bewegung, Bewegungsdiagramme, Messunsicherheiten und Fehlerarten. Unter den drei aktuell verfügbaren Grundlagen hat „Warum Mathematik? – Denken, Muster & Zukunft“ den kürzesten Weg zum Beschleunigungsziel (drei Voraussetzungsschritte). Die beiden anderen Angebote „Warum Physik? – Weltverständnis & Zukunft“ und „Warum Mathematik? – Entdecken, Muster & Alltag“ sind jeweils fünf Schritte entfernt. Keines der fünf E.1-Ziele ist hier bereits als nächster Schritt verfügbar. Das Cockpit zeigt nach dem Klick das aktive Ziel. Für einen eigenen Lernnachweis muss die Person das Ziel anschließend tatsächlich erarbeiten.

## Den Elternpfad in Baum und Karte prüfen

Im E.1-Cockpit den Abschnitt „E.1 Bewegungen und ihre Beschreibung“ aufklappen. „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ steht direkt darunter und trägt den Herkunftshinweis „Notwendige Grundlagen“. Die Wagenprüfung steht auf derselben Ebene. „Gleichmäßig beschleunigte Bewegung und Beschleunigung“ liegt eine Ebene tiefer unter „Beschleunigte Bewegung und freier Fall“. In der Lernkarte die gleichen Einheiten öffnen. Ein Klick auf das Weg-Zeit-Ziel führt in beiden Ansichten direkt zur Zielkarte. [E.1 in G8 öffnen](http://localhost:5177/nativ/G8/E1) · [E.1 in G9 öffnen](http://localhost:5177/nativ/G9/E1)

## Zwei Karten vergleichen

Vom Wurf (**B**) aus die **Lernkarte** öffnen. Auf großen wie kleinen Bildschirmen erscheint die Grafik. Bei 1024 Pixeln sind in den personalisierten G8- und G9-Profilen beide Prüfungen im Ausschnitt erreichbar. Auf dem Smartphone in **In dieser Ebene suchen** „Wagen“ eingeben, den Treffer wählen und den zentrierten grafischen Knoten öffnen. **Diese Ebene einpassen** zeigt die gesamte Tafel. Die Zoomtasten, das Verschieben der Grafik und die Tastatur bleiben verfügbar.

Der Mathematikvergleich öffnet „Intervalladditivität und Linearität von Integralen nutzen“ im hessischen G9-Grundkurs. **Lernkarte** zeigt dazu die Tafel „Q1.3 Vertiefung der Differenzial- und Integralrechnung“. Bei 1440 × 900 Pixeln startet sie mit 100 % und acht gerenderten Knoten. **Diese Ebene einpassen** zeigt bei 73 % alle 18 Knoten. So lassen sich Lesbarkeit und Gesamtübersicht auf derselben Tafel vergleichen. [Mathematik-Kartenvergleich öffnen](http://localhost:5177/vergleich/mathematik)

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
