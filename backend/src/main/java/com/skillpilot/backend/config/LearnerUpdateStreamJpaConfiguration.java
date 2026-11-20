package com.skillpilot.backend.config;

import com.skillpilot.backend.api.UpdateController;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingFilterBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration(proxyBeanMethods = false)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnBooleanProperty(name = "spring.jpa.open-in-view", matchIfMissing = true)
@ConditionalOnMissingBean({OpenEntityManagerInViewInterceptor.class, OpenEntityManagerInViewFilter.class})
@ConditionalOnMissingFilterBean(OpenEntityManagerInViewFilter.class)
class LearnerUpdateStreamJpaConfiguration {
    @Bean
    OpenEntityManagerInViewInterceptor openEntityManagerInViewInterceptor() {
        return new OpenEntityManagerInViewInterceptor();
    }

    @Bean
    WebMvcConfigurer openEntityManagerInViewConfigurer(OpenEntityManagerInViewInterceptor interceptor) {
        return new WebMvcConfigurer() {
            @Override
            public void addInterceptors(InterceptorRegistry registry) {
                // Only emitter registration needs the learner row lock. The stream can stay open for minutes.
                registry.addWebRequestInterceptor(interceptor).excludePathPatterns(UpdateController.STREAM_PATH);
            }
        };
    }
}
