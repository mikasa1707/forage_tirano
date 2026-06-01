import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
    { label: '📅 Prise de rendez-vous', value: 'Prise de rendez-vous' },
    { label: '⚠️ Réclamation', value: 'Réclamation' },
    { label: '🛠️ Support technique', value: 'Support technique' },
    { label: '🤝 Partenariat', value: 'Partenariat' },
    { label: '✍️ Autre demande', value: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      sujet: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\s]{8,15}$/)]],
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
        if (this.sent) {
          setTimeout(() => this.sent = false, 3000);
        }
        this.form.reset();
      },
      error: (err) => {
        this.sending = false;
        this.errorMsg = err?.error?.message ?? "Erreur lors de l'envoi";
      },
    });
  }

  onSujetChange(): void {
    const sujet = this.form.get('sujet')?.value;

    const templates: any = {
      'Demande de devis': `Bonjour,

Je souhaite obtenir un devis concernant vos services.

Merci de me communiquer vos tarifs et conditions.

Cordialement.`,

      'Demande de renseignement': `Bonjour,

Je souhaite obtenir davantage d'informations concernant vos prestations.

Merci d'avance pour votre retour.

Cordialement.`,

      'Prise de rendez-vous': `Bonjour,

Je souhaite prendre un rendez-vous.

Merci de me proposer vos disponibilités.

Cordialement.`,

      'Réclamation': `Bonjour,

Je souhaite vous faire part d'une réclamation concernant un service.

Merci de bien vouloir étudier ma demande.

Cordialement.`,

      'Support technique': `Bonjour,

Je rencontre un problème technique et sollicite votre assistance.

Merci de votre aide.

Cordialement.`,

      'Partenariat': `Bonjour,

Je souhaiterais échanger avec vous concernant une éventuelle collaboration.

Dans l'attente de votre retour.

Cordialement.`
    };

    if (templates[sujet]) {
      this.form.patchValue({
        message: templates[sujet]
      });
    }
  }
}