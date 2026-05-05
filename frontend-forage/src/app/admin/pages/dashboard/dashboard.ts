import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '../../components/header/header';
import { RouterModule } from '@angular/router';
import { Contact } from '../contact/contact';
import { Equipes } from '../equipes/equipes';
import { Services } from '../services/services';
import { Travaux } from '../travaux/travaux';
import { Users } from '../users/users';

@Component({
  selector: 'app-dashboard',
  imports: [
    // Travaux,
    // Equipes,
    // Services,
    // Contact,
    // Users,
    Sidebar,
    Header,
    RouterModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  sidebarClosed = false;
  isDarkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  toggleSidebar() {
    this.sidebarClosed = !this.sidebarClosed;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      document.body.setAttribute('data-bs-theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  ngOnInit() {
    // ✔️ Vérification SSR
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      this.isDarkMode = saved === 'dark';
    }
  }
}
