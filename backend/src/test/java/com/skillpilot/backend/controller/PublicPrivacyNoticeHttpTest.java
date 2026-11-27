package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.config.WebConfig;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.tomcat.autoconfigure.servlet.TomcatServletWebServerAutoConfiguration;
import org.springframework.boot.webmvc.autoconfigure.DispatcherServletAutoConfiguration;
import org.springframework.boot.webmvc.autoconfigure.WebMvcAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@SpringBootTest(
        classes = PublicPrivacyNoticeHttpTest.Application.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "server.address=127.0.0.1")
class PublicPrivacyNoticeHttpTest {
    @LocalServerPort
    private int port;

    private final HttpClient http = HttpClient.newHttpClient();

    @ParameterizedTest
    @ValueSource(strings = {
            "/privacy",
            "/privacy/",
            "/privacy/index.html",
            "/privacy?lang=en#en",
            "/privacy/?lang=de#de",
            "/privacy/index.html?source=portal#en"
    })
    void servesTheExistingBilingualNoticeWithGetAndHead(String path) throws Exception {
        URI uri = URI.create("http://127.0.0.1:" + port + path);
        var get = http.send(HttpRequest.newBuilder(uri).GET().build(), HttpResponse.BodyHandlers.ofByteArray());
        var head = http.send(
                HttpRequest.newBuilder(uri).method("HEAD", HttpRequest.BodyPublishers.noBody()).build(),
                HttpResponse.BodyHandlers.ofByteArray());

        byte[] notice = new ClassPathResource("static/privacy/index.html").getContentAsByteArray();
        String html = new String(get.body(), StandardCharsets.UTF_8);
        assertThat(get.statusCode()).isEqualTo(200);
        assertThat(get.body()).containsExactly(notice);
        assertThat(html).contains(
                "<link rel=\"canonical\" href=\"https://skillpilot.com/privacy\">",
                "<article id=\"de\" lang=\"de\">", "<h2>Datenschutzerklärung</h2>",
                "<article id=\"en\" lang=\"en\">", "<h2>Privacy Policy</h2>",
                "href=\"#de\"", "href=\"#en\"", "href=\"/\"", "href=\"/imprint\"");

        String contentType = get.headers().firstValue(HttpHeaders.CONTENT_TYPE).orElseThrow();
        assertThat(MediaType.parseMediaType(contentType))
                .isEqualTo(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8));
        assertThat(head.statusCode()).isEqualTo(200);
        assertThat(head.headers().firstValue(HttpHeaders.CONTENT_TYPE)).contains(contentType);
        assertThat(head.headers().firstValueAsLong(HttpHeaders.CONTENT_LENGTH)).hasValue(notice.length);
        assertThat(head.body()).isEmpty();
    }

    @Configuration(proxyBeanMethods = false)
    @ImportAutoConfiguration({
            TomcatServletWebServerAutoConfiguration.class,
            DispatcherServletAutoConfiguration.class,
            WebMvcAutoConfiguration.class
    })
    @Import({SpaController.class, WebConfig.class})
    static class Application {}
}
