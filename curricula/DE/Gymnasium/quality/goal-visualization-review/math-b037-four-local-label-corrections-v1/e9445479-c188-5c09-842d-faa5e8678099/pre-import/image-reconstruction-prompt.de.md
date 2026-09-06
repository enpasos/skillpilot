# Bildrekonstruktionsprompt: Potenzregel für ganzzahlige Exponenten exemplarisch begründen

## SkillPilot-Ziel

- SkillPilot-ID: `e9445479-c188-5c09-842d-faa5e8678099`
- Titel: Potenzregel für ganzzahlige Exponenten exemplarisch begründen
- Beschreibung: Die lernende Person kann die Ableitung von $f(x)=x^n$ für betragsmäßig kleine ganzzahlige Exponenten exemplarisch begründen und die Potenzregel fachsprachlich einordnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `e9445479-c188-5c09-842d-faa5e8678099.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein Präsentationsfolie mit einem hellblauen Kopfbereich oben und einem hellblauen Fußbereich unten rechts. Der Hintergrund der Folie ist weiß. Die Folie ist vertikal in zwei Spalten geteilt durch eine dünne hellblaue Linie.

Im hellblauen Kopfbereich steht zentriert in schwarzer, fetter, serifenloser Schrift der Titel: "Potenzregel exemplarisch begründen".

Die linke Spalte zeigt eine mathematische Ableitung. Oben links steht in schwarzer, fetter, serifenloser Schrift: "Beispiel f(x) = x²". Darunter folgen mehrere Zeilen mit Gleichungen, die den Grenzwert des Differenzenquotienten berechnen:

1.  Die erste Zeile beginnt mit `f'(x) = lim` mit `h→0` als Index unter `lim`. Die Gleichung ist `(x + h)² - x² / h`. Dabei ist das erste `x` in Rot, das `h` in Grün.
2.  Die nächste Zeile beginnt mit einem leeren, nach rechts zeigenden Pfeil (schwarze Kontur, weiß gefüllt), gefolgt von `= lim` mit `h→0` als Index. Die Gleichung ist `(x + h)² - x² / h`. Hier sind `x` und `h` in Blau. Rechts daneben befindet sich eine hellgrau umrandete, wolkenförmige Sprechblase mit weißem Hintergrund. Darin steht in schwarzer Schrift: `(x + h)² = x² + 2xh + h²`. Das erste `x²` ist Rot, `2xh` ist Blau, `h²` ist Grün.
3.  Die dritte Zeile beginnt ebenfalls mit einem leeren, nach rechts zeigenden Pfeil, gefolgt von `= lim` mit `h→0` als Index. Die Gleichung ist `(x² + 2xh + h²) - x² / h`. Das erste `x²` ist Rot und mit einer roten diagonalen Linie durchgestrichen. Das letzte `x²` ist ebenfalls Rot und mit einer roten diagonalen Linie durchgestrichen. Rechts daneben steht in kleinerer schwarzer Schrift: "x² Terme kürzen sich".
4.  Die vierte Zeile beginnt mit einem leeren, nach rechts zeigenden Pfeil, gefolgt von `= lim` mit `h→0` als Index. Die Gleichung ist `2xh + h² / h`. `2xh` ist Blau, `h²` ist Grün.
5.  Die fünfte Zeile beginnt mit einem leeren, nach rechts zeigenden Pfeil, gefolgt von `= lim` mit `h→0` als Index. Die Gleichung ist `h(2x + h) / h`. Das `h` im Zähler ist Blau und mit einer blauen diagonalen Linie durchgestrichen. Das `h` im Nenner ist ebenfalls Blau und mit einer blauen diagonalen Linie durchgestrichen. Rechts daneben steht in kleinerer schwarzer Schrift: "h ausklammern & kürzen".
6.  Die sechste Zeile beginnt mit einem leeren, nach rechts zeigenden Pfeil, gefolgt von `= lim` mit `h→0` als Index. Die Gleichung ist `(2x + h)`. `2x` ist Blau, `h` ist Grün. Unter dem `h` befindet sich eine grüne Wellenlinie, und ein grüner, geschwungener Pfeil zeigt von der Wellenlinie nach rechts unten.
7.  Die letzte Zeile ist `= 2x` in schwarzer, fetter Schrift. Rechts daneben befindet sich ein gefüllter, schwarzer, nach links zeigender Pfeil, gefolgt von "Grenzwertbildung (h → 0)" in schwarzer Schrift.

Die rechte Spalte enthält eine Einordnung. Oben rechts steht in schwarzer, fetter, serifenloser Schrift: "Einordnung". Darunter steht in schwarzer, fetter mathematischer Notation die allgemeine Potenzregel: `d/dx (xⁿ) = n ⋅ xⁿ⁻¹`.
Darunter befindet sich ein leerer, nach rechts zeigender Pfeil (schwarze Kontur, weiß gefüllt), dessen rechteckiger Körper den schwarzen Text "Mapping Beispiel" enthält. Rechts vom Pfeil steht in schwarzer, fetter mathematischer Notation die Anwendung der Regel: `n = 2 → 2 ⋅ x²⁻¹ = 2x`.

Im hellblauen Fußbereich der rechten Spalte steht zentriert in schwarzer, serifenloser Schrift: "Der Differenzenquotient begründet die Potenzregel im Beispiel."
```
