# Einzelimpulse und Gesamtimpuls zweier Wagen

Review date: 2026-11-25
Status: `accepted_ai_pilot`

| Ziel-ID | Aktuelles Ziel | Entscheidung | SHA-256 des JPEG | Sichtbefund |
| --- | --- | --- | --- | --- |
| `53afbda1-5776-502b-8867-471975d7b766` | Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen | `accepted_documented_repo_native_fallback` | `09e8c0a115045b0a415952cc8f9eebed88e09edaed7677b8d84f650687edbb38` | Rechts ist positiv. Im selben Augenblick hat A mit 2 kg bei +3 m/s den Impuls +6 kg·m/s. B hat mit 8 kg bei −1 m/s den Impuls −8 kg·m/s. Beide Einzelpfeile beginnen am jeweiligen Wagen und haben freie Spitzen. 120 px entsprechen 2 kg·m/s. Der schnellere Wagen hat den kleineren Impulsbetrag. Die getrennt ausgewiesene Systemsumme ist −2 kg·m/s. Masse, Geschwindigkeit, Impuls, Maßstab und Summe sind bei 360 px lesbar. |

Die Übernahmeprüfung verwarf das Bild aus Batch 098 für dieses Ziel. Beide Massen waren 1 kg und die Pfeile zeigten Geschwindigkeiten. Dadurch konnte man die Summe der Zahlenwerte als bloße Addition der Geschwindigkeiten lesen. Im Nachfolger zeigt die Formel die Multiplikation mit der jeweiligen Masse. Die Geschwindigkeiten stehen als Zahlen bei den Wagen. Aus der Pfeilrichtung und dem gemeinsamen Impulsmaßstab folgen die Einzelimpulse. Die Rechnung unter der Skizze nennt ausdrücklich das System beider Wagen.

Die Ausnahme für genaue Diagramme aus AGENTS.md §7.3 gilt weiterhin. In Batch 098 hatten je zwei Bildgeneratorversuche den quantitativen Pfeilmaßstab verfehlt. Das bestehende Zeichenprogramm zeichnet die neuen Pfeile mit 360 und 480 Pixeln Länge, ihr Maßstabsbalken umfasst 120 Pixel. Die JPEG-Messung verifiziert Anfang und Spitze. Bei 360 Pixeln bleiben beide Punkte am Wagen, die freien Spitzen, Werte und Einheiten unterscheidbar. Die vier anderen Bilder aus Batch 098 behielten ihre Übernahmeentscheidung.

[Zeichenprogramm](physik-batch-099-evidence/draw_individual_momenta.py) · [Maße, Vorgänger und Bildhash](physik-batch-099-evidence/measurements.actual.json)
