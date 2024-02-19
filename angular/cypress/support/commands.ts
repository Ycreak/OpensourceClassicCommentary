/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
Cypress.Commands.add('open_new_frag_column', (author: string, title: string, editor: string) => {
  //Opens a new fragment column
  cy.get('button')
    .contains(/Add column/i)
    .click();
  cy.get('button:contains("Select text")').last().click();
  cy.get('button').contains(author).click();
  cy.get('button').contains(title).click();
  cy.get('button').contains(editor).click();
});

Cypress.Commands.add('open_frag_dashboard', (author: string, title: string, editor: string, fragment_name: string) => {
  cy.get('button').contains('Select author').click().find('mat-option').contains(author).click();
  cy.get('button').contains('Select text').click().find('mat-option').contains(title).click();
  cy.get('button').contains('Select editor').click().find('mat-option').contains(editor).click();
  cy.get('button').contains('Select fragment').click().find('mat-option').contains(fragment_name).click();
});

Cypress.Commands.add('log_in', (username: string, password: string) => {
  cy.visit('http://localhost:4200');
  cy.get('button')
    .contains(/menu/i)
    .click()
    .get('button')
    .contains('Login')
    .click()
    .then(() => {
      cy.get('mat-form-field', { timeout: 10000 })
        .first()
        .closest('div')
        .click({ timeout: 2000 })
        .type(`${username}`)
        .next()
        .type(`${password}{enter}`, { force: true });

      cy.get('mat-dialog-container').then(($dialog) => {
        if ($dialog) {
          // Close the dialog
          cy.get('mat-icon').contains('clear').click();
        }
      });
    });
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    open_new_frag_column(author: string, title: string, editor: string): Chainable;
    open_frag_dashboard(author: string, title: string, editor: string, fragment_name: string): Chainable;
    log_in(username: string, password: string): Chainable;
  }
}
