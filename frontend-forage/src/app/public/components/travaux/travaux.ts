import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gallery } from '../../../shared/gallery/gallery';
import { TravauxApi } from '../../../services/travaux.service';
import { TravauxModel, TravauxPhoto } from '../../../models/travaux.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-travaux',
  standalone: true,
  imports: [CommonModule, Gallery],
  templateUrl: './travaux.html',
  styleUrl: './travaux.scss',
})
export class Travaux implements OnInit {
  apiUrl = environment.api;
  travaux: TravauxModel[] = [];

  selectedTravaux!: TravauxModel;
  filteredPhotos: TravauxPhoto[] = [];

  showModal = false;
  showGallery = false;
  currentIndex = 0;

  loading = false;
  errorMsg = '';

  constructor(
    private api: TravauxApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';

    this.api.list().subscribe({
      next: (data) => {
        this.travaux = [...data].sort(
          (a, b) => new Date(a.date_debut ?? '').getTime() - new Date(b.date_debut ?? '').getTime(),
        );

        if (this.travaux.length) {
          this.selectedTravaux = this.travaux[0];
          this.filteredPhotos = this.travaux[0].photos ?? [];
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Impossible de charger les travaux.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  selectTravaux(travaux: TravauxModel) {
    this.selectedTravaux = travaux;
    this.filteredPhotos = travaux.photos ?? [];
    this.showModal = true;
  }

  openGallery(index: number) {
    this.currentIndex = index;
    this.showGallery = true;
  }

  closeGallery() {
    this.showGallery = false;
  }

  closeModal() {
    this.showModal = false;
    this.showGallery = false;
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.classList.add('is-broken');
  }

  onImgLoad(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.classList.remove('is-broken'); // ✅ important après un swap
  }

  get selectedTrav(): any | null {
    return this.travaux?.length ? this.travaux[0] : null;
  }

  get otherTravaux(): any[] {
    return this.travaux?.length ? this.travaux.slice(1) : [];
  }

  swapToMain(indexInOther: number) {
    const i = indexInOther + 1; // car otherTravaux démarre à 1 dans travaux[]
    if (!this.travaux || i <= 0 || i >= this.travaux.length) return;

    // swap travaux[0] <-> travaux[i]
    [this.travaux[0], this.travaux[i]] = [this.travaux[i], this.travaux[0]];
  }
}
