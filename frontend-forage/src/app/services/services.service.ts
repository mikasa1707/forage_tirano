import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceItem {
  id: number;
  titre: string;
  description: string;
  image: string;
  is_active?: number;
}

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private _service = `${environment.api}/services`;

  constructor(private http: HttpClient) { }

  // 🔓 PUBLIC
  getPublic(): Observable<ServiceItem[]> {
    return this.http.get<any[]>(this._service).pipe(
      map((rows) =>
        (rows ?? []).map((r) => ({
          id: r.id,
          titre: r.titre,
          description: r.description,
          image: r.image,
          is_active: r.is_active,
        })),
      ),
    );
  }

  // 🔐 ADMIN
  getAll(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this._service}/admin`);
  }

  // ✅ JSON (si besoin)
  create(data: Partial<ServiceItem>) {
    return this.http.post(this._service, {
      titre: data.titre,
      description: data.description,
      image: data.image,
      is_active: 1,
    });
  }

  // ✅ UPLOAD (FormData)
  createForm(fd: FormData) {
    return this.http.post(this._service, fd);
  }

  toggleActive(id: number, active: number) {
    return this.http.patch(`${this._service}/${id}/active/${active}`, {});
  }

  delete(id: number) {
    return this.http.delete(`${this._service}/${id}`);
  }

  update(id: number, data: Partial<ServiceItem>, file?: File) {
    const fd = new FormData();

    fd.append('titre', data.titre ?? '');
    fd.append('description', data.description ?? '');
    fd.append('is_active', '1');

    if (file) {
      fd.append('image', file);
    }

    return this.http.patch(`${this._service}/${id}`, fd);
  }
}
