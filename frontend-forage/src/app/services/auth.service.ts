import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000';

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