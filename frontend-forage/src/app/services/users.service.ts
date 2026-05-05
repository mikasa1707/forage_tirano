import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type AdminUser = {
  id: number;
  username: string;
  role: string;
};

type CreateUserPayload = {
  username: string;
  password: string;
  role: string;
};

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private readonly api = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.api}/users`);
  }

  create(payload: CreateUserPayload): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.api}/users`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${id}`);
  }
}