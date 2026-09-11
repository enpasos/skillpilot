package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.List;

/** Exact configured client identities. A secondary Basic registration is never an alternative method for CIMD. */
public final class OpenAiDeClientProfiles {
    public static final String CIMD_JWT = "chatgpt-cimd-jwt";
    public static final String BASIC_TRANSITION = "chatgpt-basic-transition";

    private OpenAiDeClientProfiles() {}

    public static String primaryProfileId(OpenAiDeProperties properties) {
        return OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties) ? CIMD_JWT : BASIC_TRANSITION;
    }

    public static List<OpenAiDeProperties> configurations(OpenAiDeProperties properties) {
        var secondary = properties.getOauth().getTransitionalBasic();
        if (!secondary.isEnabled()) {
            return List.of(properties);
        }
        if (!OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties)
                || secondary.getClientId() == null || secondary.getClientId().isBlank()
                || secondary.getClientId().equals(properties.getOauth().getClientId())
                || secondary.getClientId().startsWith("https://")
                || properties.getOauth().getLegacyClientIds().contains(secondary.getClientId())) {
            throw new IllegalStateException("Transitional Basic requires a distinct, non-CIMD client identity outside the retired-client list.");
        }
        var copy = new OpenAiDeProperties();
        copy.setEnabled(properties.isEnabled());
        copy.setMcpUrl(properties.getMcpUrl());
        copy.setOauthResource(properties.getOauthResource());
        copy.setServerBuild(properties.getServerBuild());
        copy.getSecurity().setSecureMode(properties.getSecurity().isSecureMode());
        copy.getOauth().setEnabled(properties.getOauth().isEnabled());
        copy.getOauth().setClientAuthenticationMethod(OpenAiDeOAuthConfiguration.CLIENT_AUTH_CLIENT_SECRET_BASIC);
        copy.getOauth().setClientId(secondary.getClientId());
        copy.getOauth().setClientSecret(secondary.getClientSecret());
        copy.getOauth().setRedirectUris(secondary.getRedirectUris());
        copy.getOauth().setAuthorizationPolicyVersion(secondary.getAuthorizationPolicyVersion());
        copy.getOauth().setProtectedResourceMetadata(properties.getOauth().getProtectedResourceMetadata());
        copy.getOauth().setAccessTokenTtl(properties.getOauth().getAccessTokenTtl());
        copy.getOauth().setRefreshTokenTtl(properties.getOauth().getRefreshTokenTtl());
        return List.of(properties, copy);
    }

    public static List<String> clientIds(OpenAiDeProperties properties) {
        return configurations(properties).stream().map(value -> value.getOauth().getClientId().trim()).toList();
    }
}
