import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Travaux } from './pages/travaux/travaux';
import { Equipes } from './pages/equipes/equipes';
import { Services } from './pages/services/services';
import { Contact } from './pages/contact/contact';
import { Users } from './pages/users/users';

const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: 'travaux', component: Travaux },
      { path: 'equipes', component: Equipes },
      { path: 'services', component: Services },
      { path: 'contact', component: Contact },
      { path: 'users', component: Users },
      { path: '', redirectTo: 'travaux', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
