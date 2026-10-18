import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { ColumnsService } from './columns.service';

/**
 * Minimal host rendering the documents of every column, so the tests can assert
 * that api responses are painted without an explicit change detection run.
 */
@Component({
  selector: 'app-columns-test-host',
  standalone: true,
  template: `@for (column of columns.list(); track column) {
    @for (document of column.documents; track document) {
      <span class="test-document">{{ document.name }}</span>
    }
  }`,
})
class ColumnsTestHostComponent {
  protected columns = inject(ColumnsService);
}

describe('ColumnsService', () => {
  let service: ColumnsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ColumnsTestHostComponent] });
    service = TestBed.inject(ColumnsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show the documents of a column once the api response arrives', async () => {
    const fixture: ComponentFixture<ColumnsTestHostComponent> = TestBed.createComponent(ColumnsTestHostComponent);
    fixture.detectChanges();

    const column_id = service.add();
    await fixture.whenStable(); // Render (and settle) the new column first
    service.request({ document_type: 'fragment' }, column_id);

    http
      .expectOne((request) => request.url.includes('document/get'))
      .flush([
        {
          document_type: 'fragment',
          author: 'Ennius',
          title: 'Thyestes',
          editor: 'TRF',
          name: '133',
          status: 'Certum',
          lines: [],
          linked_fragments: [],
          commentary: 'Some commentary',
        },
      ]);

    // Only the response can have scheduled the render of the documents now
    await fixture.whenStable();

    const rendered: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.test-document');
    expect(rendered.length).toBe(1);
    expect(rendered[0].textContent).toContain('133');
  });

  it('ignores a response for a column that was closed while it was loading', async () => {
    const fixture: ComponentFixture<ColumnsTestHostComponent> = TestBed.createComponent(ColumnsTestHostComponent);
    fixture.detectChanges();

    const column_id = service.add();
    service.request({ document_type: 'fragment' }, column_id);
    service.close(column_id);

    http
      .expectOne((request) => request.url.includes('document/get'))
      .flush([
        {
          document_type: 'fragment',
          author: 'Ennius',
          title: 'Thyestes',
          editor: 'TRF',
          name: '133',
          status: 'Certum',
          lines: [],
          linked_fragments: [],
          commentary: 'Some commentary',
        },
      ]);

    await fixture.whenStable();

    expect(service.list().length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.test-document').length).toBe(0);
  });
});
