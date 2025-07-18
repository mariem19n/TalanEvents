import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';


import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';



@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    templateUrl: './app.topbar.html'
})


export class AppTopbar {
    items!: MenuItem[];
    isUserHome: boolean = false;

    constructor(public layoutService: LayoutService, public router: Router) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.isUserHome = event.url.includes('/user-home');
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        //localStorage.clear(); 
        this.router.navigate(['/login']);
    }
}
