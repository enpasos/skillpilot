package com.skillpilot.backend.teachersupervision;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

/** Keeps the additive teacher-supervision API fail-closed until explicitly enabled. */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@ConditionalOnProperty(
        name = TeacherSupervisionApi.ENABLED_PROPERTY,
        havingValue = "true")
public @interface ConditionalOnTeacherSupervisionEnabled {
}
