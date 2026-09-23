# Mathematik M7 – aktuelle Originalbildprüfung: Oberstufe, nächste 20 Ziele

Maschinelle Einzelprüfung am 23.09.2026 für die elf bereits vorhandenen Bilder des Batches `m7-upper-sec-next20-normal-spatial-methods-current-20260923-v1`. Kanonische und öffentliche Datei wurden je Ziel gegen den eingetragenen SHA-256 verifiziert; die Originalpixel wurden fachlich gelesen. `aiApproved` entscheidet nur über genau diese Bildbytes, ist keine menschliche Freigabe. Historische ChatGPT- und Human-Felder bleiben unverändert. Es wurden keine Bilder neu erzeugt oder geändert.

| Ziel | SHA-256 (Anfang) | Aktuelle Entscheidung und Befund |
| --- | --- | --- |
| `fd13605e` Normaldichte | `ee304bf93c9e` | **KEEP.** Dichteformel, μ als Symmetrieachse, σ als Streuung und Fläche zwischen a,b sind konsistent. |
| `b431148b` Normalapproximation | `aec28a4d43df` | **HOLD.** Für die dargestellte Stetigkeitskorrektur steht in der Formel die obere Grenze 55,5; die schattierte Fläche endet jedoch am mit 55 beschrifteten Tick. Die halbe Einheit wird gerade dort falsch visualisiert. Zusätzlich lautet eine untere Beschriftung fehlerhaft „Annäherhde Symmetrie“. |
| `3016ec37` Skalarprodukt | `7212cc8cde34` | **KEEP.** Vektoren (4,0) und (3,2), Lotfuß (3,0), Projektionslänge 3 und Skalarprodukt 12 passen. |
| `0a846521` Raumabstand | `eb701abfbd70` | **KEEP.** A=(1,2,1), B=(3,5,7), Differenz (2,3,6) und Länge 7 stimmen. |
| `fac75b4a` Abstandsverfahren | `62773c47184e` | **KEEP.** Punkt-Punkt 5, Punkt-Ebene 4, parallele Gerade-Ebene 3 und Schnittdistanz 0 sind rechnerisch konsistent. „Kein Abstand“ ist durch d=0 unmittelbar als keine Trennung klargestellt. |
| `58f613da` Geradenlagen | `be6c2fcf0e0f` | **KEEP.** g1 parallel zur xy-Ebene, g2 innerhalb der yz-Ebene und g3 parallel zur z-Achse folgen aus ihren Parametern. |
| `f2a12269` Volumenverhältnis | `34d1cbf8bc54` | **HOLD bereits vor diesem Batch dokumentiert; beibehalten.** Die zwei als G=12 cm² beschrifteten sichtbaren Frontflächen sind bei gleichem gezeichneten Querschnitt unterschiedlich breit. Die Rechnung 1:3 allein ist korrekt, das räumliche Bild widerspricht der gemeinten gemeinsamen Grundfläche. |
| `8b885220` Strategiewahl | `2e0fcba3fe98` | **KEEP.** Fünf Minuten, erlaubter Rechner und Ziel einer schnellen Näherung motivieren den illustrierten Überschlag; exakte Herleitung und Tabelle sind als Alternativen gezeichnet. |
| `d0475ed5` Diagrammgrenzen | `0452e145dc75` | **KEEP.** Dieselben Werte 48,50,52 stehen auf 47–53- und 0–60-Achsen; der Skalierungseffekt ist korrekt. |
| `6fcd6a1a` Aufwand/Genauigkeit | `654ca85f2d6c` | **KEEP.** Abschätzung 7–8, exakte Form 5√2 und Dezimalwert 7,071… zu √50 passen zum Vergleich von Aufwand und Genauigkeit. |
| `4b16fce6` glatter Anschluss | `50530c29cd00` | **KEEP.** p=x+1 und q=0,2(x−2)²+x+1 haben bei (2,3) denselben Wert und die Steigung 1; Graph und Karten stimmen. |

Die neun weiteren Ziele des 20er-Batches besitzen laut aktueller QA kein Bild: `8c32d941`, `c406d5a0`, `55d0474b`, `a7778885`, `3256476b`, `a506fc1d`, `5619ca5b`, `fdce0ced`, `79444ef9`. Sie bleiben offen; für P-v2 dürfen nur die neun KEEP-Bilder SHA-genau gebunden werden. Die zwei HOLDs und neun fehlenden Bilder werden bis zur späteren Bildarbeit textgebunden geprüft. Ein fehlendes oder angehaltenes Bild wird nicht als V-Abschluss gezählt.
