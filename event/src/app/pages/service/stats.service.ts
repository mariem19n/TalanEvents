import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrganizerOverview {
  totalEvents: number;
  totalInvitations: number;
  acceptedInvitations: number;
  pendingInvitations: number;
  declinedInvitations: number;
  maybeInvitations: number;
  expiredInvitations: number;
  participationRate: number;
  avgParticipantsPerEvent: number;
  eventsByStatus: Record<string, number>;
  topEvents: { eventId: number; title: string; participants: number }[];
}

export interface EventStats {
  eventId: number;
  title: string;
  invitations: number;
  accepted: number;
  pending: number;
  declined: number;
  maybe: number;
  expired: number;
  participationRate: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private baseUrl = '/api/stats';
  constructor(private http: HttpClient) {}

  /** dérive l'organizer via le JWT */
  getMyOverview(): Observable<OrganizerOverview> {
    return this.http.get<OrganizerOverview>(`${this.baseUrl}/organizers/me/overview`);
  }

  getEventStats(eventId: number): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.baseUrl}/events/${eventId}`);
  }

}
