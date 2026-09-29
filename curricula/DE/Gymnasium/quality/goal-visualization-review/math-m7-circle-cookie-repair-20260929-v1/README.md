# Gemeinsames Kreisbild: gezielte Bitmap-Korrektur (2026-09-29)

Dies ist eine **KI-Korrekturkandidatin** für zwei aktuelle J7-Ziele,
`2f073195-52ef-5219-926c-f3f58ebdc556` (Kreisflächen) und
`4dbb8e8e-c0b5-5d51-8897-0024d77e8602` (Kreisumfänge/Bogenlängen).
Keine menschliche Prüfung oder Freigabe wird daraus abgeleitet. Die
unabhängigen D-Runden und eine unabhängige aktuelle V-Gegenprüfung sind
gesondert an die finalen Bildbytes zu binden.

## Zwei gesondert geprüfte Bildbezüge

- **Flächenziel `2f073195`:** Das bisherige Vollkreisbeispiel mit
  `r=3 cm`, `d=6 cm`, `A=9π cm²≈28,27 cm²` ist rechnerisch richtig;
  die grüne Innenfläche und der Pizza-Flächenpfeil passen dazu. Die
  Keks- und Torbogen-Vignetten rechts gehörten nicht zur
  Kreisflächenrechnung, blieben aber im für dieses Ziel aktiv gebundenen
  gemeinsamen Bild und zeigten irreführende Randzüge. Beide wurden
  entfernt.
- **Umfangsziel `4dbb8e8e`:** Das Hauptdiagramm trennt den roten
  Halbkreisbogen `b=πr=4π cm≈12,57 cm` bei `r=4 cm` vom blauen
  Durchmesser `d=8 cm`; `b+d≈20,57 cm` ist korrekt. Die bisherige
  angebissene Keks-Vignette trug dagegen `Gesamtumfang` neben einem roten
  Zug nur um den äußeren Restbogen. Die konkave Bisskante gehört ebenfalls
  zum Rand, wurde aber nicht nachgezogen. Der Torbogen rechts oben
  wiederholte denselben Fehler an seiner inneren Öffnung. Beide Vignetten
  samt ihren eigenen `Bogenlänge`-/`Gesamtumfang`-Beschriftungen und
  roten Umrissen wurden entfernt; das korrekte Hauptdiagramm mit beiden
  Formelzeigern blieb.

Ich habe beide aktuellen Canon-Zieltexte, beide aktiven Rasterdateien und
das erzeugte Ergebnis in Originalgröße sowie als 360-px-Gesamtansicht
visuell geprüft. Die Gleichungen, Radien, Durchmesser, Farbzuordnung und
Pfeilziele im verbleibenden Hauptdiagramm sind konsistent. Bei 360 px sind
die Hauptformen unterscheidbar; kleingedruckte Zahlen brauchen die
Originalansicht. Die Korrektur fügt keine neue mathematische Aussage hinzu.

## Herkunft und Bindung

- Werkzeug: integrierte OpenAI/Codex-Bildgenerierung, Bitmap-Edit eines
  bereits aktiven SkillPilot-PNG; das konkrete Bildmodell wird vom Werkzeug
  nicht ausgewiesen.
- Tatsächliche finale Promptfolge:
  [Keks-Entfernung](imagegen-edit-prompt.en.md), dann
  [Torbogen-Entfernung](imagegen-edit-prompt-2.en.md). Bei der
  Keks-Entfernung wurden zwei Edit-Varianten erzeugt. Die erste erhielt
  den `Gesamtumfang`-Formelzeiger und wurde als Zwischenschritt
  `5e1b1e2007242ce5bb3e41399c4d2fe9418fc44a1a822c14d500759eb4adec02`
  gewählt. Die zweite entfernte den Zeiger zusätzlich und wurde
  verworfen. Eine unabhängige Gegenprüfung fand am Zwischenschritt die
  verbliebene Torbogen-Randlücke; daher wurde auch diese Vignette gezielt
  entfernt. Es gab keinen SVG- oder programmatisch gezeichneten Ersatz.
- Vorheriger aktiver PNG-SHA-256 für beide Ziele:
  `18def74e82a3c161aaefbfea08116641f9d7f83f030fc8b7013838060b4fb576`.
- Neuer aktiver PNG-SHA-256 für beide Ziele:
  `18d6a0e406afbc756d459e6a78f6640f6b0e10d83014eca1676f1c1c8ca6171d`.
  Die Source-, Public- und Backend-Kopien beider Ziele sind bytegleich
  (1.563.634 Bytes, 1678 × 937 Pixel). Die alten JPGs und historischen
  Reviews blieben unverändert.
- Import: `visualization:prepare` für beide Ziele mit tatsächlichem
  Provider, danach `visualization:import` je Ziel nacheinander, mit dem
  ausgewählten PNG und dem verlinkten tatsächlichen Prompt. Die aktuellen
  Canon-`resourceLinks` nennen den Bitmap-Edit, `CC-BY-4.0` für das
  eigene Material und `pilot`; der Alttext beschreibt weiterhin die
  tatsächlich sichtbaren Hauptdiagramme.

Diese Selbstprüfung ist keine unabhängige V-Freigabe und keine M7-Freigabe.
