describe('OSCC commentary tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  //it('', () => {})
  it('can show context', () => {
    // The first citation context of TRF 132 quotes another fragment.
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.wait_for_fragment('Ennius, Thyestes, TRF', '132');
    cy.select_fragment('Ennius, Thyestes, TRF', '132');

    cy.contains('mat-expansion-panel-header', 'Citation Context').click();
    cy.contains('The fragment is quoted').should('be.visible');
  });

  it('can show translation', () => {
    // TRF 132 carries a fragment translation, shown in its own expansion panel.
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.wait_for_fragment('Ennius, Thyestes, TRF', '132');
    cy.select_fragment('Ennius, Thyestes, TRF', '132');

    cy.contains('mat-expansion-panel-header', 'Fragment translation').click();
    cy.contains('Let him be').should('be.visible');
  });

  it('can show no linked commentary', () => {
    // TRF 132 links to four fragments that carry no commentary: the banner is
    // only set once all of their responses have come back, so the panel must
    // repaint on its own for this test to pass.
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.wait_for_fragment('Ennius, Thyestes, TRF', '132');
    cy.select_fragment('Ennius, Thyestes, TRF', '132');
    cy.contains('button', 'Retrieve commentary from linked fragments').click();
    cy.contains('No linked commentary found.').should('be.visible');
  });

  it('can show linked commentary', () => {
    // The first Vahlen fragment links to TRF 141, which carries commentary. The
    // response must paint the linked commentary without any further interaction.
    cy.open_new_frag_column('Ennius', 'Thyestes', 'Vahlen');
    cy.wait_for_fragment('Ennius, Thyestes, Vahlen', '1');
    cy.select_fragment('Ennius, Thyestes, Vahlen', '1');
    cy.contains('button', 'Retrieve commentary from linked fragments').click();
    cy.contains('Commentary from Ennius, Thyestes, TRF, 141').should('be.visible');
  });
});
