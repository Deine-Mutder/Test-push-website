import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @CurrentUser() user: CurrentUserPayload) {
    const subject = await this.subjectsService.findBySlug(slug);
    const placementCompleted = await this.subjectsService.hasCompletedPlacementTest(
      user.userId,
      subject.id,
    );
    return { ...subject, placementCompleted };
  }
}
