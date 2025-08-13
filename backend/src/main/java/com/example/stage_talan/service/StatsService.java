package com.example.stage_talan.service;

import com.example.stage_talan.dto.EventStatsDto;
import com.example.stage_talan.dto.OrganizerOverviewDto;
import com.example.stage_talan.dto.TopEventDto;
import com.example.stage_talan.model.EventStatus;
import com.example.stage_talan.model.InvitationStatus;
import com.example.stage_talan.repository.EventRepository;
import com.example.stage_talan.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final EventRepository eventRepo;
    private final InvitationRepository invRepo;

    // ---- Stats globales pour un organisateur ----
    public OrganizerOverviewDto getOrganizerOverview(Long organizerId) {
        OrganizerOverviewDto dto = new OrganizerOverviewDto();

        long totalEvents = eventRepo.countByCreatedBy_Id(organizerId);

        long totalInv = invRepo.countByOrganizer(organizerId);
        long acc      = invRepo.countByOrganizerAndStatus(organizerId, InvitationStatus.ACCEPTED);
        long pen      = invRepo.countByOrganizerAndStatus(organizerId, InvitationStatus.PENDING);
        long dec      = invRepo.countByOrganizerAndStatus(organizerId, InvitationStatus.DECLINED);
        long may      = invRepo.countByOrganizerAndStatus(organizerId, InvitationStatus.MAYBE);
        long exp      = invRepo.countByOrganizerAndStatus(organizerId, InvitationStatus.EXPIRED);

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("PENDING",   eventRepo.countByCreatedBy_IdAndStatus(organizerId, EventStatus.PENDING));
        byStatus.put("VALIDATED", eventRepo.countByCreatedBy_IdAndStatus(organizerId, EventStatus.VALIDATED));
        byStatus.put("REJECTED",  eventRepo.countByCreatedBy_IdAndStatus(organizerId, EventStatus.REJECTED));

        List<TopEventDto> topEvents = invRepo.topEventsByAccepted(organizerId);
        if (topEvents.size() > 3) topEvents = topEvents.subList(0, 3);

        dto.totalEvents = totalEvents;

        dto.totalInvitations = totalInv;
        dto.acceptedInvitations = acc;
        dto.pendingInvitations = pen;
        dto.declinedInvitations = dec;
        dto.maybeInvitations = may;
        dto.expiredInvitations = exp;

        dto.eventsByStatus = byStatus;
        dto.topEvents = topEvents;

        dto.participationRate = (totalInv == 0) ? 0.0 : (acc * 100.0 / totalInv);
        dto.avgParticipantsPerEvent = (totalEvents == 0) ? 0.0 : (acc * 1.0 / totalEvents);

        return dto;
    }

    // ---- Stats pour un événement ----
    public EventStatsDto getEventStats(Long eventId) {
        EventStatsDto dto = new EventStatsDto();
        dto.eventId = eventId;
        dto.title = eventRepo.findTitleById(eventId);



        long total = invRepo.countByEvent_Id(eventId);
        long a = invRepo.countByEvent_IdAndStatus(eventId, InvitationStatus.ACCEPTED);
        long p = invRepo.countByEvent_IdAndStatus(eventId, InvitationStatus.PENDING);
        long d = invRepo.countByEvent_IdAndStatus(eventId, InvitationStatus.DECLINED);
        long m = invRepo.countByEvent_IdAndStatus(eventId, InvitationStatus.MAYBE);
        long e = invRepo.countByEvent_IdAndStatus(eventId, InvitationStatus.EXPIRED);

        dto.invitations = total;
        dto.accepted = a;
        dto.pending = p;
        dto.declined = d;
        dto.maybe = m;
        dto.expired = e;

        dto.participationRate = (total == 0) ? 0.0 : (a * 100.0 / total);

        return dto;
    }
}
