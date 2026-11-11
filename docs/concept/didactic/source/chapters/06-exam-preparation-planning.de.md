## Klausurstoff, Aufgabenabdeckung und Vorbereitung {#sec:exam-preparation-planning}

Die Kursplanung verbindet einen Klausurtermin mit ausdrücklich ausgewählten Themen und Aufgabenpaketen (ohne Prioritätsgewichtung). Der Meilenstein beschreibt Termin und gewählten Lernumfang; erst datierte Lernabschnitte erzeugen Wochenpensen und zeitliche Bilanzen. Einstieg: **Kursplanung → Kurs öffnen → Planung**.

### Drei verschiedene Aussagen {#sec:exam-three-statements}

:::table{cols="4.4cm,X"}
| Bereich | Bedeutung |
| --- | --- |
| **Klausurstoff** | Ausgewählte Themen und ihre sichtbaren `contains`-Unterbäume. |
| **Aufgabenabdeckung** | Explizite `examData.coveredGoalIds` der ausgewählten Aufgabenpakete. |
| **Vorbereitung** | Noch offene Lernziele und erforderliche Grundlagen, die vor dem Termin bearbeitet werden sollen. |
:::

Die Abdeckungsansicht zeigt beide Richtungen: ausgewählte Themen ohne zugeordnete Aufgabe und zusätzliche Aufgabenthemen. Verfügbare Aufgaben zählen erst nach Auswahl; Prüfungsziele werden getrennt von Lernthemen gezählt, kanonische Ziele jeweils höchstens einmal.

Eine `requires`-Kante begründet Vorbereitung, keine geprüfte Leistung, und Metadatenzuordnungen sind kein neuer fachlicher Qualitätsnachweis (die Oberfläche spricht von *hinterlegter Themenzuordnung*). Nicht verfügbare Aufgaben werden ausgewiesen statt eingeplant; verweist `coveredGoalIds` auf einen kanonischen Cluster, den die Kursansicht in sichtbare Einzelziele auflöst, fasst die Referenz nur diese bereits sichtbaren Ziele zusammen, ohne ausgeblendete Ziele einzuschleusen.

In der Kinematik ergänzen unter **Physik → E-Phase → Übungen** zwei Aufgabenpakete (*Senkrechter Wurf: Vorzeichen, Scheitelpunkt und Rückkehr* sowie *Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit*) je sechs Teilaufgaben (36 BE) mit deutschen und englischen Lösungen und Bewertungsrastern für schriftliche Bewegungsgesetze, Diagramme und Begründungen ohne Vektorrechnung (ohne Nachweis praktischer Experimentierkompetenz).

### Vorbereitung vervollständigen {#sec:exam-complete-prep}

Am gespeicherten aktiven Klausurtermin öffnet **Vorbereitung vervollständigen** eine zustandsneutrale Vorschau (auf Basis der gespeicherten Planungsbasis bzw. alle Ziele offen ohne persönlichen Lernstand). Sie unterscheidet beherrschte, rechtzeitig eingeplante und noch zu ergänzende Ziele, zusätzliche Grundlagen sowie offene Zuordnungen in einem Zeitraum mit mindestens einem Werktag vor dem Klausurtermin.

Standardmäßig wird nur die ausdrückliche Auswahl vorbereitet; zusätzliche Aufgabenthemen und Grundlagen sind per Option zuschaltbar. Außerhalb des Kursumfangs liegende Voraussetzungen werden gesondert angezeigt und niemals stillschweigend zu Kurszielen; die Backend-Frontier prüft Voraussetzungen beim Lernen weiterhin regulär.

**Vorbereitung übernehmen** erzeugt einen aktiven Lernabschnitt mit mehreren kanonischen Wurzeln, ohne den Klausurstoff selbst zu verändern oder bereits rechtzeitig geplante Ziele doppelt einzuplanen. Werden Ziele aus anderen Abschnitten vorgezogen, benennt die Vorschau alle betroffenen Abschnitte und verlangt ausdrückliche Zustimmung (entleerte Abschnitte bleiben inaktiv erhalten). Die unveränderliche persönliche Planungsbasis bleibt gewahrt; bei Fehlern bleibt die Vorschau mit klarer Meldung geöffnet, und die Übernahme ins Lerncockpit erfolgt anschließend explizit.

### Aktive und inaktive Abschnitte {#sec:exam-active-inactive}

Jeder Lernabschnitt, Puffer und Meilenstein kann einzeln aktiv oder inaktiv sein (fehlendes `active` gilt in Bestandsdaten als aktiv). Inaktive Elemente bleiben sichtbar, bearbeitbar und reaktivierbar, werden aber vor Zielzuordnung und Deduplizierung entfernt: Sie erzeugen weder Soll noch Rückstand, schützen als Puffer keine Tage und gelten nicht als nächster Termin.

Deaktivieren verändert weder gespeicherten Lernstand noch persönliche Kursziele oder das laufende aktive Lernziel; Reaktivieren behält die Termine bei. Auch ein vollständig inaktiver Plan kann ausdrücklich ins Cockpit übernommen werden, um eine zuvor aktive Planung kontrolliert zu pausieren.

### Lernstand, Klausurfokus und Coach-Einstieg {#sec:exam-focus-and-launch}

Klausurstoff und Zeitplanung sind getrennte Mengen: Der Lernumfang einer aktiven Klausur umfasst genau die sichtbaren atomaren Lernziele der gewählten Themen und Aufgabenpakete (einschließlich bereits erreichter Ziele im Fortschrittsnenner; Aufgabenabdeckung und Voraussetzungen erweitern ihn nicht). Ohne datierte Vorbereitung nennt der Backendstatus den Klausurfortschritt und **Zeitplanung offen**; das Cockpit zeigt Gesamtfortschritt und Zielliste ohne erfundenes Wochenpensum oder Bilanzskala (freie Wochen innerhalb aktiver Zeitplanung behalten dagegen ihren Planstand).

Ein gemeinsamer Backendresolver bestimmt den Lernumfang für Anzeige, Planstart und Coach (bei mehreren aktiven Klausuren zählt der nächste Termin, bei Gleichstand stabil nach Abschnitts-ID, ohne Stoffmengen verschiedener Klausuren zu mischen). Eine Planaktivierung setzt den gesamten atomaren Klausurumfang als Fokus; das aktive Lernziel ist nur der nächste Schritt darin.

Im normalen (*optimistischen*) Modus gelten die wirksamen Voraussetzungen innerhalb des Klausurfokus (im Kinematik-Beispiel ab *„Bewegungen mit Diagrammen untersuchen“*), ohne externe Grundlagen als beherrscht zu werten oder einzufügen; nur der ausdrücklich eingeschaltete Striktmodus blockiert an offenen externen Voraussetzungen. Ohne aktiven Klausurstoff bleibt freies Weiterlernen im persönlichen Curriculum unverändert möglich.

**Lernen starten** führt aus dem Cockpit mit serverseitiger Prüfung der gespeicherten ID und Curriculum-Auswahl direkt zur Providerwahl und zum ausdrücklichen Start einer neuen Lernsession. Dieses Paket schreibt keine Lernergebnisse und leitet aus Themenzuordnungen keine Beherrschung ab.
