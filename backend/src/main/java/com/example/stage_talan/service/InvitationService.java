package com.example.stage_talan.service;

import com.example.stage_talan.dto.InvitationRequest;
import com.example.stage_talan.dto.InvitationResponse;
import com.example.stage_talan.model.*;
import com.example.stage_talan.repository.AppUserRepository;
import com.example.stage_talan.repository.EventRepository;
import com.example.stage_talan.repository.InvitationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final AppUserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public InvitationResponse sendAndNotify(InvitationRequest request, Principal principal) {
        String email = principal.getName();
        AppUser sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        Invitation invitation = sendInvitation(request.getEventId(), request.getInvitedUserId(), request.getMessage(), sender);
        InvitationResponse response = mapToDto(invitation);

        String destination = "/topic/invitations/" + request.getInvitedUserId();
        messagingTemplate.convertAndSend(destination, response);

        return response;
    }

    public InvitationResponse respondTo(Long invitationId, InvitationStatus response, Principal principal) {
        String email = principal.getName();
        AppUser currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé."));

        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation non trouvée"));

        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de répondre à cette invitation.");
        }

        invitation.setStatus(response);
        invitation.setRespondedAt(LocalDateTime.now());

        return mapToDto(invitationRepository.save(invitation));
    }

    public List<InvitationResponse> getReceivedInvitations(Principal principal) {
        String email = principal.getName();
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        return invitationRepository.findByInvitedUser(user)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public Invitation sendInvitation(Long eventId, Long invitedUserId, String message, AppUser sender){
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));

        AppUser invitedUser = userRepository.findById(invitedUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur invité non trouvé"));

        if (!event.getCreatedBy().getId().equals(sender.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à inviter pour cet événement.");
        }

        if (!event.getStatus().equals(EventStatus.VALIDATED)) {
            throw new RuntimeException("Vous ne pouvez pas envoyer d'invitations tant que l'événement n’a pas été validé par l’administrateur.");
        }

        Optional<Invitation> existing = invitationRepository.findByEventAndInvitedUser(event, invitedUser);
        if (existing.isPresent()) {
            return existing.get();
        }

        Invitation invitation = Invitation.builder()
                .event(event)
                .invitedUser(invitedUser)
                .status(InvitationStatus.PENDING)
                .sentAt(LocalDateTime.now())
                .message(message)
                .build();

        return invitationRepository.save(invitation);
    }

    public InvitationResponse mapToDto(Invitation invitation) {
        InvitationResponse dto = new InvitationResponse();
        dto.setId(invitation.getId());
        dto.setEventId(invitation.getEvent().getId());
        dto.setEventTitle(invitation.getEvent().getTitle());
        dto.setInvitedUserId(invitation.getInvitedUser().getId());
        dto.setInvitedUserFullName(
                invitation.getInvitedUser().getFirstName() + " " + invitation.getInvitedUser().getLastName());
        dto.setStatus(invitation.getStatus().name());
        dto.setSentAt(invitation.getSentAt());
        dto.setRespondedAt(invitation.getRespondedAt());
        dto.setMessage(invitation.getMessage());
        return dto;
    }


    public Optional<Invitation> getById(Long id) {
        return invitationRepository.findById(id);
    }

    public List<InvitationResponse> getInvitationsForEvent(Long eventId, Principal principal) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));

        AppUser currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Autoriser : organizer OU ADMIN
        boolean isCreator = event.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().contains(Role.ADMIN);

        if (!isCreator && !isAdmin) {
            throw new RuntimeException("Accès refusé. Vous devez être organisateur ou administrateur.");
        }

        return invitationRepository.findByEvent(event)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void expireOutdatedInvitations() {
        List<Invitation> pendingInvitations = invitationRepository.findByStatus(InvitationStatus.PENDING);
        LocalDate today = LocalDate.now();

        for (Invitation invitation : pendingInvitations) {
            Event event = invitation.getEvent();
            if (event.getEventDate().isBefore(today)) {
                invitation.setStatus(InvitationStatus.EXPIRED);
                invitation.setRespondedAt(LocalDateTime.now());
                invitationRepository.save(invitation);
            }
        }
    }


}
