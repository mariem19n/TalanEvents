package com.example.stage_talan.service;

import com.example.stage_talan.dto.InvitationRequest;
import com.example.stage_talan.dto.InvitationResponse;
import com.example.stage_talan.dto.SingleInvitationRequest;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final AppUserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;


    public InvitationResponse sendAndNotify(SingleInvitationRequest request, Principal principal) {
        // 1) L'expéditeur
        String senderEmail = principal.getName();
        AppUser sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        // 2) Création de l'invitation
        Invitation invitation = sendInvitation(
                request.getEventId(), request.getInvitedUserId(), request.getMessage(), sender
        );
        System.out.println("✅ Invitation créée : " + invitation);

        // 3) DTO à envoyer
        InvitationResponse response = mapToDto(invitation);
        System.out.println("✅ DTO WebSocket : " + response);

        // 4) Récupérer l'email du destinataire (fallback DB si absent dans le DTO)
        String targetEmail = response.getInvitedUserEmail();
        if (targetEmail == null || targetEmail.isBlank()) {
            targetEmail = userRepository.findById(request.getInvitedUserId())
                    .map(AppUser::getEmail)
                    .orElseThrow(() -> new RuntimeException("Email destinataire introuvable."));
        }

        // 5) Envoi "user-destination" (⚠️ SANS préfixe /user ici)
        System.out.println("📨 Envoi WS à : " + targetEmail + " -> /queue/invitations");
        messagingTemplate.convertAndSendToUser(
                targetEmail,
                "/queue/invitations",
                response
        );

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

    public List<Invitation> sendMultipleInvitations(Long eventId, List<Long> invitedUserIds, String message, AppUser sender) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));

        if (!event.getCreatedBy().getId().equals(sender.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à inviter pour cet événement.");
        }

        if (!event.getStatus().equals(EventStatus.VALIDATED)) {
            throw new RuntimeException("Vous ne pouvez pas envoyer d'invitations tant que l'événement n’a pas été validé par l’administrateur.");
        }

        List<Invitation> invitations = new ArrayList<>();

        for (Long userId : invitedUserIds) {
            AppUser invitedUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur invité non trouvé (ID: " + userId + ")"));


            Optional<Invitation> existing = invitationRepository.findByEventAndInvitedUser(event, invitedUser);
            if (existing.isPresent()) {
                //  Recharge l’invitation avec les relations nécessaires
                Invitation full = invitationRepository.findById(existing.get().getId())
                        .orElseThrow(() -> new RuntimeException("Invitation non trouvée lors du rechargement"));
                invitations.add(full);
                continue;
            }


            Invitation invitation = Invitation.builder()
                    .event(event)
                    .invitedUser(invitedUser)
                    .status(InvitationStatus.PENDING)
                    .sentAt(LocalDateTime.now())
                    .message(message)
                    .build();

            invitations.add(invitationRepository.save(invitation));
        }

        return invitations;
    }

    public List<InvitationResponse> sendMultiple(InvitationRequest request, Principal principal) {
        String email = principal.getName();
        AppUser sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        List<Invitation> invitations = sendMultipleInvitations(
                request.getEventId(),
                request.getInvitedUserIds(),
                request.getMessage(),
                sender
        );

        List<InvitationResponse> responses = invitations.stream()
                .map(this::mapToDto)
                .toList();

        // Envoie une notification WebSocket à chaque utilisateur
        // Envoie une notification WebSocket à chaque utilisateur
        for (InvitationResponse response : responses) {
            // 1) Essayer l'email déjà présent dans le DTO
            String targetEmail = response.getInvitedUserEmail();

            // 2) Sinon, le récupérer via l'ID (recommandé quand le front n'envoie que des IDs)
            if (targetEmail == null || targetEmail.isBlank()) {
                targetEmail = userRepository.findById(response.getInvitedUserId())
                        .map(AppUser::getEmail)
                        .orElse(null);
            }

            if (targetEmail == null || targetEmail.isBlank()) {
                System.err.println("⚠️ Email introuvable pour l'utilisateur ID=" + response.getInvitedUserId());
                continue; // on n'envoie pas si on n'a pas d'email
            }

            System.out.println("📤 ENVOI WS → " + targetEmail + " | /queue/invitations");
            messagingTemplate.convertAndSendToUser(
                    targetEmail,              // ✅ EMAIL (username STOMP)
                    "/queue/invitations",     // ✅ sans /user ici côté back
                    response
            );
        }

        System.out.println("📤 Nombre d’invitations à envoyer par WS : " + responses.size());

        return responses;
    }


    public List<AppUser> getEligibleUsersForInvitation(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));

        AppUser organizer = event.getCreatedBy();

        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(organizer.getId()))           // exclure l'organisateur
                .filter(user -> !user.getRoles().contains(Role.ADMIN))            // exclure l'admin
                .toList();
    }




    public InvitationResponse mapToDto(Invitation invitation) {
        InvitationResponse dto = new InvitationResponse();
        dto.setId(invitation.getId());
        dto.setEventId(invitation.getEvent().getId());
        dto.setEventTitle(invitation.getEvent().getTitle());
        dto.setInvitedUserId(invitation.getInvitedUser().getId());
        dto.setInvitedUserFullName(
                invitation.getInvitedUser().getFirstName() + " " + invitation.getInvitedUser().getLastName());
        dto.setOrganizerFullName(
                invitation.getEvent().getCreatedBy().getFirstName() + " " +
                        invitation.getEvent().getCreatedBy().getLastName()
        );
        dto.setInvitedUserEmail(invitation.getInvitedUser().getEmail());
        dto.setStatus(invitation.getStatus().name());
        dto.setSentAt(invitation.getSentAt());
        dto.setRespondedAt(invitation.getRespondedAt());
        dto.setMessage(invitation.getMessage());
        Event event = invitation.getEvent();

        dto.setPosterUrl(event.getPosterUrl());
        dto.setEventDate(event.getEventDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setLocation(event.getLocation());
        dto.setDescription(event.getDescription());
        dto.setPlanning(event.getPlanning());

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
