import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Equipe } from '../../../models/equipe.model';
import { EquipesService } from '../../../services/equipes.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipes.html',
  styleUrls: ['./equipes.scss'],
})
export class Equipes implements OnInit {
  equipes: Equipe[] = [];
  equipes$: any;
  selectedEquipe: Equipe | null = null;
  apiUrl = environment.api;
  photoPreviewUrl: string = '';
  loading = false;

  form: FormGroup;

  isEditMode = false;
  isAdmin = false; // à brancher sur ton auth
  selectedFile: File | null = null;

  originalData: any = null;

  constructor(
    private equipesService: EquipesService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      nom: [{ value: '', disabled: true }, Validators.required],
      description: [{ value: '', disabled: true }],
      photo: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.loadEquipes();
  }

  loadEquipes(): void {
    this.loading = true;
    this.equipesService.list().subscribe({
      next: (data) => {
        this.equipes = data ?? [];
        this.equipes$ = this.equipesService.list();
        this.cdr.markForCheck(); // ✅ déclenche un refresh pour OnPush
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  /* =======================
     SÉLECTION TABLE
     ======================= */
  selectEquipe(equipe: Equipe, event: MouseEvent) {
    event.stopPropagation();

    this.selectedEquipe = equipe;
    this.originalData = { ...equipe };

    this.photoPreviewUrl = equipe.photo ? `${this.apiUrl}${equipe.photo}` : '';

    this.form.patchValue({
      nom: equipe.nom,
      fonction: equipe.description, // ✅ si ton modèle a bien "fonction"
      description: equipe.description || '',
      // ❌ ne pas patcher "photo" (input file non patchable)
    });

    this.form.disable();
    this.isEditMode = false;
    this.selectedFile = null;
  }

  /* =======================
     DRAWER
     ======================= */
  closeDrawer() {
    this.selectedEquipe = null;
    this.isEditMode = false;
    this.form.reset();
  }

  /* =======================
     MODES
     ======================= */
  enableEdit() {
    this.form.enable();
    this.isEditMode = true;
  }

  cancelEdit() {
    if (this.originalData) {
      this.form.patchValue({
        nom: this.originalData.nom,
        fonction: this.originalData.fonction,
        description: this.originalData.description || '',
        photo: this.apiUrl + this.originalData.photo || '',
      });
    }

    this.form.disable();
    this.isEditMode = false;
    this.selectedFile = null;
  }

  /* =======================
     FICHIER
     ======================= */
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];
    this.form.patchValue({ photo: this.selectedFile.name });
  }

  /* =======================
     SAUVEGARDE
     ======================= */
  save() {
    if (this.form.invalid) return;

    const formData = new FormData();
    formData.append('nom', this.form.value.nom);
    formData.append('fonction', this.form.value.fonction);
    formData.append('description', this.form.value.description || '');

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile); // 👈 clé correcte
    }

    if (this.selectedEquipe?.id) {
      // UPDATE
      this.equipesService.update(this.selectedEquipe.id, formData).subscribe((updatedEquipe) => {
        this.selectedEquipe = updatedEquipe;
        if (updatedEquipe.photo) {
          this.photoPreviewUrl = this.apiUrl + updatedEquipe.photo;
        }
        this.loadEquipes();
        this.isEditMode = false;
        this.form.disable();
      });
    } else {
      // CREATE
      this.equipesService.create(formData).subscribe((updatedEquipe) => {
        this.selectedEquipe = updatedEquipe;
        if (updatedEquipe.photo) {
          this.photoPreviewUrl = this.apiUrl + updatedEquipe.photo;
        }
        this.loadEquipes();
        this.isEditMode = false;
        this.form.disable();
      });
    }
  }

  /* =======================
     AJOUT
     ======================= */
  addNew() {
    this.selectedEquipe = {} as Equipe;
    this.originalData = null;

    this.photoPreviewUrl = '';

    this.form.reset();
    this.form.enable();
    this.isEditMode = true;
  }

  /* =======================
     SUPPRESSION
     ======================= */
  delete(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette équipe ?')) {
      return;
    }

    this.equipesService.delete(id).subscribe(() => {
      if (this.selectedEquipe?.id === id) {
        this.selectedEquipe = null;
        this.photoPreviewUrl = '';
        this.form.reset();
        this.form.disable();
      }

      this.loadEquipes();
    });
  }


}
