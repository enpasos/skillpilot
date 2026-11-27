package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.LearnerCardState;
import com.skillpilot.backend.domain.LearnerCardStateId;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearnerCardStateRepository extends JpaRepository<LearnerCardState, LearnerCardStateId> {

    /** Typed columns only; the stored state objects are not read. */
    record Summary(String nodeId, String cardId, String recallStatus, Instant recallTestedAt,
            Long nextReviewAt, int practiceRepetition, String invalidReason, String undatedPassState) { }

    @Query("select new com.skillpilot.backend.repository.LearnerCardStateRepository$Summary("
            + "s.id.nodeId, s.id.cardId, s.recallStatus, s.recallTestedAt, s.nextReviewAt, "
            + "s.practiceRepetition, s.invalidReason, case when s.recallStatus = 'passed' and s.recallTestedAt is null "
            + "then s.cardState else null end) from LearnerCardState s "
            + "where s.id.skillpilotId = :skillpilotId and s.id.nodeId in :nodeIds")
    List<Summary> findSummaries(@Param("skillpilotId") String skillpilotId,
            @Param("nodeIds") Collection<String> nodeIds);

    @Query("select s from LearnerCardState s where s.id.skillpilotId = :skillpilotId and s.id.nodeId = :nodeId")
    List<LearnerCardState> findNode(@Param("skillpilotId") String skillpilotId, @Param("nodeId") String nodeId);

    @Query("select s from LearnerCardState s where s.id.skillpilotId = :skillpilotId "
            + "and s.id.nodeId = :nodeId and s.id.cardId in :cardIds")
    List<LearnerCardState> findCards(@Param("skillpilotId") String skillpilotId, @Param("nodeId") String nodeId,
            @Param("cardIds") Collection<String> cardIds);

    @Query("select s from LearnerCardState s where s.id.skillpilotId = :skillpilotId")
    List<LearnerCardState> findLearner(@Param("skillpilotId") String skillpilotId);
}
