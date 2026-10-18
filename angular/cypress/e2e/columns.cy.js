describe('OSCC columns tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  //it('', () => {})

  it('can load fragments', () => {
    cy.contains('ipse summis').should('be.visible');
  });

  it('can load a different edition', () => {
    cy.open_new_frag_column('Accius', 'Aegisthus', 'Dangel');
    cy.contains('cuiatis stirpem').should('be.visible');
  });

  it('can delete and create columns', () => {
    // Close the first column via the clear button in its toolbar. The helper then
    // adds a fresh column itself.
    cy.get('.col > .mat-toolbar > :nth-child(4)').click();

    cy.open_new_frag_column('Ennius', 'Eumenides', 'TRF');
    cy.contains('nisi patrem').should('be.visible');
  });
});
