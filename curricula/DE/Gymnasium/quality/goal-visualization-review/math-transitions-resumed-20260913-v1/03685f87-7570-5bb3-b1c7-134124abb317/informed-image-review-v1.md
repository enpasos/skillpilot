# Informierter zweiter KI-Bildreview: Zustandsvektoren und Übergangsmatrizen

Prüfzeit: 2026-09-13T20:26:51Z. Lernziel-ID:
`03685f87-7570-5bb3-b1c7-134124abb317`.

Entscheidung: **fachlich geeigneter KI-Bildkandidat mit einem nicht blockierenden
Lesbarkeitshinweis** (`pass_with_nonblocking_note`, `ai_candidate`). Der konkrete
B045-Bildblocker ist behoben. Dies ist eine informierte Bildprüfung nach Kenntnis
der alten Befunde, kein blinder D-Review, keine menschliche Bildfreigabe und kein
fachlicher Abschluss des Lernziels. Es wurde weder importiert noch eine
Kanonik-, QA-, P- oder Registrybindung verändert.

## Geprüfte Dateien und Zielbindung

- Kandidat: `candidate-v1.png`, SHA-256
  `519433df50c5b69f6ee211cf5b94524323a0ea584f5329cad5e886daa17a36a0`.
- Original: `app/public/assets/goal-visualizations/mathematik/03685f87-7570-5bb3-b1c7-134124abb317/03685f87-7570-5bb3-b1c7-134124abb317.jpg`,
  SHA-256 `abb46e73ea384031a61027b9421f55f6261bd3fa038f551a4f493acf3b24264c`.
- Beide vollständigen tatsächlichen Dateien wurden mit `view_image` geöffnet;
  der PNG-Kandidat wurde in Originalauflösung geprüft. Die Begutachtung beruht
  auf sichtbaren Bildinhalten, nicht nur auf Prompt oder OCR.
- Aktuelles Ziel: Übergangsprozesse mit Zustandsvektoren und Übergangsmatrizen
  beschreiben und deren Einträge im Kontext deuten. Die aktuelle deutsche und
  englische Beschreibung sind inhaltlich gleich. Die Darstellung passt zu
  diesem Deutungsziel; sie behauptet keine beobachtete Lernleistung.

## Konkrete fachliche Prüfung

Die Spitze der Sprechblase „30% wechseln von A nach B“ liegt jetzt eindeutig
in der zweiten Zeile und ersten Spalte unmittelbar am Eintrag `0.3`. Sie zeigt
nicht mehr auf `0.6` in der ersten Zeile. Die Zielzelle und die Zahl bleiben
lesbar. Die zweite Blase „0% wechseln von C nach B“ zeigt weiterhin korrekt auf
`0.0` in Zeile B, Spalte C.

Die Matrix im zentralen Tableau und die rechts ausgeschriebene Rechenmatrix
haben dieselben neun Einträge:

```text
M = [[0.6, 0.2, 0.1],
     [0.3, 0.5, 0.0],
     [0.1, 0.3, 0.9]]
```

Die Spalten beschreiben die Ausgangszustände A/B/C, die Zeilen die Zielzustände.
Alle Einträge sind nichtnegativ. Die drei im Bild stehenden Spaltensummen sind
korrekt: `0.6+0.3+0.1=1`, `0.2+0.5+0.3=1`, `0.1+0+0.9=1`.

Das Produkt wurde zeilenweise unabhängig nachgerechnet:

```text
A: 0.6*100 + 0.2*50 + 0.1*20 = 60+10+2 = 72
B: 0.3*100 + 0.5*50 + 0.0*20 = 30+25+0 = 55
C: 0.1*100 + 0.3*50 + 0.9*20 = 10+15+18 = 43
```

Startvektor `(100,50,20)^T`, Folgezustand `(72,55,43)^T` und Gesamtbestand
`170` stimmen in sämtlichen Bildvorkommen überein. Beide als Zeilentupel
geschriebenen Vektoren sind korrekt mit Transpositionszeichen versehen. Es
gibt keinen zusätzlichen Matrixfaktor und keine falsche Gleichheitskette.
Die Rechnungen wurden zusätzlich mit einer lokalen Matrixmultiplikation
kontrolliert; deren übliche binäre Dezimalrundung ändert diese exakten Werte
nicht.

## Darstellung, Restbefund und Grenzen

Die hellblaue Fläche, abgerundeten Felder, breiten farbigen Pfeile und klaren
Kontraste erhalten den zugänglichen Stil des Originals. Titel, Matrixzahlen,
Ergebnisvektoren und Rechenregel sind in der geprüften Datei lesbar. Keine
sichtbaren falschen Ziffern, abgeschnittenen Ergebnisangaben oder neuen
mathematischen Artefakte wurden gefunden.

Ein bestehendes kleines Layoutproblem bleibt: Die 30%-Sprechblase verdeckt
einen Teil der unteren linken Zeilenbeschriftung „nach C“; das `C` ist sichtbar.
Die durch A/B/C, die beiden vollständig beschrifteten oberen Zeilen und beide
Vektoren festgelegte Zustandsordnung bleibt eindeutig. Das ist hier ein
nicht blockierender Lesbarkeitshinweis, keine weitere falsche Eintragszuordnung.
Bei einer späteren Layoutpflege wäre mehr Abstand zwischen Blase und Zeilenkopf
sinnvoll. Eine andere Behauptung wie vollständige Überlappungsfreiheit wird
ausdrücklich nicht erhoben.

Der vorliegende Review bewertet die vollständige Bilddatei. Eine Prüfung der
später tatsächlich gerenderten Buchseite oder eines mobilen Hosts sowie eine
menschliche Freigabe sind dadurch nicht erfolgt. Die alten B045-D-Records
bleiben als Historie erhalten; sie sind keine Reviews dieser neuen PNG-Bytes.
