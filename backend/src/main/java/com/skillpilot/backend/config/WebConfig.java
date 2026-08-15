package com.skillpilot.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // App shell and update metadata must always be revalidated from the server.
        registry.addResourceHandler("/index.html", "/sw.js", "/manifest.webmanifest", "/version.json")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noStore());

        // Expose the content-addressed OpenAI review recording only through an
        // /api path. Existing service workers already exclude /api/** from
        // their SPA navigation fallback, so this remains a real network request
        // even for clients controlled by an older worker. The classpath source
        // deliberately lives outside the general static-resource locations.
        registry.addResourceHandler("/api/public/openai/review/**")
                .addResourceLocations("classpath:/openai-review/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());

        // Goal IDs are stable while their reviewed visualization bytes may be
        // replaced. Revalidate the canonical URL; provider widgets receive an
        // additional deployed-build revision in their image URL.
        registry.addResourceHandler("/assets/goal-visualizations/**")
                .addResourceLocations("classpath:/static/assets/goal-visualizations/")
                .setCacheControl(CacheControl.noCache().cachePublic());

        // Generated frontend assets carry content hashes and can be cached for a year.
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());

        // AI-facing asset path (bypasses SPA fallback on the main host)
        registry.addResourceHandler("/ai-assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());

        // Default for other static resources
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache());
    }
}
