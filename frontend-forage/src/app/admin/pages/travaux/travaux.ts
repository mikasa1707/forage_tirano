import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormsModule,
} from '@angular/forms';

import { TravauxApi } from '../../../services/travaux.service';
import { TravauxModel, TravauxMedia } from '../../../models/travaux.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

type CaptionItem =
  | { kind: 'existing'; id: number; src: string; value: string; type: string }
  | { kind: 'new'; uid: string; src: string; file: File; value: string; type: string };

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

  previews: {
    uid: string;
    url: string;
    type: 'image' | 'video';
    file: File;
    legenda: string;
  }[] = [];

  captionItems: CaptionItem[] = [];
  mainIndex = 0;

  mediaTypes: ('image' | 'video')[] = [];
  legends: string[] = []; // ✅ uniquement pour les nouvelles photos
  today = new Date().toISOString().split('T')[0];

  existingMainUrl: string | null = null;
  existingMedias: TravauxMedia[] = [];

  form: FormGroup;

  constructor(
    private api: TravauxApi,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public readonly auth: AuthService,
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
        console.log(this.travaux);
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

    this.previews.forEach((p) => URL.revokeObjectURL(p.url));
    this.previews = [];
    this.mainIndex = 0;

    // ✅ photos existantes
    this.existingMedias = t.medias ?? [];
    console.log(this.existingMedias);

    if (!t.medias || t.medias.length === 0) {
      this.api.photos(t.id).subscribe({
        next: (photos) => (this.existingMedias = photos ?? []),
        error: () => (this.existingMedias = []),
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

    this.previews.forEach((p) => URL.revokeObjectURL(p.url));

    this.selectedFiles = [];
    this.previews = [];
    this.mediaTypes = [];
    this.legends = [];

    this.mainIndex = 0;

    this.captionModalOpen = false;
    this.captionItems = [];
  }

  onFilesChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);

    for (const file of files) {
      const uid = crypto.randomUUID();

      this.selectedFiles.push(file);

      this.previews.push({
        uid,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file,
        legenda: '',
      });
    }

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
    const existing: CaptionItem[] = (this.existingMedias ?? []).map((ph) => ({
      kind: 'existing',
      id: ph.id,
      src: this.imgUrl(ph.media),
      value: ph.legenda ?? '',
      type: ph.type,
    }));

    const news: CaptionItem[] = this.previews.map((p) => ({
      kind: 'new',
      uid: p.uid,
      src: p.url,
      file: p.file,
      value: p.legenda ?? '',
      type: p.type,
    }));

    this.captionItems = [...existing, ...news];
  }

  nextOrSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // aucune photo (ni existante, ni nouvelle) => save direct
    if (this.existingMedias.length === 0 && this.selectedFiles.length === 0) {
      this.saveFinal();
      return;
    }

    // si nouvelles photos => aligner legends
    if (this.selectedFiles.length > 0 && this.legends.length !== this.selectedFiles.length) {
      this.legends = this.selectedFiles.map(() => '');
    }

    this.buildCaptionItems();
    this.captionModalOpen = true;
    this.modalOpen = false;
  }

  closeCaptionModal() {
    this.captionModalOpen = false;
    this.modalOpen = true;
  }

  saveFinal() {
    if (this.form.invalid) return;

    const existingLegendUpdates = this.captionItems
      .filter((x): x is Extract<CaptionItem, { kind: 'existing' }> => x.kind === 'existing')
      .map((x) => ({
        id: x.id,
        legenda: x.value,
      }));

    const legends = this.captionItems
      .filter((x): x is Extract<CaptionItem, { kind: 'new' }> => x.kind === 'new')
      .map((x) => x.value);

    // const files = this.previews.map((p) => p.file);

    const payload = {
      ...this.form.getRawValue(),

      photos: this.selectedFiles,
      photoPrincipaleIndex: this.mainIndex,

      legenda: legends,

      existingMainUrl: this.existingMainUrl,
      existingLegendUpdates: JSON.stringify(existingLegendUpdates),
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
    this.api.deletePhoto(travauxId, photoId).subscribe({
      next: () => {
        // retire immédiatement du tableau affiché
        this.existingMedias = this.existingMedias.filter((p) => p.id !== photoId);

        // retire aussi du travail courant
        if (this.current) {
          this.current.medias = this.current.medias.filter((p) => p.id !== photoId);
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  confirmRemove(ph: TravauxMedia) {
    if (!confirm('Supprimer cette photo ?')) return;
    this.removePhoto(this.current!.id, ph.id);
  }

  removeNewPhoto(i: number) {
    const preview = this.previews[i];

    if (preview?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url);
    }

    this.selectedFiles.splice(i, 1);
    this.previews.splice(i, 1);
    this.mediaTypes.splice(i, 1);
    this.legends.splice(i, 1);

    if (this.mainIndex > i) {
      this.mainIndex--;
    }

    if (this.mainIndex >= this.previews.length) {
      this.mainIndex = 0;
    }
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
