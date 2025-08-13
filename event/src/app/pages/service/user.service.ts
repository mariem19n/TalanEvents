import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getEligibleUsers(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/invitations/eligible-users/${eventId}`);
  }


}
