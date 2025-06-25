import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  message: string = '';
  isError: boolean = false;
  token: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    console.log('Token reçu dans l’URL:', this.token);
  }

  resetPassword() {
    if (this.password !== this.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas.';
      this.isError = true;
      return;
    }

    if (!this.token) {
      this.message = 'Lien de réinitialisation invalide.';
      this.isError = true;
      return;
    }

    const data = {
      token: this.token,
      newPassword: this.password
    };

    this.http.post('http://localhost:8080/api/auth/reset-password', data).subscribe({
      next: () => {
        this.isError = false;
        this.message = "Mot de passe réinitialisé avec succès.";
      },
      error: (error) => {
        this.isError = true;
        this.message = error?.error?.message || "Une erreur inconnue est survenue.";
      }
    });
  }
}
