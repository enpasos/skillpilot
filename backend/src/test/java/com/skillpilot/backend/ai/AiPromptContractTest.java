package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class AiPromptContractTest {

    @Test
    void systemInstructionsStayWithinGptBuilderLimit() throws Exception {
        assertSystemInstructionLength(Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"));
        assertSystemInstructionLength(Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"));
    }

    @Test
    void systemInstructions_requireStartCodeRedeemAndSessionToken() throws Exception {
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "redeemStartCode",
                "chatSessionToken",
                "SkillPilot-Startcode",
                "nicht nach der SkillPilot-ID fragen");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "redeemStartCode",
                "chatSessionToken",
                "SkillPilot start code",
                "do not ask for the SkillPilot ID");
    }

    @Test
    void setupGuides_requireBrowserStartCodesInsteadOfGptProfiles() throws Exception {
        assertContainsSetupSanityRule(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.de.md"),
                "Startcode",
                "redeemStartCode",
                "chatSessionToken",
                "No question for a SkillPilot-ID",
                "No `createLearner`");
        assertContainsSetupSanityRule(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.en.md"),
                "start code",
                "redeemStartCode",
                "chatSessionToken",
                "No question for a SkillPilot ID",
                "No `createLearner`");
    }

    @Test
    void prompts_defineTeachActiveGoalAsConversationalNotMasteryWrite() throws Exception {
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "teachActiveGoal",
                "kein Tool");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "teachActiveGoal",
                "not a tool");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.de.md"),
                "teachActiveGoal",
                "niemals direkt");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.en.md"),
                "teachActiveGoal",
                "never directly");
    }

    @Test
    void prompts_defineFlashcardModeAsVerifiedRecallInsteadOfGenericExercise() throws Exception {
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "hart prüfbare Karten",
                "Start Exercise");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "hard-testable cards",
                "Start Exercise");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.de.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "kein generisches",
                "pro Kalendertag",
                "hart prüfbaren Karten",
                "status=waiting");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.en.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "Do not offer generic",
                "per calendar day",
                "hard-testable cards",
                "status=waiting");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.de.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "hard-testable cards",
                "Start Exercise");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.en.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "hard-testable cards",
                "Start Exercise");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "deep_linking.de.md"),
                "chooseMemoryMode",
                "Verified-Recall",
                "kein generisches `[Start Exercise]`",
                "[Im Cockpit üben]");
        assertDoesNotContainFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "deep_linking.de.md"),
                "Hat dieses Ziel `srs-deck:` oder `extendedData`?");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "deep_linking.en.md"),
                "chooseMemoryMode",
                "Verified Recall",
                "no generic `[Start Exercise]`",
                "[Practice in the Cockpit]");
        assertDoesNotContainFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "deep_linking.en.md"),
                "Does this goal have `srs-deck:` or `extendedData`?");
    }

    @Test
    void prompts_defineActiveGoalVisualizationDisplay() throws Exception {
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "goal-visualization",
                "resourceType = \"image\"",
                "Markdown-Bild",
                "teachActiveGoal");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "goal-visualization",
                "resourceType = \"image\"",
                "Markdown image",
                "teachActiveGoal");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.de.md"),
                "goal-visualization",
                "resourceType = \"image\"",
                "Markdown",
                "teachActiveGoal");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.en.md"),
                "goal-visualization",
                "resourceType = \"image\"",
                "Markdown image",
                "teachActiveGoal");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.de.md"),
                "goal-visualization",
                "resourceType=image",
                "Markdown-Bild",
                "teachActiveGoal");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.en.md"),
                "goal-visualization",
                "resourceType=image",
                "Markdown image",
                "teachActiveGoal");
    }

    @Test
    void optimizedActionSchemasExposeGoalVisualizationMetadata() throws Exception {
        assertContainsFragments(
                Path.of("..", "ai", "skillpilot-api-4ai.de.json"),
                "goal-visualization",
                "resourceType=image",
                "\"role\"",
                "\"altText\"",
                "\"reviewStatus\"",
                "\"skillpilotId\"");
        assertContainsFragments(
                Path.of("..", "ai", "skillpilot-api-4ai.en.json"),
                "goal-visualization",
                "resourceType=image",
                "\"role\"",
                "\"altText\"",
                "\"reviewStatus\"",
                "\"skillpilotId\"");
    }

    @Test
    void promptsDoNotTurnFlashcardVerificationFlowErrorsIntoGenericSaveErrors() throws Exception {
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "error_handling.de.md"),
                "chooseMemoryMode",
                "kein Nachweis",
                "Verified-Recall-Actions",
                "Standardformulierung");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "error_handling.en.md"),
                "chooseMemoryMode",
                "not evidence",
                "Verified Recall actions",
                "standard phrasing");
    }

    @Test
    void prompts_reconstructUnusualSolutionsBeforeCorrecting() throws Exception {
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.de.md"),
                "zuerst rekonstruieren",
                "Kreative",
                "falsche oder unbegründete Schritte");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "reconstruct first",
                "creative strategies",
                "wrong or unjustified steps");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "lerncoach.de.md"),
                "Ungewöhnliche Lösungswege",
                "Korrigiere nur den tatsächlich falschen Schritt",
                "lehne ihn klar ab");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "learning_coach.en.md"),
                "Unusual solution paths",
                "Correct only the actually wrong step",
                "reject it clearly");
    }

    private static void assertContainsFragments(Path path, String... fragments) throws IOException {
        String text = Files.readString(path);
        for (String fragment : fragments) {
            assertThat(text).containsIgnoringCase(fragment);
        }
    }

    private static void assertSystemInstructionLength(Path path) throws IOException {
        String text = Files.readString(path);
        int charCount = text.codePointCount(0, text.length());
        assertThat(charCount)
                .as(path + " must stay within GPT Builder's 8000 character instruction limit")
                .isLessThanOrEqualTo(8000);
    }

    private static void assertDoesNotContainFragments(Path path, String... fragments) throws IOException {
        String text = Files.readString(path);
        for (String fragment : fragments) {
            assertThat(text).doesNotContain(fragment);
        }
    }

    private static void assertContainsSetupSanityRule(Path path, String... fragments) throws IOException {
        String text = Files.readString(path);
        for (String fragment : fragments) {
            assertThat(text).containsIgnoringCase(fragment);
        }
    }
}
