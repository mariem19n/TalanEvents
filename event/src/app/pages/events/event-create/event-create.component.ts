import { Component, HostListener ,Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { EventService } from '../../service/event.service';
import { MessageService } from 'primeng/api';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-event-create',
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
  templateUrl: './event-create.component.html'
})
export class EventCreateComponent {
  @Input() isModal = false;
  @Input() initialDate: Date | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

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
  private router: Router,
  private messageService: MessageService,
  private route: ActivatedRoute
) {
  this.timeOptionsAmPm = this.generateTimeOptionsAmPm();
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
    const minutes = match[2];
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
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

  private resetForm() {
    this.event = { title: '', eventDate: null, location: '', description: '' };
    this.startTimeString = '';
    this.endTimeString = '';
    this.timeError = '';
  }

  createEvent(form: NgForm) {

    // Liste des champs requis manquants (pour le message warn)
  const missing: string[] = [];
  if (!this.event.title?.trim())        missing.push('Titre');
  if (!this.event.eventDate)            missing.push('Date');
  if (!this.startTimeString?.trim())    missing.push('Heure de début');
  if (!this.endTimeString?.trim())      missing.push('Heure de fin');
  if (!this.event.location?.trim())     missing.push('Lieu');
  if (!this.event.description?.trim())  missing.push('Description');

  if (missing.length > 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Champs manquants',
      detail: 'Veuillez remplir : ' + missing.join(', '),
      life: 5000
    });
    return;
  }

  // Vérification cohérence des heures
  if (!this.validateTime()) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Heures invalides',
      detail: this.timeError || "L'heure de fin doit être après l'heure de début.",
      life: 5000
    });
    return;
  }





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
      startTime: this.convertAmPmTo24h(this.startTimeString),
      endTime: this.convertAmPmTo24h(this.endTimeString)
    };

    console.log('Payload envoyé:', payload);

    this.eventService.createEvent(payload).subscribe({
    next: () => {
      if (this.isModal) {
        // ➜ Laisse le parent afficher le toast
        this.saved.emit();       // parent: refresh + toast
        this.closed.emit();      // parent: ferme le dialog
        this.resetForm();
      } else {
        // ➜ Mode page: on peut afficher ici
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: "Événement créé avec succès.",
          life: 3000
        });
        // navigation éventuelle...
        // setTimeout(() => this.router.navigate(['/pages/event-list']), 800);
      }
    },
      error: (error) => {
        console.error('Erreur lors de la création de l’événement:', error);
        const detailMessage = error?.error?.message || "Échec de la création de l’événement.";
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: detailMessage,
          life: 7000
        });
      }
    });
  }

  ngOnInit() {
    // si utilisé dans un dialog
    if (this.initialDate) {
      const d = new Date(this.initialDate);
      d.setHours(0,0,0,0);
      this.event.eventDate = d;
      return;
    }

    // sinon, garder le fonctionnement par URL (route)
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        const selected = new Date(params['date']);
        selected.setHours(0, 0, 0, 0);
        const today = new Date(); today.setHours(0,0,0,0);
        if (selected >= today) this.event.eventDate = selected;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialDate']?.currentValue) {
      const d = new Date(changes['initialDate'].currentValue);
      d.setHours(0,0,0,0);
      this.event.eventDate = d;
    }
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
