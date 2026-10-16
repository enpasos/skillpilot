package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.*;
import java.nio.file.*;
import java.util.*;

/** Fixed repository-only read-only QA bridge. No Spring/DB/learner context,
 * input receipt, configurable producer, selection mutation or publication. */
public final class CompositionSupplementQaExporter {
    public static final String CONTRACT = "registered-composition-supplement-qa-v3";
    public static void main(String[] args) throws Exception {
        if (args.length != 0) throw new IllegalArgumentException("No receipt/configuration argument is accepted");
        Path repository = Path.of("").toAbsolutePath().normalize().getParent();
        if (!Files.isRegularFile(repository.resolve("AGENTS.md"))) throw new IllegalStateException("Run the fixed exportCompositionSupplementQa task from backend");
        ObjectMapper mapper = new ObjectMapper();
        Path artifacts=repository.resolve("curricula/DE/Gymnasium/composition-supplements/mathematik");
        Path authoredCurrent=repository.resolve("curricula");
        for(Path part:authoredCurrent.relativize(artifacts)){authoredCurrent=authoredCurrent.resolve(part);if(Files.isSymbolicLink(authoredCurrent))throw new IllegalStateException("QA authored directory contains symlink");}
        if(Files.exists(artifacts)&&!Files.isDirectory(artifacts))throw new IllegalStateException("QA authored directory is not a directory");
        boolean any=false;
        if(Files.exists(artifacts))try(var files=Files.walk(artifacts)){any=files.anyMatch(path->path.toString().endsWith(".supplement.json"));}
        if(!any){System.out.println("SKILLPILOT_SUPPLEMENT_QA_V3="+mapper.writeValueAsString(Map.of("contractVersion",CONTRACT,"bundles",List.of(),"nativeSnapshot",mapper.nullNode(),"orientationContextBindings",Map.of())));return;}

        LandscapeProperties properties = new LandscapeProperties(); properties.setDirectory(repository.resolve("curricula").toRealPath().toString());
        LandscapeService landscapes = new LandscapeService(properties, mapper);
        RegisteredNativeSupplementAcceptance nativeGate = new RegisteredNativeSupplementAcceptance(repository, mapper);
        CompositionSupplementService supplements = new CompositionSupplementService(properties, mapper, landscapes, nativeGate,
                repository.resolve("contracts/composition-supplement/v1"));
        CompositionViewService views = new CompositionViewService(properties, mapper, () -> {
            Map<String,List<String>> graph = new LinkedHashMap<>();
            landscapes.getAll().forEach(landscape -> landscape.getGoals().forEach(goal -> graph.put(goal.getId(),
                    goal.getContains() == null ? List.of() : List.copyOf(goal.getContains())))); return graph;
        });
        views.setSupplementService(supplements);
        Map<String,Object> exported = nativeGate.withSnapshot(() -> {
            List<CompositionSupplementService.Supplement> admitted = supplements.validatedSupplements();
            List<Map<String,Object>> bundles = exportAdmitted(repository, mapper, admitted, views);
            JsonNode nativeSnapshot = nativeGate.currentSnapshotForQa();
            JsonNode orientationBindings=nativeGate.currentOrientationBindingsForQa();
            new CompositionSupplementSchemaValidator(repository.resolve("contracts/composition-supplement/v1"),mapper)
                .validate(orientationBindings,"registered-orientation-context-bindings.schema.json");
            return Map.of("contractVersion", CONTRACT, "bundles", bundles, "nativeSnapshot", nativeSnapshot,"orientationContextBindings",orientationBindings);
        });
        System.out.println("SKILLPILOT_SUPPLEMENT_QA_V3=" + mapper.writeValueAsString(exported));
    }

    private record OwnedJson(JsonNode value,String bytesSha256) {}
    private static Path ownedPath(Path root,Path input)throws java.io.IOException {
        Path absolute=input.toAbsolutePath().normalize(),boundary=root.toAbsolutePath().normalize();
        if(!absolute.startsWith(boundary)||absolute.equals(boundary))throw new IllegalStateException("QA authorization path escapes curriculum root");
        Path current=boundary;for(Path part:boundary.relativize(absolute)){current=current.resolve(part);if(Files.isSymbolicLink(current))throw new IllegalStateException("QA authorization path contains symlink");}
        if(!absolute.toRealPath().startsWith(boundary.toRealPath())||!Files.isRegularFile(absolute))throw new IllegalStateException("QA authorization real path escapes curriculum root");
        return absolute;
    }
    private static OwnedJson readOwnedBytes(ObjectMapper mapper,Path root,Path input)throws java.io.IOException {
        byte[] bytes=Files.readAllBytes(ownedPath(root,input));
        ownedPath(root,input); // the source must still be owned after the byte read
        return new OwnedJson(mapper.readTree(bytes),CompositionSupplementService.hashBytes(bytes));
    }
    private static JsonNode readOwned(ObjectMapper mapper,Path root,Path input)throws java.io.IOException {
        return readOwnedBytes(mapper,root,input).value();
    }
    /** Testable post-native boundary; callers cannot turn this into an admission endpoint. */
    static List<Map<String,Object>> exportAdmitted(Path repository, ObjectMapper mapper,
            List<CompositionSupplementService.Supplement> admitted, CompositionViewService views) {
        Map<String,Path> authored = new LinkedHashMap<>();
        Path root = repository.resolve("curricula");
        Path directory = root.resolve("DE/Gymnasium/composition-supplements/mathematik");
        try (var paths = Files.walk(directory)) {
            for (Path path : paths.filter(Files::isRegularFile).filter(p -> p.toString().endsWith(".supplement.json")).toList()) {
                JsonNode raw = readOwned(mapper,root,path); String id=raw.path("supplementId").asText();
                if (authored.putIfAbsent(id,path)!=null) throw new IllegalStateException("Duplicate authored supplement identity");
            }
            List<Map<String,Object>> result = new ArrayList<>();
            for (var supplement:admitted) {
                views.validateSupplementContext(supplement,supplement.scope(),supplement.physicsScope(),true);
                Path file=authored.get(supplement.id());
                if(file==null)throw new IllegalStateException("Admitted supplement disappeared");
                OwnedJson authoredInput=readOwnedBytes(mapper,root,file);JsonNode document=authoredInput.value();
                Path reviewPath=root.resolve(document.path("reviewPath").asText()).normalize();
                OwnedJson reviewInput=readOwnedBytes(mapper,root,reviewPath);JsonNode review=reviewInput.value();
                CompositionSupplementSchemaValidator schemas=new CompositionSupplementSchemaValidator(repository.resolve("contracts/composition-supplement/v1"),mapper);
                for(JsonNode authorization:review.path("targetAuthorizations"))if("regular-mathematics-source-backed".equals(authorization.path("classification").asText())) {
                    JsonNode regular=readOwned(mapper,root,root.resolve(authorization.path("regularMathematicsSourceReview").path("path").asText()));
                    JsonNode context=readOwned(mapper,root,root.resolve(regular.path("reviewEvidence").path("path").asText()));
                    schemas.validate(context,"whole-mathematics-source-scope-review.schema.json");
                }
                String digest=CompositionSupplementService.sha(mapper.valueToTree(Map.of("supplement",document,"review",review)));
                if(!supplement.authorizationSha256().equals(digest))throw new IllegalStateException("Supplement changed during QA export");
                Map<String,Object> row=new LinkedHashMap<>();row.put("supplement",supplement);row.put("authoredDocument",document);row.put("review",review);
                row.put("authoredPath",repository.relativize(file).toString().replace('\\','/'));
                row.put("reviewPath",repository.relativize(reviewPath).toString().replace('\\','/'));
                JsonNode inputBindings=mapper.valueToTree(Map.of(
                    "authoredDocument",Map.of("path",row.get("authoredPath"),"sha256",authoredInput.bytesSha256()),
                    "review",Map.of("path",row.get("reviewPath"),"sha256",reviewInput.bytesSha256())));
                schemas.validate(inputBindings,"registered-authored-review-byte-bindings.schema.json");
                row.put("authoredInputBindings",inputBindings);
                row.put("mathBaseView",views.findLearnerScopeView(CompositionSupplementService.MATH,supplement.scope()));
                row.put("physicsView",views.findLearnerScopeView(CompositionSupplementService.PHYSICS,supplement.physicsScope()));
                result.add(Collections.unmodifiableMap(row));
            }
            if(result.size()!=authored.size())throw new IllegalStateException("QA export omitted an authored artifact");
            return List.copyOf(result);
        } catch(java.io.IOException exception) {throw new IllegalStateException("Current authored supplement QA export unavailable",exception);}
    }
}
