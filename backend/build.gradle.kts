import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.gradle.api.tasks.bundling.Zip
import org.gradle.jvm.toolchain.JvmVendorSpec
import org.gradle.api.tasks.testing.Test
import java.security.MessageDigest
import java.util.HexFormat
import java.util.UUID

plugins {
    id("org.springframework.boot") version "4.1.1"
    id("io.spring.dependency-management") version "1.1.7"
    java
}

group = "com.skillpilot"
version = "0.1.0-SNAPSHOT"

val serverBuildToken = "@skillpilotServerBuild@"
val serverGitCommit = providers.exec {
    workingDir(layout.projectDirectory)
    commandLine("git", "rev-parse", "--verify", "HEAD^{commit}")
    isIgnoreExitValue = true
}
val serverBuild = serverGitCommit.standardOutput.asText
    .zip(serverGitCommit.result) { output, result ->
        output.trim()
            .takeIf { result.exitValue == 0 && it.matches(Regex("[0-9a-f]{40}")) }
            ?: "dev"
    }

providers.environmentVariable("SKILLPILOT_BACKEND_BUILD_DIR")
    .orNull
    ?.takeIf { it.isNotBlank() }
    ?.let { layout.buildDirectory.set(file(it)) }

// Reviewed images and goal books can exceed the standard ZIP limit in both JARs.
tasks.withType<Zip>().configureEach {
    isZip64 = true
}

java {
    toolchain {
        val skillpilotJavaVersion = providers.fileContents(layout.projectDirectory.file("../.java-version"))
            .asText
            .map { it.trim().substringBefore(".").toInt() }
        languageVersion.set(skillpilotJavaVersion.map { JavaLanguageVersion.of(it) })
        vendor.set(JvmVendorSpec.AMAZON)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("org.springframework.ai:spring-ai-bom:2.0.0"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-liquibase")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-authorization-server")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("com.fasterxml.jackson.core:jackson-databind")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.1")
    implementation("org.springframework.ai:spring-ai-starter-mcp-server-webmvc")




    runtimeOnly("org.postgresql:postgresql")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-test-autoconfigure")
    testImplementation("com.h2database:h2")
}

// One inventory binds full-context data and local code bytes for every selector.
// The helper also consults Git's index, so sparse checkout cannot hide an input.
val curriculumCompletionInputPaths = providers.exec {
    workingDir(layout.projectDirectory.dir(".."))
    commandLine("python3", "scripts/curriculum_completion_inputs.py")
}.standardOutput.asText.map { output ->
    (groovy.json.JsonSlurper().parseText(output) as List<*>).map { it as String }
}
val curriculumCompletionIntegrityInputs = files(curriculumCompletionInputPaths.map { paths ->
    paths.map { layout.projectDirectory.dir("..").file(it).asFile }
})

tasks.test {
    // Only the real-data corpus method moves to the dedicated strict task.
    // Its six semantic fixtures remain ordinary mandatory unit tests.
    useJUnitPlatform { excludeTags("curriculum-corpus") }
    // Cached failure selectors may outlive JUnit discovery after a source edit.
    // Only the advisory preflight tolerates no matches; the full check stays strict.
    if (providers.gradleProperty("backendFailurePriorityPreflight").orNull == "true") {
        filter.isFailOnNoMatchingTests = false
    }
    // Each Spring test context retains the current curriculum and publication models.
    // Bound their retained count within the test JVM's existing heap budget.
    systemProperty("spring.test.context.cache.maxSize", "4")
    // Show progress as well as failure details while long integration tests run.
    testLogging {
        events("started", "passed", "skipped", "failed")
        exceptionFormat = TestExceptionFormat.FULL
        showExceptions = true
        showCauses = true
        showStackTraces = true
        showStandardStreams = false
    }
    // The provider-isolation test selects its independent, checked-in baseline from the manifest.
    // Manifest and current-draft updates must invalidate local test results as well as fresh CI runs.
    val openAiCandidateManifest = layout.projectDirectory.file(
        "../ai/openai plugin/skillpilot-coach/.codex-plugin/plugin.json"
    )
    val openAiCandidateVersion = providers.fileContents(openAiCandidateManifest).asText.map { text ->
        val manifest = groovy.json.JsonSlurper().parseText(text) as? Map<*, *>
            ?: error("The canonical OpenAI plugin manifest must be a JSON object")
        require(manifest["name"] == "skillpilot-coach") {
            "The canonical OpenAI plugin manifest must identify skillpilot-coach"
        }
        val candidateVersion = manifest["version"] as? String
            ?: error("The canonical OpenAI plugin manifest must specify a version")
        require(candidateVersion.matches(Regex("(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)"))) {
            "The canonical OpenAI candidate version must be stable package SemVer"
        }
        candidateVersion
    }
    val openAiCandidateContract = layout.projectDirectory.file(openAiCandidateVersion.map { version ->
        "../contracts/drafts/openai/skillpilot-coach/${version}-SNAPSHOT/contract/contract.json"
    })
    inputs.file(openAiCandidateManifest).withPropertyName("openAiCoachV1CandidateManifest")
        .withPathSensitivity(PathSensitivity.RELATIVE)
    inputs.file(openAiCandidateContract).withPropertyName("openAiCoachV1CandidateContract")
        .withPathSensitivity(PathSensitivity.RELATIVE)
    doFirst {
        require(openAiCandidateContract.get().asFile.isFile) {
            "The independently prepared contract for the current OpenAI candidate must be checked in"
        }
    }
    // ProjectionRoleLearnerServiceTest loads the current public physics route.
    // Curriculum-only changes must invalidate the cached test result too.
    inputs.file(layout.projectDirectory.file(
        "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json"
    )).withPropertyName("canonicalPhysicsSourceMethodRoute")
        .withPathSensitivity(PathSensitivity.RELATIVE)
    // ClaudeV1CanonicalExamIntegrationTest exercises current authored exam data through MCP.
    inputs.file(layout.projectDirectory.file(
        "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"
    )).withPropertyName("canonicalMathExamEvaluation")
        .withPathSensitivity(PathSensitivity.RELATIVE)
    // Obligation integrity uses every protected M7 curriculum through actual
    // Level-2 projection, including course mergers and prerequisite context.
    inputs.files(curriculumCompletionIntegrityInputs)
        .withPropertyName("curriculumCompletionIntegrityInputs")
        .withPathSensitivity(PathSensitivity.RELATIVE)
    // The suite runs 22 @SpringBootTest classes whose distinct property sets each pin their own
    // cached Spring context in this one JVM. 1536m stopped being enough when the Claude v1
    // connector added ten of them, and the executor died with "Java heap space" rather than a
    // test failure.
    maxHeapSize = "3g"
}

tasks.register<Test>("curriculumCompletionIntegrity") {
    group = "verification"
    description = "Strict real-curriculum audit; all protected M7 subjects unless one exact subject ID is selected."
    testClassesDirs = sourceSets.test.get().output.classesDirs
    classpath = sourceSets.test.get().runtimeClasspath
    useJUnitPlatform { includeTags("curriculum-corpus") }
    filter { includeTestsMatching("com.skillpilot.backend.completion.CurriculumCompletionIntegrityTest") }
    maxParallelForks = 1
    maxHeapSize = "1536m"
    testLogging {
        events("started", "passed", "skipped", "failed")
        exceptionFormat = TestExceptionFormat.FULL
    }
    val subject = providers.gradleProperty("completionIntegritySubject")
    // Malformed selectors get a safe failure-output directory, then the test
    // rejects them after checking the complete protected inventory.
    val key = subject.map { value ->
        if (value.matches(Regex("[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}"))) value
        else "subject-" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.toByteArray()))
    }.orElse("all")
    val reportDirectory = layout.buildDirectory.dir(key.map { "reports/curriculum-completion-integrity/$it" })
    reports.junitXml.outputLocation.set(layout.buildDirectory.dir(key.map { "test-results/curriculumCompletionIntegrity/$it" }))
    reports.html.outputLocation.set(layout.buildDirectory.dir(key.map { "reports/tests/curriculumCompletionIntegrity/$it" }))
    binaryResultsDirectory.set(layout.buildDirectory.dir(key.map { "test-results/curriculumCompletionIntegrity/$it/binary" }))
    inputs.files(curriculumCompletionIntegrityInputs)
        .withPropertyName("curriculumCompletionIntegrityInputs").withPathSensitivity(PathSensitivity.RELATIVE)
    inputs.property("subjectSelectorPresent", subject.isPresent)
    inputs.property("subjectSelector", subject.orElse("<all-protected-subjects>"))
    inputs.property("gitCommit", serverBuild)
    inputs.property("ciRunId", providers.environmentVariable("GITHUB_RUN_ID").orElse("local"))
    inputs.property("ciRunAttempt", providers.environmentVariable("GITHUB_RUN_ATTEMPT").orElse("local"))
    outputs.dir(reportDirectory)
    subject.orNull?.let { systemProperty("skillpilot.completion.integrity.subject", it) }
    systemProperty("skillpilot.completion.integrity.inputs", reportDirectory.get().file("input-manifest.json").asFile.absolutePath)
    doFirst {
        val repositoryRoot = layout.projectDirectory.dir("..").asFile.canonicalFile
        val hashes = curriculumCompletionIntegrityInputs.files.sortedBy { it.absolutePath }.associate { input ->
            require(input.isFile) { "Missing curriculum integrity input: $input" }
            input.relativeTo(repositoryRoot).invariantSeparatorsPath to
                HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(input.readBytes()))
        }
        val manifest = reportDirectory.get().file("input-manifest.json").asFile
        manifest.parentFile.mkdirs()
        manifest.writeText(groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(mapOf(
            "schemaVersion" to 1, "gitCommit" to serverBuild.get(), "subjectSelector" to subject.orNull,
            "executionId" to UUID.randomUUID().toString(),
            "ciRunId" to providers.environmentVariable("GITHUB_RUN_ID").orNull,
            "ciRunAttempt" to providers.environmentVariable("GITHUB_RUN_ATTEMPT").orNull,
            "files" to hashes
        ))) + "\n")
    }
}

val claudePublicationResources = layout.buildDirectory.dir("generated-resources/claude-plugin-publication")
val generateClaudePluginPublication = tasks.register<Exec>("generateClaudePluginPublication") {
    group = "build"
    description = "Bundles the current hash-verified Claude plugin and publication index without modifying sources."
    workingDir(layout.projectDirectory.dir(".."))
    inputs.dir(layout.projectDirectory.dir("../ai/claude/plugin/skillpilot-coach-v1"))
    inputs.dir(layout.projectDirectory.dir("src/main/resources/claude-plugin-publication"))
    inputs.file(layout.projectDirectory.file("src/main/resources/claude-connector-v1/privacy.html"))
    inputs.files(
        "../scripts/generate_claude_plugin_publication.mjs",
        "../scripts/claude_direct_install_beta_release.mjs",
        "../scripts/check_claude_plugin_v1_release.mjs"
    )
    outputs.dir(claudePublicationResources)
    commandLine("node", "scripts/generate_claude_plugin_publication.mjs", claudePublicationResources.get().asFile.absolutePath)
}

// The checked-in index is immutable release history, not the version deployed by a new build.
sourceSets.main.get().resources.exclude("claude-plugin-publication/**")

tasks.processResources {
    dependsOn(generateClaudePluginPublication)
    from(claudePublicationResources) {
        into("claude-plugin-publication")
    }
    from("../content") {
        include("**/*.json")
        into("content")
    }
    inputs.property("skillpilotServerBuild", serverBuild)
    filesMatching("application.yml") {
        filter { line ->
            line.replace(serverBuildToken, serverBuild.get())
        }
    }
}

tasks.register<JavaExec>("exportOpenAiCoachV1Contract") {
    group = "verification"
    description = "Exports the canonical public OpenAI Coach V1 MCP contract."
    dependsOn(tasks.testClasses)
    classpath = sourceSets.test.get().runtimeClasspath
    mainClass.set(
        "com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractExporter"
    )
    val outputDir = providers.gradleProperty("outputDir")
        .orElse("../tmp/openai-contract-v1")
    args(outputDir.get())
}

tasks.register("prepareOpenAiDialogReplay") {
    group = "verification"
    description = "Prepares the test-only isolated OpenAI model-dialog fixture subprocess."
    dependsOn(tasks.testClasses)
    val javaLauncher = javaToolchains.launcherFor(java.toolchain)
    val output = layout.buildDirectory.file("openai-dialog-replay/launcher.json")
    inputs.files(sourceSets.test.get().runtimeClasspath)
    inputs.property("javaExecutable", javaLauncher.map { it.executablePath.asFile.absolutePath })
    outputs.file(output)
    doLast {
        val launch = mapOf(
            "javaExecutable" to javaLauncher.get().executablePath.asFile.absolutePath,
            "classpath" to sourceSets.test.get().runtimeClasspath.asPath,
            "mainClass" to "com.skillpilot.backend.openai.mcp.de.OpenAiDialogReplayHarness"
        )
        output.get().asFile.apply {
            parentFile.mkdirs()
            writeText(groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(launch)) + "\n")
        }
    }
}
