import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { PlacementTestsModule } from './placement-tests/placement-tests.module';
import { TopicTestsModule } from './topic-tests/topic-tests.module';
import { ProgressModule } from './progress/progress.module';
import { StatisticsModule } from './statistics/statistics.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }], // globales Rate-Limit, spezifischere Limits siehe AuthController
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    TopicsModule,
    PlacementTestsModule,
    TopicTestsModule,
    ProgressModule,
    StatisticsModule,
    AdminModule,
  ],
})
export class AppModule {}
