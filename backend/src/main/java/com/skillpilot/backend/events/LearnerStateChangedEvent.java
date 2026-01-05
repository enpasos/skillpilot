package com.skillpilot.backend.events;

import org.springframework.context.ApplicationEvent;

public class LearnerStateChangedEvent extends ApplicationEvent {

    private final String skillpilotId;
    private final String changeType;

    public LearnerStateChangedEvent(Object source, String skillpilotId, String changeType) {
        super(source);
        this.skillpilotId = skillpilotId;
        this.changeType = changeType;
    }

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public String getChangeType() {
        return changeType;
    }
}
