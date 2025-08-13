import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { EventService } from '../../service/event.service'; // adapte le chemin
import { AuthService } from '../../service/auth.service'; 

interface Event {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  creatorId: number; 
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, TableModule, FormsModule, TagModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  events = signal<Event[]>([]);
  filteredEvents = signal<Event[]>([]);
  currentUserId: number = 0;  

  constructor(private eventService: EventService, private authService: AuthService) {}

  ngOnInit() {
    const email = this.authService.getCurrentUserEmail();
    console.log('Email utilisateur connecté:', email);

    this.authService.getUserIdByEmail(email).subscribe(userId => {
      this.currentUserId = Number(userId);  // convertir en number
      console.log('ID utilisateur récupéré via API:', this.currentUserId);
      this.loadEvents();
    });
  }

  loadEvents() {
    this.eventService.getEvents().subscribe((allEvents: Event[]) => {
      console.log('Tous les événements reçus:', allEvents);
      this.events.set(allEvents);

      console.log('ID user connecté:', this.currentUserId);
      const filtered = allEvents.filter(e => {
        console.log(`Comparaison ID event: ${e.creatorId} avec currentUserId: ${this.currentUserId}`);
        return e.creatorId === this.currentUserId;  // comparaison number à number
      });

      this.filteredEvents.set(filtered);
      console.log('Événements filtrés:', filtered);
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'PENDING':
        return 'warning'; // jaune
      case 'ACCEPTED':
        return 'success'; // vert
      case 'REJECTED':
        return 'danger';  // rouge
      default:
        return 'info';
    }
  }
}
