# Drei gezielte Physik-Bildkorrekturen – 8. September 2026

Provider: Google Gemini / Nano Banana Pro (`gemini-3-pro-image`). Alle
Erzeugungen wurden zunächst mit `--no-import` ausgeführt. Die ausgewählten
Originalraster wurden vollständig sichtbar geprüft und erst danach nativ
importiert. `individual-review.json` hält die vorherigen und neuen
Hashbindungen samt Einzelgründen fest. **Keine menschliche Freigabe**.

## Klima: f322c268-dc16-5d50-82dd-209834f20208

Die universelle Forderung nach gleicher Nutzenergie wurde durch Offenlegung
von Bezugsgröße und Bilanzgrenze ersetzt. Vergleiche nennen die Bedingungen
für Emissionsfaktor/Nutzen ausdrücklich.

- Versuch 1: `rejected/climate-v1.jpg`; inhaltliche Tabellenkorrekturen
  gelungen, aber die gewünschte Schlussnotiz zu Daten/Annahmen/Grenzen
  unbeabsichtigt überschrieben. Nicht übernommen.
- Versuch 2: Schlussnotiz wiederhergestellt; alle Tabellenfelder nochmals
  gelesen. Das aktive kanonische Bild ist die zweite Fassung.

## Strahlendosis: e6a50c74-c922-508c-aa27-07bac2566955

Die alte Zweiformel-Darstellung ohne ausreichende Modellgrenze wurde durch
drei getrennte Dosisgrößen mit Index-/Einheitenlegenden ersetzt. Der
Abschirmungsvergleich arbeitet mit vorgegebenen Modelldaten und derselben
Dosisgröße, ohne daraus Sicherheit oder individuellen Schaden abzuleiten.

- Versuch 1: `rejected/dose-v1.jpg`; doppelte Präposition und unzulässige
  Gleichsetzung einer Dosis mit einer Prozentzahl. Der erste Prompt enthielt
  selbst diese missverständliche Kurznotation; sie wurde bei der Sichtprüfung
  erkannt, nicht als richtig gebilligt.
- Versuch 2: `rejected/dose-v2.jpg`; Rechnung und Skizzenstatus korrigiert,
  die doppelte Präposition jedoch nicht entfernt. Nicht übernommen.
- Versuch 3: kurze eindeutige mittlere Erklärung, sämtliche Formeln und
  Bedingungen erhalten; jedes Feld erneut gelesen. Aktive Fassung.

Begriffsabgleich: [StrlSchV Anlage 18, B](https://www.gesetze-im-internet.de/strlschv_2018/anlage_18.html),
nur als Terminologiequelle für die Gewichtung. Das ausdrücklich vereinfachte
Gewebemodell ist keine medizinische Prognose oder rechtliche Prüfung.

## Fermienergie: 658cf33d-a0c2-5d47-801a-3dbcd5cac074

Die alte unklare Elektronen-/Wellendarstellung wurde durch drei schematische
0-K-Fälle ersetzt. Ein durchgehendes Metallband bleibt teilweise gefüllt;
im Halbleiter/Isolator sind volle und leere erlaubte Bänder von Lücken ohne
erlaubte Zustände getrennt. Farben, Fermilinie und Temperaturregime sind
erklärt. Der erste neue Versuch war nach vollständiger Sichtprüfung verwendbar.

## Reproduzierbarkeit

Alle gezielten Zusatzprompts liegen unter
`quality/goal-description-review/physik/rollout-v1/2026-09-08/`:
`climate-comparison-image-correction-v1/v2.md`,
`dose-quantities-image-correction-v1/v2/v3.md`,
`fermi-band-occupation-image-correction-v1.md`.
Die vollständigen letzten Providerprompts und separaten
`image-reconstruction-prompt.de.md` liegen neben den jeweiligen kanonischen
Bildern unter `visualizations/physik/<goalId>/`. Die bisherigen aktiven Bilder
und ihre alten Prüfvermerke bleiben über Git bzw. den Vorherteil des Receipts
nachvollziehbar. Frühere D-Reviews werden durch einen Bildaustausch nicht
automatisch zu aktuellen Reviews.
