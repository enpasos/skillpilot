## Vertrauen: Lerndaten schützen und Nachweise einordnen {#sec:trust}

Wer seinen Lernweg einem digitalen System anvertraut, sollte wissen, welche Daten wohin gelangen — und was die gespeicherten Nachweise tatsächlich aussagen.

### Welche Daten wohin gelangen {#sec:data-flows}

Die im Lernablauf verwendeten Daten haben unterschiedliche Aufgaben und Schutzbedarfe. SkillPilot trennt die **dauerhafte pseudonyme Identität**, die **kurzlebige Lernsession**, die **Autorisierung der KI-Anbindung** und den **verbindlichen Lernzustand**. Der Chatdienst erhält den benötigten Lernkontext, nicht die dauerhafte SkillPilot-ID.

#### Pseudonym statt Identität

Lernstände werden unter einer dauerhaften **pseudonymen SkillPilot-ID** geführt. Dafür ist bei SkillPilot keine Registrierung mit Name oder E-Mail-Adresse erforderlich. Die ID ist zugleich ein geheimer Zugriffsschlüssel zum Lernprofil: Sie sollte als geschützte ID-Datei gesichert werden und gehört weder in Chats noch in öffentliche Rückmeldungen. Die Coach-Anbindung übermittelt sie nicht an den KI-Anbieter. Für den Chatdienst wird dessen eigenes Konto benötigt; seine Zugangsbedingungen gelten zusätzlich.

#### Eine eigene Session für den Lernchat

Beim Start des **SkillPilot-Lerncoachs** aus der SkillPilot-Weboberfläche wird eine neue zufällige `learningSessionId` mit einer absoluten Gültigkeit von 24 Stunden erzeugt. Sie verbindet den vorbereiteten Chat mit dem bestätigten Lernkontext, ohne die dauerhafte SkillPilot-ID offenzulegen. Die lernende Person muss keinen technischen Wert kopieren oder verwalten. Die Gültigkeit wird weder durch Nutzung noch durch eine OAuth-Aktualisierung verlängert. Die Session übernimmt die im bestätigten Kontext festgelegte Kommunikationssprache Deutsch oder Englisch. OAuth autorisiert die jeweilige Anbindung; die Lernsession bestimmt den Lernkontext.

Lernendenbezogene Zugriffe **über die Coach-Anbindung** erfordern sowohl die zugelassene und authentisierte Integration als auch eine gültige Lernsession. Die App-Autorisierung allein eröffnet keinen Lernstand; eine Lernsession allein berechtigt die App nicht zum Zugriff. Die SkillPilot-Weboberfläche besitzt davon getrennte Zugriffswege für Konfiguration, Navigation und Datenverwaltung.

#### Dialoginhalt ist entkoppelt

Der Lerncoach-Dialog bleibt beim jeweiligen KI-Anbieter. Antworten, Lösungswege und freie Bewertungsbegründungen werden über die Coach-Werkzeuge nicht an das SkillPilot-Backend übertragen. Für den Lernfortschritt verarbeitet SkillPilot strukturierte Abschlussentscheidungen und gegebenenfalls autorisierte Punktzahlen aus Prüfungen.

Umgekehrt erhält der Anbieter den benötigten Lernkontext, etwa das aktuelle Ziel, relevante Lernstände und Toolergebnisse. **Die Trennung der ID bedeutet nicht, dass keine Lerndaten zum KI-Anbieter gelangen.** Chat und Kontextverarbeitung unterliegen seinen Bedingungen. Ausdrücklich eingereichtes Lernziel-Feedback ist ein eigener Vorgang und kein automatischer Chat-Import.

**Empfehlung für Bildungsinstitutionen:** Klare Guidelines, welche Daten im Lerncoach-Chat nicht hineingehören (sensibles Privates) und wie Lernende sicher unterstützt werden.

#### Zuordnung in der Institution (lokal)

Die Zuordnung „Wer ist welches Pseudonym?“ liegt bei der Institution/Lehrkraft und wird **lokal** gespeichert (z.B. in geschützter Ablage) – nicht zentral.

#### Getrennte Zugänge für die KI-Anbieter

Claude und ChatGPT haben getrennte Adapter mit eigenen Authentisierungs- und Sessiongrenzen. Der jeweilige Anbieter verantwortet den Chatbetrieb und die Verarbeitung des Dialogs. Der gemeinsame SkillPilot-Kern bleibt für Curriculum, Lernstand und Lernregeln zuständig.

Die technische Anbindung allein belegt keine datenschutzrechtliche oder institutionelle Eignung. Jede Anbindung wird gesondert auf die Anforderungen an Werkzeugzugriff, Datenschutz, Sessiontrennung und zuverlässige Lernführung geprüft.

### Lernstände sichern: Integrität und Herkunftshinweise {#sec:integrity-and-provenance}

Lernende können ihr Profil einschließlich Lernstand und Lernplanung exportieren. Der Server schützt den Export mit **HMAC-SHA256** gegen Veränderungen und prüft diesen Schutz beim Import. Das ist ein serverseitig prüfbarer Integritätsschutz, keine mit einem öffentlichen Schlüssel unabhängig prüfbare Signatur.

Beim Import können vorhandene Quellenprofile und Übernahmezeitpunkte als **Hinweise auf die Herkunft** weitergeführt werden. Diese Informationen sind keine lückenlose Historie sämtlicher Bewertungen oder Zustandsänderungen und enthalten nicht die zugrunde liegenden Lerndialoge.

**Ein unveränderter Export beweist nicht, dass jede gespeicherte Bewertung fachlich richtig ist.** Er unterstützt Sicherung, Übernahme und Nachvollziehbarkeit; institutionelle Anerkennung benötigt eigene Regeln und gegebenenfalls zusätzliche Nachweise.

---
