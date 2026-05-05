import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceItem, ServicesApiService } from '../../../services/services.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.html',
})
export class Services implements OnInit {
  services: ServiceItem[] = [];
  titles: string[] = [];
  filteredTitles: string[] = [];
  showSuggestions = false;

  newService: Partial<ServiceItem> = {
    titre: '',
    description: '',
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private api: ServicesApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getAll().subscribe((res) => (this.services = res));

    this.api.getAll().subscribe({
      next: (data) => {
        this.services = [...data];
        this.cdr.markForCheck();

        const set = new Set(
          this.services
            .map((s) => (s.titre ?? '').trim())
            .filter(Boolean)
            .map((t) => t.toLowerCase()),
        );

        // on garde l’écriture “d’origine” la + récente
        this.titles = Array.from(set).sort();
      },
      error: (err) => console.error(err),
    });
  }

  onTitreInput() {
    const q = (this.newService.titre ?? '').trim().toLowerCase();
    if (!q) {
      this.filteredTitles = [];
      this.showSuggestions = false;
      return;
    }

    this.filteredTitles = this.services
      .map((s) => (s.titre ?? '').trim())
      .filter(Boolean)
      .filter((t) => t.toLowerCase().includes(q))
      .filter((t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i)
      .slice(0, 8);

    this.showSuggestions = this.filteredTitles.length > 0;
  }

  pickTitle(t: string) {
    this.newService.titre = t; // ✅ فقط titre
    this.showSuggestions = false; // ferme
  }

  hideLater() {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;

    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  create() {
    if (!this.newService.titre || !this.newService.description) return;

    const fd = new FormData();
    fd.append('titre', this.newService.titre);
    fd.append('description', this.newService.description);
    fd.append('is_active', '1');

    // ✅ le nom DOIT être "image" (comme dans FileInterceptor('image', ...))
    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.api.createForm(fd).subscribe(() => {
      this.newService = { titre: '', description: '' };
      this.selectedFile = null;
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
      this.load();
    });
  }

  toggle(service: ServiceItem) {
    const newState = service.is_active ? 0 : 1;
    this.api.toggleActive(service.id, newState).subscribe(() => {
      service.is_active = newState;
    });
  }

  remove(id: number) {
    if (!confirm('Supprimer ce service ?')) return;

    this.api.delete(id).subscribe(() => {
      this.services = this.services.filter((s) => s.id !== id);
    });
  }
}
