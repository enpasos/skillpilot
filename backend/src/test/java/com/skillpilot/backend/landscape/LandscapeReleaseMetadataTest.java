package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;

class LandscapeReleaseMetadataTest {

    private static final String MATH_LANDSCAPE_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";

    @Test
    void mathLandscape_exposesExactlyTwoReleasedOfferAnchors_andKeepsThemInLocalizedOutput() {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory("../curricula");
        LandscapeService landscapeService = new LandscapeService(properties, new ObjectMapper());

        SkillLandscape german = landscapeService.getById(MATH_LANDSCAPE_ID);
        assertThat(german).isNotNull();

        List<LearningGoal> releasedGoals = german.getGoals().stream()
                .filter(goal -> goal.getRelease() != null)
                .filter(goal -> goal.getRelease().getExamYear() == 2026)
                .filter(goal -> "released".equals(goal.getRelease().getStatus()))
                .toList();

        assertThat(releasedGoals)
                .extracting(LearningGoal::getShortKey)
                .containsExactlyInAnyOrder(
                        "abi_gk_offer_2026",
                        "abi_lk_offer_2026");

        SkillLandscape english = landscapeService.getClosure(MATH_LANDSCAPE_ID, "en").stream()
                .filter(landscape -> MATH_LANDSCAPE_ID.equals(landscape.getLandscapeId()))
                .findFirst()
                .orElseThrow();

        LearningGoal localizedGkOffer = english.getGoals().stream()
                .filter(goal -> "abi_gk_offer_2026".equals(goal.getShortKey()))
                .findFirst()
                .orElseThrow();

        assertThat(localizedGkOffer.getRelease()).isNotNull();
        assertThat(localizedGkOffer.getRelease().getExamYear()).isEqualTo(2026);
        assertThat(localizedGkOffer.getRelease().getKind()).isEqualTo("offer");
        assertThat(localizedGkOffer.getRelease().getCourseLevel()).isEqualTo("GK");
        assertThat(localizedGkOffer.getRelease().getStatus()).isEqualTo("released");

        assertThat(german.getGoals().stream().map(LearningGoal::getShortKey))
                .doesNotContain("abi_gk_master_2026", "abi_lk_master_2026");
    }
}
