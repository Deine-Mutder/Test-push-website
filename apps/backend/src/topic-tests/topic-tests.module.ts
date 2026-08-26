import { Module } from '@nestjs/common';
import { TopicTestsService } from './topic-tests.service';
import { TopicTestsController } from './topic-tests.controller';
import { TestScoringService } from '../common/services/test-scoring.service';

@Module({
  controllers: [TopicTestsController],
  providers: [TopicTestsService, TestScoringService],
})
export class TopicTestsModule {}
