import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { TestScoringService } from '../common/services/test-scoring.service';
import { QuestionAnswerDto } from '../common/dto/submit-test.dto';

const PLACEMENT_TEST_QUESTION_COUNT = 50;

@Injectable()
export class PlacementTestsService {
  constructor(
    private prisma: PrismaService,
    private subjectsService: SubjectsService,
    private scoring: TestScoringService,
  ) {}

  /**
   * Erstellt einen neuen Einstufungstest mit 50 Fragen, gleichmaessig verteilt
   * über alle aktiven Themen des Fachs (Round-Robin), Fragen je Thema zufaellig
   * gewaehlt. Bei ungleicher Aufteilung (50 nicht durch Themenzahl teilbar)
   * erhalten die ersten Themen (zufaellig geshuffelt) je eine Frage mehr.
   */
  async startPlacementTest(subjectSlug: string, userId: string) {
    const subject = await this.subjectsService.findBySlug(subjectSlug);
    const topics = subject.topics;
    if (topics.length === 0) {
      throw new BadRequestException('Für dieses Fach sind noch keine Themen hinterlegt.');
    }

    const shuffledTopics = shuffle([...topics]);
    const baseCount = Math.floor(PLACEMENT_TEST_QUESTION_COUNT / shuffledTopics.length);
    const remainder = PLACEMENT_TEST_QUESTION_COUNT % shuffledTopics.length;

    const selectedQuestionIds: string[] = [];

    for (let i = 0; i < shuffledTopics.length; i++) {
      const topic = shuffledTopics[i];
      const countForTopic = baseCount + (i < remainder ? 1 : 0);
      if (countForTopic === 0) continue;

      const pool = await this.prisma.question.findMany({
        where: {
          topicId: topic.id,
          isActive: true,
          usage: { in: ['PLACEMENT', 'BOTH'] },
        },
        select: { id: true },
      });

      const chosen = shuffle(pool).slice(0, Math.min(countForTopic, pool.length));
      selectedQuestionIds.push(...chosen.map((q) => q.id));
    }

    if (selectedQuestionIds.length < PLACEMENT_TEST_QUESTION_COUNT) {
      // Fragenpool noch nicht vollstaendig befuellt - Test trotzdem mit
      // verfuegbaren Fragen starten, damit die Plattform frueh nutzbar ist.
      if (selectedQuestionIds.length === 0) {
        throw new BadRequestException(
          'Für dieses Fach sind noch keine Einstufungsfragen hinterlegt.',
        );
      }
    }

    const attempt = await this.prisma.testAttempt.create({
      data: {
        userId,
        subjectId: subject.id,
        type: 'PLACEMENT',
        status: 'IN_PROGRESS',
        totalQuestions: selectedQuestionIds.length,
        responses: {
          create: selectedQuestionIds.map((questionId) => ({ questionId })),
        },
      },
    });

    return this.getAttemptForTaking(attempt.id, userId);
  }

  async getAttemptForTaking(attemptId: string, userId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: {
          include: { question: { include: { answers: true, topic: true } } },
        },
      },
    });
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Testdurchlauf wurde nicht gefunden.');
    }

    return {
      id: attempt.id,
      type: attempt.type,
      status: attempt.status,
      totalQuestions: attempt.totalQuestions,
      startedAt: attempt.startedAt,
      // richtige Antwort wird waehrend der Durchfuehrung NICHT mitgeschickt
      questions: attempt.responses.map((r) => ({
        questionId: r.question.id,
        topicName: r.question.topic.name,
        difficulty: r.question.difficulty,
        prompt: r.question.prompt,
        answers: r.question.answers.map((a) => ({ id: a.id, text: a.text })),
      })),
    };
  }

  submitPlacementTest(attemptId: string, userId: string, answers: QuestionAnswerDto[]) {
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
