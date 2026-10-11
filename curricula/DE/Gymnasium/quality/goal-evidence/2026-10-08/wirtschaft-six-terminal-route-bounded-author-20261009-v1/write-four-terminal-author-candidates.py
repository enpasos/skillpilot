from pathlib import Path
import json, copy, hashlib

base = Path(__file__).resolve().parent
def read(path): return json.loads((base / path).read_text())
def write(path, value):
    (base / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

before = read('inputs/01-DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
outlines = read('actual-pre-author-four-terminal-outline-and-impact-scope.plan.json')['newTerminalOutlines']
assert (base / 'actual-native-current311-ownerpage-impact-before-author-outline.json').exists()

damage_task = '''**Fall: Zwei Schäden an abgestellten Fahrrädern**

Personen, Ereignisse und Geldbeträge sind erfundene, lebensnahe Unterrichtsfälle. Alle benötigten Regeln stehen unten. Verlangt wird eine begründete Einschätzung im angegebenen Umfang, kein verbindliches Urteil über einen wirklichen Rechtsfall.

**Material 1 – feststehende Sachverhalte:** In Fall A tritt die 17-jährige Lara absichtlich gegen das Rad von Ben, um es zu beschädigen. Das Rad gehört Ben; die notwendige Reparatur kostet 180 EUR. In Fall B lässt der ebenfalls 17-jährige Emil beim Tragen eines schweren Pakets trotz einer erkennbaren und vermeidbaren Engstelle die erforderliche Sorgfalt außer Acht. Dabei beschädigt er versehentlich das Rad von Noor. Die notwendige Reparatur kostet 120 EUR. Niemand wird körperlich verletzt. Die jeweilige Handlung ist Ursache des angegebenen Schadens; eine Zustimmung oder sonstige Rechtfertigung liegt nicht vor. Lara und Emil verfügen im Unterrichtsfall über die erforderliche Einsicht in ihre zivilrechtliche Verantwortlichkeit. Lara ist außerdem reif genug, das Unrecht ihrer Tat zu erkennen und entsprechend zu handeln. Weitere Umstände einer gerichtlichen Entscheidung sind unbekannt.

**Material 2 – vereinfachte aktuelle Rechtshilfe, sinngemäß:**

- § 823 Abs. 1 BGB: Wer das Eigentum eines anderen widerrechtlich und vorsätzlich oder fahrlässig verletzt, muss den daraus entstehenden Schaden ersetzen. Für die hier 17-jährigen Personen ist die erforderliche Einsicht nach § 828 Abs. 3 BGB ausdrücklich gegeben. Der Ersatz geht an die geschädigte Person.
- §§ 303 Abs. 1 und 15 StGB: Die rechtswidrige Beschädigung einer fremden Sache kann Sachbeschädigung sein. § 303 verlangt im hier betrachteten Fall Vorsatz; eine bloß fahrlässige Sachbeschädigung wird nach dieser Norm nicht bestraft. Andere Straftatbestände werden nicht geprüft.
- §§ 1, 3 und 5 JGG: Mit 17 ist Lara Jugendliche. Strafrechtliche Verantwortlichkeit setzt die bezeichnete Reife voraus. Als Reaktionen kommen Erziehungsmaßregeln sowie unter eigenen Voraussetzungen Zuchtmittel oder Jugendstrafe in Betracht. Das Material begründet weder eine bestimmte Sanktion noch automatisch die Erwachsenenstrafe. Strafrechtliche Ahndung und zivilrechtlicher Ersatz sind getrennte Fragen.

Quellen: [§ 823 BGB](https://www.gesetze-im-internet.de/bgb/__823.html), [§ 828 BGB](https://www.gesetze-im-internet.de/bgb/__828.html), [§ 303 StGB](https://www.gesetze-im-internet.de/stgb/__303.html), [§ 15 StGB](https://www.gesetze-im-internet.de/stgb/__15.html), [§ 1 JGG](https://www.gesetze-im-internet.de/jgg/__1.html), [§ 3 JGG](https://www.gesetze-im-internet.de/jgg/__3.html), [§ 5 JGG](https://www.gesetze-im-internet.de/jgg/__5.html). Stand der bereitgestellten Rechtshilfe: 9. Oktober 2026.

**Aufgaben – 24 BE:**

1. Prüfen Sie für beide Fälle den zivilrechtlichen Ersatz anhand von Eigentumsverletzung, Widerrechtlichkeit, Verschulden, Ursache und Schaden. Nennen Sie jeweils Empfänger und Betrag des begründeten Ersatzes. **(8 BE)**
2. Vergleichen Sie die strafrechtliche Einordnung nach § 303 StGB. Erläutern Sie für Lara die Bedeutung des Jugendalters und der vorgegebenen Reife. Prüfen Sie die Behauptungen „Jeder fahrlässig verursachte Sachschaden ist nach § 303 strafbar“ und „Wer den Schaden bezahlt, hat damit automatisch jede strafrechtliche Folge erledigt“. **(8 BE)**
3. In einer neuen Variante zu B belegen die Feststellungen, dass Emil alle erforderliche Sorgfalt eingehalten hat und ein unvorhersehbares Ereignis den Schaden auslöste. Ändern Sie Ihre Einschätzung im Umfang der bereitgestellten Regeln. Formulieren Sie für A eine sachliche vorläufige Zusammenfassung und nennen Sie eine zusätzliche Information, die vor einer konkreten jugendstrafrechtlichen Reaktion nötig wäre. **(8 BE)**
'''

damage_solution = '''1. A: fremdes Eigentum Ben, rechtswidrige Verletzung, absichtliches und damit vorsätzliches Verhalten, ursächlicher Reparaturschaden. Nach der gegebenen Einsichtsregel begründeter Ersatz 180 EUR an Ben. B: fremdes Eigentum Noor, rechtswidrige ursächliche Verletzung, im Ausgangsfall vermeidbare Sorgfaltspflichtverletzung und damit Fahrlässigkeit. Begründeter Ersatz 120 EUR an Noor. Beide Ansprüche sind zivilrechtlicher Schadensersatz, keine Geldstrafe an den Staat. **8 BE: je Fall zutreffende Eigentums-/Widerrechtlichkeits-/Ursacheinordnung 2, zutreffendes Verschulden mit gegebener Einsicht 1, Betrag und Empfänger 1 (je 4).**

2. A erfüllt nach den feststehenden Tatsachen die vorsätzliche rechtswidrige Beschädigung einer fremden Sache. B enthält keinen Vorsatz; nach § 303 in Verbindung mit § 15 ist bloße Fahrlässigkeit hier nicht strafbar. Daraus folgt kein allgemeines Urteil über sämtliche Straftatbestände. Mit 17 ist Lara Jugendliche; ihre erforderliche Reife ist gegeben, eine konkrete Sanktion aber nicht bestimmbar. JGG-Reaktionen sind keine automatisch anzuwendende Erwachsenenstrafe. Schadensersatz beantwortet den Ersatzanspruch und erledigt nicht automatisch jede strafrechtliche Folge; eine etwaige Berücksichtigung der Wiedergutmachung wäre gesondert zu prüfen. **8 BE: A mit Vorsatz 2, B ohne Vorsatz und erste Behauptung zurückgewiesen 2, Jugendalter/Reife und keine bestimmte Sanktion 2, Ersatz versus Ahndung und zweite Behauptung zurückgewiesen 2.**

3. In der Variante fehlt die gegebene Fahrlässigkeit; ohne Vorsatz oder Fahrlässigkeit ist der hier betrachtete Anspruch aus § 823 Abs. 1 nicht begründet. Ein Schaden allein genügt nicht. Für § 303 fehlt weiterhin Vorsatz. A: Nach den vorgegebenen Tatsachen spricht der Fall für zivilrechtlichen Ersatz 180 EUR an Ben und eine eigenständige jugendstrafrechtliche Prüfung, ohne eine bestimmte Reaktion vorwegzunehmen. Zusätzlich nötig wären etwa weitere Tat-/Persönlichkeitsumstände und Informationen, anhand derer die Eignung erzieherischer Reaktionen beurteilt werden kann. Andere sachgerechte zusätzliche Informationen sind gleichwertig. **8 BE: fehlendes Verschulden mit veränderter zivilrechtlicher Einordnung 2, strafrechtliche Variante und kein Schluss aus Schaden allein 2, getrennte vorläufige Zusammenfassung A 2, passende Zusatzinformation mit Entscheidungsbezug 2.**
'''

online_task = '''**Fall: Ein öffentlicher Werbepost für eine private Feier**

Alle Personen und Vorhaben sind erfunden. Eine volljährige Projektgruppe möchte außerhalb des Unterrichts auf ihrem für alle erreichbaren privaten Social-Media-Konto eine private Feier bewerben. Der Post ist kein Unterricht und keine Präsentation von Unterrichts- oder Lernergebnissen an einer Bildungseinrichtung. Geprüft werden die ausdrücklich bereitgestellten Urheber- und Bildnisregeln; das Ergebnis ist keine umfassende rechtliche Freigabe der Veranstaltung.

**Material 1 – geplante Bestandteile:**

| Bestandteil | Feststehende Angaben |
| --- | --- |
| Illustration eines fremden Künstlers | Ein geschütztes veröffentlichtes Werk aus dessen Portfolio. Die Gruppe hat es heruntergeladen; es gibt keine Nutzungslizenz oder individuelle Erlaubnis für den Post. Der Name und ein Link sollen angegeben werden. |
| Foto der volljährigen Alex und Bea | Die Fotografin hat der Gruppe die urheberrechtliche Nutzung genau dieses Fotos für den öffentlichen Post schriftlich erlaubt. Bea hat auch als abgebildete Person der öffentlichen Veröffentlichung zugestimmt. Alex hat nur der Verwendung im geschlossenen Unterricht zugestimmt und lehnt den öffentlichen Post ausdrücklich ab. Beide Personen sind klar erkennbar. |

Es handelt sich um ein gezielt aufgenommenes Porträt, kein Bild aus einem Versammlungs-/Zeitgeschehen und keine Abbildung bloßen Beiwerks. Eine Ausnahme von der Bildniseinwilligung ist im Fall nicht gegeben. Die Gruppe besitzt keine weitere Erlaubnis. Für eine Ersatzgestaltung könnte sie eine vollständig eigene Zeichnung ohne fremde geschützte Elemente erstellen und das Personenfoto vollständig weglassen.

**Material 2 – aktuelle bereitgestellte Regeln, sinngemäß:**

- §§ 15 und 19a UrhG ordnen die Nutzung eines geschützten Werks und das öffentliche Zugänglichmachen grundsätzlich den Urheberrechten zu. Ein allgemein erreichbarer Post ist im vorgegebenen Fall öffentlich zugänglich. Quellenangabe und technisch möglicher Download ersetzen keine benötigte Nutzungsbefugnis. Eine im Fall einschlägige gesetzliche Nutzungserlaubnis liegt für den Werbepost nicht vor.
- § 22 KunstUrhG verlangt grundsätzlich die Einwilligung erkennbar abgebildeter Personen zur Verbreitung bzw. öffentlichen Zurschaustellung ihres Bildnisses. Der Zweck und Umfang einer gegebenen Zustimmung sind zu beachten. Urheberrechtliche Erlaubnis der Fotografin und Einwilligung der abgebildeten Personen sind getrennt zu prüfen.
- § 60a UrhG erlaubt unter seinen Bedingungen bestimmte nicht kommerzielle Unterrichtsnutzungen; Abbildungen können dabei unter Absatz 2 vollständig genutzt werden. Eine solche Unterrichtserlaubnis ist keine allgemeine Erlaubnis für den hier ausdrücklich außerschulischen öffentlichen Werbepost. Aus „früher im Unterricht benutzt“ folgt nicht „überall öffentlich verwenden“.

Quellen: [§ 15 UrhG](https://www.gesetze-im-internet.de/urhg/__15.html), [§ 19a UrhG](https://www.gesetze-im-internet.de/urhg/__19a.html), [§ 22 KunstUrhG](https://www.gesetze-im-internet.de/kunsturhg/__22.html), [§ 23 KunstUrhG](https://www.gesetze-im-internet.de/kunsturhg/__23.html), [§ 60a UrhG](https://www.gesetze-im-internet.de/urhg/__60a.html). Stand der bereitgestellten Rechtshilfe: 9. Oktober 2026.

**Aufgaben – 24 BE:**

1. Prüfen Sie beide Bestandteile getrennt anhand von Urheberrecht und Bildnisrechten. Begründen Sie, ob die Gruppe die jeweils nötige Befugnis für genau den geplanten öffentlichen Post nachgewiesen hat. **(8 BE)**
2. Prüfen Sie die Behauptungen „Der Künstlername macht die Illustration frei nutzbar“, „Die Fotografin entscheidet allein über jede Veröffentlichung des Porträts“ und „Ein Schulprojekt darf seine Bilder anschließend überall öffentlich verwenden“. Grenzen Sie den früheren Unterrichtszweck vom jetzigen Werbepost ab. **(8 BE)**
3. Entwickeln Sie eine im Umfang dieser Rechte tragfähige Ersatzgestaltung und einen kurzen Prüfablauf vor Veröffentlichung. Nennen Sie eine Zusatzbedingung, unter der das ursprüngliche Foto verwendet werden könnte, und erklären Sie, wie Sie auf Alex' ausdrückliche Ablehnung reagieren. **(8 BE)**
'''

online_solution = '''1. Illustration: geschütztes fremdes Werk, öffentliche Nutzung des Werks und keine Lizenz/Erlaubnis oder einschlägige gesetzliche Nutzungserlaubnis; der vorgelegte Befugnisnachweis fehlt. Foto: Die benötigte urheberrechtliche Erlaubnis der Fotografin ist für diesen Post gegeben. Bea stimmt als abgebildete Person zu; Alex stimmt nur einem anderen Zweck zu und lehnt diesen öffentlichen Zweck ab. Die nötige Bildniseinwilligung aller erkennbaren Personen fehlt. Daher sind beide Bestandteile in dieser konkreten Form für den Post im betrachteten Rechteumfang nicht tragfähig. **8 BE: Illustration geschütztes Werk/öffentliche Nutzung und fehlende Befugnis 3, Foto urheberrechtliche Befugnis 1, getrennte Einwilligungen Bea/Alex mit Zweckgrenze 3, materialgebundene Schlussfolgerung 1.**

2. Alle drei pauschalen Behauptungen sind im Fall falsch. Attribution benennt die Herkunft, ersetzt die fehlende Nutzungsbefugnis aber nicht. Die Fotografin kann die ihr zustehende urheberrechtliche Nutzung erlauben; die Bildnisrechte der erkennbaren Personen bleiben eigenständig. Eine begrenzte Unterrichtsnutzung nach § 60a trägt nicht automatisch die außerschulische öffentliche Werbung. Das Material behauptet ausdrücklich keine allgemeine Grenze, nach der jede Abbildung im Unterricht nur zu 15 Prozent nutzbar wäre; Absatz 2 kann Abbildungen vollständig erfassen. Hier fehlen dennoch die Voraussetzungen für den späteren Werbepost. **8 BE: Attribution versus Befugnis 2, Foto-Urheberrecht versus Bildniseinwilligung 2, Unterrichtsbedingungen versus öffentlicher Werbezweck 3, keine erfundene pauschale 15-Prozent-Bildregel 1.**

3. Möglich ist die bereitgestellte vollständig eigene Zeichnung ohne fremde geschützte Elemente und ein Post ohne Personenfoto. Prüffolge: Bestandteile und Rechteinhaber bestimmen; genaue beabsichtigte Nutzung benennen; passende Befugnisse sowie erforderliche zweckbezogene Bildniseinwilligungen prüfen; nur belegte Gestaltung veröffentlichen oder erst ändern/klären. Für das ursprüngliche Foto bräuchte es bei gleichbleibenden übrigen Voraussetzungen eine freiwillige Einwilligung auch von Alex zu genau diesem öffentlichen Post. Diese liegt nicht vor und darf aus früherer Unterrichtszustimmung nicht abgeleitet werden. Auf die erklärte Ablehnung folgt Weglassen des Fotos, kein Druck zur Zustimmung. Andere tatsächlich ausreichend begründete Lösungen sind gleichwertig; eine Quellenangabe allein und eine Zustimmung nur der Fotografin genügen nicht. **8 BE: geeignete Ersatzgestaltung 3, an Nutzungszweck/Rechten gebundener Prüfablauf 3, neue freiwillige Zweckzustimmung als bloße Bedingung mit respektierter Ablehnung 2.**
'''

production_task = '''**Fall: Ein schweres Einzelprodukt und kleine Variantenserien**

Die Produktionsfälle und alle Angaben sind erfunden. Verlangt wird ein Vergleich der bereitgestellten Fertigungsverfahren im jeweiligen Material, keine vollständige Investitions-, Kosten- oder Personalplanung.

**Material 1 – bereitgestellte Verfahren:** Bei Baustellenfertigung bleibt das Produkt am Fertigungsort; passende Arbeitskräfte, Arbeitsmittel und Materialien werden zu ihm gebracht. Bei Inselfertigung sind verschiedene Arbeitsmittel räumlich zu einer Fertigungsgruppe zusammengefasst. Ein koordiniertes Team bearbeitet mehrere zusammenhängende Arbeitsschritte für eine Produkt-/Teilefamilie in dieser Gruppe. Das Material beschreibt damit keine nach Funktionen getrennte Werkstatt und keine zwingende durchgehende Fließlinie.

**Material 2 – Produktfälle:**

- **Fall A:** Ein großer kundenspezifischer Behälter wird auf dem Gelände seines späteren Nutzers aufgebaut. Er kann während der betrachteten Montage nicht zwischen Fertigungsstationen transportiert werden. Fachkräfte für verschiedene Montageabschnitte, ein Kran und Bauteile müssen zeitlich passend am Produktort verfügbar sein. Vorräte dürfen die vereinbarten sicheren Zugangswege nicht blockieren.
- **Fall B:** Ein Betrieb produziert kleine, gut handhabbare Messgeräte in wechselnden Varianten. Die Geräte einer Teilefamilie lassen sich innerhalb eines abgegrenzten Arbeitsbereichs von Hand zwischen Montage, Prüfung und Verpackung bewegen. Alle drei benötigten Arbeitsmittel sind dort verfügbar; das Team ist für diese Schritte qualifiziert und organisiert die Übergaben. Die Raum- und Produktangaben erlauben die beschriebene Fertigungsgruppe. Angaben zu Gesamtkosten, Kapazitätsauslastung oder einer stets optimalen Losgröße fehlen.

**Material 3 – neue Störungen:** Bei A verspätet sich ein für den nächsten Montageschritt benötigtes Bauteil, während der dafür bestellte Kran nur bis zum Abend verfügbar ist. Bei B dauert die Prüfung einer neuen Variante deutlich länger als die Montage; zusätzliche Prüfmittel sind nicht sofort verfügbar. Arbeitskräfte dürfen nur Tätigkeiten übernehmen, für die sie qualifiziert sind. Qualitätsanforderungen und sichere Zugangswege dürfen nicht zugunsten eines schnelleren Plans aufgehoben werden.

**Aufgaben – 24 BE:**

1. Vergleichen Sie Baustellen- und Inselfertigung nach Produktbewegung, räumlicher Anordnung, Arbeitsorganisation und Materialfluss. Beziehen Sie Ihre Aussagen konkret auf A und B. **(8 BE)**
2. Begründen Sie für beide Produktfälle die Eignung des naheliegenden Verfahrens. Nennen Sie für jeden Fall ein wichtiges Koordinationsproblem und grenzen Sie die Behauptung „Inselfertigung ist für jedes Produkt automatisch am kostengünstigsten“ anhand des Materials ein. **(8 BE)**
3. Entwickeln Sie für jede neue Störung eine begründete organisatorische Reaktion innerhalb der Fallbedingungen. Benennen Sie jeweils eine Information, die Sie vor der Entscheidung noch benötigen, und begründen Sie, warum die Störung keinen automatischen Wechsel des ganzen Fertigungsverfahrens erzwingt. **(8 BE)**
'''

production_solution = '''1. Baustelle/A: Produkt bleibt am Ort, verschiedene Fachkräfte und mobile Arbeitsmittel kommen dorthin, Bauteile werden bedarfsgerecht angeliefert; die Schritte benötigen Koordination am gemeinsamen Produkt. Insel/B: mehrere passende Arbeitsmittel für zusammenhängende Schritte liegen in der Gruppe, qualifiziertes Team koordiniert Übergaben, kleine Produkte bewegen sich innerhalb der Insel zwischen Montage/Prüfung/Verpackung. Keine funktionsweise Verteilung auf entfernte Werkstätten und kein durch das Material erzwungenes starres Förderband. **8 BE: je Verfahren richtige Produktbewegung, räumliche Anordnung, Arbeitsorganisation und Materialfluss mit Fallbezug je 1 (je 4).**

2. A: Die Unbeweglichkeit des großen Produkts während der Montage und die Arbeit am späteren Nutzungsort passen zur Baustellenfertigung. Koordination betrifft beispielsweise rechtzeitige Bauteile, Fachkräfte und Kran sowie sichere Zugänge. B: transportierbare verwandte Produkte, vorhandene zusammenhängende Arbeitsmittel und Mehrschrittqualifikation des Teams passen zur Inselfertigung; Varianten und Übergaben müssen geplant werden. Eine Kostenrangfolge folgt nicht allein aus Verfahrensnamen: Produktbedingungen unterscheiden sich, Gesamtkosten und Auslastung fehlen. **8 BE: je fallgebundene Eignungsbegründung 2 (4), je passendes Koordinationsproblem 1 (2), kein automatischer Kostenvorteil mit konkreter Materialgrenze 2.**

3. A: etwa Lieferzeit verbindlich klären, Montagefolge fachlich zulässig umplanen und Kran-/Fachkräfteverfügbarkeit neu abstimmen; keine Montage ohne benötigtes Teil und keine blockierten Zugänge. Zusatzinformation z. B. verlässliche Anlieferzeit oder zulässige alternative Reihenfolge. B: Prüfengpass erkennen, Reihenfolge/Übergaben und zulässige Teamaufteilung prüfen, laufende Montage gegebenenfalls begrenzt drosseln statt unkontrollierte Zwischenbestände anzuhäufen; keine ungeprüften Geräte ausliefern. Zusatzinformation z. B. tatsächliche Prüfzeiten je Variante oder freie qualifizierte Prüfkapazität. Andere schlüssige Reaktionen sind gleichwertig. Der jeweilige Engpass betrifft die Organisation innerhalb der gegebenen Produkt-/Ausrüstungsbedingungen; er beweist noch nicht, dass ein anderes Verfahren machbar oder überlegen wäre. **8 BE: je machbare materialgebundene Reaktion 2 (4), je passende Zusatzinformation 1 (2), je begründete Abgrenzung eines automatischen Verfahrenswechsels 1 (2).**
'''

employment_task = '''**Fall: Vier Beschäftigungsangebote für Minderjährige**

Personen, Unternehmen und Angebote sind erfunden. Alle relevanten Regeln für die verlangten Kriterien stehen unten; keine vollständige Freigabe einer wirklichen Beschäftigung wird verlangt. „Vollzeitschulpflicht“ bezeichnet den im Fall ausdrücklich gegebenen rechtlichen Schulpflichtstatus, nicht bloß den Besuch irgendeiner Schule. Keiner der Fälle ist ein Betriebspraktikum, eine Therapie, eine richterliche Weisung oder eine Berufsausbildung. Andere Sonderausnahmen sind nicht gegeben.

**Material 1 – aktuelle Schutzregeln, sinngemäß:**

- § 2 JArbSchG: Unter 15 ist man Kind im Sinne dieses Gesetzes; von 15 bis unter 18 Jugendlicher. Für Jugendliche unter Vollzeitschulpflicht gelten die Vorschriften für Kinder.
- § 5 Abs. 1 und 3 JArbSchG sowie § 2 KindArbSchV: Kinder dürfen grundsätzlich nicht beschäftigt werden. Für Kinder über 13 ist mit Einwilligung der Sorgeberechtigten eine leichte, geeignete erlaubte Tätigkeit wie Zeitungsaustragen möglich. Sie darf Gesundheit/Entwicklung und Schule nicht beeinträchtigen, höchstens zwei Stunden täglich dauern, nicht zwischen 18 und 8 Uhr und nicht vor oder während des Schulunterrichts liegen. Die Tätigkeit muss außerdem zu den zugelassenen Tätigkeiten der Verordnung gehören. Industrielles Sortieren in einer Druckerei gehört im Fall nicht dazu.
- § 5 Abs. 4 JArbSchG: Vollzeitschulpflichtige Jugendliche dürfen während der Schulferien für höchstens vier Wochen im Kalenderjahr beschäftigt werden; dabei gelten die einschlägigen Jugendschutzregeln. Bereits genutzte Ferienbeschäftigung zählt mit.
- § 8 Abs. 1 JArbSchG: Für die hier betrachteten Jugendlichen grundsätzlich höchstens acht Arbeitsstunden täglich und 40 wöchentlich. Die Fälle enthalten keine einschlägige Ausnahme von diesen Grenzen.
- § 22 Abs. 1 JArbSchG: Verboten sind unter anderem Arbeiten, deren Unfallgefahren Jugendliche wegen mangelnder Erfahrung oder fehlenden Sicherheitsbewusstseins voraussichtlich nicht erkennen oder abwenden können. Ausnahmen im Zusammenhang mit einem Ausbildungsziel werden hier nicht genutzt; ein anwesender Erwachsener macht gefährliche Arbeit nicht automatisch zulässig.

Quellen: [§ 2 JArbSchG](https://www.gesetze-im-internet.de/jarbschg/__2.html), [§ 5 JArbSchG](https://www.gesetze-im-internet.de/jarbschg/__5.html), [§ 8 JArbSchG](https://www.gesetze-im-internet.de/jarbschg/__8.html), [§ 22 JArbSchG](https://www.gesetze-im-internet.de/jarbschg/__22.html), [§ 2 KindArbSchV](https://www.gesetze-im-internet.de/kindarbschv/__2.html). Stand der bereitgestellten Rechtshilfe: 9. Oktober 2026.

**Material 2 – Fälle:**

| Fall | Alter und Schulpflicht | Angebot und feststehende Schutzbedingungen |
| --- | --- | --- |
| A | Ria, 14, vollzeitschulpflichtig | Zeitungsaustragen Montag, Mittwoch und Freitag 16:00–18:30, nach Unterrichtsschluss. Schriftliche Einwilligung liegt vor. Die Tätigkeit ist sonst leicht und geeignet; Gesundheit/Schule werden nicht beeinträchtigt. |
| B | Jo, 16, vollzeitschulpflichtig | Ferienbeschäftigung fünf volle aufeinanderfolgende Wochen, jeweils Montag bis Freitag acht tatsächliche Arbeitsstunden täglich, 40 wöchentlich. Bisher keine Ferienbeschäftigung in diesem Kalenderjahr. Tätigkeiten sind ungefährlich; die übrigen hier nicht zu prüfenden Schutzbedingungen sind eingehalten. |
| C | Kim, 17, keine Vollzeitschulpflicht | Montag bis Freitag je sieben tatsächliche Arbeitsstunden an einer ungeschützten gefährlichen Maschine. Im Fall sind Unfallgefahren gegeben, die Kim mangels Erfahrung nicht erkennen oder abwenden kann. Keine Berufsausbildung; ein erwachsener Kollege ist dabei. |
| D | Sam, 16, Vollzeitschulpflichtstatus unbekannt | Während der regulären Unterrichtswochen industrielles Sortieren in einer Druckerei, Montag bis Freitag je vier Arbeitsstunden. Keine Ferienbeschäftigung. Die Tätigkeit ist sonst sicher und körperlich geeignet. |

**Aufgaben – 24 BE:**

1. Prüfen Sie A nach Alter, Tätigkeitsart, Einwilligung, täglicher Dauer und Zeitlage. Formulieren Sie eine konkrete Anpassung, die die festgestellten Verstöße unter den übrigen gegebenen Bedingungen behebt. **(6 BE)**
2. Prüfen Sie B nach Schulpflichtstatus, Ferienausnahme, Tages-/Wochenarbeitszeit und Jahresdauer. Entwickeln Sie eine begründete begrenzte Korrektur des Angebots. **(6 BE)**
3. Prüfen Sie C nach Altersstatus, Arbeitszeit und Gefährdung. Begründen Sie, ob die Begleitung allein genügt, und nennen Sie eine im Umfang des Materials geeignete Änderung. **(6 BE)**
4. Erklären Sie für D, welche konkrete Information fehlt und wie die beiden möglichen Antworten Ihre Einschätzung verändern. Prüfen Sie die Behauptung „16 Jahre und nur vier Stunden täglich bedeuten immer zulässig“. **(6 BE)**
'''

employment_solution = '''1. Ria ist unter 15 und damit Kind. Über 13, geeignete zugelassene Tätigkeit und Einwilligung sind im Fall gegeben. 16:00–18:30 umfasst 2,5 Stunden und Arbeit nach 18 Uhr; beides verletzt die bereitgestellten Grenzen. Beispielsweise 16:00–18:00 behebt bei unveränderten übrigen Bedingungen beide Verstöße. Diese Korrektur ist eine Einschätzung nur im Umfang der geprüften Kriterien. **6 BE: Kindesstatus/über-13-Ausnahme 1, Tätigkeit/Einwilligung/Schule 1, 2,5 Stunden und Überschreitung der Zweistundengrenze 1, Arbeit nach 18 Uhr 1, konkrete passende Anpassung mit begrenztem Urteil 2.**

2. Jo ist 16, unterliegt aber der Vollzeitschulpflicht; die Kinderregeln sind Ausgangspunkt. In den Ferien greift die bereitgestellte Jugendlichenausnahme mit höchstens vier Wochen im Kalenderjahr. Acht tatsächliche Stunden täglich und 40 wöchentlich überschreiten die vorgegebenen Zeitgrenzen nicht. Fünf volle Wochen sind dennoch zu lang. Bei bisher null Ferienwochen lässt sich das Angebot im betrachteten Umfang auf höchstens vier Wochen kürzen; Alter oder eingehaltene Stunden machen fünf Wochen nicht zulässig. **6 BE: Jugendalter mit schulpflichtbedingten Kinderregeln 1, Ferienausnahme und Kalenderjahresgrenze 2, richtige Tages-/Wochenzeitprüfung 1, Überschreitung und konkrete Vierwochenkorrektur 2.**

3. Kim ist Jugendlicher ohne Vollzeitschulpflicht. Sieben Stunden täglich und 35 wöchentlich liegen innerhalb der gegebenen 8-/40-Grenzen. Die beschriebene nicht beherrschte Unfallgefährdung ist dennoch verboten. Keine Ausbildungsziel-Ausnahme ist gegeben; ein erwachsener Kollege allein beseitigt den Verbotstatbestand nicht. Beispielsweise eine tatsächlich sichere, geeignete andere Tätigkeit innerhalb derselben Zeitgrenzen ist eine passende Änderung. Das bloße Versprechen, vorsichtig zu sein, reicht nicht. **6 BE: Jugendstatus 1, 7/35 und Zeitgrenzen 1, konkrete §-22-Gefährdung 2, keine Begleitungsautomatik/Ausbildungsziel-Ausnahme 1, sichere geeignete Ersatzaufgabe 1.**

4. Es fehlt Sams rechtlicher Vollzeitschulpflichtstatus. Falls vollzeitschulpflichtig, gelten Kinderregeln; industrielle Sortierarbeit gehört nicht zu den bereitgestellten erlaubten Kindertätigkeiten, und die Ferienausnahme greift außerhalb der Ferien nicht. Vier Stunden würden außerdem nicht die Zweistundengrenze der gegebenen leichten Ausnahme erfüllen. Falls nicht vollzeitschulpflichtig, ist Sam Jugendlicher mit allgemeinem 8-/40-Rahmen: vier täglich, 20 wöchentlich und die gegebenen sicheren Bedingungen stehen den betrachteten Kriterien nicht entgegen. Daraus folgt keine vollständige Beschäftigungsfreigabe außerhalb des Materialumfangs. Die pauschale Behauptung ist falsch, weil Schulpflicht, Tätigkeit und Schutzbedingungen neben Alter und Stunden entscheiden. **6 BE: präzise fehlender Schulpflichtstatus 1, schulpflichtige Variante mit konkreten unpassenden Ausnahmen/Grenzen 2, nicht schulpflichtige Variante mit 4/20 und begrenztem Urteil 2, Behauptung materialgebunden zurückgewiesen 1.**
'''

bodies = [
    (damage_task, damage_solution, ['c73bc13e-6871-50c3-82d3-90283f1f54ce','7159ae22-e6ac-54e6-8b62-9b697310cc5f'], ['Normanwendung und zivilrechtlicher Ersatz in zwei Schadensfällen','Vorsatz, Fahrlässigkeit und Jugendstrafrechtsgrenze','Veränderte Verschuldenslage und begrenztes vorläufiges Urteil'], [8,8,8]),
    (online_task, online_solution, ['3a6568d2-9f94-5574-8996-9ebac0bc0b3e','f6a445cb-50d9-5d22-80af-e669509758b0'], ['Getrennte Urheber- und zweckbezogene Bildnisrechte','Attribution, Unterrichtszweck und öffentlicher Werbepost','Rechtegebundene Ersatzgestaltung und Prüfablauf'], [8,8,8]),
    (production_task, production_solution, ['8964ef4b-5056-5449-8a6c-7c5d97f698be'], ['Vergleich von Produktbewegung, Organisation und Materialfluss','Fallgebundene Verfahrenseignung und Grenzen der Kostenbehauptung','Organisatorische Reaktion auf zwei konkrete Engpässe'], [8,8,8]),
    (employment_task, employment_solution, ['71319337-18ad-5774-8347-4e1a078fc29a'], ['Kindertätigkeit, Einwilligung und tägliche Zeitlage','Vollzeitschulpflicht, Ferienausnahme und Jahresgrenze','Arbeitszeit und eigenständig geprüfte Unfallgefährdung','Fehlender Schulpflichtstatus und bedingte Einordnung'], [6,6,6,6]),
]
new = []
for outline,(task,solution,covered,labels,points) in zip(outlines,bodies):
    g = copy.deepcopy(outline)
    g['examData'] = {'reviewStatus':'draft','coveredGoalIds':covered,'coveredStrands':['WW_WIRTSCHAFT'] if len(new)==2 else ['WW_RECHT'],'demandLevels':['AB1','AB2','AB3'],'taskContent':task,'solutionContent':solution,'scoring':{'maxPoints':24,'passingPoints':15,'steps':[{'id':f's{i+1}','points':p,'description':label} for i,(label,p) in enumerate(zip(labels,points))]}}
    new.append(g)
write('whole-four-new-terminal-DRAFT-assessments.author.candidate.json', new)

generic = [g for g in read('inputs/10-whole-goals.candidate.json') if g['id'] in ['8964ef4b-5056-5449-8a6c-7c5d97f698be','71319337-18ad-5774-8347-4e1a078fc29a']]
write('whole-two-prerequisite-targets.exact-existing-Generic10-v3.candidate.json',generic)
nav = copy.deepcopy(next(g for g in before['goals'] if g['id']=='f8922e23-f00e-53f7-be2f-1016e2b0ddf2'))
nav.update({'title':'BY: Übungen zu abgegrenzten Wirtschafts- und Rechtskompetenzen','titleEn':'BY: practice in defined economic and legal competencies','description':'Bündelt sieben eigenständige materialgestützte Übungsabschlüsse zu Haushalts-, Markt- und Verhaltenskompetenzen, grundlegenden Rechtsfällen sowie ausdrücklich ausgewählten Fertigungs- und Beschäftigungskompetenzen. Der Navigationscluster erhebt keinen zusätzlichen fachlichen Kompetenzanspruch.','descriptionEn':'Groups seven independent material-based practice assessments in household, market and behavioural competencies, basic legal cases and explicitly selected production and employment competencies. This navigation cluster asserts no additional subject competence.'})
nav['contains'] += [g['id'] for g in new]
write('whole-existing-neutral-BY-practice-navigation.seven-endpoints.candidate.json',nav)
candidate = copy.deepcopy(before)
replacement={g['id']:g for g in generic+[nav]}
candidate['goals']=[replacement.get(g['id'],g) for g in candidate['goals']]+new
write('whole-current389-plus-four-DRAFT-terminals-and-only-two-Generic-v3.inert.candidate.json',candidate)
views=[]
for n,name in [(6,'de-de-gym-economics-gk.view.json'),(7,'de-de-gym-economics-lk.view.json')]:
    v=read(f'inputs/{n:02d}-{name}')
    def visit(nodes):
        for x in nodes:
            if x.get('goalId')==nav['id']:x['displayLabel']='BY: abgegrenzte Wirtschafts- und Rechtsübungen'
            visit(x.get('children',[]))
    visit(v['rootNodes']);write('candidate-'+name,v);views.append({'originalPath':'curricula/DE/Gymnasium/composition-views/wirtschaft/'+name,'candidatePath':str(base / ('candidate-'+name))})
write('actual-minimal-field-edits-and-source-scope-obligations.author.json',{'schemaVersion':1,'status':'inert-author-candidate-needs-independent-review','author':'/root/economics_independent_continuation_a','canonicalExistingGoalEdits':[{'goalId':g['id'],'changedFields':[k for k in set(g)|set(next(x for x in before['goals'] if x['id']==g['id'])) if g.get(k)!=next(x for x in before['goals'] if x['id']==g['id']).get(k)]} for g in generic+[nav]],'newTerminalGoalIds':[g['id'] for g in new],'candidateViewLabelEdits':views,'requiredLiveCodeEdits':[],'retainedWholeExistingGoalCount':386,'denominatorUnchangedIntended':311,'ordinaryLegalWholeGoalsUnchanged':['c73bc13e-6871-50c3-82d3-90283f1f54ce','7159ae22-e6ac-54e6-8b62-9b697310cc5f','3a6568d2-9f94-5574-8996-9ebac0bc0b3e','f6a445cb-50d9-5d22-80af-e669509758b0'],'assessmentReleaseStatus':'draft','humanReview':'pending','descriptionReview':'not-performed-on-own-changes','strictNetIncrease':0,'sourceCourseNotes':['Four ordinary legal atoms remain bound to the actual WR8 Lernbereich3 primary expectations. Their whole bytes are preserved. No fresh full source or course claim is made.','8964/713 are exact bytes of the already authored Generic10-v3 operationalizations of two explicitly selected WR8 optional-profile contents; neither covers all profile options. Their historical direct exact mappings need independently reviewed bounded partial successors, not an automatic hash update.','Assessment applicability derives from actual required goals through applicabilityFromRequires; it is not direct source coverage. The navigation boundary and empty requires are retained.','GK/LK tags are the existing national technical projection markers; the real WR8 primary is SekI with unspecified course and an optional WWG profile. No statutory GK/LK split or nationwide compulsory status is claimed.','Foreign-jurisdiction historical source tuples for 8964/713 must be carried from Generic10-v3 dispositions and independently resolved; this package does not approve or delete live foreign source decisions.'],'remainingGateObligations':['Independent full assessment-material/rubric/source validation for each of the four new DRAFT endpoints; then truthful machine-only release successor, human gates still pending.','Independent dual descriptions for the final two concrete profile ownerpages and targeted actual changed strict ownerpage contexts; the author must not approve its own terminal/navigation text.','Current positive-understanding-evidence-v2 for 8964/713 and all truly changed owner/context bindings; retain unchanged profiles and descriptions. No synthetic extra P closure for an assessment is claimed.','Semantic classification proposals practiceAssessment for four new goals and unchanged curricularAtomic311, plus individual AM decisions for 8964/713. Current memory scope/card visibility checks must pass; supplied norms and definitions mean no required extra recall deck in this author proposal.','Current independently reviewed actual illustrations for the two specific profile goals and retained visual bindings for the four unchanged legal atoms. New assessment presentation/visual requirements must be decided under the same native scope rather than assumed exempt.','Native global route, local target-only terminal visibility, source closure, dependent Layer-A and full central checks at stable integration; source/course openness cannot be hidden by a disabled local-route flag.']})
print('Wrote four DRAFT assessments, two byte-exact Generic10-v3 targets, one navigation successor and two display-label-only views. No live writes or review approvals.')
