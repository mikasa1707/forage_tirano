import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceItem, ServicesApiService } from '../../../services/services.service';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

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
  apiUrl = environment.api;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private api: ServicesApiService,
    private cdr: ChangeDetectorRef,
    public readonly auth: AuthService
  ) { }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

  load() {
    this.api.getAll().subscribe({
      next: (data) => {
        this.services = [...data];
        this.cdr.markForCheck();

        const set = new Set(
          data
            .map((s) => (s.titre ?? '').trim())
            .filter(Boolean)
        );

        this.titles = Array.from(set);
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

    const seen = new Set<string>();

    this.filteredTitles = this.services
      .map(s => (s.titre ?? '').trim())
      .filter(Boolean)
      .filter(t => {
        const key = t.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return key.includes(q);
      })
      .slice(0, 8);

    this.showSuggestions = this.filteredTitles.length > 0;
  }

  pickTitle(t: string) {
    this.newService.titre = t; // ✅ فقط titre
    this.showSuggestions = false; // ferme
  }

  hideLater() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;

    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  create() {
    const titre = this.newService.titre?.trim();
    const description = this.newService.description?.trim();

    if (!titre || !description) return;

    const fd = new FormData();
    fd.append('titre', titre);
    fd.append('description', description);
    fd.append('is_active', '1');

    if (this.selectedFile) {
      fd.append('image', this.selectedFile);
    }

    this.api.createForm(fd).subscribe({
      next: () => {
        this.newService = { titre: '', description: '' };
        this.selectedFile = null;

        if (this.previewUrl) {
          URL.revokeObjectURL(this.previewUrl);
          this.previewUrl = null;
        }

        this.load();
      },
      error: (err) => console.error(err),
    });
  }

  edit(service: ServiceItem) {
    this.newService = {
      id: service.id,
      titre: service.titre,
      description: service.description,
      image: service.image
    };
    this.previewUrl = (this.apiUrl + service.image);
  }

  toggle(service: ServiceItem) {
    const newState = service.is_active ? 0 : 1;

    // 🔥 update optimiste AVANT Angular check
    service.is_active = newState;

    this.api.toggleActive(service.id, newState).subscribe({
      error: () => {
        // rollback si erreur
        service.is_active = newState ? 0 : 1;
      },
    });
  }
  remove(id: number) {
    if (!confirm('Supprimer ce service ?')) return;

    this.api.delete(id).subscribe(() => {
      this.services = this.services.filter((s) => s.id !== id);
      this.load();
    });
  }

  update(id: number, service: any, file?: File) {

    this.api.update(id, service, this.selectedFile ?? undefined).subscribe({
      next: () => {
        this.load();
        this.resetForm();
      },
      error: (err) => console.error(err),
    });
  }

  save() {
    if (this.newService.id) {
      this.update(this.newService.id, this.newService, this.selectedFile ?? undefined);
    } else {
      this.create();
    }
  }

  resetForm() {
    this.newService = { titre: '', description: '', id: undefined };
    this.selectedFile = null;
    this.previewUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  cancel() {
    this.newService = {};
  }

  canCreate(): boolean {
    return this.auth.hasRole(['admin', 'editor']);
  }

  canEdit(): boolean {
    return this.auth.hasRole(['admin', 'editor']);
  }

  canDelete(): boolean {
    return this.auth.hasRole(['admin']);
  }
}
