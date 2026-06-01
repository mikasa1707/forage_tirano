import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.api}`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.api}/auth/login`, {
      username,
      password,
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}