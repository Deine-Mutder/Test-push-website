export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN';
  canManageQuestions?: boolean;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  colorHex: string;
  placementCompleted?: boolean;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  subjectId: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  mastery?: TopicMastery | null;
  deficit?: Deficit | null;
}

export interface TopicMastery {
  id: string;
  status: 'NOT_STARTED' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  bestScorePercent: number | null;
  lastScorePercent: number | null;
  totalStudyTimeSeconds: number;
  lastStudiedAt: string | null;
}

export interface Deficit {
  id: string;
  scorePercent: number;
  priority: number;
}

export interface SubTopic {
  id: string;
  topicId: string;
  slug: string;
  name: string;
  explanation: string;
  summary: string;
  definitions: { term: string; definition: string }[] | null;
  examples: { title: string; content: string }[] | null;
  formulas: { label: string; formula: string; description?: string }[] | null;
  keyTakeaways: string[] | null;
  stepByStepGuides: { title: string; steps: string[] }[] | null;
  commonMistakes: { mistake: string; correction: string }[] | null;
  tips: string[] | null;
  examTaskExamples: { question: string; solution: string; explanation: string }[] | null;
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface TestQuestion {
  questionId: string;
  topicName?: string;
  difficulty?: string;
  prompt: string;
  answers: AnswerOption[];
}

export interface TestAttempt {
  id: string;
  type: 'PLACEMENT' | 'TOPIC_TEST' | 'EXAM_SIMULATION';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  totalQuestions: number;
  startedAt: string;
  questions: TestQuestion[];
}

export interface TopicBreakdown {
  topicId: string;
  topicName: string;
  correctCount: number;
  totalCount: number;
  scorePercent: number;
  isDeficit: boolean;
}

export interface TestResult {
  id: string;
  type: string;
  status: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  topicBreakdown: TopicBreakdown[];
  questions: {
    questionId: string;
    topicName: string;
    prompt: string;
    explanation: string;
    selectedAnswerId: string | null;
    isCorrect: boolean;
    answers: AnswerOption[];
  }[];
}

export interface DashboardData {
  greeting: { firstName: string };
  overallProgressPercent: number;
  subjectProgress: {
    subjectId: string;
    slug: string;
    name: string;
    colorHex: string;
    icon: string | null;
    totalTopics: number;
    completedTopics: number;
    progressPercent: number;
  }[];
  deficits: {
    topicId: string;
    topicName: string;
    subjectName: string;
    subjectSlug: string;
    scorePercent: number;
  }[];
  recommendedTopics: {
    topicId: string;
    topicName: string;
    subjectName: string;
    subjectSlug: string;
    reason: string;
    scorePercent: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    subjectName: string;
    topicName: string | null;
    scorePercent: number | null;
    completedAt: string | null;
  }[];
  studyTime: { totalSeconds: number; thisWeekSeconds: number };
}

export interface AdminUserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN';
  canManageQuestions: boolean;
  createdAt: string;
  _count: { testAttempts: number; deficits: number };
}
