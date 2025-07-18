import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events'; 

  constructor(private http: HttpClient) {}

  createEvent(event: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, event);
  }

  getAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getEventById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getEvents(): Observable<any[]> {
  return this.getAllEvents();
  }

  getMyEvents(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/my-events`);
}

  getConflictingEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/conflicts`);
  }


  validateEvent(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/validate/${id}`, {});
  }

  rejectEvent(id: number): Observable<any> {
   return this.http.put(`${this.baseUrl}/reject/${id}`, {});
  }

  
  updateEvent(id: string, event: any, userId: number): Observable<any> {
   return this.http.put(`${this.baseUrl}/update/${id}?userId=${userId}`, event);
  }

  

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
