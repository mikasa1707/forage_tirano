import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../json-storage.service';
import { Travaux } from './travaux.interface';
import * as path from 'path';

type PhotoUpdate = { id: number; legenda: string };

@Injectable()
export class TravauxService {
  private file = path.join(process.cwd(), 'data/travaux.json');

  constructor(private storage: JsonStorageService<Travaux>) {}

  async findAll() {
    const data = await this.storage.read(this.file);

    return data.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    );
  }

  async findOne(id: number) {
    const data = await this.findAll();
    const t = data.find(x => x.id === id);

    if (!t) throw new NotFoundException('Travaux introuvable');
    return t;
  }

  private newId(list: any[]) {
    return list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
  }

  private newPhotoId(travaux: Travaux) {
    const all = travaux.photos ?? [];
    return all.length ? Math.max(...all.map(p => p.id)) + 1 : 1;
  }

  async create(dto: any, files: Express.Multer.File[]) {
    const data = await this.findAll();

    const newItem: Travaux = {
      id: this.newId(data),

      titre: dto.titre,
      description: dto.description,

      status: dto.status ?? 'planifie',

      date_debut: dto.date_debut,
      date_fin: dto.date_fin,

      localisation: dto.localisation,

      equipe_id: dto.equipe_id ? Number(dto.equipe_id) : undefined,

      photo_principale: undefined,

      photos: [],

      created_at: new Date().toISOString(),
    };

    // images upload
    const legends: string[] = Array.isArray(dto.legends)
      ? dto.legends
      : typeof dto.legends === 'string'
        ? [dto.legends]
        : [];

    newItem.photos = files.map((f, i) => ({
      id: this.newPhotoId(newItem),
      image: `/uploads/travaux/${f.filename}`,
      legenda: legends[i] ?? undefined,
    }));

    // main photo
    const idx = dto.photoPrincipaleIndex ? Number(dto.photoPrincipaleIndex) : 0;

    if (newItem.photos.length > 0) {
      newItem.photo_principale =
        newItem.photos[Math.max(0, Math.min(idx, newItem.photos.length - 1))].image;
    }

    data.push(newItem);

    await this.storage.write(this.file, data);

    return newItem;
  }

  async update(id: number, dto: any, files: Express.Multer.File[]) {
    const data = await this.findAll();

    const index = data.findIndex(t => t.id === id);
    if (index === -1) throw new NotFoundException('Travaux introuvable');

    const t = data[index];

    // update champs simples
    Object.assign(t, {
      titre: dto.titre ?? t.titre,
      description: dto.description ?? t.description,
      status: dto.status ?? t.status,
      date_debut: dto.date_debut ?? t.date_debut,
      date_fin: dto.date_fin ?? t.date_fin,
      localisation: dto.localisation ?? t.localisation,
    });

    // équipe
    if (dto.equipe_id !== undefined) {
      t.equipe_id = dto.equipe_id ? Number(dto.equipe_id) : undefined;
    }

    // update image principale existante
    if (dto.existingMainUrl) {
      t.photo_principale = dto.existingMainUrl;
    }

    // update légendes existantes
    if (dto.existingLegendUpdates) {
      try {
        const updates: PhotoUpdate[] = JSON.parse(dto.existingLegendUpdates);

        for (const u of updates) {
          const photo = t.photos.find(p => p.id === u.id);
          if (photo) photo.legenda = u.legenda;
        }
      } catch {}
    }

    // nouvelles photos
    const legends: string[] = Array.isArray(dto.legends)
      ? dto.legends
      : typeof dto.legends === 'string'
        ? [dto.legends]
        : [];

    if (files.length > 0) {
      const newPhotos = files.map((f, i) => ({
        id: this.newPhotoId(t),
        image: `/uploads/travaux/${f.filename}`,
        legenda: legends[i] ?? undefined,
      }));

      t.photos.push(...newPhotos);

      // update main photo si demandé
      if (dto.photoPrincipaleIndex !== undefined) {
        const idx = Number(dto.photoPrincipaleIndex);

        const main =
          t.photos[Math.max(0, Math.min(idx, t.photos.length - 1))];

        t.photo_principale = main.image;
      }
    }

    data[index] = t;

    await this.storage.write(this.file, data);

    return t;
  }

  async remove(id: number) {
    let data = await this.findAll();

    data = data.filter(t => t.id !== id);

    await this.storage.write(this.file, data);

    return { ok: true };
  }

  async removePhoto(travauxId: number, photoId: number) {
    const data = await this.findAll();

    const t = data.find(x => x.id === travauxId);
    if (!t) throw new NotFoundException();

    const photo = t.photos.find(p => p.id === photoId);
    if (!photo) throw new NotFoundException();

    t.photos = t.photos.filter(p => p.id !== photoId);

    // si main supprimée
    if (t.photo_principale === photo.image) {
      t.photo_principale = t.photos[0]?.image ?? undefined;
    }

    await this.storage.write(this.file, data);

    return t;
  }

  async findByStatus(status: string) {
    const data = await this.findAll();
    return data.filter(t => t.status === status);
  }
}