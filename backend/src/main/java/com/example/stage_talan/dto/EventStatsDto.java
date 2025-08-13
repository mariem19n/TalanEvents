package com.example.stage_talan.dto;

public class EventStatsDto {
    public Long eventId;
    public String title;

    public long invitations;
    public long accepted;
    public long pending;
    public long declined;
    public long maybe;
    public long expired;

    public double participationRate; // (accepted / invitations)*100

    public EventStatsDto() {}
}
