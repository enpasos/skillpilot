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

    @Test
    void prompts_reconstructUnusualSolutionsBeforeCorrecting() throws Exception {
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "zuerst rekonstruieren",
                "Kreative",
                "falsche oder unbegründete Schritte");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "reconstruct first",
                "creative strategies",
                "wrong or unjustified steps");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "trainer.de.md"),
                "Ungewöhnliche Lösungswege",
                "Korrigiere nur den tatsächlich falschen Schritt",
                "lehne ihn klar ab");
        assertContainsUuidContract(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "trainer.en.md"),
                "Unusual solution paths",
                "Correct only the actually wrong step",
                "reject it clearly");
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
