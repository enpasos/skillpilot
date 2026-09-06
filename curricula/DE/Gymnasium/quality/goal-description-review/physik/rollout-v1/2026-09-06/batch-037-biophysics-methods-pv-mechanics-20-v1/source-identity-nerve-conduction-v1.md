# B037: Zuschnitt und Originalquelle des Nervenleitungsziels

Stand: 2026-09-06. Ziel `2825b528-00ee-52d0-870e-686890cb1195`. Eigenständige Quellen-/Identitätsprüfung durch Codex; keine menschliche Einzelabnahme. Die unabhängigen Beschreibungsreviews bleiben separate, unveränderte Kandidatennachweise. Diese Notiz verändert weder Kanonik noch Mastery und schließt das Ziel nicht ab.

## Belegter Umfang

Die live gelesene amtliche Quelle ist [LehrplanPLUS Bayern, Physik 12, grundlegendes Anforderungsniveau Biophysik, Lernbereich 4](https://www.lehrplanplus.bayern.de/fachlehrplan/lernbereich/310657), zweite Kompetenzerwartung und zweiter Inhaltseintrag; abgerufen am 06.09.2026. Sie verbindet die Beurteilung von Leitungsgeschwindigkeits-Messverfahren mit Feldabschätzungen und einer auch quantitativen Erklärung induzierter Spannungen. Die Inhaltsliste nennt sowohl elektrische Ladungszufuhr als auch Induktion zur Signalerzeugung. Die Felder sind somit nicht beliebige vom Messkontext losgelöste Zusatzthemen. Dennoch belegt eine richtige Laufzeitbestimmung allein weder die Feldabschätzung noch die Induktion. Eine gemeinsame Quellenzeile ist kein Nachweis semantischer Atomarität.

Die lokal gelesene Extraktion `curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json` bindet diese Stelle über Quellziel `9ebc77ee-90cf-5540-aed7-02d9b4140f4c`, Passage `13138ea2-af32-5012-84a0-194a80ab0775` und Span `Ph12-GA-BIO.4.2`. Auch die erhaltene `input/BY/gymnasium/Physik.json` enthält sie. Der verkürzte kanonische Text verliert insbesondere die begründende Beziehung zwischen Verfahrenseignung und Feldabschätzung; die EN-Felder sind bislang deutsche Kopien.

## Vorhandene Nachbarn und Identität

- Das BY-Source-Extraction-Reviewmapping ordnet die Quellkompetenz als Teilabdeckungen dem Ziel sowie `1a037489-3c95-540b-8cae-0acd360358ee` (Flussänderung/qualitative Induktion) und `d3c153b9-e09b-5668-8386-73105546a7c1` (Versuchsplanung und Messauswertung) zu. Die historisch behauptete gemeinsame Vollabdeckung ersetzt keine erneute fachliche Prüfung der quantitativen Induktion und der konkreten Nervenleitungs-Methode.
- Der vorhandene Nachbar `eb1ea150-ec6c-5000-bce3-f46c820dccf8` enthält das quantitative Induktionsgesetz, gehört aber nicht zur genannten Mapping-Union. Keine automatische Erweiterung dieser Union oder pauschale Hochstufung von partial zu exact.
- Das Ziel hat genau die ersten beiden Nachbarn als direkte Voraussetzungen und ist ein Leaf mit `contains: []`. Sein einziger direkter Container ist `47dc2c52-b776-5694-9715-ae98c7c23f85`. Die aktuell gelesene Physik-Kanonik enthält keinen direkten `requires`- oder `examData.coveredGoalIds`-Nachfolger dieses Ziels.
- Direkte Zielreferenzen stehen in `composition-views/physik/de-by-gk.view.json`, `de-by-lk.view.json`, `de-by-sekii-gk.view.json` und `de-by-sekii-lk.view.json`. Bei einem Split müssen diese Projektionen ausdrücklich mitgeprüft werden; neue Kinder erscheinen nicht durch Annahme automatisch korrekt.

## Nächste begrenzte Entscheidung

Das Ziel wird aus dem routinemäßigen 19-Ziel-Abschluss herausgehalten, nicht still enger formuliert und nicht als fertig gezählt. Vor einer Änderung sind zwei mögliche Zuschnitte gegeneinander zu prüfen:

1. Eine tatsächlich zusammenhängende Beurteilung eines vorgegebenen Messverfahrens, bei der Feld- und Induktionsaussagen genau dieses Verfahren erklären. Dafür muss ein gemeinsamer Erfolgskern nachgewiesen werden; bloßes Verbinden bisheriger Teilsätze genügt nicht.
2. Getrennte prüfbare Inhaltsziele für die Leitungsmessung und die physikalische Signalanregung, mit Wiederverwendung bereits vorhandener fachlicher Grundkompetenzen statt deren Duplizierung. Dann sind Quellenabdeckung, sichtbare Projektion, stabile Identitäten und die ausdrückliche Nichtübertragung alter Mastery auf neue Teilkompetenzen gemeinsam zu lösen.

Keine der Optionen wird hier vorweggenommen. Das bestehende Übersichtsbild wird bei einer späteren Entscheidung gesondert geprüft und gegebenenfalls auf dem erhaltenen Überblicksknoten bewahrt. Keine medizinische Untersuchung an Personen und keine Einsicht in Lernenden- oder Klassendaten ist Bestandteil dieser Prüfung.
