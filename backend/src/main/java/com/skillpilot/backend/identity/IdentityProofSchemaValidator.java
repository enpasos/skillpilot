package com.skillpilot.backend.identity;

import static com.skillpilot.backend.identity.GoalIdentityService.require;

import com.fasterxml.jackson.databind.JsonNode;
import com.networknt.schema.InputFormat;
import com.networknt.schema.SchemaRegistry;
import com.networknt.schema.SpecificationVersion;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** Full Draft 2020-12 validation of already pinned schemas, with no external loader. */
final class IdentityProofSchemaValidator {
    private IdentityProofSchemaValidator() { }

    static void validate(JsonNode schema, JsonNode instance, String label) {
        require("https://json-schema.org/draft/2020-12/schema".equals(schema.path("$schema").asText()),
                "Unsupported identity schema dialect");
        requireLocalReferences(schema);
        try {
            var registry = SchemaRegistry.withDefaultDialect(SpecificationVersion.DRAFT_2020_12,
                    builder -> builder.schemaLoader(loader -> loader.fetchRemoteResources(false)
                            .resourceLoaders(resources -> resources.values(List::clear))));
            var compiled = registry.getSchema(json(schema), InputFormat.JSON);
            var errors = compiled.validate(json(instance), InputFormat.JSON);
            require(errors.isEmpty(), "Identity schema validation failed for " + label + ": "
                    + (errors.isEmpty() ? "" : errors.getFirst()));
        } catch (GoalIdentityException invalid) {
            throw invalid;
        } catch (RuntimeException invalid) {
            throw new GoalIdentityException("Identity schema validation failed for " + label + ": " + invalid.getMessage());
        }
    }

    private static String json(JsonNode value) {
        return new String(CanonicalIdentityJson.encode(value), StandardCharsets.UTF_8);
    }

    private static void requireLocalReferences(JsonNode schema) {
        if (schema.isObject()) {
            for (String keyword : List.of("$ref", "$dynamicRef", "$recursiveRef"))
                if (schema.has(keyword)) require(schema.get(keyword).isTextual()
                        && schema.get(keyword).textValue().startsWith("#"), "External identity schema reference forbidden");
        }
        if (schema.isContainerNode()) schema.forEach(IdentityProofSchemaValidator::requireLocalReferences);
    }
}
