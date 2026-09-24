package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.List;

/** Exact configured client identities. A secondary Basic registration is never an alternative method for CIMD. */
public final class OpenAiDeClientProfiles {
    public static final String CIMD_JWT = "chatgpt-cimd-jwt";
    public static final String BASIC_TRANSITION = "chatgpt-basic-transition";
    public static final String NATIVE_CIMD_PUBLIC = "chatgpt-native-cimd-public";

    private OpenAiDeClientProfiles() {}

    public static String primaryProfileId(OpenAiDeProperties properties) {
        if (isNativeProfile(properties)) return NATIVE_CIMD_PUBLIC;
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
            var copy = copyRuntime(properties);
            copy.getOauth().setClientAuthenticationMethod(OpenAiDeOAuthConfiguration.CLIENT_AUTH_NONE);
            copy.getOauth().setClientId(nativeClient.getClientId());
            copy.getOauth().setRedirectUris(List.of(OpenAiDeProperties.OAuth.NativeCimd.REDIRECT_URI));
            copy.getOauth().setAuthorizationPolicyVersion(nativeClient.getAuthorizationPolicyVersion());
            copy.getOauth().getNativeCimd().setEnabled(true);
            result.add(copy);
        }
        var secondary = properties.getOauth().getTransitionalBasic();
        if (!secondary.isEnabled()) {
            return List.copyOf(result);
        }
        if (!OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties)
                || secondary.getClientId() == null || secondary.getClientId().isBlank()
                || secondary.getClientId().equals(properties.getOauth().getClientId())
                || secondary.getClientId().startsWith("https://")
                || properties.getOauth().getLegacyClientIds().contains(secondary.getClientId())) {
            throw new IllegalStateException("Transitional Basic requires a distinct, non-CIMD client identity outside the retired-client list.");
        }
        var copy = copyRuntime(properties);
        copy.getOauth().setClientAuthenticationMethod(OpenAiDeOAuthConfiguration.CLIENT_AUTH_CLIENT_SECRET_BASIC);
        copy.getOauth().setClientId(secondary.getClientId());
        copy.getOauth().setClientSecret(secondary.getClientSecret());
        copy.getOauth().setRedirectUris(secondary.getRedirectUris());
        copy.getOauth().setAuthorizationPolicyVersion(secondary.getAuthorizationPolicyVersion());
        result.add(copy);
        return List.copyOf(result);
    }

    private static OpenAiDeProperties copyRuntime(OpenAiDeProperties properties) {
        var copy = new OpenAiDeProperties();
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
}
