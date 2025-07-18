import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
}
