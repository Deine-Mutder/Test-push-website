import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogStudySessionDto } from './dto/log-study-session.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async logStudySession(userId: string, dto: LogStudySessionDto) {
    const session = await this.prisma.studySession.create({
      data: {
        userId,
        topicId: dto.topicId,
        durationSeconds: dto.durationSeconds,
        startedAt: new Date(dto.startedAt),
        endedAt: new Date(dto.endedAt),
      },
    });

    if (dto.topicId) {
      const topic = await this.prisma.topic.findUnique({ where: { id: dto.topicId } });
      if (topic) {
        await this.prisma.topicMastery.upsert({
          where: { userId_topicId: { userId, topicId: dto.topicId } },
          create: {
            userId,
            subjectId: topic.subjectId,
            topicId: dto.topicId,
            status: 'STARTED',
            totalStudyTimeSeconds: dto.durationSeconds,
            lastStudiedAt: new Date(),
          },
          update: {
            totalStudyTimeSeconds: { increment: dto.durationSeconds },
            lastStudiedAt: new Date(),
            status: 'IN_PROGRESS',
          },
        });
      }
    }

    return session;
  }

  async getTopicProgress(userId: string, topicId: string) {
    return this.prisma.topicMastery.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });
  }
}
