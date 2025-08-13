package com.example.stage_talan.dto;

import java.util.List;

public record EventFeedbackSummary(
        Long eventId,
        String eventTitle,
        double averageRating,
        int totalFeedbacks,
        int oneStar,
        int twoStars,
        int threeStars,
        int fourStars,
        int fiveStars,
        List<EventFeedbackItem> items
) {}
