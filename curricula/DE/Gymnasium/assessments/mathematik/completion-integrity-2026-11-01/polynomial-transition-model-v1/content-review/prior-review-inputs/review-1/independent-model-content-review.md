# Unabhängiges Inhaltsreview der Übergangsweg-Aufgabe

Entscheidung: **begrenzte Nachbesserung vor Inhaltsfreigabe**. Geprüft am 1. November 2026 durch `/root/astra_math_model_review`. Der mathematische Kern und die Zusammenfassung der drei Lücken in einer Aufgabe sind tragfähig. Die genaue Bindung an die gelesenen Dateien steht in `independent-model-content-review.json`.

Geprüfte Ausgangsfassung: Manifest `3ea20a32fe71687788462bc2263a0792d9ce8faafc43ac8d5f19d45c0485406f`, Goal `46f9a38d9455f6585c7f0ed6baddd278cdccf0e4c4dc5d5454364a1af69d57ff`, unveränderter Kanon `3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c`. Alle Manifestbindungen und alle vollständigen Ausgangsverträge stimmen mit den aktuellen Dateien überein. DE-/EN-Aufgabe und Lösung stimmen jeweils exakt mit den eingebetteten Goaltexten überein.

## Inhalt und Mathematik

Alle drei **vollen Goalverträge** werden durch verlangte, gelöste und bepunktete Handlungen erreicht:

| Vertrag | Nachweis in der Aufgabe |
| --- | --- |
| Polynomrekonstruktion `8e1b0d9c…` | Aus Eigenschaften ein vollständiges Koeffizienten-LGS aufstellen, nachvollziehbar lösen und das Ergebnis prüfen (1–3, Kontrollen in 4/5). |
| Anschlussmodellierung `4b16fce6…` | Beide Werte- und Steigungsübereinstimmungen selbst aus dem Kontext formulieren, im gemeinsamen Modell lösen, an beiden Nähten prüfen und deuten (1/3/4). |
| Wendemodellierung `b88cbf71…` | Wendebedingung ist Bestandteil der Modellbildung; notwendige Bedingung, echter Wechsel und Kontextdeutung werden ausdrücklich geprüft (2/3/5). |

Eine frische unabhängige symbolische Herleitung aus den fünf Bedingungen bestätigt Rang 5, Determinante −64 000 000, die angegebenen Koeffizienten und fünf Residuen 0. Die faktorisierte zweite Ableitung hat einfache Nullstellen 5 und 10; beide sind echte Wendestellen. Die Zusatzwende ist offengelegt. Die erste Ableitung ist bis 20 negativ; der Höhenbereich ist [7/2,5]. Beide Nähte sind C1, keine ist C2. Das Modell behauptet zutreffend keine bautechnische Eignung. Die deutsche und englische Fassung sind fachlich gleichwertig.

Die drei Kompetenzziele und das rechnerische LGS-Ziel `546bf0b3…` sind passende Vorbereitung. Die vollständigen bestehenden Voraussetzungen bleiben erhalten. Graphisches LGS-Lösen wird hier nicht geprüft, daher zu Recht keine Coverage für dieses breite Ziel; ebenso keine automatische Coverage transitiver Vorbereitung. Ein geometrisches Q2-LGS-Ziel ist unnötig.

## Verbindlich empfohlene begrenzte Korrekturen

1. **11/13 statt 13/13**, mit einer transparenten gewöhnlichen Rubrik-Kappung auf **höchstens 10 Punkte**, falls eine der folgenden Kernhandlungen fehlt oder fachlich falsch ist: vollständige Rekonstruktion einschließlich LGS, nachvollziehbarem Lösungsverfahren und wirklicher Bedingungskontrolle; Formulierung/Deutung und Prüfung beider C1-Nähte; Wendebedingung, notwendige versus hinreichende Bedingung, gültiger Wendetest und Kontextdeutung. Die Kappung gilt für die gesamte Lösung, nicht für den Ort, an dem eine Handlung notiert wurde.
2. Isolierte erkennbare Rechenfehler von fehlenden Modellierungshandlungen unterscheiden. Richtige Folgearbeit am eigenen Term erhält Punkte; denselben Ursprungsfehler nicht mehrfach abziehen. Eine fachlich richtige Kontrolle kann ergeben, dass der eigene Term eine Vorgabe nicht erfüllt, sofern dies ausdrücklich erkannt wird. Bloße unbegründete Erfüllungsbehauptungen sind keine Kontrolle. Die zusätzliche Wende 5 sowie Höhenprüfung/Modellgrenze bleiben normale Zusatzpunkte, keine weiteren Bestehenskerne.
3. Die Aufgabenfrage verlangt in Teil 2 kein Gegenbeispiel. Deshalb eine fachlich ausreichende Erklärung akzeptieren; Gegenbeispiel nur als mögliche Begründung nennen. Der vierteilige Rekonstruktionspunkt muss gleichwertige systematische Lösungswege zulassen, ohne zwingend erst e,d und dann genau das notierte 3×3-System zu verlangen. Nachweise in 3/4/5 dürfen einander belegen, ohne doppeltes Niederschreiben.
4. Englisch: `1 points` zu `1 point`. Schwelle, Rubrik und Hinweise konsistent in beiden Sprachdateien, Goal, Delta, README und Autorenchecks aktualisieren.

Das ergibt **ein** gewöhnliches Aufgabenresultat und die vorhandene binäre Mastery. Es werden keine Teilqualifikationen, zusätzlichen Evidenzzustände oder zweite Mastery-Entscheidungen vorgeschlagen. Bestehende gültige Mastery bleibt gültig.

## Phase und zusätzliche Pflicht

Alle drei aktuellen kanonischen Verträge einschließlich der Krümmungs-/Zweite-Ableitung-Vorbereitung tragen E. Der Kandidat ist damit intern konsistent, aber das belegt keine amtliche E-Phasen-Zuordnung. Die inhaltliche Kurzbeschreibung sollte neutral „Oberstufe: Polynomrekonstruktion mit erster und zweiter Ableitung“ heißen. E darf vorläufige Kompatibilitätsmetadaten bleiben; die tatsächliche Phase folgt dem gesonderten Quellen-/Scope-Review. Eine pauschale Umstellung auf Q1 allein aufgrund allgemeiner Unterrichtserwartung wäre ebenfalls unbelegt. Phase erzeugt keine Enrollmentfreigabe.

Eine zusammenhängende neue Prüfung ist inhaltlich gerechtfertigt: Dieselben fünf Bedingungen verbinden alle drei tatsächlich fehlenden Handlungen. 13 BE sind keine validierte Zeit- oder Arbeitslastangabe. Die reale zusätzliche Zielpflicht, Source-/Stufen-/Kursauswahl und M7 bleiben getrennt zu prüfen. Historische Hängebrücke, J9-Ballparabel und J10-Führungsschiene werden zu Recht nicht verändert. Die isolierten NativeChecks sind Autorenbelege, keine tatsächliche Scope- oder M7-Abnahme.

Nach Korrektur genügt ein enges Nachreview der neuen Bytes und der Bewertungsregeln; kein erneutes Audit aller 165 Aufgaben.
