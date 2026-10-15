package com.skillpilot.backend.service;
import com.fasterxml.jackson.databind.*;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.time.Duration;
import java.util.concurrent.*;
/** Repository-only, process-owned admission cache. No authored receipt path,
 * configuration override, disk acceptance cache or new credentials are accepted. */
public final class RegisteredNativeSupplementAcceptance implements NativeSupplementAcceptanceGate {
    private final Path repository; private final ObjectMapper mapper;
    private JsonNode cached; private Map<Path,String> signatures;
    private final ThreadLocal<JsonNode> activeSnapshot = new ThreadLocal<>();
    private final Map<String,JsonNode> canonicalGoals = new LinkedHashMap<>();
    @Override public synchronized <T> T withSnapshot(java.util.function.Supplier<T> action) {
        if(activeSnapshot.get()!=null)return action.get();
        activeSnapshot.set(current());
        try { T result=action.get();if(!fresh()){cached=null;signatures=null;canonicalGoals.clear();throw new IllegalStateException("Native source/P/asset/code changed during admission");}return result; }
        finally { activeSnapshot.remove(); }
    }
    private static final Set<String> CHECKS=Set.of("semantic-kind-scope","description-review-validation","positive-evidence-validation","semantic-atomicity-check","memory-card-check","visualization-freshness-and-approval-check");
    private static final String CONFIG="curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json";
    public RegisteredNativeSupplementAcceptance(Path repository,ObjectMapper mapper){this.repository=repository.toAbsolutePath().normalize();this.mapper=mapper;}
    @Override public synchronized String requireAccepted(String owner,LearningGoal goal){
        JsonNode envelope=activeSnapshot.get()==null?current():activeSnapshot.get(); JsonNode receipt=envelope.get("receipt"); JsonNode nativeGoal=receipt.path("goals").path(goal.getId());
        require(owner.equals(nativeGoal.path("landscapeId").asText()),"goal is not accepted in the registered native owner");
        try{
            Path canonical=resolve(nativeGoal.path("landscapePath").asText());
            if(!canonicalGoals.containsKey(goal.getId()))for(JsonNode raw:mapper.readTree(canonical.toFile()).path("goals"))canonicalGoals.put(raw.path("id").asText(),raw);
            JsonNode rawGoal=canonicalGoals.get(goal.getId());
            require(rawGoal!=null&&CompositionSupplementService.sha(rawGoal).equals(nativeGoal.path("rawGoalSha256").asText()),"canonical native Goal binding drift");
            LearningGoal source=mapper.treeToValue(rawGoal,LearningGoal.class);
            require(CompositionSupplementService.sha(mapper.valueToTree(source)).equals(CompositionSupplementService.sha(mapper.valueToTree(goal))),"runtime complete Goal/P differs from the native accepted canonical");
            JsonNode positive=nativeGoal.path("positiveEvidenceOwner");
            require(owner.equals(positive.path("landscapeId").asText())&&!positive.path("configPath").asText().isBlank()
                    &&!positive.path("reviewPath").asText().isBlank()&&!positive.path("profileFingerprint").asText().isBlank()
                    &&!positive.path("reviewInputFingerprint").asText().isBlank(),"current external P owner/profile binding missing");
            return CompositionSupplementService.sha(mapper.valueToTree(Map.of("receiptSha256",envelope.path("receiptSha256").asText(),"nativeGoal",nativeGoal)));
        }catch(java.io.IOException e){throw new IllegalStateException("Native canonical goal unavailable",e);}
    }
    private JsonNode current(){
        if(cached!=null){if(!fresh()){cached=null;signatures=null;canonicalGoals.clear();throw new IllegalStateException("Native acceptance source/P/asset/code snapshot changed; current preparation authorization is stale");}return cached;}
        Path producer=resolve("app/scripts/runCompositionSupplementNativeAcceptance.cjs");
        Path tsx=resolve("app/node_modules/tsx/dist/cli.mjs");
        require(Files.isRegularFile(producer)&&Files.isRegularFile(tsx),"Repository native producer/Node/tsx support is unavailable; installed receipts are unsupported");
        Process process=null;
        try{
            Path nodeExecutable=resolveNodeExecutable();
            String nodeIdentityBefore=signature(nodeExecutable),bootstrapIdentityBefore=signature(producer);
            String nodeBefore=CompositionSupplementService.hashBytes(Files.readAllBytes(nodeExecutable));
            String bootstrapBefore=CompositionSupplementService.hashBytes(Files.readAllBytes(producer));
            ProcessBuilder builder=new ProcessBuilder(nodeExecutable.toString(),producer.toString()).directory(repository.toFile());
            Map<String,String> inherited=new LinkedHashMap<>(builder.environment());builder.environment().clear();
            for(String name:List.of("PATH","HOME","TMPDIR","TMP","TEMP","LANG","LC_ALL","LANGUAGE"))if(inherited.containsKey(name))builder.environment().put(name,inherited.get(name));
            builder.environment().put("TSX_DISABLE_CACHE","1");builder.environment().put("NO_COLOR","1");
            process=builder.start();
            final Process running=process;
            var stdout=CompletableFuture.supplyAsync(()->readBounded(running.getInputStream()));
            var stderr=CompletableFuture.supplyAsync(()->readBounded(running.getErrorStream()));
            require(process.waitFor(Duration.ofMinutes(4).toMillis(),TimeUnit.MILLISECONDS),"registered native validation timed out");
            byte[] output=stdout.get(5,TimeUnit.SECONDS);byte[] errors=stderr.get(5,TimeUnit.SECONDS);
            require(process.exitValue()==0,"registered native Kind/D/P/A/M/V producer failed");
            JsonNode envelope=mapper.readTree(output);validateEnvelope(envelope);
            require(nodeIdentityBefore.equals(signature(nodeExecutable))&&bootstrapIdentityBefore.equals(signature(producer))
                    &&nodeBefore.equals(envelope.path("receipt").path("runtime").path("nodeExecutableSha256").asText())
                    &&bootstrapBefore.equals(CompositionSupplementService.hashBytes(Files.readAllBytes(producer))),"Node/bootstrap changed before or during actual execution");
            Map<Path,String> observed=new LinkedHashMap<>();
            for(JsonNode input:envelope.path("receipt").path("sourceInputs")){
                Path path=resolve(input.path("path").asText());verifyInput(path,input);observed.put(path,signature(path));
            }
            JsonNode runtime=envelope.path("receipt").path("runtime");
            Path node=Path.of(runtime.path("nodeExecutable").asText());
            require(node.isAbsolute()&&CompositionSupplementService.hashBytes(Files.readAllBytes(node)).equals(runtime.path("nodeExecutableSha256").asText()),"native Node executable changed");
            observed.put(node,signature(node));
            Set<String> executableRoles=new HashSet<>();
            for(JsonNode executable:envelope.path("receipt").path("executableInputs")){
                Path file=Path.of(executable.path("path").asText());
                require(file.isAbsolute()&&Files.isExecutable(file)&&file.toRealPath().toString().equals(executable.path("realPath").asText()),"native executable realPath drift");
                byte[] bytes=Files.readAllBytes(file);
                require(isElf(bytes)&&CompositionSupplementService.hashBytes(bytes).equals(executable.path("sha256").asText()),"native executable/wrapper bytes differ");
                require(executableRoles.add(executable.path("role").asText()),"duplicate executable role");observed.put(file,signature(file));
            }
            require(executableRoles.equals(Set.of("node","esbuild")),"missing actual supported executable bindings");
            require(!observed.isEmpty(),"empty native source bindings");
            cached=envelope;signatures=Map.copyOf(observed);return cached;
        }catch(Exception exception){if(process!=null&&process.isAlive())process.destroyForcibly();throw new IllegalStateException("Current registered native acceptance is unavailable; ordinary curricula are unchanged",exception);}
    }
    private void validateEnvelope(JsonNode envelope){
        new CompositionSupplementSchemaValidator(repository.resolve("contracts/composition-supplement/v1"),mapper)
                .validate(envelope,"native-acceptance-receipt.schema.json");
        require(envelope!=null&&envelope.isObject()&&envelope.size()==2&&envelope.has("receipt")&&envelope.has("receiptSha256"),"invalid native receipt envelope");
        JsonNode receipt=envelope.get("receipt");
        require("2.0".equals(receipt.path("receiptFormatVersion").asText())&&"registered-gymnasium-native-acceptance-v2".equals(receipt.path("producerContract").asText())&&CONFIG.equals(receipt.path("configPath").asText()),"invalid fixed native producer identity");
        require(CompositionSupplementService.sha(receipt).equals(envelope.path("receiptSha256").asText()),"native receipt digest mismatch");
        JsonNode report=receipt.path("report");require(report.path("blockingIssueCount").isInt()&&report.path("blockingIssueCount").intValue()==0,"native acceptance has blocking issues");
        Set<String> owners=new HashSet<>();
        for(JsonNode subject:report.path("subjects")){
            String owner=subject.path("landscapeId").asText();require(owners.add(owner),"duplicate native owner");
            int floor=owner.equals(CompositionSupplementService.MATH)?807:owner.equals(CompositionSupplementService.PHYSICS)?478:Integer.MAX_VALUE;
            int denominator=subject.path("denominator").asInt(-1);
            require(denominator>=floor&&subject.path("strictCompletionReady").asBoolean()&&subject.path("issues").isArray()&&subject.path("issues").isEmpty(),"native owner is not strictly complete");
            Set<String> ids=new HashSet<>();for(JsonNode id:subject.path("currentGoalIds"))require(id.isTextual()&&ids.add(id.textValue()),"invalid native denominator");
            Set<String> complete=new HashSet<>();for(JsonNode id:subject.path("strictCompleteGoalIds"))require(id.isTextual()&&complete.add(id.textValue()),"invalid native complete set");
            require(ids.size()==denominator&&ids.equals(complete),"native goal gate intersection incomplete");
            Set<String> checks=new HashSet<>();for(JsonNode check:subject.path("requiredChecks"))require(checks.add(check.path("id").asText())&&"pass".equals(check.path("status").asText()),"failed native gate");
            require(checks.equals(CHECKS),"missing native gate");
            for(String id:ids)require(owner.equals(receipt.path("goals").path(id).path("landscapeId").asText()),"missing native current Goal/P identity");
        }
        require(owners.equals(Set.of(CompositionSupplementService.MATH,CompositionSupplementService.PHYSICS)),"registered owner set differs");
        require(receipt.path("sourceInputs").isArray()&&!receipt.path("sourceInputs").isEmpty(),"native source bindings unavailable");
    }
    private Path resolveNodeExecutable() throws java.io.IOException {
        String search=System.getenv("PATH");require(search!=null,"Node PATH unavailable");
        for(String directory:search.split(java.io.File.pathSeparator)){
            Path node=Path.of(directory).resolve("node").toAbsolutePath().normalize();
            if(Files.isRegularFile(node)&&Files.isExecutable(node)){
                require(isElf(Files.readAllBytes(node)),"Node must be a supported ELF interpreter; shell/wrapper launch rejected");return node;
            }
        }
        throw new IllegalStateException("Supported Node ELF executable unavailable");
    }
    private static boolean isElf(byte[] bytes){return bytes.length>=4&&bytes[0]==127&&bytes[1]==69&&bytes[2]==76&&bytes[3]==70;}
    private boolean fresh(){try{for(var entry:signatures.entrySet())if(!entry.getValue().equals(signature(entry.getKey())))return false;return true;}catch(Exception e){return false;}}
    private void verifyInput(Path path,JsonNode input)throws java.io.IOException{
        switch(input.path("kind").asText()){
            case "file"->require(CompositionSupplementService.hashBytes(Files.readAllBytes(path)).equals(input.path("sha256").asText()),"native source bytes changed during validation");
            case "absent"->require(!Files.exists(path),"native absence changed during validation");
            case "directory"->{try(var entries=Files.list(path)){List<String> actual=entries.map(p->p.getFileName().toString()).sorted().toList();List<String> expected=new ArrayList<>();input.path("entries").forEach(v->expected.add(v.asText()));require(actual.equals(expected),"native directory changed during validation");}}
            default->throw new IllegalStateException("Unknown native source binding kind");
        }
    }
    private String signature(Path path)throws java.io.IOException{
        if(!Files.exists(path))return "absent";
        BasicFileAttributes attr=Files.readAttributes(path,BasicFileAttributes.class);
        Object changed=Files.getAttribute(path,"unix:ctime");
        return path.toRealPath()+":"+attr.fileKey()+":"+attr.size()+":"+attr.lastModifiedTime()+":"+changed;
    }
    private Path resolve(String value){Path path=repository.resolve(value).normalize();require(!value.isBlank()&&!Path.of(value).isAbsolute()&&path.startsWith(repository),"native input escapes repository");return path;}
    private static byte[] readBounded(java.io.InputStream stream){try{byte[] bytes=stream.readNBytes(100*1024*1024+1);require(bytes.length<=100*1024*1024,"native producer output exceeds bound");return bytes;}catch(java.io.IOException e){throw new IllegalStateException(e);}}
    private static void require(boolean ok,String message){if(!ok)throw new IllegalStateException(message);}
}
