import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, ButtonModule, AppFloatingConfigurator, CommonModule],
  template: `
    <app-floating-configurator />

    <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-900 text-center px-4">
      <div class="flex flex-col items-center">
        <i class="pi pi-lock text-6xl text-primary mb-4"></i>
        <h1 class="text-4xl font-bold text-primary mb-2">403 - Accès interdit</h1>
        <p class="text-gray-600 dark:text-gray-300 text-lg mb-6">
          Vous n'avez pas l'autorisation d'accéder à cette page.<br />
          Merci de vous reconnecter avec un compte autorisé.
        </p>
        <button pButton label="Se reconnecter" routerLink="/auth/login" icon="pi pi-sign-in" class="p-button-rounded p-button-primary"></button>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}
