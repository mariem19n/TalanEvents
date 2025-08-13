package com.example.stage_talan.dto;

import java.time.LocalDateTime;

public record FeedbackResponse(Long id, Long eventId, int rating, String comment, LocalDateTime createdAt) { }
