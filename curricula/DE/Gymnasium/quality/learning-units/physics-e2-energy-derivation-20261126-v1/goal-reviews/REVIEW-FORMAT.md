# Aktuelle Inhaltsprüfung für Task N

Die tatsächlichen Antworten bleiben unverändert erhalten. Der Metadatenhelfer verbindet ihre Aussagen erst anschließend mechanisch mit den nativen D-/P-/A-/M-Verträgen. Kein Helfer erzeugt ein fachliches Urteil. Eine geänderte Eingabe braucht eine ausdrücklich begrenzte aktuelle Bestätigung; alte Antworten bleiben Historie.

`whole-review-inputs.v1.json` ist ein früher vollständiger fachlicher Textkontext: fünf curriculare Ziele, 116 verschiedene weitere Voraussetzungsziele, vier unveränderte frühere P-Körper und ein neuer P-Kandidat sowie zehn zweisprachige Kartenvarianten. Bild und K3 waren beim ersten Stand noch nicht vorhanden; Kartenformat und neuer P-Körper haben danach eigene Nachfolger. Diese v1 ist keine endgültige Freigabeeingabe. Maßgeblich für die wissenschaftlichen P-Körper ist jetzt `positive-evidence.candidates.v2.json`.

Der Reviewer liest die benannten aktuellen Dateien und bindet seine Antwort an deren tatsächliche SHA-256-Werte. Er darf keine andere Reviewerantwort lesen. Eigene Autorenschaft wird offengelegt; ein selbst verfasster neuer P-Körper erhält kein eigenes unabhängiges Zustimmungsurteil. Neue Bilder müssen in Originalgröße und bei 360 px betrachtet werden; Dateihashes oder Alt-Text ersetzen die Ansicht nicht.

Die Antwort ist JSON mit diesen Feldern:

- `reviewer`, `startedAt`, `completedAt`, `independenceDisclosure`, `inputBindings` (je `path`, `sha256`). Modellname nur, soweit tatsächlich bekannt; keine erfundenen Sitzungshashes.
- `descriptionReviews`: je Ziel `goalId`, `decision` (`keep`, `revise`, `split_review`, `block`), `proposedDescriptionDe` und `proposedDescriptionEn` (bei keep null), `understandingEvidence` mit `essentialUnderstandingDe/En`, `observablePerformanceDe/En`, `transferExpectationDe/En`, `rationale`, `evidenceProfileContract` (`positive-understanding-evidence-v2`), `evidenceProfileRecommendation` (`none`, `create`, `revise`).
- `profileReviews`: je Ziel `goalId`, `decision` (`keep`, `revise`, `block`), `reason`, `requiredChanges`. Die exakten Fälle und numerischen Ergebnisse selbst prüfen; Quelle, Gültigkeit, frische Variation, unabhängiger Transfer und Bilingualität beurteilen.
- `atomicityReviews`: je Ziel `goalId`, `semanticAtomic` (boolean oder null), `reason`, `independentlyAssessableFacets` (Liste), `suggestedSplit` (Liste).
- `semanticKindReviews`: je geprüftem Objekt `goalId`, `semanticKind` (`curricularAtomic`, `curricularArea`, `practiceAssessment`), `reason`. Die geänderten Eltern bleiben strukturelle curriculare Bereiche; eine Aufgabe ist kein neues Verständnisziel.
- `prerequisiteReviews`: je Ziel `goalId`, `decision` (`accept_current`, `needs_change`, `unresolved`), `reason`, `unnecessaryCurrentRequires` und `missingRequires` (Listen). Ganzen mitgelieferten Abschluss prüfen, Lehrreihenfolge und echten Bedarf auseinanderhalten.
- `memoryGoalReviews`: je curricularem Ziel `goalId`, `decision` (`accept_current`, `needs_change`, `unresolved`), `reason`, `requiredChanges`; vorhandenes M-Urteil oder neuen kompakten Abrufkern beurteilen. Karten üben und verifizieren kein selbstständiges Herleiten.
- `cardReviews`: je Karten-ID `cardId`, `decision` (`accept_current`, `needs_change`, `unresolved`), `scientificCorrectness`, `languageEquivalence`, `originFit`, `promptAnswerFit`, `recallBoundary`, `requiredChanges`. Beide exakten Sprachvarianten prüfen.
- `assessmentReviews`: soweit unabhängig geprüft `goalId`, `decision`, `reason`, `requiredChanges`, konkrete numerische beziehungsweise symbolische Kontrollen. Für K3 kommen getrennte blinde Markierungen hinzu; dieses Inhaltsurteil ersetzt sie nicht. Für die bestehende Wagenaufgabe die unveränderten Aufgaben-, Lösungs- und Rubriktexte sowie den neuen direkten kinetischen Vorgänger zusammen beurteilen.
- `limitations`: tatsächlich ungeprüfte Aspekte und Autorenschaft benennen. Keine amtlichen Quellen, Bildansichten, ausgeführten Lernerprüfungen oder menschlichen Freigaben behaupten, die nicht vorliegen.

Amtlicher Quellenbeleg und tatsächliche Projektion werden gesondert gebunden. Eine ererbte Zuordnung ist kein selbstständiger amtlicher Vollbeleg. Native Prüfläufe sind automatisierte Kontrollen; Reviewerantworten sind Inhaltsprüfung; beides erzeugt keine Lernendenresultate.
