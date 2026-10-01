# Unabhängige Bild-QA B: vier E-Phasen-Kandidaten

**Stand:** 2026-10-01. **Status:** Kandidatenprüfung; keine aktive Bildbindung, keine maschinelle V-Freigabe und keine menschliche Freigabe. Geprüft wurden die vier unten genannten Original-PNGs (je 1672 × 941 Pixel, annähernd 16:9) sowie unverzerrte Ansichten mit 360 × 203 und 680 × 383 Pixeln. Die Original-SHA-256-Werte stimmen mit `candidate-manifest.json` überein. Quelle der Bilddateien laut Manifest: ChatGPT/Codex `image_gen`; diese Herkunft ist keine Qualitätsfreigabe.

**Bindungsbasis:** aktuelle Ziele in `canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json` (jeweils ohne aktiven `resourceLinks`-Bildeintrag), ihre 1:1-Zuordnung in `mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-e3-trisomy-current-20261001-v3.review.json` und der amtliche HE-Biologie-KC-PDF-Text, gedruckte S. 36, E.1 bzw. E.2. Die lokale 2024-Source-Extraction formuliert bereits Kompetenzziele; der amtliche PDF-Text nennt hier die Themenpunkte. Ich habe die Bildaussage am aktuellen Kanonziel und am amtlichen Themenpunkt geprüft, nicht eine Bildgenerierung als Quellenprüfung gewertet.

| Ziel / Source-Extraction-ID | HE-PDF-Thema, gedruckte S. 36 | Urteil |
| --- | --- | --- |
| `7a79fda6-d629-5aea-9305-fc19f174bc4a` / `f10e23ac-94b6-4ba3-9b51-c44a01714d2a` | E.1 Biomembran und Membranmodelle | **KEEP als Kandidat** |
| `dd196715-a463-5379-8cdb-7a951372f5fd` / `7ec5f758-e890-44f4-9dff-716ec87b8717` | E.2 kompetitive und allosterische/nichtkompetitive Hemmung | **KEEP als Kandidat** |
| `e566ae2f-1294-55c0-ba4c-6aeb4954118c` / `1e24db22-0da7-4ecf-bfde-d35ae9257b39` | E.2 Temperaturabhängigkeit der Enzymaktivität (RGT-Regel) | **HOLD** |
| `861fbc18-06a1-56e3-8619-fd47534d7a5d` / `3c8c78b8-7c9b-4fd1-bbd0-52d3a4c7f206` | E.1 Diffusion, Osmose, Plasmolyse (experimentell) | **KEEP als Kandidat** |

## `7a79fda6` — Membranmodelle vergleichen: KEEP

Original-SHA-256: `f7447f5f10d781178075625f574a99aaa9e1f265bcf77ef860176c47e943e964`. Links zeigt das Bild eine Lipiddoppelschicht mit durchgehenden Proteinlagen an den Oberflächen (historisches Sandwichmodell); rechts Proteine in und an der Doppelschicht einschließlich Kanal (Mosaikmodell). Die Lupe mit Fragezeichen kennzeichnet den Vergleich, ohne eine der Darstellungen als Beobachtungsfoto auszugeben. Das passt zum aktuellen Kanonziel, Modelle darzustellen und ihre Aussagekraft kritisch zu prüfen. Die statische rechte Ansicht belegt für sich keine Membranfluidität; diese Grenze muss in der Lernbegleitung erklärt werden.

Bei 360 Pixeln bleiben die beiden Aufbauunterschiede und der Kanal erkennbar; bei 680 Pixeln sind auch einzelne Proteine gut unterscheidbar. Keine lesepflichtige Kleinschrift. Geeigneter Alttext: „Zwei schematische Biomembranen: links eine Lipiddoppelschicht mit durchgehenden Proteinlagen außen, rechts eine Doppelschicht mit eingelagerten und aufliegenden Proteinen sowie einem Kanal; eine Lupe lädt zum Modellvergleich ein.“ Der Alttext sollte die Grenzen der Modelle nicht als im Bild bewiesene Fakten ausgeben.

## `dd196715` — Allosterische Regulation erläutern: KEEP

Original-SHA-256: `5d5558601cfb44450f552db3657c83d9df050a9731c0e46646041a3bf1d86be1`. Links passt das orange Substrat in das aktive Zentrum. Rechts bindet ein violetter Hemmstoff räumlich getrennt davon; die Form des aktiven Zentrums ändert sich und das Substrat passt nicht mehr. Das zeigt einen fachlich schlüssigen allosterischen Hemmfall, passend zum HE-E.2-Themenpunkt und zum Mechanismusteil des aktuellen Ziels. Das Bild allein liefert noch kein Alltagsbeispiel und sollte nicht als Aussage „jede allosterische Regulation ist nichtkompetitive Hemmung“ erläutert werden.

Bei 360 und 680 Pixeln bleiben die zwei Zustände, die beiden Bindungsstellen und die Formänderung klar. Keine Schriftabhängigkeit. Geeigneter Alttext: „Links bindet ein orangefarbenes Substrat im aktiven Zentrum eines Enzyms. Rechts bindet ein violetter Hemmstoff an einer anderen Stelle; das aktive Zentrum verändert seine Form und das Substrat bleibt ungebunden.“

## `e566ae2f` — RGT-Regel anwenden: HOLD

Original-SHA-256: `0c913534071eb76a087a2b82676fd4ae327f664966e5d2a55749bd5e6ef462cf`. Die Thermometer und die Zahl der Produkte sind auf 360 und 680 Pixeln gut sichtbar. Fachlich bleibt das Bild jedoch beim unspezifischen „wärmer ergibt mehr Produkt“: Es gibt keine erkennbare **Temperaturdifferenz von 10 °C**, keine gleiche Beobachtungszeit und keinen begrenzten Temperaturbereich. Das aktuelle Ziel verlangt, den Einfluss **mithilfe der RGT-Regel zu quantifizieren**. Das sichtbare Verhältnis 1:3 lässt sich ohne diese Bedingungen nicht als RGT-Aussage lesen; der unbegrenzte Aufwärtspfeil kann zudem nahelegen, Enzymaktivität steige bei jeder weiteren Erwärmung. Eine Bildunterschrift oder ein Alttext könnte diese fehlende Kernaussage nur nachträglich hinzufügen, nicht den Kandidaten visuell korrigieren.

Gezielte Korrektur: zwei große, bei 360 Pixeln erkennbare Temperaturzustände mit ausdrücklich **+10 °C**, gleicher Messdauer und zählbarer **2- bis 3-facher Reaktionsrate** in einem als gültig eingegrenzten Temperaturbereich. Ein späterer Aktivitätsabfall/Denaturierung darf durch den Aufwärtspfeil nicht ausgeschlossen wirken. Danach Original und beide Ansichtsgrößen erneut fachlich und visuell prüfen.

## `861fbc18` — Transportprozesse experimentell untersuchen: KEEP

Original-SHA-256: `93ac678d18b4c146fdf4b606bb8af9a9ba2632e12d32de04777f55bbde0d90d9`. Drei getrennte Skizzen zeigen einen sich im Wasser ausbreitenden Farbstoff, Wasserbewegung durch eine selektiv durchlässige Trennwand zur stärker gelösten Stoffseite und eine plasmolysierte Pflanzenzelle, deren Protoplast sich von der Zellwand gelöst hat. Richtung der Osmosepfeile und die Trennung von Zellwand und Protoplast sind fachlich plausibel. Die Bilder sind schematische Einstiegssituationen; sie behaupten keine vollständige Versuchsanordnung oder allein aus der Skizze gesicherte Messung.

Bei 360 Pixeln sind alle drei Motive sowie die Lücke zwischen Zellwand und Protoplast noch erkennbar; bei 680 Pixeln auch die Wasser- und gelösten Teilchen. Keine Kleinschrift. Geeigneter Alttext: „Drei schematische Situationen: Farbstoff verteilt sich im Wasser; Wasser bewegt sich durch eine halbdurchlässige Trennwand zur Seite mit mehr gelöstem Stoff; in einer Pflanzenzelle ist der Protoplast von der Zellwand zurückgewichen.“

**Folge für die Integration:** Die drei KEEP-Urteile sind unabhängige Kandidatenbefunde. Erst nach aktueller kanonischer Bild- und Alttextbindung, bytegleicher Assetprüfung und dem maschinellen V-Checker kann eine maschinelle Visualisierungsfreigabe entschieden werden. `e566ae2f` bleibt bis zu einer fachlich passenden Neufassung offen. Menschliche Prüfung, Freigabe und Erprobung sind gesonderte Gates.
