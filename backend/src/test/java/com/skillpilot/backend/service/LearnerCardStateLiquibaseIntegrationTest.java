package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ClientStateRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientStateId;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.srs.LegacyCardStateMigration;
import java.sql.Connection;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/** A migrated block, read through the real Liquibase schema and the service, is the former block. */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:card-state-liquibase;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "spring.security.oauth2.client.registration.github.client-id=card-state-test-client",
        "spring.security.oauth2.client.registration.github.client-secret=card-state-test-secret",
        "skillpilot.security.signing-secret=card-state-test-signing-secret",
        "skillpilot.learner-retention.enabled=false",
        "skillpilot.claude.enabled=false",
        "skillpilot.openai.coach.v1.enabled=false"
})
class LearnerCardStateLiquibaseIntegrationTest {

    private static final String LEARNER_ID = "card-state-migrated";
    private static final String NODE_ID = "memory-goal";
    private static final String BLOCK = """
            {"card-2":{"id":"card-2","interval":6,"repetition":2,"ef":2.36,"nextReview":1700000000000},
             "card-1":{"id":"card-1","interval":1,"repetition":1,"ef":2.5,"nextReview":5,
               "verifiedRecall":{"status":"passed","attempts":1,"failures":0,
                 "lastTestedAt":"2026-10-01T10:00:00Z","passedAt":"2026-10-01T10:00:00Z"}}}""";

    @Autowired private LearnerRepository learners;
    @Autowired private LearnerClientStateRepository legacyBlocks;
    @Autowired private LearnerService service;
    @Autowired private DataSource dataSource;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void aMigratedBlockKeepsItsStateAndItsCockpitSynchronizationTimestamp() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learners.saveAndFlush(learner);
        jdbc.update("INSERT INTO learner_client_state (skillpilot_id, node_id, client_state, client_state_updated_at) "
                        + "VALUES (?, ?, ?, ?)",
                LEARNER_ID, NODE_ID, BLOCK, Timestamp.from(Instant.parse("2026-11-20T08:30:00.123456Z")));
        // What the Cockpit last received as expectedUpdatedAt, read as the former code read it.
        Instant formerToken = legacyBlocks.findById(new LearnerClientStateId(LEARNER_ID, NODE_ID))
                .orElseThrow().getClientStateUpdatedAt();

        try (Connection connection = dataSource.getConnection()) {
            assertThat(LegacyCardStateMigration.migrate(connection).migratedNodes()).isOne();
        }

        var migrated = service.getClientState(LEARNER_ID, NODE_ID);
        Map<String, Object> former = new ObjectMapper().readValue(BLOCK, new TypeReference<LinkedHashMap<String, Object>>() { });
        assertThat(migrated.srsState()).isEqualTo(former);
        assertThat(migrated.updatedAt()).isEqualTo(formerToken);

        // The Cockpit's next sync with its former token is not a conflict, and the result survives.
        var saved = service.upsertClientState(LEARNER_ID, NODE_ID, new ClientStateRequest(null,
                Map.of("card-2", Map.of("interval", 1, "repetition", 0, "ef", 2.36, "nextReview", 42)), formerToken));
        assertThat(saved.savedAt()).isAfter(formerToken);
        assertThat(service.getClientState(LEARNER_ID, NODE_ID).srsState())
                .containsEntry("card-1", former.get("card-1"))
                .containsEntry("card-2", Map.of("id", "card-2", "interval", 1, "repetition", 0, "ef", 2.36, "nextReview", 42));
        // The former table is the untouched fallback copy.
        assertThat(legacyBlocks.findById(new LearnerClientStateId(LEARNER_ID, NODE_ID)).orElseThrow().getClientState())
                .isEqualTo(BLOCK);
    }
}
