# Tatsächliche Inhaltsprüfung mit abgeleitetem Wissenskontext

13. November 2026, nach Einführung von AGENTS.md §2.5 durch `27a0b68895`.
Diese neue AI-Inhaltsprüfung liest zuerst die vollständigen tatsächlichen
Tool-Ableitungen und danach die aktuellen Inhalte. Sie verändert keine der
früher tatsächlich ausgeführten nativen D-Runden oder deren Herkunft.

Die `current-<id>.json` und `.txt` stammen aus dem unveränderten CLI-Tool
`knowledge-context`, jeweils mit `--json` beziehungsweise `--full`.
`derivation.receipt.json` hält Befehle, Exitcodes und Eingabehashes fest.
`secured-scope-delta.json` vergleicht mittels `KnowledgeContextIndex` den
aktuellen vollständigen Katalog mit demselben Katalog, in dem nur Mathematik
durch den tatsächlichen Stand `64124c1ec4` ersetzt ist. Keine Voraussetzung
oder Closure wurde für diese Prüfung von Hand nachgebaut.

`current-review-inputs.json` hält die tatsächlich aktiven P-Eigentümer und
Originalrecord-Hashes, die aktuellen Zielobjekte, Bildpfade und Bytehashes,
Memory-Entscheidungen und das Vorhandensein eigener `examData` fest. Die Bilder
der folgenden acht Ziele wurden in dieser neuen Runde nach Lesen des
Wissenskontexts selbst visuell geöffnet. DE/EN-Karten c08/c09/c10 wurden erneut
tatsächlich gelesen. Dies ist keine neue menschliche Freigabe und keine
Änderung der bisherigen V-QA-Urteile.

## Die drei präzisierten Ziele

Alle drei verlieren ausschließlich das breite Ziel `858113c5…`, das neben
Polynom- auch einfache Exponential-/Potenzableitungen enthält. Sie gewinnen
`623cd47f…` (Polynomableiten), `dde9ae98…` (Faktor-/Summenregel) und
`e9445479…` (Begründung der Potenzregel). Die vollständigen aktuellen W-Mengen
haben 37, 38 und 39 gesicherte gewöhnliche Ziele.

| Ziel | Tatsächlich gelesener/angeschaute Inhalt | Urteil zur verlorenen Voraussetzung |
| --- | --- | --- |
| `350fc8b1-ead0-4239-b28a-217cbd3bd1c3` | Aktuelles P: x³−6x²+9x mit Vorzeichenintervallen und f′(2)=−3; x³+2 mit waagerechter Tangente ohne Extremum. Bild: −x², x², x³ mit passenden Ableitungen und Vorzeichen. | Alle Ableitungen sind polynomial; `623`, Faktor-/Summen- und Potenzregel sowie der gesicherte Graph-/Tangentenbezug tragen diese Rechnungen. Kein Exponential- oder Kehrwertableiten erforderlich. Die erste-Ableitungs-Kompetenz bleibt passend. |
| `b3604df4-15a8-41c8-a8b0-50dadd698bd3` | P: kubisches Volumenmodell, kubische Abkühlungsfunktion und x³+2/x⁴-Vergleich; eigenes Steigung-/Steigungsänderung- und Sattelverständnis. Bild: schematischer Wechsel f″<0 zu f″>0. | Die benötigten Ableitungsregeln sind gesichert; Krümmung, Vorzeichenwechsel und zusätzlicher f′=0-Sattelbegriff werden hier selbst entwickelt. Beide Kontextmodelle sind Polynome. Abkühlung bedeutet hier kein Exponentialmodell. Keine verlorene 858-spezifische Pflicht. |
| `d5feba00-4336-4f26-8dba-0537a797eddb` | P: x³/x⁴/x⁵, wiederholtes Ableiten und V‴=−6 L/min³. Bild: notwendige/hinreichende Bedingungen und x³/x⁴-Gegenbeispiele. Karten c08/c09/c10 in DE und EN: kompakte Extrem-/Wendebedingungen. | Wiederholtes Polynomableiten ist gesichert. Die dritte Ableitung, ihr Änderungsratenbezug und das C³-gebundene hinreichende Kriterium sind Gegenstand dieses Ziels; Krümmung und Sattelbegriffe sind durch `b360` gesichert. Keine verlorene Exponential-/nichtpolynomiale Ableitungsregel wird benutzt. Die Karten entwickeln keine neue Funktionsklasse. |

Das Bild von `350` nennt den x³-Gegenfall bereits „Sattelpunkt“. Für den
Leistungsnachweis von `350` wird ausschließlich „waagerechte Tangente, kein
Extremum“ gebraucht; die Definition des Sattel-/Wendepunkts gehört laut
Wissenskontext zum Nachfolger `b360`. Die Beschriftung ist deshalb eine bereits
vor dieser Kantenänderung vorhandene Vorschau auf einen Nachfolger und darf
nicht als dort schon gesicherte Sattelkompetenz oder Voraussetzung behandelt
werden. Diese begrenzte Vorschau ist kein durch Wegfall von `858` verursachter
Bedarf an Exponentialableitungen; vollständige Artefakt-Treue zum künftig
suffizienten Wissenskontext wird damit nicht bescheinigt.

## Fünf weitere gewöhnliche Ziele

Die vollständigen jeweiligen Tool-Kontexte wurden gelesen. Alle folgenden
Ziele sichern `623`, `dde` und `e944`; bei einigen waren diese schon vorher
über einen weiteren Weg gesichert, sodass die Delta-Liste dort keinen
Zuwachs nennt. „Kein Zuwachs“ bedeutet nicht „nicht gesichert“.
Alle fünf haben aktuell `no_memory_needed`, kein eigenes Memory-Deck und
keine eingebetteten `examData`. Die aktiven P-Pfade und Bildhashes stehen
vollständig in `current-review-inputs.json`.

| Ziel | Konkrete Prüfung | Urteil |
| --- | --- | --- |
| `4b16fce6-84cc-52ae-98ca-f88cc518cc28` Anschlussbedingungen | P: linearer linker Ast mit quadratischem Anschluss, anschließend quadratischer linker Ast mit quadratischem Anschluss und Zusatzpunkt. Die beiden Bedingungen betreffen Funktionswert und erste Ableitung. Bild: p=x+1 und q=0,2(x−2)²+x+1, gleicher Wert 3 und gleiche Steigung 1 bei x=2. | Nur Polynome. Ableiten, Funktionswerte und Rekonstruktion sind gesichert; Anschlussbedingungen selbst sind Zielgegenstand. Keine verlorene 858-spezifische Regel erforderlich. |
| `8e1b0d9c-fa32-5ccd-9c11-77e788ae0941` Rekonstruktion | P: quadratischer Ansatz aus Scheitel (1,−2) und Punkt (0,1), Ergebnis 3x²−6x+1; kubischer Ansatz aus drei Punkten plus Tangentensteigung, Ergebnis −3x³+x+2. Bild rekonstruiert 2x² aus Tiefpunkt und Punkt. | Alles polynomial. `623`, Parameterbestimmung und Differentialanalyse sind gesichert. Das Aufstellen/Lösen des Koeffizientensystems gehört zum eigenen Ziel. Keine verlorene Exponential-/Kehrwertableitung. |
| `b88cbf71-5e3e-55e3-ba94-6789408d38d6` Wendesachmodelle | P: T=2(t−2)³+(t−2)+5 und I=3(x−1)³−(x−1)+2 mit jeweiligen Daten-, Steigungs- und Vorzeichenbedingungen. Bild: r=0,1(x−3)³+2 mit Wendepunkt (3,2). | Polynome einschließlich verschobener Kubik; eine lineare innere Verschiebung kann ausmultipliziert werden und verlangt keine Exponentialregel. Rekonstruktion, Bedingungen und Polynomableiten sind gesichert. Keine verlorene 858-spezifische Pflicht. |
| `d4f2d4e2-a831-5ee2-b9c6-bb9e79986aeb` Extremsachmodelle | P: Umsatz 100p−5p² sowie Zaunfläche x(30−2x) mit sachlicher Randbeschränkung. Bild: h=−0,5(t−4)²+8 mit h′(4)=0, h″(4)=−1. | Ausschließlich quadratische Polynome; die gesicherten Ableitungs-/Extrem-/Rekonstruktionskompetenzen reichen für die hier betrachtete Ablösung der verlorenen Regel. Kontextmodellieren ist eigener Zielgegenstand. Kein verdecktes exponentielles Bewegungs- oder Wachstumsmodell. |
| `d78946f9-1f5f-462c-a99c-fe01054042dd` Polynom-Gesamtanalyse | Aktives P aus dem retained-nine-Paket: x⁴−2x² sowie x³−0,03x, jeweils analytische Untersuchung und selbst eingestellte digitale Kontrolle. Bild: x³−3x, 3x²−3 und 6x mit Extrem-/Wendepunkten. | Die verlorene breite Ableitungsregel wird vollständig durch gesichertes `623/dde/e944` für diese Polynome ersetzt. Kein Exponential-/Kehrwertableiten. Symmetrie, Polynomnullstellen und digitale Grundlagen zeigen weiterhin die unten beschriebene alte Suffizienzfrage; sie werden durch das Entfernen von 858 nicht neu entzogen. |

## Grenzen der positiven Einzelurteile

Die Urteile besagen konkret: Die gelesenen Ableitungsrechnungen und
Funktionsklassen der acht Ziele benötigen keinen ausschließlich durch das
verlorene `858` abgedeckten Stoff. Sie sind keine pauschale Bescheinigung,
dass jede andere vorausgesetzte Kompetenz im Graphen ausreichend gesichert
ist. Der tatsächliche Wissenskontext nennt weiterhin unter anderem
Funktionsfamilien, Achsen/Skalen/Einheiten und je nach Ziel weiterführende
Algebra beziehungsweise digitale Grundlagen als nicht gesichert. So verlangt
der erste 350-P-Fall die Nullstellen einer quadratischen Ableitung, während
sein W noch kein eigenes Ziel zum Lösen quadratischer Gleichungen enthält.
Das ist bereits im vorigen W so; 858 sicherte diese allgemeine
Gleichungskompetenz nicht. Ebenso sind die Funktionsfamilien-Lücken des
vorgelagerten Polynomableitens der bereits dokumentierte Ausgangsbefund des
neuen Tools. Diese Befunde gehen in die gesonderte fachliche
Suffizienzprüfung, ohne hier automatisch Kanten zu ergänzen oder Inhalte zu
verkürzen. Bis dahin wird keine Wissenskontext-Beschränkung des Coachs und
keine neue Laufzeit- oder Meilenstein-Suffizienz behauptet.
