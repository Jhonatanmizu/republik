import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Module } from '@nestjs/common';
import type { JwtPayload } from '../../shared/crypto/crypto.util.js';
import {
  CurrentUser,
  JwtAuthGuard,
  OptionalJwtAuthGuard,
  ZodValidationPipe,
} from '../../shared/security/security.js';
import {
  STORAGE_SERVICE_PORT,
  type StorageServicePort,
} from '../../shared/storage/storage.module.js';
import {
  type CreateListingDto,
  CreateListingDtoSchema,
  type ListingsQueryDto,
  ListingsQueryDtoSchema,
  type UpdateListingDto,
  UpdateListingDtoSchema,
  type UpdateListingStatusDto,
  UpdateListingStatusDtoSchema,
  type UploadBase64Dto,
  UploadBase64DtoSchema,
} from './listings.dto.js';
import { ListingsService } from './listings.service.js';

@Controller()
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    @Inject(STORAGE_SERVICE_PORT)
    private readonly storageService: StorageServicePort,
  ) {}

  @Get('listings')
  @UseGuards(OptionalJwtAuthGuard)
  async list(
    @Query(new ZodValidationPipe(ListingsQueryDtoSchema))
    query: ListingsQueryDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    const listings = await this.listingsService.findAll(query, user?.sub);
    return { listings, total: listings.length };
  }

  @Get('listings/:idOrSlug')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const listing = await this.listingsService.findOneByIdOrSlug(
      idOrSlug,
      user?.sub,
    );
    return { listing };
  }

  @Post('listings')
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(CreateListingDtoSchema)) dto: CreateListingDto,
  ) {
    const listing = await this.listingsService.create(user.sub, dto);
    return { listing };
  }

  @Patch('listings/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpdateListingDtoSchema)) dto: UpdateListingDto,
  ) {
    const listing = await this.listingsService.update(
      id,
      user.sub,
      user.role,
      dto,
    );
    return { listing };
  }

  @Patch('listings/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpdateListingStatusDtoSchema))
    dto: UpdateListingStatusDto,
  ) {
    const listing = await this.listingsService.updateStatus(
      id,
      user.sub,
      user.role,
      dto,
    );
    return { listing };
  }

  @Post('listings/:id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.listingsService.toggleFavorite(id, user.sub);
  }

  @Delete('listings/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.listingsService.remove(id, user.sub, user.role);
  }

  @Post('uploads')
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Body(new ZodValidationPipe(UploadBase64DtoSchema)) dto: UploadBase64Dto,
  ) {
    const cleanedBase64 = dto.base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanedBase64, 'base64');
    return this.storageService.uploadFile({
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      buffer,
      folder: dto.folder,
    });
  }
}

@Module({
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}

