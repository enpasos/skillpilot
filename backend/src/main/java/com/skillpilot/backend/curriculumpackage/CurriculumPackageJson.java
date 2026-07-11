package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.StreamReadConstraints;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayDeque;
import java.util.Deque;

final class CurriculumPackageJson {

    private static final int MAX_NESTING_DEPTH = 128;
    private static final int MAX_ENTRY_BYTES = 64 * 1024 * 1024;
    private static final int MAX_NODES = 5_000_000;

    private CurriculumPackageJson() {
    }

    static ObjectMapper strictCopy(ObjectMapper source) {
        ObjectMapper mapper = source.copy();
        mapper.enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);
        mapper.enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);
        mapper.getFactory().setStreamReadConstraints(StreamReadConstraints.builder()
                .maxNestingDepth(MAX_NESTING_DEPTH)
                .maxDocumentLength(CurriculumPackageFileReader.MAX_CONTROL_BYTES)
                // A token cannot exceed the public 64 MiB entry ceiling. Schemas
                // and validator-v2 evidence constrain its actual semantics.
                .maxStringLength(MAX_ENTRY_BYTES)
                .maxNumberLength(MAX_ENTRY_BYTES)
                .build());
        return mapper;
    }

    static void validateTree(JsonNode root, String description) {
        Deque<NodeAtDepth> pending = new ArrayDeque<>();
        pending.push(new NodeAtDepth(root, 1));
        int nodes = 0;
        while (!pending.isEmpty()) {
            NodeAtDepth current = pending.pop();
            nodes += 1;
            if (nodes > MAX_NODES) {
                throw new CurriculumPackageException(
                        description + " exceeds the public " + MAX_NODES + " JSON-node limit");
            }
            if (current.depth() > MAX_NESTING_DEPTH) {
                throw new CurriculumPackageException(
                        description + " exceeds the public " + MAX_NESTING_DEPTH + " JSON-depth limit");
            }
            current.node().elements().forEachRemaining(
                    child -> pending.push(new NodeAtDepth(child, current.depth() + 1)));
        }
    }

    private record NodeAtDepth(JsonNode node, int depth) {
    }
}
