import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TravauxModel, TravauxMedia } from '../models/travaux.model';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return this.http.get<TravauxModel[]>(this.base, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Méthode get : retourne null si prérendu
  get(id: number): Observable<TravauxModel | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.get<TravauxModel>(`${this.base}/${id}`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Méthode create : ne fait rien pendant le prérendu
  create(payload: any): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    const fd = this.toFormData(payload);
    return this.http.post(`${this.base}/`, fd, {
      withCredentials: true,
      // ✅ Pas de Content-Type pour FormData (le navigateur le définit automatiquement)
    }).pipe(catchError(this.handleError));
  }

  // ✅ Méthode update : ne fait rien pendant le prérendu
  update(id: number, payload: any): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    const fd = this.toFormData(payload);
    return this.http.patch(`${this.base}/${id}`, fd, {
      withCredentials: true,
    }).pipe(catchError(this.handleError));
  }

  // ✅ Méthode delete : ne fait rien pendant le prérendu
  delete(id: number): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.delete(`${this.base}/${id}`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Méthode deletePhoto : ne fait rien pendant le prérendu
  deletePhoto(travauxId: number, photoId: number): Observable<TravauxModel | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.delete<TravauxModel>(`${this.base}/${travauxId}/photos/${photoId}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleError));
  }

  // ✅ Méthode photos : retourne un tableau vide pendant le prérendu
  photos(travauxId: number): Observable<TravauxMedia[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    return this.http.get<TravauxMedia[]>(`${this.base}/${travauxId}/photos`, {
      withCredentials: true,
    }).pipe(catchError(this.handleError));
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

    // ✅ Gestion sécurisée des fichiers
    (p.photos ?? []).forEach((file: File) => {
      if (file instanceof File) {
        fd.append('photos', file);
      }
    });

    // ✅ Gestion sécurisée des légendes
    fd.append('legends', JSON.stringify(p.legenda ?? []));

    if (p.existingLegendUpdates) {
      fd.append('existingLegendUpdates', p.existingLegendUpdates);
    }

    return fd;
  }

  // ✅ Gestion centralisée des erreurs HTTP
  private handleError(error: any): Observable<never> {
    console.error('Erreur API:', error);
    return throwError(() => new Error('Une erreur est survenue. Veuillez réessayer plus tard.'));
  }
}