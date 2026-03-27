package com.skillpilot.backend.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BundeslandCodeNormalizerTest {

    @Test
    void formatDisplayLabelEnFormatsKnownAliasWithCanonicalCode() {
        assertThat(BundeslandCodeNormalizer.formatDisplayLabelEn("HES")).isEqualTo("Hesse (DE-HE)");
        assertThat(BundeslandCodeNormalizer.formatDisplayLabelEn("DE-BY")).isEqualTo("Bavaria (DE-BY)");
        assertThat(BundeslandCodeNormalizer.formatDisplayLabelEn("shl")).isEqualTo("Schleswig-Holstein (DE-SH)");
    }

    @Test
    void formatDisplayLabelEnReturnsNullForUnknownCode() {
        assertThat(BundeslandCodeNormalizer.formatDisplayLabelEn("DE-XX")).isNull();
        assertThat(BundeslandCodeNormalizer.formatDisplayLabelEn(null)).isNull();
    }
}
