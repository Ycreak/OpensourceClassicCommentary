describe('OSCC commentary tests', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });
  
  //it('', () => {})
  it('can show context', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(4) > .cdk-drag > :nth-child(1) > app-fragment').click();
    cy.get('#mat-expansion-panel-header-4 > .mat-content > .mat-expansion-panel-header-title > b').click();
    cy.get('.mat-expansion-panel-body.ng-tns-c1859850774-24 > .mat-expansion-panel-content > .mat-expansion-panel-body').click();
    /* ==== End Cypress Studio ==== */
    cy.contains('The fragment is quoted').should('be.visible');
  })

  it('can show translation', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(4) > .cdk-drag > :nth-child(1) > app-fragment').click();
    cy.get('#mat-expansion-panel-header-0 > .mat-content > .mat-expansion-panel-header-title').click();
    /* ==== End Cypress Studio ==== */
    cy.contains('Let him be').should('be.visible');
  })

  it('can show no linked commentary', () => {
    cy.open_new_frag_column('Ennius', 'Thyestes', 'Warmington');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#\\33  > :nth-child(1) > .cdk-drag > :nth-child(1) > app-fragment > :nth-child(2) > .ng-star-inserted').click();
    cy.get('.commentary-extra-feature-button > .mdc-button__label').click();
    cy.get('[style="padding-top: 1em;"]').click();
    /* ==== End Cypress Studio ==== */
    cy.contains('No linked commentary found.').should('be.visible');
  })

  it('can show linked commentary', () => {
    cy.open_new_frag_column('Ennius', 'Thyestes', 'Vahlen');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#\\33  > :nth-child(1) > .cdk-drag > :nth-child(1) > app-fragment > :nth-child(2) > .ng-star-inserted').click();
    cy.get('.commentary-extra-feature-button > .mdc-button__label').click();
    /* ==== End Cypress Studio ==== */
    cy.contains('Commentary from Ennius, Thyestes, TRF, 141').should('be.visible');
  })

})


