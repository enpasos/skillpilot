# Lernzielvisualisierung: Einzelphotonen-Interferenz

## SkillPilot-Ziel

- SkillPilot-ID: `c5413852-abae-566b-b435-f9939209ca63`
- Titel: Einzelphotonen-Interferenz
- Beschreibung: Die lernende Person kann deuten, wie sich aus vielen einzelnen, lokalisierten Photonennachweisen schrittweise ein Interferenzmuster als Wahrscheinlichkeitsverteilung aufbaut, ohne den Einzelereignissen klassische Bahnen zuzuschreiben.

## Generator

- Provider: Deterministisch aus geprüfter SVG-Geometrie gerendert
- Status: fachlich konstruiert und hashgebunden KI-geprüft; keine menschliche Freigabe der Ersatzfassung
- Quellbild: `c5413852-abae-566b-b435-f9939209ca63.png`
- Public Asset: `/assets/goal-visualizations/physik/c5413852-abae-566b-b435-f9939209ca63/c5413852-abae-566b-b435-f9939209ca63.png`
- SVG-Quelle: `single-photon-double-slit-v1.svg`
- SVG SHA-256: `e51d39f344993c28efc1858469a92be3c8cefadd7e49b6a97bdfed66af7a334f`
- Renderer: librsvg rsvg-convert 2.52.5
- Befehl: `rsvg-convert --width 1792 --height 1024 --format png --output c5413852-abae-566b-b435-f9939209ca63.png single-photon-double-slit-v1.svg`
- PNG SHA-256: `d6842a4afa320607e4aca188956725595f3cb12b4cb62c4b83f5d1c9bac877d9`

## Deterministische Fachbindung

- Die Barriere besteht aus genau drei opaken, kollinearen Segmenten. Dazwischen bleiben genau zwei getrennte, gleich breite Öffnungen; sie sind ausdrücklich als `Spalt 1` und `Spalt 2` markiert.
- Das Zentrum der Quelle liegt in senkrechter Richtung exakt auf der Mitte zwischen den Zentren von `Spalt 1` und `Spalt 2` (`y = 512,5`).
- Es wird keine Bahn eines Einzelphotons von der Quelle durch einen bestimmten Spalt gezeichnet.
- Drei kumulative Nachweisbilder folgen in Zeitrichtung von links nach rechts: zunächst wenige, dann mehr und schließlich viele lokalisierte Punktnachweise. Die früher doppeldeutig senkrecht angeordnete Zeitfolge ist damit beseitigt.
- In jedem Nachweisbild bezeichnet die senkrechte Richtung dieselbe Ortsrichtung am Schirm. Im Endbild liegen die einzelnen Punkte in fünf horizontalen Häufigkeitsmaxima mit punktarmen Minima dazwischen; die Schwärzung variiert daher ausschließlich entlang dieser senkrechten Ortsachse.
- Das zentrale Hauptmaximum des Endbildes und der größte Peak der rechts ausgerichteten Wahrscheinlichkeitskurve liegen beide exakt bei `y = 512,5`, also auf derselben horizontalen Höhe wie Quelle und Spaltmitte. Die Nebenmaxima sind dazu symmetrisch angeordnet.
- Der Text trennt lokalisierte Einzelereignisse ausdrücklich von einer klassischen Bahnvorstellung.

## Review-Notiz

Der vom Product Owner gemeldete Ein-Spalt-Fehler der alten generativen Fassung wurde durch eine deterministische Neukonstruktion beseitigt. Die anschließende Layoutkorrektur ordnet die kumulative Zeitfolge eindeutig von links nach rechts an und reserviert die senkrechte Richtung für die Ortsabhängigkeit der Schwärzung. In Originalauflösung geprüft: Die Barriere besitzt genau zwei sichtbare Öffnungen; die Quelle liegt vertikal mittig zwischen ihnen; alle Nachweise bleiben einzelne Punkte; das zentrale Hauptmaximum und der größte Wahrscheinlichkeits-Peak liegen gemeinsam auf `y = 512,5`; es wird keine klassische Photonenbahn behauptet. Die KI-Freigabe wird im QA-Ledger an `sha256:d6842a4afa320607e4aca188956725595f3cb12b4cb62c4b83f5d1c9bac877d9` gebunden. Eine menschliche Freigabe der Ersatzfassung wird nicht behauptet.
