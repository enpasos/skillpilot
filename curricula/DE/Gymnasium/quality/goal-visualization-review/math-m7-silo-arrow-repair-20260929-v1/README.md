# Futtersilo: Kegel-Zeiger im Lernzielbild (2026-09-29)

Dies ist eine gezielte **KI-Bitmap-Korrekturkandidatin** für das aktuelle
J10-Ziel `6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9`. Ich habe das
ursprünglich aktive JPG selbst in Originalgröße angesehen. Seine
mathematischen Werte waren korrekt, aber zwei Pfeile ordneten
Kegelgrößen der grauen Zylinderwand zu:

1. Der schwarze Zeiger aus dem linken Block `Kegel: V_K` endete an
   der linken grauen Zylinderwand statt am roten Kegel.
2. Der schwarze Zeiger aus dem rechten Block `Kegelmantel: M_K`
   endete an der rechten grauen Zylinderwand statt an der roten
   Mantelfläche des Kegels.

Ein erster Imagegen-Versuch mit Umleitung beider Pfeile wurde verworfen:
Er versetzte zusätzlich den Zylinder-Volumenpfeil zum Kegel und ließ
einen irreführenden rechten Zeiger zurück. Der zweite Versuch entfernte
nur die beiden Kegel-Zeiger. Die verbleibenden
`Zylindermantel`- und `Anstrichfläche`-Pfeile zeigen weiter
auf die graue Wand. Die farbliche Trennung des roten Kegels und des
grauen Zylinders, alle Maßpfeile und Formeln sind erhalten. Beide
tatsächlichen Prompts liegen neben diesem Bericht:
[verworfener Versuch](imagegen-attempt-1-rejected.en.md) und
[ausgewählte Variante](imagegen-attempt-2-selected.en.md).

Die originale JPG-Datei ist [bytegleich archiviert](6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9.superseded-original.jpg);
auch ihr [ursprünglicher Prompt](superseded-original-prompt.de.md) bleibt erhalten.
Ihr SHA-256 lautet
`9150c34bb6f47eb1d5f9b3d6ca4132e619e2a94cb4cca9303bb0ff5b284fc9e8`
und ihre Bytes bleiben als historische Quelle unverändert. Die drei
nicht mehr kanonisch verlinkten JPG-Kopien in Source/Public/Backend
wurden nach der Bytegleichheitsprüfung aus den aktiven Asset-Pfaden
entfernt, damit sie nicht als verwaiste Primärbilder erscheinen.
Der verworfene PNG-Entwurf
hatte SHA-256
`8162b1a16ef70a6a879de2f1643be164239e1c55716eaf5eafa5e5258642227d`.
Das ausgewählte, importierte PNG hat SHA-256
`3be700f23f35ccfbf9a46a43f65018e78537a5482c35c97f3faed639101c28c5`
und misst 1678 × 937 Pixel. Source-, Public- und Backend-Kopien sind
bytegleich (1.522.206 Bytes). Das Bild entstand mit der integrierten
OpenAI/Codex-Bildgenerierung als Bitmap-Edit der vorhandenen
SkillPilot-Grafik; die konkrete Modellkennung gibt das Werkzeug nicht
aus. Es wurde kein SVG oder programmatisch gezeichnetes Ersatzbild
verwendet. `visualization:prepare` und danach
`visualization:import` mit dem tatsächlichen zweiten Prompt haben
die aktuelle PNG-Bindung erzeugt; `reviewStatus` bleibt `pilot`.

Fachlich geprüft am tatsächlich importierten Original und an einer
360-px-Gesamtansicht: `r=2 m`, `h_Z=5 m`, `h_K=3 m`,
`s=√(2²+3²)=√13 m≈3,61 m`;
`V_Z=π·2²·5=20π m³`,
`V_K=⅓π·2²·3=4π m³`, zusammen
`24π m³≈75,4 m³`.
Außen ohne Boden und gemeinsamen Nahtkreis:
`M_Z=2π·2·5=20π m²`,
`M_K=π·2·√13=2π√13 m²≈22,7 m²`,
zusammen `≈85,5 m²`. Maßwerte, Einheiten und Rundungen
stimmen. Die kleine Schrift erfordert bei 360 px Vergrößerung,
aber Körperfarben und die verbleibenden Zeiger sind erkennbar.

Diese Sicht- und Rechenprüfung ist eine KI-Prüfung der aktuellen
Bildbytes, keine menschliche Freigabe oder unabhängige D/P-Freigabe.
