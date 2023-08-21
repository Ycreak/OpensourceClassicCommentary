describe('Tests to see if all the settings from the settings menu work as intended', () => {
  before(() => {
    // Make sure to clear old settings from the browser's localStorage
    cy.clearLocalStorage();
  });
  beforeEach(() => {
    cy.visit('http://localhost:4200');
    cy.get('button').contains(/menu/i).click();
  });

  it('Should be able to disable fragment dragging', () => {
    // We have no way of testing dragging features unfortunately right now
  });

  it('Should be able to show the fragment order gradient', () => {
    cy.get('#mat-mdc-slide-toggle-2-button').click();
    cy.get('mat-icon').contains('clear').click(); // Close dialog

    // Color should be different than white
    cy.get('.fragment-box').contains('Fragment 56').should('not.have.css', 'color', 'white');
  });

  it('Should be able to hide the fragment headers', () => {
    cy.get('#mat-mdc-slide-toggle-3-button').click();
    cy.get('mat-icon').contains('clear').click(); // Close dialog

    cy.get('.fragment-box').contains('Fragment 56').should('not.exist');
  });

  it('Should be able to hide the fragment line names', () => {
    cy.get('#mat-mdc-slide-toggle-4-button').click();
    cy.get('mat-icon').contains('clear').click(); // Close dialog

    cy.get('.fragment-box').contains('1:').should('not.exist');
  });

  it('Should be able to auto scroll to linked fragments', () => {
    cy.get('#mat-mdc-slide-toggle-5-button').click();
    cy.get('mat-icon').contains('clear').click(); // Close dialog

    // Add a fragment column
    cy.open_new_frag_column('Ennius', 'Thyestes', 'Ribbeck');

    // Test feature
    cy.get('.fragment-box').contains('Fragment 157').click();
    cy.get('div.col').eq(1).invoke('scrollTop').should('be.gt', 0); // Test if the scrollbar has moved
  });

  it('Should be able to change the size of the commentary window', () => {
    cy.get('mat-slider').eq(0).find('input').invoke('attr', 'value', 80);
    cy.get('mat-icon').contains('clear').click(); // Close dialog

    // Test feature
    cy.get('mat-drawer[position="end"]').should('have.css', 'width', '80%');
  });
});
