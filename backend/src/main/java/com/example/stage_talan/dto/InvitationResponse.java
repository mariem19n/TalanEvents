package com.example.stage_talan.dto;

import com.example.stage_talan.model.PlanningStep;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class InvitationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long invitedUserId;
    private String invitedUserEmail;
    private String invitedUserFullName;
    private String organizerFullName;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private String message;

    private String posterUrl;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String description;
    private List<PlanningStep> planning;

}
