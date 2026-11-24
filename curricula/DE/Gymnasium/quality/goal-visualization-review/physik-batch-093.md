# Physik – Beschriftung des Zeit-Ort-Diagramms

Review date: 2026-11-24
Status: `accepted_ai_pilot`

| Ziel-ID | Aktuelles Ziel | Entscheidung | SHA-256 der geprüften Datei | Sichtbefund |
| --- | --- | --- | --- | --- |
| `262f807a-30d0-503e-986f-856cbd048e8e` | Bewegungen mit Zeit-Ort- und Zeit-Geschwindigkeits-Gesetzen beschreiben | `accepted_after_notation_correction` | `04f93d8140ab7e15306bdfb15f1039e390ae32930a29e9d5b66b0a9989e99cc1` | „Steigung im t-s-Diagramm → Geschwindigkeit“ ist in der Endfassung auch bei 360 px lesbar. Zeit liegt auf der Abszisse, Ort bzw. Geschwindigkeit auf der Ordinate. |

OpenAI / Codex image_gen hat die zwei Buchstaben im Bild aus Batch 092 korrigiert. Als Referenz diente das dort geprüfte Bild mit SHA-256 `4a0639dc17549678f36a5a0ca97278abd6eca56577d308eac092ef865eacdf97`. Die erste und einzige neue Generatorausgabe hat SHA-256 `d29d9031ce668a03cd0c6f0cf42fa41f6298c57db830a533fb8e74714d2067e8` und wurde auf 1600 × 900 px skaliert. Die vier Gleichungen, Anfangsbedingungen und Achsen wurden im Vollbild kontrolliert. Die blaue Ortsgerade hat eine positive Steigung, die blaue Geschwindigkeit ist konstant. Rechts steigt die Geschwindigkeit linear ab null. Die farbsegmentierte Ortskurve erreicht bei ¼, ½ und ¾ der Zeitspanne die normierten Höhen 0,065, 0,252, 0,564 (Soll 0,0625 / 0,25 / 0,5625). Alle drei Strichmitten liegen weniger als ein Pixel vom Sollwert entfernt. Die neue Fassung benötigte keine nachträgliche Kurvenkorrektur. Der vollständige Editierprompt liegt beim Bild. Es gab keinen verworfenen neuen Versuch.
