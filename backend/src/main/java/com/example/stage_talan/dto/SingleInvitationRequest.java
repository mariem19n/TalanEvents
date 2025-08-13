package com.example.stage_talan.dto;

import lombok.Data;

@Data
public class SingleInvitationRequest {
    private Long eventId;
    private Long invitedUserId;
    private String message;
}
