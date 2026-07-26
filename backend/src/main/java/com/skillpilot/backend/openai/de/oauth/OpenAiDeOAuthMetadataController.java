package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
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
        name = {"skillpilot.openai.de.enabled", "skillpilot.openai.de.oauth.enabled"},
        havingValue = "true")
public class OpenAiDeOAuthMetadataController {

    public static final String PROTECTED_RESOURCE_METADATA_PATH =
            "/api/openai/de/oauth/protected-resource";
    public static final String PROTECTED_RESOURCE_WELL_KNOWN_PATH =
            "/.well-known/oauth-protected-resource/api/openai/de/mcp";
    public static final String AUTHORIZATION_SERVER_WELL_KNOWN_PATH =
            "/.well-known/oauth-authorization-server/api/openai/de";
    public static final String AUTHORIZATION_SERVER_COMPATIBILITY_PATH =
            "/api/openai/de/.well-known/oauth-authorization-server";

    private final String issuer;
    private final OpenAiDeProperties properties;

    public OpenAiDeOAuthMetadataController(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            OpenAiDeProperties properties) {
        this.issuer = OpenAiDeOAuthConfiguration.stripTrailingSlash(publicBaseUrl)
                + OpenAiDeOAuthConfiguration.ISSUER_PATH;
        this.properties = properties;
    }

    @GetMapping(
            value = {PROTECTED_RESOURCE_METADATA_PATH, PROTECTED_RESOURCE_WELL_KNOWN_PATH},
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> protectedResourceMetadata() {
        return protectedResourceMetadata(issuer, properties);
    }

    static Map<String, Object> protectedResourceMetadata(
            String issuer,
            OpenAiDeProperties properties) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("resource", properties.getMcpUrl());
        metadata.put("authorization_servers", List.of(issuer));
        metadata.put("scopes_supported", List.of(
                OpenAiDeOAuthConfiguration.READ_SCOPE,
                OpenAiDeOAuthConfiguration.WRITE_SCOPE));
        metadata.put("bearer_methods_supported", List.of("header"));
        return metadata;
    }

    @GetMapping(
            value = {AUTHORIZATION_SERVER_WELL_KNOWN_PATH, AUTHORIZATION_SERVER_COMPATIBILITY_PATH},
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
                OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties)
                        ? OpenAiDeOAuthConfiguration.CLIENT_AUTH_PRIVATE_KEY_JWT
                        : OpenAiDeOAuthConfiguration.CLIENT_AUTH_NONE;
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
                ? "Der Verbindungsstart ist abgelaufen oder wurde bereits verwendet."
                : "Öffne SkillPilot und starte dort die Verbindung mit ChatGPT.";
        return htmlPage(
                "SkillPilot mit ChatGPT verbinden",
                "<p>" + HtmlUtils.htmlEscape(detail) + "</p>"
                        + "<p><a class=\"button\" href=\"/\">Zu SkillPilot</a></p>");
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
        form.append("<p>ChatGPT darf den Lernstand über die App SkillPilot Coach (Deutsch) lesen und – nach deinen Anweisungen – aktualisieren.</p>")
                .append(visibleScopes)
                .append("<p>Die SkillPilot-ID und OAuth-Tokens werden nicht als Chat- oder Werkzeugparameter angezeigt.</p>")
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
                .append("<button class=\"button\" type=\"submit\">SkillPilot verbinden</button>")
                .append("</form>");
        return htmlPage("ChatGPT mit SkillPilot verbinden", form.toString());
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
            case OpenAiDeOAuthConfiguration.READ_SCOPE -> "Lernstand und aktuelle Lernziele lesen";
            case OpenAiDeOAuthConfiguration.WRITE_SCOPE -> "Lernfortschritt nach Bestätigung aktualisieren";
            case OpenAiDeOAuthConfiguration.OFFLINE_SCOPE -> "Verbindung auf deinen Geräten aufrechterhalten";
            default -> HtmlUtils.htmlEscape(scope);
        };
    }

    private ResponseEntity<String> htmlPage(String title, String body) {
        String html = "<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\">"
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
