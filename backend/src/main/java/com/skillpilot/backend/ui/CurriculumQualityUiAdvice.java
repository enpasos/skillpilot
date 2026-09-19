package com.skillpilot.backend.ui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.service.CurriculaService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/** First-party presentation projection only; shared coach DTOs and provider contracts stay unchanged. */
@RestControllerAdvice(assignableTypes = {LandscapeUiController.class, LearnerUiController.class})
public class CurriculumQualityUiAdvice implements ResponseBodyAdvice<Object> {
    private final CurriculaService curricula;
    private final ObjectMapper mapper;
    private volatile Map<String, JsonNode> cachedProjection = Map.of();
    private volatile long validUntilMillis;
    private volatile String sourceRevision;

    public CurriculumQualityUiAdvice(CurriculaService curricula, ObjectMapper mapper) {
        this.curricula = curricula;
        this.mapper = mapper;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return LandscapeOverviewResponse.class.equals(returnType.getParameterType())
                || PersonalizationPlan.class.equals(returnType.getParameterType());
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request, ServerHttpResponse response) {
        if (!(body instanceof LandscapeOverviewResponse) && !(body instanceof PersonalizationPlan)) return body;
        JsonNode decorated = mapper.valueToTree(body);
        boolean current = System.currentTimeMillis() < validUntilMillis
                && java.util.Objects.equals(sourceRevision, curricula.publicQualityRevision());
        decorate(decorated, current ? cachedProjection : Map.of());
        // Neutral maps serialize correctly with both Jackson 2 and Jackson 3 MVC converters.
        return mapper.convertValue(decorated, Object.class);
    }

    /** Never scan learners, masteries, or practice fingerprints on a cockpit response. */
    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 60000, initialDelay = 1000)
    public void refreshProjection() {
        // A failed or interrupted refresh must never leave an old green approval indefinitely.
        validUntilMillis = 0;
        String revisionBefore = curricula.publicQualityRevision();
        Map<String, JsonNode> quality = new LinkedHashMap<>();
        for (var curriculum : curricula.getSnapshot().curricula()) {
            ObjectNode projection = mapper.createObjectNode();
            projection.put("qualityMaturity", curriculum.qualityMaturity());
            projection.put("qualityStatus", curriculum.qualityStatus());
            projection.set("humanTrial", mapper.valueToTree(curriculum.humanTrial()));
            projection.put("humanTrialSubjectCount", curriculum.humanTrialSubjectCount());
            projection.set("subjectQuality", mapper.valueToTree(curriculum.subjectQuality()));
            quality.put(curriculum.curriculumId(), projection);
            for (var subject : curriculum.subjectQuality()) {
                ObjectNode subjectProjection = mapper.createObjectNode();
                subjectProjection.put("qualityMaturity", subject.maturity());
                subjectProjection.put("qualityStatus", subject.qualityStatus());
                subjectProjection.set("humanTrial", mapper.valueToTree(subject.humanTrial()));
                quality.put(subject.landscapeId(), subjectProjection);
            }
        }
        if (!java.util.Objects.equals(revisionBefore, curricula.publicQualityRevision())) return;
        cachedProjection = Map.copyOf(quality);
        sourceRevision = revisionBefore;
        validUntilMillis = System.currentTimeMillis() + 65000;
    }

    private void decorate(JsonNode node, Map<String, JsonNode> quality) {
        if (node.isArray()) {
            node.forEach(child -> decorate(child, quality));
        } else if (node instanceof ObjectNode object) {
            object.elements().forEachRemaining(child -> decorate(child, quality));
            String id = object.path("landscapeId").asText(object.path("curriculumId").asText(null));
            if (id == null) return;
            JsonNode projection = quality.get(id);
            if (projection == null) {
                object.putNull("qualityMaturity");
                object.putNull("qualityStatus");
            } else {
                projection.fields().forEachRemaining(field -> object.set(field.getKey(), field.getValue()));
            }
        }
    }
}
