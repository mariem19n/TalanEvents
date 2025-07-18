import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-publiceventswidget',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  template: `
    <div class="card">
      <h3 class="mb-4">Événements publics</h3>
      <p-table [value]="events" [paginator]="true" [rows]="5">
        <ng-template pTemplate="header">
          <tr>
            <th>Titre</th>
            <th>Date</th>
            <th>Lieu</th>
            <th>Statut</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-event>
          <tr>
            <td>{{ event.title }}</td>
            <td>{{ event.eventDate }}</td>
            <td>{{ event.location }}</td>
            <td><p-tag [value]="event.status" [severity]="getSeverity(event.status)"></p-tag></td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class PublicEventsWidget {
  @Input() events: any[] = [];

  getSeverity(status: string): string {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }
}
