# Unabhängige Bildprüfung: Bedingte Wahrscheinlichkeiten berechnen

22.09.2026 (Europe/Berlin); Prüfzeit UTC: `2026-09-21T22:06:38Z`. **KEEP**, Status `candidate`, Autorität `ai_candidate`. Keine Humanfreigabe, kein Import, keine QA-Aggregatänderung und keine Realhost-Abnahme.

Aktuelles Referenz-JPG und neues PNG wurden zuerst tatsächlich angesehen. Eigene Sachentscheidung vor dem Lesen des Edit-Prompts und Root-Reviews gebildet. Die frühere Hold-Inventur war bekannt; dies ist eine unabhängige neue Kandidatensicht, kein historisch blinder Vollreview.

- Kandidat: `candidate.png`, 1679 × 937; `sha256:35597d1ab49a10950d1b1ce8f6b9d8b09e081777f08736028f972b84238fe435`.
- Referenz und kanonisches Quellbild: `sha256:5d78516976cd24e1c9a78e1558a4798109b1c2c160115a98d85826ba65e0ee10` (beide Dateien stimmen überein).
- Toolherkunft erst nach der Sachprüfung aus `generation-and-root-review.json` gebunden: OpenAI / ChatGPT-Codex image generation, `image_gen__imagegen`, Result-ID `exec-b26b952a-c3fa-44ee-bbc4-289dafb2075a`; exaktes Serving-Modell nicht offengelegt.

## Konkrete Prüfung

- Tafel mit B/B̄ als Zeilen und A/Ā als Spalten: gemeinsame Werte 0.30,0.20,0.10,0.40; P(A)=0.40, P(Ā)=0.60, P(B)=P(B̄)=0.50. Alle Summen korrekt.
- Beide unteren Formeln geben P(B|A)=P(A∩B)/P(A)=0.30/0.40=0.75 richtig an. Orange Kreise markieren sowohl Zähler 0.30 als auch Nenner 0.40; das positive P(A) erlaubt die Division.
- A-Zweige: 0.75+0.25=1, Produkte mit 0.40 ergeben 0.30 und 0.10. Ā-Zweige: 1/3+2/3=1, Produkte mit 0.60 ergeben 0.20 und 0.40. Endereignisse und Überstriche passen zu allen vier Tafelfeldern.
- Die früher gerundeten Gleichheitsangaben =0.33/=0.67 wurden durch exakt =1/3 und =2/3 ersetzt. Es verbleibt kein Rundungswiderspruch zwischen Zweigwerten und Endwahrscheinlichkeiten.
- Schwarze Baumzweige verbinden A bzw. Ā mit den richtigen gemeinsamen Endereignissen. Blaue Hinweise verbinden die bedingte Rechnung mit Bezugsgruppe A und passendem gemeinsamen Fall; kein geänderter Pfeil verwechselt A und Ā oder B und B̄.

Das AB2-Beispiel verknüpft dieselben relativen Häufigkeiten in Tafel und Baum mit der bedingten Rechnung. Es zeigt keine unzutreffende Unabhängigkeit und erweitert den Scope nicht zu einer zusätzlichen Bayes-Umkehrkompetenz.

## Stil und Lesbarkeit

Warmer Papiergrund, sanfte blaue Panels, schwarze handschriftnahe Schrift, orange Markierungsringe und weiche blaue Hinweislinien erhalten die bestehende Bildlandschaft. Tabellenwerte, Baum-Endereignisse, Überstriche, Bedingungsstriche, Brüche 1/3 und 2/3 sowie beide unteren Quotienten sind lesbar. Keine nötige Formel abgeschnitten. Prüfung am bereitgestellten Raster, kein neuer Browser-/Mobil-/Screenreadertest und keine pixelidentische Erhaltung behauptet.

Keine blockierenden Befunde. Die vollständige eigenständig nutzbare `reconstruction-prompt.md` legt Zahlen, Ereigniszuordnung, Layout, Farben und Notation fest. Eine spätere Rekonstruktion muss ihrerseits geprüft werden. Die maschinenlesbare Evidenz und genaue Herkunftsbindung stehen in `ai_candidate-review.json`. Weitere Canonical-/D-/P-/V-Integration bleibt beim koordinierenden Agenten.

