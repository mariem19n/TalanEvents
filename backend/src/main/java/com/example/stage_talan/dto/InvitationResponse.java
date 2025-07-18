package com.example.stage_talan.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InvitationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long invitedUserId;
    private String invitedUserFullName;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private String message;

}
