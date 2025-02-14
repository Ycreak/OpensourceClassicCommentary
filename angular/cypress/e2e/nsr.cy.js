describe('OSCC columns tests', () => {

  beforeEach(() => {
    //cy.visit('https://linnaeus.dryrun.link/linnaeus_ng/admin/views/nsr/');
    cy.visit('https://www.nederlandsesoorten.nl/linnaeus_ng/admin/views/projects/overview.php');
  });
  
  it('can create taxon', () => {
    cy.on('uncaught:exception', (err, runnable) => {
      expect(err.message).to.include('Unexpected token')

      // using mocha's async done callback to finish
      // this test so we prove that an uncaught exception
      // was thrown
      //done()

      // return false to prevent the error from
      // failing this test
      return false
    })

    /* ==== Generated with Cypress Studio ==== */
    cy.get('#username').clear();
    cy.get('#username').type('sysadmin');
    cy.get(':nth-child(2) > :nth-child(2) > input').clear();
    //cy.get(':nth-child(2) > :nth-child(2) > input').type('3MKgG2S8n4}qPCj');
    cy.get(':nth-child(2) > :nth-child(2) > input').type('GLYXp75Ug8w7');
    cy.get(':nth-child(4) > td > input').click();
    /* ==== End Cypress Studio ==== */
    //cy.visit('https://linnaeus.dryrun.link/linnaeus_ng/admin/views/nsr/');
    /* ==== Generated with Cypress Studio ==== */
    //cy.get('#admin-menu-bottom > :nth-child(1) > [href="taxon_new.php"]').click();
    //cy.get(':nth-child(4) > a').click();
    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.modules > :nth-child(4) > a').click();
    cy.get('#admin-menu-bottom > :nth-child(1) > [href="taxon_new.php"]').click();
    cy.get('#concept_rank_id').select('20');
    cy.get(':nth-child(3) > td > .edit').click();
    cy.get('#__parent_taxon_id_INPUT').clear();
    cy.get('#__parent_taxon_id_INPUT').type('fran{enter}');
    cy.get('ul > :nth-child(1) > a').click();
    /* ==== End Cypress Studio ==== */
  })

  //it('can load fragments', () => {
    //cy.contains('ipse summis').should('be.visible');
  //})

  //it('can load a different edition', () => {
    //cy.open_new_frag_column('Accius', 'Aegisthus', 'Dangel');
    //cy.contains('cuiatis stirpem').should('be.visible');
  //});

  //it('can delete and create columns', () => {
    //[> ==== Generated with Cypress Studio ==== <]
    //cy.get('.col > .mat-toolbar > :nth-child(4) > .mat-mdc-button-touch-target').click();
    //cy.get('#fragments-toolbar-2 > .navbar > .mdc-button__label').click();
    //[> ==== End Cypress Studio ==== <]
    //cy.open_new_frag_column('Ennius', 'Eumenides', 'TRF');
    //cy.contains('nisi patrem').should('be.visible');
  //})
})

