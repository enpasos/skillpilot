package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class AiPromptContractTest {

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
                "redirect=true",
                "Start Exercise");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "system_instructions.en.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "redirect=true",
                "Start Exercise");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.de.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "kein generisches",
                "pro Kalendertag",
                "redirect=true",
                "status=waiting");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "knowledge_docs", "state_machine.en.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "Do not offer generic",
                "per calendar day",
                "redirect=true",
                "status=waiting");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.de.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "redirect=true",
                "Start Exercise");
        assertContainsFragments(
                Path.of("..", "ai", "openai custom gpt", "gpt_setup_guide.en.md"),
                "chooseMemoryMode",
                "verified-recall/start",
                "batchSize",
                "redirect=true",
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
