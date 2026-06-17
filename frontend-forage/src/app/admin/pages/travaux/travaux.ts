import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';

import { TravauxApi } from '../../../services/travaux.service';
import { TravauxModel, TravauxPhoto } from '../../../models/travaux.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

type CaptionItem =
  | { kind: 'existing'; id: number; src: string; value: string }
  | { kind: 'new'; index: number; src: string; value: string };

@Component({
  selector: 'app-travaux',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './travaux.html',
  styleUrl: './travaux.scss',
})
export class Travaux implements OnInit {
  apiUrl = environment.api;
  travaux: TravauxModel[] = [];

  modalOpen = false;
  editing = false;
  captionModalOpen = false;

  current: TravauxModel | null = null;

  selectedFiles: File[] = [];
  previews: string[] = [];
  mainIndex = 0;

  legends: string[] = []; // ✅ uniquement pour les nouvelles photos
  today = new Date().toISOString().split('T')[0];

  existingMainUrl: string | null = null;
  existingPhotos: TravauxPhoto[] = [];

  // ✅ liste affichée dans modal 2 (existantes + nouvelles)
  captionItems: CaptionItem[] = [];

  form: FormGroup;

  constructor(
    private api: TravauxApi,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public readonly auth: AuthService
  ) {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      status: ['planifie'],
      date_debut: [''],
      date_fin: [''],
      localisation: [''],
      equipe_id: [null as number | null],
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.list().subscribe({
      next: (data) => {
        this.travaux = [...data];
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err),
    });
  }

  imgUrl(path?: string | null) {
    if (!path) return '/assets/placeholder.jpg';
    if (path.startsWith('http')) return path;
    return this.apiUrl + path;
  }

  openCreate() {
    this.editing = false;
    this.current = null;
    this.existingMainUrl = null;
    this.resetForm();
    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  openEdit(t: TravauxModel) {
    this.editing = true;
    this.current = t;

    this.captionModalOpen = false;
    this.captionItems = [];

    this.form.reset({
      titre: t.titre ?? '',
      description: t.description ?? '',
      status: t.status ?? 'planifie',
      date_debut: t.date_debut ?? '',
      date_fin: t.date_fin ?? '',
      localisation: t.localisation ?? '',
      equipe_id: (t as any).equipe_id ?? null,
    });

    // ✅ reset nouvelles photos
    this.selectedFiles = [];
    this.legends = [];

    this.previews.forEach((p) => URL.revokeObjectURL(p));
    this.previews = [];
    this.mainIndex = 0;

    // ✅ photos existantes
    this.existingPhotos = t.photos ?? [];

    if (!t.photos || t.photos.length === 0) {
      this.api.photos(t.id).subscribe({
        next: (photos) => (this.existingPhotos = photos ?? []),
        error: () => (this.existingPhotos = []),
      });
    }

    this.existingMainUrl = t.photo_principale ?? null;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  resetForm() {
    this.form.reset({ status: 'planifie' });

    this.previews.forEach((p) => URL.revokeObjectURL(p));
    this.selectedFiles = [];
    this.previews = [];
    this.legends = [];
    this.mainIndex = 0;

    this.captionModalOpen = false;
    this.captionItems = [];
  }

  onFilesChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;

    this.previews.forEach((p) => URL.revokeObjectURL(p));

    this.selectedFiles = Array.from(input.files);
    this.previews = this.selectedFiles.map((f) => URL.createObjectURL(f));
    this.mainIndex = 0;

    // ✅ 1 légende par nouvelle photo
    this.legends = this.selectedFiles.map(() => '');

    input.value = '';
  }

  setMain(i: number) {
    this.mainIndex = i;
    this.existingMainUrl = null;
  }

  setExistingMain(imageUrl: string) {
    this.existingMainUrl = imageUrl;
  }

  // ✅ construit la liste affichée en modal 2
  private buildCaptionItems() {
    const existing: CaptionItem[] = (this.existingPhotos ?? []).map((ph) => ({
      kind: 'existing',
      id: ph.id,
      src: this.imgUrl(ph.image),
      value: (ph as any).legenda ?? '', // adapte si ton champ diffère
    }));

    const news: CaptionItem[] = this.previews.map((p, i) => ({
      kind: 'new',
      index: i,
      src: p,
      value: this.legends[i] ?? '',
    }));

    this.captionItems = [...existing, ...news];
  }

  nextOrSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // aucune photo (ni existante, ni nouvelle) => save direct
    if (this.existingPhotos.length === 0 && this.selectedFiles.length === 0) {
      this.saveFinal();
      return;
    }

    // si nouvelles photos => aligner legends
    if (this.selectedFiles.length > 0 && this.legends.length !== this.selectedFiles.length) {
      this.legends = this.selectedFiles.map(() => '');
    }

    this.buildCaptionItems();
    this.captionModalOpen = true;
  }

  closeCaptionModal() {
    this.captionModalOpen = false;
  }

  saveFinal() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // recopie des valeurs de modal 2 vers legends (nouvelles)
    this.captionItems
      .filter((x) => x.kind === 'new')
      .forEach((x) => {
        this.legends[(x as any).index] = (x as any).value;
      });

    // optionnel : exiger légendes pour nouvelles photos
    if (this.selectedFiles.length > 0 && this.legends.some((l) => !l?.trim())) {
      alert('Veuillez remplir la description de chaque nouvelle photo.');
      return;
    }

    // (optionnel) mise à jour légendes existantes si ton backend le gère
    const existingLegendUpdates = this.captionItems
      .filter((x) => x.kind === 'existing')
      .map((x) => ({ id: (x as any).id, legenda: (x as any).value }));

    const v = this.form.getRawValue();

    const payload = {
      titre: v.titre,
      description: v.description,
      status: v.status,
      date_debut: v.date_debut,
      date_fin: v.date_fin,
      localisation: v.localisation,
      equipe_id: v.equipe_id,

      photos: this.selectedFiles,
      photoPrincipaleIndex: this.mainIndex,
      legends: this.legends,

      existingMainUrl: this.existingMainUrl,

      // ✅ à utiliser si tu ajoutes un endpoint côté API
      existingLegendUpdates,
    };

    const req$ =
      this.editing && this.current
        ? this.api.update(this.current.id, payload)
        : this.api.create(payload);

    req$.subscribe(() => {
      this.captionModalOpen = false;
      this.closeModal();
      this.load();
    });
  }

  remove(id: number) {
    if (!confirm('Supprimer cette ligne ?')) return;
    this.api.delete(id).subscribe(() => this.load());
  }

  removePhoto(travauxId: number, photoId: number) {
    this.api.deletePhoto(travauxId, photoId).subscribe(() => this.load());
  }

  confirmRemove(ph: TravauxPhoto) {
    if (!confirm('Supprimer cette photo ?')) return;
    this.removePhoto(this.current!.id, ph.id);
  }

  removeNewPhoto(i: number) {
    URL.revokeObjectURL(this.previews[i]);

    this.selectedFiles.splice(i, 1);
    this.previews.splice(i, 1);
    this.legends.splice(i, 1);

    if (this.mainIndex > i) this.mainIndex--;
    if (this.mainIndex >= this.selectedFiles.length) this.mainIndex = 0;
  }

  canCreate(): boolean {
    this.form.disable();
    return this.auth.hasRole(['admin', 'editor']);
  }

  canEdit(): boolean {
    return this.auth.hasRole(['admin', 'editor']);
  }

  canDelete(): boolean {
    return this.auth.hasRole(['admin']);
  }
}
