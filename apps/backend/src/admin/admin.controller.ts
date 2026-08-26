import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { QuestionAccessGuard } from '../auth/guards/question-access.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateTopicDto,
  UpdateUserRoleDto,
  UpdateUserPermissionsDto,
} from './dto/admin.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Login fuer den gesamten Controller Pflicht
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  // ---------------------------------------------------------------------
  // Fragen-Bereich: zugaenglich fuer volle Admins UND Nutzer mit
  // canManageQuestions-Berechtigung (QuestionAccessGuard statt RolesGuard).
  // ---------------------------------------------------------------------

  @Get('subjects')
  @UseGuards(QuestionAccessGuard)
  listSubjects() {
    return this.service.listSubjectsForAdmin();
  }

  @Get('subjects/:subjectId/topics')
  @UseGuards(QuestionAccessGuard)
  listTopics(@Param('subjectId') subjectId: string) {
    return this.service.listTopicsForAdmin(subjectId);
  }

  @Post('questions')
  @UseGuards(QuestionAccessGuard)
  createQuestion(@Body() dto: CreateQuestionDto, @CurrentUser() user: CurrentUserPayload) {
    return this.service.createQuestion(dto, user.userId);
  }

  @Patch('questions/:id')
  @UseGuards(QuestionAccessGuard)
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.service.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @UseGuards(QuestionAccessGuard)
  deleteQuestion(@Param('id') id: string) {
    return this.service.deleteQuestion(id);
  }

  @Get('topics/:topicId/questions')
  @UseGuards(QuestionAccessGuard)
  listQuestions(@Param('topicId') topicId: string) {
    return this.service.listQuestionsForTopic(topicId);
  }

  // ---------------------------------------------------------------------
  // Voller Admin-Bereich: Themenverwaltung, Statistiken, Nutzerverwaltung,
  // Rollen-/Berechtigungsvergabe - ausschließlich role === 'ADMIN'.
  // ---------------------------------------------------------------------

  @Post('topics')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  createTopic(@Body() dto: CreateTopicDto) {
    return this.service.createTopic(dto);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getStatistics() {
    return this.service.getPlatformStatistics();
  }

  @Get('users')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  listUsers() {
    return this.service.listUsers();
  }

  @Patch('users/:userId/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateUserRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.service.updateUserRole(userId, dto, user.userId);
  }

  @Patch('users/:userId/permissions')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateUserPermissions(@Param('userId') userId: string, @Body() dto: UpdateUserPermissionsDto) {
    return this.service.updateUserPermissions(userId, dto);
  }
}
