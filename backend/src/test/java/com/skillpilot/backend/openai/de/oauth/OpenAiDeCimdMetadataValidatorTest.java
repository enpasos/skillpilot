package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;

class OpenAiDeCimdMetadataValidatorTest {

    private static final URI CLIENT_ID =
            URI.create("https://chatgpt.com/oauth/skillpilot/client.json");
    private static final String JWKS_URI = "https://chatgpt.com/oauth/jwks.json";
    private static final String CALLBACK =
            "https://chatgpt.com/connector/oauth/skillpilot-callback";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Test
    void acceptsDocumentThatConfirmsEveryConfiguredPin() throws Exception {
        OpenAiDeProperties properties = validProperties();
        OpenAiDeCimdMetadataValidator validator = validator(response(validDocument()));

        assertThatCode(() -> validator.validate(properties)).doesNotThrowAnyException();
    }

    @Test
    void rejectsTransportRedirectNonJsonNon2xxAndOversizedDocument() throws Exception {
        ObjectNode document = validDocument();

        assertFailure(
                response(CLIENT_ID, URI.create("https://other.example/client.json"), 200,
                        "application/json", bytes(document)),
                "redirects are not allowed");
        assertFailure(
                response(CLIENT_ID, CLIENT_ID, 302, "application/json", bytes(document)),
                "HTTP 302");
        assertFailure(
                response(CLIENT_ID, CLIENT_ID, 200, "text/plain", bytes(document)),
                "JSON Content-Type");
        assertFailure(
                response(CLIENT_ID, CLIENT_ID, 200, "application/json",
                        new byte[OpenAiDeCimdMetadataValidator.MAX_DOCUMENT_BYTES + 1]),
                "size limit");
    }

    @Test
    void rejectsWrongDocumentIdentityAndJwksPin() throws Exception {
        ObjectNode wrongClient = validDocument();
        wrongClient.put("client_id", "https://chatgpt.com/oauth/other/client.json");
        assertFailure(response(wrongClient), "client_id");

        ObjectNode wrongJwks = validDocument();
        wrongJwks.put("jwks_uri", "https://chatgpt.com/oauth/other-jwks.json");
        assertFailure(response(wrongJwks), "jwks_uri");
    }

    @Test
    void rejectsMissingPrivateKeyJwtAndConfiguredCallback() throws Exception {
        ObjectNode missingPrivateKeyJwt = validDocument();
        missingPrivateKeyJwt.withArray("token_endpoint_auth_methods_supported")
                .removeAll()
                .add("none");
        assertFailure(response(missingPrivateKeyJwt), "private_key_jwt");

        ObjectNode missingCallback = validDocument();
        missingCallback.withArray("redirect_uris")
                .removeAll()
                .add("https://chatgpt.com/connector/oauth/different-callback");
        assertFailure(response(missingCallback), "redirect URI");
    }

    @Test
    void rejectsInvalidJsonShapeAndMissingClientName() throws Exception {
        assertFailure(
                response(CLIENT_ID, CLIENT_ID, 200, "application/problem+json",
                        "[]".getBytes(StandardCharsets.UTF_8)),
                "JSON object");

        ObjectNode missingClientName = validDocument();
        missingClientName.put("client_name", " ");
        assertFailure(response(missingClientName), "client_name");
    }

    private static OpenAiDeCimdMetadataValidator validator(
            OpenAiDeCimdMetadataValidator.MetadataResponse response) {
        return new OpenAiDeCimdMetadataValidator(OBJECT_MAPPER, ignored -> response);
    }

    private static void assertFailure(
            OpenAiDeCimdMetadataValidator.MetadataResponse response,
            String expectedMessage) {
        assertThatThrownBy(() -> validator(response).validate(validProperties()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("OpenAI Coach V1 secure startup refused")
                .hasMessageContaining(expectedMessage);
    }

    private static OpenAiDeProperties validProperties() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getOauth().setClientId(CLIENT_ID.toString());
        properties.getOauth().setClientJwkSetUri(JWKS_URI);
        properties.getOauth().setRedirectUris(List.of(CALLBACK));
        properties.getOauth().setClientAuthenticationMethod(
                OpenAiDeOAuthConfiguration.CLIENT_AUTH_PRIVATE_KEY_JWT);
        properties.getOauth().setClientAssertionSigningAlgorithm("RS256");
        return properties;
    }

    private static ObjectNode validDocument() {
        ObjectNode document = OBJECT_MAPPER.createObjectNode();
        document.put("client_id", CLIENT_ID.toString());
        document.put("client_name", "ChatGPT");
        document.putArray("redirect_uris").add(CALLBACK);
        document.putArray("token_endpoint_auth_methods_supported")
                .add("none")
                .add("private_key_jwt");
        document.putArray("token_endpoint_auth_signing_alg_values_supported").add("RS256");
        document.put("jwks_uri", JWKS_URI);
        return document;
    }

    private static OpenAiDeCimdMetadataValidator.MetadataResponse response(
            ObjectNode document) throws Exception {
        return response(CLIENT_ID, CLIENT_ID, 200, "application/json; charset=utf-8", bytes(document));
    }

    private static OpenAiDeCimdMetadataValidator.MetadataResponse response(
            URI requestedUri,
            URI effectiveUri,
            int status,
            String contentType,
            byte[] body) {
        return new OpenAiDeCimdMetadataValidator.MetadataResponse(
                requestedUri,
                effectiveUri,
                status,
                contentType,
                body);
    }

    private static byte[] bytes(ObjectNode document) throws Exception {
        return OBJECT_MAPPER.writeValueAsBytes(document);
    }
}
