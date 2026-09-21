# enpasos – Mathematik entdecken

Version 1.0.0 · Prüfstand 21. September 2026 · lokal vorbereitet, nicht ausgerollt.

Sieben direkte Materiallinks unterstützen 16 aktuelle fachliche Einzelziele der
Oberstufe. Die Zuordnung ist ein kleiner Pilot, keine Vollabdeckung. Zusammensteller
ist **enpasos**; Anbieter der Inhalte sind **GeoGebra**, **Desmos** und **PhET**.
Die fünf GeoGebra-Aktivitäten stammen von **Andreas Lindner**. Das Paket behauptet
weder eine Anbieterpartnerschaft noch eine menschliche fachliche Freigabe.

## Nutzung

Nach dem Backend- und Frontend-Rollout unter **Zahnrad → Mein Lehrplan →
Zusätzliche Lernmaterialien → enpasos – Mathematik entdecken** auswählen und
speichern. Neue und bestehende Profile werden nicht automatisch angemeldet.
Passende Lernziele zeigen anschließend kompakte Simulationslinks. Abschalten
entfernt das Angebot bei der nächsten Auflösung; Lernziele und Lernstand bleiben
unverändert. Der Coach erhält dieselben zielbezogenen Verweise, keine neuen Rechte
zum Lesen oder Übernehmen der Anbieterinhalte.

Jeder Link führt unmittelbar zur Aktivität beziehungsweise zum Werkzeug. Die
Sammlung [Fachdidaktik Sekundarstufe 2](https://www.geogebra.org/m/hd6m7tvg) diente
als Fundstelle, ist aber **kein** Lernziel-Link. Tracking-Parameter wurden entfernt.
Desmos öffnet direkt den Rechner; den konkreten Zeichenauftrag liefert der Coach.

## Fachliche Zuordnung

Die folgenden IDs wurden gegen die aktuellen kanonischen Beschreibungen und
`mathematik.semantic-kinds.json` geprüft; sie sind `curricularAtomic`. Weitere
Voraussetzungen oder unspezifische Themencluster wurden nicht mitverlinkt.

| Material | Lernziel-IDs | Einsatz und Grenze |
| --- | --- | --- |
| [Einseitige Ableitungsgrenzwerte](https://www.geogebra.org/m/uu2f3r7v) | `b42bdfcc-3db7-5697-8b3e-69e50962ca86`, `7e613c02-b0e9-4eb3-8bc0-93c37c30bf44` | Annäherung von beiden Seiten vergleichen, Sekante/Tangente und Knicke begründen. Beobachtung ist kein allgemeiner Beweis. |
| [Füllkurve eines Kegels](https://www.geogebra.org/m/gUpWKqks) | `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c` | Ergänzende Anschauung der lokalen Änderung von h(t). Den Bezug zur momentanen Änderungsrate stellt der Coach her; keine Integral- oder Volumenherleitung behauptet. |
| [Newton-Verfahren](https://www.geogebra.org/m/uN22nP6P) | `0c7bbd3f-0a04-4f0e-888b-40ab7841fb76` | Tangentenschritte, Startwerte und Einsatzgrenzen untersuchen; kein Vergleich weiterer Näherungsverfahren. |
| [Medizinische Tests](https://www.geogebra.org/m/cgahnpZu) | `c3b9c561-dd83-5903-9ec6-49c7f51bafd5`, `c2831918-26f1-421e-90fb-ce707689594e` | Bedingung und Bezugsraum unterscheiden, Basisraten vergleichen. Baumdiagramm/Vierfeldertafel ergänzt der Coach; keine medizinische Beratung. |
| [Wachstumsmodelle](https://www.geogebra.org/m/gvmnhqjf) | `848af536-c7e5-4df0-a4e9-d5d0ff15244c` | Verlauf, Sättigung und Modellannahmen vergleichen. Das begrenzte Modell der Appletdatei ist zeitverschoben; keine identischen Anfangsbedingungen voraussetzen. |
| [Desmos-Graphenrechner](https://www.desmos.com/calculator) | Acht Ziele, siehe unten | Direkte Zeichenhilfe; passende Funktionen/Aufgaben gibt der Coach. Ablesen ersetzt keine Begründung. |
| [PhET: Parabeln](https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_de.html) | `29ce4053-b5c5-4a82-9ff0-3acc492284d8`, `7ba19509-8ee6-50e0-a411-a371f05b1801` | Koeffizienten, Scheitelpunkt und Nullstellen untersuchen. Das allgemeine Transformationsziel wird nur für quadratische Funktionen unterstützt. |

Desmos ist gezielt diesen acht E-Phasen-Zielen zugeordnet:

- `0272c501-2931-5e52-b62f-af068db63c44`: Aus Term einen Graphen erstellen.
- `b04d65dc-1214-5323-89a7-317d6b099e1a`: Zwischen Tabelle, Graph und Term wechseln.
- `7ba19509-8ee6-50e0-a411-a371f05b1801`: Verschiebungen und Streckungen erkennen.
- `0b23413e-a334-5dd3-98e5-de067208819e`: Achsen- und Graphenschnittpunkte bestimmen.
- `845440ce-f63f-5835-903f-739145ca27bd`: Zusammenhang von f und f′ beschreiben.
- `1eb7b2ce-f9b1-52dc-aa66-5543c946454b`: Digitale Werkzeuge zur Funktionsanalyse nutzen.
- `89ca5089-7122-5a82-b21f-17d0bd46a3bd`: Funktionen digital darstellen und untersuchen.
- `ea8e3dfb-7fd7-5d49-ae07-01864e6aa464`: Parameter periodischer Funktionen deuten.

## Prüfung und Zugangsgrenzen

- Originalseiten und Aufgaben geprüft; GeoGebra-Metadaten benennen Andreas
  Lindner als Autor. Beim Wachstumsvergleich wurde zusätzlich die öffentlich
  referenzierte Appletdatei auf die drei Funktionsmodelle geprüft. Dessen Vorschau
  lieferte HTTP 403; der normale Klick auf das Neuladesymbol startete das Applet
  trotzdem. Der Regler k wurde von 0,1 auf 0,26 geändert; die Kurven reagierten.
  Anbieterinhalte und Bilder werden nicht im Repository gespeichert.
- Desmos wurde mit deutscher Browser-Locale geöffnet: Der queryfreie Rechnerlink
  liefert die deutsche Oberfläche. Andere Browser können eine andere Sprache
  wählen. Die [offizielle Einführung](https://help.desmos.com/hc/en-us/articles/4406040715149-Getting-Started-Desmos-Graphing-Calculator)
  beschreibt die verwendeten Graphenfunktionen.
- Für PhET wird ausschließlich die direkt startbare reguläre deutsche
  HTML-Simulation verlinkt. Anonym wurde „Entdecken“ geöffnet und der Parameter c
  von 0 auf 0,5 geändert; die Parabel verschob sich. Die
  [offizielle Lizenzseite](https://phet.colorado.edu/en/licensing) bestätigt
  kostenloses nichtkommerzielles Lernen; sie unterscheidet dies von kommerzieller
  Nutzung und Studio/PhET-iO. **Kostenlos zugänglich bedeutet nicht uneingeschränkt
  weiterverwendbar.** Keine Einbettung, Kopie, Weiterverbreitung oder kommerzielle
  Lizenzfreigabe wird hier behauptet. Die Anbieterkennzeichnung der Simulation
  bleibt auf der Originalseite erhalten.
- Deutsch sichtbare PhET-Bedienelemente bedeuten nicht, dass alle
  Screenreader-Beschreibungen übersetzt sind. Anbieteroberflächen, Cookieabfragen
  und Verfügbarkeit können sich ändern; eine Materialstörung blockiert SkillPilot
  nicht. Lokale Prüfungen sind keine echte Claude- oder native Handy-Abnahme.

Schema, Zuordnungen und kombinierte Linkgrenzen:
`node scripts/validate_content_packages.mjs` und
`node --test scripts/validate_content_packages.test.mjs`.
Die kleinen Erweiterungen für Kurator und Materialanbieter sind in
[content/README.md](../../README.md) beschrieben. Bestehende Physik-Libre-Pakete,
Curricula und QS-Nachweise bleiben unverändert.
