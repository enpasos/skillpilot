package com.skillpilot.backend.service.srs;

import com.skillpilot.backend.api.VerifiedRecallPromptResponse;

/**
 * The start of a unit check (issue #85): the server-chosen deck goal, the unit
 * the batch is bound to ({@code practiceScopeId} of the card step) and the
 * first server-sized batch. The scope travels with the batch so that its
 * answers and results are validated against exactly that unit.
 */
public record UnitCheckStart(String goalId, String practiceScopeId, VerifiedRecallPromptResponse prompt) {
}
