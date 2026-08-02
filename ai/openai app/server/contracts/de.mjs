export const germanCatalog = Object.freeze({
  locale: "de",
  genericError: "Der SkillPilot-Lerncoach konnte die Aktion nicht ausführen.",
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
    evaluationRequestLabel: "Lösung jetzt bewerten lassen",
    feedbackTitle: "Auswertung",
    completeLabel: "Weiterlernen",
    emptyContext: "Der Lerncoach wurde noch nicht eingerichtet.",
    pendingMessage: "Bitte lade jetzt meine gerade im SkillPilot-Lerncoach eingereichte Lösung, bewerte sie fachlich und speichere die Bewertung.",
    selectedContext: "Die lernende Person hat {choice} ausgewählt. Der aktuelle Lernstand ist im SkillPilot-Backend gespeichert.",
    submittedContext: "Die lernende Person hat eine Lösung im SkillPilot-Widget eingereicht. Die vollständige Lösung ist serverseitig gespeichert und wartet auf die fachliche Bewertung.",
    gradingInstruction: "Bewerte fachlich korrekt und akzeptiere jeden mathematisch äquivalenten Lösungsweg. Maximal 2 Punkte.",
    practiceReady: "{course} ist gewählt. Die nächste Aufgabe ist bereit.",
    evaluationStored: "Bewertung gespeichert: {score} von {maxScore} Punkten."
  },
  preview: {
    initialRequest: "Ich möchte Mathematik in der Oberstufe in Hessen lernen.",
    resetLabel: "Prototyp zurücksetzen",
    correctFeedback: "Richtig. Aus 3(x − 2) = 15 folgt x − 2 = 5 und damit x = 7. Dein Lösungsweg darf selbstverständlich anders formuliert sein.",
    partialFeedback: "Dein Ansatz wurde berücksichtigt, aber x = 7 ist noch nicht eindeutig hergeleitet. Prüfe besonders das Teilen durch 3 und das anschließende Addieren von 2."
  }
});
