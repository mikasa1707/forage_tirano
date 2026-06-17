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
import { equipesMulterConfig } from '../upload/multer.config';
import { CreateEquipeDto } from './create-equipe.dto';
import { UpdateEquipeDto } from './update-equipe.dto';

@Controller('equipes')
export class EquipesController {
  constructor(private readonly service: EquipesService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', equipesMulterConfig))
  create(
    @Body() body: CreateEquipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: any = { ...body };

    if (file?.filename) {
      data.photo = `/uploads/equipes/${file.filename}`;
    }

    return this.service.create(data);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo', equipesMulterConfig))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEquipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: any = { ...body };

    if (file && !file.filename) {
      throw new BadRequestException('Upload error');
    }

    if (file?.filename) {
      data.photo = `/uploads/equipes/${file.filename}`;
    }

    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}