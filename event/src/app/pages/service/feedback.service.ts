import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventFeedbackItem {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
export interface EventFeedbackSummary {
  eventId: number;
  eventTitle: string;
  averageRating: number;
  totalFeedbacks: number;
  oneStar: number; twoStars: number; threeStars: number; fourStars: number; fiveStars: number;
  items: EventFeedbackItem[];
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private baseUrl = 'http://localhost:8080/api/feedback';
  constructor(private http: HttpClient) {}

  getEventFeedback(eventId: number): Observable<EventFeedbackSummary> {
    return this.http.get<EventFeedbackSummary>(`${this.baseUrl}/event/${eventId}`);
  }
}
