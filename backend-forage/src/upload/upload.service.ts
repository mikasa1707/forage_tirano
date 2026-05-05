import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  saveTravauxPhotos(
    travauxId: number,
    photos: { filename: string; path: string }[],
  ) {
    // ici tu appelles ton TravauxService pour sauvegarder en DB
    // exemple : this.travauxService.addPhotos(travauxId, photos)
    return { travauxId, photos };
  }

  saveEquipePhoto(equipeId: number, photo: { filename: string; path: string }) {
    // ici tu appelles ton EquipesService pour sauvegarder en DB
    // exemple : this.equipesService.updatePhoto(equipeId, photo)
    return { equipeId, photo };
  }
}
