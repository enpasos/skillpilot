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
class RegisteredNativeSupplementAcceptanceTest {
    final ObjectMapper mapper=new ObjectMapper();
    @TempDir Path isolated;
    @Test void currentRegisteredNativeAcceptanceBindsBothOwnersAndRejectsExternalPhysicsPOnlyDrift() throws Exception {
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
        Path profile=repository.resolve(owner.path("reviewPath").asText());
        byte[] original=Files.readAllBytes(profile);
        // Detach ONLY the exact P file and its directory chain from the isolated
        // workspace's read-only source links. No Main source bytes are written.
        detachFile(repository,profile);
        try {
            List<String> lines=Files.readAllLines(profile);
            boolean changed=false;
            for(int i=0;i<lines.size();i++){
                JsonNode record=mapper.readTree(lines.get(i));
                if(physicsId.equals(record.path("goalId").asText())){
                    // Actual external P content changes, all old native fingerprints
                    // and the complete canonical Physics Goal remain untouched.
                    var object=(com.fasterxml.jackson.databind.node.ObjectNode)record;
                    var p=(com.fasterxml.jackson.databind.node.ObjectNode)object.get("profile");
                    var brief=(com.fasterxml.jackson.databind.node.ObjectNode)p.path("applicationCaseBriefs").get(1);
                    brief.put("taskDemandDe",brief.path("taskDemandDe").asText()+" TEST_ONLY: Die allgemeinen Additionstheoreme werden als Eingabe bereitgestellt.");
                    lines.set(i,mapper.writeValueAsString(object));changed=true;
                }
            }
            assertThat(changed).isTrue();Files.write(profile,lines);
            assertThat(CompositionSupplementService.sha(mapper.valueToTree(goal(repository,"PHYSIK",physicsId)))).isEqualTo(goalBefore);
            assertThatThrownBy(()->gate.requireAccepted(CompositionSupplementService.PHYSICS,physics)).hasMessageContaining("source/P/asset/code snapshot changed");
            assertThat(ReflectionTestUtils.getField(gate,"cached")).isNull();
        } finally { Files.write(profile,original); }
    }
    private Path isolatedRepository(Path source)throws Exception {
        // Temporary executable source only; no resource/dependency/cache copy and
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
        return isolated;
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
}
