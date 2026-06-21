import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gallery } from '../../../shared/gallery/gallery';
import { TravauxApi } from '../../../services/travaux.service';
import { TravauxModel, TravauxMedia } from '../../../models/travaux.model';
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
  filteredPhotos: TravauxMedia[] = [];

  showModal = false;
  showGallery = false;
  currentIndex = 0;
  showAll = false;
  maxRows = 2;
  cols = 3;
  maxVisibleCards = this.maxRows * this.cols;

  loading = false;
  errorMsg = '';
  filter: string = 'all';
  selectedTrav: TravauxModel | null = null;
  isPlaying = false;

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
          this.filteredPhotos = this.travaux[0].medias ?? [];
        }
        this.selectedTrav = this.travaux?.length ? this.travaux[0] : null;
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
    this.filteredPhotos = travaux.medias ?? [];
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

  // get selectedTrav(): any | null {
  //   return this.travaux?.length ? this.travaux[0] : null;
  // }

  get otherTravaux(): any[] {
    return this.travaux?.length ? this.travaux.slice(1) : [];
  }

  swapToMain(indexInOther: number) {
    const i = indexInOther + 1; // car otherTravaux démarre à 1 dans travaux[]
    if (!this.travaux || i <= 0 || i >= this.travaux.length) return;

    // swap travaux[0] <-> travaux[i]
    [this.travaux[0], this.travaux[i]] = [this.travaux[i], this.travaux[0]];
  }

  setSelected(t: any) {
    this.selectedTravaux = t;
    this.selectedTrav = this.selectedTravaux;
    console.log(this.selectedTravaux);
    this.filteredPhotos = t.medias ?? [];
    const el = document.getElementById('hero-case-study');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setFilter(f: string) {
    this.filter = f;
  }

  filteredTravaux() {
    if (this.filter === 'all') return this.travaux;
    return this.travaux.filter((t) => t.status === this.filter);
  }

  get displayedTravaux() {
    const travaux = this.filteredTravaux();

    if (this.showAll || travaux.length <= this.maxVisibleCards) {
      return travaux;
    }

    return travaux.slice(0, this.maxVisibleCards - 1);
  }

  get remainingCount(): number {
    return Math.max(this.filteredTravaux().length - (this.maxVisibleCards - 1), 0);
  }

  togglePlay(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }
}
