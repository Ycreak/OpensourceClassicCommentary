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
Cypress.Commands.add('open_new_frag_column', (author: string, title: string, editor: string) => {
  // Opens a new fragment column
  cy.get('button')
    .contains(/Add column/i)
    .click();
  cy.get('button:contains("Select text")').last().click();
  cy.get('button').contains(author).click();
  cy.get('button').contains(title).click();
  cy.get('button').contains(editor).click();
});

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    open_new_frag_column(author: string, title: string, editor: string): Chainable;
  }
}
