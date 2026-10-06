package com.skillpilot.backend.connectors.gemini.v1.session;

import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Properties;
import com.skillpilot.backend.connectors.gemini.v1.ConditionalOnGeminiV1Enabled;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Objects;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/** Issues and hashes provider-specific opaque Gemini v1 learning-session secrets. */
@Component
@ConditionalOnGeminiV1Enabled
public final class GeminiV1SessionTokenCodec {

    public static final String TOKEN_PREFIX = "spg_";
    public static final Pattern TOKEN_PATTERN = Pattern.compile("^spg_[A-Za-z0-9_-]{43}$");

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final byte[] HMAC_CONTEXT =
            "SkillPilot\0GeminiConnector\0LearningSession\0v1\0".getBytes(StandardCharsets.UTF_8);

    private final SecureRandom secureRandom = new SecureRandom();
    private final SecretKeySpec hmacKey;

    public GeminiV1SessionTokenCodec(GeminiV1Properties properties) {
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

    public boolean isValid(String rawToken) {
        return rawToken != null && TOKEN_PATTERN.matcher(rawToken).matches();
    }

    public String hash(String rawToken) {
        if (!isValid(rawToken)) {
            throw new GeminiV1LearningSessionException(GeminiV1LearningSessionException.Reason.REQUIRED);
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
