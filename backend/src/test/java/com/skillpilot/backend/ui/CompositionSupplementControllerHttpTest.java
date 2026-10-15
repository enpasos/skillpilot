package com.skillpilot.backend.ui;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.skillpilot.backend.api.CompositionSupplementOptions;
import com.skillpilot.backend.service.*;
import java.util.*;
import java.util.function.Supplier;
import org.junit.jupiter.api.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.MediaType;

/** First-party HTTP guards only; no OAuth/real-host acceptance implied. */
class CompositionSupplementControllerHttpTest {
    LearnerService learners; LearnerLifecycleService lifecycle; MockMvc mvc;
    @BeforeEach void setup() {
        learners = mock(LearnerService.class); lifecycle = mock(LearnerLifecycleService.class);
        doAnswer(call -> ((Supplier<?>)call.getArgument(1)).get()).when(lifecycle).withActivity(eq("TEST_ONLY"), org.mockito.ArgumentMatchers.<Supplier<Object>>any());
        var mapper = new ObjectMapper().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mvc = MockMvcBuilders.standaloneSetup(new LearnerUiController(learners, mock(ChatSessionService.class), lifecycle))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(mapper)).build();
        when(learners.getCompositionSupplementOptions("TEST_ONLY")).thenReturn(new CompositionSupplementOptions(List.of(), null));
        when(learners.applyCompositionSupplementOption("TEST_ONLY", "opaque_TEST_ONLY")).thenReturn(new CompositionSupplementOptions(List.of(), null));
    }
    @Test void readChecksActiveRouteAndNeverTouchesActivityOrWrites() throws Exception {
        mvc.perform(get("/api/ui/learners/TEST_ONLY/composition-supplement-options")).andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"));
        verify(learners).assertActiveLearnerRouteAccess("TEST_ONLY"); verifyNoInteractions(lifecycle);
        verify(learners, never()).applyCompositionSupplementOption(anyString(), anyString());
    }
    @Test void acceptsOnlyOpaqueChoiceAfterExistingWritableAndActivityGuard() throws Exception {
        mvc.perform(post("/api/ui/learners/TEST_ONLY/composition-supplement-options").contentType(MediaType.APPLICATION_JSON)
                .content("{\"optionId\":\"opaque_TEST_ONLY\"}")).andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"));
        var order = inOrder(learners); order.verify(learners).assertWritableLearningSession("TEST_ONLY");
        order.verify(learners).applyCompositionSupplementOption("TEST_ONLY", "opaque_TEST_ONLY");
        verify(lifecycle).withActivity(eq("TEST_ONLY"), org.mockito.ArgumentMatchers.<Supplier<Object>>any());
    }
    @Test void rawGoalsOrConfigAreRejectedEvenWithPermissiveGlobalJackson() throws Exception {
        mvc.perform(post("/api/ui/learners/TEST_ONLY/composition-supplement-options").contentType(MediaType.APPLICATION_JSON)
                .content("{\"optionId\":\"opaque_TEST_ONLY\",\"goalIds\":[\"arbitrary\"]}")).andExpect(status().isBadRequest());
        verify(learners, never()).applyCompositionSupplementOption(anyString(), anyString());
    }
}
