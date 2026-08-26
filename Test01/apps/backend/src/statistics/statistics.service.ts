import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const [user, subjects, masteries, deficits, recentAttempts, studySessions] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.subject.findMany({
          where: { isActive: true },
          include: { topics: { where: { isActive: true } } },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.topicMastery.findMany({ where: { userId } }),
        this.prisma.deficit.findMany({
          where: { userId, resolvedAt: null },
          include: { topic: true, subject: true },
          orderBy: { priority: 'desc' },
        }),
        this.prisma.testAttempt.findMany({
          where: { userId, status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 5,
          include: { subject: true, topic: true },
        }),
        this.prisma.studySession.findMany({ where: { userId } }),
      ]);

    const masteryByTopic = new Map(masteries.map((m) => [m.topicId, m]));

    const subjectProgress = subjects.map((subject) => {
      const topicIds = subject.topics.map((t) => t.id);
      const relevantMasteries = topicIds
        .map((id) => masteryByTopic.get(id))
        .filter((m): m is NonNullable<typeof m> => !!m);

      const completedCount = relevantMasteries.filter((m) => m.status === 'COMPLETED').length;
      const overallPercent =
        topicIds.length === 0 ? 0 : Math.round((completedCount / topicIds.length) * 100);

      return {
        subjectId: subject.id,
        slug: subject.slug,
        name: subject.name,
        colorHex: subject.colorHex,
        icon: subject.icon,
        totalTopics: topicIds.length,
        completedTopics: completedCount,
        progressPercent: overallPercent,
      };
    });

    const overallProgressPercent =
      subjectProgress.length === 0
        ? 0
        : Math.round(
            subjectProgress.reduce((sum, s) => sum + s.progressPercent, 0) /
              subjectProgress.length,
          );

    const totalStudyTimeSeconds = studySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const studyTimeThisWeekSeconds = studySessions
      .filter((s) => s.startedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, s) => sum + s.durationSeconds, 0);

    // Empfehlung: hoechste-Prioritaets-Defizite zuerst, sonst naechstes unbegonnenes Thema
    const recommendedTopics = deficits.slice(0, 5).map((d) => ({
      topicId: d.topicId,
      topicName: d.topic.name,
      subjectName: d.subject.name,
      subjectSlug: d.subject.slug,
      reason: 'deficit' as const,
      scorePercent: d.scorePercent,
    }));

    return {
      greeting: {
        firstName: user?.firstName ?? '',
      },
      overallProgressPercent,
      subjectProgress,
      deficits: deficits.map((d) => ({
        topicId: d.topicId,
        topicName: d.topic.name,
        subjectName: d.subject.name,
        subjectSlug: d.subject.slug,
        scorePercent: d.scorePercent,
      })),
      recommendedTopics,
      recentActivity: recentAttempts.map((a) => ({
        id: a.id,
        type: a.type,
        subjectName: a.subject.name,
        topicName: a.topic?.name ?? null,
        scorePercent: a.scorePercent,
        completedAt: a.completedAt,
      })),
      studyTime: {
        totalSeconds: totalStudyTimeSeconds,
        thisWeekSeconds: studyTimeThisWeekSeconds,
      },
    };
  }
}
