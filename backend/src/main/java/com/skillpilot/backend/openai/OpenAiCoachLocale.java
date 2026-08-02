package com.skillpilot.backend.openai;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/** Locale boundary for the language-neutral OpenAI Coach V1 contract. */
public final class OpenAiCoachLocale {

    /** Language used only for session-independent protocol metadata and diagnostics. */
    public static final String CONTROL_PLANE_LOCALE = "en";

    private static final Pattern BCP_47_SHAPE =
            Pattern.compile("^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$");
    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("de", "en");

    private OpenAiCoachLocale() {
    }

    /** Returns the canonical BCP-47 tag for a V1 communication locale. */
    public static String normalize(String rawLocale) {
        if (rawLocale == null || rawLocale.isBlank()) {
            throw new IllegalArgumentException("communicationLocale must not be empty.");
        }
        String candidate = rawLocale.trim();
        if (!BCP_47_SHAPE.matcher(candidate).matches()) {
            throw new IllegalArgumentException(
                    "communicationLocale must be a structurally valid BCP-47 language tag.");
        }
        Locale locale = Locale.forLanguageTag(candidate);
        String language = locale.getLanguage().toLowerCase(Locale.ROOT);
        if (language.isBlank() || !SUPPORTED_LANGUAGES.contains(language)) {
            throw new IllegalArgumentException(
                    "communicationLocale must use a supported language: de or en.");
        }
        return locale.toLanguageTag();
    }

    public static boolean isEnglish(String communicationLocale) {
        return "en".equals(Locale.forLanguageTag(normalize(communicationLocale)).getLanguage());
    }

    public static String localized(String communicationLocale, String german, String english) {
        return isEnglish(communicationLocale) ? english : german;
    }
}
