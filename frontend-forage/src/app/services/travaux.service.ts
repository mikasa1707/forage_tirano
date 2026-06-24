import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TravauxModel, TravauxMedia } from '../models/travaux.model';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TravauxApi {
  private base = `${environment.api}/travaux`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ✅ Méthode list : retourne des données mock si prérendu
  list(): Observable<TravauxModel[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]); // Retourne un tableau vide pendant le prérendu
    }
    return this.http.get<TravauxModel[]>(this.base);
  }

  // ✅ Méthode get : retourne null si prérendu
  get(id: number): Observable<TravauxModel | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.get<TravauxModel>(`${this.base}/${id}`);
  }

  // ✅ Méthode create : ne fait rien pendant le prérendu
  create(payload: any): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null); // Évite l'erreur FormData pendant le prérendu
    }
    const fd = this.toFormData(payload);
    return this.http.post(`${this.base}/`, fd);
  }

  // ✅ Méthode update : ne fait rien pendant le prérendu
  update(id: number, payload: any): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    const fd = this.toFormData(payload);
    return this.http.patch(`${this.base}/${id}`, fd);
  }

  // ✅ Méthode delete : ne fait rien pendant le prérendu
  delete(id: number): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.delete(`${this.base}/${id}`);
  }

  // ✅ Méthode deletePhoto : ne fait rien pendant le prérendu
  deletePhoto(travauxId: number, photoId: number): Observable<TravauxModel | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.delete<TravauxModel>(`${this.base}/${travauxId}/photos/${photoId}`);
  }

  // ✅ Méthode photos : retourne un tableau vide pendant le prérendu
  photos(travauxId: number): Observable<TravauxMedia[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    return this.http.get<TravauxMedia[]>(`${this.base}/${travauxId}/photos`);
  }

  // ✅ Méthode toFormData : ne s'exécute que côté client
  private toFormData(p: any): FormData {
    const fd = new FormData();
    fd.append('titre', p.titre ?? '');
    fd.append('description', p.description ?? '');
    fd.append('status', p.status ?? 'planifie');
    fd.append('date_debut', p.date_debut ?? '');
    fd.append('date_fin', p.date_fin ?? '');
    fd.append('localisation', p.localisation ?? '');
    if (p.equipe_id != null) fd.append('equipe_id', String(p.equipe_id));

    fd.append('photoPrincipaleIndex', String(p.photoPrincipaleIndex ?? 0));
    if (p.existingMainUrl) fd.append('existingMainUrl', p.existingMainUrl);

    (p.photos ?? []).forEach((file: File) => fd.append('photos', file));
    fd.append('legends', JSON.stringify(p.legenda ?? []));

    if (p.existingLegendUpdates) {
      fd.append('existingLegendUpdates', p.existingLegendUpdates);
    }

    return fd;
  }
}