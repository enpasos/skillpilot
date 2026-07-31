package com.skillpilot.backend.openai.de;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class OpenAiDeCurriculumRevisionProviderTest {

    @TempDir
    Path temporaryDirectory;

    @Test
    void repositoryRevisionIsDeterministicAndChangesWithRuntimeJsonOnly() throws Exception {
        Path nested = Files.createDirectories(temporaryDirectory.resolve("nested"));
        Files.writeString(temporaryDirectory.resolve("a.json"), "{\"value\":1}\n");
        Files.writeString(nested.resolve("b.json"), "{\"value\":2}\n");
        Files.writeString(temporaryDirectory.resolve("ignored.md"), "first");
        Path quality = Files.createDirectories(temporaryDirectory.resolve("quality"));
        Files.writeString(quality.resolve("review.json"), "{\"decision\":\"first\"}\n");

        String first = OpenAiDeCurriculumRevisionProvider.repositoryRevision(temporaryDirectory);
        String second = OpenAiDeCurriculumRevisionProvider.repositoryRevision(temporaryDirectory);
        Files.writeString(temporaryDirectory.resolve("ignored.md"), "second");
        Files.writeString(quality.resolve("review.json"), "{\"decision\":\"second\"}\n");
        String afterIgnoredChange =
                OpenAiDeCurriculumRevisionProvider.repositoryRevision(temporaryDirectory);
        Files.writeString(nested.resolve("b.json"), "{\"value\":3}\n");
        String afterRuntimeChange =
                OpenAiDeCurriculumRevisionProvider.repositoryRevision(temporaryDirectory);

        assertThat(first)
                .matches("^curricula-sha256@[0-9a-f]{64}$")
                .isEqualTo(second)
                .isEqualTo(afterIgnoredChange)
                .isNotEqualTo(afterRuntimeChange);
    }
}
