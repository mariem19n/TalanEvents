import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private TOKEN_KEY = 'auth-token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<{ accessToken: string, roles: string[] }>(
     `${this.apiUrl}/login`,
     body,
      { responseType: 'json' }
    ).pipe(
    tap(response => {
      localStorage.setItem('auth-token', response.accessToken);
      localStorage.setItem('roles', JSON.stringify(response.roles));
    })
  );
  }

  getRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  sendResetPasswordEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUserEmail(): string {
    const token = this.getToken();
    if (!token) return '';

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);
      return payload.sub || '';  // ou payload.email selon token
    } catch {
      return '';
    }
  }


  getUserIdByEmail(email: string): Observable<string> {
    const encodedEmail = encodeURIComponent(email.trim());
    return this.http.get<{ id: string }>(`http://localhost:8080/api/user/by-email/${encodedEmail}`)
      .pipe(
        map(response => response.id)
      );
  }

  logout(): void {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('auth-user'); 
}


}
  