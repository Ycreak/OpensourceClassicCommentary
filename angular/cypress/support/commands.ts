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

/**
 * Escapes a fragment name so it can be used inside a regular expression.
 * Fragment names are not always plain numbers ('5-6', '366-370', ...).
 */
const escape_for_regex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Matches the bold 'Fragment 123' header of a single fragment. */
const fragment_header_regex = (fragment_name: string): RegExp =>
  new RegExp(`^Fragment\\s+${escape_for_regex(fragment_name)}$`);

/**
 * Waits until a column of the given reference ('Author, Title, Editor') holds the
 * fragment, so a following interaction cannot race the fragment loading.
 */
Cypress.Commands.add('wait_for_fragment', (reference: string, fragment_name: string) => {
  return cy.contains('.overflow_column', reference).within(() => {
    cy.contains('b', fragment_header_regex(fragment_name)).should('be.visible');
  });
});

/**
 * Clicks a fragment of a column to select it.
 */
Cypress.Commands.add('select_fragment', (reference: string, fragment_name: string) => {
  cy.contains('.overflow_column', reference).within(() => {
    cy.contains('b', fragment_header_regex(fragment_name)).closest('.fragment-box').click();
  });
});

/**
 * Right-clicks a fragment of a column and picks an entry from the fragment context
 * menu ('Copy text', 'Broader context', 'Linked documents').
 */
Cypress.Commands.add('choose_fragment_action', (reference: string, fragment_name: string, action: string) => {
  cy.contains('.overflow_column', reference).within(() => {
    cy.contains('b', fragment_header_regex(fragment_name)).closest('.fragment-box').rightclick();
  });
  cy.contains('.mat-mdc-menu-panel button', action).click();
});

/**
 * Reads the fragments of the rightmost column as 'Author, Title, Editor Name' labels,
 * which is how a fragment identifies itself in its header.
 *
 * The fragments are collected in a plain callback instead of with find(), so that an
 * empty column yields an empty list rather than a timeout on a missing element.
 */
Cypress.Commands.add('last_column_fragments', (): Cypress.Chainable<string[]> => {
  return cy.get('.overflow_column').last().then(($column) => {
    const labels: string[] = [];
    $column.find('.fragment-box').each((_index, fragment) => {
      const name = Cypress.$(fragment).find('b').first().text().trim().replace(/^Fragment\s+/, '');
      const reference = Cypress.$(fragment).find('sup').first().text().trim();
      labels.push(`${reference} ${name}`.trim());
    });
    return cy.wrap(labels, { log: false });
  });
});

/**
 * Asserts the contents of the rightmost column, retrying while the view catches up.
 *
 * A linked documents column is filled by one request per link, and the application
 * runs without zone.js (provideZonelessChangeDetection). Nothing schedules a change
 * detection pass once the last response has been pushed, so the rendered column can
 * lag behind the data. Re-selecting the source fragment is a harmless interaction
 * that makes the view reflect the latest state, which lets us assert on the data
 * instead of on when Angular happened to repaint.
 *
 * A column that is genuinely empty (the bug this guards against) never matches and
 * still fails.
 */
Cypress.Commands.add(
  'expect_last_column_fragments',
  (reference: string, fragment_name: string, expected: string[]) => {
    const sorted = (values: string[]) => [...values].sort();
    const attempt = (remaining: number) => {
      cy.select_fragment(reference, fragment_name);
      cy.last_column_fragments().then((labels) => {
        if (JSON.stringify(sorted(labels)) === JSON.stringify(sorted(expected))) {
          return;
        }
        if (remaining <= 0) {
          throw new Error(
            `Expected the linked column to contain ${JSON.stringify(sorted(expected))} ` +
              `but it contained ${JSON.stringify(sorted(labels))}`
          );
        }
        cy.wait(250).then(() => attempt(remaining - 1));
      });
    };
    attempt(20);
  }
);

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
    wait_for_fragment(reference: string, fragment_name: string): Chainable;
    select_fragment(reference: string, fragment_name: string): Chainable;
    choose_fragment_action(reference: string, fragment_name: string, action: string): Chainable;
    last_column_fragments(): Chainable<string[]>;
    expect_last_column_fragments(reference: string, fragment_name: string, expected: string[]): Chainable;
  }
}
