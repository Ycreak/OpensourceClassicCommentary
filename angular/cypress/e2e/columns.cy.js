describe('OSCC columns tests', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });
  
  //it('', () => {})

  it('can load fragments', () => {
    cy.contains('ipse summis').should('be.visible');
  })

  it('can load a different edition', () => {
    cy.open_new_frag_column('Accius', 'Aegisthus', 'Dangel');
    cy.contains('cuiatis stirpem').should('be.visible');
  });

  it('can delete and create columns', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.col > .mat-toolbar > :nth-child(4) > .mat-mdc-button-touch-target').click();
    cy.get('#fragments-toolbar-2 > .navbar > .mdc-button__label').click();
    /* ==== End Cypress Studio ==== */
    cy.open_new_frag_column('Ennius', 'Eumenides', 'TRF');
    cy.contains('nisi patrem').should('be.visible');
  })
})

