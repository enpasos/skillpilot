package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.service.CompositionViewService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class CompositionViewUiControllerTest {

    @Test
    void resolvesOnlyKnownOfferingIds() {
        CompositionViewService service = mock(CompositionViewService.class);
        Map<String, Object> view = Map.of("viewId", "view-1");
        when(service.findOfferingById("offering-1")).thenReturn(view);
        when(service.findOfferingById("unknown")).thenReturn(null);
        CompositionViewUiController controller = new CompositionViewUiController(service);

        assertThat(controller.resolveOffering("offering-1").getBody()).isEqualTo(view);
        assertThat(controller.resolveOffering("unknown").getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void matchEndpointUsesTheLearnerScopeResolver() throws Exception {
        CompositionViewService service = mock(CompositionViewService.class);
        Map<String, String> requestedScope = Map.of(
                "schoolForm", "Gymnasium",
                "jurisdiction", "DE-HE",
                "stage", "CrossStage",
                "courseProfile", "GK");
        when(service.findLearnerScopeView("landscape-1", requestedScope))
                .thenReturn(Map.of("viewId", "cross-stage-view"));
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new CompositionViewUiController(service))
                .build();

        mockMvc.perform(get("/api/ui/composition-views/match")
                        .param("landscapeId", "landscape-1")
                        .param("schoolForm", "Gymnasium")
                        .param("jurisdiction", "DE-HE")
                        .param("stage", "CrossStage")
                        .param("courseProfile", "GK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.viewId").value("cross-stage-view"));

        verify(service).findLearnerScopeView("landscape-1", requestedScope);
        verify(service, never()).findMatchingView(anyString(), anyMap());
    }

    @Test
    void matchReturnsNoContentForUnsupportedLearnerScope() {
        CompositionViewService service = mock(CompositionViewService.class);
        when(service.findLearnerScopeView(
                        "landscape-1",
                        Map.of("courseProfile", "GK+LK")))
                .thenReturn(null);
        CompositionViewUiController controller = new CompositionViewUiController(service);

        assertThat(controller.matchCompositionView(
                                "landscape-1",
                                Map.of("landscapeId", "landscape-1", "courseProfile", "GK+LK"))
                        .getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);
    }
}
