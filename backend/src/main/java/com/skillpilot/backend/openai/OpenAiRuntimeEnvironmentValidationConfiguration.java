package com.skillpilot.backend.openai;

import java.util.Collection;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Rejects obsolete or forbidden OpenAI environment variable names inside the
 * Spring process.
 *
 * <p>systemd reads a root-owned {@code EnvironmentFile} before starting the
 * service, so these names are visible through {@link System#getenv()} even when
 * the unprivileged deployment user cannot read the file itself. Only names are
 * inspected and reported; values are never retained or logged.</p>
 */
@Configuration(proxyBeanMethods = false)
public class OpenAiRuntimeEnvironmentValidationConfiguration {

    private static final String LEGACY_DE_PREFIX = "SKILLPILOT_OPENAI_DE_";
    private static final String LEGACY_APPS_CHALLENGE =
            "SKILLPILOT_OPENAI_APPS_CHALLENGE";
    private static final Pattern COACH_LINE_NAME = Pattern.compile(
            "SKILLPILOT_OPENAI_COACH_(?:DE|EN)_V[1-9][0-9]*_[A-Z0-9_]+");
    private static final Set<String> IMPLEMENTED_DE_V1_NAMES = Set.of(
            "SKILLPILOT_OPENAI_COACH_DE_V1_ENABLED",
            "SKILLPILOT_OPENAI_COACH_DE_V1_BOOTSTRAP_ENABLED",
            "SKILLPILOT_OPENAI_COACH_DE_V1_WRITES_ENABLED",
            "SKILLPILOT_OPENAI_COACH_DE_V1_WORKFLOW_VERSION",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OPENAI_APPS_CHALLENGE",
            "SKILLPILOT_OPENAI_COACH_DE_V1_MCP_ENABLED",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_ENABLED",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_CLIENT_ID",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_CLIENT_SECRET",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_REDIRECT_URIS",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_CLIENT_JWK_SET_URI",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_CLIENT_ASSERTION_SIGNING_ALGORITHM",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_LEGACY_CLIENT_IDS");
    private static final Set<String> FORBIDDEN_URL_OVERRIDE_NAMES = Set.of(
            "SKILLPILOT_OPENAI_COACH_DE_V1_MCP_URL",
            "SKILLPILOT_OPENAI_COACH_DE_V1_OAUTH_RESOURCE",
            "SKILLPILOT_OPENAI_COACH_DE_V1_RESOURCE_METADATA",
            "SKILLPILOT_OPENAI_COACH_DE_V1_RESOURCE_METADATA_URL",
            "SKILLPILOT_OPENAI_COACH_DE_V1_PROTECTED_RESOURCE_METADATA",
            "SKILLPILOT_OPENAI_COACH_DE_V1_PROTECTED_RESOURCE_METADATA_URL",
            "SKILLPILOT_OPENAI_COACH_DE_V1_UI_ORIGIN",
            "SKILLPILOT_OPENAI_MCP_URL",
            "SKILLPILOT_OPENAI_OAUTH_RESOURCE",
            "SKILLPILOT_OPENAI_RESOURCE_METADATA",
            "SKILLPILOT_OPENAI_RESOURCE_METADATA_URL",
            "SKILLPILOT_OPENAI_PROTECTED_RESOURCE_METADATA",
            "SKILLPILOT_OPENAI_PROTECTED_RESOURCE_METADATA_URL",
            "SKILLPILOT_OPENAI_UI_ORIGIN");

    @Bean
    InitializingBean validateOpenAiRuntimeEnvironmentNames() {
        return () -> requireNoForbiddenNames(System.getenv().keySet());
    }

    static void requireNoForbiddenNames(Collection<String> environmentNames) {
        TreeSet<String> forbiddenNames = new TreeSet<>();
        for (String name : environmentNames) {
            if (isForbidden(name)) {
                forbiddenNames.add(name);
            }
        }
        if (!forbiddenNames.isEmpty()) {
            throw new IllegalStateException(
                    "Obsolete or forbidden OpenAI environment variable names: "
                            + String.join(", ", forbiddenNames)
                            + ". Remove these names from the service environment; "
                            + "environment values were not inspected.");
        }
    }

    static boolean isForbidden(String name) {
        return name != null
                && (name.startsWith(LEGACY_DE_PREFIX)
                        || LEGACY_APPS_CHALLENGE.equals(name)
                        || FORBIDDEN_URL_OVERRIDE_NAMES.contains(name)
                        || (COACH_LINE_NAME.matcher(name).matches()
                                && !IMPLEMENTED_DE_V1_NAMES.contains(name)));
    }
}
