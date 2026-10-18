/**
 * Regression tests for the retrieval of linked fragments.
 *
 * A linked fragment used to be sent to the server as a whole query filter. Older
 * records also carry a 'linked_fragment_id' on every link, and because no fragment
 * has that field at the top level the query silently matched nothing: the 'Linked
 * documents' column stayed empty for every fragment that carried the legacy field,
 * while its neighbours looked fine.
 *
 * Ennius, Thyestes, TRF is used throughout because fragment 133 carries the legacy
 * field and its neighbours 132 and 134 do not.
 */

const FLASK_URL = 'http://localhost:5003';
const TRF = 'Ennius, Thyestes, TRF';

/** Fetches one fragment straight from the api. */
const get_fragment = (editor, name) =>
  cy.request('POST', `${FLASK_URL}/document/get`, {
    document_type: 'fragment',
    author: 'Ennius',
    title: 'Thyestes',
    editor: editor,
    name: name,
    sandbox: 'admin',
    visible: 1,
  });

describe('OSCC linked fragments', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  it('shows the linked documents of a fragment whose links carry a legacy id', () => {
    // TRF 133 is the fragment that used to open an empty column.
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.choose_fragment_action(TRF, '133', 'Linked documents');

    cy.expect_last_column_fragments([
      'Ennius, Thyestes, Vahlen 7',
      'Ennius, Thyestes, Jocelyn 151',
      'Ennius, Thyestes, Warmington 355',
      'Ennius, Thyestes, Ribbeck 4',
    ]);
  });

  it('shows the linked documents of the fragment before it', () => {
    // TRF 132 never carried the legacy field, so it guards the path that always worked.
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.choose_fragment_action(TRF, '132', 'Linked documents');

    cy.expect_last_column_fragments([
      'Ennius, Thyestes, Warmington 366-370',
      'Ennius, Thyestes, Vahlen 14',
      'Ennius, Thyestes, Ribbeck 11',
      'Ennius, Thyestes, Jocelyn 150',
    ]);
  });

  it('shows the linked documents of the fragment after it', () => {
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.choose_fragment_action(TRF, '134', 'Linked documents');

    cy.expect_last_column_fragments([
      'Ennius, Thyestes, Vahlen 5',
      'Ennius, Thyestes, Jocelyn 153',
      'Ennius, Thyestes, Ribbeck 7',
      'Ennius, Thyestes, Warmington 351',
    ]);
  });

  it('reports when a fragment has no linked documents', () => {
    // Warmington 349 exists but has an empty linked_fragments array.
    cy.open_new_frag_column('Ennius', 'Thyestes', 'Warmington');
    cy.wait_for_fragment('Ennius, Thyestes, Warmington', '349');

    cy.get('.overflow_column').then(($before) => {
      const count = $before.length;
      cy.choose_fragment_action('Ennius, Thyestes, Warmington', '349', 'Linked documents');
      cy.contains('No linked documents found').should('be.visible');
      // No column may be created for a fragment without links.
      cy.get('.overflow_column').should('have.length', count);
    });
  });

  it('renders the commentary status of linked fragments without failing', () => {
    // Before the fix these lookups resolved to nothing, which made the component
    // dereference an undefined document and throw. The panel also stayed stale:
    // since the app runs without zone.js, the api responses have to signal their
    // updates themselves, which the component did not do. None of TRF 133's links
    // carries commentary, so its banner must appear on its own.
    const errors = [];
    cy.visit('http://localhost:4200', {
      onBeforeLoad(win) {
        const original = win.console.error;
        win.console.error = (...args) => {
          errors.push(args.map((arg) => String(arg?.message ?? arg)).join(' '));
          original.apply(win.console, args);
        };
      },
    });
    cy.open_new_frag_column('Ennius', 'Thyestes', 'TRF');
    cy.select_fragment(TRF, '133');
    cy.contains('button', 'Retrieve commentary from linked fragments').click();

    // The banner is only set after the last of the four lookups has come back,
    // so it guards that the api responses repaint the panel.
    cy.contains('No linked commentary found.').should('be.visible');

    cy.wait(1000).then(() => {
      // NG0100 is a development mode artefact of the zoneless setup and unrelated.
      const relevant = errors.filter((error) => !error.includes('NG0100'));
      expect(relevant, 'the linked commentary lookups must not raise an error').to.deep.equal([]);
    });
  });
});

describe('OSCC linked fragment api', () => {
  it('resolves a stored link when it is sent as the query filter', () => {
    // A stored link carries the reference meta data of the linked fragment. Older
    // records only carry the author, title, editor and name (no document_type or
    // sandbox), and some carry a legacy 'linked_fragment_id'. The lookup keys must
    // resolve the linked fragment whatever the record happens to carry, as long as
    // the client adds the document_type it is looking for.
    ['132', '133', '134'].forEach((name) => {
      get_fragment('TRF', name)
        .its('body')
        .then((body) => {
          expect(body, `fragment TRF ${name} should exist`).to.have.length(1);
          body[0].linked_fragments.forEach((link) => {
            cy.request('POST', `${FLASK_URL}/document/get`, { document_type: 'fragment', ...link, visible: 1 })
              .its('body')
              .should('have.length', 1, `link ${link.editor} ${link.name} of TRF ${name} should resolve`);
          });
        });
    });
  });

  it('ignores a legacy linked_fragment_id in the query filter', () => {
    const filter = {
      document_type: 'fragment',
      author: 'Ennius',
      title: 'Thyestes',
      editor: 'Vahlen',
      name: '7',
      sandbox: 'admin',
      visible: 1,
    };

    // The filter without the legacy field is the baseline.
    cy.request('POST', `${FLASK_URL}/document/get`, filter).its('body').should('have.length', 1);

    // The same lookup must keep working when a client still sends the field.
    cy.request('POST', `${FLASK_URL}/document/get`, {
      ...filter,
      linked_fragment_id: '53b4103cea6d4108946666fc520a13e8',
    })
      .its('body')
      .should('have.length', 1)
      .its('0.name')
      .should('equal', '7');
  });

  it('ignores an unknown field in the query filter', () => {
    cy.request('POST', `${FLASK_URL}/document/get`, {
      document_type: 'fragment',
      author: 'Ennius',
      title: 'Thyestes',
      editor: 'TRF',
      name: '133',
      sandbox: 'admin',
      this_field_does_not_exist: 'anything',
    })
      .its('body')
      .should('have.length', 1)
      .its('0.name')
      .should('equal', '133');
  });

  it('still filters on every supported fragment field', () => {
    const check = (filter, expected) =>
      cy.request('POST', `${FLASK_URL}/document/get`, filter).its('body').should('have.length', expected);

    check({ document_type: 'fragment', author: 'Ennius', title: 'Thyestes', editor: 'TRF' }, 18);
    check({ document_type: 'fragment', author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '133' }, 1);
    check({ document_type: 'fragment', author: 'Ennius', title: 'Thyestes', editor: 'TRF', visible: 0 }, 0);
    check({ document_type: 'fragment', author: 'Ennius', title: 'Thyestes', editor: 'Vahlen', status: 'Certum' }, 14);
    // Lucretius, De Rerum Natura, Lucus lives in the 'John' sandbox.
    // The sandbox is only part of the selector when it is supplied.
    check({ document_type: 'fragment', author: 'Lucretius', title: 'De Rerum Natura', editor: 'Lucus' }, 1);
    check(
      { document_type: 'fragment', author: 'Lucretius', title: 'De Rerum Natura', editor: 'Lucus', sandbox: 'John' },
      1
    );
    check(
      { document_type: 'fragment', author: 'Lucretius', title: 'De Rerum Natura', editor: 'Lucus', sandbox: 'admin' },
      0
    );
  });

  it('returns the links of a fragment alongside the fragment itself', () => {
    // The dashboard and the context menu both rely on this to offer links at all.
    get_fragment('TRF', '133').its('body').should('have.length', 1).its('0.linked_fragments').should('have.length', 4);

    get_fragment('Warmington', '349').its('body.0.linked_fragments').should('be.empty');
  });
});
