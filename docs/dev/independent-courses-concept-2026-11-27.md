# Unabhängige Kurse auf stabiler Basis: Konzept, 27. November 2026

**Stand: 27. November 2026, 08:26 MEZ. Entwurf zur Entscheidung.** Gebaut ist
davon nichts. Das Papier führt den Grundsatz des Product Owners aus: Einzelne
Kurse sollen unabhängig voneinander auf einer stabilen Basis vorankommen. Es
gehört zur [Strategie vom 27. November 2026](https://github.com/enpasos/skillpilot/blob/main/AGENTS.md#strategy-product-owner-27-november-2026).
Zahlen sind am Stand `main@e2df0b5b4c` gemessen, wo nichts anderes steht.
Aussagen, die noch zu messen sind, sind als offen gekennzeichnet.

## 1. Ziel und Anlass

Ein Kurs soll sich bauen, prüfen und freigeben lassen, ohne dass dafür an
einem anderen Kurs gearbeitet werden muss. Heute ist das Gegenteil der Fall:

| Kopplung heute | Maß |
|---|---|
| Ansichten, die jede Änderung grün halten muss | 387 (21 Fächer, 16 Länder) |
| Vollständige CI je Änderung | rund 65 Minuten; der Backend-Job allein 61 |
| Katalog eines Fachs | einer für alle Länder; eine Änderung für Hessen erreicht 15 weitere Länder |
| Fest verdrahtete Zählwerte | zum Beispiel 120 Profilzeilen mit 240 Sollwerten in den Controller-Tests |
| Nachweise im Arbeitsbaum | 33 GB in 192.252 Dateien |

Solange das so bleibt, kostet jeder weitere Kurs mehr als der vorige. Die
Reihenfolge der Strategie (Hessen, dann alle Länder, dann Chemie und Biologie,
dazu ein Universitätskurs) ist so nicht leistbar.

## 2. Begriffe

- **Plattform:** alles, was für jeden Kurs gleich ist. Dazu gehören das Ziel-
  und Einheitenmodell, Ansichten und Personalisierung, das Backend, der Coach
  und die Prüfwerkzeuge.
- **Kurs:** ein Lernangebot, das als Ganzes gebaut, geprüft und freigegeben
  wird, zum Beispiel „Lineare Algebra, angelehnt an MIT 18.06“ oder „Physik
  Hessen, Oberstufe“. Gemeint ist nicht das Kursprofil (Grund- oder
  Leistungskurs).
- **Gemeinsamer Bestand:** Inhalt, den mehrere Kurse nutzen, heute vor allem
  der Katalog eines Fachs für alle Länder.
- **Abhängigkeit:** die ausdrückliche Angabe eines Kurses, worauf er aufbaut,
  mit der Fassung, gegen die er geprüft ist.

## 3. Die Regeln

1. **Ein Kurs ist eine Einheit der Arbeit, der Prüfung und der Freigabe.**
   Seine Dateien liegen in einem Ordner. Er hat eine eigene Fassung.
2. **Die Prüfungen eines Kurses lesen nur den Kurs und das, wovon er
   ausdrücklich abhängt.** Ein Pull Request, der nur einen Kurs ändert, wird
   nur von dessen Prüfungen und den kurzen Prüfungen der Plattform blockiert.
3. **Die Plattform wird mit kleinen, künstlichen Beispielen geprüft,** nie mit
   echten Kursen. Ein Plattformtest darf nicht scheitern, weil sich ein Kurs
   inhaltlich ändert.
4. **Abhängigkeiten sind ausdrücklich und tragen eine Fassung.** Das gilt für
   den gemeinsamen Bestand und für Ziele eines anderen Kurses, etwa
   Mathematikziele, die ein Physikkurs voraussetzt.
5. **Eine Änderung am gemeinsamen Bestand erzwingt keine sofortige Arbeit an
   den Kursen, die ihn nutzen.** Ein Kurs bleibt auf seiner geprüften Fassung
   stimmig, bis ihn jemand bewusst anhebt.
6. **Die Verträge der Plattform ändern sich selten und mit Fassung.** Ein Kurs
   nennt die Fassung, für die er gebaut ist. Die Plattform liest die
   vorherige Fassung weiter, bis kein freigegebener Kurs sie mehr braucht.
7. **Qualität wird je Kurs beurteilt,** mit der Qualitätskarte je Einheit.
   Es gibt keine Stufe, die über alle Kurse gemeinsam gehalten werden muss.

## 4. Was ein Kurs enthält

| Bestandteil | Inhalt |
|---|---|
| Kursblatt | Kennung, Titel, Sprache, Lizenz, Fassung, Fassung der Plattformverträge, Abhängigkeiten |
| Lernziele und Graph | eigene Ziele mit Voraussetzungen, oder der Verweis auf den gemeinsamen Bestand |
| Einheiten | Auftakt, Reihenfolge, Abschlussaufgaben |
| Ansicht und Personalisierung | Basis und Erweiterungen mit ihren Wahlregeln |
| Aufgaben, Karten, Bilder | eigene Inhalte; fremdes Material nur als Verweis |
| Quellenentscheidungen | je Anforderung der Vorlage: getragen, abgelehnt oder offen |
| Qualitätskarten | sieben Fragen je Einheit, mit dem Stand der Abnahme und der Erprobung |

Ein Kurs ohne Abhängigkeit, wie die Lineare Algebra, enthält alles selbst.
Ein Kurs „Physik Hessen“ enthält seine Ansicht, seine Wahlregeln, seine
Quellenentscheidungen und Qualitätskarten und verweist für die Lernziele auf
den gemeinsamen Bestand.

## 5. Der gemeinsame Bestand

Der Katalog eines Fachs für alle Länder ist heute der stärkste Hebel der
Wiederverwendung und zugleich die stärkste Kopplung. Drei Wege:

| Weg | Wirkung | Preis |
|---|---|---|
| A. Bestand mit Fassungen | Jeder Länderkurs nennt die Fassung, gegen die er geprüft ist, und wird einzeln angehoben. | Das Backend muss zwei Fassungen desselben Katalogs zugleich laden können. Lernergebnisse müssen eine Anhebung überstehen. |
| B. Kopie je Land | Volle Unabhängigkeit. | Inhalte laufen auseinander; jede Verbesserung muss sechzehnmal gemacht werden. |
| C. Ein beweglicher Bestand wie heute | Kein Umbau. | Kurse außerhalb des Kerns können veralten, sichtbar nur als Bericht. |

**Empfehlung:** C gilt als Übergang; das ist seit dem 27. November so
entschieden (nur der Kern blockiert, der Rest darf nachhinken). Ziel ist A.
Entschieden wird das an der Kostenprobe mit einem zweiten Land, weil sich erst
dort zeigt, was eine Anhebung kostet. Weg B empfehle ich nicht.

Für Weg A sprechen die festen Kennungen der Lernziele: Ein Lernergebnis hängt
an der Kennung, nicht an der Fassung. Für entfallene Ziele gilt die
vorhandene Regel für zurückgezogene Ziele. Ob das Backend zwei Fassungen ohne
großen Umbau laden kann, ist offen und wäre vor einer Entscheidung an einem
kleinen Beispiel zu messen.

## 6. Abhängigkeiten zwischen Kursen

Ein Physikkurs setzt Mathematikziele voraus. Heute steht das als Voraussetzung
im Graphen und als Lernort in der Physikansicht; welcher Mathematikstand
gemeint ist, sagt niemand. Künftig nennt der Physikkurs die Mathematikziele,
auf die er sich stützt, und der Mathematikkurs sichert zu, dass diese
Kennungen bestehen bleiben oder einen benannten Nachfolger bekommen. Die
Prüfung des Physikkurses liest dann nur diese Liste, nicht den ganzen
Mathematikkurs. Die Regel, dass Mathematik rechtzeitig vor der Physik steht,
bleibt eine Frage der Qualitätskarte.

## 7. Was es schon gibt und was im Weg steht

Vorhanden sind ein Vertrag für eigenständige Kurspakete und ein Backend, das
solche Pakete laden kann. Beides ist bisher nicht der Normalweg, und der
Paketvertrag trägt selbst viel Altlast (Profile, Verteilungslisten,
versiegelte Belege).

Im Weg stehen nach heutigem Wissen: Prüfungen, die immer alle Fächer und
Länder lesen; feste Zählwerte in Tests; Backend-Tests, die echte Kataloge als
Beispiel nutzen; und die Nachweisketten über alle Fächer. Welche Schritte der
CI einen einzelnen Kurs heute am Alleingang hindern, misst Codex gerade in
der Bestandsliste zur CI; diese Zeile wird danach durch Zahlen ersetzt.

## 8. Der Weg in Stufen

| Stufe | Inhalt | Was sie entfernt |
|---|---|---|
| 0, jetzt | Die Lineare Algebra wird als erster Kurs so gebaut: eigener Ordner, eigene Prüfungen (Graph, Einheitenregeln, Bestehensgrenze, Qualitätskarte), keine Berührung der Gymnasial-Prüfungen. | zeigt, was die Plattform einem einzelnen Kurs heute aufzwingt |
| 1 | CI nach Kursen: Ein Pull Request wird von den kurzen Plattformprüfungen und den Prüfungen der geänderten Kurse blockiert. | die 65 Minuten für jede Änderung |
| 2 | Kursblatt und Freigabe je Kurs, auf dem vorhandenen Paketvertrag, verschlankt. | die gemeinsame Freigabe aller Inhalte |
| 3 | Mathematik und Physik Hessen als Kurse mit ausdrücklichen Abhängigkeiten. Ein zweites Land als Kostenprobe; danach die Entscheidung zwischen Weg A und C. | stille Kopplung zwischen Physik und Mathematik |
| 4 | Der übrige Bestand wird Kurs für Kurs überführt oder bleibt eingefroren. | die Pflicht, 387 Ansichten gemeinsam grün zu halten |

Die Arbeit an Hessen läuft in allen Stufen weiter. Stufe 0 und 1 brauchen
keine Entscheidung über den gemeinsamen Bestand.

## 9. Risiken und offene Punkte

- **Zwei Fassungen im Backend** (Weg A) sind nicht erprobt.
- **Auseinanderlaufen der Länder:** Mit Fassungen bleibt ein Land stimmig,
  aber alt. Wer hebt es an, und wann? Ohne Antwort entsteht ein Bestand, den
  niemand pflegt.
- **Plattformänderungen** treffen alle Kurse. Regel 6 mildert das, schafft es
  aber nicht ab; eine Änderung wie Basis und Erweiterungen bleibt ein
  gemeinsamer Schritt.
- **Aufwand der Überführung:** Die vorhandenen Fächer sind nicht als Kurse
  geschnitten. Stufe 4 kann lange dauern oder für einzelne Fächer entfallen.
- **Ein Repository oder mehrere:** Ich empfehle vorerst eines mit einem
  Ordner je Kurs. Getrennte Repositories lohnen erst, wenn andere Personen
  Kurse beitragen.

## 10. Entscheidungen beim Product Owner

1. Gelten die sieben Regeln aus Abschnitt 3 als Zielbild?
2. Gemeinsamer Bestand: Weg C als Übergang, Weg A als Ziel, Entscheidung nach
   der Kostenprobe mit einem zweiten Land?
3. Stufe 0: Wird die Lineare Algebra als erster unabhängiger Kurs gebaut, als
   Vorbild für die Schnittstelle zwischen Plattform und Kurs?
4. Vorerst ein Repository mit einem Ordner je Kurs?
