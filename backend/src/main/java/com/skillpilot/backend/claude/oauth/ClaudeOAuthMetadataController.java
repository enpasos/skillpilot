package com.skillpilot.backend.claude.oauth;

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
@ConditionalOnProperty(name = "skillpilot.claude.enabled", havingValue = "true")
public class ClaudeOAuthMetadataController {

    private final String publicBaseUrl;
    private final String mcpUrl;
    private final String clientId;

    public ClaudeOAuthMetadataController(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            @Value("${skillpilot.claude.mcp-url:https://skillpilot.com/api/claude/mcp}") String mcpUrl,
            @Value("${skillpilot.claude.oauth.client-id:https://claude.ai/oauth/mcp-oauth-client-metadata}") String clientId) {
        this.publicBaseUrl = stripTrailingSlash(publicBaseUrl);
        this.mcpUrl = stripTrailingSlash(mcpUrl);
        this.clientId = clientId;
    }

    @GetMapping(value = "/api/claude/oauth/protected-resource", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> protectedResourceMetadata() {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("resource", mcpUrl);
        metadata.put("authorization_servers", List.of(publicBaseUrl));
        metadata.put("scopes_supported", List.of(
                ClaudeOAuthConfiguration.READ_SCOPE,
                ClaudeOAuthConfiguration.WRITE_SCOPE));
        metadata.put("bearer_methods_supported", List.of("header"));
        return metadata;
    }

    @GetMapping(value = "/api/claude/oauth/connect-required", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> connectRequired(
            @RequestParam(required = false) String reason) {
        String detail = "expired".equals(reason)
                ? "Der Verbindungsstart ist abgelaufen oder wurde bereits verwendet."
                : "Öffne SkillPilot und starte dort die Claude-Verbindung.";
        return htmlPage(
                "SkillPilot mit Claude verbinden",
                "<p>" + HtmlUtils.htmlEscape(detail) + "</p>"
                        + "<p><a class=\"button\" href=\"/\">Zu SkillPilot</a></p>");
    }

    @GetMapping(value = "/api/claude/oauth/consent", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> consent(
            @RequestParam("client_id") String requestedClientId,
            @RequestParam(required = false) String scope,
            @RequestParam(required = false) String state) {
        if (!clientId.equals(requestedClientId)) {
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
        form.append("<p>Claude darf den Lernstand über den SkillPilot-Connector lesen und – nach deinen Anweisungen – aktualisieren.</p>")
                .append(visibleScopes)
                .append("<p>Die SkillPilot-ID und OAuth-Tokens werden Claude nicht als Chat- oder Werkzeugparameter angezeigt.</p>")
                .append("<form method=\"post\" action=\"/oauth2/authorize\">")
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
        return htmlPage("Claude mit SkillPilot verbinden", form.toString());
    }

    private List<String> splitScopes(String scope) {
        if (scope == null || scope.isBlank()) {
            return List.of(ClaudeOAuthConfiguration.READ_SCOPE);
        }
        return java.util.Arrays.stream(scope.trim().split("\\s+"))
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private String scopeDescription(String scope) {
        return switch (scope) {
            case ClaudeOAuthConfiguration.READ_SCOPE -> "Lernstand und aktuelle Lernziele lesen";
            case ClaudeOAuthConfiguration.WRITE_SCOPE -> "Lernfortschritt nach Bestätigung aktualisieren";
            case ClaudeOAuthConfiguration.OFFLINE_SCOPE -> "Verbindung auf deinen Geräten aufrechterhalten";
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
                .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'")
                .header("X-Content-Type-Options", "nosniff")
                .body(html);
    }

    private String stripTrailingSlash(String value) {
        String normalized = value == null ? "" : value.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
