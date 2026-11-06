# Q4: Ein Modellcampus mit nachvollziehbarer Steuerung

Sie entwickeln und prüfen ein Schulprojekt: Ein Modellcampus erfasst Anfragen,
zeigt Freigaben an und beantwortet organisatorische Anfragen. Bearbeiten Sie
alle vier Blöcke. Die Materialien sind vollständig unten abgedruckt. Hardware
und Programme werden im angegebenen vereinfachten Modell beurteilt; zusätzliche
Internetquellen oder ein echtes Cloudkonto sind nicht nötig.

Geben Sie Tabellen, Programme, Laufspuren und Begründungen ab. Bei Prolog gelten
Klauseln von oben nach unten, Teilziele von links nach rechts, Tiefensuche und
Backtracking. `\+ G` bedeutet: Das vollständig eingesetzte Ziel G scheitert.
Bei unseren Negationstests sind die abgefragten Werte gebunden. `N is Ausdruck`
wertet einen vollständig bestimmten arithmetischen Ausdruck aus. Variablen
beginnen groß, Konstanten klein. Alle Listen in den Aufgaben sind endlich.

Die Bewertung hat 19 Kriterien K01–K19, jeweils genau 0 oder 1 Punkt. Einen Punkt
gibt es nur, wenn die im Kriterium verlangte Kompetenz vollständig sichtbar
ist. Das vollständige Q4-Ergebnis setzt **19 von 19 Punkten** voraus. Eine
fachlich gleichwertige Lösung ist zulässig; bloße Ergebnissätze ohne den
verlangten Rechen-/Entwicklungs-/Begründungsweg genügen nicht.

## A. Zahlen und digitale Schaltungen

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

### Material A2: Speicher- und Addierermodell

Ein **aktives High-RS-Speicherglied aus NOR-Gattern** speichert Q. Bei R=S=0
bleibt der alte Wert erhalten; R setzt zurück, S setzt. Der Zustand R=S=1 ist
verboten: Er ist kein weiterer zulässiger Speicherwert. Ein **positiv
flankengesteuertes D-Flip-Flop** übernimmt D ausschließlich bei einer steigenden
Taktflanke; ohne solche Flanke hält es Q. Ausgangszustand ist Q=0.

| Zeitpunkt | D | Taktsituation |
| --- | --- | --- |
| t1 | 1 | steigende Flanke |
| t2 | 0 | keine Flanke |
| t3 | 0 | fallende Flanke |
| t4 | 0 | steigende Flanke |
| t5 | 1 | steigende Flanke |

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

**A3 [K03].** Geben Sie die vollständige RS-Übergangstabelle für beide möglichen
alten Q-Werte an und kennzeichnen Sie den verbotenen Eingang. Ermitteln Sie die
D-Flip-Flop-Folge t1…t5. Begründen Sie, wie das RS-Glied eine einmal gedrückte
Anfragetaste bis zur Quittierung merken und das D-Flip-Flop einen stabilen
Freigabewert taktsynchron übernehmen kann. Benennen Sie den Unterschied
zwischen kombinatorischer Funktion und gespeichertem Zustand.

**A4 [K07].** Entwickeln Sie für k eine vollständige DNF und ein KV-Diagramm
(Zeilen x; Spalten yc=00,01,11,10). Leiten Sie eine vereinfachte Funktion für k
und eine Funktion für s ab. Implementieren Sie beide Funktionen, etwa mit
booleschen/Bitoperatoren in Python oder JavaScript, und testen Sie alle acht
Eingaben gegen die Spezifikation. Verbinden Sie zwei Addierer und zeigen Sie
den vollständigen Lauf für `01₂ + 11₂` einschließlich Endübertrag.

## B. Eine ausführbare deklarative Wissensbasis

### Material B1: Fakten und zu ergänzende Beziehungen

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

### Material B2: Wege und Auswahl

Die Wege im Modell sind gerichtet; alle vorhandenen Kanten sind:

```prolog
edge(start,a).
edge(start,b).
edge(a,finish).
edge(b,a).
edge(a,start).
```

Ein Weg soll eine Liste seiner Knoten in Laufrichtung liefern. Er darf keinen
Knoten wiederholen. Die Kante a→start bildet also einen zu behandelnden Zyklus.

Für eine separate Torauswahl gilt diese feste Reihenfolge:

```prolog
candidate_gate(west).
candidate_gate(east).
open(east).

gate_bug(X) :- candidate_gate(X), !, open(X).
```

**B1 [K04].** Schreiben Sie die vier `parent/2`-Fakten aus der Tabelle. Formulieren
Sie die Regel `grandparent/2` und die zwei Anfragen „alle Kinder von ada“ und
„alle Großeltern-Kind-Paare“. Geben Sie ihre vollständigen Antwortmengen an.

**B2 [K05].** Modellieren Sie Geschwister als zwei verschiedene Personen mit
mindestens einem gemeinsamen Elternteil. Schreiben Sie eine Prolog-Regel und
ermitteln Sie alle Antworten für `sibling(ben,X)` und `sibling(X,ben)` aus B1.
Begründen Sie, warum die Anfrage nicht ben als sein eigenes Geschwister liefert.

**B3 [K06].** Implementieren Sie `member_id/2` und `length_list/2` für endliche
Listen. Prüfen Sie Mitgliedschaft mit Erfolg und Misserfolg sowie die Länge
für `[]` und `[start,a,finish]`. Zeigen Sie die verwendeten Basis- und
Rekursionsfälle; nicht nur Aufrufe eingebauter Listenprädikate abgeben.

**B4 [K08].** Strukturieren Sie die organisatorische Wissensbasis mit
`can_enter/2` und `needs_renewal/1`. Zeigen Sie vollständige Antworten für
`can_enter(P,lab)`, `can_enter(P,library)` und `needs_renewal(P)`. Ändern Sie
anschließend genau den Fakt `badge(clara,expired)` in `badge(clara,valid)`.
Leiten Sie die geänderten Ergebnisse ohne Änderung der Regeln ab und erklären
Sie daran die Trennung gespeicherter Tatsachen von wiederverwendbaren Regeln.

**B5 [K13].** Analysieren Sie `grandparent(ada,Z)` nach den angegebenen
Prolog-Ausführungsregeln. Schreiben Sie die Unifikation mit dem Regelkopf,
die sukzessiven Belegungen von Zwischenvariable und Z, mindestens einen
gescheiterten Faktenabgleich, das Zurücknehmen von Belegungen und die Fortsetzung
beim Backtracking auf. Geben Sie die Ausgabereihenfolge bis zur vollständigen
Erschöpfung an.

**B6 [K14].** Formulieren Sie rekursiv `append_list/3` und `reverse_list/2` ohne
die eingebauten Append-/Reverse-Prädikate. Zeigen Sie das Ergebnis von
`append_list([start,a],[finish],P)`, den Rückwärtslauf für `[finish,a,start]`
sowie den leeren Basisfall.

**B7 [K15].** Entwickeln Sie ein deklaratives Wegprädikat `path/3` für B2.
Nutzen Sie einen Besuchslistenparameter und Ihre Listenoperationen, um den
Zyklus zu beherrschen. Zeigen Sie beide vollständigen Antworten für
`path(start,finish,P)` und begründen Sie, warum das Programm bei dieser
endlichen Anfrage terminiert und kein zyklischer Weg ausgegeben wird.

**B8 [K16].** Verfolgen Sie `gate_bug(X)` bis zum Scheitern. Erklären Sie exakt,
welche Alternative der Cut entfernt. Schreiben Sie `gate/1`, das alle offenen
Kandidaten aufzählt, und `first_open/1`, das absichtlich nur den ersten offenen
Kandidaten liefert. Platzieren Sie einen Cut nur dort, wo diese zweite
Auswahlpolitik ihn rechtfertigt. Vergleichen Sie beide Programme zusätzlich
für eine Wissensbasis, die auch `open(west)` enthält.

## C. Betrieb, Sicherheit und geteilte Zustände

### Material C1: Systemgrenzen und Vorfälle

```text
Browser -- HTTPS/TCP443 --> Gateway -- privates Netz --> Dienst
                                                    |
                                                    v
                                             Datenbank/TCP5432
```

Der Browser prüft Zertifikat und Hostnamen des Gateways. Der Dienst prüft die
Anmeldung und anschließend die benötigte Rolle. Eine Firewall lässt von außen
nur TCP443 zum Gateway und von dort im privaten Netz nur die nötigen Verbindungen
zu. Die Datenbank ist nicht öffentlich erreichbar.

| Vorfall | Beobachtung |
| --- | --- |
| V1 | Eine Person liest Pakete im fremden WLAN mit. |
| V2 | Ein gültiges Schülerkonto fordert eine ausschließlich für Mitarbeitende vorgesehene Änderung an. |
| V3 | Ein externer Rechner versucht, direkt TCP5432 der Datenbank zu erreichen. |

### Material C2: Zwei Threads in einem Prozess

Beide Threads teilen `n`, anfangs 0. r1 und r2 sind private Register. Jede der
folgenden Einzeloperationen ist atomar; ihre Kombination ist es nicht. Es gilt
sequentielle Konsistenz und keine weitere Optimierung des Modells.

```text
Thread T1:                 Thread T2:
1 r1 := n                  1 r2 := n
2 r1 := r1 + 1             2 r2 := r2 + 1
3 n := r1                  3 n := r2
```

### Material C3: Drei Betriebsangebote

Die Werte sind feste Mess-/Planungsannahmen dieses Projekts, keine Anbieterwerbung.

| Angebot | Gegebene Eigenschaften |
| --- | --- |
| L | Schule betreibt eigene Rechner im eigenen Rechenraum; nur sie nutzt die Cloudumgebung. |
| P | Öffentlich angebotene Plattform führt das eigene Dienstprogramm aus; Anbieter verwaltet Betriebssystem und Laufzeit. |
| S | Fertiger Onlinedienst mit festem Funktionsumfang; kein Upload eigener Dienstprogramme. |

Auf einem lokalen 8-GiB-Rechner benötigt der Host 1 GiB. Eine Dienst-VM benötigt
2 GiB einschließlich eigenem Gastbetriebssystem. Eine Dienst-Containerinstanz
benötigt 0,5 GiB; alle Container teilen den Kernel des Hosts. Für drei Instanzen
zählen wir hier nur diese RAM-Anteile, keine weiteren Reserven.

In Angebot P schafft eine Instanz gemessen 30 Anfragen/s. Die Spitzenlast beträgt
90 Anfragen/s. Ein idealer Lastverteiler verteilt gleichmäßig; gemeinsame
Anwendungsdaten liegen außerhalb der Instanzen. Die Datenbank schafft
120 Anfragen/s. Instanzen fallen gegebenenfalls vollständig aus; die anderen
behalten im Modell ihre Kapazität.

**C1 [K09].** Ordnen Sie V1–V3 TLS, Authentisierung/Autorisierung und Firewall
zu. Erklären Sie jeweils Wirkung und Grenze: insbesondere schützt ein gültiger
Login nicht automatisch vor fehlenden Rollenrechten und verschlüsselt TLS
keine unverschlüsselt abgelegte Datenbank. Beschreiben Sie die tatsächlich
verhinderte beziehungsweise erlaubte Verbindung im Diagramm.

**C2 [K10].** Geben Sie ein vollständiges zulässiges Interleaving mit Endwert
n=1 und ein weiteres mit n=2 an. Erläutern Sie Threads, gemeinsamen Speicher
und die Race Condition. Reparieren Sie den Ablauf durch eine begründete
gegenseitig ausschließende kritische Sektion. Erklären Sie, warum das Sperren
nur des Schreibschritts nicht genügt.

**C3 [K11].** Vergleichen Sie VM und Container anhand von Gastbetriebssystem,
Kernelgrenze, Ressourcen und Isolation. Berechnen Sie den RAM-Bedarf für drei
Instanzen einschließlich Host. Begründen Sie, weshalb ein Containerabbild
nicht schon ein eigenes Gastbetriebssystem beziehungsweise einen unabhängigen
Kernel bereitstellt und weshalb die dichtere Belegung keine pauschale
Sicherheitsgarantie ist.

**C4 [K12].** Ordnen Sie L und P als Private beziehungsweise Public Cloud und
P/S als PaaS/SaaS ein; beschreiben Sie zusätzlich IaaS und ein sinnvolles
Hybridmodell für lokale Modellsteuerung und entfernte Auswertung. Erklären
Sie horizontale gegenüber vertikaler Skalierung. Bestimmen Sie die minimale
Instanzzahl für die Spitzenlast ohne Ausfall und mit Ausfall genau einer
Instanz. Prüfen Sie die Datenbankgrenze; erläutern Sie, weshalb die Rechnung
keine unbegrenzte reale Skalierbarkeit beweist.

## D. Funktionale Modellierung und Reduktion

### Material D1: Dieselbe Wartezeitaufgabe in drei Formen

Für jede Wartezeit x soll x+1 berechnet und über eine endliche Liste summiert
werden. Alle Werte sind nichtnegative ganze Zahlen. Die Eingabe ist `[1,2]`.

Ein imperativer JavaScript-Ausschnitt lautet:

```javascript
let total = 0;
for (const x of [1, 2]) {
  total = total + (x + 1);
}
```

Ein logisches Prolog-Programm für diese **eingesetzte Eingaberichtung** lautet:

```prolog
total_rel([],0).
total_rel([X|Xs],T) :- total_rel(Xs,R), T is (X+1)+R.
```

Für eine funktionale Termsprache sind `[]` und `x::xs` Listenkonstruktoren.
Eine Definition besteht aus Gleichungen mit Mustern; Reduktion ersetzt einen
Funktionsaufruf durch seine passende rechte Seite. `inc(x)=x+1` ist gegeben.
Es gibt keine Zuweisungen und keine versteckten veränderlichen Zustände.

**D1 [K17].** Grenzen Sie die funktionale Lösung von beiden abgedruckten
Programmen ab: Zustandsänderung versus Funktionswert sowie Relation,
Unifikation und Suchsteuerung. Ordnen Sie funktionale und logische Programme
als deklarative Ansätze ein. Erklären Sie, weshalb das konkrete Prolog-`is`
hier keine beliebige Umkehranfrage mit unbekannten Zahlen erlaubt.

**D2 [K18].** Deklarieren Sie in der Termsprache `raised`, das jedes Element
mit inc erhöht, `sum`, das eine Liste summiert, und `total`, das beides
zusammensetzt. Geben Sie für raised und sum leeren Basisfall und rekursiven
Fall sowie die Abhängigkeiten der drei Funktionen an. Ihre Definition muss
für jede endliche Liste des angegebenen Bereichs gelten.

**D3 [K19].** Führen Sie `total([1,2])` durch wiederholte Reduktion Ihrer
Definitionen vollständig auf einen Zahlenwert zurück. Zeigen Sie beide
Listenbasisfälle und die arithmetischen Schritte. Prüfen Sie zusätzlich die
leere Eingabe und erläutern Sie, weshalb die rekursiven Definitionen auf
endlichen Listen enden.
