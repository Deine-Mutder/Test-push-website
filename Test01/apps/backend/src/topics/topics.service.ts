import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';

/**
 * Hilfsfunktion: parst ein JSON-Textfeld aus SQLite sicher zurueck in ein
 * Objekt/Array. Gibt null zurueck, wenn das Feld leer oder ungueltig ist,
 * damit die API nie mit einem 500er wegen kaputtem JSON antwortet.
 */
function parseJsonField(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

@Injectable()
export class TopicsService {
  constructor(
    private prisma: PrismaService,
    private subjectsService: SubjectsService,
  ) {}

  async findTopicsForUser(subjectSlug: string, userId: string) {
    const subject = await this.subjectsService.findBySlug(subjectSlug);
    const placementCompleted = await this.subjectsService.hasCompletedPlacementTest(
      userId,
      subject.id,
    );
    if (!placementCompleted) {
      throw new ForbiddenException(
        'Bitte zuerst den Einstufungstest für dieses Fach abschließen, um das Wissens-Wiki freizuschalten.',
      );
    }

    const [masteries, deficits] = await Promise.all([
      this.prisma.topicMastery.findMany({ where: { userId, subjectId: subject.id } }),
      this.prisma.deficit.findMany({
        where: { userId, subjectId: subject.id, resolvedAt: null },
      }),
    ]);

    const masteryByTopic = new Map(masteries.map((m) => [m.topicId, m]));
    const deficitByTopic = new Map(deficits.map((d) => [d.topicId, d]));

    return subject.topics
      .map((topic) => ({
        ...topic,
        mastery: masteryByTopic.get(topic.id) ?? null,
        deficit: deficitByTopic.get(topic.id) ?? null,
      }))
      .sort((a, b) => {
        if (a.deficit && !b.deficit) return -1;
        if (!a.deficit && b.deficit) return 1;
        return a.sortOrder - b.sortOrder;
      });
  }

  async findSubTopicsForTopic(topicId: string, userId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { subTopics: { orderBy: { sortOrder: 'asc' } }, subject: true },
    });
    if (!topic) throw new NotFoundException('Thema wurde nicht gefunden.');

    const placementCompleted = await this.subjectsService.hasCompletedPlacementTest(
      userId,
      topic.subjectId,
    );
    if (!placementCompleted) {
      throw new ForbiddenException(
        'Bitte zuerst den Einstufungstest für dieses Fach abschließen.',
      );
    }

    return {
      topic: { id: topic.id, name: topic.name, slug: topic.slug, subjectSlug: topic.subject.slug },
      subTopics: topic.subTopics.map((st) => ({ id: st.id, slug: st.slug, name: st.name })),
    };
  }

  async findSubTopicContent(topicId: string, subTopicSlug: string, userId: string) {
    const subTopic = await this.prisma.subTopic.findFirst({
      where: { topicId, slug: subTopicSlug },
      include: { topic: { include: { subject: true } } },
    });
    if (!subTopic) throw new NotFoundException('Inhalt wurde nicht gefunden.');

    const placementCompleted = await this.subjectsService.hasCompletedPlacementTest(
      userId,
      subTopic.topic.subjectId,
    );
    if (!placementCompleted) {
      throw new ForbiddenException(
        'Bitte zuerst den Einstufungstest für dieses Fach abschließen.',
      );
    }

    // SQLite speichert diese Felder als JSON-Text (siehe schema.prisma) -
    // hier fuer die API-Antwort wieder in echte Objekte/Arrays umwandeln.
    return {
      id: subTopic.id,
      name: subTopic.name,
      explanation: subTopic.explanation,
      summary: subTopic.summary,
      definitions: parseJsonField(subTopic.definitions),
      examples: parseJsonField(subTopic.examples),
      formulas: parseJsonField(subTopic.formulas),
      keyTakeaways: parseJsonField(subTopic.keyTakeaways),
      stepByStepGuides: parseJsonField(subTopic.stepByStepGuides),
      commonMistakes: parseJsonField(subTopic.commonMistakes),
      tips: parseJsonField(subTopic.tips),
      examTaskExamples: parseJsonField(subTopic.examTaskExamples),
    };
  }
}
