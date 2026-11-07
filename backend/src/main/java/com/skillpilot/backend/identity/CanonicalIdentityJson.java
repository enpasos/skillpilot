package com.skillpilot.backend.identity;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

/** skillpilot-canonical-json-decimal-v1; deliberately independent of mapper float formatting. */
final class CanonicalIdentityJson {
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
            .enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS)
            .enable(DeserializationFeature.USE_BIG_INTEGER_FOR_INTS)
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

    static JsonNode parse(byte[] bytes) {
        try {
            JsonNode node = MAPPER.readTree(bytes);
            if (node == null) throw new GoalIdentityException("Missing JSON document");
            encode(node); // Reject invalid strings/nonfinite values before publishing evidence.
            return node;
        } catch (java.io.IOException invalid) {
            throw new GoalIdentityException("Invalid identity JSON: " + invalid.getMessage());
        }
    }

    static byte[] encode(JsonNode node) {
        StringBuilder out = new StringBuilder();
        append(node, out);
        return out.toString().getBytes(StandardCharsets.UTF_8);
    }

    static String sha256(byte[] bytes) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
        catch (java.security.NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }

    static String digest(JsonNode node) { return sha256(encode(node)); }

    private static void append(JsonNode node, StringBuilder out) {
        if (node.isObject()) {
            List<String> keys = new ArrayList<>();
            node.fieldNames().forEachRemaining(keys::add);
            keys.sort(CanonicalIdentityJson::compareCodePoints);
            out.append('{');
            boolean comma = false;
            for (String key : keys) {
                if (comma) out.append(',');
                quote(key, out); out.append(':'); append(node.get(key), out); comma = true;
            }
            out.append('}');
        } else if (node.isArray()) {
            out.append('[');
            for (int i = 0; i < node.size(); i++) {
                if (i > 0) out.append(',');
                append(node.get(i), out);
            }
            out.append(']');
        } else if (node.isTextual()) quote(node.textValue(), out);
        else if (node.isNumber()) {
            if ((node.isDouble() || node.isFloat()) && !Double.isFinite(node.doubleValue()))
                throw new GoalIdentityException("Nonfinite identity JSON number");
            out.append(node.decimalValue().stripTrailingZeros().toPlainString());
        } else if (node.isBoolean()) out.append(node.booleanValue());
        else if (node.isNull()) out.append("null");
        else throw new GoalIdentityException("Unsupported identity JSON value");
    }

    private static int compareCodePoints(String left, String right) {
        int a = 0, b = 0;
        while (a < left.length() && b < right.length()) {
            int x = left.codePointAt(a), y = right.codePointAt(b);
            if (x != y) return Integer.compare(x, y);
            a += Character.charCount(x); b += Character.charCount(y);
        }
        return Integer.compare(left.length() - a, right.length() - b);
    }

    private static void quote(String value, StringBuilder out) {
        out.append('"');
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (Character.isHighSurrogate(c)) {
                if (i + 1 >= value.length() || !Character.isLowSurrogate(value.charAt(i + 1)))
                    throw new GoalIdentityException("Unpaired JSON surrogate");
                out.append(c).append(value.charAt(++i));
            } else if (Character.isLowSurrogate(c)) throw new GoalIdentityException("Unpaired JSON surrogate");
            else if (c == '"' || c == '\\') out.append('\\').append(c);
            else if (c == '\b') out.append("\\b");
            else if (c == '\t') out.append("\\t");
            else if (c == '\n') out.append("\\n");
            else if (c == '\f') out.append("\\f");
            else if (c == '\r') out.append("\\r");
            else if (c < 0x20) {
                out.append("\\u00").append(Character.forDigit(c >>> 4, 16)).append(Character.forDigit(c & 15, 16));
            } else out.append(c);
        }
        out.append('"');
    }
}
