import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TestScoringService } from '../common/services/test-scoring.service';
import { QuestionAnswerDto } from '../common/dto/submit-test.dto';

const TOPIC_TEST_QUESTION_COUNT = 15;

@Injectable()
export class TopicTestsService {
  constructor(
    private prisma: PrismaService,
    private scoring: TestScoringService,
  ) {}

  async startTopicTest(topicId: string, userId: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Thema wurde nicht gefunden.');

    const pool = await this.prisma.question.findMany({
      where: { topicId, isActive: true, usage: { in: ['TOPIC_TEST', 'BOTH'] } },
      select: { id: true },
    });
    if (pool.length === 0) {
      throw new BadRequestException('Für dieses Thema sind noch keine Testfragen hinterlegt.');
    }

    const selected = shuffle(pool).slice(0, Math.min(TOPIC_TEST_QUESTION_COUNT, pool.length));

    const attempt = await this.prisma.testAttempt.create({
      data: {
        userId,
        subjectId: topic.subjectId,
        topicId,
        type: 'TOPIC_TEST',
        status: 'IN_PROGRESS',
        totalQuestions: selected.length,
        responses: { create: selected.map((q) => ({ questionId: q.id })) },
      },
    });

    // Thema als "in Bearbeitung" markieren, sobald ein Test gestartet wird
    await this.prisma.topicMastery.upsert({
      where: { userId_topicId: { userId, topicId } },
      create: {
        userId,
        subjectId: topic.subjectId,
        topicId,
        status: 'IN_PROGRESS',
        lastStudiedAt: new Date(),
      },
      update: { status: 'IN_PROGRESS', lastStudiedAt: new Date() },
    });

    return this.getAttemptForTaking(attempt.id, userId);
  }

  async getAttemptForTaking(attemptId: string, userId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { responses: { include: { question: { include: { answers: true } } } } },
    });
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Testdurchlauf wurde nicht gefunden.');
    }
    return {
      id: attempt.id,
      status: attempt.status,
      totalQuestions: attempt.totalQuestions,
      questions: attempt.responses.map((r) => ({
        questionId: r.question.id,
        prompt: r.question.prompt,
        answers: r.question.answers.map((a) => ({ id: a.id, text: a.text })),
      })),
    };
  }

  submitTopicTest(attemptId: string, userId: string, answers: QuestionAnswerDto[]) {
    return this.scoring.scoreAndCompleteAttempt(attemptId, userId, answers);
  }

  getResult(attemptId: string) {
    return this.scoring.getAttemptResult(attemptId);
  }
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
