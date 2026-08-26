import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { slug },
      include: {
        topics: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!subject) throw new NotFoundException(`Fach "${slug}" wurde nicht gefunden.`);
    return subject;
  }

  /**
   * Prueft, ob der Nutzer den Einstufungstest fuer ein Fach bereits
   * abgeschlossen hat. Das Wissens-Wiki wird erst danach freigeschaltet.
   */
  async hasCompletedPlacementTest(userId: string, subjectId: string): Promise<boolean> {
    const count = await this.prisma.testAttempt.count({
      where: {
        userId,
        subjectId,
        type: 'PLACEMENT',
        status: 'COMPLETED',
      },
    });
    return count > 0;
  }
}
