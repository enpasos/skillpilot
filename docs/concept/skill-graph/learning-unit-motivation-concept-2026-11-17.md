# Lerneinheiten: Motivation am Anfang, Prüfungen am Ende

**Konzeptentwurf vom 17. November 2026.** Der Product Owner hat die Richtung
vorgegeben. Die Ausgestaltung steht zur Entscheidung. Der Entwurf ergänzt das
[bestehende Einheitenkonzept](learning-unit-wiring-concept-2026-11-14.md).
Die [Graph-Definition (§11)](learning-units.de.md#sec-unit-claims) ordnet die
Vorgaben und die offenen Ausgestaltungsfragen in das Gesamtmodell ein.

## 1. Was Lernende vom Einstieg haben

> Ein Weg führt schräg nach Nordosten. Wie weit kommst du dabei nach Osten?
> Am Ende dieser Einheit kannst du diesen Anteil in einer Zeichnung zeigen
> und damit erklären, was das Skalarprodukt geometrisch bedeutet.

So könnte der Coach die Einheit „Skalarprodukt über orthogonale Projektion
deuten“ eröffnen. Die Frage gibt dem Lernen eine Richtung. Wer neugierig ist,
kann nachfragen. Wer anfangen möchte, kann mit „weiter“ den Einstieg
abschließen. Die Antwort erarbeitet die Person im Laufe der Einheit.

Heute erklärt ein Ziel wie „Warum Mathematik?“ den Wert eines ganzen Fachs.
Allein in der Sekundarstufe II verlangen 47 Einstiegsziele dieses eine Ziel.
Jede erklärte Einheit hat bereits ein **Lernversprechen**. Darin steht, was
man danach kann und wozu das nützt. Der Vorschlag bringt dieses Versprechen genau
dann ins Gespräch, wenn jemand das Thema beginnt. Am Ende zeigen die eigenen
Prüfungen der Einheit, ob die Person das Gelernte selbstständig anwenden kann.

## 2. Welche Einheiten einen Auftakt bekommen

Der Product Owner hat für den Lernweg Folgendes vorgegeben.

- **Jede Einheit mit eigenen Prüfungen bekommt genau ein eigenes Motivationsziel**
  (MZ1). Es führt mit einem möglichst konkreten Beispiel in das Thema und
  seinen Nutzen ein (MZ2). Das gilt auch für geschachtelte Einheiten mit
  eigenen Prüfungen (MZ3).
- **Jedes Inhaltsziel gehört im fertigen Modell als eigenes Ziel zu einer
  Einheit mit Motivation und Prüfungen** (MZ4). Als zuständig schlagen wir die
  kleinste Einheit vor, in der das Ziel liegt. Eine übergeordnete Einheit
  kann zusätzlich prüfen, wie Lernende mehrere Inhalte zusammen anwenden.
- **Anfang und Ende sind im Einheiteneintrag erkennbar** (MZ5). Er verweist auf
  das Motivationsziel und nennt wie bisher die Reviews, die die Abdeckung durch
  seine Prüfungen bestätigen. Der Lernweg von der Motivation über die
  Inhaltsziele zu den Prüfungen steht als `requires` im Graphen (MZ6).
- **Der Coach vermittelt das Lernversprechen und seinen Nutzen.** Das Backend
  liefert ihm dafür die Inhalte der aktiven Einheit (MZ11).

Die folgenden Abschnitte arbeiten diese Vorgaben als Vorschlag aus. Die
bisherigen Begriffe reichen aus. Ein Cluster gliedert Ziele, eine Einheit ordnet
ihren Lernweg, eine Einheit mit eigenen Prüfungen belegt zusätzlich die
Anwendung ihrer eigenen Inhalte. Eine Einheit, die Untereinheiten nur
zusammenfasst, braucht keinen eigenen Auftakt. „Einheit abgeschlossen“
bedeutet weiterhin, dass alle Ziele ihres Umfangs erfüllt sind.
[Begriffe und Einheitsabschluss](learning-units.de.md#sec-unit-completion)

## 3. Was der Coach sagt und was als erledigt gilt

Autorinnen und Autoren formulieren das Lernversprechen im Einheiteneintrag
und einen konkreten Praxisbezug am Motivationsziel (MZ12). Das kann eine
Alltagssituation, eine berufliche Anwendung oder eine spätere fachliche Frage
sein. Das Backend liefert dem Coach beide Texte. Welche Inhalte dazugehören
und was die Prüfungen abdecken, entnimmt es den Zielen, Untereinheiten und
Abdeckungsreviews. Aus `after` lässt sich ablesen, welche Einheiten im Plan
später vorgesehen sind. Will der Coach sagen „Dort brauchst du das wieder“,
muss er die konkrete Anwendung benennen können.

Der Coach stellt das Beispiel vor und gibt der Person Gelegenheit zu einer
Frage oder Reaktion. Ein ausdrückliches „weiter“ genügt zum Abschluss. Eine
richtige Antwort, Fachbegriffe oder eine Selbsteinschätzung werden dafür
nicht verlangt. Das passt zu einem kurzen Einstieg vor jeder Einheit. Für
die ausführlichere Orientierung in einem ganzen Fach gilt der eigene
[Ablauf mit Vertiefung und Abschlussangebot](context-and-views.de.md#sec-orientation).

Das Motivationsziel ist ein atomares Orientierungsziel
(`semanticKind: "orientation"`) von SkillPilot. Der Praxisbezug steht als
Text am Ziel. Felder für Prüfungsaufgaben, Aufgabenbeispiele und Lernkarten
bleiben leer. Die Herkunft weist den Einstieg als didaktische Entscheidung
von SkillPilot aus. Der Einstieg kann auf zwei Wegen als erledigt gelten
(MZ10).

- **Die Person hat den Einstieg erlebt und möchte weiter.** Das Backend
  speichert nur das binäre Ergebnis am Motivationsziel. Der Coach übermittelt
  keinen Gesprächstext.
- **Die Person steigt über eine Prüfung ein.** Nach dem vorgesehenen
  Anerkennungsmodell kann die Orientierung auch ohne eigenes Ergebnis als
  erledigt gelten. Dafür muss der Prüfungsvertrag für diese Fassung der
  Einheit gültig sein. Keine offene eigene Prüfung und kein offenes eigenes
  Lernkartenziel darf die Motivation noch direkt oder indirekt brauchen.
  Hat die Person alle Prüfungen bestanden, aber ein offenes Kartenziel braucht
  den Einstieg noch, bleibt er offen. Eine abgeleitete Erledigung erzeugt
  keinen Gesprächsnachweis und schreibt kein Ergebnis am Motivationsziel.

Das Anerkennungsmodell ist spezifiziert. Seine produktive Einführung setzt
unter anderem die Bindung an die geprüfte Fassung voraus (R5). Eine später
ergänzte Kante darf einem früheren Prüfungsergebnis keine neue Anerkennung
verleihen. [Prüfungsgebundener Abschluss und offene Nachfrage](assessment-gated-completion.de.md#eq-needed)

## 4. Wie der Auftakt im Graphen steht

Bei den natürlichen Zahlen führen zwei Wege durch die Einheit. Auf dem einen
stellen Lernende Zahlen dar und ordnen sie, auf dem anderen arbeiten sie mit
Stellenwerten und runden. Beide Wege sollen mit demselben Motivationsziel
beginnen. Ein späteres Ziel, etwa das Runden, erreicht die Motivation dann
bereits über seine Vorbereitung.

**Vorschlag für die Kanten (MZ7 und MZ8).** Jedes eigene Inhaltsziel soll
seine Motivation direkt oder über weitere Ziele voraussetzen. Dasselbe gilt
für eigene Übungs-, Prüfungs- und Lernkartenziele. „Eigene Ziele“ gehören
zur Einheit selbst. Ziele einer Untereinheit haben dort ihren eigenen Platz.
Das Motivationsziel selbst und eigenständige Orientierungsziele sind von der
Ableitung ausgenommen.

Ein Werkzeug ermittelt die nötigen Kanten aus den übrigen Voraussetzungen.
Es ergänzt die gewünschte Verbindung für jedes betroffene Ziel und schreibt
eine direkte Motivationskante nur dort, wo kein anderer Pfad die Verbindung
herstellt. Damit funktioniert die Regel auch, wenn das erste eigene
Inhaltsziel bereits Mathematik aus einer anderen Einheit oder ein Inhaltsziel
einer Untereinheit braucht. Am fertigen Graphen lassen sich die vollständigen
Pfade, die Kreisfreiheit und die transitive Minimalität prüfen.

Die Motivation selbst setzt im Vorschlag keine Inhalte voraus. Nur Ziele aus
ihrer Einheit dürfen sie direkt verlangen. Für jedes eigene Inhaltsziel
führt der Lernweg weiter zu mindestens einer eigenen Prüfung. Welche ihrer
Aufgaben dieses Ziel tatsächlich prüft, bestätigt das Abdeckungsreview.
Prüfungen bleiben Endpunkte. Zwischen Geschwistereinheiten beschreibt
`after` die vorgesehene Reihenfolge. Die Lernkarte kann beide Beziehungen
mit ihrer bisherigen Bedeutung zeigen. [Ordnungsregeln B7 bis B9 und B15](learning-unit-wiring-concept-2026-11-14.md)

### Wenn Einheiten ineinanderliegen

Eine äußere Einheit mit eigener Syntheseprüfung erklärt den größeren
Zusammenhang. Ihre geprüfte Untereinheit erklärt den nächsten konkreten
Erkenntnisschritt. Eine äußere Prüfung kann dafür auf **Inhalte** der
Untereinheit zurückgreifen. Zum vollständigen Abschluss der äußeren Einheit
zählen auch die eigenständigen Prüfungsergebnisse der Untereinheit.

**Offen bleibt, ob die innere Motivation die äußere voraussetzen soll
(MZ9).** Wer die ganze äußere Einheit beginnt, soll ihren Auftakt zuerst
erleben. Die mögliche Zusatzkante beträfe aber auch jemanden, der für Physik
lediglich ein Mathematikziel aus der inneren Einheit braucht. Über die
Voraussetzungen kämen dann beide Mathematikeinstiege in den persönlichen
Lernumfang. Bei mehreren Ebenen könnte die Kette länger werden.

Vorerst soll das Backend beim Start der ganzen Einheit deren eigenen
Auftakt empfehlen. Eine verpflichtende Kante zur äußeren Motivation
schlagen wir erst dann vor, wenn beide Lernwege an derselben geschachtelten
Einheit gezeigt haben, dass auch jemand mit diesem Teilbedarf den äußeren
Einstieg braucht. Als direkte Voraussetzung käme dann das Motivationsziel
der nächsten umschließenden Einheit mit eigenen Prüfungen infrage. Dafür
wären die Platzierung beider Ziele im Landesplan und eine eng begrenzte
Ausnahme von der Regel für voraussetzungsfreie Orientierung (`GVR-014`)
zu prüfen.

## 5. Was „am Anfang“ für die Auswahl bedeutet

| Wie die Person einsteigt | Was sie erlebt |
| --- | --- |
| Sie beginnt eine ganze Einheit. | Der Coach bietet den kurzen Auftakt dieser Einheit an. Bei „Einheit für Einheit“ orientiert sich der Vorschlag an der Einheit, die gemäß Plan und Reihenfolge an der Reihe ist. |
| Sie setzt einen engen Fokus auf ein einzelnes Inhaltsziel. | Die zugehörige Motivation zählt auch außerhalb des Fokus zum persönlichen Lernumfang. Für den normalen Fokus genügt es, dass die Voraussetzungen innerhalb des Fokus erfüllt sind. Der strikte Modus prüft sie auch außerhalb. |
| Sie wählt bewusst eine verfügbare Prüfung. | Sie kann die Prüfung direkt versuchen, auch wenn der Einstieg oder ein Teil der Vorbereitung noch offen ist. |

Beim **ersten Start** bietet der normale Lernablauf heute nur offene
Orientierungsziele an, sofern es im betreffenden Arbeitsbereich welche gibt
und die Person dort weder fachlichen Fortschritt noch ein aktives fachliches
Ziel hat.
Mit vielen Einheitsmotivationen könnte so eine lange Liste von Einstiegen
entstehen. Für die Empfehlung sollte das Backend die
ausdrückliche Themenwahl, den aktiven Lernplan oder den gewählten Fokus
berücksichtigen und den dazu passenden erreichbaren Einstieg anbieten. Ist
noch kein Thema gewählt, kann „Warum Mathematik?“ als Facheinstieg helfen.
Für die übrigen Lernweisen und für mehrere gleichrangige Einheiten ist die
Auswahl noch festzulegen. [Lernweise „Einheit für Einheit“](learning-unit-progression.de.md#sec-unit-by-unit)
und [Fokusregeln](graph-definition.de.md#sec-filter-modes)

## 6. Woran sich der Vorschlag prüfen lässt

Am 17. November 2026 enthält der kanonische Katalog drei erklärte Einheiten
mit eigenen Prüfungen. Alle drei haben bereits ein Lernversprechen. Keine
hat ein eigenes Motivationsziel.

| Einheit | Heutiger Lernweg | Frage an den Entwurf |
| --- | --- | --- |
| Natürliche Zahlen verstehen und darstellen | Zwei Einstiegsziele verlangen „Warum Mathematik?“. Zwei eigene Prüfungen decken die Inhalte ab. | Hilft ein gemeinsamer Auftakt für beide Wege, etwa zwei Einwohnerzahlen für einen Zeitungsbericht zu vergleichen und sinnvoll zu runden? |
| Skalarprodukt über orthogonale Projektion deuten | Ein eigenes Inhaltsziel braucht Vorwissen von außerhalb. Die Einheit hat eine Prüfung. | Gibt das Wegbeispiel aus Abschnitt 1 diesem einzelnen Lernschritt mit wenigen Sätzen einen Sinn? |
| Gleichmäßig beschleunigte Bewegung modellieren | Das Einstiegsziel hat drei externe Voraussetzungen, darunter zwei aus der Mathematik. Die Einheit hat zwei Prüfungen. | Wer die Fahrt einer anfahrenden Straßenbahn modellieren will, braucht mathematische Vorbereitung. Welche Einstiege helfen der Person auf diesem Weg? |

Die beiden Mathematik-Fachziele für Sekundarstufe I und II haben heute 12
und 47 direkte Verweise aus anderen Zielen. In Physik sind es 29 für „Warum
Physik?“ und keiner für „Vom Sand zum Smartphone“. Letzteres zeigt, dass ein
konkreter thematischer Auftakt bereits als eigenständiges Angebot möglich
ist. [Kanonischer Mathematikkatalog](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json)
und [Physikkatalog](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json)

**Für eine schrittweise Einführung (MZ13)** würde das Motivationsziel
jeweils mit dem fachlichen Zuschnitt seiner Einheit entstehen. Eine neue
Version des Paketvertrags müsste den Verweis im Einheiteneintrag aufnehmen.
Bevor das erste Einstiegsziel seinen bisherigen Fachanker wechselt, müssten
die Routenprüfungen (`CQR-101`, `CQR-102`, `CQR-104`, `GVR-012`) gültige
Einheitsmotivationen im jeweiligen Geltungsbereich erkennen. So könnten die
heutigen 88 Kanten schrittweise abgelöst werden. Fachorientierungen blieben
als Angebot ihrer Stufe zugänglich. Eine länderübergreifende fachliche
Einheit würde dadurch kein stufenspezifisches Fachziel voraussetzen.

Geänderte Zielobjekte brauchen aktuelle Nachweise. Für betroffene Ziele im
eingefrorenen V9-Register greift die frühere Reviewübertragung nach einer
Änderung nicht mehr. Neue Ziel-IDs müssen in Paketen, Zählungen und
Statusdateien berücksichtigt werden. Der kurze Coach-Ablauf wäre in der
festgelegten Freigabereihenfolge der Anbieter einzuführen.

**Zur Entscheidung stehen** der kurze Abschluss mit „weiter“, die Regel für
die automatisch abgeleiteten Motivationskanten und die Auswahl beim ersten
Start. Die zusätzliche Pflicht zwischen innerem und äußerem Einstieg sollte
erst nach dem Vergleich eines vollständigen Lernwegs mit einem fachfremden
Teilbedarf entschieden werden.
