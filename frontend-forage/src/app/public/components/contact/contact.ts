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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required]],
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
        this.form.reset();
      },
      error: (err) => {
        this.sending = false;
        this.errorMsg = err?.error?.message ?? "Erreur lors de l'envoi";
      },
    });
  }
}