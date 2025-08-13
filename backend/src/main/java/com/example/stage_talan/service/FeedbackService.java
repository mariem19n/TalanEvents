package com.example.stage_talan.service;

import com.example.stage_talan.dto.*;
import com.example.stage_talan.model.*;
import com.example.stage_talan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final InvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final AppUserRepository userRepository;

    // --- CREATE ---
    public FeedbackResponse create(CreateFeedbackRequest req, Principal principal) {
        if (req == null || req.eventId() == null) {
            throw new IllegalArgumentException("eventId manquant");
        }
        if (req.rating() < 1 || req.rating() > 5) {
            throw new IllegalArgumentException("La note doit être entre 1 et 5.");
        }

        AppUser user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        Event event = eventRepository.findById(req.eventId())
                .orElseThrow(() -> new RuntimeException("Événement non trouvé."));

        // Vérifier que l'utilisateur a ACCEPTÉ l'invitation pour cet event
        Invitation inv = invitationRepository.findByEventAndInvitedUser(event, user)
                .orElseThrow(() -> new RuntimeException("Aucune invitation trouvée pour cet événement."));
        if (inv.getStatus() != InvitationStatus.ACCEPTED) {
            throw new RuntimeException("Vous devez avoir accepté l'invitation pour laisser un feedback.");
        }

        // Vérifier que l'événement est déjà passé
        if (!event.getEventDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Le feedback est possible uniquement après la date de l'événement.");
        }

        // Unicité feedback par (event, user)
        if (feedbackRepository.existsByEventAndUser(event, user)) {
            throw new RuntimeException("Vous avez déjà laissé un feedback pour cet événement.");
        }

        Feedback f = Feedback.builder()
                .event(event)
                .user(user)
                .rating(req.rating())
                .comment(req.comment())
                .createdAt(LocalDateTime.now())
                .build();

        Feedback saved = feedbackRepository.save(f);
        return new FeedbackResponse(saved.getId(), event.getId(), saved.getRating(), saved.getComment(), saved.getCreatedAt());
    }

    // --- PENDING (feedback à rendre) ---
    public List<InvitationResponse> getPendingFeedbacks(Principal principal) {
        AppUser user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        List<Invitation> invs = invitationRepository.findPastAcceptedWithoutFeedback(user, LocalDate.now());
        return invs.stream().map(this::mapToInvitationResponse).toList();
    }

    /** Retourne tous les feedbacks d’un event + résumé (pour l’organisateur ou l’admin) */

    public EventFeedbackSummary getEventFeedbackForOrganizer(Long eventId, Principal principal) {
        AppUser current = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé."));

        boolean isCreator = event.getCreatedBy().getId().equals(current.getId());
        boolean isAdmin = current.getRoles().contains(Role.ADMIN);
        if (!isCreator && !isAdmin) {
            throw new RuntimeException("Accès refusé. Vous devez être organisateur ou administrateur.");
        }

        List<Feedback> list = feedbackRepository.findByEvent(event);

        int total = list.size();
        int[] buckets = new int[6]; // index 1..5
        double sum = 0.0;

        List<EventFeedbackItem> items = new ArrayList<>(total);
        for (Feedback f : list) {
            int r = Math.max(1, Math.min(5, f.getRating()));
            buckets[r]++;
            sum += r;

            AppUser u = f.getUser();
            String fn = (u.getFirstName() == null ? "" : u.getFirstName());
            String ln = (u.getLastName() == null ? "" : u.getLastName());
            String full = (fn + " " + ln).trim();

            items.add(new EventFeedbackItem(
                    f.getId(),
                    u.getId(),
                    full,
                    u.getEmail(),
                    r,
                    f.getComment(),
                    f.getCreatedAt()
            ));
        }

        double avg = total == 0 ? 0.0 : sum / total;

        return new EventFeedbackSummary(
                event.getId(),
                event.getTitle(),
                avg,
                total,
                buckets[1], buckets[2], buckets[3], buckets[4], buckets[5],
                items
        );
    }

    // Récupérer le feedback du user courant pour un event
    public FeedbackResponse getMyFeedbackForEvent(Long eventId, Principal principal) {
        AppUser user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé."));

        return feedbackRepository.findByEventAndUser(event, user)
                .map(f -> new FeedbackResponse(f.getId(), event.getId(), f.getRating(), f.getComment(), f.getCreatedAt()))
                .orElse(null); // null => on retournera 204 côté controller
    }

    // Modifier un feedback (propriétaire uniquement)
    public FeedbackResponse update(Long feedbackId, UpdateFeedbackRequest req, Principal principal) {
        if (req.rating() < 1 || req.rating() > 5) {
            throw new IllegalArgumentException("La note doit être entre 1 et 5.");
        }

        AppUser me = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté non trouvé."));

        Feedback f = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback non trouvé."));

        if (!f.getUser().getId().equals(me.getId())) {
            throw new RuntimeException("Vous ne pouvez modifier que votre propre feedback.");
        }

        f.setRating(req.rating());
        f.setComment(req.comment());
        Feedback saved = feedbackRepository.save(f);

        return new FeedbackResponse(saved.getId(), saved.getEvent().getId(),
                saved.getRating(), saved.getComment(), saved.getCreatedAt());
    }


    // mapping aligné avec InvitationService.mapToDto(...)
    private InvitationResponse mapToInvitationResponse(Invitation invitation) {
        InvitationResponse dto = new InvitationResponse();
        dto.setId(invitation.getId());
        dto.setEventId(invitation.getEvent().getId());
        dto.setEventTitle(invitation.getEvent().getTitle());
        dto.setInvitedUserId(invitation.getInvitedUser().getId());
        dto.setInvitedUserFullName(invitation.getInvitedUser().getFirstName() + " " + invitation.getInvitedUser().getLastName());
        dto.setOrganizerFullName(invitation.getEvent().getCreatedBy().getFirstName() + " " + invitation.getEvent().getCreatedBy().getLastName());
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
}
