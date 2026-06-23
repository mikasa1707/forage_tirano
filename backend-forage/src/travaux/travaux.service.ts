import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../json-storage.service';
import { Travaux, TravauxMedia } from './travaux.interface';
import * as path from 'path';
import { CreateTravauxDto } from './create-travaux.dto';
import { UpdateTravauxDto } from './update-travaux.dto';

type PhotoUpdate = { id: number; legenda: string };
type HasId = {
  id: number;
};
// type Photo = {
//   image: string;
// };

// type Item = {
//   photos: Photo[];
//   photo_principale?: string;
// };

@Injectable()
export class TravauxService {
  private file = path.join(process.cwd(), 'data/travaux.json');

  constructor(private storage: JsonStorageService<Travaux>) {}

  async findAll() {
    const data = await this.storage.read(this.file);

    return data.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  async findOne(id: number) {
    const data = await this.findAll();
    const t = data.find((x) => x.id === id);

    if (!t) throw new NotFoundException('Travaux introuvable');
    return t;
  }

  private newId(list: HasId[]): number {
    return list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1;
  }

  private newPhotoId(travaux: Travaux) {
    const all = travaux.medias ?? [];
    return all.length ? Math.max(...all.map((p) => p.id)) + 1 : 1;
  }

  private parseLegends(value: unknown): string[] {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.filter((x): x is string => typeof x === 'string');
    }

    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed.filter((x): x is string => typeof x === 'string');
        }

        return [value];
      } catch {
        return [value];
      }
    }

    return [];
  }

  async create(dto: CreateTravauxDto, files: Express.Multer.File[]) {
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

      medias: [],

      created_at: new Date().toISOString(),
    };

    // images upload
    const legends = this.parseLegends(dto.legends);

    newItem.medias = files.map((f, i) => ({
      id: Date.now() + i, // ✔ simple safe
      media: `/uploads/travaux/${f.filename}`,
      type: f.mimetype.startsWith('video/') ? 'video' : 'image',
      legenda: legends[i] ?? undefined,
    }));

    // main photo
    const idx = dto.photoPrincipaleIndex ? Number(dto.photoPrincipaleIndex) : 0;

    if (newItem.medias.length > 0) {
      const safeIndex = Math.max(0, Math.min(idx, newItem.medias.length - 1));
      newItem.photo_principale = newItem.medias[safeIndex].media;
    }

    data.push(newItem);

    await this.storage.write(this.file, data);

    return newItem;
  }

  async update(
    id: number,
    dto: UpdateTravauxDto,
    files: Express.Multer.File[],
  ) {
    const data = await this.findAll();

    const index = data.findIndex((t) => t.id === id);
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

    // update légendes existantess
    if (dto.existingLegendUpdates) {
      try {
        const updates: PhotoUpdate[] = JSON.parse(
          dto.existingLegendUpdates ?? '[]',
        ) as PhotoUpdate[];

        for (const u of updates) {
          const photo = t.medias.find((p) => p.id === u.id);
          if (photo) photo.legenda = u.legenda;
        }
      } catch {
        /* empty */
      }
    }

    // nouvelles photos
    const legends = this.parseLegends(dto.legends);
    console.log(dto);
    if (files.length > 0) {
      let nextPhotoId =
        t.medias.length > 0 ? Math.max(...t.medias.map((m) => m.id)) + 1 : 1;

      const newPhotos: TravauxMedia[] = files.map((f, i) => ({
        id: nextPhotoId++,
        media: `/uploads/travaux/${f.filename}`,
        image: `/uploads/travaux/${f.filename}`,
        type: f.mimetype.startsWith('video/') ? 'video' : 'image',
        legenda: legends[i] ?? '',
      }));

      t.medias.push(...newPhotos);
    }

    data[index] = t;

    await this.storage.write(this.file, data);

    return t;
  }

  async remove(id: number) {
    let data = await this.findAll();

    data = data.filter((t) => t.id !== id);

    await this.storage.write(this.file, data);

    return { ok: true };
  }

  async removePhoto(travauxId: number, photoId: number) {
    const data = await this.findAll();

    const t = data.find((x) => x.id === travauxId);
    if (!t) throw new NotFoundException();

    const photo = t.medias.find((p) => p.id === photoId);
    if (!photo) throw new NotFoundException();

    t.medias = t.medias.filter((p) => p.id !== photoId);

    // si main supprimée
    if (t.photo_principale === photo.media) {
      t.photo_principale = t.medias[0]?.media ?? undefined;
    }

    await this.storage.write(this.file, data);

    return t;
  }

  async findByStatus(status: string) {
    const data = await this.findAll();
    return data.filter((t) => t.status === status);
  }
}
