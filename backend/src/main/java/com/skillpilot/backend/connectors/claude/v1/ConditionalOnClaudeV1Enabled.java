package com.skillpilot.backend.connectors.claude.v1;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

/**
 * Marks a bean as part of the Claude Connector v1 provider lane.
 *
 * <p>Every Claude v1 bean carries this condition, including component-scanned services,
 * repositories and controllers. Without it a scanned {@code @RestController} would register its
 * routes while the lane is switched off, and those routes would then be matched by the
 * application-wide default security chain instead of the two Claude v1 chains.</p>
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@ConditionalOnProperty(name = ClaudeV1Contract.ENABLED_PROPERTY, havingValue = "true")
public @interface ConditionalOnClaudeV1Enabled {
}
