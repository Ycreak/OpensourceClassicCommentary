/** This class represents a multiple choice question placed on the playground canvas */
export class Playground_question {
  question: string;
  choices: string[];
  correct_index: number;
  explanation?: string;
  answered = false;
  chosen_index?: number;

  constructor(playground_question?: Partial<Playground_question>) {
    // Allow the partial initialisation of a question object
    Object.assign(this, playground_question);
  }

  /**
   * Checks whether the question is well-formed: a non-empty question, at least two
   * non-empty choices and a correct_index that points to an existing choice.
   * @param question (object) candidate question data
   * @return boolean
   */
  public static is_valid(question: any): boolean {
    return (
      !!question &&
      typeof question.question === 'string' &&
      question.question.trim().length > 0 &&
      Array.isArray(question.choices) &&
      question.choices.length >= 2 &&
      question.choices.every((choice: any) => typeof choice === 'string' && choice.trim().length > 0) &&
      Number.isInteger(question.correct_index) &&
      question.correct_index >= 0 &&
      question.correct_index < question.choices.length
    );
  }
}
