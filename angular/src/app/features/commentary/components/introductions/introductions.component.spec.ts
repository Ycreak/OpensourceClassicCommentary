import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IntroductionsComponent } from './introductions.component';

describe('IntroductionsComponent', () => {
  let component: IntroductionsComponent;
  let fixture: ComponentFixture<IntroductionsComponent>;
  let http: HttpTestingController;

  /**
   * Creates the dialog with the given data. The component requests an introduction
   * from the api in ngOnInit, so each test answers that request itself.
   */
  const create_component = async (dialog_data: object): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [IntroductionsComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: dialog_data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IntroductionsComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  };

  afterEach(() => {
    http.verify();
  });

  it('should create', async () => {
    await create_component({});
    expect(component).toBeTruthy();
    http.expectOne((request) => request.url.includes('document/get')).flush([]);
  });

  it('should render a fetched author introduction', async () => {
    await create_component({ author: 'Ennius' });

    const request = http.expectOne((request) => request.url.includes('document/get'));
    expect(request.request.body).toMatchObject({
      document_type: 'introduction',
      author: 'Ennius',
      sandbox: 'admin',
    });
    request.flush([
      {
        _id: 'intro-1',
        document_type: 'introduction',
        author: 'Ennius',
        title: '',
        editor: '',
        text: '<p>Ennius was born in Rudiae.</p>',
        sandbox: 'admin',
      },
    ]);

    await fixture.whenStable();

    const header = fixture.nativeElement.querySelector('h2');
    expect(header.textContent).toContain('Introduction on Ennius');
    const body = fixture.nativeElement.querySelector('#introductions-text-body');
    expect(body.textContent).toContain('Ennius was born in Rudiae.');
  });

  it('should render a fetched title introduction', async () => {
    await create_component({ author: 'Ennius', title: 'Thyestes' });

    http
      .expectOne((request) => request.url.includes('document/get'))
      .flush([
        {
          _id: 'intro-2',
          document_type: 'introduction',
          author: 'Ennius',
          title: 'Thyestes',
          editor: '',
          text: '<p>The Thyestes was performed in 169 BC.</p>',
          sandbox: 'admin',
        },
      ]);

    await fixture.whenStable();

    const body = fixture.nativeElement.querySelector('#introductions-text-body');
    expect(body.textContent).toContain('The Thyestes was performed in 169 BC.');
  });

  it('should show a message when no introduction is found', async () => {
    await create_component({ author: 'Unknown author' });

    http.expectOne((request) => request.url.includes('document/get')).flush([]);

    await fixture.whenStable();

    const body = fixture.nativeElement.querySelector('#introductions-text-body');
    expect(body.textContent).toContain('No introduction found.');
  });
});
