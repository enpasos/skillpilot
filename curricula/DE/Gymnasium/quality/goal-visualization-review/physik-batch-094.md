# Physik – Zeitdiagramme für konstante Beschleunigung

Review date: 2026-11-24
Status: `accepted_ai_pilot`

Für das Ziel `e4b38061-1f28-43ad-8371-a3e7c0e81856` wurde die frühere Beschriftung „6 m//s“ beim unabhängigen Verständnisreview beanstandet. Das Bild wird als eigenständige Lernillustration verwendet. Zwei Versuche einer eng begrenzten Korrektur reproduzierten den Tippfehler bzw. lieferten eine auf dem Handy schwer lesbare Tabelle. Die Rohbilder hatten SHA-256 `84fe1da22bca2e2aa6f76105d49012edcc28fbc4c5c31f5e8630b79311f7ce79` und `d0e4c7792b93fc576eb882bcde17a45200431be21cb78c1f52cf6b3168c901f8`.

Die dritte Generierung von OpenAI / Codex image_gen stellt die drei Diagramme ohne Zahlenraster dar. „Start aus der Ruhe bei s = 0“ legt die Anfangsbedingungen fest. Die Zeitachsen verlaufen nach rechts. Die Geschwindigkeitsgerade steigt vom Ursprung, die Beschleunigungslinie liegt waagerecht oberhalb der Zeitachse. Die Buchstaben und die drei Verläufe sind bei 360 px klar unterscheidbar.

Für die mathematisch notwendige Parabel wurde die dokumentierte Ausnahme nach AGENTS.md 7.3 angewendet. Die normalisierte Generatorausgabe wich bei einem Viertel, der Hälfte und drei Vierteln des Zeitintervalls um 10,87, 22,53 und 24,90 Pixel vom quadratischen Gesetz ab. Nur der blaue Ortskurvenstrich wurde durch eine antialiaste Kurve mit normierter Höhe u² ersetzt. Die gemessenen Abstände im endgültigen JPEG betragen 0,37, 0,03 und 0,10 Pixel. Das Grundbild, die Korrektur und die Messwerte liegen im [Reproduktionsordner](physik-batch-094-evidence). Der endgültige Generatorprompt ist beim Bild hinterlegt.

Die Endfassung ist 1600 × 900 px groß. SHA-256 `1213e93541e63c32b07b4a1ac428b6a368bac12c554327b67e03bfffdb937f91`. Die dritte unverarbeitete Generatorausgabe hatte SHA-256 `a8c612204efb51d9871d4234753205f7e3bd36a1af12bd4ef2f51301df642f5e`.
