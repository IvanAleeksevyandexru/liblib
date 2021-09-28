export interface QuizAnswer {
  id: number;
  text: string;
  max?: number;
  min?: number;
  orderNumber?: number;
  otherAnswer?: boolean;
  questionId?: number;
  quizGroupId?: number;
  quizId?: number;
  type?: string;
}

export enum QuestionType {
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  RATING = 'RATING',
  TEXT = 'TEXT'
}

export interface ExtendedAnswer {
  allowed?: boolean;
  caption?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface QuizQuestion {
  questionId: number;
  question: string;
  questionType: QuestionType;
  answers: QuizAnswer[];
  legend?: string;
  textComment?: ExtendedAnswer;
  defaultAnswer?: QuizAnswer; // ответ в случае отказа от участия в опросе

  // XXX удалить, оставлено только для совместимости компиляции на время пока ветка не смерджена в branch-prod!
  extendedAnswerAllowed: boolean;
  extendedAnswerCaption: string;
}

export interface QuizBlock {
  questions: Array<QuizQuestion>;
}

export interface Quiz {
  quizId: string;
  quizCode: string;
  caption: string;
  blocks: Array<QuizBlock>;
}

export interface QuizQuestionResult {
  question: QuizQuestion;
  answers: Array<QuizAnswer>; // for multiple
  answer: QuizAnswer; // for single
  extendedAnswer: string;
}

export interface QuizResult {
  quiz: Quiz;
  questions: Array<QuizQuestionResult>;
}
