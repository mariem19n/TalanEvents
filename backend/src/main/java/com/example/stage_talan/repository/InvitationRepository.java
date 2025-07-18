package com.example.stage_talan.repository;

import com.example.stage_talan.model.Invitation;
import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.Event;
import com.example.stage_talan.model.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    List<Invitation> findByInvitedUser(AppUser user);

    List<Invitation> findByEvent(Event event);

    Optional<Invitation> findByEventAndInvitedUser(Event event, AppUser user);

    List<Invitation> findByStatus(InvitationStatus status);

}
