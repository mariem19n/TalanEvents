import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTimelineEditorComponent } from './event-timeline-editor.component';

describe('EventTimelineEditorComponent', () => {
  let component: EventTimelineEditorComponent;
  let fixture: ComponentFixture<EventTimelineEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTimelineEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTimelineEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
