package com.skillpilot.backend.service;
import static org.assertj.core.api.Assertions.*;
import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.*;
import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;
/** Genuine registered 807/478 native pipeline; no toy gate or accepted receipt injection. */
class CompositionSupplementNativeExecutableCorrectionTest {
    final ObjectMapper mapper=new ObjectMapper();
    @TempDir Path isolated;
    @Test void sanitizedOverridesAndActualInstalledCompilerMutationInvalidatePrivateNativeCache() throws Exception {
        Path repository=isolatedRepository(Path.of("..").toAbsolutePath().normalize());
        var gate=new RegisteredNativeSupplementAcceptance(repository,mapper);
        String physicsId="4c919da9-157a-5a14-a725-f7343975c9ab";
        LearningGoal math=goal(repository,"MATHEMATIK","01217f4a-5221-5df9-b379-7b241fccf809");
        LearningGoal physics=goal(repository,"PHYSIK",physicsId);
        String goalBefore=CompositionSupplementService.sha(mapper.valueToTree(physics));
        String mathAcceptance=gate.requireAccepted(CompositionSupplementService.MATH,math);
        String physicsAcceptance=gate.requireAccepted(CompositionSupplementService.PHYSICS,physics);
        assertThat(mathAcceptance).matches("[a-f0-9]{64}");assertThat(physicsAcceptance).matches("[a-f0-9]{64}");
        JsonNode cached=(JsonNode)ReflectionTestUtils.getField(gate,"cached");
        assertThat(cached.path("receipt").path("report").path("subjects").get(0).path("strictComplete").intValue()).isEqualTo(807);
        assertThat(cached.path("receipt").path("report").path("subjects").get(1).path("strictComplete").intValue()).isEqualTo(478);
        JsonNode owner=cached.path("receipt").path("goals").path(physicsId).path("positiveEvidenceOwner");
        assertThat(owner.path("profileFingerprint").asText()).startsWith("sha256:");
        assertThat(owner.path("reviewInputFingerprint").asText()).startsWith("sha256:");
        assertThat(owner.path("reviewAuthority").asText()).isEqualTo("ai_candidate"); // native machine authority, never human approval
        assertThat(gate.requireAccepted(CompositionSupplementService.PHYSICS,physics)).isEqualTo(physicsAcceptance);
        assertThat(ReflectionTestUtils.getField(gate,"cached")).isSameAs(cached); // private in-process cache reuse
        // Real authoritative non-curricular Kind remains outside807 ordinary P/D/A/M/V.
        var orientationProof=mapper.createObjectNode();
        for(String id:List.of("65365dce-f33f-49d8-9516-42f75883aa86","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2")) {
            LearningGoal orientation=goal(repository,"MATHEMATIK",id);
            assertThat(LearnerService.isOrientationGoal(orientation)).isTrue();
            String binding=gate.requireOrientationAccepted(CompositionSupplementService.MATH,orientation);
            assertThat(binding).matches("[a-f0-9]{64}");
            JsonNode context=gate.currentOrientationBindingsForQa().path(id);
            assertThat(CompositionSupplementService.sha(context)).isEqualTo(binding);
            assertThat(context.path("rawGoalSha256").asText()).isNotBlank();
            assertThat(context.path("completionContract").asText()).isEqualTo("orientation-binary-completion-v1");
            assertThat(context.path("receiptSha256").asText()).isEqualTo(cached.path("receiptSha256").asText());
            assertThat(cached.path("receipt").path("goals").has(id)).isFalse();
            assertThatThrownBy(()->gate.requireAccepted(CompositionSupplementService.MATH,orientation)).hasMessageContaining("not accepted");
            LearningGoal changed=goal(repository,"MATHEMATIK",id);changed.setTitle(changed.getTitle()+" TEST_ONLY changed whole Goal");
            assertThatThrownBy(()->gate.requireOrientationAccepted(CompositionSupplementService.MATH,changed)).hasMessageContaining("whole orientation Goal differs");
            assertThatThrownBy(()->gate.requireOrientationAccepted(CompositionSupplementService.PHYSICS,orientation)).hasMessageContaining("Only Math");
            for(String field:List.of("canonicalSourceBinding","semanticKindSourceBinding"))assertThat(cached.path("receipt").path("sourceInputs")).contains(context.path(field));
            orientationProof.set(id,context);
        }
        new CompositionSupplementSchemaValidator(repository.resolve("contracts/composition-supplement/v1"),mapper)
            .validate(orientationProof,"registered-orientation-context-bindings.schema.json");
        assertThat(gate.currentOrientationBindingsForQa()).isEqualTo(orientationProof);
        assertThat(ReflectionTestUtils.getField(gate,"cached")).isSameAs(cached);
        System.out.println("CURRENT_ORIENTATION_NATIVE_PROOF="+mapper.writeValueAsString(orientationProof));
        String orientationEvidence=System.getenv("SKILLPILOT_TEST_ORIENTATION_NATIVE_PROOF");
        if(orientationEvidence!=null)mapper.writeValue(Path.of(orientationEvidence).toFile(),orientationProof); // test-only output, never acceptance input
        Path override=optionalHostileOverride(System.getenv("ESBUILD_BINARY_PATH"));
        if(override!=null)assertThat(Files.exists(override.resolveSibling("invocations.log"))).isFalse();
        JsonNode receipt=cached.path("receipt");
        assertThat(receipt.path("receiptFormatVersion").asText()).isEqualTo("2.0");
        assertThat(receipt.path("executableInputs")).hasSize(2);
        JsonNode compiler=null;for(JsonNode input:receipt.path("executableInputs"))if(input.path("role").asText().equals("esbuild"))compiler=input;
        assertThat(compiler).isNotNull();Path executable=Path.of(compiler.path("path").asText());
        assertThat(executable.toRealPath()).startsWith(isolated);
        assertThat(receipt.path("executableLaunches")).anySatisfy(launch -> {
            assertThat(launch.path("role").asText()).isEqualTo("esbuild");assertThat(launch.path("args").get(0).asText()).startsWith("--service=");
        });
        if(override!=null)assertThat(receipt.path("executableLaunches").toString()).doesNotContain(override.toString());
        String platformMetadata="app/node_modules/@esbuild/linux-"+System.getProperty("os.arch").replace("amd64","x64")+"/package.json";
        assertThat(receipt.path("sourceInputs")).anySatisfy(input -> {
            assertThat(input.path("path").asText()).isEqualTo(platformMetadata);
            assertThat(input.path("kind").asText()).isEqualTo("file");
        });
        assertThat(receipt.path("sourceInputs")).anySatisfy(input -> {
            assertThat(input.path("path").asText()).isEqualTo("app/node_modules/tsx/package.json");
            assertThat(input.path("kind").asText()).isEqualTo("file");
        });
        assertThat(receipt.path("sourceInputs")).anySatisfy(input -> {
            assertThat(input.path("path").asText()).isEqualTo(platformMetadata.replace("/package.json","/bin/package.json"));
            assertThat(input.path("kind").asText()).isEqualTo("absent");
        });
        var proof=mapper.createObjectNode();proof.put("receiptSha256",cached.path("receiptSha256").asText());
        proof.set("subjects",cached.path("receipt").path("report").path("subjects"));
        proof.set("executableInputs",receipt.path("executableInputs"));proof.put("actualObservedLaunches",receipt.path("executableLaunches").size());
        proof.put("overrideWasNeverInvoked",true);proof.put("sourceInputCount",receipt.path("sourceInputs").size());
        proof.remove("subjects");System.out.println("CORRECTED_NATIVE_EXECUTABLE_PROOF="+mapper.writeValueAsString(proof));
        String evidencePath=System.getenv("SKILLPILOT_TEST_NATIVE_EXECUTABLE_PROOF");
        if(evidencePath!=null)mapper.writeValue(Path.of(evidencePath).toFile(),cached); // test-only output, never consumed as authority

        byte[] before=Files.readAllBytes(executable);
        try {
            byte[] mutated=before.clone();mutated[mutated.length-1]^=1;
            var modifiedBefore=Files.getLastModifiedTime(executable);Files.write(executable,mutated);Files.setLastModifiedTime(executable,modifiedBefore);
            assertThat(CompositionSupplementService.sha(mapper.valueToTree(goal(repository,"PHYSIK",physicsId)))).isEqualTo(goalBefore);
            assertThatThrownBy(()->gate.requireAccepted(CompositionSupplementService.PHYSICS,physics))
                .as("changing a demonstrated transitive compiler executable must invalidate native authorization")
                .isInstanceOf(IllegalStateException.class);
        } finally { Files.write(executable,before); }
    }
    // Ordinary CI has no compiler override. Configured hostile-parent replays
    // retain their extra non-invocation assertions; native acceptance/mutation
    // checks above always execute in both modes.
    private static Path optionalHostileOverride(String value) {
        return value==null||value.isBlank()?null:Path.of(value);
    }
    @Test void absentAndBlankParentOverrideDoNotRequireExternalWrapperFixture() {
        assertThat(optionalHostileOverride(null)).isNull();
        assertThat(optionalHostileOverride("")).isNull();
        assertThat(optionalHostileOverride("  ")).isNull();
        assertThat(optionalHostileOverride("/TEST_ONLY/explicit-hostile-wrapper")).isEqualTo(Path.of("/TEST_ONLY/explicit-hostile-wrapper"));
    }
    private Path isolatedRepository(Path source)throws Exception {
        // Temporary executable source with confined task-material; no cache copy and
        // no possibility of mutating an adopted/Main curriculum during P drift.
        try(var entries=Files.list(source)){for(Path entry:entries.toList())if(!entry.getFileName().toString().equals("app"))
            Files.createSymbolicLink(isolated.resolve(entry.getFileName()),entry);}
        Path app=Files.createDirectory(isolated.resolve("app"));
        try(var entries=Files.list(source.resolve("app"))){for(Path entry:entries.toList())if(!entry.getFileName().toString().equals("scripts"))
            Files.createSymbolicLink(app.resolve(entry.getFileName()),entry);}
        Path scriptRoot=source.resolve("app/scripts");
        try(var files=Files.walk(scriptRoot)){for(Path entry:files.toList()){
            Path target=app.resolve("scripts").resolve(scriptRoot.relativize(entry));
            if(Files.isDirectory(entry))Files.createDirectories(target);else Files.copy(entry,target);
        }}
        // Detach only the three actually executing compiler/loader packages.
        Path modules=app.resolve("node_modules"),real=modules.toRealPath();Files.delete(modules);Files.createDirectory(modules);
        try(var children=Files.list(real)){for(Path child:children.toList())Files.createSymbolicLink(modules.resolve(child.getFileName()),child);}
        for(String name:List.of("tsx","esbuild"))copyPackage(modules.resolve(name));
        Path scope=modules.resolve("@esbuild"),scopeReal=scope.toRealPath();Files.delete(scope);Files.createDirectory(scope);
        try(var children=Files.list(scopeReal)){for(Path child:children.toList())Files.createSymbolicLink(scope.resolve(child.getFileName()),child);}
        copyPackage(scope.resolve("linux-x64"));
        // Required task-material must be real files inside this fixture, just as
        // in a checkout. Keep the production real-path escape checks intact.
        for(String materialRoot:List.of("app/public/assets/task-material","curricula/DE/Gymnasium/task-material")) {
            try(var files=Files.walk(source.resolve(materialRoot))){for(Path file:files.filter(Files::isRegularFile).toList()) {
                Path target=isolated.resolve(source.relativize(file));
                detachFile(isolated,target);
                assertThat(target.toRealPath()).startsWith(isolated.toRealPath());
                assertThat(Files.isSymbolicLink(target)).isFalse();
                assertThat(Files.readAllBytes(target)).isEqualTo(Files.readAllBytes(file));
            }}
        }
        return isolated;
    }
    private void copyPackage(Path target)throws Exception {
        Path original=target.toRealPath();Files.delete(target);Files.createDirectory(target);
        try(var files=Files.walk(original)){for(Path source:files.toList()){
            Path destination=target.resolve(original.relativize(source));if(Files.isDirectory(source))Files.createDirectories(destination);else Files.copy(source,destination,StandardCopyOption.COPY_ATTRIBUTES);
        }}
    }
    private LearningGoal goal(Path repository,String subject,String id)throws Exception {
        for(JsonNode goal:mapper.readTree(repository.resolve("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_"+subject+".de.json").toFile()).path("goals"))
            if(id.equals(goal.path("id").asText()))return mapper.treeToValue(goal,LearningGoal.class);
        throw new IllegalStateException("Current native fixture goal absent");
    }
    private void detachFile(Path repository,Path target)throws Exception {
        Path current=repository;
        for(Path part:repository.relativize(target.getParent())){
            current=current.resolve(part);
            if(Files.isSymbolicLink(current)){
                Path real=current.toRealPath();Files.delete(current);Files.createDirectory(current);
                try(var children=Files.list(real)){for(Path child:children.toList())Files.createSymbolicLink(current.resolve(child.getFileName()),child);}
            }
        }
        if(Files.isSymbolicLink(target)){byte[] bytes=Files.readAllBytes(target);Files.delete(target);Files.write(target,bytes);}
    }
    @Test void arbitraryAuthorReceiptsOrMissingProducerCannotCreateNativeAuthority(){
        Path missing=Path.of("../TEST_ONLY_no_native_producer").toAbsolutePath();
        var gate=new RegisteredNativeSupplementAcceptance(missing,mapper);
        LearningGoal goal=new LearningGoal();goal.setId("TEST_ONLY_wrong_goal");
        assertThatThrownBy(()->gate.requireAccepted(CompositionSupplementService.MATH,goal)).hasMessageContaining("producer/Node/tsx support is unavailable");
    }
    @Test void packageExportsMutationInvalidatesTrackedMetadataCachePrimitive() throws Exception {
        Path metadata=isolated.resolve("TEST_ONLY_package.json");Files.writeString(metadata,"{\"name\":\"TEST_ONLY\",\"exports\":\"./old.js\"}");
        var gate=new RegisteredNativeSupplementAcceptance(isolated,mapper);
        String before=ReflectionTestUtils.invokeMethod(gate,"signature",metadata);
        ReflectionTestUtils.setField(gate,"signatures",Map.of(metadata,before));
        var time=Files.getLastModifiedTime(metadata);Files.writeString(metadata,"{\"name\":\"TEST_ONLY\",\"exports\":\"./new.js\"}");Files.setLastModifiedTime(metadata,time);
        assertThat((Boolean)ReflectionTestUtils.invokeMethod(gate,"fresh")).isFalse();
        // Freshness primitive only. The genuine native test above separately
        // requires this metadata in its actual accepted sourceInputs.
    }
    @Test void sameBytesAtomicReplacementInvalidatesFileIdentityCache() throws Exception {
        Path file=isolated.resolve("TEST_ONLY_same_bytes_binary");Files.write(file,new byte[]{127,69,76,70,1});
        var gate=new RegisteredNativeSupplementAcceptance(isolated,mapper);
        String before=ReflectionTestUtils.invokeMethod(gate,"signature",file);
        Path replacement=isolated.resolve("TEST_ONLY_replacement");Files.write(replacement,Files.readAllBytes(file));
        Files.setLastModifiedTime(replacement,Files.getLastModifiedTime(file));Files.move(replacement,file,StandardCopyOption.REPLACE_EXISTING,StandardCopyOption.ATOMIC_MOVE);
        ReflectionTestUtils.setField(gate,"signatures",Map.of(file,before));
        assertThat((Boolean)ReflectionTestUtils.invokeMethod(gate,"fresh")).isFalse();
        // Metadata/cache primitive only; no native authority or receipt is injected.
    }
}
