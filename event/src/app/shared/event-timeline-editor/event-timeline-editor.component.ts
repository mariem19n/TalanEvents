import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-event-timeline-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    TooltipModule
  ],
  templateUrl: './event-timeline-editor.component.html',
  styleUrls: ['./event-timeline-editor.component.scss']
})
export class EventTimelineEditorComponent implements OnInit {
  @Input() steps: { time: string; label: string; icon: string }[] = [];
  @Output() stepsChange = new EventEmitter<any[]>();
  @Output() savePlanning = new EventEmitter<void>();

  hourOptions: string[] = [];

  iconOptions = [
    { label: 'Accueil', value: 'pi pi-users' },
    { label: 'Présentation', value: 'pi pi-comment' },
    { label: 'Conférence', value: 'pi pi-microphone' },
    { label: 'Pause', value: 'pi pi-coffee' },
    { label: 'Atelier', value: 'pi pi-briefcase' },
    { label: 'Clôture', value: 'pi pi-check' },
    { label: 'Autre...', value: 'autre' }
  ];

  visibleIconDialog: boolean = false;
  selectedStepIndex: number | null = null;

  extraIcons = [
    { label: 'Karaoké', value: 'pi pi-volume-up' },
    { label: 'Quiz', value: 'pi pi-question' },
    { label: 'Sport', value: 'pi pi-flag' },
    { label: 'Workshop', value: 'pi pi-briefcase' },
    { label: 'Spectacle', value: 'pi pi-video' },
    { label: 'Projection', value: 'pi pi-play' },
    { label: 'Créatif', value: 'pi pi-palette' },
    { label: 'DJ Set', value: 'pi pi-headphones' },
    { label: 'Team-building', value: 'pi pi-sitemap' },
    { label: 'Remise de prix', value: 'pi pi-star' },
   
 
    { label: 'Pause', value: 'pi pi-pause' },
   // { label: 'Repas', value: 'pi pi-hamburger' },
    { label: 'Discussion', value: 'pi pi-comments' },
    { label: 'Photobooth', value: 'pi pi-camera' },
    { label: 'Networking', value: 'pi pi-share-alt' },
    { label: 'Conférence', value: 'pi pi-microphone' },
    { label: 'Danse', value: 'pi pi-globe' },
    { label: 'Débat', value: 'pi pi-megaphone' },
    {label: "Remise des prix", value: "pi pi-gift" }
  ];


  ngOnInit(): void {
    this.generateHourOptions();
  }

  onIconChange(index: number, value: string) {
  if (value === 'autre') {
    this.selectedStepIndex = index;
    this.visibleIconDialog = true;
  }
  }

  selectExtraIcon(iconClass: string) {
  if (this.selectedStepIndex !== null) {
    this.steps[this.selectedStepIndex].icon = iconClass;
    this.stepsChange.emit(this.steps);
    this.visibleIconDialog = false;
    this.selectedStepIndex = null;
  }
}


  generateHourOptions(): void {
    const hours: string[] = [];
    for (let h = 7; h <= 23; h++) {
      const hour = h.toString().padStart(2, '0');
      hours.push(`${hour}:00`);
      hours.push(`${hour}:30`);
    }
    this.hourOptions = hours;
  }

  addStep() {
    this.steps.push({ time: '', label: '', icon: '' });
    this.stepsChange.emit(this.steps);
  }

  removeStep(index: number) {
    this.steps.splice(index, 1);
    this.stepsChange.emit(this.steps);
  }

  save() {
    this.savePlanning.emit();
  }
}
