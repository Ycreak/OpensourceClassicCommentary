import { get } from 'cypress/types/lodash';

describe('Commentary section e2e test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  it('Should only show elements that a fragment contains', () => {
    cy.get('.fragment-box').contains('Fragment 112').click();

    // This fragment does not contain a Commentary for example; Assert.
    cy.get('mat-panel-title').contains('Fragment Commentary').should('not.exist');
  });

  context('Header', () => {
    it('Should contain a header with information about the selected fragment', () => {
      // Select a fragment
      cy.get('.fragment-box').eq(3).as('frag').click();

      // Get the information about this fragment
      cy.get('@frag')
        .find('sup')
        .then(($sup) => {
          const infotext = $sup.text();

          // Assert that the commentary header contains this info.
          cy.get('app-commentary').find('h5').contains('Selected').as('commentary_header').contains(infotext);

          // Assert that it has links to the introduction texts
          cy.get('@commentary_header')
            .get('a')
            .each(($a) => {
              cy.wrap($a).click();
              // Assert that the introduction text has been opened.
              cy.get('app-custom-dialog')
                .should('exist')
                // Close the introduction text
                .type('{esc}'); //Clicks top left of the screen
            });
        });
    });
  });

  context('Fragment Translation', () => {
    it('Should have the expected behaviour on fragment switch and fragment translation toggle', () => {
      // Start by selecting a fragment
      cy.get('.fragment-box').contains('Fragment 112').click();

      // Expand the fragment translation panel
      cy.get('mat-expansion-panel').contains('Fragment Translation').click();
      cy.get('mat-expansion-panel').closest('div').should('be.visible');

      // Switch fragment
      cy.get('.fragment-box').contains('Fragment 132').click();

      // Assert that the fragment translation panel is still expanded
      cy.get('mat-expansion-panel').contains('Fragment Translation').closest('div').should('be.visible');

      // Toggle translation
      cy.get('button')
        .contains(/Show translation/i)
        .click();

      // Expand the original text panel
      cy.get('mat-expansion-panel').contains('Original Text').click();
      cy.get('mat-expansion-panel').closest('div').should('be.visible');

      // Switch fragment
      cy.get('.fragment-box').contains('Fragment 133').click();

      // Assert that the original text panel is still expanded
      cy.get('mat-expansion-panel').contains('Original Text');
      cy.get('mat-expansion-panel').closest('div').should('be.visible');
    });
  });

  context('Other elements', () => {
    beforeEach(() => {
      cy.get('.fragment-box').contains('Fragment 132').click();
    });

    context('Apparatus Criticus', () => {
      it('Should exist', () => {
        cy.get('mat-expansion-panel').contains('Apparatus Criticus');
      });
      it('Should have expandable content', () => {
        cy.get('button').contains('Show more');
      });
    });

    context('Editorial Differences', () => {
      it('Should exist and not have expandable content', () => {
        cy.get('mat-expansion-panel')
          .contains('Editorial Differences')
          .closest('mat-expansion-panel')
          .find('button')
          .should('not.exist');
      });
    });

    context('Citation Context', () => {
      it('Should exist', () => {
        cy.get('mat-expansion-panel').contains('Citation Context');
      });
    });

    context('Fragment Commentary', () => {
      it('exist', () => {
        cy.get('mat-expansion-panel').contains('Fragment Commentary');
      });
      it('Should have expandable content', () => {
        cy.get('button').contains('Show more');
      });
      it('Should contain an in-text summary object', () => {
        cy.get('div.summary').should('exist');
      });
    });

    context('Fragment Reconstruction', () => {
      it('Should exist', () => {
        cy.get('mat-expansion-panel').contains('Fragment Reconstruction');
      });
      it('Should have expandable content', () => {
        cy.get('button').contains('Show more');
      });
    });
  });
});
