# Unabhängige Inhaltsprüfung A: zusätzliche Sinus-/Kosinusaufgabe

15. November 2026, 2026-11-15T14:51:51.944933+01:00, Europe/Berlin. Entscheidung:
**Begrenzter unabhängiger Inhalts-PASS**, kein konkreter Inhaltsblocker.

Geprüft wurde ausschließlich die neue Aufgabe
`cb567b03-b590-5ae9-9d1e-9864d02fb3af` zum vollständigen primären Ziel
`5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11`. Eingangsmanifest:
`tmp/math-sine-cosine-assessment-20261115-v1/sealed-input-manifest.json`,
SHA-256 `985fc2ae7e6cde1f75c0c425b42a07ed4fb5fdd2d945d36081317a5700e3e127`.
Alle zehn eigenen und der eine externe Eingangspin stimmen vor und nach der
Prüfung exakt überein. Die sieben in V4 gepinnten V3-Prüfdokumente sowie alle
69 eigenen V4- und zehn eigenen V5-Prüfdateien bleiben unverändert. Diese
Prüfung schreibt ausschließlich in ihr neues eigenes TMP-Verzeichnis.

Dies ist eine echte eigenständige KI-Inhaltsprüfung des Codex-Reviewagenten A,
keine menschliche Freigabe und keine neue native D/P/SEM/A/B/M/V-Abnahme.
Ich las das vollständige gewöhnliche Ziel und den vollständigen bestehenden
P-Datensatz in DE/EN, die gesamte tatsächliche Aufgabe und Lösung beider
Sprachen und sämtliche acht tatsächlich vom Backend gelesenen bilingualen
Rubrikfelder `scoring.steps[].description`. Der volle gewöhnliche Zielzustand
und volle P-Datensatz wurden direkt mit dem gepinnten nativen Autoreninput
verglichen und sind unverändert. Ein historischer Fingerprint wurde dabei
nicht durch einen heutigen Wert ersetzt.

Der vollständige P beansprucht zwei Familien von Verständnis. Beide werden
in **zwei tatsächlichen unabhängigen Fällen** erhoben:

| Vollständige P-Erwartung | Fall A | Fall B |
|---|---|---|
| Periodische Grundmerkmale beider Funktionen in Term und selbst ergänztem Graph | Zwei eigene glatte Graphen auf [0,4π], Periode/Wertebereich/alle charakteristischen Stellen und je zwei Wiederholungspaare | Tatsächlich gelieferte negative Graphen, eigene Fortsetzungen und erneut vollständige Merkmale auf [−2π,2π] |
| Verschiedene Grundfunktionen mit korrekter Phasenbeziehung | Richtige Termgleichung, Richtung und zwei geprüfte Wertepaare | Eigenständige falsche Beschriftungen aus je zwei negativen Grafikwerten diagnostizieren und Phase an zwei negativen Paaren belegen |

Fall B ist keine bloße Wiederholung der Namen aus A: Die andere
Darstellungsrichtung, negative Argumente, überprüfbaren falschen Labels und
eigene rechte Fortsetzung sind ausdrückliche Anforderungen. Eine richtige
Tabelle ohne eigene Graphen genügt ebenso wenig wie richtige Namen ohne
negative Grafikbelege. Differentialrechnung wird weder verlangt noch durch
zusätzliche Voraussetzungen eingeschleust. Die neue Aufgabe benötigt und
beansprucht ausschließlich das eine vollständige primäre Ziel.

Das tatsächliche PNG wurde geöffnet und visuell geprüft: Beide blauen Kurven
sind gut lesbar; U steigt ab −2π durch 0, erreicht bei −3π/2 den Wert1 und
bei −π/2 den Wert−1. V beginnt bei −2π mit1, erreicht bei −π den Wert−1
und bei0 wieder1. Die beiden gedruckten falschen Gleichungen sind klar als
„zu prüfen / label to check“ gekennzeichnet. Negative Bogenmaß-Ticks und
Werte −1,0,1 sind sichtbar. Die rechten grauen Hälften enthalten nur die
zweisprachige Aufforderung zum Selbstergänzen. Die gemeinsame untere x-Achse
lässt die Werte beider übereinanderliegenden Diagramme eindeutig ablesen.

Auch die tatsächliche SVG-Datei wurde unabhängig auf ihre Geometrie geprüft:
73 U- und72 V-Kurvenpunkte entsprechen nach Rückrechnung der Achsen den
Funktionen sin x beziehungsweise cos x. Die maximalen absoluten Fehler an
den tatsächlichen Pfadstützpunkten betragen etwa **1,69·10⁻⁸** und
**1,33·10⁻⁸**, passend zur SVG-Koordinatenrundung. Beide Funktionspfade enden
bei x=0; in den grauen rechten Bereichen ist kein Lösungsgraph vorgegeben.
Das ist ein lokaler Bild-/Quellbefund, keine Aussage über Browser-, Host-
oder Lernendendarstellung und keine pauschale neue V-Freigabe.

Die Mathematik wurde unabhängig geprüft. Sine hat Nullstellen kπ,
Hochstellen π/2+2kπ und Tiefstellen3π/2+2kπ; cosine hat Nullstellen
π/2+kπ, Hochstellen2kπ und Tiefstellenπ+2kπ. Die vollständigen aufgezählten
Mengen für beide Prüfintervalle, einschließlich der Funktionsmaxima an den
Ausschnitträndern, stimmen. Es geht ausdrücklich um die auf ℝ definierten
Grundfunktionen, sodass daraus keine neue einseitige Randextremumsregel
abgeleitet wird. π ist wegen der gegensätzlichen Werte kein Zeitraum der
Wiederholung;4π ist eine Periode, aber2π die kleinste positive. Die Aufgabe
verwechselt gleiche Einzelwerte nicht mit der Wiederholung des gesamten
Grundfunktionsverlaufs.

cos x=sin(x+π/2) verschiebt Sinus links zum Kosinus. Ebenso richtig ist
sin x=cos(x−π/2), also Kosinus rechts zum Sinus. Für B sind etwa
U(−π)=V(−3π/2)=0 und U(−π/2)=V(−π)=−1 geeignete vollständige negative
Kontrollpaare. Die alternative ganze Periodenverschiebung
cos x=sin(x−3π/2) ist ebenfalls korrekt und durch die geschriebenen Rubriken
zugelassen. Gleichwertige Handskizzen und harmlose Maßstabsungenauigkeit sind
explizit gestattet; ein bestimmter digitaler Graphikerzeuger wird nicht verlangt.

Die Begrenzung des Punkteinferenz-Schlusses ist korrekt: sin(5x) trifft die
fünf angegebenen Sinuswerte bei0,π/2,π,3π/2,2π genauso, unterscheidet sich
aber etwa beiπ/4 von sin x um−√2. Es ist deshalb ein konkretes Gegenbeispiel
zum uneingeschränkten Schluss aus endlich vielen Punkten. Für die tatsächlich
gelieferten U/V-Kurven ist sin(5x) dagegen **kein** zulässiger Kandidat,
weil die Einschränkung auf unveränderten Sinus/Kosinus ausdrücklich gegeben
ist. Eine faire Antwort darf klarstellen, dass die gegebenen Kandidaten unter
dieser Einschränkung eindeutig unterscheidbar sind, während der allgemeinere
Satz über jede beliebige Kurve falsch ist. Das erklärt die Rolle der Annahme,
was dem P-Anspruch und der Rubrik entspricht.

Die acht Rubrikblöcke wurden jeweils gegen einen eigenen konkreten schwachen
Antworttyp geprüft. Die vollständigen Beispiele stehen in
`independent-written-counteranswers-and-fair-alternatives.json`:

| Block | Konkret fehlender oder falscher Kern |
|---|---|
| A eigene Graphen | Nur Wertetabellen und richtige Texte ohne die beiden eigenen Graphen |
| A Merkmale | Kosinusnullstellen fälschlich bei kπ |
| A Periodenbegründung | Je nur ein Wertepaar und keine π/4π-Prüfung |
| A Phase | Falsches cos x=sin(x−π/2) mit falscher Richtung |
| B Diagnose | Richtige Funktionsnamen ohne die verlangten negativen Grafikvergleiche |
| B Ergänzung | Rechte graue Graphenbereiche bleiben leer |
| B Merkmale/Phase | Keine eigenständigen negativen Phasenkontrollpaare |
| B Schlussgrenze | Beliebige Kurven aus fünf Punkten eindeutig zur Sinusgrundfunktion erklären |

Jeder dieser Kerne ist tatsächlich gefragt und im zuständigen Runtime-Feld
benannt. Unter den geschriebenen Anweisungen erhält der betroffene Block0/2;
selbst mit allen übrigen Blöcken vollständig bleiben höchstens **14/16<15**.
Damit wurde nicht bloß aus einer hohen Bestehensgrenze auf Vollständigkeit
geschlossen: Die notwendige Erhebung und konkrete Verluststelle sind für jeden
Fall benannt. Eine isolierte echte nebensächliche Schreib-/Zeichenabweichung
bei weiterhin eindeutig erbrachtem Kern darf1/2 und insgesamt **15/16**
erhalten. Verständliche Maßstabsungenauigkeit ist ausdrücklich kein solcher
Fehler. Die vollständigen umgekehrten und periodenäquivalenten Phasenformen
bleiben bei vollständiger übriger Arbeit mit16/16 zulässig. Diese Zahlen sind
**bedingte schriftliche Rubrikurteile**, keine beobachteten Lernenden-, LLM-
oder Servernoten und keine serverseitig erzwungenen Teilminima.

Die deutschen und englischen Texte entsprechen sich mathematisch in
Argumentbereichen, vollständigen Merkmalsanforderungen, Einschränkungen,
Alternativen und Fehlertoleranz. Alle acht Runtime-Beschreibungen enthalten
die tatsächlichen englischen Bewertungsanweisungen. Die bloße Existenz von
Übersetzungsfeldern wurde nicht als Paritätsnachweis behandelt.

Der eigene Lauf `check-mathematics-and-svg.py` lief von
2026-11-15T14:46:53.152890+01:00 bis 2026-11-15T14:46:53.890551+01:00 mit **Exit 0**. Er prüfte
exakte trigonometrische Identitäten, komplette Merkmalsmengen, negative Werte,
Phasenalternativen, das konkrete endliche Punkte-Gegenbeispiel, den vollen
P-/Zielabgleich und die tatsächlichen SVG-Pfadkoordinaten. Kommando, Uhrzeit,
Arbeitsverzeichnis, Originalausgabe und Exitcode sind erhalten. Der native
Schema-PASS und die13 symbolischen Autorprüfungen werden als Autorenbeleg
getrennt geführt; sie sind nicht das unabhängige Inhaltsurteil.

Der bereitgestellte öffentliche V5-Kausalbeleg beschreibt die sechs neuen
`no_remaining_demand`-Work-Waiver für das unverändert legitime Ziel nach
Entfernung einer unpassenden Ableitungsroute. Dieser Inhaltspass beweist
**nicht**, dass die neue Aufgabe dort tatsächlich als Target startet oder
die Waiver beseitigt. Die eigene neue Aufgabe darf fehlende Coverage beheben;
eine erfundene neue Voraussetzung oder Rückkehr zu falscher Stufenzuordnung
ist dafür nicht erforderlich. Die tatsächliche Quellen-/Länderplatzierung,
Sichtintegration und der frische öffentliche Nachlauf liegen weiter beim
Root-Agenten. Das übernommene technische `phase=J10` ist hier keine neue
Freigabe universeller J10-Zuordnung.

Für die Integration muss zudem die referenzierte Grafik tatsächlich beim
Lernenden ankommen: `taskContent` nennt den SVG-Pfad als Text und
`resourceLinks` bindet ihn als assessment-material. Dieser Review prüfte die
lokalen gepinnten PNG-/SVG-Bytes, keinen öffentlichen Renderer und keine
Hostauslieferung. Daraus wird kein unbeobachteter Darstellungsfehler erfunden,
aber auch keine sichtbare Auslieferung behauptet.

Offen bleiben Taskfreigabe im aktiven Katalog, echte Quellen-/Stufenzuordnung,
aktuelle native D/P/SEM/A/B/M/V-Bindungen und Floors, kombinierte Runtime-
und Integrationsprüfung sowie Merge und frische erfolgreiche Main-CI.
Aktive Quellenänderungen dieser Prüfung:0; Lernendenresultat-Writes:0;
aktivierte reale Pläne:0; gemessene Rückgriffseffekte:0. Der Kandidat und die
V3-/V4-/V5-Reviewhistorie wurden nicht geändert.
