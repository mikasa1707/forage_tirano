import { Component, OnInit, OnDestroy, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactMessage, ContactService } from '../../../services/contact.service';
import { NotificationService } from '../../../services/notification.service';
import { SocketService } from '../../../services/socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
declare var bootstrap: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private contactService = inject(ContactService);
  private notif = inject(NotificationService);
  private socket = inject(SocketService);

  // 👇 Signaux pour les données
  contacts = signal<ContactMessage[]>([]);
  messageSelected = signal<ContactMessage | null>(null);
  loading = signal(false);
  error = signal('');
  filterStatus = signal<'all' | 'nouveau' | 'lu' | 'traite'>('all');

  // 👇 Compteurs réactifs (mis à jour automatiquement)
  countNouveau = computed(() => this.contacts().filter(c => c.status === 'nouveau').length);
  countLu = computed(() => this.contacts().filter(c => c.status === 'lu').length);
  countTraite = computed(() => this.contacts().filter(c => c.status === 'traite').length);

  // 👇 Contacts filtrés (réactif)
  filteredContacts = computed(() => {
    const currentFilter = this.filterStatus();
    const currentContacts = this.contacts();
    return currentFilter === 'all'
      ? currentContacts
      : currentContacts.filter(c => c.status === currentFilter);
  });

  // 👇 Callback pour les messages lus (via Socket)
  private messageReadHandler = () => {
    this.notif.loadUnreadCount();
    this.loadContacts();
  };

  constructor() { }

  ngOnInit(): void {
    this.loadContacts();
    this.socket.onMessageRead(this.messageReadHandler);
  }

  ngOnDestroy(): void {
    this.socket.offMessageRead(this.messageReadHandler);
  }

  // 👇 Charger les contacts
  loadContacts(): void {
    this.loading.set(true);
    this.error.set('');
    this.contactService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.contacts.set(res);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger les messages');
          this.loading.set(false);
        },
      });
  }

  // 👇 Ouvrir un message
  openMessage(msg: ContactMessage): void {
    this.messageSelected.set(msg);
    if (msg.status === 'nouveau') {
      this.markAsRead(msg.id);
    }
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    modal.show();
  }

  markAsRead(id: number): void {
    this.contactService.markAsRead(id).subscribe({
      next: (updated) => {
        this.contacts.update(contacts =>
          contacts.map(i => i.id === updated.id ? updated : i)
        );
        // ✅ Mettre à jour messageSelected si c'est le message ouvert
        const currentMsg = this.messageSelected();
        if (currentMsg?.id === updated.id) {
          this.messageSelected.set(updated);
        }
      },
    });
  }

  markAsTreat(id: number): void {
    this.contactService.markAsTreat(id).subscribe({
      next: (updated) => {
        this.contacts.update(contacts =>
          contacts.map(i => i.id === updated.id ? updated : i)
        );
        // ✅ Mettre à jour messageSelected si c'est le message ouvert
        const currentMsg = this.messageSelected();
        if (currentMsg?.id === updated.id) {
          this.messageSelected.set(updated);
        }
      },
    });
  }

  // 👇 Rafraîchir la liste
  refresh(): void {
    this.loadContacts();
  }
}