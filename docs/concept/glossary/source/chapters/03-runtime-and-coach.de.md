## Lernlaufzeit {#sec:learner-runtime}

### Personalisierungsstufen (`Levels of personalization`) {unnumbered=true}

*EN: Levels of personalization* — siehe [Levels of Personalization](repo:docs/concept/levels-of-personalization.md)

Die vierstufige Eingrenzung vom Curriculum bis zum individuellen Lernstand: **1** Basiscurriculum → **2** bestätigtes persönliches Curriculum → **3a** aktueller Fokus plus **3b** genau ein aktives atomares Lernziel → **4** globale Mastery. Katalognavigation wie Schule, Hochschule oder Sprachen liegt vor Level 1 und ist kein Lernumfang.

### Basiscurriculum (`Base curriculum`) {unnumbered=true}

*EN: Base curriculum* — siehe [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md)

Die vor Lernbeginn gewählte Skill-Landschaft; sie spannt das gesamte Zieluniversum für diese lernende Person auf.

### Persönliches Curriculum (`Personal curriculum`) {unnumbered=true}

*EN: Personal curriculum* — siehe [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md)

Der bestätigte, längerfristig gültige Ausschnitt des Basiscurriculums für eine lernende Person (Bundesland oder kanonische Sicht, Dauermodell, Schulstufe, Fächer und Kursprofile je Fach). Er bestimmt die lernendenseitige Kompositionssicht und bildet den Kandidatenraum für Fokus, Frontier, Fortschritt und Abschluss, während das Backend bei strikten Prüfungen weiterhin den Gesamtgraphen heranziehen kann.

Dieser Zustand gehört verbindlich dem Backend und wird ausschließlich über die SkillPilot-Weboberfläche bzw. das Cockpit bearbeitet – der Chat-Coach fragt ihn weder ab noch verändert er ihn.

### Personalisierung (`Personalization`) {unnumbered=true}

*EN: Personalization* — siehe [Verhaltensintegration des MCP-Lerncoaches](repo:docs/concept/runtime-workflows/openai-mcp-coach-behavioral-integration.md)

Die von der lernenden Person gesetzten Gültigkeitsentscheidungen wie Bundesland oder Kursprofil. Personalisierung wird niemals aus `contains` oder `requires` erraten. Auswählbare Optionen kommen stets als opake IDs aus dem aktuellsten Backendzustand. Kursprofile gelten je Fach, sodass Mathematik LK und Physik GK gleichzeitig geführt werden können.

### Lernumfang und Fokus (`Learning scope and focus`) {unnumbered=true}

*EN: Learning scope and focus* — siehe [Verhaltensintegration des MCP-Lerncoaches](repo:docs/concept/runtime-workflows/openai-mcp-coach-behavioral-integration.md)

Zwei Ebenen, die der Coach sauber trennen muss:

- **Lernumfang (*Learning scope*):** das bestätigte persönliche Curriculum dieser lernenden Person.
- **Fokus (*Level 3a*):** der aktuell ausgewählte Teilbaum oder Lernkorridor (`plannedGoals`), aus dem Frontier- und Zieloptionen stammen. Sobald das persönliche Curriculum vollständig festgelegt ist, bleibt der Fokus niemals leer: Ohne gültige explizite Auswahl greift deterministisch die oberste erste sichtbare Wurzel. Ein Jahrgang oder eine Phase kann den Fokus begrenzen, ohne selbst ein Lernziel zu sein.

Frontier und Zielempfehlungen werden erst angeboten, wenn Umfang und Fokus aufgelöst sind.

### Aktives Ziel (`Active goal`) {unnumbered=true}

*EN: Active goal* — siehe [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md)

Genau ein vom Backend bestätigtes atomares Lernziel (**Level 3b**), das aktuell in Oberfläche und Coach bearbeitet wird. Im Regelfall entstammt es der Frontier; bei einer Auswahl außerhalb der Frontier weist das System die fehlenden Voraussetzungen aus, statt sie stillschweigend zu übergehen.

### Frontier {unnumbered=true}

*EN: Frontier* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

Die Menge der noch nicht gemeisterten **atomaren** Lernziele, deren effektive Voraussetzungen sämtlich erfüllt sind – die didaktische Zone der nächsten Entwicklung, deterministisch aus dem Graphen berechnet statt durch die KI geschätzt.

### Erfüllung (`Satisfaction`) {unnumbered=true}

*EN: Satisfaction* — siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)

$\mathrm{Sat}(g)$ gilt genau dann, wenn die atomare Basis von $g$ nichtleer und vollständig gemeistert ist. Ein atomares Lernziel ist genau dann erfüllt, wenn es gemeistert ist; ein Cluster genau dann, wenn alle seine atomaren Nachfahren gemeistert sind.

### Optimistischer Modus (`Optimistic mode`) {unnumbered=true}

*EN: Optimistic mode* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Erst auf den gewählten Sichtumfang filtern (einschließlich expliziter `prerequisiteOnly`-Grundlagen), dann Voraussetzungen prüfen. Lernende können direkt im gewählten Umfang starten, ohne pauschal durch ältere Jahrgänge blockiert zu werden. Dies ist der Standardmodus.

### Strikter / pessimistischer Modus (`Strict mode`) {unnumbered=true}

*EN: Strict mode (pessimistic mode)* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Kandidaten stammen weiterhin aus dem gefilterten Umfang, Voraussetzungen werden jedoch global über den gesamten Graphen geprüft. Dient der gezielten Diagnose fehlender Grundlagen außerhalb des aktuellen Filters (`strictMode`).

### Fehlende Voraussetzungen (`Missing prerequisites`) {unnumbered=true}

*EN: Missing prerequisites* — siehe [Context & Views](repo:docs/concept/skill-graph/context-and-views.en.md)

Die noch unerfüllten effektiven Voraussetzungen eines Ziels, getrennt nach Lücken innerhalb und außerhalb des aktiven Filters – die präzise Antwort auf „Warum ist dieses Ziel noch gesperrt?“.

### Beherrschung (`Mastery`) {unnumbered=true}

*EN: Mastery* — siehe [Learning Workflow](repo:docs/concept/runtime-workflows/learning-workflow.md) und [Implizite Beherrschung](repo:docs/concept/skill-graph/assessment-gated-completion.md)

Das einzige gespeicherte Ergebnis für ein atomares Lernziel: **gemeistert oder noch nicht gemeistert** (kodierbar als `0` und `1`, ohne Zwischennoten oder zweite Qualifikationsstufe). Mastery hängt an stabilen Lernziel-IDs und gilt global über alle Kompositionssichten hinweg. Cluster- oder Fachfortschritt ist der gewichtete Anteil eindeutiger gemeisterter atomarer Ziele.

Das verbindliche Konzept vom 4. November 2026 ergänzt die **effektive Beherrschung** $M_{\mathrm{eff}} = M \cup I$: Dabei bezeichnet $I$ die abgeleitete Anerkennung gewöhnlicher Kompetenzen durch selbstständige Anwendung in gültigen lokalen Prüfungsverträgen. Prüfungs- und Memorierziele gelangen niemals nach $I$. Die Laufzeitanpassung an diesen erweiterten Vertrag steht noch aus.

### Curriculum-Zeitachse und Stoffverteilungsplan {unnumbered=true}

*EN: Curriculum timeline and pacing plan* — siehe [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

Ein versioniertes Ausführungsplan-Overlay, das aufgelöste Curriculum-Cluster konkreten lokalen Zeiträumen und Unterrichtskapazitäten einer Klasse oder lernenden Person zuordnet. Es verwaltet Kalender, Puffer, Planblöcke und Revisionen, schreibt aber niemals Termine in kanonische Ziele, Programmeinheiten, Platzierungen oder Kompositionssichten.

### Planungseinheit (`Planning unit`) {unnumbered=true}

*EN: Planning unit* — siehe [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

Eine planlokale Einheit zur Verteilung des erwarteten Lernfortschritts auf die verfügbare Zeitkapazität (transparenter Grundwert: eine Einheit je einplanbarem atomarem Ziel). Sie ist weder eine Note noch das kanonische `weight`; Vorwissen vor Planbeginn zählt nicht als neu gelernte Planungseinheit.

### Planmeilenstein (`Plan milestone`) {unnumbered=true}

*EN: Plan milestone* — siehe [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

Eine datierte Zielzusage wie „ausgewählte Mathematik-Abituraufgaben bis 15. März abschließen“. Sie trennt fachliche Art von Terminhärte sowie eingeplanten Arbeitsumfang von erreichtem Mastery-Abschluss, steuert datierte Zielliste, Prognose und Umplanung, vergibt aber selbst keine Mastery.

### Kurs-Planlage (`Course plan status snapshot`) {unnumbered=true}

*EN: Course plan status snapshot* — siehe [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)

Ein prüfsummengebundenes Stichtags-Lesemodell einer Planrevision mit textuellem Kursplan, geplantem Blockfortschritt, bestätigter Unterrichtsabdeckung und gesondert ausgewiesener Mastery-Verteilung samt Eingangsdatenqualität. Es erzeugt keine eigene Datenquelle neben Plan und Mastery.

### Lerngeschwindigkeit (`Learning velocity`) {unnumbered=true}

*EN: Learning velocity* — siehe [Learning Velocity](repo:docs/concept/didactic/learning-velocity.md)

Die beobachtete Rate abgeschlossener atomarer Lernziele pro Zeitraum. Das Cockpit-Diagramm zählt dokumentierte Abschlüsse je Kalenderwoche; ein gebundener Zeitplan vergleicht neu erreichte Planungseinheiten je effektiver Unterrichtswoche mit seiner Sollkurve. Beide Größen sind Verlaufsindikatoren, weder Noten noch Ranglisten.

### Autopilot {unnumbered=true}

*EN: Autopilot* — siehe [Frontier Goal Selection Strategies & Autopilot](repo:docs/concept/didactic/frontier-goal-selection-strategies-autopilot.md)

Ein optionaler Modus, der nach dem Meistern des aktiven Ziels automatisch das erste Ziel der gemäß Auswahlstrategie geordneten nächsten Schritte aktiviert.

### Auswahlpriorisierung (`Selection strategy`) {unnumbered=true}

*EN: Selection strategy* — siehe [Frontier Goal Selection Strategies & Autopilot](repo:docs/concept/didactic/frontier-goal-selection-strategies-autopilot.md)

Die Sortierregel über der berechneten Frontier: `Random` für Abwechslung über Themenbereiche hinweg, `Sequential` für ein lineares Vorgehen entlang der Curriculumstruktur. Gespeichert je Profil zusammen mit Autopilot und `strictMode`.

---

## Coach, Session und Identität {#sec:coach-session-identity}

### SkillPilot-ID {unnumbered=true}

*EN: SkillPilot ID* — siehe [Schnellstart](repo:docs/quickstart/story.de.md)

Der dauerhafte, pseudonyme Zugriffsschlüssel einer lernenden Person zu ihrem Lernprofil – ohne Registrierung mit Klarnamen oder E-Mail-Adresse. Die permanente SkillPilot-ID verbleibt strikt im Backend und erscheint niemals als Tool-Parameter, Tool-Ergebnis oder Chatinhalt.

### Lernsession (`Learning session`) {unnumbered=true}

*EN: Learning session* — siehe [OAuth-Appbindung und 24h-Lernsession](repo:docs/concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)

Ein opaker, zufällig erzeugter Schlüssel mit absoluter Gültigkeit von 24 Stunden, der genau den über **Lernen starten** bestätigten Lernkontext adressiert. Jeder Start erzeugt eine frische Session; der Adapter übergibt sie unverändert bei jedem lernendenbezogenen Werkzeugaufruf.

### OAuth-Appbindung (`OAuth app binding`) {unnumbered=true}

*EN: OAuth app binding* — siehe [OpenAI MCP Client Binding](repo:docs/security/openai-mcp-client-binding.md)

Die widerrufbare OAuth-Autorisierung, mit der sich die zugelassene Provider-Integration gegenüber dem Backend authentisiert. Sie weist die **Integration** aus, nicht die lernende Person: OAuth allein wählt kein Lernprofil aus und erzeugt keine Lernsession.

### SkillPilot Lerncoach {unnumbered=true}

*EN: SkillPilot Lerncoach* — siehe [Kommunikationsvertrag ChatClient/Backend](repo:docs/concept/runtime-workflows/provider-neutral-coach-boundary.md)

Die KI-seitige Dialogschicht, die den Backendzustand in ein Lerngespräch übersetzt. Der Coach führt das Gespräch; das Backend entscheidet verbindlich über Lernzustand, aktive Filter, zulässige Übergänge und erreichbare nächste Schritte.

### Cockpit {unnumbered=true}

*EN: Cockpit* — siehe [Schnellstart](repo:docs/quickstart/story.de.md)

Die SkillPilot-Weboberfläche für Lernlandkarte, Fortschritt, Lernplanstand und SRS-Karteikartentraining. Cockpit und Coach arbeiten auf demselben Backend-Lernzustand; den ungeholfenen Abruftest (*Verified Recall*) bewertet nicht das Cockpit, sondern der Coach-Ablauf.

### Sichere Zustandsprojektion (`Safe state projection`) {unnumbered=true}

*EN: Safe state projection* — siehe [Kommunikationsvertrag ChatClient/Backend](repo:docs/concept/runtime-workflows/provider-neutral-coach-boundary.md)

Der Grundsatz, dass ausschließlich eine explizit freigegebene, datensparsame Sicht des Lernzustands die Providergrenze überschreitet. Interne Identitäten, Geheimnisse und private Dateipfade werden vor jeder Übermittlung an Modell, Chat oder Widget entfernt.

### Providerneutrale Grenze (`Provider-neutral boundary`) {unnumbered=true}

*EN: Provider-neutral boundary* — siehe [Kommunikationsvertrag ChatClient/Backend](repo:docs/concept/runtime-workflows/provider-neutral-coach-boundary.md)

Die strikte Trennung zwischen gemeinsamem fachlichem SkillPilot-Kern und providerspezifischen Adaptern. Domänenregeln, Prüfungsautorisierung und Zustandsprojektion liegen im gemeinsamen Kern, sodass ein neuer oder geänderter KI-Anbieter niemals die Fachlogik aufspaltet.
