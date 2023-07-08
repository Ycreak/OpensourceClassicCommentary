describe('OSCC application flow/overview component e2e test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  it('Should be able to toggle the commentary', () => {
    cy.get('app-commentary').then(($commentary) => {
      if ($commentary) {
        cy.get('mat-toolbar')
          .find('button')
          .contains(/commentary/i)
          .should('exist')
          .click();
        cy.get('app-commentary').should('not.be.visible');
      } else {
        cy.get('mat-toolbar')
          .find('button')
          .contains(/commentary/i)
          .should('exist')
          .click();
        cy.get('app-commentary').should('be.visible');
      }
    });
  });

  it('Should be able to toggle the playground', () => {
    cy.get('app-playground').then(($playground) => {
      if ($playground) {
        cy.get('mat-toolbar')
          .find('button')
          .contains(/playground/i)
          .should('exist')
          .click();
        cy.get('app-playground').should('not.exist');
      } else {
        cy.get('mat-toolbar')
          .find('button')
          .contains(/playground/i)
          .should('exist')
          .click();
        cy.get('app-playground').should('exist');
      }
    });
  });

  context('Should be able to traverse the menu', () => {
    it('Should be able to find the login menu', () => {
      cy.get('mat-toolbar')
        .find('button')
        .contains(/menu/i)
        .click()
        .then(() => {
          cy.get('button, a').contains(/login/i).click();
          cy.get('app-login').find('.dialog-header').contains(/login/i);
        });
    });
    it('Should be able to find the dashboard', () => {
      cy.get('mat-toolbar')
        .find('button')
        .contains(/menu/i)
        .click()
        .then(() => {
          cy.get('button, a')
            .contains(/dashboard/i)
            .click();
          cy.location('pathname').should('contain', '/dashboard');
        });
    });
    it('Should be able to find the settings menu', () => {
      cy.get('mat-toolbar')
        .find('button')
        .contains(/menu/i)
        .click()
        .then(() => {
          cy.get('button, a')
            .contains(/settings/i)
            .click();
          cy.get('app-settings-dialog')
            .find('.dialog-header')
            .contains(/settings/i);
        });
    });
    it('Should be able to find the documentation', () => {
      cy.get('mat-toolbar')
        .find('button')
        .contains(/menu/i)
        .click()
        .then(() => {
          cy.get('button, a')
            .contains(/documentation/i)
            .parent('a')
            .should('have.attr', 'href', 'https://github.com/Ycreak/OpensourceClassicCommentary/#readme');
        });
    });
    it('Should be able to find the info about OSCC', () => {
      cy.get('mat-toolbar')
        .find('button')
        .contains(/menu/i)
        .click()
        .then(() => {
          cy.get('button, a').contains(/about/i).click();
          cy.get('app-about-dialog').should('exist');
        });
    });
  });
});
