import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Equipe } from '../models/equipe.model';

@Injectable({ providedIn: 'root' })
export class EquipesService {
  private equipes = `${environment.api}/equipes`;

  constructor(private http: HttpClient) {}

  list(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(this.equipes);
  }

  get(id: number): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.equipes}/${id}`);
  }

  // ✅ CREATE avec ou sans fichier
  create(payload: FormData | Partial<Equipe>) {
    return this.http.post<Equipe>(this.equipes, payload);
  }

  // ✅ UPDATE avec ou sans fichier
  update(id: number, payload: FormData | Partial<Equipe>) {
    return this.http.put<Equipe>(`${this.equipes}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.equipes}/${id}`);
  }
}
