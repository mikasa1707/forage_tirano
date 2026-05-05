import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./admin/admin-module').then((m) => m.AdminModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./public/public-module').then((m) => m.PublicModule),
  },
  { path: '**', redirectTo: '' },
];