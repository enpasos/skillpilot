package com.skillpilot.backend.openai.de.oauth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpsConfigurator;
import com.sun.net.httpserver.HttpsServer;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import org.springframework.test.context.DynamicPropertyRegistry;

/**
 * Test-only HTTPS CIMD/JWKS endpoint and private-key client used by the
 * OpenAI-DE integration tests.
 *
 * <p>This deliberately exercises the production {@code private_key_jwt}
 * path. It is not an insecure-mode switch and is never part of a production
 * runtime artifact.</p>
 */
public final class OpenAiDeSecureOAuthTestServer {

    private static final String KEY_ID = "openai-de-integration-test-key";
    private static final String ASSERTION_TYPE =
            "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
    private static final String PUBLIC_ORIGIN = "https://skillpilot.test";
    private static final List<String> REDIRECT_URIS = List.of(
            "https://chatgpt.com/connector/oauth/test-callback",
            "https://chatgpt.com/connector/oauth/combined-test-callback",
            "https://chatgpt.com/connector/oauth/e2e-callback");
    private static final Instance INSTANCE = start();

    private OpenAiDeSecureOAuthTestServer() {
    }

    public static String clientId() {
        return INSTANCE.baseUrl() + "/client.json";
    }

    public static String jwkSetUri() {
        return INSTANCE.baseUrl() + "/jwks.json";
    }

    public static void registerSecureProperties(DynamicPropertyRegistry registry) {
        registry.add("skillpilot.openai.de.security.secure-mode", () -> "true");
        registry.add(
                "skillpilot.openai.de.oauth.client-authentication-method",
                () -> OpenAiDeOAuthConfiguration.CLIENT_AUTH_PRIVATE_KEY_JWT);
        registry.add("skillpilot.openai.de.oauth.client-id", OpenAiDeSecureOAuthTestServer::clientId);
        registry.add(
                "skillpilot.openai.de.oauth.client-jwk-set-uri",
                OpenAiDeSecureOAuthTestServer::jwkSetUri);
        registry.add(
                "skillpilot.openai.de.oauth.client-assertion-signing-algorithm",
                () -> "RS256");
        registry.add(
                "skillpilot.openai.de.oauth.client-assertion-replay-cache-size",
                () -> "10000");
        registry.add("skillpilot.openai.de.mtls-edge.enabled", () -> "true");
        registry.add(
                "skillpilot.openai.de.mtls-edge.trusted-proxies",
                () -> "127.0.0.1,::1");
    }

    public static List<Map.Entry<String, String>> withClientAssertion(
            List<Map.Entry<String, String>> parameters,
            String endpointPath) {
        ArrayList<Map.Entry<String, String>> authenticated = new ArrayList<>(parameters);
        authenticated.add(Map.entry("client_assertion_type", ASSERTION_TYPE));
        authenticated.add(Map.entry(
                "client_assertion",
                signedClientAssertion(PUBLIC_ORIGIN + endpointPath)));
        return List.copyOf(authenticated);
    }

    public static HttpRequest.Builder withVerifiedMtlsEdge(HttpRequest.Builder builder) {
        return builder
                .header("X-SkillPilot-OpenAI-mTLS-Verified", "SUCCESS")
                .header("X-SkillPilot-OpenAI-mTLS-SAN", "mtls.prod.connectors.openai.com");
    }

    private static String signedClientAssertion(String endpointAudience) {
        Instant now = Instant.now();
        try {
            SignedJWT assertion = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256)
                            .keyID(KEY_ID)
                            .build(),
                    new JWTClaimsSet.Builder()
                            .issuer(clientId())
                            .subject(clientId())
                            .audience(List.of(
                                    PUBLIC_ORIGIN + OpenAiDeOAuthConfiguration.ISSUER_PATH,
                                    endpointAudience))
                            .issueTime(Date.from(now))
                            .expirationTime(Date.from(now.plusSeconds(60)))
                            .jwtID(UUID.randomUUID().toString())
                            .build());
            assertion.sign(new RSASSASigner(INSTANCE.privateKey()));
            return assertion.serialize();
        } catch (Exception exception) {
            throw new IllegalStateException("Could not sign the test private_key_jwt assertion.", exception);
        }
    }

    private static Instance start() {
        try {
            X509Certificate certificate = readCertificate();
            RSAPrivateKey privateKey = readPrivateKey();
            SSLContext serverContext = serverContext(certificate, privateKey);
            installClientTrust(certificate);

            HttpsServer server = HttpsServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.setHttpsConfigurator(new HttpsConfigurator(serverContext));
            server.setExecutor(Executors.newCachedThreadPool(runnable -> {
                Thread thread = new Thread(runnable, "openai-de-secure-oauth-test-server");
                thread.setDaemon(true);
                return thread;
            }));
            String baseUrl = "https://localhost:" + server.getAddress().getPort();
            RSAPublicKey publicKey = (RSAPublicKey) certificate.getPublicKey();
            String jwks = """
                    {"keys":[{"kty":"RSA","use":"sig","alg":"RS256","kid":"%s","n":"%s","e":"%s"}]}
                    """.formatted(
                    KEY_ID,
                    base64Url(unsigned(publicKey.getModulus().toByteArray())),
                    base64Url(unsigned(publicKey.getPublicExponent().toByteArray())));
            String cimd = """
                    {
                      "client_id":"%s",
                      "client_name":"SkillPilot OpenAI-DE integration-test client",
                      "redirect_uris":%s,
                      "token_endpoint_auth_methods_supported":["private_key_jwt"],
                      "token_endpoint_auth_signing_alg_values_supported":["RS256"],
                      "jwks_uri":"%s/jwks.json"
                    }
                    """.formatted(baseUrl + "/client.json", jsonStringArray(REDIRECT_URIS), baseUrl);
            server.createContext("/client.json", exchange -> {
                byte[] body = cimd.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            server.createContext("/jwks.json", exchange -> {
                byte[] body = jwks.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            server.start();
            return new Instance(baseUrl, privateKey);
        } catch (Exception exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    private static SSLContext serverContext(
            X509Certificate certificate,
            PrivateKey privateKey) throws Exception {
        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null);
        keyStore.setKeyEntry("server", privateKey, new char[0], new X509Certificate[]{certificate});
        KeyManagerFactory keyManagers =
                KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keyManagers.init(keyStore, new char[0]);
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(keyManagers.getKeyManagers(), null, new SecureRandom());
        return context;
    }

    private static void installClientTrust(X509Certificate certificate) throws Exception {
        X509TrustManager systemTrust = trustManager(null);
        KeyStore testTrustStore = KeyStore.getInstance(KeyStore.getDefaultType());
        testTrustStore.load(null);
        testTrustStore.setCertificateEntry("openai-de-test", certificate);
        X509TrustManager testTrust = trustManager(testTrustStore);
        X509TrustManager combined = new X509TrustManager() {
            @Override
            public void checkClientTrusted(X509Certificate[] chain, String authType)
                    throws java.security.cert.CertificateException {
                systemTrust.checkClientTrusted(chain, authType);
            }

            @Override
            public void checkServerTrusted(X509Certificate[] chain, String authType)
                    throws java.security.cert.CertificateException {
                try {
                    systemTrust.checkServerTrusted(chain, authType);
                } catch (java.security.cert.CertificateException ignored) {
                    testTrust.checkServerTrusted(chain, authType);
                }
            }

            @Override
            public X509Certificate[] getAcceptedIssuers() {
                X509Certificate[] system = systemTrust.getAcceptedIssuers();
                X509Certificate[] test = testTrust.getAcceptedIssuers();
                X509Certificate[] result = new X509Certificate[system.length + test.length];
                System.arraycopy(system, 0, result, 0, system.length);
                System.arraycopy(test, 0, result, system.length, test.length);
                return result;
            }
        };
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, new TrustManager[]{combined}, new SecureRandom());
        SSLContext.setDefault(context);
        HttpsURLConnection.setDefaultSSLSocketFactory(context.getSocketFactory());
    }

    private static X509TrustManager trustManager(KeyStore keyStore) throws Exception {
        TrustManagerFactory factory =
                TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        factory.init(keyStore);
        for (TrustManager trustManager : factory.getTrustManagers()) {
            if (trustManager instanceof X509TrustManager x509TrustManager) {
                return x509TrustManager;
            }
        }
        throw new IllegalStateException("No X509 trust manager is available.");
    }

    private static X509Certificate readCertificate() throws Exception {
        try (InputStream input = resource("openai-de-secure-oauth-test-cert.pem")) {
            return (X509Certificate) CertificateFactory.getInstance("X.509")
                    .generateCertificate(input);
        }
    }

    private static RSAPrivateKey readPrivateKey() throws Exception {
        String pem;
        try (InputStream input = resource("openai-de-secure-oauth-test-key.pem")) {
            pem = new String(input.readAllBytes(), StandardCharsets.US_ASCII);
        }
        byte[] encoded = Base64.getMimeDecoder().decode(
                pem.replace("-----BEGIN PRIVATE KEY-----", "")
                        .replace("-----END PRIVATE KEY-----", ""));
        return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(encoded));
    }

    private static InputStream resource(String name) throws IOException {
        InputStream input = OpenAiDeSecureOAuthTestServer.class
                .getClassLoader()
                .getResourceAsStream(name);
        if (input == null) {
            throw new IOException("Missing test resource " + name);
        }
        return input;
    }

    private static String jsonStringArray(List<String> values) {
        return values.stream()
                .map(value -> "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(java.util.stream.Collectors.joining(",", "[", "]"));
    }

    private static byte[] unsigned(byte[] value) {
        return value.length > 1 && value[0] == 0
                ? java.util.Arrays.copyOfRange(value, 1, value.length)
                : value;
    }

    private static String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private record Instance(String baseUrl, RSAPrivateKey privateKey) {
    }
}
