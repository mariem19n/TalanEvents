import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../service/event.service';
import { AuthService } from '../service/auth.service';

import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';


// ... [imports inchangés] ...

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    FullCalendarModule,
    InputTextModule,
    DropdownModule,
    FormsModule
  ],
  providers: [ConfirmationService],
  templateUrl: './organizer-dashboard.component.html',
  styleUrls: ['./organizer-dashboard.component.scss']
})
export class OrganizerDashboardComponent implements OnInit {
  events = signal<any[]>([]);
  filteredEvents: any[] = [];
  currentUserId: number = 0;
  currentUserEmail: string = '';
  selectedEvent: any = null;
  showDialog: boolean = false;
  search: string = '';
  selectedMonth: string = '';
  selectedStatus: string = '';

  statusOptions = [
    { label: 'Tous les statuts', value: '' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'Accepté', value: 'VALIDATED' },
    { label: 'Rejeté', value: 'REJECTED' }
  ];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: false,
    eventDisplay: 'block',
    events: [],
    eventClick: this.onEventClick.bind(this),
    dateClick: this.onDateClick.bind(this),
    dayCellDidMount: this.customizeDayCell.bind(this)
  };

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    const email = this.authService.getCurrentUserEmail();
    this.currentUserEmail = email;
    this.authService.getUserIdByEmail(email).subscribe(userId => {
      this.currentUserId = Number(userId);
      this.loadEvents();
      this.loadCalendarEvents();
    });
  }

  loadEvents() {
    this.eventService.getEvents().subscribe((allEvents: any[]) => {
      const mine = allEvents.filter(e => e.creatorId === this.currentUserId);
      this.events.set(mine);
      this.applyFilters();
    });
  }

  loadCalendarEvents() {
    this.eventService.getMyEvents().subscribe(myEvents => {
      this.eventService.getConflictingEvents().subscribe(conflicts => {
        this.calendarOptions.events = [...myEvents, ...conflicts].map(event => ({
          title: event.title,
          date: event.eventDate,
          color: event.color,
          extendedProps: {
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            creatorEmail: event.creatorEmail,
            creatorFullName: event.creatorFirstName + ' ' + event.creatorLastName,
            id: event.id,
            status: event.status,
            isMine: event.creatorEmail === this.currentUserEmail
          }
        }));
      });
    });
  }

  onDateClick(arg: any) {
    const selectedDate = arg.date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return;

    this.router.navigate(['/pages/event-create'], {
      queryParams: { date: arg.dateStr }
    });
  }

  customizeDayCell(arg: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(arg.date);
    if (cellDate < today) return;

    const plusBtn = document.createElement('button');
    plusBtn.innerText = '+';
    plusBtn.title = 'Créer un événement pour ce jour';
    plusBtn.style.position = 'absolute';
    plusBtn.style.top = '2px';
    plusBtn.style.right = '2px';
    plusBtn.style.zIndex = '5';
    plusBtn.style.border = 'none';
    plusBtn.style.borderRadius = '50%';
    plusBtn.style.backgroundColor = '#ccc';
    plusBtn.style.cursor = 'pointer';
    plusBtn.style.width = '22px';
    plusBtn.style.height = '22px';
    plusBtn.style.fontSize = '14px';
    plusBtn.style.display = 'none';

    plusBtn.onclick = (e) => {
      e.stopPropagation();
      this.onDateClick({ date: cellDate, dateStr: arg.date.toISOString().split('T')[0] });
    };

    arg.el.style.position = 'relative';
    arg.el.appendChild(plusBtn);
    arg.el.addEventListener('mouseenter', () => plusBtn.style.display = 'inline-block');
    arg.el.addEventListener('mouseleave', () => plusBtn.style.display = 'none');
  }

  onCreateEvent() {
    this.router.navigate(['/pages/event-create']);
  }

  onEditEvent(event: any) {
    if (event.status === 'VALIDATED') {
      alert("Cet événement est validé et ne peut pas être modifié.");
      return;
    }
    this.router.navigate(['/pages/event-edit', event.id]);
  }

  onDeleteEvent(event: any) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer l'événement "${event.title}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      defaultFocus: 'accept',
      accept: () => {
        this.eventService.deleteEvent(event.id).subscribe(() => {
          this.loadEvents();
          this.loadCalendarEvents();
        });
      }
    });
  }

  onEventClick(arg: any) {
    this.selectedEvent = {
      title: arg.event.title,
      date: arg.event.startStr,
      startTime: arg.event.extendedProps.startTime,
      endTime: arg.event.extendedProps.endTime,
      location: arg.event.extendedProps.location,
      creatorFullName: arg.event.extendedProps.creatorFullName,
      isMine: arg.event.extendedProps.isMine,
      status: arg.event.extendedProps.status,
      id: arg.event.extendedProps.id
    };
    this.showDialog = true;
  }

  editFromDialog() {
    if (this.selectedEvent?.isMine && this.selectedEvent?.status !== 'VALIDATED') {
      this.router.navigate(['/pages/event-edit', this.selectedEvent.id]);
      this.showDialog = false;
    } else {
      alert("Cet événement est validé et ne peut pas être modifié.");
    }
  }

  deleteFromDialog() {
    if (this.selectedEvent?.isMine) {
      this.confirmationService.confirm({
        message: `Supprimer l'événement "${this.selectedEvent.title}" ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-danger',
        defaultFocus: 'accept',
        accept: () => {
          this.eventService.deleteEvent(this.selectedEvent.id).subscribe(() => {
            this.loadEvents();
            this.loadCalendarEvents();
            this.showDialog = false;
          });
        }
      });
    }
  }

  applyFilters() {
    this.filteredEvents = this.events().filter(e => {
      const matchesSearch = this.search === '' || e.title.toLowerCase().includes(this.search.toLowerCase());
      const matchesMonth = this.selectedMonth === '' || e.eventDate.startsWith(this.selectedMonth);
      const matchesStatus = this.selectedStatus === '' || e.status === this.selectedStatus;
      const matchesLocation = this.selectedLocation === '' || e.location === this.selectedLocation;
      return matchesSearch && matchesMonth && matchesStatus && matchesLocation;
    });
  }

  get monthOptions() {
    return [
      { label: 'Tous les mois', value: '' },
      ...Array.from(new Set(this.events().map(e => e.eventDate?.substring(0, 7)))).sort().map(month => ({
        label: month,
        value: month
      }))
    ];
  }

  selectedLocation: string = '';

  get locationOptions() {
    return [
      { label: 'Toutes les salles', value: '' },
      ...Array.from(new Set(this.events().map(e => e.location)))
        .filter(Boolean)
        .map(loc => ({ label: loc, value: loc }))
    ];
  }


  getSeverity(status: string) {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'VALIDATED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'VALIDATED': return 'Accepté';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  }

  goToViewPage(event: any) {
  this.router.navigate(['/pages/event-view', event.id]);
  }

}
