package com.example.stage_talan.dto;

public record CreateFeedbackRequest(Long eventId, int rating, String comment) { }
