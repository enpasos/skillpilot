# Unabhängiges B-Review: Graph `f` → Graph einer Stammfunktion `F`

Status: **REVISE / keine V-Freigabe.** Nur Bildkandidat geprüft; kein Import, keine QA-Ledger- oder Kanonänderung. Die parallele A-Bewertung wurde nicht herangezogen.

- Kandidatenziel: `21676dae-8619-59d1-89e3-a35bb2297e2c`, wie in `curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-by-he-antiderivative-graph-gap-20260927-v1/README.md` vorgeschlagen; noch kein angelegtes Ziel.
- Bild: `/home/enpasos/.codex/generated_images/01a03a32-5c3d-7122-a394-13d4f26b0054/exec-3efb6249-3bed-4814-87db-4fa4d20d5b05.png`, 1672 × 941, SHA-256 `8778b22f91e0cfcc1d06858224f38f4db84642be5c1f275570efdef66c07f90d`.

## Was stimmt

Links zeigt die blaue Gerade `f(x)=x` die markierten Punkte `(-2,-2)`, `(0,0)` und `(2,2)` konsistent. Rechts ist die qualitative Geschichte einer Stammfunktion richtig: Sie fällt für `x<0`, besitzt bei `x=0` eine stationäre Stelle und steigt für `x>0`. Die rote durchgezogene Kurve hat den Scheitel `(0,0)`, die gestrichelte ist ungefähr konstant vertikal verschoben und hat den markierten Scheitel `(0,1)`; dies illustriert eine Auswahl `C=1` aus der Familie `F+C`. Die zentrale Beziehung `F′=f` und die dreiteilige Story des vorgeschlagenen Atoms (gegebener f-Graph, begründeter Verlauf von F, Freiheit der vertikalen Lage) sind erkennbar. Titel und andere deutsche Formeln/Labels sind sprachlich und symbolisch korrekt.

Bei tatsächlicher Verkleinerung auf **360 px** bleiben die drei Aussagen unten, die Formeln und der Pfeil noch lesbar; die Koordinatenlabels sind klein, aber erkennbar. Lesbarkeit ist hier nicht der Blocker.

## Mathematischer Blocker: Kurve und Koordinatensystem widersprechen der Formel

Rechts wird ausdrücklich `F(x)=x²/2` über einem Koordinatensystem mit `x=−2,0,2` und den Punkten `(0,0)` beziehungsweise `(0,1)` gezeigt. Der vertikale Pixelabstand zwischen den beiden markierten Scheiteln definiert eine y-Einheit von ungefähr 112 px. Am markierten Tick `x=2` müsste die durchgezogene Kurve daher `F(2)=2` und somit etwa **224 px über** dem Ursprung liegen. Im tatsächlichen Bild liegt sie dort nur ungefähr **165–170 px über** dem Ursprung, also auf einer Höhe von ungefähr `1,5` statt `2`. Die linke Seite bei `x=−2` weist denselben Fehler auf. Die gestrichelte Kurve bewahrt ungefähr den konstanten Abstand, übernimmt aber die falsche Krümmung: Für das gezeigte `C=1` läge sie bei `x=2` auf `3`, im Bild ungefähr auf `2,5`.

Dies ist keine bloße Stilfrage: Aus `F(x)=x²/2` folgt quantitativ `F′(x)=x`. Die gezeichnete Kurve ist dafür unter den eigenen Achsenmarken zu flach. Eine mathematisch geprüfte Visualisierung darf die explizite Formel und explizite Koordinaten nicht nur qualitativ, sondern auch numerisch verbinden. Die Kurven und die Punkt-/Skalierungslabels müssen in einer neuen Fassung gemeinsam konstruiert bzw. überprüft werden.

Zusätzlich ist `f=0 → F waagerecht (bei x=0)` missverständlich: Nicht **F als Funktion** ist dort waagerecht, sondern **die Tangente an F**. Eine präzise Kurzform wäre `f(0)=0 → F hat bei x=0 eine waagerechte Tangente`. Die Aussage sollte vor einer Freigabe entsprechend korrigiert werden.

Urteil: **REVISE**, danach erneute unabhängige Bildprüfung auf denselben konkreten Punkten und bei 360 px. Das Bild darf nicht allein wegen der gelungenen qualitativen Idee als M7-V übernommen werden.
