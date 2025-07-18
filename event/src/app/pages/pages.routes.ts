import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { EventCreateComponent } from './events/event-create/event-create.component';
import { EventEditComponent } from './events/event-edit/event-edit.component';
import { EventListComponent } from './events/event-list/event-list.component';
import { Dashboard } from '../pages/dashboard/dashboard';
import { OrganizerDashboardComponent } from '../pages/organizer-dashboard/organizer-dashboard.component';
import { AdminDashboardComponent } from '../pages/admin-dashboard/admin-dashboard.component';
import { UserHomeComponent } from '../pages/user-home/user-home.component';
import { EventViewComponent } from './events/event-view/event-view.component';
import { RoleGuard } from '../guards/role.guard';


export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'event-create', component: EventCreateComponent },
    { path: 'event-edit/:id', component: EventEditComponent }, 
    { path: 'event-list', component: EventListComponent },
    { path: 'event-view/:id', component: EventViewComponent },    
    {path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] }},
    { path: 'organizer-dashboard', component: OrganizerDashboardComponent,canActivate: [RoleGuard],data: { roles: ['ORGANIZER'] }},
    { path: 'user-home', component: UserHomeComponent, canActivate: [RoleGuard], data: { roles: ['USER', 'ORGANIZER'] }},


   // { path: 'organizer-dashboard', component: OrganizerDashboardComponent },
    { path: 'dashboard', component: Dashboard },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
