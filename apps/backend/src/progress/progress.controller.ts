import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';
import { LogStudySessionDto } from './dto/log-study-session.dto';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post('study-session')
  logSession(@Body() dto: LogStudySessionDto, @CurrentUser() user: CurrentUserPayload) {
    return this.service.logStudySession(user.userId, dto);
  }

  @Get('topics/:topicId')
  getTopicProgress(@Param('topicId') topicId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.service.getTopicProgress(user.userId, topicId);
  }
}
