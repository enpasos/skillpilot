package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.HtmlUtils;

@Controller
@ConditionalOnProperty(
        name = {"skillpilot.openai.coach.v1.enabled", "skillpilot.openai.coach.v1.oauth.enabled"},
        havingValue = "true")
public class OpenAiDeOAuthMetadataController {

    public static final String PROTECTED_RESOURCE_METADATA_PATH =
            OpenAiDeV1ContractMetadata.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH;
    public static final String AUTHORIZATION_SERVER_WELL_KNOWN_PATH =
            "/.well-known/oauth-authorization-server/api/openai/v1";
    // ChatGPT also probes this issuer-relative OAuth compatibility URL during MCP reconnects.
    // It intentionally exposes the same metadata without advertising OIDC scopes or ID tokens.
    public static final String OPENID_CONFIGURATION_PATH =
            OpenAiDeOAuthConfiguration.ISSUER_PATH + "/.well-known/openid-configuration";

    private final String issuer;
    private final OpenAiDeProperties properties;

    public OpenAiDeOAuthMetadataController(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            OpenAiDeProperties properties) {
        this.issuer = OpenAiDeOAuthConfiguration.stripTrailingSlash(publicBaseUrl)
                + OpenAiDeOAuthConfiguration.ISSUER_PATH;
        this.properties = properties;
    }

    @GetMapping(value = PROTECTED_RESOURCE_METADATA_PATH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> protectedResourceMetadata() {
        return protectedResourceMetadata(issuer, properties);
    }

    static Map<String, Object> protectedResourceMetadata(
            String issuer,
            OpenAiDeProperties properties) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("resource", properties.getOauthResource());
        metadata.put("authorization_servers", List.of(issuer));
        metadata.put("scopes_supported", List.of(
                OpenAiDeOAuthConfiguration.READ_SCOPE,
                OpenAiDeOAuthConfiguration.WRITE_SCOPE));
        metadata.put("bearer_methods_supported", List.of("header"));
        return metadata;
    }

    @GetMapping(
            value = {AUTHORIZATION_SERVER_WELL_KNOWN_PATH, OPENID_CONFIGURATION_PATH},
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> authorizationServerMetadata() {
        return authorizationServerMetadata(issuer, properties);
    }

    static Map<String, Object> authorizationServerMetadata(
            String issuer,
            OpenAiDeProperties properties) {
        String base = OpenAiDeOAuthConfiguration.stripTrailingSlash(issuer);
        String clientAuthenticationMethod =
                OpenAiDeOAuthConfiguration.normalizedClientAuthenticationMethod(properties);
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("issuer", issuer);
        metadata.put("authorization_endpoint", base + "/oauth2/authorize");
        metadata.put("token_endpoint", base + "/oauth2/token");
        metadata.put("revocation_endpoint", base + "/oauth2/revoke");
        metadata.put("introspection_endpoint", base + "/oauth2/introspect");
        metadata.put("response_types_supported", List.of("code"));
        metadata.put("grant_types_supported", List.of("authorization_code", "refresh_token"));
        metadata.put("token_endpoint_auth_methods_supported", List.of(clientAuthenticationMethod));
        metadata.put("revocation_endpoint_auth_methods_supported", List.of(clientAuthenticationMethod));
        if (OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties)) {
            metadata.put("client_id_metadata_document_supported", true);
            metadata.put(
                    "token_endpoint_auth_signing_alg_values_supported",
                    List.of(OpenAiDeOAuthConfiguration
                            .clientAssertionSigningAlgorithm(properties)
                            .getName()));
        }
        metadata.put("code_challenge_methods_supported", List.of("S256"));
        metadata.put("scopes_supported", List.of(
                OpenAiDeOAuthConfiguration.READ_SCOPE,
                OpenAiDeOAuthConfiguration.WRITE_SCOPE,
                OpenAiDeOAuthConfiguration.OFFLINE_SCOPE));
        return metadata;
    }

    @GetMapping(value = OpenAiDeOAuthConfiguration.CONNECT_REQUIRED_ENDPOINT, produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> connectRequired(@RequestParam(required = false) String reason) {
        String detail = "expired".equals(reason)
                ? "The app authorization has expired or is no longer valid."
                : "SkillPilot Coach v1 is not yet authorized to access the SkillPilot MCP backend.";
        return htmlPage(
                "Authorize SkillPilot Coach v1",
                "<p>" + HtmlUtils.htmlEscape(detail) + "</p>"
                        + "<p>This authorization neither selects a learner nor creates a learning session. "
                        + "A learning session is created only after the learner finishes the configuration in the "
                        + "first-party SkillPilot web interface and explicitly chooses Start learning. The prepared "
                        + "start message is then used in a new chat.</p>"
                        + "<p><a class=\"button\" href=\"/\">Open SkillPilot</a></p>");
    }

    @GetMapping(value = OpenAiDeOAuthConfiguration.CONSENT_ENDPOINT, produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> consent(
            @RequestParam("client_id") String requestedClientId,
            @RequestParam(required = false) String scope,
            @RequestParam(required = false) String state) {
        if (!properties.getOauth().getClientId().equals(requestedClientId)) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_HTML)
                    .body("<!doctype html><html><body>Unknown OAuth client.</body></html>");
        }

        StringBuilder hiddenScopes = new StringBuilder();
        StringBuilder visibleScopes = new StringBuilder("<ul>");
        for (String requestedScope : splitScopes(scope)) {
            String escapedScope = HtmlUtils.htmlEscape(requestedScope);
            hiddenScopes.append("<input type=\"hidden\" name=\"scope\" value=\"")
                    .append(escapedScope)
                    .append("\">");
            visibleScopes.append("<li>")
                    .append(scopeDescription(requestedScope))
                    .append("</li>");
        }
        visibleScopes.append("</ul>");

        StringBuilder form = new StringBuilder();
        form.append("<p>You authorize SkillPilot Coach v1 to access the SkillPilot MCP backend with the following permissions.</p>")
                .append(visibleScopes)
                .append("<p>OAuth authorizes only the app. It neither selects a learner nor creates a learning session. "
                        + "Only a short-lived learning session created separately through “Start learning” in "
                        + "SkillPilot determines which learning data is addressed.</p>")
                .append("<p>The permanent SkillPilot ID and OAuth credentials are shown neither in chat nor as tool parameters.</p>")
                .append("<form method=\"post\" action=\"")
                .append(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT)
                .append("\">")
                .append("<input type=\"hidden\" name=\"client_id\" value=\"")
                .append(HtmlUtils.htmlEscape(requestedClientId))
                .append("\">");
        if (state != null && !state.isBlank()) {
            form.append("<input type=\"hidden\" name=\"state\" value=\"")
                    .append(HtmlUtils.htmlEscape(state))
                    .append("\">");
        }
        form.append(hiddenScopes)
                .append("<button class=\"button\" type=\"submit\">Authorize app</button>")
                .append("</form>");
        return htmlPage("Authorize SkillPilot Coach v1", form.toString());
    }

    private List<String> splitScopes(String scope) {
        if (scope == null || scope.isBlank()) {
            return List.of(OpenAiDeOAuthConfiguration.READ_SCOPE);
        }
        return java.util.Arrays.stream(scope.trim().split("\\s+"))
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private String scopeDescription(String scope) {
        return switch (scope) {
            case OpenAiDeOAuthConfiguration.READ_SCOPE ->
                "Read data from a separately started SkillPilot learning session";
            case OpenAiDeOAuthConfiguration.WRITE_SCOPE ->
                "Update progress in a separately started learning session after confirmation";
            case OpenAiDeOAuthConfiguration.OFFLINE_SCOPE ->
                "Keep the app authorization active without signing in again";
            default -> HtmlUtils.htmlEscape(scope);
        };
    }

    private ResponseEntity<String> htmlPage(String title, String body) {
        String html = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                + "<title>" + HtmlUtils.htmlEscape(title) + "</title>"
                + "<style>body{font-family:system-ui,sans-serif;max-width:42rem;margin:4rem auto;padding:0 1.25rem;"
                + "line-height:1.55;color:#172033}h1{line-height:1.2}.button{display:inline-block;border:0;border-radius:.7rem;"
                + "background:#172033;color:white;padding:.8rem 1.1rem;text-decoration:none;font:inherit;cursor:pointer}"
                + "li{margin:.45rem 0}</style></head><body><h1>"
                + HtmlUtils.htmlEscape(title) + "</h1>" + body + "</body></html>";
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .header(
                        "Content-Security-Policy",
                        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'")
                .header("X-Content-Type-Options", "nosniff")
                .body(html);
    }
}
