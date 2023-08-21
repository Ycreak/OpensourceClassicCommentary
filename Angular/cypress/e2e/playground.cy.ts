describe('Test for the playground', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });
  it('Should scroll to the playground when it is activated', () => {
    // TODO: Doesn't seem testable by Cypress
    // cy.get('app-playground').then(($body) => {
    //     if ($body.find('app-playground')) {
    //     cy.get('mat-toolbar')
    //         .find('button')
    //         .contains(/playground/i)
    //         .should('exist')
    //         .click();
    //     }
    //     cy.get('mat-toolbar')
    //         .find('button')
    //         .contains(/playground/i)
    //         .should('exist')
    //         .click();
    //     // Check if the page has scrolled
    //     cy.wait(2000).window().its('scrollY').should('be.gt', 0);
    // });
  });

  context('Fragments', () => {
    it('Should be able to add a single fragment', () => {
      // Add the fragment
      cy.get('app-playground')
        .find('button')
        .contains(/Select Text/i)
        .click();
      cy.get('button').contains('Accius').click();
      cy.get('button').contains('Aegisthus').click();
      cy.get('button').contains('Dangel').click().wait(1000);
      cy.get('button')
        .contains(/Add single fragment/i)
        .click();
      cy.get('.cdk-focused').contains('2').click().wait(1000);

      // Check if only one fragment has appeared
      cy.get('.playground')
        .should('have.length', 1)
        // Check if the right fragment has appeared
        .contains('melius quam viri');
    });

    it('Should be able to add all fragments of a given title', () => {
      // Add the fragments
      cy.get('app-playground')
        .find('button')
        .contains(/Select Text/i)
        .click();
      cy.get('button').contains('Accius').click();
      cy.get('button').contains('Aegisthus').click();
      cy.get('button').contains('Dangel').click().wait(2000);
      cy.get('button')
        .contains(/Add all fragments from selected edition/i)
        .click();

      // Check if only one fragment has appeared
      cy.get('.playground').should('have.length.gt', 1);
      // Check if the right fragments have appeared by searching for a few
      cy.get('.playground').contains('melius quam viri');
      cy.get('.playground').contains('heu!');
      cy.get('.playground').contains('celebri gradu');
    });

    it('Should be able to delete a single fragment', () => {
      // TODO: Doesn't work while the playground elements are stacked on top of each other. Cypress can't unstack them using dragging right now
      // // Add some fragments
      // cy.get('app-playground').find('button').contains(/Select Text/i).click()
      // cy.get('button').contains('Accius').click()
      // cy.get('button').contains('Aegisthus').click()
      // cy.get('button').contains('Dangel').click()
      // cy.get('button').contains(/Add all fragments from selected edition/i).click()
      // // Delete the fragment
      // cy.get('div.playground').contains('melius quam viri').click()
      // cy.get('button').contains(/Delete fragment/i).click()
      // cy.get('.playground').contains('melius quam viri').should('not.exist')
      // cy.get('.playground').contains('heu!').should('exist')
    });
  });

  context('Notes', () => {
    it('Should be able to add a note', () => {
      // Strange input handling
      cy.get('app-playground').find('mat-form-field').type('This is a test note: !@#$~\\/"";©{enter}');
      cy.get('.note').contains('This is a test note: !@#$~\\/"";©');
    });

    it('Should be able to delete selected notes', () => {
      // Make some notes first
      cy.get('app-playground').find('mat-form-field').type('Test note 1{enter}').type('{backspace}2{enter}');

      // Selectively delete the notes
      cy.get('.note').contains('Test note 2').click();
      cy.get('button')
        .contains(/Delete note/i)
        .click();
      cy.get('.note').contains('Test note 2').should('not.exist');

      cy.get('.note').contains('Test note 1').click();
      cy.get('button')
        .contains(/Delete note/i)
        .click();
      cy.get('.note').should('not.exist');
    });
  });

  context('Fragments and notes', () => {
    // TODO: Currently not working due to overlapping elements (see above)
    // it('Should be able to selectively delete fragments and notes', () => {
    //     // Add some fragments
    //     cy.get('app-playground').find('button').contains(/Select Text/i).click()
    //     cy.get('button').contains('Accius').click()
    //     cy.get('button').contains('Aegisthus').click()
    //     cy.get('button').contains('Dangel').click()
    //     cy.get('button').contains(/Add all fragments from selected edition/i).click()

    //     // Add some notes
    //     cy.get('app-playground').find('mat-form-field').type('Test note 1{enter}')
    //     .type('{backspace}2{enter}')

    //     // Delete them in order
    //     cy.get('.note').contains('Test note 2').click()
    //     cy.get('button').contains(/Delete note/i).click()
    //     cy.get('.note').contains('Test note 2').should('not.exist')

    //     cy.get('.playground').contains('melius quam viri').click()
    //     cy.get('button').contains(/Delete fragment/i).click()
    //     cy.get('.playground').contains('melius quam viri').should('not.exist')

    //     cy.get('.note').contains('Test note 1').click()
    //     cy.get('button').contains(/Delete note/i).click()
    //     cy.get('.note').should('not.exist')

    //     cy.get('.playground').contains('heu!').click()
    //     cy.get('button').contains(/Delete fragment/i).click()
    //     cy.get('.playground').should('not.exist')
    // });

    it.only('Should be able to completely clear the playground', () => {
      // Add some fragments
      cy.get('app-playground')
        .find('button')
        .contains(/Select Text/i)
        .click();
      cy.get('button').contains('Accius').click();
      cy.get('button').contains('Aegisthus').click();
      cy.get('button').contains('Dangel').click();
      cy.get('button')
        .contains(/Add all fragments from selected edition/i)
        .click();

      // Add some notes
      cy.get('app-playground').find('mat-form-field').type('Test note 1{enter}').type('{backspace}2{enter}');

      // Clear the playground
      cy.get('button')
        .contains(/Clear playground/i)
        .click()
        .get('button')
        .contains(/yes/i)
        .click();
      cy.get('.playground').should('not.exist');
      cy.get('.note').should('not.exist');
    });
  });

  context('Drag and drop', () => {
    // Not yet implemented
  });
});
