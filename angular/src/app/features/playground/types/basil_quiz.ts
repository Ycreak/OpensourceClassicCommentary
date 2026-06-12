import { Playground_question } from '@oscc/features/playground/types/Playground_question';

/** Multiple choice questions from the Basil exercise sheet on Roman Republican tragedy.
 * Open questions from the sheet (2, 6, 9, 10) are omitted: they have no multiple choice format. */
export const BASIL_QUIZ: Playground_question[] = [
  new Playground_question({
    question:
      'Consider fr. adesp. 96 TRF Adespoton (cur fugit fratrem? scit ipse). What information can we deduce on the basis of this fragment?',
    choices: [
      'That the speaker is a messenger.',
      'That the play involved two brothers.',
      'That the speaker is one of the two brothers.',
      'That there was a decades-long feud between two brothers.',
    ],
    correct_index: 1,
  }),
  new Playground_question({
    question:
      'Consider the following fragment: video sepulcra dua duorum corpurum, "I see two tombs of (or for?) two corpses" (Accius, incertum, F 406 TRF). Read the fragment reconstruction section. To which play has this fragment NOT been attributed?',
    choices: ['Atreus', 'Aegisthus', 'Stasiastae', 'Clytemnestra'],
    correct_index: 2,
  }),
  new Playground_question({
    question:
      'Consider Accius Atreus F 104.1 TRF (ipsus hortatur me frater, ut meos malis miser | manderem natos). Look at the form ipsus, which is sometimes found in Early Latin. What form of this word would we expect to find in Classical Latin (e.g. the Latin of Cicero)?',
    choices: ['ipsi', 'ipso', 'ipsa', 'ipse'],
    correct_index: 3,
  }),
  new Playground_question({
    question:
      'Consider Accius Atreus F 108 TRF (concoquit | partem uapore flammae; tribuit in focos | ueribus lacerta). What word makes it clear that human body parts are being cooked and not animal ones?',
    choices: ['veribus', 'lacerta', 'partem', 'concoquit'],
    correct_index: 1,
    explanation:
      'lacertus, -i, m. (here in the neuter form, lacertum, -i, n.), which is only ever used to denote a human arm.',
  }),
  new Playground_question({
    question:
      'Consider Accius Aegisthus F 7 TRF (cui manus materno sordet sparso sanguine, "whose hand is soiled by his/her mother\'s spattered blood"). Based on your knowledge of Greek mythology, which character could this fragment not describe?',
    choices: ['Orestes', 'Electra', 'Pentheus', 'Alcmaeon'],
    correct_index: 2,
    explanation: 'Pentheus does not kill his mother Agave but is killed by her.',
  }),
  new Playground_question({
    question:
      'In Accius Atreus 103.4, a character says oderint, dum metuant ("let them hate me, so long as they fear me"). With which type of character would you most readily associate this statement?',
    choices: ['A king.', 'An actor.', 'A soldier.', 'A slave.'],
    correct_index: 0,
  }),
];
