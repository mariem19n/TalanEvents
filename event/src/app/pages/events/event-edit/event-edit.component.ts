import { Component, HostListener, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { EventService } from '../../service/event.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';



@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    TextareaModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './event-edit.component.html'
})
export class EventEditComponent implements OnInit {
  @Input() isModal = false;
  @Input() eventIdInput: string | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  eventId: string = '';
  event = {
    title: '',
    eventDate: null as Date | null,
    location: '',
    description: ''
  };

  startTimeString: string = '';
  endTimeString: string = '';
  timeOptionsAmPm: string[] = [];
  timeError: string = '';
  showStartDropdown = false;
  showEndDropdown = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.timeOptionsAmPm = this.generateTimeOptionsAmPm();
  }

  ngOnInit(): void {
    // 1) Si utilisé en modal avec un id transmis
    if (this.eventIdInput) {
      this.eventId = this.eventIdInput;
      this.loadEvent();
      return;
    }

    // 2) Sinon: fonctionnement via la route (page /event-edit/:id)
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    if (this.eventId) {
      this.loadEvent();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventIdInput']?.currentValue && this.isModal) {
      this.eventId = changes['eventIdInput'].currentValue;
      this.loadEvent();
    }
  }

  loadEvent() {
    this.eventService.getEventById(this.eventId).subscribe({
      next: (data) => {
        this.event = {
          title: data.title,
          description: data.description,
          location: data.location,
          eventDate: new Date(data.eventDate)
        };
        this.startTimeString = this.convert24hToAmPm(data.startTime);
        this.endTimeString = this.convert24hToAmPm(data.endTime);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible de charger l'événement.`,
        });
      }
    });
  }

  private generateTimeOptionsAmPm(): string[] {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const h = hour % 12 === 0 ? 12 : hour % 12;
        const mm = minute.toString().padStart(2, '0');
        const ampm = hour < 12 ? 'AM' : 'PM';
        options.push(`${h}:${mm} ${ampm}`);
      }
    }
    return options;
  }

  toggleDropdown(type: 'start' | 'end') {
    if (type === 'start') {
      this.showStartDropdown = !this.showStartDropdown;
      this.showEndDropdown = false;
    } else {
      this.showEndDropdown = !this.showEndDropdown;
      this.showStartDropdown = false;
    }
  }

  selectTime(type: 'start' | 'end', value: string) {
    if (type === 'start') {
      this.startTimeString = value;
      this.showStartDropdown = false;
    } else {
      this.endTimeString = value;
      this.showEndDropdown = false;
    }
  }

  private parseAmPmTime(time: string): number {
    const regex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = time.match(regex);
    if (!match) return -1;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  private convertAmPmTo24h(time: string): string {
    const regex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = time.match(regex);
    if (!match) return '';

    let hours = parseInt(match[1], 10);
    const minutes = match[2].padStart(2, '0');
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  private convert24hToAmPm(time: string): string {
    const [hoursStr, minutes] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  validateTime(): boolean {
    this.timeError = '';
    if (!this.startTimeString || !this.endTimeString) return true;

    const start = this.parseAmPmTime(this.startTimeString);
    const end = this.parseAmPmTime(this.endTimeString);

    if (start === -1 || end === -1) {
      this.timeError = "Format invalide. Utilisez HH:MM AM/PM.";
      return false;
    }

    if (end <= start) {
      this.timeError = "L'heure de fin doit être après l'heure de début.";
      return false;
    }

    return true;
  }

  onSubmit(form: NgForm) {
    if (
      form.invalid ||
      !this.event.eventDate ||
      !this.startTimeString ||
      !this.endTimeString ||
      !this.validateTime()
    ) {
      return;
    }

    const payload = {
      ...this.event,
      eventDate: new Date(this.event.eventDate).toISOString().split('T')[0],
      startTime: this.convertAmPmTo24h(this.startTimeString) + ':00',
      endTime: this.convertAmPmTo24h(this.endTimeString) + ':00'
    };

    const email = this.authService.getCurrentUserEmail();
    if (!email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Email utilisateur introuvable dans le token.",
      });
      return;
    }

    this.authService.getUserIdByEmail(email).subscribe({
      next: (userId) => {
        this.eventService.updateEvent(this.eventId, payload, +userId).subscribe({
          next: () => {
            if (this.isModal) {
              // Laisse le parent afficher le toast de succès
              this.saved.emit();   // parent: refresh + toast
              this.closed.emit();  // parent: fermeture du dialog
            } else {
              //  Mode page 
              this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Événement mis à jour avec succès.", life: 3000 });
              setTimeout(() => this.router.navigate(['/pages/organizer-dashboard']), 1200);
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: "Échec de la mise à jour de l'événement.",
              life: 7000
            });
          }
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de récupérer l'identifiant utilisateur.",
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.showStartDropdown = false;
      this.showEndDropdown = false;
    }
  }
}
