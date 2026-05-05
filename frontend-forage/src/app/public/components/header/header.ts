import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit{
  menuOpen = false;
  isBrowser = false;

  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId); // ✅ client seulement
  }

  ngOnInit() {
    if (!this.isBrowser) return;         // ⛔ pas côté serveur

    if (window.innerWidth > 992) {
      this.menuOpen = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.style.overflow = this.menuOpen ? 'hidden' : 'auto';
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isBrowser) return;         // ⛔ pas côté serveur
    if (window.innerWidth > 992 && this.menuOpen) {
      this.menuOpen = false;
    }
  }
}
