package com.skillpilot.backend.connectors.gemini.v1;

import static org.junit.jupiter.api.Assertions.*;

import com.skillpilot.backend.connectors.gemini.v1.persistence.GeminiV1IdempotencyRepository;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionRepository;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionService;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1SessionTokenCodec;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1CoachUiController;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        "skillpilot.gemini.connector.v1.enabled=false",
        "skillpilot.claude.connector.v1.enabled=false",
        "skillpilot.claude.enabled=false",
        "skillpilot.openai.coach.v1.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:gemini-v1-disabled;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
class GeminiV1DisabledContextTest {
    @Autowired private ApplicationContext context;
    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping mappings;

    @Test void disabledGeminiRegistersOnlyItsInertPropertiesAndNoOperationalBeansOrRoutes() {
        assertFalse(context.getBean(GeminiV1Properties.class).isEnabled());
        for (Class<?> type : List.of(GeminiV1LearningSessionRepository.class, GeminiV1LearningSessionService.class,
                GeminiV1SessionTokenCodec.class, GeminiV1IdempotencyRepository.class, GeminiV1CoachUiController.class)) {
            assertEquals(0, context.getBeanNamesForType(type).length, type.getSimpleName());
        }
        assertFalse(context.containsBean("validateGeminiV1Runtime"));
        assertTrue(context.getBeanNamesForType(org.springframework.security.web.SecurityFilterChain.class).length > 0);
        assertTrue(mappings.getHandlerMethods().keySet().stream()
                .noneMatch(mapping -> mapping.toString().contains("/gemini/v1")));
    }
}
