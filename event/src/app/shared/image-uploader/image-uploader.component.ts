import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule, FileUploadModule, ToastModule, ButtonModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Téléversement du poster</div>
      <p-fileUpload
        name="poster"
        mode="advanced"
        accept="image/*"
        [auto]="true"
        maxFileSize="1000000"
        [showUploadButton]="false"
        [showCancelButton]="false"
        (onSelect)="onSelect($event)"
        (onUpload)="onUpload($event)"
        [customUpload]="true"
        (uploadHandler)="customUploader($event)"
      >
        <ng-template #empty>
          <div>Faites glisser une image ici ou cliquez sur "Choisir".</div>
        </ng-template>
      </p-fileUpload>
    </div>
  `
})
export class ImageUploaderComponent {
  @Output() onImageUploaded = new EventEmitter<File>();

  constructor(private messageService: MessageService) {}

  onSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Image sélectionnée',
        detail: `${event.files[0].name}`
      });
    }
  }

  onUpload(event: any) {
    // (Non utilisé si on utilise customUpload)
  }

  customUploader(event: any) {
    const file: File = event.files[0];

    if (file) {
      //  Envoi de l’image au parent (ex: EventViewComponent)
      this.onImageUploaded.emit(file);

      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `"${file.name}" envoyé avec succès.`
      });

      event.options.clear(); // vide le champ après upload
    }
  }
}
