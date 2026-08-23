package com.skillpilot.backend.connectors.claude.v1.session;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Objects;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/** Issues and hashes provider-specific opaque Claude v1 learning-session secrets. */
@Component
@ConditionalOnClaudeV1Enabled
public final class ClaudeV1SessionTokenCodec {

    public static final String TOKEN_PREFIX = "spc_";
    public static final Pattern TOKEN_PATTERN = Pattern.compile("^spc_[A-Za-z0-9_-]{43}$");

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final byte[] HMAC_CONTEXT =
            "SkillPilot\0ClaudeConnector\0LearningSession\0v1\0".getBytes(StandardCharsets.UTF_8);

    private final SecureRandom secureRandom = new SecureRandom();
    private final SecretKeySpec hmacKey;

    public ClaudeV1SessionTokenCodec(ClaudeV1Properties properties) {
        Objects.requireNonNull(properties, "properties");
        this.hmacKey = new SecretKeySpec(
                Objects.requireNonNull(properties.getSigningSecret(), "signingSecret")
                        .getBytes(StandardCharsets.UTF_8),
                HMAC_ALGORITHM);
    }

    public String issue() {
        byte[] random = new byte[32];
        secureRandom.nextBytes(random);
        return TOKEN_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(random);
    }

    public String hash(String rawToken) {
        if (rawToken == null || !TOKEN_PATTERN.matcher(rawToken).matches()) {
            throw new ClaudeV1LearningSessionException(ClaudeV1LearningSessionException.Reason.REQUIRED);
        }
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(hmacKey);
            mac.update(HMAC_CONTEXT);
            return HexFormat.of().formatHex(mac.doFinal(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("HmacSHA256 is unavailable.", e);
        }
    }
}

