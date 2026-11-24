# Technischer HH-/SN-Scope-Nachfolger nach der Aktivierungszurückstellung

Die bindenden Entscheidungen vom 24. November 2026, 06:26 und 06:31 CET stellen die neuen sächsischen Energie-/Kreisbewegungsziele und die vier Hamburger Verknüpfungen zum Bewegungsgesetzziel bis zur fachlichen Reparatur ihrer vollständigen Vorbereitung zurück. Die Quellenbefunde bleiben erhalten. Es entsteht weder eine falsche Vollziel-Exklusion noch ein neues Assessment. Die neun alten sächsischen Teilverknüpfungen werden ausdrücklich als ungeprüfte historische Verknüpfungen unter ursprünglichem Reviewer und Datum weitergeführt; dieser technische Beleg bestätigt ihre fachliche Richtigkeit nicht.

| Land und Dauer | Zielmenge S im v1-Beleg → jetzt | Lernmenge L im v1-Beleg → jetzt |
| --- | ---: | ---: |
| Hamburg G8 | 127 → 126 | 205 → 191 |
| Hamburg G9 | 127 → 126 | 205 → 191 |
| Sachsen G8 | 157 → 155 | 264 → 254 |
| Sachsen G9 | 157 → 155 | 264 → 254 |

Die übrigen 16 der 20 Physik-Sek-I-Kontexte behalten exakt dieselben S- und L-IDs. Gegenüber dem ursprünglichen Beleg vom 17. November bleibt Hamburg unverändert; Sachsen behält zwei zusätzliche Ziel- und Lernatome: die Zeit-Geschwindigkeits-Fläche und die Bewegungsgesetze.

Die [neue Fixture](sek1-seed-fixtures.actual.json) ersetzt ausschließlich diese vier Zeilen des unveränderten [v1-Belegs](../e1-physics-seki-current-v1/sek1-seed-fixtures.actual.json). Der ursprüngliche Beleg vom 17. November bleibt ebenfalls erhalten. Der Controller liest den neuen Nachfolger zuletzt und behält seine vollständigen ID-Mengenvergleiche bei.

Die unabhängige Python-Rechnung verwendet den transparenten Algorithmus des v1-Belegs unverändert. Sie berechnet zuerst sämtliche Zielrollen aus den konkreten Ansichten, filtert die zutreffenden Atome nach Land, Dauer und Kurs und verfolgt anschließend sämtliche echten Voraussetzungen über den vollständigen Fächerkatalog. Die getrennte native Messung erzeugte zwanzig isolierte Lernendenkonfigurationen, exportierte die tatsächlichen S-/L-Mengen und las die HTTP-Gesamtzahlen. Alle zwanzig Mengen und Gesamtzahlen stimmen exakt mit der unabhängigen Rechnung überein. [Die Versiegelung](seed-fixture-verification.actual.json) enthält die beiden Rechnungen, alle Mengenhashes, konkrete Delta-IDs, Eingabebindungen sowie das reale Capture-Programm und dessen erfolgreichen Lauf.

`python3 contracts/stage-plan-review-evidence/2026-11-24/e1-physics-seki-deferred-hh-sn-v2/recompute.py` prüft alle zwanzig aktuellen Kontexte. Der native Capture-Lauf ersetzt keinen Bericht über den separat ausgeführten gewöhnlichen Controller-Regressionstest oder die breitere Java-Suite; deren tatsächliche Ergebnisse werden gesondert gebunden.
