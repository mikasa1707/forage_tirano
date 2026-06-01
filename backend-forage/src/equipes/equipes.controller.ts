import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Put,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EquipesService } from './equipes.service';
import { Equipe } from './entities/equipe.entity';
import { equipesMulterConfig } from '../upload/multer.config';

import { CreateEquipeDto } from './create-equipe.dto';
import { UpdateEquipeDto } from './update-equipe.dto';

@Controller('equipes')
export class EquipesController {
  constructor(private readonly equipesService: EquipesService) {}

  @Get()
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findAll(): Promise<Equipe[]> {
    return this.equipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Equipe> {
    return this.equipesService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', equipesMulterConfig))
  async create(
    @Body() body: CreateEquipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Equipe> {
    const data: Partial<Equipe> = { ...body };

    if (file?.filename) {
      data.photo = `/uploads/equipes/${file.filename}`;
    }

    return this.equipesService.create(data);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo', equipesMulterConfig))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEquipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Equipe> {
    const data: Partial<Equipe> = { ...body };

    if (file && !file.filename) {
      throw new BadRequestException(
        'Multer diskStorage not applied (filename undefined)',
      );
    }

    if (file?.filename) {
      data.photo = `/uploads/equipes/${file.filename}`;
    }

    return this.equipesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.equipesService.remove(id);
  }
}
