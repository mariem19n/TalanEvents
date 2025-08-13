import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../service/event.service';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { Table } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClient } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { StatsService, EventStats } from '../../service/stats.service';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { FilterMatchMode } from 'primeng/api'; 
import { ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { InputTextarea } from 'primeng/inputtextarea';
import { SelectButton } from 'primeng/selectbutton';
import { RatingModule } from 'primeng/rating';
import { FeedbackService, EventFeedbackSummary } from '../../service/feedback.service';



import { ImageUploaderComponent } from '../../../shared/image-uploader/image-uploader.component';
import { EventTimelineComponent } from '../../../shared/event-timeline/event-timeline.component';
import { EventTimelineEditorComponent } from '../../../shared/event-timeline-editor/event-timeline-editor.component';
import { InvitationService } from '../../service/invitation.service';
import { UserService } from '../../service/user.service';


type PlanningStep = { time: string; label: string; icon: string };
type InviteStatus = 'NOT_INVITED' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';


interface EligibleUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  status: InviteStatus;       // doit venir du backend
  lastInvitationAt?: string;  // optionnel
}


@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TableModule,
    DialogModule,
    CheckboxModule,
    InputTextModule,
    TooltipModule,
    ImageUploaderComponent,
    EventTimelineComponent,
    EventTimelineEditorComponent,
    ConfirmDialogModule,
    ProgressBarModule,
    ChipModule,
    DropdownModule,
    TagModule,
    InputTextarea ,
    SelectButton,
    RatingModule

  ],
  providers: [MessageService,ConfirmationService],
  templateUrl: './event-view.component.html'
})
export class EventViewComponent implements OnInit {
  
  eventId!: string;
  eventData: any;
//  usersList: any[] = [];
//  selectedUsers: any[] = []; 

  usersList: EligibleUser[] = [];
  selectedUsers: EligibleUser[] = [];

  invitationMessage: string = '';
  showInviteDialog: boolean = false;
  editPosterMode = false;
  posterPreviewUrl: string | null = null;
  planningSteps: PlanningStep[] = [ { time: 'string', label: 'string', icon: 'string' } ];

  showStatsDialog = false;
  eventStats: EventStats | null = null;

  acceptedPct = 0;
  pendingPct  = 0;
  declinedPct = 0;
  maybePct    = 0;
  expiredPct  = 0;

  isSendingInvites = false;
  invitedCount = 0; 

  showFeedbackDialog = false;
  feedbackLoading = false;
  feedbackSummary?: EventFeedbackSummary;

  // --- Message popup ---
  showMsgDialog = false; 
  sampleMsg = "Ex. \n Bonjour, tu es invité(e) à notre prochain événement. \n Merci de confirmer ta présence.";

  openMsgDialog() { this.showMsgDialog = true; }
  closeMsgDialog() { this.showMsgDialog = false; }
  clearMessage() { this.invitationMessage = ''; }

  statusChip: 'ALL' | 'INVITED' | 'PENDING' | 'ACCEPTED' | 'DECLINED' = 'ALL';
  @ViewChild('dt') dt!: Table;


    statusOptions = [
    { label: 'Tous',      value: 'ALL' },
    { label: 'Invités',   value: 'INVITED' },
    { label: 'En attente',value: 'PENDING' },
    { label: 'Acceptées', value: 'ACCEPTED' },
    { label: 'Rejetées',  value: 'DECLINED' }
  ];

 
  



  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private invitationService: InvitationService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private router: Router,
    private statsService: StatsService,
    private feedbackService: FeedbackService

  ) {}
  


  ngOnInit(): void {
  this.eventId = this.route.snapshot.paramMap.get('id')!;

  // Charger l'événement
  this.eventService.getEventById(this.eventId).subscribe({
    next: (event) => {
      this.eventData = event;
      //this.planningSteps = (event as any).planning || [];
      // Charger le planning s'il existe
      if (event.planning && event.planning.length > 0) {
        this.planningSteps = event.planning;
        console.log('🧩 Planning reçu depuis le backend :', event.planning);

      } else {
        // Sinon, on initialise avec une étape vide
        this.planningSteps = [{ time: '', label: '', icon: '' }];
      }

      if (event.posterUrl) {
        this.posterPreviewUrl = event.posterUrl;
        console.log("🎯 Poster URL reçu :", this.posterPreviewUrl);
      }

      if (this.planningSteps.length === 0) {
        this.planningSteps.push({ time: '', label: '', icon: '' });
      }
      

    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Événement introuvable.",
      });
    }
  });

  // Charger users + invitations puis fusionner les statuts
forkJoin({
  users: this.userService.getEligibleUsers(this.eventId),
  invites: this.invitationService.getInvitationsByEvent(+this.eventId)
}).subscribe({
  next: ({ users, invites }) => {
    // indexer le dernier statut par userId
    const statusByUser = new Map<number, { status: InviteStatus; when?: string }>();

    (invites || []).forEach((inv: any) => {
      const uid = inv.invitedUserId;                
      if (!uid) return;
      const s = (inv.status || 'PENDING').toString().toUpperCase().trim() as InviteStatus;
      const when = inv.sentAt || inv.respondedAt;   // utilisé comme "lastInvitationAt"
      const prev = statusByUser.get(uid);

      if (!prev) {
        statusByUser.set(uid, { status: s, when });
      } else if (when && (!prev.when || new Date(when) > new Date(prev.when))) {
        statusByUser.set(uid, { status: s, when });
      }
    });

    // fusionner dans usersList
    this.usersList = (users || []).map((u: any) => {
      const entry = statusByUser.get(u.id);
      return {
        ...u,
        status: (entry?.status ?? 'NOT_INVITED') as InviteStatus,
        lastInvitationAt: entry?.when ?? null
      } as EligibleUser;
    });
    this.invitedCount = this.usersList.filter(u => u.status !== 'NOT_INVITED').length;
    // debug rapide
    console.table(this.usersList.slice(0, 5));
  },
  error: () => {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: "Impossible de charger utilisateurs/invitations."
    });
  }
});

}


  handlePosterUpload(url: string) {
    this.eventData.posterUrl = url;
    this.posterPreviewUrl = url;
    this.editPosterMode = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Le poster a été téléversé avec succès.',
    });
  }



  clearPosterPreview() {
    this.posterPreviewUrl = null;
    if (this.eventData) {
      this.eventData.posterUrl = null;
    }
  }

  startEditPoster() {
    this.editPosterMode = true;
  }

  cancelEditPoster() {
    this.editPosterMode = false;
  }

  handleNewPoster(url: string) {
    if (this.eventData) {
      this.eventData.posterUrl = url;
    }
    this.editPosterMode = false;
  }

  confirmDeletePoster() {
  this.confirmationService.confirm({
    message: 'Confirmez-vous la suppression du poster ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      // Appel direct au backend pour supprimer
      this.http.delete(`http://localhost:8080/api/events/${this.eventId}/poster`).subscribe({
        next: () => {
          // Suppression frontend locale
          this.posterPreviewUrl = null;
          if (this.eventData) {
            this.eventData.posterUrl = null;
          }
          this.editPosterMode = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Suppression',
            detail: 'Le poster a été supprimé avec succès.',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la suppression du poster.',
          });
        }
      });
    }
  });
}



  savePlanningToBackend() {
  if (!this.eventId) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: "Identifiant de l'événement manquant.",
    });
    return;
  }

  // Mise à jour côté frontend local
  this.eventData.planning = this.planningSteps;
  console.log("➡️ Envoi vers : /api/events/" + this.eventId + "/planning");


  // Envoi vers le backend
  this.http.put(`/api/events/${this.eventId}/planning`, this.planningSteps).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Planning enregistré',
        detail: 'Le planning a été enregistré avec succès.',
      });
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "L'enregistrement du planning a échoué.",
      });
    }
  });
}



  updatePlanningBackend() {
  const planningToSend = this.planningSteps;

  this.http.put(`/api/events/${this.eventId}/planning`, planningToSend).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Planning enregistré',
        detail: 'Le planning a bien été sauvegardé.'
      });
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de l’enregistrement du planning.'
      });
    }
  });
}

  cancelInvitations() {
    this.showInviteDialog = false;
    this.selectedUsers = [];
    this.invitationMessage = '';
  }



  filterEmail(event: Event, dt: any) {
    const input = event.target as HTMLInputElement;
    dt.filter(input.value, 'email', 'contains');
  }

  filterName(event: Event, dt: any) {
    const input = event.target as HTMLInputElement;
    dt.filter(input.value, 'firstName', 'contains');
  }


  filterTable(value: string, field: string, dt: Table) {
    dt.filterGlobal(value, 'contains');
    dt.filter(value, field, 'contains');
  }

  onInputFilter(event: Event, field: string, dt: Table) {
    const input = event.target as HTMLInputElement;
    dt.filter(input.value, field, 'contains');
  }


  sendInvitations() {
    const userIds = this.selectedUsers.map(user => user.id);  // extraire les IDs depuis les objets
    if (userIds.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucun participant sélectionné',
      detail: 'Veuillez sélectionner au moins un utilisateur.'
    });
    return;
  }

   const payload = {
    eventId: +this.eventId,
    invitedUserIds: userIds,
    message: this.invitationMessage
  };
  console.log('📤 Payload envoyé (invitations):', payload);

  this.invitationService.sendMultipleInvitations(+this.eventId, userIds, this.invitationMessage).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `${userIds.length} invitation(s) envoyée(s) avec succès.`
      });
      this.showInviteDialog = false;
      this.selectedUsers = [];      
      this.invitationMessage = '';
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "L'envoi des invitations a échoué."
      });
    }
  });
}

  goBack() {                            
  this.router.navigate(['/pages/organizer-dashboard']);
  }

  goEdit() {                             
    // si tu as une page d’édition dédiée :
    this.router.navigate(['/pages/event-edit', this.eventId]);
    // (sinon, ouvre un dialog d’édition si tu veux réutiliser ton EventEditComponent en popup)
  }


  openStatsDialog() {
    this.showStatsDialog = true;
    const id = Number(this.eventId);
    if (!id) return;

    this.statsService.getEventStats(id).subscribe({
      next: (s: EventStats) => {
        this.eventStats = s;
        this.computePcts(s);
      },
      error: () => {
        this.eventStats = null;
        this.resetPcts();
      }
    });
  }

  private computePcts(s: EventStats) {
    const tot = s.invitations || 0;
    if (!tot) return this.resetPcts();

    this.acceptedPct = Math.round((s.accepted / tot) * 100);
    this.pendingPct  = Math.round((s.pending  / tot) * 100);
    this.declinedPct = Math.round((s.declined / tot) * 100);
    this.maybePct    = Math.round((s.maybe    / tot) * 100);
    this.expiredPct  = Math.round((s.expired  / tot) * 100);
  }

  private resetPcts() {
    this.acceptedPct = this.pendingPct = this.declinedPct = this.maybePct = this.expiredPct = 0;
  }


  goFeedback() {
  const id = Number(this.eventId);
  if (!id) return;

  this.showFeedbackDialog = true;
  this.feedbackLoading = true;

  this.feedbackService.getEventFeedback(id).subscribe({
    next: (s) => { this.feedbackSummary = s; this.feedbackLoading = false; },
    error: () => {
      this.feedbackLoading = false;
      this.feedbackSummary = undefined;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les feedbacks.'
      });
    }
  });
}


  
  tagSeverity(s: InviteStatus | null) {
    switch (s) {
      case 'ACCEPTED': return 'success';
      case 'PENDING':  return 'warn';
      case 'DECLINED': return 'danger';
      case 'EXPIRED':  return 'secondary';
      default:         return undefined; // NOT_INVITED
    }
  }

  isSelectable(u: EligibleUser) {
    // désactive la sélection si déjà invité (statut ≠ NOT_INVITED)
    return u.status === 'NOT_INVITED';
  }

  // filtre par chips au-dessus de la table
  applyChipFilter(dt: Table, chip: typeof this.statusChip) {

  this.statusChip = chip;
  dt.clear();

  if (chip === 'ALL') return;

  if (chip === 'INVITED') {
    // Tout sauf NOT_INVITED
    dt.filter('NOT_INVITED', 'status', 'notEquals');
    return;
  }

  const v = chip; // 'PENDING' | 'ACCEPTED' | 'DECLINED'
  dt.filter(v, 'status', 'equals');
}



}
