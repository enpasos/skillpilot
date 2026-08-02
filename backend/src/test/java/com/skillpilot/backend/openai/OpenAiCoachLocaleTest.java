package com.skillpilot.backend.openai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.Test;

class OpenAiCoachLocaleTest {

    @Test
    void usesEnglishForSessionIndependentControlPlaneMetadata() {
        assertThat(OpenAiCoachLocale.CONTROL_PLANE_LOCALE).isEqualTo("en");
    }

    @Test
    void normalizesSupportedBcp47Tags() {
        assertThat(OpenAiCoachLocale.normalize("de-de")).isEqualTo("de-DE");
        assertThat(OpenAiCoachLocale.normalize("en-gb")).isEqualTo("en-GB");
    }

    @Test
    void rejectsMissingMalformedAndUnsupportedTags() {
        assertThatIllegalArgumentException().isThrownBy(() -> OpenAiCoachLocale.normalize(null));
        assertThatIllegalArgumentException().isThrownBy(() -> OpenAiCoachLocale.normalize("en_US"));
        assertThatIllegalArgumentException().isThrownBy(() -> OpenAiCoachLocale.normalize("fr-FR"));
        assertThatIllegalArgumentException().isThrownBy(() -> OpenAiCoachLocale.isEnglish("fr-FR"));
        assertThatIllegalArgumentException().isThrownBy(() ->
                OpenAiCoachLocale.localized(null, "Deutsch", "English"));
    }
}
