package com.example.stage_talan.repository;

import com.example.stage_talan.dto.TopEventDto;
import com.example.stage_talan.model.Invitation;
import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.Event;
import com.example.stage_talan.model.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByInvitedUser(AppUser user);

    List<Invitation> findByEvent(Event event);

    Optional<Invitation> findByEventAndInvitedUser(Event event, AppUser user);

    List<Invitation> findByStatus(InvitationStatus status);

    @EntityGraph(attributePaths = {"event", "event.createdBy", "invitedUser"})
    Optional<Invitation> findWithDetailsById(Long id);

    // ---- Agrégations par événement ----
    long countByEvent_Id(Long eventId);
    long countByEvent_IdAndStatus(Long eventId, InvitationStatus status);

    // ---- Agrégations globales par organizer ----
    @Query("""
        select count(i)
        from Invitation i
        where i.event.createdBy.id = :organizerId
    """)
    long countByOrganizer(Long organizerId);

    @Query("""
        select count(i)
        from Invitation i
        where i.event.createdBy.id = :organizerId
          and i.status = :status
    """)
    long countByOrganizerAndStatus(Long organizerId, InvitationStatus status);

    // Top événements (participants ACCEPTED) pour un organizer
    @Query("""
        select new com.example.stage_talan.dto.TopEventDto(e.id, e.title, count(i))
        from Invitation i
        join i.event e
        where e.createdBy.id = :organizerId
          and i.status = com.example.stage_talan.model.InvitationStatus.ACCEPTED
        group by e.id, e.title
        order by count(i) desc
    """)
    List<TopEventDto> topEventsByAccepted(Long organizerId);

    //les invitations acceptées pour des événements déjà passés et pour lesquelles aucun feedback de cet utilisateur n’existe.
    @Query("""
    SELECT inv FROM Invitation inv
    WHERE inv.invitedUser = :user
      AND inv.status = com.example.stage_talan.model.InvitationStatus.ACCEPTED
      AND inv.event.eventDate < :today
      AND NOT EXISTS (
          SELECT 1 FROM Feedback f
          WHERE f.event = inv.event
            AND f.user  = :user
      )
    """)
    List<Invitation> findPastAcceptedWithoutFeedback(@Param("user") AppUser user,
                                                     @Param("today") java.time.LocalDate today);


}
