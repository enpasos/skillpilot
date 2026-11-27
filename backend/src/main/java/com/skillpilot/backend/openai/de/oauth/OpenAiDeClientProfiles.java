package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.OpenAiDeSecureModeValidation;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/** Exact configured client identities. A secondary Basic registration is never an alternative method for CIMD. */
public final class OpenAiDeClientProfiles {
    public static final String CIMD_JWT = "chatgpt-cimd-jwt";
    public static final String PORTAL_CIMD_JWT = "chatgpt-portal-cimd-jwt";
    public static final String BASIC_TRANSITION = "chatgpt-basic-transition";
    public static final String NATIVE_CIMD_PUBLIC = "chatgpt-native-cimd-public";

    private OpenAiDeClientProfiles() {}

    public static String primaryProfileId(OpenAiDeProperties properties) {
        if (isNativeProfile(properties)) return NATIVE_CIMD_PUBLIC;
        if (properties instanceof PortalCimdProfile) return PORTAL_CIMD_JWT;
        return OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties) ? CIMD_JWT : BASIC_TRANSITION;
    }

    public static boolean isNativeProfile(OpenAiDeProperties properties) {
        return properties.getOauth().getNativeCimd().isEnabled()
                && OpenAiDeOAuthConfiguration.isPublicClient(properties)
                && OpenAiDeProperties.OAuth.NativeCimd.CLIENT_ID.equals(properties.getOauth().getClientId());
    }

    public static List<OpenAiDeProperties> configurations(OpenAiDeProperties properties) {
        var result = new java.util.ArrayList<OpenAiDeProperties>();
        result.add(properties);
        var nativeClient = properties.getOauth().getNativeCimd();
        if (nativeClient.isEnabled() && !isNativeProfile(properties)) {
            if (!OpenAiDeProperties.OAuth.NativeCimd.CLIENT_ID.equals(nativeClient.getClientId())
                    || nativeClient.getClientId().equals(properties.getOauth().getClientId())
                    || properties.getOauth().getLegacyClientIds().contains(nativeClient.getClientId())
                    || nativeClient.getAuthorizationPolicyVersion() == null
                    || !nativeClient.getAuthorizationPolicyVersion().matches("[A-Za-z0-9][A-Za-z0-9._-]{0,63}")) {
                throw new IllegalStateException("Native CIMD requires its exact resource-specific identity and explicit independent policy revision.");
            }
            var copy = copyRuntime(properties, new OpenAiDeProperties());
            copy.getOauth().setClientAuthenticationMethod(OpenAiDeOAuthConfiguration.CLIENT_AUTH_NONE);
            copy.getOauth().setClientId(nativeClient.getClientId());
            copy.getOauth().setRedirectUris(List.of(OpenAiDeProperties.OAuth.NativeCimd.REDIRECT_URI));
            copy.getOauth().setAuthorizationPolicyVersion(nativeClient.getAuthorizationPolicyVersion());
            copy.getOauth().getNativeCimd().setEnabled(true);
            result.add(copy);
        }
        var secondary = properties.getOauth().getTransitionalBasic();
        if (secondary.isEnabled()) {
            if (!OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties)
                    || secondary.getClientId() == null || secondary.getClientId().isBlank()
                    || secondary.getClientId().equals(properties.getOauth().getClientId())
                    || secondary.getClientId().startsWith("https://")
                    || properties.getOauth().getLegacyClientIds().contains(secondary.getClientId())) {
                throw new IllegalStateException("Transitional Basic requires a distinct, non-CIMD client identity outside the retired-client list.");
            }
            var copy = copyRuntime(properties, new OpenAiDeProperties());
            copy.getOauth().setClientAuthenticationMethod(OpenAiDeOAuthConfiguration.CLIENT_AUTH_CLIENT_SECRET_BASIC);
            copy.getOauth().setClientId(secondary.getClientId());
            copy.getOauth().setClientSecret(secondary.getClientSecret());
            copy.getOauth().setRedirectUris(secondary.getRedirectUris());
            copy.getOauth().setAuthorizationPolicyVersion(secondary.getAuthorizationPolicyVersion());
            result.add(copy);
        }
        if (properties.getOauth().getPortalCimd().isEnabled()) {
            result.add(portalConfiguration(properties));
        }
        return List.copyOf(result);
    }

    static OpenAiDeProperties portalConfiguration(OpenAiDeProperties properties) {
        var existing = properties.getOauth();
        var portal = existing.getPortalCimd();
        String portalId = portal.getClientId();
        if (!isPortalUri(portalId, "/oauth/[A-Za-z0-9_-]+/client\\.json")) {
            throw new IllegalStateException("Portal CIMD requires an exact ChatGPT hosted client metadata URL.");
        }
        if (!OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties)
                || portalId.equals(trimmed(existing.getClientId()))
                || (existing.getNativeCimd().isEnabled() && portalId.equals(trimmed(existing.getNativeCimd().getClientId())))
                || (existing.getTransitionalBasic().isEnabled() && portalId.equals(trimmed(existing.getTransitionalBasic().getClientId())))
                || existing.getLegacyClientIds().stream().filter(Objects::nonNull).map(String::strip).anyMatch(portalId::equals)) {
            throw new IllegalStateException("Portal CIMD requires an existing primary JWT profile and its own client identity outside the retired-client list.");
        }
        String redirectUri = portal.getRedirectUri();
        if (!isPortalUri(redirectUri, "/connector/oauth/[A-Za-z0-9_-]+")
                || existing.getRedirectUris().stream().map(OpenAiDeClientProfiles::trimmed).anyMatch(redirectUri::equals)) {
            throw new IllegalStateException("Portal CIMD requires one exact hosted redirect URI distinct from the primary JWT callback.");
        }
        if (!"https://chatgpt.com/oauth/jwks.json".equals(portal.getClientJwkSetUri())) {
            throw new IllegalStateException("Portal CIMD requires the exact official ChatGPT JWKS URL.");
        }

        var copy = copyRuntime(properties, new PortalCimdProfile());
        var oauth = copy.getOauth();
        oauth.setClientAuthenticationMethod(OpenAiDeOAuthConfiguration.CLIENT_AUTH_PRIVATE_KEY_JWT);
        oauth.setClientId(portalId);
        oauth.setRedirectUris(List.of(redirectUri));
        oauth.setClientJwkSetUri(portal.getClientJwkSetUri());
        oauth.setClientAssertionSigningAlgorithm("RS256");
        oauth.setClientAssertionAudience(portal.getClientAssertionAudience());
        oauth.setAuthorizationPolicyVersion(portal.getAuthorizationPolicyVersion());
        oauth.setClientAssertionClockSkew(existing.getClientAssertionClockSkew());
        oauth.setClientAssertionMaxLifetime(existing.getClientAssertionMaxLifetime());
        oauth.setClientAssertionReplayCacheSize(existing.getClientAssertionReplayCacheSize());
        return copy;
    }

    private static String trimmed(String value) {
        return value == null ? "" : value.strip();
    }

    private static boolean isPortalUri(String value, String pathPattern) {
        if (!OpenAiDeSecureModeValidation.isStrictHttpsUri(value)) return false;
        URI uri = URI.create(value);
        return "https".equals(uri.getScheme())
                && "chatgpt.com".equals(uri.getRawAuthority())
                && uri.getRawPath().matches(pathPattern);
    }

    /** Gives the projected configuration an identity distinct from the primary JWT policy. */
    private static final class PortalCimdProfile extends OpenAiDeProperties {}

    private static OpenAiDeProperties copyRuntime(OpenAiDeProperties properties, OpenAiDeProperties copy) {
        copy.setEnabled(properties.isEnabled());
        copy.setMcpUrl(properties.getMcpUrl());
        copy.setOauthResource(properties.getOauthResource());
        copy.setServerBuild(properties.getServerBuild());
        copy.getSecurity().setSecureMode(properties.getSecurity().isSecureMode());
        copy.getOauth().setEnabled(properties.getOauth().isEnabled());
        copy.getOauth().setProtectedResourceMetadata(properties.getOauth().getProtectedResourceMetadata());
        copy.getOauth().setAccessTokenTtl(properties.getOauth().getAccessTokenTtl());
        copy.getOauth().setRefreshTokenTtl(properties.getOauth().getRefreshTokenTtl());
        return copy;
    }

    public static List<String> clientIds(OpenAiDeProperties properties) {
        return configurations(properties).stream().map(value -> value.getOauth().getClientId().trim()).toList();
    }

    static Map<String, String> profileIdsByClient(OpenAiDeProperties properties) {
        return configurations(properties).stream().collect(Collectors.toUnmodifiableMap(
                value -> value.getOauth().getClientId().trim(), OpenAiDeClientProfiles::primaryProfileId));
    }
}
