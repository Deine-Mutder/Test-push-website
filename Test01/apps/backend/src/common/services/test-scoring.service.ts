import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestionAnswerDto } from '../dto/submit-test.dto';

export const DEFICIT_THRESHOLD_PERCENT = 75;

// WICHTIG: export ist hier erforderlich. Da dieses Interface im Rueckgabewert
// oeffentlicher Methoden (z.B. getAttemptResult) auftaucht und der
// TypeScript-Compiler mit aktivierter Declaration-Emission (siehe
// tsconfig.json: "declaration": true) alle in oeffentlichen Signaturen
// verwendeten Typen benennen koennen muss, fuehrt ein nicht-exportiertes
// Interface sonst zum Fehler TS4053 ("cannot be named").
export interface TopicBreakdownResult {
  topicId: string;
  topicName: string;
  correctCount: number;
  totalCount: number;
  scorePercent: number;
  isDeficit: boolean;
}

@Injectable()
export class TestScoringService {
  constructor(private prisma: PrismaService) {}

  /**
   * Wertet einen laufenden TestAttempt aus:
   * - prueft & speichert jede Antwort
   * - berechnet Gesamt- und Themen-Score
   * - aktualisiert TopicMastery und Deficit-Eintraege
   *
   * Zentral fuer Einstufungstest UND Themen-Test, um die Bewertungsregeln
   * (75%-Schwelle, Punktzahl-Berechnung) nur an einer Stelle zu pflegen.
   */
  async scoreAndCompleteAttempt(testAttemptId: string, userId: string, answers: QuestionAnswerDto[]) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: {
        responses: { include: { question: { include: { topic: true, answers: true } } } },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Testdurchlauf wurde nicht gefunden.');
    }
    if (attempt.status === 'COMPLETED') {
      throw new BadRequestException('Dieser Test wurde bereits abgeschlossen.');
    }

    const questionIds = attempt.responses.map((r) => r.questionId);
    const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedAnswerId]));

    const topicTally = new Map<string, { name: string; correct: number; total: number }>();
    let correctCount = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const response of attempt.responses) {
        if (!questionIds.includes(response.questionId)) continue;
        const selectedAnswerId = answerMap.get(response.questionId) ?? null;
        const correctOption = response.question.answers.find((a) => a.isCorrect);
        const isCorrect = !!selectedAnswerId && selectedAnswerId === correctOption?.id;

        if (isCorrect) correctCount++;

        await tx.questionResponse.update({
          where: { id: response.id },
          data: { selectedAnswerId, isCorrect, answeredAt: new Date() },
        });

        const topic = response.question.topic;
        const tally = topicTally.get(topic.id) ?? { name: topic.name, correct: 0, total: 0 };
        tally.total += 1;
        if (isCorrect) tally.correct += 1;
        topicTally.set(topic.id, tally);
      }

      const scorePercent = Math.round((correctCount / attempt.totalQuestions) * 1000) / 10;

      await tx.testAttempt.update({
        where: { id: testAttemptId },
        data: {
          status: 'COMPLETED',
          correctCount,
          scorePercent,
          completedAt: new Date(),
        },
      });

      for (const [topicId, tally] of topicTally.entries()) {
        const topicScorePercent = Math.round((tally.correct / tally.total) * 1000) / 10;
        const isDeficit = topicScorePercent < DEFICIT_THRESHOLD_PERCENT;

        await tx.topicScoreBreakdown.create({
          data: {
            testAttemptId,
            topicId,
            topicName: tally.name,
            correctCount: tally.correct,
            totalCount: tally.total,
            scorePercent: topicScorePercent,
            isDeficit,
          },
        });

        await tx.topicMastery.upsert({
          where: { userId_topicId: { userId, topicId } },
          create: {
            userId,
            subjectId: attempt.subjectId,
            topicId,
            status: attempt.type === 'TOPIC_TEST' ? 'COMPLETED' : 'IN_PROGRESS',
            bestScorePercent: topicScorePercent,
            lastScorePercent: topicScorePercent,
            lastStudiedAt: new Date(),
          },
          update: {
            status: attempt.type === 'TOPIC_TEST' ? 'COMPLETED' : undefined,
            lastScorePercent: topicScorePercent,
            lastStudiedAt: new Date(),
          },
        });

        const currentMastery = await tx.topicMastery.findUnique({
          where: { userId_topicId: { userId, topicId } },
        });
        if (currentMastery && (currentMastery.bestScorePercent ?? 0) < topicScorePercent) {
          await tx.topicMastery.update({
            where: { userId_topicId: { userId, topicId } },
            data: { bestScorePercent: topicScorePercent },
          });
        }

        if (isDeficit) {
          await tx.deficit.upsert({
            where: { userId_topicId: { userId, topicId } },
            create: {
              userId,
              subjectId: attempt.subjectId,
              topicId,
              scorePercent: topicScorePercent,
              priority: Math.round(100 - topicScorePercent),
            },
            update: {
              scorePercent: topicScorePercent,
              priority: Math.round(100 - topicScorePercent),
              resolvedAt: null,
            },
          });
        } else {
          await tx.deficit.updateMany({
            where: { userId, topicId, resolvedAt: null },
            data: { resolvedAt: new Date() },
          });
        }
      }
    });

    return this.getAttemptResult(testAttemptId);
  }

  async getAttemptResult(testAttemptId: string) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
      include: {
        topicScores: true,
        responses: {
          include: {
            question: { include: { answers: true, topic: true } },
            selectedAnswer: true,
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Testdurchlauf wurde nicht gefunden.');

    return {
      id: attempt.id,
      type: attempt.type,
      status: attempt.status,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      scorePercent: attempt.scorePercent,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      topicBreakdown: attempt.topicScores.map(
        (t): TopicBreakdownResult => ({
          topicId: t.topicId,
          topicName: t.topicName,
          correctCount: t.correctCount,
          totalCount: t.totalCount,
          scorePercent: t.scorePercent,
          isDeficit: t.isDeficit,
        }),
      ),
      questions: attempt.responses.map((r) => ({
        questionId: r.questionId,
        topicName: r.question.topic.name,
        prompt: r.question.prompt,
        explanation: r.question.explanation,
        selectedAnswerId: r.selectedAnswerId,
        isCorrect: r.isCorrect,
        answers: r.question.answers.map((a) => ({
          id: a.id,
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      })),
    };
  }
}
