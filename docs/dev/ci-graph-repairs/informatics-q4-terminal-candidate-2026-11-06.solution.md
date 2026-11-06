# Musterlösung und binäre Bewertungsmaßstäbe

Diese Lösung gehört ausschließlich zum vorliegenden Q4-Kandidaten. Zulässige
gleichwertige Programme, Schaltungen und Begründungen sind anzuerkennen. Jeder
der 19 Kompetenzpunkte ist entweder 0 oder 1; alle im jeweiligen Kriterium
genannten Kernleistungen müssen beobachtbar sein. Fehlende Kompetenz darf
nicht durch Zusatzpunkte in einem anderen Bereich ausgeglichen werden.

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

### A3 / K03

| R | S | Q alt=0 → Q neu | Q alt=1 → Q neu |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 1 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 |
| 1 | 1 | verboten | verboten |

Die D-Folge lautet t1…t5: **1,1,1,0,1**. Die fallende Flanke t3 übernimmt
kein D. Der RS-Speicher kann durch einen kurzen S-Impuls eine Anfrage merken;
bis zu einem getrennten R-Quittierimpuls bleibt sie gespeichert. Die Eingänge
dürfen dabei nicht beide aktiv werden. Das D-Flip-Flop übernimmt einen stabil
anliegenden Freigabewert an definierten Taktzeitpunkten. Ein Schaltnetz hat
kein Gedächtnis; das Folgeglied hängt zusätzlich vom bisherigen Zustand ab.

**K03 = 1** nur bei vollständiger RS-Tabelle mit verbotenem Fall, richtiger
D-Zeitfolge und beiden passenden Speicheranwendungen samt Zustandsunterscheidung.

### A4 / K07

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

### B3 / K06

```prolog
member_id(X,[X|_]).
member_id(X,[_|Xs]) :- member_id(X,Xs).

length_list([],0).
length_list([_|Xs],N) :- length_list(Xs,M), N is M+1.
```

`member_id(a,[start,a,finish])` gelingt, `member_id(b,[start,a,finish])`
scheitert nach vollständiger Suche. `length_list([],N)` liefert 0;
für `[start,a,finish]` entstehen rückwärts 0,1,2,3, also N=3.
Der Rekursionsfall arbeitet jeweils auf einer kürzeren Liste.

**K06 = 1** nur bei beiden korrekt implementierten Operationen, Basis- und
Rekursionsfällen sowie den vier geforderten Erfolgs-/Misserfolgs-/Längentests.

### B4 / K08

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

### B5 / K13

Die Anfrage vereinigt sich mit `grandparent(X,Z)` durch X=ada; Y ist frisch.
Das erste Teilziel `parent(ada,Y)` findet zuerst Y=ben. Für `parent(ben,Z)`
scheitert beispielsweise der Abgleich mit `parent(ada,ben)` wegen ben≠ada;
der dritte Elternfakt liefert Z=dora. Beim Anfordern weiterer Antworten werden
Z und schließlich Y zurückgenommen. `parent(ada,Y)` liefert als nächste
Alternative Y=clara; `parent(clara,Z)` findet Z=emil. Weitere passende
Eltern-/Kindkombinationen existieren nicht, die Suche endet mit false.

Ausgabereihenfolge: **Z=dora; Z=emil; false**. Die Variablen verschiedener
Regelanwendungen werden frisch behandelt; Backtracking ist keine Mutation der Fakten.

**K13 = 1** nur bei Regelkopfunifikation, richtiger Teilziel-/Faktenreihenfolge,
konkretem Fehlvergleich, Belegungsrücknahme und vollständiger Antwort-/Suchspur.

### B6 / K14

```prolog
append_list([],Ys,Ys).
append_list([X|Xs],Ys,[X|Zs]) :- append_list(Xs,Ys,Zs).

reverse_list([],[]).
reverse_list([X|Xs],R) :- reverse_list(Xs,T), append_list(T,[X],R).
```

Append liefert `[start,a,finish]`. Beim Reverse wird erst `[]` umgedreht;
dann entstehen `[start]`, `[start,a]`, `[start,a,finish]` beim Rückkehrweg der
Rekursion für die Eingabe `[finish,a,start]`. Der leere Reversefall liefert `[]`.
Die gezeigte Reversevariante ist nicht die einzig mögliche; eine korrekte
akkumulatorbasierte Variante ist ebenfalls zulässig.

**K14 = 1** nur bei beiden eigenen rekursiven Definitionen mit richtigen
Basisfällen, den richtigen Ergebnissen und einer erklärten Rekursionsspur.

### B7 / K15

```prolog
path(S,T,P) :- walk(S,T,[S],Rev), reverse_list(Rev,P).
walk(T,T,V,V).
walk(V,T,Seen,P) :- edge(V,N), \+ member_id(N,Seen),
                    walk(N,T,[N|Seen],P).
```

Zuerst entsteht die rückwärts aufgebaute Besuchsliste `[finish,a,start]`, also
P=`[start,a,finish]`. Nach Backtracking folgt P=`[start,b,a,finish]`. In beiden
Fällen darf a→start nicht genommen werden, weil start bereits in Seen steht.
Vor jeder rekursiven Erweiterung wird ein noch nicht besuchter Knoten gewählt.
Bei endlich vielen gegebenen Knoten ist die Tiefe damit begrenzt; es werden
endlich viele einfache Pfade untersucht. Die Negation wird auf gebundenes N
und eine gebundene Besuchsliste angewendet. Die Regel erlaubt auch einen
nullkantigen Pfad `[S]` von S zu sich selbst; diese Konvention widerspricht den
beiden geforderten Start-Finish-Antworten nicht.

**K15 = 1** nur bei ausführbar formuliertem Weg-/Besuchslistenmodell, beiden
richtigen Pfaden, wirksamem Zyklusausschluss und begründetem Terminierungsargument.

### B8 / K16

`gate_bug(X)` bindet X zuerst an west. Der Cut entfernt die Alternative
`candidate_gate(east)` innerhalb dieses Aufrufs. `open(west)` scheitert,
aber die entfernte Alternative wird nicht mehr versucht: Die Anfrage scheitert.

```prolog
gate(X) :- candidate_gate(X), open(X).
first_open(X) :- candidate_gate(X), open(X), !.
```

Im Original liefert gate nur east, first_open ebenfalls east. Der zweite Cut
steht erst nach einem vollständig gefundenen offenen Tor. Wird zusätzlich
`open(west)` eingefügt, liefert gate der Kandidatenreihenfolge nach west und
east, first_open nur west. Der Cut drückt hier die ausdrücklich gewählte
Erstlösungsstrategie aus; er ist keine allgemein bedeutungsneutrale Abkürzung.

**K16 = 1** nur bei genauer Fehler-/Alternativenspur, beiden richtigen
Korrekturen und korrektem Ergebnisvergleich für beide Wissensbasen samt
Erklärung der kontrollierten Nichtdeterminismusbeschränkung.

## C. Betrieb

### C1 / K09

V1 betrifft die durch korrekt geprüftes TLS geschützte Vertraulichkeit und
Integrität zwischen Browser und Gateway einschließlich Serverauthentisierung.
Das schützt weder kompromittierte Endgeräte noch automatisch den Speicher
oder eine weitere unverschlüsselte interne Verbindung. V2 erfordert trotz
erfolgreicher Authentisierung eine verweigerte **Autorisierung**: Schülerrolle
hat das Änderungsrecht nicht. TLS oder eine Portfreigabe erteilen diese Rolle
nicht. V3 wird durch die Firewall-/Netzregel abgewehrt: Von außen wird nur
Gateway443, nicht Datenbank5432 erreicht. Die ausdrücklich nötige interne
Verbindung Dienst→Datenbank bleibt möglich. Ein Filter allein ersetzt keine
Anwendungsrechte und keinen Schutz rechtmäßig erreichbarer Dienste.

**K09 = 1** nur bei richtiger Zuordnung aller drei Vorfälle, konkretem Bezug
auf erlaubte/verhinderte Verbindungen und den genannten Grenzen der drei Mechanismen.

### C2 / K10

Ein verlorenes Update:

| Schritt | Operation | r1 | r2 | n |
| --- | --- | --- | --- | --- |
| 1 | T1 liest | 0 | – | 0 |
| 2 | T2 liest | 0 | 0 | 0 |
| 3 | T1 erhöht privat | 1 | 0 | 0 |
| 4 | T2 erhöht privat | 1 | 1 | 0 |
| 5 | T1 schreibt | 1 | 1 | 1 |
| 6 | T2 schreibt | 1 | 1 | 1 |

Die Reihenfolge T1.1,T1.2,T1.3,T2.1,T2.2,T2.3 liefert dagegen n=2.
Threads haben eigene Ausführung/Registersichten und teilen hier denselben
Prozessspeicher n. Das Zusammenspiel mehrerer Zugriffe verursacht die Race
Condition. Ein gemeinsamer Mutex muss jeweils **Lesen, Erhöhen und Schreiben**
als eine kritische Sektion umschließen. Dann beginnt der zweite Abschnitt
mit n=1. Werden nur die Schreibschritte geschützt, bleiben beide vorangehenden
Reads von 0 möglich; der verlorene Updateablauf bleibt zulässig.

**K10 = 1** nur bei beiden vollständigen zulässigen Interleavings, korrekter
Thread-/Speicher-/Race-Erklärung sowie ausreichend großem kritischem Abschnitt
und begründeter Ablehnung der Nur-Schreiben-Sperre.

### C3 / K11

Drei VMs benötigen `1+3·2=7 GiB`; drei Container benötigen
`1+3·0,5=2,5 GiB` im ausdrücklich begrenzten RAM-Modell.
Die VM hat ein eigenes Gastbetriebssystem mit eigenem Kernel über einer
Virtualisierungsschicht. Container isolieren Prozesse/Ressourcen, teilen
aber den Hostkernel; ein Dateisystemabbild mit Bibliotheken ist kein eigener
Kernel. Das ermöglicht hier höhere Dichte. Die tatsächliche Sicherheit hängt
unter anderem von Konfiguration, Rechten, Aktualisierung und Kernelangriffen
ab; weder die RAM-Rechnung noch die Bezeichnung garantiert sichere Isolation.

**K11 = 1** nur bei beiden richtigen Rechnungen und einer zutreffenden
Einordnung von OS-/Kernelgrenze, Ressourcendichte und Grenzen der Isolation.

### C4 / K12

L ist hier Private Cloud, P Public Cloud. Die Anbieterübernahme von OS und
Laufzeit macht P zu PaaS; S liefert die fertige Anwendung als SaaS. Bei IaaS
stellt der Anbieter Infrastruktur wie virtuelle Rechner bereit, während der
Kunde OS und Anwendungen verwaltet. Ein Hybridmodell kann lokale,
verbindungsunabhängige Modellsteuerung mit entfernter Auswertung verbinden;
dafür sind eine definierte Schnittstelle und ein Umgang mit Ausfällen nötig.
Die Bezeichnung Public sagt nicht, dass fremde Kunden die eigenen Daten sehen dürfen.

Horizontal: mehr Instanzen; vertikal: mehr Ressourcen für eine Instanz.
Ohne Ausfall sind `ceil(90/30)=3` Instanzen nötig. Um den vollständigen Ausfall
einer Instanz auszuhalten, sind vier nötig: `(4−1)·30=90`. Die Datenbankgrenze
120 ist bei 90 nicht überschritten; sie verhindert aber, aus weiteren
Dienstinstanzen unbegrenzten Gesamtdurchsatz abzuleiten. Die Rechnung setzt
gemessene konstante Instanzleistung, ideale Verteilung, externen gemeinsamen
Zustand und das vorgegebene Ausfallmodell voraus; reale Engpässe/Overhead sind
damit nicht geprüft.

**K12 = 1** nur bei den richtigen Betriebs-/Servicemodellen einschließlich
IaaS/Hybrid, verständlichem Skalierungsvergleich, beiden Instanzzahlen und
einer expliziten Prüfung der Datenbank-/Modellgrenzen.

## D. Funktionales Modell

### D1 / K17

Der imperative Code führt einen veränderlichen Akkumulator durch eine
Operationsfolge. Die funktionale Lösung beschreibt Werte durch reine
Funktionsgleichungen; derselbe Aufruf mit denselben Eingaben hat im Modell
denselben Wert und keine versteckte Zustandswirkung. Das Prolog-Programm
beschreibt Beziehungen zwischen Eingabe und Ergebnis und wird über
Unifikation/Teilziele und seine Suchsteuerung ausgeführt. Funktionale und
logische Programmierung sind deklarative Ansätze, aber Funktionsanwendung
ist nicht gleich Prolog-Zielsuche. Das arithmetische `is` verlangt hier eine
eingesetzte rechte Seite: etwa aus `T is (X+1)+R` lässt sich ein unbekanntes X
nicht einfach rückwärts lösen. Das ist eine Ausführungsgrenze des konkreten
Prädikats, keine Behauptung, jedes Prolog-Programm sei reversibel.

**K17 = 1** nur bei zutreffender Abgrenzung aller drei Formen, deklarativer
Einordnung und richtiger Grenze des gegebenen arithmetischen Prolog-Prädikats.

### D2 / K18

```text
inc(x) = x + 1
raised([]) = []
raised(x::xs) = inc(x) :: raised(xs)
sum([]) = 0
sum(x::xs) = x + sum(xs)
total(xs) = sum(raised(xs))
```

total hängt von raised und sum ab; raised von inc und sich selbst, sum von
sich selbst. Die Rekursion arbeitet auf dem jeweiligen Listenrest.

**K18 = 1** nur bei vollständigen eigenen Funktionsdeklarationen mit beiden
Basis-/Rekursionsfällen, korrekter Zusammensetzung und erklärten Abhängigkeiten.

### D3 / K19

Eine mögliche Reduktionsfolge ist:

```text
total(1::2::[])
= sum(raised(1::2::[]))
= sum(inc(1)::raised(2::[]))
= sum(2::raised(2::[]))
= sum(2::inc(2)::raised([]))
= sum(2::3::raised([]))
= sum(2::3::[])
= 2 + sum(3::[])
= 2 + (3 + sum([]))
= 2 + (3 + 0)
= 2 + 3
= 5
```

Die leere Eingabe reduziert `total([])=sum(raised([]))=sum([])=0`.
Bei raised/sum wird jeweils eine endliche Liste echt verkürzt, bis der
passende Basisfall greift. Andere korrekte Auswertungsreihenfolgen sind zulässig,
wenn die Gleichungsanwendungen erkennbar und die Werte identisch sind.

**K19 = 1** nur bei vollständiger nachvollziehbarer Termreduktion einschließlich
beider leeren Basisfälle, richtiger Arithmetik und Endlichkeitsbegründung.
