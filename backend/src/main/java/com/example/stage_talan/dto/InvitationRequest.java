package com.example.stage_talan.dto;

import lombok.Data;

@Data
public class InvitationRequest {
    private Long eventId;
    private Long invitedUserId;
    private String message;
}
