import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { CommentaryComponent } from './commentary.component';
import { CommentaryService } from './services/commentary.service';
import { Fragment } from '@oscc/types/Fragment';

describe('CommentaryComponent', () => {
  let component: CommentaryComponent;
  let fixture: ComponentFixture<CommentaryComponent>;
  let http: HttpTestingController;
  let commentary_service: CommentaryService;

  /** Builds the clicked fragment, which has a single linked fragment. */
  const create_main_fragment = (): Fragment => {
    const fragment = new Fragment();
    fragment.set({
      author: 'Ennius',
      title: 'Thyestes',
      editor: 'TRF',
      name: '132',
      linked_fragments: [{ author: 'Ennius', title: 'Thyestes', editor: 'TRF', name: '133' }],
    });
    return fragment;
  };

  /** Answers the request for the linked fragment TRF 133. */
  const flush_linked_fragment = (commentary_text: string): void => {
    const request = http.expectOne((req) => req.url.includes('document/get'));
    expect(request.request.body).toMatchObject({
      document_type: 'fragment',
      author: 'Ennius',
      title: 'Thyestes',
      editor: 'TRF',
      name: '133',
    });
    request.flush([
      {
        document_type: 'fragment',
        author: 'Ennius',
        title: 'Thyestes',
        editor: 'TRF',
        name: '133',
        status: 'Certum',
        lines: [],
        linked_fragments: [],
        commentary: commentary_text,
      },
    ]);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentaryComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    commentary_service = TestBed.inject(CommentaryService);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the commentary of a linked fragment once its api response arrives', async () => {
    commentary_service.request(create_main_fragment());
    await fixture.whenStable();

    fixture.nativeElement.querySelector('.commentary-extra-feature-button').click();
    await fixture.whenStable(); // The button disappears; the request is still pending
    flush_linked_fragment('Ennius 133 is quoted here.');

    // Only the response can have scheduled the render of the linked commentary now
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Commentary from Ennius, Thyestes, TRF, 133');
  });

  it('should show a banner when a linked fragment has no commentary', async () => {
    commentary_service.request(create_main_fragment());
    await fixture.whenStable();

    fixture.nativeElement.querySelector('.commentary-extra-feature-button').click();
    await fixture.whenStable(); // The button disappears; the request is still pending
    flush_linked_fragment('');

    // Only the response can have scheduled the render of the banner now
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No linked commentary found.');
  });
});
