# Abschnittsauswahl eines Fachplans: Messung und Gegenprüfung

Ein Abschnitt lässt sich vollständig in den Lernplan seines Fachs aufnehmen, auch wenn unter ihm eine Grundlage eines anderen Fachs ihren Lernort hat ([Issue #216](https://github.com/enpasos/skillpilot/issues/216)). Bisher wies das Backend einen solchen Abschnitt als Ganzes ab (HTTP 400). Claude hat die Ursache gemessen und die Änderung umgesetzt; die unabhängige Gegenprüfung steht unten.

## Messung

Gemessen wurde mit dem echten Dienst an jeder Physiksicht, zu der ein Lernumfang auflöst: 16 Länder, je fünf Sichten (Unterstufe, Oberstufe und stufenübergreifend, Grund- und Leistungskurs; Hessen mit G9), zusammen 80 Sichten mit 3.955 Abschnitten. Für jeden Abschnitt wurde die vollständige Auswahl für einen Physikplan angefragt, einmal mit Physik allein und einmal mit Physik und Mathematik im Personal Curriculum. [Messcode](measurement/SectionSelectionProbe.java.txt) · [Ergebnis auf `main`](measurement/sections-main-0c743ce7e3.tsv) · [Ergebnis mit der Änderung](measurement/sections-591f515236.tsv)

| | Stand `main` (`0c743ce7e3`) | mit der Änderung (`591f515236`) |
|---|---:|---:|
| Abschnitte | 3.955 | 3.955 |
| abgewiesen (HTTP 400) | 808 | 158 |
| davon das ganze Fach „Physik“ | 80 von 80 Sichten | 0 |
| jetzt wählbar | – | 650 |
| neu abgewiesen | – | 0 |
| vorher wählbar, Auswahl geändert | – | 0 |

Die Ergebnisse sind mit und ohne Mathematik im Personal Curriculum gleich. Betroffen waren alle 80 Sichten: das Fach selbst, jede Stufe und Phase und jeder Abschnitt, unter dem „Notwendige Grundlagen“ oder eine einzelne Mathematik-Grundlage liegt, in Hessen unter anderem „Einführungsphase: Mechanik“, E.5, E.6, Q1, Q2 und Q4.

| Land | Abschnitte | abgewiesen auf `main` | abgewiesen mit der Änderung |
|---|---:|---:|---:|
| Brandenburg | 185 | 42 | 9 |
| Berlin | 185 | 42 | 9 |
| Baden-Württemberg | 130 | 42 | 5 |
| Bayern | 267 | 64 | 12 |
| Bremen | 227 | 48 | 10 |
| Hessen | 334 | 65 | 17 |
| Hamburg | 186 | 32 | 5 |
| Mecklenburg-Vorpommern | 298 | 54 | 7 |
| Niedersachsen | 235 | 58 | 12 |
| Nordrhein-Westfalen | 233 | 52 | 12 |
| Rheinland-Pfalz | 377 | 62 | 15 |
| Schleswig-Holstein | 283 | 47 | 9 |
| Saarland | 270 | 52 | 9 |
| Sachsen | 279 | 54 | 11 |
| Sachsen-Anhalt | 284 | 56 | 9 |
| Thüringen | 182 | 38 | 7 |

Die 158 weiterhin abgewiesenen Abschnitte enthalten für die lernende Person kein Physikziel: 143 sind Grundlagenbereiche (133 mit Mathematik allein, zehn zusätzlich mit einem Physikziel, das nicht zum gemessenen Lernumfang gehört), 15 enthalten nur Ziele eines anderen Kurses oder Landes (zum Beispiel Leistungskurs-Aufgaben in einer Grundkurssicht). 96 Grundlagenbereiche enthalten auch Physik-Vorbereitungen der lernenden Person und sind jetzt wählbar.

## Regel

Ein Lernplan gehört zu einem Fach. Die vollständige Auswahl eines Abschnitts sind die gezählten Ziele dieses Fachs unter dem Abschnitt. Ein Ziel eines anderen Fachs, das dort seinen Lernort hat, gehört in den Plan seines eigenen Fachs und bleibt aus der Auswahl. Weiterhin abgewiesen wird ein Fokus, der kein Abschnitt des Planfachs ist, sobald er ein Ziel eines anderen Fachs enthält (ein Physikabschnitt in einem Mathematikplan), ebenso ein Ziel eines anderen Fachs, das in einem Block eingereicht wird.

Dazu gehört die zweite Hälfte, die erst die Gegenprüfung gezeigt hat: Ein Abschnitt einer Physiksicht fragt nach Physik, auch wenn unter ihm eine Mathematik-Grundlage liegt. Pläne und Klausur eines Fachs binden, was nach diesem Fach fragt. Bisher wurde das Fach eines Abschnitts aus allen Zielen darunter abgeleitet; die Klausur des Mathematikplans band dann auch den Physikabschnitt. Die Mathematik-Grundlage unter dem Abschnitt bleibt dabei an die Pläne der Mathematik gebunden, beim Angebot wie beim Starten: Während einer Mathematik-Klausur wird eine Grundlage außerhalb der Klausur unter dem Physikabschnitt weder angeboten noch gestartet.

## Tests

Der Test `sectionThatHoldsTheLearningPlaceOfAMathematicsGoalCanBePlannedCompletely` prüft im saarländischen Leistungskurs den Abschnitt „Kraft und Bewegung“ aus dem Issue und die ganze Einführungsphase, jeweils mit und ohne Mathematik: Die Auswahl enthält jedes Physikziel der lernenden Person, das der Abschnitt direkt nennt, und nur Physikziele, und sie lässt sich speichern; ein Mathematikziel im Block, derselbe Abschnitt in einem Mathematikplan und ein Grundlagenbereich ohne Physikziel werden abgewiesen. Gegen den Stand von `main` scheitern alle vier Fälle schon an der Auswahl (Zeilen der beiden Abschnitte in der Messung auf `main`).

Der Test `examOfAnotherSubjectBindsItsOwnGoalsUnderASectionAndNothingElse` bildet die Befunde der Gegenprüfungen nach: Physikplan mit dem Abschnitt „Kraft und Bewegung“ als Fokus, alle Voraussetzungen des Abschnitts erfüllt bis auf die zwei Mathematik-Grundlagen, die dort ihren Lernort haben, dazu ein Mathematikplan mit zwei Klausurtagen, der nächste zu einem anderen Thema, ein späterer genau zur ersten Grundlage. Das Angebot an Physikzielen, das nächste Ziel des Physikplans und die Physik-Auswahl im Chat bleiben, wie sie ohne die Klausur waren; die Mathematik-Grundlage wird unter dem Abschnitt nicht mehr angeboten, ihr Start wird mit 409 abgewiesen, ein Physikziel des Abschnitts startet. Ist die laufende Klausur die zur Grundlage, wird sie wieder angeboten und startet.

Der Test `openingOfAnotherSubjectUnderASectionIsBoundByThatSubjectsExam` prüft dasselbe für das Einstiegsziel der Mathematik unter der Einführungsphase der Physik bei einer lernenden Person ohne Vorleistungen: Vor der Mathematik-Klausur werden beide Einstiegsziele angeboten, während der Klausur nur das der Physik; das der Mathematik startet nicht.

Der Test `continuationUnderASectionJudgesTheOtherSubjectsExamAsTheWriteWill` prüft das Fortsetzen eines Physikplans, während der gespeicherte Fokus noch eine spätere Mathematik-Klausur bindet: Der Schritt, den der Plan ankündigt, ist der, den das Fortsetzen startet.

Der vorhandene Test `planWithAnExamDayThatCannotBeEvaluatedLeavesOrdinaryLearningOpen` hat einen sechsten Fall: ein Plan ohne Klausurtag, dessen Lernen vollständig pausiert ist und der ein Ziel nennt, das der Lernumfang nicht kennt. Er lässt gewöhnliches Lernen offen, der Status meldet ihn als veraltet, und das Fortsetzen startet ein Ziel. Ohne die Änderung scheitert genau dieser Fall.

## Unabhängige Gegenprüfung

Claude hat die Änderung umgesetzt und deshalb nicht selbst geprüft. Getrennte, schreibgeschützte Codex-Läufe (Modell `gpt-6.2-astra`) haben jeden Stand mit eigenen Fragen gelesen; keiner kannte Claudes Überlegungen. Die Gutachten sind unverändert abgelegt, bis auf die Schreibweise der Dateiverweise; die Originale liegen außerhalb des Repositorys.

| Stand | Gutachten | SHA-256 des Originals |
|---|---|---|
| Erste Änderung, Commit `591f515236` | [review-591f515236/review.md](review-591f515236/review.md) | `ce046705f31e0e591bb4a565c051a983fd564c3a132f6a08d5f848a090e4980d` |
| Zweite Änderung, [gelesene Differenz](confirmation-second-change/reviewed-change.diff) | [confirmation-second-change/review.md](confirmation-second-change/review.md) | `17c4958fd0d31b4d609273879550d4cd5c2718b18871c2fae603a935ea608a43` |
| Zweite und dritte Änderung zusammen, [gelesene Differenz](confirmation-third-change/reviewed-change.diff) | [confirmation-third-change/review.md](confirmation-third-change/review.md) | `b18abd425ea07f5664950242eda88327486b8235c5304a037a31b13eedfdc8e7` |
| Commit `e090776026` | [confirmation-e090776026/review.md](confirmation-e090776026/review.md) | `b0e7d849645f9156390d6641f2a7acbe5ac5b01c9f52c94ff137c3b8772b192a` |
| Commit `4158eb855e` | [confirmation-4158eb855e/review.md](confirmation-4158eb855e/review.md) | `a0c4f5a2981cb2201efc48b744576053ee503bc9e469303bdec5e0c45f45485a` |
| Pausierter Plan, [gelesene Differenz](confirmation-paused-plan/reviewed-change.diff) | [confirmation-paused-plan/review.md](confirmation-paused-plan/review.md) | `8900ed04d2700a5f242ee84820a2525b0d47958346acece0978ce281fb012852` |

### Erste Gegenprüfung

| Frage | Ergebnis | Folge |
|---|---|---|
| Greift die Ausnahme nur für Abschnitte des eigenen Fachs, bei jeder Form von Sicht- und Abschnitts-Id? | Ja, auch für zusammengeführte Sichten und Sichten aus einem Paket; ohne Fachangabe der Sicht gilt die strenge Prüfung. | – |
| Wird ein Fokus angenommen, der abgewiesen werden müsste, oder umgekehrt? | Kein Gegenbeispiel. Ein Physikabschnitt in einem Mathematikplan bleibt abgewiesen, ein guter Abschnitt rettet keinen falschen Nachbarn. | – |
| Stimmen alle Leser der Abschnittsauswahl (Speichern, Status, Sicherung, Klausurumfang, behaltene Ziele, Einheitenauftrag)? | Ja, mit einer Ausnahme: Bei einem Physikplan mit einem solchen Abschnitt konnte die Klausur eines Mathematikplans das fällige Physikziel verdrängen. | Zweite Änderung: Das Fach, nach dem ein Abschnitt fragt, ist das Fach seiner Sicht. Eigener Test. |
| Leiten andere Stellen das Fach eines Fokus aus allen Zielen darunter ab? | Ja: der Umfang gefolgter Pläne und die Fachbindung der Auswahl im Chat. | Beide nutzen jetzt dieselbe Regel. |
| Ist der neue Test aussagekräftig? | Er scheitert ohne die Änderung, die drei Gegenproben sind sinnvoll; die positive Prüfung bewies die Vollständigkeit nicht. | Ergänzt: Die Auswahl muss jedes direkt genannte Physikziel der lernenden Person enthalten. |
| Stimmen die Messwerte? | Ja. Zehn der 143 Grundlagenbereiche enthalten auch ein Physikziel außerhalb des Lernumfangs. | Text oben berichtigt. |

Zwei Hinweise sind aufgenommen und nicht geändert. Ein gespeicherter Meilenstein, dessen Thema ein solcher Abschnitt ist, wird jetzt wie jeder andere Meilenstein mit einem Abschnitt als Thema ausgewertet; bisher fiel er auf gewöhnliches Lernen zurück, weil sein Thema nicht aufzulösen war. Und die Planauswahl der Trainersicht bietet Grundlagenbereiche nicht an, die nur Vorbereitungen enthalten; das Backend nimmt sie jetzt an, die Oberfläche ist ein eigenes Thema.

### Zweite Gegenprüfung

| Frage | Ergebnis | Folge |
|---|---|---|
| Schließt die zweite Änderung den Befund, im Planweg und bei der Auswahl im Chat? | Ja, beide Wege erkennen den Abschnitt als Physik. | – |
| Bleibt das Verhalten gleich, wo es gleich bleiben muss (Fokus ohne Abschnitt, ein Fach, lange Ziellisten, zwei Fächer ohne Abschnitt, die Freigabe ohne Zeitplan)? | Ja; der Mehraufwand ist höchstens ein Durchlauf über die Fokus-Ids. | – |
| Gibt es eine Eingabe mit falscher Fachmenge? | Ja, bei einem Paket, dessen Fachkennungen sich nur in der Groß- und Kleinschreibung unterscheiden: Der Vergleich ignorierte die Schreibweise. Kein ausgeliefertes Beispiel. | Dritte Änderung: Fachkennungen werden genau verglichen. Alle 387 ausgelieferten Sichten nennen ihr Fach in genau der Schreibweise des Katalogs. |
| Wird ein fachfremdes Ziel unter dem Abschnitt angeboten, obwohl sein Start abgewiesen wird? | Schlimmer: Es wurde angeboten und ließ sich starten, an der Klausur seines eigenen Fachs vorbei. | Dritte Änderung: Ein solches Ziel bleibt an die Pläne seines eigenen Fachs gebunden, beim Angebot und beim Starten. |
| Ist der Test aussagekräftig? | Die Prüfung des Physik-Angebots trägt; die Auswahl im Chat und das Starten fehlten. | Ergänzt, mit drei Gegenproben. |

### Dritte Gegenprüfung

Sie las einen Zwischenstand, in dem die Bindung an den eigenen Fachplan je Ziel und mit dem Ziel selbst als Klausurbindung geprüft wurde. Der Commit `e090776026` antwortet auf ihre Befunde.

| Befund | Folge |
|---|---|
| Bei zwei Klausurtagen in Mathematik konnte die Frage nach einem Ziel die spätere Klausur auswählen, wenn deren Umfang genau dieses Ziel ist; die Grundlage wurde dann doch angeboten. | Geändert: Die Pläne des anderen Fachs werden mit der gespeicherten Klausurbindung ausgewertet, so wie der Planstatus und das Starten unter dem Abschnitt sie sehen. Der Test hat jetzt zwei Klausurtage. |
| Das Einstiegsziel des anderen Fachs („Warum Mathematik?“ unter der saarländischen Einführungsphase) umging die Bindung, weil erforderliche Einstiegsziele vor der Prüfung zurückgegeben werden. | Geändert in beiden Berechnungen des Angebots. Eigener Test `openingOfAnotherSubjectUnderASectionIsBoundByThatSubjectsExam`. |
| Die Pläne des anderen Fachs wurden je Kandidat neu ausgewertet, vor den günstigen Prüfungen. | Geändert: eine Auswertung je Fach und Berechnung, nach der Abschnitts- und der Fortschrittsprüfung. |
| Die Fachkennungen werden jetzt genau verglichen; alle 387 ausgelieferten Sichten passen. | Bestätigt. |
| Der Test prüft Angebot, Auswahl im Chat und Starten; er nahm jeden Fehler beim Starten hin und hatte keinen Fall, in dem das fachfremde Ziel zur laufenden Klausur gehört. | Ergänzt: der Status 409, die unveränderte aktive Stelle und der Fall, in dem die Grundlage Thema der laufenden Klausur ist und unter dem Abschnitt angeboten wird und startet. |

Drei Punkte bestanden schon vor diesem Paket und sind unverändert; sie sind als Folgethemen festgehalten ([Issue #212](https://github.com/enpasos/skillpilot/issues/212)). Erstens: Wird ein Einheiten-Auftakt bestätigt, ersetzt das Backend den Abschnitt durch die Zielliste des Lernwegs; enthält sie Ziele zweier Fächer, gilt die bisherige Regel für einen Fokus über zwei Fächer, und ein pausierter Plan des anderen Fachs bindet dessen Ziele dort nicht. Zweitens: Ein Plan ohne Klausurtag, der vollständig pausiert und zugleich veraltet ist, zählt im Angebot als Pause, während der Planstatus ihn als veraltet meldet (nach der fünften Gegenprüfung in diesem Paket behoben, siehe unten). Drittens: Die Auswahl im Chat und der ausdrückliche Fachwunsch beurteilen ein fachfremdes Ziel als eigenen Fokus; hat sein Fach eine spätere Klausur genau zu diesem Ziel, wird es dort angeboten und gestartet, und diese Klausur ist dann die laufende.

### Vierte Gegenprüfung

Sie las den Commit `e090776026`. Der Commit `4158eb855e` antwortet auf ihre Befunde.

| Befund | Folge |
|---|---|
| Die Aufteilung der Umfangsberechnung ändert nichts am Ergebnis; die Mehrfachauswertung und die Auswahl einer späteren Klausur durch das angefragte Ziel sind behoben. | Bestätigt. |
| Bei einem Fokus, der erst gespeichert wird (Fortsetzen eines Plans), wurden die Pläne des anderen Fachs noch mit dem alten gespeicherten Fokus als Klausurbindung ausgewertet. Ein Physikplan konnte dann ein Ziel ankündigen, dessen Start mit 409 abgewiesen wurde. | Geändert: Klausurbindung ist der Fokus, für den das Angebot berechnet wird, wie beim Starten. Eigener Test `continuationUnderASectionJudgesTheOtherSubjectsExamAsTheWriteWill`; mit dem vorherigen Stand kündigte der Plan das Physikziel `5355fee0` an und das Fortsetzen endete mit 409, jetzt startet der angekündigte Schritt. |
| Ein erforderlicher Auftakt einer Einheit des anderen Fachs wurde nur auf wörtliche Zugehörigkeit zur Klausur geprüft; die Regel für Auftakte lässt ihn zu, wenn die Klausur ein Ziel seiner Einheit enthält. Kein ausgeliefertes Beispiel. | Geändert: Auftakte werden in beiden Berechnungen nach der Regel für Auftakte zugelassen. |
| Wird ein erforderlicher Einstieg zurückgegeben, liest das Backend die gefolgten Pläne einmal zusätzlich. | Als Aufwand hingenommen: ein Lesezugriff je Berechnung bei eingeschaltetem Planfolgen. |
| Beide Tests decken die zwei Klausurtage, den Status beim Starten und den Einstieg ab; alle fünf Gegenproben haben eine unterscheidende Prüfung. | Bestätigt. |

Sieben Gegenproben am Stand `4158eb855e`, jeweils ein Teil zurückgenommen; jede lässt mindestens einen der drei Tests scheitern: Fachmenge des Planumfangs aus allen Zielen; keine Bindung fachfremder Ziele; Fach des gespeicherten Fokus aus allen Zielen; das angefragte Ziel als Klausurbindung; Einstiegsziele ohne Bindung in der einen und in der anderen Berechnung des Angebots; der gespeicherte Fokus als Klausurbindung für einen Fokus, der erst gespeichert wird.

### Fünfte Gegenprüfung

Sie las den Commit `4158eb855e` mit dem Auftrag, jede Eingabe zu nennen, bei der das Paket das Verhalten gegenüber `main` verschlechtert.

| Befund | Folge |
|---|---|
| Die Klausurbindung beim Fortsetzen ist behoben; der neue Test prüft, dass der angekündigte Schritt startet. Die Regel für Auftakte gilt in beiden Berechnungen und stimmt mit der des gefragten Fachs überein. | Bestätigt. |
| Ein Plan, der vollständig pausiert und zugleich veraltet ist und keinen Klausurtag hat, zählte als Pause. Auf `main` hielt ein gewöhnlicher Mathematikplan einen gemischten Physikabschnitt dabei offen, weil der Abschnitt nach beiden Fächern fragte; mit der Fachregel schloss der veraltete Physikplan den Abschnitt. Ausgelieferte Daten (saarländische Einführungsphase). | Geändert an der Wurzel, der Lücke der Regel aus #205: Auch eine Pause grenzt das Lernen ein, deshalb entscheidet auch für sie die vollständige Verträglichkeit des gespeicherten Plans. Ein Plan, der sich nicht auswerten lässt, lässt gewöhnliches Lernen offen. Eigener Testfall. Diese letzte Änderung hat ein sechster Lauf gelesen und bestätigt: Angebot, Planstatus und Fortsetzen erzählen für einen solchen Plan dasselbe; sein einziger Hinweis, die Reihenfolge zweier Prüfungen, ist übernommen. |
| Die Auswahl im Chat ohne Fachangabe folgt jetzt dem Fach des Abschnitts. Hat Mathematik zwei Klausurtage und der spätere gilt genau einer Grundlage des Abschnitts, bietet diese Auswahl die Grundlage an und startet sie. Auf `main` unterdrückte die nächste Mathematik-Klausur die Auswahl ganz; mit ausdrücklichem Fachwunsch „Physik“ bestand dasselbe schon dort. | Nicht geändert. Es ist die Regel des ausdrücklichen Fachwunschs, die ein fachfremdes Ziel als eigenen Fokus beurteilt (Folgepunkt in Issue #212), jetzt auch über die Auswahl ohne Fachangabe erreichbar. |
| Zwei weitere Eingaben setzen voraus, dass der Auftakt einer geführten Physik-Einheit in der Sicht eines anderen Fachs liegt: Nach dem Bestätigen eines so zugelassenen Auftakts kann ein Ziel einer späteren Klausur starten, und die Lernreihenfolge der Einheit kann das einzige zulässige Klausurziel verdecken. | Nicht geändert; kein ausgeliefertes Beispiel, geführte Einheiten liegen nur in Physiksichten. Beide gehören zum Folgepunkt „Fokus nach dem Bestätigen eines Auftakts“ in Issue #212. |
| Ein zusätzlicher Lesezugriff je Berechnung des Angebots bei eingeschaltetem Planfolgen. | Als Aufwand hingenommen. |

