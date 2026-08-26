import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

/**
 * Laesst Endpunkte fuer zwei Nutzergruppen zu:
 * - volle Admins (role === 'ADMIN')
 * - Nutzer mit der granularen Zusatzberechtigung canManageQuestions
 *
 * Wird gezielt nur auf den Fragenerstellung/-bearbeitung-Routen eingesetzt.
 * Statistiken, Nutzerverwaltung und Rollenvergabe bleiben ueber RolesGuard +
 * @Roles('ADMIN') weiterhin exklusiv vollen Admins vorbehalten.
 */
@Injectable()
export class QuestionAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user || (user.role !== 'ADMIN' && !user.canManageQuestions)) {
      throw new ForbiddenException(
        'Für diese Aktion wird Admin- oder Fragen-Berechtigung benötigt.',
      );
    }
    return true;
  }
}
