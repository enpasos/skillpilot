# Umsetzungsplan: Lerneinheiten für Mathematik und Physik

**Stand: 12. November 2026. Arbeitsgrundlage.** Dieser Plan ersetzt den
[Plan vom 5. November](learning-units-implementation-plan.md) und den
eingefrorenen Plan gleichen Namens auf dem Archivzweig von
[PR #83](https://github.com/enpasos/skillpilot/pull/83). Er beschreibt Sollzustand
und Abnahme; als geliefert gilt nur, was in Abschnitt 5 so benannt ist.

**Ziel:** Mathematik und danach Physik in fachlich zusammenhängenden
Lerneinheiten anbieten. Eine Einheit sagt, was man danach selbstständig kann,
und sichert das durch Prüfungen, die diese Anwendung wirklich verlangen. Das
bestehende Cockpit und alle bisherigen Lernwege bleiben benutzbar.

## 1. Entscheidungen

Der Product Owner hat am 12. November 2026 entschieden:

- Die Einheitenarbeit wird wieder aufgenommen. Der Stopp vom 6. November galt
  dem Vorrang des CI-Vertragsaudits; dieser ist mit
  [#122](https://github.com/enpasos/skillpilot/pull/122) und
  [#125](https://github.com/enpasos/skillpilot/pull/125) erledigt.
- Den Einheitenkatalog leiten wir blockweise selbst aus dem kanonischen Graphen
  und dem [Entwurfsbogen](../concept/skill-graph/learning-unit-design-and-examples.md)
  her. Ein externer Vorschlag ist höchstens benannte Herkunft, kein Vertrag.
- Technische Sperren ganzer Einheiten bleiben unentschieden. Keine Stufe dieses
  Plans braucht sie.

- **Ablageort:** Die Einheiten sind Teil der Skill-Landschaft und liegen in der
  vorhandenen Platzierungsschicht (`programUnits`/`goalPlacements`). Eine eigene
  Katalogdatei neben der Landschaft war kurz umgesetzt und ist verworfen: Der
  Vertrag soll langfristig stabil sein und kein Anbau. Dass der veröffentlichte
  Paketvertrag 1.0 geschlossene Enums für `programUnit.kind` und
  `goalPlacement.relation` hat, ist kein Hindernis; der Paketvertrag bekommt
  dafür die neue Minor-Version 1.2. Veröffentlichte Dateien älterer Versionen
  bleiben unverändert.
- **Weitergabeledger:** Eingecheckt und von der CI geprüft ist immer der
  Weitergabeledger des Vertrags, nach dem ausgeliefert wird. Heute ist das 1.0.
  Der Ledger für Vertrag 1.2 wird mit der Umstellung der Laufzeit (Stufe 3)
  eingecheckt und übernimmt dann diese CI-Prüfung; bis dahin erzeugt ihn, wer
  ein 1.2-Paket baut. Eine Weitergabeprüfung muss alles sehen, was ausgeliefert
  wird, deshalb teilen sich die beiden Verträge keinen Ledger.

Unverändert gilt die Anerkennungsregel, die der Product Owner am 11. November
bestätigt hat: Ein eigenes gewöhnliches Ziel einer Einheit ist anerkannt, sobald
keine offene eigene Prüfung und kein offenes eigenes Lernkartenziel dieser
Einheit es mehr benötigt, und nur in Einheiten, die R1–R5 erfüllen. Maßgeblich
sind die Graph Definition §11 und §13 sowie `AGENTS.md` §2.4 und §4.

## 2. Was aus PR #83 gilt

| Aus PR #83 | Behandlung |
| --- | --- |
| Einheit als Lernversprechen mit begründeter Grenze und Prüfungen, die selbstständige Anwendung tragen | Gilt; steht seit #125 in Konzept und `AGENTS.md`. |
| Kontrollbeispiele M01 „Natürliche Zahlen“ und P13 „Eindimensionale Bewegungen“ samt Befunden zu den vorhandenen Aufgaben | Gelten als erste Kandidaten nach dem Pilot (Abschnitt 5, Stufe 2). |
| Reihenfolge: eine echte Einheit Ende zu Ende, zweiter Fachkontext, dann das Fach vollständig; Mathematik und Physik getrennt abnehmbar | Gilt. |
| Natives Inventar aller angebotenen Konfigurationen | Portiert und neu erzeugt (Abschnitt 3). |
| Gegenbeispielliste | Gilt, soweit sie zur lokalen Anerkennungsregel passt. Fall 1 kehrt sich um: Gehören Q1 und Q2 zur selben Einheit und benötigen beide A, bleibt A nach Q1 offen. |
| Sofortige Anerkennung aus der Abdeckungsliste `C(q)` einer einzelnen bestandenen Prüfung, auch durch Eltern- oder Fremdprüfung | Am 11. November verworfen. Formeln, der Umbau von `check-assessment-model.py` und die Diagramme werden nicht portiert. |
| Bezeichner M01–M61, P01–P51 und die 85 `U_MATH_*`/`U_PHYS_*`-Namen | Keine Verträge. Die Eingabedateien liegen lokal nicht mehr vor; im Archiv von #83 stehen nur Namen ohne Zuordnung. |

## 3. Ausgangslage

Kanonischer Bestand am 12. November 2026, klassifiziert nach derselben Regel wie
im Backend (`CompletionProfileCompiler`):

| | Mathematik | Physik |
| --- | ---: | ---: |
| Gewöhnliche Fachziele | 807 | 478 |
| Prüfungsziele | 163 | 156 |
| Lernkartenziele | 6 | 5 |
| Orientierungsziele | 2 | 2 |
| Fachziele auf einem Voraussetzungspfad unter mindestens einer Prüfung | 807 | 413 |
| Fachziele, die eine Prüfung benötigt und als abgedeckt deklariert | 525 | 406 |
| Prüfungen ohne Abdeckungsdeklaration | 27 | 16 |
| Abdeckungseinträge ohne Voraussetzungspfad | 0 | 9 bei 7 Prüfungen, davon 8 Clusterverweise |

Die beiden unteren Blöcke sind Suchlisten über den gesamten Pool, keine
Einheitenprüfung: R1 und R3 gelten je Einheit und verlangen eine *eigene*
Prüfung.

Weitere Befunde:

- Beide Fächer bestehen die Prüfung auf atomare Normalform und transitive
  Minimalität (`CQR-001`, G17). Die in PR #83 gezählten 923 und 396 Verstöße
  sind mit #86–#121 behoben.
- Die vorhandenen `contains`-Cluster sind keine Einheiten: Keine der 319
  Prüfungen liegt im selben Cluster wie eine ihrer direkten Voraussetzungen.
  `programUnits` sind Jahrgangs- und Phasentöpfe.
- Die Lernkarte im Cockpit ist geliefert
  ([#81](https://github.com/enpasos/skillpilot/pull/81)).
- Eine Anerkennungsruntime gibt es nicht. `CompletionEvaluator` stoppt weiterhin
  an gemeisterten Zwischenzielen; der einzige wirksame Altvertrag ist das
  Completion-Profil `math-dot-product-projection`.

### Angebotene Konfigurationen

`app/scripts/reportMathPhysicsNativeInventory.ts` fragt die tatsächliche
Backendprojektion für jede im Setup wählbare Konfiguration ab (Bundesland,
Stufe, G8/G9, Kursprofil) und fasst Konfigurationen mit gleichen Zielmengen zu
Mitgliedschaftsklassen zusammen. Ein Lauf dauert etwa eine Minute.

| Fach | Sek I | Sek II | Beide Stufen | Konfigurationen | Mitgliedschaftsklassen |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mathematik | 23 | 51 | 69 | 143 | 107 |
| Physik | 18 | 51 | 54 | 123 | 83 |

Jede Konfiguration findet eine Lernendensicht. Alle gewöhnlichen Ziele und
Lernkartenziele beider Fächer sind in mindestens einer Konfiguration Ziel; von
den Prüfungen fehlt nur das Physikziel `3631c8f7-ff48-57ff-b7ee-8397ff1d166a`
(„Sek-I-Abschlussaufgaben Physik selbstständig lösen“).

Seit [#113](https://github.com/enpasos/skillpilot/pull/113) schließt die
Projektion die Sichtziele über ihre kanonischen Voraussetzungen ab. Das
Inventar unterscheidet deshalb **Sichtziele** (was die angebotene Sicht selbst
als Ziel führt) vom **Lernumfang** (Sichtziele plus die durch den Abschluss
hinzugekommenen Voraussetzungen). Jede Physikkonfiguration enthält so zwischen
87 und 168 Mathematikziele im Lernumfang, ohne dass die Mathematikeinheiten
dort angeboten wären.

```bash
npm --prefix app run validate:learning-units:offered
```

Der Befehl erzeugt das Inventar nach `tmp/learning-units/offered-membership.json`,
prüft dessen innere Stimmigkeit und validiert danach die Einheiten gegen jede
Mitgliedschaftsklasse. Er braucht das gepinnte Node und Corretto (`JAVA_HOME`).
Das Inventar ist eine Ableitung aus dem Repositorystand und wird nicht
eingecheckt.

## 4. Vertrag und Validator

Das Format gehört zur Skill-Landschaft und ist im Laufzeitschema
`docs/landscape-runtime.schema.json` sowie im
[Paketvertrag 1.2](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1.2/README.md)
festgelegt:

| Bestandteil | Ablage |
| --- | --- |
| Einheit | `programUnits`-Eintrag mit `kind: "learningUnit"`: `id`, `label`, `labelEn`, `promise`, `promiseEn`, `revision`; keine weiteren Felder. |
| Hierarchie | `parentUnitId` nennt die Einheit, die diese als Pflichtkind verlangt. Beide Enden sind Einheiten; eine Einheit hat höchstens ein Elternteil. |
| Eigenes Ziel | `goalPlacements`-Eintrag mit `relation: "own"` auf ein atomares Ziel derselben Landschaft, ohne `context`. |
| R2-Nachweis | `coverageReviews` an der Einheit, ein Eintrag je eigener Prüfung: geprüfte Ziele, Reviewprotokoll, Aufgaben- und Rubrikhash dieser Prüfung. Die Zielobjekte selbst bleiben unverändert. |
| Vollständigkeit | Landschaftsfeld `learningUnitCoverage`: `partial` oder `complete`; fehlt es, gilt `partial`. |

Zielarten, Voraussetzungen und die Abdeckungsangabe einer Prüfung stehen wie
bisher an den Zielen. Jahrgangs- und Phaseneinheiten und ihre Platzierungen
behalten ihre Bedeutung. Ganz-Einheits-Voraussetzungen, Sperren und
Erlasslisten lassen sich im Vertrag nicht ausdrücken: Die Einheitendeklaration
ist geschlossen, ein unbekanntes Feld ist ein Befund.

Jede Änderung an einer Einheit ändert damit die kanonische Fachdatei, obwohl
kein Zielobjekt sich ändert. Nachweise über Ziele binden deshalb die Landschaft
ohne ihre Einheitenschicht, mit der Projektion des Paketbaus für die Verträge
1.0 und 1.1 (umgesetzt am 12. November, siehe
[Bindungspflege](canonical-math-learning-unit-pilot-binding-review-2026-11-12.md)).
Eine Einheitenänderung lässt sie gültig; jede andere Änderung macht sie
weiterhin ungültig.

Ein Paket nach Vertrag 1.2 trägt die Einheiten samt Reviewprotokollen und
prüft dieselben Regeln beim Bau. Ein Bau nach Vertrag 1.0 oder 1.1 lässt sie
vollständig weg, sodass ein älterer Verbraucher nie einen halben Vertrag sieht.
Die Completion-Profile und -Scopes aus Vertrag 1.1 beantworten dieselbe Frage
mit der am 4. November abgelösten Erlass-Semantik; sie bleiben bis zur
Umstellung der Runtime in Stufe 3 unverändert in Betrieb und entfallen dann.

`npm --prefix app run validate:learning-units` läuft in der Pflicht-CI
(`run_ci.sh curriculum`, Job `curriculum-assessment-proofs`) und scheitert bei
jedem Befund:

| Regel | Durchsetzung |
| --- | --- |
| R1 | Jedes eigene gewöhnliche Ziel liegt auf einem Voraussetzungspfad unter einer eigenen Prüfung; ein Pfad nur unter einem Lernkartenziel zählt nicht. |
| R3 | Jeder Abdeckungseintrag einer eigenen Prüfung ist ein atomares Ziel, das die Prüfung direkt oder transitiv benötigt. |
| R4 | Kein Ziel hat zwei Einheiten. Erklärt die Landschaft `complete`, hat jedes ihrer atomaren Ziele eine Einheit; sonst weist der Validator die offenen Ziele als Zahl aus. |
| Struktur | Die Deklaration von Einheit und Platzierung ist wohlgeformt; eigene Ziele sind atomare Ziele der Fachlandschaft mit genau einer Zielart; der Gesamtumfang ist nicht leer; die Einheitenhierarchie ist azyklisch; jeder Verweis auf den Voraussetzungspfaden der eigenen Ziele ist auflösbar, und kein eigenes Ziel setzt sich selbst transitiv voraus. |
| R2 | Kein Pflichtbestandteil der Strukturgültigkeit. Ein eingetragener Nachweis (`coverageReviews`) muss stimmen: eigene Prüfung, eigenes gewöhnliches Ziel, von der Prüfung benötigt und in ihrer Abdeckung genannt, Reviewprotokoll vorhanden, Aufgaben- und Rubrikhash aktuell. Der Validator meldet je Einheit, welchen Zielen der Nachweis fehlt. |
| R5 | Nicht umgesetzt; Laufzeitvertrag der Stufe 3. |

Voraussetzungspfade folgen der normativen Relation der Graph Definition:
vererben, auf atomare Ziele expandieren, transitiv abschließen. Pfade dürfen die
eigenen Ziele und das Fach verlassen.

Mit `--offered` prüft der Validator R1 zusätzlich in jeder angebotenen
Konfiguration: Wo die Sicht ein eigenes gewöhnliches Ziel selbst als Ziel führt,
muss eine eigene Prüfung, die es benötigt, im Lernumfang liegen. Ein Ziel, das
nur als Voraussetzung in den Lernumfang gelangt, wird als einzelne Kompetenz
erworben und verlangt keine Prüfung seiner Einheit. Diese Prüfung braucht einen
Backendlauf und gehört noch nicht zur Pflicht-CI.

Die gemeinsamen Testfälle liegen in
`contracts/curriculum-package/v1.2/fixtures/learning-units/cases.json`. Der
Validator (`npm --prefix app run test:learning-unit-contracts`) und der
Paketvalidator lesen dieselben Fälle. Die Hashbindung der
Nachweise rechnet in TypeScript bitgleich zur Backendregel des bestehenden
Completion-Profils.

## 5. Stufen und Stand

Jede Stufe ist ein eigener, deploybarer PR-Strang. Bis Stufe 3 ändert sich für
Lernende nichts: Ziele werden wie bisher nur über ihr eigenes explizites
Ergebnis abgeschlossen.

| Stufe | Lieferstück | Abnahme | Stand |
| --- | --- | --- | --- |
| **0 – Wiederaufnahme** | Dieser Plan; Inventarwerkzeug portiert und neu erzeugt. | Dokumentationsprüfungen grün; #83 bleibt Archiv. | Geliefert. |
| **1 – Vertrag und Validator** | Einheiten in der Platzierungsschicht der Skill-Landschaft, Paketvertrag 1.2, Validator für R1, R3, R4 und Struktur, gemeinsame Testfälle, CI-Einbindung. | Testfälle decken jeden Befundcode; keine Runtimeänderung. | Geliefert. Die Angebotsprüfung ist vorhanden, aber nicht in der Pflicht-CI. |
| **2 – Erste echte Einheiten** | Pilot „Skalarprodukt über orthogonale Projektion“, danach M01 und P13, jeweils mit unabhängigem R2-Review. | Validator grün, geschützte Reifegrade gehalten, Quellenbindung für neue Prüfungen. | Begonnen: Pilot eingetragen und strukturell gültig; R2 nicht erfüllt (siehe unten). |
| **3 – Runtime** | Backend leitet aus gültigen Verträgen die wirksame Beherrschung ab, versioniert gebunden (R5); Cockpit, Coach, Frontier und Plan nutzen denselben Stand. | Gesamtfortschritt zählt Anerkennung mit, Perioden zählen nur explizite Abschlüsse, keine neuen Mastery-Zeilen; Deployment und Hostabnahme getrennt durch den Product Owner. | Offen. |
| **4 – Mathematik vollständig** | Blockweise Einheiten, Prüfungen und Reviews; die Landschaft erklärt `learningUnitCoverage: complete`. | Kein Fachziel ohne Einheit, Angebotsprüfung in allen Mathematikklassen grün, Gesamt-CI grün. | Offen: 806 gewöhnliche Ziele ohne Einheit. |
| **5 – Physik vollständig** | Wie Stufe 4, zusätzlich Experimente und mathematische Voraussetzungen. | Eigene Fachabnahme; Mathematik bleibt stabil. | Offen. |

### Stand der Stufe 2

Die Einheit `math-dot-product-projection` besitzt das Ziel
`3016ec37-1c2e-47db-83f5-e767923bc97e` und die Prüfung
`e98672c6-871a-5d0b-889c-5afc51040f0d`. Sie ist in der kanonischen
Mathematikdatei eingetragen und erfüllt R1, R3 und R4, auch in allen 190
Mitgliedschaftsklassen; alle 1.252 Zielobjekte bleiben dabei bytegleich.

Empfohlen und am 12. November umgesetzt ist, dass Nachweise über Ziele die
Landschaft ohne ihre Einheitenschicht binden; der Product Owner hat nach
Vorlage der Empfehlung um Fortsetzung gebeten. Der Prüfer der
Reduktionsnachweise (TypeScript, Java-Test, Python-Brücke) und die
Eingabebindung des Mathematik-Dauerlayouts verwenden seitdem dieselbe
Projektion wie der Paketbau; die Register V6 bis V8 gelten unverändert, alle
geschützten Fächer behalten ihren Reifegrad. Der Generator des Vertrags 1.2
leitet die Einheitenzahlen aus der Fachdatei ab, und der Release-Modell-Test
projiziert vorhandene Einheiten heraus, bevor er seine Testeinheit einfügt.
Einzelheiten und Prüfläufe:
[Bindungspflege vom 12. November](canonical-math-learning-unit-pilot-binding-review-2026-11-12.md).

Das unabhängige
[Review vom 12. November](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/learning-units/math-dot-product-projection-2026-11-12.md)
kommt zu dem Ergebnis, dass die vorhandene Aufgabe R2 **nicht** erfüllt: Der
zweite Vektor liegt auf einer Koordinatenachse, das Vorzeichen der Projektion
wird nie geprüft, und die Aufgabe nennt die Beziehungen, die erklärt werden
sollen. Eine reine Formelroutine kann 10 von 10 Punkten erreichen. Die Einheit
trägt deshalb keinen Nachweis; ihr Ziel bleibt bis zum expliziten Abschluss
offen.

Daraus folgt für Stufe 2:

1. **Stärkere Prüfung für den Pilot** mit neuer Prüfungs-ID nach den drei
   Änderungen des Reviews. Bestandene Versuche der alten ID werden nicht
   aufgewertet. Das ist eine Änderung der kanonischen Mathematik mit eigener
   Quellen-, Review- und Hashbindung und ein eigener PR.
2. **Grenze des Pilots prüfen:** Ob das Ziel eine eigene Einheit bildet oder zu
   einer Einheit über den ganzen Cluster „Skalarprodukt, Orthogonalität und
   metrische Grundlagen im Raum“ gehört, entscheidet der Entwurf dieses Blocks.
   Die drei übrigen Ziele des Clusters haben heute keine Prüfung, die sie
   direkt benötigt.
3. **M01 und P13** nach dem Entwurfsbogen. Bekannt aus PR #83: Die Aufgabe
   `311ab2f2-3364-5166-ac22-3ef01419fee4` ist mit dem Rechenteil allein
   bestehbar (3 von 6 Punkten); die Prüfung
   `4ab1cf6d-b808-5b86-9291-85df0b9f2496` ist ohne Scheitel- und
   Diagrammaufgabe bestehbar (24 von 36 erreichbar, 22 genügen). Beide brauchen
   neue Prüfungen mit eigener ID. Die experimentellen Ziele
   `09029573-864f-40ca-bf8a-cee7bf6dcb73` und
   `ce431132-dfc4-42c2-aff6-bd72035190f8` verlangen eine Aufgabe, die das
   Experiment einschließt.

## 6. Arbeitsweise je Themenblock

1. **Kandidat nach dem Entwurfsbogen beschreiben:** Lernversprechen,
   Eingangskompetenzen, eigene Ziele, Kinder, zentraler Schritt, was darauf
   aufbaut. Die Grenze folgt dem fachlichen Übergang, nicht einer vorhandenen
   Prüfung, einer Zielzahl oder einer Überschrift.
2. **Strukturell prüfen:** Einheit in der kanonischen Fachdatei eintragen,
   Validator laufen lassen. Ein
   Befund ist ein Auftrag für die Fachprüfung. Keine Kante wird ergänzt oder
   entfernt, kein Zieltext verkürzt und keine Einheit zerschnitten, damit der
   Validator grün wird.
3. **Prüfungen unabhängig gegenlesen:** Kann jemand nach der normalen Rubrik
   bestehen, obwohl ein wesentlicher Teil des Ziels fehlt? Das Review erhält
   Ziel, Aufgabe, Lösung, Rubrik und Kriterien, aber kein erwartetes Ergebnis.
   Ein negatives Ergebnis wird als Protokoll abgelegt; die Einheit bleibt dann
   ohne Nachweis.
4. **Stärkere Ansprüche bekommen neue Prüfungs-IDs.** Eine Prüfungs-ID steht
   dauerhaft für denselben Nachweisumfang; alte Ergebnisse werden nicht
   aufgewertet.
5. **Kanonische Änderungen bleiben quellengebunden** und durchlaufen die
   vorhandenen Quellen-, Aufgaben-, Bild- und Reifegradprüfungen. Ein
   Einheitenkatalog setzt keine davon außer Kraft.
6. **Kleine PRs:** ein Block, ein reviewter Stand, grüne CI am genauen Commit.

## 7. Befunde für die Fachprüfung

Diese Befunde sind Arbeitslisten, keine entschiedenen Korrekturen.

- **Physik, Voraussetzungen auf Prüfungen:** 80 Kanten führen von gewöhnlichen
  Zielen auf Prüfungsziele und 10 auf ein Lernkartenziel. Zehn Ziele der
  Biophysik (unter anderem „Linsenauge mit geometrischer Optik modellieren“)
  benötigen jeweils acht Q1-Prüfungen und das Kartenziel „Lernkarten - Q1“. Die
  Kanten kamen mit der atomaren Normalisierung in `c076b599d4` hinzu; davor
  hatte das Linsenauge-Ziel zwei fachliche Voraussetzungen. Vermutlich wurde
  dabei eine geerbte Clustervoraussetzung auf alle atomaren Ziele des
  vorausgesetzten Clusters einschließlich Prüfungen und Kartenziel expandiert,
  was dieselbe Relation ist wie zuvor, nur ausgeschrieben. In sechs
  Physikkonfigurationen gelangen diese Prüfungen so als Voraussetzungen in den
  Lernumfang.
- **Physik, Ziele unter keiner Prüfung:** 65, davon 27 in Astrophysik und 20 in
  Biophysik. Eine Einheit, die sie besitzt, braucht eigene Prüfungen.
- **Physik, Abdeckungsangaben:** 9 Einträge bei 7 Prüfungen liegen auf keinem
  Voraussetzungspfad; 8 davon nennen Cluster.
- **Mathematik, Arbeitsliste:** 282 gewöhnliche Ziele ohne deklarierte
  Abdeckung und 27 Prüfungen ohne Abdeckungsdeklaration. Die beiden in PR #83
  benannten fragwürdigen Voraussetzungen („Spiegelungen von Funktionsgraphen →
  Hauptsatz/Ableitungen“, „Polynomdivision → Optimierungsaufgaben“) werden in
  ihrem Block entschieden.
- **Orientierungsziele als Voraussetzung:** Die beiden Mathematikziele „Warum
  Mathematik? …“ sind Voraussetzung von 11 und 47 gewöhnlichen Zielen und
  gelangen dadurch in den Lernumfang fast jeder Konfiguration, auch jeder
  Physikkonfiguration.

## 8. Abnahmefälle für die Runtime

Stufe 3 erweitert die gemeinsamen Testfälle um die Auswertung. Backend und
Oberfläche lesen dieselben Fälle:

1. Q1 und Q2 gehören zur selben Einheit und benötigen beide A: Nach Q1 bleibt A
   offen, nach Q2 ist A anerkannt.
2. `Q → B → A`, nur B explizit gemeistert, Q offen: A bleibt benötigt. Nach
   bestandenem Q sind A und B anerkannt.
3. Ein offenes eigenes Lernkartenziel hält die Einheit offen, hält ein Ziel aber
   nur zurück, wenn es dieses benötigt. Prüfungen und Karten werden nie implizit
   bestanden.
4. Eine spätere Einheit mit eigener offener Prüfung öffnet ein bereits
   anerkanntes Ziel nicht wieder.
5. Eine Elternprüfung besteht keine Kinderprüfung und keine Kinderkarte; ein
   fertiges Kind bleibt bei offener Elternprüfung fertig.
6. Einheit ohne vollständigen R2-Nachweis oder mit Strukturbefund: keine
   Anerkennung, die Ziele bleiben explizit abschließbar.
7. Neuer Zuschnitt oder neue Kante bei unveränderten Ergebnissen: keine
   zusätzliche Anerkennung (R5).
8. Fokus-, Kurs- und Lehrplanwechsel: gültige Anerkennung bleibt.
9. Zwei Platzierungen desselben Ziels zählen einmal; Anerkennung erzeugt kein
   Tages- oder Wochenereignis und keine Mastery-Zeile.
10. Rücknahme der einzigen Grundlage einer Anerkennung: Die Ableitung wird neu
    berechnet, ohne veralteten Cache und ohne Übertrag zwischen Lernenden.

Zur Umstellung der Laufzeit auf Vertrag 1.2 gehört außerdem, den
Weitergabeledger 1.2 einzuchecken und die CI-Prüfung, die heute den 1.0-Ledger
gegen das frisch kompilierte Modell prüft, auf ihn umzustellen. Bis dahin baut
die GitHub-CI kein echtes 1.2-Modell; `scripts/test_learning_unit_release_model.py`
belegt den Bau nur lokal in `./run_ci.sh package`.

## 9. Nächster Schritt

Stufe 2 fortsetzen: die stärkere Prüfung für den Pilot entwerfen und unabhängig
gegenlesen lassen, parallel die Kandidaten M01 und P13 nach dem Entwurfsbogen
ausarbeiten. Stufe 3 beginnt, sobald eine Einheit einen vollständigen
R2-Nachweis trägt; vorher gäbe es nichts, was die Runtime anerkennen dürfte.
