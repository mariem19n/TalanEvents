package com.example.stage_talan.dto;

import java.util.List;
import java.util.Map;

public class OrganizerOverviewDto {
    public long totalEvents;

    public long totalInvitations;
    public long acceptedInvitations;
    public long pendingInvitations;
    public long declinedInvitations;
    public long maybeInvitations;
    public long expiredInvitations;

    public double participationRate;         // (accepted / totalInvitations)*100
    public double avgParticipantsPerEvent;   // accepted / totalEvents

    public Map<String, Long> eventsByStatus; // PENDING / VALIDATED / REJECTED -> count

    public List<TopEventDto> topEvents;      // Top 3 par nb ACCEPTED

    public OrganizerOverviewDto() {}
}
