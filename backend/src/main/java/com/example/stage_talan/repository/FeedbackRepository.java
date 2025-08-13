package com.example.stage_talan.repository;

import com.example.stage_talan.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByEventAndUser(Event event, AppUser user);

    boolean existsByEventAndUser(Event event, AppUser user);

    List<Feedback> findByEvent(Event event);
}
