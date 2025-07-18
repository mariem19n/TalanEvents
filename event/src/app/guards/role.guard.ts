import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../pages/service/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = this.auth.getToken();
    const userRoles = this.auth.getRoles();

    const expectedRoles: string[] = route.data['roles'];

    if (token && expectedRoles.some(role => userRoles.includes(role))) {
      return true;
    }

    return this.router.parseUrl('/unauthorized');
  }
}
