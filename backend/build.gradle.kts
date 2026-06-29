import org.gradle.jvm.toolchain.JvmVendorSpec

plugins {
    id("org.springframework.boot") version "4.1.0"
    id("io.spring.dependency-management") version "1.1.7"
    java
}

group = "com.skillpilot"
version = "0.1.0-SNAPSHOT"

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
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-liquibase")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("com.fasterxml.jackson.core:jackson-databind")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.1")




    runtimeOnly("org.postgresql:postgresql")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-test-autoconfigure")
    testImplementation("com.h2database:h2")
}

tasks.test {
    useJUnitPlatform()
    maxHeapSize = "1536m"
}
