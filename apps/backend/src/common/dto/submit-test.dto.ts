import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class QuestionAnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty({ required: false, nullable: true, description: 'null falls unbeantwortet' })
  @IsOptional()
  @IsString()
  selectedAnswerId: string | null;
}

export class SubmitTestDto {
  @ApiProperty({ type: [QuestionAnswerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  answers: QuestionAnswerDto[];
}
