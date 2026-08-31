package com.skillpilot.backend.teachersupervision;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

final class TeacherSupervisionTokenCodec {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;
    private static final char[] HEX = "0123456789abcdef".toCharArray();

    private TeacherSupervisionTokenCodec() {
    }

    static String newWorkspaceToken() {
        return newToken("sptw_");
    }

    static String newInvitationToken() {
        return newToken("spti_");
    }

    private static String newToken(String prefix) {
        byte[] entropy = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(entropy);
        return prefix + Base64.getUrlEncoder().withoutPadding().encodeToString(entropy);
    }

    static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            char[] encoded = new char[digest.length * 2];
            for (int i = 0; i < digest.length; i++) {
                int unsigned = digest[i] & 0xff;
                encoded[i * 2] = HEX[unsigned >>> 4];
                encoded[i * 2 + 1] = HEX[unsigned & 0x0f];
            }
            return new String(encoded);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is unavailable", impossible);
        }
    }

    static boolean sameSecret(String left, String right) {
        if (left == null || right == null) {
            return false;
        }
        return MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }
}
