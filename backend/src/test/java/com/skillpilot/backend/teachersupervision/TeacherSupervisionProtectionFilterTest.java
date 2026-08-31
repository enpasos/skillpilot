package com.skillpilot.backend.teachersupervision;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class TeacherSupervisionProtectionFilterTest {

    private static final String BASE = TeacherSupervisionApi.BASE_PATH;
    private static final String ALLOWED_ORIGIN = "https://skillpilot.test";

    @Test
    void postRequiresOneAllowedOriginAndJsonAndAlwaysReturnsNoStore() throws Exception {
        TeacherSupervisionProtectionFilter filter = filter(20, 20, 10);

        MockHttpServletResponse missingOrigin = invoke(filter, post("/courses", "{}", null));
        assertThat(missingOrigin.getStatus()).isEqualTo(403);
        assertNoStore(missingOrigin);

        MockHttpServletRequest duplicateOriginRequest = post("/courses", "{}", ALLOWED_ORIGIN);
        duplicateOriginRequest.addHeader("Origin", "http://localhost:5173");
        assertThat(invoke(filter, duplicateOriginRequest).getStatus()).isEqualTo(403);

        MockHttpServletRequest wrongType = post("/courses", "{}", ALLOWED_ORIGIN);
        wrongType.setContentType("text/plain");
        assertThat(invoke(filter, wrongType).getStatus()).isEqualTo(415);

        MockHttpServletRequest accepted = post("/courses", "{\"courseLabel\":\"P\"}", ALLOWED_ORIGIN);
        MockHttpServletResponse acceptedResponse = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(accepted, acceptedResponse, chain);
        assertThat(chain.getRequest()).isNotNull();
        assertThat(chain.getRequest().getInputStream().readAllBytes())
                .isEqualTo("{\"courseLabel\":\"P\"}".getBytes(StandardCharsets.UTF_8));
        assertNoStore(acceptedResponse);

        MockHttpServletRequest corsOrigin = post("/courses", "{}", "http://localhost:5173");
        assertThat(invoke(filter, corsOrigin).getStatus()).isEqualTo(200);
    }

    @Test
    void deleteRequiresAllowedOriginWhileReadsDoNot() throws Exception {
        TeacherSupervisionProtectionFilter filter = filter(20, 20, 10);

        MockHttpServletRequest missingOrigin = request("DELETE", "/courses/course-id", "");
        assertThat(invoke(filter, missingOrigin).getStatus()).isEqualTo(403);

        MockHttpServletRequest acceptedDelete = request("DELETE", "/courses/course-id", "");
        acceptedDelete.addHeader("Origin", ALLOWED_ORIGIN);
        assertThat(invoke(filter, acceptedDelete).getStatus()).isEqualTo(200);

        MockHttpServletResponse acceptedGet = invoke(filter, request("GET", "/courses/course-id", ""));
        assertThat(acceptedGet.getStatus()).isEqualTo(200);
        assertNoStore(acceptedGet);
    }

    @Test
    void everyMethodIsLimitedToAnEightKibibyteTransientBody() throws Exception {
        TeacherSupervisionProtectionFilter filter = filter(20, 20, 10);

        MockHttpServletRequest exact = post(
                "/courses",
                "x".repeat(TeacherSupervisionProtectionFilter.MAX_BODY_BYTES),
                ALLOWED_ORIGIN);
        assertThat(invoke(filter, exact).getStatus()).isEqualTo(200);

        MockHttpServletRequest declaredTooLarge = post(
                "/courses",
                "x".repeat(TeacherSupervisionProtectionFilter.MAX_BODY_BYTES + 1),
                ALLOWED_ORIGIN);
        MockHttpServletResponse declaredResponse = invoke(filter, declaredTooLarge);
        assertThat(declaredResponse.getStatus()).isEqualTo(413);
        assertNoStore(declaredResponse);

        MockHttpServletRequest unknownLength = new MockHttpServletRequest(
                "GET", BASE + "/courses/course-id") {
            @Override
            public int getContentLength() {
                return -1;
            }

            @Override
            public long getContentLengthLong() {
                return -1;
            }
        };
        unknownLength.setRemoteAddr("192.0.2.51");
        unknownLength.setContent("x".repeat(TeacherSupervisionProtectionFilter.MAX_BODY_BYTES + 1)
                .getBytes(StandardCharsets.UTF_8));
        assertThat(invoke(filter, unknownLength).getStatus()).isEqualTo(413);
    }

    @Test
    void workspaceCreationHasItsExactIndependentTenPerMinuteWindow() throws Exception {
        TeacherSupervisionProtectionFilter filter = productionLimitsFilter();

        for (int index = 0; index < 9; index++) {
            assertThat(invoke(filter, post("/workspaces", "{}", ALLOWED_ORIGIN)).getStatus())
                    .isEqualTo(200);
        }
        MockHttpServletRequest matrixVariant = new MockHttpServletRequest(
                "POST", "/api;probe=1/ui/teacher-supervision/v1/workspaces;source=cockpit");
        matrixVariant.setRemoteAddr("192.0.2.10");
        matrixVariant.setContentType("application/json");
        matrixVariant.setContent("{}".getBytes(StandardCharsets.UTF_8));
        matrixVariant.addHeader("Origin", ALLOWED_ORIGIN);
        assertThat(invoke(filter, matrixVariant).getStatus()).isEqualTo(200);

        MockHttpServletResponse limited = invoke(filter, post("/workspaces", "{}", ALLOWED_ORIGIN));
        assertThat(limited.getStatus()).isEqualTo(429);
        assertThat(limited.getHeader("Retry-After")).isEqualTo("60");
        assertNoStore(limited);

        // Workspace creation does not consume the separate polling/read window.
        assertThat(invoke(filter, request("GET", "/courses/course-id", "")).getStatus())
                .isEqualTo(200);
    }

    @Test
    void allOtherRequestsAllowOneHundredTwentyPollingCallsPerMinute() throws Exception {
        TeacherSupervisionProtectionFilter filter = productionLimitsFilter();

        for (int index = 0; index < TeacherSupervisionProtectionFilter.OTHER_REQUESTS_PER_WINDOW; index++) {
            assertThat(invoke(filter, request("GET", "/courses/course-id", "")).getStatus())
                    .as("poll %s", index + 1)
                    .isEqualTo(200);
        }
        MockHttpServletResponse limited = invoke(filter, request("GET", "/courses/course-id", ""));
        assertThat(limited.getStatus()).isEqualTo(429);
        assertThat(limited.getHeader("Retry-After")).isEqualTo("60");
    }

    @Test
    void onlyALoopbackProxyMaySupplyRealIpAndForwardedForIsIgnored() throws Exception {
        TeacherSupervisionProtectionFilter filter = filter(1, 1, 10);

        HttpServletRequest first = forwardingWrapper(
                readRequest("127.0.0.1", "203.0.113.10", "198.51.100.10"),
                "203.0.113.10");
        assertThat(invoke(filter, first).getStatus()).isEqualTo(200);

        HttpServletRequest spoofedForwarding = forwardingWrapper(
                readRequest("127.0.0.1", "203.0.113.20", "198.51.100.10"),
                "203.0.113.20");
        assertThat(invoke(filter, spoofedForwarding).getStatus()).isEqualTo(429);

        HttpServletRequest secondRealClient = forwardingWrapper(
                readRequest("127.0.0.1", "203.0.113.20", "198.51.100.11"),
                "203.0.113.20");
        assertThat(invoke(filter, secondRealClient).getStatus()).isEqualTo(200);

        TeacherSupervisionProtectionFilter directFilter = filter(1, 1, 10);
        assertThat(invoke(directFilter,
                        readRequest("192.0.2.44", "198.51.100.1", "198.51.100.10"))
                .getStatus()).isEqualTo(200);
        assertThat(invoke(directFilter,
                        readRequest("192.0.2.44", "198.51.100.2", "198.51.100.11"))
                .getStatus()).isEqualTo(429);
    }

    @Test
    void duplicateOrInvalidRealIpFallsBackToTheLoopbackProxyBucket() throws Exception {
        TeacherSupervisionProtectionFilter filter = filter(1, 1, 10);

        MockHttpServletRequest duplicate = readRequest("127.0.0.1", null, "198.51.100.10");
        duplicate.addHeader("X-Real-IP", "198.51.100.11");
        assertThat(invoke(filter, duplicate).getStatus()).isEqualTo(200);

        MockHttpServletRequest invalid = readRequest("127.0.0.1", null, "host.example");
        assertThat(invoke(filter, invalid).getStatus()).isEqualTo(429);
    }

    @Test
    void clientMapsStayStrictlyBoundedAndNewClientsShareAnOverflowCounter() throws Exception {
        TeacherSupervisionProtectionFilter filter = filter(1, 1, 2);

        assertThat(invoke(filter, readRequest("192.0.2.1", null, null)).getStatus()).isEqualTo(200);
        assertThat(invoke(filter, readRequest("192.0.2.2", null, null)).getStatus()).isEqualTo(200);
        assertThat(filter.otherClientBucketCount()).isEqualTo(2);

        assertThat(invoke(filter, readRequest("192.0.2.1", null, null)).getStatus()).isEqualTo(429);
        assertThat(invoke(filter, readRequest("192.0.2.3", null, null)).getStatus()).isEqualTo(200);
        assertThat(invoke(filter, readRequest("192.0.2.4", null, null)).getStatus()).isEqualTo(429);
        assertThat(filter.otherClientBucketCount()).isEqualTo(2);
        assertThat(filter.workspaceClientBucketCount()).isZero();
    }

    @Test
    void matrixParametersCannotBypassOrBroadenTheNamespaceBoundary() throws Exception {
        TeacherSupervisionProtectionFilter filter = filter(20, 20, 10);

        for (String protectedPath : new String[] {
                "/api;probe=1/ui/teacher-supervision/v1/courses",
                "/api/ui;probe=1/teacher-supervision/v1/courses",
                "/api/ui/teacher-supervision;probe=1/v1/courses",
                "/api/ui/teacher-supervision/v1;probe=1/courses"
        }) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", protectedPath);
            request.setRemoteAddr("192.0.2.60");
            request.setContentType("application/json");
            request.setContent("{}".getBytes(StandardCharsets.UTF_8));
            MockHttpServletResponse response = invoke(filter, request);
            assertThat(response.getStatus()).as(protectedPath).isEqualTo(403);
            assertNoStore(response);
        }

        MockHttpServletRequest similar = new MockHttpServletRequest(
                "POST", "/api/ui/teacher-supervision/v10/courses");
        MockFilterChain chain = new MockFilterChain();
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(similar, response, chain);
        assertThat(chain.getRequest()).isSameAs(similar);
        assertThat(response.getHeader("Cache-Control")).isNull();
    }

    @Test
    void protectionBeanExistsOnlyWhenTeacherSupervisionIsEnabled() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withUserConfiguration(FilterConfiguration.class);

        runner.run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context).doesNotHaveBean(TeacherSupervisionProtectionFilter.class);
        });
        runner.withPropertyValues("skillpilot.teacher-supervision.enabled=true")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(TeacherSupervisionProtectionFilter.class);
                });
    }

    private static TeacherSupervisionProtectionFilter productionLimitsFilter() {
        return filter(
                TeacherSupervisionProtectionFilter.WORKSPACE_REQUESTS_PER_WINDOW,
                TeacherSupervisionProtectionFilter.OTHER_REQUESTS_PER_WINDOW,
                10);
    }

    private static TeacherSupervisionProtectionFilter filter(
            int workspaceRequests,
            int otherRequests,
            int maximumClients) {
        return new TeacherSupervisionProtectionFilter(
                ALLOWED_ORIGIN + "/path-is-ignored",
                "http://localhost:5173",
                workspaceRequests,
                otherRequests,
                Duration.ofMinutes(1),
                maximumClients,
                Clock.fixed(Instant.parse("2026-08-31T10:00:00Z"), ZoneOffset.UTC));
    }

    private static MockHttpServletRequest post(String path, String body, String origin) {
        MockHttpServletRequest request = request("POST", path, body);
        request.setContentType("application/json");
        if (origin != null) {
            request.addHeader("Origin", origin);
        }
        return request;
    }

    private static MockHttpServletRequest request(String method, String path, String body) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, BASE + path);
        request.setRemoteAddr("192.0.2.10");
        request.setContent(body.getBytes(StandardCharsets.UTF_8));
        return request;
    }

    private static MockHttpServletRequest readRequest(
            String rawRemoteAddress,
            String forwardedFor,
            String realIp) {
        MockHttpServletRequest request = request("GET", "/courses/course-id", "");
        request.setRemoteAddr(rawRemoteAddress);
        if (forwardedFor != null) {
            request.addHeader("X-Forwarded-For", forwardedFor);
        }
        if (realIp != null) {
            request.addHeader("X-Real-IP", realIp);
        }
        return request;
    }

    private static HttpServletRequest forwardingWrapper(
            MockHttpServletRequest rawRequest,
            String forwardedRemoteAddress) {
        return new HttpServletRequestWrapper(rawRequest) {
            @Override
            public String getRemoteAddr() {
                return forwardedRemoteAddress;
            }
        };
    }

    private static MockHttpServletResponse invoke(
            TeacherSupervisionProtectionFilter filter,
            HttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    private static void assertNoStore(MockHttpServletResponse response) {
        assertThat(response.getHeader("Cache-Control")).isEqualTo("no-store");
        assertThat(response.getHeader("Pragma")).isEqualTo("no-cache");
    }

    @Configuration(proxyBeanMethods = false)
    @Import(TeacherSupervisionProtectionFilter.class)
    static class FilterConfiguration {
    }
}
