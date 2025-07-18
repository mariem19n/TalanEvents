import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { RoleGuard } from './app/guards/role.guard';
import { AdminDashboardComponent } from './app/pages/admin-dashboard/admin-dashboard.component';
import { UnauthorizedComponent } from './app/pages/unauthorized/unauthorized.component';




export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }  ,
            { path: 'admin',  component: AdminDashboardComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] },}, 
            { path: 'user-dashboard', component: Dashboard },
          
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: 'unauthorized', component: UnauthorizedComponent},
    { path: '**', redirectTo: '/notfound' },

];
