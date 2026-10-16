package com.skillpilot.backend.service;
import com.skillpilot.backend.landscape.LearningGoal;
/** Native acceptance boundary. Production uses only the fixed registered engine.
 * Isolated lifecycle tests may mock this interface; that is not native evidence. */
public interface NativeSupplementAcceptanceGate {
    default <T> T withSnapshot(java.util.function.Supplier<T> action) { return action.get(); }
    String requireAccepted(String landscapeId, LearningGoal currentGoal);
    /** Distinct typed context, never curricularAtomic P/D/A/M/V authority. */
    default String requireOrientationAccepted(String landscapeId, LearningGoal currentGoal) {
        throw new IllegalStateException("Current registered Math orientation context is unsupported");
    }
}
