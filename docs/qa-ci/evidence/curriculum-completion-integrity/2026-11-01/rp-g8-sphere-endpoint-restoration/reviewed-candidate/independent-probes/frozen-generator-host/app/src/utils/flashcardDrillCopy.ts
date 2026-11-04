import type { LabelLanguage } from './filterLabels'

export interface FlashcardDrillCopy {
    configError: string
    loading: string
    allCaughtUp: string
    practiceCaughtUp: string
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
    verifiedProgress: string
    verifiedProgressTooltip: string
    practiceStatus: string
    verificationStatus: string
    dueCards: string
    verifiedCards: string
    eligibleCards: string
    blockedTodayCards: string
    verificationComplete: string
    verificationWaiting: string
    modeLabel: string
    practiceMode: string
    verificationMode: string
    startVerification: string
    readyForReview: string
    tapToFlip: string
    showAnswer: string
    previousCard: string
    nextCard: string
    cardPosition: (current: number, total: number) => string
    notKnown: string
    known: string
    notKnownTooltip: string
    knownTooltip: string
    ratingSaved: string
}

export type FlashcardPracticeRating = 'not_known' | 'known'

export const FLASHCARD_PRACTICE_QUALITY: Readonly<Record<FlashcardPracticeRating, 1 | 4>> = {
    not_known: 1,
    known: 4,
}

export const getAdjacentFlashcardIndex = (
    currentIndex: number,
    cardCount: number,
    direction: -1 | 1,
): number => {
    if (cardCount <= 0) return 0
    return Math.min(cardCount - 1, Math.max(0, currentIndex + direction))
}

export const getFlashcardDrillCopy = (language: LabelLanguage): FlashcardDrillCopy => (
    language === 'en'
        ? {
            configError: 'Configuration Error: Missing Vocabulary Source.',
            loading: 'Loading Data...',
            allCaughtUp: 'All Caught Up!',
            practiceCaughtUp: 'Practice caught up',
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
            verifiedProgress: 'Verified: {0}/{1}',
            verifiedProgressTooltip: 'Hard recall passed for {0} of {1} cards.',
            practiceStatus: 'Practice',
            verificationStatus: 'Verification',
            dueCards: '{0}/{1} due',
            verifiedCards: '{0}/{1} passed',
            eligibleCards: '{0} testable today',
            blockedTodayCards: '{0} locked today',
            verificationComplete: 'Verification complete',
            verificationWaiting: 'No card testable today',
            modeLabel: 'Mode',
            practiceMode: 'Practice',
            verificationMode: 'Check',
            startVerification: 'Check with Learning Coach',
            readyForReview: 'Cards for today: {0}. Doing 20 of them is great!',
            tapToFlip: 'Tap to flip',
            showAnswer: 'Show Answer',
            previousCard: 'Previous card',
            nextCard: 'Next card',
            cardPosition: (current, total) => `Card ${current} of ${total}`,
            notKnown: 'Not yet',
            known: 'Got it',
            notKnownTooltip: 'Not recalled yet. Schedule this card sooner.',
            knownTooltip: 'Recalled. Schedule this card later.',
            ratingSaved: 'Answer saved',
        }
        : {
            configError: 'Konfigurationsfehler: Fehlende Vokabelquelle.',
            loading: 'Lade Daten...',
            allCaughtUp: 'Alles erledigt!',
            practiceCaughtUp: 'Übung erledigt',
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
            readOnlyBody: 'Das Karteikartenlernen ist in dieser Legacy-Ansicht deaktiviert. Bitte auf Gymnasium (DE) umstellen, um hier weiterzulernen.',
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
            verifiedProgress: 'Geprüft: {0}/{1}',
            verifiedProgressTooltip: 'Harter Abruf bestanden für {0} von {1} Karten.',
            practiceStatus: 'Üben',
            verificationStatus: 'Prüfung',
            dueCards: '{0}/{1} fällig',
            verifiedCards: '{0}/{1} bestanden',
            eligibleCards: '{0} heute prüfbar',
            blockedTodayCards: '{0} heute gesperrt',
            verificationComplete: 'Prüfung bestanden',
            verificationWaiting: 'Heute keine Karte prüfbar',
            modeLabel: 'Modus',
            practiceMode: 'Üben',
            verificationMode: 'Prüfen',
            startVerification: 'Mit Lerncoach prüfen',
            readyForReview: 'Bereit für heute: {0}.',
            tapToFlip: 'Zum Umdrehen tippen',
            showAnswer: 'Antwort zeigen',
            previousCard: 'Vorherige Karte',
            nextCard: 'Nächste Karte',
            cardPosition: (current, total) => `Karte ${current} von ${total}`,
            notKnown: 'Noch nicht gewusst',
            known: 'Gewusst',
            notKnownTooltip: 'Noch nicht erinnert. Diese Karte wird früher wiederholt.',
            knownTooltip: 'Erinnert. Diese Karte wird später wiederholt.',
            ratingSaved: 'Antwort gespeichert',
        }
)
