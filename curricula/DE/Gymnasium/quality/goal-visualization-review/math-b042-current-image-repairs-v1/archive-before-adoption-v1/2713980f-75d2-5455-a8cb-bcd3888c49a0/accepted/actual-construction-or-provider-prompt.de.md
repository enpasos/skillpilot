# Deterministische mathematische Konstruktion – keine Nano-Generierung

Dies dokumentiert die tatsächlich umgesetzte native Ersatzkonstruktion, keinen
nachträglich behaupteten Provider-Prompt. Die beiden gezielten Nano-Versuche
und ihre wirklichen Prompts stehen im unveränderlichen Versuchsarchiv.

Der Renderer render-2713980f-fallback.mjs erzeugt das SVG und rendert es mit
dem im Repository fixierten Playwright Chromium als 1600×900-PNG.
Er zeichnet h(x)=x² exp(−x) für 0≤x≤8 aus 801 berechneten Punkten,
px=110+65x und py=680−550h(x), statt die fehlgeschlagenen Bildpixel zu retuschieren.
Bei x=0 muss die Tangente waagerecht sein. Die Ableitung
h′(x)=exp(−x)·x·(2−x) begründet Anstieg bis x=2 und Abfall danach.
Das Maximum liegt bei (2,4/e²); die positive Kurve nähert sich rechts der
x-Achse, ohne sie zu kreuzen. Der Randpunkt0 ist kein Maximum.
Alle Zahlen, Texte, Achsen und Markierungen wurden am tatsächlichen PNG
zweifach geprüft, alle SVG-Punkte unabhängig nachgerechnet.

Grund für die eng begrenzte Ausnahme: Zwei referenzgestützte Nano-Korrekturen
behielten eine falsche Anfangstangente, eine falsche Maximumlage oder eine
quantitativ irreführende Kurve. Die erforderliche Funktion-Achsen-Zuordnung
ist mit diesen konkreten Versuchen nicht verlässlich hergestellt worden.
Dies verändert weder die Nano-first-Regel noch behauptet es menschliche Freigabe.
