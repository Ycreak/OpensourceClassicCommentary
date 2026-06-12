import { TestBed } from '@angular/core/testing';
import { Canvas } from 'fabric';

import { FabricService } from './fabric.service';
import { Playground_question } from '@oscc/features/playground/types/Playground_question';

describe('FabricService', () => {
  let service: FabricService;

  const valid_question = () =>
    new Playground_question({
      question: 'What form of ipsus would we expect in Classical Latin?',
      choices: ['ipsi', 'ipso', 'ipsa', 'ipse'],
      correct_index: 3,
      explanation: 'ipsus is an Early Latin variant of ipse.',
    });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('with a canvas', () => {
    beforeEach(() => {
      const element = document.createElement('canvas');
      element.width = 800;
      element.height = 600;
      service.canvas = new Canvas(element);
    });

    afterEach(async () => {
      await service.canvas.dispose();
    });

    const find_question_group = (): any =>
      service.canvas.getObjects().find((obj: any) => service.is_question(obj));

    it('should add a question card to the canvas', () => {
      service.add_question(valid_question());
      const group = find_question_group();
      expect(group).toBeTruthy();
      expect(group.quiz.correct_index).toBe(3);
      expect(group.subTargetCheck).toBeTrue();
      // One child per choice, plus a hidden feedback textbox
      const choices = group.getObjects().filter((child: any) => child.quiz_choice !== undefined);
      const feedback = group.getObjects().find((child: any) => child.quiz_feedback);
      expect(choices.length).toBe(4);
      expect(feedback.visible).toBeFalse();
    });

    it('should not add an invalid question', () => {
      service.add_question(new Playground_question({ question: '', choices: ['a'], correct_index: 5 }));
      expect(find_question_group()).toBeUndefined();
    });

    it('should reveal the answer when a choice is answered', () => {
      service.add_question(valid_question());
      const group = find_question_group();
      service.answer_question(group, 1);

      expect(group.quiz.answered).toBeTrue();
      expect(group.quiz.chosen_index).toBe(1);
      const feedback = group.getObjects().find((child: any) => child.quiz_feedback);
      expect(feedback.visible).toBeTrue();
      const correct = group.getObjects().find((child: any) => child.quiz_choice === 3);
      const chosen = group.getObjects().find((child: any) => child.quiz_choice === 1);
      expect(correct.fill).toBe('#1B5E20');
      expect(chosen.fill).toBe('#B71C1C');
    });

    it('should only allow answering a question once', () => {
      service.add_question(valid_question());
      const group = find_question_group();
      service.answer_question(group, 3);
      service.answer_question(group, 1);
      expect(group.quiz.chosen_index).toBe(3);
    });

    it('should include quiz metadata when exporting the canvas', () => {
      service.add_question(valid_question());
      const exported: any = service.export_canvas();
      const group = exported.objects.find((obj: any) => obj.quiz);
      expect(group).toBeTruthy();
      expect(group.quiz.choices.length).toBe(4);
      expect(group.subTargetCheck).toBeTrue();
      expect(group.objects.some((child: any) => child.quiz_feedback)).toBeTrue();
    });
  });

  describe('Playground_question.is_valid', () => {
    it('accepts a well-formed question', () => {
      expect(Playground_question.is_valid(valid_question())).toBeTrue();
    });

    it('rejects malformed questions', () => {
      expect(Playground_question.is_valid(null)).toBeFalse();
      expect(Playground_question.is_valid({ question: ' ', choices: ['a', 'b'], correct_index: 0 })).toBeFalse();
      expect(Playground_question.is_valid({ question: 'q', choices: ['a'], correct_index: 0 })).toBeFalse();
      expect(Playground_question.is_valid({ question: 'q', choices: ['a', ''], correct_index: 0 })).toBeFalse();
      expect(Playground_question.is_valid({ question: 'q', choices: ['a', 'b'], correct_index: 2 })).toBeFalse();
      expect(Playground_question.is_valid({ question: 'q', choices: ['a', 'b'], correct_index: -1 })).toBeFalse();
    });
  });
});
