package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.service.CompositionViewService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

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
    void matchReturnsNoContentForUnsupportedExactScope() {
        CompositionViewService service = mock(CompositionViewService.class);
        when(service.findMatchingView(
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
