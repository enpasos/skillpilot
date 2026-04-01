package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class AiPromptContractTest {

    @Test
    void systemInstructions_requireImmediateStateLoadForUuid() throws Exception {
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "tool-first",
                "getLearnerState",
                "ID allein");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "tool-first",
                "getLearnerState",
                "ID alone");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.de.md"),
                "Tool-first",
                "getLearnerState",
                "ID allein");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.en.md"),
                "Tool-first",
                "getLearnerState",
                "ID alone");
    }

    @Test
    void setupGuides_warnAgainstCockpitDetoursForExistingIds() throws Exception {
        assertContainsSetupSanityRule(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.de.md"),
                "Oeffne zuerst das Cockpit",
                "bereit",
                "ID allein");
        assertContainsSetupSanityRule(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.en.md"),
                "Open the cockpit first",
                "ready",
                "ID alone");
    }

    @Test
    void prompts_requireConfirmedActiveGoalBeforeNamingNextGoal() throws Exception {
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "neuest",
                "activeGoal",
                "neues");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "latest",
                "activeGoal",
                "next");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.de.md"),
                "activeGoal",
                "goalOptions",
                "setActiveGoal");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.en.md"),
                "activeGoal",
                "goalOptions",
                "setActiveGoal");
    }

    private static void assertContainsUuidContract(Path path, String... fragments) throws IOException {
        String text = Files.readString(path);
        for (String fragment : fragments) {
            assertThat(text).containsIgnoringCase(fragment);
        }
    }

    private static void assertContainsSetupSanityRule(Path path, String... fragments) throws IOException {
        String text = Files.readString(path);
        for (String fragment : fragments) {
            assertThat(text).containsIgnoringCase(fragment);
        }
    }
}
