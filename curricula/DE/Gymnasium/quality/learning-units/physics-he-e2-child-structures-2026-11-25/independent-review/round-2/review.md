# Bestätigung des hessischen E.2-Zuschnitts · 25. November 2026

**Die fachliche Umgruppierung, der Bestandsschutz für den datierten Plan und die Fortsetzung des Gravitationsgesetzes sind auf `4f963b4b78` bestätigt.** Alle 23 gezielten JVM-Testfälle bestanden. Am README bleiben zwei Textkorrekturen. Die Zahl der sichtbaren Prüfungen hängt vom persönlichen Kurs ab, und in der Aufzählung der E.5-Ziele fehlen zwei Kepler-Ziele. Beide Punkte lassen sich im Text beheben. [Gutachten A](reviewer-a.md) · [Gutachten B](reviewer-b.md) · [Prüfnachweis](independent-review.actual.json)

## (a) Vorbereitungsorte und Identität der Ansichten

Für jede der 30 Verschiebungen stimmen Ziel-ID, Ansichtsdatei, bisheriger Elternknoten und neuer Elternknoten in drei Quellen überein: in den gepinnten View-Dateien, der unabhängigen Messung der ersten Runde und dem korrigierten Feld `preparationPlaces`. Auch alle vollständigen Vorher-/Nachher-Pfade der ersten Messung stimmen. Die 16 im Autorenbericht angegebenen SHA-256-Werte der acht geänderten Dateien passen zu den Git-Blobs. [Vergleich aller 30 Zeilen und acht Dateipaare](placements.actual.json)

| Vorbereitungsziel oder Gruppe | Betroffene Ansichten | Wechsel | Anzahl |
| --- | --- | --- | ---: |
| Sechs Mathematikziele zu Raumvektoren, Skalarprodukt und Kettenregel | Vier LK-Ansichten | Gemeinsame Vorbereitung der E-Phase → E.5 | 24 |
| Kräfte und Trägheit qualitativ erklären | Sek II GK und LK | E.2 → Kind „Trägheit“ | 2 |
| Mechanische Energieformen qualitativ unterscheiden | Sek II GK und LK | E.2 → Kind „Energie bleibt erhalten“ | 2 |
| Masse und Gewichtskraft unterscheiden | Sek II GK und LK | E.2 → E.5 | 2 |

Das ergibt neun verschiedene Ziele. In den drei stufenübergreifenden GK-Ansichten gibt es keine Verschiebung eines expliziten Vorbereitungsorts. Gegen den Stapelvorgänger `19c14af91e` haben sich acht von 90 Physik-Ansichten geändert. Gegen den ursprünglich geprüften Stand `a88f17523b` sind **alle 90 bytegleich**, einschließlich dieser acht. Damit gelten die früheren Strukturmessungen weiter. [Messskript](probes/compare-placements.py) · [Ursprünglicher Strukturnachweis](../structure.actual.json)

## (b) Laufendes Gravitationsgesetz im gewählten E.2-Fokus

| Kurs | Einheitenpilot | Nach Coach- und regulärem Zustandsabruf | Nach Bestehen im Coach | Angezeigter und gespeicherter Fokus |
| --- | --- | --- | --- | --- |
| GK | aus | Gravitationsgesetz aktiv, `TEACHING` | Mastery 1,0, Zeiger leer | E.2 |
| GK | ein | Gravitationsgesetz aktiv, `TEACHING` | Mastery 1,0, Zeiger leer | E.2 |
| LK | aus | Gravitationsgesetz aktiv, `TEACHING` | Mastery 1,0, Zeiger leer | E.2 |
| LK | ein | Gravitationsgesetz aktiv, `TEACHING` | Mastery 1,0, Zeiger leer | E.2 |

Vor dem Zuschnitt konnte das Gravitationsgesetz `eb0ffdea` in allen vier Konstellationen aus E.2 gewählt werden. Für den Zustand unmittelbar danach setzte der Test den laufenden Zeiger und 43 bereits bestandene Voraussetzungen. Der authentisierte Coach-Abruf ergab `teachActiveGoal`. Erst nach dem regulären Zustandsabruf wurde über das Coach-Werkzeug `setMastery` bestanden. Der einzige neue Ergebniseintrag war das Gravitationsgesetz. Die Folgeabfrage lieferte `FRONTIER`. Die vier Fälle des Branch-Regressionstests bestanden ebenfalls. Autopilot war in diesen Proben ausgeschaltet. [Eigenständige Laufzeitmessung](plan-and-coach.actual.json) · [Frühere Frontier-Proben](../reviewer-b/coach.actual.json) · [Branch-Regression](https://github.com/enpasos/skillpilot/blob/4f963b4b78/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L2064)

## (c) Echter Vorgängerplan

| G9, Sek II | Datiert gespeicherter E.2-Block | Neue E.2-Auswahl | Weiterhin einzeln aus dem alten Plan angeboten und gestartet |
| --- | ---: | ---: | --- |
| GK | 32 | 28 | Drei Gravitationsziele und „Masse und Gewichtskraft unterscheiden“ (`9c328f68`) |
| LK | 32 | 27 | Dieselben vier sowie die LK-Vertiefung zur Erhaltung der mechanischen Energie (`e359f8bb`) |

Die vier ursprünglichen, auf den 23. November datierten Planblöcke stammen aus dem Speicherpfad der Vorgängerversion. Eine erneute Erzeugung mit den acht Vorgängeransichten reproduzierte die Blöcke einschließlich Fingerprint. Auf dem neuen Stand wurden die echten gespeicherten Blöcke und ihre Bindungen übernommen. Vor und nach Export/Import beschrieb der Plan dieselben 32 Ziele und war jeweils aktuell. In jedem Fall blieb gezielt eines der verschobenen Ziele offen. Angebot, Fortsetzen und gespeicherter aktiver Zeiger nannten genau dieses Ziel. Es gab 18 solche Starts auf den neuen Ansichten und 18 Kontrollen mit den Vorgängeransichten. [Plan- und Abschlussproben](plan-and-coach.actual.json) · [Wiederholungsaufbau und Rohbelege](probes/native/README.md)

Der Regressionstest auf dem Branch rekonstruiert den heutigen Vorgängerinhalt aus der neuen Abschnittsmenge plus vier bzw. fünf expliziten IDs. Diese Mengen stimmen ID für ID mit den historischen Blöcken überein. Seine Zählprüfung und die Auswahl eines nächsten Ziels würden für sich allein weder eine künftige Ersetzung durch gleich viele andere IDs noch die Erreichbarkeit jedes einzelnen verschobenen Ziels ausschließen. Der Vergleich mit den echten Blöcken und die Einzelstarts decken beides für den geprüften Stand ab. [Branch-Regression](https://github.com/enpasos/skillpilot/blob/4f963b4b78/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L2105)

## (d) Korrekturen am README

1. **Sichtbare E.2-Zeilen, Zeilen 71–72.** In der unpersonalisierten Ansicht stehen sechs Kinder und vier gemischte Prüfungen. Die Lernkarte und der Cockpit-Baum wurden in dieser Runde zusätzlich mit den tatsächlichen deutschen Antworten des Lernenden-Endpunkts für Hessen G9/Sek II berechnet. Im GK zeigen beide **10 Zeilen**, im LK beide **8**. Die beiden GK-Prüfungen „Newtonsche Axiome und Kräftebilanz“ (`22561c66`) und „Energie, Impuls und Stöße“ (`72649cf5`) fehlen im LK bereits in der Antwort des Backends. Die beiden übrigen Prüfungen sind dort sichtbar. Empfohlene Fassung: „Die Struktur enthält sechs Kinder und vier Prüfungen. In der persönlichen G9/Sek-II-Ansicht sind im GK alle vier, im LK zwei davon sichtbar.“ Die E.5-Zuordnung der Karten ist bestätigt. Welche davon ein Lernender tatsächlich übt, hängt zusätzlich von Freigabe und Fälligkeit ab. [README-Zeile 71](https://github.com/enpasos/skillpilot/blob/4f963b4b78/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/README.md#L71) · [Karten- und Baumzeilen aus beiden Lernenden-Antworten](learner-rows.actual.json)
2. **Nachfrage nach Mathematik in E.5, Zeilen 59–61.** E.5 ist innerhalb der E-Phase der einzige nachfragende Abschnitt für alle sechs Mathematikvorbereitungen. Der Klammerzusatz nennt die Energievertiefung und die Prüfungen. Auch die regulären LK-Ziele zur Herleitung des zweiten und dritten Keplergesetzes (`16caf92e`, `89cadf81`) benötigen jeweils fünf der sechs Vorbereitungen. Die Kettenregel ist die Ausnahme. Der Zusatz kann diese beiden Ziele nennen oder mit dem Satz über die ausschließliche Nachfrage in E.5 entfallen. [README-Zeile 59](https://github.com/enpasos/skillpilot/blob/4f963b4b78/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/README.md#L59) · [Nachfragende Ziel-IDs je Vorbereitung](math-demand.actual.json)

Die Formulierung „vier von E.2 nach E.5“ in Zeile 35 ist für die vier Ziel-IDs in den Ansichtsdateien belegt. Zur Einordnung einer abweichenden Lesart in Gutachten A: Der maßgebliche Generator `role_atoms` bestimmt die Zielrolle von `e359f8bb` auf diesem Commit in allen acht Rohansichten als `target`. Erst die persönliche Kursauswahl schließt die Vertiefung im geprüften GK aus. Der Unterschied zwischen vier IDs in der Ansicht und drei im persönlichen GK erklärt die Planmengen. [Rollen je View-Datei](energy-role.actual.json) · [Vergleich von Zielmengen und Sichtbarkeit](probes/native/actual.json)

## Rückmeldung zum angepassten Test aus #199

Der alte Test las den Zustand eines Lernenden, dessen aktives Mathematikziel außerhalb des gewählten Analysis-Abschnitts lag. Er überprüfte dabei das Löschen des Zeigers sowie das zugehörige Ereignis. Er führte keinen Fokuswechsel durch. Es gibt allerdings einen Unterschied im Aufbau: Der alte Test erbte den gespeicherten Zustand `FRONTIER` und setzte einen aktiven Zeiger. Der neue Test setzt ausdrücklich `TEACHING`. Ich habe beide Eingangszustände mit derselben Ziel-ID geprüft. Der neue Leser liefert in beiden Fällen `TEACHING`, erhält den Zeiger und die gewählte Analysis-Auswahl. Das gespeicherte Zustandsfeld behält jeweils seinen Eingangswert. Die Anpassung ist für ein laufendes Ziel sachgerecht. Der alte Test erfasste zusätzlich die Bereinigung eines widersprüchlichen Altzustands. Eine besondere Garantie, dass jede solche Kombination durch einen curricularen Zuschnitt entstanden ist, ergibt sich daraus nicht. [Alte Testvorgabe](https://github.com/enpasos/skillpilot/blob/fc7cab9ca1/backend/src/test/java/com/skillpilot/backend/service/LearnerServiceCanonicalProjectionTest.java#L265) · [Beide gespeicherten Zustände im selben Testaufbau](projection.actual.json)

## Prüfumfang

Die 23 bestandenen JVM-Fälle umfassen 14 Fälle auf dem Kandidaten, vier Planfälle mit den echten Vorgängeransichten, zwei Exporte der persönlichen Skill-Landschaft und drei Tests zur Zustandsprojektion aus #199. Die 36 Planstarts sind Beobachtungen innerhalb dieser Fälle. Es gab keine Fehler oder übersprungenen Fälle. Ein erster Build der unabhängigen Probe endete bei der Kompilierung ihres AssertJ-Aufrufs. Nach Typpräzisierung in der Probe lief sie vollständig durch. Die Gutachter reichten ihre Originalantworten getrennt ein. [JVM-Ergebnisse und Skripte](probes/native/README.md) · [Rohdaten](raw/)

Der frühere Frontend-Lauf mit 54 Schritten bleibt an `a88f17523b` gebunden. Die beiden E.2-Commits ändern gegenüber `19c14af91e` keine Datei unter `app/src`. Zwischen den beiden Reviewständen unterscheiden sich durch den neuen Elternstand aber zehn Dateien unter `app`, darunter acht unter `app/src` zu Providerstart und Texten. Wie vereinbart wurde für diese Runde die persönliche Karten- und Baumprojektion mit aktuellen Daten ausgeführt. Der vollständige Frontend-Job wurde nicht wiederholt. Der benutzte Checkout ist auf seinem ursprünglichen Branch wiederhergestellt. [Dateivergleich](placements.actual.json) · [Früherer Frontend-Lauf](../raw/frontend-ci/final-frontend.actual.json)
