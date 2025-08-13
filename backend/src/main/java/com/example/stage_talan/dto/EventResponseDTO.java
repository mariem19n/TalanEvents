package com.example.stage_talan.dto;

import com.example.stage_talan.model.EventStatus;
import com.example.stage_talan.model.PlanningStep;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Data
public class EventResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private EventStatus status;

    private Long creatorId;
    private String creatorEmail;
    private Set<String> creatorRoles;
    private String creatorFirstName;
    private String creatorLastName;
    private String posterUrl;


    private String color;
    private List<PlanningStep> planning;
}
