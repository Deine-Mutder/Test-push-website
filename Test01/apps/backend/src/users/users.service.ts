import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/update-profile.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        canManageQuestions: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Benutzer wurde nicht gefunden.');
    return user;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, firstName: true, lastName: true },
    });
  }

  /**
   * Passwort im eingeloggten Zustand aendern (im Unterschied zum
   * "Passwort vergessen"-Flow: hier wird das AKTUELLE Passwort zur
   * Bestaetigung verlangt, kein E-Mail-Link noetig).
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Benutzer wurde nicht gefunden.');

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Das aktuelle Passwort ist nicht korrekt.');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      }),
      // Alle anderen aktiven Sitzungen (z.B. auf anderen Geraeten) invalidieren,
      // da sich das Passwort geaendert hat.
      this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      }),
    ]);

    return { success: true };
  }
}
