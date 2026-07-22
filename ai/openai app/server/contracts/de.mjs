export const germanContract = Object.freeze({
  locale: "de",
  appName: "SkillPilot Coach Deutsch",
  serverName: "skillpilot-coach-de",
  instructions:
    "Verwende ausschließlich die deutschen SkillPilot-Werkzeuge dieses Servers. Öffne den Lerncoach bei einer natürlichen Lernabsicht, ohne nach technischen IDs oder Tokens zu fragen. Wenn die sichtbare Widget-Nachricht um Bewertung einer eingereichten Lösung bittet, lade zuerst die ausstehende Lösung und speichere danach genau eine fachliche Bewertung. Akzeptiere mathematisch gleichwertige Lösungswege unabhängig vom Wortlaut. Lade nach einem neuen Turn oder bei unsicherem Gesprächskontext den aktuellen Lernstand frisch aus SkillPilot.",
  mcpPath: "/mcp/de",
  resourceName: "skillpilot-coach-de-widget",
  resourceUri: "ui://skillpilot-coach-de/coach.html",
  tools: {
    open: {
      name: "open_skillpilot_coach_de",
      title: "SkillPilot-Lerncoach öffnen",
      description:
        "Öffnet oder aktualisiert den deutschen SkillPilot-Lerncoach. Verwende dieses Tool, wenn die lernende Person mit SkillPilot lernen, ihren Lernpfad fortsetzen oder den aktuellen Lernstand sehen möchte. Eine natürliche Lernabsicht darf als learning_request übergeben werden.",
      invoking: "Lernpfad wird geladen…",
      invoked: "Lernpfad ist bereit"
    },
    choose: {
      name: "choose_skillpilot_path_de",
      title: "Lernpfad auswählen",
      description:
        "Wendet eine im SkillPilot-Widget ausgewählte fachliche Option an. Dieses Tool ist ausschließlich für direkte Aufrufe aus der App vorgesehen.",
      invoking: "Auswahl wird übernommen…",
      invoked: "Auswahl wurde übernommen"
    },
    submit: {
      name: "submit_skillpilot_answer_de",
      title: "Lösung einreichen",
      description:
        "Speichert die im SkillPilot-Widget eingegebene Lösung. Dieses Tool ist ausschließlich für direkte Aufrufe aus der App vorgesehen.",
      invoking: "Lösung wird gespeichert…",
      invoked: "Lösung wurde gespeichert"
    },
    pending: {
      name: "get_pending_skillpilot_answer_de",
      title: "Eingereichte Lösung laden",
      description:
        "Lädt die aktuell eingereichte, noch nicht bewertete Lernlösung aus dem deutschen SkillPilot-Coach. Rufe dieses Tool vor der Bewertung auf; es benötigt keine technische Sitzungskennung.",
      invoking: "Lösung wird geladen…",
      invoked: "Lösung wurde geladen"
    },
    evaluate: {
      name: "record_skillpilot_evaluation_de",
      title: "Lernlösung bewerten",
      description:
        "Speichert die fachliche Bewertung der zuvor geladenen SkillPilot-Lösung. Bewerte mathematisch äquivalente Lösungswege nach ihrer fachlichen Richtigkeit und nicht nach Wortlautgleichheit mit einer Musterlösung.",
      invoking: "Bewertung wird gespeichert…",
      invoked: "Bewertung wurde gespeichert"
    },
    context: {
      name: "get_skillpilot_context_de",
      title: "Aktuellen Lernstand laden",
      description:
        "Lädt den aktuellen deutschen SkillPilot-Lernstand frisch aus dem persistenten Zustand. Verwende dieses Tool nach einem neuen User-Turn oder bei unsicherem Gesprächskontext; es benötigt keine im Chat sichtbare Sitzungskennung.",
      invoking: "Lernstand wird geladen…",
      invoked: "Lernstand wurde geladen"
    }
  },
  copy: {
    scopeTitle: "Dein Lernweg",
    scopeSummary: "Für Mathematik in der gymnasialen Oberstufe in Hessen fehlt nur noch die Kurswahl.",
    scopePrompt: "Welchen Kurs besuchst du?",
    choices: [
      { code: "basic", label: "Grundkurs", detail: "Grundlegendes Anforderungsniveau" },
      { code: "advanced", label: "Leistungskurs", detail: "Erhöhtes Anforderungsniveau" }
    ],
    practiceTitle: "Dein nächster Lernschritt",
    practiceSummary: "Lineare Gleichungen sicher lösen",
    practicePrompt: "Löse die Gleichung 3(x − 2) = 15 und beschreibe kurz deinen Rechenweg.",
    answerLabel: "Deine Lösung",
    answerPlaceholder: "Zum Beispiel: Ich teile zuerst …",
    submitLabel: "Lösung einreichen",
    awaitingTitle: "Lösung eingereicht",
    awaitingSummary: "Deine Lösung ist sicher gespeichert und wartet auf die fachliche Bewertung.",
    feedbackTitle: "Auswertung",
    completeLabel: "Weiterlernen",
    emptyContext: "Der Lerncoach wurde noch nicht eingerichtet.",
    pendingMessage: "Bitte bewerte jetzt meine gerade im SkillPilot-Lerncoach eingereichte Lösung.",
    selectedContext: "Die lernende Person hat {choice} ausgewählt. Der aktuelle Lernstand ist im SkillPilot-Backend gespeichert.",
    submittedContext: "Die lernende Person hat eine Lösung im SkillPilot-Widget eingereicht. Die vollständige Lösung ist serverseitig gespeichert und wartet auf die fachliche Bewertung."
  }
});
