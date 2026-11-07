# Musterlösung und sechs binäre Kompetenzkriterien

Jedes der sechs Kriterien K01, K02, K04, K05, K07 und K08 erhält genau 0 oder
1 Punkt. Alle genannten Kernleistungen sind erforderlich; gleichwertige
korrekte Lösungen sind zulässig. Das eigenständige GK-Ergebnis wird nur bei
6/6 Punkten erreicht. Die folgenden Lösungen beziehen sich auf das vollständig
abgedruckte GK-Material.

## A. Zahlen und Schaltungen

### A1 / K01

`00101101₂ = 0x2D = 45`, `00010111₂ = 0x17 = 23`.
Die Summe ist `01000100₂ = 0x44 = 68`.

| Bitposition ab rechts | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| erster Summand | 1 | 0 | 1 | 1 | 0 | 1 | 0 | 0 |
| zweiter Summand | 1 | 1 | 1 | 0 | 1 | 0 | 0 | 0 |
| Eingangsübertrag | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| Summenbit | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| Ausgangsübertrag | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 |

Für −13: `13=00001101₂`, Invertieren ergibt `11110010₂`, plus 1 ergibt
`11110011₂=0xF3`. Das ist 243 unsigniert beziehungsweise `243−256=−13`.
Beim Zweierkomplement hat die höchste Stelle Gewicht −128, die übrigen zusammen
0…127; daraus folgt −128…127. `0x7F+0x01=0x80=10000000₂`: unsigniert ist
128 darstellbar; vorzeichenbehaftet wird das Muster als −128 gelesen. Die
mathematische Summe zweier positiver Operanden ist +128 und liegt außerhalb
des signed-Bereichs. Signed-Überlauf ist hier nicht mit einem ninth-bit-Carry
gleichzusetzen.

**K01 = 1** nur bei richtiger Binär-/Hexrechnung mit Überträgen, begründeter
Zweierkomplementdarstellung und korrekter Unterscheidung beider Overflowdeutungen.

### A2 / K02

Vollständige DNF:
`F = A∧¬B∧C ∨ A∧B∧¬C ∨ A∧B∧C`.

| A \ BC | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 | 1 |

Die unteren Felder 01/11 bilden `A∧C`, die unteren Felder 11/10 bilden `A∧B`.
Überlappende Gruppen sind erlaubt. Also `F=A∧C∨A∧B=A∧(B∨C)`.
Korrekte Netzliste: `g1=OR(B,C); F=AND(A,g1)`.
Beim Gegenbeispiel A=0,B=0,C=1 gibt das alte Netz 1, die Spezifikation 0.
Das alte Netz lässt die rechte Anfrage am Gültigkeitseingang vorbei.

**K02 = 1** nur bei vollständiger DNF, korrekter achtzelliger Gray-KV-Belegung
und Gruppenbegründung sowie funktionierender Gatternetzkorrektur mit Gegenbeispiel.

### A3 / K07

| x | y | c | s | k |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

`k=¬x∧y∧c ∨ x∧¬y∧c ∨ x∧y∧¬c ∨ x∧y∧c`.

| x \ yc | 00 | 01 | 11 | 10 |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 1 | 1 |

Die senkrechte Gruppe in 11 ergibt `y∧c`; die unteren Gruppen 01/11 und
11/10 ergeben `x∧c` und `x∧y`. Damit `k=xy∨xc∨yc`, `s=x XOR y XOR c`.

```python
def full_add(x, y, c):
    return x ^ y ^ c, (x & y) | (x & c) | (y & c)

def add_two_bits(a, b):
    s0, c1 = full_add(a & 1, b & 1, 0)
    s1, c2 = full_add((a >> 1) & 1, (b >> 1) & 1, c1)
    return (c2 << 2) | (s1 << 1) | s0
```

Für `01+11`: niedere Stelle `(1,1,0)→(s0=0,c1=1)`; höhere Stelle
`(0,1,1)→(s1=0,c2=1)`. Ergebnis `100₂=4`. Alle acht Zeilen erfüllen
`x+y+c=s+2k`; alle 16 Zweibitpaare ergeben ihre arithmetische Summe.

**K07 = 1** nur bei vollständiger Carry-DNF/KV-Vereinfachung, korrekter
Summenfunktion, eigener funktionsfähiger Addiererimplementierung mit allen acht
Tests sowie richtig verbundenem Zweibitlauf. Eine abgelesene Summe allein genügt nicht.

## B. Prolog

### B1 / K04 und B2 / K05

```prolog
parent(ada,ben).
parent(ada,clara).
parent(ben,dora).
parent(clara,emil).

grandparent(X,Z) :- parent(X,Y), parent(Y,Z).
sibling(X,Y) :- parent(P,X), parent(P,Y), X \= Y.
```

`parent(ada,K)` liefert der Reihe nach K=ben, clara. `grandparent(G,K)` liefert
(ada,dora), (ada,emil). Die Geschwisteranfragen liefern jeweils X=clara.
Die Ungleichheitsprüfung steht nach dem Binden beider Personen und verhindert
(ben,ben). Ohne gemeinsame Elternfakten werden keine Geschwisterbeziehungen geraten.

**K04 = 1** nur bei allen vier richtigen Fakten, korrekter Großelternregel,
beiden syntaktisch richtigen Anfragen und vollständigen Antworten.

**K05 = 1** nur bei einer fachlich passenden Geschwistermodellierung einschließlich
gemeinsamem Elternteil und Verschiedenheit, richtigen Antworten beider
Anfragerichtungen und begründetem Ausschluss der Selbstbeziehung.

### B3 / K08

```prolog
can_enter(P,Z) :- role(P,R), zone(Z,R), badge(P,valid).
needs_renewal(P) :- badge(P,expired).
```

Mit den unveränderten Materialfakten liefert lab nur ada, library nur ben und
needs_renewal nur clara. Nach dem Ersetzen des einen badge-Fakts liefert lab
ada und clara, library weiterhin ben; die Erneuerungsanfrage hat keine Lösung.
Keine Regel wird für einzelne Personen oder für eine bestimmte Anfrage
umgeschrieben. Rollen-/Ausweis-/Zonenfakten können unabhängig gepflegt und in
verschiedenen Anfragen kombiniert werden.

**K08 = 1** nur bei den zwei wiederverwendbaren Regeln, allen drei vollständigen
Antwortmengen vor und nach der Faktenänderung und nachvollziehbarer Trennung
von Wissensbasis und Problemanfragen. Hartcodierte Antworttabellen genügen nicht.
