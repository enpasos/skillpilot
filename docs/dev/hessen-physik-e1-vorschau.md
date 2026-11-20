# Hessische E.1-Prüfungen lokal ansehen

Die Vorschau öffnet die beiden deutsch-englischen Physikprüfungen über die reguläre Lernkarte und das Cockpit. Sie legt für Hessen G8 und G9 je ein Zuschauerprofil und zwei Profile für unabhängige Erststarts an. Die lokale H2-Datenbank befindet sich im Arbeitsspeicher. Beim Beenden verfallen alle sechs Profile.

## Start aus einem frischen Checkout

Vorausgesetzt werden Python 3, Git, das in `.java-version` und `.corretto-version` festgelegte Amazon-Corretto-JDK sowie Node gemäß `.nvmrc`. `JAVA_HOME` zeigt auf die JDK-Installation. Eine vollständige Arbeitskopie des Vorschau-Branches enthält die Aufgaben, Landschaften, Quellen und Startskripte. Die Befehle laufen im Wurzelverzeichnis.

```sh
npm ci --prefix app
python3 scripts/preview_hessen_physics_e1.py
```

Der Gradle-Wrapper übersetzt die Backendklassen aus diesem Checkout. Gradle und npm laden beim ersten Start gegebenenfalls ihre Abhängigkeiten. Die lokale API und Vite lauschen auf den Loopback-Ports 8084 und 5177. Auf der Konsole erscheinen die vier Einstiege, sobald beide Dienste bereit sind.

| Lehrplan | Wagen | Waagerechter Wurf |
| --- | --- | --- |
| Hessen G8 · GK | [A öffnen](http://127.0.0.1:5177/nativ/G8/A) | [B öffnen](http://127.0.0.1:5177/nativ/G8/B) |
| Hessen G9 · GK | [A öffnen](http://127.0.0.1:5177/nativ/G9/A) | [B öffnen](http://127.0.0.1:5177/nativ/G9/B) |

Für Englisch `?lang=en` anhängen. Der Einstiegslink wählt das eigens angelegte lokale Profil und wechselt zum nativen Pfad `/learner/<Prüfungs-ID>`. In einer Karte zeigt **Lernkarte öffnen** auch die andere Aufgabe. Die Aufgaben nennen die erreichbaren Punkte und ihre Bestehensgrenzen. Wagen A ist ab 14 von 17, Kugel B ab 15 von 18 Punkten bestanden. Der automatische E.1-Lernabschnitt enthält fünf Prüfungen. Im fassungsgebundenen Vierernachweis zählen davon A, B und die zwei Prüfungen der Kindeinheit. Der senkrechte Wurf und das Beschleunigungsprotokoll sind jeweils ab 17 von 20 Punkten bestanden. Vor dem ersten Versuch zeigt der Nachweis 0 von 4 bestandenen Teilen. Er lässt sich öffnen und zeigt alle vier Aufgaben sowie die elf einzeln noch nachzuweisenden Inhaltsziele.

Für einen manuellen Erststart öffnet man z. B. `/testlauf/G8/A` und wählt **Prüfung direkt versuchen**. Dieser Pfad verwendet ein eigenes Versuchsprofil. Die lokale API kann die Übergabe zum gewählten Coach starten. Der automatisierte Browsercheck fängt die anschließende externe Navigation ab. Während der Vorschau bleiben Änderungen am ausgecheckten Katalog einer neuen Generation vorbehalten. Nach Änderungen den Prozess mit Strg+C beenden und neu starten.

## Browserprüfung

```sh
cd app
npx playwright install chromium
cd ..
python3 scripts/preview_hessen_physics_e1.py --check
```

Auf einem neuen Linux-System installiert `npx playwright install --with-deps chromium` bei Bedarf auch die Systembibliotheken. Der Lauf prüft in G8 und G9 die deutschen und englischen Aufgabenstellungen einschließlich der Tabellen, den Kartenwechsel sowie vier reguläre Erststarts. G9/B wird zusätzlich bei 390 Pixeln Fensterbreite geöffnet. Vor und nach dem Öffnen und Starten prüft der Test die Einzelzielwerte und die Beleglisten aller vier Einheitsteile. Lernendenabgaben und fachliche Bewertungen sind eigene Nachweise. Die unabhängigen Fachentscheide binden die geprüften Materialien für [Wagen und waagerechten Wurf](https://github.com/enpasos/skillpilot/blob/feat/hessen-e1-pruefungsteile/curricula/DE/Gymnasium/quality/release-model/physics-he-e1-partial-credit-review-2026-11-20.md) sowie für [senkrechten Wurf und Beschleunigungsprotokoll](../concept/skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/unabhaengiges-fachreview.md).

Die Vorschau verwendet nur die angegebenen Ports. Für einen unabhängigen zweiten Lauf während einer geöffneten Vorschau kann man die Ports 5187 und 8094 verwenden.

```sh
python3 scripts/preview_hessen_physics_e1.py --check --ui-port 5187 --api-port 8094
```
