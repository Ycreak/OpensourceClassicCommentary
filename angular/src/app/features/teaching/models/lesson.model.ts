/** Models for the teaching package. Multiple-choice lessons only. */

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
}

export interface MultipleChoiceQuestion {
  prompt: string;
  choices: string[];
  correct_index: number;
  /** Shown after the student answers correctly. */
  explanation?: string;
  /** Shown only after a wrong answer. */
  hint?: string;
}

export interface Lesson extends LessonSummary {
  questions: MultipleChoiceQuestion[];
}
