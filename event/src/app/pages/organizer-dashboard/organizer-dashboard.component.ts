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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { StatsService, OrganizerOverview } from '../service/stats.service';
import { EventCreateComponent } from '../events/event-create/event-create.component'; 
import { EventEditComponent } from '../events/event-edit/event-edit.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { UserProfileCardComponent } from '../../shared/user-profile-card/user-profile-card/user-profile-card.component';


import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ViewChild, ElementRef } from '@angular/core';





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
    FormsModule,
    ToastModule,
    TooltipModule,
    AvatarModule,
    CardModule,
    ChartModule,
    EventCreateComponent, 
    EventEditComponent,
    OverlayPanelModule,
    UserProfileCardComponent

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
  showCreateDialog = false;
  createDialogDate: Date | null = null;

  overview?: OrganizerOverview;
  statusChartData: any;
  statusChartOptions: any;

  invChartData: any;
  invChartOptions: any;

  rows = 10;         
  tableFirst = 0; 

  @ViewChild('calendarSection') calendarSection!: ElementRef;
  showProfile = false;  

  scrollToCalendar() {
  const el = this.calendarSection?.nativeElement;
  if (!el) return;

  const headerOffset = 80; 
  const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({ top: y, behavior: 'smooth' });
}

  user: any = {
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    avatarUrl: ''
  };
  darkMode = false;


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


  openCreateDialog(date?: Date | null) {
    this.createDialogDate = date ?? null;   
    this.showCreateDialog = true;
  }

  onEventCreated() {
    this.loadEvents();
    this.loadCalendarEvents();

    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Événement créé avec succès.',
      life: 3000
    });
  }

  // état du dialog d’édition
  showEditDialog = false;
  editDialogEventId: string | null = null;

  openEditDialog(eventId: number | string) {
    this.editDialogEventId = String(eventId);
    this.showEditDialog = true;
  }

  onEventUpdated() {
    this.loadEvents();
    this.loadCalendarEvents();
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: "Événement mis à jour.",
      life: 3000
    });
  }

  

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private statsService: StatsService 
  ) {}

  ngOnInit() {
    const email = this.authService.getCurrentUserEmail();
    this.currentUserEmail = email;
    this.authService.getUserProfile().subscribe(profile => {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      this.user = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName,
        email: profile.email,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`
      };
    });

    this.authService.getUserIdByEmail(email).subscribe(userId => {
      this.currentUserId = Number(userId);
      this.loadEvents();
      this.loadCalendarEvents();
    });

    this.loadOverview();
  }

  private loadOverview() {
  this.statsService.getMyOverview().subscribe(ov => {
    this.overview = ov;

    // Chart statuts des événements
    this.statusChartData = {
      labels: ['En attente', 'Accepté', 'Rejeté'],
      datasets: [
        {
          data: [
            ov.eventsByStatus?.['PENDING'] ?? 0,
            ov.eventsByStatus?.['VALIDATED'] ?? 0,
            ov.eventsByStatus?.['REJECTED'] ?? 0
          ]
        }
      ]
    };

    // Chart répartition invitations
    this.invChartData = {
      labels: ['Acceptées', 'En attente', 'Déclinées', 'Peut-être', 'Expirées'],
      datasets: [
        {
          label: 'Invitations',
          data: [
            ov.acceptedInvitations,
            ov.pendingInvitations,
            ov.declinedInvitations,
            ov.maybeInvitations,
            ov.expiredInvitations
          ]
        }
      ]
    };

    this.statusChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
    this.invChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, layout: { padding: 0 },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true }
  }};
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

  // depuis le calendrier
onDateClick(arg: any) {
  const d = new Date(arg.date);     // FullCalendar fournit un Date
  d.setHours(0, 0, 0, 0);           // évite les décalages
  const today = new Date(); today.setHours(0,0,0,0);
  if (d < today) return;

  this.openCreateDialog(d);         // passera au formulaire
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
  // Option A: popup vide
  this.openCreateDialog(null);

  // Option B: préremplir avec aujourd’hui
  // this.openCreateDialog(new Date());
}

  onEditEvent(event: any) {
    if (event.status === 'VALIDATED') {
      alert("Cet événement est validé et ne peut pas être modifié.");
      return;
    }
  this.openEditDialog(event.id);  }
/*
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
  } */

  onDeleteEvent(event: any) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer l'événement "${event.title}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',

      // Inverser visuellement les labels
      acceptLabel: 'Non',
      rejectLabel: 'Oui',

      // Couleurs inversées
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-success',

      // Ne rien faire si l'utilisateur clique sur "Non"
      accept: () => {
        // Annulation
      },

      // Supprimer si l'utilisateur clique sur "Oui"
      reject: () => {
        this.eventService.deleteEvent(event.id).subscribe(() => {
          this.loadEvents();
          this.loadCalendarEvents();

          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Événement supprimé avec succès',
            life: 3000
          });
        });
      },

      // Sécurité : empêcher fermeture par clic en dehors ou ESC
      closable: false,
      dismissableMask: false,

      // Focus initial sur "Oui" (qui est en réalité le reject)
      defaultFocus: 'reject'
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
      this.openEditDialog(this.selectedEvent.id);
      this.showDialog = false;
    } else {
      alert("Cet événement est validé et ne peut pas être modifié.");
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
    this.tableFirst = 0; 
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

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const root = document.documentElement;
    root.classList.toggle('app-dark', this.darkMode);
    root.classList.toggle('app-light', !this.darkMode);
  }

  logout() {
    this.authService.logout();
  }


/*
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
*/

  deleteFromDialog() {
  if (this.selectedEvent?.isMine) {
    this.confirmationService.confirm({
      message: `Supprimer l'événement "${this.selectedEvent.title}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',

      // Inversion visuelle
      acceptLabel: 'Non',
      rejectLabel: 'Oui',
      acceptButtonStyleClass: 'p-button-danger',   // rouge
      rejectButtonStyleClass: 'p-button-success',  // vert

      // Suppression dans reject (Oui)
      reject: () => {
        this.eventService.deleteEvent(this.selectedEvent.id).subscribe(() => {
          this.loadEvents();
          this.loadCalendarEvents();
          this.showDialog = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Événement supprimé avec succès',
            life: 3000
          });
        });
      },

      // Empêche la fermeture du dialog sans clic
      closable: false,
      dismissableMask: false,

      // Empêche ENTER de valider sur le mauvais bouton
      defaultFocus: 'reject',

      // Et ajoute un accept vide (sinon PrimeNG appelle reject par défaut si accept n'existe pas)
      accept: () => {
        // Rien : clic sur "Non"
      }
    });
  }
}





}
