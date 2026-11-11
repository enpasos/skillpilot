## Die Arbeitsteilung: KI erklärt, SkillPilot führt den Lernstand {#sec:responsibilities}

**Der KI-Lerncoach begleitet den Dialog; SkillPilot verwaltet den Lernweg.** Beide übernehmen unterschiedliche Aufgaben und greifen dabei auf dieselben Lernziele zurück.

Sprachbasierte KI kann Begriffe erklären, Aufgaben formulieren, Lösungswege besprechen und auf Fragen in natürlicher Sprache eingehen. Im Lerndialog macht sie unterschiedliche Zugänge zu einem Thema möglich und passt Erklärungen an die Antworten der lernenden Person an.

Für verlässliche Lernführung braucht es daneben eine eindeutige Grundlage: Welche Ziele gehören zum Curriculum, welche Voraussetzungen sind erfüllt und welcher Fortschritt ist gespeichert? SkillPilot verwaltet diese Informationen und Regeln im Backend.

Über definierte Werkzeuge greift der Lerncoach auf diese **verbindlichen Backendregeln** zu. SkillPilot berechnet erreichbare Lernziele und den Planstand, prüft zulässige Zustandsänderungen und speichert bestätigten Fortschritt. Die fachliche Beurteilung im Dialog bleibt eine KI-Leistung und kann Fehler enthalten; die technische Zustandsprüfung ist kein unabhängiger Beweis für die Richtigkeit einer Lösung.

**Gemeinsame Vorarbeit, individuelle Lernbegleitung:** Die Skill-Landschaft wird vor ihrer Nutzung aufgebaut, nach festgelegten Qualitätsverfahren geprüft und fortlaufend gepflegt (Abschnitt 5.1). Besonders leistungsfähige KI-Systeme können bei der anspruchsvollen Erschließung der Lehrpläne helfen. Diese wiederverwendbare Arbeit kommt allen Lernenden zugute. Die KI für den späteren Lerndialog muss dafür nicht dieselbe sein; sie muss die fachlichen, didaktischen und technischen Anforderungen der Lernbegleitung erfüllen.

Die **Plugin- und Adapterarchitektur entkoppelt den fachlichen Kern vom konkreten KI-Anbieter**. Die Provideradapter stellen die Werkzeuge über das **Model Context Protocol (MCP)** bereit. Eine neue KI-Anbindung muss unter anderem Coach-Anweisungen laden, Werkzeuge zuverlässig aufrufen, Authentisierung und Lernsession sicher handhaben sowie die benötigten Bilder und Lernkarten darstellen können. MCP standardisiert den Werkzeugzugriff, garantiert diese Fähigkeiten aber nicht. Verbindliche Entscheidungen über Lernzustand, Berechtigungen und Navigation bleiben im gemeinsamen SkillPilot-Kern; jede konkrete Anbindung wird gesondert geprüft.

**Ziel ist die Wahlfreiheit unter geeigneten KI-Umgebungen.** Perspektivisch kann dazu auch eine lokal auf dem eigenen Gerät betriebene KI gehören, sofern die erforderlichen Fähigkeiten und eine geprüfte Anbindung vorhanden sind. Der heutige Claude-Zugang ist ein konkreter Einstieg, keine dauerhafte Festlegung der Architektur auf diesen Anbieter. Eine bereits verfügbare lokale Lerncoach-Anbindung wird damit nicht behauptet.

---
