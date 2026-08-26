import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { SubmitTestDto } from '../common/dto/submit-test.dto';
import { PlacementTestsService } from './placement-tests.service';

@ApiTags('placement-tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects/:subjectSlug/placement-test')
export class PlacementTestsController {
  constructor(private readonly service: PlacementTestsService) {}

  @Post('start')
  start(
    @Param('subjectSlug') subjectSlug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.startPlacementTest(subjectSlug, user.userId);
  }

  @Get(':attemptId')
  get(@Param('attemptId') attemptId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.service.getAttemptForTaking(attemptId, user.userId);
  }

  @Post(':attemptId/submit')
  submit(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitTestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.submitPlacementTest(attemptId, user.userId, dto.answers);
  }

  @Get(':attemptId/result')
  result(@Param('attemptId') attemptId: string) {
    return this.service.getResult(attemptId);
  }
}
