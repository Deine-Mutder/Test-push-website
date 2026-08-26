import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateTopicDto,
  UpdateUserRoleDto,
  UpdateUserPermissionsDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ---- Fächer & Themen (für Auswahl-Dropdowns im Admin-Formular) ----

  listSubjectsForAdmin() {
    return this.prisma.subject.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, slug: true, name: true },
    });
  }

  listTopicsForAdmin(subjectId: string) {
    return this.prisma.topic.findMany({
      where: { subjectId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, slug: true, name: true, _count: { select: { questions: true } } },
    });
  }

  // ---- Fragen ----

  async createQuestion(dto: CreateQuestionDto, adminUserId: string) {
    this.assertExactlyOneCorrectAnswer(dto.answers);

    return this.prisma.question.create({
      data: {
        topicId: dto.topicId,
        usage: dto.usage,
        difficulty: dto.difficulty,
        prompt: dto.prompt,
        explanation: dto.explanation,
        createdById: adminUserId,
        answers: {
          create: dto.answers.map((a, i) => ({
            text: a.text,
            isCorrect: a.isCorrect,
            sortOrder: i,
          })),
        },
      },
      include: { answers: true },
    });
  }

  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Frage wurde nicht gefunden.');

    if (dto.answers) {
      this.assertExactlyOneCorrectAnswer(dto.answers);
      await this.prisma.answerOption.deleteMany({ where: { questionId } });
      await this.prisma.answerOption.createMany({
        data: dto.answers.map((a, i) => ({
          questionId,
          text: a.text,
          isCorrect: a.isCorrect,
          sortOrder: i,
        })),
      });
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        prompt: dto.prompt,
        explanation: dto.explanation,
        difficulty: dto.difficulty,
        usage: dto.usage,
        isActive: dto.isActive,
      },
      include: { answers: true },
    });
  }

  async deleteQuestion(questionId: string) {
    await this.prisma.question.delete({ where: { id: questionId } });
    return { success: true };
  }

  listQuestionsForTopic(topicId: string) {
    return this.prisma.question.findMany({
      where: { topicId },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private assertExactlyOneCorrectAnswer(answers: { isCorrect: boolean }[]) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException(
        'Es muss genau eine richtige Antwort ausgewählt werden.',
      );
    }
  }

  // ---- Themen ----

  createTopic(dto: CreateTopicDto) {
    return this.prisma.topic.create({ data: dto });
  }

  // ---- Statistiken (Admin-Sicht) ----

  async getPlatformStatistics() {
    const [userCount, questionCount, completedPlacementTests, completedTopicTests] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.question.count(),
        this.prisma.testAttempt.count({ where: { type: 'PLACEMENT', status: 'COMPLETED' } }),
        this.prisma.testAttempt.count({ where: { type: 'TOPIC_TEST', status: 'COMPLETED' } }),
      ]);

    const deficitsBySubject = await this.prisma.deficit.groupBy({
      by: ['subjectId'],
      where: { resolvedAt: null },
      _count: true,
    });

    return {
      userCount,
      questionCount,
      completedPlacementTests,
      completedTopicTests,
      deficitsBySubject,
    };
  }

  // ---- Nutzerverwaltung & Berechtigungsvergabe ----

  listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        canManageQuestions: true,
        createdAt: true,
        _count: { select: { testAttempts: true, deficits: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Vergibt/entzieht die volle Admin-Rolle (kompletter Admin-Panel-Zugriff:
   * Fragen, Themen, Statistiken, Nutzerverwaltung).
   *
   * Selbstschutz: ein Admin kann sich nicht selbst degradieren, damit die
   * Plattform nie ohne aktiven Admin-Account dasteht.
   */
  async updateUserRole(targetUserId: string, dto: UpdateUserRoleDto, requestingUserId: string) {
    if (targetUserId === requestingUserId && dto.role !== 'ADMIN') {
      throw new ForbiddenException('Du kannst dir selbst nicht die Admin-Rolle entziehen.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('Nutzer wurde nicht gefunden.');

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: dto.role },
      select: { id: true, email: true, role: true, canManageQuestions: true },
    });
  }

  /**
   * Vergibt/entzieht ausschließlich die Berechtigung "Fragen erstellen",
   * ohne vollen Admin-Panel-Zugriff (Statistiken/Nutzerverwaltung bleiben
   * gesperrt). Gedacht z.B. für Lehrkräfte, die nur Inhalte pflegen sollen.
   */
  async updateUserPermissions(targetUserId: string, dto: UpdateUserPermissionsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('Nutzer wurde nicht gefunden.');

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { canManageQuestions: dto.canManageQuestions },
      select: { id: true, email: true, role: true, canManageQuestions: true },
    });
  }
}
