package com.skillpilot.backend.connectors.gemini.v1;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

/**
 * Marks a bean as part of the Gemini Connector v1 provider lane.
 *
 * <p>Every Gemini v1 bean carries this condition, including component-scanned services,
 * repositories and controllers. Without it a scanned {@code @RestController} would register its
 * routes while the lane is switched off, and those routes would then be matched by the
 * application-wide default security chain instead of the two Gemini v1 chains.</p>
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@ConditionalOnProperty(name = GeminiV1Contract.ENABLED_PROPERTY, havingValue = "true")
public @interface ConditionalOnGeminiV1Enabled {
}
