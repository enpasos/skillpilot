package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.config.RawHttpServletRequest;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.Objects;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Second, application-side check that a Claude v1 internal path was reached through the Claude v1
 * edge host.
 *
 * <p>The nginx vhost already maps only the public Claude paths onto the internal prefix, but the
 * plan requires application and edge to verify the boundary independently. A request that arrives
 * on {@code skillpilot.com} or the OpenAI host and names an internal Claude path is answered with
 * {@code 404}, so the internal prefix never behaves as a public alias.</p>
 */
public class ClaudeV1HostBoundaryFilter extends OncePerRequestFilter {

    private final ClaudeV1Properties properties;

    public ClaudeV1HostBoundaryFilter(ClaudeV1Properties properties) {
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String rawUri = RawHttpServletRequest.requestUri(request);
        // A malformed or excessively nested wrapper must enter this filter and fail closed.
        return rawUri != null && !rawUri.startsWith(ClaudeV1Contract.INTERNAL_BASE_PATH);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        HttpServletRequest rawRequest = RawHttpServletRequest.unwrap(request);
        String expectedHost = properties.getPublicHost();
        if (rawRequest != null
                && isLoopbackAddress(rawRequest.getRemoteAddr())
                && expectedHost != null
                && "https".equalsIgnoreCase(request.getScheme())
                && matchesExpectedHost(request, expectedHost)) {
            filterChain.doFilter(request, response);
            return;
        }
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }

    private boolean isLoopbackAddress(String remoteAddress) {
        if (remoteAddress == null || remoteAddress.isBlank()) {
            return false;
        }
        try {
            // The container supplies a numeric peer address here. Resolving it only normalizes
            // IPv4/IPv6 representations before checking the kernel-level loopback property.
            return InetAddress.getByName(remoteAddress).isLoopbackAddress();
        } catch (UnknownHostException e) {
            return false;
        }
    }

    private boolean matchesExpectedHost(HttpServletRequest request, String expectedHost) {
        // getServerName()/getServerPort() are the host the framework itself resolved. With
        // server.forward-headers-strategy=framework, ForwardedHeaderFilter has already applied
        // X-Forwarded-Host and removed the raw header, so reading that header directly would see
        // nothing. Reading the resolved value keeps edge and application in agreement.
        String serverName = request.getServerName();
        if (serverName == null) {
            return false;
        }
        int port = request.getServerPort();
        boolean defaultPort = port <= 0
                || ("https".equalsIgnoreCase(request.getScheme()) && port == 443)
                || ("http".equalsIgnoreCase(request.getScheme()) && port == 80);
        String host = defaultPort ? serverName : serverName + ":" + port;

        return host.toLowerCase(Locale.ROOT).equals(expectedHost.toLowerCase(Locale.ROOT));
    }
}
