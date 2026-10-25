package com.smartpatient.patient.dto;

import java.time.LocalDateTime;

public class PatientTimelineEventDto implements Comparable<PatientTimelineEventDto> {
    private String id;
    private String eventType;
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private String badgeType; // info, success, warning, primary

    public PatientTimelineEventDto() {}

    public PatientTimelineEventDto(String id, String eventType, String title, String description,
                                  LocalDateTime timestamp, String badgeType) {
        this.id = id;
        this.eventType = eventType;
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.badgeType = badgeType;
    }

    @Override
    public int compareTo(PatientTimelineEventDto other) {
        if (this.timestamp == null && other.timestamp == null) return 0;
        if (this.timestamp == null) return 1;
        if (other.timestamp == null) return -1;
        return other.timestamp.compareTo(this.timestamp); // Newest first
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getBadgeType() {
        return badgeType;
    }

    public void setBadgeType(String badgeType) {
        this.badgeType = badgeType;
    }
}
