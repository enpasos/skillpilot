# Hessische E.1-Prüfungen lokal ansehen

Die Vorschau öffnet E.1 und ihre vier deutsch-englischen Prüfungen im regulären Cockpit. Im persönlichen Curriculum ist ausdrücklich Hessen, Sekundarstufe II, Physik (GK) ausgewählt. G8 und G9 erhalten je ein Zuschauerprofil und zwei Profile für unabhängige Erststarts. Ein siebtes Profil öffnet eine große Mathematiktafel für den Kartenvergleich. Alle sieben Profile liegen in der lokalen H2-Datenbank im Arbeitsspeicher und verfallen beim Beenden.

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

Für Englisch `?lang=en` anhängen. Der Einstiegslink wählt das lokale Profil und öffnet das Ziel im Cockpit. Für die Ballfrage beim Link **E.1** die **Lernkarte** öffnen und beim Eintrag „E.1 Bewegungen und ihre Beschreibung“ den Pfeil **Einheit öffnen** wählen. Vom Link **A** oder **B** aus öffnet sich die Lernkarte direkt bei den Prüfungszielen der Einheit. Die Aufgaben nennen die erreichbaren Punkte und ihre Bestehensgrenzen. Wagen A ist ab 14 von 17, Kugel B ab 15 von 18 Punkten bestanden. Der automatische E.1-Lernabschnitt enthält fünf Prüfungen. Im fassungsgebundenen Vierernachweis zählen davon A, B und die zwei Prüfungen der Kindeinheit. Der senkrechte Wurf und das Beschleunigungsprotokoll sind jeweils ab 17 von 20 Punkten bestanden. Vor dem ersten Versuch zeigt der Nachweis 0 von 4 bestandenen Teilen. Er lässt sich öffnen und zeigt alle vier Aufgaben sowie die elf einzeln noch nachzuweisenden Inhaltsziele.

Für einen manuellen Erststart öffnet man z. B. `/testlauf/G8/A` und wählt **Prüfung direkt versuchen**. Dieser Pfad verwendet ein eigenes Versuchsprofil. Die lokale API kann die Übergabe zum gewählten Coach starten. Der automatisierte Browsercheck fängt die anschließende externe Navigation ab. Nach Änderungen an den ausgecheckten Aufgaben den Prozess mit Strg+C beenden und neu starten, damit das Backend die neue Katalogfassung lädt.

Die Zuschauerprofile beginnen ohne Prüfungsbelege. In der Lernkarte führen die drei Übungen vom Spielzeugzug über den Bremsweg zur Bodenmarke beim Wurf. **Lernkarten zu E.1 üben** öffnet die neun passenden Karten. Bei der fachlichen Durchsicht lässt sich so vom Einstiegsproblem über eine Übung bis zur Prüfung verfolgen, welche eigenständige Vorhersage die Person jeweils leisten soll.

## Zwei Karten vergleichen

Vom Wurf (**B**) aus die **Lernkarte** öffnen und die Wagenaufgabe „Wann überquert der Wagen die rote Linie?“ wählen. Bei 1024 Pixeln Fensterbreite passt die Prüfungsgruppe im geprüften G8- und G9-Profil bei 87 % in die Grafik. Wenn die Gruppe nur unter 80 % hineinpasst, öffnet die Karte die Zielliste. **Grafische Karte anzeigen** und **Zielliste anzeigen** wechseln zwischen beiden Ansichten.

Der Mathematikvergleich öffnet „Intervalladditivität und Linearität von Integralen nutzen“ im hessischen G9-Grundkurs. **Lernkarte** zeigt dazu die Tafel „Q1.3 Vertiefung der Differenzial- und Integralrechnung“. Bei 1440 × 900 Pixeln startet sie mit 100 % und acht gerenderten Knoten. **Diese Ebene einpassen** zeigt bei 73 % alle 18 Knoten. So lassen sich Lesbarkeit und Gesamtübersicht auf derselben Tafel vergleichen. [Mathematik-Kartenvergleich öffnen](http://localhost:5177/vergleich/mathematik)

## Browserprüfung

```sh
cd app
npx playwright install chromium
cd ..
python3 scripts/preview_hessen_physics_e1.py --check
```

Auf einem neuen Linux-System installiert `npx playwright install --with-deps chromium` bei Bedarf auch die Systembibliotheken. Der Lauf prüft in G8 und G9 die deutschen und englischen Aufgabenstellungen einschließlich der Tabellen, den Kartenwechsel sowie vier reguläre Erststarts. Der Wechsel vom Wurf zum Wagen wird in beiden Bildungsgängen zusätzlich bei 761, 1024 und 1100 Pixeln geprüft, in G9 auch bei 390 Pixeln. Der Mathematikvergleich prüft den Einstieg und das manuelle Einpassen. Vor und nach dem Öffnen und Starten prüft der Test die Einzelzielwerte und die Beleglisten aller vier Einheitsteile. Lernendenabgaben und fachliche Bewertungen sind eigene Nachweise. Die unabhängigen Fachentscheide binden die geprüften Materialien für [Wagen und waagerechten Wurf](https://github.com/enpasos/skillpilot/blob/feat/hessen-e1-pruefungsteile/curricula/DE/Gymnasium/quality/release-model/physics-he-e1-partial-credit-review-2026-11-20.md) sowie für [senkrechten Wurf und Beschleunigungsprotokoll](../concept/skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/unabhaengiges-fachreview.md).

Die Vorschau verwendet nur die angegebenen Ports. Für einen unabhängigen zweiten Lauf während einer geöffneten Vorschau kann man die Ports 5187 und 8094 verwenden.

```sh
python3 scripts/preview_hessen_physics_e1.py --check --ui-port 5187 --api-port 8094
```
