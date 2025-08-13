package com.example.stage_talan.controller;

import com.example.stage_talan.dto.*;
import com.example.stage_talan.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

import static org.hibernate.query.sqm.tree.SqmNode.log;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> create(@RequestBody CreateFeedbackRequest req, Principal principal) {
        return ResponseEntity.ok(feedbackService.create(req, principal));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<InvitationResponse>> pending(Principal principal) {
        return ResponseEntity.ok(feedbackService.getPendingFeedbacks(principal));
    }

    // feedback d’un événement pour l’organisateur
    @GetMapping("/event/{eventId}")
    public ResponseEntity<EventFeedbackSummary> getEventFeedback(@PathVariable Long eventId, Principal principal) {
        return ResponseEntity.ok(feedbackService.getEventFeedbackForOrganizer(eventId, principal));
    }

    @GetMapping("/event/{eventId}/mine")
    public ResponseEntity<FeedbackResponse> getMyFeedback(@PathVariable Long eventId, Principal principal) {
        FeedbackResponse resp = feedbackService.getMyFeedbackForEvent(eventId, principal);
        return (resp == null) ? ResponseEntity.noContent().build() : ResponseEntity.ok(resp);
    }

    @PutMapping("/{feedbackId}")
    public ResponseEntity<FeedbackResponse> update(@PathVariable Long feedbackId,
                                                   @RequestBody UpdateFeedbackRequest req,
                                                   Principal principal) {
        return ResponseEntity.ok(feedbackService.update(feedbackId, req, principal));
    }

}
