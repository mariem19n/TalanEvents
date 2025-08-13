package com.example.stage_talan.repository;

import com.example.stage_talan.model.Event;
import com.example.stage_talan.model.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByCreatedByEmail(String email);

    long countByCreatedBy_Id(Long organizerId);

    long countByCreatedBy_IdAndStatus(Long organizerId, EventStatus status);

    // Récupère le titre pour un eventId (utile pour EventStatsDto)
    @Query("select e.title from Event e where e.id = :id")
    String findTitleById(@Param("id") Long id);
}

