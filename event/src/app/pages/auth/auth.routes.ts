import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:token', component: ResetPasswordComponent },
] as Routes;
