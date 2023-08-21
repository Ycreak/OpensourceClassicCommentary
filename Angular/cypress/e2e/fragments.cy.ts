describe('Fragments section e2e test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  context('Fragment highlighting', () => {
    it('Should highlight the selected fragments', () => {
      return;
    });
    it('Should highlight the linked fragments', () => {
      cy.open_new_frag_column('Accius', 'Aegisthus', 'Dangel');
    });
  });

  context('Fragment dragging', () => {
    // Annoyingly enough I can't get dragging to work using Cypress
    it('Should be able to change the order of fragments', () => {
      return;
    });

    it('Should be able to drag a fragment to another column', () => {
      return;
    });
  });

  context('Fragment column dragging', () => {
    //WIP
  });

  context('Text selection', () => {
    it('Should be able to select a fragment source', () => {
      cy.open_new_frag_column('Accius', 'Aegisthus', 'Dangel').then(() => {
        cy.get('p').contains('1: cui manus materno sordet sparso sanguine').should('exist');
      });
    });
  });

  context('Fragment translation', () => {
    it('Should be able to toggle fragment translations', () => {
      // Open a second column
      cy.open_new_frag_column('Pacuvius', 'Dulorestes', 'Schierl');

      // Translate the first column
      cy.get('.frag-show-translation-button')
        .first()
        .click()
        .then(() => {
          cy.get('.fragment-column-toolbar')
            .first()
            .parent()
            .get('.fragment-box:contains("Fragment 112")')
            .first()
            .as('col1-frag1');
          cy.get('.fragment-column-toolbar')
            .last()
            .parent()
            .get('.fragment-box:contains("Fragment 87")')
            .first()
            .as('col2-frag1');

          cy.get('@col1-frag1').contains('Sing to me of the man and the arms, who came from Trojan coasts');
          cy.get('@col2-frag1').contains('Delphos venum pecus egi, unde ad stabula haec itiner contuli');
        });

      // Translate the second column
      cy.get('.frag-show-translation-button')
        .last()
        .click()
        .then(() => {
          cy.get('@col1-frag1').contains('Sing to me of the man and the arms, who came from Trojan coasts');
          cy.get('@col2-frag1').contains(
            'I have driven my herd for sale to Delphi, from where I have made my way to this accommodation',
          );
        });

      // Revert to original text for column one
      cy.get('.frag-show-translation-button')
        .first()
        .click()
        .then(() => {
          cy.get('@col1-frag1').contains('Arma virumque cano');
          cy.get('@col2-frag1').contains(
            'I have driven my herd for sale to Delphi, from where I have made my way to this accommodation',
          );
        });

      // Revert to original text for the second column
      cy.get('.frag-show-translation-button')
        .last()
        .click()
        .then(() => {
          cy.get('@col1-frag1').contains('Arma virumque cano');
          cy.get('@col2-frag1').contains('Delphos venum pecus egi, unde ad stabula haec itiner contuli');
        });
    });
  });

  context('Fragment filtering', () => {
    beforeEach(() => {
      // Start with a fresh column
      cy.get('.frag-col-close-button').each(($el) => {
        cy.wrap($el).click();
      });
      cy.get('button:contains("Add column")').click();
      cy.get('.frag-filter-button').click();
    });
    it('Should be able to filter fragments on Author', () => {
      cy.get('[formcontrolname="author"]').closest('input').type('Ennius{enter}');
      cy.get('.fragment-box').each(($el) => {
        cy.wrap($el).contains(/Ennius/i);
      });
    });
    it('Should be able to filter fragments on Title', () => {
      cy.get('[formcontrolname="title"]').click().type('Thyestes{enter}');
      cy.get('.fragment-box').each(($el) => {
        cy.wrap($el).contains(/Thyestes/i);
      });
    });
    it('Should be able to filter fragments on Editor', () => {
      cy.get('[formcontrolname="editor"]').click().type('TRF{enter}');
      cy.get('.fragment-box').each(($el) => {
        cy.wrap($el).contains(/TRF/i);
      });
    });
    it('Should be able to filter fragments on Status', () => {
      // TODO: Not yet implemented
      // cy.get('[formcontrolname="status"]').click().type('Certum{enter}');
      // cy.get('.fragment-box').each(($el) => {
      //   cy.wrap($el).contains(/Certum/i);
      // });
    });

    // TODO: The filters should be able to handle different document types in the future
  });

  context('Fragment column deletion', () => {
    it('Should be able to close fragment columns', () => {
      // First open an extra column
      cy.open_new_frag_column('Accius', 'Aegisthus', 'Dangel').then(() => {
        // Attempt to close both columns
        cy.get('.frag-col-close-button').last().click();
        cy.get('.frag-col-close-button').last().click();

        // Check if fragment columns remain
        cy.get('button').contains('Select text').should('not.exist');
      });
    });
  });
});
