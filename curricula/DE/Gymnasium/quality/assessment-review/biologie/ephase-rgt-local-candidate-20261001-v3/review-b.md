# Unabhängiger Fachreview B: RGT-Lokalaufgabe v3

**Stand:** 2026-10-01. **Urteil: HOLD als inaktiver Kandidat.** Geprüft wurden der tatsächliche v3-Aufgabentext, Musterlösung, 20-BE-Raster, aktuelles Ziel `e566ae2f-1294-55c0-ba4c-6aeb4954118c`, HE E.2 (gedruckte S. 36) und die summenbasierte Exam-Mastery-Grenze. Keine aktive Bindung oder menschliche Freigabe.

## Gezielte Verbesserungen

Die getrennte Temperierung von Katalase und H₂O₂, das Mischen erst zum Messstart und der Substratüberschuss machen den Vergleich der O₂-Volumina über dieselben 60 Sekunden plausibel. Die Werte und Lösungen bleiben korrekt: Faktoren 2,4 und rund 2,40; Spanne 9,6–14,4 mL; Gegenbefund 6,0/11,5 rund 0,52. Die Abkühlkontrolle verlangt jetzt ausdrücklich **frisches, gleiches H₂O₂**. Der 3-BE-Block `s3a` wird nur für den **richtigen 30→40-Quotienten gemeinsam mit ausdrücklicher, begründeter Nicht-Extrapolation** vergeben, sonst 0. Ohne `s3a` sind aus `s1+s2+s3b` maximal **8+6+3 = 17 BE** erreichbar, also weniger als `passingPoints: 18`. Damit ist die v2-Lücke zur Gültigkeitsgrenze tatsächlich geschlossen, ohne eine nicht vorhandene serverseitige Teilminimum-Logik zu behaupten.

## Noch nicht abgesicherte Teile der eigenen Evidenzanforderung

Die `evidenceRequirements` verlangen weiterhin **beide** geeigneten 10-°C-Faktoren sowie eine fachlich geprüfte **30-°C-Spanne**. Die v3-Rubrik lässt diese Kernteile aber einzeln ausfallen und dennoch 18/20 erreichen:

- `s1` vergibt je Intervall 2 BE. Fehlt **ein** Faktor vollständig, sind dort noch 6/8 BE möglich; mit `s2=6`, `s3a=3`, `s3b=3` ergibt das **18/20**. Der Nachweis beider Faktoren wäre nicht gesichert.
- `s2` gibt 2 BE je unterer/oberer Grenze und je 1 BE für Vergleich/Genauigkeitsgrenze. Fehlt **eine** der zwei Grenzen, sind noch 4/6 BE möglich; mit `s1=8`, `s3a=3`, `s3b=3` sind wiederum **18/20** möglich. Eine einseitige Grenze ist keine begründete Spanne.

Der aktuelle Exam-Vertrag prüft die Gesamtsumme `earnedPoints >= passingPoints`; die Top-Level-`evidenceRequirements` erzwingen keine zusätzlichen Rubrikminima. Eine enge, inhaltsgleiche Lösung bei 18/20 wäre `s1a` als **4-oder-0-BE-Block für beide korrekten 10-°C-Faktoren** plus `s1b` mit 4 BE für Einordnung/Messzeitbegründung, und `s2a` als **4-oder-0-BE-Block für beide korrekten Spanngrenzen** plus `s2b` mit 2 BE für Messwertvergleich/Genauigkeitsgrenze. Ohne `s1a` oder `s2a` wären höchstens **16/20** erreichbar; `s3a` bleibt bei höchstens 17/20 ohne den Grenzbefund. Die Musterlösung und Rubrik müssen diese gemeinsamen Vergaberegeln explizit tragen. Alternativ schützt 20/20 beim bisherigen Raster alle Einzelpunkte, ist aber deutlich strenger.

HE-only-Scope, aktuelles Ziel, Elterncluster, `requires`, ein-zielige Coverage, Datensatz und fachlich begrenzte Hypothese können bestehen bleiben. Der Kandidat bleibt `examData.reviewStatus: draft`, bis auch beide ersten Kernteile unter dem tatsächlich passierbaren Raster geschützt und erneut geprüft sind.
