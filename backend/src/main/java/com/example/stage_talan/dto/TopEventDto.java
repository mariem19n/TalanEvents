package com.example.stage_talan.dto;

public class TopEventDto {
    public Long eventId;
    public String title;
    public long participants; // ACCEPTED

    public TopEventDto(Long eventId, String title, long participants) {
        this.eventId = eventId;
        this.title = title;
        this.participants = participants;
    }
}
