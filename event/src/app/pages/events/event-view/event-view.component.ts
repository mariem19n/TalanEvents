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
import { ImageUploaderComponent } from '../../../shared/image-uploader/image-uploader.component';

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
    ImageUploaderComponent
  ],
  providers: [MessageService],
  templateUrl: './event-view.component.html'
})
export class EventViewComponent implements OnInit {
  eventId!: string;
  eventData: any;
  uploadedFileName: string = '';
  posterPreviewUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.eventData = event;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Événement introuvable.",
        });
      }
    });
  }

  handlePosterUpload(file: File) {
    this.uploadedFileName = file.name;
    this.posterPreviewUrl = URL.createObjectURL(file);

    this.messageService.add({
      severity: 'success',
      summary: 'Poster prêt',
      detail: `"${file.name}" a été reçu pour l’événement.`,
    });

    // Pour envoi au backend :
    // const formData = new FormData();
    // formData.append('poster', file);
    // this.eventService.uploadPoster(this.eventId, formData).subscribe(...)
  }

  sendInvitations() {
    this.messageService.add({
      severity: 'info',
      summary: 'Invitations envoyées',
      detail: "Les participants ont été notifiés.",
    });
  }
}
