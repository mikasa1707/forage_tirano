import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.api}`;

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.api}/auth/login`, {
      username,
      password,
    });
  }

  // 🔥 SAVE USER + TOKEN
  saveAuth(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // 🔥 GET USER
  getUser(): any {
    if (!this.isBrowser()) return null;

    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  // 🔥 GET ROLE
  getRole(): string {
    return this.getUser()?.role;
  }

  // 🔥 CHECK LOGIN
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 🔥 ROLE CHECK SIMPLE
  hasRole(roles: string[]): boolean {
    return roles.includes(this.getRole());
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}