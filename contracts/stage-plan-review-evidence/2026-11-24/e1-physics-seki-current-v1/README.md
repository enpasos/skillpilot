# Physik Sek I nach dem E.1-Schnitt

Die Fixture vom 24. November 2026 ersetzt zwölf der zwanzig Physik-Kontexte aus dem Beleg vom 17. November. Der Controller verwendet sie zuletzt, sodass die historischen Mathematik- und Physik-Belege weiterhin für alle anderen Zeilen gelten. Die Tests vergleichen die vollständigen ID-Mengen der curricularen Ziele (S) und der über alle fachlichen Voraussetzungen geschlossenen Lernmenge (L).

| Land | S vorher → aktuell | L vorher → aktuell | Grund für die Änderung |
| --- | ---: | ---: | --- |
| BW | 156 → 161 | 254 → 259 | Vier neue Inhaltsziele und die zugeordnete Vektoraufgabe. |
| BY | 152 → 156 | 258 → 264 | Drei neue Inhaltsziele und die Vektoraufgabe. Der freie Fall und der Fallvergleich werden zusätzlich als Voraussetzungen erreicht. |
| HH | 126 → 127 | 191 → 205 | Die Zuordnung der Bewegungsgesetze bringt deren vollständige Vorbereitung mit. |
| SL | 152 → 152 | 259 → 258 | Die geänderte Vorbereitung erreicht die vorzeichenbehaftete Fläche. Zwei bisher erreichte Messziele fallen aus der Lernmenge. |
| SN | 153 → 157 | 252 → 264 | Zeit-Geschwindigkeits-Fläche, Bewegungsgesetze, Energieerhaltung und Anwendung der Zentripetalkraft. |
| ST | 131 → 134 | 204 → 219 | Zeit-Geschwindigkeits-Fläche, Bewegungsgesetze und die geprüfte Aufgabe zum Beschleunigungsprotokoll. |

Die Werte gelten jeweils für G8 und G9. HB, HE, MV und TH behalten in beiden Dauermodellen exakt dieselben Ziel- und Lernmengen. Die Ergebnisse beschreiben die im Controller geprüften Konfigurationen.

Die unabhängige Python-Rechnung liest die kanonischen Fächer und die konkrete Landesansicht. Direkte Einträge haben Vorrang vor vererbten Unterbäumen, anschließend zählt die kürzeste Enthaltenseinsdistanz. Bei gleichem Rang gewinnt die Zielrolle. Die Rechnung filtert die so ermittelten Atome auf Land, Dauer und Kurs und verfolgt danach sämtliche Voraussetzungen einschließlich der fremden Fächer. Aus dem Repository-Stamm reproduziert `python3 contracts/stage-plan-review-evidence/2026-11-24/e1-physics-seki-current-v1/recompute.py` den Mengenvergleich.

Die getrennte Controller-Messung erfasste für alle zwanzig Kontexte die tatsächlich exportierten S- und L-IDs und die im Lernendenzustand angezeigte Gesamtzahl. Alle ID-Mengen stimmen exakt überein. Die Prüfdatei enthält pro Kontext die SHA-256-Werte beider Rechnungen und die konkreten hinzugekommenen und entfallenen IDs.
