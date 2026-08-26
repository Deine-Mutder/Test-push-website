import { Module } from '@nestjs/common';
import { PlacementTestsService } from './placement-tests.service';
import { PlacementTestsController } from './placement-tests.controller';
import { SubjectsModule } from '../subjects/subjects.module';
import { TestScoringService } from '../common/services/test-scoring.service';

@Module({
  imports: [SubjectsModule],
  controllers: [PlacementTestsController],
  providers: [PlacementTestsService, TestScoringService],
})
export class PlacementTestsModule {}
