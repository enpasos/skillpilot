# Begrenzte P-Nachprüfung nach B038r-Textkorrekturen

Codex, 2026-09-06, AI-Kandidatenprüfung; keine menschliche Einzelabnahme.

Die sieben individuell verfassten B038h-Profile wurden vor der Registrierung
mit dem aktuellen Zielumfang abgeglichen. Die vier Textkorrekturen verändern
nicht ihre unabhängig ausgearbeiteten Aufgabenfälle:

- **781f133a:** Verhältnisse 50/75/112,5 gegen konstante Differenzen sowie
  Halbierung pro drei Stunden prüfen schon den nun explizit benannten Faktor
  bei gleichen Zeitabständen. Kein Ableitungsverfahren erforderlich.
- **346efb31:** Verdopplungszeit zwei Schritte bei Faktor √2 und Halbwertszeit
  ein Schritt bei aus Zweistundenwerten rekonstruiertem Faktor 0,5 prüfen die
  jetzt korrekt übersetzte Zeitgröße. Die deutsche Kompetenz bleibt gleich.
- **f05acdc5:** Kontinuierliches Wachstum mit Rate 0,2 und ein Zerfallsmodell
  mit dreistündiger Halbwertszeit verlangen bereits skalierte e-Terme und die
  Deutung der konstanten relativen Rate. Die angegebenen numerischen
  Hilfsbeziehungen verhindern eine versteckte neue Logarithmus-Voraussetzung.
- **ab720928:** Rekonstruktion aus Messwerten, separate Datenkontrolle und
  ausdrücklich bedingte Prognose decken die präzisierten Modellannahmen.
  Der zweite Fall weist einen widersprechenden neuen Messwert ausdrücklich
  aus, statt jede Datenreihe als exponentiell geeignet zu behandeln.

Die drei anderen Profile (628928a6, d900e0a4, 49f9059a) erhalten unveränderten
Zieltext und unveränderte Fallinhalte. Die Kandidatendatei selbst bleibt
unverändert; ihre ursprüngliche Autorenzeit ist keine nachträglich erfundene
neue Abnahme. Der native Kandidatenmaterialisierer bindet alle sieben Profile
an die tatsächlichen aktuellen Eingaben. E1/G1, `ai_candidate` und
`needs_human_review` bleiben erhalten. Die numerischen Beispiele werden mit
dem zugehörigen read-only Author-Check geprüft. Dieser P-Schritt ersetzt
weder die noch offene aktuelle D-Synthese noch Bild-QA.
