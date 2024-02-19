describe('OSCC dashboard tests', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200/dashboard');
  });
  
  //it('', () => {})

  it('can create a fragment', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('mat-label.ng-tns-c1798928316-3').click();
    cy.get('#mat-input-0').click();
    cy.get('#mat-input-0').clear('1');
    cy.get('#mat-input-0').type('1');
    cy.get('mat-label.ng-tns-c1798928316-4').click();
    cy.get('#mat-input-1').clear('L');
    cy.get('#mat-input-1').type('Lucus');
    cy.get('#mat-input-2').clear();
    cy.get('#mat-input-2').type('Testus');
    cy.get('#mat-input-3').clear();
    cy.get('#mat-input-3').type('Sebus');
    cy.get('.mat-mdc-select-placeholder').click();
    cy.get('#mat-option-0').click();
    cy.get('#mat-tab-label-0-1 > .mdc-tab__content').click();
    cy.get('.ng-dirty > .mdc-button > .mdc-button__label').click();
    cy.get('.input-form-small > .mat-mdc-text-field-wrapper > .mat-mdc-form-field-flex > .mat-mdc-form-field-infix').click();
    cy.get('#mat-input-29').clear();
    cy.get('#mat-input-29').type('1');
    cy.get('#mat-mdc-form-field-label-78 > .ng-tns-c1798928316-76').click();
    cy.get('#mat-input-30').clear('T');
    cy.get('#mat-input-30').type('This is a test');
    cy.get('#mat-tab-label-0-2 > .mdc-tab__content > .mdc-tab__text-label').click();
    cy.get('#FT').click();
    cy.get('#FT').clear('Hello there!');
    cy.get('#FT').type('Hello there!');
    cy.get('.ng-tns-c1859850774-1 > :nth-child(2) > .mdc-button__label').click();
    cy.get('[ng-reflect-dialog-result="true"] > .mdc-button__label').click();
    /* ==== End Cypress Studio ==== */
    cy.get('button').contains('FRAGMENTS').click()
    cy.open_new_frag_column('Lucus', 'Testus', 'Sebus');
    cy.contains('This is a test').should('be.visible');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#\\33  > :nth-child(1) > .cdk-drag > :nth-child(1) > app-fragment > :nth-child(2) > .ng-star-inserted').click();
    cy.get('.mat-expansion-panel-header-title > b').click();
    /* ==== End Cypress Studio ==== */
    cy.contains('Hello there!').should('be.visible');
  })
  
  it('can revise a fragment', () => {
    cy.get('button:contains("Select fragment")').last().click();
    cy.get('button').contains('Lucus').click();
    cy.get('button').contains('Testus').click();
    cy.get('button').contains('Sebus').click();
    cy.get('button').contains('1').click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#mat-tab-label-0-1').click();
    cy.get('#mat-input-30').clear('This is a test, ');
    cy.get('#mat-input-30').type('This is a test, which is revised!');
    cy.get('.ng-tns-c1859850774-1 > :nth-child(3) > .mdc-button__label').click();
    cy.get('[ng-reflect-dialog-result="true"] > .mdc-button__label').click();
    cy.get('[routerlink="/"] > .mdc-button__label').click();
    /* ==== End Cypress Studio ==== */
    cy.open_new_frag_column('Lucus', 'Testus', 'Sebus');
    cy.contains('This is a test, which is revised!').should('be.visible');
  })
  
  it('can delete a fragment', () => {
    cy.intercept('POST', 'http://localhost:5003/fragment/delete').as('deleteFragment');

    cy.get('button:contains("Select fragment")').last().click();
    cy.get('button').contains('Lucus').click();
    cy.get('button').contains('Testus').click();
    cy.get('button').contains('Sebus').click();
    cy.get('button').contains('1').click();

    /* ==== Generated with Cypress Studio ==== */
    cy.get('.ng-tns-c1859850774-1 > .mat-warn > .mdc-button__label').click();
    cy.get('[ng-reflect-dialog-result="true"] > .mdc-button__label').click();
    /* ==== End Cypress Studio ==== */

    cy.wait('@deleteFragment').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
  })
})

