package com.skillpilot.backend.goalfeedback;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Enables the retention safety-net independently of the public intake flag. */
@Configuration(proxyBeanMethods = false)
@EnableScheduling
public class GoalFeedbackSchedulingConfiguration {
}
