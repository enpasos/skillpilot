package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.*;
import com.skillpilot.backend.service.ChampionPracticeFingerprint;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ContentConfigurationAuthorizationTest {
    private static final String KEY = "a".repeat(43);
    private static final String GRANTS = "{\"learner-a\":\"" + ChampionPracticeFingerprint.digest(KEY) + "\"}";

    @Test void onlyTheExplicitProfileBoundGrantCanWrite() {
        var auth = new ContentConfigurationAuthorization(true, GRANTS);
        assertThatCode(() -> auth.requireWrite("learner-a", KEY)).doesNotThrowAnyException();
        forbidden(() -> auth.requireWrite("learner-a", null));
        forbidden(() -> auth.requireWrite("learner-a", "b".repeat(43)));
        forbidden(() -> auth.requireWrite("learner-b", KEY));
        forbidden(() -> auth.requireWrite("learner-a", "learner-a"));
    }

    @Test void DisabledOrRevokedOrMalformedGrantFailsClosed() {
        assertThatThrownBy(() -> new ContentConfigurationAuthorization(false, GRANTS).requireWrite("learner-a", KEY))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        for (String grants : new String[] {"", "{}", "[]", "not-json", "{\"learner-a\":12}", "{\"learner-a\":\"bad\"}"}) {
            forbidden(() -> new ContentConfigurationAuthorization(true, grants).requireWrite("learner-a", KEY));
        }
        String rotated = "{\"learner-a\":\"" + ChampionPracticeFingerprint.digest("b".repeat(43)) + "\"}";
        forbidden(() -> new ContentConfigurationAuthorization(true, rotated).requireWrite("learner-a", KEY));
    }

    private static void forbidden(Runnable call) {
        assertThatThrownBy(call::run).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
    }
}
