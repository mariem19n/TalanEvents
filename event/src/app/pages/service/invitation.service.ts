import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvitationResponse } from '../../models/invitation-response.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private baseUrl = 'http://localhost:8080/api/invitations';

  constructor(private http: HttpClient) {}

  getMyInvitations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/me`);
  }

  respondToInvitation(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/respond?status=${status}`, {});
  }

/*  sendInvitations(eventId: number, userIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, {
      eventId,
      userIds
    });
  }*/


  sendMultipleInvitations(eventId: number, invitedUserIds: number[], message: string) {
  const payload = {
    eventId,
    invitedUserIds,
    message
  };
  return this.http.post<any[]>('http://localhost:8080/api/invitations/send', payload);
}

  getInvitationsByEvent(eventId: number) {
  return this.http.get<any[]>(`/api/invitations/event/${eventId}`);
}
 
}


