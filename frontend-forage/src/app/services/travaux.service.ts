import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TravauxModel, TravauxMedia } from '../models/travaux.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TravauxApi {
  private base = `${environment.api}/travaux`; // adapte si besoin

  constructor(private http: HttpClient) {}

  list(): Observable<TravauxModel[]> {
    return this.http.get<TravauxModel[]>(this.base);
  }

  get(id: number): Observable<TravauxModel> {
    return this.http.get<TravauxModel>(`${this.base}/${id}`);
  }

  create(payload: any) {
    const fd = this.toFormData(payload);
    return this.http.post(`${this.base}/`, fd);
  }

  update(id: number, payload: any) {
    const fd = this.toFormData(payload);
    return this.http.patch(`${this.base}/${id}`, fd);
  }

  private toFormData(p: any): FormData {
    const fd = new FormData();

    // champs texte
    fd.append('titre', p.titre ?? '');
    fd.append('description', p.description ?? '');
    fd.append('status', p.status ?? 'planifie');
    fd.append('date_debut', p.date_debut ?? '');
    fd.append('date_fin', p.date_fin ?? '');
    fd.append('localisation', p.localisation ?? '');
    if (p.equipe_id != null) fd.append('equipe_id', String(p.equipe_id));

    // principale
    fd.append('photoPrincipaleIndex', String(p.photoPrincipaleIndex ?? 0));
    if (p.existingMainUrl) fd.append('existingMainUrl', p.existingMainUrl);

    // ✅ nouvelles photos
    (p.photos ?? []).forEach((file: File) => fd.append('photos', file));

    // ✅ legends alignées aux nouvelles photos
    (p.legends ?? []).forEach((txt: string) => fd.append('legenda', txt ?? ''));

    // ✅ si tu veux MAJ les legends existantes (optionnel)
    if (p.existingLegendUpdates) {
      fd.append('existingLegendUpdates', JSON.stringify(p.existingLegendUpdates));
    }

    return fd;
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  deletePhoto(travauxId: number, photoId: number) {
    return this.http.delete<TravauxModel>(`${this.base}/${travauxId}/photos/${photoId}`);
  }

  photos(travauxId: number): Observable<TravauxMedia[]> {
    return this.http.get<TravauxMedia[]>(`${this.base}/${travauxId}/photos`);
  }
}
