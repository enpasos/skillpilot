package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionTemplate;

class JdbcOAuthClientAssertionReplayStoreTest {
    private static final Instant NOW = Instant.parse("2026-09-11T10:00:00Z");

    @Test
    void replayRemainsConsumedAcrossInstancesAndReconstruction() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        assertThat(store(db, NOW).consume("client", "unique", NOW.plusSeconds(60), 100)).isTrue();
        assertThat(store(db, NOW).consume("client", "unique", NOW.plusSeconds(60), 100)).isFalse();
        assertThat(store(db, NOW).consume("another-client", "unique", NOW.plusSeconds(60), 100)).isTrue();
        assertThat(db.jdbc().queryForObject(
                "SELECT replay_key FROM oauth_client_assertion_replay ORDER BY replay_key LIMIT 1", String.class))
                .matches("[0-9a-f]{64}");
    }

    @Test
    void exactlyOneParallelConsumerSucceedsAcrossIndependentInstances() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        try (var executor = Executors.newFixedThreadPool(8)) {
            List<Callable<Boolean>> attempts = new ArrayList<>();
            for (int i = 0; i < 16; i++) {
                attempts.add(() -> store(db, NOW).consume("client", "shared-jti", NOW.plusSeconds(60), 100));
            }
            int successes = 0;
            for (var result : executor.invokeAll(attempts)) {
                if (result.get()) successes++;
            }
            assertThat(successes).isEqualTo(1);
        }
    }

    @Test
    void retainsBoundaryInstantAndFailsClosedAtCapacity() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        assertThat(store(db, NOW).consume("client", "one", NOW.plusSeconds(30), 1)).isTrue();
        assertThat(store(db, NOW.plusSeconds(30)).consume("client", "one", NOW.plusSeconds(30), 1)).isFalse();
        assertThat(store(db, NOW.plusSeconds(30)).consume("client", "two", NOW.plusSeconds(60), 1)).isFalse();
        assertThat(store(db, NOW.plusSeconds(31)).consume("client", "two", NOW.plusSeconds(60), 1)).isTrue();
        assertThat(store(db, NOW.plusSeconds(31)).consume("client", "one", NOW.plusSeconds(30), 1)).isFalse();
    }

    @Test
    void outerTransactionRollbackCannotResurrectAnAssertion() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        assertThatThrownBy(() -> new TransactionTemplate(db.transactions()).executeWithoutResult(status -> {
            assertThat(store(db, NOW).consume("client", "rolled-back-grant", NOW.plusSeconds(60), 10)).isTrue();
            throw new IllegalStateException("synthetic failed grant");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(store(db, NOW).consume("client", "rolled-back-grant", NOW.plusSeconds(60), 10)).isFalse();
    }

    private static JdbcOAuthClientAssertionReplayStore store(OAuthClientSecurityTestDatabase db, Instant now) {
        return new JdbcOAuthClientAssertionReplayStore(db.jdbc(), db.transactions(), Clock.fixed(now, ZoneOffset.UTC));
    }
}
