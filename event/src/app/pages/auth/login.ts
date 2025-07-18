import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../pages/service/auth.service';
//import { EventCreateComponent } from './events/event-create/event-create.component';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    AppFloatingConfigurator,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './login.html'
})
export class Login {
  email: string = '';
  password: string = '';
  checked: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    console.log('Tentative de login depuis Angular');
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
     next: () => {
     const roles = this.authService.getRoles();
     console.log('Rôles:', roles); 
     
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/pages/admin-dashboard']);
    } else if (roles.includes('ORGANIZER')) {
      this.router.navigate(['/pages/organizer-dashboard']);
    } else {
      this.router.navigate(['/pages/user-home']);
    }
  },
  error: () => {
    this.errorMessage = 'Email ou mot de passe incorrect.';
  }
});

  }
}
