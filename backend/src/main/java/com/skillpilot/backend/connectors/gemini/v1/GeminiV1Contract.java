package com.skillpilot.backend.connectors.gemini.v1;

import java.util.List;
import java.util.Set;

/** Gemini v1's independent transport/session namespace and fachliche tool vocabulary. */
public final class GeminiV1Contract {
    public static final String PROVIDER_ID = "gemini-v1";
    public static final String PROPERTY_PREFIX = "skillpilot.gemini.connector.v1";
    public static final String ENABLED_PROPERTY = PROPERTY_PREFIX + ".enabled";
    public static final String DEFAULT_PUBLIC_BASE_URL = "https://mcp-gemini-v1.skillpilot.com";
    public static final String DEFAULT_PUBLIC_MCP_URL = DEFAULT_PUBLIC_BASE_URL + "/mcp";
    public static final String DEFAULT_PUBLIC_RESOURCE_METADATA_URL =
            DEFAULT_PUBLIC_BASE_URL + "/.well-known/oauth-protected-resource/mcp";
    public static final String DEFAULT_PUBLIC_AUTH_SERVER_METADATA_URL =
            DEFAULT_PUBLIC_BASE_URL + "/.well-known/oauth-authorization-server";
    public static final String DEFAULT_PUBLIC_DOCUMENTATION_URL =
            "https://enpasos.github.io/skillpilot/deploy/gemini-integration/";
    public static final String PUBLIC_PATH_MCP = "/mcp";
    public static final String PUBLIC_PATH_PROTECTED_RESOURCE_METADATA =
            "/.well-known/oauth-protected-resource/mcp";
    public static final String PUBLIC_PATH_AUTH_SERVER_METADATA = "/.well-known/oauth-authorization-server";
    public static final String PUBLIC_PATH_AUTHORIZE = "/authorize";
    public static final String PUBLIC_PATH_TOKEN = "/token";
    public static final String PUBLIC_PATH_REVOKE = "/revoke";
    public static final String PUBLIC_PATH_PRIVACY = "/privacy";
    public static final String INTERNAL_BASE_PATH = "/gemini/v1";
    public static final String INTERNAL_MCP_PATH = INTERNAL_BASE_PATH + "/mcp";
    public static final String SCOPE_READ = "skillpilot.read";
    public static final String SCOPE_WRITE = "skillpilot.write";
    public static final Set<String> SUPPORTED_SCOPES = Set.of(SCOPE_READ, SCOPE_WRITE);

    public static final String TOOL_GET_COACH_CONTEXT = "get_skillpilot_coach_context";
    public static final String TOOL_RESUME_LEARNING_PLAN = "resume_skillpilot_learning_plan";
    public static final String TOOL_SWITCH_LEARNING_PLAN_SUBJECT =
            "switch_skillpilot_learning_plan_subject";
    public static final String TOOL_RENDER_GOAL_VISUALIZATION =
            "render_skillpilot_goal_visualization";
    public static final String TOOL_START_MEMORY_PRACTICE =
            "start_skillpilot_memory_practice";
    public static final String TOOL_GET_MEMORY_PRACTICE_ANSWER = "get_skillpilot_memory_practice_answer";
    public static final String TOOL_REVIEW_MEMORY_PRACTICE_CARD =
            "review_skillpilot_memory_practice_card";
    public static final String TOOL_GET_NAVIGATION_OPTIONS = "get_skillpilot_navigation_options";
    public static final String TOOL_SET_FOCUS = "set_skillpilot_focus";
    public static final String TOOL_SET_ACTIVE_GOAL = "set_skillpilot_active_goal";
    public static final String TOOL_SET_MASTERY = "set_skillpilot_mastery";
    public static final String TOOL_START_VERIFIED_RECALL = "start_skillpilot_verified_recall";
    public static final String TOOL_GET_VERIFIED_RECALL_ANSWERS =
            "get_skillpilot_verified_recall_answers";
    public static final String TOOL_RECORD_VERIFIED_RECALL_RESULTS =
            "record_skillpilot_verified_recall_results";
    public static final String TOOL_GET_EXAM_EVALUATION = "get_skillpilot_exam_evaluation";

    public static final List<String> ALL_TOOL_NAMES = List.of(
            TOOL_GET_COACH_CONTEXT,
            TOOL_RESUME_LEARNING_PLAN,
            TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
            TOOL_RENDER_GOAL_VISUALIZATION,
            TOOL_START_MEMORY_PRACTICE,
            TOOL_GET_MEMORY_PRACTICE_ANSWER,
            TOOL_REVIEW_MEMORY_PRACTICE_CARD,
            TOOL_GET_NAVIGATION_OPTIONS,
            TOOL_SET_FOCUS,
            TOOL_SET_ACTIVE_GOAL,
            TOOL_SET_MASTERY,
            TOOL_START_VERIFIED_RECALL,
            TOOL_GET_VERIFIED_RECALL_ANSWERS,
            TOOL_RECORD_VERIFIED_RECALL_RESULTS,
            TOOL_GET_EXAM_EVALUATION);

    /** Tools that must never mutate learner state; callable with the read scope alone. */
    public static final Set<String> READ_TOOL_NAMES = Set.of(
            TOOL_GET_COACH_CONTEXT,
            TOOL_RENDER_GOAL_VISUALIZATION,
            TOOL_START_MEMORY_PRACTICE,
            TOOL_GET_MEMORY_PRACTICE_ANSWER,
            TOOL_GET_NAVIGATION_OPTIONS,
            TOOL_START_VERIFIED_RECALL,
            TOOL_GET_VERIFIED_RECALL_ANSWERS,
            TOOL_GET_EXAM_EVALUATION);

    /** Tools that mutate canonical learner state; they additionally require the write scope. */
    public static final Set<String> WRITE_TOOL_NAMES = Set.of(
            TOOL_RESUME_LEARNING_PLAN,
            TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
            TOOL_REVIEW_MEMORY_PRACTICE_CARD,
            TOOL_SET_FOCUS,
            TOOL_SET_ACTIVE_GOAL,
            TOOL_SET_MASTERY,
            TOOL_RECORD_VERIFIED_RECALL_RESULTS);

    private GeminiV1Contract() {}
}
