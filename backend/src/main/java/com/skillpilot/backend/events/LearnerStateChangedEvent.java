package com.skillpilot.backend.events;

import org.springframework.context.ApplicationEvent;

public class LearnerStateChangedEvent extends ApplicationEvent {

    private final String skillpilotId;
    private final String changeType;
    private final String nodeId;

    public LearnerStateChangedEvent(Object source, String skillpilotId, String changeType) {
        this(source, skillpilotId, changeType, null);
    }

    public LearnerStateChangedEvent(Object source, String skillpilotId, String changeType, String nodeId) {
        super(source);
        this.skillpilotId = skillpilotId;
        this.changeType = changeType;
        this.nodeId = nodeId;
    }

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public String getChangeType() {
        return changeType;
    }

    public String getNodeId() {
        return nodeId;
    }
}
