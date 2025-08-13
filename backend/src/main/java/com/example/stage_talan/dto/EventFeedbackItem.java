package com.example.stage_talan.dto;

import java.time.LocalDateTime;

public record EventFeedbackItem(
        Long id,
        Long userId,
        String userFullName,
        String userEmail,
        int rating,
        String comment,
        LocalDateTime createdAt
) {}
