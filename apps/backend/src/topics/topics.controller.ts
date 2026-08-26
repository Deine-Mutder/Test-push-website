import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { TopicsService } from './topics.service';

@ApiTags('topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects/:subjectSlug/topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  findAll(
    @Param('subjectSlug') subjectSlug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.topicsService.findTopicsForUser(subjectSlug, user.userId);
  }

  @Get(':topicId/wiki')
  findSubTopics(@Param('topicId') topicId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.topicsService.findSubTopicsForTopic(topicId, user.userId);
  }

  @Get(':topicId/wiki/:subTopicSlug')
  findSubTopic(
    @Param('topicId') topicId: string,
    @Param('subTopicSlug') subTopicSlug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.topicsService.findSubTopicContent(topicId, subTopicSlug, user.userId);
  }
}
