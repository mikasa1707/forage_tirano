import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {

  apiUrl = environment.api;

  sending = false;
  sent = false;
  errorMsg = '';

  form!: FormGroup;

  sujets = [
    { label: '📋 Demande de devis', value: 'Demande de devis' },
    { label: 'ℹ️ Demande de renseignement', value: 'Demande de renseignement' },
    { label: '📅 Rendez-vous', value: 'Prise de rendez-vous' },
    { label: '⚠️ Réclamation', value: 'Réclamation' },
    { label: '🛠️ Support technique', value: 'Support technique' },
    { label: '🤝 Partenariat', value: 'Partenariat' },
    { label: '✍️ Autre', value: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      sujet: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^(034|033|032|038)\s?\d{2}\s?\d{3}\s?\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  send() {
    this.sent = false;
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending = true;

    this.http.post(`${this.apiUrl}/contact`, this.form.value).subscribe({
      next: () => {
        this.sending = false;
        this.sent = true;

        this.showSuccess();
        this.form.reset();
      },
      error: (err) => {
        this.sending = false;
        this.errorMsg = err?.error?.message || "Erreur d'envoi";

      this.showError(err?.error?.message || "Erreur lors de l'envoi");
      }
    });
  }

  onSujetChange() {
    const sujet = this.form.get('sujet')?.value;

    const templates: any = {
      'Demande de devis': `Bonjour,\nJe souhaite un devis.\nMerci.`,
      'Demande de renseignement': `Bonjour,\nJe souhaite des informations.\nMerci.`,
      'Prise de rendez-vous': `Bonjour,\nJe veux un rendez-vous.\nMerci.`,
      'Réclamation': `Bonjour,\nRéclamation.\nMerci.`,
      'Support technique': `Bonjour,\nProblème technique.\nMerci.`,
      'Partenariat': `Bonjour,\nCollaboration.\nMerci.`
    };

    if (templates[sujet]) {
      this.form.patchValue({
        message: templates[sujet]
      });
    }
  }

  showSuccess() {
    this.sent = true;

    setTimeout(() => {
      this.sent = false;
    }, 3000);
  }

  showError(msg: string) {
    this.errorMsg = msg;

    setTimeout(() => {
      this.errorMsg = '';
    }, 4000);
  }
}