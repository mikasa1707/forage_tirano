import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { travauxMulterConfig } from '../upload/multer.config';
import { TravauxService } from './travaux.service';
import { CreateTravauxDto } from './create-travaux.dto';
import { UpdateTravauxDto } from './update-travaux.dto';

@Controller('travaux')
export class TravauxController {
  constructor(private readonly service: TravauxService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Création avec upload multiple
  @Post()
  @UseInterceptors(FilesInterceptor('photos', 20, travauxMulterConfig))
  create(
    @Body() dto: CreateTravauxDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.service.create(dto, files ?? []);
  }

  // Update (peut ajouter de nouvelles photos)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('photos', 20, travauxMulterConfig))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTravauxDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.service.update(id, dto, files ?? []);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // Suppression d’une photo
  @Delete(':id/photos/:photoId')
  removePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.service.removePhoto(id, photoId);
  }
}
