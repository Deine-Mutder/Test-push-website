import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { SubmitTestDto } from '../common/dto/submit-test.dto';
import { TopicTestsService } from './topic-tests.service';

@ApiTags('topic-tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('topics/:topicId/test')
export class TopicTestsController {
  constructor(private readonly service: TopicTestsService) {}

  @Post('start')
  start(@Param('topicId') topicId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.service.startTopicTest(topicId, user.userId);
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
    return this.service.submitTopicTest(attemptId, user.userId, dto.answers);
  }

  @Get(':attemptId/result')
  result(@Param('attemptId') attemptId: string) {
    return this.service.getResult(attemptId);
  }
}
