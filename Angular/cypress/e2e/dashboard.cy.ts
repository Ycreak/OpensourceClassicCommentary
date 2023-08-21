describe('Tests for the dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/dashboard');
  });
  context('Fragments', () => {
    it('Should be able to create a fragment', () => {
      // TODO
    });

    it('Should be able to edit a fragment', () => {
      // TODO
    });

    it('Should be able to delete a fragment', () => {
      // TODO
    });
  });

  context('Testimoniae', () => {
    // Not yet fully implemented
  });

  context('Introduction texts', () => {
    // Not yet fully implemented
  });

  context('Users', () => {
    // TODO: These tests are currently not working; can't get the automated login to work.

    // it('Should only display the users and panels that the current user has permission to view', () => {
    //   // Log in as a guest
    //   cy.log_in('A', 'aaaaa'); // Pun not intended
    //   // Go to dashboard
    //   cy.get('button').contains(/menu/i).click().get('button').contains('dashboard').click();
    //   // The student should not see the fragments, testimoniae and introductions panels
    //   cy.get('#fragments_panel').should('not.exist');
    //   cy.get('#introductions_panel').should('not.exist');
    //   cy.get('#users_panel').should('exist');
    //   // The student should only see their own account
    //   cy.get('#users_panel').find('tr').should('have.length', 1).contains('A');

    //   // Log in as a student and do similar assertions
    //   cy.log_in('Aragorn', 'aaaaa');
    //   cy.get('button').contains(/menu/i).click().get('button').contains('dashboard').click();
    //   cy.get('#fragments_panel').should('exist');
    //   cy.get('#introductions_panel').should('not.exist');
    //   cy.get('#users_panel').should('exist');
    //   cy.get('#users_panel').find('tr').should('have.length', 1).contains('Aragorn');

    //   // Log in as as teacher and do similar assertions
    //   cy.log_in('Arathorn', 'aaaaa');
    //   cy.get('button').contains(/menu/i).click().get('button').contains('dashboard').click();
    //   cy.get('#fragments_panel').should('exist');
    //   cy.get('#introductions_panel').should('exist');
    //   cy.get('#users_panel').should('exist');
    //   cy.get('#users_panel').find('tr').should('have.length.gt', 1).contains('Aragorn');

    //   // TODO: Permissions tests could perhaps be expanded upon
    // });

    it('Should be able to filter users', () => {
      cy.get('#users_panel').find('input').first().type('gornn');
      cy.get('#users_panel').find('tr').contains('Aragorn').should('not.exist');
      cy.get('#users_panel').find('input').first().type('{backspace}');
      cy.get('#users_panel').find('tr').contains('Aragorn').should('exist');
    });

    it("Should be able to change a user's role", () => {
      // TODO: This one is VERY broken: Cypress gives errors at different points depending or not it handles the server requests properly. It is utterly inconsistent at this.
      // cy.get('#users_panel').find('input').first().type('gimli{enter}'); // Tests for case insensitivity
      // cy.get('#users_panel').find('tr').contains('Gimli').click();
      // cy.get('mat-form-field')
      //   .contains(/user role/i)
      //   .click()
      //   .get('mat-option')
      //   .contains(/student/i)
      //   .click();
      // cy.get('button')
      //   .contains(/change role/i)
      //   .click()
      //   .get('button')
      //   .contains(/yes/i)
      //   .click();
      // cy.get('#users_panel').find('input').first().type('{selectAll}{del}gimli{enter}');
      // cy.get('#users_panel')
      //   .find('tr')
      //   .contains('Gimli')
      //   .closest('tr')
      //   .contains(/student/i)
      //   .click();
      // cy.get('mat-form-field')
      //   .contains(/user role/i)
      //   .click()
      //   .get('mat-option')
      //   .contains(/guest/i)
      //   .click();
      // cy.get('button')
      //   .contains(/change role/i)
      //   .click()
      //   .get('button')
      //   .contains(/yes/i)
      //   .click();
      // cy.get('#users_panel').find('input').first().type('{selectAll}{del}gimli{enter}');
      // cy.get('#users_panel').find('tr').contains('Gimli').contains(/guest/i).click();
    });

    it('Should be able to create and delete a user', () => {
      // TODO: Also shelved until the other features work properly.
      // cy.get('#users_panel').find('input').contains(/new/i).type('zzzzz');
      // cy.get('#users_panel').find('input').contains(/password/i).type('aaaaa');
      // cy.get('button')
      //   .contains(/create new user/i)
      //   .click();
      // cy.get('#users_panel').find('tr').contains('zzzzz').should('exist').click();
      // cy.get('button')
      //   .contains(/delete user/i)
      //   .click();
      // cy.get('button').contains(/yes/i).click();
      // cy.get('#users_panel').find('tr').contains('zzzzz').should('not.exist');
    });
  });
});
