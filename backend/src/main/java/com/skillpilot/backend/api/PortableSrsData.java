package com.skillpilot.backend.api;

import java.util.Map;

/** Existing card process data protected by the learner export's HMAC. */
public record PortableSrsData(int schemaVersion, Map<String, Map<String, Object>> states) { }
