import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';



@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule, FileUploadModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.css']
})
export class ImageUploaderComponent {
  @Input() eventId!: number;
  @Output() onImageUploaded = new EventEmitter<string>();
  @Output() onImageCleared = new EventEmitter<void>();

  //@ViewChild('fileUploader') fileUploader!: FileUpload;


  currentFile: File | null = null;
  uploadedFiles: File[] = [];
  posterUploaded = false;


  constructor(
    private messageService: MessageService,
    private http: HttpClient,
    private confirmationService: ConfirmationService

  ) {}

  onSelect(event: any) {
    if (event.files.length > 1) {
      const last = event.files[event.files.length - 1];
      event.options.clear();
      event.options.addFiles([last]);
      this.currentFile = last;
    } else {
      this.currentFile = event.files[0];
    }
  }

  onUpload(event: any) {
  if (this.currentFile && this.eventId) {
    const formData = new FormData();
    formData.append('poster', this.currentFile);

    this.http.post<{ url: string }>(
      `http://localhost:8080/api/events/${this.eventId}/poster`,
      formData
    ).subscribe({
      next: (res) => {
        this.uploadedFiles.push(this.currentFile!);
        this.onImageUploaded.emit(res.url); // émettre l'URL
        this.posterUploaded = true;
        console.log("Poster uploadé avec succès");
        console.log("posterUploaded = ", this.posterUploaded);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `"${this.currentFile!.name}" a été téléversé avec succès.`,
        });
        event.options.clear();
        this.currentFile = null;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec du téléversement.',
        });
      }
    });
  }
}

  onClear() {
    this.currentFile = null;
    this.uploadedFiles = [];
  }


  confirmDeletePoster() {
    this.confirmationService.confirm({
      message: 'Confirmez-vous la suppression du poster ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`http://localhost:8080/api/events/${this.eventId}/poster`).subscribe({
          next: () => {
            this.posterUploaded = false;
            this.onImageCleared.emit();
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

}
