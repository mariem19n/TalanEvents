import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-user-profile-card',
  standalone: true,
  imports: [CommonModule, TagModule, AvatarModule],
  templateUrl: './user-profile-card.component.html'
})
export class UserProfileCardComponent {
  @Input() fullName = '';
  @Input() email = '';
  @Input() avatarUrl = '';
  @Input() badges: string[] = [];
}
