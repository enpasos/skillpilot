# Unabhängige V5-Deltaprüfung: zwei Mathematikaufgaben

15. November 2026, 2026-11-15T14:21:35.605150+01:00, Europe/Berlin. Entscheidung:
**Begrenzter unabhängiger Inhalts-PASS für beide geänderten Aufgaben. C8 und C9 geschlossen.**

Prüfeingang ist `tmp/math-stage-v5-two-task-correction-20261115/sealed-input-manifest.json`,
SHA-256 `9270bb0c31d9df80a8e50601a4aa5f5b52ec00381d86b80079053f298fe56e5c`.
Die acht Eingangspins stimmen vor und nach der Prüfung exakt überein. Auch der
vollständige V4-Eingang mit 9.731+44 Pins und der unveränderte versiegelte
unabhängige V4-Review mit 69+9 Pins wurden am Ende erneut geprüft: keine
Abweichung. Der alte V4-REVISE-Bericht bleibt unverändert erhalten.

Die Prüfung stammt von einem unabhängigen Codex-KI-Reviewagenten; sie ist
keine menschliche Fachfreigabe. Ich las beide vollständigen bilingualen
gewöhnlichen P-Profile, beide vollständigen deutschen und englischen
Aufgaben und Lösungen sowie alle vier tatsächlich vom Backend gelesenen
bilingualen `scoring.steps[].description`-Felder erneut. Die Autorenaussagen
wurden nicht als Abnahmeorakel verwendet.

| Aufgabe | Primäres Ziel | Entscheidung |
|---|---|---|
| `9dbb9fd3-a93f-53ca-82d6-bf0e0e16e9d9` | `7f11ffe0-7c43-4507-9101-50374a60b0e8` | C8 geschlossen; vollständiger tatsächlicher Modellierungsfall ist konsistent |
| `9a42d9cd-2c17-514b-879e-2686b29d86f2` | `e322310f-f33a-485d-bc23-2412a6b8fa12` | C9 geschlossen; distributive Begründung wird tatsächlich erhoben und bewertet |

Die Zeitfenster **[0,12] und [24,36] h überlappen nicht**. Das erste Modell
w₁(t)=3,2+1,1sin(πt/6) reproduziert exakt 3,2;4,3;3,2;2,1;3,2 m. Seine
unveränderte Fortsetzung liegt bei allen fünf späteren Beobachtungen um
0,3 m zu niedrig. Das zweite Modell
w₂(t)=3,5+1,1sin(π(t−24)/6) reproduziert exakt 3,5;4,6;3,5;2,4;3,5 m.
Amplitude und Periode bleiben gleich, das Grundniveau wird datenbegründet
verändert. Die durchgehende, gleichförmig phasenfortschreitende Beobachtung
ist wirklich im Auftrag enthalten; die fünf isolierten Punkte werden nicht
als mathematisch eindeutige Modellbestimmung ausgegeben. Beide tatsächlichen
Sprachfassungen verlangen den neuen Modellterm und seinen eindeutigen
Zeitbezug; das bloße Beschränken des ersten Modells genügt ausdrücklich nicht.
Der unabhängige Riesenradfall und seine verlangte Skizze über zwei Perioden
bleiben erhalten.

Die neue Aufgabe behauptet weder einen Sprung bei 12 h noch beobachtete
Daten für die Lücke. Als eigener mathematischer Gegencheck wurden zwei
verschiedene **C¹-stetige** Ergänzungen konstruiert, die an 12 h und 24 h
sogar dieselben Ableitungen wie die Fenstermodelle haben. Bei 18 h liefern
sie 3,35 m beziehungsweise 3,36875 m. Beide erfüllen alle gegebenen
Beobachtungen; der Lückenverlauf ist daher selbst unter dieser zusätzlichen
Glattheitsanforderung nicht eindeutig. Diese Konstruktionen sind eigene
mathematische Beispiele und keine Behauptung über ein reales Gewässer.
Die späteren Formen 3,5+1,1cos(π(t−27)/6) und
3,5−1,1sin(π(t−30)/6) wurden unabhängig symbolisch auf Äquivalenz geprüft.
Sie sind faire richtige Alternativen, sofern sämtliche übrigen Anforderungen
geleistet werden.

Die Binomaufgabe verlangt nun wirklich das Produkt zweier Klammern, alle
vier distributiven Produkte und die Erklärung der beiden Kreuzprodukte:
(2x)(2x), (2x)(−3), (−3)(2x), (−3)(−3) ergeben
4x², −6x, −6x, 9. Aus den beiden mittleren Produkten folgt −12x. Damit ist
die Identität begründet und darf umgekehrt faktorisiert werden. Die Aufgabe
unterscheidet ausdrücklich einen allgemein gültigen Identitätsschritt von
einer einzelnen Zahlenprobe. Eine allgemeine distributive Herleitung über
(a−b)(a−b)=a²−ab−ba+b² mit erklärter Einsetzung a=2x,b=3 ist in beiden
Rubriken tatsächlich zulässig; bloßes Zitieren von a²−2ab+b² ist etwas anderes.
Der zweite unabhängige Fall verlangt weiterhin beide Strukturformen
(x+3)²−1 und (x+2)(x+4), jeweils mit eigener Ausmultiplizierprüfung.

`independent-written-challenges-and-fair-alternatives.json` enthält neun
konkrete schriftliche Gegen- und Kontrollantworten in beiden Sprachen.
Beim Wasserstand scheitern das unveränderte erste Modell, das bloße
Verwerfen ohne zweites Modell und der erfundene Sprungzeitpunkt an tatsächlich
gefragten Kernen. Die entsprechende bedingte Obergrenze ist 4+2=6<7.
Bei der Binomaufgabe scheitert der frühere reine Formelzitierfall nun ebenfalls
mit höchstens 2+4=6<7; eine einzelne richtige Zahlenprobe heilt das nicht.
Eine richtige erste Herleitung ersetzt auch den zweiten unabhängigen
Nichtquadrat-Fall nicht. Die allgemeinen distributiven beziehungsweise
äquivalenten trigonometrischen Kontrollantworten bleiben bei vollständiger
restlicher Arbeit mit 4+4=8 zulässig. Das sind **schriftliche bedingte
Rubrikurteile**, keine beobachteten Lernenden-, LLM- oder Servernoten.
Die Freigabe folgt aus den wirklich erhobenen Inhalten und Begründungen;
die Gesamtgrenze allein beweist die vollständige Kompetenz nicht.

Die mathematische Bedeutung, die geforderten Geltungsgrenzen, die zugelassenen
Alternativen und die Bewertungskerne stimmen in DE und EN überein. Die beiden
vollständigen bisherigen P-Datensätze bleiben exakt unverändert. Ihre alten
illustrativen Fallbriefe werden durch diese Deltaprüfung nicht pauschal zu
neuen gültigen P-Prüfartefakten erklärt; maßgeblich für dieses Urteil sind
die unveränderten vollständigen Kompetenzanforderungen und die tatsächlich
reparierten V5-Aufgaben. Es wird kein neuer nativer P-Ledger-Eintrag erfunden.

Der eigene automatisierte Nachlauf lief von 2026-11-15T14:18:27.133573+01:00 bis
2026-11-15T14:18:27.745035+01:00 mit **Exit 0**. Er verglich alle 43 vollständigen
Aufgabenobjekte direkt: **genau zwei geändert, alle übrigen 41 exakt gleich**.
Beide Einzeldateien und vollständigen Vorher-/Nachher-Operationen stimmen mit
diesem Vergleich überein. Zielidentität, Anwendbarkeit, `requires`, Coverage,
Punkte je Teil, Maximum 8 und Grenze 7 bleiben unverändert. Die gewöhnlichen
P-Objekte stimmen mit V4 vollständig überein. Die Fenstertabellen, beide
Phasenalternativen, zwei glatte Lückenergänzungen und alle distributiven
Identitäten wurden mit exakter SymPy-Rechnung unabhängig überprüft.
Kommando, Zeit, Arbeitsverzeichnis, Originalausgabe und Exitcode stehen in
`independent-check-execution.actual.json` und `independent-check.actual.log`.

Diese beiden aktuellen positiven Inhaltsentscheidungen können zusammen mit
den 41 exakt unveränderten begrenzten V4-Inhaltsentscheidungen für den konkreten
V5-Aufgabensatz verwendet werden. Der angenommene 18er-Platzierungsentscheid
und sein explizites Quellenanker-Erratum bleiben an den unveränderten V4-Stand
gebunden. Das ist **keine frische Gesamtfreigabe von SEM, D/P/A/B/M/V,
Anwendbarkeit, öffentlichen Services oder aktueller kombinierter Physik**.
Hier wurde kein neuer vollständiger nativer 21-Katalog-Lauf und kein
öffentlicher Runtime-Replay behauptet. Die alte SEM-Verweigerung bleibt offen;
aktuelle Bindungen und die integrierte Qualitätssicherung sind weiter nötig.
Merge und frische erfolgreiche Main-CI sind noch nicht nachgewiesen.

Es wurden ausschließlich neue Dateien im eigenen Review-TMP-Verzeichnis
geschrieben. Aktive Quellenänderungen: 0; Lernendenresultat-Writes: 0;
aktivierte reale Pläne: 0; gemessene implementierte Rückgriffseffekte: 0.
