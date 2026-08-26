import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Difficulty, QuestionUsage, Role } from '../../common/types/enums';

export class AnswerOptionInputDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiProperty()
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  topicId: string;

  @ApiProperty({ enum: QuestionUsage, default: QuestionUsage.BOTH })
  @IsEnum(QuestionUsage)
  usage: QuestionUsage;

  @ApiProperty({ enum: Difficulty, default: Difficulty.MEDIUM })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiProperty()
  @IsString()
  explanation: string;

  @ApiProperty({ type: [AnswerOptionInputDto] })
  @IsArray()
  @ArrayMinSize(2, { message: 'Es werden mindestens 2 Antwortmöglichkeiten benötigt.' })
  @ValidateNested({ each: true })
  @Type(() => AnswerOptionInputDto)
  answers: AnswerOptionInputDto[];
}

export class UpdateQuestionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ required: false, enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ required: false, enum: QuestionUsage })
  @IsOptional()
  @IsEnum(QuestionUsage)
  usage?: QuestionUsage;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, type: [AnswerOptionInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerOptionInputDto)
  answers?: AnswerOptionInputDto[];
}

export class CreateTopicDto {
  @ApiProperty()
  @IsString()
  subjectId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

/** Vergibt/entzieht die volle Admin-Rolle (Zugriff auf gesamtes Admin-Panel). */
export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}

/** Vergibt/entzieht die granulare Berechtigung "nur Fragen erstellen". */
export class UpdateUserPermissionsDto {
  @ApiProperty()
  @IsBoolean()
  canManageQuestions: boolean;
}
