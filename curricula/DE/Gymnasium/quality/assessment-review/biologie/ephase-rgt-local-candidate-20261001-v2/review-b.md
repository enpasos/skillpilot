# Unabhängiger Fachreview B: RGT-Lokalaufgabe v2

**Stand:** 2026-10-01. **Urteil: HOLD als inaktiver Kandidat.** Bewertet wurden der tatsächliche neue `candidate.json`-Inhalt, das aktuelle Ziel `e566ae2f-1294-55c0-ba4c-6aeb4954118c`, amtlicher HE-KC Biologie E.2 (gedruckte S. 36), der aktuelle Prüfungspunkte-Vertrag und der konkrete v1-HOLD. Keine aktive Aufgabe, Kanonänderung oder menschliche Freigabe durch diesen Review.

## Korrigierte Teile: fachlich KEEP

Die v2-Aufgabe temperiert Katalase und H₂O₂ jetzt **getrennt**, mischt beide **erst zum Beginn** der 60-s-Messung und setzt H₂O₂ für diese Minute im Überschuss voraus. Das macht die Volumina als Näherung vergleichbarer mittlerer Reaktionsraten plausibel. HE-only-Scope, E-Phase-Elterncluster, `requires` auf RGT und alleinige Coverage-ID für das aktuelle RGT-Ziel sind passend. Die vier fiktiven Werte bleiben konsistent: `4,8/2,0 = 2,4`; `11,5/4,8 ≈ 2,40`; aus 4,8 mL bei 20 °C folgen für 30 °C `9,6–14,4 mL`, worin 11,5 mL liegt; `6,0/11,5 ≈ 0,52` bei 30→40 °C. Die Lösung behauptet aus dem Rückgang keine bewiesene Denaturierung oder allgemeine Optimumtemperatur. Die drei Teilsummen ergeben weiterhin 20 BE.

## Verbleibender HOLD: 18/20 erzwingt die Nicht-Extrapolation nicht

Die Aufgabe und ihre eigene `evidenceRequirements`-Zeile beanspruchen ausdrücklich, dass die lernende Person am 40-°C-Gegenbefund **nicht** weiter mit dem RGT-Faktor extrapoliert. Im 20-BE-Raster ist die „korrekte Nicht-Extrapolation“ aber nur **1 BE** in Aufgabe 3 wert. Mit allen anderen Punkten und **0 BE** genau dafür sind **19/20 BE** erreichbar; `passingPoints: 18` lässt diese Abgabe bestehen. Der zusätzliche Text „Eine Gesamtpunktzahl genügt nur zusammen mit ...“ steht außerhalb von `examData.scoring` und ist nach aktuellem Vertrag **kein technisch erzwungenes Teilminimum**. Sowohl `OpenAiDeV1McpContractAdapter.java` als auch `ClaudeV1McpContractAdapter.java` prüfen beim Exam-Mastery-Schritt nur `earnedPoints >= passingPoints` (derzeit um Zeilen 2168 bzw. 1885); die vorhandene Mathematik-Prüfungsreview dokumentiert dieselbe Summenregel. Ein KI-Bewertungshinweis ist daher keine verlässliche Gate-Bindung für den behaupteten Kompetenznachweis.

Für das **bestehende** Punkteprofil ist `passingPoints: 20` die einfache sichere Schwelle: Auch der 1-BE-Grenzsatz wird dann für ein bestandenes Ergebnis benötigt. Alternativ kann die Aufgaben-/Rubrikstruktur so geändert und erneut geprüft werden, dass die notwendige Grenzleistung bereits aus einer technisch erzwungenen Gesamtschwelle folgt. Eine gesonderte serverseitige Teilminimum-Logik wäre eine Runtime-Änderung und gehört nicht zu diesem QS-Auftrag. Die Textanforderung kann als Bewertungsanleitung bleiben, ersetzt die Schwelle aber nicht.

**Kleiner Lösungspunkt bei einer Revision:** Der vorgeschlagene Abkühlversuch sollte ausdrücklich frisches H₂O₂ und vergleichbar vorbehandelte Katalasealiquots verwenden. Eine erneute Messung derselben verbrauchten Mischung trennt Substratverbrauch nicht sauber von bleibendem Aktivitätsverlust. Dies ändert keine der korrekten RGT-Rechnungen.

Der Kandidat bleibt `examData.reviewStatus: draft`. Nach der eng begrenzten Schwellen-/Rubrikkorrektur kann er gezielt erneut geprüft werden; bis dahin ist die lokale RGT-Route fachlich noch nicht als bestandenes Assessment abgedeckt.
