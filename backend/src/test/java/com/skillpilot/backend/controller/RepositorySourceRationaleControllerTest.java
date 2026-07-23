package com.skillpilot.backend.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.handler;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.service.DeckResourceService;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class RepositorySourceRationaleControllerTest {

    private static final String MATH_PATH = "/data/goal-source-rationales-math-public.json";
    private static final String PHYSICS_PATH = "/data/goal-source-rationales-physics-public.json";

    private final ResourceLoader resourceLoader = mock(ResourceLoader.class);
    private final DeckResourceService deckResourceService = mock(DeckResourceService.class);
    private final RepositorySourceRationaleController controller =
            new RepositorySourceRationaleController(resourceLoader);
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(controller, new DeckDataController(deckResourceService))
            .build();

    @Test
    void exactSourceRationaleRoutesTakePrecedenceOverGenericDeckRoute() throws Exception {
        when(resourceLoader.getResource(
                        "classpath:/static/data/goal-source-rationales-math-public.json"))
                .thenReturn(jsonResource("{\"subject\":\"math\"}"));
        when(resourceLoader.getResource(
                        "classpath:/static/data/goal-source-rationales-physics-public.json"))
                .thenReturn(jsonResource("{\"subject\":\"physics\"}"));

        mockMvc.perform(get(MATH_PATH))
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(RepositorySourceRationaleController.class))
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(content().json("{\"subject\":\"math\"}"))
                .andExpect(header().string("Cache-Control", "no-store"));
        mockMvc.perform(get(PHYSICS_PATH))
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(RepositorySourceRationaleController.class))
                .andExpect(content().json("{\"subject\":\"physics\"}"));

        verifyNoInteractions(deckResourceService);
    }

    @Test
    void missingCompatibilityIndexFailsClosed() throws Exception {
        when(resourceLoader.getResource(
                        "classpath:/static/data/goal-source-rationales-math-public.json"))
                .thenReturn(jsonResource("", false));

        mockMvc.perform(get(MATH_PATH))
                .andExpect(status().isNotFound());
    }

    private static ByteArrayResource jsonResource(String body) {
        return jsonResource(body, true);
    }

    private static ByteArrayResource jsonResource(String body, boolean readable) {
        return new ByteArrayResource(body.getBytes(StandardCharsets.UTF_8)) {
            @Override
            public boolean isReadable() {
                return readable;
            }
        };
    }
}
