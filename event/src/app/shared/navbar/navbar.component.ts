import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '../../layout/component/app.configurator';
import { LayoutService } from '../../layout/service/layout.service';
import { AuthService } from '../../pages/service/auth.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AppConfigurator,
    TooltipModule
  ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isUserHome = false;
  firstName: string = '';

  constructor(
    public layoutService: LayoutService,
    public router: Router,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isUserHome = event.url.includes('/user-home');
    });

    const user = JSON.parse(localStorage.getItem('auth-user') || '{}');
    this.firstName = user.firstName || 'Utilisateur';
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme
    }));
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
