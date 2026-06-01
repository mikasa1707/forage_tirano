import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { ContactMessage, ContactService } from '../../../services/contact.service';
import { NotificationService } from '../../../services/notification.service';
import { SocketService } from '../../../services/socket.service';

declare var bootstrap: any;

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
  private platformId = inject(PLATFORM_ID);
  filterStatus: 'all' | 'nouveau' | 'lu' | 'traite' = 'all';

  messageSelected: any = {};

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef,
    private notif: NotificationService,
    private socket: SocketService,
  ) { }

  ngOnInit(): void {
    this.loadContacts();
  }

  get filteredContacts() {
    if (this.filterStatus === 'all') return this.contacts;

    return this.contacts.filter(c => c.status === this.filterStatus);
  }

  loadContacts(): void {
    this.loading = true;
    this.error = '';

    this.contactService.getAll().subscribe({
      next: (res) => {
        this.contacts = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Impossible de charger les messages';
        this.loading = false;
      },
    });
  }

  refresh() {
    this.loadContacts();
  }

  markAsRead(id: number): void {
    this.contactService.markAsRead(id).subscribe({
      next: (updated) => {
        this.contacts = this.contacts.map((item) => (item.id === updated.id ? updated : item));
        this.loadContacts();
      },
      error: () => {
        this.error = 'Impossible de marquer comme lu';
      },
    });
  }

  markAsTreat(id: number): void {
    this.contactService.markAsTreat(id).subscribe({
      next: (updated) => {
        this.contacts = this.contacts.map((item) => (item.id === updated.id ? updated : item));
        this.loadContacts();
      },
      error: () => {
        this.error = 'Impossible de marquer comme non lu';
      },
    });
  }

  openMessage(_message: any) {
    this.messageSelected = _message;
    if (_message.status === 'nouveau') {
      this.markAsRead(_message.id);

      this.socket.onMessageRead(() => {
        this.notif.loadUnreadCount();
      });
    }
    const modal = new bootstrap.Modal(
      document.getElementById('messageModal')
    );
    modal.show();
  }

  get countNouveau() {
    return this.contacts.filter(c => c.status === 'nouveau').length;
  }

  get countLu() {
    return this.contacts.filter(c => c.status === 'lu').length;
  }

  get countTraite() {
    return this.contacts.filter(c => c.status === 'traite').length;
  }
}
