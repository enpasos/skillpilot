export interface ReviewResult {
    interval: number; // days until next review
    repetition: number; // consecutive successful reviews
    ef: number; // easiness factor
}

export interface VerifiedRecallState {
    status: 'passed' | 'failed';
    attempts: number;
    failures: number;
    lastTestedAt: string;
    passedAt?: string;
    lastFailedAt?: string;
}

export interface ReviewItem extends ReviewResult {
    id: string;
    nextReview: number; // timestamp
    verifiedRecall?: VerifiedRecallState;
}

/**
 * SuperMemo-2 (SM-2) Algorithm implementation
 * @param quality 0-5 rating (0=blackout, 5=perfect)
 * @param lastInterval previous interval in days
 * @param lastEf previous easiness factor
 * @param lastRepetition previous repetition count
 */
export function calculateReview(
    quality: number,
    lastInterval: number,
    lastEf: number,
    lastRepetition: number
): ReviewResult {
    let interval: number;
    let repetition: number;
    let ef: number;

    if (quality >= 3) {
        // Retrieval successful
        if (lastRepetition === 0) {
            interval = 1;
        } else if (lastRepetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(lastInterval * lastEf);
        }
        repetition = lastRepetition + 1;

        // Update EF
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        ef = lastEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (ef < 1.3) ef = 1.3;
    } else {
        // Retrieval failed
        repetition = 0;
        interval = 1; // Reset to 1 day (or immediate logic)
        ef = lastEf; // Keep EF same
    }

    return { interval, repetition, ef };
}

export const INITIAL_DECK_STATE = {
    interval: 0,
    repetition: 0,
    ef: 2.5
}

export function isVerifiedRecallPassed(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const state = value as Partial<VerifiedRecallState>;
    return state.status === 'passed' && typeof state.passedAt === 'string' && state.passedAt.length > 0;
}
