import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { StatisticsService } from './statistics.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Get()
  getDashboard(@CurrentUser() user: CurrentUserPayload) {
    return this.service.getDashboard(user.userId);
  }
}
