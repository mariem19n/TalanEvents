import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../service/auth.service'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, ButtonModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(private authService: AuthService) {}

  sendResetLink() {
    this.authService.sendResetPasswordEmail(this.email).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.error = '';
        console.log(' Réponse backend:', res);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Une erreur est survenue.';
        this.message = '';
        console.error(' Erreur:', err);
      }
    });
  }
}
