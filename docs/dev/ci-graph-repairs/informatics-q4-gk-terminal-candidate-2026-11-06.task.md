# Q4 GK: Schaltungen und eine deklarative Wissensbasis

Sie entwickeln einen Modellcampus mit Freigabeanzeige und organisatorischer
Wissensbasis. Bearbeiten Sie alle sechs Teilaufgaben. Alle Materialien stehen
unten; zusätzliche Quellen werden nicht benötigt.
Geben Sie Rechnungen, Diagramme, Programme, Tests und Begründungen ab.

Für Prolog beginnen Variablen groß und Konstanten klein. `:-` verbindet
Regelkopf und Bedingungen; ein Komma bedeutet die gemeinsame Erfüllung der
Bedingungen. `X \= Y` prüft Verschiedenheit nach dem Binden beider Personen.
Die Tabellen geben alle bekannten Tatsachen an; weitere werden nicht geraten.

Es gibt die sechs Kriterien K01, K02, K04, K05, K07 und K08 mit jeweils genau
0 oder 1 Punkt. Ein Punkt erfordert die vollständige genannte Kernleistung;
fachlich gleichwertige Lösungen sind zulässig. Das eigenständige GK-Ergebnis
setzt **6 von 6 Punkten** voraus. Zusatzleistungen ersetzen kein fehlendes Kriterium.

## A. Zahlen und Schaltungen

### Material A1: Datenformat und Signalregeln

Ein Datenwort hat acht Bits. Unsignierte Wörter stehen für 0 bis 255;
vorzeichenbehaftete Wörter verwenden Zweierkomplement. Es wird jeweils nur ein
Byte gespeichert. Für Freigabeanzeigen gelten drei boolesche Eingänge:

| Zeichen | Bedeutung bei 1 |
| --- | --- |
| A | der Betriebsmodus ist gültig |
| B | an Station links liegt eine Anfrage vor |
| C | an Station rechts liegt eine Anfrage vor |

Die Anzeige F soll genau dann 1 sein, wenn der Betriebsmodus gültig ist und
mindestens eine Anfrage vorliegt. Das aktuell verdrahtete, zu prüfende Netz ist:

```text
g1 := AND(A, B)
F_falsch := OR(g1, C)
```

Die Messung der gewünschten Freigabefunktion liefert:

| A | B | C | F |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 1 |
| 1 | 1 | 1 | 1 |

Für ein KV-Diagramm verwenden Sie Zeilen A=0,1 und Spalten BC=00,01,11,10.
Benachbarte Spalten unterscheiden sich damit in genau einem Bit.

### Material A2: Volladdierer und Verbindung

Ein Volladdierer erhält Bits x,y,c und liefert Summenbit s und Übertrag k.
Seine Spezifikation lautet `x+y+c = s+2*k`. Prüfen Sie alle acht Eingaben.
Ein Zweibitaddierer besteht aus zwei Volladdierern: Der Übertrag der niedereren
Stelle geht als c in die höhere; die niederere Stelle startet mit c=0.

**A1 [K01].** Rechnen Sie `00101101₂ + 00010111₂` binär und hexadezimal;
zeigen Sie die Überträge. Stellen Sie −13 als achtbittiges Zweierkomplement dar
und begründen Sie die Konstruktion sowie den Wertebereich −128…127. Addieren
Sie `0x7F + 0x01`. Erklären Sie, warum das Ergebnis unsigniert korrekt ist,
vorzeichenbehaftet aber einen Überlauf zeigt.

**A2 [K02].** Stellen Sie F aus A1 als vollständige DNF dar. Übertragen Sie alle
acht Werte in das angegebene KV-Diagramm, markieren Sie gültige Zweiergruppen
und vereinfachen Sie. Geben Sie eine korrigierte Gatternetzliste und eine
konkrete Eingabe an, die den Fehler von `F_falsch` nachweist.

**A3 [K07].** Entwickeln Sie für k eine vollständige DNF und ein KV-Diagramm
(Zeilen x; Spalten yc=00,01,11,10). Leiten Sie eine vereinfachte Funktion für k
und eine Funktion für s ab. Implementieren Sie beide Funktionen, etwa mit
booleschen/Bitoperatoren in Python oder JavaScript, und testen Sie alle acht
Eingaben gegen die Spezifikation. Verbinden Sie zwei Addierer und zeigen Sie
den vollständigen Lauf für `01₂ + 11₂` einschließlich Endübertrag.

## B. Eine wiederverwendbare Wissensbasis

### Material B1: Familie und organisatorische Fakten

Die Familie für das Abholregister hat die folgenden **vollständigen** bekannten
Elternbeziehungen; daraus sollen keine weiteren Elternschaften geraten werden:

| Elternteil | Kind |
| --- | --- |
| ada | ben |
| ada | clara |
| ben | dora |
| clara | emil |

Außerdem liegen folgende organisatorischen Daten vor:

```prolog
role(ada,staff).
role(ben,student).
role(clara,staff).
badge(ada,valid).
badge(ben,valid).
badge(clara,expired).
zone(lab,staff).
zone(library,student).
```

Eine Person darf eine Zone betreten, wenn ihre Rolle für diese Zone vorgesehen
und ihr Ausweis gültig ist. Eine Erneuerung ist bei `expired` nötig.
Diese Projektregel behauptet keine allgemeine reale Zutrittsberechtigung.

**B1 [K04].** Schreiben Sie die vier `parent/2`-Fakten aus der Tabelle. Formulieren
Sie die Regel `grandparent/2` und die zwei Anfragen „alle Kinder von ada“ und
„alle Großeltern-Kind-Paare“. Geben Sie ihre vollständigen Antwortmengen an.

**B2 [K05].** Modellieren Sie Geschwister als zwei verschiedene Personen mit
mindestens einem gemeinsamen Elternteil. Schreiben Sie eine Prolog-Regel und
ermitteln Sie alle Antworten für `sibling(ben,X)` und `sibling(X,ben)` aus B1.
Begründen Sie, warum die Anfrage nicht ben als sein eigenes Geschwister liefert.

**B3 [K08].** Strukturieren Sie die organisatorische Wissensbasis mit
`can_enter/2` und `needs_renewal/1`. Zeigen Sie vollständige Antworten für
`can_enter(P,lab)`, `can_enter(P,library)` und `needs_renewal(P)`. Ändern Sie
anschließend genau den Fakt `badge(clara,expired)` in `badge(clara,valid)`.
Leiten Sie die geänderten Ergebnisse ohne Änderung der Regeln ab und erklären
Sie daran die Trennung gespeicherter Tatsachen von wiederverwendbaren Regeln.
