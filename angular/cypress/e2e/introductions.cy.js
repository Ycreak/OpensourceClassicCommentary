/**
 * Regression tests for the introduction dialog.
 *
 * The dialog fetches introductions from the api. Since the app runs without
 * zone.js (provideZonelessChangeDetection), that response used to never repaint
 * the dialog: it showed 'Introduction on <name>' with an empty body. The dialog
 * keeps its state in signals now, so the text must appear on its own.
 *
 * Ennius, Thyestes, TRF is used throughout: fragment 133 has both an author and
 * a title introduction in the test data, and the data has no editor introduction
 * for the TRF editor.
 */

const TRF = 'Ennius, Thyestes, TRF';

describe('OSCC introduction dialog', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.wait_for_fragment(TRF, '133');
    cy.select_fragment(TRF, '133');
  });

  it('shows the author introduction', () => {
    cy.get('app-commentary h5 a.a-void').first().click();

    cy.get('mat-dialog-container h2').should('contain.text', 'Introduction on Ennius');
    cy.get('#introductions-text-body').should(($body) => {
      expect($body.text(), 'the author introduction must be rendered').to.contain('Rudae');
    });
  });

  it('shows the title introduction', () => {
    cy.get('app-commentary h5 a.a-void').eq(1).click();

    cy.get('mat-dialog-container h2').should('contain.text', 'Introduction on Thyestes');
    cy.get('#introductions-text-body').should(($body) => {
      expect($body.text().trim(), 'the title introduction must be rendered').to.not.be.empty;
    });
  });

  it('reports when the editor has no introduction', () => {
    cy.get('app-commentary h5 a.a-void').eq(2).click();

    cy.get('mat-dialog-container h2').should('contain.text', 'Introduction on TRF');
    cy.get('#introductions-text-body').should('contain.text', 'No introduction found.');
  });
});
