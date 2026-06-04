import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
    constructor(private router: Router) {}

  logout() {
    // 🔥 1. supprimer token / session
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 🔥 2. rediriger vers login
    this.router.navigate(['/login']);
  }
}
