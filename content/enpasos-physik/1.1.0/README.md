# enpasos – Physik ausprobieren

Version 1.1.0 · Prüfstand 23. September 2026 · lokal vorbereitet, nicht ausgerollt.

Das optionale Paket behält die stabile ID `enpasos-physik` und alle drei
PhET-Direktlinks aus [1.0.0](../1.0.0/README.md). Zwei reguläre deutsche
HTML-Simulationen ergänzen Wellen und Licht. **enpasos kuratiert;
PhET Interactive Simulations / University of Colorado Boulder erstellt und
stellt die Simulationen bereit.** Es wird keine Anbieterpartnerschaft behauptet.

| Neue Simulation | Aktuelle curriculare Physik-Einzelziele | Nutzen und Grenze |
| --- | --- | --- |
| [Seilwelle](https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_de.html) | `bf559969-a05c-58b5-82c5-3d719d96555d`, `cb0ced6d-b7c1-5b7d-9922-8c394f6030e8` | Oszillator/Impuls, Frequenz, Spannung, Dämpfung und Reflexion variieren. Für Wellenlänge und v=λf braucht es Messauftrag und Begründung; ein ideales Seil ist kein Modell aller Wellenmedien. |
| [Lichtbrechung](https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_de.html) | `6a4c6042-052b-502b-a39a-0ed8941247ac`, `58fc7852-722c-5a67-be6a-bfd1be0b527e` | Strahlweg und Brechungsindex an Grenzflächen untersuchen, Totalreflexion qualitativ beobachten. Optische Hebung und die Geometrie einer Glasfaser werden nicht selbst dargestellt. |

Diese IDs sind nach kanonischer Beschreibung und
`physik.semantic-kinds.json` `curricularAtomic`. Die Simulationen stützen
Teilhandlungen; sie zertifizieren weder das gesamte Ziel noch praktische
Versuchs- oder Messkompetenz. Die fachlichen Grenzen der drei übernommenen
Links stehen in der Dokumentation von 1.0.0.

## Zugang und Mobilprüfung

Die neuen Startdateien lieferten am 23. September HTTP 200 und öffneten anonym
in einem deutschen Chromium mit 390 × 844 px Touch-Viewport. Seilwelle zeigte
Oszillator, Enden und Regler; Ziehen am Seilende erzeugte eine sichtbare
Störung. Lichtbrechung öffnete nach Wahl von „Einleitung“
die Strahlansicht mit Material- und Brechungsindexwahl. Tippen auf die
Lichtquelle änderte Einfalls- und Brechungswinkel. Die Simulation skaliert
auf die Bildschirmbreite und benötigt keine Anmeldung. Einzelne Beschriftungen
und Stellflächen sind auf 390 px klein; ein natives Handy und sämtliche Modi
wurden nicht geprüft. Deutsch sichtbare Bedienelemente bedeuten nicht, dass
alle Screenreader-Beschreibungen übersetzt sind.

Laut [offizieller PhET-Lizenzinformation](https://phet.colorado.edu/en/licensing)
sind reguläre Simulationen für nichtkommerzielles Lernen kostenlos. Dies sind
keine Studio-/PhET-iO-Inhalte und keine kommerzielle Lizenzfreigabe. Nur statische
Direktlinks werden gespeichert; keine Simulation, kein Volltext und keine
Bilder werden kopiert oder eingebettet. Es werden keine Lernenden-IDs oder
Chatdaten an PhET angehängt.

## Auswahl

Nach Rollout kann die lernende Person das Paket ausdrücklich unter
**Zahnrad → Mein Lehrplan → Zusätzliche Lernmaterialien** wählen oder abwählen.
Die stabile Paket-ID bewahrt eine bestehende Auswahl. Links erscheinen nur bei
passenden Zielen und werden erst durch Klick extern geöffnet. Dieses Paket kann
neben Physik Libre ausgewählt werden; alle aktiven Pakete zusammen bleiben bei
höchstens vier Materialeinträgen pro Ziel. Materialausfall, Abwahl und Nutzung
ändern weder Mastery noch Lernplan, Voraussetzungen oder Curriculuminhalte.
Lokale Tests sind kein Nachweis für CI, Produktion oder echte Claude-Nutzung.
