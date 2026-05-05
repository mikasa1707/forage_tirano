import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Travaux } from './entities/travaux.entities';
import { TravauxPhoto } from './entities/travaux-photo.entity';
import { CreateTravauxDto } from './create-travaux.dto';
import { UpdateTravauxDto } from './update-travaux.dto';
import { Equipe } from '../equipes/entities/equipe.entity';
type ExistingLegendUpdate = { id: number; legenda: string };

@Injectable()
export class TravauxService {
  constructor(
    @InjectRepository(Travaux)
    private readonly travauxRepo: Repository<Travaux>,
    @InjectRepository(TravauxPhoto)
    private readonly photoRepo: Repository<TravauxPhoto>,
    @InjectRepository(Equipe) private readonly equipeRepo: Repository<Equipe>,
  ) {}

  findAll() {
    return this.travauxRepo.find({
      relations: ['photos'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const t = await this.travauxRepo.findOne({
      where: { id },
      relations: ['photos'],
    });
    if (!t) throw new NotFoundException('Travaux introuvable');
    return t;
  }

  private toPublicUrl(file: Express.Multer.File) {
    // correspond à app.useStaticAssets(prefix: '/uploads/')
    return `/uploads/travaux/${file.filename}`;
  }

  async create(dto: CreateTravauxDto, files: Express.Multer.File[]) {
    const travaux = this.travauxRepo.create({
      titre: dto.titre,
      description: dto.description,
      status: dto.status ?? 'planifie',
      date_debut: dto.date_debut,
      date_fin: dto.date_fin,
      localisation: dto.localisation,
    });

    if (dto.equipe_id) {
      const equipe = await this.equipeRepo.findOne({
        where: { id: Number(dto.equipe_id) },
      });
      travaux.equipe = equipe ?? null;
    }

    const saved = await this.travauxRepo.save(travaux);

    // enregistrer les photos
    const photos = files.map((f) =>
      this.photoRepo.create({ travaux: saved, image: this.toPublicUrl(f) }),
    );
    const savedPhotos = await this.photoRepo.save(photos);

    // photo principale: par index choisi
    const idx = dto.photoPrincipaleIndex ? Number(dto.photoPrincipaleIndex) : 0;
    if (savedPhotos.length > 0) {
      const main =
        savedPhotos[Math.max(0, Math.min(idx, savedPhotos.length - 1))];
      saved.photo_principale = main.image;
      await this.travauxRepo.save(saved);
    }

    return this.findOne(saved.id);
  }

  async update(
    id: number,
    dto: UpdateTravauxDto,
    files: Express.Multer.File[],
  ) {
    const travaux = await this.findOne(id);

    if (dto.titre !== undefined) travaux.titre = dto.titre;
    if (dto.description !== undefined) travaux.description = dto.description;
    if (dto.status !== undefined) travaux.status = dto.status;
    if (dto.date_debut !== undefined) travaux.date_debut = dto.date_debut;
    if (dto.date_fin !== undefined) travaux.date_fin = dto.date_fin;
    if (dto.localisation !== undefined) travaux.localisation = dto.localisation;

    if (dto.equipe_id !== undefined) {
      const equipe = dto.equipe_id
        ? await this.equipeRepo.findOne({
            where: { id: Number(dto.equipe_id) },
          })
        : null;
      travaux.equipe = equipe ?? null;
    }

    // ✅ principale existante
    if (dto.existingMainUrl) {
      travaux.photo_principale = dto.existingMainUrl;
    }

    await this.travauxRepo.save(travaux);

    // ✅ 1) MAJ légendes EXISTANTES
    if (dto.existingLegendUpdates?.trim()) {
      let updates: ExistingLegendUpdate[] = [];

      try {
        const parsed: unknown = JSON.parse(dto.existingLegendUpdates);

        if (Array.isArray(parsed)) {
          updates = parsed.filter((u): u is ExistingLegendUpdate => {
            if (typeof u !== 'object' || u === null) return false;
            const r = u as Record<string, unknown>;
            return typeof r.id === 'number' && typeof r.legenda === 'string';
          });
        }
      } catch {
        updates = [];
      }

      for (const u of updates) {
        // ✅ si TravauxPhoto a une relation "travaux: Travaux"
        await this.photoRepo.update(
          { id: u.id, travaux: { id } }, // 👈 plus de any
          { legenda: u.legenda },
        );
      }
    }

    // ✅ 2) Ajouter nouvelles photos + legends
    const legends: string[] = Array.isArray(dto.legends)
      ? dto.legends
      : typeof dto.legends === 'string'
        ? [dto.legends]
        : [];

    if (files.length > 0) {
      const newPhotos = await this.photoRepo.save(
        files.map((f, i) =>
          this.photoRepo.create({
            travaux,
            image: this.toPublicUrl(f),
            legenda: legends[i] ?? null,
          }),
        ),
      );

      if (dto.photoPrincipaleIndex !== undefined) {
        const idx = Number(dto.photoPrincipaleIndex);
        const main =
          newPhotos[Math.max(0, Math.min(idx, newPhotos.length - 1))];
        travaux.photo_principale = main.image;
        await this.travauxRepo.save(travaux);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const t = await this.travauxRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Travaux introuvable');
    await this.travauxRepo.delete(id);
    return { ok: true };
  }

  async removePhoto(travauxId: number, photoId: number) {
    const t = await this.findOne(travauxId);
    const photo = t.photos.find((p) => p.id === photoId);
    if (!photo) throw new NotFoundException('Photo introuvable');

    await this.photoRepo.delete(photoId);

    // si on a supprimé la principale, on prend la première restante
    if (t.photo_principale === photo.image) {
      const refreshed = await this.findOne(travauxId);
      const fallback = refreshed.photos[0]?.image ?? null;
      await this.travauxRepo.update(travauxId, { photo_principale: fallback });
    }

    return this.findOne(travauxId);
  }
}
