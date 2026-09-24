# Mathematik M7: bildgebundene P-v2-Prüfung für Normalmodell und Definitionsmenge

Dieses Paket ersetzt **nur** die beiden bisherigen textgebundenen P-Owner für
`b431148b-526c-4bde-b04b-48d23101d0d3` und
`502ecaa7-cca6-5c51-a1cc-da09a7b2382c`. Die übrigen sieben Profile aus
den bisherigen Ownern sind in `normal-source-retained-one.*` und
`domain-source-retained-six.*` zeilen- und profilidentisch erhalten. Die
historischen Originaldateien bleiben unverändert. Die zentrale Registry muss
bei Integration die beiden alten Owner durch diese drei Configs ersetzen;
vorher ist dieses Paket ein Kandidat und kein zusätzlicher Gate-Zähler.

Die beiden neuen Records in `current-two.*` haben den wahrheitsgemäßen Status
`needs_human_review` und die Autorität `ai_candidate`. Sie sind keine
menschliche Freigabe und dokumentieren keine Lernendenleistung. Ihre
`reviewInputFingerprint`-Werte binden die aktuellen kanonischen Ziele, die
jeweilige Visualisierungs-URL, Alttexte und die tatsächlich geprüften PNG-Bytes.
`binding-review.json` hält zusätzlich die aktuellen Seiten- und Quellenwerte
fest. P bindet diese Seite und die Quelle nicht direkt; deren D- und
Quellenprüfung bleibt ein eigener Schritt.

## Inhaltliche Prüfung

| Ziel | Aktuelles Bild und Seite | Unabhängiger Leistungsnachweis |
| --- | --- | --- |
| Annähernd normalverteilte Zufallsgrößen erkennen (LK) | PNG `de87084c…fef0f`, GoalBook-Seite 452. Das Bild kontrastiert Bin(100;0,5) mit einem seltenen Bin(100;0,01)-Fall und kennzeichnet die Histogramme als schematisch. Der kanonische `sourceRef` fehlt; die vorhandene BY-Quellenzuordnung M13.2 wird hier nicht stillschweigend neu freigegeben. | Die zwei bereits geprüften, unveränderten P-Fälle verlangen Bin(100;0,4) als plausible Normalnäherung und Bin(20;0,001) als Gegenbeispiel. `np`, `n(1−p)`, Form, Randlage und Unabhängigkeit werden begründet; keine Intervallwahrscheinlichkeit oder Stetigkeitskorrektur wird zur Zielkompetenz umgedeutet. |
| Definitionsmenge einer Funktion bestimmen | PNG `fbc4a7ff…c4e9`, GoalBook-Seite 188. Der Term `1/(x−3)` schließt `x=3` aus; der vollständig markierte Graph hat `[1,4)`, der Laufkontext `t≥0`. Kanonischer `sourceRef`: HKM E.1, S. 31. | Die zwei bereits geprüften, unveränderten P-Fälle verwenden stattdessen `√(x+1)/(x−2)` mit `[-1,2)∪(2,∞)`, einen anderen vollständigen Graphen mit `[-3,4)` und ein Tankmodell mit sachlichem Intervall `[0,12]`. Ausschlüsse, offene/geschlossene Grenzen und Sachrestriktionen müssen selbst begründet werden. |

Die neuen Bilder geben keine Lösung für diese Transferfälle preis. Bei beiden
Zielen blieben DE/EN-Zieltext und `goalFingerprint` unverändert; die neue
Bildbindung ändert gezielt den `reviewInputFingerprint`. Die dynamische
GoalBook-Projektion, nicht ein möglicherweise älteres statisches BookModel,
lieferte die Seiten- und Bildwerte im Receipt. Der Bildimport macht ältere
D-Seiten-/Kontext-Receipts nicht automatisch aktuell: das ist separat zu
prüfen, bevor ein strenger Fünf-Gate-Abschluss beansprucht wird.

Prüfung und reproduzierbare Materialisierung:

```bash
./app/node_modules/.bin/tsx app/scripts/materializeMathM7NormalDomainImagePDelta.ts --check
./app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-normal-domain-image-bound-p-20260924-v1/current-two.config.json --mode=check
```
