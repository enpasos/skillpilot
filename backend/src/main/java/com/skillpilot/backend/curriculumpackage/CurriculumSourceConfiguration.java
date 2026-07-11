package com.skillpilot.backend.curriculumpackage;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** Always binds the closed source-mode enum so unknown values fail application startup. */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(CurriculumPackageProperties.class)
public class CurriculumSourceConfiguration {
}
