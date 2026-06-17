import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './create-service.dto';
import { UpdateServiceDto } from './update-service.dto';
import { servicesMulterConfig } from '../upload/multer.config';

@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  // PUBLIC
  @Get()
  findAllActive() {
    return this.services.findAllActive();
  }

  // ADMIN
  @Get('admin')
  findAll() {
    return this.services.findAll();
  }

  // CREATE
  @Post()
  @UseInterceptors(FileInterceptor('image', servicesMulterConfig))
  async create(
    @Body() dto: CreateServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.image = `/uploads/services/${file.filename}`;
    }

    dto.is_active = dto.is_active ?? 1;

    return this.services.create(dto);
  }

  // UPDATE
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', servicesMulterConfig))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.image = `/uploads/services/${file.filename}`;
    }

    return this.services.update(id, dto);
  }

  // ACTIVATE / DESACTIVATE
  @Patch(':id/active/:active')
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Param('active', ParseIntPipe) active: number,
  ) {
    return this.services.update(id, {
      is_active: active ? 1 : 0,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.services.remove(id);
  }
}