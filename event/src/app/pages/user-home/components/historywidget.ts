import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historywidget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3 class="mb-4">Historique de participation</h3>
      <p class="text-gray-500"></p>
    </div>
  `
})
export class HistoryWidget {}