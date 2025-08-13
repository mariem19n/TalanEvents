import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClient } from '@angular/common/http';
import { SidebarModule } from 'primeng/sidebar';
import { UserProfileCardComponent } from '../../shared/user-profile-card/user-profile-card/user-profile-card.component';
import { MessageService } from 'primeng/api';
import { InvitationResponse } from '../../models/invitation-response.model';
import { ToastModule } from 'primeng/toast';
import { EventTimelineComponent } from '../../shared/event-timeline/event-timeline.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Rating } from 'primeng/rating';import { InputTextarea } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { FeedbackResponse } from '../../models/feedback.model';





import { WebsocketService } from '../service/websocket.service';
import { AuthService } from '../service/auth.service';



@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    PanelModule,
    ButtonModule,
    DialogModule,
    TableModule,
    TagModule,
    AvatarModule,
    TooltipModule,
    InputIconModule,
    IconFieldModule,
    ToolbarModule,
    MenuModule,
    UserProfileCardComponent,
    NgClass,
    SidebarModule,
    ToastModule,
    EventTimelineComponent,
    ConfirmDialogModule,
    Rating,
    InputTextarea,
    FormsModule


  ],
  providers: [MessageService,  ConfirmationService],
  templateUrl: './user-home.component.html'
})


export class UserHomeComponent implements OnInit {
  @ViewChild('calendarRef') calendarComponent!: FullCalendarComponent; 

  showCalendar = false;
  showProfile = false;
  darkMode = false;
  showNotificationsSidebar = false;
  hasNewNotification = false;
  notificationsCount = 0; 

  notificationAudio = new Audio('assets/notification.mp3');

  invitations: InvitationResponse[] = [];  
  selectedInvitation: InvitationResponse | null = null;
  showInvitationDetailsDialog = false;

  currentFeedbackId: number | null = null;
  loadingFeedback = false;



  user: any = {
    firstName: '',
    lastName: '',
    fullName: '', 
    email: '',
    avatarUrl: '',
    badges: []
  };


  //new
  // Listes calculées
  nextEvents: InvitationResponse[] = [];      // ACCEPTED & futur
  pastEvents: InvitationResponse[] = [];      // ACCEPTED & passé
  pendingFeedbacks: InvitationResponse[] = []; // feedback à rendre 

  // Dialog feedback
  showFeedbackDialog = false;
  feedbackEvent: InvitationResponse | null = null;
  feedbackRating = 0;
  feedbackComment = '';
  sendingFeedback = false;



  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

  ) {}

  

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [] // on remplira après chargement
  };

  needsFeedback = (eventId: number) =>
  this.pendingFeedbacks.some(p => p.eventId === eventId);

 /*



 ngOnInit(): void {
  this.authService.getUserProfile().subscribe(profile => {
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();

    this.user = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName,
      email: profile.email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`,
      badges: ['Participant Actif', 'Ancienneté 1 an']
    };

    this.authService.getUserIdByEmail(profile.email).subscribe(userIdStr => {
      const userId = Number(userIdStr);

      //  Attendre que le WebSocket soit vraiment connecté
      this.websocketService.connect(userId).then(() => {
        console.log("WebSocket prêt pour les notifications");

        this.websocketService.invitations$.subscribe((inv) => {
          console.log('📬 Nouvelle invitation reçue via WebSocket :', inv);
          if (inv) {
            this.invitations = [inv, ...this.invitations];
            this.notificationAudio.play().catch(err => console.error(err));
            this.hasNewNotification = true;
            this.messageService.add({
              severity: 'info',
              summary: 'Nouvelle invitation',
              detail: inv.eventTitle,
              life: 3000
            });
            } else {
        console.warn("⚠️ WebSocket a émis une valeur vide !");
          }
        });
      });

      // Charger les invitations initiales
      this.http.get<InvitationResponse[]>(`http://localhost:8080/api/invitations/me`)
          .subscribe(data => {
            this.invitations = data.filter(inv => inv.status === 'PENDING');
          });
    });
  });
}
*/
  ngOnInit(): void {
  this.authService.getUserProfile().subscribe(profile => {
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();

    this.user = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName,
      email: profile.email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`,
      badges: ['Participant Actif', 'Ancienneté 1 an']
    };

    // Connexion WebSocket 
    this.websocketService.connectFromToken().then(() => {
      console.log("📡 WebSocket connecté depuis token JWT");

      this.websocketService.invitations$.subscribe((inv) => {
        console.log('📬 Nouvelle invitation reçue via WS :', inv);
        if (inv) {
          this.invitations = [inv, ...this.invitations];
          this.notificationsCount = this.invitations.length; 
          this.notificationAudio.play().catch(err => console.error(err));
          this.hasNewNotification = true;
          this.messageService.add({
            severity: 'info',
            summary: 'Nouvelle invitation',
            detail: inv.eventTitle,
            life: 3000
          });
        }
      });
    });

    
    // Charger les invitations initiales
  this.http.get<InvitationResponse[]>(`http://localhost:8080/api/invitations/me`)
    .subscribe(data => {
      // En attente (tu avais déjà ça)
      this.invitations = data.filter(inv => inv.status === 'PENDING');
      this.notificationsCount = this.invitations.length;

      // Confirmés (ACCEPTED) -> split futur/passé
      const accepted = data.filter(inv => inv.status === 'ACCEPTED');
      const today0 = this.startOfToday();

      this.nextEvents = accepted.filter(inv => {
        const d = this.toDateSafe(inv.eventDate);
        return d !== null && d >= today0;
      });

      this.pastEvents = accepted.filter(inv => {
        const d = this.toDateSafe(inv.eventDate);
        return d !== null && d < today0;
      });

      this.calendarOptions = {
      ...this.calendarOptions,
      events: this.nextEvents.map(e => ({
        title: e.eventTitle,
        date: e.eventDate as any,
        color: '#16a34a' // vert = confirmé
      }))
    };

    });

  // Charger les "feedback à rendre" (événements passés sans feedback)
  this.http.get<InvitationResponse[]>(`http://localhost:8080/api/feedback/pending`)
    .subscribe({
      next: res => this.pendingFeedbacks = res || [],
      error: _ => this.pendingFeedbacks = [] // si l'endpoint n'existe pas encore
    });
});
}

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }
  private toDateSafe(val?: string | null): Date | null {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(+d) ? null : d;
  }


   openSidebar() {
    this.showNotificationsSidebar = true;
    this.hasNewNotification = false; // On réinitialise l'alerte
  }

  viewInvitation(inv: any) {
    this.selectedInvitation = inv;
    this.showInvitationDetailsDialog = true;
  }

/*
 
  respondToInvitation(invId: number, status: 'ACCEPTED' | 'DECLINED') {
  const message = status === 'ACCEPTED'
    ? 'Voulez-vous vraiment accepter cette invitation ?'
    : 'Voulez-vous vraiment refuser cette invitation ?';

  const summary = status === 'ACCEPTED' ? 'Accepter' : 'Refuser';

  this.confirmationService.confirm({
    message,
    header: `Confirmation - ${summary}`,
    icon: status === 'ACCEPTED' ? 'pi pi-check' : 'pi pi-times',
    acceptLabel: summary,
    rejectLabel: 'Annuler',
    acceptButtonStyleClass: status === 'ACCEPTED' ? 'p-button-success' : 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      this.http.put<InvitationResponse>(
        `http://localhost:8080/api/invitations/${invId}/respond?status=${status}`, {}
      ).subscribe(() => {
        this.invitations = this.invitations.filter(inv => inv.id !== invId);
        this.messageService.add({
          severity: 'success',
          summary: 'Invitation mise à jour',
          detail: `Invitation ${status === 'ACCEPTED' ? 'acceptée' : 'refusée'}.`
        });
        this.showInvitationDetailsDialog = false;
      });
    }
  });
}
 */

 respondToInvitation(invId: number, status: 'ACCEPTED' | 'DECLINED') {
  const isAccept = status === 'ACCEPTED';
  const actionText = isAccept ? 'accepter' : 'refuser';
  const summaryText = isAccept ? 'acceptée' : 'refusée';

  this.confirmationService.confirm({
    message: `Voulez-vous vraiment ${actionText} cette invitation ?`,
    header: 'Confirmation',
    icon: isAccept ? 'pi pi-check' : 'pi pi-times',

    // ✅ Inverser les boutons
    acceptLabel: 'Annuler',
    rejectLabel: 'Oui',
    acceptButtonStyleClass: 'p-button-secondary', 
    rejectButtonStyleClass: 'p-button-success',

    // ✅ Action réelle dans reject
    reject: () => {
      this.http.put<InvitationResponse>(
        `http://localhost:8080/api/invitations/${invId}/respond?status=${status}`, {}
      ).subscribe(() => {
        this.invitations = this.invitations.filter(inv => inv.id !== invId);
        this.messageService.add({
          severity: 'success',
          summary: 'Invitation mise à jour',
          detail: `Invitation ${summaryText}`
        });
        this.showInvitationDetailsDialog = false;
      });
    },

    // ✅ Protection
    closable: false,
    dismissableMask: false,
    defaultFocus: 'reject',

    // accept = clic sur "Non", ne fait rien
    accept: () => {
      // rien
    }
  });
}

  // Raccourcis d'affichage
  excerpt(txt: string | undefined, n = 80): string {
    if (!txt) return '';
    return txt.length > n ? txt.slice(0, n) + '…' : txt;
  }

   toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const root = document.documentElement;
    root.classList.toggle('app-dark', this.darkMode);
    root.classList.toggle('app-light', !this.darkMode);
  }

  toggleCalendar() {
    this.showCalendar = true;
    setTimeout(() => {
      if (this.calendarComponent) {
        this.calendarComponent.getApi().updateSize();
      }
    }, 200);
  }

  get hasPlanning(): boolean {
  return !!this.selectedInvitation?.planning?.length;
}
  

  logout() {
    this.authService.logout();
  }

    
  hasFeedback(eventId: number): boolean {
    return !this.needsFeedback(eventId);
  }

  openFeedbackDialog(inv: InvitationResponse) {
  this.feedbackEvent = inv;
  this.feedbackRating = 0;
  this.feedbackComment = '';
  this.currentFeedbackId = null;
  this.showFeedbackDialog = true;

  // S’il existe déjà un feedback, pré-remplir
  if (this.hasFeedback(inv.eventId)) {
    this.loadingFeedback = true;
    this.http.get<FeedbackResponse>(`http://localhost:8080/api/feedback/event/${inv.eventId}/mine`)
      .subscribe({
        next: (resp) => {
          if (resp) {
            this.currentFeedbackId = resp.id;
            this.feedbackRating = resp.rating;
            this.feedbackComment = resp.comment || '';
          }
          this.loadingFeedback = false;
        },
        error: () => {
          this.loadingFeedback = false;
        }
      });
  }
}


cancelFeedback() {
  this.showFeedbackDialog = false;
  this.feedbackEvent = null;
  this.feedbackRating = 0;
  this.feedbackComment = '';
}

submitFeedback() {
  if (!this.feedbackEvent) return;
  if (!this.feedbackRating) {
    this.messageService.add({ severity: 'warn', summary: 'Note requise', detail: 'Merci d’ajouter une note.' });
    return;
  }
  this.sendingFeedback = true;

  const body = {
    eventId: this.feedbackEvent.eventId,
    rating: this.feedbackRating,
    comment: this.feedbackComment?.trim() || null
  };

  const req$ = this.currentFeedbackId
    ? this.http.put<FeedbackResponse>(`http://localhost:8080/api/feedback/${this.currentFeedbackId}`, {
        rating: body.rating, comment: body.comment
      })
    : this.http.post<FeedbackResponse>('http://localhost:8080/api/feedback', body);

  req$.subscribe({
    next: () => {
      
      this.pendingFeedbacks = this.pendingFeedbacks.filter(e => e.eventId !== this.feedbackEvent!.eventId);
      this.messageService.add({ severity: 'success', summary: 'Merci !', detail: 'Votre feedback a été enregistré.' });
      this.cancelFeedback();
    },
    error: () => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d’enregistrer le feedback.' });
      this.sendingFeedback = false;
    }
  });
}



 
}
