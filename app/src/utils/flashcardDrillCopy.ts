import type { LabelLanguage } from './filterLabels'

export interface FlashcardDrillCopy {
    configError: string
    loading: string
    allCaughtUp: string
    noCardsForFilter: string
    new: string
    learn: string
    review: string
    master: string
    noneDue: string
    back: string
    sessionComplete: string
    reviewed: string
    continue: string
    readOnlyTitle: string
    readOnlyBody: string
    progress: string
    localData: string
    localDataTooltip: string
    sync: string
    syncing: string
    syncSuccess: string
    syncFailed: string
    box0Tooltip: string
    box1Tooltip: string
    box2Tooltip: string
    box3Tooltip: string
    speedMemorization: string
    progressTooltip: string
    readyForReview: string
    tapToFlip: string
    showAnswer: string
    again: string
    hard: string
    good: string
    easy: string
    againTooltip: string
    hardTooltip: string
    goodTooltip: string
    easyTooltip: string
}

export const getFlashcardDrillCopy = (language: LabelLanguage): FlashcardDrillCopy => (
    language === 'en'
        ? {
            configError: 'Configuration Error: Missing Vocabulary Source.',
            loading: 'Loading Data...',
            allCaughtUp: 'All Caught Up!',
            noCardsForFilter: 'No flashcards found for the current filter.',
            new: 'New',
            learn: 'Learn',
            review: 'Review',
            master: 'Master',
            noneDue: 'No cards due for review right now.',
            back: 'Back to Curriculum',
            sessionComplete: 'Session Complete!',
            reviewed: 'You reviewed {0} cards.',
            continue: 'Continue Learning',
            readOnlyTitle: 'Legacy View',
            readOnlyBody: 'Flashcard practice is disabled in this legacy view. Please move to Gymnasium (DE) to continue learning here.',
            progress: 'Your Progress',
            localData: 'Local Data',
            localDataTooltip: 'Saved in this browser.',
            sync: 'Save',
            syncing: 'Saving...',
            syncSuccess: 'Saved',
            syncFailed: 'Save failed',
            box0Tooltip: 'New cards. Start here.',
            box1Tooltip: 'Learning. Repeat < 3 days.',
            box2Tooltip: 'Consolidating. Repeat 3-10 days.',
            box3Tooltip: 'Mastered. Repeat > 10 days.',
            speedMemorization: 'Speed Memorization – Be honest with yourself!',
            progressTooltip: 'Session Progress: {0}/{1}',
            readyForReview: 'Cards for today: {0}. Doing 20 of them is great!',
            tapToFlip: 'Tap to flip',
            showAnswer: 'Show Answer',
            again: 'Again',
            hard: 'Hard',
            good: 'Good',
            easy: 'Easy',
            againTooltip: 'Did not know it. Review < 1 min.',
            hardTooltip: 'Correct but slow/unsure.',
            goodTooltip: 'Correct with some effort.',
            easyTooltip: 'Instant recall. Perfect.',
        }
        : {
            configError: 'Konfigurationsfehler: Fehlende Vokabelquelle.',
            loading: 'Lade Daten...',
            allCaughtUp: 'Alles erledigt!',
            noCardsForFilter: 'Keine Karteikarten für den aktuellen Filter gefunden.',
            new: 'Neu',
            learn: 'Lernen',
            review: 'Wdh.',
            master: 'Meister',
            noneDue: 'Derzeit keine Karten zur Wiederholung fällig.',
            back: 'Zurück zum Lehrplan',
            sessionComplete: 'Sitzung beendet!',
            reviewed: 'Du hast {0} Karten wiederholt.',
            continue: 'Weiterlernen',
            readOnlyTitle: 'Legacy-Ansicht',
            readOnlyBody: 'Der Karteikarten-Drill ist in dieser Legacy-Ansicht deaktiviert. Bitte auf Gymnasium (DE) umstellen, um hier weiterzulernen.',
            progress: 'Dein Fortschritt',
            localData: 'Lokale Daten',
            localDataTooltip: 'In diesem Browser gespeichert.',
            sync: 'Speichern',
            syncing: 'Speichere...',
            syncSuccess: 'Gespeichert',
            syncFailed: 'Speichern fehlgeschlagen',
            box0Tooltip: 'Neue Karten. Startpunkt.',
            box1Tooltip: 'Lernen. Wdh. < 3 Tage.',
            box2Tooltip: 'Festigen. Wdh. 3-10 Tage.',
            box3Tooltip: 'Gemeistert. Wdh. > 10 Tage.',
            speedMemorization: 'Speed Memorization – Sei ehrlich zu Dir selbst!',
            progressTooltip: 'Sitzungsfortschritt: {0}/{1}',
            readyForReview: 'Bereit für heute: {0}.',
            tapToFlip: 'Zum Umdrehen tippen',
            showAnswer: 'Antwort zeigen',
            again: 'Nochmal',
            hard: 'Schwer',
            good: 'Gut',
            easy: 'Einfach',
            againTooltip: 'Nicht gewusst. Wdh < 1 Min.',
            hardTooltip: 'Richtig, aber langsam/unsicher.',
            goodTooltip: 'Richtig mit etwas Muehe.',
            easyTooltip: 'Sofort gewusst. Perfekt.',
        }
)
