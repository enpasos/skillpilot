package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

/** The synthetic test-classpath catalog must not mask missing real publications. */
class GoalFeedbackPublishedCatalogTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final Path publicRoot = Path.of("../app/public").toAbsolutePath().normalize();

    @Test
    void loadsAllFourRealPublishedSubjectsWithoutAnAdditionalBackendAllowlist() {
        Set<String> loaded = new HashSet<>();
        ResourceLoader loader = publicationLoader(loaded, null);
        assertThatCode(() -> registry(loader)).doesNotThrowAnyException();
        assertThat(loaded).containsExactlyInAnyOrderElementsOf(List.of(
                "lernzielbuch/index.json",
                "lernzielbuch/de-gym-mathematik-bundesweit.book-model.json",
                "lernzielbuch/de-gym-physik-bundesweit.book-model.json",
                "lernzielbuch/de-gym-chemie-lk.book-model.json",
                "lernzielbuch/de-gym-biologie-gk.book-model.json"));
    }

    @Test
    void rejectsAMismatchedRealChemistryModelHash() throws Exception {
        ObjectNode index = (ObjectNode) mapper.readTree(
                Files.readAllBytes(publicRoot.resolve("lernzielbuch/index.json")));
        ObjectNode chemistry = (ObjectNode) index.withArray("books").get(2);
        assertThat(chemistry.path("bookId").asText()).isEqualTo("de-gym-chemie-lk");
        ((ObjectNode) chemistry.get("model")).put("sha256", "sha256:" + "0".repeat(64));
        ResourceLoader loader = publicationLoader(new HashSet<>(), mapper.writeValueAsBytes(index));
        assertThatThrownBy(() -> registry(loader))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Goal-book model hash mismatch");
    }

    private GoalFeedbackPublicationRegistry registry(ResourceLoader loader) {
        return new GoalFeedbackPublicationRegistry(mapper, new GoalFeedbackCanonicalJson(mapper),
                loader, mock(JdbcTemplate.class), mock(PlatformTransactionManager.class),
                "https://skillpilot.com");
    }

    private ResourceLoader publicationLoader(Set<String> loaded, byte[] indexOverride) {
        assertThat(Files.isDirectory(publicRoot)).isTrue();
        return new DefaultResourceLoader() {
            @Override
            public Resource getResource(String location) {
                assertThat(location).startsWith("classpath:static/lernzielbuch/");
                String relativePath = location.substring("classpath:static/".length());
                loaded.add(relativePath);
                if (indexOverride != null && relativePath.equals("lernzielbuch/index.json")) {
                    return new ByteArrayResource(indexOverride);
                }
                return new FileSystemResource(publicRoot.resolve(relativePath));
            }
        };
    }
}
