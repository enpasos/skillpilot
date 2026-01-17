package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class GitHubStatsService {

    private static final Logger log = LoggerFactory.getLogger(GitHubStatsService.class);
    private static final String DEFAULT_REPO = "enpasos/skillpilot";
    private static final String API_BASE = "https://api.github.com/search/issues";
    private static final Duration CACHE_TTL = Duration.ofMinutes(30);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String repo;
    private final String token;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public GitHubStatsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
        this.repo = firstNonBlank(System.getenv("SKILLPILOT_GITHUB_REPO"), DEFAULT_REPO);
        this.token = firstNonBlank(System.getenv("SKILLPILOT_GITHUB_TOKEN"), System.getenv("GITHUB_TOKEN"));
    }

    public GitHubStats getStats(String githubId) {
        if (!StringUtils.hasText(githubId)) {
            return GitHubStats.unknown();
        }
        String key = githubId.toLowerCase(Locale.ROOT);
        CacheEntry cached = cache.get(key);
        if (cached != null && !cached.isExpired()) {
            return cached.stats();
        }

        GitHubStats fetched = fetchStats(key);
        if (cached != null) {
            int issues = fetched.issuesCount() >= 0 ? fetched.issuesCount() : cached.stats().issuesCount();
            int prs = fetched.pullRequestsCount() >= 0 ? fetched.pullRequestsCount() : cached.stats().pullRequestsCount();
            GitHubStats merged = new GitHubStats(issues, prs);
            cache.put(key, new CacheEntry(merged, Instant.now()));
            return merged;
        }

        if (fetched.issuesCount() >= 0 || fetched.pullRequestsCount() >= 0) {
            cache.put(key, new CacheEntry(fetched, Instant.now()));
        }
        return fetched;
    }

    private GitHubStats fetchStats(String githubId) {
        int issuesCount = fetchCount("issue", githubId);
        int prCount = fetchCount("pr", githubId);
        return new GitHubStats(issuesCount, prCount);
    }

    private int fetchCount(String type, String githubId) {
        String query = String.format("repo:%s type:%s author:%s", repo, type, githubId);
        String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = API_BASE + "?q=" + encoded + "&per_page=1";

        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .header("Accept", "application/vnd.github+json")
                    .header("User-Agent", "skillpilot");
            if (StringUtils.hasText(token)) {
                builder.header("Authorization", "Bearer " + token);
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode totalCount = root != null ? root.get("total_count") : null;
                if (totalCount != null && totalCount.isInt()) {
                    return totalCount.asInt();
                }
            } else {
                log.warn("GitHub stats request failed ({}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Failed to fetch GitHub stats for {} ({})", githubId, type, e);
        }
        return -1;
    }

    private String firstNonBlank(String value, String fallback) {
        if (StringUtils.hasText(value)) {
            return value.trim();
        }
        return StringUtils.hasText(fallback) ? fallback.trim() : "";
    }

    private record CacheEntry(GitHubStats stats, Instant fetchedAt) {
        boolean isExpired() {
            return fetchedAt.plus(CACHE_TTL).isBefore(Instant.now());
        }
    }

    public record GitHubStats(int issuesCount, int pullRequestsCount) {
        static GitHubStats unknown() {
            return new GitHubStats(-1, -1);
        }
    }
}
