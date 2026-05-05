import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { travauxMulterConfig, equipesMulterConfig } from './multer.config';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // === Travaux (plusieurs photos) ===
  @Post('travaux/:id/photos')
  @UseInterceptors(FilesInterceptor('images', 10, travauxMulterConfig))
  uploadTravauxPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const photos = files.map((f) => ({
      filename: f.filename,
      path: `/uploads/travaux/${f.filename}`,
    }));

    return this.uploadService.saveTravauxPhotos(Number(id), photos);
  }

  // === Equipes (photo profil) ===
  @Post('equipes/:id/photo')
  @UseInterceptors(FileInterceptor('photo', equipesMulterConfig))
  uploadEquipePhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Photo de profil requise');
    }

    const photo = {
      filename: file.filename,
      path: `/uploads/equipes/${file.filename}`,
    };

    return this.uploadService.saveEquipePhoto(Number(id), photo);
  }
}
