package com.example.stage_talan.controller;

import com.example.stage_talan.dto.EventStatsDto;
import com.example.stage_talan.dto.OrganizerOverviewDto;
import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.repository.AppUserRepository;
import com.example.stage_talan.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class StatsController {

    private final StatsService statsService;
    private final AppUserRepository userRepo;

    @GetMapping("/organizers/me/overview")
    public ResponseEntity<OrganizerOverviewDto> myOverview(Principal principal) {
        String email = principal.getName(); // sujet du token = email
        AppUser me = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return ResponseEntity.ok(statsService.getOrganizerOverview(me.getId()));
    }


    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventStatsDto> eventStats(@PathVariable Long eventId) {
        return ResponseEntity.ok(statsService.getEventStats(eventId));
    }


}
