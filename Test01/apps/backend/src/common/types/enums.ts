/**
 * Ersatz fuer die frueheren Prisma-Enums.
 *
 * Da SQLite in Prisma keine echten Datenbank-Enums unterstuetzt, sind die
 * entsprechenden Felder im Schema als String abgebildet (siehe
 * prisma/schema.prisma). Die Gueltigkeit der Werte wird stattdessen hier im
 * Anwendungscode ueber das "const-Objekt + Union-Type"-Muster sichergestellt,
 * das sich wie ein Enum verwenden laesst (z.B. `Role.ADMIN`,
 * `QuestionUsage.BOTH`) und gleichzeitig mit class-validators `@IsEnum()`
 * kompatibel ist.
 *
 * Bei einem spaeteren Wechsel auf PostgreSQL koennen diese wieder durch
 * echte Prisma-Enums ersetzt werden.
 */

export const Role = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const QuestionUsage = {
  PLACEMENT: 'PLACEMENT',
  TOPIC_TEST: 'TOPIC_TEST',
  BOTH: 'BOTH',
} as const;
export type QuestionUsage = (typeof QuestionUsage)[keyof typeof QuestionUsage];

export const TestType = {
  PLACEMENT: 'PLACEMENT',
  TOPIC_TEST: 'TOPIC_TEST',
  EXAM_SIMULATION: 'EXAM_SIMULATION',
} as const;
export type TestType = (typeof TestType)[keyof typeof TestType];

export const TestStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const;
export type TestStatus = (typeof TestStatus)[keyof typeof TestStatus];

export const MasteryStatus = {
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;
export type MasteryStatus = (typeof MasteryStatus)[keyof typeof MasteryStatus];
