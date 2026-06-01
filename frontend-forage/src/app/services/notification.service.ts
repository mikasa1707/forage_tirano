import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ContactService } from './contact.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private unreadCountSubject = new BehaviorSubject<number>(0);

  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private contactService: ContactService,
    private http: HttpClient
  ) { }

  loadUnreadCount() {
  this.http.get<number>(`${environment.api}/contact/unread-count`)
    .subscribe(count => {
      this.unreadCountSubject.next(count);
    console.log('NEW COUNT FROM API:', count);
    });
}
}