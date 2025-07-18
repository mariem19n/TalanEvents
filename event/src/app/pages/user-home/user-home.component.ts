import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../service/auth.service';
import { EventService } from '../service/event.service';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { PublicEventsWidget } from './components/publiceventswidget';
import { InvitationWidget } from './components/invitationwidget';
import { HistoryWidget } from './components/historywidget';
import { ProfileWidget } from './components/profilewidget';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    ToolbarModule,
    AvatarModule,
    RippleModule,
    TooltipModule,
    PublicEventsWidget,
    InvitationWidget,
    HistoryWidget,
    ProfileWidget,
    NavbarComponent
  ],
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  publicEvents = signal<any[]>([]);
  userEmail: string = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userEmail = this.authService.getCurrentUserEmail();
    this.loadPublicEvents();
  }

  loadPublicEvents() {
    this.eventService.getAllEvents().subscribe(events => {
      this.publicEvents.set(events.filter(e => e.status === 'ACCEPTED'));
    });
  }

  logout() {
   // this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  goToCalendar() {
    this.router.navigate(['/calendar']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
