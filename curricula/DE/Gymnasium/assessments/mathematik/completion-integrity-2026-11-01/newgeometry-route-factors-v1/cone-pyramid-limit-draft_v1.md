# Kegeldach: die Volumenformel mit Pyramiden plausibilisieren

Status: Autorenkandidat. Unabhängige Inhaltsprüfung, Quellen-/Platzierungsprüfung, Exklusivität und Maschinen-QA stehen aus.

## Herkunft

Diese Aufgabe ist neu für den zusammenhängenden Regenwassertank-Kontext verfasst. Die alte gemischte Drohnen-/Tankaufgabe `ea664a30-98be-508e-90ac-5304679814ee` aus `seki/j10/draft_v3.md`, Aufgabe 5, Teilaufgabe 4, dient nur als Kontextanregung. Maße des Kegeldachs, die explizite Argumentation mit inneren und äußeren Pyramiden sowie die kleinteilige Vollpunkterubrik sind neu; es handelt sich nicht um einen unveränderten Auszug oder eine offizielle Prüfungsaufgabe. Die Ursprungsaufgabe bleibt unverändert.

## Aufgabe

Das Dach eines idealisierten Regenwassertanks ist ein gerader Kreiskegel mit Radius $r=2\,\mathrm{m}$ und senkrechter Höhe $h_K=1{,}5\,\mathrm{m}$. Du kennst bereits die Volumenformel $V_P=\frac13G h$ für Pyramiden mit Grundflächeninhalt $G$ und senkrechter Höhe $h$.

Die Volumenformel für Kegel soll jetzt mit geeigneten Pyramiden anschaulich begründet werden. Eine formale Grenzwertrechnung oder ein rechnerischer Beweis für die Annäherung von Vielecksflächen wird nicht verlangt; entscheidend ist eine nachvollziehbare geometrische Erklärung.

1. Beschreibe oder skizziere Pyramiden, deren regelmäßige Grundvielecke dem Grundkreis einbeschrieben beziehungsweise umbeschrieben sind. Alle Pyramiden sollen dieselbe Spitze wie der Kegel und dieselbe senkrechte Höhe haben. Erläutere, was bei wachsender Eckenzahl mit den Grundflächen und den eingeschlossenen beziehungsweise umschließenden Körpern geschieht. Begründe damit die Formel $V_K=\frac13\pi r^2h_K$. Es reicht nicht, nur zu schreiben: „Ein Kegel ist eine Pyramide mit unendlich vielen Ecken.“ (5 BE)
2. Berechne mit der so begründeten Formel das Volumen des Kegeldachs. Gib das Ergebnis genau und sinnvoll gerundet mit Einheit an. (1 BE)

## Lösung

Man betrachtet in der Grundebene regelmäßige Vielecke innerhalb des Grundkreises, deren Eckpunkte auf dem Kreis liegen, und regelmäßige Vielecke außerhalb des Kreises, deren Seiten den Kreis berühren. Verbindet man ihre Ecken jeweils mit der Kegelspitze, entstehen eingeschriebene und umschriebene Pyramiden. Sie haben dieselbe senkrechte Höhe $h_K$ wie der Kegel. Die eingeschriebene Pyramide liegt im Kegel; die umschriebene enthält ihn.

Bei immer feinerer Annäherung, beispielsweise durch fortgesetztes Verdoppeln der Eckenzahl, nähern sich beide Grundflächen dem Kreis an. Ihre Flächeninhalte $G_n^-$ und $G_n^+$ nähern sich von innen beziehungsweise außen dem Kreisflächeninhalt $\pi r^2$. Wenn die Zentriwinkel der regelmäßigen Vielecke kleiner werden, nähert sich der Radius eines Innenkreises im einbeschriebenen Vieleck dem Radius r. Ebenso nähert sich der Radius eines Außenkreises um das umbeschriebene Vieleck dem Radius r. Die noch fehlenden beziehungsweise überschüssigen Flächen liegen damit in einem immer dünneren Kreisring. Mit der Kreisflächenformel wird anschaulich klar, dass die Fläche dieses Rings und damit die beiden Flächenunterschiede beliebig klein werden können. Entsprechend füllen die eingeschriebenen Pyramiden den Kegel immer genauer aus, während der Überschuss der umschriebenen Pyramiden immer kleiner wird.

Für jede dieser Pyramiden gilt $V_n^-=\frac13G_n^-h_K$ beziehungsweise $V_n^+=\frac13G_n^+h_K$. Der Faktor $\frac13h_K$ bleibt unverändert. Deshalb nähern sich beide Pyramidenvolumina demselben Wert $\frac13\pi r^2h_K$. Das Kegelvolumen liegt zwischen ihnen und wird dadurch anschaulich als $V_K=\frac13\pi r^2h_K$ plausibel. Der Faktor ein Drittel stammt aus der Pyramidenformel; die bloße Annäherung einer Vielecksfläche an einen Kreis würde ihn allein nicht begründen. Die Erklärung verwendet keinen zweiten bekannten Kegelvolumensatz als Begründung.

Für das Kegeldach gilt $V_K=\frac13\pi\cdot 2^2\cdot 1{,}5\,\mathrm{m}^3=2\pi\,\mathrm{m}^3\approx6{,}28\,\mathrm{m}^3$.

## Bewertung

6 BE insgesamt; bestanden nur mit 6 BE. Jeder nachstehende Nachweis ist erforderlich. Fachlich gleichwertige Begründungen sind zulässig. Ein korrektes Endergebnis ersetzt keine ausdrücklich verlangte Modellierung oder Begründung.

- 1 BE (`cone-pyramid-families`): Geeignete einbeschriebene und umbeschriebene regelmäßige Grundvielecke sowie die gemeinsame Spitze und die unveränderte senkrechte Höhe h_K richtig beschreiben oder skizzieren.
- 1 BE (`cone-pyramid-law`): Die bekannte Pyramidenformel V = ein Drittel G h_K auf beide Näherungskörper anwenden; Grundflächeninhalt und feste senkrechte Höhe müssen erkennbar zugeordnet sein.
- 1 BE (`cone-base-area-approximation`): Geometrisch erläutern, warum sich bei wachsender Eckenzahl die beiden Grundflächen dem Kreis und ihre Flächeninhalte pi r² annähern; nur eine steigende Eckenzahl zu erwähnen genügt nicht.
- 1 BE (`cone-inner-outer-solids`): Die eingeschriebene Pyramide als im Kegel liegend und die umschriebene als den Kegel enthaltend deuten; erklären, dass die verbleibenden räumlichen Unterschiede bei feinerer Näherung verschwinden.
- 1 BE (`cone-volume-conclusion`): Aus der Annäherung beider Grundflächeninhalte und der festen Höhe nachvollziehbar V_K = ein Drittel pi r² h_K folgern und den Faktor ein Drittel auf die Pyramidenformel zurückführen; bloßes Zitieren der Kegelformel oder der unendlichen Eckenzahl genügt nicht.
- 1 BE (`cone-roof-volume`): Die begründete Formel mit r = 2 m und h_K = 1,5 m richtig anwenden und 2 pi m³ und ungefähr 6,28 m³ erhalten.

## Zielverträge und Grenzen

- `50612a57-7b9d-45fd-bc08-e95556444760`: Die lernende Person kann die Volumenformel eines geraden Kreiskegels plausibilisieren, indem sie den Körper als Grenzfall geeigneter Pyramiden deutet und den Zusammenhang zur Formel V = 1/3 pi r^2 h erläutert.

`requires` und `coveredGoalIds` benennen ausschließlich die oben ausgewiesenen Ziele. Ihre echten Voraussetzungen bleiben über den kanonischen Graphen erhalten. Ein Prüfungserfolg schreibt keine Mastery dieser Voraussetzungen und behauptet keine zusätzliche Kompetenzzertifizierung. Vollpunkte sichern hier, dass kein ausgewiesener Kernnachweis bei bestandenem Kandidaten ausgelassen werden kann; sie ersetzen keine unabhängige Prüfung der Aufgabenqualität.

Dieser Kandidat darf erst nach gesonderter Prüfung in passende autoritative Zielprojektionen aufgenommen werden. Er darf dort nicht zusätzlich zur unveränderten Ursprungsaufgabe oder zu einer anderen Variante derselben Familie verpflichtend werden. Tatsächliche Targetmitgliedschaft belegt keine offizielle Lehrplanzuordnung. Insbesondere bleiben die Schleswig-Holstein-Profile wegen offener Quellenzuordnungsfragen zur gesonderten Prüfung angehalten. Keine menschliche Freigabe, Erprobung, Host-Abnahme oder erreichte M7-Reife wird behauptet.
