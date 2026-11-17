# Lerneinheiten: Motivation am Anfang, Prüfungen am Ende

**Stand: 17. November 2026. Konzeptentwurf, nicht beschlossen und nicht
umgesetzt.** Das Dokument ergänzt die
[Festlegung vom 14. November 2026](learning-unit-wiring-concept-2026-11-14.md)
(B1 bis B16) um das Motivationsziel einer Einheit. Die Spalte „Herkunft“ in
Abschnitt 2 trennt die Richtung, die der Product Owner am 17. November 2026
vorgegeben hat, von der Ausarbeitung, die er noch nicht bestätigt hat.
Abschnitt 10 nennt die offenen Entscheidungen.

## 1. Zweck

Heute gibt es je Fach und Stufe ein Motivationsziel, etwa „Warum
Mathematik?“. Jedes Einstiegsziel ohne sonstige Voraussetzung verlangt es.
Das hat zwei Schwächen:

- **Die Motivation steht weit vor dem Stoff.** Ein Ziel vor 47
  Einstiegszielen der Sekundarstufe II sagt nicht, wozu das einzelne Thema
  nützt.
- **Die Einheit mit Prüfungen hat ein Ende, aber keinen Anfang.** Ihre
  Prüfungen zeigen, was man kann. Ihr Lernversprechen sagt, was man danach
  kann und wozu; im Lernfluss kommt es nicht vor.

Jede Einheit mit Prüfungen bekommt deshalb einen eigenen Anfang: ein
Motivationsziel, das sagt, worum es in der Einheit geht und wozu sie nützt.

## 2. Festlegungen

| Nr. | Festlegung | Herkunft | Abschnitt |
| --- | --- | --- | --- |
| MZ1 | Jede Einheit mit Prüfungen hat genau ein eigenes Motivationsziel. Es steht an ihrem Anfang, ihre Prüfungen stehen an ihrem Ende. | Product Owner | 3 |
| MZ2 | Das Motivationsziel vermittelt, worum es in der Einheit geht und wozu sie nützt, möglichst mit Praxisbezug. | Product Owner | 5 |
| MZ3 | Das gilt auch geschachtelt: Hat eine Einheit eigene Prüfungen, hat sie eine eigene Motivation, gleich was ihre Elterneinheit und ihre Untereinheiten haben. | Product Owner | 4.3 |
| MZ4 | Am Ende liegt jedes Inhaltsziel als eigenes Ziel in einer Einheit mit Motivation und Prüfungen. Maßgeblich ist seine kleinste Einheit. | Product Owner; der zweite Satz ist Vorschlag | 3 |
| MZ5 | Motivation und Prüfungen stehen ausdrücklich im Einheiteneintrag: Er nennt das Motivationsziel und wie bisher die Abdeckungsreviews der Prüfungen. | Product Owner | 4.1 |
| MZ6 | Der Fluss durch die Einheit steht als `requires` im Graphen: von der Motivation über die Inhaltsziele zu den Prüfungen. | Product Owner | 4.2 |
| MZ7 | Jedes eigene Ziel, das kein Ziel aus dem Umfang der Einheit voraussetzt, verlangt die Motivation. Diese Kanten folgen vollständig aus der Regel; ein Werkzeug schreibt und prüft sie. | Vorschlag | 4.2 |
| MZ8 | Die Motivation verlangt kein Inhaltsziel. Außerhalb der Einheit verlangt kein Ziel ihre Motivation. Nichts verlangt eine Prüfung (B9). Zwischen Einheiten steht weiter `after`. | Vorschlag | 4.2 |
| MZ9 | Die Motivation einer Einheit verlangt die Motivation der nächsten Einheit mit Prüfungen, in der sie liegt. | Vorschlag, offen | 4.3 |
| MZ10 | Das Motivationsziel ist ein Orientierungsziel mit eigenem binärem Ergebnis. Es prüft und bewertet nichts. Nach bestandenen Prüfungen der Einheit gilt es als erledigt. | Vorschlag | 5 |
| MZ11 | Der Coach vermittelt genau die Inhalte aus MZ2. Den Auftrag dazu liefert das Backend aus den Daten der Einheit. | Product Owner; die Ausgestaltung ist Vorschlag | 6 |
| MZ12 | Von Hand geschrieben werden nur das Lernversprechen und der Praxisbezug. Alles andere leitet das Backend aus dem Graphen ab. | Vorschlag | 5 |
| MZ13 | Motivationsziele entstehen mit dem Zuschnitt einer Einheit, nicht in einer eigenen Aktion über alle Fächer. | Vorschlag | 9 |

## 3. Aufbau einer Einheit mit Prüfungen

| Teil | Besteht aus | Sagt |
| --- | --- | --- |
| Anfang | genau einem Motivationsziel | worum es geht und wozu es nützt |
| Mitte | den eigenen Inhaltszielen, den Untereinheiten und weiteren eigenen Zielen | was zu lernen ist |
| Ende | den eigenen Prüfungen | dass die eigenen Inhaltsziele selbstständig angewendet werden |

Ob eine Einheit Prüfungen hat, zeigt weiter ihr Eintrag (B2). Derselbe
Eintrag nennt künftig ihr Motivationsziel. Eine Einheit mit Prüfungen ohne
Motivationsziel ist ungültig. Eine Einheit ohne Prüfungen braucht keines.

**Jedes Inhaltsziel.** Die Prüfungen einer Einheit decken nur ihre eigenen
Inhaltsziele ab (B3). Maßgeblich ist deshalb die kleinste Einheit eines
Inhaltsziels: Sie hat Motivation und Prüfungen. Eine Einheit mit Prüfungen
weiter oben belegt für das Ziel nichts. Übungsaufgaben, Abiturklausuren,
Lernkarten- und Orientierungsziele dürfen weiter eigene Ziele einer größeren
Einheit sein.

**Begriff.** Die Stufen Cluster, Einheit und Einheit mit Prüfungen bleiben.
Eine Einheit mit Prüfungen hat immer auch eine Motivation; einen vierten
Begriff braucht es dafür nicht. „Abgeschlossen“ bleibt das Wort für den
Lernstand: Alle Ziele des Umfangs sind beherrscht.

## 4. Verdrahtung

### 4.1 Im Einheiteneintrag

| Angabe im Eintrag | Stand |
| --- | --- |
| Lernversprechen | vorhanden |
| Abdeckungsreviews: je Prüfung die Inhaltsziele, die sie abdeckt | vorhanden |
| Motivationsziel | neu |

Am Eintrag allein lässt sich ablesen, ob die Einheit Anfang und Ende hat. Das
neue Feld steht im Einheiteneintrag der Platzierungsschicht und kommt mit
einer neuen Version des Paketvertrags. Eine Nebendatei gibt es nicht.

### 4.2 Im Graphen

```text
Motivation → eigene Inhaltsziele und Untereinheiten → eigene Prüfungen
```

| Kante | Regel | Wer sie schreibt |
| --- | --- | --- |
| eigenes Ziel verlangt die Motivation | Jedes eigene Ziel, das kein Ziel aus dem Umfang der Einheit voraussetzt, verlangt die Motivation (MZ7). | ein Werkzeug |
| Prüfung verlangt Inhaltsziele | Jedes eigene Inhaltsziel liegt auf einem Voraussetzungspfad einer eigenen Prüfung (R1, unverändert). | Autorin oder Autor, bestätigt durch das Abdeckungsreview |
| Motivation verlangt die äußere Motivation | nur bei Schachtelung (MZ9) | ein Werkzeug |

Die Regel MZ7 fragt nach Voraussetzungen im Umfang der Einheit, nicht nach
Voraussetzungen überhaupt. Ein Einstiegsziel, das ein Inhaltsziel einer
anderen Einheit braucht, verlangt zusätzlich die Motivation seiner eigenen.

Diese Kanten gibt es nicht (MZ8):

- Die Motivation verlangt kein Inhaltsziel.
- Außerhalb der Einheit verlangt kein Ziel ihre Motivation. Die Kante aus MZ7
  ist deshalb nie überflüssig, und die transitive Minimalität bleibt.
- Nichts verlangt eine Prüfung (B9).
- Zwischen zwei Einheiten steht `after` und kein `requires` (B7, B8).

Die Kanten passen zu B15: Eine Voraussetzung sagt, was vorher gelernt sein
muss. Die Motivation muss vor dem ersten Inhaltsziel stehen.

Was daraus folgt:

- **Die Motivation ist der erste Schritt der Einheit.** Jedes eigene Ziel
  braucht sie; mit MZ9 gilt das für den ganzen Umfang. Frontier und Auswahl
  brauchen dafür keine neue Logik.
- **Anfang und Ende sind prüfbar.** Jedes eigene Inhaltsziel liegt auf einem
  Weg von der Motivation der Einheit zu einer ihrer Prüfungen.
- **Die Lernkarte zeigt den Fluss.** Innerhalb der Einheit zeichnet sie ihn
  mit den vorhandenen Pfeilen für den Bedarf der Ziele.
- **Die Motivation gehört zum Lernumfang.** Wer nur ein Ziel der Einheit
  lernt, bekommt ihre Motivation über den Voraussetzungsabschluss dazu.

### 4.3 Geschachtelte Einheiten

Hat eine Einheit mit Prüfungen eine Untereinheit mit Prüfungen, haben beide
ihre eigene Motivation (MZ3). Die äußere erklärt den Bogen, die innere das
Stück.

```text
äußere Motivation → innere Motivation → innere Inhaltsziele → innere Prüfungen → äußere Prüfungen
```

Die Motivation der inneren Einheit verlangt die der äußeren (MZ9). Ein
`after` kann das nicht leisten: Es steht nur zwischen zwei Einheiten.
Zwischen einem Ziel und einer Einheit ordnet allein der Bedarf der Ziele.
Ohne die Kante stünde die äußere Motivation nicht vor der Untereinheit.

Liegt zwischen beiden eine Einheit ohne Prüfungen, zählt die nächste
umschließende Einheit mit Prüfungen. Verteilt ein Land die Untereinheiten auf
mehrere Planeinheiten, steht die äußere Motivation in der frühesten; das
folgt aus E3.

## 5. Das Motivationsziel

| Eigenschaft | Festlegung |
| --- | --- |
| Zieltyp | Orientierungsziel (`semanticKind: "orientation"`), atomar, eigenes Ziel der Einheit in ihrem Cluster |
| Inhalt | worum es in der Einheit geht, was man danach kann und wozu das nützt, mit einem Beispiel aus Alltag, Beruf oder späterem Stoff |
| Ergebnis | ein binäres Ergebnis wie bei jedem atomaren Ziel. Es sagt: Der Einstieg hat stattgefunden. Ein Fachnachweis ist es nicht. |
| Prüfung | keine. Weder Vorwissen noch Fachbegriffe werden abgefragt, und ob die Motivation verstanden wurde, wird nicht bewertet. |
| Nach bestandenen Prüfungen | Die Motivation gilt als erledigter Einstieg, auch ohne eigenes Ergebnis. So bleibt die Einheit nicht kurz vor dem Abschluss stehen. Das regelt der bestehende Vertrag des [prüfungsgebundenen Abschlusses](assessment-gated-completion.de.md); er behauptet damit kein geführtes Gespräch. |
| Daten am Ziel | keine Prüfungs-, Karten- oder Beispieldaten, wie bisher bei Orientierungszielen |
| Herkunft | ein didaktisches Ziel von SkillPilot, keine Aussage des amtlichen Lehrplans; so wird es ausgewiesen |

Woher die Inhalte kommen (MZ12):

| Was der Einstieg sagt | Quelle |
| --- | --- |
| Worum es geht | abgeleitet aus den eigenen Inhaltszielen und Untereinheiten |
| Was man danach kann | Lernversprechen im Einheiteneintrag |
| Wozu es nützt | Lernversprechen; der Praxisbezug steht als Text am Motivationsziel |
| Was die Prüfungen zeigen | abgeleitet aus den eigenen Prüfungen und ihren Abdeckungsreviews |
| Was darauf aufbaut | abgeleitet aus den Einheiten, die nach ihr liegen, und den Zielen, die ihre Ziele brauchen |

Das Lernversprechen bleibt die eine verfasste Aussage darüber, was man kann
und wozu. Das Motivationsziel wiederholt es nicht.

## 6. Der Coach

| Punkt | Festlegung |
| --- | --- |
| Auftrag | Das Backend liefert zum aktiven Motivationsziel die Inhalte aus Abschnitt 5 als strukturierte Daten. Der Coach erfindet sie nicht. |
| Vermitteln | kurz sagen, worum es geht, was man danach kann und wozu; ein konkretes Beispiel geben; an Bekanntes anknüpfen |
| Nicht tun | abfragen, bewerten, Vorwissen testen, Fachbegriffe verlangen |
| Abschluss | zu einer Reaktion oder Frage einladen. Will die lernende Person weiter, wird das Ergebnis gespeichert. |
| Daten | Es fließt kein Gesprächstext ins Backend. Gespeichert wird nur das binäre Ergebnis. |

Der heutige Abschlussvertrag der Orientierung
([Graph-Definition §8.2](context-and-views.de.md#sec-orientation)) ist für
den einmaligen Einstieg in ein Fach gebaut: Vertiefung, Zusammenfassung und
ein gesondertes Abschlussangebot. Vor jeder Einheit wäre das zu schwer. Für
das Motivationsziel einer Einheit gilt der kurze Ablauf dieser Tabelle; die
Verbote des Vertrags bleiben.

## 7. Was sich an bestehenden Regeln ändert

| Heute | Künftig |
| --- | --- |
| [Graph-Definition §11.1](learning-units.de.md#sec-unit-claims): Der Motivationsauftakt ist eine didaktische Funktion und nicht notwendig ein Ziel. | Jede Einheit mit Prüfungen hat ein Orientierungsziel als Motivation. |
| `GVR-014`: Ein Orientierungsziel hat keine Voraussetzung. | Mit MZ9 darf ein Motivationsziel die Motivation der umschließenden Einheit verlangen und sonst nichts. |
| `CQR-101`, `CQR-102`, `CQR-104` und `GVR-012`: Routen beginnen an Ankern, die je Fach und Stufe fest eingetragen sind. | Anker ist auch das Motivationsziel, das ein Einheiteneintrag nennt. Das gilt, bevor die erste Einheit umgestellt wird. Sonst verlieren die umgestellten Ziele ihre Route, und Reifegrade fallen. |
| Graph-Definition §8.2: Abschluss der Orientierung über Vertiefung, Zusammenfassung und Abschlussangebot. | Für Motivationsziele von Einheiten gilt der kurze Ablauf aus Abschnitt 6. |
| Graph-Definition §8.2: Ohne bisherigen Fortschritt sind offene Orientierungsziele die einzigen wählbaren Ziele. | Es gibt dann viele offene Motivationsziele. In der Lernweise „Einheit für Einheit“ kommt zuerst das der Einheit, die an der Reihe ist. Für die übrigen Lernweisen ist die Regel zu prüfen. |
| Einheiteneintrag und Paketvertrag ohne Motivationsziel | neues Feld, neue Vertragsversion |
| keine Regel | Je Einheit mit Prüfungen gibt es genau ein Motivationsziel, und die Kanten aus Abschnitt 4.2 sind vollständig und ohne Überschuss. |

Unverändert bleiben B1 bis B16, E1 bis E4 und R1 bis R5, das `after`, die
Frontier und das eine binäre Ergebnis je atomarem Ziel. Kein Abschluss
schreibt ein Ergebnis in ein anderes Ziel.

## 8. Ausgangslage

Gemessen am 17. November 2026 am kanonischen Katalog auf `main`:

| | Mathematik | Physik |
| --- | --- | --- |
| Orientierungsziele | 2: „Warum Mathematik?“ für Sekundarstufe I und für Sekundarstufe II | 2: „Warum Physik?“ und „Vom Sand zum Smartphone“ |
| Ziele, die eines davon verlangen | 12 und 47 | 29 und 0 |
| Erklärte Einheiten mit Prüfungen | 2 | 1 |

Keine der drei Einheiten hat ein eigenes Motivationsziel:

| Einheit | Einstieg heute | Ende heute |
| --- | --- | --- |
| Natürliche Zahlen verstehen und darstellen | Zwei Einstiegsziele verlangen „Warum Mathematik?“. | Zwei Prüfungen setzen die eigenen Inhaltsziele voraus. |
| Skalarprodukt über orthogonale Projektion deuten | Das Einstiegsziel verlangt ein Inhaltsziel außerhalb der Einheit und keine Motivation. | Eine Prüfung. |
| Gleichmäßig beschleunigte Bewegung modellieren | Das Einstiegsziel verlangt drei Inhaltsziele außerhalb der Einheit, zwei davon aus der Mathematik, und keine Motivation. | Zwei Prüfungen. |

„Vom Sand zum Smartphone“ ist schon heute ein Einstieg in ein Thema, die
Festkörperphysik. Kein Ziel verlangt es.

## 9. Umstellung

- **Je Einheit, mit ihrem Zuschnitt (MZ13).** Wird eine Einheit mit Prüfungen
  geschnitten, entsteht ihr Motivationsziel mit. Wie viele es je Fach werden,
  ist nicht gemessen.
- **Zuerst die Regeln.** Die Routenregeln erkennen das Motivationsziel einer
  Einheit als Anker, bevor die erste Einheit umgestellt wird (Abschnitt 7).
- **Ein Einstiegsziel wechselt den Anker.** Es behält seine Kante zu „Warum
  Mathematik?“, bis seine Einheit ein Motivationsziel hat, und verlangt dann
  dieses. So hat es durchgehend eine Route. Die 88 Kanten auf die heutigen
  Fachziele verschwinden damit schrittweise.
- **Das eingefrorene Prüfregister.** Jeder Wechsel ändert das Zielobjekt des
  Einstiegsziels. Steht das Ziel im eingefrorenen Register der
  Voraussetzungsprüfung, braucht es eine neue Prüfung dieses Ziels.
- **Ein neues kanonisches Ziel je Einheit.** Es zieht die Bindungen jedes
  neuen Ziels nach sich: Zählungen, Paketkette und Statusdateien.
- **Der Coach.** Die Anweisungen ändern sich in jeder Anbieter-Linie. Das ist
  Freigabearbeit und folgt der festgelegten Reihenfolge der Linien.

## 10. Offene Entscheidungen

| Frage | Empfehlung |
| --- | --- |
| Verlangt die Motivation der inneren Einheit die der äußeren (MZ9)? | Ja. Nur so steht die äußere Motivation vor der Untereinheit, und nur so braucht der ganze Umfang einer Einheit ihre Motivation. `GVR-014` wird dafür um diese eine Kante gelockert. |
| Was wird aus „Warum Mathematik?“ und „Warum Physik?“? | Sie bleiben Orientierungsziele ihres Fachs in einer Stufe. Ein Fach ist keine Einheit (B1) und braucht deshalb keine Motivation. Keine Motivation einer Einheit verlangt sie: Eine fachliche Einheit gilt in allen Ländern, und die Kante zöge sonst das Fachziel einer Stufe in den Lernumfang einer anderen. Sind alle Einstiegsziele umgestellt, verlangt kein Ziel sie mehr. |
| Gilt für das Motivationsziel einer Einheit der kurze Ablauf aus Abschnitt 6? | Ja. Der Ablauf in drei Schritten bleibt für die Fachziele. |
| Wird geprüft, ob die Motivation verstanden wurde? | Nein. Das Ergebnis sagt, dass der Einstieg stattgefunden hat. |
| Braucht die Einheit mit Motivation und Prüfungen einen eigenen Namen? | Nein (Abschnitt 3). |
| Wie kommt die Einstiegsregel ohne Fortschritt mit vielen Motivationszielen zurecht? | Über das `after` in der Lernweise „Einheit für Einheit“. Für die übrigen Lernweisen ist das zu klären, bevor die Zahl der Motivationsziele wächst. |
