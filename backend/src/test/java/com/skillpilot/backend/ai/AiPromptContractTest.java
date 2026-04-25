package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class AiPromptContractTest {

    @Test
    void systemInstructions_requireStateLoadForUuid() throws Exception {
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "getLearnerState",
                "UUID");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "getLearnerState",
                "UUID");
    }

    @Test
    void setupGuides_warnAgainstCockpitDetoursForExistingIds() throws Exception {
        assertContainsSetupSanityRule(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.de.md"),
                "UUID",
                "cockpit");
        assertContainsSetupSanityRule(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.en.md"),
                "UUID",
                "cockpit");
    }

    @Test
    void prompts_defineTeachActiveGoalAsConversationalNotMasteryWrite() throws Exception {
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "teachActiveGoal",
                "kein Tool");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "teachActiveGoal",
                "not a tool");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.de.md"),
                "teachActiveGoal",
                "niemals direkt");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.en.md"),
                "teachActiveGoal",
                "never directly");
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
