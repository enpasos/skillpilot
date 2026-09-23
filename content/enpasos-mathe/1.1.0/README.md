# enpasos – Mathematik entdecken

Version 1.1.0 · Prüfstand 23. September 2026 · lokal vorbereitet, nicht ausgerollt.

Dieses optionale Paket behält die stabile ID `enpasos-mathe-oberstufe` und die sieben
Direktmaterialien aus [1.0.0](../1.0.0/README.md). Hinzu kommen drei gezielte
Aktivitäten. enpasos kuratiert und ordnet zu; GeoGebra, Desmos und PhET stellen
die jeweiligen Inhalte bereit. Die neue Version überschreibt das alte Paket nicht.

| Neue Aktivität | Aktuelles curriculares Einzelziel | Nutzen und fachliche Grenze |
| --- | --- | --- |
| [Unter- und Obersumme](https://www.geogebra.org/m/QKQg6arS), Andreas Lindner | `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` | Veränderliche Rechteckzahl, Aufgaben zu quadratischer Funktion und Kosinus; unterstützt Näherung und Genauigkeitsvergleich. Kein allgemeiner Konvergenzbeweis. |
| [Bestimmtes Integral und Flächeninhalt](https://www.geogebra.org/m/hqcszkAS), Nicole Riegler und Andreas Lindner; Applet von Andreas Lindner | `2afba4a2-287d-5e8f-aeee-a3bcf8652236` | Intervallgrenzen verschieben, vorzeichenbehaftetes Integral mit geometrischer Fläche vergleichen. Der Teil des Lernziels zu Bestandsänderung und Anfangsbestand ist nicht enthalten. |
| [PhET: Geraden ziehen](https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_de.html), University of Colorado Boulder | `2d75fd3f-c68b-4a11-89ae-19a30fefc47a` | Steigung und Achsenabschnitt am Graphen variieren. Eine Sachsituation für den zweiten Teil des Lernziels stellt der Coach. |

Alle drei IDs sind in der aktuellen Mathematik-Landschaft `curricularAtomic`.
Der Bestand von 1.0.0 bleibt fachlich begrenzt wie dort dokumentiert. Diese
Auswahl ist keine Vollabdeckung der Oberstufe und keine menschliche Freigabe.

## Zugang und mobile Prüfung

Die neuen Direktseiten wurden anonym im Chromium mit deutschem Browser und
390 × 844 px Touch-Viewport geprüft. PhET öffnet seine reguläre deutsche
HTML-Simulation ohne Anmeldung; ein Tippen auf den Steigungsregler änderte
die angezeigte Steigung. Beide GeoGebra-Seiten zeigen zuerst eine
Einwilligungsabfrage. Nach **More options → Reject all** sind Aufgaben ohne
Anmeldung lesbar. Das Applet muss zusätzlich über seine Vorschau gestartet
werden; eine simulierte Ziehbewegung veränderte bei beiden Applets die
Darstellung. Die Arbeitsaufträge bleiben direkt auf derselben Seite. Auf 390 px
wird das komplexe GeoGebra-Applet stark verkleinert: Beschriftungen und Regler
sind ohne Vergrößerung schwer bedienbar. Dies ist eine echte Mobilgrenze,
obwohl die Seite ohne horizontales Scrollen dargestellt wird. Ein nativer
Handytest ist nicht behauptet.

Die GeoGebra-Seiten sind konkrete Aktivitäten, keine Fundsammlung. Der
[PhET-Lizenzhinweis](https://phet.colorado.edu/en/licensing) unterscheidet
kostenloses nichtkommerzielles Lernen von kommerzieller Nutzung und den
Studio-/PhET-iO-Produkten. Dieses Paket verlinkt nur eine reguläre Simulation,
keine kostenpflichtige Variante. Aus dem kostenlosen Zugang folgt keine
Erlaubnis zur Einbettung, Kopie oder Weiterverbreitung.

## Einbindung

Nach Rollout wählt die lernende Person das Paket ausdrücklich unter
**Zahnrad → Mein Lehrplan → Zusätzliche Lernmaterialien** aus. Gespeichert
wird die Paket-ID; die neue Version erhält bestehende Auswahlen. Die Links
erscheinen nur bei passenden Zielen, werden erst beim Klick extern geöffnet
und übertragen dabei keine Lernenden-ID oder Chatdaten. Abwahl oder
Anbieterausfall ändern weder Ziele, Voraussetzungen, Mastery noch Lernplan.
Die kombinierte Grenze von vier Materialeinträgen pro Ziel wird mit allen
aktiven Paketen geprüft. Lokale Tests belegen weder CI noch Produktion.
