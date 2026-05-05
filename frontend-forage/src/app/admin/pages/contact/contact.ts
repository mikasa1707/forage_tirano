import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContactMessage, ContactService } from '../../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
  contacts: ContactMessage[] = [];
  loading = false;
  error = '';

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.error = '';

    this.contactService.getAll().subscribe({
      next: (res) => {
        this.contacts = res;
        console.log(res);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Impossible de charger les messages';
        this.loading = false;
      },
    });
  }

  markAsRead(id: number): void {
    this.contactService.markAsRead(id).subscribe({
      next: (updated) => {
        this.contacts = this.contacts.map((item) => (item.id === updated.id ? updated : item));
      },
      error: () => {
        this.error = 'Impossible de marquer comme lu';
      },
    });
  }

  markAsUnread(id: number): void {
    this.contactService.markAsUnread(id).subscribe({
      next: (updated) => {
        this.contacts = this.contacts.map((item) => (item.id === updated.id ? updated : item));
      },
      error: () => {
        this.error = 'Impossible de marquer comme non lu';
      },
    });
  }
}
