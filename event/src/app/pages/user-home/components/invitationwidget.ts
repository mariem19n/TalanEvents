import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invitationwidget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3 class="mb-4">Invitations en attente</h3>
      <p class="text-gray-500"></p>
    </div>
  `
})
export class InvitationWidget {}