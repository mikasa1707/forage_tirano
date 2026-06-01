import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ContactService } from '../../../services/contact.service';
import { interval, Subject, switchMap, takeUntil } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { SocketService } from '../../../services/socket.service';

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {

  @Output() toggleMenu = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();

  unreadMessagesCount = 0;

  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  constructor(
    private notif: NotificationService,
    private socket: SocketService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    this.notif.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadMessagesCount = count;
        this.cdr.detectChanges();
      });

    this.notif.loadUnreadCount();

    this.socket.onNewMessage(() => {

      this.notif.loadUnreadCount();

      if (
        isPlatformBrowser(this.platformId) &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification('Nouveau message reçu');
      }

    });
    if (isPlatformBrowser(this.platformId)) {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    }
  }

  ngOnDestroy() {
    this.socket.offNewMessage();
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToMessages() {
    this.router.navigate(['/admin/contact']);
  }
}