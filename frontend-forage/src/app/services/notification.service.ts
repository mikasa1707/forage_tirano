import { Injectable, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  loadUnreadCount() {
    // Ne pas exécuter côté serveur
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.http.get<number>(`${environment.api}/contact/unread-count`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => {
        this.unreadCountSubject.next(count);
      });
  }
}