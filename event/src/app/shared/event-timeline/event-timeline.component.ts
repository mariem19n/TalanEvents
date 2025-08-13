import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-event-timeline',
  standalone: true,
  imports: [CommonModule, TimelineModule, CardModule],
  templateUrl: './event-timeline.component.html',
  styleUrls: ['./event-timeline.component.scss']

})
export class EventTimelineComponent {
  @Input() steps: { time: string; label: string; icon?: string }[] = [];

  get visibleSteps() {
  return this.steps.filter(step => step.label && step.time);
}

}
