# Mathematik M7: Verdoppelungs- und Halbwertszeit (aktuelles PNG)

Ziel `c19d1f8f-b297-5a58-b1d4-26d811e4aff4` war nach der früheren
strukturellen Aufteilung ohne einzeln freigegebenes Bild. Das alte
`deferred_provider_limitation` war kein Abschluss. Für dieses Ziel wurde
mit `visualization:prepare` ein neuer, eigener PNG-Kandidat erstellt und
mit `visualization:import` als `reviewStatus: pilot` eingebunden. Das
vorbereitete Paket und der tatsächliche dreistufige Generatorprompt
stehen im kanonischen `prompt.de.md` neben dem Quellbild.

| Versuch | SHA-256 | Sichtbefund / Entscheidung |
| --- | --- | --- |
| Erstgenerierung | `c2b619763409a7d64ed1b70e76ffc6c1dd8433f079a19cd4cc076deac135e4a4` | Zahlenfolgen und Zeitschritte korrekt, aber schwarze/ausgerissene Randpixel und ein Wasserablauf als potentiell irreführender Zerfallskontext. Verworfen. |
| Randkorrektur | `7a11bed2aa9dbd394b6bb5847d3ff2a4ba0b1b7b39ad5ce006b97e16f5a93a43` | Ränder sauber; Wasserablauf fachlich weiterhin ungeeignet. Verworfen. |
| Kontextkorrektur | `bab6f9c41706fc1cbe0fd5685cac492424bc86d59f30da246b13a69db91a663f` | Importiert und nach tatsächlicher Originalpixelprüfung für die maschinelle Bild-QS KEEP. |

Generator: **OpenAI / ChatGPT-Codex image generation** über das eingebaute
`image_gen`-Werkzeug; ein gesonderter Modellname wurde nicht ausgewiesen.
Keine fremde Vorlage, keine Marke oder Figur wurde übernommen. Die
kanonische Quelle sowie Frontend- und Backend-Kopie sind byteidentische
PNG-Dateien mit dem oben angegebenen SHA-256. Die eigene kuratierte
Illustration trägt nach `LICENSING.md` CC BY 4.0; die Herkunftsangabe
ist keine zusätzliche Lizenz oder menschliche Freigabe.

Die grüne Folge zeigt bei 0, 1, 2 Stunden **100, 200, 400** (jeweils
Faktor 2); die blaue **100, 50, 25** (jeweils Faktor 1/2). Alle vier
benachbarten Zeitspannen sind mit einer Stunde beschriftet. Es wird kein
fester absoluter Zuwachs oder Verlust suggeriert. Die Balkenhöhen folgen
den Zahlenverhältnissen; die Pflanze und die Kapsel sind nur abstrakte
Kontextmotive, keine Behauptung über konkrete Botanik oder Dosierung.
Deutsche Beschriftung, Kontrast und Lesbarkeit wurden am 1672×941-PNG
geprüft; der Stil ist freundlich, klar und comicartig. Der spezifische
Alt-Text erklärt auch ohne Bild die Faktorfolgen.

Die QA-Entscheidung `aiApproved: yes` ist ausschließlich an diesen
aktuellen Asset-Hash gebunden. `humanApproved` bleibt `no`. Die vorherige
textgebundene P-v2-Evidenz und die D-Seitenbindung mit `visualization:null`
werden durch diesen Bildentscheid **nicht** automatisch gültig; sie sind
für genau dieses Ziel am neuen Seiten-/Bildkontext erneut zu prüfen.
