## Das Produkt: Wie SkillPilot funktioniert {#sec:product}

Im Lernalltag greifen vier Schritte ineinander: **ein erreichbares Ziel auswählen, daran arbeiten, Fortschritt festhalten und das weitere Lernen planen.** Die folgenden Abschnitte gehen diesen Weg vom persönlichen Curriculum bis zum Tages- oder Wochenpensum durch.

### Vom Curriculum zum nächsten Lernziel {#sec:curriculum-to-goal}

Der offizielle Lehrplan bestimmt die Anforderungen. SkillPilot übersetzt sie in konkrete Lernziele und ihre Voraussetzungen. Aus dieser Lernlandkarte, dem gewählten persönlichen Umfang und dem gespeicherten Lernstand ergibt sich, welche Ziele als Nächstes erreichbar sind.

::figure{#fig:current-cockpit}

#### Vom Lehrplan zur Lernlandkarte

Lehrpläne, Modulhandbücher und Standards liefern die verbindlichen Anforderungen. Die daraus abgeleiteten Lernziele bleiben ihren Quellen, Abschnitten und Versionen zugeordnet. Der **Skill-Graph** macht diese Anforderungen bearbeitbar:

- **Lernziele und Themen:** Einzelne, überprüfbare Fähigkeiten bilden die atomaren Ziele. Cluster bündeln sie zu größeren Themen oder Modulen.
- **Voraussetzungen (`requires`):** Ein Ziel verweist auf die Grundlagen, die es benötigt.
- **Zusammensetzung (`contains`):** Ein Thema verweist auf die Lernziele, die zu ihm gehören.

So entstehen mehrere mögliche Lernwege statt einer einzigen starren Reihenfolge. Formale Prüfungen sichern die Struktur ab, etwa gegen Zirkelbezüge. Die inhaltliche Qualitätssicherung prüft darüber hinaus, ob die Ziele fachlich richtig und ihre Voraussetzungen didaktisch sinnvoll sind (Abschnitt 5.1). Die [Graph-Definition](https://enpasos.github.io/skillpilot/concept/skill-graph/graph-definition/) erläutert das formale Modell; Änderungen werden versioniert und geprüft (Abschnitt 6).

#### Fachübergreifende Voraussetzungen: Mathematik und Physik

**Die Lernlandkarte verbindet bereits Mathematik und Physik durch konkrete `requires`-Verknüpfungen.** So setzt „Bewegungen mit Weg-Zeit-Diagrammen beschreiben“ unter anderem „Achsen, Skalen und Einheiten lesen“ voraus. Das weiterführende Physikziel „Bewegungen mit Diagrammen untersuchen“ baut unter anderem auf „Mittlere Änderungsrate berechnen und deuten“ auf.

Die mathematischen Grundlagen behalten ihre eigenen Lernziel-IDs und den bereits gespeicherten Lernstand. SkillPilot kann diesen Stand dadurch auch beim Lernen in Physik berücksichtigen. Welche Ziele zur persönlichen Auswahl gehören und welche nur als Voraussetzung dienen, wird ausdrücklich festgelegt.

#### Vier Ebenen der Personalisierung

Aus der gemeinsamen Lernlandkarte wird ein persönlicher Lernweg. SkillPilot unterscheidet dabei den dauerhaften Umfang, den aktuellen Arbeitsschritt und den bereits erreichten Fortschritt:

1. **Basis-Curriculum (Level 1):** Das gewählte Grundcurriculum, etwa „Gymnasium (DE)“, stellt die verfügbaren Lernziele bereit.
2. **Persönliches Curriculum (Level 2):** Bundesland, Schulstufe, Fächer und gegebenenfalls Dauer- und Kursmodell bestimmen den persönlichen Lernumfang. Diese Auswahl wird in der SkillPilot-Weboberfläche festgelegt, nicht im Coach-Chat.
3. **Lernfokus und aktives Ziel (Level 3):** Ein vorübergehend gewählter Ausschnitt und genau ein aktuelles Lernziel steuern die laufende Arbeit. Der Coach nutzt dafür die vom Backend angebotenen Optionen. Eine Fokusausweitung benötigt Zustimmung; innerhalb einer bestätigten Plan- oder Autopilotführung kann das nächste zulässige Ziel automatisch gewählt werden.
4. **Lernstand / Mastery (Level 4):** Fortschritt wird an stabilen Lernziel-IDs gespeichert und bleibt bei einem Wechsel von Ansicht oder Fokus erhalten.

Eine fachlich definierte **Kompositionssicht** ordnet die gemeinsamen Ziele für den gewählten Bildungskontext an. Sie unterscheidet **eigene Lernziele (`target`)** von **reinen Voraussetzungen (`prerequisiteOnly`)**. Nur eigene Lernziele zählen zum sichtbaren Lernbaum, zur Zielauswahl, zum Fortschritt und zum Abschluss dieses Umfangs. Reine Voraussetzungen behalten ihren gespeicherten Lernstand für die Voraussetzungsprüfung.

So können Sek-I-Grundlagen in einer Sek-II-Sicht oder mathematische Grundlagen beim Lernen in Physik berücksichtigt werden, wenn diese Rolle dort ausdrücklich modelliert ist. Ihre Aufnahme als eigene Lernziele erfordert einen entsprechend gewählten persönlichen Umfang. Weder ein Stufenwechsel noch eine fachübergreifende Verknüpfung bescheinigt ihre Beherrschung.

#### Frontier: Welche Ziele jetzt erreichbar sind

Das Backend berechnet aus Umfang und Lernstand die **Frontier**: noch nicht beherrschte Ziele, deren wirksame Voraussetzungen erfüllt sind. Auch ausdrücklich als `prerequisiteOnly` modellierte Grundlagen außerhalb des sichtbaren Lernumfangs zählen bei dieser Prüfung. Der optionale **Strict Mode** prüft Voraussetzungen darüber hinaus global.

Diese Auswahl gibt dem Coach den Rahmen für den nächsten Lernschritt. Sie beschreibt den dokumentierten Stand und ist keine psychologische Diagnose des individuellen Lernpotenzials.

### Im Dialog lernen und Fortschritt festhalten {#sec:dialogue-and-progress}

**Selbst denken. Hilfe bekommen. Selbst erklären.**

::figure{#fig:learning-moment}

Der Aha-Moment gehört der lernenden Person.

Der **SkillPilot-Lerncoach** macht aus dem gewählten Ziel eine konkrete Lernaufgabe. Er erklärt, gibt Hinweise, fragt nach und bespricht Lösungswege. Dabei erhält er den aktuellen Lernumfang, die Frontier und die erlaubten Übergänge vom Backend. Die **eigene Denkarbeit bleibt bei den Lernenden**: etwa eine Aufgabe mit Papier und Stift lösen, den Lösungsweg fotografieren und anschließend die Rückmeldung besprechen. Die KI soll notwendige Anstrengung wirksam unterstützen, nicht ersetzen.

#### Verstehen sichtbar machen

Bei fachlichen Verständniszielen fragt der Coach nach Begründungen und Erklärungen in eigenen Worten, statt nur richtige Endergebnisse abzufragen. Diese Anlehnung an sokratische Gesprächsführung und die **Feynman-Technik** soll Lücken im Verständnis erkennbar machen und gezieltes Weiterüben ermöglichen. Sie ist ein didaktischer Ansatz, kein Wirksamkeitsnachweis für das Gesamtsystem. Für Orientierungsknoten gilt diese Wissensprüfung ausdrücklich nicht.

#### Mastery: Erreichten Fortschritt festhalten

Eine bearbeitete Aufgabe liefert Hinweise darauf, ob ein Lernziel verstanden wurde. Bei gewöhnlichen Lernzielen trifft der Coach anhand der geltenden Evidenzregeln eine Abschlussentscheidung; SkillPilot prüft und speichert die zulässige Zustandsänderung. Das Cockpit zeigt den gespeicherten Stand, der bei der Auswahl weiterer Lernziele berücksichtigt wird.

Dieser Lernzustand heißt **Mastery**. Pro Lernziel gibt es genau eine Ergebnisentscheidung: geschafft oder noch nicht geschafft. Das gilt auch für Prüfungslernziele; ein bestandenes Ziel braucht keinen weiteren Qualifikationsnachweis. Prozentangaben für größere Themen fassen die geschafften Einzelziele gewichtet zusammen und sind keine Teilnoten einzelner Ziele. Orientierung und Memorieren haben eigene Abschlussregeln (Abschnitt 3.3).

Der gespeicherte Lernzustand bleibt von vollständigen Dialogen und zusätzlichen Artefakten getrennt. Institutionen können außerhalb dieses Lernzielzustands eigene Nachweise verlangen; daraus entsteht in SkillPilot kein zweiter Ergebnisstatus pro Lernziel.

#### Kurze Wege für Feedback

Eine Erklärung passt nicht, eine Aufgabe ist unklar oder der Coach verhält sich anders als erwartet? **Bei unterstützten fachlichen Lernzielen lässt sich direkt im Cockpit Feedback geben; das aktuelle Ziel ist dort bereits zugeordnet.** Die Rückmeldung wird bei der nächsten Überarbeitung kritisch geprüft und für passende Korrekturen berücksichtigt. So gelangen Erfahrungen aus dem Lernen unmittelbar an die Stelle, an der Inhalte und Lernbegleitung verbessert werden. Dafür muss niemand Curriculum Champion sein. Bitte das konkrete Problem beschreiben, ohne private Angaben oder den vollständigen Lernchat mitzuschicken.

#### Lerngeschwindigkeit (Learning Velocity)

Learning Velocity zeigt, wie viele **atomare Ziele** pro Woche neu als gemeistert gelten. Das ist ein Verlaufsindikator, kein Intelligenzmaß und keine feste Eigenschaft eines Kindes; Lernziele können zudem unterschiedlich aufwendig sein. Wenn nach einer längeren Anlaufphase neue Fähigkeiten sichtbar werden, können weitere Schritte freigeschaltet werden. **Der dokumentierte Lernstand bestimmt den nächsten Schritt – er ist kein Urteil über das Potenzial eines Kindes.** Eine frühere Geschwindigkeit begrenzt das weitere Lernen nicht.

### Verstehen, Memorieren und selbstständig Anwenden {#sec:learning-modes}

Der Weg zum Lernziel hängt davon ab, was gelernt werden soll. SkillPilot verbindet dafür unterschiedliche Lernformen:

- **Verstehen:** Der Coach erklärt Konzepte, begleitet eigene Lösungsversuche und fragt nach Begründungen.
- **Sich merken:** Vokabeln, Notation oder ausgewählte Formeln werden bei Bedarf gezielt wiederholt.
- **Selbstständig Anwenden:** Übungs- und Prüfungsaufgaben verlangen eine eigenständige Bearbeitung, etwa auf Papier mit anschließendem Foto-Upload. Der Coach bespricht und bewertet Lösungen nach den jeweiligen Aufgabenvorgaben.

In einem Kontext wie „Mathematik, Jahrgangsstufe 7“ oder „Leistungskurs Physik, Hessen, Abiturvorbereitung“ verbinden **modellierte Lernrouten** diese Lernformen. Eine mögliche Route führt von Orientierung über angeleitetes Verstehen zur selbstständigen Anwendung. Notwendiges Memorieren kann parallel laufen. Die Voraussetzungen und der aktuelle Lernstand bestimmen den nächsten zulässigen Schritt; es gibt keinen starren Vier-Schritte-Ablauf. Ein schematisches Beispiel zeigt der Anhang.

**Orientierung** macht den Sinn eines Themas und seine konkreten Möglichkeiten erfahrbar. Sie lädt zur persönlichen Auseinandersetzung ein und prüft kein Fachwissen. Die bloße Auswahl eines vorgeschlagenen Interesses startet zunächst die dazu passende Vertiefung. Der vorhandene Mastery-Zustand bedeutet bei diesem Zieltyp abgeschlossene Orientierung, keine fachliche Beherrschung; ein zusätzlicher Abschlussmarker wird nicht gespeichert.

Für notwendige Merkinhalte ergänzt **Spaced Repetition** die Arbeit mit Erklärungen und Aufgaben: Das Karteikartensystem (SRS) plant, wann Karten wiederholt werden, während der Skill-Graph die nächsten Lernziele bestimmt. Gewöhnliches Karteikartenüben verändert nur den Wiederholungsplan. Die Beherrschung eines Memorierziels wird aus dem serverseitigen Kartenstatus und dem gesonderten **Verified Recall**, einem Abruf ohne Hilfen, abgeleitet. Diese Trennung bleibt auch im Cockpit sichtbar.

**Übungs- und Prüfungsknoten** führen zur eigenständigen Anwendung. In Mathematik Sek I sind Jahrgangsprüfungen unter „Prüfungen Jahrgangsstufe …“ eingeordnet; in Sek II kommen passende Klausur- und Abituraufgaben hinzu. Ihr Prüfstand gehört zur jeweiligen Curriculum-QS. Weitere Aufgabenformate, etwa für Programmieren, Schreiben oder Sprechen, bleiben ausbaubar.

### Vom Lehrplan zum Lernalltag: Lernplan und geführter Coach {#sec:learning-plan}

**Dein Fortschritt bleibt zusammen.**

::figure{#fig:learning-core}

Der Coach erklärt im Gespräch; SkillPilot hält Curriculum, bestätigten Lernfortschritt und Planung zusammen. Gespeichert wird der Lernzustand, nicht das Gespräch.

Ein navigierbarer Lehrplan beantwortet noch nicht die Alltagsfrage: **„Was muss ich heute oder diese Woche lernen, und wie weit bin ich schon?“** Ein Lernplan verbindet erreichten Lernstand, noch offene Ziele und verbleibende Zeit. Er macht Abweichungen vom vorgesehenen Tempo sichtbar und bietet Anlass, mehr Lernzeit, zusätzliche Unterstützung oder einen anderen Rhythmus zu vereinbaren. Individuelles Lernen bedeutet damit nicht Lernen ohne zeitliche Verbindlichkeit. **Der Plan leitet, aber er darf Lernen nicht verhindern.**

#### Die Lehrkraft plant den Rahmen

Das **Persönliche Curriculum** bestimmt, welche Kompetenzen zum gewählten Bildungskontext gehören. Der **Lernplan** legt fest, welche Themen oder Lernzielgruppen in welchen Zeiträumen bearbeitet werden sollen. Er ergänzt den Skill-Graphen, ersetzt aber weder seine Lernziele noch deren Voraussetzungen. Soll der gesamte Lehrplan durchlaufen werden, muss die Planung dessen vorgesehenen Umfang abdecken; ein abgeschlossener Teilplan ist nicht automatisch ein abgeschlossener Lehrplan.

Unter **„Kurse planen“** werden Lernabschnitte, Zeiträume, Puffer und Termine vorbereitet. Fachpläne, etwa für Mathematik und Physik, gelten **gemeinsam**, werden aber **je Fach** ausgewertet: Jedes Fach hat sein eigenes Tages- oder Wochenziel, und Vorarbeit in einem Fach gleicht keinen Rückstand in einem anderen aus. Der Wechsel des aktuellen Fachs schaltet keinen anderen Fachplan ab und schreibt keine Reihenfolge „erst Mathe vollständig, dann Physik“ vor. Mehrere Pläne desselben Fachs werden zusammengeführt; überschneidende Abschnitte zählen dasselbe Lernziel nicht doppelt. Die zeitliche Auflösung wählt die lernende Person in der Lernkonfiguration des persönlichen Curriculums im Cockpit.

Die **Schülervorschau** zeigt vor der Übernahme das Tages- oder Wochenziel je Fach und einen Ausblick auf die nächsten sieben Kalendertage; im Wochenmodus werden die Angaben nach Kalenderwochen zusammengefasst. Sie verwendet dieselbe Berechnung wie Cockpit und Chat. Grundlage der Terminverteilung ist eine Werktagsplanung von Montag bis Freitag. Lernzielzahlen bezeichnen den Umfang des Pensums, keine Lernminuten. Die Lehrkraft prüft Umfang und Belastung und passt bei Bedarf die Planung an.

Entwürfe bleiben zunächst auf dem Planungsgerät. Erst die ausdrückliche gemeinsame Bestätigung macht sie beim Schüler wirksam; spätere Entwurfsänderungen wirken nicht ungeprüft in laufendes Lernen hinein. **Unterrichtsabdeckung ist nicht Schüler-Mastery:** Die Dokumentation „im Unterricht behandelt“ bescheinigt noch keine individuelle Beherrschung.

#### Tages- und Wochenauflösung

Lernende wählen zwischen **1 Tag** und **1 Woche**. Diese Einstellung gilt gemeinsam für Cockpit, Chat, lernendenbezogene Planung und die Auswahl des nächsten Planziels:

- **Tagesauflösung:** Das Pensum bezieht sich auf den aktuellen Kalendertag.
- **Wochenauflösung:** Das Pensum umfasst die laufende Kalenderwoche von Montag bis Sonntag. Lernende können es zu Wochenbeginn, am Wochenende oder verteilt erfüllen. Vergangene Tage innerhalb derselben Woche erzeugen keinen zusätzlichen Rückstand.

Die Auswahl wird für die SkillPilot-ID gespeichert; ohne eigene Auswahl gilt die Wochenauflösung. Ein Wechsel verändert den zeitlichen Bezug der Auswertung, während Plantermine und erreichter Lernfortschritt erhalten bleiben.

#### Planstand im Cockpit: Pensum, Gesamtfortschritt und Plansaldo

Im Plan-Modus zeigt das Cockpit für jedes Fach **zwei Scheiben mit Nadeln**. Sie verbinden drei unterschiedliche Aussagen: das aktuelle Pensum, den Gesamtfortschritt und den Vorsprung oder Rückstand gegenüber dem Plan.

::figure{#fig:learning-plan-cockpit}

- **Aktuelles Pensum – „Heute“ oder „Diese Woche“:** Die linke Scheibe zeigt den erfüllten Anteil als „x von y“. Bereits geleistete Vorarbeit wird angerechnet; die Anzeige zählt deshalb nicht nur neu abgeschlossene Ziele dieser Periode.
- **Gesamtfortschritt – „Gesamt: x von y“:** Die Zahl über der rechten Scheibe zählt alle erreichten atomaren Ziele des aktuellen persönlichen Curriculums in diesem Fach, auch Abschlüsse vor Beginn des Lernplans. Jedes Ziel zählt einmal.
- **Plansaldo – Rückstand, im Plan oder vorgearbeitet:** Die rechte Nadel und der Text darunter zeigen den Stand gegenüber dem Fachplan. Vorarbeit wird innerhalb desselben Fachs berücksichtigt.

**Ein erfülltes Tages- oder Wochenpensum kann mit älterem Rückstand zusammenfallen.** Umgekehrt erzeugt ein aktuell noch offenes Pensum allein keinen zusätzlichen Rückstand. Die Fachbilanzen bleiben getrennt. Das aktive Lernziel, angebotene Fachwechsel und aufklappbare **„Plandetails“** ergänzen die Übersicht. Cockpit und Coach verwenden dieselben von SkillPilot berechneten Werte.

#### Der Schüler lernt im Chat

Bei aktivem Planmodus und gültiger Lernsession hält SkillPilot die Organisation im Hintergrund:

1. **Orientieren:** Der Coach übernimmt den von SkillPilot formulierten Planstand wörtlich: je Fach das Tages- oder Wochenziel und gegebenenfalls Rückstand oder Vorarbeit. Das Cockpit zeigt den Plansaldo in kurzer Form an der Scheibe; der Coach rechnet nicht selbst. Das aktive Lernziel kündigt er getrennt davon einmal zu Beginn der Lernaufgabe an.
2. **Automatisch anknüpfen:** Ein gültiges laufendes Ziel wird fortgesetzt; andernfalls wird bei noch offenem Tages- oder Wochenpensum ein fälliges, nach den Voraussetzungen lernbares Ziel gewählt, sofern eines verfügbar ist. Die gemeinsame Aktivierung kann dieses erste Ziel bereits auswählen. Es ist kein zusätzlicher Klick auf „Weiterlernen“ oder eine manuelle Zielsuche nötig.
3. **Lernen und Fortschritt prüfen:** Der Coach erklärt, stellt Aufgaben und begleitet die Bearbeitung. Erst nach den geltenden Evidenzregeln gespeicherter Fortschritt verändert den Lernstand und damit den Planstand. Danach führt der plan-geführte Ablauf zum nächsten zulässigen Schritt.
4. **Fach wechseln oder abschließen:** Ein Wunsch wie „Jetzt Physik“ wechselt innerhalb der verfügbaren Fachoptionen; die übrigen Anforderungen bleiben bestehen. Sind die Periodenziele erreicht, würdigt der Coach das und startet kein weiteres Ziel von sich aus. Ein erreichtes Tages- oder Wochenziel heißt nicht, dass kein Rückstand mehr besteht: Dann lädt der Coach ohne Druck zum Aufholen ein. Weiterlernen bleibt auf Wunsch jederzeit möglich; künftige Ziele werden nicht automatisch zu zusätzlicher Pflicht für die laufende Periode. Nicht auswertbare Pläne nennt der Planstand ausdrücklich, statt sie als erledigt darzustellen.

Eine reine Statusfrage startet keine neue Aufgabe; eine gewünschte Pause bleibt eine Pause. Sind offene Ziele wegen Voraussetzungen oder ungültiger Planung nicht erreichbar, meldet der Coach die Blockade statt ein erfülltes Tages- oder Wochenpensum oder eine Ersatzpflicht zu erfinden. Planungskorrekturen bleiben auf der Planungsseite. Nach Ablauf der Lernsession ist weiterhin ein neuer Start über SkillPilot erforderlich; die Chatführung verlängert die Session nicht.

#### Beispiel: Mathematik und Physik an einem Tag

Ein **illustratives Tagesbeispiel**, keine Live-Daten: In Mathematik sind bis heute 13 Planziele vorgesehen und 9 fortschrittswirksame Planziele erreicht, in Physik 10 vorgesehen und 11 erreicht. Für den **Plansaldo** zählen auch später vorgesehene Planziele, aber keine Ziele, die schon bei Planerstellung beherrscht wurden. Die Zahl „Gesamt: x von y“ im Cockpit verwendet dagegen alle aktuellen atomaren Ziele des persönlichen Curriculums und schließt frühere Abschlüsse ein.

:::table{cols="3.6cm,3.6cm,X"}
| Fach | Tagespensum | Zusätzlicher Planstand |
|---|---|---|
| Mathematik | 1 von 3 | 2 Lernziele im Rückstand |
| Physik | 2 von 2 | 1 Lernziel vorgearbeitet |
:::

Die zwei heute noch offenen Mathe-Ziele und der zusätzliche Rückstand werden getrennt ausgewiesen. Physik-Vorarbeit gleicht den Mathe-Rückstand **nicht** aus. „Vorgearbeitet“ beschreibt den Umfang des Fortschritts, nicht die Beherrschung aller früher eingeplanten Inhalte; offene frühere Ziele bleiben für die Zielauswahl bestehen.

Auf Wochenbasis wird dieselbe Regel für das Soll bis zum Ende der laufenden Woche, das Wochenpensum und die Abschlüsse dieser Woche angewendet; die Zahlen können deshalb anders ausfallen. Das aktive Ziel nennt der Coach unabhängig vom Planstand: **„Dein aktives Lernziel: …“**. Ein erfülltes Tages- oder Wochenpensum verhindert das Weiterlernen nicht.

Damit wird der Lehrplan zu einem begleiteten Lernweg: **Die Lehrkraft verantwortet Umfang und Zeitrahmen, SkillPilot berechnet die nächsten zulässigen Schritte, der Coach führt den Dialog und der Schüler konzentriert sich auf das Lernen.**

---
