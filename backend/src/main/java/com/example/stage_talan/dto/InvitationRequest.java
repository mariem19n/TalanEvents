package com.example.stage_talan.dto;

import lombok.Data;
import java.util.List;

@Data
public class InvitationRequest {
    private Long eventId;
    private List<Long> invitedUserIds;
    private String message;
}
