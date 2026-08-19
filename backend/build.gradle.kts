import org.gradle.jvm.toolchain.JvmVendorSpec

plugins {
    id("org.springframework.boot") version "4.1.0"
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

tasks.test {
    useJUnitPlatform()
    // The suite runs 22 @SpringBootTest classes whose distinct property sets each pin their own
    // cached Spring context in this one JVM. 1536m stopped being enough when the Claude v1
    // connector added ten of them, and the executor died with "Java heap space" rather than a
    // test failure.
    maxHeapSize = "3g"
}

tasks.processResources {
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
