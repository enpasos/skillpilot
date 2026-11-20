package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import jakarta.persistence.EntityManager;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest(properties = {
        "skillpilot.security.signing-secret=private-test-archive-key-41e86e8f-2407-471b-8251",
        "spring.datasource.url=jdbc:h2:mem:verified-exam-backup;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
@Transactional
class VerifiedExamPassBackupIntegrationTest {
    private static final String EXAM = "exam-goal";
    private static final String ARCHIVE_SECRET = "private-test-archive-key-41e86e8f-2407-471b-8251";
    private static final AssessmentMaterialRevision ORIGINAL = new AssessmentMaterialRevision(
            digest("a"), digest("b"), digest("c"));
    private static final AssessmentMaterialRevision LATER = new AssessmentMaterialRevision(
            digest("a"), digest("d"), digest("e"));
    @Autowired private LearnerService service;
    @Autowired private VerifiedExamPassService passes;
    @Autowired private LearnerRepository learners;
    @Autowired private MasteryRepository mastery;
    @Autowired private ObjectMapper mapper;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private EntityManager entities;

    @Test
    void restoresTheRecordedScoreAndDateOnlyForTheOriginAndRetainsAdditionalRevisions() throws Exception {
        var owner = learner();
        var copy = learner();
        String id = owner.getSkillpilotId();
        passes.record(id, EXAM, ORIGINAL, 7, 10, 7, List.of(digest("1")));
        flushAndClear();
        var first = passes.findForGoal(id, EXAM).getFirst();
        var archive = roundTrip(id);
        service.importLearner(copy.getSkillpilotId(), archive);
        assertThat(passes.findForGoal(copy.getSkillpilotId(), EXAM)).isEmpty();

        // Simulate restoring an older database, then learning more before importing the backup.
        jdbc.update("DELETE FROM verified_exam_pass WHERE learner_id = ?", id);
        entities.clear();
        passes.record(id, EXAM, LATER, 20, 20, 15);
        service.importLearner(id, archive);
        flushAndClear();
        assertThat(passes.findForGoal(id, EXAM)).hasSize(2).contains(first);
        service.importLearner(id, archive);
        flushAndClear();
        assertThat(passes.findForGoal(id, EXAM)).hasSize(2).contains(first);
        assertThat(service.getMastery(id)).isEmpty();
    }

    @Test
    void anOlderOwnBackupRestoresTheEarlierFirstScoreAfterTheSameExamWasRetaken() throws Exception {
        String id = learner().getSkillpilotId();
        passes.record(id, EXAM, ORIGINAL, 7, 10, 7, List.of(digest("1")));
        flushAndClear();
        var first = passes.findForGoal(id, EXAM).getFirst();
        var archive = roundTrip(id);
        jdbc.update("DELETE FROM verified_exam_pass WHERE learner_id = ?", id);
        entities.clear();
        passes.record(id, EXAM, ORIGINAL, 10, 10, 7, List.of(digest("2")));
        service.importLearner(id, archive);
        flushAndClear();
        assertThat(passes.findForGoal(id, EXAM)).singleElement().satisfies(merged -> {
            assertThat(merged.passedAt()).isEqualTo(first.passedAt());
            assertThat(merged.earnedPoints()).isEqualTo(first.earnedPoints());
            assertThat(merged.planningCreditBindingIds()).containsExactly(digest("1"), digest("2"));
        });
    }

    @Test
    void aSignatureOverTheOriginalSevenReceiptFieldsRestoresUnboundHistory() throws Exception {
        String id = learner().getSkillpilotId();
        passes.record(id, EXAM, ORIGINAL, 7, 10, 7);
        flushAndClear();
        var pass = passes.findForGoal(id, EXAM).getFirst();
        ObjectNode file = mapper.valueToTree(roundTrip(id));
        ObjectNode legacy = mapper.createObjectNode();
        legacy.set("passedAt", mapper.valueToTree(pass.passedAt()));
        legacy.put("earnedPoints", pass.earnedPoints());
        legacy.put("maxPoints", pass.maxPoints());
        legacy.put("passingPoints", pass.passingPoints());
        legacy.put("taskRevision", pass.taskRevision());
        legacy.put("rubricRevision", pass.rubricRevision());
        legacy.put("fingerprint", pass.fingerprint());
        ((ObjectNode) file.at("/data/verifiedExamPasses")).set(EXAM, mapper.createArrayNode().add(legacy));
        var hmac = Mac.getInstance("HmacSHA256");
        hmac.init(new SecretKeySpec(ARCHIVE_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        file.put("signature", HexFormat.of().formatHex(hmac.doFinal(mapper.writeValueAsBytes(file.get("data")))));
        jdbc.update("DELETE FROM verified_exam_pass WHERE learner_id = ?", id);
        entities.clear();
        service.importLearner(id, mapper.treeToValue(file, SignedLearnerDataDTO.class));
        flushAndClear();
        assertThat(passes.findForGoal(id, EXAM)).containsExactly(pass);
        assertThat(pass.planningCreditBindingIds()).isEmpty();
    }

    @Test
    void archiveWithoutEvidenceAndLaterMasteryResetKeepHistoryDistinctFromCurrentMastery() throws Exception {
        var owner = learner();
        String id = owner.getSkillpilotId();
        mastery.saveAndFlush(new Mastery(owner, EXAM, 1.0));
        var archive = roundTrip(id);
        assertThat(mapper.writeValueAsString(archive)).doesNotContain("verifiedExamPasses");
        service.importLearner(id, archive);
        assertThat(passes.findForGoal(id, EXAM)).isEmpty();

        passes.record(id, EXAM, ORIGINAL, 8, 10, 7);
        service.importLearner(id, archive);
        learners.findById(id).orElseThrow().setActiveGoalId(EXAM);
        service.setMastery(id, new MasteryUpdateRequest(Map.of(EXAM, 0.0), EXAM));
        flushAndClear();
        assertThat(service.getMastery(id)).containsEntry(EXAM, 0.0);
        assertThat(passes.findForGoal(id, EXAM)).hasSize(1);
    }

    @Test
    void changingTheScoreInTheFileInvalidatesTheArchiveBeforeAnyWrite() throws Exception {
        String id = learner().getSkillpilotId();
        passes.record(id, EXAM, ORIGINAL, 7, 10, 7);
        flushAndClear();
        ObjectNode file = mapper.valueToTree(roundTrip(id));
        ((ObjectNode) file.at("/data/verifiedExamPasses/" + EXAM + "/0")).put("earnedPoints", 10.0);
        var tampered = mapper.treeToValue(file, SignedLearnerDataDTO.class);
        assertThatThrownBy(() -> service.importLearner(id, tampered))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("Invalid data signature");
        assertThat(passes.findForGoal(id, EXAM).getFirst().earnedPoints()).isEqualTo(7);
    }

    @Test
    void addingAPlanningBindingInvalidatesTheArchiveBeforeAnyWrite() throws Exception {
        String id = learner().getSkillpilotId();
        passes.record(id, EXAM, ORIGINAL, 7, 10, 7, List.of(digest("1")));
        flushAndClear();
        ObjectNode file = mapper.valueToTree(roundTrip(id));
        var receipt = (ObjectNode) file.at("/data/verifiedExamPasses/" + EXAM + "/0");
        receipt.putArray("planningCreditBindingIds").add(digest("1")).add(digest("2"));
        var tampered = mapper.treeToValue(file, SignedLearnerDataDTO.class);
        assertThatThrownBy(() -> service.importLearner(id, tampered))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("Invalid data signature");
        assertThat(passes.findForGoal(id, EXAM).getFirst().planningCreditBindingIds()).containsExactly(digest("1"));
    }

    @Test
    void thePublicDevelopmentKeyCannotRestoreAProofFromAFile() throws Exception {
        String id = learner().getSkillpilotId();
        Object key = ReflectionTestUtils.getField(service, "signingSecret");
        try {
            ReflectionTestUtils.setField(service, "signingSecret", "default-insecure-secret-change-me");
            passes.record(id, EXAM, ORIGINAL, 7, 10, 7);
            flushAndClear();
            var archive = roundTrip(id);
            passes.record(id, EXAM, ORIGINAL, 10, 10, 7, List.of(digest("1")));
            service.importLearner(id, archive);
            var withBinding = roundTrip(id);
            jdbc.update("""
                    DELETE FROM verified_exam_pass_credit_binding
                    WHERE pass_id IN (SELECT id FROM verified_exam_pass WHERE learner_id = ?)
                    """, id);
            entities.clear();
            assertThatThrownBy(() -> service.importLearner(id, withBinding))
                    .isInstanceOf(ResponseStatusException.class).hasMessageContaining("private archive signing key");
            assertThat(passes.findForGoal(id, EXAM).getFirst().planningCreditBindingIds()).isEmpty();
            jdbc.update("DELETE FROM verified_exam_pass WHERE learner_id = ?", id);
            entities.clear();
            assertThatThrownBy(() -> service.importLearner(id, archive))
                    .isInstanceOf(ResponseStatusException.class).hasMessageContaining("private archive signing key");
            assertThat(passes.findForGoal(id, EXAM)).isEmpty();
        } finally {
            ReflectionTestUtils.setField(service, "signingSecret", key);
        }
    }

    private Learner learner() {
        Learner learner = new Learner();
        learner.setSkillpilotId("exam-backup-" + UUID.randomUUID());
        learner.setAutoPilot(false);
        return learners.saveAndFlush(learner);
    }

    private SignedLearnerDataDTO roundTrip(String id) throws Exception {
        String file = mapper.writeValueAsString(service.exportLearner(id));
        assertThat(file).doesNotContain("hibernateLazyInitializer");
        return mapper.readValue(file, SignedLearnerDataDTO.class);
    }

    private void flushAndClear() {
        entities.flush();
        entities.clear();
    }

    private static String digest(String digit) {
        return "sha256:" + digit.repeat(64);
    }
}
