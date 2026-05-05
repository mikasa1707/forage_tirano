import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesApiService } from '../../../services/services.service';
import { environment } from '../../../../environments/environment';

interface ServiceItem {
  titre: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  services: ServiceItem[] = [];
  apiUrl = environment.api;

  selectedService: ServiceItem | null = null;
  animate = false;

  constructor(private api: ServicesApiService) {}

  ngOnInit() {
    this.api.getPublic().subscribe((res) => {
      this.services = res ?? [];
      this.selectedService = this.services.length ? this.services[0] : null;
    });
  }

  selectService(service: ServiceItem, index: number): void {
    if (service === this.selectedService) return;

    this.animate = false;
    this.selectedService = service;
    this.scrollToActiveThumbnail(index);

    // relance l'animation après une courte pause
    setTimeout(() => (this.animate = true), 10);

    // retire la classe après l’animation (0.5s + délai = ~2s)
    setTimeout(() => (this.animate = false), 2000);
  }

  scrollToActiveThumbnail(index: number) {
    const conteiner = document.querySelector('.thumbnail') as HTMLElement;
    const items = conteiner?.querySelectorAll('.item');

    if (!conteiner || !items) return;

    const activeItem = items[index] as HTMLElement;

    conteiner.scrollTo({
      left: activeItem.offsetLeft - conteiner.clientWidth / 2 + activeItem.clientWidth / 2,
      behavior: 'smooth',
    });
  }

  getImageUrl(image?: string | null): string {
    if (!image) {
      return '/assets/images/default-service.jpg';
    }

    // image upload backend
    if (image.startsWith('/uploads/')) {
      return this.apiUrl + image;
    }

    // image statique frontend
    if (image.startsWith('/images/')) {
      return image;
    }

    // fallback sécurité
    return '/assets/images/default-service.jpg';
  }
}
