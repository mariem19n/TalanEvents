package com.example.stage_talan.controller;

import com.example.stage_talan.dto.InvitationRequest;
import com.example.stage_talan.dto.InvitationResponse;
import com.example.stage_talan.model.InvitationStatus;
import com.example.stage_talan.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/send")
    public ResponseEntity<InvitationResponse> sendInvitation(@RequestBody InvitationRequest request, Principal principal) {
        return ResponseEntity.ok(invitationService.sendAndNotify(request, principal));
    }

    @GetMapping("/me")
    public ResponseEntity<List<InvitationResponse>> getMyInvitations(Principal principal) {
        return ResponseEntity.ok(invitationService.getReceivedInvitations(principal));
    }

    @PutMapping("/{invitationId}/respond")
    public ResponseEntity<InvitationResponse> respondToInvitation(
            @PathVariable Long invitationId,
            @RequestParam InvitationStatus status,
            Principal principal) {

        return ResponseEntity.ok(invitationService.respondTo(invitationId, status, principal));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<InvitationResponse>> getInvitationsForEvent(
            @PathVariable Long eventId,
            Principal principal) {

        List<InvitationResponse> responseList = invitationService.getInvitationsForEvent(eventId, principal);
        return ResponseEntity.ok(responseList);
    }

}
