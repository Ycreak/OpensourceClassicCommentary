import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { ColumnsComponent } from './columns.component';
import { ColumnsService } from './services/columns.service';

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('ColumnsComponent with query parameters', () => {
  let columns: ColumnsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                author: 'Ennius',
                title: 'Thyestes',
                editor: 'TRF',
                name: '1',
              }),
            },
          },
        },
      ],
    }).compileComponents();

    columns = TestBed.inject(ColumnsService);
    vi.spyOn(columns, 'request').mockImplementation(() => {});
    const fixture = TestBed.createComponent(ColumnsComponent);
    fixture.detectChanges();
  });

  it('should filter on the fragment name from the url and store it in the column', () => {
    expect(columns.request).toHaveBeenCalledWith(
      expect.objectContaining({
        author: 'Ennius',
        title: 'Thyestes',
        editor: 'TRF',
        name: '1',
      }),
      expect.any(Number)
    );
    expect(columns.list()[0].name).toBe('1');
  });
});
