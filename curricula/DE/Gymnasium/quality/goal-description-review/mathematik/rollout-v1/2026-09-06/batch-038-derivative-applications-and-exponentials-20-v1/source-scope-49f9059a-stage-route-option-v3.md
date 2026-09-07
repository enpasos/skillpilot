# B038h: engere Stage-/Route-Option v3

Stand: 2026-09-06. **Fachlicher AI-Vorschlag mit read-only Gegenproben; nicht
übernommen.** Er ersetzt keine Freigabe, kein Profil und keinen Gate-Abschluss.
Kanonik, Mappings, Composition-Views und vorhandene Bildbytes sind unverändert.

## Empfehlung für den Exponentialzweig

Die G9-Quellenzeilen sollten den **bereits vorhandenen J10-Korridor** verwenden,
statt vier fast gleichlautende Oberstufenziele zusätzlich in Jahrgang 10 zu
halten. Dafür braucht es weder neue Ziele noch 44 erweiterte Sek-II-Views.
Eine globale Zusammenlegung ähnlicher IDs ist ausdrücklich nicht Teil dieser
Option; vorhandene Mastery wird nicht zwischen IDs übertragen.

| G9-Inhalt | Bereits vorhandener J10-Kanon | Heutige HE-G9-Sicht |
| --- | --- | --- |
| Wachstum/Zerfall in Darstellungen | `31207307-0cf9-4a56-bf14-90196dc2b3d4` | target |
| Parameter aus Gleichungen und Werten | `c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7` | target |
| Verdoppelungs-/Halbwertszeit | `c19d1f8f-b297-5a58-b1d4-26d811e4aff4` | target |
| Modelle, Annahmen, Grenzen | `27b63e2e-6a34-483e-8e5a-fe0f49670d1d` | target |
| Logarithmus als Umkehroperation | `3c1d6ce7-099e-4267-9ff2-3d1526209a89` | target |
| Exponentialgleichungen logarithmisch lösen | `c088fd81-fe4f-4282-99af-ebc0d1a7d202` | noch absent |
| Exponential-/Logarithmusschreibweise als Umkehrwerkzeug | `aed3ca99-815b-40b8-ae91-e11bf92f51da` | noch absent |

Alle sieben vorhandenen J10-Ziele haben schon jetzt vollständig calculusfreie
requires-Closures zur Sek-I-Orientierung. Nach Hinzunahme der letzten beiden
sind sämtliche Ziele dieser Closures in der HE-G9-Zielmenge sichtbar.
Kein verbleibendes HE-G9-target benötigt eines der sieben E-Clusterkinder als
direkte Voraussetzung. Das sind ausgeführte graphische Mengen-/Routennachweise,
keine Vermutung aus Jahrgangslabels.

### Exaktes alternatives Source-Delta

In der bestehenden HE-Sek-I-Mapping-Reviewdatei:

1. `he-math-seki-g9-10-2-07-5e841891 → 48e7615d-3e6e-4b5c-9df3-310e510f91f0`
   entfernen, wie schon in v1.
2. `he-math-seki-g9-10-2-04-d7759617 → 346efb31-c400-5bd3-a698-dd9a7e1bc3f7`
   entfernen. Die schon vorhandenen Kanten derselben Zeile auf `c19d1f8f` und
   `c74d0c7e` bleiben; die Kompetenz verschwindet nicht aus G9. Dies behauptet
   nicht, dass der Inhalt des E-Ziels fachlich nichts mit der Quelle zu tun
   hätte: Für die wirksame G9-Projektion werden die vorhandenen feineren
   J10-Repräsentanten gewählt, keine zusätzliche E-Lernroute.
3. `he-math-seki-g9-10-2-06-6ae4d32a → c088fd81-fe4f-4282-99af-ebc0d1a7d202`
   als **partial** ergänzen: unbekannten Exponenten mit der inversen Operation
   bestimmen; Überprüfen und Kontextdeutung folgen aus dem umgebenden
   Anwendungsauftrag, nicht allein aus einer isolierten Rechenzeile.
4. `he-math-seki-g9-10-2-07-5e841891 → aed3ca99-815b-40b8-ae91-e11bf92f51da`
   als **partial** ergänzen: Exponential-/Logarithmusbeziehung nutzen. Diese
   Kante ersetzt nicht den eigenständigen Auftrag zu Umkehrgraphen.
5. Die drei bestehenden Zeile-07-Verweise auf `3c1d6ce7`, `c15fe32d`,
   `dbc13bb0` wie in v1 auf partial präzisieren. Die Route der letzten beiden
   bleibt separat offen, siehe unten. Die drei betroffenen Source-Decisions
   (04, 06, 07) einschließlich ihrer Review-Autorität konsistent aktualisieren;
   keine alten menschlichen Freigaben übernehmen.

Die in v1 vorgeschlagenen zusätzlichen Zeile-03/06/08-Kanten auf `781`, `d900`
und `ab720` entfallen in dieser Variante. Der rohe HE-G9-Scope verliert exakt
die sieben Kinder von `48e7615d` und erhält exakt die zwei bestehenden
J10-Ziele `c088` und `aed3`. Die kanonischen Ziele bleiben erhalten.

Quellenbasis: [G9-Lehrplan, 10.2, gedruckte S. 38](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf).
Die Einordnung als legacy-grade-sequencing-reference gegenüber dem bindenden
[KC](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf)
bleibt unverändert. Aus dem Scope-Vorschlag folgt keine landesweite neue
GK-/LK-Entscheidung.

### Enger kanonischer Requires-Vorschlag

| Ziel | neue requires |
| --- | --- |
| `781f133a` | bestehende Orientierung `71cec9fb` |
| `628928a6` | bestehender Parameter-Vorgänger `346efb31` **plus** bisher bei 781 liegende Ableitungsbasis `858113c5` |
| `d900e0a4` | `781f133a` statt `628928a6` |
| `c15fe32d` | bestehende Orientierung `71cec9fb`; Hauptsatz und Ableitungen entfallen |

Die d900-Entscheidung ist **fachlich**, nicht mechanisch: Das Deuten einer
Exponentialfunktion ist der vorangehende Lernschritt; Logarithmieren als
inverse Operation wird in diesem Gleichungsziel erklärt, begründet und
geprüft. Es wird nicht als unsichtbar bereits gemeisterte J10-Kompetenz
unterstellt. Eine frische positive Evidenz muss beispielsweise erklären
lassen, warum ein unbekannter Exponent nicht durch Division durch die Basis
bestimmt wird, welche Basis-/Definitionsbedingungen gelten, wie die Lösung
durch Einsetzen geprüft und im Sachkontext beurteilt wird. Bloßes
Taschenrechnertippen genügt nicht. Die vorhandene Zielbeschreibung verlangt
bereits logarithmische Umformung, Überprüfung und Interpretation und wird
dabei nicht abgeschwächt.

`781` ist in allen 81 aktuellen d900-Views bereits target. Die Verschiebung
der Ableitungsvoraussetzung nach `628` bewahrt die fachliche Grundlage der
Calculus-Nachfolger. Die mathematisch elementare c15-Kompetenz benötigt weder
den Hauptsatz noch Differentiation; ihre gesonderte Orientierungsprojektion
wird durch diese sachliche Bereinigung nicht als erledigt ausgegeben.
Die vorhandenen Motivationskanten werden **nicht** neu erfunden oder zwischen
den Stufen umgehängt.

## Ausgeführte Gegenproben und bewusste Grenzen

Der read-only Helper aus [Audit v2](source-scope-49f9059a-route-audit-v2.md)
liefert jetzt zusätzlich `narrowerAlternative`:

- alternative kanonische requires insgesamt azyklisch;
- native, auf dieselben 7+3 begrenzte Sek-II-Hard-Route-Findings: **0**;
- neue unsichtbare direkte Zielvoraussetzungen bei diesen Kantenänderungen
  über sämtliche aktuellen Views: **0** (mit vorgeschlagenem Entfernen der
  sieben Kinder aus der HE-G9-Sicht);
- J10-Ersatz-Closures: calculusfrei, zur bestehenden Sek-I-Orientierung
  verbunden und vollständig in der vorgeschlagenen HE-G9-Zielmenge;
- exakt sieben alte Raw-G9-Ziele entfallen, zwei bestehende kommen hinzu;
- kein erhaltenes HE-G9-Ziel benötigt ein entferntes Kind;
- die vorhandene J10-Prüfungsaufgabe `af7905d0-e684-5ea3-99ac-8a045455370e`
  hat danach keine fehlenden Zielvoraussetzungen mehr. Ihr bestehender
  Aufgabentext prüft die unbekannte Exponentenzeit und verlangt eine Erklärung
  des Logarithmeneinsatzes; es wird keine Prüfungsfreigabe erfunden.

Die Prüfung ist noch **kein** vollständiger Generatorlauf: insbesondere die
automatische Prüfungssichtbarkeit und alle tatsächlich erzeugten G9-Cross-
Stage-Artefakte müssen nach einer Entscheidung nativ berechnet werden.
Eingabehashes dürfen davor nicht nur für einen scheinbar grünen Lauf umgebogen
werden. Auch M6, Source-/Applicability-Berichte, Buch-/Seitenbindungen und
positive V2-Nachweise bleiben reguläre Folgeprüfungen.

## Separate notwendige Entscheidung: allgemeine Umkehrfunktion

`c15fe32d` und `dbc13bb0` sind nicht bloß eine Folge der einen Clusterkante:
Sie werden in HE G9 zusätzlich aus 10.1 sowie im G8-Jahrgang 9 unmittelbar
gemappt. Es gibt aktuell kein passendes bestehendes elementares Zielpaar, das
ihren **allgemeinen** Umkehrbarkeits-/Umkehrgraphauftrag vollständig ersetzt.
`aed3` deckt nicht diesen Graphauftrag. Beide dürfen deshalb nicht still aus
der Quellabdeckung gestrichen oder durch reine Zahlenlogarithmen ersetzt werden.

Der Modellkonflikt ist konkret: Dieselben stabilen Ziele werden in beiden
Stufen gebraucht, ihre globale requires-Liste fordert jedoch die nur in
Sek II sichtbare Orientierung `71`. Ein bloßer Tausch auf `653` oder ein
Sek-I-Basisziel schafft dieselbe Unsichtbarkeit auf der anderen Seite. Zwei
Orientierungen als requires bedeuten AND, nicht eine stufenabhängige Wahl.
prerequisiteOnly kann unbekanntes Mastery prüfen, macht die fehlende
Orientierung aber nicht lernbar.

Für diese beiden Ziele ist daher eine **bewusste Projektionsentscheidung**
nötig: Entweder der bereits bestehende allgemeine Zukunfts-/Mathematikausblick
`71` wird als tatsächlich sinnvoller zusätzlicher Einstieg in der betreffenden
Sek-I-Sicht ausdrücklich dargestellt und altersbezogen beurteilt, oder das
stufenübergreifende Orientierungs-/Routenmodell muss gesondert gestaltet werden.
Das erste ist keine automatische Empfehlung: Es darf nicht nur geschehen,
um einen Gate zu bedienen. Das zweite darf nicht als versteckte Änderung
eingefrorener Runtime- oder Mastery-Semantik ausgeführt werden. Neue rein
stufenbedingte Duplikate und fingierte Mastery sind keine Ersatzlösung.

Diese genau benannte Restentscheidung blockiert nicht die enger geprüfte
Exponentialzweig-Option oder weitere unabhängige Pakete. Sie verhindert aber,
die beiden Umkehrziele und das gesamte 7+3-Paket ohne zusätzliche fachliche
Arbeit als abgeschlossen zu zählen.
