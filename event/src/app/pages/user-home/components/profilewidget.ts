import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profilewidget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3 class="mb-4">Profil utilisateur</h3>
      <p><strong>Email :</strong> {{ email }}</p>
      <p class="text-gray-500">Modification des infos à venir...</p>
    </div>
  `
})
export class ProfileWidget {
  @Input() email: string = '';
}
